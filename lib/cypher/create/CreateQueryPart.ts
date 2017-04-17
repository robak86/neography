import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {CreateNodeQueryPart} from "./CreateNodeQueryPart";
import {CreateRelationQueryPart} from "./CreateRelationQueryPart";
import {NodeRelationConcatenator} from "../utils/NodeRelationConcatenator";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";


export type PersistableElement =CreateNodeQueryPart<any>
    | CreateRelationQueryPart<any>
    | MatchedNodeQueryPart;


export class CreateQueryPart implements IQueryPart {

    constructor(private elements:PersistableElement[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypherPart:IBoundQueryPart = {cypherString: '', params: {}};
        let concatenator:NodeRelationConcatenator = new NodeRelationConcatenator();

        this.elements.forEach((el:PersistableElement) => {
            if (el instanceof CreateNodeQueryPart) {
                let nodeQueryCypherPart = el.toCypher(ctx);
                concatenator.push({cypherString: nodeQueryCypherPart.cypherString, isRelation: false});

                cypherPart.params = {
                    ...cypherPart.params,
                    ...nodeQueryCypherPart.params
                }
            }

            if (el instanceof CreateRelationQueryPart) {
                let relationQueryCypherPart = el.toCypher(ctx);
                concatenator.push({cypherString: relationQueryCypherPart.cypherString, isRelation: true});

                cypherPart.params = {
                    ...cypherPart.params,
                    ...relationQueryCypherPart.params
                }
            }

            if (el instanceof MatchedNodeQueryPart) {
                let matchedNodeQueryPart = el.toCypher(ctx);
                concatenator.push({cypherString: matchedNodeQueryPart.cypherString, isRelation: false});
            }
        });

        cypherPart.cypherString = 'CREATE ' + concatenator.toString();
        return cypherPart;
    }
}