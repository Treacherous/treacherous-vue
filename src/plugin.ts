import {Ruleset, createGroup, IValidationGroup, IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewStrategyRegistry, viewSummaryRegistry, ElementHelper, ValidationState} from "treacherous-view";

import {Vue as VueDescriptor} from "vue/types/vue";

interface RulesetOptions {
    disableReactiveValidation: boolean;
    validateProps: boolean;
    validateComputed: boolean;
}

interface RulesetMixin {
    use: Ruleset,
    options: RulesetOptions
}

type RulesetType = Ruleset |  RulesetMixin;

declare module "vue/types/options" {
    interface ComponentOptions<V extends VueDescriptor> {
        ruleset?: RulesetType;
    }
}

const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";

const mixins = {
    data: function() {
        if (!this.$options.ruleset) { return {}; }

        return {
            validationGroup: null,
            modelErrors: {}
        }
    },
    computed: {
        isValid: function() {
            if (!this.$options.ruleset) { return true; }
            return Object.keys(this.modelErrors).length == 0;
        }
    },
    created: function () {
        if(!this.$options.ruleset)
        { return; }

        const context = this;
        let ruleset: Ruleset;
        let options:  RulesetOptions;

        if(this.$options.ruleset instanceof Ruleset)
        {
            ruleset = this.$options.ruleset;
            options = { disableReactiveValidation: false, validateComputed: false, validateProps: false };
        }
        else
        {
            ruleset = this.$options.ruleset.use;
            options = this.$options.ruleset.options;
        }

        const handler = {
            get (obj: object, prop: PropertyKey) {

                const hasProperty = Reflect.has(obj, prop);

                if(hasProperty)
                { return Reflect.get(obj, prop); }

                if(options.validateProps && Reflect.has(context._props, prop))
                { return Reflect.get(context._props, prop); }

                if(options.validateComputed && Reflect.has(context._computed, prop))
                { return Reflect.get(context._computed, prop); }
            }
        };

        const virtualModel = new Proxy(context._data, handler);

        if(options.disableReactiveValidation)
        { context.validationGroup = createGroup().build(virtualModel, ruleset); }
        else
        { context.validationGroup = createGroup().asReactiveGroup().build(virtualModel, ruleset); }

        const metadata: any = {};
        context._validationMetadata = metadata;

        metadata[ValidationSubKey] = {};        
        metadata[SummarySubKey] = [];
    },
    beforeDestroy: function() {
        if(!this.$options.ruleset)
        { return; }

        const context = this;
        (<IValidationGroup>context.validationGroup).release();
    }
};

const showErrorDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        const context = vnode.context;
        const validationGroup = <IReactiveValidationGroup>context.validationGroup;
        if(!validationGroup) { return; }

        const metadata = context._validationMetadata;

        const propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        const strategyName = ElementHelper.getViewStrategyFrom(element);
        const viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        const viewOptions = ElementHelper.getViewOptionsFrom(element) || {};

        let handlePossibleError = (error: any) => {
            if(!error)
            {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.valid;
                delete context.modelErrors[propertyRoute];
            }
            else
            {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.invalid;
                context.modelErrors[propertyRoute] = error;
            }
        };

        const handlePropertyStateChange = (args: PropertyStateChangedEvent) => {
            handlePossibleError(args.error);
        };

        const propertyPredicate = (args: PropertyStateChangedEvent) => {
            return args.property == propertyRoute
        };

        const sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
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
        const context = vnode.context;

        if(!context._validationMetadata)
        { 
            context._validationMetadata = {};
            context._validationMetadata[SummarySubKey] = []; 
        }

        const metadata = context._validationMetadata;
        let validationGroups: any = null;

        if(binding.value != null)
        { validationGroups = binding.value; }
        else
        { validationGroups = context.validationGroup; }
            
        if(!validationGroups) { return; }

        const isArray = Array.isArray(validationGroups);

        const getDisplayName = (propertyRoute: string) => {
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

        const strategyName = ElementHelper.getSummaryStrategyFrom(element);
        const summaryStrategy = viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if(!summaryStrategy) { return; }

        const viewOptions = ElementHelper.getSummaryOptionsFrom(element) || {};
        summaryStrategy.setupContainer(element, viewOptions);

        const handleStateChange = (eventArgs: PropertyStateChangedEvent) => {
            const displayName = getDisplayName(eventArgs.property);
            if(eventArgs.isValid)
            { summaryStrategy.propertyBecomeValid(element, displayName, viewOptions); }
            else
            { summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions); }
        };

        if(isArray)
        {
            validationGroups.forEach((validationGroup: IReactiveValidationGroup) => {
                const sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
            });
        }
        else
        {
            const sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
        }        
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        const context = vnode.context;
        const metadata = context._validationMetadata;
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