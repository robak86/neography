# ROADMAP

* add support for ```SKIP``` and ```LIMIT```
* add support for ```WITH```
* add support for using patterns in Where statement
* add support for functions like ```shortestPath```
* add support for DateTime introduced in neo4j 3.4
* create alternative api which doesn't use @decorators
    * register all types explicitly in Schema object
    * use typescript conditional types for getting typescript types from runtime types declaration
    * ...
* take all parameters when query is run, not when it's build (performance)   