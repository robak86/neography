import * as PQueue from "p-queue";
import {StatementResult} from "neo4j-driver/types/v1/result";
import {Driver} from "neo4j-driver/types/v1/driver";
import {ILogger} from "../utils/ILogger";

/***
 * It creates new session for each query.
 */
export class QueryRunner {
    private queue:PQueue;

    constructor(private driver:Driver,
                private concurrency = 100,
                private logger:ILogger) {
        this.queue = new PQueue({concurrency});
    }

    async run(statement:string, parameters?:any):Promise<StatementResult> {
        return this.queue.add(async () => {
            let session = this.driver.session();
            let response:StatementResult;

            try {
                this.logger.logQuery(statement, parameters);
                response = await session.run(statement, parameters);
            } catch (e) {
                session.close();
                throw e;
            }

            return response;
        });
    }
}