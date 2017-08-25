import {IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewSummaryRegistry, ElementHelper} from "treacherous-view";

export const SummarySubKey = "summary-subscriptions";

export const summaryDirective = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;

        if(!context._validationMetadata)
        { 
            context._validationMetadata = {};
            context._validationMetadata[SummarySubKey] = []; 
        }

        let metadata = context._validationMetadata;
        let validationGroups: any = null;

        if(binding.value != null)
        { validationGroups = binding.value; }
        else
        { validationGroups = context.validationGroup; }
            
        if(!validationGroups) { return; }
        
        let isArray = Array.isArray(validationGroups);

        let getDisplayName = (propertyRoute: string) => {
            if(!isArray)
            { return (<IReactiveValidationGroup>validationGroups).getPropertyDisplayName(propertyRoute); }

            let finalName = propertyRoute;
            validationGroups.forEach((validationGroup: IReactiveValidationGroup) => {
               let returnedName = validationGroup.getPropertyDisplayName(propertyRoute);
               if(returnedName != propertyRoute)
               { finalName = returnedName; }
            });

            return finalName;
        };

        let strategyName = ElementHelper.getSummaryStrategyFrom(element);
        let summaryStrategy = viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if(!summaryStrategy) { return; }

        let viewOptions = ElementHelper.getSummaryOptionsFrom(element) || {};
        summaryStrategy.setupContainer(element, viewOptions);
        
        var handleStateChange = (eventArgs: PropertyStateChangedEvent) => {
            var displayName = getDisplayName(eventArgs.property);
            if(eventArgs.isValid)
            { summaryStrategy.propertyBecomeValid(element, displayName, viewOptions); }
            else
            { summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions); }
        };

        if(isArray)
        {
            validationGroups.forEach((validationGroup: IReactiveValidationGroup) => {
                let sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
            });
        }
        else
        {
            let sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
        }        
    },
    unbind: function (element: HTMLElement, binding: any, vnode: any) {
        let context = vnode.context;
        let metadata = context._validationMetadata;
        metadata[SummarySubKey].foreach((x: Function) => x());
    }
}
