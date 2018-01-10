import {AbstractNode} from "../model";
import {Type} from "../utils/types";
import {QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {buildQuery} from "../index";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {cloned} from "../utils/core";
import * as _ from "lodash";
import {WhereStatement} from "../cypher/where/WhereStatement";
import {WhereBuilder, WhereStatementPart} from "../cypher/builders/WhereBuilder";
import {ActiveRelation} from "../model/ActiveRelation";

export class ActiveNodeQuery<N extends AbstractNode<any, any>> {
    protected whereStatement:WhereStatement;
    protected relationsToLoad:ActiveRelation<any, any>[];

    constructor(private nodeClass:Type<N>) {}

    all():Promise<N[]> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery.returns('node');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').toArray();
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

    private buildQuery():QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(this.nodeClass).as('node')
            ]);

        if (this.whereStatement) {
            baseQuery = baseQuery.where(this.whereStatement)
        }

        return baseQuery;
    }

    //.orderBy(o => [o.asc('firstName')]) //with callback we can be typesafe!
    orderBy():ActiveNodeQuery<N> {throw new Error("Implement me")}

    skip(count:number):ActiveNodeQuery<N> {throw new Error("Implement me")}

    limit(count:number):ActiveNodeQuery<N> {throw new Error("Implement me")}

    // :N['relations'] {throw new Error("Implement me")};

    //TODO: this method will have to know how to instantiate relations class (because there won't be node instance)
    relations():N['relations'][] {throw new Error("Implement me")}; //probably it has to be evaluated eagerly

    withRelations(eagerToLoad:(e:N['relations']) => ActiveRelation<any, any>[]):ActiveNodeQuery<N> {
        //TODO: how to instantiate relations definitions instance here ?!
        return cloned(this, (a) => a.relationsToLoad = eagerToLoad({}))
    }
}
