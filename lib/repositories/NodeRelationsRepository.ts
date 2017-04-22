import {AbstractNode} from "../model/AbstractNode";
import {AbstractRelation} from "../model/AbstractRelation";
import {buildQuery} from "../cypher/index";
import {Type} from "../utils/types";
import {Connection} from "../connection/Connection";
import {assertPersisted, Persisted, PersistedAggregate} from "../model/GraphEntity";
import {getClassFromInstance} from "../utils/core";


export class NodeRelationsRepository {

    constructor(private fromNode:Persisted<AbstractNode>,
                private connection:Connection) {
        assertPersisted(this.fromNode);
    }

    exists(relationKlass:Type<AbstractRelation>, id:string):Promise<boolean> {
        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(relationKlass).params({id}).as('rel'),
                m.node()
            ])
            .returns('count(rel) as relCount');

        return this.connection.runQuery(query).pickOne('relCount').map(integer => integer.toNumber() > 0).first();
    }

    where<R extends AbstractRelation>(relClass:Type<R>, params:Partial<R>):Promise<R[]>{
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(relClass).params(params).as('relation'),
                m.node()
            ])
            .returns('relation');

        return this.connection.runQuery(query).pickOne('relation').toArray();
    }

    first<R extends AbstractRelation>(relClass:Type<R>, params:Partial<R>):Promise<R>{
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(relClass).params(params).as('relation'),
                m.node()
            ])
            .returns('relation')
            .literal('LIMIT 1');

        return this.connection.runQuery(query).pickOne('relation').first();
    }

    create<R extends AbstractRelation, TO extends AbstractNode>(relation:R, to:Persisted<TO>):Promise<Persisted<R>> {
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

        return this.connection.runQuery(query).pickOne('rel').first();
    }

    update<R extends AbstractRelation>(rel:Persisted<R>):Promise<R> {
        assertPersisted(rel);

        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(getClassFromInstance(rel)).params({id: rel.id} as any).as('rel'),
                m.node()
            ])
            .set(s => s.update('rel').typed(getClassFromInstance(rel), rel as any))
            .returns('rel');

        return this.connection.runQuery(query).pickOne('rel').first();
    }

    remove<R extends AbstractRelation>(klass:Type<R>, params:Partial<R>):Promise<void> {
        let query = buildQuery()
            .match(m => [
                m.node(),
                m.relation(klass).params(params).as('rel'),
                m.node()
            ])
            .append('DELETE rel');

        return this.connection.runQuery(query).first();
    }

    getConnectedNodes<R extends AbstractRelation, N extends AbstractNode>(relClass:Type<R>,
                                                                          params:Partial<R> = {},
                                                                          targetNodeClass:Type<N> = null as any,
                                                                          targetNodeParams:Partial<N> = {}):Promise<PersistedAggregate<{ relation:R, node:N }>[]> {
        let query = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.fromNode)).params({id: this.fromNode.id} as any),
                m.relation(relClass).params(params).as('relation'),
                m.node(targetNodeClass).params(targetNodeParams).as('node')
            ])
            .returns('relation', 'node');

        return this.connection.runQuery(query).toArray();
    }

}