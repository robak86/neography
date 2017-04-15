import {node} from "../../lib/annotations/NodeAnnotations";
import {AbstractNode} from "../../lib/model/AbstractNode";
import {createFactoryMethod} from "../../lib/model/createFactoryMethod";
import {attribute} from "../../lib/annotations/AttributesAnnotations";


@node('DummyGraphNode')
export class DummyGraphNode extends AbstractNode {
    static build = createFactoryMethod(DummyGraphNode);

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}




