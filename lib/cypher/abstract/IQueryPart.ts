import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "./IBoundQueryPart";

export interface IQueryPart {
    toCypher(ctx:QueryContext):IBoundQueryPart
}