import {TypedSetQueryPart} from "../update/TypedSetQueryPart";

import {AbstractRelation} from "../../model/AbstractRelation";
import {AbstractNode} from "../../model/AbstractNode";

import {UntypedSetQueryPart} from "../update/UntypedSetQueryPart";
import {LiteralSetQueryPart} from "../update/LiteralSetQueryPart";
import {Type} from "../../utils/types";



export class SetQueryBuilder {
    update(alias:string):AliasedSetQueryBuilder {
        return new AliasedSetQueryBuilder(alias, 'update');
    }

    replace(alias:string):AliasedSetQueryBuilder {
        return new AliasedSetQueryBuilder(alias, 'replace');
    }

    literal(setLiteral:string):LiteralSetQueryPart {
        return new LiteralSetQueryPart(setLiteral);
    }
}

export class AliasedSetQueryBuilder {
    constructor(private alias:string, private mode) {
    }

    typed<T extends AbstractNode | AbstractRelation >(klass:Type<T>, params:Partial<T>):TypedSetQueryPart<T> {
        return new TypedSetQueryPart(klass, params, this.alias, this.mode);
    }

    untyped(params:any):UntypedSetQueryPart {
        return new UntypedSetQueryPart(params, this.alias, this.mode);
    }
}