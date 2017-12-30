## 0.0.3
- Add ```PersistedAggregate``` type 
- Fix bug occurring when user was declaring his own abstract classes inheriting from ```AbstractNode``` or ```AbstractRelation```
- Add ```NodeRelationsRepository``` accessible by ```getNodeRelationsRepository```

 ## 0.0.4 
 - limit Connection instance to using only one neo4j session at the time (Solves Error: read ECONNRESET error )
 
 ## 0.0.9
 - remove ```Persisted``` type. Repositories accept now entities with optional ```id``` property
  and throw error if ```id``` is missing
 - rename ```pickOne``` method of GraphResponse to more intuitive ```pluck```
 - allow user to pass logger instance in configuration 
 - add saveMany for NodeRepository
 - @timestamp maps neo4j integer value to javascript Date object
 - fix bug related to closing driver sessions
 - timestamps are stored as float
 - all Integer values read from database are converted to number