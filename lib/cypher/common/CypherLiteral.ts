import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {cloned} from "../../utils/core";

export class CypherLiteral implements IQueryPart {
    private _params;

    constructor(private cypherString:string) {}

    params(params:any):CypherLiteral {
        return cloned(this, (el:CypherLiteral) => el._params = params);
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return {
            cypherString: this.cypherString,
            params: this._params
        };
    }
}