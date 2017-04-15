import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Type} from "../utils/types";


export type PropertiesOf<T> = {[P in keyof T]: T[P]};

export function createFactoryMethod<T>(klass:Type<T>):(params?:PropertiesOf<T>) => T {
    let attributesMetadata = AttributesMetadata.getOrCreateForClass(klass);
    // someOrThrow(attributesMetadata, 'Creating factory method for non graph class. @node')

    return (params:PropertiesOf<T> = {} as any) => {
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