import {AbstractNode} from "./AbstractNode";
import {Relationship} from "./Relationship";


export function proxifyRelationsDefinitions<T extends object>(target:T, owner:AbstractNode):T {
    let cache:{} = {};

    return new Proxy(target, {
        get(target:T, p:PropertyKey, receiver:any) {
            if (target[p] instanceof Relationship) {
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