import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";
import {ActiveRelation} from "../../lib/model/ActiveRelation";
import {DummyGraphRelation} from "./DummyGraphRelation";
import {HasAwesomeNodeRelation} from "./HasAwesomeNodeRelation";
import {AwesomeGraphNode} from "./AwesomeGraphNode";


export class DummyGraphNodeRelations {
    readonly otherDummies = new ActiveRelation(DummyGraphRelation, DummyGraphNode);
    readonly awesomeNodes = new ActiveRelation(HasAwesomeNodeRelation, AwesomeGraphNode);
}


// function AbstractNodeWithRelations<P extends AbstractNode, L>(p:Type<P>, l:Type<L>) {
//     return class extends AbstractNode<P, L> {
//         constructor(params:Partial<P> = {}) {
//             super(params);
//             this.relations = new l() //TODO: how to instantiate this class ?
//         }
//     }
// }


@node('DummyGraphNode')
export class DummyGraphNode<P = any> extends AbstractNode<P, DummyGraphNodeRelations> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}

// let a:DummyGraphNode = new DummyGraphNode();
//
// a.eagerLoad(l => [l.awesomeNodes, l.otherDummies]);
// a.relations.awesomeNodes.whereRelation({})