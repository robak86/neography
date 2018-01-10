import {DummyUserNode} from "../fixtures/DummyUserNode";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {ActiveNodeQuery} from "../../lib/repositories/ActiveNodeQuery";
import {expect} from 'chai';

describe.only(`ActiveNodeQuery`, () => {
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

    describe(`.order`, () => {
        describe(`.all`, () => {
            it('returns all ordered nodes', async () => {
                let fetchedUsers = await activeNodeQuery
                    .orderBy(by => by.attribute('experience').asc())
                    .all();
                expect(fetchedUsers.map(u => u.id)).to.eql(users.map(u => u.id));

                fetchedUsers = await activeNodeQuery
                    .orderBy(by => by.attribute('experience').desc())
                    .all();
                expect(fetchedUsers.map(u => u.id)).to.eql(users.map(u => u.id).reverse());
            });
        });
    });

    describe(`.skip`, () => {
        describe(`.all`, () => {
            it('skips give amount of rows and returns all the rest of nodes', async () => {
                let fetchedUsers = await activeNodeQuery
                    .orderBy(by => by.attribute('experience').asc())
                    .skip(4)
                    .all();
                expect(fetchedUsers.map(u => u.id)).to.eql([users[4].id]);
            });
        });
    });

    describe(`.findById`, () => {
        it('returns node with given id', async () => {
            let foundNode = await activeNodeQuery.findById(users[0].id);
            expect(foundNode.id).to.eq(users[0].id);
        });

        it('throws if node is not found', async () => {
            let findPromise = activeNodeQuery.findById('not existing id');
            await expect(findPromise).to.eventually.be.rejected;
        });
    });

    describe(`.first`, () => {
        it('returns node with given id', async () => {
            let foundNode = await activeNodeQuery
                .where(w => w.attribute('id').equal(users[0].id))
                .first();

            expect(foundNode!.id).to.eq(users[0].id);
        });

        it('returns null if node not found', async () => {
            let foundNode = await activeNodeQuery
                .where(w => w.attribute('id').equal('non existing id'))
                .first();

            expect(foundNode).to.be.undefined
        });
    });

    describe(`.limit`, () => {
        describe(`.all`, () => {
            it('limits amount of returned nodes', async () => {
                let fetchedUsers = await activeNodeQuery
                    .orderBy(by => by.attribute('experience').asc())
                    .limit(1)
                    .all();
                expect(fetchedUsers.map(u => u.id)).to.eql([users[0].id]);
            });
        });
    });

    describe(`.withRelations`, () => {
        it('eager loads relations', () => {
            activeNodeQuery.withRelations(r => [r.vehicles])
        });

        it('hits database only once');
    });
});