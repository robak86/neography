import {attribute, node} from "../../lib/annotations";
import {DummyGraphNode} from "./DummyGraphNode";

@node('ChildDummyGraphNode')
export class ChildDummyGraphNode extends DummyGraphNode<ChildDummyGraphNode & DummyGraphNode> {
    @attribute() attr3:string;
}