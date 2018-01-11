import {AttributesMapper} from "../../mappers/AttributesMapper";
import {Type} from "../../utils/types";
import {AbstractNode, RelationshipEntity} from "../../model";
import {isPresent, someOrThrow} from "../../utils/core";
import {AttributesMapperFactory} from "../../mappers/AttributesMapperFactory";


export class QueryContext {
    private _nodesCounter:number = 0;
    private _relationsCounter:number = 0;
    private _literalCounter:number = 0;
    private _whereCounter:number = 0;

    constructor(private attributesMapperFactory:AttributesMapperFactory) {}

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutNodeAlias():string {
        return `n${this._nodesCounter += 1}`;
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutParamsAlias(entityAlias:string):string {
        return `${entityAlias}Params`; //TODO: shouldn't be some postfix added in order to avoid collisions ?!
    }

    checkoutSinglePropertyAlias(alias:string, propertyName:string):string {
        return `__${alias}_${propertyName}_prop${this._whereCounter += 1}`;
    }


    //TODO: investigate if this will be ever used
    checkoutLiteralParamsAlias():string {
        return `literalParams${this._literalCounter += 1}`;
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutRelationAlias():string {
        return `r${this._relationsCounter += 1}`;
    }

    hasMapperForNodeClass<T extends AbstractNode>(nodeClass:Type<T>):boolean {
        let mapper = this.attributesMapperFactory.getNodeMapperForClass(nodeClass);
        return isPresent(mapper);
    }

    hasMapperForRelationClass<T extends RelationshipEntity>(relationClass:Type<T>):boolean {
        let mapper = this.attributesMapperFactory.getRelationMapperForClass(relationClass);
        return isPresent(mapper);
    }

    getMapperForNodeClass<T extends AbstractNode>(nodeClass:Type<T>):AttributesMapper<T> {
        return someOrThrow(this.attributesMapperFactory.getNodeMapperForClass(nodeClass), `Cannot find node mapper for ${nodeClass}`);
    }

    //TODO: investigate if this will be ever used
    getMapperForNodeLabels(labels:string[]):AttributesMapper<any> {
        return this.attributesMapperFactory.getNodeAttributesMapper(labels)
    }

    getMapperForRelationClass<T extends RelationshipEntity>(relationClass:Type<T>):AttributesMapper<T> {
        return someOrThrow(this.attributesMapperFactory.getRelationMapperForClass(relationClass), `Cannot find relation mapper for ${relationClass}`)
    }

    //TODO: investigate if this will be ever used
    getMapperForRelationType(type:string):AttributesMapper<any> {
        return this.attributesMapperFactory.getRelationAttributesMapper(type);
    }
}