import { Enhancer, Falsy, Obj, Schema } from '../typings';
export interface QueryLimit {
    filter?: any[];
    fields?: string[];
}
export default function limitQueries(map: (type: string, info: {
    schema: Schema;
    context: Obj;
}) => QueryLimit | QueryLimit[] | Falsy | Promise<QueryLimit | QueryLimit[] | Falsy>): Enhancer;
