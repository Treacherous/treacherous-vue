import {createApp} from "vue/dist/vue.esm-browser";

// Grab the plugin for use in Vue
import TreacherousVue from "../dist/commonjs/plugin"

// Add custom strategy for complex example
import {viewStrategyRegistry} from "../dist/commonjs/plugin"
import {TooltipStrategy} from "./custom-view/tooltip-strategy"
viewStrategyRegistry.registerStrategy(new TooltipStrategy());

// Add our components for examples
import {basicComponent} from "./components/basic/basic.component";
import {complexComponent} from "./components/complex/complex.component";

// Setup parent data, the validation is handled in the children but the parents can hook in if they need to
let appData = {
    isBasicValid: true,                     // Just to show the parent can listen to events from child
    isComplexValid: true,                   // ^^
    validationSummaryGroups: null,            // This is used to collate the 2 child validation groups for a summary on parent
    dummyPropData: { blah: "dummy value" }  // This is just to show you can validate on properties
};

// Grab the validation groups from the components for use in
// validation summary, this wont be available at page load
// but we use v-if in the view to delay this
let onMounted = function() {
    this.validationSummaryGroups = [];
    this.validationSummaryGroups.push(this.$refs.basic.getValidationGroup());
    this.validationSummaryGroups.push(this.$refs.complex.getValidationGroup());
}

// The components we want to use
const components = {
    'basic': basicComponent,
    'complex': complexComponent
};

// Start the app
let app = createApp({
    components: components,
    data() { return appData },
    mounted: onMounted
});

// This is all you need to do to use the plugin in vue
app.use(TreacherousVue);

// Start the app
app.mount('#app')