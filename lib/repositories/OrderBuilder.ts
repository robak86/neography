export type OrderBuilderCallback<O> = (b:OrderBuilder<O>) => OrderBy[] | OrderBy

export type OrderBy = {property: string, direction: string};

export class OrderBuilder<B> {
    asc<K extends keyof B>(property:K):OrderBy {
        return {property, direction: 'asc'};
    }

    desc<K extends keyof B>(property:K):OrderBy {
        return {property, direction: 'desc'};
    }
}