import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "./QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {cloned} from "../../utils/core";


export class ReturnEntityQueryPart implements IQueryPart {
    protected _alias:string;


    constructor(private id:string) {}

    as(alias:string):ReturnEntityQueryPart {
        return cloned(this, (el:ReturnEntityQueryPart) => el._alias = alias);
    }

    toCypher(ctx:QueryContext):IBoundQueryPart {
        let out:string = this.id;
        if (this._alias) {
            out += ` as ${this._alias}`
        }

        ctx.addReturnValue(this.id, this._alias ? this._alias : this.id);

        return {
            cypherString: out
        }
    }
}