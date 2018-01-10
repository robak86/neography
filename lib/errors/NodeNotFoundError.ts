import {AbstractNode} from "../model";
import {Type} from "../utils/types";
import {NodeMetadata} from "../metadata/NodeMetadata";

export class NodeNotFoundError extends Error {
    constructor(nodeClass:Type<AbstractNode<any>>, id:string) {
        let labels = NodeMetadata.getOrCreateForClass(nodeClass).getLabels().join(':');
        super(`Node :${labels} with id=${id} not found`)

    }
}