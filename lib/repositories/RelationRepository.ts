import {PersistedGraphEntity, assertPersisted} from "../model/GraphEntity";
import {Connection} from "../connection/Connection";
import {AbstractRelation} from "../model/AbstractRelation";
import {AbstractNode} from "../model/AbstractNode";
import {Type} from "../utils/types";
import {either} from "../utils/core";
import {buildQuery} from "../cypher/index";

export class RelationRepository<FROM extends AbstractNode, R extends AbstractRelation, TO extends AbstractNode> {

    constructor(private fromClass:Type<FROM>,
                private relationClass:Type<R>,
                private toClass:Type<TO>,
                private connection:Connection) {}

    async exists(id:string):Promise<boolean> {
        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(this.relationClass as Type<AbstractRelation>).params({id}).as('rel'),
                m.node()
            ])
            .returns('count(rel) as relCount');

        let count = await this.connection.runQuery(query).pickOne('relCount').first();
        return count.toNumber() !== 0;
    }

    update(rel:PersistedGraphEntity<R>):Promise<R> {
        assertPersisted(rel);

        let query = buildQuery()
            .match(m => [
                m.node(this.fromClass),
                m.relation(this.relationClass).params({id: rel.id} as any).as('rel'),
                m.node(this.toClass)
            ])
            .set(s => s.update('rel').typed(this.relationClass, rel))
            .returns('rel');

        return this.connection.runQuery(query).pickOne('rel').first();
    }

    save(from:PersistedGraphEntity<FROM>, to:PersistedGraphEntity<TO>, relation:R):Promise<PersistedGraphEntity<R>> {
        assertPersisted(from);
        assertPersisted(to);

        let query = buildQuery()
            .match(m => [
                m.node<FROM>(this.fromClass).params({id: from.id} as any).as('from'),
                m.node(this.toClass).params({id: to.id} as any).as('to')
            ])
            .create(c => [
                c.matchedNode('from'),
                c.relation(relation).as('rel'),
                c.matchedNode('to')
            ])
            .returns('rel');

        return this.connection.runQuery(query).pickOne('rel').first();
    }

    remove(id:string):Promise<any> {
        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id} as any).as('rel'),
                m.node()
            ])
            .append('DELETE rel');

        return this.connection.runQuery(query).first();
    }

    //TODO: write specs
    async getRelatedNodes(from:FROM, relationParams?:Partial<R>, connectedNodeParams?:Partial<TO>):Promise<{ relation:R, node:TO }[]> {
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