import {AbstractEntity} from "./AbstractEntity";

export abstract class AbstractRelation<T = any> extends AbstractEntity<T> {
    private _entityType:'Relation';
}