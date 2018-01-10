import {attribute, relation, timestamp} from "../../lib/annotations";
import {AbstractRelation} from "../../lib/model";

@relation('HAS_VEHICLE')
export class HasVehicleRelation extends AbstractRelation<HasVehicleRelation> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() isRented:boolean;
}