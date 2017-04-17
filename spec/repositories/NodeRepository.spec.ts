import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {cleanDatabase, getConnection} from "../helpers/ConnectionHelpers";
import {Persisted} from "../../lib/model/GraphEntity";
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

    describe(".save", () => {
        let createdGenericNode:Persisted<DummyGraphNode>;
        beforeEach(async () => {
            createdGenericNode = await nodeRepository.save(dummyNode);
        });

        it("returns created entity having proper params", async () => {
            expect(createdGenericNode).to.be.instanceof(DummyGraphNode);
            expect(createdGenericNode.attr1).to.eql(dummyNode.attr1);

        });

        it("return created entity having Persisted", () => {
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

    describe(".exists", () => {
        it("returns true if buildNode exists", async () => {
            let node = DummyGraphNode.build({attr1: 'Tomasz'});
            let storedNode:Persisted<DummyGraphNode> = await nodeRepository.save(node);
            expect(await nodeRepository.exists(storedNode.id)).to.eq(true);
        });

        it("returns false if buildNode does not exists", async () => {
            expect(await nodeRepository.exists('WRONG NODE ID')).to.eq(false);
        });
    });

    describe(".getNodeById", () => {
        it("returns fetched buildNode if exists", async () => {
            let createdGenericNode = await nodeRepository.save(dummyNode);
            let retrievedGenericNodes:Persisted<DummyGraphNode>[] = await nodeRepository.where({id: createdGenericNode.id as string});
            expect(retrievedGenericNodes[0]).to.eql(createdGenericNode);
        });

        it("returns null if buildNode does not exist", async () => {
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
            let to = await nodeRepository.save(DummyGraphNode.build({attr1: 'Jane'}));

            let createdRelation = await relationRepository.save(from, to, DummyGraphRelation.build({}));
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
        let savedNode:Persisted<DummyGraphNode>;

        beforeEach(async () => {
            savedNode = await nodeRepository.save(DummyGraphNode.build({attr1: 'John'}));
        });

        it("updates with provided params", async () => {
            let edited:Persisted<DummyGraphNode> = _.cloneDeep(savedNode);
            edited.attr1 = 'updateFirstName';
            (edited as any).attr2 = null;
            let result = await nodeRepository.update(edited);
            expect(_.omit('updatedAt', result)).to.eql(_.omit('updatedAt', edited))
        });

        it("updates updatedAt property", async () => {
            let result = await nodeRepository.update(savedNode);
            expect(result.updatedAt).to.be.greaterThan(savedNode.updatedAt);
        });
    });
});