import {Ruleset, createGroup, IValidationGroup, IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewStrategyRegistry, ElementHelper, ValidationState} from "treacherous-view";
export {createRuleset, ruleRegistry} from "treacherous";
export {viewStrategyRegistry} from "treacherous-view";

import {Vue} from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        ruleset?: Ruleset;
    }
}

const ValidationSubKey = "validation-subscriptions";

const install = function(Vue: any, options: any) {
    Vue.mixin(mixins);
    Vue.directive('show-error', showErrorDirective);
}

const mixins = {
    created: function () {
        if(!this.$options.ruleset)
        { return; }

        let context = this;
        let ruleset = context.$options.ruleset;
        let validationGroup = createGroup().asReactiveGroup().build(context, ruleset);
        
        context.validationGroup = validationGroup;
    },
    beforeDestroy: function() {
        if(!this.$options.ruleset)
        { return; }

        let context = this;
        (<IValidationGroup>context.validationGroup).release();
    }
};

const showErrorDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let validationGroup = <IReactiveValidationGroup>context.validationGroup;
        if(!validationGroup) { return; }

        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let strategyName = ElementHelper.getStrategyFrom(element);
        let viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        let viewOptions = ElementHelper.getOptionsFrom(element) || {};

        let handlePossibleError = (error: any) => {
            if(!error)
            {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.valid;
            }
            else
            {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.invalid;
            }
        };

        let handlePropertyStateChange = (args: PropertyStateChangedEvent) => {
            handlePossibleError(args.error);
        };

        let propertyPredicate = (args: PropertyStateChangedEvent) => {
            return args.property == propertyRoute
        };

        let sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
        
        if(!context[ValidationSubKey])
        { context[ValidationSubKey] = {}; }

        context[ValidationSubKey][propertyRoute] = sub;
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let outstandingSub = context[ValidationSubKey][propertyRoute];
        if(outstandingSub) { outstandingSub(); }
    }
}

export default {
    install: install
}