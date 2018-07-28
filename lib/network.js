"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
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
var keys_to_object_1 = require("keys-to-object");
var typings_1 = require("./typings");
var walker_1 = require("./walker");
var utils_1 = require("./utils");
var encodeDate = function (v) { return v && v.getTime(); };
var decodeDate = function (v) { return v && new Date(v); };
var codeFilter = function (map, fields, filter) {
    if (!filter)
        return filter;
    if (['AND', 'OR'].includes(filter[0])) {
        return __spread([filter[0]], filter.slice(1).map(function (f) { return codeFilter(map, fields, f); }));
    }
    if (filter[0] === 'id')
        return filter;
    var field = fields[filter[0]];
    if (typings_1.fieldIs.scalar(field) && field.scalar === 'date') {
        var op = filter.length === 3 ? filter[1] : '=';
        var value = filter[filter.length - 1];
        return [
            filter[0],
            op,
            utils_1.mapArray(value, map === 'encode' ? encodeDate : decodeDate),
        ];
    }
    return filter;
};
var queryCoder = walker_1.default(function (_a, relations, _b) {
    var root = _a.root, field = _a.field, args = _a.args, fields = _a.fields, extra = _a.extra, trace = _a.trace;
    var map = _b.map, schema = _b.schema;
    return (__assign({ name: root.field, alias: root.alias }, args, { filter: args.filter && codeFilter(map, schema[field.type], args.filter), fields: __spread(fields, relations.map(function (r) { return r.walk(); })), extra: extra,
        trace: trace }));
});
var codeDate = function (map, schema, data) {
    return utils_1.mapData(data, function (record, type) {
        return record &&
            keys_to_object_1.default(Object.keys(record), function (f) {
                if (f === 'id')
                    return record[f];
                var field = schema[type][f];
                if (typings_1.fieldIs.scalar(field) && field.scalar === 'date') {
                    return utils_1.mapArray(record[f], map === 'encode' ? encodeDate : decodeDate);
                }
                return record[f];
            });
    });
};
exports.default = {
    request: function (map, schema, request) {
        return {
            commits: request.commits && request.commits.map(function (c) { return codeDate(map, schema, c); }),
            queries: request.queries && queryCoder(request.queries, schema, { map: map, schema: schema }),
            context: request.context,
        };
    },
    response: function (map, schema, response) {
        return __assign({}, response, { data: codeDate(map, schema, response.data) });
    },
};
