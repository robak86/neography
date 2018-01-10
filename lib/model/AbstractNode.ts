import {AbstractEntity} from "./AbstractEntity";
import {attribute} from "../annotations";
import {isPresent} from "../utils/core";
import {Connection} from "../connection/Connection";
import {ActiveRelation} from "./ActiveRelation";
import {proxifyRelationsDefinitions} from "./proxifyRelationsDefinitions";

export abstract class AbstractNode<T = any, RD extends object = any> extends AbstractEntity<T> {
    @attribute() readonly id?:string;

    private _entityType:'Node';
    private _relations:RD;

    get relations():RD {
        return this._relations;
    }

    set relations(relations:RD) {
        this._relations = proxifyRelationsDefinitions(relations, this);
    }


    isPersisted():boolean {
        return isPresent(this.id);
    }

    save(connection?:Connection) {
        //save yourself
        //iterate over relations (for know only first level)
        //and save related elements
    }

    //pass connection for ongoing transaction
    delete(connection?:Connection) {} //pass connection for ongoing transaction

    eagerLoad(eagerToLoad:(e:RD) => ActiveRelation<any, any>[]) {}
}