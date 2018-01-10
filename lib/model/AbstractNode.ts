import {AbstractEntity} from "./AbstractEntity";
import {attribute} from "../annotations";
import {getClassFromInstance, isPresent} from "../utils/core";
import {Connection} from "../connection/Connection";
import {proxifyRelationsDefinitions} from "./proxifyRelationsDefinitions";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {buildQuery} from "../cypher";
import * as _ from 'lodash';
import {AttributesMetadata} from "../metadata/AttributesMetadata";

export abstract class AbstractNode<T = any, RD extends object = any> extends AbstractEntity<T> {
    @attribute() readonly id?:string;

    private _entityType:'Node';
    private _relations:RD;

    get relations():RD {
        return this._relations;
    }

    set relations(relations:RD) {
        this._relations = proxifyRelationsDefinitions(relations, this);
    }

    get attributes():Partial<this>{
        let attributes = {};
        let meta = AttributesMetadata.getForInstance(this);
        meta.forEachAttribute((attribute, name) => {
            attributes[name] = this[name];
        });

        return attributes;
    }

    isPersisted():boolean {
        return isPresent(this.id);
    }

    save(connection?:Connection):Promise<this> {
        //start transaction
        return this.isPersisted() ?
            this.update(connection) :
            this.create(connection)

        //TODO: iterate over active relations and call save (with transaction connection)
    }

    clone():this {
        return _.cloneDeep(this);
    }

    private async update(_connection?:Connection):Promise<this> {
        let connection = _connection || connectionsFactory.checkoutConnection();

        let ownClass = getClassFromInstance(this);

        let query = buildQuery()
            .match(m => [
                m.node(ownClass as any).params({id: this.id}).as('n')
            ])
            .set(s => s.update('n').typed(ownClass, this))
            .returns('n');

        let result = await connection.runQuery(query).pluck('n').first();
        _.merge(this, result);

        return result;
    }

    private async create(_connection?:Connection):Promise<this> {
        let connection = _connection || connectionsFactory.checkoutConnection();

        let query = buildQuery()
            .create(c => c.node(this).as('n'))
            .returns('n');

        let node = await connection.runQuery(query).pluck('n').first();
        _.merge(this, node);
        return node;
    };


    //pass connection for ongoing transaction
    // delete(connection?:Connection) {} //pass connection for ongoing transaction
    //
    // eagerLoad(eagerToLoad:(e:RD) => ActiveRelation<any, any>[]) {}
}