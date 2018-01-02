- add auto mapping of integer values 
# remove id property on relation !!!!!!
 
 
- pass type for each method from IRowTransformer. It is required by id extension -> we wanna set id only on node entity
- Consider moving all repositories behaviour to Commands (strategy like classes)
 
 write
 1. check if number which we are gonna insert is integer and wrap with int() if so
 2. for floats pass value unchanged
 read
 1. if number is int() unwrap it to javascript number.
  if it is outside the range print warning
  2. if number is float pass it unchanged
 
- splitting logic for timestamps in two places (@timestamp for converting types) and TimeExtensions for setting actual date sucks 
- create repository for relations which don't have any props

- create complex integration specs for query builder

spec/integration/match.spec.ts
spec/integration/create.spec.ts
spec/integration/update.spec.ts

- fix invariant method

- create runRaw method for connection (for running plain cypher queries + params);
- update README.md

OneToOneRepository ?
ManyToManyRepository ?

connection.getRepo(NodeClass1, RelClass1, NodeClass2) {}

```
addRelated(instanceNodeClass1, instanceNodeClass2) {
    let relation = RelClass1.build(); //automatically create instance of relation under hood
}
removeRelated(instanceNodeClass2, instanceNodeClass2)
 
updateRelated(instanceNodeClass1, [relatedElements] ) {
}
```


Consider adding ORM like features 

```typescript


@node('SomeNode')
class SomeNode {
    @attribute() attr1;
    @attribute() attr2;
    @attribute() attr3;
    
    
    //use mapped types for being type safe
    relations = createEdgesDefinitions(this, define => {
        return {
            scores: define.oneToMany(SomeRelationClass, MusicScoreNode)
            something: define.manyToMany(SomeRelationClass, MusicScoreNode)
        }    
    })
}


function Node(a:any):any{}



function OrmNode<T>(a:T):any {
    return class extends AbstractNode {
        constructor(){
            
        }
        
        //map properties of a
        get relations() {
            return new RelationsManager<T>(this);
        }
    }
}

let SomeNodeEdges = (define) => ({
    scores: define.relation(SomeRelationClass, '->', MusicScoreNode)
})

@node('SomeNode')
class SomeNode extends OrmNode(SomeNodeEdges){
    @attribute() attr1;
    @attribute() attr2;
    @attribute() attr3;
}


//TODO: but how to eager load this ?
//http://neo4jrb.readthedocs.io/en/9.1.x/ActiveNode.html?highlight=eager
//TODO: investigate merge for edges

let s:SomeNode;


s.edges.scores.update([]);


```



```typescript`
       createRelationQuery = neography.query(query => query
                    .match(m => m.node(DummyGraphNode).params({id: node1.id}).as('n1'))
                    .match(m => m.node(DummyGraphNode).params({id: node2.id}).as('n2'))
                    .create(c => [
                        c.matchedNode('n1'),
                        c.relation(newRelation).as('rel1').direction('->'),
                        c.matchedNode('n2')])
                    .returns('n1', 'rel1', 'n2')
                    );
```



* Write documentation and examples!
* Add integration specs
* Add missing unit tests
* Add missing methods for repositories
* ~~Choose one utility library instead of using both ramda and lodash~~ 
* Validate user input in query building and throw Errors before query hits database
    * validate if all strings passed to ```returns()``` method were registered using ```.as()```
* ~~Optimize management of driver's sessions~~
* Add performance specs for transactions
* use typescript definitions provided by neo4j-driver
* implement nodes/relationships id generation as plugin and make it optional 
* investigate different api/dsl for repositories