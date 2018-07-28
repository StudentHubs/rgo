"use strict";
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
var utils_1 = require("./utils");
function setState(store, state, data, schema, changes) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e, e_6, _f, e_7, _g, e_8, _h;
    var setChanged = function (type, id, field) {
        changes[type] = changes[type] || {};
        changes[type][id] = changes[type][id] || {};
        changes[type][id][field] = true;
    };
    try {
        for (var _j = __values(Object.keys(data)), _k = _j.next(); !_k.done; _k = _j.next()) {
            var type = _k.value;
            if (data[type] === undefined) {
                if (store === 'client') {
                    try {
                        for (var _l = __values(Object.keys(state.client[type] || {})), _m = _l.next(); !_m.done; _m = _l.next()) {
                            var id = _m.value;
                            try {
                                for (var _o = __values(Object.keys(state.client[type][id] || {})), _p = _o.next(); !_p.done; _p = _o.next()) {
                                    var field = _p.value;
                                    if (!utils_1.isEqual(utils_1.get(state.combined, [type, id, field]), utils_1.get(state.server, [type, id, field]))) {
                                        setChanged(type, id, field);
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_p && !_p.done && (_c = _o.return)) _c.call(_o);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_m && !_m.done && (_b = _l.return)) _b.call(_l);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    delete state.client[type];
                    if (!state.server[type])
                        delete state.combined[type];
                    else
                        state.combined[type] = utils_1.clone(state.server[type], 1);
                    delete state.diff[type];
                }
            }
            else {
                state[store][type] = state[store][type] || {};
                state.combined[type] = state.combined[type] || {};
                state.diff[type] = state.diff[type] || {};
                try {
                    for (var _q = __values(Object.keys(data[type])), _r = _q.next(); !_r.done; _r = _q.next()) {
                        var id = _r.value;
                        if (data[type][id] === undefined ||
                            (data[type][id] === null && utils_1.isNewId(id))) {
                            if (store === 'client') {
                                try {
                                    for (var _s = __values(Object.keys(state.client[type][id] || {})), _t = _s.next(); !_t.done; _t = _s.next()) {
                                        var field = _t.value;
                                        if (!utils_1.isEqual(utils_1.get(state.combined, [type, id, field]), utils_1.get(state.server, [type, id, field]))) {
                                            setChanged(type, id, field);
                                        }
                                    }
                                }
                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                finally {
                                    try {
                                        if (_t && !_t.done && (_e = _s.return)) _e.call(_s);
                                    }
                                    finally { if (e_5) throw e_5.error; }
                                }
                                delete state.client[type][id];
                                if (!utils_1.get(state.server, [type, id]))
                                    delete state.combined[type][id];
                                else
                                    state.combined[type][id] = utils_1.clone(state.server[type][id], 0);
                                delete state.diff[type][id];
                            }
                        }
                        else if (data[type][id] === null) {
                            if (store === 'client') {
                                try {
                                    for (var _u = __values(Object.keys(state.combined[type][id] || {})), _v = _u.next(); !_v.done; _v = _u.next()) {
                                        var field = _v.value;
                                        setChanged(type, id, field);
                                    }
                                }
                                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                                finally {
                                    try {
                                        if (_v && !_v.done && (_f = _u.return)) _f.call(_u);
                                    }
                                    finally { if (e_6) throw e_6.error; }
                                }
                                state.client[type][id] = null;
                                delete state.combined[type][id];
                                state.diff[type][id] = -1;
                            }
                            else {
                                try {
                                    for (var _w = __values(Object.keys(state.combined[type][id] || {})), _x = _w.next(); !_x.done; _x = _w.next()) {
                                        var field = _x.value;
                                        if (!utils_1.isEqual(utils_1.get(state.combined, [type, id, field]), utils_1.get(state.client, [type, id, field]))) {
                                            setChanged(type, id, field);
                                        }
                                    }
                                }
                                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                                finally {
                                    try {
                                        if (_x && !_x.done && (_g = _w.return)) _g.call(_w);
                                    }
                                    finally { if (e_7) throw e_7.error; }
                                }
                                delete state.server[type][id];
                                if (!utils_1.get(state.client, [type, id])) {
                                    delete state.combined[type][id];
                                }
                                else {
                                    state.combined[type][id] = utils_1.clone(state.client[type][id], 0);
                                    state.diff[type][id] = 0;
                                }
                            }
                        }
                        else {
                            state[store][type][id] = state[store][type][id] || {};
                            if (utils_1.get(state.client, [type, id]) !== null) {
                                state.combined[type][id] = state.combined[type][id] || {};
                            }
                            try {
                                for (var _y = __values(Object.keys(data[type][id])), _z = _y.next(); !_z.done; _z = _y.next()) {
                                    var field = _z.value;
                                    var prev = utils_1.get(state.combined, [type, id, field]);
                                    var value = data[type][id][field];
                                    var f = schema[type][field];
                                    if (f.isList && value && value.length === 0)
                                        value = null;
                                    if (store === 'client') {
                                        state[store][type][id] = state[store][type][id] || {};
                                        state.combined[type][id] = state.combined[type][id] || {};
                                        if (data[type][id][field] === undefined) {
                                            delete state.client[type][id][field];
                                            if (utils_1.get(state.server, [type, id, field]) !== undefined) {
                                                state.combined[type][id][field] = state.server[type][id][field];
                                            }
                                            else {
                                                delete state.combined[type][id][field];
                                            }
                                            if (Object.keys(state.client[type][id]).length === 0) {
                                                delete state.client[type][id];
                                            }
                                            if (Object.keys(state.combined[type][id]).length === 0) {
                                                delete state.combined[type][id];
                                            }
                                        }
                                        else {
                                            state.client[type][id][field] = data[type][id][field];
                                            state.combined[type][id][field] = data[type][id][field];
                                        }
                                    }
                                    else {
                                        if (utils_1.get(state.client, [type, id]) !== null &&
                                            utils_1.get(state.client, [type, id, field]) === undefined) {
                                            state.combined[type][id][field] = value;
                                        }
                                        state.server[type][id][field] = value;
                                    }
                                    if (!utils_1.isEqual(utils_1.get(state.combined, [type, id, field]), prev)) {
                                        setChanged(type, id, field);
                                    }
                                }
                            }
                            catch (e_8_1) { e_8 = { error: e_8_1 }; }
                            finally {
                                try {
                                    if (_z && !_z.done && (_h = _y.return)) _h.call(_y);
                                }
                                finally { if (e_8) throw e_8.error; }
                            }
                            if (utils_1.get(state.client, [type, id]) === undefined) {
                                delete state.diff[type][id];
                            }
                            else if (utils_1.get(state.client, [type, id])) {
                                state.diff[type][id] = utils_1.isNewId(id) ? 1 : 0;
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_r && !_r.done && (_d = _q.return)) _d.call(_q);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_k && !_k.done && (_a = _j.return)) _a.call(_j);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.default = setState;
