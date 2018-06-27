import {MatchQueryPart} from "./MatchQueryPart";
import {MatchBuilderCallback} from "../builders/QueryBuilder";
import {PathQueryPart} from "./PathQueryPart";
import {MatchableElement} from "./MatchableQueryPart";

export const match = (...builderOrElements:(MatchBuilderCallback | MatchableElement)[]) => MatchQueryPart.build(false, ...builderOrElements);
export const matchOptional = (...builderOrElements:(MatchBuilderCallback | MatchableElement)[]) => MatchQueryPart.build(true, ...builderOrElements);
export const path = PathQueryPart.build;