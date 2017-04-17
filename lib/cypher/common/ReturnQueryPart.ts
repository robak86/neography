import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";

export type ReturnElement =  string;

export class ReturnQueryPart implements IQueryPart {

    constructor(private elements:ReturnElement[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let returnString = this.elements.join(', ');

        return {
            cypherString: `RETURN ${returnString}`
        }
    }
}
