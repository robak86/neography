import * as _ from 'lodash';
import {GraphEntity} from "../model/GraphEntity";
import {NodeMetadata} from "../metadata/NodeMetadata";
import {AttributesMapper} from "../mappers/AttributesMapper";
import {AbstractNode} from "../model/AbstractNode";
import {isPresent} from "../utils/core";
import {Type} from "../utils/types";
import {attributesMapperFactory} from "../mappers/AttributesMapperFactory";



type NodesTypesRegistryEntry = {klass:Function, metadata:NodeMetadata};

export class NodesTypesRegistry {
    private mapping:{[labels:string]:NodesTypesRegistryEntry} = {};

    registerNode(klass, metadata:NodeMetadata) {
        if (this.mapping[metadata.getId()]) {
            throw new Error(`Given labels set ( ${metadata.getLabels()} ) is already registered`);
        }

        this.mapping[metadata.getId()] = {klass, metadata};
    };

    hasMapper(labels:string[]):boolean {
        let entry:NodesTypesRegistryEntry = this.getRegistryEntry(labels.sort());
        return isPresent(entry);
    }

    getMapper<T extends GraphEntity>(labels:string[]):AttributesMapper<T> {
        let entry:NodesTypesRegistryEntry = this.getRegistryEntry(labels.sort());
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + labels);
        }
        return attributesMapperFactory.getMapper<T>(entry.klass as any)
    }

    getMapperForClass<K extends AbstractNode>(klass:Type<K>):AttributesMapper<K>|null {
        let nodeMetadata = NodeMetadata.getForClass(klass);

        return isPresent(nodeMetadata) ?
            this.getMapper(nodeMetadata.getLabels()) as any :
            null;
    }

    private getRegistryEntry<T extends GraphEntity>(labelOrLabels:string[]):NodesTypesRegistryEntry {
        let labels:string[] = _.isArray(labelOrLabels) ? labelOrLabels : [labelOrLabels];
        let labelsId = labels.join('_');

        return this.mapping[labelsId];
    }
}