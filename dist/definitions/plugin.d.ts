import { Ruleset } from "treacherous";
export { createRuleset, ruleRegistry } from "treacherous";
export { viewStrategyRegistry } from "treacherous-view";
import { Vue } from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        ruleset?: Ruleset;
    }
}
export declare class TreacherousPlugin {
    private static ValidationSubKey;
    install(Vue: any, options: any): void;
    private mixins;
    private showError;
}
