import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {cloned} from "../../utils/core";


export class WhereLiteralQueryPart implements IQueryPart {
    protected _params:any;

    constructor(private whereLiteral:string) {}

    params(params:any):WhereLiteralQueryPart {
        return cloned(this, (el:WhereLiteralQueryPart) => el._params = params);
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return {
            cypherString: 'WHERE ' + this.whereLiteral,
            params: this._params
        }
    }
}