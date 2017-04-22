import {Partial} from "../../utils/types";

export interface INodeMatchQueryPart<P>{
    params(params:Partial<P>):INodeMatchQueryPart<P>
    as(alias:string):INodeMatchQueryPart<P>
}