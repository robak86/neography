import {IExtension} from "./IExtension";
import {TransformersRegistry} from "../mappers/AttributesMapper";
import {int, Integer} from "../driver/Integer";

export class TimestampsExtension implements IExtension {
    static getDefault():TimestampsExtension {
        return new TimestampsExtension();
    }

    transforms:TransformersRegistry = {
        create: [
            (row) => {
                let now:Integer = int(new Date().getTime());
                row.createdAt = now;
                row.updatedAt = now;
                return row;
            }
        ],
        update: [
            (row) => {
                let now:Integer = int(new Date().getTime());
                row.updatedAt = now;
                return row;
            }
        ]
    };

    private constructor() {}
}