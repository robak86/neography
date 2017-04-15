import {GraphResponse} from "./GraphResponse";
import {pfinally} from "../utils/promise";


export class Transaction {
    private transaction;
    private hasError:boolean = false; //merge this two variables
    private lastError:any;

    constructor(private session) {
        this.transaction = session.beginTransaction();
    }

    runQuery(query:string, params?:any):GraphResponse {
        if (this.hasError) {
            return new GraphResponse(Promise.reject(this.lastError));
        } else {
            let queryPromise = this.transaction
                .run(query, params)
                .catch(err => {
                    this.rollback(err);
                    return Promise.reject(err);
                });
            return new GraphResponse(queryPromise);
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