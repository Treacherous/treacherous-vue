import { UserData } from "./user-data.model";
import { Hobby } from "./hobby.model";
import { userDataRuleset } from "./user-data.ruleset";
import template from "./complex.html";
import {createRuleset} from "@treacherous/core";
import {ValidateWith} from "../../../dist/commonjs/plugin";

// When creating this ruleset we use userDataRuleset as the template
const complexRuleset = createRuleset(userDataRuleset)
    .forProperty("dummyProp")
        .then(x => {
            x.forProperty("blah")
                .required()
                .withDisplayName("Blah Property");
        })
    .build();

export const complexComponent = {
    data: () => new UserData("Bob", 20, [ 
        new Hobby("reading"), 
        new Hobby("skateboarding"), 
        new Hobby("swimming")
    ]),
    template: template,
    props: [ "dummyProp" ],
    mixins: [ ValidateWith(complexRuleset, { validateProps: true, withReactiveValidation: true }) ] // Enable Prop and Reactive validation
};