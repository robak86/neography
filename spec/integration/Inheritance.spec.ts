import {attribute, nodeEntity, timestamp} from "../../lib/annotations";
import {NodeEntity} from "../../lib/model";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {expect} from 'chai';

describe(`inheritance`, () => {
    @nodeEntity('__Vehicle')
    class VehicleNode extends NodeEntity {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() name:string;
    }

    @nodeEntity('__Car')
    class CarNode extends VehicleNode {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() name:string;
    }

    @nodeEntity('__Bike')
    class BikeNode extends VehicleNode {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() name:string;
    }

    describe(`querying for base class`, () => {
        let bike:BikeNode,
            car:CarNode,
            vehicle:VehicleNode;

        beforeEach(async () => {
            await cleanDatabase();
            bike = new BikeNode({name: 'some bike'});
            car = new CarNode({name: 'some car'});
            vehicle = new VehicleNode({name: 'some vehicle'});
            await Promise.all([bike.save(), car.save(), vehicle.save()]);
        });


        it(`fetches all base nodes and all inherited from it`, async () => {
            let allVehicles = await getSharedConnection().nodeQuery(VehicleNode).all();
            expect(allVehicles.map(v => v.id)).to.have.members([bike.id, car.id, vehicle.id]);
        });

        it(`fetches all car nodes`, async () => {
            let cars = await getSharedConnection().nodeQuery(CarNode).all();
            expect(cars.map(v => v.id)).to.have.members([car.id]);
        });
    });

    it(`supports relations between nodes which use inheritance`);
});