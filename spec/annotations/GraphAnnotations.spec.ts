// import 'reflect-metadata';
//
//
// import {expect} from 'chai';
//
//
//
//
// describe("GraphAnnotations", () => {
//
//
//
//
//     describe("@node", () => {
//         it("throws when node type is already registered", () => {
//             expect(() => {
//                 @node('SomeClassNode')
//                 class Collision {
//                 }
//             }).to.throw('Given labels set ( SomeClassNode ) is already registered');
//         });
//     });
//
//     describe("Mapping", () => {
//         @node('NodeForMappingExamples')
//         class NodeForMappingExamples extends AbstractNode {
//             static build = createFactoryMethod(NodeForMappingExamples);
//             @attribute() firstName:string;
//             @attribute() lastName:string;
//         }
//
//         it("maps neo result to node instance", () => {
//             let response = {
//                 labels: ['NodeForMappingExamples'],
//                 properties: {
//                     createdAt: int(123),
//                     updatedAt: int(456),
//                     id: 'someNid',
//                     firstName: 'Jane',
//                     lastName: 'Doe',
//                     wontBeMapped: 'Irrelevant'
//                 }
//             };
//
//             let metadata = NodeMetadata.getOrCreateForClass(NodeForMappingExamples);
//             let mapped = nodeTypesRegistry.getMapper(response.labels).mapToInstance(response);
//             expect(mapped).to.be.instanceof(NodeForMappingExamples);
//             expect(mapped).to.eql(NodeForMappingExamples.build({
//                 createdAt: 123,
//                 updatedAt: 456,
//                 id: 'someNid',
//                 firstName: 'Jane',
//                 lastName: 'Doe'
//             }));
//         });
//
//
//         it("maps class to ", () => {
//             let node = NodeForMappingExamples.build({
//                 createdAt: 123,
//                 updatedAt: 456,
//                 id: 'someOtherId',
//                 firstName: 'Jan',
//                 lastName: 'Kowalski'
//             });
//
//             let mapperForClass = someOrThrow(nodeTypesRegistry.getMapperForClass(NodeForMappingExamples), 'missing mapper');
//             let mapped = mapperForClass.mapToRow(node, 'skip');
//             expect(mapped).to.eql({
//                 createdAt: int(123),
//                 updatedAt: int(456),
//                 firstName: "Jan",
//                 lastName: "Kowalski",
//                 id: "someOtherId",
//             });
//         });
//     });
// });