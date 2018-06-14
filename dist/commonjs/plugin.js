"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const treacherous_1 = require("treacherous");
const treacherous_view_1 = require("treacherous-view");
const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";
const mixins = {
    created: function () {
        if (!this.$options.ruleset) {
            return;
        }
        const context = this;
        let ruleset;
        let options;
        if (this.$options.ruleset instanceof treacherous_1.Ruleset) {
            ruleset = this.$options.ruleset;
            options = { disableReactiveValidation: false, validateComputed: false, validateProps: false };
        }
        else {
            ruleset = this.$options.ruleset.use;
            options = this.$options.ruleset.options;
        }
        const handler = {
            get(obj, prop) {
                if (options.validateProps && prop == "props") {
                    return context._props;
                }
                if (options.validateComputed && prop == "computed") {
                    return context._computed;
                }
                return Reflect.get(obj, prop);
            }
        };
        const virtualModel = new Proxy(context._data, handler);
        if (options.disableReactiveValidation) {
            context.validationGroup = treacherous_1.createGroup().build(virtualModel, ruleset);
        }
        else {
            context.validationGroup = treacherous_1.createGroup().asReactiveGroup().build(virtualModel, ruleset);
        }
        const metadata = {};
        context._validationMetadata = metadata;
        metadata[ValidationSubKey] = {};
        metadata[SummarySubKey] = [];
    },
    beforeDestroy: function () {
        if (!this.$options.ruleset) {
            return;
        }
        const context = this;
        context.validationGroup.release();
    }
};
const showErrorDirective = {
    bind: function (element, binding, vnode) {
        const context = vnode.context;
        const validationGroup = context.validationGroup;
        if (!validationGroup) {
            return;
        }
        const metadata = context._validationMetadata;
        const propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
        if (!propertyRoute) {
            return;
        }
        const strategyName = treacherous_view_1.ElementHelper.getViewStrategyFrom(element);
        const viewStrategy = treacherous_view_1.viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if (!viewStrategy) {
            return;
        }
        let validationState = treacherous_view_1.ValidationState.unknown;
        const viewOptions = treacherous_view_1.ElementHelper.getViewOptionsFrom(element) || {};
        let handlePossibleError = (error) => {
            if (!error) {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = treacherous_view_1.ValidationState.valid;
            }
            else {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = treacherous_view_1.ValidationState.invalid;
            }
        };
        const handlePropertyStateChange = (args) => {
            handlePossibleError(args.error);
        };
        const propertyPredicate = (args) => {
            return args.property == propertyRoute;
        };
        const sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
        metadata[ValidationSubKey][propertyRoute] = sub;
    },
    unbind: function (element, binding, vnode) {
        let context = vnode.context;
        let propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
        if (!propertyRoute) {
            return;
        }
        let metadata = context._validationMetadata;
        let outstandingSub = metadata[ValidationSubKey][propertyRoute];
        if (outstandingSub) {
            outstandingSub();
        }
    }
};
const summaryDirective = {
    bind: function (element, binding, vnode) {
        const context = vnode.context;
        if (!context._validationMetadata) {
            context._validationMetadata = {};
            context._validationMetadata[SummarySubKey] = [];
        }
        const metadata = context._validationMetadata;
        let validationGroups = null;
        if (binding.value != null) {
            validationGroups = binding.value;
        }
        else {
            validationGroups = context.validationGroup;
        }
        if (!validationGroups) {
            return;
        }
        const isArray = Array.isArray(validationGroups);
        const getDisplayName = (propertyRoute) => {
            if (!isArray) {
                return validationGroups.getPropertyDisplayName(propertyRoute);
            }
            let finalName = propertyRoute;
            validationGroups.forEach((validationGroup) => {
                let returnedName = validationGroup.getPropertyDisplayName(propertyRoute);
                if (returnedName != propertyRoute) {
                    finalName = returnedName;
                }
            });
            return finalName;
        };
        const strategyName = treacherous_view_1.ElementHelper.getSummaryStrategyFrom(element);
        const summaryStrategy = treacherous_view_1.viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if (!summaryStrategy) {
            return;
        }
        const viewOptions = treacherous_view_1.ElementHelper.getSummaryOptionsFrom(element) || {};
        summaryStrategy.setupContainer(element, viewOptions);
        const handleStateChange = (eventArgs) => {
            const displayName = getDisplayName(eventArgs.property);
            if (eventArgs.isValid) {
                summaryStrategy.propertyBecomeValid(element, displayName, viewOptions);
            }
            else {
                summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions);
            }
        };
        if (isArray) {
            validationGroups.forEach((validationGroup) => {
                const sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
            });
        }
        else {
            const sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
        }
    },
    unbind: function (element, binding, vnode) {
        const context = vnode.context;
        const metadata = context._validationMetadata;
        metadata[SummarySubKey].foreach((x) => x());
    }
};
const install = function (Vue, options) {
    Vue.mixin(mixins);
    Vue.directive('show-error', showErrorDirective);
    Vue.directive('validation-summary', summaryDirective);
};
var treacherous_view_2 = require("treacherous-view");
exports.viewStrategyRegistry = treacherous_view_2.viewStrategyRegistry;
var treacherous_2 = require("treacherous");
exports.createRuleset = treacherous_2.createRuleset;
exports.ruleRegistry = treacherous_2.ruleRegistry;
exports.default = {
    install: install
};