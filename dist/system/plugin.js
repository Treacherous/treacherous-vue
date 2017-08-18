System.register(["treacherous", "treacherous-view"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var treacherous_1, treacherous_view_1, ValidationSubKey, install, mixins, showErrorDirective;
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
                exports_1({
                    "viewStrategyRegistry": treacherous_view_1_1["viewStrategyRegistry"]
                });
            }
        ],
        execute: function () {
            ValidationSubKey = "validation-subscriptions";
            install = function (Vue, options) {
                Vue.mixin(mixins);
                Vue.directive('show-error', showErrorDirective);
            };
            mixins = {
                created: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    var context = this;
                    var ruleset = context.$options.ruleset;
                    var validationGroup = treacherous_1.createGroup().asReactiveGroup().build(context, ruleset);
                    context.validationGroup = validationGroup;
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
                    if (!context[ValidationSubKey]) {
                        context[ValidationSubKey] = {};
                    }
                    context[ValidationSubKey][propertyRoute] = sub;
                },
                unbind: function (element, binding, vnode) {
                    var context = vnode.context;
                    var propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
                    if (!propertyRoute) {
                        return;
                    }
                    var outstandingSub = context[ValidationSubKey][propertyRoute];
                    if (outstandingSub) {
                        outstandingSub();
                    }
                }
            };
            exports_1("default", {
                install: install
            });
        }
    };
});
