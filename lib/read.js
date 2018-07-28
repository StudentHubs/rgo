"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var keys_to_object_1 = require("keys-to-object");
var standardize_1 = require("./standardize");
var typings_1 = require("./typings");
var utils_1 = require("./utils");
var walker_1 = require("./walker");
var reader = walker_1.default(function (layer, relations, _a, rootRecords) {
    var schema = _a.schema, data = _a.data, getStart = _a.getStart;
    var root = layer.root, field = layer.field, args = layer.args, fields = layer.fields;
    var structuralFields = Array.from(new Set(__spread((args.filter ? utils_1.getFilterFields(args.filter) : []), (args.sort ? args.sort.map(function (s) { return s.replace('-', ''); }) : []))));
    var filter = function (id) {
        return utils_1.runFilter(args.filter, id, data[field.type][id]);
    };
    var compare = utils_1.createCompare(function (id, key) { return (key === 'id' ? id : data[field.type][id][key]); }, args.sort);
    var rootIds = Object.keys(rootRecords);
    var rootRecordIds = {};
    var records = {};
    var getValue = function (id, f) {
        if (f === 'id')
            return id;
        var v = utils_1.noUndef(utils_1.get(data, [field.type, id, f]));
        if (v !== null)
            return v;
        var s = schema[field.type][f];
        return typings_1.fieldIs.foreignRelation(s) || s.isList ? [] : null;
    };
    var getRecord = function (id) {
        if (!id)
            return null;
        if (records[id])
            return records[id];
        return (records[id] = keys_to_object_1.default(fields, function (f) { return getValue(id, f); }));
    };
    var allIds = Object.keys(data[field.type] || {});
    var filteredIdsObj = keys_to_object_1.default(allIds, filter);
    var filteredIds = allIds.filter(function (id) { return filteredIdsObj[id]; }).sort(compare);
    var initRootRecords = function (rootId) {
        if (!root.type) {
            rootRecordIds[rootId] = filteredIds;
        }
        else {
            if (typings_1.fieldIs.relation(field)) {
                if (field.isList) {
                    var value_1 = data[root.type][rootId][root.field];
                    if (!args.sort) {
                        rootRecordIds[rootId] = (value_1 || []).map(function (id) { return (filteredIds.includes(id) ? id : null); });
                    }
                    else {
                        rootRecordIds[rootId] = filteredIds.filter(function (id) {
                            return (value_1 || []).includes(id);
                        });
                    }
                }
                else {
                    var value = data[root.type][rootId][root.field];
                    rootRecordIds[rootId] =
                        value && filteredIds.includes(value) ? [value] : [];
                }
            }
            else {
                rootRecordIds[rootId] = filteredIds.filter(function (id) {
                    var v = data[field.type][id][field.foreign];
                    return Array.isArray(v)
                        ? v.includes(rootId)
                        : v === rootId;
                });
            }
        }
        if (rootRecordIds[rootId].length === 0) {
            rootRecords[rootId][root.alias || root.field] =
                typings_1.fieldIs.foreignRelation(field) || field.isList ? [] : null;
        }
        else if (typings_1.fieldIs.relation(field) && field.isList && !args.sort) {
            rootRecords[rootId][root.alias || root.field] = rootRecordIds[rootId].map(getRecord);
        }
        else if (typings_1.fieldIs.foreignRelation(field) || field.isList) {
            var start = getStart(layer, rootId, rootRecordIds[rootId]);
            rootRecords[rootId][root.alias || root.field] = rootRecordIds[rootId]
                .slice(start, utils_1.undefOr(args.end, start - (args.start || 0) + args.end))
                .map(getRecord);
        }
        else {
            rootRecords[rootId][root.alias || root.field] = getRecord(rootRecordIds[rootId][0] || null);
        }
    };
    rootIds.forEach(initRootRecords);
    var updaters = relations.map(function (r) { return r.walk(records); });
    return function (changes) {
        var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
        if (Object.keys(changes).length === 0)
            return 0;
        var relationsChange = Math.max.apply(Math, __spread(updaters.map(function (updater) { return updater(changes); }), [0]));
        if (relationsChange === 2)
            return 2;
        try {
            for (var _f = __values(Object.keys(changes[field.type] || {})), _g = _f.next(); !_g.done; _g = _f.next()) {
                var id = _g.value;
                try {
                    for (var structuralFields_1 = __values(structuralFields), structuralFields_1_1 = structuralFields_1.next(); !structuralFields_1_1.done; structuralFields_1_1 = structuralFields_1.next()) {
                        var f = structuralFields_1_1.value;
                        if ((changes[field.type][id] || {})[f])
                            return 2;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (structuralFields_1_1 && !structuralFields_1_1.done && (_b = structuralFields_1.return)) _b.call(structuralFields_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (typings_1.fieldIs.foreignRelation(field) &&
                    (changes[field.type][id] || {})[field.foreign]) {
                    return 2;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (root.type) {
            try {
                for (var _h = __values(Object.keys(changes[root.type] || {})), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var id = _j.value;
                    if (rootRecords[id]) {
                        if ((changes[root.type][id] || {})[root.field])
                            return 2;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        var changed = false;
        try {
            for (var _k = __values(Object.keys(changes[field.type] || {})), _l = _k.next(); !_l.done; _l = _k.next()) {
                var id = _l.value;
                if (records[id]) {
                    try {
                        for (var _m = __values(Object.keys(changes[field.type][id] || {})), _o = _m.next(); !_o.done; _o = _m.next()) {
                            var f = _o.value;
                            if (fields.includes(f)) {
                                var prev = records[id][f];
                                records[id][f] = getValue(id, f);
                                if (!utils_1.isEqual(records[id][f], prev))
                                    changed = true;
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_o && !_o.done && (_e = _m.return)) _e.call(_m);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_l && !_l.done && (_d = _k.return)) _d.call(_k);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return Math.max(relationsChange, changed ? 1 : 0);
    };
});
function read(queries, schema, data, starts) {
    var result = {};
    var getStart = typeof starts === 'function'
        ? starts
        : function (_a, rootId, recordIds) {
            var args = _a.args, path = _a.path, key = _a.key;
            var fieldPath = __spread(path, [key]).join('_');
            return ((starts[fieldPath] &&
                recordIds.indexOf(starts[fieldPath][rootId])) ||
                args.start ||
                0);
        };
    var updaters = reader(standardize_1.standardizeQueries(queries, schema), schema, { schema: schema, data: data, getStart: getStart }, { '': result });
    return { result: result, updaters: updaters };
}
exports.default = read;
// const sliceInfo = (rootId: string, index: number) => {
//   const end = args.show !== null ? sliceStarts[rootId] + args.show : null;
//   return {
//     before: index <= sliceStarts[rootId],
//     within: index > sliceStarts[rootId] && (end === null || index < end),
//     indexInSlice: index - sliceStarts[rootId],
//     last: end && {
//       index: end,
//       id: rootRecordIds[rootId][sliceStarts[rootId] + end] as string,
//     },
//   };
// };
// const stop =
//   onChanges &&
//   onChanges(({ changes, rootChanges }) => {
//     newRecords = [];
//     const maybeRemoved: Obj<true> = {};
//     const filteredAdded: string[] = [];
//     const filteredRemoved: string[] = [];
//     const foreignChanged: string[] = [];
//     for (const id of Object.keys(changes[field.type] || {})) {
//       filteredIdsObj[id] = filteredIdsObj[id] || false;
//       const included = filter(id);
//       if (included !== filteredIdsObj[id]) {
//         if (included) {
//           filteredAdded.push(id);
//           const index = locationOf(id, filteredIds, compare);
//           filteredIds.splice(index, 0, id);
//           console.log(filteredIds);
//           if (!root.type) {
//             const info = sliceInfo('', index);
//             if ((info.before || info.within) && info.last) {
//               filteredRemoved.push(info.last.id);
//               rootRecords[''][root.field].pop();
//               delete records[info.last.id];
//             }
//             if (info.before) {
//               rootRecords[''][root.field].unshift(
//                 getRecord(filteredIds[sliceStarts['']]),
//               );
//             } else if (info.within) {
//               rootRecords[''][root.field].splice(
//                 info.indexInSlice,
//                 0,
//                 getRecord(id),
//               );
//             }
//           }
//         } else {
//           const index = filteredIds.indexOf(id);
//           filteredIds.splice(index, 1);
//           if (records[id]) {
//             filteredRemoved.push(id);
//             delete records[id];
//           }
//           if (!root.type) {
//             const info = sliceInfo('', index);
//             if ((info.before || info.within) && info.last) {
//               rootRecords[''][root.field].push(getRecord(info.last.id));
//             }
//             if (info.before) {
//               rootRecords[''][root.field].shift();
//             } else if (info.within) {
//               rootRecords[''][root.field].splice(info.indexInSlice, 1);
//             }
//           }
//         }
//         filteredIdsObj[id] = !filteredIdsObj[id];
//       } else if (
//         included &&
//         fieldIs.foreignRelation(field) &&
//         ((changes[field.type] && {})[id] || {})[field.foreign]
//       ) {
//         foreignChanged.push(id);
//       }
//     }
//     for (let i = rootIds.length - 1; i >= 0; i--) {
//       const rootId = rootIds[i];
//       if (rootChanges.removed.includes(rootId)) {
//         rootRecordIds[rootId].forEach(id => id && (maybeRemoved[id] = true));
//         rootIds.splice(i, 1);
//         delete rootRecordIds[rootId];
//         delete sliceStarts[rootId];
//       } else if (
//         root.type &&
//         ((changes[root.type] && {})[rootId] || {})[root.field]
//       ) {
//         rootRecordIds[rootId].forEach(id => id && (maybeRemoved[id] = true));
//         initRootRecords(rootId);
//       } else {
//         if (root.type) {
//           const addRecord = (id: string) => {
//             const index = locationOf(id, rootRecordIds[rootId], compare);
//             const info = sliceInfo(rootId, index);
//             if (info.before || info.within) {
//               if (info.last) {
//                 maybeRemoved[info.last.id] = true;
//                 rootRecordIds[rootId].splice(info.last.index, 1);
//                 rootRecords[rootId][root.field].pop();
//               }
//               rootRecordIds[rootId].splice(index, 0, id);
//             }
//             if (info.before) {
//               rootRecords[rootId][root.field].unshift(
//                 getRecord(filteredIds[sliceStarts['']]),
//               );
//             } else if (info.within) {
//               rootRecords[rootId][root.field].splice(
//                 info.indexInSlice,
//                 0,
//                 getRecord(id),
//               );
//             }
//           };
//           const removeRecord = (id: string) => {
//             const index = rootRecordIds[rootId].indexOf(id);
//             if (index !== -1) {
//               const info = sliceInfo(rootId, index);
//               if (info.before || info.within) {
//                 if (info.last) {
//                   rootRecordIds[rootId].splice(
//                     info.last.index,
//                     0,
//                     info.last.id,
//                   );
//                   rootRecords[rootId][root.field].push(
//                     getRecord(info.last.id),
//                   );
//                 }
//                 rootRecordIds[rootId].splice(index, 1);
//               }
//               if (info.before) {
//                 rootRecords[rootId][root.field].shift();
//               } else if (info.within) {
//                 rootRecords[rootId][root.field].splice(info.indexInSlice, 1);
//               }
//             }
//           };
//           const value = data[root.type!][rootId]![root.field];
//           filteredAdded.forEach(id => {
//             if (fieldIs.relation(field)) {
//               if (field.isList) {
//                 if (args.unsorted) {
//                   const index = ((value || []) as string[]).indexOf(id);
//                   if (index !== -1) {
//                     rootRecordIds[rootId][index] = id;
//                     const i = index - sliceStarts[rootId];
//                     if (i >= 0 && (args.show === null || i < args.show)) {
//                       rootRecords[rootId][root.field][i] = getRecord(id);
//                     }
//                   }
//                 } else {
//                   if ((value || []).includes(id)) addRecord(id);
//                 }
//               } else {
//                 if (value === id) {
//                   rootRecordIds[rootId] = [id];
//                   rootRecords[rootId][root.field] = getRecord(id);
//                 }
//               }
//             } else {
//               if (
//                 (value || []).includes(id) ||
//                 isOrIncludes(
//                   data[root.type!][id]![field.foreign],
//                   rootId,
//                 )
//               ) {
//                 addRecord(id);
//               }
//             }
//           });
//           filteredRemoved.forEach(id => {
//             if (fieldIs.relation(field)) {
//               if (field.isList) {
//                 removeRecord(id);
//               } else {
//                 if (rootRecordIds[rootId][0] === id) {
//                   rootRecordIds[rootId] = [];
//                   rootRecords[rootId][root.field] = null;
//                 }
//               }
//             } else {
//               removeRecord(id);
//             }
//           });
//           if (fieldIs.foreignRelation(field)) {
//             foreignChanged.forEach(id => {
//               const included =
//                 (value || []).includes(id) ||
//                 isOrIncludes(
//                   data[root.type!][id]![field.foreign],
//                   rootId,
//                 );
//               const prevIndex = rootRecordIds[rootId].indexOf(id);
//               if (included && prevIndex === -1) {
//                 addRecord(id);
//               }
//               if (!included && prevIndex !== -1) {
//                 maybeRemoved[id] = true;
//                 removeRecord(id);
//               }
//             });
//           }
//         }
//       }
//     }
//     for (const rootId of rootChanges.added) {
//       rootIds.push(rootId);
//       initRootRecords(rootId);
//     }
//     const extraRemoved = Object.keys(maybeRemoved).filter(id =>
//       rootIds.every(rootId => !rootRecordIds[rootId].includes(id)),
//     );
//     extraRemoved.forEach(id => delete records[id]);
//     for (const id of Object.keys(changes[field.type] || {})) {
//       if (records[id] && !newRecords.includes(id)) {
//         for (const f of Object.keys(changes[field.type][id] || {})) {
//           if (scalarFields[f]) {
//             const value = ((data[field.type] || {})[id] || {})[f];
//             if (value === undefined) delete records[id][f];
//             else records[id][f] = value;
//           }
//         }
//       }
//     }
//     changesEmitter.emit({
//       changes,
//       rootChanges: {
//         added: newRecords,
//         removed: [...filteredRemoved, ...extraRemoved],
//       },
//     });
//   });
// return () => {
//   stopRelations.forEach(s => s());
//   stop && stop();
// };
