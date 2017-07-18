import { Obj } from 'mishmash';

import { Data, Field } from '../core';

export type DataDiff = Obj<Obj<1 | -1 | 0>>;

export interface ClientState {
  server: Data;
  client: Data;
  combined: Data;
  diff: DataDiff;
}

export type DataChanges = Obj<Obj<Obj<true>>>;

export interface Changes {
  changes: DataChanges;
  rootChanges: {
    added: string[];
    removed: string[];
  };
}

export interface ReadContext {
  data: Data;
  schema: Obj<Obj<Field>>;
  userId: string | null;
  variables: Obj;
}