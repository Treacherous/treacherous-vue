import {Ruleset} from "treacherous";
import {Vue as VueDescriptor} from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends VueDescriptor> {
        ruleset?: Ruleset;
    }
}

import {showErrorDirective} from "./directives/show-error";
import {summaryDirective} from "./directives/validation-summary";
import {validationMixin} from "./mixins/validation-mixin"

const install = function(Vue: any, options: any) {
    Vue.mixin(validationMixin);
    Vue.directive('show-error', showErrorDirective);
    Vue.directive('validation-summary', summaryDirective);
}

export {viewStrategyRegistry} from "treacherous-view";
export {createRuleset, ruleRegistry} from "treacherous";

export default {
    install: install
}