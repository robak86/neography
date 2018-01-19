import 'reflect-metadata';
import * as _ from 'lodash';
import {NodeEntity} from "../model";
import {getSuperClass} from "../utils/core";
import {Type} from "../utils/types";

export class NodeMetadata {

    private static NODE_METADATA_KEY:string = 'NODE_METADATA';

    static getForClass(klass:Type<NodeEntity>):NodeMetadata|void {
        return Reflect.getMetadata(NodeMetadata.NODE_METADATA_KEY, klass);
    }

    static getOrCreateForClass(klass:Type<NodeEntity>):NodeMetadata {
        let nodeMetadata = Reflect.getOwnMetadata(NodeMetadata.NODE_METADATA_KEY, klass);

        if (!nodeMetadata) {
            nodeMetadata = new NodeMetadata();
            Reflect.defineMetadata(NodeMetadata.NODE_METADATA_KEY, nodeMetadata, klass);

            let superClass = getSuperClass(klass);
            if (superClass && NodeMetadata.getForClass(superClass)){ //TODO: We don't wanna decorate base class but we should implement it somehow cleaner
                nodeMetadata.setParent(NodeMetadata.getForClass(superClass));
            }
        }

        return nodeMetadata;
    }

    static getForInstance(instance:NodeEntity):NodeMetadata {
        return this.getOrCreateForClass(instance.constructor as Type<NodeEntity>);
    }

    public parent:NodeMetadata;
    private ownLabel:string;

    private setParent(parentMetadata:NodeMetadata){
        this.parent = parentMetadata;
    }

    setOwnLabel(label:string) {
        this.ownLabel = label;
    }

    getLabels():string[] {
        let ancestorsLabels = this.parent ? this.parent.getLabels() : [];
        return ancestorsLabels.concat(this.ownLabel).sort();
    }

    getId():string {
        return this.getLabels().join('_');
    }
}