import {AttributesMapper} from "./AttributesMapper";
import {Type} from "../utils/types";
import {NodesTypesRegistryEntry} from "../annotations/NodeTypesRegistry";
import {isPresent} from "../utils/core";
import {AbstractNode, GraphEntity} from "../model";
import {NodeMetadata} from "../metadata/NodeMetadata";
import {RelationsTypesRegistryEntry} from "../annotations/RelationsTypesRegistry";
import {RelationMetadata} from "../metadata/RelationMetadata";
import * as _ from 'lodash';
import {StripUnknownDataForWrite} from "./write/StripUnknownDataForWrite";
import {EntityIdExtension} from "./write/EntityIdExtension";
import {WriteInlineMappersRunner} from "./write/WriteInlineMappersRunner";
import {ReadInlineMappersRunner} from "./read/ReadInlineMappersRunner";
import {IExtension} from "../extensions/IExtension";


export class AttributesMapperFactory {

    constructor(private registeredNodes:{ [labels:string]:NodesTypesRegistryEntry },
                private registeredRelations:{ [type:string]:RelationsTypesRegistryEntry },
                private genId:() => string,
                private extensions:IExtension[]) {
    }

    getMapper<T extends GraphEntity>(klass:Type<T>):AttributesMapper<T> {
        //TODO: should be cached
        let forWrites = [
            new StripUnknownDataForWrite(),
            new EntityIdExtension(this.genId),
            ...this.extensions.map(ext => ext.getWriteTransformer()),
            new WriteInlineMappersRunner()
        ];

        //TODO: should be cached
        let forReads = [
            ...this.extensions.map(ext => ext.getReadTransformer()),
            new ReadInlineMappersRunner()
        ];

        return new AttributesMapper(klass, forWrites, forReads);
    }

    hasNodeMapper(labels:string[]):boolean {
        let entry:NodesTypesRegistryEntry = this.getNodeRegistryEntry(labels.sort());
        return isPresent(entry);
    }

    getNodeAttributesMapper<T extends GraphEntity>(labels:string[]):AttributesMapper<T> {
        let entry:NodesTypesRegistryEntry = this.getNodeRegistryEntry(labels.sort());
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + labels);
        }
        return this.getMapper<T>(entry.klass as any)
    }

    getNodeMapperForClass<K extends AbstractNode>(klass:Type<K>):AttributesMapper<K> | null {
        let nodeMetadata = NodeMetadata.getForClass(klass);

        return isPresent(nodeMetadata) ?
            this.getNodeAttributesMapper(nodeMetadata.getLabels()) as any :
            null;
    }

    hasRelationMapper(type:string):boolean {
        let entry:RelationsTypesRegistryEntry = this.registeredRelations[type];
        return isPresent(entry);
    }

    getRelationAttributesMapper<T extends GraphEntity>(type:string):AttributesMapper<T> {
        let entry:RelationsTypesRegistryEntry = this.registeredRelations[type];
        if (_.isUndefined(entry)) {
            throw new Error("Missing metadata for " + type);
        }
        return this.getMapper<T>(entry.klass as any)
    }

    getRelationMapperForClass(klass):AttributesMapper<any> | null {
        let relationMetadata = RelationMetadata.getForClass(klass);
        return isPresent(relationMetadata) ? this.getRelationAttributesMapper(relationMetadata.getId()) : null;
    }

    private getNodeRegistryEntry<T extends GraphEntity>(labelOrLabels:string[]):NodesTypesRegistryEntry {
        let labels:string[] = _.isArray(labelOrLabels) ? labelOrLabels : [labelOrLabels];
        let labelsId = labels.join('_');

        return this.registeredNodes[labelsId];
    }
}
