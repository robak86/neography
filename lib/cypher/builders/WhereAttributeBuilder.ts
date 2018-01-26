import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {cloned, isPresent} from "../../utils/core";

export class WhereAttributeQueryPart implements IQueryPart {
    constructor(private propertyName:string,
                private alias:string,
                private operator:string,
                private value:any) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypher = '';
        let paramAlias = ctx.checkoutSinglePropertyAlias(this.alias, this.propertyName);

        if (isPresent(this.alias)) {
            cypher += `${this.alias}.`
        }

        cypher += this.propertyName;
        cypher += ` ${this.operator} `;
        cypher += `{ ${paramAlias} }`;

        return {
            cypherString: cypher,
            params: {[paramAlias]: this.value}
        }
    }
}

export class AttributeNotNullQueryPart implements IQueryPart {
    constructor(private propertyName:string,
                private alias:string) {}

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let cypher = '';

        if (isPresent(this.alias)) {
            cypher += `${this.alias}.`
        }

        cypher += this.propertyName;
        cypher += ` IS NOT NULL`;


        return {
            cypherString: cypher
        }
    }
}

export class WhereAttributeBuilder<T> {
    constructor(private propertyName:string, private _alias:string) {}

    notEqual(val:T):WhereAttributeQueryPart {
        return new WhereAttributeQueryPart(this.propertyName, this._alias, '<>', val);
    }

    equal(val:T):WhereAttributeQueryPart {
        return new WhereAttributeQueryPart(this.propertyName, this._alias, '=', val);
    }

    notNull(): AttributeNotNullQueryPart {
        return new AttributeNotNullQueryPart(this.propertyName,this._alias);
    }

    greaterThan(val:T):WhereAttributeQueryPart {
        return new WhereAttributeQueryPart(this.propertyName, this._alias, '>', val);
    }

    lessThan(val:T):WhereAttributeQueryPart {
        return new WhereAttributeQueryPart(this.propertyName, this._alias, '<', val);
    }

    in(values:T[]):WhereAttributeQueryPart {
        return new WhereAttributeQueryPart(this.propertyName, this._alias, 'in', values);
    }
}