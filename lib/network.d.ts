import { Field, ResolveQuery, Obj, ResolveRequest, ResolveResponse } from './typings';
declare const _default: {
    request(map: "encode" | "decode", schema: Obj<Obj<Field>>, request: ResolveRequest): {
        commits: Obj<Obj<{
            [key: string]: any;
        }>>[] | undefined;
        queries: ResolveQuery[] | undefined;
        context: Obj<any> | undefined;
    };
    response(map: "encode" | "decode", schema: Obj<Obj<Field>>, response: ResolveResponse): {
        data: Obj<Obj<{
            [key: string]: any;
        }>>;
        newIds: Obj<Obj<string>>;
        errors: (string | null)[];
        firstIds: Obj<Obj<string | null>>;
    };
};
export default _default;
