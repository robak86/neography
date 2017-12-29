export interface ILogger {
    logQuery(statement:string, params:any, sessionId:string):void
    info(message?:any, ...optionalParams:any[]):void
    log(message?:any, ...optionalParams:any[]):void
    warn(message?:any, ...optionalParams:any[]):void
    error(message?:any, ...optionalParams:any[]):void
}