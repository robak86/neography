import {IReadTransformer} from "../ITransformer";
import * as _ from "lodash";
import {convertToNumber} from "../../driver/Integer";
import {AttributesMetadata} from "../../metadata/AttributesMetadata";


/**
 * Converts all Integer values to javascript number type. It can happen only for data written by other clients or for computed data.
 * e.g. MATCH(n) return count(n) as count.
 * In this case "count" will be automatically converted from Integer to javascript number.
 * For integers greater than Number.MAX_SAFE_INTEGER original Integer type will be returned.
 */
export class ReadIntegerTransformer implements IReadTransformer {
    transformInstance(prev, attributesMetadata:AttributesMetadata) {
        return _.mapValues(prev, convertToNumber);
    }
}