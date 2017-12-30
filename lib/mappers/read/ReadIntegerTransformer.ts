import {IReadTransformer} from "../ITransformer";
import * as _ from "lodash";
import {inSafeRange, isInt} from "../../driver/Integer";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";
import {getLogger} from "../../utils/logger";


/**
 * Convert unsafely all stored integer values. It can happen only for data written by other clients or for computed data
 */
export class ReadIntegerTransformer implements IReadTransformer {
    transformInstance(prev, attributesMetadata:AttributesMetadata) {
        return _.mapValues(prev, row => {
            if (isInt(row) && !inSafeRange(row)) {
                getLogger().warn(`UnsafeInteger for entity with id: ${prev.id} (or relation if id is missing)`)
            }

            return isInt(row) && inSafeRange(row) ? row.toNumber() : row;
        });
    }
}