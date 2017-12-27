import {expect} from 'chai';
import {Connection, Neography} from "../../lib";
import {cleanDatabase, getDefaultNeography} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";

import {QueryBuilder} from "../../lib/cypher/builders/QueryBuilder";
import {int} from "../../lib/driver/Integer";
import {expectIsNowTimeStamp} from "../helpers/assertions";
import {ChildDummyGraphNode} from "../fixtures/ChildDummyGraphNode";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";

describe("Queries", () => {
    let neography:Neography,
        connection:Connection;

    beforeEach(async () => {
        neography = getDefaultNeography();
        connection = neography.checkoutConnection();
        await cleanDatabase();
    });

    describe("Creating nodes", () => {
        let newNode:DummyGraphNode;
        let q:QueryBuilder;

        beforeEach(async () => {
            newNode = new DummyGraphNode({attr1: 'attr1', attr2: 123});
            q = neography.query()
                .create(c => c.node(newNode).as('n'))
                .returns('n');
        });

        it("creates new node in database", async () => {
            const getNodesCount = () => connection
                .runQuery(q => q.literal('MATCH(n) RETURN count(n) as nodesCount'))
                .pickOne('nodesCount')
                .map(integer => integer.toNumber())
                .first();

            expect(await getNodesCount()).to.eq(0); //make sure that there is no nodes in database
            await connection.runQuery(q).toArray();
            expect(await getNodesCount()).to.eq(1);
        });

        describe("attributes", () => {
            let savedNode:DummyGraphNode,   //model instance returned by method which had inserted new node
                matchedNode:DummyGraphNode; //model instance fetched from database using match

            beforeEach(async () => {
                savedNode = await connection.runQuery(q).pickOne('n').first();
                matchedNode = await connection.runQuery(q => q.literal('MATCH(n {id: {params}.id}) RETURN n', {params: {id: savedNode.id}})).pickOne('n').first();
            });

            it("maps data to proper class", () => {
                expect(matchedNode).to.be.instanceof(DummyGraphNode);
            });

            it("stores nodes attributes", async () => {
                expect(newNode.attr1).to.eql(matchedNode.attr1);
                expect(newNode.attr2).to.eql(matchedNode.attr2);
            });

            it("sets value for id", () => {
                expect(matchedNode.id).to.be.a('string');
            });

            it("adds updatedAt and createdAt properties (TimestampsExtension enabled)", () => {
                expectIsNowTimeStamp(matchedNode.createdAt as number);
                expectIsNowTimeStamp(matchedNode.updatedAt as number);
            });

            describe("object returned by runQuery", () => {
                it("has proper type", () => {
                    expect(savedNode).to.be.instanceof(DummyGraphNode);
                });

                it("equals to matched node", () => {
                    expect(savedNode).to.eql(matchedNode);
                });
            });
        });
    });

    describe("Creating node inheriting from another node", () => {
        //TODO split expectations in more granular test cases and investigate if adding inheritance is good idea
        it("creates single node", async () => {
            let node = new ChildDummyGraphNode({attr1: 'attr1', attr2: 123, attr3: 'inheritance is bad, mkay'});
            let q = neography.query()
                .create(c => c.node(node).as('n'))
                .returns('n');

            let savedNode = await connection.runQuery(q).pickOne('n').first();
            expect(savedNode).to.be.instanceOf(ChildDummyGraphNode);
            expect(savedNode.attr1).to.eq('attr1');
            expect(savedNode.attr2).to.eq(123);
            expect(savedNode.attr3).to.eq('inheritance is bad, mkay');
            expect(savedNode.createdAt).to.be.a('number');
            expectIsNowTimeStamp(savedNode.createdAt);
            expectIsNowTimeStamp(savedNode.updatedAt);
        });
    });

    describe("Creating relations", () => {
        let node1:DummyGraphNode,
            node2:DummyGraphNode,
            newNode1 = new DummyGraphNode({attr1: 'n1Attr'}),
            newNode2 = new DummyGraphNode({attr1: 'n2Attr'});

        beforeEach(async () => {
            //create nodes which will be connected by relation
            let nodes = await connection.runQuery(q => q
                .create(c => c.node(newNode1).as('n1'))
                .create(c => c.node(newNode2).as('n2'))
                .returns('n1', 'n2')
            ).first();
            node1 = nodes.n1;
            node2 = nodes.n2;
        });

        describe("adding relation to nodes", () => {
            let newRelation:DummyGraphRelation,
                createRelationQuery:QueryBuilder;

            beforeEach(() => {
                newRelation = new DummyGraphRelation({attr1: 'rel1Attr'});
                createRelationQuery = neography.query()
                    .match(m => m.node(DummyGraphNode).params({id: node1.id}).as('n1'))
                    .match(m => m.node(DummyGraphNode).params({id: node2.id}).as('n2'))
                    .create(c => [
                        c.matchedNode('n1'),
                        c.relation(newRelation).as('rel1').direction('->'),
                        c.matchedNode('n2')])
                    .returns('n1', 'rel1', 'n2');
            });

            it("saves new relation into database", async () => {
                const getRelationsCount = () => connection
                    .runQuery(q => q.literal('MATCH(n1)-[rel]->(n2) RETURN count(rel) as relationsCount'))
                    .pickOne('relationsCount')
                    .map(integer => integer.toNumber())
                    .first();

                expect(await getRelationsCount()).to.eq(0); //make sure that there is no relations in database
                await connection.runQuery(createRelationQuery).toArray();
                expect(await getRelationsCount()).to.eq(1);
            });

            describe("attributes", () => {
                let savedRelation:DummyGraphRelation,
                    matchedRelation:DummyGraphRelation;

                beforeEach(async () => {
                    savedRelation = await connection.runQuery(createRelationQuery).pickOne('rel1').first();

                    let matchRelationQuery = neography.query()
                        .literal(
                            'MATCH (n1 {id: {params}.node1Id})-[rel]->(n2 {id: {params}.node2Id}) RETURN rel',
                            {params: {node1Id: node1.id, node2Id: node2.id}});

                    matchedRelation = await connection.runQuery(matchRelationQuery).pickOne('rel').first();
                });

                it("maps relation data to proper class", () => {
                    expect(matchedRelation).to.be.instanceof(DummyGraphRelation);
                });

                it("sets value for id property", () => {
                    expect(matchedRelation.id).to.be.a('string');
                });

                it("stores relation attributes", () => {
                    expect(matchedRelation.attr1).to.eq(newRelation.attr1);
                });

                it("adds updatedAt and createdAt properties (TimestampsExtension enabled)", () => {
                    expectIsNowTimeStamp(matchedRelation.createdAt as number);
                    expectIsNowTimeStamp(matchedRelation.updatedAt as number);
                });

                describe("object returned by runQuery", () => {
                    it("has proper type", () => {
                        expect(savedRelation).to.be.instanceof(DummyGraphRelation);
                    });

                    it("equals to matched node", () => {
                        expect(savedRelation).to.eql(matchedRelation);
                    });
                });
            });
        });
    });


    describe("Matching", () => {
        const saveNode = (node:DummyGraphNode):Promise<DummyGraphNode> => {
            let storeNodeQuery = neography.query()
                .create(c => c.node(node).as('n'))
                .returns('n');
            return connection.runQuery(storeNodeQuery).pickOne('n').first();
        };

        type CreatedRelation = { from:DummyGraphNode, rel:DummyGraphRelation, to:DummyGraphNode };

        const saveRelation = (n1:DummyGraphNode, rel:DummyGraphRelation, n2:DummyGraphNode):Promise<CreatedRelation> => {
            let createRelationQuery = neography.query()
                .match(m => [
                    m.node(DummyGraphNode).params({id: n1.id}).as('from'),
                    m.node(DummyGraphNode).params({id: n2.id}).as('to')
                ])
                .create(c => [
                    c.matchedNode('from'),
                    c.relation(rel).as('rel').direction('->'),
                    c.matchedNode('to')
                ])
                .returns('from', 'rel', 'to');

            return connection.runQuery(createRelationQuery).first();
        };

        describe("Matching nodes", () => {
            let node1:DummyGraphNode,
                node2:DummyGraphNode,
                node3:DummyGraphNode,
                node4:any;

            beforeEach(async () => {
                node1 = await saveNode(new DummyGraphNode({attr1: 'a', attr2: 0}));
                node2 = await saveNode(new DummyGraphNode({attr1: 'b', attr2: 1}));
                node3 = await saveNode(new DummyGraphNode({attr1: 'c', attr2: 2}));
                node4 = await connection.runQuery(q => q.literal(`CREATE (n {someAttr: 1}) RETURN n`)).pickOne('n').toArray();
            });

            describe("by exact attribute value", () => {
                it("matches nodes where given attributes are equal to provided params", async () => {
                    let matchQuery = neography.query().match(m => m.node(DummyGraphNode).params({attr1: 'a'}).as('n')).returns('n');
                    let matchedNodes:DummyGraphNode[] = await connection.runQuery(matchQuery).pickOne('n').toArray();
                    expect(matchedNodes.length).to.eq(1);
                    expect(matchedNodes[0]).to.eql(node1);
                });
            });

            describe("matching using where clause", () => {
                it("returns nodes matched by where literal expression", async () => {
                    let matchQuery = neography.query()
                        .match(m => m.node(DummyGraphNode).as('n'))
                        .where(w => w.literal('n.attr2 >= {val1}').params({val1: 1}))
                        .returns('n');

                    let matchedNodes:DummyGraphNode[] = await connection.runQuery(matchQuery).pickOne('n').toArray();
                    expect(matchedNodes.length).to.eq(2);
                    expect(matchedNodes[0]).to.eql(node2);
                    expect(matchedNodes[1]).to.eql(node3);
                });
            });

            describe("matching untyped nodes", () => {
                it("returns matched nodes", async () => {
                    let matchQuery = neography.query()
                        .match(m => m.node().params({someAttr: 1}).as('n'))
                        .returns('n');

                    let matchedNodes:any[] = await connection.runQuery(matchQuery).pickOne('n').toArray();
                    expect(matchedNodes.length).to.eq(1);
                    //matchedNodes[0] contains raw response from neo4j driver
                    expect(matchedNodes[0].properties).to.eql({someAttr: int(1)})
                });
            });
        });

        describe("Matching node with multiple labels(inheritance)", () => {
            //TODO: split expectations in more granular test cases. Add test cases where nodes using inheritance are created using query builder
            beforeEach(async () => {
                await connection.runQuery(q => q.literal(`CREATE (n:DummyGraphNode {attr1: "abc"}) return n`)).toArray();
                await connection.runQuery(q => q.literal(`CREATE (n:ChildDummyGraphNode:DummyGraphNode {attr1: "abc" }) return n`)).toArray();
                await connection.runQuery(q => q.literal(`CREATE (n:DummyGraphNode:ChildDummyGraphNode {attr1: "abc" }) return n`)).toArray();
            });

            it("matches also subclasses", async () => {
                let rows:any[] = await connection.runQuery(q => q
                    .match(m => m.node(DummyGraphNode).as('n').params({attr1: "abc"}))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(3);
                expect(rows[0].n).to.be.instanceOf(DummyGraphNode);
                expect(rows[1].n).to.be.instanceOf(ChildDummyGraphNode);
                expect(rows[2].n).to.be.instanceOf(ChildDummyGraphNode);
            });

            it("does not returns parent classes", async () => {
                let rows:any[] = await connection.runQuery(q => q
                    .match(m => m.node(ChildDummyGraphNode).as('n').params({attr1: "abc"}))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(2);
                expect(rows[0].n).to.be.instanceOf(ChildDummyGraphNode);
                expect(rows[1].n).to.be.instanceOf(ChildDummyGraphNode);
            });

        });

        describe("Matching relations", () => {
            let a:DummyGraphNode,
                b:DummyGraphNode,
                c:DummyGraphNode,
                a_rel_b:CreatedRelation,
                a_rel_c:CreatedRelation;

            beforeEach(async () => {
                a = await saveNode(new DummyGraphNode({attr1: 'a'}));
                b = await saveNode(new DummyGraphNode({attr1: 'b'}));
                c = await saveNode(new DummyGraphNode({attr1: 'c'}));
                a_rel_b = await saveRelation(a, new DummyGraphRelation({attr2: 1}), b);
                a_rel_c = await saveRelation(a, new DummyGraphRelation({attr2: 1}), c);
            });

            it("all nodes connected by given relation typ", async () => {
                let matchQuery = neography.query()
                    .match(m => [
                        m.node(DummyGraphNode).as('from'),
                        m.relation(DummyGraphRelation).direction('->').as('rel'), //TODO: one cannot add direction call at the end of chain
                        m.node(DummyGraphNode).as('to')
                    ])
                    .returns('from', 'rel', 'to')
                    .literal('ORDER BY rel.attr2');

                let rows:CreatedRelation[] = await connection.runQuery(matchQuery).toArray();
                expect(rows[0]).to.eql(a_rel_c);
                expect(rows[1]).to.eql(a_rel_b);
            });
        });
    });
});