import {NodeEntity, RelationshipEntity} from "../../model";
import {MatchNodeQueryPart} from "../match/MatchNodeQueryPart";
import {MatchRelationQueryPart} from "../match/MatchRelationQueryPart";
import {MatchUntypedNodeQueryPart} from "../match/MatchUntypedNodeQueryPart";
import {MatchUntypedRelationQueryPart} from "../match/MatchUntypedRelationQueryPart";
import {MatchedNodeQueryPart} from "../common/MatchedNodeQueryPart";
import {INodeMatchQueryPart} from "../match/INodeMatchQueryPart";
import {IRelationMatchQueryPart} from "../match/IRelationMatchQueryPart";
import {Type} from "../../utils/types";
import {isPresent} from "../../utils/core";
import * as _ from 'lodash';

export class MatchBuilder {

    node<N extends NodeEntity>(klass:Type<N>):INodeMatchQueryPart<N>
    node<N extends NodeEntity>(klass?):INodeMatchQueryPart<any>
    node<N extends NodeEntity>(klass?):any {
        if (isPresent(klass) && !_.isFunction(klass)){
            throw new Error(`Wrong class ${JSON.stringify(klass)}`);
        }

        if (isPresent(klass)) {
            return new MatchNodeQueryPart<N>(klass as any);
        } else {
            return new MatchUntypedNodeQueryPart<any>() as INodeMatchQueryPart<any>;
        }
    };

    matchedNode(alias:string):MatchedNodeQueryPart {
        return new MatchedNodeQueryPart().as(alias);
    }

    relation<R extends RelationshipEntity>(klass?:Type<R>):IRelationMatchQueryPart<R> {
        if (klass) {
            return new MatchRelationQueryPart(klass);
        } else {
            return new MatchUntypedRelationQueryPart<R>();
        }
    };
}