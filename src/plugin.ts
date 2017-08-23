import {Ruleset, createGroup, IValidationGroup, IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewStrategyRegistry, viewSummaryRegistry, ElementHelper, ValidationState} from "treacherous-view";

import {Vue as VueDescriptor} from "vue/types/vue";
declare module "vue/types/options" {
    interface ComponentOptions<V extends VueDescriptor> {
        ruleset?: Ruleset;
    }
}

const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";

const mixins = {
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
        (<IValidationGroup>context.validationGroup).release();
    }
};

const showErrorDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let validationGroup = <IReactiveValidationGroup>context.validationGroup;
        if(!validationGroup) { return; }

        let metadata = context._validationMetadata;

        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let strategyName = ElementHelper.getViewStrategyFrom(element);
        let viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        let viewOptions = ElementHelper.getViewOptionsFrom(element) || {};

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
        metadata[ValidationSubKey][propertyRoute] = sub;
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let metadata = context._validationMetadata;
        let outstandingSub = metadata[ValidationSubKey][propertyRoute];
        if(outstandingSub) { outstandingSub(); }
    }
}

const summaryDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;

        if(!context._validationMetadata)
        { 
            context._validationMetadata = {};
            context._validationMetadata[SummarySubKey] = []; 
        }

        let metadata = context._validationMetadata;
        let validationGroups: any = null;

        if(binding.value != null)
        { validationGroups = binding.value; }
        else
        { validationGroups = context.validationGroup; }
            
        if(!validationGroups) { return; }
        
        let isArray = Array.isArray(validationGroups);

        let getDisplayName = (propertyRoute: string) => {
            if(!isArray)
            { return (<IValidationGroup>validationGroups).getPropertyDisplayName(propertyRoute); }

            let finalName = propertyRoute;
            validationGroups.forEach((validationGroup: IValidationGroup) => {
               let returnedName = validationGroup.getPropertyDisplayName(propertyRoute);
               if(returnedName != propertyRoute)
               { finalName = returnedName; }
            });

            return finalName;
        };

        let strategyName = ElementHelper.getSummaryStrategyFrom(element);
        let summaryStrategy = viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if(!summaryStrategy) { return; }

        let viewOptions = ElementHelper.getSummaryOptionsFrom(element) || {};
        summaryStrategy.setupContainer(element, viewOptions);
        
        var handleStateChange = (eventArgs: PropertyStateChangedEvent) => {
            var displayName = getDisplayName(eventArgs.property);
            if(eventArgs.isValid)
            { summaryStrategy.propertyBecomeValid(element, displayName, viewOptions); }
            else
            { summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions); }
        };

        if(isArray)
        {
            validationGroups.forEach((validationGroup: IReactiveValidationGroup) => {
                let sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
            });
        }
        else
        {
            let sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
        }        
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let metadata = context._validationMetadata;
        metadata[SummarySubKey].foreach((x: Function) => x());
    }
}

const install = function(Vue: any, options: any) {
    Vue.mixin(mixins);
    Vue.directive('show-error', showErrorDirective);
    Vue.directive('validation-summary', summaryDirective);
}

export {viewStrategyRegistry} from "treacherous-view";
export {createRuleset, ruleRegistry} from "treacherous";

export default {
    install: install
}