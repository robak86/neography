import {NodeEntity, RelationshipEntity} from "./index";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";
import * as _ from 'lodash';

//TODO: rename to BoundNode | LinkedNode | ??
export type ConnectedNode<R extends RelationshipEntity, TO extends NodeEntity> = { relation:R, node:TO };

export function isConnectedNode<R extends RelationshipEntity, TO extends NodeEntity>(val:any,
                                                                                     relation:Type<R>):val is ConnectedNode<R, TO> {

    return (val.relation instanceof relation && val.node instanceof NodeEntity);
}


export const ConnectedNode = {
    isEqual<R extends RelationshipEntity, TO extends NodeEntity>(c1:ConnectedNode<R, TO>, c2:ConnectedNode<R, TO>):boolean {
        return c1.node.id === c2.node.id && _.isEqual(c1.relation, c2.relation);
    },

    isPersisted<R extends RelationshipEntity, TO extends NodeEntity>(c1:ConnectedNode<R, TO>):boolean {
        return isPresent(c1.node.id);
    }
};