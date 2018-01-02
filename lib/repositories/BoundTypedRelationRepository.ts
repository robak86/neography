import {AbstractNode, AbstractRelation, assertPersisted} from "../model";
import {Connection} from "../";
import {buildQuery} from "../cypher";
import {Type} from "../utils/types";
import {getClassFromInstance} from "../utils/core";

export class BoundTypedRelationRepository<FROM extends AbstractNode, R extends AbstractRelation, TO extends AbstractNode> {
    constructor(private fromNode:FROM,
                private relationClass:Type<R>,
                private toNode:TO,
                private connection:Connection) {
        assertPersisted(this.fromNode);
        assertPersisted(this.toNode);
    }

    updateRelation(rel:R):Promise<R> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(this.relationClass).as('rel'),
                m.node(getClassFromInstance(this.toNode)).params({id: this.toNode.id} as any),
            ])
            .set(s => s.update('rel').typed(this.relationClass, rel))
            .returns('rel');

        return this.connection.runQuery(query).pluck('rel').first();
    }

    areConnected():Promise<boolean> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(this.relationClass as Type<AbstractRelation>).as('rel'),
                m.node(getClassFromInstance(this.toNode)).params({id: this.toNode.id} as any),
            ])
            .returns('count(rel) as relCount');

        return this.connection.runQuery(query).pluck('relCount').map(count => count > 0).first();
    }

    removeRelation():Promise<any> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(this.relationClass).as('rel'),
                m.node(getClassFromInstance(this.toNode)).params({id: this.toNode.id} as any),
            ])
            .append('DELETE rel');

        return this.connection.runQuery(query).first();
    }

    connectWith(relation:R):Promise<R> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any).as('from'),
                m.node(getClassFromInstance(this.toNode)).params({id: this.toNode.id} as any).as('to')
            ])
            .create(c => [
                c.matchedNode('from'),
                c.relation(relation).as('rel'),
                c.matchedNode('to')
            ])
            .returns('rel');

        return this.connection.runQuery(query).pluck('rel').first();
    }
}