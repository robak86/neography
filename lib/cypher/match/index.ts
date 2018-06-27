import {MatchableElement, MatchQueryPart} from "./MatchQueryPart";
import {MatchBuilderCallback} from "../builders/QueryBuilder";

export const match = (...builderOrElements:(MatchBuilderCallback | MatchableElement)[]) => MatchQueryPart.build(false, ...builderOrElements);
export const matchOptional = (...builderOrElements:(MatchBuilderCallback | MatchableElement)[]) => MatchQueryPart.build(true, ...builderOrElements);