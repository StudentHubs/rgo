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
var deepEqual = require("deep-equal");
var keys_to_object_1 = require("keys-to-object");
exports.newIdPrefix = 'NEW__RECORD__';
exports.isNewId = function (id) { return id.startsWith(exports.newIdPrefix); };
exports.getId = function (id, newIds) {
    return id && exports.isNewId(id) ? (newIds && newIds[id]) || null : id;
};
exports.isEqual = function (v1, v2) {
    return deepEqual(v1, v2, { strict: true });
};
exports.mapArray = function (v, map) {
    return Array.isArray(v) ? v.map(map) : map(v);
};
exports.noUndef = function (v, replacer) {
    if (replacer === void 0) { replacer = null; }
    return v === undefined ? replacer : v;
};
exports.undefOr = function (v, replacer) {
    if (replacer === void 0) { replacer = null; }
    return v === undefined ? undefined : replacer;
};
exports.get = function (obj, key) {
    return key.reduce(function (res, k) { return res && res[k]; }, obj);
};
var isObject = function (v) {
    return Object.prototype.toString.call(v) === '[object Object]';
};
exports.merge = function (target, source, depth) {
    if (depth === void 0) { depth = -1; }
    var result = {};
    if (isObject(target)) {
        Object.keys(target).forEach(function (k) { return (result[k] = exports.clone(target[k])); });
    }
    Object.keys(source).forEach(function (k) {
        if (!isObject(source[k]) || !target[k] || depth === 0) {
            result[k] = exports.clone(source[k]);
        }
        else {
            result[k] = exports.merge(target[k], source[k], depth - 1);
        }
    });
    return result;
};
exports.clone = function (obj, depth) {
    if (depth === void 0) { depth = -1; }
    return isObject(obj) ? exports.merge({}, obj, depth) : obj;
};
exports.mergeRecord = function (records, key, record) {
    records[key] = records[key] ? __assign({}, records[key], record) : record;
};
exports.mapData = function (data, map) {
    return keys_to_object_1.default(Object.keys(data), function (type) {
        return keys_to_object_1.default(Object.keys(data[type]), function (id) { return map(data[type][id], type, id); });
    });
};
exports.mapDataAsync = function (data, map) { return __awaiter(_this, void 0, void 0, function () {
    var types, _a;
    var _this = this;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                types = Object.keys(data);
                _a = keys_to_object_1.default;
                return [4 /*yield*/, Promise.all(types.map(function (type) { return __awaiter(_this, void 0, void 0, function () {
                        var ids, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    ids = Object.keys(data[type]);
                                    _a = keys_to_object_1.default;
                                    return [4 /*yield*/, Promise.all(ids.map(function (id) { return map(data[type][id], type, id); }))];
                                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent(),
                                        function (v) { return v; },
                                        function (_, i) { return ids[i]; }])];
                            }
                        });
                    }); }))];
            case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent(),
                    function (v) { return v; },
                    function (_, i) { return types[i]; }])];
        }
    });
}); };
var binarySearch = function (element, array, compareFunc, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = array.length; }
    if (array.length === 0)
        return -1;
    var pivot = (start + end) >> 1;
    var c = compareFunc(element, array[pivot]);
    if (end - start <= 1)
        return c === 1 ? pivot : pivot - 1;
    if (c === 0)
        return pivot - 1;
    return c === 1
        ? binarySearch(element, array, compareFunc, pivot, end)
        : binarySearch(element, array, compareFunc, start, pivot);
};
exports.locationOf = function (element, array, compareFunc) { return binarySearch(element, array, compareFunc) + 1; };
exports.promisifyEmitter = function (emitter, listener) {
    if (listener)
        return emitter(listener);
    return new Promise(function (resolve) {
        var unlisten = emitter(function (value) {
            if (value !== null) {
                if (unlisten)
                    unlisten();
                else
                    setTimeout(function () { return unlisten(); });
                resolve(value);
            }
        });
    });
};
var isNullUndef = function (v) { return v === null || v === undefined; };
var compareValues = function (a, b) {
    if (exports.isEqual(a, b))
        return 0;
    if (typeof a === 'string' && typeof b === 'string') {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }
    if (a < b)
        return -1;
    return 1;
};
exports.createCompare = function (get, sort) {
    if (sort === void 0) { sort = []; }
    return function (value1, value2) {
        var e_1, _a;
        try {
            for (var sort_1 = __values(sort), sort_1_1 = sort_1.next(); !sort_1_1.done; sort_1_1 = sort_1.next()) {
                var s = sort_1_1.value;
                var key = s.replace('-', '');
                var dir = s[0] === '-' ? 'desc' : 'asc';
                var v1 = get(value1, key);
                var v2 = get(value2, key);
                if (isNullUndef(v1) && !isNullUndef(v2))
                    return 1;
                if (!isNullUndef(v1) && isNullUndef(v2))
                    return -1;
                var comp = compareValues(v1, v2);
                if (comp)
                    return dir === 'asc' ? comp : -comp;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (sort_1_1 && !sort_1_1.done && (_a = sort_1.return)) _a.call(sort_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return 0;
    };
};
exports.runFilterValue = function (value, op, filterValue) {
    if (value === undefined)
        return false;
    if (op === '=') {
        return (exports.isEqual(value, filterValue) ||
            (Array.isArray(value) && value.some(function (v) { return exports.isEqual(v, filterValue); })));
    }
    if (op === '!=') {
        return (!exports.isEqual(value, filterValue) &&
            (!Array.isArray(value) || value.every(function (v) { return !exports.isEqual(v, filterValue); })));
    }
    if (op === '<')
        return value < filterValue;
    if (op === '<=')
        return value <= filterValue;
    if (op === '>')
        return value > filterValue;
    if (op === '>=')
        return value >= filterValue;
    return Array.isArray(value)
        ? value.some(function (x) { return filterValue.includes(x); })
        : filterValue.includes(value);
};
exports.runFilter = function (filter, id, record) {
    if (!record)
        return false;
    if (!filter)
        return true;
    if (['AND', 'OR'].includes(filter[0])) {
        if (filter[0] === 'AND') {
            return filter.slice(1).every(function (b) { return exports.runFilter(b, id, record); });
        }
        else if (filter[0] === 'OR') {
            return filter.slice(1).some(function (b) { return exports.runFilter(b, id, record); });
        }
    }
    return exports.runFilterValue(filter[0] === 'id' ? id : record[filter[0]], filter.length === 3 ? filter[1] : '=', filter[filter.length - 1]);
};
exports.find = function (data, _a, fields) {
    var filter = _a.filter, sort = _a.sort, _b = _a.start, start = _b === void 0 ? 0 : _b, end = _a.end;
    if (start === end)
        return [];
    var filterFunc = function (record) { return exports.runFilter(filter, record.id, record); };
    var compareFunc = exports.createCompare(function (record, key) { return record[key]; }, sort);
    return data
        .filter(filterFunc)
        .sort(compareFunc)
        .slice(start, end)
        .map(function (record) { return keys_to_object_1.default(fields, function (f) { return record[f]; }); });
};
exports.getFilterFields = function (filter) {
    if (['AND', 'OR'].includes(filter[0])) {
        return filter
            .slice(1)
            .reduce(function (res, f) { return __spread(res, exports.getFilterFields(f)); }, []);
    }
    return [filter[0]];
};
exports.compose = function () {
    var enhancers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        enhancers[_i] = arguments[_i];
    }
    if (enhancers.length === 0)
        return function (arg) { return arg; };
    if (enhancers.length === 1)
        return enhancers[0];
    return enhancers.reduce(function (a, b) { return function (request) { return a(b(request)); }; });
};
