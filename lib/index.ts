import {QueryBuilder} from "./cypher/builders/QueryBuilder";
import {Connection} from "./connection/Connection";
import {nodeTypesRegistry} from "./annotations/NodeAnnotations";
import {AttributesMapperFactory} from "./mappers/AttributesMapperFactory";
import {relationsTypesRegistry} from "./annotations/RelationAnnotations";
import {GraphResponseFactory} from "./response/GraphResponseFactory";
import {genId} from "./utils/uuid";
import * as _ from 'lodash';
import {isPresent} from "./utils/core";
import {IExtension} from "./extensions/IExtension";

import neo4j from "neo4j-driver";
import {QueryRunner} from "./connection/QueryRunner";
import {TransactionRunner} from "./connection/TransactionRunner";

export * from './connection/Connection';


export const buildQuery = () => new QueryBuilder();


export class NeographyConfig {
    uidGenerator?:() => string;
    objectTransform?:((obj:any) => any)[];
    host:string;
    username:string;
    password:string;
}

export class Neography {
    private driver;
    private uuidGenerator:() => string;
    private extensions:IExtension[] = [];
    private queryRunner:QueryRunner;

    constructor(private config:NeographyConfig) {
        let withDefaults:NeographyConfig = _.merge({objectTransform: [], uidGenerator: genId}, config);
        this.driver = neo4j.driver(`bolt://${withDefaults.host}`, neo4j.auth.basic(withDefaults.username, withDefaults.password));

        this.uuidGenerator = withDefaults.uidGenerator as any;

        this.queryRunner = new QueryRunner(this.driver);
    }

    setUidGenerator(fn:() => string) {
        this.uuidGenerator = fn;
    }

    registerExtension(extension:IExtension) {
        this.extensions.push(extension); //TODO prevent registering the same extension twice
    }

    checkoutConnection():Connection {
        return new Connection(
            this.queryRunner,
            new TransactionRunner(this.driver),
            this.responseFactory
        );
    }

    query():QueryBuilder {
        return new QueryBuilder();
    }

    get attributesMapperFactory():AttributesMapperFactory {
        let generateUuid = this.uuidGenerator;


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