import {AbstractNode, AbstractRelation} from "../model";
import {Type} from "../utils/types";
import {ActiveRelation} from "../model/ActiveRelation";
import {invariant} from "../utils/core";
import {AttributesMetadata} from "../metadata/AttributesMetadata";


export function relationshipThunk<R extends AbstractRelation, N extends AbstractNode>(relThunk: () => Type<R>, nodeClassThunk:() => Type<N>):PropertyDecorator {
    return (classPrototype:Object, propertyKey:string) => {
        invariant(AbstractNode.isPrototypeOf(classPrototype.constructor),
            `Class ${classPrototype.constructor.name} has to inherit from AbstractNode in order to use @relationship() decorator`);

        let attributesMetadata:AttributesMetadata = AttributesMetadata.getOrCreateForClass(classPrototype.constructor);
        attributesMetadata.addRelationship(propertyKey);

        // don't use fat arrow function- because we lose this context
        let getter = function (this:AbstractNode) {
            let self = this;

            return (<any>this)._relationsCache[propertyKey]
                || ((<any>this)._relationsCache[propertyKey] = new ActiveRelation(relThunk(), nodeClassThunk()).bindToNode(() => self));
        };

        // don't use fat arrow function - because we lose this context
        let setter = function () {
            throw new Error(`${propertyKey} is readonly property`)
        };

        Object.defineProperty(classPrototype, propertyKey, {
            get: getter,
            set: setter
        });
    };
}



export function relationship<R extends AbstractRelation, N extends AbstractNode>(relClass:Type<R>, nodeClass:Type<N>):PropertyDecorator {
    return (classPrototype:Object, propertyKey:string) => {
        invariant(AbstractNode.isPrototypeOf(classPrototype.constructor),
            `Class ${classPrototype.constructor.name} has to inherit from AbstractNode in order to use @relationship() decorator`);

        let attributesMetadata:AttributesMetadata = AttributesMetadata.getOrCreateForClass(classPrototype.constructor);
        attributesMetadata.addRelationship(propertyKey);

        // don't use fat arrow function- because we lose this context
        let getter = function (this:AbstractNode) {
            let self = this;

            return (<any>this)._relationsCache[propertyKey]
                || ((<any>this)._relationsCache[propertyKey] = new ActiveRelation(relClass, nodeClass).bindToNode(() => self));
        };

        // don't use fat arrow function - because we lose this context
        let setter = function () {
            throw new Error(`${propertyKey} is readonly property`)
        };

        Object.defineProperty(classPrototype, propertyKey, {
            get: getter,
            set: setter
        });
    };
}