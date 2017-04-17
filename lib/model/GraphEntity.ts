import {isPresent} from "../utils/core";
export type Persisted<T> = T & Persisted;

//TODO: it feels like it is not necessary
export interface GraphEntity {
    id?:string;  //TODO: only this field should be forced by this library
    createdAt?:number;
    updatedAt?:number;
}

//TODO: find shorter name
export interface Persisted {
    readonly createdAt:number;
    readonly updatedAt:number;
    readonly id:string; //TODO: only this field should be defined by Persisted
}

export function isPersisted<T extends GraphEntity>(entity:T | Persisted<T>):entity is Persisted<T> {
    return isPresent(<any>entity.id);
}

export function assertPersisted<T extends GraphEntity>(entity:T | Persisted<T>) {
    if (!isPersisted(entity)) {
        throw new Error(`Expected entity to be persisted: ${entity}`);
    }
}