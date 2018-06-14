import { Ruleset } from "treacherous";
import { Vue as VueDescriptor } from "vue/types/vue";
interface RulesetOptions {
    disableReactiveValidation: boolean;
    validateProps: boolean;
    validateComputed: boolean;
}
interface RulesetMixin {
    use: Ruleset;
    options: RulesetOptions;
}
declare type RulesetType = Ruleset | RulesetMixin;
declare module "vue/types/options" {
    interface ComponentOptions<V extends VueDescriptor> {
        ruleset?: RulesetType;
    }
}
export { viewStrategyRegistry } from "treacherous-view";
export { createRuleset, ruleRegistry } from "treacherous";
declare const _default: {
    install: (Vue: any, options: any) => void;
};
export default _default;
