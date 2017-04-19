import {AttributesMapperFactory} from "./AttributesMapperFactory";

export class AutoMapper {
    constructor(private attributesMapperFactory:AttributesMapperFactory) {

    }

    toMappedArray(records:any[]):any[] {
        return records.map(record => {
            let row = {};

            record.forEach((recordField, id) => {
                if (recordField && recordField.labels && this.attributesMapperFactory.hasNodeMapper(recordField.labels)) {
                    row[id] = this.attributesMapperFactory.getNodeMapper(recordField.labels).mapToInstance(recordField);
                    return;
                }

                if (recordField && recordField.type && this.attributesMapperFactory.hasRelationMapper(recordField.type)) {
                    row[id] = this.attributesMapperFactory.getRelationMapper(recordField.type).mapToInstance(recordField);
                    return;
                }

                row[id] = recordField;
            });

            return row;
        })
    }
}