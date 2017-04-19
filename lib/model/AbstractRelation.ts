import {attribute, timestamp} from "../annotations/AttributesAnnotations";

export abstract class AbstractRelation {
    private _entityType:'Relation';

    @attribute() id?:string;
}