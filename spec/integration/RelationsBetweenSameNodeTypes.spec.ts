import {attribute, nodeEntity, relationshipEntity, timestamp} from "../../lib/annotations";
import {NodeEntity, RelationshipEntity} from "../../lib/model";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {Relationship} from "../../lib/model/Relationship";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";
import {expect} from 'chai';

describe(`Relations between the same node types`, () => {
    @relationshipEntity('__HAS_REVISION')
    class HasRevision extends RelationshipEntity<HasRevision> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
    }

    @nodeEntity('__BlogPost')
    class BlogPostNode extends NodeEntity<BlogPostNode> {
        @timestamp() createdAt:Date;
        @timestamp() updatedAt:Date;
        @attribute() title:string;

        @relationship(HasRevision, BlogPostNode, rel => rel.outgoing())
        nextRevision:Relationship<HasRevision, BlogPostNode>;

        @relationship(HasRevision, BlogPostNode, rel => rel.incoming())
        prevRevision:Relationship<HasRevision, BlogPostNode>
    }


    let connection:Connection;

    beforeEach(async () => {
        connection = getSharedConnection();
        await cleanDatabase();
    });

    describe(`adding next revision`, () => {
        it(`creates relationship coming from prev blog post version to next one`, async () => {
            let prev = new BlogPostNode({title: 'version1'});
            let next = new BlogPostNode({title: 'version2'});

            prev.nextRevision.set(next);
            await prev.save();

            let nextRevisionForPrev = await prev.nextRevision.findOne();
            let prevRevisionForNext = await next.prevRevision.findOne();

            expect(nextRevisionForPrev.id).to.eql(next.id);
            expect(prevRevisionForNext.id).to.eql(prev.id);
        });
    });

    describe(`saving path`, () => {
        it(`recursively saves nodes and relationships`, async () => {
            let p1 = new BlogPostNode({title: 'version1'});
            let p2 = new BlogPostNode({title: 'version2'});
            let p3 = new BlogPostNode({title: 'version3'});

            p1.nextRevision.set(p2);
            p2.nextRevision.set(p3);

            await p1.save();

            let p1Next = await p1.nextRevision.findOne();
            let p2Prev = await p2.prevRevision.findOne();
            let p2Next = await p2.nextRevision.findOne();
            let p3Prev = await p3.prevRevision.findOne();

            expect(await getSharedConnection().nodeQuery(BlogPostNode).count()).to.eq(3);

            expect(p1Next.id).to.eql(p2.id);
            expect(p2Prev.id).to.eql(p1.id);
            expect(p2Next.id).to.eql(p3.id);
            expect(p3Prev.id).to.eql(p2.id);
        });
    });


});