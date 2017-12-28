import {ILogger} from "./ILogger";

export class MutedLogger implements ILogger {
    info(message?:any, ...optionalParams:any[]):void {}

    logQuery(message?:any, ...optionalParams:any[]):void {}

    log(message?:any, ...optionalParams:any[]):void {}

    warn(message?:any, ...optionalParams:any[]):void {}

    error(message?:any, ...optionalParams:any[]):void {}
}