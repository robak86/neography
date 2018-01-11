import {NodesTypesRegistry} from "./NodeTypesRegistry";
import {NodeMetadata} from "../metadata/NodeMetadata";


export const nodeTypesRegistry = new NodesTypesRegistry();

export const nodeEntity:(label:string) => ClassDecorator = (label:string) => {
    return <TFunction extends Function>(klass:TFunction):TFunction => {
        let nodeMetadata:NodeMetadata = NodeMetadata.getOrCreateForClass(klass as any);
        nodeMetadata.setOwnLabel(label);
        nodeTypesRegistry.registerNode(klass, nodeMetadata);
        return klass;
    };
};