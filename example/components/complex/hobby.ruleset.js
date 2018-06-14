import {createRuleset} from "../../../dist/commonjs/plugin";

export var hobbyRuleset = createRuleset()
    .forProperty("hobbyName")
        .required()
        .minLength(2)
        .maxLength(20)
    .build();