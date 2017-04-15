import {AutoMapper} from "../mappers/AutoMapper";


//TODO: I'm not sure if we need this wrapper.
//Instead we could accept third parameter in execQuery(query:string, params?:any, wrapper)
export class GraphResponse {
    constructor(private queryPromise:Promise<any>) {}

    toArray():Promise<any[]> {
        return this.queryPromise.then(result => new AutoMapper(result.records).toMappedArray());
    }
}