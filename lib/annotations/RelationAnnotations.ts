import {RelationsTypesRegistry} from "./RelationsTypesRegistry";
import {RelationMetadata} from "../metadata/RelationMetadata";

export const relationsTypesRegistry = new RelationsTypesRegistry();

export const relationshipEntity:(type:string) => ClassDecorator = (type:string) => {
    return <T_FUNCTION>(klass:T_FUNCTION):T_FUNCTION => {
        let relationMetadata:RelationMetadata = RelationMetadata.getOrCreateForClass(klass);
        relationMetadata.setType(type);
        relationsTypesRegistry.registerRelation(klass, relationMetadata);
        return klass;
    };
};