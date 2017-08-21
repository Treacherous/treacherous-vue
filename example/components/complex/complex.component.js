import Vue  from "vue/dist/vue";

import { UserData } from "./user-data.model";
import { Hobby } from "./hobby.model";
import { generateRuleset } from "./user-data.ruleset";
import template from "./complex.html";

Vue.component('complex', {
    ruleset: generateRuleset(),
    data: () => new UserData("Bob", 20, [ 
        new Hobby("reading"), 
        new Hobby("skateboarding"), 
        new Hobby("swimming")
    ]),
    template: template
});