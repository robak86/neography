import {AbstractEntity} from "./AbstractEntity";
import {attribute} from "../annotations";
import {isPresent} from "../utils/core";

export abstract class AbstractNode<T = any> extends AbstractEntity<T> {
    @attribute() readonly id?:string;

    private _entityType:'Node';

    isPersisted():boolean {
        return isPresent(this.id);
    }
}