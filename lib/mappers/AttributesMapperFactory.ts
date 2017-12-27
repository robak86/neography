import {AttributesMapper, MappingContext, TransformersRegistry} from "./AttributesMapper";
import {Type} from "../utils/types";
import {NodesTypesRegistryEntry} from "../annotations/NodeTypesRegistry";
import {isPresent} from "../utils/core";
import {AbstractNode, GraphEntity} from "../model";
import {NodeMetadata} from "../metadata/NodeMetadata";
import {RelationsTypesRegistryEntry} from "../annotations/RelationsTypesRegistry";
import {RelationMetadata} from "../metadata/RelationMetadata";
import * as _ from 'lodash';

export class AttributesMapperFactory {

    constructor(private registeredNodes:{ [labels:string]:NodesTypesRegistryEntry },
                private registeredRelations:{ [type:string]:RelationsTypesRegistryEntry },
                private _transformers:TransformersRegistry = {}) {
    }

    getMapper<T extends GraphEntity>(klass:Type<T>):AttributesMapper<T> {
        return new AttributesMapper(klass, this._transformers);
    }

    hasNodeMapper(labels:string[]):boolean {
        let entry:NodesTypesRegistryEntry = this.getNodeRegistryEntry(labels.sort());
        return isPresent(entry);
    }

    getNodeMapper<T extends GraphEntity>(labels:string[]):AttributesMapper<T> {
        let entry:NodesTypesRegistryEntry = this.getNodeRegistryEntry(labels.sort());
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + labels);
        }
        return this.getMapper<T>(entry.klass as any)
    }

    getNodeMapperForClass<K extends AbstractNode>(klass:Type<K>):AttributesMapper<K> | null {
        let nodeMetadata = NodeMetadata.getForClass(klass);

        return isPresent(nodeMetadata) ?
            this.getNodeMapper(nodeMetadata.getLabels()) as any :
            null;
    }

    hasRelationMapper(type:string):boolean {
        let entry:RelationsTypesRegistryEntry = this.registeredRelations[type];
        return isPresent(entry);
    }

    getRelationMapper<T extends GraphEntity>(type:string):AttributesMapper<T> {
        let entry:RelationsTypesRegistryEntry = this.registeredRelations[type];
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + type);
        }
        return this.getMapper<T>(entry.klass as any)
    }

    getRelationMapperForClass(klass):AttributesMapper<any> | null {
        let relationMetadata = RelationMetadata.getForClass(klass);
        return isPresent(relationMetadata) ? this.getRelationMapper(relationMetadata.getId()) : null;
    }

    addTransformFunction(context:MappingContext, transformer:(obj:any) => any) {
        let transformers = this._transformers[context] || (this._transformers[context] = []);
        transformers.push(transformer);
    }

    private getNodeRegistryEntry<T extends GraphEntity>(labelOrLabels:string[]):NodesTypesRegistryEntry {
        let labels:string[] = _.isArray(labelOrLabels) ? labelOrLabels : [labelOrLabels];
        let labelsId = labels.join('_');

        return this.registeredNodes[labelsId];
    }
}
