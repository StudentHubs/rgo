import { Data, ResolveQuery, GetStart, Obj, Record, Schema } from './typings';
export default function read(queries: ResolveQuery[], schema: Schema, data: Data<Record>, starts: Data<string | null> | GetStart): {
    result: Obj<any>;
    updaters: ((changes: Obj<Obj<Obj<true>>>) => number)[];
};
