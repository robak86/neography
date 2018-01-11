import {attribute, node, relation, timestamp} from "../../lib/annotations";
import {AbstractNode, AbstractRelation} from "../../lib/model";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {expect} from 'chai';
import {sleep} from "../../lib/utils/promise";
import {ActiveRelation} from "../../lib/model/ActiveRelation";
import {relationship, relationshipThunk} from "../../lib/annotations/RelationshipAnnotations";

describe(`ActiveRelations`, () => {

    @relation('__IS_TAGGED')
    class IsTaggedRelation extends AbstractRelation<IsTaggedRelation> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
    }

    @relation('__BELONGS_TO_CATEGORY')
    class HasCategory extends AbstractRelation<HasCategory> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() order:number = 0;
    }

    @node('__Category')
    class CategoryNode extends AbstractNode<CategoryNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() categoryName:string;
        @attribute() price:number;
    }

    @node('__Tag')
    class TagNode extends AbstractNode<TagNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() tagName:string;
    }

    @node('__Item')
    class ItemNode extends AbstractNode<ItemNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() itemName:string;

        @relationship(HasCategory, CategoryNode)
        categories:ActiveRelation<HasCategory, CategoryNode>;
        @relationshipThunk(() => IsTaggedRelation, () => TagNode)
        tags:ActiveRelation<IsTaggedRelation, TagNode>;
    }
    

    let connection:Connection;

    beforeEach(async () => {
        connection = getSharedConnection();
        await cleanDatabase();
    });


    describe(`Writing single node`, () => {
        describe(`saving single nodes`, () => {
            it('creates new node', async () => {
                let category = new CategoryNode({categoryName: 'FirstCategory', price: 100});
                await category.save();
                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(1);
            });

            it(`doesn't set id if error was thrown for new entity`, async () => {
                let category = new CategoryNode({categoryName: {wrong: true} as any, price: 100});
                try {await category.save();} catch (e) {}
                expect(category.isPersisted()).to.eq(false);
            });

            it(`doesn't remove id if error was thrown for update`, async () => {
                let category = new CategoryNode({categoryName: 'ok', price: 100});
                await category.save();
                category.categoryName = {wrong: true} as any;
                try {await category.save();} catch (e) {}
                expect(category.isPersisted()).to.eq(true);
            });
        });

        describe(`updating existing node`, () => {
            it(`doesn't create new node`, async () => {
                let category = new CategoryNode({categoryName: 'FirstCategory', price: 100});
                await category.save();
                category.price = 50;
                await category.save();

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(1);
            });

            it(`updates attributes`, async () => {
                let category = new CategoryNode({categoryName: 'FirstCategory', price: 100});
                await category.save();

                category.price = 50;
                await category.save();

                let updated = await connection.nodeQuery(CategoryNode).first();
                expect(updated!.attributes).to.deep.eq(category.attributes);
            });

            it('updates createdAt', async () => {
                let category = new CategoryNode({categoryName: 'FirstCategory', price: 100});
                await category.save();

                let prevUpdatedAt = category.updatedAt.getTime();

                await sleep(100);
                await category.save();

                let currentUpdatedAt = category.updatedAt.getTime();


                expect(currentUpdatedAt).to.be.greaterThan(prevUpdatedAt);
            });
        });
    });

    describe(`mutating relations`, () => {
        let item:ItemNode,
            tags:TagNode[],
            categories:CategoryNode[];


        beforeEach(() => {
            item = new ItemNode({itemName: 'FirstItem'});

            categories = [
                new CategoryNode({categoryName: 'FirstCategory', price: 100}),
                new CategoryNode({categoryName: 'SecondCategory', price: 200})
            ];

            tags = [
                new TagNode({tagName: 'FirstTag'}),
                new TagNode({tagName: 'SecondTag'})
            ]
        });

        describe(`Writing node with connected relations`, () => {
            it('creates nodes and relations', async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(2);
                expect(await connection.nodeQuery(TagNode).count()).to.eq(2);
                expect(await connection.nodeQuery(ItemNode).count()).to.eq(1);
                expect(await item.categories.all()).to.have.deep.members(categories);
                expect(await item.tags.all()).to.have.deep.members(tags);
            });

            it(`adds id property for each category`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();

                expect(item.isPersisted()).to.eq(true);
                expect(categories[0].isPersisted()).to.eq(true);
                expect(categories[1].isPersisted()).to.eq(true);

                expect(tags[0].isPersisted()).to.eq(true);
                expect(tags[1].isPersisted()).to.eq(true);
            });

            it(`does all operations in transaction and rollbacks if error was thrown`, async () => {
                let wrongTag = new TagNode({tagName: {objects: 'cannot be stored'} as any});
                item.tags.set(wrongTag);

                try {
                    await item.save();
                } catch (e) {}

                expect(item.isPersisted()).to.eq(false);
                expect(wrongTag.isPersisted()).to.eq(false);
            });
        });

        describe(`detaching all nodes connected by single relation`, () => {
            it(`doesn't remove detached nodes`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();
                item.categories.set([]);
                await item.save();

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(2);
                expect(await connection.nodeQuery(TagNode).count()).to.eq(2);
                expect(await connection.nodeQuery(ItemNode).count()).to.eq(1);
                expect(await item.categories.all()).to.eql([]);
                expect(await item.tags.all()).to.have.deep.members(tags);
            });
        });

        describe(`detaching all connected nodes`, () => {
            it(`doesn't remove nodes`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();
                item.categories.set([]);
                item.tags.set([]);
                await item.save();

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(2);
                expect(await connection.nodeQuery(TagNode).count()).to.eq(2);
                expect(await connection.nodeQuery(ItemNode).count()).to.eq(1);
                expect(await item.categories.all()).to.eql([]);
                expect(await item.tags.all()).to.eql([]);
            });
        });

        describe(`replacing nodes connected with single relation`, () => {
            it(`doesn't removes any nodes but creates new`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();

                let newTagNode = new TagNode({tagName: 'NewTag'});
                item.tags.set([newTagNode]);

                await item.save();

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(2);
                expect(await connection.nodeQuery(TagNode).count()).to.eq(3);
                expect(await connection.nodeQuery(ItemNode).count()).to.eq(1);
                expect(await item.categories.all()).to.have.deep.members(categories);
                expect(await item.tags.all()).to.have.deep.members([newTagNode]);
            });
        });

        describe(`removing node having other connected nodes`, () => {
            it(`throws if no true parameter for detach was passed`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();

                let removePromise = item.remove();

                await expect(removePromise).to.eventually.be.rejected;
            });

            it(`detaches node if true flag was passed and doesn't remove connected nodes`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);

                await item.save();
                await item.remove(true);

                expect(await connection.nodeQuery(CategoryNode).count()).to.eq(2);
                expect(await connection.nodeQuery(TagNode).count()).to.eq(2);
                expect(await connection.nodeQuery(ItemNode).count()).to.eq(0);
            });
        });
    });
});