import {AutoMapper} from "../mappers/AutoMapper";
import * as _ from 'lodash';

export class GraphResponse {
    static initWithAutoMapper(response:Promise<any>):GraphResponse {
        return new GraphResponse(response.then(result => new AutoMapper(result.records).toMappedArray()));
    }

    private constructor(private rows:Promise<any[]>) {}

    select(properties:string | string[]):GraphResponse {
        let rowsWithPickedProperties = this.rows.then(rows => rows.map(row => _.pick(row, _.castArray(properties))));
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

    toAsyncArray():Promise<any[]> {
        return this.rows;
    }
}