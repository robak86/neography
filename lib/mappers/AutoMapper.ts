import {AttributesMapperFactory} from "./AttributesMapperFactory";
import Record from "neo4j-driver/types/v1/record";
import {Node, Relationship} from "neo4j-driver/types/v1/graph-types";
import {isNode, isRelationship} from "../driver/NeoTypes";
import * as _ from 'lodash';
import {convertToNumber, isInt} from "../driver/Integer";


export class AutoMapper {
    constructor(private attributesMapperFactory:AttributesMapperFactory) {}

    toMappedArray(records:Record[]):any[] {
        return records.map((record:Record) => {
            let row = {};

            record.forEach((recordField:Node | Relationship, id) => {
                row[id] = this.mapRecord(recordField);
            });

            return row;
        })
    }

    private mapRecord(recordField:Node | Relationship) {
        if (_.isArray(recordField)){
            return recordField.map(el => this.mapRecord(el))
        }

        if (isNode(recordField) && this.attributesMapperFactory.hasNodeMapper(recordField.labels)) {
            return this.attributesMapperFactory.getNodeAttributesMapper(recordField.labels).mapToInstance(recordField);
        }

        if (isRelationship(recordField) && this.attributesMapperFactory.hasRelationMapper(recordField.type)) {
            return this.attributesMapperFactory.getRelationAttributesMapper(recordField.type).mapToInstance(recordField);
        }

        if (isInt(recordField)){
            return convertToNumber(recordField)
        }

        return recordField;
    }


}