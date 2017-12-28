import {node} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";
import {attribute, timestamp} from "../../lib/annotations";


@node('DummyGraphNode')
export class DummyGraphNode<P = undefined> extends AbstractNode<DummyGraphNode & P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}