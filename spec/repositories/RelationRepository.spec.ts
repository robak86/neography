import {expect} from 'chai';
import * as _ from 'lodash';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {Connection} from "../../lib/connection/Connection";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {buildQuery} from "../../lib/cypher/index";
import {Persisted} from "../../lib/model/GraphEntity";
import {RelationRepository} from "../../lib/repositories/RelationRepository";


describe("RelationRepository", () => {
    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:RelationRepository<DummyGraphNode, DummyGraphRelation, DummyGraphNode>,
        dummyNode:DummyGraphNode,
        connection:Connection;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.getNodeRepository(DummyGraphNode);
        relationRepository = connection.getRelationRepository(DummyGraphNode, DummyGraphRelation, DummyGraphNode);
        dummyNode = DummyGraphNode.build({attr1: "John"});
    });

    describe(".save", () => {
        it("creates relation", async () => {
            let u1 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Tom'}));
            let u2 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Glen'}));
            let rel = await relationRepository.save(u1, u2, DummyGraphRelation.build({attr2: 123}));

            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY {attr2: 123}]->() RETURN rel`);
            let results = await connection.runQuery(query).toArray();

            expect(results[0]['rel'].attr2).to.eql(123);
        });

        it("adds params for persisted entity", async () => {
            let u1 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Tom'}));
            let u2 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Glen'}));
            let rel = await relationRepository.save(u1, u2, DummyGraphRelation.build({attr2: 123}));

            expect(rel.id).to.be.a('string');
            expect(rel.createdAt).to.be.a('number');
            expect(rel.updatedAt).to.be.a('number');
        });
    });

    describe(".remove", () => {
        it("removes relation", async () => {
            let u1 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Tom'}));
            let u2 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Glen'}));
            let rel = await relationRepository.save(u1, u2, DummyGraphRelation.build({attr2: 123}));

            expect(await relationRepository.exists(rel.id)).to.eq(true);
            await relationRepository.remove(rel.id);
            expect(await relationRepository.exists(rel.id)).to.eq(false);
        });
    });

    describe(".update", () => {
        let savedRelation:Persisted<DummyGraphRelation>,
            editedRelation:Persisted<DummyGraphRelation>;

        beforeEach(async () => {
            let u1 = await nodeRepository.save(DummyGraphNode.build({attr1: 'John'}));
            let u2 = await nodeRepository.save(DummyGraphNode.build({attr1: 'Glen'}));

            savedRelation = await relationRepository.save(u1, u2, DummyGraphRelation.build({
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