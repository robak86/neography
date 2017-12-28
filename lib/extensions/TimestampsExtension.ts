import {IRowTransformer} from "./IRowTransformer";

export class TimestampsExtension implements IRowTransformer {
    static getDefault():TimestampsExtension {
        return new TimestampsExtension();
    }

    create(row) {
        let now = new Date();
        row.createdAt = now;
        row.updatedAt = now;
        return row;
    }

    update(row) {
        row.updatedAt = new Date();
        return row;
    }
}