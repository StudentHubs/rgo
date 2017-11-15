import {
  Field,
  fieldIs,
  ForeignRelationField,
  FullQuery,
  Obj,
  Query,
  RelationField,
} from './typings';

const standardizeQuery = (
  { filter, sort, fields, ...query }: FullQuery | Query,
  schema: Obj<Obj<Field>>,
  field?: ForeignRelationField | RelationField,
) => {
  const result: FullQuery = {
    ...query,
    filter:
      filter && !Array.isArray(filter)
        ? ['id', filter]
        : (filter as any[] | undefined),
    sort:
      sort && !Array.isArray(sort) ? [sort] : (sort as string[] | undefined),
    fields: (fields as (string | FullQuery | Query)[]).map(
      f =>
        typeof f === 'string'
          ? f
          : standardizeQuery(f, schema, schema[field ? field.type : query.name][
              f.name
            ] as ForeignRelationField | RelationField),
    ),
  };
  if (!field || fieldIs.foreignRelation(field)) {
    result.sort = result.sort || [];
  }
  if (result.sort) {
    if (!result.sort.some(s => s.replace('-', '') === 'id')) {
      result.sort.push('id');
    }
  }
  return result;
};
export const standardizeQueries = (
  queries: FullQuery[] | Query[],
  schema: Obj<Obj<Field>>,
) =>
  (queries as (FullQuery | Query)[]).map(query =>
    standardizeQuery(query, schema),
  );