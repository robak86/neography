import {node} from "../../lib/annotations/NodeAnnotations";
import {DummyGraphNode} from "./DummyGraphNode";
import {createFactoryMethod} from "../../lib/model/createFactoryMethod";
import {attribute} from "../../lib/annotations/AttributesAnnotations";


@node('ChildDummyGraphNode')
export class ChildDummyGraphNode extends DummyGraphNode {
    static build = createFactoryMethod(ChildDummyGraphNode);


    @attribute() attr3:string;
}