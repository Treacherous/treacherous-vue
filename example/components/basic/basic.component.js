import Vue  from "vue/dist/vue";

import {createRuleset} from "treacherous";
import template from "./basic.html";

const dataRuleset = createRuleset()
    .forProperty("username")
        .required()
        .minLength(2)
    .build();

Vue.component('basic', {
    ruleset: dataRuleset,
    data: () => { return { username: "joe.bloggs" } },
    template: template
});