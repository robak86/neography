import * as _ from 'lodash';

import {GraphResponse} from "./GraphResponse";
import {BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {Transaction} from "./Transaction";
import {pfinally} from "../utils/promise";
import {AbstractNode} from "../model/AbstractNode";
import {Type} from "../utils/types";
import {NodeRepository} from "../repositories/NodeRepository";
import {AbstractRelation} from "../model/AbstractRelation";
import {RelationRepository} from "../repositories/RelationRepository";
import {GraphResponseFactory} from "./GraphResponseFactory";
import {NodeRelationsRepository} from "../repositories/NodeRelationsRepository";
import {Persisted} from "../model/GraphEntity";


export class Connection {
    private currentTransaction:Transaction | null;
    private ongoingTransactions:number = 0;
    private ongoingQueries:number = 0;
    private _currentSession;

    constructor(private driver,
                private responseFactory:GraphResponseFactory) {
    }

    private get session() {
        return this._currentSession || ( this._currentSession = this.driver.session());
    }

    private closeSession() {
        this._currentSession && this._currentSession.close();
        this._currentSession = null;
    }

    runQuery(queryBuilder:QueryBuilder | ((builder:QueryBuilder) => QueryBuilder)):GraphResponse {
        if (_.isFunction(queryBuilder)) {
            let queryData = queryBuilder(new QueryBuilder()).toQuery(this.responseFactory.attributesMapperFactory).toCypher();
            return this.execQuery(queryData.boundQuery.cypherString, queryData.boundQuery.params);
        } else {
            let queryData:BoundCypherQuery = queryBuilder.toQuery(this.responseFactory.attributesMapperFactory).toCypher();
            return this.execQuery(queryData.boundQuery.cypherString, queryData.boundQuery.params);
        }
    }

    withTransaction<T>(fn:() => Promise<T>):Promise<T> { //TODO: rename to runWithinCurrentTransaction??
        if (!this.currentTransaction) {
            this.currentTransaction = new Transaction(this.checkoutNewSession(), this.responseFactory)
        }

        this.ongoingTransactions += 1;
        return fn()
            .then((result) => {
                this.ongoingTransactions -= 1;
                if (this.ongoingTransactions === 0) {
                    let transactionResult = (this.currentTransaction as Transaction).commit().then(() => result);
                    this.currentTransaction = null;
                    return transactionResult
                } else {
                    return result;
                }
            })
            .catch(err => {
                this.currentTransaction && this.currentTransaction.rollback();
                this.ongoingTransactions = 0;
                this.currentTransaction = null;
                return Promise.reject(err);
            });
    }

    getNodeRepository<T extends AbstractNode>(nodeClass:Type<T>):NodeRepository<T> {
        return new NodeRepository(nodeClass, this);
    }

    getRelationRepository<FROM extends AbstractNode, REL extends AbstractRelation, TO extends AbstractNode>(from:Type<FROM>, relationClass:Type<REL>, to:Type<TO>):RelationRepository<FROM, REL, TO> {
        return new RelationRepository(from, relationClass, to, this);
    }

    getNodeRelationsRepository<N extends AbstractNode>(node:Persisted<N>):NodeRelationsRepository {
        return new NodeRelationsRepository(node, this);
    }

    private execQuery(cypherQuery:string, params?:any):GraphResponse {
        if (this.currentTransaction) {
            return this.currentTransaction.runQuery(cypherQuery, params);
        } else {
            return this.runQueryWithoutTransaction(cypherQuery, params);
        }
    }

    private runQueryWithoutTransaction(query:string, params?:any):GraphResponse {
        this.ongoingQueries += 1;
        let queryPromise = this.session.run(query, params);
        return this.responseFactory.build(pfinally(
            () => {
                this.ongoingQueries -= 1;
                if (this.ongoingQueries == 0) {
                    this.closeSession();
                }
            }
            ,
            queryPromise
        ));
    }

    private checkoutNewSession() {
        return this.driver.session();
    }
}