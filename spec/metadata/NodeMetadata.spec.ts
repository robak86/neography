import {expect} from 'chai';
import {NodeEntity} from "../../lib/model/NodeEntity";
import {NodeMetadata} from "../../lib/metadata/NodeMetadata";

describe("NodeMetadata", () => {

    describe("getForClass", () => {
        class SomeClass extends NodeEntity {}

        it("returns undefined if metadata is attached", () => {
            expect(NodeMetadata.getForClass(SomeClass)).to.eq(undefined);
        });

        it("returns singleton instance of NodeMetadata attached to class", () => {
            NodeMetadata.getOrCreateForClass(SomeClass);
            expect(NodeMetadata.getForClass(SomeClass)).to.be.instanceof(NodeMetadata);
            expect(NodeMetadata.getForClass(SomeClass)).to.eq(NodeMetadata.getForClass(SomeClass));
        });
    });

    describe("inheritance", () => {
        class A extends NodeEntity {}
        class B extends A {}

        before(() => {
            NodeMetadata.getOrCreateForClass(A);
            NodeMetadata.getOrCreateForClass(B);
        });

        it("connects NodeMetadata instances basing on classes inheritance", () => {
            expect(NodeMetadata.getOrCreateForClass(B).parent).to.eq(NodeMetadata.getOrCreateForClass(A));
        });
    });


    describe(".getLabels", () => {
        class A extends NodeEntity {}
        class B extends A {}

        before(() => {
            NodeMetadata.getOrCreateForClass(A).setOwnLabel('parent');
            NodeMetadata.getOrCreateForClass(B).setOwnLabel('child');
        });

        it("returns labels", () => {
           expect(NodeMetadata.getOrCreateForClass(A).getLabels()).to.eql(['parent']);
           expect(NodeMetadata.getOrCreateForClass(B).getLabels()).to.eql(['child', 'parent' ]); //labels have to be sorted, because neo4j doesn't guarantee order of labels
        });
    });

    describe(".getId", () => {
        class A extends NodeEntity {}
        class B extends A {}

        before(() => {
            NodeMetadata.getOrCreateForClass(A).setOwnLabel('parent');
            NodeMetadata.getOrCreateForClass(B).setOwnLabel('child');
        });

        it("returns metadata id used for fetching proper mapper", () => {
            expect(NodeMetadata.getOrCreateForClass(A).getId()).to.eql('parent');
            expect(NodeMetadata.getOrCreateForClass(B).getId()).to.eql('child_parent');
        });
    });
});