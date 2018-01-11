import {AbstractNode} from "./AbstractNode";
import {AbstractRelation} from "./AbstractRelation";
import {invariant, isPresent} from "../utils/core";

export type GraphElement = AbstractNode | AbstractRelation;
export type GraphEntity = AbstractNode ;

export function assertPersisted(entity:GraphEntity) {
    invariant(entity.isPersisted(), `Expected entity to be persisted: ${entity}`);
}

export function assertIdExists(id:string | undefined) {
    invariant(isPresent(id), 'Passed id property is undefined');
}

export function assertAllIdsPresent(arr:(string | undefined)[]) {
    arr.forEach((id) => {
        invariant(isPresent(id), `Passed array contains empty id`);
    });
}

export function assertAllPersisted(arr:GraphEntity[]) {
    arr.forEach((entity) => {
        invariant(isPresent(entity.id), `Missing id property for entity: ${JSON.stringify(entity)}`);
    });
}

export function assertAllNew(arr:GraphEntity[]) {
    arr.forEach((entity) => {
        invariant(!isPresent(entity.id), `Passed entity has already id and it's probably persisted: ${JSON.stringify(entity)}`);
    });
}