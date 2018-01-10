import {proxifyRelationsDefinitions} from "../../lib/model/proxifyRelationsDefinitions";
import {ActiveRelation} from "../../lib/model/ActiveRelation";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import {AbstractNode} from "../../lib/model";

describe(`proxifyRelationsDefinitions`, () => {
    class Relations {
        readonly others = new ActiveRelation(DummyGraphRelation, DummyGraphNode);
    }

    let relations:Relations,
        owner:DummyGraphNode;

    beforeEach(() => {
        owner = new DummyGraphNode();
        (<any>owner).id = 'in order to be persisted';
        relations = proxifyRelationsDefinitions(new Relations(), owner);
    });

    it('intercepts all getters and returns cloned ActiveRelation with bound owner', () => {
        let boundNode:AbstractNode<any> = relations.others.boundNode;
        expect(boundNode).to.eq(owner);
    });

    it('caches relations', () => {
        expect(relations.others).to.eq(relations.others);
    });
});