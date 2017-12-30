import {expect} from 'chai';
import {CreateNodeQueryPart} from "../../../lib/cypher/create/CreateNodeQueryPart";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {CreateRelationQueryPart} from "../../../lib/cypher/create/CreateRelationQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {DummyGraphRelation} from "../../fixtures/DummyGraphRelation";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {CreateQueryPart} from "../../../lib/cypher/create/CreateQueryPart";
import {MatchedNodeQueryPart} from "../../../lib/cypher/common/MatchedNodeQueryPart";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("CreateQueryPart", () => {
    let createNodeQuery1:CreateNodeQueryPart<DummyGraphNode>,
        createNodeQuery2:CreateNodeQueryPart<DummyGraphNode>,
        createNodeQuery3:CreateNodeQueryPart<DummyGraphNode>,
        createRelationQuery1:CreateRelationQueryPart<DummyGraphRelation>,
        ctx:QueryContext;


    beforeEach(() => {
        ctx = getDefaultContext();
        createNodeQuery1 = new CreateNodeQueryPart(new DummyGraphNode({attr1: 'val1', attr2: 1}));
        createNodeQuery2 = new CreateNodeQueryPart(new DummyGraphNode({attr1: 'val2', attr2: 2}));
        createNodeQuery3 = new CreateNodeQueryPart(new DummyGraphNode({attr1: 'val3', attr2: 3}));
        createRelationQuery1 = new CreateRelationQueryPart(new DummyGraphRelation({attr1: 'rVal1', attr2: 21}))
    });

    describe("create query for single node", () => {
        let boundedQueryPart:IBoundQueryPart;

        beforeEach(() => {
            boundedQueryPart = new CreateQueryPart([createNodeQuery1]).toCypher(ctx);
        });
        it("returns proper cypher string", () => {
            expect(boundedQueryPart.cypherString).to.eql('CREATE (n1:DummyGraphNode {n1Params})')
        });

        it("returns proper params object", () => {
            expect(boundedQueryPart.params.n1Params.attr1).to.eql('val1');
            expect(boundedQueryPart.params.n1Params.attr2).to.eql(1);
        });
    });

    describe("creating two nodes", () => {
        let boundedQueryPart:IBoundQueryPart;

        beforeEach(() => {
            boundedQueryPart = new CreateQueryPart([createNodeQuery1, createNodeQuery2]).toCypher(ctx);
        });

        it("returns proper cypher string", () => {
            expect(boundedQueryPart.cypherString).to.eql('CREATE (n1:DummyGraphNode {n1Params}), (n2:DummyGraphNode {n2Params})')
        });

        it("returns proper params object", () => {
            expect(boundedQueryPart.params.n1Params.attr1).to.eql('val1');
            expect(boundedQueryPart.params.n1Params.attr2).to.eql(1);

            expect(boundedQueryPart.params.n2Params.attr1).to.eql('val2');
            expect(boundedQueryPart.params.n2Params.attr2).to.eql(2);
        });
    });

    describe("creating two nodes with relation", () => {
        let boundedQueryPart:IBoundQueryPart;

        beforeEach(() => {
            boundedQueryPart = new CreateQueryPart([createNodeQuery1, createRelationQuery1, createNodeQuery2]).toCypher(ctx);
        });

        it("returns proper cypher string", () => {
            expect(boundedQueryPart.cypherString).to.eql('CREATE (n1:DummyGraphNode {n1Params})-[r1:CONNECTED_BY_DUMMY {r1Params}]-(n2:DummyGraphNode {n2Params})')
        });

        it("returns proper params object", () => {
            expect(boundedQueryPart.params.n1Params.attr1).to.eql('val1');
            expect(boundedQueryPart.params.n1Params.attr2).to.eql(1);

            expect(boundedQueryPart.params.r1Params.attr1).to.eql('rVal1');
            expect(boundedQueryPart.params.r1Params.attr2).to.eql(21);

            expect(boundedQueryPart.params.n2Params.attr1).to.eql('val2');
            expect(boundedQueryPart.params.n2Params.attr2).to.eql(2);
        });
    });

    describe("create relation for two matched nodes", () => {
        let boundedQueryPart:IBoundQueryPart,
            matchedNode1:MatchedNodeQueryPart,
            matchedNode2:MatchedNodeQueryPart;

        beforeEach(() => {
            matchedNode1 = new MatchedNodeQueryPart().as('n1');
            matchedNode2 = new MatchedNodeQueryPart().as('n2');
            boundedQueryPart = new CreateQueryPart([matchedNode1, createRelationQuery1, matchedNode2]).toCypher(ctx);
        });

        it("returns proper cypher string", () => {
            expect(boundedQueryPart.cypherString).to.eql('CREATE (n1)-[r1:CONNECTED_BY_DUMMY {r1Params}]-(n2)')
        })
    });

    describe("create two relations for matched nodes", () => {
        let boundedQueryPart:IBoundQueryPart;

        beforeEach(() => {
            boundedQueryPart = new CreateQueryPart([
                createNodeQuery1, createRelationQuery1.as('r1'), createNodeQuery2,
                createNodeQuery1, createRelationQuery1.as('r2'), createNodeQuery2
            ]).toCypher(ctx);
        });

        it("returns proper cypher string", () => {
            expect(boundedQueryPart.cypherString).to.equalIgnoreSpaces(`
            CREATE (n1:DummyGraphNode {n1Params})-[r1:CONNECTED_BY_DUMMY {r1Params}]-(n2:DummyGraphNode {n2Params}),
                   (n3:DummyGraphNode {n3Params})-[r2:CONNECTED_BY_DUMMY {r2Params}]-(n4:DummyGraphNode {n4Params})
            `)
        });

        it("returns proper params object", () => {
            expect(boundedQueryPart.params.n1Params.attr1).to.eql('val1');
            expect(boundedQueryPart.params.n1Params.attr2).to.eql(1);

            expect(boundedQueryPart.params.r1Params.attr1).to.eql('rVal1');
            expect(boundedQueryPart.params.r1Params.attr2).to.eql(21);

            expect(boundedQueryPart.params.n2Params.attr1).to.eql('val2');
            expect(boundedQueryPart.params.n2Params.attr2).to.eql(2);
        });
    });
});