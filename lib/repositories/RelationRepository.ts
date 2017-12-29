import {assertPersisted} from "../model";
import {Connection} from "../connection/Connection";
import {AbstractRelation} from "../model";
import {AbstractNode} from "../model";
import {Type} from "../utils/types";
import {either, getClassFromInstance} from "../utils/core";
import {buildQuery} from "../cypher";
import {ConnectedNode, isConnectedNode} from "../model/ConnectedNode";


export class RelationRepository<FROM extends AbstractNode, R extends AbstractRelation, TO extends AbstractNode> {

    constructor(private fromClass:Type<FROM>,
                private relationClass:Type<R>,
                private toClass:Type<TO>,
                private connection:Connection) {}

    exists(id:string | undefined):Promise<boolean> {
        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(this.relationClass as Type<AbstractRelation>).params({id}).as('rel'),
                m.node()
            ])
            .returns('count(rel) as relCount');

        return this.connection.runQuery(query).pluck('relCount').map(integer => integer.toNumber() > 0).first();
    }

    update(rel:R):Promise<R> {
        assertPersisted(rel);

        let query = buildQuery()
            .match(m => [
                m.node(this.fromClass),
                m.relation(this.relationClass).params({id: rel.id} as any).as('rel'),
                m.node(this.toClass)
            ])
            .set(s => s.update('rel').typed(this.relationClass, rel))
            .returns('rel');

        return this.connection.runQuery(query).pluck('rel').first();
    }

    async setConnectedNodes(from:FROM, connectedNodes:(ConnectedNode<R, TO> | TO)[], removeDetached:boolean = true) {
        let existingConnections = await this.getConnectedNodes(from);

        let persistedNodes:TO[] = [];
        let newNodes:TO[] = [];
        connectedNodes.map(connectedNode => {
            let node = isConnectedNode(connectedNode, this.relationClass, this.toClass) ?
                connectedNode.node :
                connectedNode;

            node.isPersisted() ?
                persistedNodes.push(node) :
                newNodes.push(node);
        });
        let nodeRepository = this.connection.getNodeRepository(this.toClass);
        persistedNodes = await nodeRepository.updateMany(persistedNodes);
        newNodes = await nodeRepository.saveMany(newNodes);

        let newlyConnectdNodes = [...persistedNodes, ...newNodes];
    }

    connectNodes(from:FROM, to:TO, relation:R = new this.relationClass()):Promise<R> {
        assertPersisted(from);
        assertPersisted(to);

        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(from)).params({id: from.id} as any).as('from'),
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

    remove(relation:R):Promise<any> {
        assertPersisted(relation);

        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id: relation.id} as any).as('rel'),
                m.node()
            ])
            .append('DELETE rel');

        return this.connection.runQuery(query).first();
    }

    //TODO: write specs
    async getConnectedNodes(from:FROM, relationParams:Partial<R> = {}, connectedNodeParams:Partial<TO> = {}):Promise<{ relation:R, node:TO }[]> {
        assertPersisted(from);

        let query = buildQuery()
            .match(m => [
                m.node(this.fromClass).params({id: from.id} as any),
                m.relation(this.relationClass).params(relationParams).as('relation'),
                m.node(this.toClass).params(connectedNodeParams).as('node')
            ])
            .returns('relation', 'node');

        return this.connection.runQuery(query).toArray();
    }

    //TODO: write specs
    async getRelationById(id:string):Promise<R | null> {
        let rows = await this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node(this.fromClass),
                m.relation(this.relationClass).params({id} as any).as('rel'),
                m.node(this.toClass)
            ])
            .returns('rel')
        );

        return either(() => rows[0].rel, null);
    }
}