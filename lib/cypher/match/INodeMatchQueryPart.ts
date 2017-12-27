export interface INodeMatchQueryPart<P>{
    params(params:Partial<P>):INodeMatchQueryPart<P>
    as(alias:string):INodeMatchQueryPart<P>
}