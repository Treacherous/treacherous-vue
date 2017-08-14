import "./components/user-data.component";
import {TreacherousPlugin} from "../../dist/commonjs/plugin"
import Vue  from "vue/dist/vue";

Vue.use(new TreacherousPlugin());

new Vue({
    el: "#app"
});