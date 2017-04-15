import {IQueryPart} from "../abstract/IQueryPart";
import {AbstractRelation} from "../../model/AbstractRelation";
import {RelationMetadata} from "../../metadata/RelationMetadata";
import {QueryContext} from "../common/QueryContext";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";


import {AttributesMapper} from "../../mappers/AttributesMapper";
import {relationsTypesRegistry} from "../../annotations/RelationAnnotations";
import {RelationDirectionType} from "../match/IRelationMatchQueryPart";
import {cloned, someOrThrow} from "../../utils/core";

export class CreateRelationQueryPart<R extends AbstractRelation> implements IQueryPart {
    protected _alias:string;
    protected _direction:RelationDirectionType = '<->';

    constructor(private relationInstance:R) {}

    as(alias:string):CreateRelationQueryPart<R> {
        return cloned(this, (el:CreateRelationQueryPart<R>) => el._alias = alias);
    }

    direction(direction:RelationDirectionType):CreateRelationQueryPart<R> {
        return cloned(this, (el:CreateRelationQueryPart<R>) => el._direction = direction);
    }

    private get relationType():string {
        return RelationMetadata.getForInstance(this.relationInstance).getType();
    }

    private get attributesMapper():AttributesMapper<AbstractRelation> {
        return someOrThrow(
            relationsTypesRegistry.getMapperForClass(this.relationInstance.constructor as any),
            `Missing relation mapper for ${this.relationInstance}`
        );
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutRelationAlias();
        context.registerNodeClass(alias, this.relationInstance.constructor as any);
        let paramsId = context.checkoutParamsAlias(alias);

        return {
            cypherString: `${this.arrowPreSign}[${alias}:${this.relationType} {${paramsId}}]${this.arrowPostSign}`,
            params: {[paramsId]: this.attributesMapper.mapToRow(this.relationInstance, 'create')}
        };
    }

    private get arrowPreSign():string {
        return (this._direction === '<->' || this._direction === '->') ? '-' : '<-';
    }

    private get arrowPostSign():string {
        return (this._direction === '<->' || this._direction === '<-') ? '-' : '->';
    }
}