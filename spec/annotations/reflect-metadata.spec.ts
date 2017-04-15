import 'reflect-metadata';
import {expect} from 'chai';
import {getClassAncestors, getSuperClass} from "../../lib/utils/core";


describe("decorating class", () => {

    class SomeClass {}
    Reflect.defineMetadata('SOME_KEY', {a: 1}, SomeClass);

    class ExtraClass extends SomeClass {}
    Reflect.defineMetadata('SOME_KEY', {b: 1}, ExtraClass);

    class AwesomeClass extends ExtraClass {}

    describe("for base class", () => {
        describe(".getOwnMetadata", () => {
            it("returns defined metadata", () => {
                expect(Reflect.getOwnMetadata('SOME_KEY', SomeClass)).to.eql({a: 1});
            });

            it("returns defined metadata from instance", () => {
                let instance = new SomeClass();
                expect(Reflect.getOwnMetadata('SOME_KEY', instance.constructor)).to.eql({a: 1});
            });
        });
    });

    describe("for class inheriting from base", () => {
        describe(".getOwnMetadata", () => {
            it("returns defined metadata", () => {
                expect(Reflect.getOwnMetadata('SOME_KEY', ExtraClass)).to.eql({b: 1});
            });

            it("returns defined metadata from instance", () => {
                let instance = new ExtraClass();

                expect(Reflect.getOwnMetadata('SOME_KEY', instance.constructor)).to.eql({b: 1});
                expect(Reflect.getOwnMetadata('SOME_KEY', instance.constructor)).to.eql({b: 1});
            });
        });
    });

    describe("for class inheriting from extra class", () => {
        describe(".getOwnMetadata", () => {
            it("returns defined metadata", () => {
                expect(Reflect.getOwnMetadata('SOME_KEY', ExtraClass)).to.eql({b: 1});
            });

            it("returns defined metadata from instance", () => {
                let instance = new AwesomeClass();

                // expect(Reflect.getOwnMetadata('SOME_KEY', instance.constructor)).to.eql({b: 1});
                // expect(Reflect.getOwnMetadata('SOME_KEY', instance.constructor)).to.eql({b: 1});
            });
        });
    });

    describe(".getClassAncestors", () => {
        it("returns all superclasses", () => {
            expect(getClassAncestors(AwesomeClass)).to.eql([ExtraClass, SomeClass])
        });

    });

    describe(".getSuperClass", () => {
        it("returns super class", () => {
            expect(getSuperClass(SomeClass)).to.eql(null);
            expect(getSuperClass(ExtraClass)).to.eql(SomeClass);
            expect(getSuperClass(AwesomeClass)).to.eql(ExtraClass);
        });
    });

});