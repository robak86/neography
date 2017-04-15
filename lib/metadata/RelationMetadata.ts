import 'reflect-metadata';

export class RelationMetadata {
    private static RELATION_METADATA_KEY:string = 'RELATION_METADATA';

    static getForClass(klass):RelationMetadata|void {
        return Reflect.getMetadata(RelationMetadata.RELATION_METADATA_KEY, klass);
    }

    static getOrCreateForClass(klass):RelationMetadata {
        let relationMetadata = Reflect.getMetadata(RelationMetadata.RELATION_METADATA_KEY, klass);
        if (!relationMetadata) {
            relationMetadata = new RelationMetadata();
            Reflect.defineMetadata(RelationMetadata.RELATION_METADATA_KEY, relationMetadata, klass);
        }

        return relationMetadata;
    }

    static getForInstance(instance):RelationMetadata {
        return this.getOrCreateForClass(instance.constructor);
    }

    private relationType:string;

    setType(type:string) {
        this.relationType = type;
    }

    getType():string{
        return this.relationType;
    }

    getId():string {
        return this.relationType;
    }
}