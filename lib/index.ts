import {QueryBuilder} from "./cypher/builders/QueryBuilder";
import {Connection} from "./connection/Connection";
import {nodeTypesRegistry, relationsTypesRegistry} from "./annotations";
import {AttributesMapperFactory} from "./mappers/AttributesMapperFactory";
import {GraphResponseFactory} from "./response/GraphResponseFactory";
import * as _ from 'lodash';
import {isPresent} from "./utils/core";
import {IExtension} from "./extensions/IExtension";
import neo4j from "neo4j-driver";
import {QueryRunner} from "./connection/QueryRunner";
import {TransactionRunner} from "./connection/TransactionRunner";
import {ILogger} from "./utils/ILogger";
import {Config, NeographyConfigParams} from "./utils/Config";

export * from './connection/Connection';
export * from './utils/SimpleDebugLogger';


export const buildQuery = () => new QueryBuilder();


export class Neography {
    private driver;
    private extensions:IExtension[] = [];
    private queryRunner:QueryRunner;
    private config:Config;

    constructor(configParams:NeographyConfigParams) {
        this.config = new Config(configParams);
        this.driver = neo4j.driver(`bolt://${this.config.host}`, neo4j.auth.basic(this.config.username, this.config.password));
        this.queryRunner = new QueryRunner(this.driver, this.config.sessionsPoolSize, this.config.logger);
    }

    setUidGenerator(fn:() => string) {
        this.config.uidGenerator = fn;
    }

    registerExtension(extension:IExtension) {
        this.extensions.push(extension); //TODO prevent registering the same extension twice
    }

    checkoutConnection():Connection {
        return new Connection(
            this.queryRunner,
            new TransactionRunner(this.driver, this.config.logger as ILogger),
            this.responseFactory
        );
    }

    query():QueryBuilder {
        return new QueryBuilder();
    }

    get attributesMapperFactory():AttributesMapperFactory {
        let generateUuid = this.config.uidGenerator;


        let transforms = {
            create: [
                (row) => {
                    if (isPresent(row.id)) {
                        throw new Error("id already exists");
                    }
                    row.id = generateUuid();
                    return row;
                },
                ..._.flatMap(this.extensions.map(ext => ext.transforms.create))
            ],
            update: [
                ..._.flatMap(this.extensions.map(ext => ext.transforms.update))
            ]
        };

        return new AttributesMapperFactory(
            nodeTypesRegistry.getEntries(),
            relationsTypesRegistry.getEntries(),
            transforms as any
        );
    }

    private get responseFactory():GraphResponseFactory {
        return new GraphResponseFactory(this.attributesMapperFactory);
    }
}