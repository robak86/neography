import {ConnectedNode, isConnectedNode} from "./ConnectedNode";
import {AbstractNode} from "./index";
import {Type} from "../utils/types";
import {RelationshipEntity} from "./RelationshipEntity";
import {assertAllPersisted} from "./GraphEntity";

export class ConnectedNodesCollection<R extends RelationshipEntity, TO extends AbstractNode> {
    private connectedNodes:ConnectedNode<R, TO>[] = [];

    constructor(private relationClass:Type<R>) {

    }

    setNodes(n:TO[]) {
        this.connectedNodes = n.map(node => {
            return {node, relation: new this.relationClass()}
        })
    }

    setConnectedNodes(n:ConnectedNode<R, TO>[]) {
        this.connectedNodes = n.concat([]);
    }

    getConnectedNodes():ConnectedNode<R, TO>[] {
        return this.connectedNodes.map(connectedNode => {
            let connection:ConnectedNode<R, TO> = isConnectedNode(connectedNode, this.relationClass) ?
                {node: connectedNode.node, relation: connectedNode.relation} :
                {node: connectedNode, relation: new this.relationClass()};
            return connection;
        });
    }

    getNodes():TO[] {
        return this.connectedNodes.map(connectedNode => {
            return isConnectedNode(connectedNode, this.relationClass) ?
                connectedNode.node :
                connectedNode
        });
    }

    assertAllNodesPersisted() {
        assertAllPersisted(this.getNodes());
    }

    containsNode(node:TO) {
        return this.getNodes().some(n => n.id === node.id)
    }
}