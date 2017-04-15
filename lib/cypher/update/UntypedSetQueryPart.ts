import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {invariant, isPresent} from "../../utils/core";


const SET_OPERATORS = {
    replace: '=',
    update: '+='
};

export class UntypedSetQueryPart implements IQueryPart {
    constructor(private _params:any, private _alias, private mode:'update' | 'replace') {}

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        let paramsId = context.checkoutParamsAlias(alias);

        let operator = SET_OPERATORS[this.mode];
        invariant(isPresent(operator), `Unknown mode ${this.mode}`);

        return {
            cypherString: `${this._alias} ${operator} {${paramsId}}`,
            params: {
                [paramsId]: this._params
            }
        }
    }
}