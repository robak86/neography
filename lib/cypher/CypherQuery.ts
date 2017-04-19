import * as _ from 'lodash';
import {MatchQueryPart} from "./match/MatchQueryPart";
import {IBoundQueryPart} from "./abstract/IBoundQueryPart";
import {QueryContext} from "./common/QueryContext";
import {CreateQueryPart} from "./create/CreateQueryPart";
import {ReturnQueryPart} from "./common/ReturnQueryPart";
import {SetQueryPart} from "./update/SetQueryPart";
import {WhereLiteralQueryPart} from "./match/WhereLiteralQueryPart";
import {CypherLiteral} from "./common/CypherLiteral";
import {NodeMapperFactory} from "../mappers/NodeMapperFactory";
import {RelationMapperFactory} from "../mappers/RelationMapperFactory";
import {AttributesMapperFactory} from "../mappers/AttributesMapperFactory";

export type CypherQueryElement = MatchQueryPart
    | CreateQueryPart
    | ReturnQueryPart
    | SetQueryPart
    | WhereLiteralQueryPart
    | CypherLiteral
    | string;


export interface BoundCypherQuery {
    context:QueryContext;
    boundQuery:IBoundQueryPart;
}

export class CypherQuery {

    constructor(private elements:CypherQueryElement[],
                private attributesMapperFactory:AttributesMapperFactory) {

    }


    //TODO: return other type {boundQueryPart: ... , context: ctx} -> todo find better names for context, toCypher and consider using visitor pattern!
    toCypher():BoundCypherQuery {
        let out:IBoundQueryPart = {cypherString: '', params: {}};
        let ctx = new QueryContext(this.attributesMapperFactory);

        this.elements.forEach((element:CypherQueryElement) => {
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