import {CreateNodeQueryPart} from "../create/CreateNodeQueryPart";
import {NodeEntity, RelationshipEntity} from "../../model";
import {CreateRelationQueryPart} from "../create/CreateRelationQueryPart";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";


export class CreateBuilder {
    matchedNode(alias:string):MatchedNodeQueryPart {
        return new MatchedNodeQueryPart().as(alias);
    }

    node<N extends NodeEntity>(node:N) {
        return new CreateNodeQueryPart(node);
    }

    relation<R extends RelationshipEntity>(relation:R) {
        return new CreateRelationQueryPart(relation).direction('->');
    }
}