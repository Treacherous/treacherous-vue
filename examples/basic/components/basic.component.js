import Vue  from "vue/dist/vue";

import {createRuleset} from "../../../dist/commonjs/plugin";
import template from "./basic.html";

function generateRuleset() {
    return createRuleset()
        .forProperty("name")
            .addRule("required")
            .addRule("minLength", 2)
        .build()
}

Vue.component('basic', {
    ruleset: generateRuleset(),
    data: () => { return { name: "Bob" } },
    template: template
});