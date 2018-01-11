import {AbstractNode} from "./AbstractNode";
import {ActiveRelation} from "./ActiveRelation";


export function proxifyRelationsDefinitions<T extends object>(target:T, owner:AbstractNode):T {
    let cache:{} = {};

    return new Proxy(target, {
        get(target:T, p:PropertyKey, receiver:any) {
            if (target[p] instanceof ActiveRelation) {
                return cache[p] ?
                    cache[p] :
                    cache[p] = target[p].bindToNode(() => owner);
            }
            return null;
        },

        set(target:T, p:PropertyKey, value:any, receiver:any):boolean {
            throw new Error('Relations definition class is readonly');
        }
    })
}