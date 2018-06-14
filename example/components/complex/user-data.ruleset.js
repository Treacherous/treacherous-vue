import {createRuleset} from "../../../dist/commonjs/plugin";
import {hobbyRuleset} from "./hobby.ruleset";

export const userDataRuleset = createRuleset()
    .forProperty("name")
        .required()
        .minLength(2)
    .forProperty("age")
        .required()
        .number()
    .forProperty("hobbies")
        .addRulesetForEach(hobbyRuleset)
    .build();