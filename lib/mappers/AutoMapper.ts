
import {relationsTypesRegistry} from "../annotations/RelationAnnotations";
import {nodeTypesRegistry} from "../annotations/NodeAnnotations";


export class AutoMapper {
    constructor(private records:any[]){}

    toMappedArray():any[]{
        return this.records.map(record => {
            let row = {};


            record.forEach((recordField, id) => {
                if (recordField && recordField.labels && nodeTypesRegistry.hasMapper(recordField.labels)){
                    row[id] = nodeTypesRegistry.getMapper(recordField.labels).mapToInstance(recordField);
                    return;
                }

                if (recordField && recordField.type && relationsTypesRegistry.hasMapper(recordField.type)){
                    row[id] = relationsTypesRegistry.getMapper(recordField.type).mapToInstance(recordField);
                    return;
                }

                row[id] = recordField;
            });

            return row;
        })
    }
}