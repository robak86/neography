import * as PQueue from "p-queue";
import {StatementResult} from "neo4j-driver/types/v1/result";
import {DriverProxy} from "../driver/DriverProxy";

/***
 * It creates new session for each query.
 */
export class QueryRunner {
    private queue:PQueue;

    constructor(private driver:DriverProxy,
                private concurrency = 100) {
        this.queue = new PQueue({concurrency});
    }

    async run(statement:string, parameters?:any):Promise<StatementResult> {
        return this.queue.add(async () => {
            let session = this.driver.session();
            let response:StatementResult;

            try {
                response = await session.run(statement, parameters);
                session.close()
            } catch (e) {
                session.close();
                throw e;
            }

            return response;
        });
    }
}