import {IWriteTransformer, TransformContext} from "../ITransformer";
import * as _ from "lodash";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";

export class StripUnknownDataForWrite implements IWriteTransformer {
    transformRow(nodeInstance, type:TransformContext, attributesMetadata:AttributesMetadata|null):Object {
        let row = {};

        if (attributesMetadata) {
            _.forOwn(nodeInstance, (value, propName) => {
                if (attributesMetadata.hasAttribute(propName)) { //rewrite only known attributes
                    row[propName] = value;
                }
            });
        }

        return row;
    }
}