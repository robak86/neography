import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IRelationMatchQueryPart, RelationDirectionType} from "./IRelationMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {RelationshipEntity} from "../../model";
import {cloned} from "../../utils/core";
import * as _ from 'lodash';


export class MatchUntypedRelationQueryPart<R extends RelationshipEntity> implements IRelationMatchQueryPart<R>, IQueryPart {
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';
    protected _minLength:number | undefined;
    protected _maxLength:number | undefined;

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

    length(minOrExactLength:number, max?:number) {
        return cloned(this, (el:MatchUntypedRelationQueryPart<R>) => {
            el._minLength = minOrExactLength;
            el._maxLength = max;
        });
    }

    // TODO: toCypher is almost identical to MatchRelationQueryPart's toCypher
    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutRelationAlias();

        let paramsId = context.checkoutParamsAlias(alias);
        let cypherParams:string = this._params ?
            ` {${generateMatchAssignments(paramsId, this._params)}}` :
            '';

        const lengthFragment = () => {
            const lengthToString = (l:number | undefined):string => l === Infinity ? '' : l!.toString();


            if (_.isUndefined(this._minLength) && _.isUndefined(this._maxLength)) {
                return '';
            }

            if (!_.isUndefined(this._minLength) && _.isUndefined(this._maxLength)) {
                return `*${lengthToString(this._minLength)}`
            }

            return `*${lengthToString(this._minLength)}..${lengthToString(this._maxLength)}`
        };


        return {
            cypherString: `${this.arrowPreSign}[${alias}${lengthFragment()} ${cypherParams}]${this.arrowPostSign}`,
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