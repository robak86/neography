import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {WhereBuilder, WhereStatementPart} from "../builders/WhereBuilder";
import * as _ from 'lodash';
import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";
import {WhereBuilderCallback} from "../builders/QueryBuilder";


export class WhereStatement implements IQueryPart {

    static build(literal:string | WhereBuilderCallback<any>):WhereStatement {
        const whereElement:WhereStatementPart[] | WhereStatementPart = _.isFunction(literal) ?
            literal(new WhereBuilder()) :
            new WhereLiteralQueryPart(literal);

        return new WhereStatement(_.castArray(whereElement) as any);
    }

    constructor(private parts:WhereStatementPart[]) {}

    mergeWithAnd(otherWhereStatement:WhereStatement):WhereStatement {
        return new WhereStatement(this.parts.concat(otherWhereStatement.parts));
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let params = {};
        let cypherFragments:string[] = [];

        this.parts.forEach(part => {
            let c = part.toCypher(ctx);
            _.merge(params, c.params);
            cypherFragments.push(c.cypherString);
        });

        return {
            cypherString: `WHERE ${cypherFragments.join(' AND ')}`,
            params
        }
    }
}