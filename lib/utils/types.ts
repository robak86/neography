export interface Type<T> {
    new(...args:any[]):T;
}

export type Maybe<T> = T | null | void;

export type Required<T> = {
    [P in Purify<keyof T>]: NonNullable<T[P]>;
    };
export type Purify<T extends string> = { [P in T]: T; }[T];
export type NonNullable<T> = T & {};