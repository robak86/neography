import {Connection} from "../../lib/connection/Connection";
import * as _ from 'lodash';
import {someOrThrow} from "../../lib/utils/core";

export const getConnection = _.memoize(():Connection => {
    return new Connection({host: 'localhost', username: 'neo4j', password: 'password'});
});

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
