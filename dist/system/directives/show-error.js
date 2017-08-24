System.register(["treacherous-view"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var treacherous_view_1, ValidationSubKey, showErrorDirective;
    return {
        setters: [
            function (treacherous_view_1_1) {
                treacherous_view_1 = treacherous_view_1_1;
            }
        ],
        execute: function () {
            exports_1("ValidationSubKey", ValidationSubKey = "validation-subscriptions");
            exports_1("showErrorDirective", showErrorDirective = {
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
                    var strategyName = treacherous_view_1.ElementHelper.getViewStrategyFrom(element);
                    var viewStrategy = treacherous_view_1.viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
                    if (!viewStrategy) {
                        return;
                    }
                    var validationState = treacherous_view_1.ValidationState.unknown;
                    var viewOptions = treacherous_view_1.ElementHelper.getViewOptionsFrom(element) || {};
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
            });
        }
    };
});
