import {AbstractRelation} from "./AbstractRelation";
import {AbstractNode} from "./AbstractNode";
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

export class ActiveRelation<R extends AbstractRelation, N extends AbstractNode<any, any>> {
    private ownerGetter:() => AbstractNode<any>;
    private whereStatement:WhereStatement;
    private orderStatement:OrderStatement;
    private skipCount:number | undefined;
    private limitCount:number | undefined;
    private newRelations:ConnectedNode<R, N>[];

    private get origin():AbstractNode<any> {
        return this.ownerGetter();
    }

    constructor(private relClass:Type<R>, private nodeClass:Type<N>) {}

    set(nodes:N[] | N):ActiveRelation<R, N> {
        return cloned(this, a => {
            a.newRelations = _.castArray(nodes).map(node => {
                return {node: node, relation: new this.relClass()}
            })
        })
    }

    setWithRelations(nodesWithRelations:{ node:N, relation:R }[]):ActiveRelation<R, N> {
        return cloned(this, a => a.newRelations = _.castArray(nodesWithRelations));
    }

    first():Promise<N | null> {
        let baseQuery = this.buildQuery(b => b.returns('node'));
        baseQuery = baseQuery
            .literal('limit 1');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();
    }

    async findOne():Promise<N> {
        let baseQuery = this.buildQuery(b => b.returns('node'));
        baseQuery = baseQuery.literal('limit 1');

        let found = connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();

        if (!found) {
            throw new Error('Not found');
        }
        return found;
    }

    firstWithRelation():Promise<ConnectedNode<R, N> | undefined> {throw new Error("Implement Me")}

    //throws error if no result found
    findOneWithRelation():Promise<ConnectedNode<R, N>> {throw new Error("Implement Me")}

    //here we don't
    all(connection?:Connection):Promise<N[]> {
        let baseQuery = this.buildQuery(b => b.returns('node'));
        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').toArray();
    }

    allWithRelations():Promise<ConnectedNode<R, N>[]> {
        let baseQuery = this.buildQuery(b => b.returns('node', 'relation'));

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).toArray();
    }

    whereRelation(paramsOrCallback:Partial<R> | WhereBuilderCallback<R>):ActiveRelation<R, N> {
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

    whereNode(paramsOrCallback:Partial<N> | WhereBuilderCallback<N>):ActiveRelation<R, N> {
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

    orderByNode(callback:OrderBuilderCallback<N>):ActiveRelation<R, N> {
        let builder = new OrderBuilder<N>().aliased('node');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    orderByRelation(callback:OrderBuilderCallback<R>):ActiveRelation<R, N> {
        let builder = new OrderBuilder<N>().aliased('relation');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    skip(count:number):ActiveRelation<R, N> {
        return cloned(this, a => a.skipCount = count);
    }

    limit(count:number):ActiveRelation<R, N> {
        return cloned(this, a => a.limitCount = count);
    }

    count():Promise<number> {
        let baseQuery = this.buildQuery(b => b.returns('count(node) as count'));
        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('count').first();
    }

    async exist():Promise<boolean> {
        let baseQuery = this.buildQuery(b => b.returns('count(node) as count'), true);
        let count:number = await connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('count').first();
        return count > 0;
    }

    private buildQuery(appendReturn:(b:QueryBuilder) => QueryBuilder, skipLimits:boolean = false, skipOrder:boolean = false):QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.origin)).params({id: this.origin.id}).as('o'),
                m.relation(this.relClass).as('relation'),
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

    bindToNode<N extends AbstractNode<any>>(getter:() => N) {
        return cloned(this, (a) => a.ownerGetter = getter);
    }


    // save():Promise<any> {
        //TODO: save

        //and clear  private newRelations:ConnectedNode<R, N>[];
    // }

    boundNode():AbstractNode<any> {
        return this.origin;
    }

    bindToQuery(queryBuilder:QueryBuilder) {

    }

    //it will be used for... repository(NodeType).where(ids = 123).eagerLoadRelations(e => [e.children, e.something])
    _withOriginQuery(query) {}

    // save(connection:Connection){} //not sure if save method should be available only on parent node
}


