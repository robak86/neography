const neo4j = require('neo4j-driver').v1;
const Integer = neo4j.Integer;

export const int = (val:Integer|number|string|{low:number; high:number}):Integer => neo4j.int(val);
export const isInt = (obj:any):boolean => neo4j.isInt(obj);
export const inSafeRange = (val:Integer|number|string|{low:number; high:number}): boolean => Integer.inSafeRange(val);

export interface Integer {
    inSafeRange():boolean;
    toInt():number;
    toNumber():number;
    toString(radix:number):string;
    getHighBits():number;
    getLowBits():number;
    getNumBitsAbs():number;
    isZero():boolean;
    isNegative():boolean;
    isPositive():boolean;
    isOdd():boolean;
    isEven():boolean;
    equals(other:number):boolean;
    notEquals(other:number):boolean;
    lessThan(other:number):boolean;
    lessThanOrEqual(other:number):boolean;
    greaterThan(other:number):boolean;
    greaterThanOrEqual(other:number):boolean;
    compare(other:number):number;
    negate():number;
    add(addend:number):number;
    subtract(subtrahend:number):number;
    multiply(multiplier:number):number;
    div(divisor:Integer|number|string):Integer;
    modulo(divisor:Integer|number|string):Integer;
    not():Integer;
    and(other:Integer|number|string):Integer;
    or(other:Integer|number|string):Integer;
    xor(other:Integer|number|string):Integer;
    shiftLeft(numBits:number|Integer):Integer;
    shiftRight(numBits:number|Integer):Integer;
}




