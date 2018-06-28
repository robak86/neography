import {cleanDatabase, getDefaultNeography} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {buildQuery, Connection} from "../../lib";
import {create} from "../../lib/cypher/create";
import {match} from "../../lib/cypher/match";
import {where} from "../../lib/cypher/where";
import {returns} from "../../lib/cypher/common";
import {expect} from 'chai';
import {orderBy} from "../../lib/cypher/order";

describe(`String specific comparision operators`, () => {
    let connection:Connection;

    beforeEach(async () => {
        const neography = getDefaultNeography();
        connection = neography.checkoutConnection();
        await cleanDatabase();
    });

    let nodes:DummyGraphNode[];

    beforeEach(async () => {
        nodes = [
            new DummyGraphNode({attr1: "abc"}),
            new DummyGraphNode({attr1: "bcd"}),
            new DummyGraphNode({attr1: "efg"}),
            new DummyGraphNode({attr1: "bbb"}),
            new DummyGraphNode({attr1: "aac"})
        ];

        const query = buildQuery(
            create(c => [
                c.node(nodes[0]),
                c.node(nodes[1]),
                c.node(nodes[2]),
                c.node(nodes[3]),
                c.node(nodes[4])
            ])
        );

        await connection.runQuery(query).toArray();
    });

    describe(`contains`, () => {
        it(`ex1. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').contains("abc")),
                returns('n')
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(1);
            expect(result[0].attr1).to.eql("abc")
        });

        it(`ex2. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').contains("bc")),
                returns('n'),
                orderBy(o => o.aliased('n').attribute('attr1').asc())
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(2);
            expect(result[0].attr1).to.eql("abc");
            expect(result[1].attr1).to.eql("bcd");
        });
    });


    describe(`starts with`, () => {
        it(`ex1. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').startsWith("a")),
                returns('n'),
                orderBy(o => o.aliased('n').attribute('attr1').asc())
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(2);
            expect(result[0].attr1).to.eql("aac");
            expect(result[1].attr1).to.eql("abc");
        });

        it(`ex2. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').startsWith("b")),
                returns('n'),
                orderBy(o => o.aliased('n').attribute('attr1').asc())
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(2);
            expect(result[0].attr1).to.eql("bbb");
            expect(result[1].attr1).to.eql("bcd");
        });
    });

    describe(`ends with`, () => {
        it(`ex1. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').endsWith("c")),
                returns('n'),
                orderBy(o => o.aliased('n').attribute('attr1').asc())
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(2);
            expect(result[0].attr1).to.eql("aac");
            expect(result[1].attr1).to.eql("abc");
        });

        it(`ex2. it returns nodes using contains operator`, async () => {
            const q1 = buildQuery(
                match(m => m.node(DummyGraphNode).as('n')),
                where(w => w.aliased('n').attribute('attr1').endsWith("g")),
                returns('n'),
                orderBy(o => o.aliased('n').attribute('attr1').asc())
            );

            const result = await connection.runQuery(q1).pluck('n').toArray();

            expect(result.length).to.eq(1);
            expect(result[0].attr1).to.eql("efg");
        });
    });
});