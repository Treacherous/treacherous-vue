var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createGroup, PropertyStateChangedEvent } from "@treacherous/core";
import { viewStrategyRegistry, viewSummaryRegistry, ElementHelper, ValidationState } from "@treacherous/view";
import Vue from "vue";
const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";
const ReactiveSubscription = "reactive-subscription";
const clearProperties = (obj) => {
    for (const key in obj) {
        Vue.delete(obj, key);
    }
};
const populateProperties = (objA, objB) => {
    for (const key in objB) {
        Vue.set(objA, key, objB[key]);
    }
};
export const ValidateWith = (ruleset, options = {}) => {
    return {
        data() {
            return {
                modelErrors: {}
            };
        },
        computed: {
            isValid: function () {
                return Object.keys(this.modelErrors).length == 0;
            }
        },
        watch: {
            isValid: function (isValid) {
                this.$emit("model-state-changed", { isValid: isValid, errors: this.modelErrors });
            }
        },
        methods: {
            getValidationGroup: function () { return this._validationGroup; },
            refreshValidation: function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const newErrors = yield this._validationGroup.getModelErrors(true);
                    clearProperties(this.modelErrors);
                    populateProperties(this.modelErrors, newErrors);
                });
            }
        },
        created() {
            const context = this;
            if (options.withReactiveValidation === undefined) {
                options.withReactiveValidation = false;
            }
            if (options.validateComputed === undefined) {
                options.validateComputed = false;
            }
            if (options.validateProps === undefined) {
                options.validateProps = false;
            }
            if (options.validateOnStart === undefined) {
                options.validateOnStart = false;
            }
            const proxyHandler = {
                get(obj, prop) {
                    const hasProperty = Reflect.has(obj, prop);
                    if (hasProperty) {
                        return Reflect.get(obj, prop);
                    }
                    if (options.validateProps && Reflect.has(context._props, prop)) {
                        return Reflect.get(context._props, prop);
                    }
                    if (options.validateComputed && Reflect.has(context._computed, prop)) {
                        return Reflect.get(context._computed, prop);
                    }
                    return undefined;
                }
            };
            const virtualModel = new Proxy(context._data, proxyHandler);
            let validationGroupBuilder = createGroup();
            if (options.withReactiveValidation) {
                validationGroupBuilder = validationGroupBuilder.asReactiveGroup();
            }
            if (options.validateOnStart) {
                validationGroupBuilder = validationGroupBuilder.andValidateOnStart();
            }
            const metadata = {};
            context._validationGroup = validationGroupBuilder.build(virtualModel, ruleset);
            context._validationMetadata = metadata;
            if (options.withReactiveValidation) {
                metadata[ReactiveSubscription] = context._validationGroup.propertyStateChangedEvent.subscribe((args) => {
                    if (args.isValid) {
                        context.$delete(context.modelErrors, args.property);
                    }
                    else {
                        context.$set(context.modelErrors, args.property, args.error);
                    }
                });
            }
            metadata[ValidationSubKey] = {};
            metadata[SummarySubKey] = [];
        },
        beforeDestroy() {
            const metadata = this._validationMetadata;
            if (metadata[ReactiveSubscription]) {
                metadata[ReactiveSubscription]();
            }
            this._validationGroup.release();
        }
    };
};
const showErrorDirective = {
    bind: function (element, binding, vnode) {
        const context = vnode.context;
        const validationGroup = context._validationGroup;
        if (!validationGroup) {
            return;
        }
        const metadata = context._validationMetadata;
        const propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if (!propertyRoute) {
            return;
        }
        const propertyNameOrRoute = validationGroup.getPropertyDisplayName(propertyRoute);
        const strategyName = ElementHelper.getViewStrategyFrom(element);
        const viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if (!viewStrategy) {
            return;
        }
        let validationState = ValidationState.unknown;
        const viewOptions = ElementHelper.getViewOptionsFrom(element) || {};
        let handlePossibleError = (error) => {
            if (!error) {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.valid;
                if (!metadata[ReactiveSubscription]) {
                    context.$delete(context.modelErrors, propertyNameOrRoute);
                }
            }
            else {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.invalid;
                if (!metadata[ReactiveSubscription]) {
                    context.$set(context.modelErrors, propertyNameOrRoute, error);
                }
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
        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
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
            validationGroups = context._validationGroup;
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
        const strategyName = ElementHelper.getSummaryStrategyFrom(element);
        const summaryStrategy = viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if (!summaryStrategy) {
            return;
        }
        const viewOptions = ElementHelper.getSummaryOptionsFrom(element) || {};
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
        const showErrorsFromGroup = (validationGroup) => {
            validationGroup.getModelErrors(false)
                .then(errors => {
                for (const propertyKey in errors) {
                    handleStateChange(new PropertyStateChangedEvent(propertyKey, false, errors[propertyKey]));
                }
            });
        };
        if (isArray) {
            validationGroups.forEach((validationGroup) => {
                const sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
                showErrorsFromGroup(validationGroup);
            });
        }
        else {
            const sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
            showErrorsFromGroup(validationGroups);
        }
    },
    unbind: function (element, binding, vnode) {
        const context = vnode.context;
        const metadata = context._validationMetadata;
        if (metadata[SummarySubKey]) {
            metadata[SummarySubKey].forEach((x) => x());
        }
    }
};
const install = function (Vue, options) {
    Vue.directive('show-error', showErrorDirective);
    Vue.directive('validation-summary', summaryDirective);
};
export { viewStrategyRegistry } from "@treacherous/view";
export { createRuleset, ruleRegistry } from "@treacherous/core";
export default {
    install: install
};
