import {Type} from "../../utils/types";
import {RelationshipEntity} from "../../model";
import {RelationMetadata} from "../../metadata/RelationMetadata";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {IRelationMatchQueryPart, RelationDirectionType} from "./IRelationMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {cloned} from "../../utils/core";


export class MatchRelationQueryPart<G extends RelationshipEntity> implements IRelationMatchQueryPart<G>, IQueryPart {
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';

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

    private get relationType():string {
        return RelationMetadata.getOrCreateForClass(this.klass).getType();
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutRelationAlias();
        let paramsId = context.checkoutParamsAlias(alias);
        let cypherParams:string = this._params ?
            ` {${generateMatchAssignments(paramsId, this._params)}}` :
            '';

        return {
            cypherString: `${this.arrowPreSign}[${alias}:${this.relationType}${cypherParams}]${this.arrowPostSign}`,
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