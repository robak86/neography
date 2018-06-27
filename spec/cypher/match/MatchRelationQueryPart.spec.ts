import {expect} from 'chai';
import {attribute, relationshipEntity} from "../../../lib/annotations";
import {RelationshipEntity} from "../../../lib/model";
import {MatchRelationQueryPart} from "../../../lib/cypher/match/MatchRelationQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("MatchRelationQueryPart", () => {
    const relationType:string = '_RelationTypeForSpec';

    @relationshipEntity(relationType)
    class SomeDummyRelation extends RelationshipEntity<SomeDummyRelation> {
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

        describe(`path length`, () => {
            it(`adds fixed path length`, async () => {
                let nodeQuery = relationQueryElement.as('u').direction('->').length(2);
                let cypherPart = nodeQuery.toCypher(ctx);
                expect(cypherPart.cypherString).to.eql('-[u:_RelationTypeForSpec*2]->');
            });

            it(`adds fixed path length`, async () => {
                let nodeQuery = relationQueryElement.as('u').direction('->').length(1, 5);
                let cypherPart = nodeQuery.toCypher(ctx);
                expect(cypherPart.cypherString).to.eql('-[u:_RelationTypeForSpec*1..5]->');
            });

            it(`minimum to infinity`, async () => {
                let nodeQuery = relationQueryElement.as('u').direction('->').length(1, Infinity);
                let cypherPart = nodeQuery.toCypher(ctx);
                expect(cypherPart.cypherString).to.eql('-[u:_RelationTypeForSpec*1..]->');
            });
        });
    });
});