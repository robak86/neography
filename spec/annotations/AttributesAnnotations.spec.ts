import {attribute} from "../../lib/annotations";
import {AttributesMetadata} from "../../lib/metadata/AttributesMetadata";
import {expect} from 'chai';
import {DummyGraphRelation} from "../fixtures/DummyGraphRelation";
import {DummyCarNode} from "../fixtures/DummyCarNode";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";
import {AbstractNode} from "../../lib/model";
import {ActiveRelation} from "../../lib/model/ActiveRelation";

describe("Attributes annotations", () => {

    class SomeClass {
        @attribute() someProperty:boolean;
        @attribute() someOtherProperty:boolean;
    }

    class SomeOtherClass extends SomeClass {
        @attribute() someExtraProperty:boolean;
    }

    describe("@attribute", () => {
        describe("no inheritance", () => {
            it("collects own attributes names", () => {
                expect(AttributesMetadata.getForClass(SomeClass).getAttributesNames())
                    .to.eql(['someProperty', 'someOtherProperty']);

                expect((AttributesMetadata.getForInstance(new SomeClass())).getAttributesNames())
                    .to.eql(['someProperty', 'someOtherProperty']);
            });
        });

        describe("with inheritance", () => {
            it("collects own attributes names and every attributes from inheritance ancestors", () => {
                expect(AttributesMetadata.getForClass(SomeOtherClass).getAttributesNames())
                    .to.eql(['someProperty', 'someOtherProperty', "someExtraProperty"]);

                expect((AttributesMetadata.getForInstance(new SomeOtherClass())).getAttributesNames())
                    .to.eql(['someProperty', 'someOtherProperty', "someExtraProperty"]);
            });
        });
    });


    describe.only(`@relationship`, () => {
        class SomeClass extends AbstractNode{
            @relationship(DummyGraphRelation, DummyCarNode)
            someRel:any;
        }

        let s1:SomeClass;
        beforeEach(() => {
            s1 = new SomeClass();
        });

        it(`decorates getter and returns instance of ActiveRelation`, async () => {
            expect(s1.someRel).to.be.instanceOf(ActiveRelation);
        });

        it(`caches relation`, async () => {
            expect(s1.someRel).to.eq(s1.someRel);
        });

        it(`binds relation to node instance`, async () => {
            expect(s1.someRel.boundNode).to.eq(s1);
        });
    });
});