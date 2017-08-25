import Vue from "vue";
import {validationMixin} from "../../src/mixins/validation-mixin";
import {showErrorDirective, ValidationSubKey} from "../../src/directives/show-error";
import {createRuleset} from "../../src/index";
import {IReactiveValidationGroup} from "treacherous";

import {use, expect, spy} from "chai";
import * as spies from "chai-spies";
use(spies);

describe("Show Error Directive Tests", function() {
    
    it("should correctly subscribe to property with directive", function () {

        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin],
            directives: { "show-errors": showErrorDirective }
        });

        let data = { name: "bob" };

        let ruleset = createRuleset()
            .forProperty("name")
                .addRule("required")
            .build();

        let component = new ComponentWithMixin({
            ruleset: ruleset,
            data: () => { return data; },
            template: `<input v-model="name" v-show-errors validate-property="name"/>`
        });

        component.$mount();
        
        let validationGroup = <IReactiveValidationGroup>component["validationGroup"];
        let validationMetadata = component["_validationMetadata"];
        let activeSubscriptions = validationMetadata[ValidationSubKey];
        
        console.log(activeSubscriptions);
        
        expect(Object.keys(activeSubscriptions).length).to.equal(1);
        expect(activeSubscriptions).to.have.property("name");
        expect(validationGroup.propertyStateChangedEvent.getSubscriptionCount).to.equal(1);

        let activeSubscriptionReleased = spy.on(activeSubscriptions, "name");

        component.$destroy();
        expect(activeSubscriptionReleased).to.have.been.called;
    });

    it("should not subscribe to property with directive with missing property", function () {
        
        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin],
            directives: { "show-errors": showErrorDirective }
        });

        let ruleset = createRuleset()
        .forProperty("name")
            .addRule("required")
        .build();


        let data = { name: "bob" };
        
        let component = new ComponentWithMixin({
            ruleset: ruleset,
            data: () => { return data; },
            template: `<input v-model="name" v-show-errors/>`
        });

        component.$mount();
        
        let validationGroup = <IReactiveValidationGroup>component["validationGroup"];
        let validationMetadata = component["_validationMetadata"];
        let activeSubscriptions = validationMetadata[ValidationSubKey];
        
        console.log(activeSubscriptions);
        
        expect(Object.keys(activeSubscriptions).length).to.equal(0);
        expect(validationGroup.propertyStateChangedEvent.getSubscriptionCount).to.equal(0);

        let activeSubscriptionReleased = spy.on(activeSubscriptions, "name");

        component.$destroy();
        expect(activeSubscriptionReleased).to.have.been.called;
    });

    it("should not subscribe to property with directive with invalid property", function () {
        
        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin],
            directives: { "show-errors": showErrorDirective }
        });

        let ruleset = createRuleset()
        .forProperty("name")
            .addRule("required")
        .build();


        let data = { name: "bob" };
        
        let component = new ComponentWithMixin({
            ruleset: ruleset,
            data: () => { return data; },
            template: `<input v-model="name" v-show-errors validate-property="invalid"/>`
        });

        component.$mount();
        
        let validationGroup = <IReactiveValidationGroup>component["validationGroup"];
        let validationMetadata = component["_validationMetadata"];
        let activeSubscriptions = validationMetadata[ValidationSubKey];
        
        console.log(activeSubscriptions);
        
        expect(Object.keys(activeSubscriptions).length).to.equal(0);
        expect(validationGroup.propertyStateChangedEvent.getSubscriptionCount).to.equal(0);

        let activeSubscriptionReleased = spy.on(activeSubscriptions, "name");

        component.$destroy();
        expect(activeSubscriptionReleased).to.have.been.called;
    });

    it("should not subscribe to property with directive when missing ruleset", function () {
        
        let ComponentWithMixin = Vue.extend({
            mixins: [validationMixin],
            directives: { "show-errors": showErrorDirective }
        });

        let data = { name: "bob" };
        
        let component = new ComponentWithMixin({
            data: () => { return data; },
            template: `<input v-model="name" v-show-errors validate-property="name"/>`
        });

        component.$mount();
        
        let validationMetadata = component["_validationMetadata"];
        expect(validationMetadata).is.undefined;

        component.$destroy();
    });

});