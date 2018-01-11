import {attribute, nodeEntity, timestamp} from "../../lib/annotations";
import {NodeEntity} from "../../lib/model";


@nodeEntity('DummyGraphNode')
export class DummyGraphNode<P = any> extends NodeEntity<P> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
}