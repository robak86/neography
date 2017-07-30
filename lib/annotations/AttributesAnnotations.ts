import 'reflect-metadata';
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {int} from "../driver/Integer";
import * as _ from 'lodash';

export interface AttributeAnnotationParams {
    toRowMapper?:(val:any) => any;
    fromRowMapper?:(val:any) => any;
    beforeSaveTransform?:(val:any, context:'create' | 'update') => any;
}

export function attribute({toRowMapper = _.identity, fromRowMapper = _.identity, beforeSaveTransform = _.identity}:AttributeAnnotationParams = {}):PropertyDecorator {
    return (target:Object, propertyKey:string) => {
        let nodeMetadata:AttributesMetadata = AttributesMetadata.getOrCreateForClass(target.constructor);
        nodeMetadata.addAttribute({
            propertyName: propertyKey,
            fromRowMapper,
            toRowMapper,
            beforeSaveTransform
        });
    };
}

export function timestamp():PropertyDecorator {
    return attribute({
        toRowMapper: (val) => int(val),
        fromRowMapper: (val) => val.toNumber(),
        beforeSaveTransform: (val, context:'create' | 'update') => {
            if (context === 'create') {
                return new Date().getTime();
            } else {
                return val;
            }
        }
    });
}