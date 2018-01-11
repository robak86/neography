import {Relationship} from "../../lib/model/Relationship";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {Connection} from "../../lib";
import {DummyUserNode} from "../fixtures/DummyUserNode";
import {HasVehicleRelation} from "../fixtures/HasVehicleRelation";
import {DummyCarNode} from "../fixtures/DummyCarNode";
import {expect} from 'chai';
import * as _ from 'lodash';
import {ConnectedNode} from "../../lib/model/ConnectedNode";

describe(`Relationship`, () => {
    let aRel:Relationship<HasVehicleRelation, DummyCarNode>,
        connection:Connection,
        graph:{
            vw:DummyCarNode,
            porsche:DummyCarNode,
            owner:DummyUserNode,
            hasVolkswagen:HasVehicleRelation,
            hasPorsche:HasVehicleRelation
        };

    beforeEach(async () => {
        connection = getSharedConnection();
        await cleanDatabase();

        let owner = new DummyUserNode({firstName: 'John', email: 'john.doe@example.com'});
        let car1 = new DummyCarNode({name: 'Porsche Macan Turbo', horsePower: 450});
        let car2 = new DummyCarNode({name: 'Volkswagen', horsePower: 110});

        graph = await connection.runQuery(q => q
            .create(c => [
                c.node(owner).as('owner'),
                c.node(car1).as('porsche'),
                c.node(car2).as('vw')
            ])
            .create(c => [
                c.matchedNode('owner'),
                c.relation(new HasVehicleRelation({isRented: true})).as('hasVolkswagen'),
                c.matchedNode('vw')
            ])
            .create(c => [
                c.matchedNode('owner'),
                c.relation(new HasVehicleRelation({isRented: false})).as('hasPorsche'),
                c.matchedNode('porsche')
            ])
            .returns('vw', 'porsche', 'owner', 'hasVolkswagen', 'hasPorsche')
        ).first();

        aRel = new Relationship(HasVehicleRelation, DummyCarNode).bindToNode(() => graph.owner);
    });

    describe(`accessing active relation from relations definition`, () => {
        it('returns active relation', async () => {
            let fetchedCars:DummyCarNode[] = await graph.owner.vehicles.all();
            expect(fetchedCars).to.have.deep.members([graph.vw, graph.porsche]);
        });

    });

    describe(`.read`, () => {
        describe(`.all()`, () => {
            it('returns all connected nodes', async () => {
                let fetchedCars:DummyCarNode[] = await aRel.all();
                expect(fetchedCars).to.have.deep.members([graph.vw, graph.porsche]);
            });
        });

        describe(`limit`, () => {
            it('limits the count of returned rows', async () => {
                let fetchedCars:DummyCarNode[] = await aRel
                    .orderByNode(by => by.attribute('horsePower').asc())
                    .limit(1).all();
                expect(fetchedCars).to.have.deep.members([graph.vw]);
            });
        });

        describe(`skip`, () => {
            it('skip given amount of rows', async () => {
                let fetchedCars:DummyCarNode[] = await aRel
                    .orderByNode(by => by.attribute('horsePower').asc())
                    .skip(1)
                    .all();
                expect(fetchedCars).to.have.deep.members([graph.porsche]);
            });
        });

        describe(`.first`, () => {
            it('returns first element', async () => {
                // let car:DummyCarNode|null = await aRel.first();
                // expect([graph.vw, graph.porsche])([car]);
            });
        });

        describe(`.orderByNode`, () => {
            it('order results by node property', async () => {
                let fetchedCars:DummyCarNode[] = await aRel
                    .orderByRelation(by => by.attribute('isRented').desc())
                    .all();

                expect(fetchedCars.map(c => c.name)).to.eql([graph.vw.name, graph.porsche.name]);


                fetchedCars = await aRel
                    .orderByRelation(by => by.attribute('isRented').asc())
                    .all();

                expect(fetchedCars.map(c => c.name)).to.eql([graph.porsche.name, graph.vw.name]);
            });
        });

        describe(`.orderByRelation`, () => {
            it('order results by node property', async () => {
                let fetchedCars:DummyCarNode[] = await aRel
                    .orderByNode(by => by.attribute('horsePower').asc())
                    .all();

                expect(fetchedCars.map(c => c.name)).to.eql([graph.vw.name, graph.porsche.name]);


                fetchedCars = await aRel
                    .orderByNode(by => by.attribute('horsePower').desc())
                    .all();

                expect(fetchedCars.map(c => c.name)).to.eql([graph.porsche.name, graph.vw.name]);
            });
        });


        describe(`.whereNode`, () => {
            let filtered:Relationship<HasVehicleRelation, DummyCarNode>;

            describe(`ex.1`, () => {
                beforeEach(() => {
                    filtered = aRel.whereNode(w => w.attribute('name').equal('Volkswagen'))
                });

                describe(`all`, () => {
                    it('returns filtered nodes', async () => {
                        let fetchedCars:DummyCarNode[] = await filtered.all();
                        expect(fetchedCars).to.have.deep.members([graph.vw]);
                    });
                });

                describe(`.allWithRelations`, async () => {
                    it('returns all nodes with relations', async () => {
                        let fetchedCars:ConnectedNode<HasVehicleRelation, DummyCarNode>[] = await filtered.allWithRelations();
                        expect(fetchedCars).to.have.deep.members([{relation: graph.hasVolkswagen, node: graph.vw}]);
                    });
                });

                describe('.first', async () => {
                    it('returns first element', async () => {
                        let car:DummyCarNode | null = await filtered.first();
                        expect(car).to.eql(graph.vw);
                    });
                });

                describe(`.count`, () => {
                    it('returns count of filtered nodes', async () => {
                        let count:number = await filtered.count();
                        expect(count).to.eq(1);
                    });
                });
            });

            describe(`ex.2`, () => {
                beforeEach(() => {
                    filtered = aRel.whereNode(w => w.attribute('id').in([graph.vw.id, graph.porsche.id]))
                });

                it('returns filtered nodes', async () => {
                    let fetchedCars:DummyCarNode[] = await filtered.all();
                    expect(fetchedCars).to.have.deep.members([graph.vw, graph.porsche]);
                });

                describe(`.allWithRelations`, async () => {
                    it('returns all nodes with relations', async () => {
                        let fetchedCars:ConnectedNode<HasVehicleRelation, DummyCarNode>[] = await filtered.allWithRelations();
                        expect(fetchedCars).to.have.deep.members([
                            {relation: graph.hasVolkswagen, node: graph.vw},
                            {relation: graph.hasPorsche, node: graph.porsche}
                        ]);
                    });
                });
            });
        });

        describe(`.exist`, () => {
            it('returns true if given node exists', async () => {
                let exists:boolean = await aRel
                    .whereNode(w => w.attribute('horsePower')
                        .equal(450))
                    .exist();
                expect(exists).to.eq(true);
            });
        });

        describe(`.whereRelation`, () => {
            let filtered:Relationship<HasVehicleRelation, DummyCarNode>;

            beforeEach(() => {
                filtered = aRel.whereRelation(w => w.attribute('isRented').equal(false))
            });

            describe(`.all`, () => {
                it('returns nodes filtered by relations', async () => {
                    let fetchedCars:DummyCarNode[] = await filtered.all();
                    expect(fetchedCars).to.have.deep.members([graph.porsche]);
                });
            });

            describe(`.first`, () => {
                it('returns first element', async () => {
                    let car:DummyCarNode | null = await filtered.first();
                    expect(car).to.eql(graph.porsche);
                });
            });

            describe(`.count`, () => {
                it('returns count of filtered nodes', async () => {
                    let count:number = await filtered.count();
                    expect(count).to.eq(1);
                });
            });

            describe(`.allWithRelations`, () => {
                it('returns filtered nodes with relations', async () => {
                    let fetchedCars:ConnectedNode<HasVehicleRelation, DummyCarNode>[] = await filtered.allWithRelations();
                    expect(fetchedCars).to.have.deep.members([
                        {relation: graph.hasPorsche, node: graph.porsche}
                    ]);
                });
            });
        });

        describe(`.whereRelation combined with .whereNode`, () => {
            it('returns nodes filtered by node and relation params ex.1', async () => {
                let fetchedCars:DummyCarNode[] = await aRel
                    .whereRelation(w => w.attribute('isRented').equal(false))
                    .whereNode(w => w.attribute('name').equal('Porsche Macan Turbo'))
                    .all();
                expect(fetchedCars).to.have.deep.members([graph.porsche]);
            });
        });

        describe(`.allWithRelations`, () => {
            it('returns all connected nodes with relation', async () => {
                let cars:ConnectedNode<HasVehicleRelation, DummyCarNode>[] = await aRel.allWithRelations();
                expect(cars).to.have.deep.members([
                    {relation: graph.hasPorsche, node: graph.porsche},
                    {relation: graph.hasVolkswagen, node: graph.vw}
                ]);
            });
        });

        describe(`.count()`, () => {
            it('return count of connected nodes', async () => {
                let count:number = await aRel.count();
                expect(count).to.eq(2);
            });
        });
    });

    describe(`.write`, () => {
        describe(`.set`, () => {
            it('sets new nodes for save', async () => {
                let car = new DummyCarNode({name: 'Subaru', horsePower: 290});
                graph.owner.vehicles.set(car);
                await graph.owner.vehicles.save();

                let cars = await graph.owner.vehicles.all();
                expect(cars.length).to.eq(1);
            });

            it(`doesn't remove detached nodes`);
            it(`doesn't create duplicated connections`);
            it(`throws for self referencing relations`);
            it(`do nothing if .set wasn't called `);
        });

        describe(`.setWithRelations`, () => {
            it('sets new nodes for save', async () => {
                let car = new DummyCarNode({name: 'Subaru', horsePower: 290});
                let hasVehicleRelation = new HasVehicleRelation({isRented: true});

                graph.owner.vehicles.setWithRelations({node: car, relation: hasVehicleRelation});
                await graph.owner.vehicles.save();

                let relations = await graph.owner.vehicles.allWithRelations();
                expect(relations.length).to.eq(1);

                expect(relations[0].node).to.deep.eq(car);
                expect(relations[0].relation.isRented).to.deep.eq(true);
            });

            it(`doesn't remove detached nodes`);
            it(`doesn't create duplicated connections`);
            it(`throws for self referencing relations`);
            it(`do nothing if .setWithRelations wasn't called `);
        });
    });
});