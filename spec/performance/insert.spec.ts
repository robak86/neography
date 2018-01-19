import {cleanDatabase, getDefaultNeography, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import * as _ from 'lodash';
import {Connection} from "../../lib";

describe("Inserting nodes @slow", () => {
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

        const getConnection = (idx):Connection => connections[idx % CONNECTIONS_COUNT];

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
            await _.times(1000).reduce((prev:any, current, idx) => {
                return prev.then(() => insertNode(getConnection(idx)));
            }, Promise.resolve());
            console.timeEnd('sequence inserts');
            expect(await countNodes(getSharedConnection())).to.eq(1000);
        }).timeout(60000);
    });

    describe(`using .save method on NodeEntity`, () => {
        it(`inserts 1000 nodes by calling save at the same time`, async () => {
            await Promise.all(_.times(1000).map(() => {
                let node = new DummyGraphNode();
                return node.save()
            }));

            expect(await countNodes(getSharedConnection())).to.eq(1000);
        }).timeout(60000);

        it(`inserts 1000 nodes sequentially`, async () => {
            await _.times(1000).reduce((prev:any) => {
                return prev.then(() => {
                    let node = new DummyGraphNode();
                    return node.save()
                });
            }, Promise.resolve());
        }).timeout(60000);

        it(`inserts 1000 nodes by calling save at the same time with single connection`, async () => {
            let connection = getSharedConnection();

            await _.times(1000).reduce((prev:any) => {
                return prev.then(() => {
                    let node = new DummyGraphNode();
                    return node.save(connection)
                });
            }, Promise.resolve());
        }).timeout(60000);

        it(`inserts 1000 nodes sequentially using single connection`, async () => {
            let connection = getSharedConnection();

            await _.times(1000).reduce((prev:any) => {
                return prev.then(() => {
                    let node = new DummyGraphNode();
                    return node.save(connection)
                });
            }, Promise.resolve());
        }).timeout(60000);
    });

    describe(`saving node entity with relationship`, () => {
        it(`inserts 100 nodes, each having 10 connected nodes. All saves done parallel`, async () => {
            let data = _.times(100).map((idx) => {
                let node = new DummyGraphNode({attr2: idx});
                let otherDummies = _.times(10).map(id => new DummyGraphNode({attr2: 1000 + id}));
                node.childDummies.set(otherDummies);
                return {dummy: node, otherDummies};
            });

            await Promise.all(data.map(d => d.dummy.save()));

            let allDummies = await getSharedConnection()
                .nodeQuery(DummyGraphNode)
                .where(w => w.attribute('attr2').lessThan(1000))
                .orderBy(by => by.attribute('attr2').asc()).all();

            expect(data.map(d => d.dummy.attributes)).to.eql(allDummies.map(n => n.attributes));

            await Promise.all(data.map(async (d) => {
                let fetchedChildDummies = await d.dummy.childDummies
                    .orderByNode(by => by.attribute('attr2').asc())
                    .all();

                expect(d.otherDummies.map(d=> d.attributes)).to.eql(fetchedChildDummies.map(f => f.attributes));
            }))

        }).timeout(60000)
    });
});