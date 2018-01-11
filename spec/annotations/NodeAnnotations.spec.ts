import {nodeEntity} from "../../lib/annotations";
import {expect} from 'chai';
import {NodeMetadata} from "../../lib/metadata/NodeMetadata";
import {NodeEntity} from "../../lib/model";

describe("NodeAnnotations", () => {
    @nodeEntity('DummyVehicle')
    class DummyVehicle extends NodeEntity {
    }

    @nodeEntity('DummyCar')
    class DummyCar extends DummyVehicle {
    }

    describe("@nodeEntity", () => {
        it("attaches instance of NodeMetadata to annotated class", () => {
            let nodeMetadata = NodeMetadata.getForClass(DummyVehicle);
            expect(nodeMetadata).to.be.instanceof(NodeMetadata);
        });

        it("allows to get attached instance of NodeMetadata from annotated class instance ", () => {
            let nodeMetadata = NodeMetadata.getForInstance(new DummyVehicle());
            expect(nodeMetadata).to.be.instanceof(NodeMetadata);
        });

        it("set label for NodeMetadata", () => {
            let nodeMetadata:NodeMetadata = NodeMetadata.getForClass(DummyVehicle) as NodeMetadata;
            expect(nodeMetadata.getLabels()).to.eql(['DummyVehicle'])
        });

        it("supports inheritance", () => {
            let nodeMetadata:NodeMetadata = NodeMetadata.getForClass(DummyCar) as NodeMetadata;
            expect(nodeMetadata.getLabels()).to.eql(['DummyCar', 'DummyVehicle'])
        });
    });
});