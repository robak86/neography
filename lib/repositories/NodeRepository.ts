import {BaseRepository} from "./BaseRepository";
import {PersistedGraphEntity} from "../model/GraphEntity";

import {Connection} from "../connection/Connection";
import {AbstractNode} from "../model/AbstractNode";


import {cypher} from "../cypher/builders/QueryBuilder";
import {Type} from "../utils/types";
import {either, someOrThrow} from "../utils/core";


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
        let rows:any[] = await this.connection.runQuery(cypher => cypher
            .create(c => c.node(node).as('n'))
            .returns('n')
        );

        return someOrThrow(() => rows[0].n, `Cannot create node: ${node}`);
    };

    async updateNode(node:T):Promise<PersistedGraphEntity<T>> {
        let rows:any[] = await this.connection.runQuery(cypher => cypher
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id: node.id}).as('n'))
            .set(s => s.update('n').typed(this.klass, node))
            .returns('n')
        );

        return rows[0].n;
    };

    removeNode(id:string, detach:boolean = true):Promise<any> {
        let deletePrefix = detach ? 'DETACH DELETE' : 'DELETE';

        return this.connection.runQuery(cypher => cypher
            .match(m => m.node(this.klass as Type<AbstractNode>).params({id}).as('n'))
            .append(`${deletePrefix} n`)
        );
    }

    async first(nodeParams:Partial<T>):Promise<PersistedGraphEntity<T>|null>{
        let rows:any[] = await this.connection.runQuery(q => q
            .match(m => m.node(this.klass).params(nodeParams).as('user'))
            .returns('user')
        );

        return either(() => rows[0].user, null);
    }

    async where(nodeParams:Partial<T>):Promise<(PersistedGraphEntity<T>)[]> {
        let rows:any[] = await this.connection.runQuery(cypher => cypher
            .match(m => m.node(this.klass).params(nodeParams).as('n'))
            .returns('n')
        );

        return rows.map(r => r.n);
    }

    async getById(id:string):Promise<PersistedGraphEntity<T> | null> {
        let results = await this.where({id} as any);
        return results[0];
    }
}