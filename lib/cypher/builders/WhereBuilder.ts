import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";



export class WhereBuilder<T = any> {
    literal(queryPart:string):WhereLiteralQueryPart {
        return new WhereLiteralQueryPart(queryPart)
    }

    //TODO:
    attribute<K extends keyof T>(prop:T) {} // where(w => [w.attribute('id').in([1,2,3,4,])]
}