import * as _ from 'lodash'

export const pfinally = _.curry(<T>(finallyCallback:() => void, prom:Promise<T>):Promise<T> => {
    return prom
        .then(result => {
            finallyCallback();
            return result;
        })
        .catch(err => {
            finallyCallback();
            return Promise.reject(err);
        });
});

export const preduce = (promises:(() => Promise<any>)[]):Promise<any> => {
    return promises.reduce((prevPromise, currentPromise:() => Promise<any>) => {
        return prevPromise.then(() => currentPromise());
    }, Promise.resolve());
};


type Nullable<T> = T | null;

export const awaitFirst = <T>(predicate:(val:Nullable<T>) => boolean, promisesFactories:(() => Promise<Nullable<T>>)[]):Promise<Nullable<T>> => {
    return promisesFactories.reduce((prevPromise:Promise<Nullable<T>>, currentPromiseFactory:() => Promise<Nullable<T>>) => {
        return prevPromise
            .then((prevValue) => {
                if (predicate(prevValue)) {
                    return Promise.resolve(prevValue);
                } else {
                    return currentPromiseFactory()
                }
            })
    }, Promise.resolve(null))
};