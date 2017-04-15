import * as _ from 'lodash';
import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {TypedSetQueryPart} from "./TypedSetQueryPart";
import {UntypedSetQueryPart} from "./UntypedSetQueryPart";
import {LiteralSetQueryPart} from "./LiteralSetQueryPart";


export type SetQueryPartChildren = TypedSetQueryPart<any> | UntypedSetQueryPart | LiteralSetQueryPart | string;


export class SetQueryPart implements IQueryPart {

    constructor(private elements:SetQueryPartChildren[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypherPart:IBoundQueryPart = {cypherString: 'SET ', params: {}};

        this.elements.forEach((el:SetQueryPartChildren, idx:number) => {
            if (idx > 0) {
                cypherPart.cypherString += ', ';
            }

            if (_.isString(el)) {
                cypherPart.cypherString += el;
            } else {
                let boundCypherQuery = el.toCypher(ctx);
                cypherPart.cypherString += boundCypherQuery.cypherString;
                cypherPart.params = _.merge(cypherPart.params, boundCypherQuery.params);
            }
        });


        return cypherPart;
    }
}