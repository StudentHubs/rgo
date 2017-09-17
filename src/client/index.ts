export { Client, FieldConfig } from './typings';

import * as _ from 'lodash';
import { parse } from 'graphql';

import {
  Data,
  Field,
  fieldIs,
  isEmptyValue,
  keysToObject,
  noUndef,
  Obj,
  promisifyEmitter,
  QueryRequest,
  QueryResponse,
  Rules,
  ScalarField,
  ScalarName,
  transformValue,
  validate as validateField,
} from '../core';

import ClientState from './clientState';
import createFetcher from './createFetcher';
import queryLayers from './queryLayers';
import readLayer from './readLayer';
import {
  AuthState,
  Client,
  DataChanges,
  FieldConfig,
  FieldState,
  QueryOptions,
} from './typings';

export function buildClient(
  url: string,
  auth?: {
    login: (username: string, password: string) => Promise<AuthState>;
    logout: (authToken: string) => void | Promise<void>;
    refresh?: (
      refreshToken: string,
    ) => Promise<{ token: string; refresh: string }>;
  },
  log?: boolean,
): Client {
  let authState: AuthState | null;
  let schema: Obj<Obj<Field>>;
  let authField: { type: string; field: string } | null = null;
  let state: ClientState;
  let fetcher: any;

  let loggedInListeners: ((value: boolean) => void)[] = [];
  const setAuth = (newAuth: AuthState | null) => {
    authState = newAuth;
    if (!newAuth) localStorage.removeItem('kalamboAuth');
    else localStorage.setItem('kalamboAuth', JSON.stringify(newAuth));
    loggedInListeners.forEach(l => l(!!authState));
  };
  const runFetch = async (body: QueryRequest[]): Promise<QueryResponse[]> =>
    (await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authState ? { Authorization: `Bearer ${authState.token}` } : {},
      },
      body: JSON.stringify(body),
    })).json();
  const authFetch = async (body: QueryRequest[]): Promise<QueryResponse[]> => {
    const responses = await runFetch(body);
    const errorResponses = responses
      .map((response, index) => ({ errors: response.errors, index }))
      .filter(
        ({ errors }) =>
          errors && errors!.some(e => e.message === 'Not authorized'),
      );
    if (
      errorResponses.length > 0 &&
      auth &&
      auth.refresh &&
      authState &&
      authState.refresh
    ) {
      setAuth({
        id: authState.id,
        ...await auth.refresh(authState.refresh),
      });
      const retryResponses = await runFetch(
        errorResponses.map(({ index }) => body[index]),
      );
      errorResponses.forEach(
        ({ index }, i) => (responses[index] = retryResponses[i]),
      );
    }
    return responses;
  };

  const readyListeners: (() => void)[] = [];
  (async () => {
    authState = JSON.parse(
      (typeof localStorage !== 'undefined' &&
        localStorage.getItem('kalamboAuth')) ||
        'null',
    );
    schema = (await authFetch([{ query: '{ SCHEMA }' }]))[0].data.SCHEMA;
    for (const type of Object.keys(schema)) {
      for (const field of Object.keys(schema[type])) {
        if ((schema[type][field] as any).scalar === 'auth') {
          authField = { type, field };
          (schema[type][field] as any).scalar = 'string';
        }
      }
    }
    state = new ClientState(schema, authField, log);
    fetcher = createFetcher(authFetch, schema, (data, indices) => {
      state.setServer(data, indices);
    });
    state.watch(fetcher.process);
    readyListeners.forEach(l => l());
  })();

  let queryCounter = 0;

  const splitAuthField = (values: Obj<any>, authKey: string | null) => {
    if (!authField || !authKey) return values;
    const { username, password } = JSON.parse(values[authKey] || '{}');
    const [type, id] = authKey.split('.');
    return {
      ...values,
      [`${type}.${id}.${authField.field}`]: noUndef(username),
      [`${type}.${id}.password`]: noUndef(password),
    };
  };

  interface FieldInfo {
    scalar: ScalarName;
    isList?: true;
    rules: Rules;
    required?: boolean;
    showIf?: Obj;
  }
  const watchFields = <T>(
    config: FieldConfig | FieldConfig[],
    getResult: (info: Obj<FieldInfo>, values: Obj) => T,
    clear: boolean,
    listener?: (value: T | null) => void,
  ) => {
    return promisifyEmitter(innerListener => {
      const configArray = Array.isArray(config) ? config : [config];
      const allKeysObj: Obj<true> = {};
      let authKey: string | null = null;
      const info = keysToObject<FieldConfig, FieldInfo>(
        configArray,
        ({ key, rules, required, showIf }) => {
          const [type, id, fieldName] = key.split('.');
          if (
            authField &&
            type === authField.type &&
            (fieldName === authField.field || fieldName === 'password')
          ) {
            authKey = `${type}.${id}.${authField.field}`;
          }
          const field = (fieldName === 'password'
            ? { scalar: 'string' }
            : schema[type][fieldName]) as ScalarField;
          const allRules = { ...(rules || {}), ...(field.rules || {}) };
          if (field.rules && field.rules.lt) {
            allRules.lt = `${type}.${id}.${field.rules.lt}`;
          }
          if (field.rules && field.rules.gt) {
            allRules.gt = `${type}.${id}.${field.rules.gt}`;
          }
          if (allRules.lt) allKeysObj[allRules.lt] = true;
          if (allRules.gt) allKeysObj[allRules.gt] = true;
          if (Array.isArray(config)) {
            Object.keys(showIf || {}).forEach(k => (allKeysObj[k] = true));
          }
          allKeysObj[
            fieldName === 'password' ? `${type}.${id}.${authField!.field}` : key
          ] = true;
          return {
            scalar: field.scalar,
            isList: field.isList,
            rules: allRules,
            required,
            showIf,
          };
        },
        ({ key }) => key,
      );
      const allKeys = Object.keys(allKeysObj);

      let running = true;
      let unlisten;
      const unwatch = fetcher.addFields(allKeys, isLoading => {
        if (running) {
          if (isLoading) {
            innerListener(null);
          } else {
            allKeys
              .map(k => configArray.find(({ key }) => key === k)!)
              .filter(x => x && x.default !== undefined)
              .forEach(({ key, default: defaultValue }) => {
                const value = noUndef(_.get(state.combined, key));
                if (value === null) {
                  (state.setClient as any)(...key.split('.'), defaultValue);
                }
              });
            const values = keysToObject(allKeys, key =>
              noUndef(_.get(state.combined, key)),
            );

            innerListener(getResult(info, splitAuthField(values, authKey)));
            unlisten =
              allKeys.length === 1
                ? state.watch(allKeys[0], value => {
                    values[allKeys[0]] = value;
                    if (running) {
                      innerListener(
                        getResult(info, splitAuthField(values, authKey)),
                      );
                    }
                  })
                : state.watch(({ changes, changedData }) => {
                    const changedKeys = allKeys.filter(key =>
                      _.get(changes, key),
                    );
                    if (changedKeys.length > 0) {
                      for (const key of changedKeys) {
                        values[key] = _.get(changedData, key);
                      }
                      if (running) {
                        innerListener(
                          getResult(info, splitAuthField(values, authKey)),
                        );
                      }
                    }
                  });
          }
        }
      });
      return () => {
        running = false;
        unwatch();
        if (unlisten) unlisten();
        if (clear) {
          state.setClient(
            allKeys.reduce((res, k) => _.set(res, k, undefined), {}),
          );
        }
      };
    }, listener);
  };

  const mutate = async (keys: string[], clearKeys?: string[]) => {
    let resolvePromise: (data: Data | null) => void;
    const promise = new Promise<Data | null>(
      resolve => (resolvePromise = resolve),
    );
    fetcher.addMutation(
      keys
        .filter(key => !key.endsWith('.password'))
        .map(key => ({ key, value: noUndef(_.get(state.combined, key)) })),
      async (newIds, error) => {
        if (error) {
          resolvePromise(null);
        } else {
          if (auth && newIds['$user']) {
            // setAuth(
            //   await auth.login(
            //     newIds['$user'].username,
            //     newIds['$user'].password,
            //   ),
            // );
            delete newIds['$user'];
          }
          state.setClient(
            [...keys, ...(clearKeys || [])].reduce(
              (res, k) => _.set(res, k, undefined),
              {},
            ),
          );
          const data = {};
          keys.forEach(key => {
            const [type, id, fieldName] = key.split('.');
            const newId = newIds[type][id] || id;
            _.set(
              data,
              key,
              noUndef(_.get(state.combined, [type, newId, fieldName])),
            );
            data[type][id].id = newId;
          });
          resolvePromise(data);
        }
      },
    );
    return promise;
  };

  return {
    ready() {
      return new Promise(resolve => {
        if (schema) resolve();
        else readyListeners.push(resolve);
      });
    },
    types() {
      return keysToObject(Object.keys(schema), type =>
        keysToObject(Object.keys(schema[type]), fieldName => {
          const field = schema[type][fieldName];
          return fieldIs.scalar(field) ? field.scalar : field.type;
        }),
      );
    },
    newId(type) {
      return state.newId(type);
    },
    login(...args: any[]): any {
      if (args.length === 2) {
        return (async () => {
          if (!auth) return 'Auth not configured';
          try {
            setAuth(await auth.login(args[0], args[1]));
            return null;
          } catch (error) {
            return error.message as string;
          }
        })();
      }
      setAuth(args[0]);
    },
    async logout() {
      if (auth && authState) {
        await auth.logout(authState.token);
        setAuth(null);
      }
    },

    loggedIn(listener) {
      listener(!!authState);
      loggedInListeners.push(listener);
      return () => {
        loggedInListeners = loggedInListeners.filter(l => l !== listener);
      };
    },

    field(field: FieldConfig, listener?: (value: FieldState | null) => void) {
      return watchFields(
        field,
        (info, values) => ({
          scalar: info[field.key].scalar,
          isList: !!info[field.key].isList,
          rules: info[field.key].rules,
          value: values[field.key],
          onChange: value =>
            (state.setClient as any)(
              ...field.key.split('.'),
              transformValue(value, info[field.key].rules.transform!),
            ),
          invalid: isEmptyValue(values[field.key])
            ? !!info[field.key].required
            : !validateField(
                info[field.key].scalar,
                info[field.key].rules,
                values[field.key],
                values,
              ),
        }),
        false,
        listener,
      ) as any;
    },

    fields(
      fields: FieldConfig[],
      listener?: (
        value: { invalid: boolean; active: boolean[] } | null,
      ) => void,
    ) {
      return watchFields(
        fields,
        (info, values) => {
          const active = fields.map(
            ({ key }) =>
              info[key].showIf
                ? Object.keys(info[key].showIf!).every(
                    k =>
                      values[k] === info[key].showIf![k] ||
                      (Array.isArray(info[key].showIf![k]) &&
                        info[key].showIf![k].includes(values[k])),
                  )
                : true,
          );
          const invalid = fields.some(
            ({ key }, i) =>
              active[i] &&
              (isEmptyValue(values[key])
                ? !!info[key].required
                : !validateField(
                    info[key].scalar,
                    info[key].rules,
                    values[key],
                    values,
                  )),
          );
          return {
            active,
            invalid,
            async mutate() {
              if (invalid) return false;
              return await mutate(
                fields.filter((_, i) => active[i]).map(({ key }) => key),
                fields.filter((_, i) => !active[i]).map(({ key }) => key),
              );
            },
          };
        },
        true,
        listener,
      ) as any;
    },

    query(...args) {
      const queryDoc = parse(args[0]);
      const [options, onLoad, onChange] = (args.length === 3
        ? [undefined, ...args.slice(1)]
        : args.slice(1)) as [
        (QueryOptions & { info?: true }) | undefined,
        ((data: Obj | { data: Obj; spans: Obj } | null) => void) | undefined,
        ((changes: Data) => void) | true | undefined
      ];
      const { variables, idsOnly, info: withInfo } =
        options || ({} as QueryOptions & { info?: true });

      return promisifyEmitter(onLoadInner => {
        const queryIndex = queryCounter++;

        const layers = queryLayers(
          schema,
          queryDoc,
          variables,
          authState && authState.id,
          idsOnly,
          withInfo,
        );

        let data = {};
        let spans = {};
        let rootUpdaters:
          | ((changes: DataChanges, update: boolean) => number)[]
          | null = null;
        let firstIds: Obj<Obj<string>>;

        let running = true;
        const updateQuery = fetcher.addQuery(
          queryIndex,
          newFirstIds => {
            if (newFirstIds) firstIds = newFirstIds;
            data = {};
            spans = {};
            rootUpdaters = layers.map(layer =>
              readLayer(
                layer,
                { '': data },
                state,
                firstIds,
                withInfo && { '': spans },
              ),
            );
            if (withInfo) {
              spans[''] = Math.max(
                ...layers.map(({ root }) =>
                  spans[root.field].reduce((res, v) => res + v[''], 0),
                ),
                1,
              );
            }
            if (running) onLoadInner(withInfo ? { data, spans } : data);
          },
          () => {
            if (running) onLoadInner(null);
          },
        );
        updateQuery(layers, state);

        const unlisten = state.watch(({ changes, changedData, indices }) => {
          if (!indices || !indices.includes(queryIndex)) {
            const updateType = rootUpdaters
              ? Math.max(
                  ...rootUpdaters.map(updater =>
                    updater(changes, onChange === true),
                  ),
                )
              : 2;
            if (updateType === 2) {
              rootUpdaters = null;
              updateQuery(layers, state);
            } else if (updateType === 1) {
              if (onChange === true) onLoadInner(data);
              else onChange!(changedData);
            }
          }
        });

        return () => {
          running = false;
          updateQuery();
          unlisten();
        };
      }, onLoad) as any;
    },

    set(...args) {
      return (state.setClient as any)(...args);
    },

    mutate,
  };
}
