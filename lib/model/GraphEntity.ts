import {isPresent} from "../utils/core";
export type PersistedGraphEntity<T> = T & PersistedEntityParams;

//TODO: it feels like it is not necessary
export interface GraphEntity {
    id?:string;
    createdAt?:number;
    updatedAt?:number;
}

export interface PersistedEntityParams {
    readonly createdAt:number;
    readonly updatedAt:number;
    readonly id:string;
}

export function isPersisted<T extends GraphEntity>(entity:T | PersistedGraphEntity<T>):entity is PersistedGraphEntity<T> {
    return isPresent(<any>entity.id);
}

export function assertPersisted<T extends GraphEntity>(entity:T | PersistedGraphEntity<T>) {
    if (!isPersisted(entity)) {
        throw new Error(`Expected entity to be persisted: ${entity}`);
    }
}