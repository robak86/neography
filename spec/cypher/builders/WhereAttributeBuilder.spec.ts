import {WhereAttributeBuilder} from "../../../lib/cypher/builders/WhereAttributeBuilder";
import {QueryContext} from "../../../lib/cypher/common/QueryContext";
import {getDefaultContext} from "../../helpers/ConnectionHelpers";
import {expect} from 'chai';

describe(`WhereAttributeBuilder`, () => {
    let builder:WhereAttributeBuilder<string>,
        ctx:QueryContext;


    beforeEach(() => {
        ctx = getDefaultContext();
        builder = new WhereAttributeBuilder<string>('someProperty','node');
    });

    describe(`.equal`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.equal('someVal').toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty = { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.equal('someVal').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'someVal'})
        });
    });

    describe(`.notEqual`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.notEqual('someVal').toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty <> { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.notEqual('someVal').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'someVal'})
        });
    });

    describe(`.greaterThan`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.greaterThan('someVal').toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty > { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.greaterThan('someVal').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'someVal'})
        });
    });

    describe(`.lessThan`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.lessThan('someVal').toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty < { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.lessThan('someVal').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'someVal'})
        });
    });

    describe(`.in`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.in(['someVal', 'someOtherVal']).toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty in { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.in(['someVal', 'someOtherVal']).toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: ['someVal', 'someOtherVal']})
        });
    });

    describe(`.notNull`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.notNull().toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty IS NOT NULL`)
        });

        it('returns correct params object', () => {
            let cypher = builder.notNull().toCypher(ctx);
            expect(cypher.params).to.be.undefined;
        });
    });

    describe(`.contains`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.contains("abc").toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty CONTAINS { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.contains('abc').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'abc'})
        });
    });

    describe(`.startsWith`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.startsWith("abc").toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty STARTS WITH { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.startsWith('abc').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'abc'})
        });
    });

    describe(`.endsWith`, () => {
        it('returns correct cypher statement', () => {
            let cypher = builder.endsWith("abc").toCypher(ctx);
            expect(cypher.cypherString).to.eq(`node.someProperty ENDS WITH { __node_someProperty_prop1 }`)
        });

        it('returns correct params object', () => {
            let cypher = builder.endsWith('abc').toCypher(ctx);
            expect(cypher.params).to.eql({__node_someProperty_prop1: 'abc'})
        });
    });
});