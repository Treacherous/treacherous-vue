# Example

The example can be found in the `example` folder and is quite simple in nature. It just shows common use cases for interacting with components validation state and displaying errors from the validation system in the view layer.

You can access the example as a demo **[HERE](https://rawgit.com/grofit/treacherous-vue/master/example/app.html)**

## Browsing the source

The source has tried to be as simple to follow as possible with the `app.html` and `app.js` being the entry point for the example, and ther being some components which each show some use cases.

There is a `compiled.js` which is the overall webpack output for everything and this can be ignored, but ultimately you can browse all the rest of the source and see how everything interacts and how rulesets are created and validation groups are hooked into.

### Basic component

The basic component is the bare minimum all in one component file (with a separate template) to just get your component up and running with validation, due to this it doesnt separate out data/rulesets/logic etc and should just bee seen as a whimsical simple example.

### Complex component

This one is a bit more realistic in the way that it separates out the ruleset into its own module, the data models into their own modules. This although being slightly more complicated is generally going to be more *real* in terms of the way you would consume this library in most use cases.