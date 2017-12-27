import {IQueryPart} from "../abstract/IQueryPart";
import {IBoundQueryPart} from "../abstract/IBoundQueryPart";
import {QueryContext} from "../common/QueryContext";
import {NodeMetadata} from "../../metadata/NodeMetadata";
import {AbstractNode} from "../../model";
import {cloned} from "../../utils/core";


export class CreateNodeQueryPart<N extends AbstractNode> implements IQueryPart {
    protected _alias:string;

    constructor(private nodeInstance:N) {}

    private get nodeLabels():string {
        return NodeMetadata.getForInstance(this.nodeInstance).getLabels().join(':');
    }

    toCypher(context:QueryContext):IBoundQueryPart {
        let alias = this._alias || context.checkoutNodeAlias();
        let paramsId = context.checkoutParamsAlias(alias);
        let attributesMapper = context.getMapperForNodeClass(this.nodeInstance.constructor as any);

        return {
            cypherString: `(${alias}:${this.nodeLabels} {${paramsId}})`,
            params: {[paramsId]: attributesMapper.mapToRow(this.nodeInstance, 'create')}
        };
    }

    as(alias:string):CreateNodeQueryPart<N> {
        return cloned(this, (el:CreateNodeQueryPart<N>) => el._alias = alias);
    }
}