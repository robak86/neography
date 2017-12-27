import {AttributesMapper} from "../../mappers/AttributesMapper";
import {Type} from "../../utils/types";
import {AbstractNode, AbstractRelation} from "../../model";
import {isPresent, someOrThrow} from "../../utils/core";
import {AttributesMapperFactory} from "../../mappers/AttributesMapperFactory";
import {nodeTypesRegistry, relationsTypesRegistry} from "../../annotations";


export class QueryContext {
    private _nodesCounter:number = 0;
    private _relationsCounter:number = 0;
    private _literalCounter:number = 0;
    private _userDefinedAliases:{ [alias:string]:any } = {};

    static buildDefault(attributesMapperFactory?:AttributesMapperFactory) {
        return new QueryContext(attributesMapperFactory ? attributesMapperFactory
            : new AttributesMapperFactory(nodeTypesRegistry.getEntries(),relationsTypesRegistry.getEntries()));
    }

    constructor(private attributesMapperFactory:AttributesMapperFactory) {
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutNodeAlias():string {
        return `n${this._nodesCounter += 1}`;
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutParamsAlias(entityAlias:string):string {
        return `${entityAlias}Params`;
    }

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

    hasMapperForRelationClass<T extends AbstractRelation>(relationClass:Type<T>):boolean {
        let mapper =this.attributesMapperFactory.getRelationMapperForClass(relationClass);
        return isPresent(mapper);
    }

    getMapperForNodeClass<T extends AbstractNode>(nodeClass:Type<T>):AttributesMapper<T> {
        return someOrThrow(this.attributesMapperFactory.getNodeMapperForClass(nodeClass), `Cannot find node mapper for ${nodeClass}`);
    }

    getMapperForNodeLabels(labels:string[]):AttributesMapper<any> {
        return this.attributesMapperFactory.getNodeMapper(labels)
    }

    getMapperForRelationClass<T extends AbstractRelation>(relationClass:Type<T>):AttributesMapper<T> {
        return someOrThrow(this.attributesMapperFactory.getRelationMapperForClass(relationClass), `Cannot find relation mapper for ${relationClass}`)
    }

    getMapperForRelationType(type:string):AttributesMapper<any> {
        return this.attributesMapperFactory.getRelationMapper(type);
    }
}