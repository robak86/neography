import {expect} from 'chai';
import {attribute, nodeEntity} from "../../../lib/annotations";
import {NodeEntity} from "../../../lib/model";
import {MatchNodeQueryPart} from "../../../lib/cypher/match/MatchNodeQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("MatchNodeQueryPart", () => {
    @nodeEntity('SpecNode1')
    class SomeDummyNodeParent extends NodeEntity {
    }


    @nodeEntity('SpecNode2')
    class SomeDummyNode extends SomeDummyNodeParent {
        @attribute() attr1:string;
        @attribute() attr2:number;
    }

    let nodeQueryPart:MatchNodeQueryPart<SomeDummyNode>,
        ctx:QueryContext;

    beforeEach(() => {
        nodeQueryPart = new MatchNodeQueryPart(SomeDummyNode);
        ctx = getDefaultContext();
    });

    describe(".toCypher", () => {
        it("renders cypher part for node query", () => {
            let nodeQuery = nodeQueryPart.as('u');
            expect(nodeQuery.toCypher(ctx).cypherString).to.eql('(u:SpecNode1:SpecNode2)')
        });

        it("returns cypher part for node query with parameters", () => {
            let params = {attr1: 'str1', attr2: 123};
            let nodeQuery = nodeQueryPart.as('u').params(params);
            let cypherPart = nodeQuery.toCypher(ctx);
            expect(cypherPart.cypherString).to.eql('(u:SpecNode1:SpecNode2 {attr1: {uParams}.attr1, attr2: {uParams}.attr2})');
            expect(cypherPart.params).to.eql({uParams: params});
        });

        it("generates uniq alias if  alias is not provided", () => {
            let params = {attr1: 'str1', attr2: 123};
            let nodeQuery = nodeQueryPart.params(params);
            let cypherPart = nodeQuery.toCypher(ctx);
            expect(cypherPart.cypherString).to.eql('(n1:SpecNode1:SpecNode2 {attr1: {n1Params}.attr1, attr2: {n1Params}.attr2})');
            expect(cypherPart.params).to.eql({n1Params: params});
        });
    });
});