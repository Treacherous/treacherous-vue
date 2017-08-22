System.register(["treacherous", "treacherous-view"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var treacherous_1, treacherous_view_1, treacherous_view_2, ValidationSubKey, SummarySubKey, mixins, showErrorDirective, summaryDirective, install;
    return {
        setters: [
            function (treacherous_1_1) {
                treacherous_1 = treacherous_1_1;
                exports_1({
                    "createRuleset": treacherous_1_1["createRuleset"],
                    "ruleRegistry": treacherous_1_1["ruleRegistry"]
                });
            },
            function (treacherous_view_1_1) {
                treacherous_view_1 = treacherous_view_1_1;
                treacherous_view_2 = treacherous_view_1_1;
                exports_1({
                    "viewStrategyRegistry": treacherous_view_1_1["viewStrategyRegistry"]
                });
            }
        ],
        execute: function () {
            ValidationSubKey = "validation-subscriptions";
            SummarySubKey = "summary-subscriptions";
            mixins = {
                created: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    var context = this;
                    var ruleset = context.$options.ruleset;
                    var validationGroup = treacherous_1.createGroup().asReactiveGroup().build(context, ruleset);
                    context.validationGroup = validationGroup;
                    var metadata = {};
                    context._validationMetadata = metadata;
                    metadata[ValidationSubKey] = {};
                    metadata[SummarySubKey] = [];
                },
                beforeDestroy: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    var context = this;
                    context.validationGroup.release();
                }
            };
            showErrorDirective = {
                bind: function (element, binding, vnode) {
                    var context = vnode.context;
                    var validationGroup = context.validationGroup;
                    if (!validationGroup) {
                        return;
                    }
                    var metadata = context._validationMetadata;
                    var propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
                    if (!propertyRoute) {
                        return;
                    }
                    var strategyName = treacherous_view_1.ElementHelper.getStrategyFrom(element);
                    var viewStrategy = treacherous_view_1.viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
                    if (!viewStrategy) {
                        return;
                    }
                    var validationState = treacherous_view_1.ValidationState.unknown;
                    var viewOptions = treacherous_view_1.ElementHelper.getOptionsFrom(element) || {};
                    var handlePossibleError = function (error) {
                        if (!error) {
                            viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                            validationState = treacherous_view_1.ValidationState.valid;
                        }
                        else {
                            viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                            validationState = treacherous_view_1.ValidationState.invalid;
                        }
                    };
                    var handlePropertyStateChange = function (args) {
                        handlePossibleError(args.error);
                    };
                    var propertyPredicate = function (args) {
                        return args.property == propertyRoute;
                    };
                    var sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
                    metadata[ValidationSubKey][propertyRoute] = sub;
                },
                unbind: function (element, binding, vnode) {
                    var context = vnode.context;
                    var propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
                    if (!propertyRoute) {
                        return;
                    }
                    var metadata = context._validationMetadata;
                    var outstandingSub = metadata[ValidationSubKey][propertyRoute];
                    if (outstandingSub) {
                        outstandingSub();
                    }
                }
            };
            summaryDirective = {
                bind: function (element, binding, vnode) {
                    var context = vnode.context;
                    if (!context._validationMetadata) {
                        context._validationMetadata = {};
                        context._validationMetadata[SummarySubKey] = [];
                    }
                    var metadata = context._validationMetadata;
                    var validationGroups = null;
                    if (binding.value != null) {
                        validationGroups = binding.value;
                    }
                    else {
                        validationGroups = context.validationGroup;
                    }
                    if (!validationGroups) {
                        return;
                    }
                    var isArray = Array.isArray(validationGroups);
                    var getDisplayName = function (propertyRoute) {
                        if (!isArray) {
                            return validationGroups.getPropertyDisplayName(propertyRoute);
                        }
                        var finalName = propertyRoute;
                        validationGroups.forEach(function (validationGroup) {
                            var returnedName = validationGroup.getPropertyDisplayName(propertyRoute);
                            if (returnedName != propertyRoute) {
                                finalName = returnedName;
                            }
                        });
                        return finalName;
                    };
                    var viewOptions = treacherous_view_1.ElementHelper.getOptionsFrom(element) || {};
                    var viewSummary = new treacherous_view_2.ViewSummary();
                    viewSummary.setupContainer(element);
                    var handleStateChange = function (eventArgs) {
                        var displayName = getDisplayName(eventArgs.property);
                        if (eventArgs.isValid) {
                            viewSummary.propertyBecomeValid(element, displayName);
                        }
                        else {
                            viewSummary.propertyBecomeInvalid(element, eventArgs.error, displayName);
                        }
                    };
                    if (isArray) {
                        validationGroups.forEach(function (validationGroup) {
                            var sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                            metadata[SummarySubKey].push(sub);
                        });
                    }
                    else {
                        var sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
                        metadata[SummarySubKey].push(sub);
                    }
                },
                unbind: function (element, binding, vnode) {
                    var context = vnode.context;
                    var metadata = context._validationMetadata;
                    metadata[SummarySubKey].foreach(function (x) { return x(); });
                }
            };
            install = function (Vue, options) {
                Vue.mixin(mixins);
                Vue.directive('show-error', showErrorDirective);
                Vue.directive('validation-summary', summaryDirective);
            };
            exports_1("default", {
                install: install
            });
        }
    };
});
