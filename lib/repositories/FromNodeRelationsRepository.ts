import {AbstractNode, AbstractRelation, assertAllPersisted, assertPersisted} from "../model";
import {Connection} from "../connection/Connection";
import {Type} from "../utils/types";
import {getClassFromInstance} from "../utils/core";
import {buildQuery} from "../cypher";
import {ConnectedNode} from "../model/ConnectedNode";
import {ConnectedNodesCollection} from "../model/ConnectedNodeCollection";
import {CreateBuilder} from "../cypher/builders/CreateBuilder";
import * as _ from 'lodash';
import {MatchBuilder} from "../cypher/builders/MatchBuilder";

export class FromNodeRelationsRepository<FROM extends AbstractNode, R extends AbstractRelation> {

    constructor(private relationClass:Type<R>,
                private fromNode:FROM,
                private connection:Connection) {
        assertPersisted(this.fromNode);
    }


    async setConnectedNodes<TO extends AbstractNode>(connectedNodes:(ConnectedNode<R, TO> | TO)[], removeDetached:boolean = true) {
        let existingConnections = await this.getConnectedNodes();

        let connectedNodesCollection = new ConnectedNodesCollection(this.relationClass, connectedNodes);
        connectedNodesCollection.assertAllNodesPersisted();

        let newConnections:ConnectedNode<R, TO>[] = connectedNodesCollection.getConnectedNodes();

        let unchangedConnections = _.intersectionWith(newConnections, existingConnections, ConnectedNode.isEqual);
        let connectionsForDetach = _.pullAllWith(existingConnections, unchangedConnections, ConnectedNode.isEqual);
        let connectionsForAttach = _.pullAllWith(newConnections, unchangedConnections, ConnectedNode.isEqual);


        await this.removeManyRelations(connectionsForDetach.map(c => c.relation));
        await this.connectToMany(connectionsForAttach);

        return [...unchangedConnections, ...connectionsForAttach];
    }

    async removeManyRelations(relations:R[]):Promise<any> {
        if (relations.length === 0) {
            return;
        }

        assertAllPersisted(relations);
        let ids = relations.map(r => r.id);

        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any).as('from'),
                m.relation(this.relationClass).as('rel'),
                m.node()
            ])
            .where(w => w.literal('rel.id in {ids}').params({ids}))
            .append(`DELETE rel`);

        return this.connection.runQuery(query).toArray();
    }

    async connectToMany<TO extends AbstractNode>(to:(ConnectedNode<R, TO> | TO)[]):Promise<ConnectedNode<R, TO>[]> {
        let collection = new ConnectedNodesCollection(this.relationClass, to);
        collection.assertAllNodesPersisted();
        let connections = collection.getConnectedNodes();

        const createPart = (c:CreateBuilder) => {
            return _.flatMap(connections, (connection, idx) => [
                c.matchedNode('from'),
                c.relation(connection.relation).as('r' + idx),
                c.matchedNode('to' + idx)
            ])
        };

        const matchPart = (m:MatchBuilder) => [
            m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any).as('from'),
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

        let arr = await this.connection.runQuery(query).first();
        let zipped = _.zipWith(arr.nodes, arr.relations, (node, relation) => {
            return {node, relation}  as any
        });
        return zipped;
    }

    connectTo<TO extends AbstractNode>(to:TO, relation:R = new this.relationClass()):Promise<R> {
        assertPersisted(to);

        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any).as('from'),
                m.node(getClassFromInstance(to)).params({id: to.id} as any).as('to')
            ])
            .create(c => [
                c.matchedNode('from'),
                c.relation(relation).as('rel'),
                c.matchedNode('to')
            ])
            .returns('rel');

        return this.connection.runQuery(query).pluck('rel').first();
    }


    //TODO: write specs

    //TODO: for narrowing to type we have to create another repository accepting also toNodeInstance (except fromNodeInstance)
    async getConnectedNodes<TO extends AbstractNode>(relationParams:Partial<R> = {}, connectedNodeParams:Partial<TO> = {}):Promise<{ relation:R, node:TO }[]> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(this.relationClass).params(relationParams).as('relation'),
                m.node().params(connectedNodeParams).as('node')
            ])
            .returns('relation', 'node');

        return this.connection.runQuery(query).toArray();
    }

    //TODO: write specs
    // async getRelationById(id:string):Promise<R | null> {
    //     let rows = await this.connection.runQuery(cypher => cypher
    //         .match(m => [
    //             m.node(this.fromClass),
    //             m.relation(this.relationClass).params({id} as any).as('rel'),
    //             m.node(this.toClass)
    //         ])
    //         .returns('rel')
    //     );
    //
    //     return either(() => rows[0].rel, null);
    // }
}