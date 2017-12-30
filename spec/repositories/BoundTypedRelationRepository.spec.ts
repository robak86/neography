import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import * as _ from "lodash";
import {expect} from "chai";
import {BoundTypedRelationRepository} from "../../lib/repositories/BoundTypedRelationRepository";


describe("BoundTypedRelationRepository", () => {
    let nodeRepository:NodeRepository<DummyGraphNode>,
        connection:Connection,
        relationRepository:BoundTypedRelationRepository<DummyGraphNode, DummyGraphRelation, DummyGraphNode>;

    let savedRelation:DummyGraphRelation,
        editedRelation:DummyGraphRelation;

    let u1,
        u2;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        nodeRepository = connection.nodeType(DummyGraphNode);

        u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'John'}));
        u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));

        relationRepository = connection.relationType(DummyGraphRelation).nodes(u1, u2);
    });

    beforeEach(async () => {
        let relation = new DummyGraphRelation({
            attr1: "321",
            attr2: 123,
            attr3: true
        });

        savedRelation = await connection
            .relationType(DummyGraphRelation)
            .node(u1)
            .connectTo(u2, relation);

        editedRelation = _.clone(savedRelation);
    });

    describe(".update", () => {
        it("updates relation with provided params", async () => {
            editedRelation.attr2 = 321;
            let updatedRelation = await relationRepository.update(editedRelation);
            expect(updatedRelation.attr1).to.eq("321");
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
            expect(await relationRepository.exists()).to.eq(true);
            await relationRepository.remove();
            expect(await relationRepository.exists()).to.eq(false);
        });
    });
});