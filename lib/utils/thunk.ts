import * as _ from 'lodash';

export type Thunk<T> = T | (() => T)

export function resolveThunk<T, TH extends Thunk<T>>(valOrThunk:TH):T {
    return _.isFunction(valOrThunk) ?
        valOrThunk() :
        valOrThunk
}