import {attribute} from "../annotations/AttributesAnnotations";

export abstract class AbstractNode {
    private _entityType:'Node';

    @attribute() id?:string;
}