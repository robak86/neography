import {Type} from "../../utils/types";
import {RelationshipEntity} from "../../model";
import {RelationMetadata} from "../../metadata/RelationMetadata";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IRelationMatchQueryPart, RelationDirectionType} from "./IRelationMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {cloned} from "../../utils/core";
import * as _ from 'lodash';

export class MatchRelationQueryPart<G extends RelationshipEntity> implements IRelationMatchQueryPart<G>, IQueryPart {
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';
    protected _minLength:number | undefined;
    protected _maxLength:number | undefined;

    constructor(private klass:Type<G>) {}

    direction(direction:RelationDirectionType):MatchRelationQueryPart<G> {
        return cloned(this, (el:MatchRelationQueryPart<G>) => el._direction = direction);
    }

    params(params:Partial<G> | void):MatchRelationQueryPart<G> {
        return cloned(this, (el:MatchRelationQueryPart<G>) => el._params = params);
    }

    as(alias:string):MatchRelationQueryPart<G> {
        return cloned(this, (el:MatchRelationQueryPart<G>) => el._alias = alias);
    }

    length(minOrExactLength:number, max?:number) {
        return cloned(this, (el:MatchRelationQueryPart<G>) => {
            el._minLength = minOrExactLength;
            el._maxLength = max;
        });
    }

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

        const params = this._params ? {[paramsId]: this._params} : {};

        return {
            cypherString: `${this.arrowPreSign}[${alias}:${this.relationType}${lengthFragment()}${cypherParams}]${this.arrowPostSign}`,
            params
        };
    }

    private get relationType():string {
        return RelationMetadata.getOrCreateForClass(this.klass).getType();
    }

    private get arrowPreSign():string {
        return (this._direction === '<->' || this._direction === '->') ? '-' : '<-';
    }

    private get arrowPostSign():string {
        return (this._direction === '<->' || this._direction === '<-') ? '-' : '->';
    }
}