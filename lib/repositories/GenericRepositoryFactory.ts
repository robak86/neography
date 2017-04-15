import {BaseRepository} from "./BaseRepository";
import {NodeRepository} from "./NodeRepository";

import {RelationsRepository} from "./RelationsRepository";
import {Connection} from "../connection/Connection";
import {AbstractNode} from "../model/AbstractNode";
import {AbstractRelation} from "../model/AbstractRelation";
import {Type} from "../utils/types";


export class GenericRepositoryFactory extends BaseRepository {

    constructor(public connection:Connection) {
        super(connection);
    }

    forNode<T extends AbstractNode>(klass:Type<T>):NodeRepository<T> {
        return new NodeRepository(klass, this.connection);
    }

    forRelation<FROM extends AbstractNode,R extends AbstractRelation,TO extends AbstractNode>(fromClass:Type<FROM>, relClass:Type<R>, toClass:Type<TO>):RelationsRepository<FROM,R,TO> {
        return new RelationsRepository(fromClass, relClass, toClass, this.connection);
    }
}