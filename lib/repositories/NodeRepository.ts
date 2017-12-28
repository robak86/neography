import {AbstractNode, assertIdExists, assertPersisted} from "../model";
import {Connection} from "../connection/Connection";
import {cypher} from "../cypher/builders/QueryBuilder";
import {Type} from "../utils/types";
import {buildQuery} from "../index";

export class NodeRepository<T extends AbstractNode> {
    constructor(private klass:Type<T>,
                private connection:Connection) {
    }

    async exists(id:string | undefined):Promise<boolean> {
        assertIdExists(id);

        let query = cypher()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id}).as('n'))
            .returns('count(n) as nodesCount');

        return this.connection.runQuery(query)
            .pluck('nodesCount')
            .map(integer => integer.toNumber() > 0)
            .first();
    }

    async save(node:T):Promise<T> {
        let query = buildQuery()
            .create(c => c.node(node).as('n'))
            .returns('n');

        return this.connection.runQuery(query).pluck('n').first();
    };

    async saveMany(nodes:T[]):Promise<T[]> {
        if (Array.isArray(nodes) && nodes.length === 0) {
            return []
        } else {
            let query = buildQuery()
                .create(c => nodes.map((node, idx) => c.node(node).as('n' + idx)))
                .returns(`[${nodes.map((n, idx) => 'n' + idx)}] as list`);

            return this.connection.runQuery(query).pluck('list').first()
        }
    };

    update(node:T):Promise<T> {
        assertPersisted(node);

        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id: node.id}).as('n'))
            .set(s => s.update('n').typed(this.klass, node))
            .returns('n');

        return this.connection.runQuery(query).pluck('n').first();
    };

    findByIds(ids:(string | undefined)[]):Promise<T[]> {
        ids.forEach(assertIdExists);

        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).as('n'))
            .where(w => w.literal('n.id in {ids}').params({ids}))
            .returns('n');

        return this.connection.runQuery(query).pluck('n').toArray();
    }

    remove(id:string | undefined, detach:boolean = true):Promise<any> {
        assertIdExists(id);

        let deletePrefix = detach ? 'DETACH DELETE' : 'DELETE';

        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id}).as('n'))
            .append(`${deletePrefix} n`);

        return this.connection.runQuery(query).toArray();
    }

    where(nodeParams:Partial<T>):Promise<T[]> {
        let query = buildQuery()
            .match(m => m.node(this.klass).params(nodeParams).as('n'))
            .returns('n');

        return this.connection.runQuery(query).pluck('n').toArray();
    }

    first(nodeParams:Partial<T>):Promise<T | null> {
        let query = buildQuery()
            .match(m => m.node(this.klass).params(nodeParams).as('n'))
            .returns('n')
            .literal('LIMIT 1');

        return this.connection.runQuery(query).pluck('n').first();
    }
}