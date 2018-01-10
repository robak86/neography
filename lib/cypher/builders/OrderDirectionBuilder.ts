import {OrderStatementPart} from "../order/OrderStatementPart";

export class OrderDirectionBuilder<B> {
    constructor(private propertyName:string, private _alias:string) {}

    asc():OrderStatementPart {
        return new OrderStatementPart('asc', this.propertyName, this._alias);
    }

    desc():OrderStatementPart {
        return new OrderStatementPart('desc', this.propertyName, this._alias);
    }
}