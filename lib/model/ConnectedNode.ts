import {AbstractNode, AbstractRelation} from "./index";
import {Type} from "../utils/types";

export type ConnectedNode<R extends AbstractRelation, TO extends AbstractNode> = { relation:R, node:TO };

export function isConnectedNode<R extends AbstractRelation, TO extends AbstractNode>(val:any,
                                                                                     relation:Type<R>,
                                                                                     toClass:Type<TO>):val is ConnectedNode<R, TO> {

    return (val.relation instanceof relation && val.node instanceof toClass);
}