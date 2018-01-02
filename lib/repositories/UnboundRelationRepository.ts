import {AbstractNode, AbstractRelation} from "../model";
import {NodeInstanceRepository} from "./NodeInstanceRepository";
import {Type} from "../utils/types";
import {Connection} from "../";
import {BoundTypedRelationRepository} from "./BoundTypedRelationRepository";


export class UnboundRelationRepository<R extends AbstractRelation> {
    constructor(private relationClass:Type<R>,
                private connection:Connection) {

    }

    node<FROM extends AbstractNode>(node:FROM):NodeInstanceRepository<FROM, R> {
        return new NodeInstanceRepository(this.relationClass, node, this.connection);
    }

    nodes<FROM extends AbstractNode, TO extends AbstractNode>(nodeFrom:FROM, nodeTo:TO):BoundTypedRelationRepository<FROM, R, TO> {
        return new BoundTypedRelationRepository(nodeFrom, this.relationClass, nodeTo, this.connection);
    }

    /* TODO: implement following methods
        nodeType<FROM extends AbstractNode>(from:Type<FROM>) {}
        nodesTypes<FROM extends AbstractNode, TO extends AbstractNode>(from:Type<FROM>, to:Type<TO>) {}
        count():{}
        where():{}
        removeBy():{}
     */
}