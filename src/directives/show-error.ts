import {Ruleset, IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewStrategyRegistry, ElementHelper, ValidationState} from "treacherous-view";

export const ValidationSubKey = "validation-subscriptions";

export const showErrorDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let validationGroup = <IReactiveValidationGroup>context.validationGroup;
        if(!validationGroup) { return; }

        let metadata = context._validationMetadata;

        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let strategyName = ElementHelper.getViewStrategyFrom(element);
        let viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        let viewOptions = ElementHelper.getViewOptionsFrom(element) || {};

        let handlePossibleError = (error: any) => {
            if(!error)
            {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.valid;
            }
            else
            {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.invalid;
            }
        };

        let handlePropertyStateChange = (args: PropertyStateChangedEvent) => {
            handlePossibleError(args.error);
        };

        let propertyPredicate = (args: PropertyStateChangedEvent) => {
            return args.property == propertyRoute
        };

        let sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
        metadata[ValidationSubKey][propertyRoute] = sub;
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let metadata = context._validationMetadata;
        let outstandingSub = metadata[ValidationSubKey][propertyRoute];
        if(outstandingSub) { outstandingSub(); }
    }
}
