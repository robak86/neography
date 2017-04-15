import {AbstractRelation} from "../../model/AbstractRelation";
import {RelationMetadata} from "../../metadata/RelationMetadata";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {generateMatchAssignments} from "../utils/QueryHelpers";
import {RelationDirectionType} from "./IRelationMatchQueryPart";




//TODO: implement me!
export class MultitypeMatchRelationQueryPart{
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';

    // constructor(private klasses:AbstractRelation[]) {}
    //
    // direction(direction:RelationDirectionType):MultitypeMatchRelationQueryPart {
    //     return cloned(this, (el:MultitypeMatchRelationQueryPart) => el._direction = direction);
    // }
    //
    // params(params:void):MultitypeMatchRelationQueryPart {
    //     return cloned(this, (el:MultitypeMatchRelationQueryPart) => el._params = params);
    // }
    //
    // as(alias:string):MultitypeMatchRelationQueryPart {
    //     return cloned(this, (el:MultitypeMatchRelationQueryPart) => el._alias = alias);
    // }
    //
    // private get relationType():string {
    //     return RelationMetadata.getOrCreateForClass(this.klass).getType();
    // }
    //
    // toCypher(context:QueryContext):IBoundQueryPart {
    //     let alias = this._alias || context.checkoutRelationAlias();
    //     context.registerRelationClass(alias, this.klass);
    //     let paramsId = context.checkoutParamsAlias(alias);
    //     let cypherParams:string = this._params ?
    //         ` {${generateMatchAssignments(paramsId, this._params)}}` :
    //         '';
    //
    //     return {
    //         cypherString: `${this.arrowPreSign}[${alias}:${this.relationType}${cypherParams}]${this.arrowPostSign}`,
    //         params: {[paramsId]: this._params}
    //     };
    // }
    //
    // private get arrowPreSign():string {
    //     return (this._direction === '<->' || this._direction === '->') ? '-' : '<-';
    // }
    //
    // private get arrowPostSign():string {
    //     return (this._direction === '<->' || this._direction === '<-') ? '-' : '->';
    // }
}