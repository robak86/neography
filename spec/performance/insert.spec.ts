import {cleanDatabase, getDefaultNeography, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import * as _ from 'lodash';
import {Connection} from "../../lib";

describe("Inserting nodes", () => {
    beforeEach(async () => await cleanDatabase());


    const insertNode = (connection) => {
        let node = new DummyGraphNode({attr1: 'someAttr'});
        return node.save(connection);
    };

    const countNodes = (connection) => connection.runQuery(
        q => q
            .match(m => m.node().as('n'))
            .returns('count(n) as nodesCount')
    )
        .pluck('nodesCount')
        .first();

    describe("single connection", () => {
        const sharedConnection = getSharedConnection();

        it("1000 inserts called at once @slow", async () => {
            console.time('parallel inserts');
            await Promise.all(_.times(1000).map(() => insertNode(sharedConnection)));
            console.timeEnd('parallel inserts');
            expect(await countNodes(sharedConnection)).to.eq(1000);
        }).timeout(40000);

        it("1000 inserts called in sequence @slow", async () => {
            console.time('sequence inserts');
            await _.times(1000).reduce((prev:any) => {
                return prev.then(() => insertNode(sharedConnection));
            }, Promise.resolve());
            console.timeEnd('sequence inserts');
            expect(await countNodes(sharedConnection)).to.eq(1000);
        }).timeout(40000);
    });


    const CONNECTIONS_COUNT = 100;
    describe(`Using simultaneously ${CONNECTIONS_COUNT} connections`, () => {
        let connections:Connection[];

        const getConnection = (idx):Connection => connections[idx%CONNECTIONS_COUNT];

        beforeEach(() => {
            connections = _.times(CONNECTIONS_COUNT).map(() => getDefaultNeography().checkoutConnection());
        });

        it("1000 inserts called at once@slow", async () => {
            console.time('parallel inserts');
            await Promise.all(_.times(1000).map((idx) => insertNode(getConnection(idx))));
            console.timeEnd('parallel inserts');
            expect(await countNodes(getSharedConnection())).to.eq(1000);
        }).timeout(40000);

        it("1000 inserts called in sequence @slow", async () => {
            console.time('sequence inserts');
            await _.times(1000).reduce((prev:any,current,idx) => {
                return prev.then(() => insertNode(getConnection(idx)));
            }, Promise.resolve());
            console.timeEnd('sequence inserts');
            expect(await countNodes(getSharedConnection())).to.eq(1000);
        }).timeout(60000);
    });
});