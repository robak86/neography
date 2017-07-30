

import neo4j from "neo4j-driver";

export const Neo4jNode = neo4j.types.Node;
export const Neo4jRelationship = neo4j.types.Relationship;


import {Node, Relationship} from "neo4j-driver/types/v1/graph-types";

export function isNode(node: any): node is Node {
    return (node && node.labels)
}

export function isRelationship(rel: any): rel is Relationship {
    return (rel && rel.type)
}
