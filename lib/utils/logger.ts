import {ILogger} from "./ILogger";
import {MutedLogger} from "./MutedLogger";

let _neographyLogger:ILogger = new MutedLogger();
let _neographyDebugLogger:ILogger = new MutedLogger();

export function setLogger(logger:ILogger) {
    _neographyLogger = logger;
}

export function setDebugLogger(logger:ILogger) {
    _neographyDebugLogger = logger;
}

export function getLogger(debugLevel:'debug' | 'default' = 'default'):ILogger {
    switch (debugLevel) {
        case 'default':
            return _neographyLogger;
        case 'debug' :
            return _neographyDebugLogger;
    }

    throw new Error('Unknown debug level')
}

