import {EventEmitter} from "../utils/events/EventEmitter";
import * as _ from 'lodash';

export type ConnectionEventPayload = {
    query:string;
    params?:object
}

export type SessionEvent = {
    sessionId:string;
}

export type ConnectionCreate = {
    connectionId:string;
}

export type TransactionEvent = {
    transactionId:string;
}


export class ConnectionEvents {
    onTransactionBegin = new EventEmitter<SessionEvent & TransactionEvent>();
    onTransactionCommit = new EventEmitter<SessionEvent & TransactionEvent>();
    onTransactionRollback = new EventEmitter<SessionEvent & TransactionEvent>();
    onTransactionQueryRun = new EventEmitter<ConnectionEventPayload & SessionEvent & TransactionEvent>();

    onSessionCreate = new EventEmitter<SessionEvent>();
    onSessionClose = new EventEmitter<SessionEvent>();
    onQueryRun = new EventEmitter<ConnectionEventPayload & SessionEvent>();

    onConnectionCreate = new EventEmitter<ConnectionCreate>();


    removeAllListeners() {
        _.forOwn(this, (prop:any) => {
            if (prop instanceof EventEmitter) {
                prop.removeAllListeners();
            }
        })
    }
}

export const connectionEvents = new ConnectionEvents();