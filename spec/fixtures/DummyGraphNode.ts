import {attribute, nodeEntity, timestamp} from "../../lib/annotations";
import {NodeEntity, Relationship} from "../../lib/model";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";
import {DummyGraphRelation} from "./DummyGraphRelation";


@nodeEntity('DummyGraphNode')
export class DummyGraphNode<P = any> extends NodeEntity<P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;

    @relationship(DummyGraphRelation, DummyGraphNode)
    childDummies:Relationship<DummyGraphRelation, DummyGraphNode>
}