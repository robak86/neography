import {expect} from 'chai';
import {NodeRelationsRepository} from "../../lib/repositories/NodeRelationsRepository";
import {Persisted} from "../../lib/model/GraphEntity";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {buildQuery} from "../../lib/index";
import {Connection} from "../../lib/connection/Connection";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import * as _ from 'lodash';

describe("NodeRelationsRepository", () => {
    let node1RelationsRepo:NodeRelationsRepository;
    let node1:Persisted<DummyGraphNode>;
    let node2:Persisted<DummyGraphNode>;
    let connection:Connection;


    beforeEach(async () => {
        await cleanDatabase();

        connection = getSharedConnection();
        let newNode1 = DummyGraphNode.build({attr1: 'a'});
        node1 = await connection.runQuery(q => q.create(c => c.node(newNode1).as('n')).returns('n')).pickOne('n').first();

        let newNode2 = DummyGraphNode.build({attr1: 'b'});
        node2 = await connection.runQuery(q => q.create(c => c.node(newNode2).as('n')).returns('n')).pickOne('n').first();
        node1RelationsRepo = new NodeRelationsRepository(node1, connection);
    });

    describe(".create", () => {
        it("creates new relation", async () => {
            await node1RelationsRepo.create(DummyGraphRelation.build({attr2: 123}), node2);

            let query = buildQuery()
                .literal(
                    `MATCH ({id: {params}.id})-[rel:CONNECTED_BY_DUMMY {attr2: 123}]->() RETURN rel`,
                    {params: {id: node1.id}}
                );
            let results = await connection.runQuery(query).toArray();

            expect(results[0]['rel'].attr2).to.eql(123);
        });

        it("adds params for persisted entity", async () => {
            let rel = await node1RelationsRepo.create(DummyGraphRelation.build({attr2: 123}), node2);

            expect(rel.id).to.be.a('string');
            expect(rel.createdAt).to.be.a('number');
            expect(rel.updatedAt).to.be.a('number');
        });
    });

    describe(".where", () => {
        it("returns array of relations matched by exact values", async () => {
            await node1RelationsRepo.create(DummyGraphRelation.build({attr2: 123}), node2);

            let connectedNodes = await node1RelationsRepo.where(DummyGraphRelation, {attr2: 123});
            expect(connectedNodes.length).to.eq(1);
            expect(connectedNodes[0].attr2).to.eql(123);
        });
    });

    describe(".getConnectedNodes", () => {
        it("returns all related nodes with relation", async () => {
            let rel = await node1RelationsRepo.create(DummyGraphRelation.build({attr2: 123}), node2);

            let connectedNodes = await node1RelationsRepo.getConnectedNodes(DummyGraphRelation);
            expect(connectedNodes.length).to.eq(1);
            expect(connectedNodes[0].relation).to.eql(rel);
            expect(connectedNodes[0].node).to.eql(node2);
        });
    });

    describe(".update", () => {
        let savedRelation:Persisted<DummyGraphRelation>,
            editedRelation:Persisted<DummyGraphRelation>;

        beforeEach(async () => {
            let newRelation = DummyGraphRelation.build({
                attr1: "321",
                attr2: 123,
                attr3: true
            });

            savedRelation = await node1RelationsRepo.create(DummyGraphRelation.build(newRelation), node2);
            editedRelation = _.clone(savedRelation);
        });

        it("updates relation with provided params", async () => {
            editedRelation.attr2 = 321;
            let updatedRelation = await node1RelationsRepo.update(editedRelation);
            expect(updatedRelation.attr1).to.eq("321");
        });

        it("does not change id", async () => {
            let updatedRelation = await node1RelationsRepo.update(editedRelation);
            expect(updatedRelation.id).to.eq(savedRelation.id);
        });

        it("does not modify other parameters", async () => {
            editedRelation.attr1 = "321";
            let updatedRelation = await node1RelationsRepo.update(editedRelation);
            expect(updatedRelation.attr2).to.eq(savedRelation.attr2);
            expect(updatedRelation.attr3).to.eq(savedRelation.attr3);
        });
    });

    describe(".remove", () => {
        it("removes relation", async () => {
            let rel = await node1RelationsRepo.create(DummyGraphRelation.build({attr2: 123}), node2);

            expect(await node1RelationsRepo.exists(DummyGraphRelation, rel.id)).to.eq(true);
            await node1RelationsRepo.remove(DummyGraphRelation, {id: rel.id});
            expect(await node1RelationsRepo.exists(DummyGraphRelation, rel.id)).to.eq(false);
        });
    });
});