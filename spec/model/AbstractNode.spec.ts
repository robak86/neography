import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import {sleep} from "../../lib/utils/promise";
import {buildQuery} from "../../lib/cypher";

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

        it("creates new buildNode", async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();

            let query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: node.id});
            let nodes = await getSharedConnection().runQuery(query).pluck('n').toArray();

            expect(nodes[0].id).to.eql(node.id);
            expect(nodes[0].createdAt).to.eql(node.createdAt);
            expect(nodes[0].updatedAt).to.eql(node.updatedAt);
            expect(nodes[0].attr1).to.eql(node.attr1);
        });

        it("return created entity having Persisted", async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();

            expect(node.id).to.be.a('string');
            expect(node.createdAt).to.be.a('Date');
            expect(node.updatedAt).to.be.a('Date');
        });

        it("does not store additional params", async () => {
            let node = new DummyGraphNode({attr1: 'some data'});
            await node.save();

            expect(Object.keys(node.attributes).sort())
                .to.eql(['attr1', 'attr2', 'id', 'createdAt', 'updatedAt'].sort());
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

            let updatedAt = node.updatedAt;

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

    describe('.remove', () => {
        it(`removes given node`);
        it(`removes id from entity instance`);
    })
});