# Useful Info

As mentioned before [treacherous](https://github.com/grofit/treacherous) is its own library which purely handles model validation in a cross platform way. So this library is just a wrapper around the treacherous core to expose the view concerns in a succinct way for you to consume.

If you want to create custom rules for your models, or make use of dynamic rules, virtual properties etc then it is recommended that you look at the [treacherous documentation](https://github.com/grofit/treacherous/tree/master/docs).

The core part that manages all validation is a `validationGroup` which is automatically created for you if your component has a ruleset applied. This `validationGroup` property is available on the component and can be quieried to find out validity of properties/models as well as getting individual errors or even doing fancier stuff, which is all documented in the code treacherous docs.

## Use of refs

The decision was made with this library to have the components own their own validation concerns, which is different to some of the other treacherous view wrappers (knockout, aurelia etc).

Because of the validation concerns being set at the component level, if you want to access the validation data inside the parent vm/component you will need to have a `ref` link to your component, and use that ref to access the internal `validationGroup` property which is appended to any component which uses the mixin.

This can complicate some scenarios such as view summaries, but it makes it easy to access any of the validation concerns on components and orchestrate from the parent.

## Rulesets

So to make use of this wrapper you need a component to provide a ruleset, this can be done many ways but it is recommended that you wrap your ruleset creation for your data into its own module and expose it.

This helps going forward because treacherous rulesets are composable in nature, so if you end up with a `User` model and you create a ruleset for that object, you could then have a `Company` model which contains many users and re-use that user ruleset within the company ruleset, which can save a lot of time and make code a bit cleaner.