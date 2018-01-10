import {AbstractNode} from "../model";
import {Type} from "../utils/types";
import {OrderBuilderCallback, QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {buildQuery} from "../index";
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

export class ActiveNodeQuery<N extends AbstractNode<any, any>> {
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

    // :N['relations'] {throw new Error("Implement me")};

    //TODO: this method will have to know how to instantiate relations class (because there won't be node instance)
    relations():N['relations'][] {throw new Error("Implement me")}; //probably it has to be evaluated eagerly

    withRelations(eagerToLoad:(e:N['relations']) => ActiveRelation<any, any>[]):ActiveNodeQuery<N> {
        //TODO: how to instantiate relations definitions instance here ?!
        return cloned(this, (a) => a.relationsToLoad = eagerToLoad({}))
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
