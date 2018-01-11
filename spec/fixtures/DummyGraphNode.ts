import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";
import {ActiveRelation} from "../../lib/model/ActiveRelation";
import {DummyGraphRelation} from "./DummyGraphRelation";
import {HasAwesomeNodeRelation} from "./HasAwesomeNodeRelation";
import {AwesomeGraphNode} from "./AwesomeGraphNode";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";


@node('DummyGraphNode')
export class DummyGraphNode<P = any> extends AbstractNode<P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;

    @relationship(DummyGraphRelation, DummyGraphNode) otherDummies:ActiveRelation<DummyGraphRelation, DummyGraphNode>;
    @relationship(HasAwesomeNodeRelation, AwesomeGraphNode) awesomeNodes:ActiveRelation<HasAwesomeNodeRelation, AwesomeGraphNode>;
}