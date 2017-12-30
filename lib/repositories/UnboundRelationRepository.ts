import {AbstractNode, AbstractRelation} from "../model";
import {FromNodeRelationsRepository} from "./FromNodeRelationsRepository";
import {Type} from "../utils/types";
import {Connection} from "../";


export class UnboundRelationRepository<R extends AbstractRelation> {
    constructor(private relationClass:Type<R>,
                private connection:Connection) {

    }

    from<FROM extends AbstractNode>(node:FROM):FromNodeRelationsRepository<FROM, R> {
        return new FromNodeRelationsRepository(this.relationClass, node, this.connection);
    }

    // fromType<FROM extends AbstractNode>(nodeType:Type<FROM>) {}
    //
    // toType<FROM extends AbstractNode>(nodeType:Type<FROM>) {}
    //
    // count():{}
    // findBy():{}
    // removeBy():{}
}