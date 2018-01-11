import {attribute, nodeEntity, relation, timestamp} from "../../lib/annotations";
import {NodeEntity, RelationshipEntity} from "../../lib/model";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {expect} from 'chai';
import {sleep} from "../../lib/utils/promise";
import {Relationship} from "../../lib/model/Relationship";
import {relationship, relationshipThunk} from "../../lib/annotations/RelationshipAnnotations";

describe(`Relationship`, () => {
    @relation('__IS_TAGGED')
    class IsTaggedRelation extends RelationshipEntity<IsTaggedRelation> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
    }

    @relation('__BELONGS_TO_CATEGORY')
    class HasCategory extends RelationshipEntity<HasCategory> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() order:number = 0;
    }

    @nodeEntity('__Category')
    class CategoryNode extends NodeEntity<CategoryNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() categoryName:string;
        @attribute() price:number;
    }

    @nodeEntity('__Tag')
    class TagNode extends NodeEntity<TagNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() tagName:string;

        @relationshipThunk(() => IsTaggedRelation, () => ItemNode, rel => rel.incoming())
        items:Relationship<IsTaggedRelation, TagNode>;
    }

    @nodeEntity('__Item')
    class ItemNode extends NodeEntity<ItemNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() itemName:string;

        @relationship(HasCategory, CategoryNode, rel => rel.outgoing())
        categories:Relationship<HasCategory, CategoryNode>;
        @relationshipThunk(() => IsTaggedRelation, () => TagNode, rel => rel.outgoing())
        tags:Relationship<IsTaggedRelation, TagNode>;
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
                let all = await item.tags.all();
                expect(all.map((e) => e.id)).to.have.deep.members(tags.map(e => e.id));
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


        describe(`accessing connected nodes from both side of relations`, () => {
            it(`is accessible from both side`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);
                await item.save();

                let itemsForTag = await tags[0].items.all();
                expect(itemsForTag.map(i => i.id)).to.eql([item.id]);
            });

            it(`relation mutated from one side is reflected on the other ex.1`, async () => {
                item.categories.set(categories);
                item.tags.set(tags);
                await item.save();
                tags[0].items.set([]);
                await tags[0].save();


                let allTags = await item.tags.all();
                expect(allTags.map(t => t.id)).to.eql([tags[1].id]);
            });

            it(`relation mutated from one side is reflected on the other ex.2`, async () => {
                let item1 = new ItemNode({itemName: 'item1'});
                let item2 = new ItemNode({itemName: 'item2'});

                item1.tags.set(tags[0]);
                item2.tags.set(tags[0]);

                await item1.save();
                await item2.save();


                let item1Tags = await item1.tags.all();
                let item2Tags = await item2.tags.all();
                let tagItems = await tags[0].items.all();

                //check if relations were created|each item have the same tag
                expect(item1Tags.map(t => t.id)).to.have.members([tags[0].id]);
                expect(item2Tags.map(t => t.id)).to.have.members([tags[0].id]);
                expect(tagItems.map(t => t.id)).to.have.members([item1.id, item2.id]);


                // remove tag from item1
                item1.tags.set([]);
                await item1.save();

                item1Tags = await item1.tags.all();
                item2Tags = await item2.tags.all();
                tagItems = await tags[0].items.all();

                //check if relations were created|each item have the same tag
                expect(item1Tags.map(t => t.id)).to.have.members([]);
                expect(item2Tags.map(t => t.id)).to.have.members([tags[0].id]);
                expect(tagItems.map(t => t.id)).to.have.members([item2.id]);


                // remove tag from item2
                item2.tags.set([]);
                await item2.save();

                item1Tags = await item1.tags.all();
                item2Tags = await item2.tags.all();
                tagItems = await tags[0].items.all();

                //check if relations were created|each item have the same tag
                expect(item1Tags.map(t => t.id)).to.have.members([]);
                expect(item2Tags.map(t => t.id)).to.have.members([]);
                expect(tagItems.map(t => t.id)).to.have.members([]);
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
                let all = await item.tags.all();
                expect(all.map((e) => e.id)).to.have.deep.members(tags.map(e => e.id));
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
                let all = await item.tags.all();
                expect(all.map(t => t.id)).to.have.deep.members([newTagNode.id]);
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