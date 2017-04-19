import {relation} from "../../lib/annotations/RelationAnnotations";
import {AbstractRelation} from "../../lib/model/AbstractRelation";
import {createFactoryMethod} from "../../lib/model/createFactoryMethod";
import {attribute, timestamp} from "../../lib/annotations/AttributesAnnotations";


@relation('CONNECTED_BY_DUMMY')
export class DummyGraphRelation extends AbstractRelation {
    static build = createFactoryMethod(DummyGraphRelation);

    @timestamp() createdAt?:number;
    @timestamp() updatedAt?:number;

    @attribute() attr1?:string;
    @attribute() attr2?:number;
    @attribute() attr3?:boolean;
}