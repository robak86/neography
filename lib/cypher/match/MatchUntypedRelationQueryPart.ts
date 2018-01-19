import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IRelationMatchQueryPart, RelationDirectionType} from "./IRelationMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {RelationshipEntity} from "../../model";
import {cloned} from "../../utils/core";


export class MatchUntypedRelationQueryPart<R extends RelationshipEntity> implements IRelationMatchQueryPart<R>, IQueryPart {
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';

    constructor() {}

    direction(direction:RelationDirectionType):MatchUntypedRelationQueryPart<R> {
        return cloned(this, (el:MatchUntypedRelationQueryPart<R>) => el._direction = direction);
    }

    params(params:Partial<R>|void):MatchUntypedRelationQueryPart<R> {
        return cloned(this, (el:MatchUntypedRelationQueryPart<R>) => el._params = params);
    }

    as(alias:string):MatchUntypedRelationQueryPart<R> {
        return cloned(this, (el:MatchUntypedRelationQueryPart<R>) => el._alias = alias);
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutRelationAlias();

        let paramsId = context.checkoutParamsAlias(alias);
        let cypherParams:string = this._params ?
            ` {${generateMatchAssignments(paramsId, this._params)}}` :
            '';

        return {
            cypherString: `${this.arrowPreSign}[${alias} ${cypherParams}]${this.arrowPostSign}`,
            params: {[paramsId]: this._params}
        };
    }

    private get arrowPreSign():string {
        return (this._direction === '<->' || this._direction === '->') ? '-' : '<-';
    }

    private get arrowPostSign():string {
        return (this._direction === '<->' || this._direction === '<-') ? '-' : '->';
    }
}