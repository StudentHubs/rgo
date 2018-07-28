import { ClientData, DataChanges, Schema, State } from './typings';
export default function setState(store: 'server' | 'client', state: State, data: ClientData, schema: Schema, changes: DataChanges): void;
