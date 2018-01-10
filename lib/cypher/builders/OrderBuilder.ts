import {CypherLiteral} from "../common/CypherLiteral";
import {OrderDirectionBuilder} from "./OrderDirectionBuilder";
import {cloned} from "../../utils/core";

export class OrderBuilder<T> {
    private _alias:string;

    literal(queryPart:string):CypherLiteral {
        return new CypherLiteral(queryPart);
    }

    attribute<K extends keyof T>(prop:K):OrderDirectionBuilder<T[K]> {
        return new OrderDirectionBuilder(prop, this._alias);
    }

    //TODO: investigate matching for queries like WHERE NOT (n)-[:SOME_REL]-(b)
    // path(m:MatchBuilderCallback) {}
    //
    aliased(alias:string):OrderBuilder<T> {
        return cloned(this, w => w._alias = alias);
    }
}