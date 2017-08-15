# Treacherous-Vue

So this is the Vue bridge for Treacherous, which is slightly different in usage than the knockout and aurelia ones as it follows existing paradigms by vues existing validation systems.

## Usage

### Installation
To use treacherous in vue you will need to install this module:

```
npm install treacherous-vue
```

Then register the plugin with vue:

```
import {TreacherousPlugin} from "treacherous-vue";
import Vue from "vue";

Vue.use(new TreacherousPlugin());
```

Once you have done this you can optionally include validation rulesets on your components and use the directives to control how the view reacts.

### Simple Use Case

```
import {createRuleset} from "treacherous-vue";

function generateRuleset()
{
    return createRuleset()
        .forProperty("name")
            .addRule("required")
        .build()
}

Vue.component('my-component', {
    ruleset: generateRuleset(),
    data: function() {
        name: "Bob"
    },
    template: '<input id="name" v-model="name" v-show-errors validate-property="name" />'
});
```

So as seen above you can optionally provide for any component a `ruleset` property, which if used will pick up what rules you want to apply to the data aspect.

To then show errors in the view you would need to use the `v-show-errors` directive, which doesn't take any arguments.

As part of the overall treacherous eco system all frameworks use a general html attribute called `validate-property` which defines what property you want to validate.