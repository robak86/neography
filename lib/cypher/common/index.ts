import {CypherLiteral} from "./CypherLiteral";
import {ReturnElement, ReturnQueryPart} from "./ReturnQueryPart";

export const literal = (literal:string) => new CypherLiteral(literal);
export const returns = (...elements:ReturnElement[]) => new ReturnQueryPart(elements);