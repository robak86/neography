import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {ReturnEntityQueryPart} from "./ReturnEntityQueryPart";
import {CreateNodeQueryPart} from "../create/CreateNodeQueryPart";
import {MatchNodeQueryPart} from "../match/MatchNodeQueryPart";
import {CreateRelationQueryPart} from "../create/CreateRelationQueryPart";
import {MatchRelationQueryPart} from "../match/MatchRelationQueryPart";

export type ReturnElement =  ReturnEntityQueryPart
    | CreateNodeQueryPart<any>
    | CreateRelationQueryPart<any>
    | MatchNodeQueryPart<any>       //TODO: investigate if it is even needed?
    | MatchRelationQueryPart<any>   //TODO: investigate if it is even needed?
    | string;

export class ReturnQueryPart implements IQueryPart {

    constructor(private elements:ReturnElement[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let returnString = this.elements.map((el:ReturnElement) => {
            if (el instanceof ReturnEntityQueryPart) {
                return el.toCypher(ctx).cypherString
            } else {
                return el;
            }

        }).join(', ');

        return {
            cypherString: `RETURN ${returnString}`
        }
    }
}
