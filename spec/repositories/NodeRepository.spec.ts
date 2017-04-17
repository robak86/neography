import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {cleanDatabase, getConnection} from "../helpers/ConnectionHelpers";
import {PersistedGraphEntity} from "../../lib/model/GraphEntity";
import {Connection} from "../../lib/connection/Connection";
import {buildQuery} from "../../lib/cypher/index";

import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {RelationRepository} from "../../lib/repositories/RelationRepository";


describe("NodeRepository", () => {

    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:RelationRepository<DummyGraphNode, DummyGraphRelation, DummyGraphNode>,
        dummyNode:DummyGraphNode,
        connection:Connection;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getConnection();
        nodeRepository = connection.getNodeRepository(DummyGraphNode);
        relationRepository = connection.getRelationRepository(DummyGraphNode, DummyGraphRelation, DummyGraphNode);
        dummyNode = DummyGraphNode.build({attr1: "John"});
    });

    describe(".saveNode", () => {
        let createdGenericNode:PersistedGraphEntity<DummyGraphNode>;
        beforeEach(async () => {
            createdGenericNode = await nodeRepository.saveNode(dummyNode);
        });

        it("returns created entity having proper params", async () => {
            expect(createdGenericNode).to.be.instanceof(DummyGraphNode);
            expect(createdGenericNode.attr1).to.eql(dummyNode.attr1);

        });

        it("return created entity having PersistedEntityParams", () => {
            expect(createdGenericNode.id).to.be.a('string');
            expect(createdGenericNode.createdAt).to.be.a('number');
            expect(createdGenericNode.updatedAt).to.be.a('number');
        });

        it("does not store additional params", () => {
            expect(Object.keys(createdGenericNode).sort())
                .to.eql(['attr1', 'id', 'createdAt', 'updatedAt'].sort());
        });

        it("creates new buildNode", async () => {
            let query = buildQuery().literal(`MATCH(n {id: {id}}) return n`, {id: createdGenericNode.id});
            let nodes = await connection.runQuery(query).pickOne('n').toArray();

            expect(nodes[0].id).to.eql(createdGenericNode.id);
            expect(nodes[0].createdAt).to.eql(createdGenericNode.createdAt);
            expect(nodes[0].updatedAt).to.eql(createdGenericNode.updatedAt);
            expect(nodes[0].attr1).to.eql(createdGenericNode.attr1);
        });
    });

    describe(".nodeExists", () => {
        it("returns true if buildNode exists", async () => {
            let node = DummyGraphNode.build({attr1: 'Tomasz'});
            let storedNode:PersistedGraphEntity<DummyGraphNode> = await nodeRepository.saveNode(node);
            expect(await nodeRepository.nodeExists(storedNode.id)).to.eq(true);
        });

        it("returns false if buildNode does not exists", async () => {
            expect(await nodeRepository.nodeExists('WRONG NODE ID')).to.eq(false);
        });
    });

    describe(".getNodeById", () => {
        it("returns fetched buildNode if exists", async () => {
            let createdGenericNode = await nodeRepository.saveNode(dummyNode);
            let retrievedGenericNodes:PersistedGraphEntity<DummyGraphNode>[] = await nodeRepository.where({id: createdGenericNode.id as string});
            expect(retrievedGenericNodes[0]).to.eql(createdGenericNode);
        });

        it("returns null if buildNode does not exist", async () => {
            let retrievedGenericNode = await nodeRepository.where({id: 'non existing id :D'});
            expect(retrievedGenericNode[0]).to.eq(undefined);
        });
    });

    describe(".removeNode", () => {
        it("removes node", async () => {
            let createdNode = await nodeRepository.saveNode(dummyNode);
            expect(await nodeRepository.nodeExists(createdNode.id)).to.eq(true);
            await nodeRepository.removeNode(createdNode.id);
            expect(await nodeRepository.nodeExists(createdNode.id)).to.eq(false);
        });

        it("removes all related relations", async () => {
            let from = await nodeRepository.saveNode(dummyNode);
            let to = await nodeRepository.saveNode(DummyGraphNode.build({attr1: 'Jane'}));

            let createdRelation = await relationRepository.saveRelation(from, to, DummyGraphRelation.build({}));
            expect(await nodeRepository.nodeExists(from.id)).to.eq(true);
            expect(await nodeRepository.nodeExists(to.id)).to.eq(true);
            expect(await relationRepository.relationExists(createdRelation.id)).to.eq(true);

            await nodeRepository.removeNode(from.id);

            expect(await nodeRepository.nodeExists(from.id)).to.eq(false);
            expect(await nodeRepository.nodeExists(to.id)).to.eq(true);
            expect(await relationRepository.relationExists(createdRelation.id)).to.eq(false);
        });
    });

    describe(".updateNode", () => {
        let savedNode:PersistedGraphEntity<DummyGraphNode>;

        beforeEach(async () => {
            savedNode = await nodeRepository.saveNode(DummyGraphNode.build({attr1: 'John'}));
        });

        it("updates with provided params", async () => {
            let edited:PersistedGraphEntity<DummyGraphNode> = _.cloneDeep(savedNode);
            edited.attr1 = 'updateFirstName';
            (edited as any).attr2 = null;
            let result = await nodeRepository.updateNode(edited);
            expect(_.omit('updatedAt', result)).to.eql(_.omit('updatedAt', edited))
        });

        it("updates updatedAt property", async () => {
            let result = await nodeRepository.updateNode(savedNode);
            expect(result.updatedAt).to.be.greaterThan(savedNode.updatedAt);
        });
    });
});