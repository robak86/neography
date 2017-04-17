import * as _ from 'lodash';

import {GraphResponse} from "./GraphResponse";
import {CypherQuery, BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {Transaction} from "./Transaction";
import {pfinally} from "../utils/promise";
import {AbstractNode} from "../model/AbstractNode";
import {Type} from "../utils/types";
import {NodeRepository} from "../repositories/NodeRepository";
import {AbstractRelation} from "../model/AbstractRelation";
import {RelationRepository} from "../repositories/RelationRepository";

const neo4j = require('neo4j-driver').v1;

export interface ConnectionParams {
    host:string;
    username:string;
    password:string;
}

export class Connection {
    private currentTransaction:Transaction | null;
    private ongoingTransactions:number = 0;
    private driver;

    constructor(private config:ConnectionParams) {
        this.driver = neo4j.driver(`bolt://${config.host}`, neo4j.auth.basic(config.username, config.password));
    }

    runQuery(queryBuilder:QueryBuilder | ((builder:QueryBuilder) => QueryBuilder)):GraphResponse {
        if (_.isFunction(queryBuilder)) {
            let queryData = queryBuilder(new QueryBuilder()).toQuery().toCypher();
            return this.execQuery(queryData.boundQuery.cypherString, queryData.boundQuery.params);
        } else {
            let queryData:BoundCypherQuery = queryBuilder.toQuery().toCypher();
            return this.execQuery(queryData.boundQuery.cypherString, queryData.boundQuery.params);
        }
    }

    withTransaction<T>(fn:() => Promise<T>):Promise<T> { //TODO: rename to runWithinCurrentTransaction??
        if (!this.currentTransaction) {
            this.currentTransaction = new Transaction(this.checkoutNewSession())
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

    private execQuery(cypherQuery:string, params?:any):GraphResponse {
        if (this.currentTransaction) {
            return this.currentTransaction.runQuery(cypherQuery, params);
        } else {
            return this.runQueryWithoutTransaction(cypherQuery, params);
        }
    }

    private runQueryWithoutTransaction(query:string, params?:any):GraphResponse {
        let session = this.checkoutNewSession();
        let queryPromise = session.run(query, params);
        return GraphResponse.initWithAutoMapper(pfinally(() => session.close(), queryPromise));
    }

    private checkoutNewSession() {
        return this.driver.session();
    }
}