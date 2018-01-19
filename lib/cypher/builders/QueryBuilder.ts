import {MatchableElement, MatchQueryPart} from "../match/MatchQueryPart";
import {CreateQueryPart, PersistableElement} from "../create/CreateQueryPart";
import {CypherQuery, CypherQueryElement} from "../CypherQuery";
import * as _ from 'lodash';
import {ReturnQueryPart} from "../common/ReturnQueryPart";
import {MatchBuilder} from "./MatchBuilder";
import {CreateBuilder} from "./CreateBuilder";
import {SetQueryBuilder} from "./SetQueryBuilder";
import {SetQueryPart, SetQueryPartChildren} from "../update/SetQueryPart";
import {WhereBuilder, WhereStatementPart} from "./WhereBuilder";
import {WhereLiteralQueryPart} from "../match/WhereLiteralQueryPart";
import {CypherLiteral} from "../common/CypherLiteral";
import {AttributesMapperFactory} from "../../mappers/AttributesMapperFactory";
import {WhereStatement} from "../where/WhereStatement";

import {OrderStatementPart} from "../order/OrderStatementPart";
import {OrderStatement} from "../order/OrderStatement";
import {OrderBuilder} from "./OrderBuilder";


export type MatchBuilderCallback = (q:MatchBuilder) => MatchableElement[] | MatchableElement;
export type CreateBuilderCallback = (q:CreateBuilder) => PersistableElement[] | PersistableElement;
export type WhereBuilderCallback<T> = (q:WhereBuilder<T>) => WhereStatementPart[] | WhereStatementPart;
export type OrderBuilderCallback<T> = (q:OrderBuilder<T>) => OrderStatementPart[] | OrderStatementPart;

export class QueryBuilder {
    constructor(private elements:CypherQueryElement[] = []) {}

    match(...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):QueryBuilder {
        let matchableElements:MatchableElement[] = [];

        builderOrElements.forEach((el) => {
            if (_.isFunction(el)) {
                matchableElements = matchableElements.concat(el(new MatchBuilder()));
            } else {
                matchableElements.push(el as any);
            }
        });

        let elements = _.clone(this.elements);
        elements.push(new MatchQueryPart(matchableElements, false));

        return new QueryBuilder(elements)
    }

    literal(cypherLiteral:string, params?:any):QueryBuilder {
        return this.cloneAndAppend([new CypherLiteral(cypherLiteral).params(params)]);
    }

    //TODO: make it DRY with match method
    optionalMatch(...builderOrElements:(MatchBuilderCallback | MatchableElement)[]):QueryBuilder {
        let matchableElements:MatchableElement[] = [];

        builderOrElements.forEach((el) => {
            if (_.isFunction(el)) {
                matchableElements = matchableElements.concat(el(new MatchBuilder()));
            } else {
                matchableElements.push(el as any);
            }
        });

        let elements = _.clone(this.elements);
        elements.push(new MatchQueryPart(matchableElements, true));

        return new QueryBuilder(elements)
    }

    //TODO: we should provide builder for where, but currently we only support literals
    where(literal:string | WhereBuilderCallback<any> | WhereStatement) {
        if (literal instanceof WhereStatement) {
            let elements = _.clone(this.elements);
            elements.push(literal);
            return new QueryBuilder(elements)
        } else {
            let whereElement:WhereStatementPart[] | WhereStatementPart = _.isFunction(literal) ?
                literal(new WhereBuilder()) :
                new WhereLiteralQueryPart(literal);

            let elements = _.clone(this.elements);
            elements.push(new WhereStatement(_.castArray(whereElement) as any) as any);
            return new QueryBuilder(elements)
        }
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
        let persistableQueryElements:PersistableElement[] = [];

        builderOrElements.forEach((el) => {
            if (_.isFunction(el)) {
                persistableQueryElements = persistableQueryElements.concat(el(new CreateBuilder()));
            } else {
                persistableQueryElements.push(el as any);
            }
        });

        let elements = _.clone(this.elements);
        elements.push(new CreateQueryPart(persistableQueryElements));

        return new QueryBuilder(elements)
    }

    //TODO: check if previous return is present. If so replace it
    returns(...elementsMap:string[]):QueryBuilder { //TODO: void serves as sentinel but we should return class which don't have any methods. -> split QueryBuilder into couple classes with limited behaviour
        let elements = _.clone(this.elements);
        elements.push(new ReturnQueryPart(elementsMap));
        return new QueryBuilder(elements);
    }

    append(literal:string):QueryBuilder {
        let elements = _.clone(this.elements);
        elements.push(literal);
        return new QueryBuilder(elements)
    }

    toQuery(attributesMapperFactory:AttributesMapperFactory):CypherQuery {
        return new CypherQuery(this.elements, attributesMapperFactory);
    }

    private cloneAndAppend(queryElement:CypherQueryElement[]):QueryBuilder {
        let elements = _.clone(this.elements).concat(queryElement);
        return new QueryBuilder(elements)
    }
}

export function cypher():QueryBuilder {
    return new QueryBuilder();
}