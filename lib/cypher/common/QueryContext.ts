export class QueryContext {
    private _nodesCounter:number = 0;
    private _relationsCounter:number = 0;
    private _literalCounter:number = 0;
    // private _returnValues:{[alias:string]:string} = {};
    private _userDefinedAliases:{ [alias:string]:any } = {};


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
}