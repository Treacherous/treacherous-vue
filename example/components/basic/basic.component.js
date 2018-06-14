import Vue  from "vue/dist/vue";

import {createRuleset} from "treacherous";
import template from "./basic.html";

const dataRuleset = createRuleset()
    .forProperty("username")
        .required()
        .minLength(2)
    .build();

const componentRuleset = createRuleset()
        .forProperty("data")
            .addRuleset(dataRuleset)
        .build();

Vue.component('basic', {
    ruleset: componentRuleset,
    data: () => { return { username: "joe.bloggs" } },
    template: template
});