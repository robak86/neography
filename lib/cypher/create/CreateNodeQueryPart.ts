import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";

import {NodeMetadata} from "../../metadata/NodeMetadata";
import {AbstractNode} from "../../model/AbstractNode";
import {AttributesMapper} from "../../mappers/AttributesMapper";

import {cloned, someOrThrow} from "../../utils/core";
import {nodeTypesRegistry} from "../../annotations/NodeAnnotations";


export class CreateNodeQueryPart<N extends AbstractNode> implements IQueryPart {
    protected _alias:string;

    constructor(private nodeInstance:N) {}

    private get nodeLabels():string {
        return NodeMetadata.getForInstance(this.nodeInstance).getLabels().join(':');
    }

    private get attributesMapper():AttributesMapper<AbstractNode> {
        return someOrThrow(nodeTypesRegistry.getMapperForClass(this.nodeInstance.constructor as any), "Missing mapper");
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        context.registerNodeClass(alias, this.nodeInstance.constructor as any);
        let paramsId = context.checkoutParamsAlias(alias);

        return {
            cypherString: `(${alias}:${this.nodeLabels} {${paramsId}})`,
            params: {[paramsId]: this.attributesMapper.mapToRow(this.nodeInstance, 'create')}
        };
    }

    as(alias:string):CreateNodeQueryPart<N> {
        return cloned(this, (el:CreateNodeQueryPart<N>) => el._alias = alias);
    }
}