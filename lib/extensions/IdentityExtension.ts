import {IReadTransformer, IWriteTransformer, TransformContext} from "../mappers/ITransformer";
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {IExtension} from "./IExtension";


class WriteIdentityTransformer implements IWriteTransformer {
    transformRow(row, type:TransformContext, attributesMetadata:AttributesMetadata):Object {
        return row;
    }
}

class ReadIdentityTransformer implements IReadTransformer {
    transformInstance(prev, attributesMetadata:AttributesMetadata) {
        return prev
    }
}

let writeIdentityTransformer = new WriteIdentityTransformer();
let readIdentityTransformer = new ReadIdentityTransformer();


export class IdentityExtension implements IExtension{
    getWriteTransformer():IWriteTransformer {
        return writeIdentityTransformer;
    };

    getReadTransformer():IReadTransformer {
        return readIdentityTransformer
    };
}