import {Type} from "../../utils/types";
import {NodeEntity} from "../../model";
import {NodeMetadata} from "../../metadata/NodeMetadata";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {cloned} from "../../utils/core";


export class MatchNodeQueryPart<N extends NodeEntity> implements INodeMatchQueryPart<N>, IQueryPart {
    protected _alias:string;
    protected _params:any;

    constructor(private klass:Type<N>) {}

    as(alias:string):MatchNodeQueryPart<N> {
        return cloned(this, (el:MatchNodeQueryPart<N>) => el._alias = alias);
    }

    params(params:Partial<N> | void):MatchNodeQueryPart<N> {
        return cloned(this, (el:MatchNodeQueryPart<N>) => el._params = params);
    }

    private get nodeLabels():string {
        return NodeMetadata.getOrCreateForClass(this.klass).getLabels().join(':');
    }

    //TODO: toCypher has side effects - find better name or give a try for visitor pattern
    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();

        let paramsId = context.checkoutParamsAlias(alias);
        let cypherParams:string = this._params ?
            ` {${generateMatchAssignments(paramsId, this._params)}}` :
            '';

        const params = this._params ? {[paramsId]: this._params} : {};

        return {
            cypherString: `(${alias}:${this.nodeLabels}${cypherParams})`,
            params
        };
    }
}