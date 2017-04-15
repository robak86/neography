import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";

export class WhereBuilder {
    literal(queryPart:string):WhereLiteralQueryPart {
        return new WhereLiteralQueryPart(queryPart)
    }
}