import {WhereStatement} from "../../../lib/cypher/where/WhereStatement";
import {WhereLiteralQueryPart} from "../../../lib/cypher/match/WhereLiteralQueryPart";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";
import {expect} from 'chai';
import {WhereAttributeQueryPart} from "../../../lib/cypher/builders/WhereAttributeBuilder";

describe(`WhereStatement`, () => {
    let whereStatement:WhereStatement,
        ctx:QueryContext;

    beforeEach(() => {
        ctx = getDefaultContext();
    });

    describe(`literal statement`, () => {
        let literal:WhereLiteralQueryPart;

        beforeEach(() => {
            literal = new WhereLiteralQueryPart('node.id = {someId}').params({someId: 1});
            whereStatement = new WhereStatement([literal]);
        });

        it('generates valid cypher statement', () => {
            let cypher = whereStatement.toCypher(ctx).cypherString;
            expect(cypher).to.eq('WHERE node.id = {someId}')
        });

        it('returns valid params', () => {
            let params = whereStatement.toCypher(ctx).params;
            expect(params).to.eql({someId: 1})
        });
    });

    describe(`WhereAttributeQueryPart`, () => {
        let whereAttribute:WhereAttributeQueryPart;

        beforeEach(() => {
            whereAttribute = new WhereAttributeQueryPart('someProp', 'n', 'in', 1);
            whereStatement = new WhereStatement([whereAttribute]);
        });

        it('generates valid cypher statement', () => {
            let cypher = whereStatement.toCypher(ctx).cypherString;
            expect(cypher).to.eq('WHERE n.someProp in { __n_someProp_prop1 }')
        });

        it('returns valid params', () => {
            let params = whereStatement.toCypher(ctx).params;
            expect(params).to.eql({__n_someProp_prop1: 1})
        });
    });

    describe(`Joining multiple where conditions`, () => {
        describe(`AND`, () => {
            //TODO: investigate DSL for it
        });

        describe(`OR`, () => {
            //TODO: investigate DSL for it
        });
    });
});