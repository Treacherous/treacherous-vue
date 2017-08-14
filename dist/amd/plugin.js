define(["require", "exports", "treacherous", "treacherous-view"], function (require, exports, treacherous_1, treacherous_view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TreacherousPlugin = (function () {
        function TreacherousPlugin() {
            this.mixins = {
                created: function () {
                    if (!this.$options.ruleset) {
                        return;
                    }
                    var ruleset = this.$options.ruleset;
                    this.validationGroup = treacherous_1.createGroup().asReactiveGroup().build(this, ruleset);
                }
            };
            this.showError = {
                bind: function (element, binding, vnode) {
                    var validationGroup = vnode.context.validationGroup;
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
                }
            };
        }
        TreacherousPlugin.prototype.install = function (Vue, options) {
            Vue.mixin(this.mixins);
            Vue.directive('show-error', this.showError);
        };
        return TreacherousPlugin;
    }());
    exports.TreacherousPlugin = TreacherousPlugin;
});
