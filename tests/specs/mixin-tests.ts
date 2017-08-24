import Vue from "vue";
import {validationMixin} from "../../src/mixins/validation-mixin";
import {createRuleset} from "../../src/index";

import {use, expect, spy} from "chai";
import * as spies from "chai-spies";
use(spies);

describe("Mixin Tests", function() {
    
    it("should apply validation group to component with ruleset option", function () {

        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin]
        });

        let component = new ComponentWithMixin({
            ruleset: createRuleset().build()
        });

        component.$mount();
        expect(component).to.have.property("validationGroup");

        let validationGroupReleased = spy.on(component["validationGroup"], "release");

        component.$destroy();
        expect(validationGroupReleased).to.have.been.called;
        expect(component).to.not.have.property("validationGroup");
        expect(component).to.not.have.property("_validationMetadata");
    });

    it("should not apply validation group to component without ruleset option", function () {
        
        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin]
        });

        let component = new ComponentWithMixin();

        component.$mount();
        expect(component).to.not.have.property("validationGroup");
        expect(component).to.not.have.property("_validationMetadata");
    });

})