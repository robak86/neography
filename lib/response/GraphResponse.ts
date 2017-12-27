import {AutoMapper} from "../mappers/AutoMapper";
import * as _ from 'lodash';
import {AttributesMapperFactory} from "../mappers/AttributesMapperFactory";
import {StatementResult} from "neo4j-driver/types/v1";

export class GraphResponse {
    static initWithAutoMapper(response:Promise<StatementResult>,
                              attributesMapperFactory:AttributesMapperFactory):GraphResponse {
        return new GraphResponse(response.then(result => new AutoMapper(attributesMapperFactory).toMappedArray(result.records)));
    }

    private constructor(private rows:Promise<any[]>) {}

    pickOne(prop:string):GraphResponse {
        let rowsWithPickedProperties = this.rows.then(rows => rows.map(row => row[prop]));
        return new GraphResponse(rowsWithPickedProperties);
    }

    map(fn:(rows) => any):GraphResponse {
        let mapped = this.rows.then(rows => rows.map(fn));
        return new GraphResponse(mapped);
    }

    first():Promise<any> {
        return this.rows.then(rows => rows[0]);
    }

    last():Promise<any> {
        return this.rows.then(rows => _.last(rows));
    }

    toArray():Promise<any[]> {
        return this.rows;
    }
}