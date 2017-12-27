import {expect} from 'chai';
import * as faker from 'faker';
import * as _ from 'lodash';
import {Partial} from "../../lib/utils/types";
import {genId} from "../../lib/utils/uuid";
import {int, isInt} from "../../lib/driver/Integer";
import {checkoutConnection, cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {DummyGraphNode} from "../fixtures/DummyGraphNode";
import {Connection} from "../../lib";
import {buildQuery} from "../../lib/cypher";

describe("Connection", () => {
    let connection:Connection;

    beforeEach(async () => {
        connection = getSharedConnection();
        await cleanDatabase();
    });

    const createFakePerson = async (connection:Connection) => {
        return connection.runQuery(q => q.literal(
            `CREATE (n:Person {person}) return n`,
            {
                person: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    age: int(faker.random.number(30)),
                    id: genId()
                }
            }
        )).toArray()
    };

    describe("execQuery", () => {
        it("runs cypher queries", async () => {
            let queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
            expect(queryResponse.length).to.eq(0);
            await createFakePerson(connection);

            queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
            expect(queryResponse.length).to.eq(1);
        });
    });


    describe(".toRecords", () => {
        it("returns array of raw neo4j records", async () => {
            let rows = await createFakePerson(connection);

            let p1:any = rows[0]['n'] as any;
            expect(p1.labels).to.eql(['Person']);

            expect(p1.properties.id).to.be.a('string');
            expect(p1.properties.firstName).to.be.a('string');
            expect(p1.properties.lastName).to.be.a('string');
            expect(isInt(p1.properties.age)).to.eql(true);
            expect(_.keys(p1.properties).sort()).to.eql(['firstName', 'lastName', 'id', 'age'].sort());
        });

        it("maps neo4j's Relationship to AbstractRelation", async () => {
            let u1Params = {firstName: "John", id: genId()};
            let u2Params = {firstName: "Glen", id: genId()};
            let r1Params = {since: int(12345)};

            let query = buildQuery().literal(`
                    CREATE (u1:User {u1Params})-[r1:KNOWS {r1Params}]->(u2:User {u2Params})
                    RETURN u1,r1,u2;`, {u1Params, u2Params, r1Params});

            let knowsRel = await connection.runQuery(query).pickOne('r1').first();

            expect(knowsRel.type).to.eql('KNOWS');
            expect(isInt(knowsRel.properties.since)).to.eq(true);
        });
    });

    describe("beginTransaction", () => {

        describe("without nesting", () => {
            it("runs queries in transaction", async () => {
                await connection.withTransaction(async () => {
                    await Promise.all([createFakePerson(connection), createFakePerson(connection)]);
                });


                let queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                expect(queryResponse.length).to.eq(2);
            });

            it("rollbacks transaction on wrong query", async () => {
                await connection.withTransaction(async () => {
                    await createFakePerson(connection);
                    await connection.runQuery(q => q.literal(`Wrong query`))
                }).catch(_.noop);

                let queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                expect(queryResponse.length).to.eq(0);
            });

            it("rollback transaction when any error is thrown", async () => {
                await connection.withTransaction(async () => {
                    await createFakePerson(connection);
                    throw new Error("Rollback me");
                }).catch(_.noop);

                let queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                expect(queryResponse.length).to.eq(0);
            });

            it("runs many transactions", async () => {
                //first transaction - it will be rolled back
                await connection.withTransaction(async () => {
                    await createFakePerson(connection);
                    await connection.runQuery(q => q.literal(`Wrong query`));
                }).catch(_.noop);

                //second transaction - it will be committed
                await connection.withTransaction(async () => {
                    await Promise.all([createFakePerson(connection), createFakePerson(connection)]);
                });

                let queryResponse = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                expect(queryResponse.length).to.eq(2);
            });

            it("makes transaction changes immediately available for connection instance", async () => {
                let connection2 = checkoutConnection();

                let responseWithinTransaction, responseOutsideTransaction;
                await connection.withTransaction(async () => {
                    await Promise.all([createFakePerson(connection), createFakePerson(connection)]);
                    responseWithinTransaction = await connection.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                    responseOutsideTransaction = await connection2.runQuery(q => q.literal(`MATCH (n:Person) return n`)).toArray();
                });

                expect(responseOutsideTransaction.length).to.eq(0);
                expect(responseWithinTransaction.length).to.eq(2);
            }).timeout(3000);
        });

        describe("with nesting", () => {
            const createNode = (params:Partial<DummyGraphNode>) => connection.runQuery(cypher => cypher
                .create(c => c.node(DummyGraphNode.build(params)).as('n'))
                .returns('n')
            );

            it("rollbacks everything wrapped called as callback provided to withTransaction on wrong query call", async () => {
                await connection.withTransaction(async () => {
                    await createNode({attr1: 'top transaction'});
                    await connection.withTransaction(async () => {
                        await createNode({attr1: 'nested transaction'});
                        await connection.runQuery(q => q.literal(`Wrong query`));
                    });
                }).catch(_.noop);

                let rows:any[] = await connection.runQuery(cypher => cypher
                    .match(m => m.node(DummyGraphNode).as('n'))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(0);
            });

            it("rollbacks if an error is thrown", async () => {
                await connection.withTransaction(async () => {
                    await createNode({attr1: 'top transaction'});
                    await connection.withTransaction(async () => {
                        await createNode({attr1: 'nested transaction'});
                        throw new Error("rollback me");
                    });
                }).catch(_.noop);

                let rows:any[] = await connection.runQuery(cypher => cypher
                    .match(m => m.node(DummyGraphNode).as('n'))
                    .returns('n')
                ).toArray();

                expect(rows.length).to.eq(0);
            });
        });
    });
});