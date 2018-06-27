import {MatchableElement, MatchQueryPart} from "../match/MatchQueryPart";
import {CreateQueryPart, PersistableElement} from "../create/CreateQueryPart";
import {CypherQuery} from "../CypherQuery";
import * as _ from 'lodash';
import {ReturnQueryPart} from "../common/ReturnQueryPart";
import {MatchBuilder} from "./MatchBuilder";
import {CreateBuilder} from "./CreateBuilder";
import {SetQueryBuilder} from "./SetQueryBuilder";
import {SetQueryPart, SetQueryPartChildren} from "../update/SetQueryPart";
import {WhereBuilder, WhereStatementPart} from "./WhereBuilder";
import {CypherLiteral} from "../common/CypherLiteral";
import {AttributesMapperFactory} from "../../mappers/AttributesMapperFactory";
import {WhereStatement} from "../where/WhereStatement";
import {OrderStatementPart} from "../order/OrderStatementPart";
import {OrderStatement} from "../order/OrderStatement";
import {OrderBuilder} from "./OrderBuilder";
import {IQueryPart} from "../abstract/IQueryPart";
import {literal} from "../common";


export type MatchBuilderCallback = (q:MatchBuilder) => MatchableElement[] | MatchableElement;
export type CreateBuilderCallback = (q:CreateBuilder) => PersistableElement[] | PersistableElement;
export type WhereBuilderCallback<T> = (q:WhereBuilder<T>) => WhereStatementPart[] | WhereStatementPart;
export type OrderBuilderCallback<T> = (q:OrderBuilder<T>) => OrderStatementPart[] | OrderStatementPart;

export class QueryBuilder {
    constructor(private elements:IQueryPart[] = []) {}

    pipe(...cypherQueryElement:IQueryPart[]):QueryBuilder {
        let elements = _.clone(this.elements);
        return new QueryBuilder([...elements, ...cypherQueryElement])
    }

    match(...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):QueryBuilder {
        const matchQueryPart:MatchQueryPart = MatchQueryPart.build(false, ...builderOrElements);
        let elements = _.clone(this.elements);
        elements.push(matchQueryPart);
        return new QueryBuilder(elements)
    }

    literal(cypherLiteral:string, params?:any):QueryBuilder {
        return this.cloneAndAppend([new CypherLiteral(cypherLiteral).params(params)]);
    }

    //TODO: make it DRY with match method
    optionalMatch(...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):QueryBuilder {
        const matchQueryPart:MatchQueryPart = MatchQueryPart.build(true, ...builderOrElements);
        let elements = _.clone(this.elements);
        elements.push(matchQueryPart);
        return new QueryBuilder(elements)
    }

    //TODO: we should provide builder for where, but currently we only support literals
    where(literal:string | WhereBuilderCallback<any>) {
        const whereStatement = WhereStatement.build(literal);
        let elements = _.clone(this.elements);
        elements.push(whereStatement);
        return new QueryBuilder(elements)
    }

    set(build:(setBuilder:SetQueryBuilder) => SetQueryPartChildren[] | SetQueryPartChildren):QueryBuilder {
        let setElements:SetQueryPartChildren[] = _.castArray(build(new SetQueryBuilder()));

        let elements = _.clone(this.elements);
        elements.push(new SetQueryPart(setElements));

        return new QueryBuilder(elements);
    }

    order(literal:OrderBuilderCallback<any> | OrderStatement) {
        if (literal instanceof OrderStatement) {
            let elements = _.clone(this.elements);
            elements.push(literal);
            return new QueryBuilder(elements)
        } else {
            if (_.isFunction(literal)) {
                let whereElement:OrderStatementPart[] | OrderStatementPart = literal(new OrderBuilder());
                let elements = _.clone(this.elements);
                elements.push(new OrderStatement(_.castArray(whereElement) as any) as any);
                return new QueryBuilder(elements)
            } else {
                throw new Error("Wrong type of parameter for .order()")
            }
        }
    }

    create(...builderOrElements:(CreateBuilderCallback | PersistableElement)[]):QueryBuilder {
        const createQueryPart = CreateQueryPart.build(...builderOrElements);

        let elements = _.clone(this.elements);
        elements.push(createQueryPart);

        return new QueryBuilder(elements)
    }

    //TODO: check if previous return is present. If so replace it
    returns(...elementsMap:string[]):QueryBuilder { //TODO: void serves as sentinel but we should return class which don't have any methods. -> split QueryBuilder into couple classes with limited behaviour
        let elements = _.clone(this.elements);
        elements.push(new ReturnQueryPart(elementsMap));
        return new QueryBuilder(elements);
    }

    append(literalContent:string):QueryBuilder {
        let elements = _.clone(this.elements);
        elements.push(literal(literalContent));
        return new QueryBuilder(elements)
    }

    toQuery(attributesMapperFactory:AttributesMapperFactory):CypherQuery {
        return new CypherQuery(this.elements, attributesMapperFactory);
    }

    private cloneAndAppend(queryElement:IQueryPart[]):QueryBuilder {
        let elements = _.clone(this.elements).concat(queryElement);
        return new QueryBuilder(elements)
    }
}

export function cypher():QueryBuilder {
    return new QueryBuilder();
}