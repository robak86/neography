import {expect} from 'chai';
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {CreateNodeQueryPart} from "../../../lib/cypher/create/CreateNodeQueryPart";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("CreateNodeQueryPart", () => {
    let ctx:QueryContext;
    beforeEach(() => {
        ctx = getDefaultContext();
    });

    describe("create node with parameters", () => {
        let nodeCreate:CreateNodeQueryPart<DummyGraphNode>,
            node:DummyGraphNode = new DummyGraphNode({attr1: "someValue", attr2: 123});

        beforeEach(() => {
            nodeCreate = new CreateNodeQueryPart(node);
        });

        it("creates cypher string", () => {
            let boundQuery:IBoundQueryPart = nodeCreate.toCypher(ctx);
            expect(boundQuery.cypherString).to.eql('(n1:DummyGraphNode {n1Params})')
        });

        it("returns parameters", () => {
            let boundQuery:IBoundQueryPart = nodeCreate.toCypher(ctx);
            expect(boundQuery.params.n1Params.attr1).to.eql("someValue");
            expect(boundQuery.params.n1Params.attr2).to.eql(123);
        });

        it("adds entity params", () => {
            let boundQuery:IBoundQueryPart = nodeCreate.toCypher(ctx);
            expect(boundQuery.params.n1Params.id).to.be.an('string');
        });
    });
});