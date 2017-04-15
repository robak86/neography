import {AbstractRelation} from "../../model/AbstractRelation";

import {AbstractNode} from "../../model/AbstractNode";
import {Type} from "../../utils/types";


export class QueryContext {
    private _nodesCounter:number = 0;
    private _relationsCounter:number = 0;
    private _literalCounter:number = 0;
    private _nodeClassAliasMapping:{[alias:string]:Type<AbstractNode>} = {}; //TODO: add type MappableClass ?
    private _relationClassAliasMapping:{[alias:string]:Type<AbstractRelation>} = {}; //TODO: add type MappableClass ?
    private _returnValues:{[alias:string]:string} = {};



    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutNodeAlias():string {
        return `n${this._nodesCounter += 1}`;
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutParamsAlias(entityAlias:string):string {
        return `${entityAlias}Params`;
    }

    checkoutLiteralParamsAlias():string{
        return `literalParams${this._literalCounter+=1}`;
    }

    //TODO: prefix with double underscore in order to prevent collisions with user speciefied fields
    checkoutRelationAlias():string {
        return `r${this._relationsCounter += 1}`;
    }

    //TODO: this can be removed
    registerNodeClass(alias:string, klass:Type<AbstractNode>) {
        if (this._nodeClassAliasMapping[alias]) {
            throw new Error('Node class for given alias is already registered');
        }
        this._nodeClassAliasMapping[alias] = klass;
    }

    //TODO: this can be removed
    registerRelationClass(alias:string, klass:Type<AbstractRelation>) {
        if (this._relationClassAliasMapping[alias]) {
            throw new Error('Relation class for given alias is already registered');
        }
        this._relationClassAliasMapping[alias] = klass;
    }

    getNodeClass(alias:string):Type<AbstractNode> {
        if (!this._nodeClassAliasMapping[alias]) {
            throw new Error(`Cannot find class for given alias ${alias}`);
        }
        return this._nodeClassAliasMapping[alias];
    }

    getRelationClass(alias:string):Type<AbstractRelation> {
        if (!this._relationClassAliasMapping[alias]) {
            throw new Error(`Cannot find class for given alias ${alias}`);
        }
        return this._relationClassAliasMapping[alias];
    }

    addReturnValue(from:string, as:string) {
        if (this._returnValues[from]) {
            throw new Error("Given return value is already registered");
        }
        this._returnValues[from] = as;
    }
}