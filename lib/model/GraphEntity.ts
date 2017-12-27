import {AbstractNode} from "./AbstractNode";
import {AbstractRelation} from "./AbstractRelation";
import {isPresent} from "../utils/core";

export type GraphEntity = AbstractNode | AbstractRelation;

export function assertPersisted(entity:GraphEntity) {
    if (!entity.isPersisted()) {
        throw new Error(`Expected entity to be persisted: ${entity}`);
    }
}

export function assertIdExists(id:string | undefined) {
    if (!isPresent(id)) {
        throw new Error('Passed id property is undefined')
    }
}