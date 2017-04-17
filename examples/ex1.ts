import {Connection, buildQuery} from "neography";
import {AbstractNode, AbstractRelation, PersistedGraphEntity, createFactoryMethod} from "neography/model";
import {node, attribute, relation} from 'neography/annotations';

//Models definition
@node('User')
class User extends AbstractNode {
    static build = createFactoryMethod(User);
    @attribute() firstName:string;
    @attribute() lastName:string;
}

@relation('HAS_FRIEND')
class HasFriendRelation extends AbstractRelation {
    static build = createFactoryMethod(HasFriendRelation);
    since:number;
}

async function example() {

    //queries
    const storeUserQuery = (user:User) => buildQuery()
        .create(c => c.node(user).as('user'))
        .returns('user');


    const addFriendToUserQuery = (fromId:string, hasFriendRelation:HasFriendRelation, toId:string) => buildQuery()
        .match(m => [
            m.node(User).params({id: fromId}).as('user'),
            m.node(User).params({id: toId}).as('friend')
        ])
        .create(c => [
            c.matchedNode('user'),
            c.relation(hasFriendRelation).as('hasFriendRelation'),
            c.matchedNode('friend')]
        );

    const getFriendsQuery = (userId:string) => buildQuery()
        .match(m => [
            m.node(User).as('user').params({id: userId}),
            m.relation(HasFriendRelation).as('relation'),
            m.node(User).as('friend')
        ])
        .returns('user', 'relation', 'friend');


    let connection:Connection = new Connection({username: 'neo4j', password: 'password', host: 'localhost'});

    //model instances
    let user1 = User.build({firstName: 'Jane', lastName: 'Doe'});
    let user2 = User.build({firstName: 'John', lastName: 'Doe'});
    let hasFriend = HasFriendRelation.build({since: new Date().getTime()});

    // running queries
    let persistedUser1:PersistedGraphEntity<User> = await connection.runQuery(storeUserQuery(user1)).pickOne('user').first();
    let persistedUser2:PersistedGraphEntity<User> = await connection.runQuery(storeUserQuery(user2)).pickOne('user').first();

    await connection.runQuery(addFriendToUserQuery(persistedUser1.id, hasFriend, persistedUser2.id));

    let friends:{ user:User, relation:HasFriendRelation, friend:User }[] = await connection.runQuery(getFriendsQuery(persistedUser1.id)).toArray();

    console.log(friends);

    // [ {
    //    user:User {
    //           id: 'BJ-_f8-Al',
    //           createdAt: 1492374120811,
    //           updatedAt: 1492374120811,
    //           firstName: 'Jane',
    //           lastName: 'Doe'},
    //
    //    relation:HasFriendRelation {
    //         id: 'HJ-b_G8-Re',
    //         createdAt: 1492374120863,
    //         updatedAt: 1492374120863 },
    //
    //    friend:User {
    //         id: 'BJlZdfLZRg',
    //         createdAt: 1492374120855,
    //         updatedAt: 1492374120855,
    //         firstName: 'John',
    //         lastName: 'Doe' }
    // }]

}

example();