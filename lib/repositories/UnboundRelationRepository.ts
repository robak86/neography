import {AbstractNode, AbstractRelation} from "../model";
import {FromNodeRelationsRepository} from "./FromNodeRelationsRepository";
import {Type} from "../utils/types";
import {Connection} from "../";
import {BoundTypedRelationRepository} from "./BoundTypedRelationRepository";


export class UnboundRelationRepository<R extends AbstractRelation> {
    constructor(private relationClass:Type<R>,
                private connection:Connection) {

    }

    forNode<FROM extends AbstractNode>(node:FROM):FromNodeRelationsRepository<FROM, R> {
        return new FromNodeRelationsRepository(this.relationClass, node, this.connection);
    }

    forNodes<FROM extends AbstractNode, TO extends AbstractNode>(nodeFrom:FROM, nodeTo:TO):BoundTypedRelationRepository<FROM, R, TO> {
        return new BoundTypedRelationRepository(nodeFrom, this.relationClass, nodeTo, this.connection);
    }


    // fromType<FROM extends AbstractNode>(nodeType:Type<FROM>) {}
    //
    // toType<FROM extends AbstractNode>(nodeType:Type<FROM>) {}
    //
    // count():{}
    // findBy():{}
    // removeBy():{}
}