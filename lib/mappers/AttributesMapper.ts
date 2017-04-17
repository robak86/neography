import {GraphEntity, Persisted} from "../model/GraphEntity";
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";
import * as _ from 'lodash';


export type MappingContext = 'create' | 'update';

export interface TransformersRegistry {
    [context:string]:((obj) => any)[]
}

export class AttributesMapper<T extends GraphEntity> {

    constructor(private klass:Type<T>, private transformers:TransformersRegistry) {}

    private get attributesMetadata():AttributesMetadata {
        return AttributesMetadata.getForClass(this.klass);
    }

    mapToInstance(record):Persisted<T> {
        if (!isPresent(record)) {
            return record;
        }

        let instance = new this.klass();
        let propertiesNames = this.attributesMetadata.getAttributesNames();

        propertiesNames.forEach(prop => {
            let fromRowMapper = this.attributesMetadata.getAttributeMetadata(prop);
            if (isPresent(record.properties[prop])) {
                instance[prop] = fromRowMapper.fromRowMapper(record.properties[prop]);
            }
        });

        return instance as Persisted<T>;
    }

    mapToRow(nodeInstance, type:'create' | 'update' | 'skip') {
        let propertiesTransformers = _.get(this.transformers, [type], []);
        let propertiesNames = this.attributesMetadata.getAttributesNames();
        let row:any = {};


        propertiesNames.forEach(prop => {
            let attributeMetadata = this.attributesMetadata.getAttributeMetadata(prop);
            if (isPresent(nodeInstance[prop])) {
                row[prop] = attributeMetadata.toRowMapper(nodeInstance[prop]);
            }
        });

        row = propertiesTransformers.reduce((prev, currentTransform) => {
            return currentTransform(prev);
        }, row);

        return row;
    }
}