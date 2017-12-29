import Transaction from "neo4j-driver/types/v1/transaction";
import Session from "neo4j-driver/types/v1/session";
import {TransactionProxy} from "./TransactionProxy";
import Result from "neo4j-driver/types/v1/result";

import {getLogger} from "../utils/logger";
import {ILogger} from "../utils/ILogger";


export type  TransactionWork<T> = (tx:Transaction) => T | Promise<T>;

let counter = 0;
const genId = () => `s_${counter+=1}`;

export class SessionProxy {
    private sessionId = genId();
    private debug:ILogger = getLogger('debug');
    private logger:ILogger = getLogger('default');

    constructor(private session:Session) {
        this.debug.info(`Session ${this.sessionId} | Created`);
    }

    beginTransaction():TransactionProxy {
        this.debug.info(`Session ${this.sessionId} | Begin Transaction`);
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
        this.debug.info(`Session ${this.sessionId} | Close`);
        return this.session.close(callback);
    }

    run(statement:string, parameters?:any):Result {
        this.logger.logQuery(statement, parameters, this.sessionId);
        return this.session.run(statement, parameters)
    }
}