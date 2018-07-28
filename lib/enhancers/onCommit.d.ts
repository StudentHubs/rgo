import { Data, Enhancer, Obj, Schema } from '../typings';
export default function onCommit(map: (commit: Data, info: {
    schema: Schema;
    context: Obj;
}) => Data | void | Promise<Data | void>): Enhancer;
