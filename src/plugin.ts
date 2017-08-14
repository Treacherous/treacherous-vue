import {Ruleset, createGroup, IReactiveValidationGroup, PropertyStateChangedEvent} from "treacherous";
import {viewStrategyRegistry, ElementHelper, ValidationState} from "treacherous-view";
import Vue from "vue";

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        ruleset?: Ruleset;
    }
}

export class TreacherousPlugin {

  public install(Vue: any, options: any) {
    Vue.mixin(this.mixins);
    Vue.directive('show-error', this.showError);
  }

  private mixins = {
    created: function () {
      if(!this.$options.ruleset)
      { return; }

      let ruleset = this.$options.ruleset;
      this.validationGroup = createGroup().asReactiveGroup().build(this, ruleset);
    }
  };

  private showError = {
    bind: function (element: HTMLElement, binding: any, vnode: any) {
        let validationGroup = <IReactiveValidationGroup>vnode.context.validationGroup;
        if(!validationGroup) { return; }

        let propertyRoute = ElementHelper.getPropertyRouteFrom(element);
        if(!propertyRoute) { return; }

        let strategyName = ElementHelper.getStrategyFrom(element);
        let viewStrategy = viewStrategyRegistry.getStrategyNamed(strategyName || "inline");
        if(!viewStrategy) { return; }

        let validationState = ValidationState.unknown;
        let viewOptions = ElementHelper.getOptionsFrom(element) || {};

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
      }
  }  
}