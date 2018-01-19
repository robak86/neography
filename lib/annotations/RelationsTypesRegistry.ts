
import {RelationMetadata} from "../metadata/RelationMetadata";


//TODO: merge with nodes types register. This registry's purpose is only fetch AttributesMapper(class is common for nodes and relations as well)
//TODO: ... the only difference are the properties we fetch mappers by (lables vs relationshipEntity type)
export type RelationsTypesRegistryEntry = {klass:Function, metadata:RelationMetadata};

export class RelationsTypesRegistry {
    private mapping:{[labels:string]:RelationsTypesRegistryEntry} = {};

    registerRelation(klass, metadata:RelationMetadata) {
        if (this.mapping[metadata.getId()]) {
            throw new Error(`Given labels set ( ${metadata.getId()} ) is already registered`);
        }

        this.mapping[metadata.getId()] = {klass, metadata};
    };

    getEntries():{[labels:string]:RelationsTypesRegistryEntry} {
        return this.mapping;
    }
}