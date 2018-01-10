import {attribute, node} from "../../lib/annotations";
import {AbstractNode} from "../../lib/model";

@node('AwesomeNode')
export class AwesomeGraphNode extends AbstractNode<AwesomeGraphNode> {
    @attribute() attr10?:string;
    @attribute() attr20?:number;
}