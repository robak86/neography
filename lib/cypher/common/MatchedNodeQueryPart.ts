import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "./QueryContext";
import {cloned} from "../../utils/core";


export class MatchedNodeQueryPart implements IQueryPart {
    private _alias: string;

    constructor() {}

    as(alias:string):MatchedNodeQueryPart {
        return cloned(this, (el:MatchedNodeQueryPart) => el._alias = alias);
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return {
            cypherString: `(${this._alias ? this._alias : ''})`
        };
    }
}