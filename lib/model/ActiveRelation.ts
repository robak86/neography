import {AbstractRelation} from "./AbstractRelation";
import {AbstractNode} from "./AbstractNode";
import {Type} from "../utils/types";
import {OrderBuilderCallback} from "../repositories/OrderBuilder";
import {ConnectedNode} from "./ConnectedNode";
import {QueryBuilder, WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {cloned, getClassFromInstance} from "../utils/core";
import {buildQuery} from "../cypher";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {Connection} from "../";
import {WhereStatement} from "../cypher/where/WhereStatement";
import {WhereBuilder, WhereStatementPart} from "../cypher/builders/WhereBuilder";
import * as _ from 'lodash';

export class ActiveRelation<R extends AbstractRelation, N extends AbstractNode<any, any>> {
    private ownerGetter:() => AbstractNode<any>;
    private whereStatement:WhereStatement;

    private get origin():AbstractNode<any> {
        return this.ownerGetter();
    }

    constructor(private relClass:Type<R>, private nodeClass:Type<N>) {}

    set<N>(nodes:N[] | N) {}

    setWithRelations(nodesWithRelations:{ node:N, relation:R }[]) {}

    first():Promise<N | null> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery
            .returns('node')
            .literal('limit 1');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();
    }

    async findOne():Promise<N> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery
            .returns('node')
            .literal('limit 1');

        let found = connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').first();

        if (!found) {
            throw new Error('Not found');
        }
        return found;
    }

    firstWithRelation():Promise<ConnectedNode<R, N> | undefined> {throw new Error("Implement Me")}

    //throws error if no result found
    findOneWithRelation():Promise<ConnectedNode<R, N>> {throw new Error("Implement Me")}

    //here we don't
    all(connection?:Connection):Promise<N[]> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery.returns('node');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('node').toArray();
    }

    allWithRelations():Promise<ConnectedNode<R, N>[]> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery.returns('node', 'relation');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).toArray();
    }

    //TODO: WhereBuilderCallback will have to know of undergoing alias assigned to relation or node - one can use .alias method on WhereAttributeBuilder
    whereRelation(paramsOrCallback:Partial<R> | WhereBuilderCallback<R>):ActiveRelation<R, N> {
        if (_.isFunction(paramsOrCallback)) {
            let result:WhereStatementPart[] | WhereStatementPart = paramsOrCallback(new WhereBuilder<N>().aliased('relation'));
            let whereStatement = this.whereStatement ?
                this.whereStatement.mergeWithAnd(new WhereStatement(_.castArray(result))) :
                new WhereStatement(_.castArray(result));

            return cloned(this, (t) => t.whereStatement = whereStatement);
        } else {
            throw new Error("implement me");
        }
    }

    whereNode(paramsOrCallback:Partial<N> | WhereBuilderCallback<N>):ActiveRelation<R, N> {
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

    orderByNode(b:OrderBuilderCallback<N>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    orderByRelation(b:OrderBuilderCallback<R>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    skip(count:number):ActiveRelation<R, N> {throw new Error("Implement Me")}

    limit(count:number):ActiveRelation<R, N> {throw new Error("Implement Me")}

    count():Promise<number> {
        let baseQuery = this.buildQuery();
        baseQuery = baseQuery.returns('count(node) as count');

        return connectionsFactory.checkoutConnection().runQuery(baseQuery).pluck('count').first();
    }

    exist():Promise<boolean> {throw new Error("Implement Me")}


    private buildQuery():QueryBuilder {
        let baseQuery = buildQuery()
            .match(m => [
                m.node(getClassFromInstance(this.origin)).params({id: this.origin.id}).as('o'),
                m.relation(this.relClass).as('relation'),
                m.node(this.nodeClass).as('node')
            ]);

        if (this.whereStatement) {
            baseQuery = baseQuery.where(this.whereStatement)
        }

        return baseQuery;
    }

    bindToNode<N extends AbstractNode<any>>(getter:() => N) {
        return cloned(this, (a) => a.ownerGetter = getter);
    }

    boundNode():AbstractNode<any> {
        return this.origin;
    }

    bindToQuery(queryBuilder:QueryBuilder) {

    }

    //it will be used for... repository(NodeType).where(ids = 123).eagerLoadRelations(e => [e.children, e.something])
    _withOriginQuery(query) {}

    // save(connection:Connection){} //not sure if save method should be available only on parent node
}


