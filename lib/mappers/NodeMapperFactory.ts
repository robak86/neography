import {NodesTypesRegistryEntry} from "../annotations/NodeTypesRegistry";
import {AttributesMapper} from "../mappers/AttributesMapper";
import {AbstractNode} from "../model/AbstractNode";
import {isPresent} from "../utils/core";
import {Type} from "../utils/types";
import {Peristable} from "../model/GraphEntity";
import {NodeMetadata} from "../metadata/NodeMetadata";
import {AttributesMapperFactory} from "./AttributesMapperFactory";
import * as _ from 'lodash';


export class NodeMapperFactory {
    constructor(private registeredNodes:{[labels:string]:NodesTypesRegistryEntry},
                private attributesMapperFactory:AttributesMapperFactory){

    }

    hasMapper(labels:string[]):boolean {
        let entry:NodesTypesRegistryEntry = this.getRegistryEntry(labels.sort());
        return isPresent(entry);
    }

    getMapper<T extends Peristable>(labels:string[]):AttributesMapper<T> {
        let entry:NodesTypesRegistryEntry = this.getRegistryEntry(labels.sort());
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + labels);
        }
        return this.attributesMapperFactory.getMapper<T>(entry.klass as any)
    }

    getMapperForClass<K extends AbstractNode>(klass:Type<K>):AttributesMapper<K>|null {
        let nodeMetadata = NodeMetadata.getForClass(klass);

        return isPresent(nodeMetadata) ?
            this.getMapper(nodeMetadata.getLabels()) as any :
            null;
    }

    private getRegistryEntry<T extends Peristable>(labelOrLabels:string[]):NodesTypesRegistryEntry {
        let labels:string[] = _.isArray(labelOrLabels) ? labelOrLabels : [labelOrLabels];
        let labelsId = labels.join('_');

        return this.registeredNodes[labelsId];
    }
}