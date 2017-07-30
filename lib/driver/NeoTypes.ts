import neo4j from "neo4j-driver";
import {Node, Relationship} from "neo4j-driver/types/v1/graph-types";

const Neo4jNode = neo4j.types.Node;
const Neo4jRelationship = neo4j.types.Relationship;

export function isNode(node: any): node is Node {
    return node instanceof Neo4jNode;
}

export function isRelationship(rel: any): rel is Relationship {
    return rel instanceof Neo4jRelationship;
}
