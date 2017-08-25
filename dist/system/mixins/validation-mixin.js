System.register(["treacherous", "../directives/show-error", "../directives/validation-summary"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var treacherous_1, show_error_1, validation_summary_1, validationMixin;
    return {
        setters: [
            function (treacherous_1_1) {
                treacherous_1 = treacherous_1_1;
            },
            function (show_error_1_1) {
                show_error_1 = show_error_1_1;
            },
            function (validation_summary_1_1) {
                validation_summary_1 = validation_summary_1_1;
            }
        ],
        execute: function () {
            exports_1("validationMixin", validationMixin = {
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
            });
        }
    };
});
