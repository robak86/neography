import * as _ from 'lodash';

import {GraphResponse} from "../response/GraphResponse";
import {BoundCypherQuery} from "../cypher/CypherQuery";
import {QueryBuilder} from "../cypher/builders/QueryBuilder";
import {TransactionRunner} from "./TransactionRunner";
import {AbstractNode, AbstractRelation} from "../model";
import {Type} from "../utils/types";
import {NodeRepository} from "../repositories/NodeRepository";
import {GraphResponseFactory} from "../response/GraphResponseFactory";
import {QueryRunner} from "./QueryRunner";
import {UnboundRelationRepository} from "../repositories/UnboundRelationRepository";
import {ActiveNodeQuery} from "../repositories/ActiveNodeQuery";

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

    withTransaction<T>(fn:() => Promise<T>):Promise<T> {
        return this.transactionRunner.withTransaction(fn)
    }

    nodeType<T extends AbstractNode>(nodeClass:Type<T>):NodeRepository<T> {
        return new NodeRepository(nodeClass, this);
    }

    relationType<REL extends AbstractRelation>(relationClass:Type<REL>):UnboundRelationRepository<REL> {
        return new UnboundRelationRepository(relationClass, this);
    }

    getRepository<N extends AbstractNode>(nodeClass:Type<N>):ActiveNodeQuery<N> {
        return new ActiveNodeQuery(nodeClass);
    }

    private execQuery(cypherQuery:string, params?:any):GraphResponse {
        let resultStatementQuery = this.transactionRunner.isTransactionOpened() ?
            this.transactionRunner.run(cypherQuery, params) :
            this.queryRunner.run(cypherQuery, params);

        return this.responseFactory.build(resultStatementQuery);
    }
}