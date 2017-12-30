import {ConnectedNode, isConnectedNode} from "./ConnectedNode";
import {AbstractNode} from "./index";
import {Type} from "../utils/types";
import {AbstractRelation} from "./AbstractRelation";
import {assertAllPersisted} from "./GraphEntity";

export class ConnectedNodesCollection<R extends AbstractRelation, TO extends AbstractNode> {
    constructor(private relationClass:Type<R>, private connectedNodes:(ConnectedNode<R, TO> | TO)[]) {

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
}