import {CreateNodeQueryPart} from "../create/CreateNodeQueryPart";
import {AbstractNode, RelationshipEntity} from "../../model";
import {CreateRelationQueryPart} from "../create/CreateRelationQueryPart";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";


export class CreateBuilder {
    matchedNode(alias:string):MatchedNodeQueryPart {
        return new MatchedNodeQueryPart().as(alias);
    }

    node<N extends AbstractNode>(node:N) {
        return new CreateNodeQueryPart(node);
    }

    relation<R extends RelationshipEntity>(relation:R) {
        return new CreateRelationQueryPart(relation).direction('->');
    }
}