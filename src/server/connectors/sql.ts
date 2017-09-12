import * as Sequelize from 'sequelize';

import { keysToObject, Obj, undefOr } from '../../core';

import { Connector, DbField } from '../typings';

const scalarTypes = {
  boolean: Sequelize.BOOLEAN,
  int: Sequelize.INTEGER,
  float: Sequelize.FLOAT,
  string: Sequelize.TEXT,
  date: Sequelize.DATE,
  file: Sequelize.TEXT,
  json: Sequelize.JSON,
};
const sqlScalars = {
  boolean: 'BOOLEAN',
  int: 'INTEGER',
  float: 'FLOAT',
  string: 'TEXT',
  date: 'TIMESTAMPTZ',
  file: 'TEXT',
  json: 'JSON',
};

export default {
  type(
    sequelize: Sequelize.Sequelize,
    tableName: string,
    newId: () => string,
    fieldsTypes: Obj<DbField>,
  ): Connector {
    const model = sequelize.define(
      tableName,
      {
        ...keysToObject(Object.keys(fieldsTypes), f => ({
          type: fieldsTypes[f].isList
            ? Sequelize.ARRAY(scalarTypes[fieldsTypes[f].scalar])
            : scalarTypes[fieldsTypes[f].scalar],
        })),
        id: { type: Sequelize.TEXT, primaryKey: true },
      },
      { timestamps: false, freezeTableName: true },
    );

    return {
      async sync() {
        await model.sync();
      },
      newId,

      async query({ filter = {}, sort = [], start = 0, end, fields }) {
        if (start === end) return [];

        return await model.findAll({
          where: filter,
          order: sort.map(([field, dir]) => [
            fieldsTypes[field].scalar === 'string' && !fieldsTypes[field].isList
              ? sequelize.fn('lower', sequelize.col(field)) as any
              : field,
            dir,
          ]),
          offset: start,
          limit: undefOr(end, end! - start),
          attributes: fields,
        });
      },

      async findById(id) {
        return model.findById(id, { raw: true });
      },
      async findByIds(ids) {
        return model.findAll({ where: { id: { $in: ids } }, raw: true });
      },

      async insert(id, data) {
        await model.create({ id, ...data }, { raw: true });
      },
      async update(id, data) {
        await model.update(data, { where: { id } });
      },
      async delete(id) {
        await model.destroy({ where: { id } });
      },

      async dump() {
        return await model.findAll({ raw: true });
      },
      async restore(data) {
        await model.destroy();
        await model.bulkCreate(data);
      },
    };
  },

  alter(sequelize: Sequelize.Sequelize, owner?: string) {
    return async (type, field, info) => {
      if (field === undefined) {
        await sequelize.query(`
          CREATE TABLE "${type}"(
            "id"            TEXT  PRIMARY KEY,
            "createdat"     TIMESTAMPTZ,
            "modifiedat"    TIMESTAMPTZ
          );
        `);
        if (owner) {
          await sequelize.query(`
            ALTER TABLE "${type}" OWNER TO "${owner}";
          `);
        }
      } else if (field === null) {
        await sequelize.query(`
          DROP TABLE "${type}";
        `);
      } else if (info) {
        await sequelize.query(`
          ALTER TABLE "${type}"
          ADD COLUMN "${field}"
          ${sqlScalars[info.scalar]}${info.isList ? '[]' : ''};
        `);
      } else {
        await sequelize.query(`
          ALTER TABLE "${type}"
          DROP COLUMN "${field}";
        `);
      }
    };
  },
};
