import {BaseRepository} from "./BaseRepository";
import {PersistedGraphEntity} from "../model/GraphEntity";

import {Connection} from "../connection/Connection";
import {AbstractNode} from "../model/AbstractNode";


import {cypher} from "../cypher/builders/QueryBuilder";
import {Type} from "../utils/types";
import {either, someOrThrow} from "../utils/core";
import {buildQuery} from "../index";


export class NodeRepository<T extends AbstractNode> extends BaseRepository {

    constructor(private klass:Type<T>,
                public connection:Connection) {
        super(connection);
    }

    async nodeExists(id:string):Promise<boolean> {
        let q = cypher()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id}).as('n'))
            .returns('count(n) as nodesCount');

        let rows = await this.connection.runQuery(q);
        return rows[0].nodesCount.toNumber() !== 0
    }

    async saveNode(node:T):Promise<PersistedGraphEntity<T>> {
        let query = buildQuery()
            .create(c => c.node(node).as('n'))
            .returns('n');

        let n = await this.connection.runQuery(query).pickOne('n').first();

        return someOrThrow(() => n, `Cannot create node: ${node}`);
    };

    async updateNode(node:T):Promise<PersistedGraphEntity<T>> {
        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id: node.id}).as('n'))
            .set(s => s.update('n').typed(this.klass, node))
            .returns('n');

        return this.connection.runQuery(query).pickOne('n').first();
    };

    removeNode(id:string, detach:boolean = true):Promise<any> {
        let deletePrefix = detach ? 'DETACH DELETE' : 'DELETE';

        let query = buildQuery()
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id}).as('n'))
            .append(`${deletePrefix} n`);

        return this.connection.runQuery(query).toArray();
    }

    async first(nodeParams:Partial<T>):Promise<PersistedGraphEntity<T> | null> {
        let query = buildQuery()
            .match(m => m.node(this.klass).params(nodeParams).as('user'))
            .returns('user');

        return this.connection.runQuery(query).pickOne('user').first();
    }

    async where(nodeParams:Partial<T>):Promise<(PersistedGraphEntity<T>)[]> {
        let query = buildQuery()
            .match(m => m.node(this.klass).params(nodeParams).as('n'))
            .returns('n');

        return this.connection.runQuery(query).pickOne('n').toArray();
    }

    async getById(id:string):Promise<PersistedGraphEntity<T> | null> {
        let results = await this.where({id} as any);
        return results[0];
    }
}