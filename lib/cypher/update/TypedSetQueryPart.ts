import {AbstractNode} from "../../model/AbstractNode";
import {AbstractRelation} from "../../model/AbstractRelation";

import {Partial} from "../../utils/types";
import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";


import {relationsTypesRegistry} from "../../annotations/RelationAnnotations";
import {Type} from "../../utils/types";
import {invariant, isPresent, someOrThrow} from "../../utils/core";
import {nodeTypesRegistry} from "../../annotations/NodeAnnotations";


const SET_OPERATORS = {
    replace: '=',
    update: '+='
};


export class TypedSetQueryPart<T extends AbstractNode|AbstractRelation> implements IQueryPart {

    constructor(private klass:Type<T>,
                private _params:Partial<T>,
                private _alias,
                private mode:'replace' | 'update') {
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        let paramsId = context.checkoutParamsAlias(alias);

        //TODO: consider merging nodeTypesRegistry and relationsTypesRegistry(.getMapperForClass return the same type!)
        let mapper = someOrThrow(
            nodeTypesRegistry.getMapperForClass(this.klass as Type<AbstractNode>) || relationsTypesRegistry.getMapperForClass(this.klass as Type<AbstractNode>),
            'Missing Mapper'
        );

        let operator = SET_OPERATORS[this.mode];
        invariant(isPresent(operator), `Unknown mode ${this.mode}`);

        return {
            cypherString: `${this._alias} ${operator} {${paramsId}}`,
            params: {
                [paramsId]: mapper.mapToRow(this._params, 'update')
            }
        }
    }
}