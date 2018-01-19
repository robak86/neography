import {expect} from 'chai';
import {MatchNodeQueryPart} from "../../../lib/cypher/match/MatchNodeQueryPart";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {MatchRelationQueryPart} from "../../../lib/cypher/match/MatchRelationQueryPart";
import {MatchQueryPart} from "../../../lib/cypher/match/MatchQueryPart";
import {DummyGraphRelation} from "../../fixtures/DummyGraphRelation";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {ChildDummyGraphNode} from "../../fixtures/ChildDummyGraphNode";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe('MatchQueryPart', () => {
    let nodeQuery1:MatchNodeQueryPart<DummyGraphNode>,
        nodeQuery2:MatchNodeQueryPart<DummyGraphNode>,
        nodeQuery3:MatchNodeQueryPart<DummyGraphNode>,
        nodeQuery4:MatchNodeQueryPart<DummyGraphNode>,
        relationQuery1:MatchRelationQueryPart<DummyGraphRelation>,
        matchQueryElement:MatchQueryPart,
        ctx:QueryContext;

    beforeEach(() => {
        ctx = getDefaultContext();
        nodeQuery1 = new MatchNodeQueryPart(DummyGraphNode).params({attr1: 'someCriteria'}).as('n1');
        nodeQuery2 = new MatchNodeQueryPart(DummyGraphNode).params({attr2: 123}).as('n2');
        nodeQuery3 = new MatchNodeQueryPart(DummyGraphNode).params({attr2: 456}).as('n3');
        nodeQuery4 = new MatchNodeQueryPart(ChildDummyGraphNode).as('n4');
        relationQuery1 = new MatchRelationQueryPart(DummyGraphRelation).params({attr1: 'someRelationCriteria'}).as('rel');
    });

    describe("Matching single node", () => {
        beforeEach(() => {
            matchQueryElement = new MatchQueryPart([nodeQuery1], false);
        });

        it("returns query part for matching single node", () => {
            expect(matchQueryElement.toCypher(ctx).cypherString)
                .to.eql(`MATCH (n1:DummyGraphNode {attr1: {n1Params}.attr1})`)
        });

        it("aggregates params", () => {
            expect(matchQueryElement.toCypher(ctx).params)
                .to.eql({n1Params: {attr1: 'someCriteria'}});
        });
    });

    describe("matching single node inheriting from other node class", () => {
        beforeEach(() => {
            matchQueryElement = new MatchQueryPart([nodeQuery4], false);
        });

        it("returns query part for matching single node", () => {
            expect(matchQueryElement.toCypher(ctx).cypherString)
                .to.eql(`MATCH (n4:ChildDummyGraphNode:DummyGraphNode)`)
        });

        it("aggregates params", () => {
            expect(matchQueryElement.toCypher(ctx).params)
                .to.eql({n4Params: undefined});
        });
    });

    describe("match two nodes", () => {
        beforeEach(() => {
            matchQueryElement = new MatchQueryPart([nodeQuery1, nodeQuery2], false);
        });

        it("returns query part for matching single node", () => {
            expect(matchQueryElement.toCypher(ctx).cypherString)
                .to.eql(`MATCH (n1:DummyGraphNode {attr1: {n1Params}.attr1}), (n2:DummyGraphNode {attr2: {n2Params}.attr2})`)
        });

        it("aggregates params", () => {
            expect(matchQueryElement.toCypher(ctx).params)
                .to.eql({
                n1Params: {attr1: 'someCriteria'},
                n2Params: {attr2: 123}
            });
        });
    });

    describe("match two nodes connected with relationshipEntity", () => {
        beforeEach(() => {
            matchQueryElement = new MatchQueryPart([nodeQuery1, relationQuery1, nodeQuery2], false);
        });

        it("returns query part for matching single node", () => {
            expect(matchQueryElement.toCypher(ctx).cypherString)
                .to.eql(`MATCH (n1:DummyGraphNode {attr1: {n1Params}.attr1})-[rel:CONNECTED_BY_DUMMY {attr1: {relParams}.attr1}]-(n2:DummyGraphNode {attr2: {n2Params}.attr2})`)
        });

        it("aggregates params", () => {
            expect(matchQueryElement.toCypher(ctx).params)
                .to.eql({
                n1Params: {attr1: 'someCriteria'},
                relParams: {attr1: 'someRelationCriteria'},
                n2Params: {attr2: 123}
            });
        });
    });

    describe("match nodes connected with relationshipEntity and additional node", () => {
        beforeEach(() => {
            matchQueryElement = new MatchQueryPart([nodeQuery1, relationQuery1, nodeQuery2, nodeQuery3], false);
        });

        it("returns query part for matching single node", () => {
            expect(matchQueryElement.toCypher(ctx).cypherString)
                .to.eql(`MATCH (n1:DummyGraphNode {attr1: {n1Params}.attr1})-[rel:CONNECTED_BY_DUMMY {attr1: {relParams}.attr1}]-(n2:DummyGraphNode {attr2: {n2Params}.attr2}), (n3:DummyGraphNode {attr2: {n3Params}.attr2})`)
        });
    });
});