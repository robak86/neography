import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";

export class WhereAttributeQueryPart implements IQueryPart {
    toCypher(ctx:QueryContext):IBoundQueryPart {
        throw new Error("implement me")
    }
}

export class WhereAttributeBuilder<T> {
    notEqual(val:T):WhereAttributeQueryPart {throw new Error("implement me")}

    equal(val:T):WhereAttributeQueryPart {throw new Error("implement me")}

    greaterThan(val:T):WhereAttributeQueryPart {throw new Error("implement me")}

    lessThan(val:T):WhereAttributeQueryPart {throw new Error("implement me")}

    in(values:T[]):WhereAttributeQueryPart {throw new Error("implement me")}

    alias(alias:string):WhereAttributeBuilder<T> {throw new Error("implement me")}
}