import {expect} from 'chai';
import {path} from "../../../lib/cypher/match";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {DummyGraphRelation} from "../../fixtures/DummyGraphRelation";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";

describe(`match with named path`, () => {
    let pathStatement:IBoundQueryPart;

    beforeEach(() => {
        const pathStatementQuery = path('p', m => [
            m.node(DummyGraphNode).params({attr1: 'n1'}),
            m.relation(DummyGraphRelation).length(2),
            m.node(DummyGraphNode).as('n3'),
        ]);

        pathStatement = pathStatementQuery.toCypher(getDefaultContext());
    });

    it(`produces correct query string`, async () => {
        expect(pathStatement.cypherString)
            .to.eq(`p = (n1:DummyGraphNode {attr1: {n1Params}.attr1})-[r1:CONNECTED_BY_DUMMY*2]-(n3:DummyGraphNode)`);
    });

    it(`creates correct params object`, async () => {
        expect(pathStatement.params)
            .to.eql({n1Params: {attr1: 'n1'}});
    });
});