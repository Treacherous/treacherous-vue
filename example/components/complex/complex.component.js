import Vue  from "vue/dist/vue";

import { UserData } from "./user-data.model";
import { Hobby } from "./hobby.model";
import { userDataRuleset } from "./user-data.ruleset";
import template from "./complex.html";
import {createRuleset} from "treacherous";

const dummyPropRulset = createRuleset()
    .forProperty("blah")
        .required()
    .build();

const propsRuleset = createRuleset()
    .forProperty("dummyProp")
        .addRuleset(dummyPropRulset)
    .build();

const complexRuleset = createRuleset()
    .forProperty("data")
        .addRuleset(userDataRuleset)
    .forProperty("props")
        .addRuleset(propsRuleset)
    .build();

Vue.component('complex', {
    ruleset: complexRuleset,
    data: () => new UserData("Bob", 20, [ 
        new Hobby("reading"), 
        new Hobby("skateboarding"), 
        new Hobby("swimming")
    ]),
    template: template,
    props: [ "dummyProp" ]
});