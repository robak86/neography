import {attribute, nodeEntity, relationshipEntity, timestamp} from "../../lib/annotations";
import {NodeEntity, RelationshipEntity} from "../../lib/model";
import {Connection} from "../../lib";
import {cleanDatabase, getSharedConnection} from "../helpers/ConnectionHelpers";
import {Relationship} from "../../lib/model/Relationship";
import {relationship} from "../../lib/annotations/RelationshipAnnotations";
import {expect} from 'chai';

describe.only(`Relations between the same node types`, () => {
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


});