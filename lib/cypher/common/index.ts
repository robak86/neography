import {CypherLiteral} from "./CypherLiteral";
import {ReturnElement, ReturnQueryPart} from "./ReturnQueryPart";

export const literal = (literal:string, params?) => new CypherLiteral(literal).params(params);
export const returns = (...elements:ReturnElement[]) => new ReturnQueryPart(elements);