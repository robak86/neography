import {expect} from 'chai';
import {cypher} from "../../lib/cypher/builders/QueryBuilder";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {createConnectionFactory} from "../helpers/ConnectionHelpers";
import {ChildDummyGraphNode} from "../fixtures/ChildDummyGraphNode";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {expectIsNowTimeStamp} from "../helpers/assertions";



describe("cypherDSL", () => {
    const getConnection = createConnectionFactory();

    describe("Match", () => {
        describe("single node", () => {
            beforeEach(async() => {
                await getConnection().runQuery(q => q.literal(`CREATE (n:DummyGraphNode {attr1: "abc"}) return n`)).toArray();
            });

            it("matches any node", async() => {
                let rows = await getConnection().runQuery(c => c
                    .match(m => m.node().as('n1'))
                    .returns('n1')
                ).toArray();

                expect(rows.length).to.eql(1);
                expect(rows[0].n1.attr1).to.eql('abc')
            });

            it("match by attribute", async() => {
                let q = cypher()
                    .match(m => m.node(DummyGraphNode).params({attr1: "abc"}).as('n1'))
                    .returns('n1');

                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eql(1);
                expect(rows[0].n1.attr1).to.eql('abc')
            });

            it("match using where", async() => {
                let q = cypher()
                    .match(m => m.node(DummyGraphNode).as('n1'))
                    .where(`n1.attr1 = "abc"`)
                    .returns('n1');


                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eql(1);
                expect(rows[0].n1.attr1).to.eql('abc')
            });

            it("match using where with params", async() => {
                let q = cypher()
                    .match(m => m.node(DummyGraphNode).as('n1'))
                    .where(w => w.literal(`n1.attr1 = {n1Attr1}`).params({n1Attr1: "abc"}))
                    .returns('n1');


                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eql(1);
                expect(rows[0].n1.attr1).to.eql('abc')
            });
        });

        describe("matching node with multiple labels(inheritance)", () => {
            beforeEach(async() => {
                await getConnection().runQuery(q => q.literal(`CREATE (n:DummyGraphNode {attr1: "abc"}) return n`)).toArray();
                await getConnection().runQuery(q => q.literal(`CREATE (n:ChildDummyGraphNode:DummyGraphNode {attr1: "abc" }) return n`)).toArray();
                await getConnection().runQuery(q => q.literal(`CREATE (n:DummyGraphNode:ChildDummyGraphNode {attr1: "abc" }) return n`)).toArray();
            });

            it("matches also subclasses", async () => {
                let rows:any[] = await getConnection().runQuery(q => q
                    .match(m => m.node(DummyGraphNode).as('n').params({attr1: "abc"}))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(3);
                expect(rows[0].n).to.be.instanceOf(DummyGraphNode);
                expect(rows[1].n).to.be.instanceOf(ChildDummyGraphNode);
                expect(rows[2].n).to.be.instanceOf(ChildDummyGraphNode);
            });

            it("does not returns parent classes", async () => {
                let rows:any[] = await getConnection().runQuery(q => q
                    .match(m => m.node(ChildDummyGraphNode).as('n').params({attr1: "abc"}))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(2);
                expect(rows[0].n).to.be.instanceOf(ChildDummyGraphNode);
                expect(rows[1].n).to.be.instanceOf(ChildDummyGraphNode);
            });

        });

        describe("nodes connected with relation", () => {
            beforeEach(async() => {
                await getConnection().runQuery(q => q.literal(`
                CREATE (n1:DummyGraphNode {n1Params})-[rel:CONNECTED_BY_DUMMY {relParams}]->(z:DummyGraphNode {n2Params})`,
                    {
                        n1Params: {attr1: 'abc'},
                        relParams: {attr1: 'relationAttr1'},
                        n2Params: {attr2: 123}
                    }
                )).toArray();
            });

            it("matches by starting node attribute", async() => {
                let q = cypher()
                    .match(m => [
                        m.node(DummyGraphNode).params({attr1: "abc"}).as('n1'),
                        m.relation(DummyGraphRelation).direction('->').as('rel1'),
                        m.node(DummyGraphNode).as('n2')
                    ])
                    .returns('n1', 'rel1', 'n2');

                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eql(1);

                expect(rows[0].n1.attr1).to.eql("abc");
                expect(rows[0].rel1.attr1).to.eql('relationAttr1');
                expect(rows[0].n2.attr2).to.eql(123);
            });
        });
    });

    describe("Create", () => {
        describe("single node", () => {
            it("creates single node", async() => {
                let node = DummyGraphNode.build({attr1: 'attr1', attr2: 123});
                let q = cypher()
                    .create(c => c.node(node).as('n1'))
                    .returns('n1');


                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eq(1);
                expect(rows[0].n1.attr1).to.eq('attr1');
                expect(rows[0].n1.attr2).to.eq(123);
                expect(rows[0].n1.createdAt).to.be.a('number');
                let now = new Date().getTime();
                expect(Math.abs(rows[0].n1.createdAt - now)).to.be.below(1000); //1ms;
                expect(Math.abs(rows[0].n1.updatedAt - now)).to.be.below(1000); //1ms;
            });
        });

        describe("single node with multiple labels(inheritance)", () => {
            it("creates single node", async() => {
                let node = ChildDummyGraphNode.build({attr1: 'attr1', attr2: 123, attr3: 'inheritance is bad, mkay'});
                let q = cypher()
                    .create(c => c.node(node).as('n1'))
                    .returns('n1');


                let rows = await getConnection().runQuery(q).toArray();
                expect(rows.length).to.eq(1);
                expect(rows[0].n1).to.be.instanceOf(ChildDummyGraphNode);
                expect(rows[0].n1.attr1).to.eq('attr1');
                expect(rows[0].n1.attr2).to.eq(123);
                expect(rows[0].n1.attr3).to.eq('inheritance is bad, mkay');
                expect(rows[0].n1.createdAt).to.be.a('number');
                let now = new Date().getTime();
                expect(Math.abs(rows[0].n1.createdAt - now)).to.be.below(1000); //1ms;
                expect(Math.abs(rows[0].n1.updatedAt - now)).to.be.below(1000); //1ms;
            });
        });

        describe("adding relation to nodes", () => {
            let n1:DummyGraphNode,
                n2:DummyGraphNode,
                rel1:DummyGraphRelation;

            beforeEach(() => {
                n1 = DummyGraphNode.build({attr1: 'n1Attr'});
                n2 = DummyGraphNode.build({attr1: 'n2Attr'});
                rel1 = DummyGraphRelation.build({attr1: 'rel1Attr'})
            });

            it("adds creates new relation", async() => {
                let created = await getConnection().runQuery(cypher => cypher
                    .create(c => c.node(n1).as('n1'))
                    .create(c => c.node(n2).as('n2'))
                    .returns('n1', 'n2')
                ).toArray();

                let n1Stored = created[0].n1;
                let n2Stored = created[0].n2;

                let rows = await getConnection().runQuery(cypher => cypher
                    .match(m => m.node(DummyGraphNode).params({id: created[0].n1.id}).as('n1'))
                    .match(m => m.node().params({id: created[0].n2.id}).as('n2'))
                    .create(c => [c.matchedNode('n1'), c.relation(rel1).as('rel1'), c.matchedNode('n2')])
                    .returns('n1', 'rel1', 'n2')
                ).toArray();

                expect(rows.length).to.eq(1);
                expect(rows[0].n1).to.eql(n1Stored);
                expect(rows[0].n2).to.eql(n2Stored);
                expect(rows[0].rel1.attr1).to.eq('rel1Attr');
                expectIsNowTimeStamp(rows[0].rel1.createdAt);
                expectIsNowTimeStamp(rows[0].rel1.updatedAt);
            });

        });
    });
});