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

export const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));