export type TransformContext = 'create' | 'update' | 'read';

export interface IRowTransformer {
    create?:(obj) => any
    update?:(obj) => any
    read?:(obj) => any
}