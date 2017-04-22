* Write documentation and examples!
* Add integration specs
* Add missing unit tests
* Add missing methods for repositories
* Choose one utility library instead of using both ramda and lodash 
* Investigate if ```Persisted``` is really needed. Probably this functionality should be implemented by base classes defined by user.
* Validate user input in query building and throw Errors before query hits database
    * validate if all strings passed to ```returns()``` method were registered using ```.as()```