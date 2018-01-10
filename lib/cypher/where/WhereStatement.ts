import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {WhereStatementPart} from "../builders/WhereBuilder";
import * as _ from 'lodash';

export class WhereStatement implements IQueryPart {

    constructor(private parts:WhereStatementPart[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let params = {};
        let cypherFragments:string[] = [];

        this.parts.forEach(part => {
            let c = part.toCypher(ctx);
            _.extend(params, c.params);
            cypherFragments.push(c.cypherString);
        });

        return {
            cypherString: `WHERE ${cypherFragments.join( 'AND' )}`,
            params
        }
    }
}