import {buildQuery, create, match, path} from "../../lib/cypher";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {returns} from "../../lib/cypher/common";
import {cleanDatabase, getDefaultNeography} from "../helpers/ConnectionHelpers";
import {Connection} from "../../lib";
import {expect} from 'chai';

describe(`queries using path`, () => {
    let connection:Connection;
    let n1, n2, n3, rel1, rel2;



    beforeEach(async () => {
        const neography = getDefaultNeography();
        connection = neography.checkoutConnection();
        await cleanDatabase(connection);

        n1 = new DummyGraphNode({attr1: 'n1'});
        n2 = new DummyGraphNode({attr1: 'n2'});
        n3 = new DummyGraphNode({attr1: 'n3'});
        rel1 = new DummyGraphRelation();
        rel2 = new DummyGraphRelation();

        const query = buildQuery(
            create(c => [
                c.node(n1),
                c.relation(rel1),
                c.node(n2),
                c.relation(rel2),
                c.node(n3)
            ]),
            returns('*')
        );

        await connection.runQuery(query);
    });

    describe(`matching path`, () => {
        it(`matches path`, async () => {
            const matchStatement = match(
                path('p', m => [
                    m.node(DummyGraphNode).params({attr1: 'n1'}),
                    m.relation(DummyGraphRelation).length(2),
                    m.node(DummyGraphNode).as('n3'),
                ])
            );

            const sleep = (val) => new Promise(resolve => setTimeout(resolve, val));

            await sleep(1000);

            const query = buildQuery(
                matchStatement,
                returns('n3')
            );

            const result:DummyGraphNode[] = await connection.runQuery(query).toArray();
            // expect(result[0].attr1).to.eq(n3.attr1);
            expect(result.length).to.eq(1);
        });
    });
});