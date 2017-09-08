import { fieldIs, keysToObject, Obj } from '../core';

import { Connector, DataType, Mutation } from './typings';

export default async function mutate(
  types: Obj<DataType>,
  connectors: Obj<Connector>,
  args,
  {
    userId,
    mutationsInfo,
  }: {
    userId: string | null;
    mutationsInfo: { mutations: Obj<Mutation[]>; newIds: Obj<Obj<string>> };
  },
) {
  const typeNames = Object.keys(args);

  for (const type of typeNames) {
    mutationsInfo.newIds[type] = mutationsInfo.newIds[type] || {};
    args[type]
      .map(m => m.id)
      .filter(id => id[0] === '$')
      .forEach(id => (mutationsInfo.newIds[type][id] = types[type].newId()));
  }
  const getId = (type: string, id: string) =>
    ({ ...mutationsInfo.newIds[type] || {}, $user: userId || '' }[id] || id);

  const mutations = keysToObject(typeNames, () => [] as Mutation[]);
  for (const type of typeNames) {
    for (const { id, ...mutation } of args[type]) {
      const mId = getId(type, id);

      for (const f of Object.keys(types[type].fields)) {
        const field = types[type].fields[f];
        if (fieldIs.relation(field) && mutation[f]) {
          mutation[f] = field.isList
            ? mutation[f].map(v => getId(field.type, v))
            : getId(field.type, mutation[f]);
        }
      }

      const data: Obj | null = Object.keys(mutation).length ? mutation : null;
      const prev: Obj | null =
        (id === mId && (await connectors[type].findById(mId))) || null;
      if (prev) delete prev.id;

      const mutateArgs: Mutation = { id: mId, data, prev };

      let allow = true;
      if (data && prev && types[type].auth.update)
        allow = await types[type].auth.update!(userId, id, data, prev);
      else if (data && !prev && types[type].auth.insert)
        allow = await types[type].auth.insert!(userId, id, data);
      else if (!data && types[type].auth.delete)
        allow = await types[type].auth.delete!(userId, id, prev);

      if (!allow) {
        const error = new Error('Not authorized') as any;
        error.status = 401;
        return error;
      }

      mutations[type].push(mutateArgs);
    }
  }

  const results = keysToObject(typeNames, () => [] as Obj[]);
  for (const type of typeNames) {
    mutationsInfo.mutations[type] = mutationsInfo.mutations[type] || [];
    for (const { id, data, prev } of mutations[type]) {
      if (data) {
        const time = new Date();

        const combinedData = { ...prev, ...data };
        const formulae = {};
        for (const f of Object.keys(types[type].fields)) {
          const field = types[type].fields[f];
          if (fieldIs.scalar(field) && typeof field.formula === 'function') {
            formulae[f] = await field.formula(
              combinedData,
              connectors[type].query,
            );
          }
        }

        const fullData = {
          ...!prev ? { createdat: time } : {},
          modifiedat: time,
          ...data,
          ...formulae,
        };

        if (prev) {
          console.log(
            `kalambo-mutate-update, ${type}:${id}, ` +
              `old: ${JSON.stringify(prev)}, new: ${JSON.stringify(fullData)}`,
          );
          await connectors[type].update(id, fullData);
        } else {
          console.log(
            `kalambo-mutate-insert, ${type}:${id}, new: ${JSON.stringify(
              fullData,
            )}`,
          );
          await connectors[type].insert(id, fullData);
        }
        mutationsInfo.mutations[type].push({ id, data: fullData, prev });
        results[type].push({ id, ...prev, ...fullData });
      } else {
        console.log(
          `kalambo-mutate-delete, ${type}:${id}, old: ${JSON.stringify(prev)}`,
        );
        await connectors[type].delete(id);
        mutationsInfo.mutations[type].push({ id, data, prev });
        results[type].push({ id });
      }
    }
  }

  return results;
}
