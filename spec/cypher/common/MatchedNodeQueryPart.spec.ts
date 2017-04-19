import {MatchedNodeQueryPart} from "../../../lib/cypher/common/MatchedNodeQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {expect} from 'chai';
import {getDefaultContext} from "../../helpers/ConnectionHelpers";

describe("MatchedNodeQueryPart", () => {
    let ctx:QueryContext;
    beforeEach(() => ctx = getDefaultContext());

    describe(".toCypher", () => {
        describe("with alias", () => {
            it("returns string for aliased node", () => {
                let matched = new MatchedNodeQueryPart().as('user');
                expect(matched.toCypher(ctx).cypherString).to.eq('(user)')
            });
        });

        describe("without alias", () => {
            it("returns string for any node", () => {
                let matched = new MatchedNodeQueryPart();
                expect(matched.toCypher(ctx).cypherString).to.eq('()')
            });
        });
    });
});