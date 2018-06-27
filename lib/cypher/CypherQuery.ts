import * as _ from 'lodash';
import {MatchQueryPart} from "./match/MatchQueryPart";
import {IBoundQueryPart} from "./abstract/IBoundQueryPart";
import {QueryContext} from "./common/QueryContext";
import {CreateQueryPart} from "./create/CreateQueryPart";
import {ReturnQueryPart} from "./common/ReturnQueryPart";
import {SetQueryPart} from "./update/SetQueryPart";
import {CypherLiteral} from "./common/CypherLiteral";
import {AttributesMapperFactory} from "../mappers/AttributesMapperFactory";
import {WhereStatement} from "./where/WhereStatement";
import {OrderStatement} from "./order/OrderStatement";
import {IQueryPart} from "./abstract/IQueryPart";

//TODO: rename to CypherQueryStatement
export type CypherQueryElement = MatchQueryPart
    | CreateQueryPart
    | ReturnQueryPart
    | SetQueryPart
    | WhereStatement
    | OrderStatement
    | CypherLiteral
    | string;


export interface BoundCypherQuery {
    context:QueryContext;
    boundQuery:IBoundQueryPart;
}

export class CypherQuery {

    constructor(private elements:IQueryPart[],
                private attributesMapperFactory:AttributesMapperFactory) {

    }


    //TODO: return other type {boundQueryPart: ... , context: ctx} -> todo find better names for context, toCypher and consider using visitor pattern!
    toCypher():BoundCypherQuery {
        let out:IBoundQueryPart = {cypherString: '', params: {}};
        let ctx = new QueryContext(this.attributesMapperFactory);

        this.elements.forEach((element:IQueryPart) => {
            if (_.isString(element)) {
                out.cypherString += (' ' + element + ' ');
            } else {
                let elementCypherPart = element.toCypher(ctx);
                out.cypherString += ` ${elementCypherPart.cypherString} `;
                out.params = {
                    ...out.params,
                    ...elementCypherPart.params
                }
            }
        });

        return {
            context: ctx,
            boundQuery: out
        }
    }
}