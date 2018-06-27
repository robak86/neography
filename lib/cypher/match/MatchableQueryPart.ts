import {INodeMatchQueryPart} from "./INodeMatchQueryPart";
import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";
import {MatchNodeQueryPart} from "./MatchNodeQueryPart";
import {MatchUntypedNodeQueryPart} from "./MatchUntypedNodeQueryPart";
import {NodeRelationConcatenator} from "../utils/NodeRelationConcatenator";
import {IRelationMatchQueryPart} from "./IRelationMatchQueryPart";
import {MatchRelationQueryPart} from "./MatchRelationQueryPart";
import {MatchUntypedRelationQueryPart} from "./MatchUntypedRelationQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {MatchBuilderCallback} from "../builders/QueryBuilder";
import {MatchBuilder} from "../builders/MatchBuilder";
import * as _ from 'lodash';
import {PathQueryPart} from "./PathQueryPart";
import {invariant} from "../../utils/core";

export type MatchableElement = MatchNodeQueryPart<any>
    | PathQueryPart
    | MatchableQueryPart
    | INodeMatchQueryPart<any>
    | IRelationMatchQueryPart<any>;


export class MatchableQueryPart implements IQueryPart {

    static build(...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):MatchableQueryPart {
        let matchableElements:MatchableElement[] = [];

        builderOrElements.forEach((el) => {
            if (_.isFunction(el)) {
                matchableElements = matchableElements.concat(el(new MatchBuilder()));
            } else {
                matchableElements.push(el as any);
            }
        });

        return new MatchableQueryPart(matchableElements);
    }

    constructor(private elements:MatchableElement[]) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypherPart:IBoundQueryPart = {cypherString: '', params: {}};
        let concatenator:NodeRelationConcatenator = new NodeRelationConcatenator();

        this.elements.forEach((el:MatchableElement) => {
            if (el instanceof MatchNodeQueryPart
                || el instanceof MatchUntypedNodeQueryPart
                || el instanceof MatchedNodeQueryPart
                || el instanceof PathQueryPart) {

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

            invariant(true, `unknown element ${el}`)
        });

        cypherPart.cypherString = concatenator.toString();
        return cypherPart;
    }
}