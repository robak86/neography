import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";
import {ActiveRelation} from "../../lib/model/ActiveRelation";
import {HasVehicleRelation} from "./HasVehicleRelation";
import {DummyCarNode} from "./DummyCarNode";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";




@node('DummyUser')
export class DummyUserNode extends AbstractNode<DummyUserNode> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() email:string;
    @attribute() firstName:string;
    @attribute() experience:number;

    @relationship(HasVehicleRelation,DummyCarNode)
    vehicles:ActiveRelation<HasVehicleRelation,DummyCarNode>;
}


//TODO: consider dsl

//
// export class DummyUserRelations2 {
//     readonly vehicles = new ActiveRelation(HasVehicleRelation, DummyCarNode);
// }
//
// let relations;
//
// @node('DummyUser')
// export class DummyUserNode2 extends AbstractNode<DummyUserNode> {
//     @timestamp() createdAt?:Date;
//     @timestamp() updatedAt?:Date;
//
//     @attribute() email:string;
//     @attribute() firstName:string;
//     @attribute() experience:number;
//
//     relationsDefinition = DummyUserRelations;
//
//     //but this won't give us
//     relations = relations({
//         vehicles: new ActiveRelation(HasVehicleRelation, DummyCarNode)
//     })
// }
