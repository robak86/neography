export type ConcatenableQueryPart = {cypherString:string, isRelation:boolean};


export class NodeRelationConcatenator {
    private parts:ConcatenableQueryPart[] = [];

    constructor(){}

    push(part: ConcatenableQueryPart){
        this.parts.push(part);
    }

    toString():string {
        this.assertElementsValid();
        let out:string = '';

        let prev:ConcatenableQueryPart;
        this.parts.forEach((el:ConcatenableQueryPart, idx:number) => {
            if (el.isRelation) {
                out += el.cypherString
            } else {
                let nodeSeparator = idx === 0 || (prev && prev.isRelation) ? '' : ', ';
                out += nodeSeparator;
                out += el.cypherString
            }

            prev = el;
        });

        return out;
    }

    private assertElementsValid() {
        this.parts.forEach((el, idx) => {
            if (el.isRelation) {
                let prev = this.parts[idx - 1];
                let next = this.parts[idx + 1];

                if ((prev && prev.isRelation) || (next && next.isRelation)) {
                    throw new Error('Cannot fetch relation without related nodes');
                }
            }
        })
    }
}