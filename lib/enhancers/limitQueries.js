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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var typings_1 = require("../typings");
var walker_1 = require("../walker");
var utils_1 = require("../utils");
var base_1 = require("./base");
var addExtraFields = function (query, schema, field) { return (__assign({}, query, { fields: Array.from(new Set(__spread(query.fields.map(function (f) {
        if (typeof f === 'string')
            return f;
        return addExtraFields(f, schema, schema[field ? field.type : query.name][f.name]);
    }), (field && typings_1.fieldIs.foreignRelation(field) ? [field.foreign] : []), (query.sort || []).map(function (s) { return s.replace('-', ''); })))) })); };
var reduceFilter = function (filter, fields) {
    if (['AND', 'OR'].includes(filter[0])) {
        var nested = filter.slice(1).map(function (f) { return reduceFilter(f, fields); });
        if (filter[0] === 'AND' && nested.some(function (f) { return !f; }))
            return false;
        return __spread([filter[0]], nested.filter(function (f) { return f; }));
    }
    if (fields.includes(filter[0]) ||
        utils_1.runFilterValue(null, filter.length === 3 ? filter[1] : '=', filter[filter.length - 1])) {
        return filter;
    }
    return false;
};
var getQueries = walker_1.default(function (_a, relations, _b) {
    var root = _a.root, field = _a.field, args = _a.args, fields = _a.fields, extra = _a.extra, trace = _a.trace, key = _a.key;
    var map = _b.map, info = _b.info;
    return __awaiter(_this, void 0, void 0, function () {
        var limits, limitMap, allFields, queries, allLimitFields, relationQueries;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, map(field.type, info)];
                case 1:
                    limits = (_c.sent()) || [{}];
                    limitMap = {};
                    (Array.isArray(limits) ? limits : [limits]).forEach(function (l) {
                        if (l.fields && !l.fields.includes('id'))
                            l.fields.push('id');
                        var key = (l.fields || []).sort().join('-');
                        limitMap[key] = limitMap[key] || [];
                        if (l.filter)
                            limitMap[key].push(l.filter);
                    });
                    allFields = Array.from(new Set(__spread(fields, relations.map(function (r) { return r.name; }))));
                    queries = Object.keys(limitMap)
                        .map(function (key) {
                        var limitFields = key ? key.split('-') : null;
                        var result = {
                            filter: limitMap[key].length > 0
                                ? limitMap[key].length === 1
                                    ? limitMap[key][0]
                                    : __spread(['OR'], limitMap[key])
                                : undefined,
                            fields: limitFields
                                ? limitFields.filter(function (f) { return allFields.includes(f); })
                                : allFields,
                        };
                        if (args.filter) {
                            result.filter = result.filter
                                ? ['AND', args.filter, result.filter]
                                : args.filter;
                        }
                        if (result.filter && limitFields) {
                            result.filter = reduceFilter(result.filter, limitFields) || undefined;
                            if (!result.filter)
                                return null;
                        }
                        return result;
                    })
                        .filter(function (q) { return q; });
                    allLimitFields = Array.from(new Set(queries.reduce(function (res, r) { return __spread(res, r.fields); }, [])));
                    relationQueries = {};
                    return [4 /*yield*/, Promise.all(relations.filter(function (r) { return allLimitFields.includes(r.name); }).map(function (r) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _a = relationQueries;
                                        _b = r.name;
                                        _c = [(relationQueries[r.name] || [])];
                                        return [4 /*yield*/, r.walk()];
                                    case 1:
                                        _a[_b] = __spread.apply(void 0, _c.concat([(_d.sent())]));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, queries.map(function (q) { return (__assign({ name: root.field, alias: root.alias }, args, { filter: q.filter, fields: q.fields.reduce(function (res, f) { return __spread(res, (fields.includes(f) ? [f] : []), (relationQueries[f] || [])); }, []), extra: extra,
                            trace: trace,
                            key: key })); })];
            }
        });
    });
});
function limitQueries(map) {
    var _this = this;
    return base_1.default(function (resolver, request, schema) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    request.context = request.context || {};
                    request.context.noExtraFields = true;
                    _a = resolver;
                    _b = [{}, request];
                    _c = {};
                    return [4 /*yield*/, Promise.all(getQueries((request.queries || []).map(function (query) { return addExtraFields(query, schema); }), schema, {
                            map: map,
                            info: { schema: schema, context: request.context },
                        }))];
                case 1: return [4 /*yield*/, _a.apply(void 0, [__assign.apply(void 0, _b.concat([(_c.queries = (_d.sent()).reduce(function (res, q) { return __spread(res, q); }, []), _c)]))])];
                case 2: return [2 /*return*/, _d.sent()];
            }
        });
    }); });
}
exports.default = limitQueries;
