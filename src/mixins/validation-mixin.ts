import {createGroup, IReactiveValidationGroup} from "treacherous";
import {ValidationSubKey} from "../directives/show-error";
import {SummarySubKey} from "../directives/validation-summary";

export const validationMixin = {
    created: function () {
        if(!this.$options.ruleset)
        { return; }

        let context = this;
        let ruleset = context.$options.ruleset;
        let validationGroup = createGroup().asReactiveGroup().build(context, ruleset);
        
        context.validationGroup = validationGroup;

        let metadata: any = {};
        context._validationMetadata = metadata;

        metadata[ValidationSubKey] = {};        
        metadata[SummarySubKey] = [];
    },
    beforeDestroy: function() {
        if(!this.$options.ruleset)
        { return; }

        let context = this;
        (<IReactiveValidationGroup>context.validationGroup).release();
        
        delete context.validationGroup;
        delete context._validationMetadata;
    }
};