import {NodeEntity, assertIdExists} from "../model";
import {Type} from "../utils/types";
import {OrderBuilderCallback, QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {buildQuery, Connection} from "../index";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {cloned, invariant, isPresent} from "../utils/core";
import * as _ from "lodash";
import {WhereStatement} from "../cypher/where/WhereStatement";
import {WhereBuilder, WhereStatementPart} from "../cypher/builders/WhereBuilder";
import {Relationship} from "../model/Relationship";
import {OrderStatement} from "../cypher/order/OrderStatement";
import {OrderBuilder} from "../cypher/builders/OrderBuilder";
import {OrderStatementPart} from "../cypher/order/OrderStatementPart";
import {NodeNotFoundError} from "../errors/NodeNotFoundError";

export class NodeQuery<N extends NodeEntity<any>> {
    private whereStatement:WhereStatement | undefined;
    private orderStatement:OrderStatement | undefined;
    private skipCount:number | undefined;
    private limitCount:number | undefined;
    private relationsToLoad:Relationship<any, any>[];

    constructor(private nodeClass:Type<N>) {}

    all():Promise<N[]> {
        let baseQuery = this.buildQuery(b => b.returns('node'));

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').toArray();
    }

    async first():Promise<N | undefined> {
        let nodes = await this.limit(1).all();
        return nodes[0];
    }

    async findFirst():Promise<N | never> {
        let items = await this.all();
        if (items.length === 0) {
            throw new NodeNotFoundError(this.nodeClass);
        }

        return items[0];
    }

    async exists(id):Promise<boolean> {
        let count = await this.unwhere().where(w => w.attribute('id').equal(id)).count();
        return count === 1;
    }

    async firstById(id:string | undefined):Promise<N|undefined> {
        invariant(!this.whereStatement, 'findById cannot be used with where()');
        return await this
            .unwhere()
            .where(w => w.attribute('id').equal(id))
            .first();
    }

    async findById(id:string | undefined):Promise<N> {
        invariant(!this.whereStatement, 'findById cannot be used with where()');
        let node = await this
            .unwhere()
            .where(w => w.attribute('id').equal(id))
            .first();

        if (!node) {
            throw new NodeNotFoundError(this.nodeClass, id);
        }

        return node;
    }

    async findByIds(ids:(string | undefined)[], _connection?:Connection):Promise<N[]> {
        ids.forEach(assertIdExists);
        let connection = _connection || connectionsFactory.checkoutConnection();

        let query = buildQuery()
            .match(m => m.node(this.nodeClass as Type<NodeEntity>).as('n'))
            .where(w => w.literal('n.id in {ids}').params({ids}))
            .returns('n');

        let nodes:N[] = await connection.runQuery(query).pluck('n').toArray();

        let nodesByIds:{[id:string]: N} = _.keyBy(nodes, n => n.id) as any;
        let result:N[] = [];

        ids.forEach((id:string) => nodesByIds[id] && result.push(nodesByIds[id]));
        return result;
    }

    count(_connection?:Connection):Promise<number> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        let baseQuery = this.buildQuery(b => b.returns('count(node) as count'));
        return connection.runQuery(baseQuery).pluck('count').first();
    }


    unwhere() {
        return cloned(this, (t) => t.whereStatement = undefined);
    }

    where(paramsOrCallback:Partial<N> | WhereBuilderCallback<N>):NodeQuery<N> {
        if (_.isFunction(paramsOrCallback)) {
            let result:WhereStatementPart[] | WhereStatementPart = paramsOrCallback(new WhereBuilder<N>().aliased('node'));
            let whereStatement = this.whereStatement ?
                this.whereStatement.mergeWithAnd(new WhereStatement(_.castArray(result))) :
                new WhereStatement(_.castArray(result));

            return cloned(this, (t) => t.whereStatement = whereStatement);
        } else {
            throw new Error("implement me");
        }
    }

    orderBy(callback:OrderBuilderCallback<N>):NodeQuery<N> {
        let builder = new OrderBuilder<N>().aliased('node');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    skip(count:number):NodeQuery<N> {
        invariant(_.isInteger(count), `Given skip count has to be integer number. Passed ${count} instead`);
        return cloned(this, a => a.skipCount = count);
    }

    limit(count:number):NodeQuery<N> {
        invariant(_.isInteger(count), `Given limit count has to be integer number. Passed ${count} instead`);
        return cloned(this, a => a.limitCount = count);
    }

    private buildQuery(appendReturn:(b:QueryBuilder) => QueryBuilder, skipLimits:boolean = false, skipOrder:boolean = false):QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(this.nodeClass).as('node')
            ]);

        if (this.whereStatement) {
            baseQuery = baseQuery.pipe(this.whereStatement)
        }

        baseQuery = appendReturn(baseQuery);

        if (this.orderStatement && !skipOrder) {
            baseQuery = baseQuery.pipe(this.orderStatement);
        }

        if (isPresent(this.skipCount) && !skipLimits) {
            baseQuery = baseQuery.literal('SKIP {skipValue}', {skipValue: this.skipCount});
        }

        if (isPresent(this.limitCount) && !skipLimits) {
            baseQuery = baseQuery.literal('LIMIT {limitValue}', {limitValue: this.limitCount});
        }

        return baseQuery;
    }
}
