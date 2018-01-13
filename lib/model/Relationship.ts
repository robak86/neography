import {RelationshipEntity} from "./RelationshipEntity";
import {NodeEntity} from "./NodeEntity";
import {Type} from "../utils/types";
import {ConnectedNode} from "./ConnectedNode";
import {OrderBuilderCallback, QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {cloned, getClassFromInstance, isPresent} from "../utils/core";
import {buildQuery} from "../cypher";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {Connection} from "../";
import {WhereStatement} from "../cypher/where/WhereStatement";
import {WhereBuilder, WhereStatementPart} from "../cypher/builders/WhereBuilder";
import * as _ from 'lodash';
import {OrderStatement} from "../cypher/order/OrderStatement";
import {OrderStatementPart} from "../cypher/order/OrderStatementPart";
import {OrderBuilder} from "../cypher/builders/OrderBuilder";
import {ConnectedNodesCollection} from "./ConnectedNodeCollection";
import {CreateBuilder} from "../cypher/builders/CreateBuilder";
import {MatchBuilder} from "../cypher/builders/MatchBuilder";
import {NodeNotFoundError} from "../errors/NodeNotFoundError";
import {RelationshipDirection} from "../cypher/enum/RelationshipDirection";

export class Relationship<R extends RelationshipEntity, N extends NodeEntity<any>> {
    private ownerGetter:() => NodeEntity<any>;
    private whereStatement:WhereStatement;
    private orderStatement:OrderStatement;
    private skipCount:number | undefined;
    private limitCount:number | undefined;
    private newRelations:ConnectedNodesCollection<R, N> | undefined;
    private direction:RelationshipDirection = RelationshipDirection.Outgoing;

    constructor(private relClass:Type<R>, private nodeClass:Type<N>) {}

    get boundNode():NodeEntity<any> {
        return this.ownerGetter();
    }

    set(nodes:N[] | N) {
        this.newRelations = new ConnectedNodesCollection<R, N>(this.relClass);
        this.newRelations.setNodes(_.castArray(nodes));
    }

    setWithRelation(nodesWithRelations:ConnectedNode<R, N>[] | ConnectedNode<R, N>) {
        this.newRelations = new ConnectedNodesCollection<R, N>(this.relClass);
        this.newRelations.setConnectedNodes(_.castArray(nodesWithRelations));
    }

    first():Promise<N | undefined> {
        let baseQuery = this.buildQuery(b => b.returns('node'));
        baseQuery = baseQuery
            .literal('limit 1');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();
    }

    //TODO: returns true if nodeEntity is connected by R relationshipEntity
    // has(n:Node):Promise<any> {}

    async findOne():Promise<N|never> {
        let baseQuery = this.buildQuery(b => b.returns('node'));
        baseQuery = baseQuery.literal('limit 1');

        let found = connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();

        if (!found) {
            throw new NodeNotFoundError(this.nodeClass);
        }
        return found;
    }

    // firstWithRelation():Promise<ConnectedNode<R, N> | undefined> {throw new Error("Implement Me")}

    //throws error if no result found
    // findOneWithRelation():Promise<ConnectedNode<R, N>> {throw new Error("Implement Me")}

    //here we don't
    all(_connection?:Connection):Promise<N[]> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        let baseQuery = this.buildQuery(b => b.returns('node'));
        return connection.runQuery(baseQuery).pluck('node').toArray();
    }

    allWithRelations(_connection?:Connection):Promise<ConnectedNode<R, N>[]> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        let baseQuery = this.buildQuery(b => b.returns('node', 'relation'));

        return connection.runQuery(baseQuery).toArray();
    }

    whereRelation(paramsOrCallback:Partial<R> | WhereBuilderCallback<R>):Relationship<R, N> {
        if (_.isFunction(paramsOrCallback)) {
            let result:WhereStatementPart[] | WhereStatementPart = paramsOrCallback(new WhereBuilder<N>().aliased('relation'));
            let whereStatement = this.whereStatement ?
                this.whereStatement.mergeWithAnd(new WhereStatement(_.castArray(result))) :
                new WhereStatement(_.castArray(result));

            return cloned(this, (t) => t.whereStatement = whereStatement);
        } else {
            throw new Error("implement me");
        }
    }

    whereNode(paramsOrCallback:Partial<N> | WhereBuilderCallback<N>):Relationship<R, N> {
        if (_.isFunction(paramsOrCallback)) {
            let result:WhereStatementPart[] | WhereStatementPart = paramsOrCallback(new WhereBuilder<N>().aliased('node'));
            let whereStatement = this.whereStatement ?
                this.whereStatement.mergeWithAnd(new WhereStatement(_.castArray(result))) :
                new WhereStatement(_.castArray(result));

            return cloned(this, (t) => t.whereStatement = whereStatement);
        } else {
            throw new Error("implement me");
        }
    }

    orderByNode(callback:OrderBuilderCallback<N>):Relationship<R, N> {
        let builder = new OrderBuilder<N>().aliased('node');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    orderByRelation(callback:OrderBuilderCallback<R>):Relationship<R, N> {
        let builder = new OrderBuilder<N>().aliased('relation');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    incoming():Relationship<R, N> {
        return cloned(this, a => a.direction = RelationshipDirection.Incoming);
    }

    outgoing():Relationship<R, N> {
        return cloned(this, a => a.direction = RelationshipDirection.Outgoing);
    }

    limit(count:number):Relationship<R, N> {
        return cloned(this, a => a.limitCount = count);
    }

    skip(count:number):Relationship<R, N> {
        return cloned(this, a => a.skipCount = count);
    }

    count(_connection?:Connection):Promise<number> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        let baseQuery = this.buildQuery(b => b.returns('count(node) as count'));
        return connection.runQuery(baseQuery).pluck('count').first();
    }

    async exist(_connection?:Connection):Promise<boolean> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        let baseQuery = this.buildQuery(b => b.returns('count(node) as count'), true);
        let count:number = await connection.runQuery(baseQuery).pluck('count').first();
        return count > 0;
    }

    private buildQuery(appendReturn:(b:QueryBuilder) => QueryBuilder, skipLimits:boolean = false, skipOrder:boolean = false):QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.boundNode)).params({id: this.boundNode.id}).as('o'),
                m.relation(this.relClass).as('relation').direction(this.direction),
                m.node(this.nodeClass).as('node')
            ]);

        if (this.whereStatement) {
            baseQuery = baseQuery.where(this.whereStatement)
        }

        baseQuery = appendReturn(baseQuery);

        if (this.orderStatement && !skipOrder) {
            baseQuery = baseQuery.order(this.orderStatement);
        }

        if (isPresent(this.skipCount) && !skipLimits) {
            baseQuery = baseQuery.literal('SKIP {skipValue}', {skipValue: this.skipCount});
        }

        if (isPresent(this.limitCount) && !skipLimits) {
            baseQuery = baseQuery.literal('LIMIT {limitValue}', {limitValue: this.limitCount});
        }

        return baseQuery;
    }

    bindToNode<P extends NodeEntity<any>>(getter:() => P):Relationship<R, N> {
        return cloned(this, (a) => a.ownerGetter = getter);
    }


    async save(_connection?:Connection):Promise<any> {
        if (this.newRelations) {
            let connection = _connection || connectionsFactory.checkoutConnection();
            await this.updateConnectedNodes(connection);
            this.newRelations = undefined;
        }
    }

    private async updateConnectedNodes<TO extends NodeEntity>(connection:Connection, removeConnectedNodes:boolean = false) {
        let existingConnections = await this.allWithRelations(connection);

        if (this.newRelations!.containsNode(this.boundNode as N)) {
            throw new Error('Cannot create self referencing relationshipEntity')
        }

        let newConnections:ConnectedNode<R, N>[] = this.newRelations!.getConnectedNodes();

        let unchangedConnections = _.intersectionWith(newConnections, existingConnections, ConnectedNode.isEqual);
        let connectionsForDetach = _.differenceWith(existingConnections, unchangedConnections, ConnectedNode.isEqual);
        let connectionsForAttach = _.differenceWith(newConnections, unchangedConnections, ConnectedNode.isEqual);

        await this.detachNodes(connectionsForDetach.map(c => c.node), removeConnectedNodes, connection);

        await Promise.all(connectionsForAttach.map(c => c.node.save(connection)));

        await this.connectToMany(connectionsForAttach, connection);

        return [...unchangedConnections, ...connectionsForAttach];
    }

    private async detachNodes<N extends NodeEntity>(nodes:N[], removeConnectedNodes:boolean = false, connection:Connection):Promise<any> {
        if (nodes.length === 0) {
            return;
        }

        let ids = nodes.map(r => r.id);

        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.boundNode)).params({id: this.boundNode.id} as any).as('from'),
                m.relation(this.relClass).as('rel').direction(this.direction),
                m.node().as('to')
            ])
            .where(w => w.literal('to.id in {ids}').params({ids}))
            .append(`DELETE rel ${removeConnectedNodes ? ', to' : ''}`);

        return connection.runQuery(query).toArray();
    }

    private async connectToMany<TO extends NodeEntity>(to:ConnectedNode<R, TO>[], connection:Connection):Promise<ConnectedNode<R, TO>[]> {
        let collection = new ConnectedNodesCollection(this.relClass);
        collection.setConnectedNodes(to);
        collection.assertAllNodesPersisted();
        let connections = collection.getConnectedNodes();

        if (connections.length === 0) {
            return []
        }

        const createPart = (c:CreateBuilder) => {
            return _.flatMap(connections, (connection, idx) => [
                c.matchedNode('from'),
                c.relation(connection.relation).as('r' + idx).direction(this.direction),
                c.matchedNode('to' + idx)
            ])
        };

        const matchPart = (m:MatchBuilder) => [
            m.node(getClassFromInstance(this.boundNode)).params({id: this.boundNode.id} as any).as('from'),
            ...connections.map((connection, idx) => {
                return m.node(getClassFromInstance(connection.node)).params({id: connection.node.id} as any).as('to' + idx);
            })
        ];


        let query = buildQuery()
            .match(matchPart)
            .create(createPart)
            .returns(`
                    [${_.times(connections.length).map((idx) => 'to' + idx)}] as nodes,
                    [${_.times(connections.length).map((idx) => 'r' + idx)}] as relations
            `);

        let arr = await connection.runQuery(query).first();
        let zipped = _.zipWith(arr.nodes, arr.relations, (node, relation) => {
            return {node, relation}  as any
        });
        return zipped;
    }
}


