import {AttributesMapperFactory} from "./AttributesMapperFactory";
import * as _ from 'lodash';
import {AttributesMapper} from "./AttributesMapper";
import {isPresent} from "../utils/core";
import {Peristable} from "../model/GraphEntity";
import {RelationsTypesRegistryEntry} from "../annotations/RelationsTypesRegistry";
import {RelationMetadata} from "../metadata/RelationMetadata";


export class RelationMapperFactory {
    constructor(private registeredRelations:{[type:string]:RelationsTypesRegistryEntry},
                private attributesMapperFactory:AttributesMapperFactory) {

    }

    //TODO: add inheritance for multiple labels ?!
    createInstance<T>(type:string):T {
        if (!this.registeredRelations[type]) {
            throw new Error(`Cannot build entity instance because class for labels: ${type} is missing`);
        }
        let klass = this.registeredRelations[type].klass as any;

        return new klass();
    }



    // private getRegistryEntry<T extends Peristable>(type:string):RelationsTypesRegistryEntry {
    //     return this.registeredRelations[type];
    // }
}