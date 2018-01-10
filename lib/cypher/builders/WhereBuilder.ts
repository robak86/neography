import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";
import {WhereAttributeBuilder, WhereAttributeQueryPart} from "./WhereAttributeBuilder";
import {MatchBuilderCallback} from "./QueryBuilder";


export type WhereStatementPart = WhereLiteralQueryPart | WhereAttributeQueryPart;


export class WhereBuilder<T = any> {
    literal(queryPart:string):WhereLiteralQueryPart {
        return new WhereLiteralQueryPart(queryPart)
    }

    attribute<K extends keyof T>(prop:K):WhereAttributeBuilder<T[K]> {
        return new WhereAttributeBuilder(prop);
    }

    //TODO: investigate matching for queries like WHERE NOT (n)-[:SOME_REL]-(b)
    path(m:MatchBuilderCallback){}
}