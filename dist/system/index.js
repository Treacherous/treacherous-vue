System.register(["./directives/show-error", "./directives/validation-summary", "./mixins/validation-mixin", "treacherous-view", "treacherous"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var show_error_1, validation_summary_1, validation_mixin_1, install;
    return {
        setters: [
            function (show_error_1_1) {
                show_error_1 = show_error_1_1;
            },
            function (validation_summary_1_1) {
                validation_summary_1 = validation_summary_1_1;
            },
            function (validation_mixin_1_1) {
                validation_mixin_1 = validation_mixin_1_1;
            },
            function (treacherous_view_1_1) {
                exports_1({
                    "viewStrategyRegistry": treacherous_view_1_1["viewStrategyRegistry"]
                });
            },
            function (treacherous_1_1) {
                exports_1({
                    "createRuleset": treacherous_1_1["createRuleset"],
                    "ruleRegistry": treacherous_1_1["ruleRegistry"]
                });
            }
        ],
        execute: function () {
            install = function (Vue, options) {
                Vue.mixin(validation_mixin_1.validationMixin);
                Vue.directive('show-error', show_error_1.showErrorDirective);
                Vue.directive('validation-summary', validation_summary_1.summaryDirective);
            };
            exports_1("default", {
                install: install
            });
        }
    };
});
