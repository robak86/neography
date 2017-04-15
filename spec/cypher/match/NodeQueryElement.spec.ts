import {expect} from 'chai';
import * as sinon from 'sinon';
import {node} from "../../../lib/annotations/NodeAnnotations";
import {AbstractNode} from "../../../lib/model/AbstractNode";
import {attribute} from "../../../lib/annotations/AttributesAnnotations";
import {MatchNodeQueryPart} from "../../../lib/cypher/match/MatchNodeQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";


describe("MatchNodeQueryPart", () => {
    const nodeLabels:string[] = ['SpecNode1', 'SpecNode2'];

    @node('SpecNode1')
    class SomeDummyNodeParent extends AbstractNode {
    }


    @node('SpecNode2')
    class SomeDummyNode extends SomeDummyNodeParent {
        @attribute() attr1:string;
        @attribute() attr2:number;
    }

    let nodeQueryPart:MatchNodeQueryPart<SomeDummyNode>,
        ctx:QueryContext;

    beforeEach(() => {
        nodeQueryPart = new MatchNodeQueryPart(SomeDummyNode);
        ctx = new QueryContext();
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

        it("registers class for mapping", () => {
            nodeQueryPart.toCypher(ctx);
            expect(ctx.getNodeClass('n1')).to.eql(SomeDummyNode)
        });
    });
});