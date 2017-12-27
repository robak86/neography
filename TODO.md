- add more helper methods for GraphResponse(like pluck, props, etc)
- create repository for relations which don't have any props

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