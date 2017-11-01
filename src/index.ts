import { Query as QueryBase } from './core';

export { default as buildClient, Client } from './client';
export { ScalarName } from './core';
export { default as buildServer, connectors } from './server';

export type Query = QueryBase<string>;
