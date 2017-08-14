import { Ruleset } from "treacherous";
import { Vue } from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        ruleset?: Ruleset;
    }
}
export declare class TreacherousPlugin {
    install(Vue: any, options: any): void;
    private mixins;
    private showError;
}
