import {IQueryPart} from "../abstract/IQueryPart";
import {RelationDirectionType} from "./IRelationMatchQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {MatchableElement, MatchableQueryPart} from "./MatchableQueryPart";
import {MatchBuilderCallback} from "../builders/QueryBuilder";

export class PathQueryPart implements IQueryPart {
    protected _params:any;
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';
    protected _minLength:number | undefined;
    protected _maxLength:number | undefined;

    static build(name:string, ...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):PathQueryPart {
        const matchableQueryPart = MatchableQueryPart.build(...builderOrElements);
        return new PathQueryPart(name, matchableQueryPart);
    }

    constructor(private _name:string, private matchableQueryPart:MatchableQueryPart) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let boundMatchQueryPart = this.matchableQueryPart.toCypher(ctx);

        return {
            params: boundMatchQueryPart.params,
            cypherString: `${this._name} = ${boundMatchQueryPart.cypherString}`
        };
    }
}