import {IdentityExtension} from "./IdentityExtension";
import {IWriteTransformer} from "../mappers/ITransformer";
import {WriteTimestampsTransformer} from "../mappers/write/WriteTimestampsTransformer";

const timestampsTransformer = new WriteTimestampsTransformer();

export class TimestampsExtension extends IdentityExtension {
    static getDefault():TimestampsExtension {
        return new TimestampsExtension();
    }

    getWriteTransformer():IWriteTransformer {
        return timestampsTransformer;
    }
}