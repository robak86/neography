import {IWriteTransformer, TransformContext} from "../ITransformer";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";
import {isPresent} from "../../utils/core";

export class WriteInlineMappersRunner implements IWriteTransformer {
    transformRow(row, type:TransformContext, attributesMetadata:AttributesMetadata):Object {
        if (attributesMetadata) {
            attributesMetadata.forEachAttribute((attributeMetadata, prop) => {
                if (isPresent(row[prop])) {
                    row[prop] = attributeMetadata.toRowMapper(row[prop]);
                }
            });
        }

        return row;
    }
}