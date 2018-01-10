import {AbstractEntity} from "./AbstractEntity";
import {attribute} from "../annotations";
import {isPresent} from "../utils/core";
import {Connection} from "../connection/Connection";
import {ActiveRelation} from "./ActiveRelation";

export abstract class AbstractNode<T = any, RD = any> extends AbstractEntity<T> {
    @attribute() readonly id?:string;

    private _entityType:'Node';

    _relations:RD;

    get relations():RD {
        // return new Proxy(this._relations as any, {
        //     //TODO: we don't have to use proxy because connection is globally accessible
        // })
        return this._relations;
    }

    isPersisted():boolean {
        return isPresent(this.id);
    }

    save(connection?:Connection) {}     //pass connection for ongoing transaction
    delete(connection?:Connection) {} //pass connection for ongoing transaction

    eagerLoad(eagerToLoad:(e:RD) => ActiveRelation<any, any>[]) {}
}