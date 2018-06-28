import {QueryBuilder} from "./cypher/builders/QueryBuilder";
import {Connection} from "./connection/Connection";
import {Config, NeographyConfigParams} from "./utils/Config";
import {setDebugLogger, setLogger} from "./utils/logger";
import {SimpleDebugLogger} from "./utils/SimpleDebugLogger";
import {connectionsFactory} from "./connection/ConnectionFactory";
import {IExtension} from "./extensions/IExtension";
import {IQueryPart} from "./cypher/abstract/IQueryPart";


export * from './connection/Connection';
export * from './utils/SimpleDebugLogger';

export const buildQuery = (...elements:IQueryPart[]) => new QueryBuilder(elements);

export class Neography {
    private config:Config;

    constructor(configParams:NeographyConfigParams) {
        this.config = new Config(configParams);

        connectionsFactory.init(this.config);
        setLogger(this.config.logger);

        if (this.config.debug) {
            setDebugLogger(new SimpleDebugLogger());
            if (!configParams.logger) {
                setLogger(new SimpleDebugLogger());
            }
        }
    }

    checkoutConnection():Connection {
        return connectionsFactory.checkoutConnection();
    }

    registerExtension(extension:IExtension) {
        connectionsFactory.registerExtension(extension);
    }

    query(...elements:IQueryPart[]):QueryBuilder {
        return new QueryBuilder(elements);
    }
}