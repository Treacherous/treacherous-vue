(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "treacherous", "treacherous-view", "treacherous", "treacherous-view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var treacherous_1 = require("treacherous");
    var treacherous_view_1 = require("treacherous-view");
    var treacherous_2 = require("treacherous");
    exports.createRuleset = treacherous_2.createRuleset;
    exports.ruleRegistry = treacherous_2.ruleRegistry;
    var treacherous_view_2 = require("treacherous-view");
    exports.viewStrategyRegistry = treacherous_view_2.viewStrategyRegistry;
    var ValidationSubKey = "validation-subscriptions";
    var install = function (Vue, options) {
        Vue.mixin(mixins);
        Vue.directive('show-error', showErrorDirective);
    };
    var mixins = {
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
    var showErrorDirective = {
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
    exports.default = {
        install: install
    };
});
