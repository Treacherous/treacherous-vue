import {
    Ruleset,
    createGroup,
    IValidationGroup,
    IReactiveValidationGroup,
    PropertyStateChangedEvent,
    ReactiveValidationGroupBuilder,
    ValidationGroupBuilder
} from "@treacherous/core";

import {viewStrategyRegistry, viewSummaryRegistry, ElementHelper, ValidationState} from "@treacherous/view";

export interface RulesetOptions {
    withReactiveValidation?: boolean;
    validateOnStart?: boolean;
    validateProps?: boolean;
    validateComputed?: boolean;
}

const ValidationSubKey = "validation-subscriptions";
const SummarySubKey = "summary-subscriptions";
const ReactiveSubscription = "reactive-subscription";


const clearProperties = (obj: any) => {
    for(const key in obj)
    { delete obj.key; }
};

const populateProperties = (objA: any, objB: any) => {
    for(const key in objB)
    { objA[key] = objB[key]; }
};

export const ValidateWith = (ruleset: Ruleset, options: RulesetOptions = {}) => {
    return {
        data() {
            return {
                modelErrors: {}
            }
        },
        computed: {
            isValid: function () {
                return Object.keys(this.modelErrors).length == 0;
            }
        },
        watch: {
            isValid: function(isValid: boolean) {
                this.$emit("model-state-changed", { isValid: isValid, errors: this.modelErrors });
            }
        },
        methods: {
            getValidationGroup: function() { return this._validationGroup; },
            refreshValidation: async function() {
                const newErrors = await (<IValidationGroup>this._validationGroup).getModelErrors(true);
                clearProperties(this.modelErrors);
                populateProperties(this.modelErrors, newErrors);
            }
        },
        beforeMount() {
            const context = <any>this;

            if(options.withReactiveValidation === undefined) { options.withReactiveValidation = false; }
            if(options.validateComputed === undefined) { options.validateComputed = false; }
            if(options.validateProps === undefined) { options.validateProps = false; }
            if(options.validateOnStart === undefined) { options.validateOnStart = false; }

            const proxyHandler = {
                get (obj: object, prop: PropertyKey) {
                    const hasProperty = Reflect.has(obj, prop);

                    if(hasProperty)
                    { return Reflect.get(obj, prop); }

                    if(options.validateProps && Reflect.has(context.$props, prop))
                    { return Reflect.get(context.$props, prop); }

                    if(options.validateComputed && Reflect.has(context.$computed, prop))
                    { return Reflect.get(context.$computed, prop); }

                    return undefined;
                }
            };

            const virtualModel = new Proxy(context.$data, proxyHandler);

            let validationGroupBuilder: ValidationGroupBuilder | ReactiveValidationGroupBuilder = createGroup();

            if(options.withReactiveValidation)
            { validationGroupBuilder =  validationGroupBuilder.asReactiveGroup(); }

            if(options.validateOnStart)
            { validationGroupBuilder = validationGroupBuilder.andValidateOnStart(); }

            const metadata: any = {};
            context._validationGroup = validationGroupBuilder.build(virtualModel, ruleset);
            context._validationMetadata = metadata;

            if(options.withReactiveValidation)
            {
                metadata[ReactiveSubscription] = context._validationGroup.propertyStateChangedEvent.subscribe((args: any) => {
                    if(args.isValid) 
                    { delete context.modelErrors[args.property]; }
                    else
                    { context.modelErrors[args.property] = args.error; }
                });
            }

            metadata[ValidationSubKey] = {};
            metadata[SummarySubKey] = [];
        },
        beforeUnmount() {
            const metadata = this._validationMetadata;

            if(metadata[ReactiveSubscription])
            { metadata[ReactiveSubscription](); }

            this._validationGroup.release();
        }
    }
};

const showErrorDirective = {
    beforeMount: function (element: HTMLElement, binding: any) {
        const context = binding.instance;
        const validationGroup = <IReactiveValidationGroup>context._validationGroup;
        if(!validationGroup) { return; }

        const metadata = context._validationMetadata;

        const propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        const propertyNameOrRoute = validationGroup.getPropertyDisplayName(propertyRoute);

        const strategyName = ElementHelper.getViewStrategyFrom(element);
        const viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        const viewOptions = ElementHelper.getViewOptionsFrom(element) || {};

        let handlePossibleError = (error: any) => {
            if(!error)
            {
                viewStrategy.propertyBecomeValid(element, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.valid;

                if(!metadata[ReactiveSubscription])
                { delete context.modelErrors[propertyNameOrRoute]; }
            }
            else
            {
                viewStrategy.propertyBecomeInvalid(element, error, propertyRoute, validationState, viewOptions);
                validationState = ValidationState.invalid;

                if(!metadata[ReactiveSubscription])
                { context.modelErrors[propertyNameOrRoute] = error; }
            }
        };

        const handlePropertyStateChange = (args: PropertyStateChangedEvent) => {
            handlePossibleError(args.error);
        };

        const propertyPredicate = (args: PropertyStateChangedEvent) => {
            return args.property == propertyRoute
        };

        const sub = validationGroup.propertyStateChangedEvent.subscribe(handlePropertyStateChange, propertyPredicate);
        metadata[ValidationSubKey][propertyRoute] = sub;
    },
    unmounted: function (element: HTMLElement, binding: any) {
        let context = binding.instance;
        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let metadata = context._validationMetadata;
        let outstandingSub = metadata[ValidationSubKey][propertyRoute];
        if(outstandingSub) { outstandingSub(); }
    }
}

const summaryDirective = {
    beforeMount: function (element: HTMLElement, binding: any) {
        const context = binding.instance;

        if(!context._validationMetadata)
        { 
            context._validationMetadata = {};
            context._validationMetadata[SummarySubKey] = []; 
        }

        const metadata = context._validationMetadata;
        let validationGroups: any = null;

        if(binding.value != null)
        { validationGroups = binding.value; }
        else
        { validationGroups = context._validationGroup; }
            
        if(!validationGroups) { return; }

        const isArray = Array.isArray(validationGroups);

        const getDisplayName = (propertyRoute: string) => {
            if(!isArray)
            { return (<IValidationGroup>validationGroups).getPropertyDisplayName(propertyRoute); }

            let finalName = propertyRoute;
            validationGroups.forEach((validationGroup: IValidationGroup) => {
               let returnedName = validationGroup.getPropertyDisplayName(propertyRoute);
               if(returnedName != propertyRoute)
               { finalName = returnedName; }
            });

            return finalName;
        };

        const strategyName = ElementHelper.getSummaryStrategyFrom(element);
        const summaryStrategy = viewSummaryRegistry.getSummaryNamed(strategyName || "default");
        if(!summaryStrategy) { return; }

        const viewOptions = ElementHelper.getSummaryOptionsFrom(element) || {};
        summaryStrategy.setupContainer(element, viewOptions);

        const handleStateChange = (eventArgs: PropertyStateChangedEvent) => {
            const displayName = getDisplayName(eventArgs.property);
            if(eventArgs.isValid)
            { summaryStrategy.propertyBecomeValid(element, displayName, viewOptions); }
            else
            { summaryStrategy.propertyBecomeInvalid(element, eventArgs.error, displayName, viewOptions); }
        };

        const showErrorsFromGroup = (validationGroup: IValidationGroup) => {
          validationGroup.getModelErrors(false)
            .then(errors => {
              for(const propertyKey in errors){
                handleStateChange(new PropertyStateChangedEvent(propertyKey, false, errors[propertyKey]));
              }
            });
        }

        if(isArray)
        {
            validationGroups.forEach((validationGroup: IReactiveValidationGroup) => {
                const sub = validationGroup.propertyStateChangedEvent.subscribe(handleStateChange);
                metadata[SummarySubKey].push(sub);
                showErrorsFromGroup(validationGroup);
            });
        }
        else
        {
            const sub = validationGroups.propertyStateChangedEvent.subscribe(handleStateChange);
            metadata[SummarySubKey].push(sub);
            showErrorsFromGroup(validationGroups);
        }  
    },
    unmounted: function (element: HTMLElement, binding: any) {
        const context = binding.instance;
        const metadata = context._validationMetadata;

        if(metadata[SummarySubKey])
        { metadata[SummarySubKey].forEach((x: Function) => x()); }
    }
}

const install = function(app: any, options: any) {
    app.directive('show-error', showErrorDirective);
    app.directive('validation-summary', summaryDirective);
}

export {viewStrategyRegistry} from "@treacherous/view";
export {createRuleset, ruleRegistry} from "@treacherous/core";

export default {
    install: install
}