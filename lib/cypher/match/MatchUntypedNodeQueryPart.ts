
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {cloned} from "../../utils/core";


export class MatchUntypedNodeQueryPart<N> implements INodeMatchQueryPart<N>{
    protected _alias:string;
    protected _params:any;

    constructor() {
    }

    as(alias:string):MatchUntypedNodeQueryPart<N> {
        return cloned(this, (el:MatchUntypedNodeQueryPart<N>) => el._alias = alias);
    }

    params(params:any):MatchUntypedNodeQueryPart<N> {
        return cloned(this, (el:MatchUntypedNodeQueryPart<N>) => el._params = params);
    }

    //TODO: toCypher has side ffects - find better name or give a try for visitor pattern
    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        let paramsId = context.checkoutParamsAlias(alias);
        let cypherParams:string = this._params ?
            ` {${generateMatchAssignments(paramsId, this._params)}}` :
            '';

        let cypherString = `(${alias} ${cypherParams})`;

        return {
            cypherString,
            params: {[paramsId]: this._params}
        };
    }
}