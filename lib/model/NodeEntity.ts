import {AbstractEntity} from "./AbstractEntity";
import {attribute} from "../annotations";
import {getClassFromInstance, isPresent} from "../utils/core";
import {Connection} from "../connection/Connection";
import {connectionsFactory} from "../connection/ConnectionFactory";
import {buildQuery} from "../cypher";
import * as _ from 'lodash';
import {AttributesMetadata} from "../metadata/AttributesMetadata";
import {Relationship} from "./Relationship";
import {assertPersisted} from "./GraphEntity";
import {Required} from "../utils/types";


export abstract class NodeEntity<T = any> extends AbstractEntity<T> {
    @attribute() readonly id?:string;

    private _entityType:'Node';
    private _relationsCache:{ [propertyName:string]:Relationship<any, any> } = {};

    get attributes():Required<this> {
        let attributes = {};
        let meta = AttributesMetadata.getForInstance(this);
        meta.forEachAttribute((attribute, name) => {
            attributes[name] = this[name];
        });

        return attributes as any;
    }

    isEqual(other:this):boolean {
        return _.isEqual(this.attributes, other.attributes);
    }

    mergeAttributes(other:Partial<T>) {
        let meta = AttributesMetadata.getForInstance(this);
        meta.forEachAttribute((attribute, name) => {
            this[name] = other[name];
        });
    }

    isPersisted():boolean {
        return isPresent(this.id);
    }

    save(_connection?:Connection):Promise<this> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        //TODO: if there is no relations or any of existing relations is not dirty don't save in transaction

        return connection.withTransaction(async () => {
            let argsCopy = _.clone(this.attributes);

            try {
                let thisNode = this.isPersisted() ?
                    await this.update(connection) :
                    await this.create(connection);

                await Promise.all(this.relations.map(rel => {
                    return <any>rel instanceof Relationship ?
                        (rel as any).save(connection) :
                        Promise.resolve();
                }));
                return thisNode;

            } catch (e) {
                this.mergeAttributes(argsCopy as any);
                throw e;
            }
        })
    }

    async remove(detach:boolean = false, _connection?:Connection):Promise<any> {
        let connection = _connection || connectionsFactory.checkoutConnection();
        assertPersisted(this);

        let deletePrefix = detach ? 'DETACH DELETE' : 'DELETE';

        let query = buildQuery()
            .match(m => m.node(getClassFromInstance(this)).params({id: this.id} as any).as('n'))
            .append(`${deletePrefix} n`);

        let result = await connection.runQuery(query).toArray();
        (this as any).id = undefined;
        return result;
    }

    private get relations():Relationship<any, any>[] {
        let attributesMetadata = AttributesMetadata.getForInstance(this);
        return attributesMetadata.getRelationshipsNames().map(name => this[name]);
    }


    private async update(connection:Connection):Promise<this> {
        let ownClass = getClassFromInstance(this);

        let query = buildQuery()
            .match(m => [
                m.node(ownClass as any).params({id: this.id}).as('n')
            ])
            .set(s => s.update('n').typed(ownClass, this))
            .returns('n');

        let result = await connection.runQuery(query).pluck('n').first();

        //TODO: this is ineffective because we create second instance(result) of this node only for getting it's data
        this.mergeAttributes(result);
        return this;
    }

    private async create(connection:Connection):Promise<this> {
        let query = buildQuery()
            .create(c => c.node(this).as('n'))
            .returns('n');

        let node = await connection.runQuery(query).pluck('n').first();

        //TODO: this is ineffective because we create second instance(node) of this node only for getting it's data
        this.mergeAttributes(node);
        return this;
    };

    //pass connection for ongoing transaction
    // delete(connection?:Connection) {} //pass connection for ongoing transaction
    //
    // eagerLoad(eagerToLoad:(e:RD) => ActiveRelation<any, any>[]) {}
}