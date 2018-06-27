import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {MatchBuilderCallback} from "../builders/QueryBuilder";
import {MatchableElement, MatchableQueryPart} from "./MatchableQueryPart";
import {PathQueryPart} from "./PathQueryPart";

export type MatchQueryPartChild =
    | PathQueryPart
    | MatchableQueryPart;

export class MatchQueryPart implements IQueryPart {
    static build(isOptional:boolean, ...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):MatchQueryPart {
        const matchableQueryPart = MatchableQueryPart.build(...builderOrElements);


        return new MatchQueryPart(matchableQueryPart, isOptional);
    }

    constructor(private matchableQueryParts:MatchQueryPartChild,
                private isOptionalMatch:boolean) {
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        const cypherPart = this.matchableQueryParts.toCypher(ctx);
        let matchKeyword = this.isOptionalMatch ? 'OPTIONAL MATCH' : 'MATCH';
        cypherPart.cypherString = `${matchKeyword} ${cypherPart.cypherString}`;
        return cypherPart;
    }
}