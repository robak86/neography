import {NodeEntity} from "../model";
import {Type} from "../utils/types";
import {NodeMetadata} from "../metadata/NodeMetadata";

export class NodeNotFoundError extends Error {
    constructor(nodeClass:Type<NodeEntity<any>>, id?:string) {
        let labels = NodeMetadata.getOrCreateForClass(nodeClass).getLabels().join(':');
        let message = `Node :${labels}`;
        if (id){
            message += ' with id=${id} not found'
        }
        super(message)

    }
}