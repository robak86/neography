* Write documentation and examples!
* Add missing specs
* Investigate how repositories api should looks like
* Choose one utility library instead of using both ramda and lodash 
* Remove updatedAt and createdAt from abstract classes and allow user to declare it in his base classes (with custom transform functions for mapper)
* Investigate if ```Persisted``` is really needed. Probably this functionality should be implemented by base classes defined by user.
* Validate user input in query building and throw Errors before query hits database