import {expect} from 'chai';
import * as _ from 'lodash';
import {TypedSetQueryPart} from "../../../lib/cypher/update/TypedSetQueryPart";
import {DummyGraphNode} from "../../fixtures/DummyGraphNode";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {IBoundQueryPart} from "../../../lib/cypher/abstract/IBoundQueryPart";
import {isInt} from "../../../lib/driver/Integer";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";

describe("TypedSetQueryPart", () => {
    let typedSetQueryPart:TypedSetQueryPart<DummyGraphNode>,
        context:QueryContext;

    beforeEach(() => context = getDefaultContext());

    describe("update mode", () => {
        describe("params match type attributes", () => {
            let params:Partial<DummyGraphNode>;

            beforeEach(() => {
                params = {attr1: 'updatedVal1', attr2: 2};
                typedSetQueryPart = new TypedSetQueryPart(DummyGraphNode, params, 'n1', 'update');
            });

            describe(".toCypher()", () => {
                it("returns proper query string", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.cypherString).to.eql('n1 += {n1Params}')
                });

                it("returns proper params object", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedVal1');
                    expect(boundQueryPart.params.n1Params.attr2).to.eql(2);
                    expect(isInt(boundQueryPart.params.n1Params.updatedAt)).to.eq(true);
                    expect(_.keys(boundQueryPart.params.n1Params).sort()).to.eql(['attr1', 'attr2', 'updatedAt'].sort())
                });
            });
        });

        describe("params doesn't match provided type's attributes", () => {
            let params:any;

            beforeEach(() => {
                params = {attr1: 'updatedVal1', attr2: 2, attr3: 'I should be removed by mapper'};
                typedSetQueryPart = new TypedSetQueryPart(DummyGraphNode, params, 'n1', 'update');
            });

            describe(".toCypher()", () => {
                it("removes unknown attributes not defined by provided type (generic type of TypedSetQueryPart)", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedVal1');
                    expect(boundQueryPart.params.n1Params.attr2).to.eql(2);
                    expect(isInt(boundQueryPart.params.n1Params.updatedAt)).to.eq(true);
                    expect(_.keys(boundQueryPart.params.n1Params).sort()).to.eql(['attr1', 'attr2', 'updatedAt'].sort())
                });
            });
        });
    });

    describe("replace mode", () => {
        describe("params match type attributes", () => {
            let params:Partial<DummyGraphNode>;

            beforeEach(() => {
                params = {attr1: 'updatedVal1', attr2: 2};
                typedSetQueryPart = new TypedSetQueryPart(DummyGraphNode, params, 'n1', 'replace');
            });

            describe(".toCypher()", () => {
                it("returns proper query string", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.cypherString).to.eql('n1 = {n1Params}')
                });

                it("returns proper params object", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedVal1');
                    expect(boundQueryPart.params.n1Params.attr2).to.eql(2);
                    expect(isInt(boundQueryPart.params.n1Params.updatedAt)).to.eq(true);
                    expect(_.keys(boundQueryPart.params.n1Params).sort()).to.eql(['attr1', 'attr2', 'updatedAt'].sort())
                });
            });
        });

        describe("params doesn't match provided type's attributes", () => {
            let params:any;

            beforeEach(() => {
                params = {attr1: 'updatedVal1', attr2: 2, attr3: 'I should be removed by mapper'};
                typedSetQueryPart = new TypedSetQueryPart(DummyGraphNode, params, 'n1', 'update');
            });

            describe(".toCypher()", () => {
                it("removes unknown attributes not defined by provided type (generic type of TypedSetQueryPart)", () => {
                    let boundQueryPart:IBoundQueryPart = typedSetQueryPart.toCypher(context);
                    expect(boundQueryPart.params.n1Params.attr1).to.eql('updatedVal1');
                    expect(boundQueryPart.params.n1Params.attr2).to.eql(2);
                    expect(isInt(boundQueryPart.params.n1Params.updatedAt)).to.eq(true);
                    expect(_.keys(boundQueryPart.params.n1Params).sort()).to.eql(['attr1', 'attr2', 'updatedAt'].sort())
                });
            });
        });
    });


});