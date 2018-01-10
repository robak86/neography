import {AbstractNode} from "../model";
import {Type} from "../utils/types";
import {DummyGraphNode} from "../../spec/fixtures/DummyGraphNode";
import {DummyGraphRelation} from "../../spec/fixtures/DummyGraphRelation";
import {WhereBuilderCallback} from "../cypher/builders/QueryBuilder";

export class ActiveNodeQuery<N extends AbstractNode<any, any>> {
    constructor(private nodeClass:Type<N>) {}

    where(builderCallback:WhereBuilderCallback<N>) {}

    //.orderBy(o => [o.asc('firstName')]) //with callback we can be typesafe!
    orderBy():ActiveNodeQuery<N> {throw new Error("Implement me")}

    skip(count:number):ActiveNodeQuery<N> {throw new Error("Implement me")}

    limit(count:number):ActiveNodeQuery<N> {throw new Error("Implement me")}

    firstRelation():N['relations'] {throw new Error("Implement me")};

    allRelations():N['relations'][] {throw new Error("Implement me")}; //probably it has to be evaluated eagerly
}

async function main() {
    let a = new ActiveNodeQuery(DummyGraphNode);

    a.where(w => [
        w.attribute('attr1').in(['1', '2', '3'])
    ]);

    let rel = await a.firstRelation();

    let otherDummies = rel.otherDummies
        .whereNode({attr1: '1'})
        .whereNode(w => [
            w.attribute('attr1').in(['1', '2', '3'])
        ])
        .whereRelation({attr2: 2})
        .whereRelation(w => [
            w.attribute('attr3').equal(true)
        ])
        .orderByNode(o => o.asc('attr1'))
        .orderByRelation(o => o.desc('attr3'))
        .skip(1)
        .limit(10);

    //until this point every call doesn't trigger any query


    await otherDummies.exists();
    await otherDummies.count();
    await otherDummies.first();
    await otherDummies.firstWithRelation();

    await otherDummies.all();
    await otherDummies.allWithRelations();

    await rel.otherDummies.set(new DummyGraphNode());
    await rel.otherDummies.set([new DummyGraphNode(), new DummyGraphNode()]);

    await rel.otherDummies.setWithRelations([
        {relation: new DummyGraphRelation(), node: new DummyGraphNode()},
        {relation: new DummyGraphRelation(), node: new DummyGraphNode()}
    ]);
}
