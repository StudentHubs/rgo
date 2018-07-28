import { Field, Obj, ResolveQuery, Query } from './typings';
export declare const standardizeQueries: (queries: ResolveQuery[] | Query[], schema: Obj<Obj<Field>>) => ResolveQuery[];
