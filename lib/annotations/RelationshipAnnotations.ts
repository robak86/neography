import {AbstractNode, RelationshipEntity} from "../model";
import {Type} from "../utils/types";
import {Relationship} from "../model/Relationship";
import {invariant} from "../utils/core";
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import * as _ from 'lodash';

export function relationshipThunk<R extends RelationshipEntity, N extends AbstractNode>(relThunk: () => Type<R>,
                                                                                        nodeClassThunk:() => Type<N>,
                                                                                        modifier: (rel:Relationship<R,N>) => Relationship<R,N> = _.identity):PropertyDecorator {
    return (classPrototype:Object, propertyKey:string) => {
        invariant(AbstractNode.isPrototypeOf(classPrototype.constructor),
            `Class ${classPrototype.constructor.name} has to inherit from AbstractNode in order to use @relationship() decorator`);

        invariant(nodeClassThunk() !== classPrototype.constructor,
            `Self referencing relationships are not supported. Class ${classPrototype.constructor.name} cannot have relationship [${propertyKey}] to itself!`
        );

        let attributesMetadata:AttributesMetadata = AttributesMetadata.getOrCreateForClass(classPrototype.constructor);
        attributesMetadata.addRelationship(propertyKey);

        // don't use fat arrow function- because we lose this context
        let getter = function (this:AbstractNode) {
            let self = this;

            return (<any>this)._relationsCache[propertyKey]
                || ((<any>this)._relationsCache[propertyKey] = modifier(new Relationship(relThunk(), nodeClassThunk()).bindToNode(() => self)));
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



export function relationship<R extends RelationshipEntity, N extends AbstractNode>(relClass:Type<R>,
                                                                                   nodeClass:Type<N>,
                                                                                   modifier: (rel:Relationship<R,N>) => Relationship<R,N> = _.identity):PropertyDecorator {
    return (classPrototype:Object, propertyKey:string) => {
        invariant(AbstractNode.isPrototypeOf(classPrototype.constructor),
            `Class ${classPrototype.constructor.name} has to inherit from AbstractNode in order to use @relationship() decorator`);

        invariant(nodeClass !== classPrototype.constructor,
            `Self referencing relationships are not supported. Class ${classPrototype.constructor.name} cannot have relationship [${propertyKey}] to itself!`
        );

        let attributesMetadata:AttributesMetadata = AttributesMetadata.getOrCreateForClass(classPrototype.constructor);
        attributesMetadata.addRelationship(propertyKey);

        // don't use fat arrow function- because we lose this context
        let getter = function (this:AbstractNode) {
            let self = this;

            return (<any>this)._relationsCache[propertyKey]
                || ((<any>this)._relationsCache[propertyKey] = modifier(new Relationship(relClass, nodeClass).bindToNode(() => self)));
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