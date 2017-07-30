import {cleanDatabase, getConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {expect} from 'chai';
import * as _ from 'lodash';

describe.skip("Inserting nodes", () => {
    beforeEach(async () => await cleanDatabase());

    const sharedConnection = getConnection();
    const insertNode = (connection = sharedConnection) => {
        let node = DummyGraphNode.build({attr1: 'someAttr'});
        return connection.getNodeRepository(DummyGraphNode).save(node);
    };

    const countNodes = () => sharedConnection.runQuery(
        q => q
            .match(m => m.node().as('n'))
            .returns('count(n) as nodesCount')
    )
        .pickOne('nodesCount')
        .map(integer => integer.toNumber())
        .first();

    it("1000 inserts called at once @slow", async () => {
        console.time('parallel inserts');
        await Promise.all(_.times(1000).map(() => insertNode()));
        console.timeEnd('parallel inserts');
        expect(await countNodes()).to.eq(1000);
    }).timeout(40000);

    it("1000 inserts called in sequence @slow", async () => {
        console.time('sequence inserts');
        await _.times(1000).reduce((prev:any) => {
            return prev.then(() => insertNode());
        }, Promise.resolve());
        console.timeEnd('sequence inserts');
        expect(await countNodes()).to.eq(1000);
    }).timeout(40000);

    it("1000 inserts using separate connection instances @slow", async () => {
        console.time('multiple connections inserts');
        await Promise.all(_.times(1000).map(() => insertNode(getConnection())));
        console.timeEnd('multiple connections inserts');

        expect(await countNodes()).to.eq(1000);
    }).timeout(40000)
});