import 'reflect-metadata';
import * as _ from 'lodash';
import {getSuperClass, isPresent} from "../utils/core";


export type AttributeAnnotationParams = {
    propertyName:string;
    fromRowMapper:(val:any) => any;
    toRowMapper:(val:any) => any;
    beforeSaveTransform:(val:any, context:'create' | 'update') => any;
};


export class AttributesMetadata {
    private parent:AttributesMetadata;
    private static ATTRIBUTES_METADATA_KEY:string = 'ATTRIBUTES_METADATA';

    static getOrCreateForClass(klass):AttributesMetadata {
        let attributesMetadata = Reflect.getOwnMetadata(AttributesMetadata.ATTRIBUTES_METADATA_KEY, klass);

        if (!attributesMetadata) {
            attributesMetadata = new AttributesMetadata();
            Reflect.defineMetadata(AttributesMetadata.ATTRIBUTES_METADATA_KEY, attributesMetadata, klass);


            let superClass = getSuperClass(klass);
            if (superClass) {
                attributesMetadata.setParent(AttributesMetadata.getOrCreateForClass(superClass));
            }
        }

        return attributesMetadata;
    }

    static getForClass(klass):AttributesMetadata {
        return Reflect.getMetadata(AttributesMetadata.ATTRIBUTES_METADATA_KEY, klass)
    }

    static getForInstance(instance):AttributesMetadata {
        return this.getForClass(instance.constructor);
    }

    private _ownAttributes:{ [attributeName:string]:AttributeAnnotationParams } = {};

    private setParent(parentAttributesMetadata:AttributesMetadata) {
        this.parent = parentAttributesMetadata;
    }

    //TODO: add memoization. Attributes has to be invalidated on own attributes changes and also any parent change
    //The best way to implement it is to add setDirty method, which also recursively calls itself on all parents
    //If isDirty equals true do fresh merge of attributes
    private getAttributes():{ [attributeName:string]:AttributeAnnotationParams } {
        let parentAttributes = this.parent ? this.parent.getAttributes() : {};

        return {
            ...parentAttributes,
            ...this._ownAttributes
        }
    }

    addAttribute(attribute:AttributeAnnotationParams) {
        this._ownAttributes[attribute.propertyName] = attribute;
    }

    getAttributesNames():string[] {
        return _.values(this.getAttributes()).map(attr => attr.propertyName)
    }

    hasAttribute(name:string):boolean {
        return !!this.getAttributes()[name];
    }

    forEachAttribute(iterFn:(attribute:AttributeAnnotationParams, attributeName:string) => void) {
        let propertiesNames = this.getAttributesNames();
        propertiesNames.forEach(prop => {
            let attributeMetadata = this.getAttributeMetadata(prop);
            iterFn(attributeMetadata,prop)
        });
    }

    getAttributeMetadata(attribute:string):AttributeAnnotationParams {
        return this.getAttributes()[attribute];
    }

    isAttributeDefined(propertyName:string) {
        return isPresent(this.getAttributes()[propertyName]);
    }
}