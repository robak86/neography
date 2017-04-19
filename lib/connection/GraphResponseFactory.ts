import {GraphResponse} from "./GraphResponse";
import {RelationMapperFactory} from "../mappers/RelationMapperFactory";
import {NodeMapperFactory} from "../mappers/NodeMapperFactory";
import {AttributesMapperFactory} from "../mappers/AttributesMapperFactory";

export class GraphResponseFactory {

    constructor(public attributesMapperFactory:AttributesMapperFactory) {}

    build(response:Promise<any>):GraphResponse {
        return GraphResponse.initWithAutoMapper(response, this.attributesMapperFactory);
    }
}