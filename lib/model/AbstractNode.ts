import {attribute, timestamp} from "../annotations/AttributesAnnotations";

export abstract class AbstractNode {
    private _entityType:'Node';

    @attribute() id?:string;
    @timestamp() createdAt?:number;
    @timestamp() updatedAt?:number;
}