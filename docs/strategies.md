# Strategies

By default there is an `inline` view strategy and a `default` summary strategy. These are both provided from the [`Trecherous View`](https://github.com/grofit/treacherous-view) library however these are just for default use and you can make your own strategies and register them for use within the system.

## Creating View Strategies

If you are using typescript you can make use of the `IViewStrategy` interface which provides you a common structure to adhere to. If you are not using typescript then no worries, you can just match the signatures.

Here is what the interface looks like (may change over time so keep an eye on the treacherous view lib):

```typescript
export interface IViewStrategy
{
    strategyName: string;
    propertyBecomeValid(element: HTMLElement, propertyRoute: string, previousState: ValidationState, viewOptions?: any)
    propertyBecomeInvalid(element: HTMLElement, error: string, propertyRoute: string, previousState: ValidationState, viewOptions?: any);
}
```

As you can see you need to provide a `strategyName` which is used by the `view-strategy` attribute and the `viewStrategyRegistry` to resolve strats.

You also need to provide it 2 entry methods, one for when the property becomes valid and one for when it becomes invalid.

### Example custom view strat

The example project contains a custom view strat to show how they work, but here is the code for it:

```javascript
import {IViewStrategy, ClassHelper, InlineHandler} from "@treacherous/view";

export function TooltipStrategy(inlineHandler = new InlineHandler())
{
    this.strategyName = "tooltip";

    this.propertyBecomeValid = function(element) {
        ClassHelper.removeClass(element, "invalid");
        ClassHelper.addClass(element, "valid");
        inlineHandler.removeErrorElement(element);
    }

    this.propertyBecomeInvalid = function(element, error) {
        ClassHelper.removeClass(element, "valid");
        ClassHelper.addClass(element, "invalid");
        let errorContainer = inlineHandler.addElementError("", element);
        errorContainer.setAttribute("data-tooltip", error);
    }
}
```

This is almost identical to the default handler in `treacherous-view` however we append the `data-tooltip` to the added element in the view which will in turn be displayed as a tooltip for the field that it is linked to.

## Creating Summary Strategies

Much like the view strategy there is an interface which view summary strategies should adhere to:

```typescript
export interface IViewSummaryStrategy
{
    summaryName: string;
    setupContainer(summaryContainerElement: HTMLElement, options: IViewSummaryOptions);
    propertyBecomeValid(summaryContainerElement: HTMLElement, propertyRoute: string, options: IViewSummaryOptions);
    propertyBecomeInvalid(summaryContainerElement: HTMLElement, error: string, propertyRoute: string, options: IViewSummaryOptions);
}
```

It is less likely you will want to change how this works, but if you do want to just implement your own version, and feel free to look at the default one provided [HERE](https://github.com/grofit/treacherous-view/blob/master/src/view-summary-strategies/default-summary-strategy.ts).

## Registering Strategies

Once you have created a new strategy you will need to register it so the system knows about it.

It is super simple to do, all you have to do is instantiate your strategy and pass it into the registry like so:

```javascript
viewStrategyRegistry.registerStrategy(new MyCustomViewStrategy());

viewSummaryRegistry.registerSummary(new MyCustomViewSummaryStrategy());
```

> All strategies are treated as stateless, so there is only one instance which all elements use, so it is advised that you do not persist any state within your strategies if you make any.

Once you have registered it you can use it anywhere by adding the `view-strategy` or `summary-strategy` attribute with the name you added within your implementation, i.e `tooltip` from the example view strat previously mentioned.

You should ideally do all registering of strategies within the setup of your app, however the registries provide a means for you to add/remove strategies at runtime so you are able to support plugin like architectures if needed.