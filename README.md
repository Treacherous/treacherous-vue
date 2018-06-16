# Treacherous-Vue

<img src="https://user-images.githubusercontent.com/927201/29661471-03b5ee16-88bc-11e7-880d-d8c027b264c8.png"/> <img src="https://user-images.githubusercontent.com/927201/29662139-22a5f710-88be-11e7-996c-181d00a38802.png"/> 

## What is it?

It is a validation plugin for Vue that lets you validate on data, props, computed properties within your components.

**VIEW THE EXAMPLE/DEMO [HERE](https://rawgit.com/grofit/treacherous-vue/master/example/app.html)**

### Treacherous info

This is the Vue wrapper for [Treacherous](https://github.com/grofit/treacherous), which is slightly different in usage than the knockout and aurelia ones as it follows existing paradigms set by vues existing validation libraries.

It is worth reading over the Treacherous libraries if you want to do more than basic validation scenarios, they can be found:

- [Treacherous](https://github.com/grofit/treacherous)
- [Trecherous View](https://github.com/grofit/treacherous-view)

## Usage

### Installation
To use treacherous in vue you will need to install this module:

```
npm install treacherous-vue
```

Then register the plugin with vue:

```javascript
import Vue from "vue";
import TreacherousPlugin from "treacherous-vue";

Vue.use(TreacherousPlugin);
```

Once you have done this you can use the `ValidateWith(ruleset, options?)` mixin.

### Simple Use Case

```javascript
import {createRuleset, ValidateWith} from "treacherous-vue";

const ruleset = createRuleset()
        .forProperty("name")
            .addRule("required")
        .build()

Vue.component('my-component', {
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

- `validationGroup` data object, which is the underlying validation group
- `modelErrors` data object, which is kept up to date by the validation system
- `isValid` computed, which monitors the modelErrors and gives a high level true/false accessor
- `model-state-changed` event, which is raised whenever the validation state changes (passes out `{ isValid, modelErrors }`

## Docs

There are docs on each subject within the docs folder, its worth reading them and viewing the example to see how to use the framework and how to make use of treacherous features.

**VIEW THE DOCS [HERE](https://github.com/grofit/treacherous-vue/tree/master/docs)**

**VIEW THE EXAMPLE/DEMO [HERE](https://rawgit.com/grofit/treacherous-vue/master/example/app.html)**

## Credits

"Mountains" Icon courtesy of [The Noun Project](https://thenounproject.com/), by Aleksandr Vector, under [CC 3.0](http://creativecommons.org/licenses/by/3.0/us/)

"Vue" Icon courtesy of [vue.js](https://vuejs.org/) project