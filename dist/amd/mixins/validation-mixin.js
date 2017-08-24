define(["require", "exports", "treacherous", "../directives/show-error", "../directives/validation-summary"], function (require, exports, treacherous_1, show_error_1, validation_summary_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        }
    };
});
