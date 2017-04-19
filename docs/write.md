# TODO

## Defining Model Classes

Neography provides mapping layer over persisted neo4j data and classes defined by user. In order to create mappable class 
you have to decorate it with ```@node('NodeLabel')``` or ```@relation('RELATION_NAME')``` decorators. Additionally each 
entity class have to inherit consequently from ```AbstractNode``` or ```AbstractRelation``` class. Abstract classes provide optional ```id``` 
string property. By default neography generates uuid string for identifying entities.
Abstract classes were also introduced for making most of query builder's and repositories' methods type safe.
 
```typescript
import {AbstractNode, AbstractRelation} from 'neography/model';
import {node, relation} from 'neographyAnnotations';

@node('ExampleNodeLabel')
class ExampleNode extends AbstractNode {
    @attribute() attr1:string;
    @attribute() attr2:string[];
}

@relation('EXAMPLE_RELATION_TYPE')
class ExampleRelation extends AbstractRelation {
    @attribute() attr1:string;
}

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
//create instance of ExampleNode and assign properties values
let exampleNode = new ExampleNode();
exampleNode.attr1 = 'attribute1Value';
exampleNode.attr2 = ['attr2'];

//create query
let insertQuery = neography.query()
    .create(c => c.node(exampleNode).as('someAlias'))
    .returns('someAlias');
```

Query can be executed by calling ```runQuery``` method on ```Connection``` instance. And returns properly mapped response

```typescript
import {Persisted} from 'neography/model';
let response:{someAlias: Persisted<ExampleNode>}[] = await neography.checkoutConnection().runQuery(insertQuery).toArray();
```

It will be the same as running following query

```cypher
CREATE(someAlias:ExampleNodeLabel {attr1: "attribute1Value", attr2: ["attr2"]})
RETURN someAlias
```

Response object provides convenient helper methods for queries like the previous one.

```typescript
let response:Persisted<ExampleNode> = await neography.checkoutConnection().runQuery(insertQuery).pickOne('someAlias').first();
```

```Persisted``` class declares that ```id``` property isn't optional and it is string. It's useful with strict type checking