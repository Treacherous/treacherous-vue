import Vue  from "vue/dist/vue";

import { UserData } from "./user-data.model";
import { Hobby } from "./hobby.model";
import { userDataRuleset } from "./user-data.ruleset";
import template from "./complex.html";

Vue.component('complex', {
    ruleset: userDataRuleset,
    data: () => new UserData("Bob", 20, [ 
        new Hobby("reading"), 
        new Hobby("skateboarding"), 
        new Hobby("swimming")
    ]),
    template: template
});