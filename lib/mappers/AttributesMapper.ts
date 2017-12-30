import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";
import {GraphElement} from "../model";
import {IReadTransformer, TransformContext} from "./ITransformer";
import * as _ from 'lodash';
import {Node, Relationship} from "neo4j-driver/types/v1/graph-types";
import {IWriteTransformer} from "./ITransformer";


export class AttributesMapper<T extends GraphElement> {

    constructor(private klass:Type<T>,
                private writeTransformers:IWriteTransformer[],
                private readTransformers:IReadTransformer[]) {}

    private get attributesMetadata():AttributesMetadata {
        return AttributesMetadata.getForClass(this.klass);
    }

    mapToInstance(record:Node | Relationship):T {
        if (!isPresent(record)) {
            return record;
        }

        let attributesMetadata = this.attributesMetadata;
        let properties = this.readTransformers.reduce((prevVal, transformer) => {
            return transformer.transformInstance(prevVal, attributesMetadata)
        }, record.properties);

        return _.extend(new this.klass(), properties);
    }

    mapToRow(nodeInstance, type:TransformContext) {
        let attributesMetadata = this.attributesMetadata;

        return this.writeTransformers.reduce((prevVal, transformer) => {
            return transformer.transformRow(prevVal, type, attributesMetadata)
        }, nodeInstance);
    }
}