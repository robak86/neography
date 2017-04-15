import {AbstractNode} from "../../model/AbstractNode";

import {MatchNodeQueryPart} from "../match/MatchNodeQueryPart";
import {AbstractRelation} from "../../model/AbstractRelation";
import {MatchRelationQueryPart} from "../match/MatchRelationQueryPart";
import {MatchUntypedNodeQueryPart} from "../match/MatchUntypedNodeQueryPart";
import {MatchUntypedRelationQueryPart} from "../match/MatchUntypedRelationQueryPart";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";
import {INodeMatchQueryPart} from "../match/INodeMatchQueryPart";
import {IRelationMatchQueryPart} from "../match/IRelationMatchQueryPart";
import {Type} from "../../utils/types";


export class MatchBuilder {

    node<N extends AbstractNode>(klass?:Type<N>):INodeMatchQueryPart<N> {
        if (klass) {
            return new MatchNodeQueryPart<N>(klass);
        } else {
            return new MatchUntypedNodeQueryPart<N>();
        }
    };

    matchedNode(alias:string):MatchedNodeQueryPart {
        return new MatchedNodeQueryPart().as(alias);
    }

    relation<R extends AbstractRelation>(klass?:Type<R>):IRelationMatchQueryPart<R> {
        if (klass) {
            return new MatchRelationQueryPart(klass);
        } else {
            return new MatchUntypedRelationQueryPart<R>();
        }
    };

    //TODO: implement it
    matchedRelation(){
        throw new Error("Implement me")
    }
}