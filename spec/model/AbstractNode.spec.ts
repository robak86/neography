import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import {sleep} from "../../lib/utils/promise";

describe(`AbstractNode`, () => {

    const countDummyNodes = () => getSharedConnection().runQuery(q => q
        .match(m => [
            m.node(DummyGraphNode).as('n')
        ])
        .returns('count(n) as count')
    ).pluck('count').first();


    beforeEach(async () => {
        await cleanDatabase();
    });

    describe(`.save`, () => {
        it(`inserts new node if entity doesn't have id`, async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();
            expect(node.id).to.be.a('string');
        });

        it('inserts node', async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();

            let count = await getSharedConnection().runQuery(q => q
                .match(m => [
                    m.node(DummyGraphNode).params({id: node.id}).as('n')
                ])
                .returns('count(n) as count')
            ).pluck('count').first();

            expect(count).to.eq(1);
        });
    });

    describe(`.remove`, () => {
        it('removes itself', async () => {
             let createdNode:DummyGraphNode = await getSharedConnection().runQuery(q => q
                 .create(c => [
                     c.node(new DummyGraphNode({attr1: 123})).as('n')
                 ])
                 .returns('n')
             ).pluck('n').first();

            expect(await countDummyNodes()).to.eq(1);
            expect(createdNode.isPersisted()).to.eq(true);

            await createdNode.remove();
            expect(createdNode.isPersisted()).to.eq(false);
        });
    });

    describe(`.save for already persisted entity`, () => {
        it('updates data', async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();

            let count = await countDummyNodes();
            expect(count).to.eq(1);
            node.attr2 = 123;

            let updatedAt= node.updatedAt;

            await sleep(200);
            await node.save();

            expect(count).to.eq(1);

            let updated = await getSharedConnection().runQuery(q => q
                .match(m => [
                    m.node(DummyGraphNode).params({id: node.id}).as('n')
                ])
                .returns('n')
            ).pluck('n').first();

            expect(updated.attributes).to.deep.eq(node.attributes);
            expect(updatedAt).not.to.deep.eq(updated.updatedAt)
        });
    });

    describe('.remove',() => {
        it(`removes given node`);
        it(`removes id from entity instance`);
    })
});