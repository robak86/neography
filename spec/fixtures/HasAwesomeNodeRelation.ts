import {attribute, relation, timestamp} from "../../lib/annotations";
import {RelationshipEntity} from "../../lib/model";


@relation('HAS_AWESOME_NODE_RELATION')
export class HasAwesomeNodeRelation extends RelationshipEntity<HasAwesomeNodeRelation> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
    @attribute() attr3?:boolean;
}