import {expect} from 'chai';
import {PathQueryPart} from "../../../lib/cypher/match/PathQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";
import {stub} from 'sinon';
import {MatchableQueryPart} from "../../../lib/cypher/match/MatchableQueryPart";


describe('PathQueryPart', () => {
    let pathQueryPart:PathQueryPart,
        matchQueryPart:MatchableQueryPart,
        ctx:QueryContext;

    beforeEach(() => {
        ctx = getDefaultContext();
        matchQueryPart = new MatchableQueryPart([]);
        stub(matchQueryPart, 'toCypher').returns({params: {}, cypherString: '(n1)'});
        pathQueryPart = new PathQueryPart('p', matchQueryPart);
    });

    describe(".toCypher", () => {
        it(`produces correct query part`, async () => {
            expect(pathQueryPart.toCypher(ctx).cypherString).to.eq('p = (n1)');
        });
    });
});