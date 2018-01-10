import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";

@node('DummyCar')
export class DummyCarNode extends AbstractNode<DummyCarNode> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() name:string;
    @attribute() horsePower:number;
}