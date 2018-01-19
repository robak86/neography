export class EventEmitterListener<T> {
    public callback:(T) => void;
    public callOnce:boolean;
    public ctx:any;

    constructor(callback:(payload:T) => void, context = null, once:boolean = false) {
        this.ctx = context; //always running in save context;
        this.callOnce = once;
        this.callback = callback;
    }

    public run(payload:T):void {
        this.callback.call(this.ctx, payload);
    }
}

