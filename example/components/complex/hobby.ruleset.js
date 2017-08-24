import {createRuleset} from "../../../dist/commonjs/index";

export var hobbyRuleset = createRuleset()
    .forProperty("hobbyName")
        .addRule("required")
        .addRule("minLength", 2)
        .addRule("maxLength", 20)
    .build();