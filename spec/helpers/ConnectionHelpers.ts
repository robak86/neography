import {Connection} from "../../lib/connection/Connection";
import * as _ from 'lodash';
import {someOrThrow} from "../../lib/utils/core";
import {Neography} from "../../lib/index";
import {genId} from "../../lib/utils/uuid";
import {QueryContext} from "../../lib/cypher/common/QueryContext";
import {TimestampsExtension} from "../../lib/extensions/TimestampsExtension";

export const getDefaultNeography= ():Neography => {
    let neography = new Neography({host: 'localhost', username: 'neo4j', password: 'password'});
    neography.registerExtension(TimestampsExtension.getDefault());
    return neography;
};

export const getConnection = _.memoize(():Connection => {
    return getDefaultNeography().checkoutConnection();
});

export const getDefaultContext = () => {
    let neography = getDefaultNeography();
    return new QueryContext(neography.attributesMapperFactory);
};

export const cleanDatabase = ():Promise<any> => {
    return getConnection().runQuery(q => q.literal(`MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r`)).toArray();
};

export const createConnectionFactory = ():() => Connection => {
    let connection;
    beforeEach(async () => {
        await cleanDatabase();
        connection = getConnection();
    });

    return () => someOrThrow(connection, 'Connection is not yet created.')
};
