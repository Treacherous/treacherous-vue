import Vue  from "vue/dist/vue";

// This is all you need to do to add the plugin
import TreacherousVue from "../dist/commonjs/index"
Vue.use(TreacherousVue);

// Add custom strategy for complex example
import {viewStrategyRegistry} from "../dist/commonjs/index"
import {TooltipStrategy} from "./custom-view/tooltip-strategy"
viewStrategyRegistry.registerStrategy(new TooltipStrategy());

// Add our components for examples
import "./components/basic/basic.component";
import "./components/complex/complex.component";

// Setup basic data placeholders that hook into the validation groups
let appData = {
    basicState: true,
    complexState: true,
    validationSummaryGroups: null
};

// Explicitly check to see if the component is valid
let validateBasicComponent = function() { 
    let context = this;
    let basicValidationGroup = context.$refs.basic.validationGroup;

    // We ask the validation group if its valid, which returns a promise
    basicValidationGroup
        .validate()
        .then((isValid) => {
            context.basicState = isValid
        });
};

// Explicitly check to see if the component is valid
let validateComplexComponent = function() {
    let context = this;
    let complexValidationGroup = context.$refs.complex.validationGroup;
    
    // We ask the validation group if its valid, which returns a promise
    complexValidationGroup
        .validate()
        .then((isValid) => {
            context.complexState = isValid
        });
};

// Grab the validation groups from the components for use in 
// validation summary, this wont be available at page load
// but we use v-if in the view to delay this
let onMounted = function() {
    this.validationSummaryGroups = [];
    this.validationSummaryGroups.push(this.$refs.basic.validationGroup);
    this.validationSummaryGroups.push(this.$refs.complex.validationGroup);
}

// Start the app
let app = new Vue({
    el: "#app",
    data: appData,
    methods: {
        validateBasic: validateBasicComponent,
        validateComplex: validateComplexComponent
    },
    mounted: onMounted
});