"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var keys_to_object_1 = require("keys-to-object");
var typings_1 = require("../typings");
var utils_1 = require("../utils");
var walker_1 = require("../walker");
var runner = walker_1.default(function (_a, relations, _b, rootRecords, records, querying, noExtraFields) {
    var root = _a.root, field = _a.field, args = _a.args, fields = _a.fields, _c = _a.extra, extra = _c === void 0 ? { start: 0, end: 0 } : _c, trace = _a.trace, path = _a.path, key = _a.key;
    var db = _b.db, data = _b.data, firstIds = _b.firstIds;
    return __awaiter(_this, void 0, void 0, function () {
        var idFields, sort, slice, relationFields, allFields, results_1, doSingleQuery_1, rootField_1, relField_1, resultsArray_1, newRecords_1, fieldPath_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    idFields = Array.from(new Set(__spread(['id'], fields)));
                    sort = args.sort && args.sort.filter(function (s) { return idFields.includes(s.replace('-', '')); });
                    slice = {
                        start: (args.start || 0) - extra.start,
                        end: utils_1.undefOr(args.end, args.end + extra.end),
                    };
                    relationFields = relations.filter(function (r) { return !r.foreign; }).map(function (r) { return r.name; });
                    allFields = Array.from(new Set(__spread(idFields, relationFields, (!noExtraFields
                        ? (args.sort || []).map(function (s) { return s.replace('-', ''); })
                        : []))));
                    if (!querying) return [3 /*break*/, 7];
                    records[key] = records[key] || {};
                    results_1 = {};
                    doSingleQuery_1 = function (rootId, fields, filter) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    records[key][rootId] = records[key][rootId] || {};
                                    return [4 /*yield*/, db.find(field.type, __assign({}, args, { sort: sort, start: 0, end: slice.end, filter: args.filter && filter
                                                ? ['AND', args.filter, filter]
                                                : args.filter || filter }), fields)];
                                case 1:
                                    (_a.sent()).forEach(function (idRecord) {
                                        var id = idRecord.id, record = __rest(idRecord, ["id"]);
                                        results_1[id] = idRecord;
                                        utils_1.mergeRecord(records[key][rootId], id, record);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    if (!!root.type) return [3 /*break*/, 2];
                    return [4 /*yield*/, doSingleQuery_1('', allFields)];
                case 1:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 2:
                    rootField_1 = typings_1.fieldIs.relation(field) ? root.field : 'id';
                    relField_1 = typings_1.fieldIs.relation(field) ? 'id' : field.foreign;
                    if (!(!noExtraFields || allFields.includes(relField_1))) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.all(rootRecords.map(function (rootRecord) {
                            return rootRecord[rootField_1]
                                ? doSingleQuery_1(rootRecord.id, allFields, [
                                    relField_1,
                                    'in',
                                    [].concat(rootRecord[rootField_1]),
                                ])
                                : Promise.resolve();
                        }))];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    resultsArray_1 = Object.keys(results_1).map(function (id) { return results_1[id]; });
                    newRecords_1 = {};
                    return [4 /*yield*/, Promise.all(relations.map(function (r) {
                            return r.walk(resultsArray_1, newRecords_1, true, noExtraFields);
                        }))];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, Promise.all(relations.map(function (r) { return r.walk(resultsArray_1, newRecords_1, false); }))];
                case 6:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    data[field.type] = data[field.type] || {};
                    fieldPath_1 = __spread(path, [key]).join('_');
                    firstIds[fieldPath_1] = firstIds[fieldPath_1] || {};
                    Object.keys(records[key]).forEach(function (rootId) {
                        var sorted = Object.keys(records[key][rootId]).sort(utils_1.createCompare(function (id, k) { return (k === 'id' ? id : utils_1.noUndef(records[key][rootId][id][k])); }, args.sort));
                        sorted.forEach(function (id, i) {
                            if (i >= slice.start && (slice.end === undefined || i < slice.end)) {
                                var record = keys_to_object_1.default(trace &&
                                    i >= trace.start &&
                                    (trace.end === undefined || i < trace.end)
                                    ? relationFields
                                    : allFields, function (f) { return utils_1.noUndef(records[key][rootId][id][f]); });
                                delete record.id;
                                utils_1.mergeRecord(data[field.type], id, record);
                            }
                        });
                        if (typings_1.fieldIs.foreignRelation(field) || (field.isList && args.sort)) {
                            firstIds[fieldPath_1][rootId] = sorted[args.start || 0] || null;
                        }
                    });
                    _d.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
});
var commit = function (commits, schema, db, newIds) {
    if (commits === void 0) { commits = []; }
    return __awaiter(_this, void 0, void 0, function () {
        var e_1, _a, commits_1, commits_1_1, records, e_1_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, 7, 8]);
                    commits_1 = __values(commits), commits_1_1 = commits_1.next();
                    _b.label = 1;
                case 1:
                    if (!!commits_1_1.done) return [3 /*break*/, 5];
                    records = commits_1_1.value;
                    return [4 /*yield*/, utils_1.mapDataAsync(records, function (record, type, id) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        newIds[type] = newIds[type] || {};
                                        if (!!record) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.delete(type, id)];
                                    case 1:
                                        _c.sent();
                                        return [3 /*break*/, 6];
                                    case 2:
                                        if (!utils_1.isNewId(id)) return [3 /*break*/, 4];
                                        _a = newIds[type];
                                        _b = id;
                                        return [4 /*yield*/, db.insert(type, record)];
                                    case 3:
                                        _a[_b] = _c.sent();
                                        return [3 /*break*/, 6];
                                    case 4: return [4 /*yield*/, db.update(type, id, record)];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, utils_1.mapDataAsync(records, function (r, type, id) { return __awaiter(_this, void 0, void 0, function () {
                            var e_2, _a, record, hasNewIds, _loop_1, _b, _c, f;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!r) return [3 /*break*/, 2];
                                        record = __assign({}, r);
                                        hasNewIds = false;
                                        _loop_1 = function (f) {
                                            var field = schema[type][f];
                                            if (typings_1.fieldIs.relation(field) && newIds[field.type]) {
                                                var prev = record[f];
                                                record[f] = utils_1.mapArray(record[f], function (id) {
                                                    return utils_1.getId(id, newIds[field.type]);
                                                });
                                                if (!utils_1.isEqual(record[f], prev))
                                                    hasNewIds = true;
                                            }
                                        };
                                        try {
                                            for (_b = __values(Object.keys(record)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                                f = _c.value;
                                                _loop_1(f);
                                            }
                                        }
                                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                        finally {
                                            try {
                                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                            }
                                            finally { if (e_2) throw e_2.error; }
                                        }
                                        if (!hasNewIds) return [3 /*break*/, 2];
                                        return [4 /*yield*/, db.update(type, utils_1.getId(id, newIds[type]), record)];
                                    case 1:
                                        _d.sent();
                                        _d.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    commits_1_1 = commits_1.next();
                    return [3 /*break*/, 1];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (commits_1_1 && !commits_1_1.done && (_a = commits_1.return)) _a.call(commits_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
};
function dbResolver(schema, db) {
    var _this = this;
    return (function (request) { return __awaiter(_this, void 0, void 0, function () {
        var newIds, records, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!request)
                        return [2 /*return*/, schema];
                    newIds = {};
                    return [4 /*yield*/, commit(request.commits, schema, db, newIds)];
                case 1:
                    _a.sent();
                    records = {};
                    context = { db: db, data: {}, firstIds: {} };
                    return [4 /*yield*/, Promise.all(runner(request.queries || [], schema, context, [{}], records, true, request.context && request.context.noExtraFields))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, Promise.all(runner(request.queries || [], schema, context, [{}], records, false))];
                case 3:
                    _a.sent();
                    return [2 /*return*/, {
                            data: context.data,
                            newIds: newIds,
                            errors: [],
                            firstIds: context.firstIds,
                        }];
            }
        });
    }); });
}
exports.default = dbResolver;
