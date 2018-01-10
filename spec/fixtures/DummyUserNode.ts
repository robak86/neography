import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";

@node('DummyUser')
export class DummyUserNode extends AbstractNode<DummyUserNode> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() email:string;
    @attribute() firstName:string;
    @attribute() experience:number;
}