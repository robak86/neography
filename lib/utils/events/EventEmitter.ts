import {EventEmitterListener} from "./EventEmitterListener";

export class EventEmitter<T> {
    private listeners:EventEmitterListener<T>[] = [];

    public removeAllListeners() {
        this.listeners.length = 0;
    }

    public addListener(f:(payload:T) => void, context:any = null):() => any {
        this.listeners.push(new EventEmitterListener(f, context));
        return this.removeListener.bind(this, f);
    }

    public emit(payload:T):void {
        let listenersToRemove:EventEmitterListener<T>[] = [];

        //it allows removing listeners in listeners function. Changes will be visible in next trigger call
        const listenersCopy = this.listeners.slice();

        for (let i = 0; i < listenersCopy.length; i++) {
            let listener = listenersCopy[i];
            listener.run(payload);
            if (listener.callOnce) {
                listenersToRemove.push(listener);
            }
        }

        this.removeListeners(listenersToRemove);
    }

    public removeListener(listenerToRemove:(payload:T) => void) {
        let listenersToRemove = this.listeners.filter((listener) => listener.callback === listenerToRemove);
        this.removeListeners(listenersToRemove);
    }

    private removeListeners(listenersToRemove:EventEmitterListener<T>[]) {
        listenersToRemove.forEach((listenerToRemove) => {
            let listenerIndex = this.listeners.indexOf(listenerToRemove);
            if (listenerIndex !== -1) {
                this.listeners.splice(listenerIndex, 1);
            }
        });
    }
}