import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";

export class CompositeQueryPart implements IQueryPart {
    constructor(private elements:IQueryPart[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        return this.elements.reduce((agg:IBoundQueryPart, el:IQueryPart) => {
            const bound = el.toCypher(ctx);

            return {
                cypherString: agg.cypherString + bound.cypherString,
                params: {
                    ...agg.params,
                    ...bound.params
                }
            }

        }, {cypherString: '', params: {}})
    }

}