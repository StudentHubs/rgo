import { Field, ResolveQuery, Obj, QueryLayer } from './typings';
export default function walker<T = void, U = {}>(func: (layer: QueryLayer, relations: {
    name: string;
    alias?: string;
    foreign: boolean;
    walk: (...params: any[]) => T;
}[], context: U, ...params: any[]) => T): (queries: ResolveQuery[], schema: Obj<Obj<Field>>, context: U, ...params: any[]) => T[];
