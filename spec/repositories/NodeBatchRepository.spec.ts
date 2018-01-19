import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeBatchRepository} from "../../lib/repositories/NodeBatchRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";

import {Connection} from "../../lib";
import {buildQuery} from "../../lib/cypher";
import {assertAllPersisted} from "../../lib/model";


describe("NodeBatchRepository", () => {
    let nodeRepository:NodeBatchRepository<DummyGraphNode>,
        dummyNode:DummyGraphNode,
        connection:Connection;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.nodeBatchRepository(DummyGraphNode);
        dummyNode = new DummyGraphNode({attr1: "John"});
    });

    describe(".saveMany", () => {
        let savedNodes:DummyGraphNode[];
        let n1:DummyGraphNode,
            n2:DummyGraphNode;

        beforeEach(async () => {
            n1 = new DummyGraphNode({attr1: 'n1'});
            n2 = new DummyGraphNode({attr1: 'n2'});
            savedNodes = await nodeRepository.saveMany([n1, n2]);
        });

        it('returns all saved nodes', () => {
            expect(savedNodes.length).to.eq(2);
        });

        it('maps returned data to instances of correct class', () => {
            expect(savedNodes[0]).to.be.instanceof(DummyGraphNode);
            expect(savedNodes[1]).to.be.instanceof(DummyGraphNode);
        });

        it("sets correct properties for returned nodes", async () => {
            expect(savedNodes[0].attr1).to.eql(n1.attr1);
            expect(savedNodes[1].attr1).to.eql(n2.attr1);
        });

        it("sets id, createdAt and updatedAt properties for saved nodes", () => {
            expect(savedNodes[0].id).to.be.a('string');
            expect(savedNodes[0].createdAt).to.be.a('Date');
            expect(savedNodes[0].updatedAt).to.be.a('Date');

            expect(savedNodes[1].id).to.be.a('string');
            expect(savedNodes[1].createdAt).to.be.a('Date');
            expect(savedNodes[1].updatedAt).to.be.a('Date');
        });

        it("does not store additional params", () => {
            expect(Object.keys(savedNodes[0].attributes).sort())
                .to.eql(['attr1', 'attr2', 'id', 'createdAt', 'updatedAt'].sort());

            expect(Object.keys(savedNodes[1].attributes).sort())
                .to.eql(['attr1', 'attr2', 'id', 'createdAt', 'updatedAt'].sort());
        });

        it("creates nodes", async () => {
            let query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: savedNodes[0].id});
            let n1 = await connection.runQuery(query).pluck('n').first();

            query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: savedNodes[1].id});
            let n2 = await connection.runQuery(query).pluck('n').first();

            expect(savedNodes[0].id).to.eql(n1.id);
            expect(savedNodes[0].createdAt).to.eql(n1.createdAt);
            expect(savedNodes[0].updatedAt).to.eql(n1.updatedAt);
            expect(savedNodes[0].attr1).to.eql(n1.attr1);

            expect(savedNodes[1].id).to.eql(n2.id);
            expect(savedNodes[1].createdAt).to.eql(n2.createdAt);
            expect(savedNodes[1].updatedAt).to.eql(n2.updatedAt);
            expect(savedNodes[1].attr1).to.eql(n2.attr1);
        });

        it('returns empty array if passed array is empty', async () => {
            savedNodes = await nodeRepository.saveMany([]);
            expect(savedNodes.length).to.eq(0);
        });

        it('accepts up to 100 nodes', async () => {
            let nodes = _.times(100).map((id) => new DummyGraphNode({attr1: id.toString()}));
            let storedNodes = await nodeRepository.saveMany(nodes);
            assertAllPersisted(storedNodes);
        }).timeout(40000);
    });


    describe(".removeMany", () => {
        it("removes node", async () => {
            let n1 = new DummyGraphNode();
            await n1.save();
            let n2 = new DummyGraphNode();
            await n2.save();

            expect(await connection.nodeQuery(DummyGraphNode).count()).to.eq(2);
            await nodeRepository.removeMany([n1, n2]);
            expect(await connection.nodeQuery(DummyGraphNode).count()).to.eq(0);
        });

        it("removes all related relations");
    });

    describe(".updateMany", () => {
        let savedNodes:DummyGraphNode[];
        let n1:DummyGraphNode,
            n2:DummyGraphNode;

        beforeEach(async () => {
            n1 = new DummyGraphNode({attr1: 'n1'});
            await n1.save();
            n2 = new DummyGraphNode({attr1: 'n2'});
            await n2.save();

            n1.attr1 = 'n1Updated';
            n2.attr1 = 'n2Updated';

            savedNodes = await nodeRepository.updateMany([n1, n2]);
        });

        it('returns all saved nodes', () => {
            expect(savedNodes.length).to.eq(2);
        });

        it('maps returned data to instances of correct class', () => {
            expect(savedNodes[0]).to.be.instanceof(DummyGraphNode);
            expect(savedNodes[1]).to.be.instanceof(DummyGraphNode);
        });

        it("sets correct properties for returned nodes", async () => {
            expect(savedNodes[0].attr1).to.eql(n1.attr1);
            expect(savedNodes[1].attr1).to.eql(n2.attr1);
        });

        it("sets id, createdAt and updatedAt properties for saved nodes", () => {
            expect(savedNodes[0].id).to.be.a('string');
            expect(savedNodes[0].createdAt).to.be.a('Date');
            expect(savedNodes[0].updatedAt).to.be.a('Date');

            expect(savedNodes[1].id).to.be.a('string');
            expect(savedNodes[1].createdAt).to.be.a('Date');
            expect(savedNodes[1].updatedAt).to.be.a('Date');
        });

        it("does not store additional params", () => {
            expect(Object.keys(savedNodes[0].attributes).sort())
                .to.eql(['attr1', 'attr2', 'id', 'createdAt', 'updatedAt'].sort());

            expect(Object.keys(savedNodes[1].attributes).sort())
                .to.eql(['attr1', 'attr2', 'id', 'createdAt', 'updatedAt'].sort());
        });

        it("creates nodes", async () => {
            let query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: savedNodes[0].id});
            let n1 = await connection.runQuery(query).pluck('n').first();

            query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: savedNodes[1].id});
            let n2 = await connection.runQuery(query).pluck('n').first();

            expect(savedNodes[0].id).to.eql(n1.id);
            expect(savedNodes[0].createdAt).to.eql(n1.createdAt);
            expect(savedNodes[0].updatedAt).to.eql(n1.updatedAt);
            expect(savedNodes[0].attr1).to.eql(n1.attr1);

            expect(savedNodes[1].id).to.eql(n2.id);
            expect(savedNodes[1].createdAt).to.eql(n2.createdAt);
            expect(savedNodes[1].updatedAt).to.eql(n2.updatedAt);
            expect(savedNodes[1].attr1).to.eql(n2.attr1);
        });

        it('returns empty array if passed array is empty', async () => {
            savedNodes = await nodeRepository.saveMany([]);
            expect(savedNodes.length).to.eq(0);
        });

        it('accepts up to 100 nodes', async () => {
            let storedNodes = await nodeRepository.saveMany(
                _.times(100).map((id) => new DummyGraphNode({attr1: id.toString()}))
            );

            assertAllPersisted(storedNodes);
            storedNodes.forEach(node => node.attr1 = 'updated');
            let updatedNodes = await nodeRepository.updateMany(storedNodes);
            expect(updatedNodes.every(node => node.attr1 === 'updated')).to.eq(true);
        }).timeout(40000);
    });
});