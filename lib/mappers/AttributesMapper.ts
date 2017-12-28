import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";
import {GraphEntity} from "../model";
import {ExtensionsRowMapper} from "./ExtensionsRowMapper";
import {TransformContext} from "../extensions/IRowTransformer";
import * as _ from 'lodash';

export class AttributesMapper<T extends GraphEntity> {

    constructor(private klass:Type<T>,
                private extensionsRowMapper:ExtensionsRowMapper) {}

    private get attributesMetadata():AttributesMetadata {
        return AttributesMetadata.getForClass(this.klass);
    }

    private get hasAnyAttributes():boolean {
        return !!this.attributesMetadata;
    }

    mapToInstance(record):T {
        if (!isPresent(record)) {
            return record;
        }

        let instance = new this.klass();

        if (this.hasAnyAttributes) {
            this.attributesMetadata.forEachAttribute((attributeMetadata, prop) => {
                if (isPresent(record.properties[prop])) {
                    instance[prop] = attributeMetadata.fromRowMapper(record.properties[prop]);
                }
            });
        }

        return instance as T;
    }

    mapToRow(nodeInstance, type:TransformContext) {
        let row = {};

        if (this.hasAnyAttributes) {
            _.forOwn(nodeInstance, (value, propName) => {
                if (this.attributesMetadata.hasAttribute(propName)) { //rewrite only known attributes
                    row[propName] = value;
                }
            });
        }

        row = this.extensionsRowMapper.mapToRow(row, type);

        if (this.hasAnyAttributes) {
            this.attributesMetadata.forEachAttribute((attributeMetadata, prop) => {
                if (isPresent(row[prop])) {
                    row[prop] = attributeMetadata.toRowMapper(row[prop]);
                }
            });
        }

        return row;
    }
}