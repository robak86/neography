import {IReadTransformer} from "../ITransformer";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";
import {isPresent} from "../../utils/core";

export class ReadInlineMappersRunner implements IReadTransformer {

    transformInstance(instance, attributesMetadata:AttributesMetadata):any {
        if (attributesMetadata) {
            attributesMetadata.forEachAttribute((attributeMetadata, prop) => {
                if (isPresent(instance[prop])) {
                    instance[prop] = attributeMetadata.fromRowMapper(instance[prop]);
                }
            });
        }

        return instance;
    }
}