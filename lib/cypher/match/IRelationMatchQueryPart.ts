import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {AbstractRelation} from "../../model";

export type RelationDirectionType = '->' | '<-' | '<->';

export interface IRelationMatchQueryPart<R extends AbstractRelation> extends INodeMatchQueryPart<R> {
    direction(direction:RelationDirectionType):IRelationMatchQueryPart<R>
}