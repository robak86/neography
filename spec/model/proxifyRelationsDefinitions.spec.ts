import {proxifyRelationsDefinitions} from "../../lib/model/proxifyRelationsDefinitions";
import {Relationship} from "../../lib/model/Relationship";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import {AbstractNode} from "../../lib/model";
import * as _ from 'lodash';

describe(`proxifyRelationsDefinitions`, () => {
    class Relations {
        readonly others = new Relationship(DummyGraphRelation, DummyGraphNode);
    }

    let relations:Relations,
        owner:DummyGraphNode;

    beforeEach(() => {
        owner = new DummyGraphNode();
        (<any>owner).id = 'in order to be persisted';
        relations = proxifyRelationsDefinitions(new Relations(), owner);
    });

    it('intercepts all getters and returns cloned Relationship with bound owner', () => {
        let boundNode:AbstractNode<any> = relations.others.boundNode;
        expect(boundNode).to.eq(owner);
    });

    it('caches relations', () => {
        expect(relations.others).to.eq(relations.others);
    });

    it('returns cached relations for iteration', () => {
        (relations.others as any).someData = 123;

        let iterated:Relationship<DummyGraphRelation, DummyGraphNode>[] = [];
        _.forOwn(relations, (rel) => {
            iterated.push(rel);
        });

        expect(iterated.length).to.eq(1);
        expect(iterated[0]).to.eq(relations.others);
        expect((iterated[0] as any).someData).to.eq(123);
    });

    it.skip(`they are equal`, async () => {
        expect(proxifyRelationsDefinitions(new Relations(), owner)).to.deep.eq(proxifyRelationsDefinitions(new Relations(), owner));
    });
});