import {pfinally} from "../utils/promise";
import {StatementResult} from "neo4j-driver/types/v1/result";
import {Driver} from "neo4j-driver/types/v1/driver";
import Session from "neo4j-driver/types/v1/session";


export class TransactionRunner {
    private transaction;
    private hasError:boolean = false; //merge this two variables
    private lastError:any;
    private session:Session;

    constructor(private driver:Driver) {
        this.session = driver.session();
        this.transaction = this.session.beginTransaction();
    }

    async run(statement:string, parameters?:any):Promise<StatementResult> {
        if (this.hasError) {
            return Promise.reject(this.lastError);
        } else {
            let queryPromise = this.transaction
                .run(statement, parameters)
                .catch(err => {
                    this.rollback(err);
                    return Promise.reject(err);
                });
            return queryPromise;
        }
    }

    rollback(err?) {
        this.transaction.rollback();
        this.hasError = true;
        this.lastError = err;
    }

    commit():Promise<any> {
        let commitPromise = !this.hasError ? this.transaction.commit() : Promise.reject('');
        return pfinally(() => this.session.close(), commitPromise);
    }
}