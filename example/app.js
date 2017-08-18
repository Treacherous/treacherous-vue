import Vue  from "vue/dist/vue";
import TreacherousVue from "../dist/commonjs/plugin"

import "./components/basic/basic.component";
import "./components/complex/complex.component";

Vue.use(TreacherousVue);

let app = new Vue({
    el: "#app",
    data: {
        basicState: true,
        complexState: true
    },
    methods: {
        validateBasic: function() { 
            let context = this;
            context.$refs.basic.validationGroup
                .validate()
                .then(function(isValid){
                    context.basicState = isValid
                });
        },
        validateComplex: function() {
            let context = this;
            context.$refs.complex.validationGroup
                .validate()
                .then(function(isValid){
                    context.complexState = isValid
                });
        }
    }
});