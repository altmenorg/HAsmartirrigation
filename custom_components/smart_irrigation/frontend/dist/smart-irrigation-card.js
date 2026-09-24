!function(t){"use strict";function e(t,e,i,s){var n,o=arguments.length,r=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(o<3?n(r):o>3?n(e,i,r):n(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const i=window,s=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,n))(e)})(t):t
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var l;const h=window,d=h.trustedTypes,c=d?d.emptyScript:"",u=h.reactiveElementPolyfillSupport,_={toAttribute(t,e){switch(e){case Boolean:t=t?c:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},p=(t,e)=>e!==t&&(e==e||t==t),v={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:p},m="finalized";let g=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(t){var e;this.finalize(),(null!==(e=this.h)&&void 0!==e?e:this.h=[]).push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))})),t}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||v}static finalize(){if(this.hasOwnProperty(m))return!1;this[m]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}_$Eu(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{s?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const s=document.createElement("style"),n=i.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=e.cssText,t.appendChild(s)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=v){var s;const n=this.constructor._$Ep(t,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:_).toAttribute(e,i.type);this._$El=t,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,n=s._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=s.getPropertyOptions(n),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:_;this._$El=n,this[n]=o.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||p)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var f;g[m]=!0,g.elementProperties=new Map,g.elementStyles=[],g.shadowRootOptions={mode:"open"},null==u||u({ReactiveElement:g}),(null!==(l=h.reactiveElementVersions)&&void 0!==l?l:h.reactiveElementVersions=[]).push("1.6.3");const $=window,y=$.trustedTypes,w=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,b="$lit$",A=`lit$${(Math.random()+"").slice(9)}$`,S="?"+A,E=`<${S}>`,x=document,C=()=>x.createComment(""),z=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,T="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,U=/>/g,H=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,R=/"/g,M=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),j=Symbol.for("lit-noChange"),L=Symbol.for("lit-nothing"),D=new WeakMap,B=x.createTreeWalker(x,129,null,!1);function V(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==w?w.createHTML(e):e}const W=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":"",r=P;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===P?"!--"===l[1]?r=O:void 0!==l[1]?r=U:void 0!==l[2]?(M.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=H):void 0!==l[3]&&(r=H):r===H?">"===l[0]?(r=null!=n?n:P,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?H:'"'===l[3]?R:N):r===R||r===N?r=H:r===O||r===U?r=P:(r=H,n=void 0);const c=r===H&&t[e+1].startsWith("/>")?" ":"";o+=r===P?i+E:h>=0?(s.push(a),i.slice(0,h)+b+i.slice(h)+A+c):i+A+(-2===h?(s.push(void 0),e):c)}return[V(t,o+(t[i]||"<?>")+(2===e?"</svg>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,a=this.parts,[l,h]=W(t,e);if(this.el=Z.createElement(l,i),B.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=B.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith(b)||e.startsWith(A)){const i=h[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+b).split(A),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?G:"?"===e[1]?X:"@"===e[1]?Y:J})}else a.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(M.test(s.tagName)){const t=s.textContent.split(A),e=t.length-1;if(e>0){s.textContent=y?y.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],C()),B.nextNode(),a.push({type:2,index:++n});s.append(t[e],C())}}}else if(8===s.nodeType)if(s.data===S)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(A,t+1));)a.push({type:7,index:n}),t+=A.length-1}n++}}static createElement(t,e){const i=x.createElement("template");return i.innerHTML=t,i}}function q(t,e,i=t,s){var n,o,r,a;if(e===j)return e;let l=void 0!==s?null===(n=i._$Co)||void 0===n?void 0:n[s]:i._$Cl;const h=z(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==h&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===h?l=void 0:(l=new h(t),l._$AT(t,i,s)),void 0!==s?(null!==(r=(a=i)._$Co)&&void 0!==r?r:a._$Co=[])[s]=l:i._$Cl=l),void 0!==l&&(e=q(t,l._$AS(t,e.values),l,s)),e}class K{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:x).importNode(i,!0);B.currentNode=n;let o=B.nextNode(),r=0,a=0,l=s[0];for(;void 0!==l;){if(r===l.index){let e;2===l.type?e=new F(o,o.nextSibling,this,t):1===l.type?e=new l.ctor(o,l.name,l.strings,this,t):6===l.type&&(e=new tt(o,this,t)),this._$AV.push(e),l=s[++a]}r!==(null==l?void 0:l.index)&&(o=B.nextNode(),r++)}return B.currentNode=x,n}v(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class F{constructor(t,e,i,s){var n;this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cp=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===(null==t?void 0:t.nodeType)&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=q(this,t,e),z(t)?t===L||null==t||""===t?(this._$AH!==L&&this._$AR(),this._$AH=L):t!==this._$AH&&t!==j&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):(t=>k(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.T(t):this._(t)}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t))}_(t){this._$AH!==L&&z(this._$AH)?this._$AA.nextSibling.data=t:this.$(x.createTextNode(t)),this._$AH=t}g(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Z.createElement(V(s.h,s.h[0]),this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.v(i);else{const t=new K(n,this),e=t.u(this.options);t.v(i),this.$(e),this._$AH=t}}_$AC(t){let e=D.get(t.strings);return void 0===e&&D.set(t.strings,e=new Z(t)),e}T(t){k(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new F(this.k(C()),this.k(C()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cp=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class J{constructor(t,e,i,s,n){this.type=1,this._$AH=L,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=L}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=q(this,t,e,0),o=!z(t)||t!==this._$AH&&t!==j,o&&(this._$AH=t);else{const s=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=q(this,s[i+r],e,r),a===j&&(a=this._$AH[r]),o||(o=!z(a)||a!==this._$AH[r]),a===L?t=L:t!==L&&(t+=(null!=a?a:"")+n[r+1]),this._$AH[r]=a}o&&!s&&this.j(t)}j(t){t===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class G extends J{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===L?void 0:t}}const Q=y?y.emptyScript:"";class X extends J{constructor(){super(...arguments),this.type=4}j(t){t&&t!==L?this.element.setAttribute(this.name,Q):this.element.removeAttribute(this.name)}}class Y extends J{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=q(this,t,e,0))&&void 0!==i?i:L)===j)return;const s=this._$AH,n=t===L&&s!==L||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==L&&(s===L||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class tt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){q(this,t)}}const et=$.litHtmlPolyfillSupport;null==et||et(Z,F),(null!==(f=$.litHtmlVersions)&&void 0!==f?f:$.litHtmlVersions=[]).push("2.8.0");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var it,st;class nt extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,n;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let r=o._$litPart$;if(void 0===r){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;o._$litPart$=r=new F(e.insertBefore(C(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return j}}nt.finalized=!0,nt._$litElement$=!0,null===(it=globalThis.litElementHydrateSupport)||void 0===it||it.call(globalThis,{LitElement:nt});const ot=globalThis.litElementPolyfillSupport;null==ot||ot({LitElement:nt}),(null!==(st=globalThis.litElementVersions)&&void 0!==st?st:globalThis.litElementVersions=[]).push("3.3.3");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const rt=t=>e=>"function"==typeof e?((t,e)=>(customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){customElements.define(t,e)}}})(t,e)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,at=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function lt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):at(t,e)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function ht(t){return lt({...t,state:!0})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var dt;null===(dt=window.HTMLSlotElement)||void 0===dt||dt.prototype.assignedElements;const ct=t=>{const e=t<0?-t:0;return e>=.05?e:0},ut="smart_irrigation",_t={en:{title:"Smart Irrigation",next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}"},fr:{title:"Smart Irrigation",next_start:"Prochain départ",no_start:"Aucun départ prévu",skipped:"Reporté",short_by:"déficit {value}",no_need:"pas d'arrosage nécessaire",runs_for:"arroserait {duration}",never_watered:"jamais arrosé",last_watered:"dernier arrosage {when}",calculate:"Calculer maintenant",water_now:"Arroser maintenant",confirm_water:"Touchez encore pour arroser",watering:"Arrosage en cours",nothing_to_water:"Rien à arroser pour le moment",manual:"manuel",disabled:"désactivé",no_zones:"Aucune zone. Ouvrez le panneau Smart Irrigation pour en créer une.",tomorrow:"demain",yesterday:"hier",live_since:"Estimé maintenant, sur les relevés depuis {when}"}};t.SmartIrrigationCard=class extends nt{constructor(){super(...arguments),this._zones=[],this._info=null,this._busy=null,this._confirming=null,this._onVisible=()=>{"visible"===document.visibilityState&&this._load()}}static async getConfigElement(){return await Promise.resolve().then((function(){return gt})),document.createElement("smart-irrigation-card-editor")}static getStubConfig(){return{type:"custom:smart-irrigation-card",show_next_start:!0}}setConfig(t){this._config=Object.assign({show_next_start:!0},t)}getCardSize(){return 1+Math.max(this._zones.length,1)}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval((()=>{"visible"===document.visibilityState&&this._load()}),12e4),document.addEventListener("visibilitychange",this._onVisible)}disconnectedCallback(){var t;super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer),this._confirmTimer&&window.clearTimeout(this._confirmTimer),document.removeEventListener("visibilitychange",this._onVisible),null===(t=this._unsubscribe)||void 0===t||t.call(this),this._unsubscribe=void 0}updated(t){t.has("hass")&&this.hass&&!this._unsubscribe&&(this._subscribe(),this._load())}async _subscribe(){try{this._unsubscribe=await this.hass.connection.subscribeMessage((()=>this._load()),{type:`${ut}_config_updated`})}catch(t){}}async _load(){if(this.hass)try{const[t,e]=await Promise.all([this.hass.callWS({type:`${ut}/zones`}),this.hass.callWS({type:`${ut}/info`})]);this._zones=null!=t?t:[],this._info=e}catch(t){}}_t(t,e={}){var i,s,n,o;const r=((null===(i=this.hass)||void 0===i?void 0:i.language)||"en").split("-")[0];return(null!==(o=null!==(n=(null!==(s=_t[r])&&void 0!==s?s:_t.en)[t])&&void 0!==n?n:_t.en[t])&&void 0!==o?o:t).replace(/\{(\w+)\}/g,((t,i)=>{var s;return null!==(s=e[i])&&void 0!==s?s:""}))}_depth(t){var e,i,s;return((t,e)=>e?`${t.toFixed(2)} in`:`${t.toFixed(1)} mm`)(t,"mi"===(null===(s=null===(i=null===(e=this.hass)||void 0===e?void 0:e.config)||void 0===i?void 0:i.unit_system)||void 0===s?void 0:s.length))}_now(t){var e,i;return((t,e)=>{var i;return e&&"number"==typeof e.bucket?{bucket:e.bucket,duration:null!==(i=e.duration)&&void 0!==i?i:t.duration,live:!0}:{bucket:t.bucket,duration:t.duration,live:!1}})(t,null===(i=null===(e=this._info)||void 0===e?void 0:e.zone_estimates)||void 0===i?void 0:i[String(t.id)])}_duration(t){return(t=>{const e=Math.max(0,Math.round(t)),i=Math.floor(e/3600),s=Math.floor(e%3600/60),n=e%60;return(i?[i,s,n]:[s,n]).map(((t,e)=>e?String(t).padStart(2,"0"):String(t))).join(":")})(t)}_moment(t){var e,i,s;return((t,e,i,s=new Date)=>{const n=new Date(t);if(isNaN(n.getTime()))return t;const o=n.toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit"}),r=new Date(s);r.setHours(0,0,0,0);const a=Math.floor((n.getTime()-r.getTime())/864e5);return 0===a?o:1===a?`${i.tomorrow} ${o}`:-1===a?`${i.yesterday} ${o}`:`${n.toLocaleDateString(e,{day:"numeric",month:"short"})} ${o}`})(t,(null===(i=null===(e=this.hass)||void 0===e?void 0:e.locale)||void 0===i?void 0:i.language)||(null===(s=this.hass)||void 0===s?void 0:s.language)||"en",{tomorrow:this._t("tomorrow"),yesterday:this._t("yesterday")})}_momentOrEmpty(t){return t?this._moment(t):""}_zonesToShow(){var t,e;const i=null===(t=this._config)||void 0===t?void 0:t.zones,s=i&&i.length?this._zones.filter((t=>i.includes(t.id))):this._zones;return(null===(e=this._config)||void 0===e?void 0:e.compact)?s.filter((t=>this._needs(t))):s}_needs(t){var e;const i=this._now(t);return ct(i.bucket)>(null!==(e=t.irrigation_threshold)&&void 0!==e?e:0)&&i.duration>0}_waterButton(t){var e,i;if(t.linked_entity)return((t,e,i,s,n="smart_irrigation")=>{var o;if(!t||!e)return;const r=`_zone_${i}`;for(const i of Object.values(t)){if(i.platform!==n||i.translation_key!==s)continue;const t=i.device_id?e[i.device_id]:void 0,a=null!==(o=null==t?void 0:t.identifiers)&&void 0!==o?o:[];for(const[t,e]of a)if(t===n&&String(e).endsWith(r))return i.entity_id}})(null===(e=this.hass)||void 0===e?void 0:e.entities,null===(i=this.hass)||void 0===i?void 0:i.devices,t.id,"irrigate_now")}_waterPressed(t,e){if(this._confirming!==t.id)return this._confirming=t.id,this._confirmTimer&&window.clearTimeout(this._confirmTimer),void(this._confirmTimer=window.setTimeout((()=>{this._confirming=null}),5e3));this._confirmTimer&&window.clearTimeout(this._confirmTimer),this._confirming=null,this._water(t,e)}async _water(t,e){this._busy=t.id;try{await this.hass.callService("button","press",{entity_id:e})}finally{this._busy=null}}async _calculate(t){this._busy=t.id;try{await this.hass.callApi("POST",`${ut}/zones`,{id:String(t.id),calculate:!0,override_cache:!0}),await this._load()}finally{this._busy=null}}_nextStart(){var t,e,i;if(!(null===(t=this._config)||void 0===t?void 0:t.show_next_start)||!this._info)return pt;const s=null===(e=this._info.skip_preview)||void 0===e?void 0:e.should_skip,n=this._info.next_irrigation_start,o=s?this._t("skipped"):n?this._moment(n):this._t("no_start"),r=s?null===(i=this._info.skip_preview)||void 0===i?void 0:i.reason:null;return I`
      <div class="next ${s?"held":""}">
        <ha-icon
          icon=${s?"mdi:calendar-remove":"mdi:calendar-clock"}
        ></ha-icon>
        <span class="next-label">${this._t("next_start")}</span>
        <span class="next-value">${o}${r?` (${r})`:""}</span>
      </div>
    `}_zoneRow(t){var e,i,s,n;const o=null!==(e=t.irrigation_threshold)&&void 0!==e?e:0,r=this._waterButton(t),a=this._now(t),l=ct(a.bucket),h=l>o&&a.duration>0;return I`
      <div class="zone">
        <div class="zone-name">
          ${t.name}
          ${"automatic"!==t.state?I`<span class="chip">${this._t(t.state)}</span>`:""}
        </div>
        <div class="zone-state ${h?"needed":""}">
          ${l>0?this._t("short_by",{value:this._depth(l)}):this._t("no_need")}
          ${h?I`&middot;
              ${this._t("runs_for",{duration:this._duration(a.duration)})}`:""}
          ${a.live?I`<ha-icon
                class="live"
                icon="mdi:access-point"
                title=${this._t("live_since",{when:this._momentOrEmpty(null===(n=null===(s=null===(i=this._info)||void 0===i?void 0:i.zone_estimates)||void 0===s?void 0:s[String(t.id)])||void 0===n?void 0:n.since)})}
              ></ha-icon>`:""}
        </div>
        <div class="zone-last">
          ${t.last_irrigation?this._t("last_watered",{when:this._moment(t.last_irrigation)}):this._t("never_watered")}
        </div>
        <div class="actions">
          ${r?I`<ha-icon-button
                class=${this._confirming===t.id?"confirming":""}
                .disabled=${this._busy===t.id}
                .label=${this._t(this._confirming===t.id?"confirm_water":"water_now")}
                title=${this._t(this._confirming===t.id?"confirm_water":"water_now")}
                @click=${()=>this._waterPressed(t,r)}
              >
                <ha-icon
                  icon=${this._confirming===t.id?"mdi:check":"mdi:water"}
                ></ha-icon>
              </ha-icon-button>`:""}
          <ha-icon-button
            .disabled=${this._busy===t.id}
            .label=${this._t("calculate")}
            title=${this._t("calculate")}
            @click=${()=>this._calculate(t)}
          >
            <ha-icon icon="mdi:calculator"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}render(){var t;if(!this._config||!this.hass)return I``;const e=this._zonesToShow();return I`
      <ha-card .header=${null!==(t=this._config.title)&&void 0!==t?t:this._t("title")}>
        <div class="content">
          ${this._nextStart()}
          ${e.length?e.map((t=>this._zoneRow(t))):I`<div class="empty">
                ${this._t(this._zones.length?"nothing_to_water":"no_zones")}
              </div>`}
        </div>
      </ha-card>
    `}},t.SmartIrrigationCard.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new r(i,t,n)})`
    .content {
      padding: 0 16px 16px 16px;
    }
    .next {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0 12px 0;
      border-bottom: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
    }
    .next.held {
      color: var(--warning-color, var(--secondary-text-color));
    }
    .next-value {
      margin-left: auto;
      color: var(--primary-text-color);
    }
    .zone {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas: "name button" "state button" "last button";
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .zone:last-child {
      border-bottom: none;
    }
    .zone-name {
      grid-area: name;
      font-weight: 500;
    }
    .zone-state {
      grid-area: state;
      color: var(--secondary-text-color);
    }
    .zone-state.needed {
      color: var(--primary-color);
    }
    .live {
      --mdc-icon-size: 14px;
      vertical-align: text-top;
      opacity: 0.55;
    }
    .zone-last {
      grid-area: last;
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }
    .actions {
      grid-area: button;
      display: flex;
      align-items: center;
    }
    ha-icon-button {
      color: var(--secondary-text-color);
    }
    ha-icon-button.confirming {
      color: var(--primary-color);
    }
    .chip {
      margin-left: 6px;
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
      font-size: 0.75em;
      font-weight: 400;
    }
    .empty {
      padding: 12px 0;
      color: var(--secondary-text-color);
    }
  `,e([lt({attribute:!1})],t.SmartIrrigationCard.prototype,"hass",void 0),e([ht()],t.SmartIrrigationCard.prototype,"_config",void 0),e([ht()],t.SmartIrrigationCard.prototype,"_zones",void 0),e([ht()],t.SmartIrrigationCard.prototype,"_info",void 0),e([ht()],t.SmartIrrigationCard.prototype,"_busy",void 0),e([ht()],t.SmartIrrigationCard.prototype,"_confirming",void 0),t.SmartIrrigationCard=e([rt("smart-irrigation-card")],t.SmartIrrigationCard);const pt=I``;window.customCards=window.customCards||[],window.customCards.push({type:"smart-irrigation-card",name:"Smart Irrigation",description:"What each zone is short of, how long it would run, and when the water goes on.",preview:!0,documentationURL:"https://altmenorg.github.io/HAsmartirrigation/"});const vt={en:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water"},fr:{title:"Titre",zones:"Zones (toutes si vide)",show_next_start:"Afficher le prochain départ",compact:"Seulement les zones qui arroseraient"}};let mt=class extends nt{constructor(){super(...arguments),this._config={type:"custom:smart-irrigation-card"},this._zones=[]}setConfig(t){this._config=Object.assign({show_next_start:!0,compact:!1},t)}updated(t){t.has("hass")&&this.hass&&!this._zones.length&&this._loadZones()}async _loadZones(){try{const t=await this.hass.callWS({type:"smart_irrigation/zones"});this._zones=(null!=t?t:[]).map((t=>({id:t.id,name:t.name})))}catch(t){}}_label(t){var e,i,s;const n=((null===(e=this.hass)||void 0===e?void 0:e.language)||"en").split("-")[0];return null!==(s=(null!==(i=vt[n])&&void 0!==i?i:vt.en)[t])&&void 0!==s?s:vt.en[t]}get _schema(){return[{name:"title",selector:{text:{}}},{name:"zones",selector:{select:{multiple:!0,mode:"list",options:this._zones.map((t=>({value:t.id,label:t.name})))}}},{name:"show_next_start",selector:{boolean:{}}},{name:"compact",selector:{boolean:{}}}]}_valueChanged(t){var e;t.stopPropagation();const i=Object.assign(Object.assign({},this._config),t.detail.value);(null===(e=i.zones)||void 0===e?void 0:e.length)||delete i.zones,i.title||delete i.title,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}render(){return this.hass?I`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${t=>this._label(t.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:I``}};e([lt({attribute:!1})],mt.prototype,"hass",void 0),e([ht()],mt.prototype,"_config",void 0),e([ht()],mt.prototype,"_zones",void 0),mt=e([rt("smart-irrigation-card-editor")],mt);var gt=Object.freeze({__proto__:null,get SmartIrrigationCardEditor(){return mt}})}({});
//# sourceMappingURL=smart-irrigation-card.js.map
