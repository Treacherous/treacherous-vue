"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleRegistry = exports.createRuleset = exports.viewStrategyRegistry = exports.ValidateWith = void 0;
const core_1 = require("@treacherous/core");
const view_1 = require("@treacherous/view");
const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";
const ReactiveSubscription = "reactive-subscription";
const clearProperties = (obj) => {
    for (const key in obj) {
        delete obj.key;
    }
};
const populateProperties = (objA, objB) => {
    for (const key in objB) {
        objA[key] = objB[key];
    }
};
const ValidateWith = (ruleset, options = {}) => {
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
        beforeMount() {
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
                    if (options.validateProps && Reflect.has(context.$props, prop)) {
                        return Reflect.get(context.$props, prop);
                    }
                    if (options.validateComputed && Reflect.has(context.$computed, prop)) {
                        return Reflect.get(context.$computed, prop);
                    }
                    return undefined;
                }
            };
            const virtualModel = new Proxy(context.$data, proxyHandler);
            let validationGroupBuilder = core_1.createGroup();
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
                        delete context.modelErrors[args.property];
                    }
                    else {
                        context.modelErrors[args.property] = args.error;
                    }
                });
            }
            metadata[ValidationSubKey] = {};
            metadata[SummarySubKey] = [];
        },
        beforeUnmount() {
            const metadata = this._validationMetadata;
            if (metadata[ReactiveSubscription]) {
                metadata[ReactiveSubscription]();
            }
            this._validationGroup.release();
        }
    };
};
exports.ValidateWith = ValidateWith;
const showErrorDirective = {
    beforeMount: function (element, binding) {
        const context = binding.instance;
        const validationGroup = context._validationGroup;
        if (!validationGroup) {
            return;
        }
        const metadata = context._validationMetadata;
        const propertyRoute = view_1.ElementHelper.getPropertyRouteFrom(element);
        if (!propertyRoute) {
            return;
        }
        const propertyNameOrRoute = validationGroup.getPropertyDisplayName(propertyRoute);
        const strategyName = view_1.ElementHelper.getViewStrategyFrom(element);
        const viewStrategy = view_1.viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if (!viewStrategy) {
            return;
        }
        let validationState = view_1.ValidationState.unknown;
        const viewOptions = view_1.ElementHelper.getViewOptionsFrom(element) || {};
        let handlePossibleError = (error) => {
            if (!error) {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = view_1.ValidationState.valid;
                if (!metadata[ReactiveSubscription]) {
                    delete context.modelErrors[propertyNameOrRoute];
                }
            }
            else {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = view_1.ValidationState.invalid;
                if (!metadata[ReactiveSubscription]) {
                    context.modelErrors[propertyNameOrRoute] = error;
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
    unmounted: function (element, binding) {
        let context = binding.instance;
        let propertyRoute = view_1.ElementHelper.getPropertyRouteFrom(element);
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
    beforeMount: function (element, binding) {
        const context = binding.instance;
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
        const strategyName = view_1.ElementHelper.getSummaryStrategyFrom(element);
        const summaryStrategy = view_1.viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if (!summaryStrategy) {
            return;
        }
        const viewOptions = view_1.ElementHelper.getSummaryOptionsFrom(element) || {};
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
                    handleStateChange(new core_1.PropertyStateChangedEvent(propertyKey, false, errors[propertyKey]));
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
    unmounted: function (element, binding) {
        const context = binding.instance;
        const metadata = context._validationMetadata;
        if (metadata[SummarySubKey]) {
            metadata[SummarySubKey].forEach((x) => x());
        }
    }
};
const install = function (app, options) {
    app.directive('show-error', showErrorDirective);
    app.directive('validation-summary', summaryDirective);
};
var view_2 = require("@treacherous/view");
Object.defineProperty(exports, "viewStrategyRegistry", { enumerable: true, get: function () { return view_2.viewStrategyRegistry; } });
var core_2 = require("@treacherous/core");
Object.defineProperty(exports, "createRuleset", { enumerable: true, get: function () { return core_2.createRuleset; } });
Object.defineProperty(exports, "ruleRegistry", { enumerable: true, get: function () { return core_2.ruleRegistry; } });
exports.default = {
    install: install
};
