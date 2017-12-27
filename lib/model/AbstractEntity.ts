import {isPresent} from "../utils/core";
import {attribute} from "../annotations";
import {AttributesMetadata} from "../metadata/AttributesMetadata";

export abstract class AbstractEntity<T> {
    @attribute() readonly id?:string;

    constructor(params:Partial<T> = {}) {
        if (isPresent((params as any).id)) {
            throw new Error("Params object passed to constructor cannot contain id property!")
        }

        let attributesMetadata = AttributesMetadata.getForInstance(this);
        Object.keys(params).forEach(propertyName => {
            if (!attributesMetadata.isAttributeDefined(propertyName)) {
                console.warn(`${this.constructor.name} will be initialized with unknown param: ${propertyName}`)
            }

            this[propertyName] = params[propertyName as any];
        });
    }

    isPersisted():boolean {
        return isPresent(this.id);
    }
}