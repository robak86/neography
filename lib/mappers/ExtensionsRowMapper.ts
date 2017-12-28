import * as _ from "lodash";
import {IRowTransformer, TransformContext} from "../extensions/IRowTransformer";


export class ExtensionsRowMapper {
    private update:((row:any) => any)[] = [];
    private create:((row:any) => any)[] = [];
    private read:((row:any) => any)[] = [];

    constructor(private extensions:IRowTransformer[]) {
        this.extensions.forEach((extension:IRowTransformer) => {
            _.isFunction(extension.update) && this.update.push(extension.update.bind(extension));
            _.isFunction(extension.create) && this.create.push(extension.create.bind(extension));
            _.isFunction(extension.read) && this.read.push(extension.read.bind(extension));
        })
    }

    mapToRow(nodeInstance, type:TransformContext) {
        let propertiesTransformers = _.get(this, [type], []);

        return propertiesTransformers.reduce((prev, currentTransform) => {
            return currentTransform(prev);
        }, nodeInstance);
    }
}