"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var treacherous_1 = require("treacherous");
var show_error_1 = require("../directives/show-error");
var validation_summary_1 = require("../directives/validation-summary");
exports.validationMixin = {
    created: function () {
        if (!this.$options.ruleset) {
            return;
        }
        var context = this;
        var ruleset = context.$options.ruleset;
        var validationGroup = treacherous_1.createGroup().asReactiveGroup().build(context, ruleset);
        context.validationGroup = validationGroup;
        var metadata = {};
        context._validationMetadata = metadata;
        metadata[show_error_1.ValidationSubKey] = {};
        metadata[validation_summary_1.SummarySubKey] = [];
    },
    beforeDestroy: function () {
        if (!this.$options.ruleset) {
            return;
        }
        var context = this;
        context.validationGroup.release();
        delete context.validationGroup;
        delete context._validationMetadata;
    }
};
