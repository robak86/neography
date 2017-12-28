import {attribute, relation, timestamp} from "../../lib/annotations";
import {AbstractRelation} from "../../lib/model";


@relation('CONNECTED_BY_DUMMY')
export class DummyGraphRelation extends AbstractRelation<DummyGraphRelation> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
    @attribute() attr3?:boolean;
}