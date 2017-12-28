import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";
import {isPresent} from "../utils/core";
import {GraphEntity} from "../model";
import {ExtensionsRowMapper} from "./ExtensionsRowMapper";
import {TransformContext} from "../extensions/IRowTransformer";


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
            let propertiesNames = this.attributesMetadata.getAttributesNames();
            propertiesNames.forEach(prop => {
                let attributeMetadata = this.attributesMetadata.getAttributeMetadata(prop);
                if (isPresent(record.properties[prop])) {
                    instance[prop] = attributeMetadata.fromRowMapper(record.properties[prop]);
                }
            });
        }

        return instance as T;
    }

    mapToRow(nodeInstance, type:TransformContext) {
        let row:any = {};

        if (this.hasAnyAttributes) {
            let propertiesNames = this.attributesMetadata.getAttributesNames();
            propertiesNames.forEach(prop => {
                let attributeMetadata = this.attributesMetadata.getAttributeMetadata(prop);
                if (isPresent(nodeInstance[prop])) {
                    row[prop] = attributeMetadata.toRowMapper(nodeInstance[prop]);
                }
            });
        }

        row = this.extensionsRowMapper.mapToRow(row, type);

        return row;
    }
}