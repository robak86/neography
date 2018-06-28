import {QueryBuilder} from "./builders/QueryBuilder";
import {IQueryPart} from "./abstract/IQueryPart";

export const buildQuery = (...elements:IQueryPart[]) => new QueryBuilder(elements);

export * from './match';
export * from './create';
export * from './where';
export * from './order';
export * from './common';