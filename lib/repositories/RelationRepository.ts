import {AbstractNode, AbstractRelation, assertPersisted} from "../model";
import {FromNodeRelationsRepository} from "./FromNodeRelationsRepository";
import {Type} from "../utils/types";
import {Connection} from "../";
import {buildQuery} from "../cypher";
import {getClassFromInstance} from "../utils/core";


export class RelationRepository<R extends AbstractRelation> {
    constructor(private relationClass:Type<R>,
                private connection:Connection) {

    }

    //TODO: generates slow queries. We need constrains on node types
    update(rel:R):Promise<R> {
        assertPersisted(rel);

        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(this.relationClass).params({id: rel.id} as any).as('rel'),
                m.node()
            ])
            .set(s => s.update('rel').typed(this.relationClass, rel))
            .returns('rel');

        return this.connection.runQuery(query).pluck('rel').first();
    }

    //TODO: generates slow queries
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

    //TODO: generates slow queries
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

    //rename to "for"
    from<FROM extends AbstractNode>(node:FROM):FromNodeRelationsRepository<FROM, R> {
        return new FromNodeRelationsRepository(this.relationClass, node, this.connection);
    }

    fromType<FROM extends AbstractNode>(nodeType:Type<FROM>) {

    }
}