import { Enhancer, Obj, Record, Schema } from '../typings';
export default function onUpdate(map: (update: {
    type: string;
    id: string | null;
    record: Record | null;
}, info: {
    schema: Schema;
    context: Obj;
}) => Record | void | Promise<Record | void>): Enhancer;
