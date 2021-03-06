export declare type Obj<T = any> = {
    [key: string]: T;
};
export declare type Falsy = false | null | undefined | void;
export declare type Scalar = 'boolean' | 'int' | 'float' | 'string' | 'date' | 'json';
export interface ScalarField {
    scalar: Scalar;
    isList?: true;
    meta?: any;
}
export interface RelationField {
    type: string;
    isList?: true;
    meta?: any;
}
export interface ForeignRelationField {
    type: string;
    foreign: string;
    meta?: any;
}
export declare type Field = ScalarField | RelationField | ForeignRelationField;
export declare type Schema = Obj<Obj<Field>>;
export declare const fieldIs: {
    scalar: (field: Field) => field is ScalarField;
    relation: (field: Field) => field is RelationField;
    foreignRelation: (field: Field) => field is ForeignRelationField;
};
export declare type RecordValue = boolean | number | string | Date | Obj | boolean[] | number[] | string[] | Date[] | Obj[];
export declare type Record = Obj<RecordValue | null>;
export declare type Data<T = Record | null> = Obj<Obj<T>>;
export declare type ClientData = Data<Obj<RecordValue | null | undefined> | null | undefined>;
export declare type FilterOp = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in';
export interface Args<F = undefined, S = undefined> {
    filter?: F | any[];
    sort?: S | string[];
    start?: number;
    end?: number;
}
export interface Query extends Args<string | null, string> {
    name: string;
    alias?: string;
    fields: (string | Query)[];
}
export interface ResolveQuery extends Args {
    name: string;
    alias?: string;
    fields: (string | ResolveQuery)[];
    extra?: {
        start: number;
        end: number;
    };
    trace?: {
        start: number;
        end?: number;
    };
    key?: string;
}
export interface QueryLayer {
    root: {
        type?: string;
        field: string;
        alias?: string;
    };
    field: ForeignRelationField | RelationField;
    args: Args;
    fields: string[];
    extra?: {
        start: number;
        end: number;
    };
    trace?: {
        start: number;
        end?: number;
    };
    path: string[];
    key: string;
}
export declare type GetStart = (layer: QueryLayer, rootId: string, recordIds: (string | null)[]) => number;
export declare type DataChanges = Data<Obj<true>>;
export interface State {
    server: Data<Record>;
    client: Data;
    combined: Data<Record>;
    diff: Data<1 | -1 | 0>;
}
export interface FetchInfo {
    name: string;
    field: ForeignRelationField | RelationField;
    args: Args;
    fields: Obj<number>;
    relations: Obj<FetchInfo>;
    complete: {
        data: {
            fields: string[];
            slice: {
                start: number;
                end?: number;
            };
            ids: string[];
        };
        firstIds: Obj<string | null>;
    };
    active: Obj<string[]>;
    pending?: {
        changing: string[];
        data: {
            fields: string[];
            slice: {
                start: number;
                end?: number;
            };
            ids: string[];
        };
    };
}
export interface ResolveRequest {
    commits?: Data[];
    queries?: ResolveQuery[];
    context?: Obj;
}
export interface ResolveResponse {
    data: Data<Record>;
    newIds: Data<string>;
    errors: (string | null)[];
    firstIds: Data<string | null>;
}
export declare type Resolver = (() => Promise<Schema>) & ((request: ResolveRequest) => Promise<ResolveResponse>);
export declare type Enhancer = (resolver: Resolver) => Resolver;
export interface Rgo {
    schema: Schema;
    flush(): void;
    create(type: string): string;
    query(): Promise<void>;
    query(...queries: Query[]): Promise<Obj>;
    query(...queries: (Query | ((data: Obj | null) => void))[]): () => void;
    query(query: Query, onLoad: (data: Obj | null) => void): () => void;
    query(query1: Query, query2: Query, onLoad: (data: Obj | null) => void): () => void;
    query(query1: Query, query2: Query, query3: Query, onLoad: (data: Obj | null) => void): () => void;
    query(query1: Query, query2: Query, query3: Query, query4: Query, onLoad: (data: Obj | null) => void): () => void;
    query(query1: Query, query2: Query, query3: Query, query4: Query, query5: Query, onLoad: (data: Obj | null) => void): () => void;
    set(...values: ({
        key: [string, string, string];
        value: RecordValue | null | undefined;
    } | {
        key: [string, string];
        value: null | undefined;
    })[]): void;
    commit(...keys: ([string, string] | [string, string, string])[]): Promise<Data<string>>;
}
