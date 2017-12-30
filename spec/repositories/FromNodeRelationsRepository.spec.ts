import {expect} from 'chai';
import {NodeRepository} from "../../lib/repositories/NodeRepository";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {buildQuery} from "../../lib/cypher";
import {FromNodeRelationsRepository} from "../../lib/repositories/FromNodeRelationsRepository";
import {UnboundRelationRepository} from "../../lib/repositories/UnboundRelationRepository";
import {ConnectedNode} from "../../lib/model/ConnectedNode";


describe("FromNodeRelationsRepository", () => {
    let nodeRepository:NodeRepository<DummyGraphNode>,
        relationRepository:UnboundRelationRepository<DummyGraphRelation>,
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

    describe(".connectTo", () => {
        it("creates relation", async () => {
            let rel = await relationRepository
                .forNode(u1)
                .connectTo(u2, new DummyGraphRelation({attr2: 123}));


            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY {attr2: 123}]->() RETURN rel`);
            let result = await connection.runQuery(query).pluck('rel').first();

            expect(result.attr2).to.eql(rel.attr2);
        });

        it('creates relation without any attributes if relation is not passed to .connectTo()', async () => {
            let rel = await relationRepository.forNode(u1).connectTo(u2, new DummyGraphRelation({attr1: '1'}));
            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY {attr1: "1"}]->() RETURN rel`);
            let results = await connection.runQuery(query).pluck('rel').first();
            expect(results.attr1).to.eql(rel.attr1);
        });

        it("adds params for persisted entity", async () => {
            let rel = await relationRepository.forNode(u1).connectTo(u2, new DummyGraphRelation({attr2: 123}));

            expect(rel.createdAt).to.be.a('Date');
            expect(rel.updatedAt).to.be.a('Date');
        });
    });

    describe(".connectToMany", () => {
        it("creates relation", async () => {
            let rel:ConnectedNode<DummyGraphRelation, DummyGraphNode>[] = await relationRepository
                .forNode(u1)
                .connectToMany([u2, u3]);


            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY]->() RETURN rel`);
            let relations = await connection.runQuery(query).pluck('rel').toArray();

            expect(rel[0].relation).to.eql(relations[0]);
            expect(rel[1].relation).to.eql(relations[1]);
            expect(rel[0].node).to.eql(u2);
            expect(rel[1].node).to.eql(u3);
        });

        it('allows for setting own instance of relation', async () => {
            let rel:ConnectedNode<DummyGraphRelation, DummyGraphNode>[] = await relationRepository
                .forNode(u1)
                .connectToMany([
                    u2,
                    {relation: new DummyGraphRelation({attr1: 'custom'}), node: u3}
                ]);


            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY]->() RETURN rel`);
            let relations = await connection.runQuery(query).pluck('rel').toArray();

            expect(rel[0].relation).to.eql(relations[0]);
            expect(rel[1].relation).to.eql(relations[1]);
            expect(rel[0].node).to.eql(u2);
            expect(rel[1].node).to.eql(u3);
        });

        it('throws while connecting to not persisted node', () => {
            let connect = relationRepository
                .forNode(u1)
                .connectToMany([new DummyGraphNode()]);

            expect(connect).to.eventually.be.rejected;
        });
    });

    describe(".setConnectedNodes", () => {
        it('creates relation for attached nodes', async () => {
            // expect(await countRelations(DummyGraphRelation)).to.eq(0);
            //
            // await relationRepository.forNode(u1).setConnectedNodes([u2, u1]);
            // expect(await countRelations(DummyGraphRelation)).to.eq(2);


            // let connected = await relationRepository.forNode(u1).getConnectedNodes();
            //
            // connected = connected.sort(n => (<any>n).node.createdAt.getTime());
            //
            // expect(connected[0].node).to.eql(u2);
            // expect(connected[1].node).to.eql(u3);
            // expect(connected.length).to.eq(2);
        });
    });

    describe(".getConnectedNodes", () => {
        it('returns all connected nodes', async () => {
            await relationRepository.forNode(u1).connectTo(u2);
            await relationRepository.forNode(u1).connectTo(u3);
            let connected = await relationRepository.forNode(u1).getConnectedNodes();
            connected = connected.sort(n => (<any>n).node.createdAt.getTime());

            expect(connected[0].node).to.eql(u2);
            expect(connected[1].node).to.eql(u3);
            expect(connected.length).to.eq(2);
        });

        it('filters relations', async () => {
            await relationRepository.forNode(u1).connectTo(u2, new DummyGraphRelation({attr1: '1'}));
            await relationRepository.forNode(u1).connectTo(u3, new DummyGraphRelation({attr1: '2'}));
            let connected = await relationRepository.forNode(u1).getConnectedNodes({attr1: '1'});
            expect(connected.length).to.eq(1);
            expect(connected[0].node).to.eql(u2);
        });
    });

    describe(".detachNodes", () => {
        it('returns all connected nodes', async () => {
            let query = buildQuery().literal(`MATCH ()-[rel:CONNECTED_BY_DUMMY]->() RETURN count(rel) as count`);

            let rel1:DummyGraphRelation = await relationRepository.forNode(u1).connectTo(u2);
            let rel2:DummyGraphRelation = await relationRepository.forNode(u1).connectTo(u3);
            let count = await connection.runQuery(query).pluck('count').first();
            expect(count.toNumber()).to.eq(2);

            await relationRepository.forNode(u1).detachNodes([u2, u3]);

            count = await connection.runQuery(query).pluck('count').first();
            expect(count.toNumber()).to.eq(0);
        });
    });
});