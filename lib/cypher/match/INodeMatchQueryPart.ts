import {Partial} from "../../utils/types";

export interface INodeMatchQueryPart<P>{
    params(params:Partial<P>|void):INodeMatchQueryPart<P>
    as(alias:string):INodeMatchQueryPart<P>
}