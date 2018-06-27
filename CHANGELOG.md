## 0.0.3
- Add ```PersistedAggregate``` type 
- Fix bug occurring when user was declaring his own abstract classes inheriting from ```NodeEntity``` or ```RelationshipEntity```
- Add ```NodeRelationsRepository``` accessible by ```getNodeRelationsRepository```

 ## 0.0.4 
 - limit Connection instance to using only one neo4j session at the time (Solves Error: read ECONNRESET error )
 
 ## 0.1.0
 - remove ```Persisted``` type. Repositories accept now nodes with optional ```id``` property
  and throw error if ```id``` is missing while it was expected
 - remove ```createFactoryMethod``` used for generating static ```build``` methods. This functionality was moved to
  constructor of ```RelationshipEntity``` and ```NodeEntity```.
 - rename ```pickOne``` method of GraphResponse to more intuitive ```pluck```
 - allow user to pass logger instance in configuration 
 - add saveMany, updateMany for NodeBatchRepository
 - reorganize, rewrite repositories in order to cover most frequent use cases
 - @timestamp maps neo4j integer value to javascript Date object
 - fix bug related to closing driver sessions
 - remove explicit conversion to Integer for timestamps
 - all Integer values read from database are converted to number
 - add automatic conversion of Integer to javascript number type during read.
 Integers greater that ```Number.MAX_SAFE_INTEGER``` won't be converted and Integer will be returned.
 
 ## 0.2.0
  - Rename
     * AbstractNode -> NodeEntity
     * @node -> @nodeEntity    
     * AbstractRelation -> RelationshipEntity
     * @relation -> @relationshipEntity
  - Remove all existing repositories in favor of record pattern
     * Add ```.save()```, ```.remove()``` on NodeEntity  
     * Add ```Relationship``` with ```@relationship``` decorator for managing node's relationships
     * Create ```NodeQuery``` for doing most frequently used queries
  - Create repository for batch actions ```connection.nodeBatchRepository(SomeNodeType)```
  - Write more specs
  - Add basic query builders for ```WHERE``` and ```ORDER BY``` statements
  

## 0.3.0
   - Add support for more composable way of build queries
```typescript
import {buildQuery, match, returns, where, orderBy} from 'neography/cypher'

const query = buildQuery(
    match(m => m.node(DummyGraphNode).as('n')),
    where(w => w.literal('n.attr2 >= {val1}').params({val1: 1})),
    orderBy(w => w.aliased('n').attribute('attr2').asc()),
    returns('n'),
);
```

   - Add support for variable length relationships
   - Add support for path variables