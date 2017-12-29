import {pfinally} from "../utils/promise";
import {StatementResult} from "neo4j-driver/types/v1/result";
import {DriverProxy} from "../driver/DriverProxy";
import {SessionProxy} from "../driver/SessionProxy";
import {TransactionProxy} from "../driver/TransactionProxy";


export class TransactionRunner {
    private ongoingTransactions:number = 0;
    private transaction:TransactionProxy;
    private hasError:boolean = false; //merge this two variables
    private lastError:any;
    private session:SessionProxy;

    constructor(private driver:DriverProxy) {
    }

    async run(statement:string, parameters?:any):Promise<StatementResult> {
        if (this.hasError) {
            return Promise.reject(this.lastError);
        } else {
            return this.transaction
                .run(statement, parameters)
                .catch(err => {
                    this.rollback(err);
                    return Promise.reject(err);
                });
        }
    }

    rollback(err = new Error('Unknown error')) {
        this.transaction.rollback();
        this.hasError = true;
        this.lastError = err;
    }

    commit():Promise<any> {
        let commitPromise = !this.hasError ? this.transaction.commit() : Promise.reject(this.lastError);
        return pfinally(() => this.session.close(), commitPromise);
    }

    withTransaction<T>(fn:() => Promise<T>):Promise<T> {
        if (!this.isTransactionOpened()) {
            this.checkoutNewTransaction();
        }

        this.ongoingTransactions += 1;
        return fn()
            .then((result) => {
                this.ongoingTransactions -= 1;
                if (this.ongoingTransactions === 0) {
                    return this.commit().then(() => result);
                } else {
                    return result;
                }
            })
            .catch(err => {
                this.isTransactionOpened() && this.rollback();
                this.ongoingTransactions = 0;
                return Promise.reject(err);
            });
    }

    isTransactionOpened():boolean {
        return this.ongoingTransactions > 0;
    }

    private checkoutNewTransaction() {
        this.hasError = false;
        this.lastError = undefined;
        this.session = this.driver.session();
        this.transaction = this.session.beginTransaction();
    }
}