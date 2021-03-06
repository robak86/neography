import {AttributesMetadata} from "../metadata/AttributesMetadata";


export type TransformContext = 'create' | 'update' ;

export interface IWriteTransformer {
    transformRow(row, type:TransformContext, attributesMetadata:AttributesMetadata|null):Object
}

export interface IReadTransformer {
    transformInstance(prev, attributesMetadata:AttributesMetadata|null)
}