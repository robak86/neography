import * as _ from 'lodash';
import {RelationMetadata} from "../metadata/RelationMetadata";
import {GraphEntity} from "../model/GraphEntity";
import {AttributesMapper} from "../mappers/AttributesMapper";
import {isPresent} from "../utils/core";
import {attributesMapperFactory} from "../mappers/AttributesMapperFactory";




//TODO: merge with nodes types register. This registry's purpose is only fetch AttributesMapper(class is common for nodes and relations as well)
//TODO: ... the only difference are the properties we fetch mappers by (lables vs relation type)
type RelationsTypesRegistryEntry = {klass:Function, metadata:RelationMetadata};

export class RelationsTypesRegistry {
    private mapping:{[labels:string]:RelationsTypesRegistryEntry} = {};

    registerRelation(klass, metadata:RelationMetadata) {
        if (this.mapping[metadata.getId()]) {
            throw new Error(`Given labels set ( ${metadata.getId()} ) is already registered`);
        }

        this.mapping[metadata.getId()] = {klass, metadata};
    };

    //TODO: add inheritance for multiple labels ?!
    createInstance<T>(type:string):T {
        if (!this.mapping[type]) {
            throw new Error(`Cannot build entity instance because class for labels: ${type} is missing`);
        }
        let klass = this.mapping[type].klass as any;

        return new klass();
    }

    hasMapper(type:string):boolean {
        let entry:RelationsTypesRegistryEntry = this.getRegistryEntry(type);
        return isPresent(entry);
    }

    getMapper<T extends GraphEntity>(type:string):AttributesMapper<T> {
        let entry:RelationsTypesRegistryEntry = this.getRegistryEntry(type);
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + type);
        }
        return attributesMapperFactory.getMapper<T>(entry.klass as any)
    }

    getMapperForClass(klass):AttributesMapper<any>|null {
        let relationMetadata = RelationMetadata.getForClass(klass);
        return isPresent(relationMetadata) ? this.getMapper(relationMetadata.getId()) : null;
    }

    private getRegistryEntry<T extends GraphEntity>(type:string):RelationsTypesRegistryEntry {
        return this.mapping[type];
    }
}