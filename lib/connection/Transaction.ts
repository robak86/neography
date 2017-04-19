import {GraphResponse} from "./GraphResponse";
import {pfinally} from "../utils/promise";
import {GraphResponseFactory} from "./GraphResponseFactory";


export class Transaction {
    private transaction;
    private hasError:boolean = false; //merge this two variables
    private lastError:any;

    constructor(private session,
                private responseFactory:GraphResponseFactory) {
        this.transaction = session.beginTransaction();
    }

    runQuery(query:string, params?:any):GraphResponse {
        if (this.hasError) {
            return this.responseFactory.build(Promise.reject(this.lastError));
        } else {
            let queryPromise = this.transaction
                .run(query, params)
                .catch(err => {
                    this.rollback(err);
                    return Promise.reject(err);
                });
            return this.responseFactory.build(queryPromise);
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