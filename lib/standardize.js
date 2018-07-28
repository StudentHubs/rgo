"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
var typings_1 = require("./typings");
var utils_1 = require("./utils");
(function (x) { return x; });
var standardizeQuery = function (_a, schema, field) {
    var filter = _a.filter, sort = _a.sort, fields = _a.fields, query = __rest(_a, ["filter", "sort", "fields"]);
    var mappedFields = fields
        .map(function (f) {
        if (typeof f === 'string')
            return f;
        return standardizeQuery(f, schema, schema[field ? field.type : query.name][f.name]);
    })
        .filter(function (f) { return f; });
    if (mappedFields.length === 0)
        return null;
    var result = __assign({}, query, { filter: utils_1.undefOr(filter, Array.isArray(filter) ? filter : ['id', filter]), sort: sort && !Array.isArray(sort) ? [sort] : sort, fields: mappedFields });
    if (!field || typings_1.fieldIs.foreignRelation(field)) {
        result.sort = result.sort || [];
    }
    if (result.sort) {
        if (!result.sort.some(function (s) { return s.replace('-', '') === 'id'; })) {
            result.sort = __spread(result.sort, ['id']);
        }
    }
    return result;
};
exports.standardizeQueries = function (queries, schema) {
    return queries
        .map(function (query) { return standardizeQuery(query, schema); })
        .filter(function (f) { return f; });
};
