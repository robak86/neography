import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";

export class OrderStatementPart implements IQueryPart {
    constructor(private direction, private property, private alias:string) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return {
            cypherString: `${this.alias}.${this.property} ${this.direction.toUpperCase()}`
        }
    }
}