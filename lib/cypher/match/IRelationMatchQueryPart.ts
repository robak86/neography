import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {AbstractRelation} from "../../model";

export type RelationDirectionType = '->' | '<-' | '<->';

export interface IRelationMatchQueryPart<R extends AbstractRelation> extends INodeMatchQueryPart<R> {
    direction(direction:RelationDirectionType):IRelationMatchQueryPart<R>
    params(params:Partial<R>):IRelationMatchQueryPart<R>
    as(alias:string):IRelationMatchQueryPart<R>
}