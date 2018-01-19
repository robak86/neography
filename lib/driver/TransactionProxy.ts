import Transaction from "neo4j-driver/types/v1/transaction";
import Result from "neo4j-driver/types/v1/result";
import {Parameters} from "neo4j-driver/types/v1/statement-runner";
import {getLogger} from "../utils/logger";
import {ILogger} from "../utils/ILogger";
import {connectionEvents} from "../connection/ConnectionEvents";

let counter = 0;
const genId = () => `t_${counter += 1}`;

export class TransactionProxy {
    private transactionId:string = genId();
    private debug:ILogger = getLogger('debug');
    private logger:ILogger = getLogger('default');


    constructor(private transaction:Transaction,
                private sessionId:string) {
        connectionEvents.onTransactionBegin.emit({
            sessionId: this.sessionId,
            transactionId: this.transactionId
        });
        this.debug.info(`Session ${this.sessionId} | Begin Transaction`);
    }

    commit():Result {
        connectionEvents.onTransactionCommit.emit({
            sessionId: this.sessionId,
            transactionId: this.transactionId
        });
        this.debug.log(`Session ${this.sessionId} | Commit Transaction`);
        return this.transaction.commit();
    }

    rollback():Result {
        connectionEvents.onTransactionRollback.emit({
            sessionId: this.sessionId,
            transactionId: this.transactionId
        });

        this.debug.log(`Session ${this.sessionId} | Rollback Transaction`);
        return this.transaction.rollback();
    }

    isOpen():boolean {
        return this.transaction.isOpen();
    }

    run(statement:string, parameters?:Parameters):Result {
        connectionEvents.onTransactionQueryRun.emit({
            sessionId: this.sessionId,
            transactionId: this.transactionId,
            query: statement,
            params: parameters
        });

        this.debug.log(`Session ${this.sessionId} | Run Query`);
        this.logger.logQuery(statement, parameters, this.sessionId);
        return this.transaction.run(statement, parameters);
    }
}