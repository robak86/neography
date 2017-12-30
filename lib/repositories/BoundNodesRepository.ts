import {AbstractRelation} from "../model";
import {Type} from "../utils/types";


export class BoundNodesRepository<FROM extends AbstractRelation, TO extends AbstractRelation> {
    // getRelations():AbstractRelation<any> {
    //         return
    // }

    where<R extends AbstractRelation>(type:Type<R>, params:Partial<R> = {}):Promise<R[]>

}