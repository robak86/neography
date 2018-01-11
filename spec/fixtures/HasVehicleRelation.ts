import {attribute, relation, timestamp} from "../../lib/annotations";
import {RelationshipEntity} from "../../lib/model";

@relation('HAS_VEHICLE')
export class HasVehicleRelation extends RelationshipEntity<HasVehicleRelation> {
    @timestamp() createdAt?:Date;
    @timestamp() updatedAt?:Date;

    @attribute() isRented:boolean;
}