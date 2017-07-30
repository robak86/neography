import {NodeMetadata} from "../metadata/NodeMetadata";


export type NodesTypesRegistryEntry = { klass:Function, metadata:NodeMetadata };

export class NodesTypesRegistry {
    private mapping:{ [labels:string]:NodesTypesRegistryEntry } = {};

    registerNode(klass, metadata:NodeMetadata) {
        if (this.mapping[metadata.getId()]) {
            throw new Error(`Given labels set ( ${metadata.getLabels()} ) is already registered`);
        }

        this.mapping[metadata.getId()] = {klass, metadata};
    };

    getEntries():{ [labels:string]:NodesTypesRegistryEntry } {
        return this.mapping;
    }
}