import {getLogger} from "../utils/logger";
import neo4j from "neo4j-driver";
import Integer from "neo4j-driver/types/v1/integer";


export const int = (val:any):Integer => neo4j.int(val);
export const isInt = (obj:any):boolean => neo4j.isInt(obj);
export const inSafeRange = (val:any):boolean => neo4j.integer.inSafeRange(val);

export const convertToNumber = (val):number => {
    if (isInt(val) && !inSafeRange(val)) {
        getLogger().warn('Cannot convert to number. Returning native Integer type');
    }

    return isInt(val) && inSafeRange(val) ?
        val.toNumber() :
        val;
};