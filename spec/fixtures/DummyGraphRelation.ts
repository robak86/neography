import {attribute, relation, timestamp} from "../../lib/annotations";
import {RelationshipEntity} from "../../lib/model";


@relation('CONNECTED_BY_DUMMY')
export class DummyGraphRelation extends RelationshipEntity<DummyGraphRelation> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
    @attribute() attr3?:boolean;
}