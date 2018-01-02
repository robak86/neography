## 0.0.3
- Add ```PersistedAggregate``` type 
- Fix bug occurring when user was declaring his own abstract classes inheriting from ```AbstractNode``` or ```AbstractRelation```
- Add ```NodeRelationsRepository``` accessible by ```getNodeRelationsRepository```

 ## 0.0.4 
 - limit Connection instance to using only one neo4j session at the time (Solves Error: read ECONNRESET error )
 
 ## 0.1.0
 - remove ```Persisted``` type. Repositories accept now nodes with optional ```id``` property
  and throw error if ```id``` is missing while it was expected
 - remove ```createFactoryMethod``` used for generating static ```build``` methods. This functionality was moved to
  constructor of ```AbstractRelation``` and ```AbstractNode```.
 - rename ```pickOne``` method of GraphResponse to more intuitive ```pluck```
 - allow user to pass logger instance in configuration 
 - add saveMany, updateMany for NodeRepository
 - reorganize, rewrite repositories in order to cover most frequent use cases
 - @timestamp maps neo4j integer value to javascript Date object
 - fix bug related to closing driver sessions
 - remove explicit conversion to Integer for timestamps
 - all Integer values read from database are converted to number
 - add automatic conversion of Integer to javascript number type during read.
 Integers greater that ```Number.MAX_SAFE_INTEGER``` won't be converted and Integer will be returned.
 