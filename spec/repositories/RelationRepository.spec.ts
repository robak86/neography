import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {RelationRepository} from "../../lib/repositories/RelationRepository";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import * as _ from "lodash";
import {expect} from "chai";

describe("RelationRepository", () => {
    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:RelationRepository<DummyGraphRelation>,
        connection:Connection;

    let u1:DummyGraphNode,
        u2:DummyGraphNode,
        u3:DummyGraphNode;


    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.getNodeRepository(DummyGraphNode);
        relationRepository = connection.getRelationRepository(DummyGraphRelation);
        u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'Tom'}));
        u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));
        u3 = await nodeRepository.save(new DummyGraphNode({attr1: 'Jack'}));
    });

    describe(".update", () => {
        let savedRelation:DummyGraphRelation,
            editedRelation:DummyGraphRelation;

        beforeEach(async () => {
            let u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'John'}));
            let u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));

            savedRelation = await relationRepository.from(u1).connectTo(u2, new DummyGraphRelation({
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

    describe(".remove", () => {
        it("removes relation", async () => {
            let u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'Tom'}));
            let u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));
            let rel = await relationRepository.from(u1).connectTo(u2, new DummyGraphRelation({attr2: 123}));

            expect(await relationRepository.exists(rel.id)).to.eq(true);
            await relationRepository.remove(rel);
            expect(await relationRepository.exists(rel.id)).to.eq(false);
        });
    });
});