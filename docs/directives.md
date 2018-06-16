# Directives

This plugin adds some directives to allow you to hook into the validation system within the view layer, this simplifies the overall use cases without having to litter your view with too much guff.

## v-show-error

To show errors in the view on a per element basis you would need to use the `v-show-error` directive, which doesn't take any arguments, as it follows the general [`treacherous-view`](https://github.com/grofit/treacherous-view) conventions and uses normal html attributes to infer how to handle validation.

You can put the `v-show-error` on any element you want, so you can attach it to the input/element that cotains a binding to the data or you can just put it on some other element anywhere else in the component, as long as you provide it the `validate-property` attribute.

### `validate-property` Attribute

This indicates the property to be validated when showing the errors. So like in the previous example if you had a `name` property and you wanted to show a validation error for that property you can put that property route/name into the attribute for the `v-show-error` to look at, as mentioned they can be used on any element like so:

```html
// Just adding view errors to the input
<input id="name-input" placeholder="Name" validate-property="name" v-show-error />

// Adding view errors anywhere else
<div id="name-error-div" validate-property="name" v-show-error />

// Adding view errors for arrays
<div v-for="(hobby, index) in hobbies">
    <input type="text" v-model="hobby.name" placeholder="Hobby" v-show-error v-bind:validate-property="'hobbies[' + index + '].name'" />
</div>
```

As you can see the `validate-property` attribute should reflect the specific route to the property, as if you were going to access it in code, i.e `someObject.someNestedObject.someArray[2].name` that would show errors for the name on the 2nd element in the array within a nested object within the original object.

You can see more on this in the complex example within the examples folder.

### `view-strategy` Attribute

This attribute lets you infer what view strategy to use for your error display. By default there is an `inline` handler which will be used if no strategy is explicitly provided.

```html
// Telling this error to use a custom tooltip strategy
<input id="name-input" placeholder="Name" validate-property="name" view-strategy="tooltip" v-show-error />
```

A use case for this can be seen in the [example](https://rawgit.com/grofit/treacherous-vue/master/example/app.html).

See the docs on registering custom view and summary strategies for more info on how to write/consume custom strats.

### `view-options` Attribute

This attribute allows you to provide custom data to the view strategy you are using, it is completely optional but can be provided to tell your custom view strats how to behave.

```html
<div id="name-error" validate-property="name" view-strategy="custom-strat" view-options="color: 'red', size: 12, foo: { bar: true }" v-show-error />
```

## v-validation-summary

This directive allows you to show blocks of validation errors. This is more for those use cases where you do not want per-field validation and just want a single summary of all validation errors.

You can pass this a singular validation group or multiple validation groups which will output all errors across all the validation groups.

```html
<div id="validation-summary" v-if="validationGroup != null" v-validation-summary="validationGroup"></div>
```

This may seem a bit quirky, but as validation groups are held against the component not the parent, you generally access them through `refs` (see more in other docs on this subject), so you can only realistically access this data in the `mounted` phase, so the `v-if` is required here to delay the summary until the validation group is available.

The [example](https://rawgit.com/grofit/treacherous-vue/master/example/app.html) shows how to handle this use case.

### `view-summary-strategy` Attribute

This attribute is much like the `view-strategy` one where you can infer what summary strategy you wish to use. If none is provided the default one is used.

### `summary-options` Attribute

Much like the `view-options` this lets you pass in custom options to your view summary strategy. Much like the `view-options` it passes the data onto the strategy.