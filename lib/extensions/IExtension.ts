import {IReadTransformer, IWriteTransformer} from "../mappers/ITransformer";

export interface IExtension {
    getWriteTransformer():IWriteTransformer
    getReadTransformer():IReadTransformer
}