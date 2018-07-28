"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldIs = {
    scalar: function (field) {
        return !!field.scalar;
    },
    relation: function (field) {
        return (!!field.type &&
            !field.foreign);
    },
    foreignRelation: function (field) {
        return (!!field.type &&
            !!field.foreign);
    },
};
