import {attribute, node, timestamp} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";


@node('DummyGraphNode')
export class DummyGraphNode<P = any> extends AbstractNode<P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}