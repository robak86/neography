import {Connection} from "./Connection";
import {Config} from "../utils/Config";
import {DriverProxy} from "../driver/DriverProxy";
import {QueryRunner} from "./QueryRunner";
import neo4j from "neo4j-driver";
import {TransactionRunner} from "./TransactionRunner";
import {IExtension} from "../extensions/IExtension";
import {nodeTypesRegistry, relationsTypesRegistry} from "../annotations";
import {AttributesMapperFactory} from "../mappers/AttributesMapperFactory";
import {GraphResponseFactory} from "../response/GraphResponseFactory";
import {invariant} from "../utils/core";

export class ConnectionFactory {
    private driver:DriverProxy;
    private extensions:IExtension[] = [];
    private queryRunner:QueryRunner;
    private config:Config;
    private initialized:boolean = false;

    init(config:Config) {
        this.config = config;
        this.driver = new DriverProxy(`bolt://${this.config.host}`, neo4j.auth.basic(this.config.username, this.config.password));
        this.queryRunner = new QueryRunner(this.driver, this.config.sessionsPoolSize);
        this.initialized = true;
    }

    checkoutConnection():Connection {
        invariant(this.initialized, `Connection is not initialized`);

        return new Connection(
            this.queryRunner,
            new TransactionRunner(this.driver),
            this.responseFactory
        );
    }

    registerExtension(extension:IExtension) {
        this.extensions.push(extension); //TODO prevent registering the same extension twice
    }

    get attributesMapperFactory():AttributesMapperFactory {
        return new AttributesMapperFactory(
            nodeTypesRegistry.getEntries(),
            relationsTypesRegistry.getEntries(),
            this.config.uidGenerator,
            this.extensions
        );
    }

    private get responseFactory():GraphResponseFactory {
        return new GraphResponseFactory(this.attributesMapperFactory);
    }

}


export const connectionsFactory = new ConnectionFactory();