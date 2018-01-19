import * as _ from 'lodash';
import {Maybe, Type} from "./types";


//TODO: SIMPLIFY and optimize
export function isPresent<T>(val:T | void | null | undefined):val is T {
    return (typeof val !== 'undefined') && (val !== null) && (!_.isNumber(val) || !isNaN(val))
}

export function someOrThrow<T>(fn:(() => Maybe<T>) | Maybe<T>, errorMsg:string):T | never {
    let val:T = (_.isFunction(fn) ? fn() : fn) as any;
    if (!isPresent(val)) {
        throw new Error(errorMsg)
    } else {
        return val;
    }
}

export function invariant(condition:boolean, message:string) {
    if (!condition) {
        throw new Error(message);
    }
}

export function getSuperClass(klass) {
    let superClass = Object.getPrototypeOf(klass);
    return superClass.name ? superClass : null;
}

export function getClassFromInstance<T>(instance:T):Type<T> {
    return instance.constructor as any;
}

export function cloned<T>(source:T, updateFn:(cloned:T) => void):T {
    let cloned = _.cloneDeep(source);
    updateFn(cloned);
    return cloned;
}
