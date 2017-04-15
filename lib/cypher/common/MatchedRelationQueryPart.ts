import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "./QueryContext";
import {cloned} from "../../utils/core";



//TODO: not sure if it is even needed
//TODO: add direction!!
export class MatchedRelationQueryPart implements IQueryPart {
    private _alias:string;

    constructor() {}


    //TODO: create interface ? Identifiable ? Aliased ?
    as(alias:string):MatchedRelationQueryPart {
        return cloned(this, (el:MatchedRelationQueryPart) => el._alias = alias);
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return {
            cypherString: `-[${this._alias ? this._alias : ''}]-`
        }
    }
}