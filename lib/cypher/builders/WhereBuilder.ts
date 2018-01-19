import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";
import {AttributeNotNullQueryPart, WhereAttributeBuilder, WhereAttributeQueryPart} from "./WhereAttributeBuilder";
import {MatchBuilderCallback} from "./QueryBuilder";
import {cloned} from "../../utils/core";


export type WhereStatementPart = WhereLiteralQueryPart | WhereAttributeQueryPart | AttributeNotNullQueryPart;


export class WhereBuilder<T = any> {
    private _alias:string;

    literal(queryPart:string):WhereLiteralQueryPart {
        return new WhereLiteralQueryPart(queryPart)
    }

    attribute<K extends keyof T>(prop:K):WhereAttributeBuilder<T[K]> {
        return new WhereAttributeBuilder(prop, this._alias);
    }

    //TODO: investigate matching for queries like WHERE NOT (n)-[:SOME_REL]-(b)
    path(m:MatchBuilderCallback){}

    aliased(alias:string):WhereBuilder<T>{
        return cloned(this, w => w._alias = alias);
    }
}