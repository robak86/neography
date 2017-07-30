import {IExtension} from "./IExtension";
import {TransformersRegistry} from "../mappers/AttributesMapper";
import neo4j from "neo4j-driver";
import Integer from "neo4j-driver/types/v1/integer";


export class TimestampsExtension implements IExtension {
    static getDefault():TimestampsExtension {
        return new TimestampsExtension();
    }

    transforms:TransformersRegistry = {
        create: [
            (row) => {
                let now:Integer = neo4j.int(new Date().getTime());
                row.createdAt = now;
                row.updatedAt = now;
                return row;
            }
        ],
        update: [
            (row) => {
                let now:Integer = neo4j.int(new Date().getTime());
                row.updatedAt = now;
                return row;
            }
        ]
    };

    private constructor() {}
}