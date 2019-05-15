!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("@treacherous/core")):"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.TreacherousVue=t(require("@treacherous/core")):e.TreacherousVue=t(e.Treacherous)}(window,function(e){return function(e){var t={};function r(a){if(t[a])return t[a].exports;var i=t[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(a,i,function(t){return e[t]}.bind(null,i));return a},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(t,r){t.exports=e},function(e,t){e.exports=Vue},function(e,t,r){"use strict";r.r(t);var a=r(0);class i{}i.hasClass=((e,t)=>e.classList?e.classList.contains(t):!!e.className.match(new RegExp(`(\\s|^)${t}(\\s|$)`))),i.addClass=((e,t)=>{e.classList?e.classList.add(t):i.hasClass(e,t)||(e.errorClassName+=" "+t)}),i.removeClass=((e,t)=>{if(e.classList)e.classList.remove(t);else if(i.hasClass(e,t)){const r=new RegExp(`(\\s|^)${t}(\\s|$)`);e.errorClassName=e.className.replace(r," ")}});class o{constructor(){this.getElementValidatorId=(e=>(e.getAttribute("id")||e.setAttribute("id","unique-"+o.currentCount++),e.getAttribute("id")+"-error-container")),this.createErrorElement=((e,t)=>{let r=this.getElementValidatorId(t),a=document.createElement("div");return a.id=r,a.className="validation-error-container",a.textContent=e,t.parentElement.appendChild(a),a}),this.removeErrorElement=function(e){let t=this.getElementValidatorId(e),r=document.getElementById(t);r&&r.parentElement.removeChild(r)},this.addElementError=function(e,t){let r=this.getElementValidatorId(t);return document.getElementById(r)?(this.removeErrorElement(t),this.createErrorElement(e,t)):this.createErrorElement(e,t)}}}o.currentCount=1;class n{constructor(){this.applyContainerClass=(e=>{i.addClass(e,n.containerClassName)}),this.getPropertyElementName=(e=>{let t=e.replace(/[\W]/g,"-");return`${n.elementIdFormat}${t}`}),this.getPropertyErrorElement=((e,t)=>{let r=this.getPropertyElementName(t);return e.querySelector(`#${r}`)}),this.createPropertyErrorElement=((e,t,r)=>{let a=this.getPropertyElementName(r),i=document.createElement("div");return i.id=a,i.className=n.errorClassName,i.textContent=e,i.setAttribute("property-route",r),t.appendChild(i),i}),this.removePropertyErrorElement=((e,t)=>{let r=this.getPropertyErrorElement(e,t);r&&e.removeChild(r)})}}n.elementIdFormat="summary-error-for-",n.errorClassName="summary-error",n.containerClassName="validation-summary-container";var s=new class{constructor(){this.strategies={},this.registerStrategy=(e=>{this.strategies[e.strategyName]=e}),this.unregisterStrategy=(e=>{delete this.strategies[e.strategyName]}),this.getStrategyNamed=(e=>this.strategies[e]||null),this.hasStrategyNamed=(e=>null!=this.getStrategyNamed(e))}};s.registerStrategy(new class{constructor(e=new o){this.inlineHandler=e,this.strategyName="inline"}propertyBecomeValid(e){i.removeClass(e,"invalid"),i.addClass(e,"valid"),this.inlineHandler.removeErrorElement(e)}propertyBecomeInvalid(e,t){i.removeClass(e,"valid"),i.addClass(e,"invalid"),this.inlineHandler.addElementError(t,e)}});var l,u=new class{constructor(){this.summaries={},this.registerSummary=(e=>{this.summaries[e.summaryName]=e}),this.unregisterSummary=(e=>{delete this.summaries[e.summaryName]}),this.getSummaryNamed=(e=>this.summaries[e]||null),this.hasSummaryNamed=(e=>null!=this.getSummaryNamed(e))}};u.registerSummary(new class{constructor(e=new n){this.summaryHandler=e,this.summaryName="default"}setupContainer(e){this.summaryHandler.applyContainerClass(e)}propertyBecomeValid(e,t){this.summaryHandler.removePropertyErrorElement(e,t)}propertyBecomeInvalid(e,t,r){let a=`${r} - ${t}`;this.summaryHandler.removePropertyErrorElement(e,r),this.summaryHandler.createPropertyErrorElement(a,e,r)}});class d{static literalToJson(e){let t,r=`{ ${e} }`.replace(d.jsLiteralRegex,'$1"$2":');try{t=JSON.parse(r)}catch(t){console.warn(`unable to process literal: ${e}`,t)}return t||{}}}d.jsLiteralRegex=/({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;class c{static getPropertyRouteFrom(e){return e.getAttribute(c.ValidatePropertyAttributeName)}static getViewStrategyFrom(e){return e.getAttribute(c.ViewStrategyAttributeName)}static getViewOptionsFrom(e){let t=e.getAttribute(c.ViewOptionsAttributeName);if(t)return d.literalToJson(t)}static getSummaryStrategyFrom(e){return e.getAttribute(c.ViewSummaryStrategyAttributeName)}static getSummaryOptionsFrom(e){let t=e.getAttribute(c.SummaryOptionsAttributeName);if(t)return d.literalToJson(t)}}c.ValidatePropertyAttributeName="validate-property",c.ViewStrategyAttributeName="view-strategy",c.ViewOptionsAttributeName="view-options",c.ViewSummaryStrategyAttributeName="view-summary-strategy",c.SummaryOptionsAttributeName="summary-options",function(e){e[e.unknown=0]="unknown",e[e.valid=1]="valid",e[e.invalid=2]="invalid"}(l||(l={}));var m=r(1),p=r.n(m);r.d(t,"ValidateWith",function(){return h}),r.d(t,"viewStrategyRegistry",function(){return s}),r.d(t,"createRuleset",function(){return a.createRuleset}),r.d(t,"ruleRegistry",function(){return a.ruleRegistry});var y=function(e,t,r,a){return new(r||(r=Promise))(function(i,o){function n(e){try{l(a.next(e))}catch(e){o(e)}}function s(e){try{l(a.throw(e))}catch(e){o(e)}}function l(e){e.done?i(e.value):new r(function(t){t(e.value)}).then(n,s)}l((a=a.apply(e,t||[])).next())})};const v="summary-subscriptions",h=(e,t={})=>({data:()=>({modelErrors:{}}),computed:{isValid:function(){return 0==Object.keys(this.modelErrors).length}},watch:{isValid:function(e){this.$emit("model-state-changed",{isValid:e,errors:this.modelErrors})}},methods:{getValidationGroup:function(){return this._validationGroup},refreshValidation:function(){return y(this,void 0,void 0,function*(){const e=yield this._validationGroup.getModelErrors(!0);(e=>{for(const t in e)p.a.delete(e,t)})(this.modelErrors),((e,t)=>{for(const r in t)p.a.set(e,r,t[r])})(this.modelErrors,e)})}},created(){const r=this;void 0===t.withReactiveValidation&&(t.withReactiveValidation=!1),void 0===t.validateComputed&&(t.validateComputed=!1),void 0===t.validateProps&&(t.validateProps=!1),void 0===t.validateOnStart&&(t.validateOnStart=!1);const i={get:(e,a)=>Reflect.has(e,a)?Reflect.get(e,a):t.validateProps&&Reflect.has(r._props,a)?Reflect.get(r._props,a):t.validateComputed&&Reflect.has(r._computed,a)?Reflect.get(r._computed,a):void 0},o=new Proxy(r._data,i);let n=Object(a.createGroup)();t.withReactiveValidation&&(n=n.asReactiveGroup()),t.validateOnStart&&(n=n.andValidateOnStart());const s={};r._validationGroup=n.build(o,e),r._validationMetadata=s,t.withReactiveValidation&&(s["reactive-subscription"]=r._validationGroup.propertyStateChangedEvent.subscribe(e=>{e.isValid?r.$delete(r.modelErrors,e.property):r.$set(r.modelErrors,e.property,e.error)})),s["validation-subscriptions"]={},s[v]=[]},beforeDestroy(){const e=this._validationMetadata;e["reactive-subscription"]&&e["reactive-subscription"](),this._validationGroup.release()}}),g={bind:function(e,t,r){const a=r.context,i=a._validationGroup;if(!i)return;const o=a._validationMetadata,n=c.getPropertyRouteFrom(e);if(!n)return;const u=i.getPropertyDisplayName(n),d=c.getViewStrategyFrom(e),m=s.getStrategyNamed(d||"inline");if(!m)return;let p=l.unknown;const y=c.getViewOptionsFrom(e)||{};const v=i.propertyStateChangedEvent.subscribe(t=>{(t=>{t?(m.propertyBecomeInvalid(e,t,n,p,y),p=l.invalid,o["reactive-subscription"]||a.$set(a.modelErrors,u,t)):(m.propertyBecomeValid(e,n,p,y),p=l.valid,o["reactive-subscription"]||a.$delete(a.modelErrors,u))})(t.error)},e=>e.property==n);o["validation-subscriptions"][n]=v},unbind:function(e,t,r){let a=r.context,i=c.getPropertyRouteFrom(e);if(!i)return;let o=a._validationMetadata["validation-subscriptions"][i];o&&o()}},f={bind:function(e,t,r){const i=r.context;i._validationMetadata||(i._validationMetadata={},i._validationMetadata[v]=[]);const o=i._validationMetadata;let n=null;if(!(n=null!=t.value?t.value:i._validationGroup))return;const s=Array.isArray(n),l=c.getSummaryStrategyFrom(e),d=u.getSummaryNamed(l||"default");if(!d)return;const m=c.getSummaryOptionsFrom(e)||{};d.setupContainer(e,m);const p=t=>{const r=(e=>{if(!s)return n.getPropertyDisplayName(e);let t=e;return n.forEach(r=>{let a=r.getPropertyDisplayName(e);a!=e&&(t=a)}),t})(t.property);t.isValid?d.propertyBecomeValid(e,r,m):d.propertyBecomeInvalid(e,t.error,r,m)},y=e=>{e.getModelErrors(!1).then(e=>{for(const t in e)p(new a.PropertyStateChangedEvent(t,!1,e[t]))})};if(s)n.forEach(e=>{const t=e.propertyStateChangedEvent.subscribe(p);o[v].push(t),y(e)});else{const e=n.propertyStateChangedEvent.subscribe(p);o[v].push(e),y(n)}},unbind:function(e,t,r){const a=r.context._validationMetadata;a[v]&&a[v].forEach(e=>e())}};t.default={install:function(e,t){e.directive("show-error",g),e.directive("validation-summary",f)}}}])});