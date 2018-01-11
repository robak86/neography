import {attribute, node, timestamp} from "../../lib/annotations";
import {NodeEntity} from "../../lib/model";


@node('DummyGraphNode')
export class DummyGraphNode<P = any> extends NodeEntity<P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}