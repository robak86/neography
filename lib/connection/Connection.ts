import * as _ from 'lodash';

import {GraphResponse} from "../response/GraphResponse";
import {BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {TransactionRunner} from "./TransactionRunner";
import {NodeEntity} from "../model";
import {Type} from "../utils/types";
import {NodeBatchRepository} from "../repositories/NodeBatchRepository";
import {GraphResponseFactory} from "../response/GraphResponseFactory";
import {QueryRunner} from "./QueryRunner";

import {NodeQuery} from "../repositories/NodeQuery";
import {connectionEvents} from "./ConnectionEvents";

let counter = 0;
const genId = () => `c_${counter += 1}`;

export class Connection {
    private connectionId:string = genId();


    constructor(private queryRunner:QueryRunner,
                private transactionRunner:TransactionRunner,
                private responseFactory:GraphResponseFactory) {
        connectionEvents.onConnectionCreate.emit({connectionId: this.connectionId});
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

    withTransaction<T>(fn:() => Promise<T>):Promise<T> {
        return this.transactionRunner.withTransaction(fn)
    }

    nodeBatchRepository<T extends NodeEntity>(nodeClass:Type<T>):NodeBatchRepository<T> {
        return new NodeBatchRepository(nodeClass, this);
    }

    nodeQuery<N extends NodeEntity>(nodeClass:Type<N>):NodeQuery<N> {
        return new NodeQuery(nodeClass);
    }

    private execQuery(cypherQuery:string, params?:any):GraphResponse {
        let resultStatementQuery = this.transactionRunner.isTransactionOpened() ?
            this.transactionRunner.run(cypherQuery, params) :
            this.queryRunner.run(cypherQuery, params);

        return this.responseFactory.build(resultStatementQuery);
    }
}