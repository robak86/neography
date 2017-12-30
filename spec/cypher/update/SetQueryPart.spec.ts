import {expect} from 'chai';
import * as _ from 'lodash';
import {SetQueryPart} from "../../../lib/cypher/update/SetQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {TypedSetQueryPart} from "../../../lib/cypher/update/TypedSetQueryPart";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {expectIsNowTimeStamp} from "../../helpers/assertions";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";


describe("SetQueryPart", () => {
    let setQueryPart:SetQueryPart,
        context:QueryContext;
    beforeEach(() => context = getDefaultContext());

    describe(".toCypher", () => {
        describe("with one TypedSetQueryPart child", () => {
            let typedSetQueryPart:TypedSetQueryPart<DummyGraphNode>,
                params:Partial<DummyGraphNode>;

            beforeEach(() => {
                params = {attr1: 'updatedValue'};
                typedSetQueryPart = new TypedSetQueryPart(DummyGraphNode, params, 'n1', 'replace');
                setQueryPart = new SetQueryPart([typedSetQueryPart]);
            });

            it("returns proper query string", () => {
                let boundQueryPart:IBoundQueryPart = setQueryPart.toCypher(context);
                expect(boundQueryPart.cypherString).to.eql('SET n1 = {n1Params}');
            });

            it("returns proper params", () => {
                let boundQueryPart:IBoundQueryPart = setQueryPart.toCypher(context);
                expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedValue');
                let updatedAt = boundQueryPart.params.n1Params.updatedAt;
                expectIsNowTimeStamp(updatedAt)
            });
        });

        describe("with two TypedSetQueryPart children", () => {
            let typedSetQueryPart1:TypedSetQueryPart<DummyGraphNode>,
                typedSetQueryPart2:TypedSetQueryPart<DummyGraphNode>,
                params1:Partial<DummyGraphNode>,
                params2:Partial<DummyGraphNode>;

            beforeEach(() => {
                params1 = {attr1: 'updatedValue'};
                params2 = {attr1: 'updatedValue2'};
                typedSetQueryPart1 = new TypedSetQueryPart(DummyGraphNode, params1, 'n1', 'replace');
                typedSetQueryPart2 = new TypedSetQueryPart(DummyGraphNode, params2, 'n2', 'replace');
                setQueryPart = new SetQueryPart([typedSetQueryPart1, typedSetQueryPart2]);
            });

            it("returns proper query string", () => {
                let boundQueryPart:IBoundQueryPart = setQueryPart.toCypher(context);
                expect(boundQueryPart.cypherString).to.eql('SET n1 = {n1Params}, n2 = {n2Params}');
            });

            it("returns merged params for n1Params", () => {
                let boundQueryPart:IBoundQueryPart = setQueryPart.toCypher(context);
                expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedValue');
                let updatedAt = boundQueryPart.params.n1Params.updatedAt;
                expectIsNowTimeStamp(updatedAt);
            });

            it("returns merged params for n2Params", () => {
                let boundQueryPart:IBoundQueryPart = setQueryPart.toCypher(context);
                expect(boundQueryPart.params.n2Params.attr1).to.eql('updatedValue2');
                let updatedAt = boundQueryPart.params.n2Params.updatedAt;
                expectIsNowTimeStamp(updatedAt);
            });
        });
    });
});