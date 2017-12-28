import {isPresent} from "../utils/core";
import {IRowTransformer} from "./IRowTransformer";

export class EntityIdExtension implements IRowTransformer {

    constructor(private generateNextUuid:() => string) {}

    create(row) {
        if (isPresent(row.id)) {
            throw new Error("id already exists");
        }
        row.id = this.generateNextUuid();
        return row;
    }
}