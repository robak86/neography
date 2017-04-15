import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";

export class LiteralSetQueryPart implements IQueryPart {
    private _params:any;

    constructor(private setLiteral:string) {

    }

    toCypher(context:QueryContext):IBoundQueryPart {
        return {
            cypherString: this.setLiteral,
            params: this._params
        }
    }
}