import {Connection, Neography} from "../../lib";
import * as _ from 'lodash';
import {someOrThrow} from "../../lib/utils/core";
import {QueryContext} from "../../lib/cypher/common/QueryContext";
import {AbstractRelation} from "../../lib/model";
import {Type} from "../../lib/utils/types";
import {buildQuery} from "../../lib/cypher";
import {TimestampsExtension} from "../../lib/extensions/TimestampsExtension";

const DEBUG_ENABLED = false;

export const getDefaultNeography = _.memoize(():Neography => {
    let neography = new Neography({
        host: 'localhost',
        username: 'neo4j',
        password: 'password',
        debug: DEBUG_ENABLED
    });
    neography.registerExtension(TimestampsExtension.getDefault());
    return neography;
});

export const getSharedConnection = _.memoize(():Connection => {
    return getDefaultNeography().checkoutConnection();
});

export const checkoutConnection = ():Connection => {
    return getDefaultNeography().checkoutConnection();
};

export const getDefaultContext = () => {
    let neography = getDefaultNeography();
    return new QueryContext(neography.attributesMapperFactory);
};

export const cleanDatabase = ():Promise<any> => {
    return getSharedConnection().runQuery(q => q.literal(`MATCH (n) DETACH DELETE n`)).toArray();
};

export const countRelations = (rel:Type<AbstractRelation>):Promise<number> => {
    let query = buildQuery()
        .match(m => [
            m.node(),
            m.relation(rel).as('rel'),
            m.node()
        ])
        .returns('count(distinct rel) as count');

    return getSharedConnection().runQuery(query).pluck('count').first();
};

export const createConnectionFactory = ():() => Connection => {
    let connection;
    beforeEach(async () => {
        await cleanDatabase();
        connection = getSharedConnection();
    });

    return () => someOrThrow(connection, 'Connection is not yet created.')
};
