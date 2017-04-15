import {QueryBuilder} from "./cypher/builders/QueryBuilder";

export * from './connection/Connection';


export const buildQuery = () => new QueryBuilder();