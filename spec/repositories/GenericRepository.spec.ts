// import {expect} from 'chai';
// import * as _ from 'lodash';
// import {node} from "../../lib/annotations/NodeAnnotations";
// import {AbstractNode} from "../../lib/model/AbstractNode";
// import {createFactoryMethod} from "../../lib/model/createFactoryMethod";
// import {attribute} from "../../lib/annotations/AttributesAnnotations";
// import {AbstractRelation} from "../../lib/model/AbstractRelation";
// import {relation} from "../../lib/annotations/RelationAnnotations";
// import {NodeRepository} from "../../lib/repositories/NodeRepository";
// import {RelationsRepository} from "../../lib/repositories/RelationsRepository";
//
//
//
// describe("Generic Repository", () => {
//
//     @node('__SpecGenericNode')
//     class GenericNode extends AbstractNode {
//         static build = createFactoryMethod(GenericNode);
//
//         @attribute() firstName:string;
//         @attribute() lastName?:string;
//     }
//
//     @relation('__GenericRelation')
//     class GenericRelation extends AbstractRelation {
//         static build = createFactoryMethod(GenericRelation);
//
//         @attribute() since:number;
//         @attribute() until?:number;
//         @attribute() isFriend?:boolean;
//     }
//
//     let genericRepository:NodeRepository<GenericNode>,
//         relationRepository:RelationsRepository<GenericNode,GenericRelation,GenericNode>,
//         genericNode:GenericNode;
//     beforeEach(async() => {
//         genericRepository = getInstance(GenericRepositoryFactory).forNode(GenericNode);
//         relationRepository = getInstance(GenericRepositoryFactory).forRelation(GenericNode, GenericRelation, GenericNode);
//         genericNode = GenericNode.build({firstName: "John", lastName: "Doe"});
//         await cleanDatabase();
//     });
//
//     describe(".saveNode", () => {
//         let createdGenericNode:PersistedGraphEntity<GenericNode>;
//         beforeEach(async() => {
//             createdGenericNode = await genericRepository.saveNode(genericNode);
//         });
//
//         it("returns created entity having proper params", async() => {
//             expect(createdGenericNode).to.be.instanceof(GenericNode);
//             expect(createdGenericNode.firstName).to.eql(genericNode.firstName);
//             expect(createdGenericNode.lastName).to.eql(genericNode.lastName);
//         });
//
//         it("return created entity having PersistedEntityParams", () => {
//             expect(createdGenericNode.id).to.be.a('string');
//             expect(createdGenericNode.createdAt).to.be.a('number');
//             expect(createdGenericNode.updatedAt).to.be.a('number');
//         });
//
//         it("does not store additional params", () => {
//             expect(Object.keys(createdGenericNode).sort())
//                 .to.eql(['firstName', 'lastName', 'id', 'createdAt', 'updatedAt'].sort());
//         });
//
//         it("creates new buildNode", async() => {
//             let nodes = await genericRepository.connection
//                 .execQuery(`MATCH(n {id: {id}}) return n`, {id: createdGenericNode.id})
//                 .toRecords();
//
//             expect(nodes[0].get('n').properties.id).to.eql(createdGenericNode.id);
//             expect(nodes[0].get('n').properties.createdAt).to.eql(int(createdGenericNode.createdAt));
//             expect(nodes[0].get('n').properties.updatedAt).to.eql(int(createdGenericNode.updatedAt));
//             expect(nodes[0].get('n').properties.firstName).to.eql(createdGenericNode.firstName);
//             expect(nodes[0].get('n').properties.lastName).to.eql(createdGenericNode.lastName);
//         });
//     });
//
//     describe(".nodeExists", () => {
//         it("returns true if buildNode exists", async() => {
//             let storedNode:PersistedGraphEntity<GenericNode> = await genericRepository.saveNode(GenericNode.build({
//                 firstName: 'Tomasz',
//                 lastName: 'RORO'
//             }));
//             expect(await genericRepository.nodeExists(storedNode.id)).to.eq(true);
//         });
//
//         it("returns false if buildNode does not exists", async() => {
//             expect(await genericRepository.nodeExists('WRONG NODE ID')).to.eq(false);
//         });
//     });
//
//     describe(".getNodeById", () => {
//         it("returns fetched buildNode if exists", async() => {
//             let createdGenericNode = await genericRepository.saveNode(genericNode);
//             let retrievedGenericNodes:PersistedGraphEntity<GenericNode>[] = await genericRepository.where({id: createdGenericNode.id as string});
//             expect(retrievedGenericNodes[0]).to.eql(createdGenericNode);
//         });
//
//         it("returns null if buildNode does not exist", async() => {
//             let retrievedGenericNode = await genericRepository.where({id: 'non existing id :D'});
//             expect(retrievedGenericNode[0]).to.eq(undefined);
//         });
//     });
//
//     describe(".removeNode", () => {
//         it("removes node", async() => {
//             let createdNode = await genericRepository.saveNode(genericNode);
//             expect(await genericRepository.nodeExists(createdNode.id)).to.eq(true);
//             await genericRepository.removeNode(createdNode.id);
//             expect(await genericRepository.nodeExists(createdNode.id)).to.eq(false);
//         });
//
//         it("removes all related relations", async() => {
//             let from = await genericRepository.saveNode(genericNode);
//             let to = await genericRepository.saveNode(GenericNode.build({firstName: 'Jane', lastName: 'Doe'}));
//
//             let createdRelation = await relationRepository.saveRelation(from, to, GenericRelation.build({since: 123}));
//             expect(await genericRepository.nodeExists(from.id)).to.eq(true);
//             expect(await genericRepository.nodeExists(to.id)).to.eq(true);
//             expect(await relationRepository.relationExists(createdRelation.id)).to.eq(true);
//
//             await genericRepository.removeNode(from.id);
//
//             expect(await genericRepository.nodeExists(from.id)).to.eq(false);
//             expect(await genericRepository.nodeExists(to.id)).to.eq(true);
//             expect(await relationRepository.relationExists(createdRelation.id)).to.eq(false);
//         });
//     });
//
//     describe(".updateNode", () => {
//         let savedNode:PersistedGraphEntity<GenericNode>;
//
//         beforeEach(async() => {
//             savedNode = await genericRepository.saveNode(GenericNode.build({firstName: 'John', lastName: 'Doe'}));
//         });
//
//         it("updates with provided params", async() => {
//             let edited:PersistedGraphEntity<GenericNode> = _.cloneDeep(savedNode);
//             edited.firstName = 'updateFirstName';
//             (edited as any).lastName = null;
//             let result = await genericRepository.updateNode(edited);
//             expect(_.omit('updatedAt', result)).to.eql(_.omit('updatedAt', edited))
//         });
//
//         it("updates updatedAt property", async() => {
//             let result = await genericRepository.updateNode(savedNode);
//             expect(result.updatedAt).to.be.greaterThan(savedNode.updatedAt);
//         });
//     });
//
//     describe(".saveRelation", () => {
//         it("creates relation", async() => {
//             let u1 = await genericRepository.saveNode(GenericNode.build({firstName: 'Tom'}));
//             let u2 = await genericRepository.saveNode(GenericNode.build({firstName: 'Glen'}));
//             let rel = await relationRepository.saveRelation(u1, u2, GenericRelation.build({since: 123}));
//
//             let results = await genericRepository.connection
//                 .execQuery(`MATCH ()-[rel:__GenericRelation {since: 123}]->() RETURN rel`)
//                 .toRecords();
//             expect(results[0].get('rel').properties.since).to.eql(123);
//         });
//
//         it("adds params for persisted entity", async() => {
//             let u1 = await genericRepository.saveNode(GenericNode.build({firstName: 'Tom'}));
//             let u2 = await genericRepository.saveNode(GenericNode.build({firstName: 'Glen'}));
//             let rel = await relationRepository.saveRelation(u1, u2, GenericRelation.build({since: 123}));
//
//             expect(rel.id).to.be.a('string');
//             expect(rel.createdAt).to.be.a('number');
//             expect(rel.updatedAt).to.be.a('number');
//         });
//     });
//
//     describe(".removeRelation", () => {
//         it("removes relation", async() => {
//             let u1 = await genericRepository.saveNode(GenericNode.build({firstName: 'Tom'}));
//             let u2 = await genericRepository.saveNode(GenericNode.build({firstName: 'Glen'}));
//             let rel = await relationRepository.saveRelation(u1, u2, GenericRelation.build({since: 123}));
//
//             expect(await relationRepository.relationExists(rel.id)).to.eq(true);
//             await relationRepository.removeRelation(rel.id);
//             expect(await relationRepository.relationExists(rel.id)).to.eq(false);
//         });
//     });
//
//     describe(".updateRelation", () => {
//         let savedRelation:PersistedGraphEntity<GenericRelation>,
//             editedRelation:PersistedGraphEntity<GenericRelation>;
//
//         beforeEach(async() => {
//             let u1 = await genericRepository.saveNode(GenericNode.build({firstName: 'John'}));
//             let u2 = await genericRepository.saveNode(GenericNode.build({firstName: 'Glen'}));
//
//             savedRelation = await relationRepository.saveRelation(u1, u2, GenericRelation.build({
//                 since: 123,
//                 isFriend: true,
//                 until: 321
//             }));
//             editedRelation = _.clone(savedRelation);
//         });
//
//         it("updates relation with provided params", async() => {
//             editedRelation.since = 321;
//             let updatedRelation = await relationRepository.updateRelation(editedRelation);
//             expect(updatedRelation.until).to.eq(321);
//         });
//
//         it("does not change id", async() => {
//             let updatedRelation = await relationRepository.updateRelation(editedRelation);
//             expect(updatedRelation.id).to.eq(savedRelation.id);
//         });
//
//         it("does not modify other parameters", async() => {
//             editedRelation.until = 321;
//             let updatedRelation = await relationRepository.updateRelation(editedRelation);
//             expect(updatedRelation.since).to.eq(savedRelation.since);
//             expect(updatedRelation.isFriend).to.eq(savedRelation.isFriend);
//         });
//     });
// });