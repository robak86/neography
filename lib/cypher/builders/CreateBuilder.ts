import {CreateNodeQueryPart} from "../create/CreateNodeQueryPart";
import {AbstractNode} from "../../model/AbstractNode";
import {CreateRelationQueryPart} from "../create/CreateRelationQueryPart";
import {AbstractRelation} from "../../model/AbstractRelation";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";



export class CreateBuilder {
    matchedNode(alias:string):MatchedNodeQueryPart {
        return new MatchedNodeQueryPart().as(alias);
    }

    node<N extends AbstractNode>(node:N) {
        return new CreateNodeQueryPart(node);
    }

    relation<R extends AbstractRelation>(relation:R) {
        return new CreateRelationQueryPart(relation).direction('->');
    }
}