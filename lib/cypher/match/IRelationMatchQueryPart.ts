import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {RelationshipEntity} from "../../model";

export type RelationDirectionType = '->' | '<-' | '<->';

export interface IRelationMatchQueryPart<R extends RelationshipEntity> extends INodeMatchQueryPart<R> {
    direction(direction:RelationDirectionType):IRelationMatchQueryPart<R>
    params(params:Partial<R>):IRelationMatchQueryPart<R>
    as(alias:string):IRelationMatchQueryPart<R>
}