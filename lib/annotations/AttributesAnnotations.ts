import 'reflect-metadata';
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import * as _ from 'lodash';
import neo4j from "neo4j-driver";
import {isPresent} from "../utils/core";

export interface AttributeAnnotationParams {
    toRowMapper?:(val:any) => any;
    fromRowMapper?:(val:any) => any;
    beforeSaveTransform?:(val:any, context:'create' | 'update') => any;
}

//TODO: add dirty tracking - marking class dirty for if value was set
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
        //TODO: extract to interface (ValueTransformer) and create concrete implementation for timestamp decorator
        toRowMapper: (val) => {
            if (_.isDate(val)) {
                return val.getTime()
            } else {
                return null
            }
        },
        fromRowMapper: (val) => {
            if (isPresent(val)) {
                return new Date(neo4j.isInt(val) ? val.toNumber() : val);
            } else {
                return null
            }
        }
    });
}