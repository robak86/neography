import {SessionProxy} from "./SessionProxy";
import {AuthToken, Config, Driver} from "neo4j-driver/types/v1/driver";
import neo4j from "neo4j-driver";
import {getLogger} from "../utils/logger";

export class DriverProxy {
    private driver:Driver;

    constructor(url:string,
                authToken?:AuthToken,
                config?:Config) {

        this.driver = neo4j.driver(url, authToken, config);
    }

    session():SessionProxy {
        return new SessionProxy(this.driver.session());
    }

    close():void {
        this.driver.close();
        getLogger('debug').info('Neo4j driver closed')
    }
}