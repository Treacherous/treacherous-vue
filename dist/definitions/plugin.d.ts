import { Ruleset } from "treacherous";
import { Vue as VueDescriptor } from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends VueDescriptor> {
        ruleset?: Ruleset;
    }
}
export { viewStrategyRegistry } from "treacherous-view";
export { createRuleset, ruleRegistry } from "treacherous";
declare const _default: {
    install: (Vue: any, options: any) => void;
};
export default _default;
