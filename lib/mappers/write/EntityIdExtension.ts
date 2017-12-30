import {isPresent} from "../../utils/core";
import {IWriteTransformer, TransformContext} from "../ITransformer";


export class EntityIdExtension implements IWriteTransformer {
    constructor(private generateNextUuid:() => string) {}

    //TODO: don't write id's on relations!!!
    transformRow(row, type:TransformContext):Object {
        if (type === 'create') {
            if (isPresent(row.id)) {
                throw new Error("id already exists");
            }
            row.id = this.generateNextUuid();
        }

        return row;
    }
}

