define(["require", "exports", "./directives/show-error", "./directives/validation-summary", "./mixins/validation-mixin", "treacherous-view", "treacherous"], function (require, exports, show_error_1, validation_summary_1, validation_mixin_1, treacherous_view_1, treacherous_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var install = function (Vue, options) {
        Vue.mixin(validation_mixin_1.validationMixin);
        Vue.directive('show-error', show_error_1.showErrorDirective);
        Vue.directive('validation-summary', validation_summary_1.summaryDirective);
    };
    exports.viewStrategyRegistry = treacherous_view_1.viewStrategyRegistry;
    exports.createRuleset = treacherous_1.createRuleset;
    exports.ruleRegistry = treacherous_1.ruleRegistry;
    exports.default = {
        install: install
    };
});
