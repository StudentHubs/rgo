import { Args, Record, RecordValue, Resolver, Schema } from '../typings';
export interface IdRecord {
    id: string;
    [field: string]: RecordValue | null;
}
export interface Db {
    find(type: string, args: Args, fields: string[]): IdRecord[] | Promise<IdRecord[]>;
    insert(type: string, record: Record): string | Promise<string>;
    update(type: string, id: string, record: Record): void | Promise<void>;
    delete: (type: string, id: string) => void | Promise<void>;
}
export default function dbResolver(schema: Schema, db: Db): Resolver;
