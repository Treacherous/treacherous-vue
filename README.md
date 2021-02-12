# Treacherous-Vue

<img src="https://user-images.githubusercontent.com/927201/29661471-03b5ee16-88bc-11e7-880d-d8c027b264c8.png"/> <img src="https://user-images.githubusercontent.com/927201/29662139-22a5f710-88be-11e7-996c-181d00a38802.png"/> 

## What is it?

It is a validation plugin for Vue that lets you validate on data, props, computed properties within your components.

- For Vue 2.x support use 0.4.x versions
- Version >= 0.5.x are for Vue 3.x 

**VIEW THE EXAMPLE/DEMO [HERE](https://rawgit.com/grofit/treacherous-vue/master/example/app.html)**

### Treacherous info

This is the Vue wrapper for [Treacherous](https://github.com/grofit/treacherous), which is slightly different in usage than the knockout and aurelia ones as it follows existing paradigms set by vues existing validation libraries.

It is worth reading over the Treacherous libraries if you want to do more than basic validation scenarios, they can be found:

- [@treacherous/core](https://github.com/treacherous/treacherous)
- [@trecherous/view](https://github.com/treacherous/treacherous-view)

## Usage

### Installation
To use treacherous in vue you will need to install this module:

```
npm install @treacherous/vue
```

Then register the plugin with vue:

```javascript
import Vue from "vue";
import TreacherousPlugin from "@treacherous/vue";

myApp.use(TreacherousPlugin);
```

Once you have done this you can use the `ValidateWith(ruleset, options?)` mixin.

#### HALP! I DONT USE MODULES
if you are living in the era before modules just grab the UMD module which adds you the `TreacherousVue` object, and you would do `Vue.use(TreacherousVue.default);`.

You will still need to include the treacherous UMD module which will provide `Treacherous` global for use.

### Simple Use Case

```javascript
import {createRuleset, ValidateWith} from "@treacherous/vue";

const ruleset = createRuleset()
        .forProperty("name")
            .addRule("required")
        .build();

myApp.component('my-component', {
    data: function() {
        name: "Bob"
    },
    template: '<input id="name" v-model="name" v-show-error validate-property="name" />',
    mixins: [ ValidateWith(ruleset) ]
});
```

So as seen above you can optionally provide for any component a `ruleset` property, which if used will pick up what rules you want to apply to the `data` contained within the component.

## What does the mixin give me?

When you register the mixin you get:

- `modelErrors` data object, which is kept up to date by the validation system
- `isValid` computed, which monitors the modelErrors and gives a high level true/false accessor
- `model-state-changed` event, which is raised whenever the validation state changes (passes out `{ isValid, modelErrors }`
- `getValidationGroup()` method, which gets the underlying validation group
- `refreshValidation()` method, which manually refreshes the underlying validation state

### What are the options I can provide?

- `withReactiveValidation: boolean` makes the view react to validation changes without you progmatically validating
- `validateOnStart: boolean` validates the model when the component is created and shows errors up front, rather than waiting for changes/progmatic validation calls
- `validateProps: boolean` enables validation of `props` fields (by default only `data` fields are used)
- `validateComputed: boolean` enables validation of `computed` fields (by default only `data` fields are used)

## What are the directives

- `v-show-error` this tells the element to display errors for validation elements (required you to set target property via `validate-property="some-data-property"`)
- `v-validation-summary` this should be passed the validation group/s you want to output a summary for

See examples for use cases on both of these directives.

## Docs

There are docs on each subject within the docs folder, its worth reading them and viewing the example to see how to use the framework and how to make use of treacherous features.

**VIEW THE DOCS [HERE](https://github.com/grofit/treacherous-vue/tree/master/docs)**

**VIEW THE EXAMPLE/DEMO [HERE](https://rawgit.com/grofit/treacherous-vue/master/example/app.html)**

## Credits

"Mountains" Icon courtesy of [The Noun Project](https://thenounproject.com/), by Aleksandr Vector, under [CC 3.0](http://creativecommons.org/licenses/by/3.0/us/)

"Vue" Icon courtesy of [vue.js](https://vuejs.org/) project