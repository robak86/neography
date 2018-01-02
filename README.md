# Neography

[![Build Status](https://travis-ci.org/robak86/neography.svg?branch=master)](https://travis-ci.org/robak86/neography)
[![Coverage Status](https://coveralls.io/repos/github/robak86/neography/badge.svg?branch=master&service=github)](https://coveralls.io/github/robak86/neography?branch=simplify_types)

Simple object mapper and queries builder for official neo4j driver. (https://github.com/neo4j/neo4j-javascript-driver)

## Warning 
This library is at early stage of development. The API most likely will change over time.
**All suggestion, opinions and ideas are gladly welcome.**


## Installing

```bash
npm install neography
```


## Configuring Neography Instance
```typescript
import {Neography} from 'neography';
import {TimestampsExtension} from 'neography/extensions';

const neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});

//register extensions for managing createdAt and updatedAt properties. 
//Timestamps are stored as integer values
neography.registerExtension(TimestampsExtension.getDefault()); 

```

## Defining Model Classes

Neography provides mapping layer over persisted neo4j data. In order to create mappable class 
you have to decorate it with ```@node('NodeLabel')``` or ```@relation('RELATION_TYPE')``` decorators. Additionally each 
entity class have to inherit consequently from ```AbstractNode``` or ```AbstractRelation``` class. ```AbstractNode``` class
provides auto generated unique ```id``` property.

 
```typescript
import {AbstractNode, AbstractRelation} from 'neography/model';
import {node, relation, timestamp} from 'neography/annotations';

//Nodes definitions

@node('User') //node label
class UserNode extends AbstractNode<UserNode> { 
    @attribute() firstName:string;
    @attribute() lastName:string;
}

@node('Address')
class AddressNode extends AbstractNode<AddressNode> {
    @attribute() street:string;
    @attribute() city:string;
}

//Relations definitions

@relation('KNOWS') //relation name
class KnowsRelation extends AbstractRelation<KnowsRelation> {
    @timestamp() since:Date;
}

@relation('HAS_HOME_ADDRESS')
class HasHomeAddressRelation extends AbstractRelation<HasHomeAddressRelation>{}

```

Passing generic types for ```AbstractRelation``` and ```AbstractNode``` is optional (starting from typescript ^2.3).
Generic types were introduced in order to enable type safety for constructors.

```typescript
new User({firstName: 'John', lastName: 'Doe'}); //OK
new User({firstName: 'John', someUnknownAttribute: 'Doe'}) //generates compile time error

```

## Repositories

Neography provides repositories for basic operations.

```typescript
import {Neography} from 'neography';

const neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});
const connection = neography.checkoutConnection();

//Create repository for given nodes types
const usersRepository = connection.nodeType(UserNode);
const addressesRepository = connection.nodeType(AddressNode);

//Create repository for given relations types
const knowsRelationsRepository = connection.relationType(KnowsRelation);
const hasHomeAddressRelationsRepository = connection.relationType(HasHomeAddressRelation);
```

### Managing Nodes 

```typescript
let user1: UserNode = await usersRepository.save(new User({firstName: 'Jane', lastName: 'Doe'}));
// User { id: 'BJ-_f8-Al', createdAt: Sat Dec 30 2017 20:51:51 GMT+0100 (CET), updatedAt: ..., firstName: 'Jane', lastName: 'Doe'}

user1.firstName = 'John';
user1 = await usersRepository.update(user1);
//  User { id: 'BJ-_f8-Al', createdAt: Sat Dec 30 2017 20:51:51 GMT+0100 (CET), updatedAt: ..., firstName: 'John', lastName: 'Doe'}

let user2:User[] = await usersRepository.where({id: user1.id})
// user2[0] and user1 points to the same persisted entity

await usersRepository.remove(user1.id);
```

### Managing Relations

```typescript
let user1:User = await usersRepository.save(new User({firstName: 'Jane', lastName: 'Doe'}));
let user2:User = await usersRepository.save(new User({firstName: 'John', lastName: 'Smith'}));

let relation:KnowsRelation = await knowsRelationsRepository.nodes(user1, user2).connectWith(new KnowsRelation({since: new Date()}));

//alternatively
let relation:KnowsRelation = await knowsRelationsRepository.node(user1).connectTo(user2, new KnowsRelation({since: new Date()}));
// Relation {id: 'SfXi-89', since: Sat Dec 30 2017 20:51:51 GMT+0100 (CET)}

relation.since = new Date();
relation = await knowsRelationsRepository.nodes(user1, user2).update(relation);
// Relation {id: 'SfXi-89', since: Sat Dec 30 2017 20:51:52 GMT+0100 (CET)}
await knowsRelationsRepository.nodes(user1, user2)
```

## Query Builder
Query builder provides simple DSL for building cypher queries.
It tries to reflect cypher syntax without introducing any additional abstractions.  


```typescript 
import {neography} from 'neography';
const neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});

//create new instance of query builder
neography.query();
```

### Inserting Nodes
```typescript
//create instance of UserNode and assign properties values
let userNode = new UserNode({firstName: 'Jane', lastName: 'Doe'});

//create query
let insertQuery = neography.query()
    .create(c => c.node(userNode).as('user'))
    .returns('user');
```

Query can be executed by calling ```runQuery``` method on ```Connection``` instance. And returns properly mapped response

```typescript
let response:{user: UserNode}[] = await connection.runQuery(insertQuery).toArray();
```
It equals to following cypher query
```cypher
CREATE(user:UserNode { firstName: "Jane", lastName: "Doe" })
RETURN user
```

Response object provides convenient helper methods for manipulating data. 

```typescript
let response:UserNode = await connection.runQuery(insertQuery).pluck('user').first();
```

### Matching Nodes

```typescript
let matchQuery = neography.query()
    .match(m => m.node(UserNode).params({firstName: 'Jane'}).as('user'))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchQuery).pluck('user').toArray();
```

### Matching Nodes Using Where

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.literal(`user.createdAt < {userCreateDate}`).params({userCreateDate: int(new Date('2016-12-31').getTime())}))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchWhere).pluck('user').toArray();
```

### Matching Nodes Connected by Relation

```typescript
let matchWhere = neography.query()
    .match(m => [
        m.node(UserNode).as('user').params({id: 'someId'}),
        m.relation(KnowsRelation).as('relation'),
        m.node(UserNode).as('friend')
        ])
    .returns('user', 'relation', 'friend');

type Response = {user: UserNode, relation: KnowsRelation, friend: UserNode};
let friends:Response = await connection.runQuery(matchWhere).toArray();
```

### Matching Nodes Using Optional Match

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user').params({id: 'someId'}))
    .optionalMatch(m => [
        m.matchedNode('user'),
        m.relation(KnowsRelation).as('relation'),
        m.node(UserNode).as('friend')
    ])
    .returns('user', 'relation', 'friend');

type Response = {user: UserNode, relation: KnowsRelation, friend: UserNode};
let usersOptionallyHavingFriends:Response = await connection.runQuery(matchWhere).toArray();
```

### Creating Relations For Existing Nodes

```typescript
let knowsRelation = new KnowsRelation({since: int(new Date().getTime())})

let createRelation = neography.query()
                         .match(m => [
                             m.node(UserNode).params({id: 'someExistingId'}).as('user'),
                             m.node(UserNode).params({id: 'someOtherExistingId'}).as('friend')
                         ])
                         .create(c => [
                             c.matchedNode('user'),
                             c.relation(knowsRelation).as('relation'),
                             c.matchedNode('friend')]
                         )
                         .returns('user','relation', 'friend');

type Response = {user: UserNode, relation: KnowsRelation, friend: UserNode};
let userWithFriend:Response = await connection.runQuery(createRelation).toArray();
```

### Creating Relations with New Node

```typescript
let friend = new User({firstName: 'Aaron', lastName: 'Smith'});
let knowsRelation = new KnowsRelation({since: int(new Date().getTime())})

let createRelation = neography.query()
                         .match(m => m.node(UserNode).params({id: 'someExistingId'}).as('user'))
                         .create(c => [
                             c.matchedNode('user'),
                             c.relation(knowsRelation).as('relation'),
                             c.node(friend).as('friend')]
                         )
                         .returns('user','relation', 'friend');

type Response = {user: UserNode, relation: KnowsRelation, friend: UserNode};
let userWithFriend:Response = await connection.runQuery(createRelation).toArray();
```