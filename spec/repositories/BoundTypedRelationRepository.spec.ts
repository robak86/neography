import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {Connection} from "../../lib";
import {cleanDatabase, countRelations, getSharedConnection} from "../helpers/ConnectionHelpers";
import * as _ from "lodash";
import {expect} from "chai";
import {BoundTypedRelationRepository} from "../../lib/repositories/BoundTypedRelationRepository";


describe("BoundTypedRelationRepository", () => {
    let connection:Connection;

    let savedRelation:DummyGraphRelation,
        editedRelation:DummyGraphRelation;

    let u1,
        u2;

    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
        let nodeRepository:NodeRepository<DummyGraphNode> = connection.nodeType(DummyGraphNode);

        u1 = await nodeRepository.save(new DummyGraphNode({attr1: 'John'}));
        u2 = await nodeRepository.save(new DummyGraphNode({attr1: 'Glen'}));

    });

    describe("connected nodes", () => {
        let relationRepository:BoundTypedRelationRepository<DummyGraphNode, DummyGraphRelation, DummyGraphNode>;

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
            relationRepository = connection
                .relationType(DummyGraphRelation)
                .nodes(u1, u2)
        });

        describe(".updateRelation", () => {
            it("updates relation with provided params", async () => {
                editedRelation.attr2 = 321;
                let updatedRelation = await relationRepository.updateRelation(editedRelation);
                expect(updatedRelation.attr1).to.eq("321");
            });

            it("does not modify other parameters", async () => {
                editedRelation.attr1 = "321";
                let updatedRelation = await relationRepository.updateRelation(editedRelation);
                expect(updatedRelation.attr2).to.eq(savedRelation.attr2);
                expect(updatedRelation.attr3).to.eq(savedRelation.attr3);
            });
        });

        describe(".removeRelation", () => {
            it("removes relation", async () => {
                expect(await relationRepository.areConnected()).to.eq(true);
                await relationRepository.removeRelation();
                expect(await relationRepository.areConnected()).to.eq(false);
            });
        });
    });


    describe(".connectWith", () => {
        it('creates new relation', async () => {
            expect(await countRelations(DummyGraphRelation)).to.eq(0);

            await connection
                .relationType(DummyGraphRelation)
                .nodes(u1, u2)
                .connectWith(new DummyGraphRelation({attr1: '1'}));

            expect(await countRelations(DummyGraphRelation)).to.eq(1);

            let connected = await connection
                .relationType(DummyGraphRelation)
                .nodes(u1, u2)
                .connectWith(new DummyGraphRelation({attr1: '1'}));

            expect(connected).to.eq(true);
        });
    });
});