import neo4j from "neo4j-driver";
import Integer from "neo4j-driver/types/v1/integer";
import {IRowTransformer} from "./IRowTransformer";

export class TimestampsExtension implements IRowTransformer {
    static getDefault():TimestampsExtension {
        return new TimestampsExtension();
    }

    create(row) {
        let now:Integer = neo4j.int(new Date().getTime());
        row.createdAt = now;
        row.updatedAt = now;
        return row;
    }

    update(row) {
        let now:Integer = neo4j.int(new Date().getTime());
        row.updatedAt = now;
        return row;
    }
}