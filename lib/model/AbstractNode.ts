import {AbstractEntity} from "./AbstractEntity";

export abstract class AbstractNode<T = any> extends AbstractEntity<T>{
    private _entityType:'Node';
}