import {attribute, node} from "../../lib/annotations";
import {NodeEntity} from "../../lib/model";

@node('AwesomeNode')
export class AwesomeGraphNode extends NodeEntity<AwesomeGraphNode> {
    @attribute() attr10?:string;
    @attribute() attr20?:number;
}