import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {buildQuery} from "../../lib/cypher";
import {RelationRepository} from "../../lib/repositories/RelationRepository";


describe.only("RelationRepository", () => {
    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:RelationRepository<DummyGraphNode, DummyGraphRelation, DummyGraphNode>,
        connection:Connection;

    let u1:DummyGraphNode,
        u2:DummyGraphNode,
        u3:DummyGraphNode;


    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.getNodeRepository(DummyGraphNode);
        relationRepository = connection.getRelationRepository(DummyGraphNode, DummyGraphRelation, DummyGraphNode);
        u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'Tom'}));
        u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));
        u3 = await nodeRepository.save(new DummyGraphNode({attr1: 'Jack'}));
    });

    describe(".connectNodes", () => {
        it("creates relation", async () => {
            let rel = await relationRepository.connectNodes(u1, u2, new DummyGraphRelation({attr2: 123}));
            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY {attr2: 123}]->() RETURN rel`);
            let result = await connection.runQuery(query).pluck('rel').first();

            expect(result.attr2).to.eql(rel.attr2);
        });

        it('creates relation without any attributes if relation is not passed to .connectNodes()', async () => {
            let rel = await relationRepository.connectNodes(u1, u2);
            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY]->() RETURN rel`);
            let results = await connection.runQuery(query).pluck('rel').first();
            expect(results.id).to.eql(rel.id);
        });

        it("adds params for persisted entity", async () => {
            let rel = await relationRepository.connectNodes(u1, u2, new DummyGraphRelation({attr2: 123}));

            expect(rel.id).to.be.a('string');
            expect(rel.createdAt).to.be.a('Date');
            expect(rel.updatedAt).to.be.a('Date');
        });
    });

    describe(".getConnectedNodes", () => {
        it('returns all connected nodes', async () => {
            await relationRepository.connectNodes(u1, u2);
            await relationRepository.connectNodes(u1, u3);
            let connected = await relationRepository.getConnectedNodes(u1);
            connected = connected.sort(n => (<any>n).node.createdAt.getTime());

            expect(connected[0].node).to.eql(u2);
            expect(connected[1].node).to.eql(u3);
            expect(connected.length).to.eq(2);
        });

        it('filters relations', async () => {
            await relationRepository.connectNodes(u1, u2, new DummyGraphRelation({attr1: '1'}));
            await relationRepository.connectNodes(u1, u3, new DummyGraphRelation({attr1: '2'}));
            let connected = await relationRepository.getConnectedNodes(u1, {attr1: '1'});
            expect(connected.length).to.eq(1);
            expect(connected[0].node).to.eql(u2);
        });
    });

    describe(".remove", () => {
        it("removes relation", async () => {
            let u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'Tom'}));
            let u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));
            let rel = await relationRepository.connectNodes(u1, u2, new DummyGraphRelation({attr2: 123}));

            expect(await relationRepository.exists(rel.id)).to.eq(true);
            await relationRepository.remove(rel);
            expect(await relationRepository.exists(rel.id)).to.eq(false);
        });
    });

    describe(".update", () => {
        let savedRelation:DummyGraphRelation,
            editedRelation:DummyGraphRelation;

        beforeEach(async () => {
            let u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'John'}));
            let u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));

            savedRelation = await relationRepository.connectNodes(u1, u2, new DummyGraphRelation({
                attr1: "321",
                attr2: 123,
                attr3: true
            }));
            editedRelation = _.clone(savedRelation);
        });

        it("updates relation with provided params", async () => {
            editedRelation.attr2 = 321;
            let updatedRelation = await relationRepository.update(editedRelation);
            expect(updatedRelation.attr1).to.eq("321");
        });

        it("does not change id", async () => {
            let updatedRelation = await relationRepository.update(editedRelation);
            expect(updatedRelation.id).to.eq(savedRelation.id);
        });

        it("does not modify other parameters", async () => {
            editedRelation.attr1 = "321";
            let updatedRelation = await relationRepository.update(editedRelation);
            expect(updatedRelation.attr2).to.eq(savedRelation.attr2);
            expect(updatedRelation.attr3).to.eq(savedRelation.attr3);
        });
    });
});