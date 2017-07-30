import * as _ from 'lodash';

import {GraphResponse} from "../response/GraphResponse";
import {BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {TransactionRunner} from "./TransactionRunner";
import {AbstractNode} from "../model/AbstractNode";
import {Type} from "../utils/types";
import {NodeRepository} from "../repositories/NodeRepository";
import {AbstractRelation} from "../model/AbstractRelation";
import {RelationRepository} from "../repositories/RelationRepository";
import {GraphResponseFactory} from "../response/GraphResponseFactory";
import {NodeRelationsRepository} from "../repositories/NodeRelationsRepository";
import {Persisted} from "../model/GraphEntity";
import {Driver} from "neo4j-driver/types/v1/driver";
import {QueryRunner} from "./QueryRunner";


export class Connection {
    private inTransactionRunner:TransactionRunner | null;
    private ongoingTransactions:number = 0;

    constructor(private queryRunner:QueryRunner,
                private driver:Driver,
                private responseFactory:GraphResponseFactory) {
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
        if (!this.inTransactionRunner) {
            this.inTransactionRunner = new TransactionRunner(this.driver)
        }

        this.ongoingTransactions += 1;
        return fn()
            .then((result) => {
                this.ongoingTransactions -= 1;
                if (this.ongoingTransactions === 0) {
                    console.log('commit transaction');
                    let transactionResult = (this.inTransactionRunner as TransactionRunner).commit().then(() => result);
                    this.inTransactionRunner = null;
                    return transactionResult
                } else {
                    return result;
                }
            })
            .catch(err => {
                this.inTransactionRunner && this.inTransactionRunner.rollback();
                this.ongoingTransactions = 0;
                this.inTransactionRunner = null;
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
        let resultStatementQuery = this.inTransactionRunner ?
            this.inTransactionRunner.run(cypherQuery, params) :
            this.queryRunner.run(cypherQuery, params);

        return this.responseFactory.build(resultStatementQuery);
    }
}