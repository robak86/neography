import {QueryBuilder} from "./cypher/builders/QueryBuilder";
import {Connection} from "./connection/Connection";
import {nodeTypesRegistry, relationsTypesRegistry} from "./annotations";
import {AttributesMapperFactory} from "./mappers/AttributesMapperFactory";
import {GraphResponseFactory} from "./response/GraphResponseFactory";
import neo4j from "neo4j-driver";
import {QueryRunner} from "./connection/QueryRunner";
import {TransactionRunner} from "./connection/TransactionRunner";
import {ILogger} from "./utils/ILogger";
import {Config, NeographyConfigParams} from "./utils/Config";
import {EntityIdExtension} from "./extensions/EntityIdExtension";
import {ExtensionsRowMapper} from "./mappers/ExtensionsRowMapper";
import {IRowTransformer} from "./extensions/IRowTransformer";


export * from './connection/Connection';
export * from './utils/SimpleDebugLogger';


export const buildQuery = () => new QueryBuilder();


export class Neography {
    private driver;
    private extensions:IRowTransformer[] = [];
    private queryRunner:QueryRunner;
    private config:Config;

    constructor(configParams:NeographyConfigParams) {
        this.config = new Config(configParams);
        this.driver = neo4j.driver(`bolt://${this.config.host}`, neo4j.auth.basic(this.config.username, this.config.password));
        this.queryRunner = new QueryRunner(this.driver, this.config.sessionsPoolSize, this.config.logger);
        this.extensions.push(new EntityIdExtension(this.config.uidGenerator))
    }

    registerExtension(extension:IRowTransformer) {
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
        let attributesTransforms = new ExtensionsRowMapper(this.extensions);

        return new AttributesMapperFactory(
            nodeTypesRegistry.getEntries(),
            relationsTypesRegistry.getEntries(),
            attributesTransforms
        );
    }

    private get responseFactory():GraphResponseFactory {
        return new GraphResponseFactory(this.attributesMapperFactory);
    }
}