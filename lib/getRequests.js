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
var typings_1 = require("./typings");
var utils_1 = require("./utils");
var getFields = function (fields) {
    var filtered = fields.filter(function (s) { return s; });
    if (filtered.length === 0)
        return null;
    if (!filtered.includes('id'))
        filtered.push('id');
    return filtered;
};
function getRequests(state, info) {
    var e_1, _a;
    var filterFields = info.args.filter
        ? utils_1.getFilterFields(info.args.filter).filter(function (f) { return f !== 'id'; })
        : [];
    var sortFields = info.args.sort
        ? info.args.sort.map(function (s) { return s.replace('-', ''); }).filter(function (f) { return f !== 'id'; })
        : [];
    var allFields = Array.from(new Set(__spread([
        'id'
    ], Object.keys(info.fields), filterFields, sortFields, (typings_1.fieldIs.foreignRelation(info.field) ? [info.field.foreign] : []))));
    var fields = {
        old: allFields.filter(function (f) { return info.complete.data.fields.includes(f); }),
        new: allFields.filter(function (f) { return !info.complete.data.fields.includes(f); }),
    };
    var relationKeys = Object.keys(info.relations);
    var relations = relationKeys.map(function (k) {
        return getRequests(state, info.relations[k]);
    });
    var idQueries = relations.reduce(function (res, r) { return __spread(res, r.idQueries); }, []);
    var innerAll = getFields(__spread(allFields, relations.map(function (r) { return r.allFields; })));
    var innerNew = getFields(__spread(fields.new, relations.map(function (r) { return r.newFields; })));
    var extra = { start: 0, end: 0 };
    var trace = {
        slice: { start: 0 },
        full: (info.complete.data.slice.start || info.complete.data.slice.end) !== 0,
    };
    if (typings_1.fieldIs.foreignRelation(info.field) || info.field.isList) {
        var allIds = [];
        var _loop_1 = function (id) {
            var server = state.server[info.field.type] && state.server[info.field.type][id];
            var serverStatus = server && filterFields.every(function (f) { return server[f] !== undefined; })
                ? utils_1.runFilter(info.args.filter, id, server)
                : null;
            var combined = state.combined[info.field.type] && state.combined[info.field.type][id];
            var combinedStatus = utils_1.isNewId(id) ||
                (combined && filterFields.every(function (f) { return combined[f] !== undefined; }))
                ? utils_1.runFilter(info.args.filter, id, combined)
                : null;
            var diff = state.diff[info.field.type][id];
            if (diff === -1 || (diff === 0 && combinedStatus === false)) {
                if (serverStatus !== false) {
                    extra.end += 1;
                    if (serverStatus === null)
                        allIds.push(id);
                }
            }
            if (diff === 0) {
                if (serverStatus === null ||
                    combinedStatus === null ||
                    sortFields.some(function (f) {
                        return server[f] === undefined ||
                            (combined[f] || server[f]) === undefined ||
                            !utils_1.isEqual(server[f], combined[f]);
                    })) {
                    extra.start += 1;
                    extra.end += 1;
                    allIds.push(id);
                }
            }
            if (diff === 1 || (diff === 0 && serverStatus === false)) {
                if (combinedStatus !== false) {
                    extra.start += 1;
                    if (diff === 0)
                        allIds.push(id);
                }
            }
        };
        try {
            for (var _b = __values(Object.keys(state.diff[info.field.type] || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                _loop_1(id);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        extra.start = Math.min(info.args.start || 0, extra.start);
        var ids = {
            old: allIds.filter(function (id) { return info.complete.data.ids.includes(id); }),
            new: allIds.filter(function (id) { return !info.complete.data.ids.includes(id); }),
        };
        var slice = {
            start: (info.args.start || 0) - extra.start,
            end: utils_1.undefOr(info.args.end, info.args.end + extra.end),
        };
        trace.slice = info.complete.data.slice;
        trace.full =
            info.complete.data.slice.start <= slice.start &&
                (info.complete.data.slice.end === undefined ||
                    (slice.end !== undefined && info.complete.data.slice.end >= slice.end));
        info.pending = {
            changing: fields.new,
            data: {
                fields: allFields,
                slice: slice,
                ids: allIds,
            },
        };
        if (ids.new.length > 0) {
            idQueries.push({
                name: info.field.type,
                filter: ['id', 'in', ids.new],
                fields: innerAll,
            });
            info.pending.changing = allFields;
        }
        if (innerNew && ids.old.length > 0) {
            idQueries.push({
                name: info.field.type,
                filter: ['id', 'in', ids.old],
                fields: innerNew,
            });
        }
    }
    else {
        info.pending = {
            changing: fields.new,
            data: {
                fields: allFields,
                slice: { start: 0 },
                ids: [],
            },
        };
    }
    var innerTrace = getFields(__spread((trace.full ? [] : fields.old), relations.map(function (r) { return r.trace; })));
    if (idQueries.length === 0 && !innerNew && !innerTrace)
        delete info.pending;
    else if (innerTrace)
        info.pending.changing = allFields;
    return {
        idQueries: idQueries,
        allFields: __assign({ name: info.name }, info.args, { extra: extra, fields: innerAll }),
        newFields: innerNew && __assign({ name: info.name }, info.args, { extra: extra, fields: innerNew }),
        trace: innerTrace && __assign({ name: info.name }, info.args, { extra: extra, trace: trace.slice, fields: innerTrace }),
    };
}
exports.default = getRequests;
