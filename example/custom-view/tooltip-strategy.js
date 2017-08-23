import {IViewStrategy, ClassHelper, InlineHandler} from "treacherous-view";

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