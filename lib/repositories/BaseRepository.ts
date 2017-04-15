import {GraphResponse} from "../connection/GraphResponse";
import {Connection} from "../connection/Connection";


//TODO: we probably don't need this class!
//TODO: maybe we should treat this more likely as services which encapsulate all neo4j access. So it means that there won't be any composable queries and shit

export class BaseRepository {
    constructor(public connection:Connection) {

    }

}