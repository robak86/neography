import {QueryBuilder} from "./cypher/builders/QueryBuilder";
import {Connection} from "./connection/Connection";
import {NodeMapperFactory} from "./mappers/NodeMapperFactory";
import {nodeTypesRegistry} from "./annotations/NodeAnnotations";
import {AttributesMapperFactory} from "./mappers/AttributesMapperFactory";
import {RelationMapperFactory} from "./mappers/RelationMapperFactory";
import {relationsTypesRegistry} from "./annotations/RelationAnnotations";
import {GraphResponseFactory} from "./connection/GraphResponseFactory";
import {genId} from "./utils/uuid";
import * as _ from 'lodash';
import {isPresent, someOrThrow} from "./utils/core";
import {IExtension} from "./extensions/IExtension";

export * from './connection/Connection';


export const buildQuery = () => new QueryBuilder();
const neo4j = require('neo4j-driver').v1;


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

    constructor(private config:NeographyConfig) {
        let withDefaults:NeographyConfig = _.merge({objectTransform: [], uidGenerator: genId}, config);
        this.driver = neo4j.driver(`bolt://${withDefaults.host}`, neo4j.auth.basic(withDefaults.username, withDefaults.password));

        this.uuidGenerator = withDefaults.uidGenerator as any;
    }

    setUidGenerator(fn:() => string) {
        this.uuidGenerator = fn;
    }

    registerExtension(extension:IExtension) {
        this.extensions.push(extension); //TODO prevent registering the same extension twice
    }

    checkoutConnection():Connection {
        return new Connection(this.driver, this.responseFactory);
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