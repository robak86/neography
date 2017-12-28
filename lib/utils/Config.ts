import {ILogger} from "./ILogger";
import * as _ from "lodash";
import {genId} from "./uuid";
import {MutedLogger} from "./MutedLogger";

export type NeographyConfigParams = {
    host:string;
    username:string;
    password:string;
    uidGenerator?:() => string;
    objectTransform?:((obj:any) => any)[];
    sessionsPoolSize?:number;
    logger?:ILogger;
}

export class Config {
    host:string;
    username:string;
    password:string;
    uidGenerator:() => string;
    objectTransform:((obj:any) => any)[];
    sessionsPoolSize:number;
    logger:ILogger;

    constructor(private params:NeographyConfigParams) {
        _.merge(this, {
            objectTransform: [],
            uidGenerator: genId,
            poolSize: 10,
            logger: new MutedLogger()
        }, params);
    }
}