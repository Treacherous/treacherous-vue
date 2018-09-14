import Vue  from "vue/dist/vue";

import {createRuleset} from "@treacherous/core";
import template from "./basic.html";
import {ValidateWith} from "../../../dist/commonjs/plugin";

const dataRuleset = createRuleset()
    .forProperty("username")
        .required()
        .minLength(2)
    .build();

Vue.component('basic', {
    data: () => { return { username: "joe.bloggs" } },
    template: template,
    mixins: [ ValidateWith(dataRuleset) ]
});