import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {OrderStatementPart} from "./OrderStatementPart";
import {OrderBuilder} from "../builders/OrderBuilder";
import {OrderBuilderCallback} from "../builders/QueryBuilder";
import * as _ from 'lodash';

export class OrderStatement implements IQueryPart {

    static build(literal:OrderBuilderCallback<any>):OrderStatement {
        let whereElement:OrderStatementPart[] | OrderStatementPart = literal(new OrderBuilder());
        return new OrderStatement(_.castArray(whereElement));
    }

    constructor(private parts:OrderStatementPart[]) {}

    mergeWith(otherOrderStatement:OrderStatement):OrderStatement {
        return new OrderStatement(this.parts.concat(otherOrderStatement.parts));
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let params = {};
        let cypherFragments:string[] = [];

        this.parts.forEach(part => {
            let c = part.toCypher(ctx);
            // _.extend(params, c.params);
            cypherFragments.push(c.cypherString);
        });

        return {
            cypherString: `ORDER BY ${cypherFragments.join(' , ')}`
        }
    }
}