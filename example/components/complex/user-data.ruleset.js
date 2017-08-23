import {createRuleset} from "../../../dist/commonjs/plugin";
import {hobbyRuleset} from "./hobby.ruleset";

export var userDataRuleset = createRuleset()
    .forProperty("name")
        .addRule("required")
        .addRule("minLength", 2)
    .forProperty("age")
        .addRule("required")
        .addRule("number")
    .forProperty("hobbies")
        .addRulesetForEach(hobbyRuleset)
    .build();