import Transaction from "neo4j-driver/types/v1/transaction";
import Session from "neo4j-driver/types/v1/session";
import {TransactionProxy} from "./TransactionProxy";
import Result from "neo4j-driver/types/v1/result";

import {getLogger} from "../utils/logger";
import {ILogger} from "../utils/ILogger";
import {connectionEvents} from "../connection/ConnectionEvents";


export type  TransactionWork<T> = (tx:Transaction) => T | Promise<T>;

let counter = 0;
const genId = () => `s_${counter += 1}`;

export class SessionProxy {
    private sessionId = genId();
    private debug:ILogger = getLogger('debug');
    private logger:ILogger = getLogger('default');

    constructor(private session:Session) {
        connectionEvents.onSessionCreate.emit({sessionId: this.sessionId});
        this.debug.info(`Session ${this.sessionId} | Created`);
    }

    beginTransaction():TransactionProxy {

        return new TransactionProxy(this.session.beginTransaction(), this.sessionId);
    }

    lastBookmark():string | null {
        return this.session.lastBookmark();
    }

    readTransaction<T>(work:TransactionWork<T>):Promise<T> {
        return this.session.readTransaction(work);
    }

    writeTransaction<T>(work:TransactionWork<T>):Promise<T> {
        return this.session.writeTransaction(work);
    }

    close(callback?:() => void):void {
        connectionEvents.onSessionClose.emit({sessionId: this.sessionId});
        this.debug.info(`Session ${this.sessionId} | Close`);
        return this.session.close(callback);
    }

    run(statement:string, parameters?:any):Result {
        connectionEvents.onQueryRun.emit({
            sessionId: this.sessionId,
            query: statement,
            params: parameters
        });

        this.logger.logQuery(statement, parameters, this.sessionId);
        return this.session.run(statement, parameters)
    }
}