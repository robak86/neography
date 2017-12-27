import {expect} from 'chai';
import {attribute, relation} from "../../../lib/annotations";
import {AbstractRelation} from "../../../lib/model";
import {MatchRelationQueryPart} from "../../../lib/cypher/match/MatchRelationQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("MatchRelationQueryPart", () => {
    const relationType:string = '_RelationTypeForSpec';

    @relation(relationType)
    class SomeDummyRelation extends AbstractRelation<SomeDummyRelation> {
        @attribute() attr1:string;
        @attribute() attr2:number;
    }

    let relationQueryElement:MatchRelationQueryPart<SomeDummyRelation>,
        ctx:QueryContext;

    beforeEach(() => {
        relationQueryElement = new MatchRelationQueryPart(SomeDummyRelation);
        ctx = getDefaultContext();
    });

    describe(".toCypher", () => {
        it("renders cypher part for node query", () => {
            let nodeQuery = relationQueryElement.as('u');
            expect(nodeQuery.toCypher(ctx).cypherString).to.eql('-[u:_RelationTypeForSpec]-')
        });

        it("returns cypher part for node query with parameters", () => {
            let params = {attr1: 'str1', attr2: 123};
            let nodeQuery = relationQueryElement.as('u').params(params).direction('->');
            let cypherPart = nodeQuery.toCypher(ctx);
            expect(cypherPart.cypherString).to.eql('-[u:_RelationTypeForSpec {attr1: {uParams}.attr1, attr2: {uParams}.attr2}]->');
            expect(cypherPart.params).to.eql({uParams: params});
        });
    });
});