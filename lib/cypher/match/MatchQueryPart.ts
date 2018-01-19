import {MatchNodeQueryPart} from "./MatchNodeQueryPart";
import {MatchRelationQueryPart} from "./MatchRelationQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {NodeRelationConcatenator} from "../utils/NodeRelationConcatenator";
import {MatchUntypedNodeQueryPart} from "./MatchUntypedNodeQueryPart";
import {MatchUntypedRelationQueryPart} from "./MatchUntypedRelationQueryPart";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";
import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {IRelationMatchQueryPart} from "./IRelationMatchQueryPart";

export type MatchableElement = MatchNodeQueryPart<any>
    | MatchedNodeQueryPart
    | INodeMatchQueryPart<any>
    | IRelationMatchQueryPart<any>;

export class MatchQueryPart implements IQueryPart {


    constructor(private elements:MatchableElement[], private isOptionalMatch:boolean) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypherPart:IBoundQueryPart = {cypherString: '', params: {}};
        let concatenator:NodeRelationConcatenator = new NodeRelationConcatenator();

        this.elements.forEach((el:MatchableElement) => {
            if (el instanceof MatchNodeQueryPart
                || el instanceof MatchUntypedNodeQueryPart
                || el instanceof MatchedNodeQueryPart) {

                let nodeQueryCypherPart = el.toCypher(ctx);
                concatenator.push({cypherString: nodeQueryCypherPart.cypherString, isRelation: false});

                //TODO: check if there is no collisions! Ideally params should be registered in context!!! We could implement this behaviour there
                cypherPart.params = {
                    ...cypherPart.params,
                    ...nodeQueryCypherPart.params
                }
            }

            if (el instanceof MatchRelationQueryPart || el instanceof MatchUntypedRelationQueryPart) {
                let relationQueryCypherPart = el.toCypher(ctx);
                concatenator.push({cypherString: relationQueryCypherPart.cypherString, isRelation: true});

                //TODO: check if there is no collisions! Ideally params should be registered in context!!! We could implement this behaviour there
                cypherPart.params = {
                    ...cypherPart.params,
                    ...relationQueryCypherPart.params
                }
            }
        });

        let matchKeyword = this.isOptionalMatch ? 'OPTIONAL MATCH' : 'MATCH';
        cypherPart.cypherString = `${matchKeyword} ${concatenator.toString()}`;
        return cypherPart;
    }
}