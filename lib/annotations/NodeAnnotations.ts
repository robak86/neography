import {NodesTypesRegistry} from "./NodeTypesRegistry";
import {Type} from "../utils/types";
import {NodeMetadata} from "../metadata/NodeMetadata";
import {AbstractNode} from "../model/AbstractNode";


export const nodeTypesRegistry = new NodesTypesRegistry();

export const node:(label:string) => ClassDecorator = (label:string) => {
    return <T_FUNCTION extends Type<AbstractNode>>(klass:T_FUNCTION):T_FUNCTION => {
        let nodeMetadata:NodeMetadata = NodeMetadata.getOrCreateForClass(klass);
        nodeMetadata.setOwnLabel(label);
        nodeTypesRegistry.registerNode(klass, nodeMetadata);
        return klass;
    };
};