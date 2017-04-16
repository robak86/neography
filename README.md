# Neography

Thin opinionated mapping layer and queries builder for official neo4j driver. (https://github.com/neo4j/neo4j-javascript-driver)

## Warning 
This library is currently highly experimental and in many places the code is just a draft. Use it at your own risk.
**All suggestion, opinions and ideas are gladly welcome.**


### Installing

```bash
npm install neography
```


### Define Nodes and Relations

```typescript
import {AbstractNode, AbstractRelation, createFactoryMethod} from "neography/model";
import {node, attribute, relation} from 'neography/annotations';


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

```

### Define Queries

```typescript
import {buildQuery} from "neography";


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

```

### Execute Queries

```typescript
    import {Connection} from "neography";

    let connection:Connection = new Connection({username: 'neo4j', password: 'password', host: 'localhost'});

    let user1 = User.build({firstName: 'Jane', lastName: 'Doe'});
    let user2 = User.build({firstName: 'John', lastName: 'Doe'});
    let hasFriend = HasFriendRelation.build({since: new Date().getTime()});

    // running queries
    let user1Rows:{ user:PersistedGraphEntity<User> }[] = await connection.runQuery(storeUserQuery(user1));
    let user2Rows:{ user:PersistedGraphEntity<User> }[] = await connection.runQuery(storeUserQuery(user2));

    await connection.runQuery(addFriendToUserQuery(user1Rows[0]['user'].id, hasFriend, user2Rows[0]['user'].id));

    let friends:{ user:User, relation:HasFriendRelation, friend:User }[] = await connection.runQuery(getFriendsQuery(user1Rows[0]['user'].id));

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
```