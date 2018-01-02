import {attribute} from "../../lib/annotations";
import {AttributesMetadata} from "../../lib/metadata/AttributesMetadata";
import {expect} from 'chai';

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
});