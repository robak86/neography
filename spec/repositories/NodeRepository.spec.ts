import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";

import {Connection} from "../../lib";
import {buildQuery} from "../../lib/cypher";

import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {FromNodeRelationsRepository} from "../../lib/repositories/FromNodeRelationsRepository";
import {assertAllPersisted} from "../../lib/model";
import {RelationRepository} from "../../lib/repositories/RelationRepository";

describe("NodeRepository", () => {

    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:RelationRepository<DummyGraphRelation>,
        dummyNode:DummyGraphNode,
        connection:Connection;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.getNodeRepository(DummyGraphNode);
        relationRepository = connection.getRelationRepository(DummyGraphRelation);
        dummyNode = new DummyGraphNode({attr1: "John"});
    });

    describe(".save", () => {
        let createdGenericNode:DummyGraphNode;
        beforeEach(async () => {
            createdGenericNode = await nodeRepository.save(dummyNode);
        });

        it("returns created entity having proper params", async () => {
            expect(createdGenericNode).to.be.instanceof(DummyGraphNode);
            expect(createdGenericNode.attr1).to.eql(dummyNode.attr1);

        });

        it("return created entity having Persisted", () => {
            expect(createdGenericNode.id).to.be.a('string');
            expect(createdGenericNode.createdAt).to.be.a('Date');
            expect(createdGenericNode.updatedAt).to.be.a('Date');
        });

        it("does not store additional params", () => {
            expect(Object.keys(createdGenericNode).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());
        });

        it("creates new buildNode", async () => {
            let query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: createdGenericNode.id});
            let nodes = await connection.runQuery(query).pluck('n').toArray();

            expect(nodes[0].id).to.eql(createdGenericNode.id);
            expect(nodes[0].createdAt).to.eql(createdGenericNode.createdAt);
            expect(nodes[0].updatedAt).to.eql(createdGenericNode.updatedAt);
            expect(nodes[0].attr1).to.eql(createdGenericNode.attr1);
        });
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
            expect(Object.keys(savedNodes[0]).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());

            expect(Object.keys(savedNodes[1]).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());
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
        }).timeout(4000);
    });

    describe(".findByIds", () => {
        let n1:DummyGraphNode,
            n2:DummyGraphNode;

        beforeEach(async () => {
            n1 = await nodeRepository.save(new DummyGraphNode({attr1: 'n1'}));
            n2 = await nodeRepository.save(new DummyGraphNode({attr1: 'n2'}));
        });

        it('fetches all nodes with given ids', async () => {
            let fetched = await nodeRepository.findByIds([n1.id, n2.id]);
            fetched = <any>_.sortBy(fetched, (e) => (<any>e.createdAt).getTime()); //TODO: we should not sort result. Elements should be returned in correct order

            expect(fetched.length).to.eq(2);
            expect(fetched).to.eql([n1, n2])
        });
    });

    describe(".exists", () => {
        it("returns true if buildNode exists", async () => {
            let node = new DummyGraphNode({attr1: 'Tomasz'});
            let storedNode:DummyGraphNode = await nodeRepository.save(node);
            expect(await nodeRepository.exists(storedNode.id)).to.eq(true);
        });

        it("returns false if buildNode does not exists", async () => {
            expect(await nodeRepository.exists('WRONG NODE ID')).to.eq(false);
        });
    });

    describe(".first", () => {
        it("returns fetched dummyNode if exists", async () => {
            let createdGenericNode = await nodeRepository.save(dummyNode);
            let retrievedGenericNodes:DummyGraphNode | null = await nodeRepository.first({id: createdGenericNode.id as string});
            expect(retrievedGenericNodes).to.eql(createdGenericNode);
        });

        it("returns null if dummyNode does not exist", async () => {
            let retrievedGenericNode = await nodeRepository.where({id: 'non existing id :D'});
            expect(retrievedGenericNode[0]).to.eq(undefined);
        });
    });

    describe(".remove", () => {
        it("removes node", async () => {
            let createdNode = await nodeRepository.save(dummyNode);
            expect(await nodeRepository.exists(createdNode.id)).to.eq(true);
            await nodeRepository.remove(createdNode.id);
            expect(await nodeRepository.exists(createdNode.id)).to.eq(false);
        });

        it("removes all related relations", async () => {
            let from = await nodeRepository.save(dummyNode);
            let to = await nodeRepository.save(new DummyGraphNode({attr1: 'Jane'}));

            let createdRelation = await relationRepository.from(from).connectTo(to, new DummyGraphRelation({}));
            expect(await nodeRepository.exists(from.id)).to.eq(true);
            expect(await nodeRepository.exists(to.id)).to.eq(true);
            expect(await relationRepository.exists(createdRelation.id)).to.eq(true);

            await nodeRepository.remove(from.id);

            expect(await nodeRepository.exists(from.id)).to.eq(false);
            expect(await nodeRepository.exists(to.id)).to.eq(true);
            expect(await relationRepository.exists(createdRelation.id)).to.eq(false);
        });
    });

    describe(".removeMany", () => {
        it("removes node", async () => {
            let n1 = await nodeRepository.save(new DummyGraphNode());
            let n2 = await nodeRepository.save(new DummyGraphNode());


            expect(await nodeRepository.exists(n1.id)).to.eq(true);
            expect(await nodeRepository.exists(n2.id)).to.eq(true);

            await nodeRepository.removeMany([n1.id, n2.id]);

            expect(await nodeRepository.exists(n1.id)).to.eq(false);
            expect(await nodeRepository.exists(n2.id)).to.eq(false);
        });

        it("removes all related relations", async () => {
            let from = await nodeRepository.save(dummyNode);
            let to = await nodeRepository.save(new DummyGraphNode({attr1: 'Jane'}));

            let createdRelation = await relationRepository.from(from).connectTo(to);
            expect(await nodeRepository.exists(from.id)).to.eq(true);
            expect(await nodeRepository.exists(to.id)).to.eq(true);
            expect(await relationRepository.exists(createdRelation.id)).to.eq(true);

            await nodeRepository.remove(from.id);

            expect(await nodeRepository.exists(from.id)).to.eq(false);
            expect(await nodeRepository.exists(to.id)).to.eq(true);
            expect(await relationRepository.exists(createdRelation.id)).to.eq(false);
        });
    });

    describe(".update", () => {
        let savedNode:DummyGraphNode;

        beforeEach(async () => {
            savedNode = await nodeRepository.save(new DummyGraphNode({attr1: 'John'}));
        });

        it("updates with provided params", async () => {
            let edited:DummyGraphNode = _.cloneDeep(savedNode);
            edited.attr1 = 'updateFirstName';
            edited.attr2 = 123;
            let result = await nodeRepository.update(edited);
            expect(_.omit(result, 'updatedAt')).to.eql(_.omit(edited, 'updatedAt'))
        });

        it("updates updatedAt property", async () => {
            let result = await nodeRepository.update(savedNode);
            expect(result.updatedAt).to.be.greaterThan((savedNode.updatedAt as Date).getTime());
        });
    });

    describe(".updateMany", () => {
        let savedNodes:DummyGraphNode[];
        let n1:DummyGraphNode,
            n2:DummyGraphNode;

        beforeEach(async () => {
            n1 = await nodeRepository.save(new DummyGraphNode({attr1: 'n1'}));
            n2 = await nodeRepository.save(new DummyGraphNode({attr1: 'n2'}));

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
            expect(Object.keys(savedNodes[0]).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());

            expect(Object.keys(savedNodes[1]).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());
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
        }).timeout(4000);
    });
});