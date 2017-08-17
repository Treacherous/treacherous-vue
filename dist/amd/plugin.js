define(["require", "exports", "treacherous", "treacherous-view", "treacherous", "treacherous-view"], function (require, exports, treacherous_1, treacherous_view_1, treacherous_2, treacherous_view_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createRuleset = treacherous_2.createRuleset;
    exports.ruleRegistry = treacherous_2.ruleRegistry;
    exports.viewStrategyRegistry = treacherous_view_2.viewStrategyRegistry;
    var TreacherousPlugin = (function () {
        function TreacherousPlugin() {
            this.mixins = {
                created: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    var ruleset = this.$options.ruleset;
                    var validationGroup = treacherous_1.createGroup().asReactiveGroup().build(this, ruleset);
                    var modelStateUpdater = function (isValid) {
                        this.$emit("update:is-valid", isValid);
                    };
                    this.validationGroup = validationGroup;
                    this.modelStateSub = validationGroup.modelStateChangedEvent.subscribe(modelStateUpdater);
                },
                beforeDestroy: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    this.modelStateSub();
                    this.validationGroup.release();
                }
            };
            this.showError = {
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
                    if (!context[TreacherousPlugin.ValidationSubKey]) {
                        context[TreacherousPlugin.ValidationSubKey] = {};
                    }
                    context[TreacherousPlugin.ValidationSubKey][propertyRoute] = sub;
                },
                unbind: function (element, binding, vnode) {
                    var context = vnode.context;
                    var propertyRoute = treacherous_view_1.ElementHelper.getPropertyRouteFrom(element);
                    if (!propertyRoute) {
                        return;
                    }
                    var outstandingSub = context[TreacherousPlugin.ValidationSubKey][propertyRoute];
                    if (outstandingSub) {
                        outstandingSub();
                    }
                }
            };
        }
        TreacherousPlugin.prototype.install = function (Vue, options) {
            Vue.mixin(this.mixins);
            Vue.directive('show-error', this.showError);
        };
        TreacherousPlugin.ValidationSubKey = "validation-subscriptions";
        return TreacherousPlugin;
    }());
    exports.TreacherousPlugin = TreacherousPlugin;
});
