import {expect} from 'chai';
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {CreateRelationQueryPart} from "../../../lib/cypher/create/CreateRelationQueryPart";
import {DummyGraphRelation} from "../../fixtures/DummyGraphRelation";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("CreateRelationQueryPart", () => {

    let ctx:QueryContext;
    beforeEach(() => {
        ctx = getDefaultContext();
    });

    describe("create node with parameters", () => {
        let createRelationQueryPart:CreateRelationQueryPart<DummyGraphRelation>,
            relation:DummyGraphRelation = DummyGraphRelation.build({attr1: "someValue", attr2: 123});

        beforeEach(() => {
            createRelationQueryPart = new CreateRelationQueryPart(relation);
        });

        it("creates cypher string", () => {
            let boundQuery:IBoundQueryPart = createRelationQueryPart.toCypher(ctx);
            expect(boundQuery.cypherString).to.eql('-[r1:CONNECTED_BY_DUMMY {r1Params}]-')
        });

        it("returns parameters", () => {
            let boundQuery:IBoundQueryPart = createRelationQueryPart.toCypher(ctx);
            expect(boundQuery.params.r1Params.attr1).to.eql("someValue");
            expect(boundQuery.params.r1Params.attr2).to.eql(123);
        });

        it("adds entity params", () => {
            let boundQuery:IBoundQueryPart = createRelationQueryPart.toCypher(ctx);
            expect(boundQuery.params.r1Params.id).to.be.an('string');
        });
    });
});