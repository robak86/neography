import Transaction from "neo4j-driver/types/v1/transaction";
import Result from "neo4j-driver/types/v1/result";
import {Parameters} from "neo4j-driver/types/v1/statement-runner";
import {getLogger} from "../utils/logger";
import {ILogger} from "../utils/ILogger";

export class TransactionProxy {
    private debug:ILogger = getLogger('debug');
    private logger:ILogger = getLogger('default');


    constructor(private transaction:Transaction,
                private sessionId:string) {}

    commit():Result {
        this.debug.log(`Session ${this.sessionId} | Commit Transaction`);
        return this.transaction.commit();
    }

    rollback():Result {
        this.debug.log(`Session ${this.sessionId} | Rollback Transaction`);
        return this.transaction.rollback();
    }

    isOpen():boolean {
        return this.transaction.isOpen();
    }

    run(statement:string, parameters?:Parameters):Result {
        this.debug.log(`Session ${this.sessionId} | Run Query`);
        this.logger.logQuery(statement, parameters, this.sessionId);
        return this.transaction.run(statement, parameters);
    }
}