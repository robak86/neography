import {isPresent} from "../utils/core";

export type Persisted<T> = T & { id:string };
export type Peristable = { id?:string };

export function isPersisted<T extends Peristable>(entity:T | Persisted<T>):entity is Persisted<T> {
    return isPresent(<any>entity.id);
}

export function assertPersisted<T extends Peristable>(entity:T | Persisted<T>) {
    if (!isPersisted(entity)) {
        throw new Error(`Expected entity to be persisted: ${entity}`);
    }
}