import * as _ from 'lodash';

import {GraphResponse} from "../response/GraphResponse";
import {BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {TransactionRunner} from "./TransactionRunner";
import {AbstractNode, AbstractRelation} from "../model";
import {Type} from "../utils/types";
import {NodeRepository} from "../repositories/NodeRepository";
import {FromNodeRelationsRepository} from "../repositories/FromNodeRelationsRepository";
import {GraphResponseFactory} from "../response/GraphResponseFactory";
import {NodeRelationsRepository} from "../repositories/NodeRelationsRepository";
import {QueryRunner} from "./QueryRunner";
import {RelationRepository} from "../repositories/RelationRepository";

export class Connection {

    constructor(private queryRunner:QueryRunner,
                private transactionRunner:TransactionRunner,
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
        return this.transactionRunner.withTransaction(fn)
    }

    getNodeRepository<T extends AbstractNode>(nodeClass:Type<T>):NodeRepository<T> {
        return new NodeRepository(nodeClass, this);
    }

    getRelationRepository<REL extends AbstractRelation>(relationClass:Type<REL>):RelationRepository<REL> {
        return new RelationRepository(relationClass, this);
    }

    // getNodeRelationsRepository<N extends AbstractNode>(node:N):NodeRelationsRepository {
    //     return new NodeRelationsRepository(node, this);
    // }

    private execQuery(cypherQuery:string, params?:any):GraphResponse {
        let resultStatementQuery = this.transactionRunner.isTransactionOpened() ?
            this.transactionRunner.run(cypherQuery, params) :
            this.queryRunner.run(cypherQuery, params);

        return this.responseFactory.build(resultStatementQuery);
    }
}