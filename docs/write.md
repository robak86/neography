# TODO

## Defining Model Classes

Neography provides mapping layer over persisted neo4j data and classes defined by UserNode. In order to create mappable class 
you have to decorate it with ```@node('NodeLabel')``` or ```@relation('RELATION_NAME')``` decorators. Additionally each 
entity class have to inherit consequently from ```AbstractNode``` or ```AbstractRelation``` class. Abstract classes provide optional ```id``` 
string property. By default neography generates uuid string for identifying entities.
Abstract classes were also introduced for making most of query builder's and repositories' methods type safe.

 
```typescript
import {AbstractNode, AbstractRelation, Integer, int, createFactoryMethod} from 'neography/model';
import {node, relation} from 'neographyAnnotations';

@node('User') //node label
class UserNode extends AbstractNode {
    build = createFactoryMethod(UserNode);
    
    @attribute() firstName:string;
    @attribute() lastName:string;
}

@node('Address')
class AddressNode {
    build = createFactoryMethod(AddressNode);
    
    @attribute() street:string;
    @attribute() city:string;
}

@relation('KNOWS')
class KnowsRelation extends AbstractRelation {
    build = createFactoryMethod(KnowsRelation);
    
    @attribute() since:Integer;
}

@relation('HAS_HOME_ADDRESS')
class HasHomeAddressRelation extends AbstractRelation{
    build = createFactoryMethod(HasHomeAddressRelation);
}

```

## Repositories

Neography provides repositories for basic operations.

```typescript
import {Neography} from 'neography';

const neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});
const connection = neography.checkoutConnection()

const usersRepository = connection.getNodeRepository(UserNode);
const addressesRepository = connection.getNodeRepository(AddressNode);

const knowsRelationsRepository = connection.getRelationRepository(UserNode, KnowsRelation, UserNode);
const hasHomeAddressRelationsRepository = connection.getRelationRepository(UserNode, HasHomeAddressRelation,AddressNode);
```

### Managing Nodes 

```typescript
let user1: Persisted<UserNode> = await usersRepository.save(User.build({firstName: 'Jane', lastName: 'Doe'}));
// User { id: 'BJ-_f8-Al', createdAt: 1492374120811, updatedAt: 1492374120811, firstName: 'Jane', lastName: 'Doe'}

user1.firstName = 'John';
user1 = await usersRepository.update(user1);
//  User { id: 'BJ-_f8-Al', createdAt: 1492374120811, updatedAt: 1492374120811, firstName: 'John', lastName: 'Doe'}

let user2:Persisted<User>[] = await usersRepository.where({id: user1.id})
// user2[0] and user1 points to the same persisted entity

await usersRepository.remove(user1.id);
```

### Managing Relations

```typescript
let user1:Persisted<User> = await usersRepository.save(User.build({firstName: 'Jane', lastName: 'Doe'}));
let user2:Persisted<User> = await usersRepository.save(User.build({firstName: 'John', lastName: 'Smith'}));

let relation:Persisted<KnowsRelation> = await knowsRelationsRepository.save(user1, user2, KnowsRelation.build({since: int(new Date().getTime())}))
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
let userNode = UserNode.build({firstName: 'Jane', lastName: 'Doe'});


//create query
let insertQuery = neography.query()
    .create(c => c.node(userNode).as('user'))
    .returns('user');
```

Query can be executed by calling ```runQuery``` method on ```Connection``` instance. And returns properly mapped response

```typescript
import {Persisted} from 'neography/model';
let response:{user: Persisted<UserNode>}[] = await connection.runQuery(insertQuery).toArray();
```

It will be the same as running following query

```cypher
CREATE(user:UserNode { firstName: "Jane", lastName: "Doe" })
RETURN user
```

Response object provides convenient helper methods for queries like the previous one.

```typescript
let response:Persisted<UserNode> = await connection.runQuery(insertQuery).pickOne('user').first();
```

```Persisted``` class declares that ```id``` property isn't optional and it is string. It's useful with strict type checking

### Matching Nodes

```typescript
let matchQuery = neography.query()
    .match(m => m.node(UserNode).params({firstName: 'Jane'}).as('user'))
    .returns('user');

let matchedUsers:Persisted<UserNode> = await connection.runQuery(matchQuery).pickOne('user').toArray();
```

### Matching Nodes Using Where

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user'))
    .where(w => w.literal(`user.createdAt < {userCreateDate}`).params({userCreateDate: int(new Date('2016-12-31').getTime())}))
    .returns('user');

let users:Persisted<UserNode> = await connection.runQuery(matchWhere).pickOne('user').toArray();
```

### Match nodes connected by relation

```typescript
let matchWhere = neography.query()
    .match(m => [
        m.node(UserNode).as('user').params({id: 'someId'}),
        m.relation(KnowsRelation).as('relation'),
        m.node(UserNode).as('friend')
        ])
 
    .returns('user', 'relation', 'friend');

type Response = {user: Persisted<UserNode>, relation: Persisted<KnowsRelation>, friend: Persisted<UserNode>};
let friends:Response = await connection.runQuery(matchWhere).toArray();
```

### Match nodes using optional match

```typescript
let matchWhere = neography.query()
    .match(m => m.node(UserNode).as('user').params({id: 'someId'}))
    .optionalMatch(m => [
        m.matchedNode('user'),
        m.relation(KnowsRelation).as('relation'),
        m.node(UserNode).as('friend')
    ])
    .returns('user', 'relation', 'friend');

type Response = {user: Persisted<UserNode>, relation: Persisted<KnowsRelation>, friend: Persisted<UserNode>};
let usersOptionallyHavingFriends:Response = await connection.runQuery(matchWhere).toArray();
```



