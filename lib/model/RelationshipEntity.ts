import {AbstractEntity} from "./AbstractEntity";

export abstract class RelationshipEntity<T = any> extends AbstractEntity<T> {
    private _entityType:'Relation';
}