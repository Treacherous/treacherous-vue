import Vue  from "vue/dist/vue";

import { UserData } from "./user-data.model";
import { Hobby } from "./hobby.model";
import { userDataRuleset } from "./user-data.ruleset";
import template from "./complex.html";
import {createRuleset} from "treacherous";

const propsRuleset = createRuleset()
    .forProperty("dummyProp")
        .nestWithin(x => {
            x.forProperty("blah")
                .withDisplayName("Property Blah")
                .required();
        })
    .build();

const complexRuleset = createRuleset(userDataRuleset)
    .forProperty("props")
        .addRuleset(propsRuleset)
    .build();

Vue.component('complex', {
    ruleset: {
        use: complexRuleset,
        options: { validateProps: true }
    },
    data: () => new UserData("Bob", 20, [ 
        new Hobby("reading"), 
        new Hobby("skateboarding"), 
        new Hobby("swimming")
    ]),
    template: template,
    props: [ "dummyProp" ]
});