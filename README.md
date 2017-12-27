# Neography

[![Build Status](https://travis-ci.org/robak86/neography.svg?branch=master)](https://travis-ci.org/robak86/neography)

Thin opinionated mapping layer and queries builder for official neo4j driver. (https://github.com/neo4j/neo4j-javascript-driver)

## Warning 
This library is **highly experimental** and in many places the code is just a draft. Use it at your own risk.
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

Neography provides mapping layer over persisted neo4j data and classes defined by UserNode. In order to create mappable class 
you have to decorate it with ```@node('NodeLabel')``` or ```@relation('RELATION_TYPE')``` decorators. Additionally each 
entity class have to inherit consequently from ```AbstractNode``` or ```AbstractRelation``` class. Abstract classes provide optional ```id``` 
string property. By default neography generates uuid string for identifying entities.
Abstract classes were introduced for making most of query builder's and repositories' methods type safe.

 
```typescript
import {AbstractNode, AbstractRelation, Integer, int, createFactoryMethod} from 'neography/model';
import {node, relation} from 'neography/annotations';

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

@relation('KNOWS') //relation type
class KnowsRelation extends AbstractRelation<KnowsRelation> {
    
    
    @attribute() since:Integer;
}

@relation('HAS_HOME_ADDRESS')
class HasHomeAddressRelation extends AbstractRelation<HasHomeAddressRelation>{}

```

## Repositories

Neography provides repositories for basic operations.

```typescript
import {Neography} from 'neography';

const neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});
const connection = neography.checkoutConnection()

//Create repository for given node class
const usersRepository = connection.getNodeRepository(UserNode);
const addressesRepository = connection.getNodeRepository(AddressNode);

//Create repository for given node classes and it's relation
const knowsRelationsRepository = connection.getRelationRepository(UserNode, KnowsRelation, UserNode);
const hasHomeAddressRelationsRepository = connection.getRelationRepository(UserNode, HasHomeAddressRelation, AddressNode);
```

### Managing Nodes 

```typescript
let user1: UserNode = await usersRepository.save(new User({firstName: 'Jane', lastName: 'Doe'}));
// User { id: 'BJ-_f8-Al', createdAt: 1492374120811, updatedAt: 1492374120811, firstName: 'Jane', lastName: 'Doe'}

user1.firstName = 'John';
user1 = await usersRepository.update(user1);
//  User { id: 'BJ-_f8-Al', createdAt: 1492374120811, updatedAt: 1492375654349, firstName: 'John', lastName: 'Doe'}

let user2:User[] = await usersRepository.where({id: user1.id})
// user2[0] and user1 points to the same persisted entity

await usersRepository.remove(user1.id);
```

### Managing Relations

```typescript
let user1:User = await usersRepository.save(new User({firstName: 'Jane', lastName: 'Doe'}));
let user2:User = await usersRepository.save(new User({firstName: 'John', lastName: 'Smith'}));

let relation:KnowsRelation = await knowsRelationsRepository.save(user1, user2, new KnowsRelation({since: int(new Date().getTime())}))
// Relation {id: 'SfXi-89', since: Integer(1492711624208)}

relation.since = int(0);
relation = await knowsRelationsRepository.update(relation);
// Relation {id: 'SfXi-89', since: Integer(0)}
await knowsRelationsRepository.remove(relation.id)
```

**TODO** 
```typescript
knowsRelationsRepository.where();
knowsRelationsRepository.first();
//and getting all connected nodes for given node
```




## Connection

TODO

## Query Builder

Query builder provides simple dsl for building cypher queries.
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

Response object provides convenient helper methods for queries like the previous one.

```typescript
let response:UserNode = await connection.runQuery(insertQuery).pickOne('user').first();
```

### Matching Nodes

```typescript
let matchQuery = neography.query()
    .match(m => m.node(UserNode).params({firstName: 'Jane'}).as('user'))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchQuery).pickOne('user').toArray();
```

### Matching Nodes Using Where

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.literal(`user.createdAt < {userCreateDate}`).params({userCreateDate: int(new Date('2016-12-31').getTime())}))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchWhere).pickOne('user').toArray();
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

### Update Entities Using SET Clause
TODO

