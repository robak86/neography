import {ILogger} from "./ILogger";

/* istanbul ignore next */
export class SimpleDebugLogger implements ILogger {
    info(message?:any, ...optionalParams:any[]):void {
        console.info(message, ...optionalParams);
    }

    logQuery(statement:string, params:any):void {
        console.log('QUERY: ', statement);
        console.log('PARAMS: ', params);
    }

    log(message?:any, ...optionalParams:any[]):void {
        console.log(message, ...optionalParams);
    }

    warn(message?:any, ...optionalParams:any[]):void {
        console.warn(message, ...optionalParams);
    }

    error(message?:any, ...optionalParams:any[]):void {
        console.error(message, ...optionalParams);
    }
}