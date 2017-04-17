import {AttributesMapper, MappingContext, TransformersRegistry} from "./AttributesMapper";
import {Type} from "../utils/types";
import {int, Integer} from "../driver/Integer";
import {isPresent} from "../utils/core";
import {genId} from "../utils/uuid";
import {Peristable} from "../model/GraphEntity";

export class AttributesMapperFactory {
    private _transformers:TransformersRegistry = {};


    getMapper<T extends Peristable>(klass:Type<T>):AttributesMapper<T> {
        return new AttributesMapper(klass, this._transformers);
    }

    addTransformFunction(context:MappingContext, transformer:(obj:any) => any) {
        let transformers = this._transformers[context] || (this._transformers[context] = []);
        transformers.push(transformer);
    }
}

export const attributesMapperFactory = new AttributesMapperFactory();

attributesMapperFactory.addTransformFunction('create', (row) => {
    let now:Integer = int(new Date().getTime());

    if (isPresent(row.id)) {
        throw new Error("id already exists");
    }
    row.id = genId();
    row.createdAt = now;
    row.updatedAt = now;
    return row;
});

attributesMapperFactory.addTransformFunction('update', (row) => {
    let now:Integer = int(new Date().getTime());
    row.updatedAt = now;
    return row;
});