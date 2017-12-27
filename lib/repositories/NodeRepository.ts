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
            .pickOne('nodesCount')
            .map(integer => integer.toNumber() > 0)
            .first();
    }

    async save(node:T):Promise<T> {
        let query = buildQuery()
            .create(c => c.node(node).as('n'))
            .returns('n');

        return this.connection.runQuery(query).pickOne('n').first();
    };

    update(node:T):Promise<T> {
        assertPersisted(node);

        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id: node.id}).as('n'))
            .set(s => s.update('n').typed(this.klass, node))
            .returns('n');

        return this.connection.runQuery(query).pickOne('n').first();
    };

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

        return this.connection.runQuery(query).pickOne('n').toArray();
    }

    first(nodeParams:Partial<T>):Promise<T | null> {
        let query = buildQuery()
            .match(m => m.node(this.klass).params(nodeParams).as('n'))
            .returns('n')
            .literal('LIMIT 1');

        return this.connection.runQuery(query).pickOne('n').first();
    }
}