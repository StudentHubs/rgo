import { Args, Enhancer, FilterOp, Obj } from './typings';
export declare const newIdPrefix = "NEW__RECORD__";
export declare const isNewId: (id: string) => boolean;
export declare const getId: (id: string | null, newIds?: Obj<string> | undefined) => string | null;
export declare const isEqual: (v1: any, v2: any) => any;
export declare const mapArray: (v: any, map: (x: any) => any) => any;
export declare const noUndef: (v: any, replacer?: any) => any;
export declare const undefOr: (v: any, replacer?: any) => any;
export declare const get: (obj: any, key: string[]) => any;
export declare const merge: (target: any, source: Obj<any>, depth?: number) => {};
export declare const clone: (obj: any, depth?: number) => any;
export declare const mergeRecord: (records: Obj<Obj<string | number | boolean | string[] | Date | number[] | boolean[] | Obj<any> | Date[] | Obj<any>[] | null>>, key: string, record: Obj<string | number | boolean | string[] | Date | number[] | boolean[] | Obj<any> | Date[] | Obj<any>[] | null>) => void;
export declare const mapData: <T1, T2 = T1>(data: Obj<Obj<T1>>, map: (value: T1, type: string, id: string) => T2) => Obj<Obj<T2>>;
export declare const mapDataAsync: <T1, T2 = T1>(data: Obj<Obj<T1>>, map: (value: T1, type: string, id: string) => Promise<T2>) => Promise<{
    [key: string]: any;
}>;
export declare const locationOf: <T>(element: T, array: T[], compareFunc: (a: T, b: T) => 0 | 1 | -1) => number;
export declare const promisifyEmitter: <T>(emitter: (listener: (value: T | null) => void) => () => void, listener?: ((value: T | null) => void) | undefined) => (() => void) | Promise<T>;
export declare const createCompare: <T>(get: (value: T, key: string) => any, sort?: string[]) => (value1: T, value2: T) => 0 | 1 | -1;
export declare const runFilterValue: (value: any, op: FilterOp, filterValue: any) => any;
export declare const runFilter: (filter: any[] | undefined, id: string, record: any) => boolean;
export declare const find: (data: Obj<any>[], { filter, sort, start, end }: Args<undefined, undefined>, fields: string[]) => {
    [key: string]: any;
}[];
export declare const getFilterFields: (filter: any[]) => string[];
export declare const compose: (...enhancers: Enhancer[]) => Enhancer;
