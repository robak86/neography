import {AbstractNode, AbstractRelation} from "./index";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";

export type ConnectedNode<R extends AbstractRelation, TO extends AbstractNode> = { relation:R, node:TO };

export function isConnectedNode<R extends AbstractRelation, TO extends AbstractNode>(val:any,
                                                                                     relation:Type<R>):val is ConnectedNode<R, TO> {

    return (val.relation instanceof relation && val.node instanceof AbstractNode);
}


export const ConnectedNode = {
    isEqual<R extends AbstractRelation, TO extends AbstractNode>(c1:ConnectedNode<R, TO>, c2:ConnectedNode<R, TO>):boolean {
        return c1.node.id === c2.node.id && c1.relation.id === c2.relation.id;
    },

    isPersisted<R extends AbstractRelation, TO extends AbstractNode>(c1:ConnectedNode<R, TO>):boolean {
        return isPresent(c1.node.id) && isPresent(c1.relation.id);
    }
};