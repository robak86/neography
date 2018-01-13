# Neography

[![Build Status](https://travis-ci.org/robak86/neography.svg?branch=master)](https://travis-ci.org/robak86/neography)
[![Coverage Status](https://coveralls.io/repos/github/robak86/neography/badge.svg?branch=master&service=github)](https://coveralls.io/github/robak86/neography?branch=simplify_types)

Neography is object-graph mapping library for Neo4j written in TypeScript. It internally uses official neo4j driver.
Neography supports Active Record pattern. It's goal is to provide simple and convenient API for most common operations.
It also provides DSL for constructing advanced cypher queries.


## Warning 
This library is at early stage of development. The API most likely will change over time.
In many areas library requires optimizations.
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

## Defining Model

Neography provides three types of model types.

### 1. ```NodeEntity```

```typescript
import {NodeEntity} from 'neography/model';
import {nodeEntity, attribute} from 'neography/annotations';

@nodeEntity('User')
class UserNode extends NodeEntity { 
    @attribute() firstName:string;
    @attribute() lastName:string;
}
```

```UserNode``` class will be directly mapped to Neo4j's node using ```:User``` label. The label for node is set
by ```@nodeEntity``` decorator. Node Entity takes optional generic type in order to enable type safe constructor
taking object with node's properties.

```typescript
@nodeEntity('User')
class UserNode extends NodeEntity<UserNode> { 
    @attribute() firstName:string;
    @attribute() lastName:string;
}

let user1 = new UserNode({firstName: 'John'}); // OK
let user2 = new UserNode({unknownProperty: 'John'}); // Compile time error 
```

```NodeEntity``` implements active record pattern and provides ```save()``` method. It creates new node in the database for 
not already persisted ```NodeEntity``` instance (adding auto generated, unique, url friendly id property) or updates existing node matched by id.


### 2. ```RelationshipEntity```

```typescript
import {RelationshipEntity} from 'neography/model';
import {relationshipEntity, attribute} from 'neography/annotations';

@relationshipEntity('HAS_REVISION')
class HasRevision extends RelationshipEntity<HasRevision> {
    @attribute() isApproved:boolean = false;
}
```

```HasRevision``` represents ```-[:HAS_REVISION]-``` relation.

### 3. ```Relationship``` 

```typescript
import {attribute, nodeEntity, relationshipEntity, relationship} from "neography/annotations";
import {NodeEntity, RelationshipEntity, Relationship} from "neography/model";

    @relationshipEntity('HAS_REVISION')
    class HasRevision extends RelationshipEntity<HasRevision> {
        @attribute() isApproved:boolean = false;
    }

    @nodeEntity('BlogPost')
    class BlogPostNode extends NodeEntity<BlogPostNode> {
        @attribute() title:string;

        @relationship(HasRevision, BlogPostNode, rel => rel.outgoing())
        nextRevision:Relationship<HasRevision, BlogPostNode>;

        @relationship(HasRevision, BlogPostNode, rel => rel.incoming())
        prevRevision:Relationship<HasRevision, BlogPostNode>
    }
```

It defines relationships between nodes and also supports active record pattern.

```typescript
let postVer1 = new BlogPostNode({title: "Neo4j"});
let postVer2 = new BlogPostNode({title: "Neo4j is fine"});
let postVer3 = new BlogPostNode({title: "Graphs are cool"}); 

postVer1.nextRevision.set(postVer2);
postVer2.nextRevision.setWithRelation({relation: new HasRevision({isApproved: true}), node: postVer3});
await postVer1.save(); // .save() creates following nodes and relationships 
// (:BlogPost {title: "Neo4j})-[:HAS_REVISION {isApproved: false}]-> / 
// (:BlogPost {title: "Neo4j is fine"})-[:HAS_REVISION {isApproved: true}]->(:BlogPost {title: Graphs are cool})
``` 

It also provides many convenient methods for fetching connected nodes. (TODO: docs required)

### Querying Nodes 
Neography provides convenient query builder for fetching nodes.

```typescript
    @nodeEntity('Car')
    class CarNode extends NodeEntity<CarNode> {
        @attribute() manufacturer:string;
        @attribute() horsePower:number;
    }


let result = await connection.nodeQuery(CarNode).all();

//count all cars
result = await connection.nodeQuery(CarNode).count();

//get first car
result = await connection.nodeQuery(CarNode).first();

//find car by id
result = await connection.nodeQuery(CarNode).findById('someID'); //it throws error if record not found

//find car by id or get undefined
result = await connection.nodeQuery(CarNode).firstById('someID'); //it returns undefined if node not found
//it is shortcut for
result = await connection.nodeQuery(CarNode).where(w => w.attribute('id').equal('someID')).first()

//get car with greatest horsePower
result = await connection.nodeQuery(CarNode).orderBy(by => by.attribute('horsePower').desc()).limit(1).first();

// get all cars with horsePower greater than 200
result = await connection.nodeQuery(CarNode).where(w => w.attribute('horsePower').greaterThan(200)).all();

// get all cars made by Porsche and Fiat (case sensitive search)  
result = await connection.nodeQuery(CarNode).where(w => w.attribute('manufacturer').in(['Porsche', 'Fiat'])).all();
```

## Query Builder for Cypher
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
let matchQuery = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.attribute('firstName').equal('Jane'))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchQuery).pluck('user').toArray();
```

```typescript
let matchQuery = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.attribute('id').in(['Xfcs3-2', 'YgfUop89']))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchQuery).pluck('user').toArray();
```

### Matching Nodes Using Where Literal Statement

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.literal(`user.createdAt < {userCreateDate}`).params({userCreateDate: int(new Date('2016-12-31').getTime())}))
    .returns('user');

let users:UserNode[] = await connection.runQuery(matchWhere).pluck('user').toArray();
```

### Matching Nodes Connected by Relationship

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