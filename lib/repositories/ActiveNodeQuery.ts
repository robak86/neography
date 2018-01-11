import {AbstractNode, assertIdExists} from "../model";
import {Type} from "../utils/types";
import {OrderBuilderCallback, QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {buildQuery, Connection} from "../index";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {cloned, invariant, isPresent} from "../utils/core";
import * as _ from "lodash";
import {WhereStatement} from "../cypher/where/WhereStatement";
import {WhereBuilder, WhereStatementPart} from "../cypher/builders/WhereBuilder";
import {ActiveRelation} from "../model/ActiveRelation";
import {OrderStatement} from "../cypher/order/OrderStatement";
import {OrderBuilder} from "../cypher/builders/OrderBuilder";
import {OrderStatementPart} from "../cypher/order/OrderStatementPart";
import {NodeNotFoundError} from "../errors/NodeNotFoundError";

export class ActiveNodeQuery<N extends AbstractNode<any>> {
    private whereStatement:WhereStatement | undefined;
    private orderStatement:OrderStatement | undefined;
    private skipCount:number | undefined;
    private limitCount:number | undefined;
    private relationsToLoad:ActiveRelation<any, any>[];

    constructor(private nodeClass:Type<N>) {}

    all():Promise<N[]> {
        let baseQuery = this.buildQuery(b => b.returns('node'));

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').toArray();
    }

    async first():Promise<N | undefined> {
        let nodes = await this.limit(1).all();
        return nodes[0];
    }

    async findById(id):Promise<N> {
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
            .match(m => m.node(this.nodeClass as Type<AbstractNode>).as('n'))
            .where(w => w.literal('n.id in {ids}').params({ids}))
            .returns('n');

        let nodes:N[] = await connection.runQuery(query).pluck('n').toArray();

        let nodesByIds = _.keyBy(nodes, n => n.id);
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

    where(paramsOrCallback:Partial<N> | WhereBuilderCallback<N>):ActiveNodeQuery<N> {
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

    orderBy(callback:OrderBuilderCallback<N>):ActiveNodeQuery<N> {
        let builder = new OrderBuilder<N>().aliased('node');
        let result:OrderStatementPart[] | OrderStatementPart = callback(builder);
        let orderStatement = this.orderStatement ?
            this.orderStatement.mergeWith(new OrderStatement(_.castArray(result))) :
            new OrderStatement(_.castArray(result));

        return cloned(this, (t) => t.orderStatement = orderStatement);
    }

    skip(count:number):ActiveNodeQuery<N> {
        return cloned(this, a => a.skipCount = count);
    }

    limit(count:number):ActiveNodeQuery<N> {
        return cloned(this, a => a.limitCount = count);
    }

    //or just use keyof
    withRelations(eagerToLoad:(e:N) => ActiveRelation<any, any>[]):ActiveNodeQuery<N> {
        throw new Error("Eager loading is not yet implemented");
        //TODO: ....in order to build query for eagerly fetch associated data we need instance of relations definition
        //HOW to instantiate it ?
        // return cloned(this, (a) => a.relationsToLoad = eagerToLoad({}))
    }

    private buildQuery(appendReturn:(b:QueryBuilder) => QueryBuilder, skipLimits:boolean = false, skipOrder:boolean = false):QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(this.nodeClass).as('node')
            ]);

        if (this.whereStatement) {
            baseQuery = baseQuery.where(this.whereStatement)
        }

        baseQuery = appendReturn(baseQuery);

        if (this.orderStatement && !skipOrder) {
            baseQuery = baseQuery.order(this.orderStatement);
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
