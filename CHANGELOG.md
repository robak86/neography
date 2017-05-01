## 0.0.3
- Add ```PersistedAggregate``` type 
- Fix bug occurring when user was declaring his own abstract classes inheriting from ```AbstractNode``` or ```AbstractRelation```
- Add ```NodeRelationsRepository``` accessible by ```getNodeRelationsRepository```

 ## 0.0.4 
 - limit Connection instance to using only one neo4j session at the time (Solves Error: read ECONNRESET error ) 