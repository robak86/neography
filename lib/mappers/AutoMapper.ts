import {AttributesMapperFactory} from "./AttributesMapperFactory";
import Record from "neo4j-driver/types/v1/record";
import {Node, Relationship} from "neo4j-driver/types/v1/graph-types";
import {isNode, isRelationship} from "../driver/NeoTypes";


export class AutoMapper {
    constructor(private attributesMapperFactory:AttributesMapperFactory) {}

    toMappedArray(records:Record[]):any[] {
        return records.map((record:Record) => {
            let row = {};

            record.forEach((recordField:Node|Relationship, id) => {
                if (isNode(recordField) && this.attributesMapperFactory.hasNodeMapper(recordField.labels)) {
                    row[id] = this.attributesMapperFactory.getNodeAttributesMapper(recordField.labels).mapToInstance(recordField);
                    return;
                }

                if (isRelationship(recordField) && this.attributesMapperFactory.hasRelationMapper(recordField.type)) {
                    row[id] = this.attributesMapperFactory.getRelationAttributesMapper(recordField.type).mapToInstance(recordField);
                    return;
                }

                row[id] = recordField;
            });

            return row;
        })
    }
}