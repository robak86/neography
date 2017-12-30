import {IWriteTransformer, TransformContext} from "../ITransformer";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";

export class WriteTimestampsTransformer implements IWriteTransformer {
    transformRow(row, type:TransformContext, attributes:AttributesMetadata):Object {
        if (type === 'create') {
            let now = new Date();
            row.createdAt = now;
            row.updatedAt = now;
        }


        if (type === 'update') {
            row.updatedAt = new Date();
        }

        return row;
    }
}