"use strict";
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
(function (x) { return x; });
var sortedStringify = function (obj) {
    return Object.keys(obj)
        .filter(function (k) { return obj[k] !== undefined; })
        .sort()
        .map(function (k) { return k + ":" + (Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k]); })
        .join(',');
};
var walkQueryLayer = function (layer, relations, schema, context, params, func) {
    return func.apply(void 0, __spread([layer,
        relations.map(function (_a) {
            var name = _a.name, alias = _a.alias, fields = _a.fields, extra = _a.extra, trace = _a.trace, key = _a.key, args = __rest(_a, ["name", "alias", "fields", "extra", "trace", "key"]);
            var field = schema[layer.field.type][name];
            return {
                name: name,
                alias: alias,
                foreign: typings_1.fieldIs.foreignRelation(field),
                walk: function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    return walkQueryLayer({
                        root: { type: layer.field.type, field: name, alias: alias },
                        field: field,
                        args: args,
                        fields: fields.filter(function (f) { return typeof f === 'string'; }),
                        extra: extra,
                        trace: trace,
                        path: __spread(layer.path, [layer.key]),
                        key: key || name + "~" + sortedStringify(args),
                    }, fields.filter(function (f) { return typeof f !== 'string'; }), schema, context, params, func);
                },
            };
        }),
        context], params));
};
function walker(func) {
    return function (queries, schema, context) {
        var params = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            params[_i - 3] = arguments[_i];
        }
        return queries.map(function (_a) {
            var name = _a.name, alias = _a.alias, fields = _a.fields, extra = _a.extra, trace = _a.trace, key = _a.key, args = __rest(_a, ["name", "alias", "fields", "extra", "trace", "key"]);
            return walkQueryLayer({
                root: { field: name, alias: alias },
                field: { type: name, isList: true },
                args: args,
                fields: fields.filter(function (f) { return typeof f === 'string'; }),
                extra: extra,
                trace: trace,
                path: [],
                key: key || name + "~" + sortedStringify(args),
            }, fields.filter(function (f) { return typeof f !== 'string'; }), schema, context, params, func);
        });
    };
}
exports.default = walker;
