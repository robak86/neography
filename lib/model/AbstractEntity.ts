import {isPresent} from "../utils/core";
import {AttributesMetadata} from "../metadata/AttributesMetadata";

export abstract class AbstractEntity<T> {
    constructor(params:Partial<T> = {}) {
        if (isPresent((params as any).id)) {
            throw new Error("Params object passed to constructor cannot contain id property!")
        }

        let attributesMetadata = AttributesMetadata.getForInstance(this);
        Object.keys(params).forEach(propertyName => {
            if (!attributesMetadata.isAttributeDefined(propertyName)) {
                console.warn(`${this.constructor.name} is initialized with unknown property: ${propertyName}. This property will be omitted.`)
            } else {
                this[propertyName] = params[propertyName as any];
            }
        });
    }

}