import {attribute, nodeEntity} from "../../lib/annotations";
import {DummyGraphNode} from "./DummyGraphNode";

@nodeEntity('ChildDummyGraphNode')
export class ChildDummyGraphNode extends DummyGraphNode<ChildDummyGraphNode> {
    @attribute() attr3:string;
}