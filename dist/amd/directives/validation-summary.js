define(["require", "exports", "treacherous-view"], function (require, exports, treacherous_view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SummarySubKey = "summary-subscriptions";
    exports.summaryDirective = {
        bind: function (element, binding, vnode) {
            var context = vnode.context;
            if (!context._validationMetadata) {
                context._validationMetadata = {};
                context._validationMetadata[exports.SummarySubKey] = [];
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
            var strategyName = treacherous_view_1.ElementHelper.getSummaryStrategyFrom(element);
            var summaryStrategy = treacherous_view_1.viewSummaryRegistry.getSummaryNamed(strategyName || "default");
            if (!summaryStrategy) {
                return;
            }
            var viewOptions = treacherous_view_1.ElementHelper.getSummaryOptionsFrom(element) || {};
            summaryStrategy.setupContainer(element, viewOptions);
            var handleStateChange = function (eventArgs) {
                var displayName = getDisplayName(eventArgs.property);
                if (eventArgs.isValid) {
                    summaryStrategy.propertyBecomeValid(element, displayName, viewOptions);
                }
                else {
                    summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions);
                }
            };
            if (isArray) {
                validationGroups.forEach(function (validationGroup) {
                    var sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                    metadata[exports.SummarySubKey].push(sub);
                });
            }
            else {
                var sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[exports.SummarySubKey].push(sub);
            }
        },
        unbind: function (element, binding, vnode) {
            var context = vnode.context;
            var metadata = context._validationMetadata;
            metadata[exports.SummarySubKey].foreach(function (x) { return x(); });
        }
    };
});
