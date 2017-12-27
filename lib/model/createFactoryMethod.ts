import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";
import {GraphEntity} from "./GraphEntity";


export function createFactoryMethod<T extends GraphEntity>(klass:Type<T>):(params?:Partial<T>) => T {
    let attributesMetadata = AttributesMetadata.getOrCreateForClass(klass);
    // someOrThrow(attributesMetadata, 'Creating factory method for non graph class. @node')

    return (params:Partial<T> = {} as any) => {
        let instance = new klass();
        Object.keys(params).forEach(propertyName => {
            if (!attributesMetadata.isAttributeDefined(propertyName)) {
                console.warn(`${klass.name} will be initialized with unknown param: ${propertyName}`)
            }

            instance[propertyName] = params[propertyName as any];
        });
        return instance;
    };
}