import {NodeEntity, RelationshipEntity} from "../../model";
import {IQueryPart} from "../abstract/IQueryPart";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {Type} from "../../utils/types";
import {invariant, isPresent, someOrThrow} from "../../utils/core";


const SET_OPERATORS = {
    replace: '=',
    update: '+='
};


export class TypedSetQueryPart<T extends NodeEntity | RelationshipEntity> implements IQueryPart {

    constructor(private klass:Type<T>,
                private _params:Partial<T>,
                private _alias,
                private mode:'replace' | 'update') {
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        let paramsId = context.checkoutParamsAlias(alias);


        let mapper;
        if (context.hasMapperForNodeClass(this.klass as Type<NodeEntity>)) {
            mapper = context.getMapperForNodeClass(this.klass as any);
        }

        if (context.hasMapperForRelationClass(this.klass as Type<RelationshipEntity>)){
            mapper = context.getMapperForRelationClass(this.klass as any);
        }

        someOrThrow(mapper, `Missing mapper for ${this.klass.name}`);


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