import {createRuleset} from "@treacherous/core";
import template from "./basic.html";
import {ValidateWith} from "../../../dist/commonjs/plugin";

const dataRuleset = createRuleset()
    .forProperty("username")
        .required()
        .minLength(2)
    .build();

export const basicComponent = {
    data: function() { return { username: "joe.bloggs" } },
    template: template,
    mixins: [ ValidateWith(dataRuleset) ]
};