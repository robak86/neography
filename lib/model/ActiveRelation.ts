import {AbstractRelation} from "./AbstractRelation";
import {AbstractNode} from "./AbstractNode";
import {Type} from "../utils/types";
import {OrderBuilderCallback} from "../repositories/OrderBuilder";
import {ConnectedNode} from "./ConnectedNode";
import {WhereBuilderCallback} from "../cypher/builders/QueryBuilder";
import {WhereAttributeBuilder} from "../cypher/builders/WhereAttributeBuilder";

export class ActiveRelation<R extends AbstractRelation, N extends AbstractNode<any, any>> {

    constructor(private relClass:Type<R>, nodeClass:Type<N>) {}

    set<N>(nodes:N[] | N) {}

    setWithRelations(nodesWithRelations:{ node:N, relation:R }[]) {}

    //It throws null|undefined for no results
    first():Promise<N | null> {throw new Error("Implement Me")}

    //It throws NotFound error for no results
    findOne():Promise<N> {throw new Error("Implement Me")}

    firstWithRelation():Promise<ConnectedNode<R, N> | undefined> {throw new Error("Implement Me")}

    //throws error if no result found
    findOneWithRelation():Promise<ConnectedNode<R, N>> {throw new Error("Implement Me")}

    //here we don't
    all():Promise<N[]> {throw new Error("Implement Me")}

    allWithRelations():Promise<ConnectedNode<R, N>[]> {throw new Error("Implement Me")}

    //TODO: WhereBuilderCallback will have to know of undergoing alias assigned to relation or node - one can use .alias method on WhereAttributeBuilder
    whereRelation(relationParams:Partial<R> | WhereBuilderCallback<R>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    whereNode(nodeParams:Partial<N> | WhereBuilderCallback<N>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    orderByNode(b:OrderBuilderCallback<N>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    orderByRelation(b:OrderBuilderCallback<R>):ActiveRelation<R, N> {throw new Error("Implement Me")}

    skip(count:number):ActiveRelation<R, N> {throw new Error("Implement Me")}

    limit(count:number):ActiveRelation<R, N> {throw new Error("Implement Me")}

    count():Promise<number> {throw new Error("Implement Me")}

    exists():Promise<boolean> {throw new Error("Implement Me")}


    // save(connection:Connection){} //not sure if save method should be available only on parent node
}


