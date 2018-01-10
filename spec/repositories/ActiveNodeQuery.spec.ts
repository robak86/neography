import {DummyUserNode} from "../fixtures/DummyUserNode";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {ActiveNodeQuery} from "../../lib/repositories/ActiveNodeQuery";
import {expect} from 'chai';
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";

describe(`ActiveNodeQuery`, () => {
    const saveUser = (user:DummyUserNode):Promise<DummyUserNode> => {
        return getSharedConnection().runQuery(b => b
            .create(c => [c.node(user).as('user')])
            .returns('user')
        ).pluck('user').first();
    };


    let users:DummyUserNode[],
        activeNodeQuery:ActiveNodeQuery<DummyUserNode>;

    beforeEach(async () => {
        await cleanDatabase();
        users = [];
        users.push(await saveUser(new DummyUserNode({experience: 0, firstName: 'Tom'})));
        users.push(await saveUser(new DummyUserNode({experience: 1, firstName: 'John'})));
        users.push(await saveUser(new DummyUserNode({experience: 2, firstName: 'Angela'})));
        users.push(await saveUser(new DummyUserNode({experience: 3, firstName: 'Jessica'})));
        users.push(await saveUser(new DummyUserNode({experience: 4, firstName: 'Dan'})));
        activeNodeQuery = new ActiveNodeQuery(DummyUserNode);
    });


    describe(`.all`, () => {
        it('returns all nodes', async () => {
            let fetchedUsers = await activeNodeQuery.all();
            expect(users.map(u => u.id)).to.have.members(fetchedUsers.map(u => u.id));
        });
    });


    describe(`.where`, () => {
        describe(`.all`, () => {
            it('returns filtered nodes', async () => {
                let fetchedUsers = await activeNodeQuery.where(w => [w.attribute('experience').in([0, 1, 2])]).all()
                expect([users[0].id, users[1].id, users[2].id]).to.have.members(fetchedUsers.map(u => u.id));
            });
        });
    });

    describe(`.withRelations`, () => {
        it('eager loads relations', () => {
            activeNodeQuery.withRelations(r => [r.vehicles]) //It's typesafe!
        });
    });

});


async function main() {
    let a = new ActiveNodeQuery(DummyGraphNode);

    a.where(w => [
        w.attribute('attr1').in(['1', '2', '3'])
    ]);

    let rel = await a.relations();

    // rel[0].

    let otherDummies = rel[0].otherDummies
        .whereNode({attr1: '1'})
        .whereNode(w => [
            w.attribute('attr1').in(['1', '2', '3'])
        ])
        .whereRelation({attr2: 2})
        .whereRelation(w => [
            w.attribute('attr3').equal(true)
        ])
        .orderByNode(o => o.asc('attr1'))
        .orderByRelation(o => o.desc('attr3'))
        .skip(1)
        .limit(10);

    //until this point every call doesn't trigger any query


    await otherDummies.exists();
    await otherDummies.count();
    await otherDummies.first();
    await otherDummies.firstWithRelation();

    await otherDummies.all();
    await otherDummies.allWithRelations();

    await rel[0].otherDummies.set(new DummyGraphNode());
    await rel[0].otherDummies.set([new DummyGraphNode(), new DummyGraphNode()]);

    await rel[0].otherDummies.setWithRelations([
        {relation: new DummyGraphRelation(), node: new DummyGraphNode()},
        {relation: new DummyGraphRelation(), node: new DummyGraphNode()}
    ]);
}
