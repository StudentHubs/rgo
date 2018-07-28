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
var enhancers = require("./enhancers");
exports.enhancers = enhancers;
var resolvers = require("./resolvers");
exports.resolvers = resolvers;
var typings_1 = require("./typings");
exports.fieldIs = typings_1.fieldIs;
var utils_1 = require("./utils");
exports.compose = utils_1.compose;
exports.getId = utils_1.getId;
var throttle = require("lodash.throttle");
var keys_to_object_1 = require("keys-to-object");
var getRequests_1 = require("./getRequests");
var read_1 = require("./read");
var setState_1 = require("./setState");
var standardize_1 = require("./standardize");
var typings_2 = require("./typings");
var utils_2 = require("./utils");
var walker_1 = require("./walker");
var addQueries = walker_1.default(function (_a, relations, _b, info) {
    var root = _a.root, field = _a.field, args = _a.args, fields = _a.fields, key = _a.key;
    info.relations[key] = info.relations[key] || {
        name: root.field,
        field: field,
        args: args,
        fields: {},
        relations: {},
        complete: {
            data: { fields: [], slice: { start: 0, end: 0 }, ids: [] },
            firstIds: {},
        },
        active: {},
    };
    fields.forEach(function (f) {
        return (info.relations[key].fields[f] =
            (info.relations[key].fields[f] || 0) + 1);
    });
    relations.forEach(function (r) { return r.walk(info.relations[key]); });
});
var removeQueries = walker_1.default(function (_a, relations, _b, info) {
    var fields = _a.fields, key = _a.key;
    relations.forEach(function (r) { return r.walk(info.relations[key]); });
    fields.forEach(function (f) {
        info.relations[key].fields[f]--;
        if (info.relations[key].fields[f] === 0) {
            delete info.relations[key].fields[f];
            info.relations[key].complete.data.fields.splice(info.relations[key].complete.data.fields.indexOf(f), 1);
        }
    });
    if (Object.keys(info.relations[key].fields).length === 0 &&
        Object.keys(info.relations[key].relations).length === 0) {
        delete info.relations[key];
    }
});
var queriesChanging = walker_1.default(function (_a, relations, _b, info) {
    var fields = _a.fields, key = _a.key;
    var changing = Object.keys(info.relations[key].active || {}).reduce(function (res, k) { return __spread(res, info.relations[key].active[k]); }, info.relations[key].pending ? info.relations[key].pending.changing : []);
    return (fields.some(function (f) { return changing.includes(f); }) ||
        relations.some(function (r) { return r.walk(info.relations[key]); }));
});
function rgo(resolver, log) {
    var _this = this;
    var schemaResolve;
    var schemaPromise = new Promise(function (resolve) { return (schemaResolve = resolve); });
    var state = { server: {}, client: {}, combined: {}, diff: {} };
    var localCounters = {};
    var fetchInfo = {
        name: '',
        field: { type: '' },
        args: {},
        fields: {},
        relations: {},
        complete: {
            data: { fields: [], slice: { start: 0, end: 0 }, ids: [] },
            firstIds: {},
        },
        active: {},
    };
    var listeners = [];
    var queries;
    var commits = [];
    var getQueries = function (changes) {
        queries = Object.keys(fetchInfo.relations)
            .reduce(function (res, k) {
            var _a = getRequests_1.default(state, fetchInfo.relations[k]), idQueries = _a.idQueries, newFields = _a.newFields, trace = _a.trace;
            return __spread(res, idQueries, [newFields, trace]);
        }, [])
            .filter(function (s) { return s; });
        if (queries.length > 0) {
            listeners.forEach(function (l) { return l(changes); });
            process();
            return true;
        }
        return false;
    };
    var set = function (_a) {
        var server = _a.server, client = _a.client;
        var changes = {};
        if (server)
            setState_1.default('server', state, server, rgo.schema, changes);
        if (client)
            setState_1.default('client', state, client, rgo.schema, changes);
        if (log && Object.keys(changes).length > 0)
            console.log(utils_2.clone(state));
        if (!getQueries(changes))
            listeners.forEach(function (l) { return l(changes); });
    };
    var fetchCounter = 0;
    var flushFetch = 0;
    var process = throttle(function () { return __awaiter(_this, void 0, void 0, function () {
        var fetchIndex, request, processCommits, setFetched_1, response_1, updateInfo_1, data_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchIndex = ++fetchCounter;
                    request = {
                        commits: commits.map(function (c) {
                            return keys_to_object_1.default(c.values.filter(function (_a) {
                                var key = _a.key, value = _a.value;
                                return !utils_2.isEqual(value, utils_2.get(state.server, key));
                            }), function (_a) {
                                var value = _a.value;
                                return value;
                            }, function (_a) {
                                var key = _a.key;
                                return key;
                            });
                        }),
                        queries: queries,
                        context: {},
                    };
                    processCommits = commits;
                    commits = [];
                    if (!(request.commits.some(function (c) { return Object.keys(c).length > 0; }) ||
                        request.queries.length > 0)) return [3 /*break*/, 2];
                    if (request.queries.length > 0) {
                        setFetched_1 = function (info) {
                            if (info.pending) {
                                info.complete.data = info.pending.data;
                                info.active[fetchIndex] = info.pending.changing;
                                delete info.pending;
                            }
                            Object.keys(info.relations).forEach(function (k) {
                                if (info.relations[k].pending)
                                    setFetched_1(info.relations[k]);
                            });
                        };
                        setFetched_1(fetchInfo);
                    }
                    return [4 /*yield*/, resolver(request)];
                case 1:
                    response_1 = _a.sent();
                    if (request.queries.length > 0) {
                        updateInfo_1 = function (info, path) {
                            if (info.active[fetchIndex]) {
                                info.complete.firstIds =
                                    response_1.firstIds[path] || info.complete.firstIds;
                                delete info.active[fetchIndex];
                            }
                            Object.keys(info.relations).forEach(function (k) {
                                return updateInfo_1(info.relations[k], path ? path + "_" + k : k);
                            });
                        };
                        updateInfo_1(fetchInfo, '');
                    }
                    data_1 = { server: {}, client: {} };
                    utils_2.mapData(state.client, function (record, type, id) {
                        var e_1, _a;
                        if (record) {
                            var _loop_1 = function (f) {
                                var field = rgo.schema[type][f];
                                if (typings_2.fieldIs.relation(field) && response_1.newIds[field.type]) {
                                    var mapped = utils_2.mapArray(record[f], function (id) { return utils_2.getId(id, response_1.newIds[field.type]) || id; });
                                    if (!utils_2.isEqual(mapped, record[f])) {
                                        data_1.client[type] = data_1.client[type] || {};
                                        data_1.client[type][id] = data_1.client[type][id] || {};
                                        data_1.client[type][id][f] = mapped;
                                    }
                                }
                            };
                            try {
                                for (var _b = __values(Object.keys(record)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var f = _c.value;
                                    _loop_1(f);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                    });
                    processCommits.forEach(function (_a, i) {
                        var values = _a.values;
                        if (!response_1.errors[i]) {
                            keys_to_object_1.default(values, undefined, function (_a) {
                                var key = _a.key;
                                return key;
                            }, data_1.client);
                            if (fetchIndex > flushFetch) {
                                keys_to_object_1.default(values, function (_a) {
                                    var key = _a.key, value = _a.value;
                                    if (key.length === 2)
                                        return value;
                                    var field = rgo.schema[key[0]][key[2]];
                                    if (typings_2.fieldIs.relation(field) && response_1.newIds[key[0]]) {
                                        return utils_2.mapArray(value, function (v) { return utils_2.getId(v, response_1.newIds[key[0]]) || v; });
                                    }
                                    return value;
                                }, function (_a) {
                                    var key = _a.key;
                                    var k = __spread(key);
                                    k[1] = utils_2.getId(k[1], response_1.newIds[k[0]]) || k[1];
                                    return k;
                                }, data_1.server);
                            }
                        }
                    });
                    if (fetchIndex > flushFetch) {
                        data_1.server = utils_2.merge(data_1.server, response_1.data, 2);
                    }
                    set(data_1);
                    processCommits.forEach(function (_a, i) {
                        var resolve = _a.resolve;
                        return resolve(response_1.errors[i] || response_1.newIds);
                    });
                    return [3 /*break*/, 3];
                case 2:
                    processCommits.forEach(function (_a) {
                        var resolve = _a.resolve;
                        return resolve({});
                    });
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, 50, { leading: false });
    var flush = function () {
        flushFetch = fetchCounter;
        var flushInfo = function (info) {
            info.complete = {
                data: { fields: [], slice: { start: 0, end: 0 }, ids: [] },
                firstIds: {},
            };
            info.active = {};
            delete info.pending;
            Object.keys(info.relations).forEach(function (k) { return flushInfo(info.relations[k]); });
        };
        flushInfo(fetchInfo);
        set({ server: utils_2.mapData(state.server, function () { return null; }) });
    };
    var getStart = function (_a, rootId, recordIds) {
        var root = _a.root, field = _a.field, args = _a.args, path = _a.path, key = _a.key;
        var e_2, _b;
        var info = __spread(path, [key]).reduce(function (res, k) { return res.relations[k]; }, fetchInfo);
        if (!info || !info.complete.firstIds[rootId]) {
            return args.start || 0;
        }
        var compareRecords = utils_2.createCompare(function (record, key) { return record[key]; }, args.sort);
        var findRecordIndex = function (record) {
            return utils_2.locationOf('', recordIds, utils_2.createCompare(function (id, key) {
                return key === 'id'
                    ? id || record.id
                    : id
                        ? state.combined[field.type][id][key]
                        : record[key];
            }, args.sort));
        };
        var queryFirst = __assign({ id: info.complete.firstIds[rootId] }, state.server[field.type][info.complete.firstIds[rootId]]);
        var queryStart = findRecordIndex(queryFirst);
        var start = queryStart;
        try {
            for (var _c = __values(Object.keys(state.diff[field.type] || {})), _d = _c.next(); !_d.done; _d = _c.next()) {
                var id = _d.value;
                if (state.diff[field.type][id] === 1) {
                    var localIndex = recordIds.indexOf(id);
                    if (localIndex !== -1 && localIndex < queryStart) {
                        start -= 1;
                    }
                }
                if (state.diff[field.type][id] === 0) {
                    if (state.server[field.type][id] &&
                        utils_2.runFilter(args.filter, id, state.server[field.type][id]) &&
                        compareRecords(state.server[field.type][id], queryFirst) === -1) {
                        start += 1;
                    }
                    var localIndex = recordIds.indexOf(id);
                    if (localIndex !== -1 && localIndex < queryStart) {
                        start -= 1;
                    }
                }
                if (state.diff[field.type][id] === -1) {
                    var serverRecord = (state.server[field.type] || {})[id];
                    if (serverRecord &&
                        (!root.type ||
                            typings_2.fieldIs.foreignRelation(field) ||
                            (state.combined[root.type][rootId][root.field] ||
                                []).includes(id)) &&
                        utils_2.runFilter(args.filter, id, serverRecord)) {
                        if (compareRecords(__assign({ id: id }, serverRecord), queryFirst) === -1) {
                            start += 1;
                        }
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return start;
    };
    var rgo = {
        schema: null,
        flush: flush,
        create: function (type) {
            localCounters[type] = localCounters[type] || 0;
            var id = "" + utils_2.newIdPrefix + localCounters[type]++;
            schemaPromise.then(function () {
                var _a, _b;
                return set({ client: (_a = {}, _a[type] = (_b = {}, _b[id] = {}, _b), _a) });
            });
            return id;
        },
        query: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 0)
                return schemaPromise;
            var onLoad = typeof args[args.length - 1] === 'function'
                ? args[args.length - 1]
                : undefined;
            var baseQueries = onLoad ? args.slice(0, -1) : args;
            return utils_2.promisifyEmitter(function (innerListener) {
                if (baseQueries.length === 0) {
                    innerListener({});
                    return function () { };
                }
                var running = true;
                var first = true;
                if (!rgo.schema) {
                    first = false;
                    innerListener(null);
                }
                var serverQueries;
                var listener;
                schemaPromise.then(function () {
                    if (running) {
                        var allQueries_1 = standardize_1.standardizeQueries(baseQueries, rgo.schema);
                        serverQueries = allQueries_1.filter(function (query) {
                            return !(query.filter &&
                                query.filter[0] === 'id' &&
                                (!query.filter[query.filter.length - 1] ||
                                    utils_2.isNewId(query.filter[query.filter.length - 1])));
                        });
                        addQueries(serverQueries, rgo.schema, {}, fetchInfo);
                        var current_1 = null;
                        listener = function (changes) {
                            if (queriesChanging(serverQueries, rgo.schema, {}, fetchInfo).some(function (c) { return c; })) {
                                if (first || current_1) {
                                    first = false;
                                    current_1 = null;
                                    innerListener(null);
                                }
                            }
                            else {
                                var updateType = current_1 && current_1.updaters && changes
                                    ? Math.max.apply(Math, __spread(current_1.updaters.map(function (u) { return u(changes); }))) : 2;
                                if (updateType === 2) {
                                    current_1 = read_1.default(allQueries_1, rgo.schema, state.combined, getStart);
                                }
                                if (updateType)
                                    innerListener(current_1.result);
                            }
                        };
                        listeners.push(listener);
                        if (!getQueries())
                            listener();
                    }
                });
                return function () {
                    running = false;
                    var index = listeners.indexOf(listener);
                    if (index !== -1) {
                        listeners.splice(index, 1);
                        setTimeout(function () {
                            return removeQueries(serverQueries, rgo.schema, {}, fetchInfo);
                        });
                    }
                };
            }, onLoad);
        },
        set: function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            if (values.length !== 0) {
                var doSet = function () {
                    set({
                        client: keys_to_object_1.default(values, function (_a) {
                            var value = _a.value;
                            return value;
                        }, function (_a) {
                            var key = _a.key;
                            return key;
                        }),
                    });
                };
                rgo.schema ? doSet() : schemaPromise.then(doSet);
            }
        },
        commit: function () {
            var keys = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keys[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, schemaPromise];
                        case 1:
                            _a.sent();
                            if (keys.length === 0)
                                return [2 /*return*/, {}];
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    commits.push({
                                        values: keys.map(function (key) { return ({
                                            key: key,
                                            value: key.length === 2 ? null : utils_2.noUndef(utils_2.get(state.combined, key)),
                                        }); }),
                                        resolve: resolve,
                                    });
                                    process();
                                })];
                        case 2:
                            response = _a.sent();
                            if (typeof response === 'string')
                                throw new Error(response);
                            return [2 /*return*/, response];
                    }
                });
            });
        },
    };
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var baseSchema;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolver()];
                case 1:
                    baseSchema = _a.sent();
                    rgo.schema = keys_to_object_1.default(Object.keys(baseSchema), function (type) {
                        return keys_to_object_1.default(Object.keys(baseSchema[type]), function (f) { return (__assign({ meta: {} }, baseSchema[type][f])); });
                    });
                    schemaResolve({});
                    return [2 /*return*/];
            }
        });
    }); })();
    return rgo;
}
exports.default = rgo;
