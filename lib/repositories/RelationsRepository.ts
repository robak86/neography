import {BaseRepository} from "./BaseRepository";
import {PersistedGraphEntity, assertPersisted} from "../model/GraphEntity";
import {Connection} from "../connection/Connection";
import {AbstractRelation} from "../model/AbstractRelation";
import {AbstractNode} from "../model/AbstractNode";
import {Type} from "../utils/types";
import {either} from "../utils/core";

export class RelationsRepository<FROM extends AbstractNode,R extends AbstractRelation,TO extends AbstractNode> extends BaseRepository {

    constructor(private fromClass:Type<FROM>,
                private relationClass:Type<R>,
                private toClass:Type<TO>,
                public connection:Connection) {
        super(connection);
    }

    async relationExists(id:string):Promise<boolean> {
        let rows = await this.connection.runQuery(c => c
            .match(m => [
                m.node(),
                m.relation(this.relationClass as Type<AbstractRelation>).params({id}).as('rel'),
                m.node()
            ])
            .returns('count(rel) as relCount'));

        return rows[0].relCount.toNumber() !== 0;
    }

    async updateRelation(rel:PersistedGraphEntity<R>):Promise<R> {
        assertPersisted(rel);

        let rows = await this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id: rel.id} as any).as('rel'),
                m.node()
            ])
            .set(s => s.update('rel').typed(this.relationClass, rel))
            .returns('rel')
        );

        return rows[0].rel;
    }

    async getRelatedNodes(from:FROM, relationParams?:Partial<R>, connectedNodeParams?:Partial<TO>):Promise<{relation:R, node:TO}[]> {
        assertPersisted(from);

        return this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node(this.fromClass).params({id: from.id} as any),
                m.relation(this.relationClass).params(relationParams).as('relation'),
                m.node(this.toClass).params(connectedNodeParams).as('node')
            ])
            .returns('relation', 'node')
        );
    }

    async saveRelation(from:PersistedGraphEntity<FROM>, to:PersistedGraphEntity<TO>, relation:R):Promise<PersistedGraphEntity<R>> {
        let rows = await this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node<FROM>(this.fromClass).params({id: from.id} as any).as('from'),
                m.node(this.toClass).params({id: to.id} as any).as('to')
            ])
            .create(c => [
                c.matchedNode('from'),
                c.relation(relation).as('rel'),
                c.matchedNode('to')
            ])
            .returns('rel')
        );

        return rows[0].rel;
    }

    async getRelationById(id:string):Promise<R|null> {
        let rows = await this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id} as any).as('rel'),
                m.node()
            ])
            .returns('rel')
        );

        return either(() => rows[0].rel, null);
    }

    //TODO: is it actually unsafe from relational point of view? because it leaves nodes untouched ?
    removeRelation(id:string):Promise<any> {
        return this.connection.runQuery(cypher => cypher
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id} as any).as('rel'),
                m.node()
            ])
            .append('DELETE rel')
        );
    }
}