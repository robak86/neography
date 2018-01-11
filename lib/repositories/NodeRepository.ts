import {AbstractNode, assertAllNew, assertAllPersisted} from "../model";
import {Connection} from "../connection/Connection";
import {Type} from "../utils/types";
import {MatchBuilder} from "../cypher/builders/MatchBuilder";
import {SetQueryBuilder} from "../cypher/builders/SetQueryBuilder";
import {buildQuery} from "../cypher";

export class NodeRepository<T extends AbstractNode> {
    constructor(private klass:Type<T>,
                private connection:Connection) {
    }

    async saveMany(nodes:T[]):Promise<T[]> {
        if (Array.isArray(nodes) && nodes.length === 0) {
            return []
        }
        assertAllNew(nodes);
        let query = buildQuery()
            .create(c => nodes.map((node, idx) => c.node(node).as('n' + idx)))
            .returns(`[${nodes.map((n, idx) => 'n' + idx)}] as list`);

        return this.connection.runQuery(query).pluck('list').first()
    };

    async updateMany(nodes:T[]):Promise<T[]> {
        if (Array.isArray(nodes) && nodes.length === 0) {
            return []
        }
        assertAllPersisted(nodes);

        const matchTargetNodes = (m:MatchBuilder) => nodes.map((node, idx) => {
            return m.node<T>(this.klass).params({id: node.id} as any).as('n' + idx)
        });

        const updateTargetNodes = (s:SetQueryBuilder) => nodes.map((node, idx) => {
            return s.update('n' + idx).typed(this.klass, node);
        });

        if (Array.isArray(nodes) && nodes.length === 0) {
            return []
        } else {
            let query = buildQuery()
                .match(matchTargetNodes)
                .set(updateTargetNodes)
                .returns(`[${nodes.map((n, idx) => 'n' + idx).join(',')}] as list`);

            return this.connection.runQuery(query).pluck('list').first();
        }
    };

    async removeMany(nodes:T[], detach:boolean = true):Promise<any> {
        assertAllPersisted(nodes);

        if (nodes.length === 0) {
            return []
        }

        const matchTargetNodes = (m:MatchBuilder) => nodes.map((node, idx) => {
            return m.node<T>(this.klass).params({id: node.id} as any).as('n' + idx)
        });

        let deletePrefix = detach ? 'DETACH DELETE' : 'DELETE';
        const returnStatement = ` ${deletePrefix}  ${nodes.map((_, idx) => 'n' + idx).join(',')} `;

        let query = buildQuery()
            .match(matchTargetNodes)
            .append(returnStatement);

        let result = await this.connection.runQuery(query).toArray();
        nodes.forEach(n => (n as any).id = undefined);
        return result;
    }
}