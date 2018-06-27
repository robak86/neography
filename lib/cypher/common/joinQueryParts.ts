import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";

export function joinQueryParts(separator:string, parts:IQueryPart[], ctx:QueryContext):IBoundQueryPart {
    let cypherStringParts:string[] = [];
    let params = {};

    parts.forEach((el:IQueryPart) => {
        const bound = el.toCypher(ctx);

        cypherStringParts.push(bound.cypherString);
        params = {...params, ...bound.params};
    });

    return {
        cypherString: cypherStringParts.join(separator),
        params
    }
}
