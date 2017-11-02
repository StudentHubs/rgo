export { Client, ClientPlugin } from './typings';

import * as _ from 'lodash';
import {
  buildClientSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  introspectionQuery,
} from 'graphql';

import {
  Data,
  encodeDate,
  keysToObject,
  fieldIs,
  localPrefix,
  mapArray,
  noUndef,
  Obj,
  promisifyEmitter,
  Query,
  QueryRequest,
  QueryResponse,
  standardiseQuery,
} from '../core';

import ClientState from './clientState';
import getRequests from './getRequests';
import readLayer from './readLayer';
import { Client, ClientPlugin, FetchInfo } from './typings';

export default function buildClient(
  url: string,
  ...plugins: ClientPlugin[]
): Client {
  const doFetch = plugins.filter(p => p.onFetch).reduce(
    (res, p) => (body: QueryRequest[], headers: Obj) =>
      p.onFetch!(body, headers, res),
    async (body: QueryRequest[], headers: Obj): Promise<QueryResponse[]> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          ...(headers || {}),
        }),
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error();
      return await response.json();
    },
  );

  const state = new ClientState(
    plugins.filter(p => p.onChange).map(p => p.onChange!),
  );
  let schemaResolve;
  const schemaPromise = new Promise(resolve => (schemaResolve = resolve));
  const newIds: Obj<number> = {};

  let queryCounter = 0;
  const activeQueries: Obj<{
    fetched: Obj<FetchInfo>;
    pending?: { requests: string[]; next: Obj<FetchInfo> };
    latestRun?: number;
    firstIds?: Obj<Obj<string>>;
  }> = {};
  let commits: {
    request: string;
    variables: Obj<any[]>;
    resolve: (
      response: { newIds?: Obj<Obj<string>>; errors?: string[] },
    ) => void;
  }[] = [];

  let runCounter: number = 0;
  let resetRun: number = 0;
  const run = _.throttle(async () => {
    const runIndex = ++runCounter;
    const requests: QueryRequest[] = [];

    const queryIndices = Object.keys(activeQueries).filter(
      k => activeQueries[k].pending,
    );
    const firstIndicies: Obj<number> = {};
    for (const i of queryIndices) {
      firstIndicies[i] = requests.length;
      requests.push(
        ...activeQueries[i].pending!.requests.map(q => ({
          query: q,
          normalize: true,
        })),
      );
      activeQueries[i].latestRun = runIndex;
      activeQueries[i].fetched = activeQueries[i].pending!.next;
      delete activeQueries[i].pending;
    }
    const commitIndices: number[] = [];
    for (const { request, variables } of commits) {
      commitIndices.push(requests.length);
      requests.push({ query: request, variables, normalize: true });
    }
    const commitResolves = commits.map(c => c.resolve);
    commits = [];

    const responses = await doFetch(requests, {});
    Object.keys(activeQueries).forEach(i => {
      if (activeQueries[i].latestRun === runIndex) {
        activeQueries[i].firstIds = responses[firstIndicies[i]].firstIds!;
      }
    });
    commitResolves.forEach((watcher, i) => {
      const { newIds, errors } = responses[commitIndices[i]];
      watcher({ newIds, errors: errors && errors.map(e => e.message) });
    });
    state.setServer(
      runIndex > resetRun ? responses[0].data : {},
      client.schema,
    );
  }, 100);

  const reset = () => {
    resetRun = runCounter;
    Object.keys(activeQueries).forEach(k => {
      activeQueries[k].fetched = {};
      delete activeQueries[k].pending;
    });
    state.setServer(
      keysToObject(Object.keys(state.server), type =>
        keysToObject(Object.keys(state.server[type]), null),
      ),
      client.schema,
    );
  };

  const client = {
    schema: null as any,
    newId(type) {
      newIds[type] = newIds[type] || 0;
      return `${localPrefix}${newIds[type]++}`;
    },
    reset,

    query(...args) {
      if (args.length === 0) return schemaPromise;

      const baseQueries: Query<string>[] = Array.isArray(args[0])
        ? args[0]
        : [args[0]];
      const [onLoad, onChange] = args.slice(1) as [
        ((data: Obj | { data: Obj; spans: Obj } | null) => void) | undefined,
        ((changes: Data) => void) | undefined
      ];

      return promisifyEmitter(innerListener => {
        const queryIndex = queryCounter++;
        let unlisten: () => void;
        schemaPromise.then(() => {
          const queries = baseQueries.map(q =>
            standardiseQuery(q, client.schema),
          );
          let data = {};
          let updaters:
            | ((changes: Obj<Obj<Obj<true>>>, update: boolean) => number)[]
            | null;
          activeQueries[queryIndex] = { fetched: {} };
          const setPending = () => {
            activeQueries[queryIndex].pending = getRequests(
              client.schema,
              state,
              queries,
              activeQueries[queryIndex].fetched,
            );
          };
          const readQuery = () => {
            updaters = queries.map(q =>
              readLayer(q, client.schema, {
                records: { '': { '': data } },
                state,
                firstIds: activeQueries[queryIndex].firstIds!,
                plugins: plugins.filter(p => p.onFilter).map(p => p.onFilter!),
              }),
            );
            innerListener(data);
          };
          unlisten = state.listen(({ changes, changedData }) => {
            if (activeQueries[queryIndex].firstIds) {
              const updateType = updaters
                ? Math.max(...updaters.map(u => u(changes, !onChange)))
                : 2;
              if (updateType === 2) {
                setPending();
                if (activeQueries[queryIndex].pending!.requests.length === 0) {
                  activeQueries[queryIndex].fetched = activeQueries[queryIndex]
                    .pending!.next;
                  delete activeQueries[queryIndex].pending;
                  readQuery();
                } else {
                  data = {};
                  updaters = null;
                  innerListener(null);
                  run();
                }
              } else if (updateType === 1) {
                if (!onChange) innerListener(data);
                else onChange(changedData);
              }
            }
          });
          setPending();
          innerListener(null);
          run();
        });
        return () => {
          delete activeQueries[queryIndex];
          if (unlisten) unlisten();
        };
      }, onLoad) as any;
    },

    set(values) {
      if (values.length !== 0) state.setClient(values);
    },

    async commit(keys: [string, string, string][]) {
      await schemaPromise;
      if (keys.length === 0) return { values: [], newIds: {} };

      const data = keys.reduce((res, key) => {
        const field = this.schema![key[0]][key[2]];
        const isDate = fieldIs.scalar(field) && field.scalar === 'date';
        const value = noUndef(_.get(state.combined, key));
        return _.set(res, key, isDate ? mapArray(value, encodeDate) : value);
      }, {});
      const types = Object.keys(data);
      const dataArrays = keysToObject(types, type =>
        Object.keys(data[type]).map(id => ({ id, ...data[type][id] })),
      );
      const { newIds, errors } = await new Promise<{
        newIds?: Obj<Obj<string>>;
        errors?: string[];
      }>(resolve => {
        commits.push({
          request: `mutation Mutate(${types
            .map(t => `$${t}: [${t}Input!]`)
            .join(', ')}) {
            commit(${types.map(t => `${t}: $${t}`).join(', ')}) {
              ${types
                .map(
                  t => `${t} {
                    ${Array.from(
                      new Set([
                        ...dataArrays[t].reduce<string[]>(
                          (res, o) => [...res, ...Object.keys(o)],
                          [],
                        ),
                        'createdat',
                        'modifiedat',
                      ]),
                    )
                      .map(
                        f =>
                          fieldIs.scalar(this.schema![t][f])
                            ? f
                            : `${f} { id }`,
                      )
                      .join('\n')}
                  }`,
                )
                .join('\n')}
            }
          }`,
          variables: dataArrays,
          resolve,
        });
        run();
      });

      if (errors) return null;
      state.setClient(keys.map(key => ({ key, value: undefined })));
      return {
        values: keys.map(([type, id, field]) =>
          noUndef(
            _.get(state.combined, [
              type,
              (newIds![type] && newIds![type][id]) || id,
              field,
            ]),
          ),
        ),
        newIds: newIds!,
      };
    },
  };

  (async () => {
    const schemaFields = buildClientSchema(
      (await (await fetch(url, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ query: introspectionQuery }),
      })).json()).data,
    )
      .getQueryType()
      .getFields();
    client.schema = keysToObject(Object.keys(schemaFields), type => {
      const fields = (schemaFields[type].type as GraphQLList<
        GraphQLNonNull<GraphQLObjectType>
      >).ofType.ofType.getFields();
      return keysToObject(Object.keys(fields), field =>
        JSON.parse(fields[field].description),
      );
    });
    schemaResolve();
  })();

  return client;
}
