import {attribute, nodeEntity, timestamp} from "../../lib/annotations";
import {NodeEntity} from "../../lib/model";





@nodeEntity('DummyCar')
export class DummyCarNode extends NodeEntity<DummyCarNode> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() name:string;
    @attribute() horsePower:number;
}