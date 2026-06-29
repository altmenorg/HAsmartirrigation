!function(e){"use strict";var a=function(e,t){return a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,a){e.__proto__=a}||function(e,a){for(var t in a)Object.prototype.hasOwnProperty.call(a,t)&&(e[t]=a[t])},a(e,t)};function t(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function i(){this.constructor=e}a(e,t),e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)}var i=function(){return i=Object.assign||function(e){for(var a,t=1,i=arguments.length;t<i;t++)for(var n in a=arguments[t])Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n]);return e},i.apply(this,arguments)};function n(e,a){var t={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&a.indexOf(i)<0&&(t[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(i=Object.getOwnPropertySymbols(e);n<i.length;n++)a.indexOf(i[n])<0&&Object.prototype.propertyIsEnumerable.call(e,i[n])&&(t[i[n]]=e[i[n]])}return t}function r(e,a,t,i){var n,r=arguments.length,s=r<3?a:null===i?i=Object.getOwnPropertyDescriptor(a,t):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,a,t,i);else for(var o=e.length-1;o>=0;o--)(n=e[o])&&(s=(r<3?n(s):r>3?n(a,t,s):n(a,t))||s);return r>3&&s&&Object.defineProperty(a,t,s),s}function s(e,a,t){if(t||2===arguments.length)for(var i,n=0,r=a.length;n<r;n++)!i&&n in a||(i||(i=Array.prototype.slice.call(a,0,n)),i[n]=a[n]);return e.concat(i||Array.prototype.slice.call(a))}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const o=window,l=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,d=Symbol(),u=new WeakMap;let c=class{constructor(e,a,t){if(this._$cssResult$=!0,t!==d)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=a}get styleSheet(){let e=this.o;const a=this.t;if(l&&void 0===e){const t=void 0!==a&&1===a.length;t&&(e=u.get(a)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&u.set(a,e))}return e}toString(){return this.cssText}};const p=(e,...a)=>{const t=1===e.length?e[0]:a.reduce(((a,t,i)=>a+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(t)+e[i+1]),e[0]);return new c(t,e,d)},m=l?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let a="";for(const t of e.cssRules)a+=t.cssText;return(e=>new c("string"==typeof e?e:e+"",void 0,d))(a)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var g;const h=window,v=h.trustedTypes,f=v?v.emptyScript:"",b=h.reactiveElementPolyfillSupport,k={toAttribute(e,a){switch(a){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,a){let t=e;switch(a){case Boolean:t=null!==e;break;case Number:t=null===e?null:Number(e);break;case Object:case Array:try{t=JSON.parse(e)}catch(e){t=null}}return t}},y=(e,a)=>a!==e&&(a==a||e==e),_={attribute:!0,type:String,converter:k,reflect:!1,hasChanged:y},z="finalized";let w=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var a;this.finalize(),(null!==(a=this.h)&&void 0!==a?a:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((a,t)=>{const i=this._$Ep(t,a);void 0!==i&&(this._$Ev.set(i,t),e.push(i))})),e}static createProperty(e,a=_){if(a.state&&(a.attribute=!1),this.finalize(),this.elementProperties.set(e,a),!a.noAccessor&&!this.prototype.hasOwnProperty(e)){const t="symbol"==typeof e?Symbol():"__"+e,i=this.getPropertyDescriptor(e,t,a);void 0!==i&&Object.defineProperty(this.prototype,e,i)}}static getPropertyDescriptor(e,a,t){return{get(){return this[a]},set(i){const n=this[e];this[a]=i,this.requestUpdate(e,n,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||_}static finalize(){if(this.hasOwnProperty(z))return!1;this[z]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,a=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const t of a)this.createProperty(t,e[t])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const a=[];if(Array.isArray(e)){const t=new Set(e.flat(1/0).reverse());for(const e of t)a.unshift(m(e))}else void 0!==e&&a.push(m(e));return a}static _$Ep(e,a){const t=a.attribute;return!1===t?void 0:"string"==typeof t?t:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var a,t;(null!==(a=this._$ES)&&void 0!==a?a:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(t=e.hostConnected)||void 0===t||t.call(e))}removeController(e){var a;null===(a=this._$ES)||void 0===a||a.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,a)=>{this.hasOwnProperty(a)&&(this._$Ei.set(a,this[a]),delete this[a])}))}createRenderRoot(){var e;const a=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,a)=>{l?e.adoptedStyleSheets=a.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):a.forEach((a=>{const t=document.createElement("style"),i=o.litNonce;void 0!==i&&t.setAttribute("nonce",i),t.textContent=a.cssText,e.appendChild(t)}))})(a,this.constructor.elementStyles),a}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var a;return null===(a=e.hostConnected)||void 0===a?void 0:a.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var a;return null===(a=e.hostDisconnected)||void 0===a?void 0:a.call(e)}))}attributeChangedCallback(e,a,t){this._$AK(e,t)}_$EO(e,a,t=_){var i;const n=this.constructor._$Ep(e,t);if(void 0!==n&&!0===t.reflect){const r=(void 0!==(null===(i=t.converter)||void 0===i?void 0:i.toAttribute)?t.converter:k).toAttribute(a,t.type);this._$El=e,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$El=null}}_$AK(e,a){var t;const i=this.constructor,n=i._$Ev.get(e);if(void 0!==n&&this._$El!==n){const e=i.getPropertyOptions(n),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(t=e.converter)||void 0===t?void 0:t.fromAttribute)?e.converter:k;this._$El=n,this[n]=r.fromAttribute(a,e.type),this._$El=null}}requestUpdate(e,a,t){let i=!0;void 0!==e&&(((t=t||this.constructor.getPropertyOptions(e)).hasChanged||y)(this[e],a)?(this._$AL.has(e)||this._$AL.set(e,a),!0===t.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,t))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,a)=>this[a]=e)),this._$Ei=void 0);let a=!1;const t=this._$AL;try{a=this.shouldUpdate(t),a?(this.willUpdate(t),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var a;return null===(a=e.hostUpdate)||void 0===a?void 0:a.call(e)})),this.update(t)):this._$Ek()}catch(e){throw a=!1,this._$Ek(),e}a&&this._$AE(t)}willUpdate(e){}_$AE(e){var a;null===(a=this._$ES)||void 0===a||a.forEach((e=>{var a;return null===(a=e.hostUpdated)||void 0===a?void 0:a.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,a)=>this._$EO(a,this[a],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var x;w[z]=!0,w.elementProperties=new Map,w.elementStyles=[],w.shadowRootOptions={mode:"open"},null==b||b({ReactiveElement:w}),(null!==(g=h.reactiveElementVersions)&&void 0!==g?g:h.reactiveElementVersions=[]).push("1.6.3");const j=window,S=j.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,$="$lit$",E=`lit$${(Math.random()+"").slice(9)}$`,T="?"+E,M=`<${T}>`,D=document,O=()=>D.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,C="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,B=RegExp(`>|${C}(?:([^\\s"'>=/]+)(${C}*=${C}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,R=/"/g,V=/^(?:script|style|textarea|title)$/i,q=(e=>(a,...t)=>({_$litType$:e,strings:a,values:t}))(1),F=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,Y=D.createTreeWalker(D,129,null,!1);function Z(e,a){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(a):a}const K=(e,a)=>{const t=e.length-1,i=[];let n,r=2===a?"<svg>":"",s=H;for(let a=0;a<t;a++){const t=e[a];let o,l,d=-1,u=0;for(;u<t.length&&(s.lastIndex=u,l=s.exec(t),null!==l);)u=s.lastIndex,s===H?"!--"===l[1]?s=I:void 0!==l[1]?s=L:void 0!==l[2]?(V.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=B):void 0!==l[3]&&(s=B):s===B?">"===l[0]?(s=null!=n?n:H,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,o=l[1],s=void 0===l[3]?B:'"'===l[3]?R:U):s===R||s===U?s=B:s===I||s===L?s=H:(s=B,n=void 0);const c=s===B&&e[a+1].startsWith("/>")?" ":"";r+=s===H?t+M:d>=0?(i.push(o),t.slice(0,d)+$+t.slice(d)+E+c):t+E+(-2===d?(i.push(void 0),a):c)}return[Z(e,r+(e[t]||"<?>")+(2===a?"</svg>":"")),i]};class J{constructor({strings:e,_$litType$:a},t){let i;this.parts=[];let n=0,r=0;const s=e.length-1,o=this.parts,[l,d]=K(e,a);if(this.el=J.createElement(l,t),Y.currentNode=this.el.content,2===a){const e=this.el.content,a=e.firstChild;a.remove(),e.append(...a.childNodes)}for(;null!==(i=Y.nextNode())&&o.length<s;){if(1===i.nodeType){if(i.hasAttributes()){const e=[];for(const a of i.getAttributeNames())if(a.endsWith($)||a.startsWith(E)){const t=d[r++];if(e.push(a),void 0!==t){const e=i.getAttribute(t.toLowerCase()+$).split(E),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:n,name:a[2],strings:e,ctor:"."===a[1]?te:"?"===a[1]?ne:"@"===a[1]?re:ae})}else o.push({type:6,index:n})}for(const a of e)i.removeAttribute(a)}if(V.test(i.tagName)){const e=i.textContent.split(E),a=e.length-1;if(a>0){i.textContent=S?S.emptyScript:"";for(let t=0;t<a;t++)i.append(e[t],O()),Y.nextNode(),o.push({type:2,index:++n});i.append(e[a],O())}}}else if(8===i.nodeType)if(i.data===T)o.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(E,e+1));)o.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,a){const t=D.createElement("template");return t.innerHTML=e,t}}function Q(e,a,t=e,i){var n,r,s,o;if(a===F)return a;let l=void 0!==i?null===(n=t._$Co)||void 0===n?void 0:n[i]:t._$Cl;const d=N(a)?void 0:a._$litDirective$;return(null==l?void 0:l.constructor)!==d&&(null===(r=null==l?void 0:l._$AO)||void 0===r||r.call(l,!1),void 0===d?l=void 0:(l=new d(e),l._$AT(e,t,i)),void 0!==i?(null!==(s=(o=t)._$Co)&&void 0!==s?s:o._$Co=[])[i]=l:t._$Cl=l),void 0!==l&&(a=Q(e,l._$AS(e,a.values),l,i)),a}class X{constructor(e,a){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=a}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var a;const{el:{content:t},parts:i}=this._$AD,n=(null!==(a=null==e?void 0:e.creationScope)&&void 0!==a?a:D).importNode(t,!0);Y.currentNode=n;let r=Y.nextNode(),s=0,o=0,l=i[0];for(;void 0!==l;){if(s===l.index){let a;2===l.type?a=new ee(r,r.nextSibling,this,e):1===l.type?a=new l.ctor(r,l.name,l.strings,this,e):6===l.type&&(a=new se(r,this,e)),this._$AV.push(a),l=i[++o]}s!==(null==l?void 0:l.index)&&(r=Y.nextNode(),s++)}return Y.currentNode=D,n}v(e){let a=0;for(const t of this._$AV)void 0!==t&&(void 0!==t.strings?(t._$AI(e,t,a),a+=t.strings.length-2):t._$AI(e[a])),a++}}class ee{constructor(e,a,t,i){var n;this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=a,this._$AM=t,this.options=i,this._$Cp=null===(n=null==i?void 0:i.isConnected)||void 0===n||n}get _$AU(){var e,a;return null!==(a=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==a?a:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const a=this._$AM;return void 0!==a&&11===(null==e?void 0:e.nodeType)&&(e=a.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,a=this){e=Q(this,e,a),N(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>P(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==W&&N(this._$AH)?this._$AA.nextSibling.data=e:this.$(D.createTextNode(e)),this._$AH=e}g(e){var a;const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Z(i.h,i.h[0]),this.options)),i);if((null===(a=this._$AH)||void 0===a?void 0:a._$AD)===n)this._$AH.v(t);else{const e=new X(n,this),a=e.u(this.options);e.v(t),this.$(a),this._$AH=e}}_$AC(e){let a=G.get(e.strings);return void 0===a&&G.set(e.strings,a=new J(e)),a}T(e){P(this._$AH)||(this._$AH=[],this._$AR());const a=this._$AH;let t,i=0;for(const n of e)i===a.length?a.push(t=new ee(this.k(O()),this.k(O()),this,this.options)):t=a[i],t._$AI(n),i++;i<a.length&&(this._$AR(t&&t._$AB.nextSibling,i),a.length=i)}_$AR(e=this._$AA.nextSibling,a){var t;for(null===(t=this._$AP)||void 0===t||t.call(this,!1,!0,a);e&&e!==this._$AB;){const a=e.nextSibling;e.remove(),e=a}}setConnected(e){var a;void 0===this._$AM&&(this._$Cp=e,null===(a=this._$AP)||void 0===a||a.call(this,e))}}class ae{constructor(e,a,t,i,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=a,this._$AM=i,this.options=n,t.length>2||""!==t[0]||""!==t[1]?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=W}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,a=this,t,i){const n=this.strings;let r=!1;if(void 0===n)e=Q(this,e,a,0),r=!N(e)||e!==this._$AH&&e!==F,r&&(this._$AH=e);else{const i=e;let s,o;for(e=n[0],s=0;s<n.length-1;s++)o=Q(this,i[t+s],a,s),o===F&&(o=this._$AH[s]),r||(r=!N(o)||o!==this._$AH[s]),o===W?e=W:e!==W&&(e+=(null!=o?o:"")+n[s+1]),this._$AH[s]=o}r&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class te extends ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}const ie=S?S.emptyScript:"";class ne extends ae{constructor(){super(...arguments),this.type=4}j(e){e&&e!==W?this.element.setAttribute(this.name,ie):this.element.removeAttribute(this.name)}}class re extends ae{constructor(e,a,t,i,n){super(e,a,t,i,n),this.type=5}_$AI(e,a=this){var t;if((e=null!==(t=Q(this,e,a,0))&&void 0!==t?t:W)===F)return;const i=this._$AH,n=e===W&&i!==W||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==W&&(i===W||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var a,t;"function"==typeof this._$AH?this._$AH.call(null!==(t=null===(a=this.options)||void 0===a?void 0:a.host)&&void 0!==t?t:this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,a,t){this.element=e,this.type=6,this._$AN=void 0,this._$AM=a,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const oe={I:ee},le=j.litHtmlPolyfillSupport;null==le||le(J,ee),(null!==(x=j.litHtmlVersions)&&void 0!==x?x:j.litHtmlVersions=[]).push("2.8.0");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var de,ue;let ce=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,a;const t=super.createRenderRoot();return null!==(e=(a=this.renderOptions).renderBefore)&&void 0!==e||(a.renderBefore=t.firstChild),t}update(e){const a=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,a,t)=>{var i,n;const r=null!==(i=null==t?void 0:t.renderBefore)&&void 0!==i?i:a;let s=r._$litPart$;if(void 0===s){const e=null!==(n=null==t?void 0:t.renderBefore)&&void 0!==n?n:null;r._$litPart$=s=new ee(a.insertBefore(O(),e),e,void 0,null!=t?t:{})}return s._$AI(e),s})(a,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return F}};ce.finalized=!0,ce._$litElement$=!0,null===(de=globalThis.litElementHydrateSupport)||void 0===de||de.call(globalThis,{LitElement:ce});const pe=globalThis.litElementPolyfillSupport;null==pe||pe({LitElement:ce}),(null!==(ue=globalThis.litElementVersions)&&void 0!==ue?ue:globalThis.litElementVersions=[]).push("3.3.3");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const me=e=>a=>"function"==typeof a?((e,a)=>(customElements.define(e,a),a))(e,a):((e,a)=>{const{kind:t,elements:i}=a;return{kind:t,elements:i,finisher(a){customElements.define(e,a)}}})(e,a)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,ge=(e,a)=>"method"===a.kind&&a.descriptor&&!("value"in a.descriptor)?{...a,finisher(t){t.createProperty(a.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:a.key,initializer(){"function"==typeof a.initializer&&(this[a.key]=a.initializer.call(this))},finisher(t){t.createProperty(a.key,e)}};function he(e){return(a,t)=>void 0!==t?((e,a,t)=>{a.constructor.createProperty(t,e)})(e,a,t):ge(e,a)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function ve(e){return he({...e,state:!0})}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
function fe(e,a){return(({finisher:e,descriptor:a})=>(t,i)=>{var n;if(void 0===i){const i=null!==(n=t.originalKey)&&void 0!==n?n:t.key,r=null!=a?{kind:"method",placement:"prototype",key:i,descriptor:a(t.key)}:{...t,key:i};return null!=e&&(r.finisher=function(a){e(a,i)}),r}{const n=t.constructor;void 0!==a&&Object.defineProperty(t,i,a(i)),null==e||e(n,i)}})({descriptor:a=>{const t={get(){var a,t;return null!==(t=null===(a=this.renderRoot)||void 0===a?void 0:a.querySelector(e))&&void 0!==t?t:null},enumerable:!0,configurable:!0};return t}})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var be;null===(be=window.HTMLSlotElement)||void 0===be||be.prototype.assignedElements;let ke=!1,ye=null;const _e=async()=>{if(ke&&ye)return ye;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();ke=!0,ye=async function(){try{await new Promise((e=>{"requestIdleCallback"in window?requestIdleCallback((()=>e())):setTimeout((()=>e()),0)})),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),a=document.createElement("partial-panel-resolver");e.appendChild(a),a.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise((e=>queueMicrotask((()=>e())))),a._updateRoutes(),await a.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise((e=>queueMicrotask((()=>e()))));const t=document.createElement("ha-panel-config");e.appendChild(t),await t.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await ye}finally{ke=!1,ye=null}};var ze,we;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ze||(ze={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(we||(we={}));var xe=function(e,a,t,i){i=i||{},t=null==t?{}:t;var n=new Event(a,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return n.detail=t,e.dispatchEvent(n),n};const je="smart_irrigation",Se="precipitation_threshold_mm",Ae="irrigation_start_triggers",$e="sunrise",Ee="solar_azimuth",Te="minutes",Me="hours",De="days",Oe="imperial",Ne="metric",Pe="Dewpoint",Ce="Evapotranspiration",He="Humidity",Ie="Precipitation",Le="Current Precipitation",Be="Pressure",Ue="Solar Radiation",Re="Temperature",Ve="Windspeed",qe="Open-Meteo",Fe=[qe],We="weather_service",Ge="sensor",Ye="static",Ze="pressure_type",Ke="absolute",Je="relative",Qe="none",Xe="source",ea="sensorentity",aa="static_value",ta="unit",ia="aggregate",na=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],ra="mm/h",sa="in/h",oa="name",la="size",da="throughput",ua="state",ca="duration",pa="module",ma="bucket",ga="multiplier",ha="mapping",va="lead_time",fa="maximum_duration",ba="maximum_bucket",ka="drainage_rate",ya="linked_entity",_a="flow_sensor",za=2,wa=e=>(...a)=>({_$litDirective$:e,values:a});class xa{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,a,t){this._$Ct=e,this._$AM=a,this._$Ci=t}_$AS(e,a){return this.update(e,a)}update(e,a){return this.render(...a)}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class ja extends xa{constructor(e){if(super(e),this.et=W,e.type!==za)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===W||null==e)return this.ft=void 0,this.et=e;if(e===F)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const a=[e];return a.raw=a,this.ft={_$litType$:this.constructor.resultType,strings:a,values:[]}}}ja.directiveName="unsafeHTML",ja.resultType=1;const Sa=wa(ja);function Aa(e,a){return(e=e.toString()).split(",")[a]}function $a(e,a){switch(a){case ka:return e.units==Ne?q`${Sa(ra)}`:q`${Sa(sa)}`;case Se:case ma:return e.units==Ne?q`${Sa("mm")}`:q`${Sa("in")}`;case la:return e.units==Ne?q`${Sa("m<sup>2</sup>")}`:q`${Sa("sq ft")}`;case da:return e.units==Ne?q`${Sa("l/minute")}`:q`${Sa("gal/minute")}`;default:return q``}}function Ea(e,a){!function(e,a){xe(e,"show-dialog",{dialogTag:"smart-irrigation-error-dialog",dialogImport:()=>Promise.resolve().then((function(){return Dl})),dialogParams:{error:a}})}(a,q`
    ${e.error}:${e.body.message?q` ${e.body.message} `:""}
  `)}const Ta=(e,a,t=!1)=>{t?history.replaceState(null,"",a):history.pushState(null,"",a),xe(window,"location-changed",{replace:t})},Ma=e=>e.callWS({type:je+"/config"}),Da=e=>e.callWS({type:je+"/zones"}),Oa=e=>e.callWS({type:je+"/modules"}),Na=e=>e.callWS({type:je+"/mappings"}),Pa=(e,a,t=10)=>e.callWS({type:je+"/weather_records",mapping_id:a,limit:t}),Ca=e=>{class a extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return r([he({attribute:!1})],a.prototype,"hass",void 0),a};var Ha={loading:"Načítání",saving:"Ukládání",actions:{delete:"Smazat"},labels:{module:"Modul",no:"Ne",select:"Vybrat",yes:"Ano",enabled:"Povoleno",disabled:"Zakázáno",before:"před",after:"po"},units:{seconds:"sekund"},attributes:{size:"velikost",throughput:"průtok",state:"stav",bucket:"bucket",last_updated:"naposledy aktualizováno",last_calculated:"naposledy vypočítáno",number_of_data_points:"počet datových bodů"},"loading-messages":{configuration:"Načítání konfigurace…",modules:"Načítání modulů…",general:"Načítání…"},"saving-messages":{adding:"Přidávání…",saving:"Ukládání…"}},Ia={"default-zone":"Výchozí zóna","default-mapping":"Výchozí skupina senzorů"},La={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Poznámka: toto vysvětlení používá jako desetinný oddělovač '.', zobrazuje zaokrouhlené a metrické hodnoty. Modul vrátil deficit evapotranspirace ( = et0 * hour_multiplier + srážky) ve výši","bucket-was":"Bucket byl","new-bucket-values-is":"Nová hodnota bucket je",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Protože bucket < 0, zavlažování je nutné","steps-taken-to-calculate-duration":"K výpočtu přesné doby trvání byly provedeny následující kroky","precipitation-rate-defined-as":"Intenzita srážek je definována jako","duration-is-calculated-as":"Doba trvání se vypočítá jako",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hodin","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Nyní se aplikuje násobitel. Násobitel je","duration-after-multiplier-is":"tudíž doba trvání je","maximum-duration-is-applied":"Poté se aplikuje maximální doba trvání. Maximální doba trvání je","duration-after-maximum-duration-is":"tudíž doba trvání je","lead-time-is-applied":"Nakonec se aplikuje předstihový čas. Předstihový čas je","duration-after-lead-time-is":"tudíž konečná doba trvání je","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Protože bucket >= 0, zavlažování není nutné a doba trvání je nastavena na","maximum-bucket-is":"Maximální velikost bucket je","drainage-rate-is":"Rychlost odvodnění při nasycení (bucket na maximu) je","current-drainage-is":"Aktuální odvodnění se vypočítá jako","no-drainage":"Aktuální odvodnění je 0, protože"}}},Ba={pyeto:{description:"Vypočítat dobu trvání na základě výpočtu FAO56 z knihovny PyETO"},static:{description:"'Fiktivní' modul se statickou konfigurovatelnou deltou"},passthrough:{description:"Průchozí modul, který vrací hodnotu senzoru evapotranspirace jako deltu"}},Ua={weatherservice:{title:"Meteorologická služba",description:"Zobrazte a změňte meteorologickou službu používanou k načítání meteorologických dat — bez nutnosti přeinstalovat integraci. API klíč je ověřen a změna se použije okamžitě.",labels:{"use-weather-service":"Použít meteorologickou službu",service:"Meteorologická služba","api-key":"API klíč"},actions:{save:"Uložit",saving:"Ukládání…"},messages:{"no-service":"Není použita žádná meteorologická služba — meteorologická data pocházejí pouze z vašich vlastních senzorů.",saved:"Meteorologická služba aktualizována a použita.","reload-note":"Uložení ověří API klíč vůči službě a změnu použije okamžitě."}},backuprestore:{title:"Záloha / obnovení",description:"Exportujte úplnou konfiguraci Smart Irrigation do souboru JSON nebo ji obnovte z předchozí zálohy.",cards:{backup:{title:"Záloha",description:"Stáhněte úplnou konfiguraci (obecná nastavení, zóny, moduly a skupiny senzorů) jako soubor JSON."},restore:{title:"Obnovení",description:"Načtěte dříve exportovaný soubor JSON pro nahrazení aktuální konfigurace."}},actions:{export:"Exportovat do JSON","choose-file":"Vyberte soubor zálohy…",restore:"Obnovit tuto zálohu",restoring:"Obnovování…"},messages:{exported:"Soubor zálohy stažen.",restored:"Konfigurace obnovena — znovu se načítá integrace.","invalid-file":"Tento soubor není platná záloha Smart Irrigation.","confirm-title":"Nahradit celou konfiguraci?",summary:"Tato záloha obsahuje","confirm-warning":"Obnovení přepíše všechna aktuální obecná nastavení, zóny, moduly a skupiny senzorů. Tuto akci nelze vrátit zpět.","reload-note":"Obnovení nahradí vše a znovu načte integraci, aby se změna projevila."}},general:{cards:{"automatic-duration-calculation":{header:"Automatický výpočet doby trvání",description:"Výpočet bere shromážděná meteorologická data do daného okamžiku a aktualizuje bucket pro každou automatickou zónu. Poté se doba trvání upraví na základě nové hodnoty bucket a shromážděná meteorologická data se odeberou.",labels:{"auto-calc-enabled":"Automaticky vypočítávat doby zavlažování","calc-time":"Vypočítat v"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Varování: čas aktualizace meteorologických dat je v době výpočtu nebo po ní"},header:"Automatická aktualizace meteorologických dat",description:"Shromažďujte a ukládejte meteorologická data automaticky. Meteorologická data jsou potřebná k výpočtu bucketů a dob trvání zón.",labels:{"auto-update-enabled":"Automaticky aktualizovat meteorologická data","auto-update-schedule":"Plán aktualizací","auto-update-time":"Aktualizovat v","auto-update-interval":"Aktualizovat data senzorů každých","auto-update-delay":"Zpoždění aktualizace"},options:{minutes:"minut",hours:"hodin",days:"dnů"}},"automatic-clear":{header:"Automatické čištění meteorologických dat",description:"Automaticky odebírat shromážděná meteorologická data v nakonfigurovaném čase. Použijte toto pro ujištění, že nezůstanou žádná meteorologická data z předchozích dnů. Neodstraňujte meteorologická data dříve, než provedete výpočet, a tuto možnost použijte pouze tehdy, pokud očekáváte, že automatická aktualizace bude shromažďovat meteorologická data poté, co jste provedli výpočet pro daný den. V ideálním případě chcete čistit co nejpozději během dne.",labels:{"automatic-clear-enabled":"Automaticky vymazat shromážděná meteorologická data","automatic-clear-time":"Vymazat meteorologická data v"}},continuousupdates:{header:"Průběžné aktualizace senzorů (experimentální)",description:"Tato experimentální funkce bude průběžně aktualizovat data senzorů. To je užitečné pro skupiny senzorů, které používají zdroje poskytující průběžná data, jako jsou meteorologické stanice. Tuto funkci nelze použít pro skupiny senzorů, které se alespoň částečně spoléhají na meteorologické služby, protože průběžné dotazování API bude generovat náklady. Mějte na paměti, že je to experimentální a nemusí to fungovat podle očekávání. Používáte na vlastní riziko.",labels:{continuousupdates:"Povolit průběžné aktualizace",sensor_debounce:"Debounce senzoru"}}},description:"Tato stránka poskytuje globální nastavení.",title:"Obecné"},help:{title:"Nápověda",cards:{"how-to-get-help":{title:"Jak získat pomoc","first-read-the":"Nejprve si přečtěte",wiki:"Wiki","if-you-still-need-help":"Pokud stále potřebujete pomoc, obraťte se na","community-forum":"Komunitní fórum","or-open-a":"nebo otevřete","github-issue":"Github Issue","english-only":"pouze anglicky"}}},info:{title:"Informace",description:"Zobrazte informace o příštím zavlažování a stavu systému.","configuration-not-available":"Konfigurace není dostupná.",cards:{"zone-bucket-values":{title:"Hodnoty bucket zón a doba trvání",labels:{bucket:"Bucket",duration:"Doba trvání"},"no-zones":"Nejsou nakonfigurovány žádné zóny"},"next-irrigation":{title:"Příští zavlažování",labels:{"next-start":"Příští spuštění",duration:"Doba trvání",zones:"Zóny"},"no-data":"Nejsou k dispozici žádná data"},"irrigation-reason":{title:"Důvod zavlažování",labels:{reason:"Důvod",sunrise:"Východ slunce","total-duration":"Celková doba trvání",explanation:"Vysvětlení"},"no-data":"Nejsou k dispozici žádná data"}}},mappings:{cards:{"add-mapping":{actions:{add:"Přidat skupinu senzorů"},header:"Přidat skupiny senzorů"},mapping:{aggregates:{average:"Průměr",first:"První",last:"Poslední",maximum:"Maximum",median:"Medián",minimum:"Minimum",riemannsum:"Riemannův součet",sum:"Součet",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Tuto skupinu senzorů nelze smazat, protože ji používá alespoň jedna zóna.",invalid_source:"Neplatný zdroj",source_does_not_exist:"Zdroj neexistuje. Zadejte platný zdroj, například 'sensor.mysensor'."},items:{dewpoint:"Rosný bod",evapotranspiration:"Evapotranspirace",humidity:"Vlhkost","maximum temperature":"Maximální teplota","minimum temperature":"Minimální teplota",precipitation:"Celkové srážky","current precipitation":"Aktuální srážky",pressure:"Tlak","solar radiation":"Sluneční záření",temperature:"Teplota",windspeed:"Rychlost větru"},pressure_types:{absolute:"absolutní",relative:"relativní"},"pressure-type":"Tlak je","sensor-aggregate-of-sensor-values-to-calculate":"hodnot senzorů pro výpočet doby trvání","sensor-aggregate-use-the":"Použít","sensor-entity":"Entita senzoru",static_value:"Hodnota","input-units":"Vstup poskytuje hodnoty v",source:"Zdroj",sources:{none:"Žádný",weather_service:"Meteorologická služba",sensor:"Senzor",static:"Statická hodnota"}}},description:"Přidejte jednu nebo více skupin senzorů, které získávají meteorologická data z meteorologické služby, ze senzorů nebo z jejich kombinace. Každou skupinu senzorů můžete přiřadit k jedné nebo více zónám",labels:{"mapping-name":"Název"},no_items:"Zatím nejsou definovány žádné skupiny senzorů.",title:"Skupiny senzorů","weather-records":{title:"Meteorologické záznamy (posledních 10)",timestamp:"Čas",temperature:"Teplota",humidity:"Vlhkost",precipitation:"Srážky","retrieval-time":"Načteno","no-data":"Pro tuto skupinu senzorů nejsou k dispozici žádná meteorologická data"}},modules:{cards:{"add-module":{actions:{add:"Přidat modul"},header:"Přidat modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Tento modul nelze smazat, protože ho používá alespoň jedna zóna."},labels:{configuration:"Konfigurace",required:"označuje povinné pole"},"translated-options":{DontEstimate:"Neodhadovat",EstimateFromSunHours:"Odhadnout z hodin slunečního svitu",EstimateFromTemp:"Odhadnout z teploty",EstimateFromSunHoursAndTemperature:"Odhadnout z průměru hodin slunečního svitu a teploty"}}},description:"Přidejte jeden nebo více modulů, které vypočítávají dobu zavlažování. Každý modul má vlastní konfiguraci a lze ho použít k výpočtu doby trvání pro jednu nebo více zón.",no_items:"Zatím nejsou definovány žádné moduly.",title:"Moduly"},zones:{actions:{add:"Přidat",calculate:"Vypočítat",information:"Informace",update:"Aktualizovat","reset-bucket":"Resetovat bucket","view-weather-info":"Zobrazit meteorologická data","view-weather-info-message":"Meteorologická data k dispozici pro","view-watering-calendar":"Zobrazit zavlažovací kalendář"},cards:{"add-zone":{actions:{add:"Přidat zónu"},header:"Přidat zónu"},"zone-actions":{actions:{"calculate-all":"Vypočítat všechny zóny","update-all":"Aktualizovat všechny zóny","reset-all-buckets":"Resetovat všechny buckety","clear-all-weatherdata":"Vymazat všechna meteorologická data"},header:"Akce na všech zónách"}},description:"Zde zadejte jednu nebo více zavlažovacích zón. Doba zavlažování se počítá pro každou zónu zvlášť, v závislosti na velikosti, průtoku, stavu, modulu a skupině senzorů.",labels:{bucket:"Bucket",duration:"Doba trvání","lead-time":"Předstihový čas",mapping:"Skupina senzorů","maximum-duration":"Maximální doba trvání",multiplier:"Násobitel",name:"Název",size:"Velikost",state:"Stav",states:{automatic:"Automatický",disabled:"Zakázaný",manual:"Ruční"},throughput:"Průtok","maximum-bucket":"Maximální bucket",last_calculated:"Naposledy vypočítáno","data-last-updated":"Data naposledy aktualizována","data-number-of-data-points":"Počet datových bodů",drainage_rate:"Rychlost odvodnění","linked-entity":"Propojený ventil/spínač","linked-entity-hint":"Ventil nebo spínač, který zavlažuje tuto zónu. Kdykoli se spustí (ruční kohoutek, automatizace nebo samotná Smart Irrigation při zapnutém přímém ovládání ventilu), bucket se připíše z doby běhu a průtoku zóny. Vyžadováno pro funkce s uzavřenou smyčkou.","flow-sensor":"Měřič kumulativního objemu","flow-sensor-hint":"Pro přesné připisování místo průtok x čas: kumulativní celkový stav vodoměru (třída stavu total_increasing), nikoli okamžitý průtok. Jednotka se načte automaticky (L, mL, m³, gal, ft³).",optional:"volitelné"},no_items:"Zatím nejsou definovány žádné zóny.",title:"Zóny"}},Ra="Smart Irrigation",Va={title:"Spouštěče zahájení zavlažování",description:"Nakonfigurujte, kdy má zavlažování začít na základě solárních událostí. Můžete přidat více spouštěčů pro různé plány. U spouštěčů východu slunce ponechání posunu na 0 automaticky použije celkovou dobu trvání všech povolených zón.",usage_before:"Když se spouštěč spustí, Smart Irrigation vyšle událost ",usage_after:" — naslouchejte jí v automatizaci pro zahájení zavlažování. Data události zahrnují trigger_name, trigger_type a offset_minutes, takže můžete reagovat odlišně pro každý spouštěč. Nastavení přeskočení kvůli srážkám a počtu dnů mezi zavlažováními stále platí: v den přeskočení se nevyšle žádná událost.",add_trigger:"Přidat spouštěč",edit_trigger:"Upravit spouštěč",delete_trigger:"Smazat spouštěč",trigger_types:{sunrise:"Východ slunce",sunset:"Západ slunce",solar_azimuth:"Solární azimut"},fields:{name:{name:"Název spouštěče",description:"Popisný název pro identifikaci tohoto spouštěče"},type:{name:"Typ spouštěče",description:"Typ solární události, na kterou se má spustit"},enabled:{name:"Povoleno",description:"Zda je tento spouštěč aktuálně aktivní"},offset_minutes:{name:"Posun (minuty)",description:"Minuty před (-) nebo po (+) solární události. U spouštěčů východu slunce použijte 0 pro automatické načasování na základě celkové doby trvání zón."},azimuth_angle:{name:"Úhel azimutu (stupně)",description:"Úhel solárního azimutu ve stupních, kde 0=Sever, 90=Východ, 180=Jih, 270=Západ"},account_for_duration:{name:"Zohlednit dobu trvání",description:"Když je povoleno, zavlažování začne dostatečně brzy, aby skončilo v zadaný čas. Když je zakázáno, zavlažování začne přesně v zadaný čas."}},dialog:{add_title:"Přidat spouštěč zahájení zavlažování",edit_title:"Upravit spouštěč zahájení zavlažování",cancel:"Zrušit",save:"Uložit",delete:"Smazat",help:"Když se tento spouštěč spustí, Smart Irrigation vyšle následující událost — použijte ji v automatizaci pro zahájení zavlažování. Data události zahrnují název tohoto spouštěče (a typ/posun), takže na něj můžete reagovat konkrétně:"},no_triggers:"Nejsou nakonfigurovány žádné spouštěče zahájení zavlažování. Systém použije výchozí chování (východ slunce s celkovou dobou trvání zón). Přidejte spouštěče pro přizpůsobení, kdy zavlažování začne.",offset_auto:"Auto (vypočítáno z celkové doby trvání zón)",confirm_delete:"Opravdu chcete smazat spouštěč '{name}'?",validation:{name_required:"Název spouštěče je povinný",azimuth_invalid:"Úhel azimutu musí být platné číslo"},help:{sunrise_offset:"U spouštěčů východu slunce: Použijte záporné hodnoty pro spuštění před východem slunce, kladné pro spuštění po něm. Nastavte na 0 pro automatické spuštění dostatečně brzy, aby se všechny zóny dokončily před východem slunce.",sunset_offset:"U spouštěčů západu slunce: Použijte záporné hodnoty pro spuštění před západem slunce, kladné pro spuštění po západu slunce.",azimuth_explanation:"Solární azimut je směr slunce podle kompasu. 0°=Sever, 90°=Východ, 180°=Jih, 270°=Západ. Můžete zadat libovolnou hodnotu úhlu (např. 450° = 90°, -30° = 330°). Použijte toto pro spuštění zavlažování, když slunce dosáhne konkrétní polohy.",multiple_triggers:"Můžete nakonfigurovat více spouštěčů. Každý povolený spouštěč bude nezávisle plánovat zahájení zavlažování."},active_label:"Aktivní spouštěč",active_default:"Výchozí (východ slunce minus celková doba zavlažování)",active_hint:'Zavlažování spustí pouze vybraný spouštěč, takže se provede jednou denně. "Výchozí" načasuje běh tak, aby skončil přesně při východu slunce. Níže přidejte vlastní spouštěče (západ slunce, azimut, posuny) a poté jeden zde vyberte.'},qa={title:"Přeskočení zavlažování na základě počasí",description:"Automaticky přeskočit zavlažování, když jsou předpovězeny srážky. Tato funkce vyžaduje nakonfigurovanou meteorologickou službu.",threshold_label:"Práh srážek",threshold_description:"Minimální množství srážek (v mm) předpovězené pro dnešek a zítřek pro přeskočení zavlažování."},Fa={title:"Souřadnice polohy",description:"Nakonfigurujte souřadnice polohy pro získávání meteorologických dat. V případě potřeby můžete použít ruční souřadnice odlišné od polohy vašeho Home Assistant.",manual_enabled:"Použít ruční souřadnice",use_ha_location:"Použít polohu Home Assistant",latitude:"Zeměpisná šířka (desetinné stupně)",longitude:"Zeměpisná délka (desetinné stupně)",elevation:"Nadmořská výška (metry nad mořem)",current_ha_coords:"Aktuální souřadnice Home Assistant"},Wa={title:"Dny mezi zavlažováními",description:"Nakonfigurujte minimální počet dnů, které musí uplynout mezi zavlažovacími událostmi. To pomáhá řídit frekvenci zavlažování pro úsporu vody a péči o zdraví rostlin.\n\nTypické případy použití z praxe:\n• Péče o trávník: intervaly 1-2 dny zabraňují přemokření\n• Omezení kvůli suchu: intervaly 6+ dnů pro týdenní zavlažování\n• Hluboce kořenící rostliny: intervaly 3-7 dnů pro méně časté zavlažování\n• Úspora vody: přizpůsobitelné podle klimatu a půdních podmínek",label:"Minimální počet dnů mezi zavlažováními",help_text:"Nastavte na 0 pro zakázání této funkce. Podporovány jsou hodnoty od 1 do 365 dnů. Toto nastavení funguje společně se stávající logikou předpovědi srážek."},Ga={title:"Sledované zavlažování (uzavřená smyčka)",description:"Automaticky připisujte bucket každé zóny ze skutečného zavlažování namísto resetování bucketu z automatizace. Po zapnutí vyberte v záložce Zóny pro každou zónu entitu ventilu/spínače: dokud je otevřený, bucket se připisuje z doby běhu a průtoku zóny. Pro přesné účtování můžete také pro každou zónu vybrat měřič kumulativního objemu (celkový stav typu vodoměru) a místo toho se použije naměřený objem. Důležité: když je toto zapnuto, je to jediná věc, která připisuje bucket, takže ze své zavlažovací automatizace odstraňte veškerá volání reset_bucket, abyste předešli dvojímu počítání.",enabled_label:"Povolit sledované zavlažování",direct_control_label:"Nechat Smart Irrigation ovládat ventil",direct_control_description:"Když je zapnuto, Smart Irrigation otevře propojený ventil každé zóny, počká vypočtenou dobu a poté jej zavře - není potřeba žádná automatizace. Probíhající běh pokračuje po restartu. Bezpečnost: pokud Home Assistant během běhu na delší dobu vypadne, ventil zůstane otevřený a pokračuje v zavlažování, proto svému ventilu nastavte hardwarovou pojistku (maximální dobu běhu).",sequencing_label:"Pořadí zón",sequencing:{sequential:"Postupně (jedna zóna po druhé)",parallel:"Paralelně (všechny zóny najednou)"}},Ya={common:Ha,defaults:Ia,module:La,calcmodules:Ba,panels:Ua,title:Ra,irrigation_start_triggers:Va,weather_skip:qa,coordinate_config:Fa,days_between_irrigation:Wa,observed_watering:Ga},Za=Object.freeze({__proto__:null,calcmodules:Ba,common:Ha,coordinate_config:Fa,days_between_irrigation:Wa,default:Ya,defaults:Ia,irrigation_start_triggers:Va,module:La,observed_watering:Ga,panels:Ua,title:Ra,weather_skip:qa}),Ka={loading:"Indlæser",saving:"Gemmer",actions:{delete:"Slet"},labels:{module:"Modul",no:"Nej",select:"Vælg",yes:"Ja",enabled:"Aktiveret",disabled:"Deaktiveret",before:"før",after:"efter"},units:{seconds:"sekunder"},attributes:{size:"størrelse",throughput:"gennemstrømning",state:"tilstand",bucket:"bucket",last_updated:"senest opdateret",last_calculated:"senest beregnet",number_of_data_points:"antal datapunkter"},"loading-messages":{configuration:"Indlæser konfiguration...",modules:"Indlæser moduler...",general:"Indlæser..."},"saving-messages":{adding:"Tilføjer...",saving:"Gemmer..."}},Ja={"default-zone":"Standardzone","default-mapping":"Standardsensorgruppe"},Qa={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Bemærk: denne forklaring bruger '.' som decimalseparator og viser afrundede metriske værdier. Modulet returnerede et fordampningsunderskud ( = et0 * hour_multiplier + nedbør) på","bucket-was":"Bucket var","new-bucket-values-is":"Ny bucket-værdi er",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Da bucket < 0, er vanding nødvendig","steps-taken-to-calculate-duration":"For at beregne den nøjagtige varighed blev følgende trin udført","precipitation-rate-defined-as":"Nedbørshastigheden er defineret som","duration-is-calculated-as":"Varigheden beregnes som",drainage:"drainage","drainage-rate":"drainage_rate",hours:"timer","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Nu anvendes multiplikatoren. Multiplikatoren er","duration-after-multiplier-is":"derfor er varigheden","maximum-duration-is-applied":"Derefter anvendes den maksimale varighed. Den maksimale varighed er","duration-after-maximum-duration-is":"derfor er varigheden","lead-time-is-applied":"Til sidst anvendes leveringstiden. Leveringstiden er","duration-after-lead-time-is":"derfor er den endelige varighed","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Da bucket >= 0, er vanding ikke nødvendig, og varigheden sættes til","maximum-bucket-is":"Maksimal bucket-størrelse er","drainage-rate-is":"Drænhastighed ved mætning (bucket på maks) er","current-drainage-is":"Aktuel dræning beregnes som","no-drainage":"Aktuel dræning er 0, fordi"}}},Xa={pyeto:{description:"Beregn varighed baseret på FAO56-beregningen fra PyETO-biblioteket"},static:{description:"'Dummy'-modul med en statisk konfigurerbar delta"},passthrough:{description:"Passthrough-modul der returnerer værdien fra en fordampningssensor som delta"}},et={weatherservice:{title:"Vejrtjeneste",description:"Se og skift den vejrtjeneste, der bruges til at hente vejrdata — uden at skulle geninstallere integrationen. API-nøglen valideres, og ændringen anvendes med det samme.",labels:{"use-weather-service":"Brug en vejrtjeneste",service:"Vejrtjeneste","api-key":"API-nøgle"},actions:{save:"Gem",saving:"Gemmer…"},messages:{"no-service":"Ingen vejrtjeneste bruges — vejrdata kommer udelukkende fra dine egne sensorer.",saved:"Vejrtjeneste opdateret og anvendt.","reload-note":"Når du gemmer, valideres API-nøglen mod tjenesten, og ændringen anvendes med det samme."}},backuprestore:{title:"Sikkerhedskopiering / gendannelse",description:"Eksportér hele Smart Irrigation-konfigurationen til en JSON-fil, eller gendan den fra en tidligere sikkerhedskopi.",cards:{backup:{title:"Sikkerhedskopiering",description:"Download den komplette konfiguration (generelle indstillinger, zoner, moduler og sensorgrupper) som en JSON-fil."},restore:{title:"Gendannelse",description:"Indlæs en tidligere eksporteret JSON-fil for at erstatte den nuværende konfiguration."}},actions:{export:"Eksportér til JSON","choose-file":"Vælg en sikkerhedskopifil…",restore:"Gendan denne sikkerhedskopi",restoring:"Gendanner…"},messages:{exported:"Sikkerhedskopifil downloadet.",restored:"Konfiguration gendannet — genindlæser integrationen.","invalid-file":"Denne fil er ikke en gyldig Smart Irrigation-sikkerhedskopi.","confirm-title":"Erstat hele konfigurationen?",summary:"Denne sikkerhedskopi indeholder","confirm-warning":"Gendannelse overskriver alle nuværende generelle indstillinger, zoner, moduler og sensorgrupper. Dette kan ikke fortrydes.","reload-note":"Gendannelse erstatter alt og genindlæser integrationen for at anvende ændringen."}},general:{cards:{"automatic-duration-calculation":{header:"Automatisk varighedsberegning",description:"Beregningen anvender de indsamlede vejrdata frem til det tidspunkt og opdaterer bucket for hver automatisk zone. Derefter justeres varigheden baseret på den nye bucket-værdi, og de indsamlede vejrdata fjernes.",labels:{"auto-calc-enabled":"Beregn automatisk vandingsvarigheder","calc-time":"Beregn kl."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Advarsel: opdateringstidspunkt for vejrdata er på eller efter beregningstidspunktet"},header:"Automatisk opdatering af vejrdata",description:"Indsaml og gem vejrdata automatisk. Vejrdata er nødvendige for at beregne zoners buckets og varigheder.",labels:{"auto-update-enabled":"Opdatér vejrdata automatisk","auto-update-schedule":"Opdateringsplan","auto-update-time":"Opdatér kl.","auto-update-interval":"Opdatér sensordata hver","auto-update-delay":"Opdateringsforsinkelse"},options:{minutes:"minutter",hours:"timer",days:"dage"}},"automatic-clear":{header:"Automatisk udrensning af vejrdata",description:"Fjern automatisk indsamlede vejrdata på et konfigureret tidspunkt. Brug dette til at sikre, at der ikke er rester af vejrdata fra tidligere dage. Fjern ikke vejrdataene, før du beregner, og brug kun denne mulighed, hvis du forventer, at den automatiske opdatering indsamler vejrdata, efter du har beregnet for dagen. Ideelt set vil du udrense så sent på dagen som muligt.",labels:{"automatic-clear-enabled":"Ryd automatisk indsamlede vejrdata","automatic-clear-time":"Ryd vejrdata kl."}},continuousupdates:{header:"Kontinuerlige opdateringer for sensorer (eksperimentel)",description:"Denne eksperimentelle funktion vil løbende opdatere sensordataene. Dette er nyttigt for sensorgrupper, der bruger kilder, som leverer kontinuerlige data, såsom vejrstationer. Denne funktion kan ikke bruges til sensorgrupper, der i det mindste delvist er afhængige af vejrtjenester, da kontinuerlig polling af API'er vil medføre omkostninger. Husk, at dette er eksperimentelt og muligvis ikke fungerer som forventet. Brug på eget ansvar.",labels:{continuousupdates:"Aktivér kontinuerlige opdateringer",sensor_debounce:"Sensor-debounce"}}},description:"Denne side indeholder globale indstillinger.",title:"Generelt"},help:{title:"Hjælp",cards:{"how-to-get-help":{title:"Sådan får du hjælp","first-read-the":"Læs først",wiki:"Wikien","if-you-still-need-help":"Hvis du stadig har brug for hjælp, så henvend dig på","community-forum":"Fællesskabsforummet","or-open-a":"eller opret en","github-issue":"Github-issue","english-only":"Kun på engelsk"}}},info:{title:"Info",description:"Se information om næste vanding og systemstatus.","configuration-not-available":"Konfiguration ikke tilgængelig.",cards:{"zone-bucket-values":{title:"Zoners bucket-værdier og varighed",labels:{bucket:"Bucket",duration:"Varighed"},"no-zones":"Ingen zoner konfigureret"},"next-irrigation":{title:"Næste vanding",labels:{"next-start":"Næste start",duration:"Varighed",zones:"Zoner"},"no-data":"Ingen data tilgængelige"},"irrigation-reason":{title:"Vandingsårsag",labels:{reason:"Årsag",sunrise:"Solopgang","total-duration":"Samlet varighed",explanation:"Forklaring"},"no-data":"Ingen data tilgængelige"}}},mappings:{cards:{"add-mapping":{actions:{add:"Tilføj sensorgruppe"},header:"Tilføj sensorgrupper"},mapping:{aggregates:{average:"Gennemsnit",first:"Første",last:"Sidste",maximum:"Maksimum",median:"Median",minimum:"Minimum",riemannsum:"Riemann-sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Du kan ikke slette denne sensorgruppe, fordi mindst én zone bruger den.",invalid_source:"Ugyldig kilde",source_does_not_exist:"Kilden findes ikke. Indtast venligst en gyldig kilde, såsom 'sensor.mysensor'."},items:{dewpoint:"Dugpunkt",evapotranspiration:"Fordampning",humidity:"Luftfugtighed","maximum temperature":"Maksimumtemperatur","minimum temperature":"Minimumtemperatur",precipitation:"Samlet nedbør","current precipitation":"Aktuel nedbør",pressure:"Tryk","solar radiation":"Solstråling",temperature:"Temperatur",windspeed:"Vindhastighed"},pressure_types:{absolute:"absolut",relative:"relativt"},"pressure-type":"Trykket er","sensor-aggregate-of-sensor-values-to-calculate":"af sensorværdier til at beregne varighed","sensor-aggregate-use-the":"Brug","sensor-entity":"Sensorentitet",static_value:"Værdi","input-units":"Input leverer værdier i",source:"Kilde",sources:{none:"Ingen",weather_service:"Vejrtjeneste",sensor:"Sensor",static:"Statisk værdi"}}},description:"Tilføj en eller flere sensorgrupper, der henter vejrdata fra vejrtjeneste, fra sensorer eller en kombination af disse. Du kan tilknytte hver sensorgruppe til en eller flere zoner",labels:{"mapping-name":"Navn"},no_items:"Der er endnu ikke defineret nogen sensorgruppe.",title:"Sensorgrupper","weather-records":{title:"Vejrregistreringer (seneste 10)",timestamp:"Tidspunkt",temperature:"Temp",humidity:"Luftfugtighed",precipitation:"Nedbør","retrieval-time":"Hentet","no-data":"Ingen vejrdata tilgængelige for denne sensorgruppe"}},modules:{cards:{"add-module":{actions:{add:"Tilføj modul"},header:"Tilføj modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Du kan ikke slette dette modul, fordi mindst én zone bruger det."},labels:{configuration:"Konfiguration",required:"angiver et obligatorisk felt"},"translated-options":{DontEstimate:"Estimér ikke",EstimateFromSunHours:"Estimér ud fra soltimer",EstimateFromTemp:"Estimér ud fra temperatur",EstimateFromSunHoursAndTemperature:"Estimér ud fra gennemsnit af soltimer og temperatur"}}},description:"Tilføj et eller flere moduler, der beregner vandingsvarighed. Hvert modul har sin egen konfiguration og kan bruges til at beregne varighed for en eller flere zoner.",no_items:"Der er endnu ikke defineret nogen moduler.",title:"Moduler"},zones:{actions:{add:"Tilføj",calculate:"Beregn",information:"Information",update:"Opdatér","reset-bucket":"Nulstil bucket","view-weather-info":"Se vejrdata","view-weather-info-message":"Vejrdata tilgængelige for","view-watering-calendar":"Se vandingskalender"},cards:{"add-zone":{actions:{add:"Tilføj zone"},header:"Tilføj zone"},"zone-actions":{actions:{"calculate-all":"Beregn alle zoner","update-all":"Opdatér alle zoner","reset-all-buckets":"Nulstil alle buckets","clear-all-weatherdata":"Ryd alle vejrdata"},header:"Handlinger på alle zoner"}},description:"Angiv en eller flere vandingszoner her. Vandingsvarigheden beregnes pr. zone, afhængigt af størrelse, gennemstrømning, tilstand, modul og sensorgruppe.",labels:{bucket:"Bucket",duration:"Varighed","lead-time":"Leveringstid",mapping:"Sensorgruppe","maximum-duration":"Maksimal varighed",multiplier:"Multiplikator",name:"Navn",size:"Størrelse",state:"Tilstand",states:{automatic:"Automatisk",disabled:"Deaktiveret",manual:"Manuel"},throughput:"Gennemstrømning","maximum-bucket":"Maksimal bucket",last_calculated:"Senest beregnet","data-last-updated":"Data senest opdateret","data-number-of-data-points":"Antal datapunkter",drainage_rate:"Drænhastighed","linked-entity":"Tilknyttet ventil/kontakt","linked-entity-hint":"Ventilen eller kontakten, der vander denne zone. Hver gang den kører (en manuel hane, en automatisering eller Smart Irrigation selv, når direkte ventilstyring er slået til), krediteres bucket'en ud fra køretiden og zonens gennemstrømning. Påkrævet for funktionerne med lukket sløjfe.","flow-sensor":"Akkumuleret volumenmåler","flow-sensor-hint":"Til nøjagtig kreditering i stedet for gennemstrømning x tid: en akkumuleret samlet vandmåler (tilstandsklasse total_increasing), ikke en øjeblikkelig gennemstrømningshastighed. Enheden aflæses automatisk (L, mL, m³, gal, ft³).",optional:"valgfri"},no_items:"Der er endnu ikke defineret nogen zoner.",title:"Zoner"}},at="Smart Irrigation",tt={title:"Vandingsstart-udløsere",description:"Konfigurér, hvornår vanding skal starte baseret på solbegivenheder. Du kan tilføje flere udløsere til forskellige planer. For solopgangsudløsere vil et offset på 0 automatisk bruge den samlede varighed af alle aktiverede zoner.",usage_before:"Når en udløser aktiveres, udsender Smart Irrigation begivenheden ",usage_after:" — lyt efter den i en automatisering for at starte vanding. Begivenhedsdataene indeholder trigger_name, trigger_type og offset_minutes, så du kan reagere forskelligt pr. udløser. Indstillingerne for nedbørsspring og dage-mellem-vanding gælder stadig: på en springdag udsendes ingen begivenhed.",add_trigger:"Tilføj udløser",edit_trigger:"Redigér udløser",delete_trigger:"Slet udløser",trigger_types:{sunrise:"Solopgang",sunset:"Solnedgang",solar_azimuth:"Solens azimut"},fields:{name:{name:"Udløsernavn",description:"Et beskrivende navn til at identificere denne udløser"},type:{name:"Udløsertype",description:"Typen af solbegivenhed der skal udløse på"},enabled:{name:"Aktiveret",description:"Om denne udløser i øjeblikket er aktiv"},offset_minutes:{name:"Offset (minutter)",description:"Minutter før (-) eller efter (+) solbegivenheden. For solopgangsudløsere, brug 0 for automatisk timing baseret på den samlede zonevarighed."},azimuth_angle:{name:"Azimutvinkel (grader)",description:"Solens azimutvinkel i grader, hvor 0=Nord, 90=Øst, 180=Syd, 270=Vest"},account_for_duration:{name:"Tag højde for varighed",description:"Når aktiveret, starter vandingen tidligt nok til at slutte på det angivne tidspunkt. Når deaktiveret, starter vandingen præcis på det angivne tidspunkt."}},dialog:{add_title:"Tilføj vandingsstart-udløser",edit_title:"Redigér vandingsstart-udløser",cancel:"Annullér",save:"Gem",delete:"Slet",help:"Når denne udløser aktiveres, udsender Smart Irrigation følgende begivenhed — brug den i en automatisering for at starte vanding. Begivenhedsdataene indeholder denne udløsers navn (samt type/offset), så du kan reagere specifikt på den:"},no_triggers:"Ingen vandingsstart-udløsere konfigureret. Systemet vil bruge standardadfærden (solopgang med samlet zonevarighed). Tilføj udløsere for at tilpasse, hvornår vanding starter.",offset_auto:"Auto (beregnet ud fra samlet zonevarighed)",confirm_delete:"Er du sikker på, at du vil slette udløseren '{name}'?",validation:{name_required:"Udløsernavn er påkrævet",azimuth_invalid:"Azimutvinkel skal være et gyldigt tal"},help:{sunrise_offset:"For solopgangsudløsere: Brug negative værdier for at starte før solopgang, positive for at starte efter. Sæt til 0 for automatisk at starte tidligt nok til at fuldføre alle zoner før solopgang.",sunset_offset:"For solnedgangsudløsere: Brug negative værdier for at starte før solnedgang, positive for at starte efter solnedgang.",azimuth_explanation:"Solens azimut er solens kompasretning. 0°=Nord, 90°=Øst, 180°=Syd, 270°=Vest. Du kan indtaste en hvilken som helst vinkelværdi (f.eks. 450° = 90°, -30° = 330°). Brug dette til at udløse vanding, når solen når en bestemt position.",multiple_triggers:"Du kan konfigurere flere udløsere. Hver aktiveret udløser planlægger vandingsstarter uafhængigt."},active_label:"Aktiv udløser",active_default:"Standard (solopgang minus samlet vandingsvarighed)",active_hint:'Kun den valgte udløser starter vanding, så den kører én gang om dagen. "Standard" tilpasser kørslen, så den afsluttes præcis ved solopgang. Tilføj brugerdefinerede udløsere (solnedgang, azimut, forskydninger) nedenfor, og vælg derefter én her.'},it={title:"Vejrbaseret vandingsspring",description:"Spring automatisk vanding over, når der er varslet nedbør. Denne funktion kræver, at en vejrtjeneste er konfigureret.",threshold_label:"Nedbørstærskel",threshold_description:"Mindste mængde nedbør (i mm) varslet for i dag og i morgen for at springe vanding over."},nt={title:"Placeringskoordinater",description:"Konfigurér placeringskoordinater til hentning af vejrdata. Du kan om nødvendigt bruge manuelle koordinater, der adskiller sig fra din Home Assistant-placering.",manual_enabled:"Brug manuelle koordinater",use_ha_location:"Brug Home Assistant-placering",latitude:"Breddegrad (decimalgrader)",longitude:"Længdegrad (decimalgrader)",elevation:"Højde (meter over havets overflade)",current_ha_coords:"Aktuelle Home Assistant-koordinater"},rt={title:"Dage mellem vanding",description:"Konfigurér det mindste antal dage, der skal gå mellem vandingsbegivenheder. Dette hjælper med at styre vandingsfrekvensen til vandbesparelse og pleje af plantesundhed.\n\nTypiske anvendelser i den virkelige verden:\n• Plænepleje: 1-2 dages intervaller forhindrer overvanding\n• Tørkerestriktioner: 6+ dages intervaller til ugentlig vanding\n• Dybtrodede planter: 3-7 dages intervaller til mindre hyppig vanding\n• Vandbesparelse: Kan tilpasses ud fra klima- og jordforhold",label:"Mindste antal dage mellem vanding",help_text:"Sæt til 0 for at deaktivere denne funktion. Værdier fra 1-365 dage understøttes. Denne indstilling fungerer sammen med eksisterende logik for nedbørsprognoser."},st={title:"Observeret vanding (lukket sløjfe)",description:"Kreditér automatisk hver zones bucket ud fra reel vanding i stedet for at nulstille bucket'en fra en automatisering. Når funktionen er aktiveret, vælges en ventil/kontakt-entitet pr. zone under fanen Zoner: mens den er åben, krediteres bucket'en ud fra køretiden og zonens gennemstrømning. For nøjagtig bogføring kan du også vælge en akkumuleret volumenmåler (en samlet vandmåler) pr. zone, og den målte volumen anvendes i stedet. Vigtigt: når dette er slået til, er det det eneste, der krediterer bucket'en, så fjern ethvert reset_bucket-kald fra din vandingsautomatisering for at undgå dobbelttælling.",enabled_label:"Aktivér observeret vanding",direct_control_label:"Lad Smart Irrigation styre ventilen",direct_control_description:"Når funktionen er slået til, åbner Smart Irrigation hver zones tilknyttede ventil, venter den beregnede varighed og lukker den derefter - ingen automatisering nødvendig. En igangværende kørsel genoptages efter en genstart. Sikkerhed: hvis Home Assistant er nede i længere tid midt i en kørsel, forbliver ventilen åben og fortsætter med at vande, så giv din ventil en hardware-failsafe (en maksimal køretid).",sequencing_label:"Zonesekvensering",sequencing:{sequential:"Sekventiel (én zone ad gangen)",parallel:"Parallel (alle zoner på én gang)"}},ot={common:Ka,defaults:Ja,module:Qa,calcmodules:Xa,panels:et,title:at,irrigation_start_triggers:tt,weather_skip:it,coordinate_config:nt,days_between_irrigation:rt,observed_watering:st},lt=Object.freeze({__proto__:null,calcmodules:Xa,common:Ka,coordinate_config:nt,days_between_irrigation:rt,default:ot,defaults:Ja,irrigation_start_triggers:tt,module:Qa,observed_watering:st,panels:et,title:at,weather_skip:it}),dt={loading:"Wird geladen",saving:"Wird gespeichert",actions:{delete:"Lösche"},labels:{module:"Modul",no:"Nein",select:"Wähle",yes:"Ja",enabled:"Aktiviert",disabled:"Deaktiviert",before:"vor",after:"nach"},units:{seconds:"Sekunden"},attributes:{size:"Größe",throughput:"Durchfluss",state:"Zustand",bucket:"Bucket",last_updated:"zuletzt aktualisiert",last_calculated:"zuletzt berechnet",number_of_data_points:"Anzahl der Datenpunkte"},"loading-messages":{configuration:"Konfiguration wird geladen…",modules:"Module werden geladen…",general:"Wird geladen…"},"saving-messages":{adding:"Wird hinzugefügt…",saving:"Wird gespeichert…"}},ut={"default-zone":"Standard Zone","default-mapping":"Standard Sensorgruppe"},ct={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Beachte: Diese Beschreibung nutzt '.' als Dezimalzeichen und zeigt gerundete Werte. Das Modul berechnete einen Evapotranspirationsmangel von","bucket-was":"Der alte Vorrat war","new-bucket-values-is":"Der neue Vorrat ist",bucket:"Vorrat","old-bucket-variable":"alter_Vorrat","max-bucket-variable":"max_bucket",delta:"Veränderung","bucket-less-than-zero-irrigation-necessary":"Wenn der Vorrat < 0 ist, ist eine Bewässerung nötig.","steps-taken-to-calculate-duration":"Für eine exakte Berechnung der Dauer, wurden folgende Schritte durchgeführt","precipitation-rate-defined-as":"Der Niederschlag ist","duration-is-calculated-as":"Die Dauer ist",drainage:"drainage","drainage-rate":"drainage_rate",hours:"Stunden","precipitation-rate-variable":"Niederschlag","multiplier-is-applied":"Der Multiplikator wird angewendet. Der Multiplikator ist","duration-after-multiplier-is":"also ist die Dauer","maximum-duration-is-applied":"Die maximale Dauer wird angewendet. Diese ist","duration-after-maximum-duration-is":"also ist die Dauer","lead-time-is-applied":"Zuletzt wird die Vorlaufzeit angewendet. Die Vorlaufzeit ist","duration-after-lead-time-is":"also ist die Dauer","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Wenn der Vorrat >= 0 ist, ist keine Bewässerung nötig und die Dauer ist gleich","maximum-bucket-is":"Der maximale Vorrat ist","drainage-rate-is":"Die Entwässerungsrate bei Sättigung (Bucket am Maximum) beträgt","current-drainage-is":"Die aktuelle Entwässerung wird berechnet als","no-drainage":"Die aktuelle Entwässerung beträgt 0, weil"}}},pt={pyeto:{description:"Die Berechnung der Verunstungsrate basiert auf der FAO56-Formel aus der PyETO-Bibliothek"},static:{description:"Modul mit einer statisch konfigurierbaren Verdunstungsrate."},passthrough:{description:"Pass Through übernimmt den Evapotranspirationssensor und gibt seinen Wert zurück. Auf diese Weise werden alle Berechnungen der Verdunstung umgangen, außer der Anwendung von Aggregaten wie Summe, Durchschnitt etc)."}},mt={weatherservice:{title:"Wetterdienst",description:"Zeigen und ändern Sie den Wetterdienst, der zum Abrufen der Wetterdaten verwendet wird — ohne die Integration neu installieren zu müssen. Der API-Schlüssel wird validiert und die Änderung sofort angewendet.",labels:{"use-weather-service":"Einen Wetterdienst verwenden",service:"Wetterdienst","api-key":"API-Schlüssel"},actions:{save:"Speichern",saving:"Wird gespeichert…"},messages:{"no-service":"Es wird kein Wetterdienst verwendet — die Wetterdaten stammen ausschließlich von Ihren eigenen Sensoren.",saved:"Wetterdienst aktualisiert und angewendet.","reload-note":"Beim Speichern wird der API-Schlüssel mit dem Dienst validiert und die Änderung sofort angewendet."}},backuprestore:{title:"Sichern / Wiederherstellen",description:"Exportieren Sie die vollständige Smart Irrigation-Konfiguration in eine JSON-Datei oder stellen Sie sie aus einer früheren Sicherung wieder her.",cards:{backup:{title:"Sicherung",description:"Laden Sie die vollständige Konfiguration (allgemeine Einstellungen, Zonen, Module und Sensorgruppen) als JSON-Datei herunter."},restore:{title:"Wiederherstellen",description:"Laden Sie eine zuvor exportierte JSON-Datei, um die aktuelle Konfiguration zu ersetzen."}},actions:{export:"Als JSON exportieren","choose-file":"Sicherungsdatei auswählen…",restore:"Diese Sicherung wiederherstellen",restoring:"Wird wiederhergestellt…"},messages:{exported:"Sicherungsdatei heruntergeladen.",restored:"Konfiguration wiederhergestellt — Integration wird neu geladen.","invalid-file":"Diese Datei ist keine gültige Smart Irrigation-Sicherung.","confirm-title":"Gesamte Konfiguration ersetzen?",summary:"Diese Sicherung enthält","confirm-warning":"Beim Wiederherstellen werden alle aktuellen allgemeinen Einstellungen, Zonen, Module und Sensorgruppen überschrieben. Dies kann nicht rückgängig gemacht werden.","reload-note":"Beim Wiederherstellen wird alles ersetzt und die Integration neu geladen, um die Änderung anzuwenden."}},general:{cards:{"automatic-duration-calculation":{header:"Automatische Berechnung der Bewässerungsdauer",description:"Die Berechnung berücksichtigt die bis zu diesem Zeitpunkt gesammelten Wetterdaten und aktualisiert den Vorrat für jede automatische Zone. Anschließend wird die Dauer basierend auf dem neuen Vorrat angepasst und die gesammelten Wetterdaten entfernt.",labels:{"auto-calc-enabled":"Automatische Berechnung der Dauer pro Zone","calc-time":"Berechnen um"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungsdauer"},header:"Automatische Aktualisierung der Wetterdaten",description:"Die Wetterdaten werden automatisch gesammelt und gespeichert. Zur Berechnung der Zonen und Bewässerungsdauer sind Wetterdaten erforderlich.",labels:{"auto-update-enabled":"Automatisches Update der Wetterdaten","auto-update-schedule":"Aktualisierungszeitplan","auto-update-time":"Aktualisieren um","auto-update-interval":"Update der Sensordaten alle","auto-update-delay":"Update Verzögerung"},options:{minutes:"Minuten",hours:"Stunden",days:"Tage"}},"automatic-clear":{header:"Automatisches Löschen der Wetterdaten",description:"Gesammelte Wetterdaten zu einem bestimmten Zeitpunkt automatisch entfernen. Damit wird sicher gestellt, dass keine Wetterdaten von vergangenen Tagen übrig bleiben. Entferne die Wetterdaten nicht vor der Berechnung und verwende diese Option nur, wenn du erwartest, dass das automatische Update Wetterdaten erfasst hat, nachdem der Tag berechnet wurde. Idealerweise sollte dieser Schnitt so spät wie möglich Tag durchgeführt werden.",labels:{"automatic-clear-enabled":"Automatisches Löschen der Wetterdaten","automatic-clear-time":"Löschen der Wetterdaten um"}},continuousupdates:{header:"Kontinuierliche Updates für Sensoren (experimentell)",description:"Diese experimentelle Funktion aktualisiert die Sensordaten kontinuierlich. Das ist nützlich für Sensorgruppen, die Quellen mit kontinuierlichen Daten verwenden, etwa Wetterstationen. Diese Funktion kann nicht für Sensorgruppen verwendet werden, die zumindest teilweise auf Wetterdiensten beruhen, da kontinuierliches Abfragen von APIs Kosten verursacht. Beachten Sie, dass dies experimentell ist und möglicherweise nicht wie erwartet funktioniert. Verwendung auf eigenes Risiko.",labels:{continuousupdates:"Kontinuierliche Updates aktivieren",sensor_debounce:"Sensor-Entprellung"}}},description:"Diese Seite ist für allgemeine Einstellungen.",title:"Allgemein"},help:{title:"Hilfe",cards:{"how-to-get-help":{title:"Hilfe bekommen","first-read-the":"Lies zuerst im",wiki:"Wiki","if-you-still-need-help":"Benötigst du weiterhin Hilfe, wende dich an das","community-forum":"Community Forum","or-open-a":"oder eröffne einen","github-issue":"Github Issue","english-only":"nur Englisch"}}},info:{title:"Infos",description:"Informationen zur nächsten Bewässerung und zum Systemstatus anzeigen.","configuration-not-available":"Konfiguration nicht verfügbar.",cards:{"zone-bucket-values":{title:"Bucket-Werte & Dauer pro Zone",labels:{bucket:"Bucket",duration:"Dauer"},"no-zones":"Keine Zonen konfiguriert"},"next-irrigation":{title:"Nächste Bewässerung",labels:{"next-start":"Nächster Start",duration:"Dauer",zones:"Zonen"},"no-data":"Keine Daten verfügbar"},"irrigation-reason":{title:"Bewässerungsgrund",labels:{reason:"Grund",sunrise:"Sonnenaufgang","total-duration":"Gesamtdauer",explanation:"Erläuterung"},"no-data":"Keine Daten verfügbar"}}},mappings:{cards:{"add-mapping":{actions:{add:"Hinzufügen"},header:"Sensorgruppe hinzufügen"},mapping:{aggregates:{average:"Durchschnitt",first:"Erster",last:"Letzter",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann-Summe",sum:"Summe",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird.",invalid_source:"Ungültige Quelle",source_does_not_exist:'Die Quelle existiert nicht. Bitte geben Sie eine gültige Quelle an, z. B. "sensor.mysensor".'},items:{dewpoint:"Taupunkt",evapotranspiration:"Verdunstung",humidity:"Feuchtigkeit","maximum temperature":"Maximum-Temperatur","minimum temperature":"Minimum-Temperatur",precipitation:"Gesamtniederschlag","current precipitation":"Aktueller Niederschlag",pressure:"Luftdruck","solar radiation":"Sonnenstrahlung",temperature:"Temperatur",windspeed:"Windgeschwindigkeit"},pressure_types:{absolute:"absolut",relative:"relativ"},"pressure-type":"Der Luftdruck ist","sensor-aggregate-of-sensor-values-to-calculate":"des Sensors für die Berechnung.","sensor-aggregate-use-the":"Nutze den/die/das","sensor-entity":"Sensor Entität",static_value:"Wert","input-units":"Sensor Werte in",source:"Quelle",sources:{none:"Keine",weather_service:"Weather service",sensor:"Sensor",static:"Fester Wert"}}},description:"Füge eine oder mehrere Sensorgruppen hinzu, die Wetterdaten von Weather service, Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",labels:{"mapping-name":"Name"},no_items:"Es ist noch keine Sensorgruppe angelegt.",title:"Sensorgruppen","weather-records":{title:"Wetteraufzeichnungen (letzte 10)",timestamp:"Zeit",temperature:"Temp.",humidity:"Luftfeuchtigkeit",precipitation:"Niederschl.","retrieval-time":"Abgerufen","no-data":"Keine Wetterdaten für diese Sensorgruppe verfügbar"}},modules:{cards:{"add-module":{actions:{add:"Hinzufügen"},header:"Modul hinzufügen"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird."},labels:{configuration:"Konfiguration",required:"Feld ist erforderlich"},"translated-options":{DontEstimate:"Nicht berechnen",EstimateFromSunHours:"Basierend auf den Sonnenstunden",EstimateFromTemp:"Basierend auf der Temperatur",EstimateFromSunHoursAndTemperature:"Basierend auf dem Durchschnitt von Sonnenstunden und Temperatur"}}},description:"Füge ein oder mehrere Module hinzu. Module berechnen die Bewässerungsdauer. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungsdauer für eine oder mehrere Zonen verwendet werden.",no_items:"Es ist noch kein Module angelegt.",title:"Module"},zones:{actions:{add:"Hinzufügen",calculate:"Bewässerungsdauer berechnen.",information:"Information",update:"Wetterdaten aktualisieren.","reset-bucket":"Vorrat zurücksetzen","view-weather-info":"Wetterdaten anzeigen","view-weather-info-message":"Wetterdaten verfügbar für","view-watering-calendar":"Bewässerungskalender anzeigen"},cards:{"add-zone":{actions:{add:"Hinzufügen"},header:"Zone hinzufügen"},"zone-actions":{actions:{"calculate-all":"Alle Zonen berechnen","update-all":"Alle Zonen aktualisieren","reset-all-buckets":"Alle Vorräte zurücksetzen","clear-all-weatherdata":"Alle Wetterdaten löschen"},header:"Aktionen für alle Zonen"}},description:"Füge eine oder mehrere Zonen hinzu. Die Bewässerungsdauer wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",labels:{bucket:"Vorrat",duration:"Dauer","lead-time":"Vorlaufzeit",mapping:"Sensorgruppe","maximum-duration":"Maximale Dauer",multiplier:"Multiplikator",name:"Name",size:"Größe",state:"Berechnung",states:{automatic:"Automatisch",disabled:"Aus",manual:"Manuell"},throughput:"Durchfluss","maximum-bucket":"Maximaler Vorrat",last_calculated:"Zuletzt berechnet","data-last-updated":"Daten zuletzt aktualisiert","data-number-of-data-points":"Anzahl der Messungen",drainage_rate:"Entwässerungsrate","linked-entity":"Verknüpftes Ventil/Schalter","linked-entity-hint":"Das Ventil oder der Schalter, der diese Zone bewässert. Immer wenn er läuft (ein manueller Wasserhahn, eine Automatisierung oder Smart Irrigation selbst bei aktivierter direkter Ventilsteuerung), wird der Eimer aus der Laufzeit und dem Durchsatz der Zone gutgeschrieben. Erforderlich für die Closed-Loop-Funktionen.","flow-sensor":"Kumulativer Volumenzähler","flow-sensor-hint":"Für eine exakte Gutschrift anstelle von Durchsatz x Zeit: ein kumulativer Wasserzählerstand (Statusklasse total_increasing), keine momentane Durchflussrate. Die Einheit wird automatisch ausgelesen (L, mL, m³, gal, ft³).",optional:"optional"},no_items:"Es ist noch keine Zone vorhanden.",title:"Zonen"}},gt="Smart Irrigation",ht={title:"Bewässerungsstart-Auslöser",description:"Legen Sie fest, wann die Bewässerung anhand von Sonnenereignissen starten soll. Sie können mehrere Auslöser für verschiedene Zeitpläne hinzufügen. Wenn Sie bei Sonnenaufgangs-Auslösern den Versatz auf 0 lassen, wird automatisch die Gesamtdauer aller aktivierten Zonen verwendet.",usage_before:"Wenn ein Auslöser ausgelöst wird, sendet Smart Irrigation das Ereignis ",usage_after:" — reagieren Sie darauf in einer Automatisierung, um die Bewässerung zu starten. Die Ereignisdaten enthalten trigger_name, trigger_type und offset_minutes, sodass Sie je Auslöser unterschiedlich reagieren können. Die Einstellungen für Niederschlagsüberspringung und Tage zwischen den Bewässerungen gelten weiterhin: an einem Überspringungstag wird kein Ereignis ausgelöst.",add_trigger:"Auslöser hinzufügen",edit_trigger:"Auslöser bearbeiten",delete_trigger:"Auslöser löschen",trigger_types:{sunrise:"Sonnenaufgang",sunset:"Sonnenuntergang",solar_azimuth:"Sonnenazimut"},fields:{name:{name:"Auslösername",description:"Ein beschreibender Name zur Identifizierung dieses Auslösers"},type:{name:"Auslösertyp",description:"Die Art des Sonnenereignisses, das den Auslöser aktiviert"},enabled:{name:"Aktiviert",description:"Ob dieser Auslöser derzeit aktiv ist"},offset_minutes:{name:"Versatz (Minuten)",description:"Minuten vor (-) oder nach (+) dem Sonnenereignis. Verwenden Sie bei Sonnenaufgangs-Auslösern 0 für eine automatische Zeitsteuerung basierend auf der Gesamtdauer der Zonen."},azimuth_angle:{name:"Azimutwinkel (Grad)",description:"Sonnenazimutwinkel in Grad, wobei 0=Nord, 90=Ost, 180=Süd, 270=West"},account_for_duration:{name:"Dauer berücksichtigen",description:"Wenn aktiviert, startet die Bewässerung früh genug, um zur angegebenen Zeit fertig zu sein. Wenn deaktiviert, startet die Bewässerung genau zur angegebenen Zeit."}},dialog:{add_title:"Bewässerungsstart-Auslöser hinzufügen",edit_title:"Bewässerungsstart-Auslöser bearbeiten",cancel:"Abbrechen",save:"Speichern",delete:"Löschen",help:"Wenn dieser Auslöser ausgelöst wird, sendet Smart Irrigation das folgende Ereignis — verwenden Sie es in einer Automatisierung, um die Bewässerung zu starten. Die Ereignisdaten enthalten den Namen dieses Auslösers (sowie Typ/Versatz), sodass Sie gezielt darauf reagieren können:"},no_triggers:"Keine Bewässerungsstart-Auslöser konfiguriert. Das System verwendet das Standardverhalten (Sonnenaufgang mit der Gesamtdauer der Zonen). Fügen Sie Auslöser hinzu, um anzupassen, wann die Bewässerung startet.",offset_auto:"Automatisch (aus der Gesamtdauer der Zonen berechnet)",confirm_delete:'Möchten Sie den Auslöser "{name}" wirklich löschen?',validation:{name_required:"Der Auslösername ist erforderlich",azimuth_invalid:"Der Azimutwinkel muss eine gültige Zahl sein"},help:{sunrise_offset:"Für Sonnenaufgangs-Auslöser: Verwenden Sie negative Werte, um vor Sonnenaufgang zu starten, positive für danach. Setzen Sie auf 0, um automatisch früh genug zu starten, damit alle Zonen vor Sonnenaufgang fertig sind.",sunset_offset:"Für Sonnenuntergangs-Auslöser: Verwenden Sie negative Werte, um vor Sonnenuntergang zu starten, positive für nach Sonnenuntergang.",azimuth_explanation:"Das Sonnenazimut ist die Himmelsrichtung der Sonne. 0°=Nord, 90°=Ost, 180°=Süd, 270°=West. Sie können einen beliebigen Winkelwert eingeben (z. B. 450°=90°, -30°=330°). Damit lösen Sie die Bewässerung aus, wenn die Sonne eine bestimmte Position erreicht.",multiple_triggers:"Sie können mehrere Auslöser konfigurieren. Jeder aktivierte Auslöser plant Bewässerungsstarts unabhängig."},active_label:"Aktiver Auslöser",active_default:"Standard (Sonnenaufgang minus gesamte Bewässerungsdauer)",active_hint:'Nur der ausgewählte Auslöser startet die Bewässerung, sodass sie einmal pro Tag läuft. "Standard" legt den Vorgang so, dass er genau bei Sonnenaufgang endet. Fügen Sie unten benutzerdefinierte Auslöser hinzu (Sonnenuntergang, Azimut, Versätze) und wählen Sie hier einen aus.'},vt={title:"Wetterbasiertes Überspringen der Bewässerung",description:"Bewässerung automatisch überspringen, wenn Niederschlag vorhergesagt ist. Diese Funktion erfordert einen konfigurierten Wetterdienst.",threshold_label:"Niederschlagsschwelle",threshold_description:"Mindestmenge an Niederschlag (in mm), die für heute und morgen vorhergesagt sein muss, um die Bewässerung zu überspringen."},ft={title:"Standortkoordinaten",description:"Konfigurieren Sie Standortkoordinaten für den Abruf von Wetterdaten. Sie können manuelle Koordinaten verwenden, die sich von Ihrem Home Assistant Standort unterscheiden.",manual_enabled:"Manuelle Koordinaten verwenden",use_ha_location:"Home Assistant Standort verwenden",latitude:"Breitengrad (Dezimalgrad)",longitude:"Längengrad (Dezimalgrad)",elevation:"Höhe (Meter über dem Meeresspiegel)",current_ha_coords:"Aktuelle Home Assistant Koordinaten"},bt={title:"Tage zwischen Bewässerungen",description:"Konfigurieren Sie die Mindestanzahl von Tagen, die zwischen Bewässerungsereignissen vergehen müssen. Dies hilft bei der Kontrolle der Bewässerungshäufigkeit für Wassereinsparung und Pflanzengesundheit.\n\nTypische Anwendungsfälle:\n• Rasenpflege: 1-2 Tage Intervalle verhindern Überwässerung\n• Dürrebeschränkungen: 6+ Tage Intervalle für wöchentliche Bewässerung\n• Tiefwurzelnde Pflanzen: 3-7 Tage Intervalle für seltene Bewässerung\n• Wassereinsparung: Anpassbar je nach Klima und Bodenbedingungen",label:"Mindest-Tage zwischen Bewässerungen",help_text:"Setzen Sie auf 0, um diese Funktion zu deaktivieren. Werte von 1-365 Tagen werden unterstützt. Diese Einstellung funktioniert zusammen mit der bestehenden Niederschlagsprognose-Logik."},kt={title:"Beobachtete Bewässerung (Closed Loop)",description:'Schreibt den Eimer jeder Zone automatisch aus der tatsächlichen Bewässerung gut, anstatt den Eimer über eine Automatisierung zurückzusetzen. Nach der Aktivierung wählen Sie im Tab "Zonen" pro Zone ein Ventil/Schalter-Entity aus: Solange es geöffnet ist, wird der Eimer aus der Laufzeit und dem Durchsatz der Zone gutgeschrieben. Für eine exakte Abrechnung können Sie außerdem pro Zone einen kumulativen Volumenzähler (im Stil eines Wasserzählerstands) auswählen, dann wird das gemessene Volumen verwendet. Wichtig: Wenn diese Funktion aktiv ist, schreibt sie als Einzige den Eimer gut, entfernen Sie daher jeden reset_bucket-Aufruf aus Ihrer Bewässerungs-Automatisierung, um Doppelzählungen zu vermeiden.',enabled_label:"Beobachtete Bewässerung aktivieren",direct_control_label:"Smart Irrigation das Ventil steuern lassen",direct_control_description:"Wenn aktiviert, öffnet Smart Irrigation das verknüpfte Ventil jeder Zone, wartet die berechnete Dauer ab und schließt es dann - keine Automatisierung erforderlich. Ein laufender Vorgang wird nach einem Neustart fortgesetzt. Sicherheit: Wenn Home Assistant während eines Vorgangs für längere Zeit ausfällt, bleibt das Ventil geöffnet und bewässert weiter. Statten Sie Ihr Ventil daher mit einer Hardware-Ausfallsicherung aus (einer maximalen Laufzeit).",sequencing_label:"Zonenabfolge",sequencing:{sequential:"Sequenziell (eine Zone nach der anderen)",parallel:"Parallel (alle Zonen gleichzeitig)"}},yt={common:dt,defaults:ut,module:ct,calcmodules:pt,panels:mt,title:gt,irrigation_start_triggers:ht,weather_skip:vt,coordinate_config:ft,days_between_irrigation:bt,observed_watering:kt},_t=Object.freeze({__proto__:null,calcmodules:pt,common:dt,coordinate_config:ft,days_between_irrigation:bt,default:yt,defaults:ut,irrigation_start_triggers:ht,module:ct,observed_watering:kt,panels:mt,title:gt,weather_skip:vt}),zt={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"bucket",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."}},wt={"default-zone":"Default zone","default-mapping":"Default sensor group"},xt={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values. Module returned Evapotranspiration deficiency ( = et0 * hour_multiplier + precipitation) of","bucket-was":"Bucket was","new-bucket-values-is":"New bucket value is",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since bucket < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since bucket >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum bucket size is","drainage-rate-is":"Drainage rate when saturated (bucket at max) is","current-drainage-is":"Current drainage is calculated as","no-drainage":"Current drainage is 0 because"}}},jt={pyeto:{description:"Calculate duration based on the FAO56 calculation from the PyETO library"},static:{description:"'Dummy' module with a static configurable delta"},passthrough:{description:"Passthrough module that returns the value of an Evapotranspiration sensor as delta"}},St={weatherservice:{title:"Weather service",description:"View and change the weather service used to fetch weather data — no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key"},actions:{save:"Save",saving:"Saving…"},messages:{"no-service":"No weather service is used — weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately."}},backuprestore:{title:"Backup / restore",description:"Export the full Smart Irrigation configuration to a JSON file, or restore it from a previous backup.",cards:{backup:{title:"Backup",description:"Download the complete configuration (general settings, zones, modules and sensor groups) as a JSON file."},restore:{title:"Restore",description:"Load a previously exported JSON file to replace the current configuration."}},actions:{export:"Export to JSON","choose-file":"Choose a backup file…",restore:"Restore this backup",restoring:"Restoring…"},messages:{exported:"Backup file downloaded.",restored:"Configuration restored — reloading the integration.","invalid-file":"This file is not a valid Smart Irrigation backup.","confirm-title":"Replace the entire configuration?",summary:"This backup contains","confirm-warning":"Restoring overwrites all current general settings, zones, modules and sensor groups. This cannot be undone.","reload-note":"Restoring replaces everything and reloads the integration to apply the change."}},general:{cards:{"automatic-duration-calculation":{header:"Automatic duration calculation",description:"Calculation takes collected weather data up to that point and updates the bucket for each automatic zone. Then, the duration is adjusted based on the new bucket value and the collected weather data is removed.",labels:{"auto-calc-enabled":"Automatically calculate irrigation durations","calc-time":"Calculate at"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Update sensor data every","auto-update-delay":"Update delay"},options:{minutes:"minutes",hours:"hours",days:"days"}},"automatic-clear":{header:"Automatic weather data pruning",description:"Automatically remove collected weather data at a configured time. Use this to make sure that there is no left over weather data from previous days. Don't remove the weather data before you calculate and only use this option if you expect the automatic update to collect weather data after you calculated for the day. Ideally, you want to prune as late in the day as possible.",labels:{"automatic-clear-enabled":"Automatically clear collected weather data","automatic-clear-time":"Clear weather data at"}},continuousupdates:{header:"Continuous updates for sensors (experimental)",description:"This experimental feature will continuously update the sensor data. This is useful for sensor groups that use sources that provide continuous data, such as weather stations. This feature cannot be used for sensor groups that at least partly rely on weather services as continous polling of APIs will incur costs. Keep in mind that this is experimental and may not work as expected. Use at your own risk.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"}}},info:{title:"Info",description:"View information about next irrigation and system status.","configuration-not-available":"Configuration not available.",cards:{"zone-bucket-values":{title:"Zone bucket values & duration",labels:{bucket:"Bucket",duration:"Duration"},"no-zones":"No zones configured"},"next-irrigation":{title:"Next irrigation",labels:{"next-start":"Next start",duration:"Duration",zones:"Zones"},"no-data":"No data available"},"irrigation-reason":{title:"Irrigation reason",labels:{reason:"Reason",sunrise:"Sunrise","total-duration":"Total duration",explanation:"Explanation"},"no-data":"No data available"}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-of-sensor-values-to-calculate":"of sensor values to calculate duration","sensor-aggregate-use-the":"Use the","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",weather_service:"Weather service",sensor:"Sensor",static:"Static value"}}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name"},no_items:"There are no sensor group defined yet.",title:"Sensor groups","weather-records":{title:"Weather records (last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket","et-deficiency":"Daily ET deficiency",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Multiplier",name:"Name",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate","linked-entity":"Linked valve/switch","linked-entity-hint":"The valve or switch that waters this zone. Whenever it runs (a manual tap, an automation, or Smart Irrigation itself when direct valve control is on), the bucket is credited from the run time and the zone's throughput. Required for the closed-loop features.","flow-sensor":"Cumulative volume meter","flow-sensor-hint":"For exact crediting instead of throughput x time: a cumulative water-meter total (state class total_increasing), not an instant flow rate. The unit is read automatically (L, mL, m³, gal, ft³).",optional:"optional"},no_items:"There are no zones defined yet.",title:"Zones"}},At="Smart Irrigation",$t={title:"Irrigation start triggers",description:"Configure when irrigation should start based on solar events. Define your triggers below, then choose which single one starts irrigation. For sunrise triggers, leaving offset at 0 will automatically use the total duration of all enabled zones.",active_label:"Active trigger",active_default:"Default (sunrise minus total watering duration)",active_hint:'Only the selected trigger starts irrigation, so it runs once per day. "Default" times the run to finish right at sunrise. Add custom triggers (sunset, azimuth, offsets) below, then pick one here.',usage_before:"When a trigger fires, Smart Irrigation emits the event ",usage_after:" — listen to it in an automation to start watering. The event data includes trigger_name, trigger_type and offset_minutes, so you can react differently per trigger. The precipitation skip and days-between-irrigation settings still apply: on a skip day no event is fired.",add_trigger:"Add trigger",edit_trigger:"Edit Trigger",delete_trigger:"Delete Trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth"},fields:{name:{name:"Trigger Name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger Type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Offset (minutes)",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth Angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for Duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete",help:"When this trigger fires, Smart Irrigation emits the following event — use it in an automation to start watering. The event data includes this trigger's name (and type/offset), so you can react to it specifically:"},no_triggers:"No irrigation start triggers configured. The system will use the default behavior (sunrise with total zone duration). Add triggers to customize when irrigation starts.",offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number"},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can configure multiple triggers. Each enabled trigger will independently schedule irrigation starts."}},Et={title:"Weather-based irrigation skip",description:"Automatically skip irrigation when precipitation is forecasted. This feature requires a weather service to be configured.",threshold_label:"Precipitation Threshold",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation."},Tt={title:"Location coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Mt={title:"Days between irrigation",description:"Configure the minimum number of days that must pass between irrigation events. This helps control watering frequency for water conservation and plant health management.\n\nTypical real-world use cases:\n• Lawn care: 1-2 day intervals prevent overwatering\n• Drought restrictions: 6+ day intervals for weekly watering\n• Deep-rooted plants: 3-7 day intervals for less frequent watering\n• Water conservation: Customizable based on climate and soil conditions",label:"Minimum days between irrigation",help_text:"Set to 0 to disable this feature. Values from 1-365 days are supported. This setting works alongside existing precipitation forecasting logic."},Dt={title:"Observed watering (closed loop)",description:"Credit each zone's bucket automatically from real irrigation, instead of resetting the bucket from an automation. Once enabled, pick a valve/switch entity per zone in the Zones tab: while it is open, the bucket is credited from the run time and the zone's throughput. For exact accounting you can also pick a cumulative volume meter (a water-meter style total) per zone, and the measured volume is used instead. Important: when this is on it is the only thing crediting the bucket, so remove any reset_bucket call from your irrigation automation to avoid double counting.",enabled_label:"Enable observed watering",direct_control_label:"Let Smart Irrigation control the valve",direct_control_description:"When on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it - no automation needed. An in-flight run resumes after a restart. Safety: if Home Assistant goes down for a long time mid-run the valve stays open and keeps watering, so give your valve a hardware failsafe (a maximum runtime).",sequencing_label:"Zone sequencing",sequencing:{sequential:"Sequential (one zone at a time)",parallel:"Parallel (all zones at once)"}},Ot={common:zt,defaults:wt,module:xt,calcmodules:jt,panels:St,title:At,irrigation_start_triggers:$t,weather_skip:Et,coordinate_config:Tt,days_between_irrigation:Mt,observed_watering:Dt},Nt=Object.freeze({__proto__:null,calcmodules:jt,common:zt,coordinate_config:Tt,days_between_irrigation:Mt,default:Ot,defaults:wt,irrigation_start_triggers:$t,module:xt,observed_watering:Dt,panels:St,title:At,weather_skip:Et}),Pt={loading:"Cargando",saving:"Guardando",actions:{delete:"Eliminar"},labels:{module:"Módulo",no:"No",select:"Seleccionar",yes:"Sí",enabled:"Activado",disabled:"Desactivado",before:"antes",after:"después"},units:{seconds:"segundos"},attributes:{size:"Tamaño",throughput:"Rendimiento",state:"Estado",bucket:"bucket",last_updated:"última actualización",last_calculated:"último cálculo",number_of_data_points:"número de puntos de datos"},"loading-messages":{configuration:"Cargando la configuración…",modules:"Cargando módulos…",general:"Cargando…"},"saving-messages":{adding:"Añadiendo…",saving:"Guardando…"}},Ct={"default-zone":"Zona de riego predeterminada","default-mapping":"Grupo de sensores predeterminado"},Ht={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Nota: esta explicación utiliza '.' como separador decimal y muestra valores redondeados. El módulo devuelve una deficiencia de evapotranspiración de","bucket-was":"El cubo era","new-bucket-values-is":"El nuevo valor del cubo es",bucket:"cubo","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Dado que cubo < 0, el riego es necesario","steps-taken-to-calculate-duration":"Para calcular la duración exacta, se siguieron los siguientes pasos","precipitation-rate-defined-as":"La tasa de precipitación se define como","duration-is-calculated-as":"La duración se calcula como",drainage:"drainage","drainage-rate":"drainage_rate",hours:"horas","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"A continuación, se aplica el multiplicador. El multiplicador es","duration-after-multiplier-is":"por lo que la duración es","maximum-duration-is-applied":"A continuación, se aplica la duración máxima. La duración máxima es","duration-after-maximum-duration-is":"por lo que la duración es","lead-time-is-applied":"Por último, se aplica el plazo de entrega. El plazo de entrega es","duration-after-lead-time-is":"por lo que la duración final es","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Como cubo >= 0, no es necesario regar y la duración se fija en","maximum-bucket-is":"El tamaño máximo de cubo es","drainage-rate-is":"La tasa de drenaje en saturación (bucket al máximo) es","current-drainage-is":"El drenaje actual se calcula como","no-drainage":"El drenaje actual es 0 porque"}}},It={pyeto:{description:"Calcular la duración a partir del cálculo FAO56 de la biblioteca PyETO"},static:{description:"Módulo 'de prueba' con un delta estático configurable"},passthrough:{description:"Módulo de paso que devuelve el valor de un sensor de evapotranspiración como delta"}},Lt={weatherservice:{title:"Servicio meteorológico",description:"Consulta y cambia el servicio meteorológico usado para obtener los datos del tiempo, sin necesidad de reinstalar la integración. La clave API se valida y el cambio se aplica de inmediato.",labels:{"use-weather-service":"Usar un servicio meteorológico",service:"Servicio meteorológico","api-key":"Clave API"},actions:{save:"Guardar",saving:"Guardando…"},messages:{"no-service":"No se usa ningún servicio meteorológico — los datos del tiempo provienen solo de tus propios sensores.",saved:"Servicio meteorológico actualizado y aplicado.","reload-note":"Al guardar se valida la clave API con el servicio y se aplica el cambio de inmediato."}},backuprestore:{title:"Copia de seguridad / restauración",description:"Exporta toda la configuración de Smart Irrigation a un archivo JSON, o restáurala desde una copia de seguridad anterior.",cards:{backup:{title:"Copia de seguridad",description:"Descarga la configuración completa (ajustes generales, zonas, módulos y grupos de sensores) como archivo JSON."},restore:{title:"Restaurar",description:"Carga un archivo JSON exportado anteriormente para reemplazar la configuración actual."}},actions:{export:"Exportar a JSON","choose-file":"Elegir un archivo de copia de seguridad…",restore:"Restaurar esta copia de seguridad",restoring:"Restaurando…"},messages:{exported:"Archivo de copia de seguridad descargado.",restored:"Configuración restaurada — recargando la integración.","invalid-file":"Este archivo no es una copia de seguridad válida de Smart Irrigation.","confirm-title":"¿Reemplazar toda la configuración?",summary:"Esta copia de seguridad contiene","confirm-warning":"Restaurar sobrescribe todos los ajustes generales, zonas, módulos y grupos de sensores actuales. Esto no se puede deshacer.","reload-note":"Restaurar reemplaza todo y recarga la integración para aplicar el cambio."}},general:{cards:{"automatic-duration-calculation":{header:"Cálculo automático de la duración",description:"El cálculo toma los datos meteorológicos recopilados hasta ese momento y actualiza el bucket de cada zona automática. Después, la duración se ajusta según el nuevo valor del bucket y se eliminan los datos meteorológicos recopilados.",labels:{"auto-calc-enabled":"Cálculo automático de la duración de las zonas","calc-time":"Calcular a las"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Advertencia: la hora de actualización de los datos meteorológicos es igual o posterior a la hora de cálculo"},header:"Actualización automática de los datos meteorológicos",description:"Recopila y almacena datos meteorológicos automáticamente. Los datos meteorológicos son necesarios para calcular los buckets y las duraciones de las zonas.",labels:{"auto-update-enabled":"Actualizar automáticamente los datos meteorológicos","auto-update-schedule":"Programación de actualización","auto-update-time":"Actualizar a las","auto-update-interval":"Actualizar datos del sensor cada","auto-update-delay":"Retraso de actualización"},options:{minutes:"minutos",hours:"horas",days:"días"}},"automatic-clear":{header:"Purga automática de datos meteorológicos",description:"Eliminar automáticamente los datos meteorológicos recopilados a una hora configurada. Úsalo para asegurarte de que no quedan datos meteorológicos de días anteriores. No elimines los datos meteorológicos antes de calcular y usa esta opción solo si esperas que la actualización automática recopile datos meteorológicos después de tu cálculo del día. Lo ideal es purgar lo más tarde posible en el día.",labels:{"automatic-clear-enabled":"Borrar automáticamente los datos meteorológicos recopilados","automatic-clear-time":"Borrar datos meteorológicos a las"}},continuousupdates:{header:"Actualizaciones continuas para sensores (experimental)",description:"Esta función experimental actualiza continuamente los datos de los sensores. Es útil para grupos de sensores que usan fuentes que proporcionan datos continuos, como estaciones meteorológicas. Esta función no puede usarse en grupos de sensores que dependen al menos en parte de servicios meteorológicos, ya que el sondeo continuo de las API genera costes. Ten en cuenta que es experimental y puede no funcionar como se espera. Úsala bajo tu propia responsabilidad.",labels:{continuousupdates:"Activar actualizaciones continuas",sensor_debounce:"Antirrebote del sensor"}}},description:"Esta página provee configuraciones globales.",title:"General"},help:{title:"Ayuda",cards:{"how-to-get-help":{title:"Cómo obtener ayuda","first-read-the":"Primero lee la",wiki:"Wiki","if-you-still-need-help":"Si aún necesitas ayuda, puedes:","community-forum":"Comunidad/Foro","or-open-a":"o abrir un","github-issue":"Github Issue","english-only":"sólo en inglés"}}},info:{title:"Información",description:"Consulta información sobre el próximo riego y el estado del sistema.","configuration-not-available":"Configuración no disponible.",cards:{"zone-bucket-values":{title:"Valores de bucket y duración por zona",labels:{bucket:"Bucket",duration:"Duración"},"no-zones":"No hay zonas configuradas"},"next-irrigation":{title:"Próximo riego",labels:{"next-start":"Próximo inicio",duration:"Duración",zones:"Zonas"},"no-data":"No hay datos disponibles"},"irrigation-reason":{title:"Motivo del riego",labels:{reason:"Motivo",sunrise:"Amanecer","total-duration":"Duración total",explanation:"Explicación"},"no-data":"No hay datos disponibles"}}},mappings:{cards:{"add-mapping":{actions:{add:"Añadir grupo de sensores"},header:"Añadir grupos de sensores"},mapping:{aggregates:{average:"Promedio",first:"Primero",last:"Último",maximum:"Máximo",median:"Mediana",minimum:"Mínimo",riemannsum:"Suma de Riemann",sum:"Suma",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"No puedes eliminar este grupo de sensores porque hay al menos una zona que lo está usando.",invalid_source:"Fuente no válida",source_does_not_exist:'La fuente no existe. Introduce una fuente válida, como "sensor.mysensor".'},items:{dewpoint:"Punto de rocío",evapotranspiration:"Evapotranspiración",humidity:"Humedad","maximum temperature":"Temperatura máxima","minimum temperature":"Temperatura mínima",precipitation:"Precipitación total","current precipitation":"Precipitación actual",pressure:"Presión","solar radiation":"Radiación solar",temperature:"Temperatura",windspeed:"Velocidad del viento"},pressure_types:{absolute:"absoluta",relative:"relativa"},"pressure-type":"La presión es","sensor-aggregate-of-sensor-values-to-calculate":"de los valores de los sensores para calcular la duración","sensor-aggregate-use-the":"Usar la","sensor-entity":"Entidad de sensor",static_value:"Valor estático","input-units":"Unidades de entrada",source:"Fuente",sources:{none:"Ninguno",weather_service:"Weather service",sensor:"Sensor",static:"Valor estático"}}},description:"Añada uno o más grupos de sensores que recuperen datos meteorológicos de Weather service, de sensores o de una combinación de éstos. Puede asignar cada grupo de sensores a una o más zonas",labels:{"mapping-name":"Nombre del grupo de sensores"},no_items:"Aún no hay grupos de sensores definidos.",title:"Grupos de sensores","weather-records":{title:"Registros meteorológicos (últimos 10)",timestamp:"Hora",temperature:"Temp.",humidity:"Humedad",precipitation:"Precip.","retrieval-time":"Obtenido","no-data":"No hay datos meteorológicos disponibles para este grupo de sensores"}},modules:{cards:{"add-module":{actions:{add:"Añadir módulo"},header:"Añadir módulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"No puedes eliminar este módulo porque hay al menos una zona que lo está usando."},labels:{configuration:"Configuración",required:"Requerido"},"translated-options":{DontEstimate:"No estimar",EstimateFromSunHours:"Estimar desde horas de sol",EstimateFromTemp:"Estimar desde temperatura",EstimateFromSunHoursAndTemperature:"Estimar a partir del promedio de horas de sol y temperatura"}}},description:"Añada uno o varios módulos que calculen la duración del riego. Cada módulo tiene su propia configuración y puede utilizarse para calcular la duración de una o varias zonas.",no_items:"Aún no hay módulos definidos.",title:"Módulos"},zones:{actions:{add:"Añadir",calculate:"Calcular",information:"Información",update:"Actualizar","reset-bucket":"Resetear cubo","view-weather-info":"Ver datos meteorológicos","view-weather-info-message":"Datos meteorológicos disponibles para","view-watering-calendar":"Ver el calendario de riego"},cards:{"add-zone":{actions:{add:"Añadir zona"},header:"Añadir zona"},"zone-actions":{actions:{"calculate-all":"Calcular todas las zonas","update-all":"Actualizar todas las zonas","reset-all-buckets":"Resetear todos los cubos","clear-all-weatherdata":"Borrar todos los datos meteorológicos"},header:"Acciones en todas las zonas"}},description:"Especifique aquí una o varias zonas de riego. La duración del riego se calcula por zona, en función del tamaño, el rendimiento, el estado, el módulo y el grupo de sensores.",labels:{bucket:"Cubo",duration:"Duración","lead-time":"Tiempo de espera",mapping:"Grupo de sensores","maximum-duration":"Duración máxima",multiplier:"Multiplicador",name:"Nombre",size:"Tamaño",state:"Estado",states:{automatic:"Automático",disabled:"Desactivado",manual:"Manual"},throughput:"Rendimiento","maximum-bucket":"Cubo máximo",last_calculated:"Último cálculo","data-last-updated":"Datos actualizados por última vez","data-number-of-data-points":"Número de puntos de datos",drainage_rate:"Tasa de drenaje","linked-entity":"Válvula/interruptor vinculado","linked-entity-hint":"La válvula o interruptor que riega esta zona. Cada vez que se acciona (un grifo manual, una automatización o la propia Smart Irrigation cuando el control directo de válvula está activado), el bucket se acredita a partir del tiempo de funcionamiento y el rendimiento de la zona. Necesario para las funciones de lazo cerrado.","flow-sensor":"Contador de volumen acumulado","flow-sensor-hint":"Para una acreditación exacta en lugar de rendimiento x tiempo: un total de contador de agua acumulado (clase de estado total_increasing), no un caudal instantáneo. La unidad se lee automáticamente (L, mL, m³, gal, ft³).",optional:"opcional"},no_items:"Aún no hay zonas definidas.",title:"Zonas"}},Bt="Smart Irrigation",Ut={title:"Disparadores de inicio de riego",description:"Configura cuándo debe empezar el riego según los eventos solares. Puedes añadir varios disparadores para distintos horarios. En los disparadores de amanecer, dejar el desfase en 0 usará automáticamente la duración total de todas las zonas activadas.",usage_before:"Cuando un disparador se activa, Smart Irrigation emite el evento ",usage_after:" — escúchalo en una automatización para iniciar el riego. Los datos del evento incluyen trigger_name, trigger_type y offset_minutes, así que puedes reaccionar de forma distinta según el disparador. Los ajustes de omisión por lluvia y de días entre riegos siguen aplicándose: en un día de omisión no se emite ningún evento.",add_trigger:"Añadir disparador",edit_trigger:"Editar disparador",delete_trigger:"Eliminar disparador",trigger_types:{sunrise:"Amanecer",sunset:"Atardecer",solar_azimuth:"Azimut solar"},fields:{name:{name:"Nombre del disparador",description:"Un nombre descriptivo para identificar este disparador"},type:{name:"Tipo de disparador",description:"El tipo de evento solar que activa el disparador"},enabled:{name:"Activado",description:"Si este disparador está actualmente activo"},offset_minutes:{name:"Desfase (minutos)",description:"Minutos antes (-) o después (+) del evento solar. En los disparadores de amanecer, usa 0 para un cálculo automático del horario según la duración total de las zonas."},azimuth_angle:{name:"Ángulo de azimut (grados)",description:"Ángulo de azimut solar en grados, donde 0=Norte, 90=Este, 180=Sur, 270=Oeste"},account_for_duration:{name:"Tener en cuenta la duración",description:"Cuando está activado, el riego empezará con suficiente antelación para terminar a la hora indicada. Cuando está desactivado, el riego empezará exactamente a la hora indicada."}},dialog:{add_title:"Añadir disparador de inicio de riego",edit_title:"Editar disparador de inicio de riego",cancel:"Cancelar",save:"Guardar",delete:"Eliminar",help:"Cuando este disparador se activa, Smart Irrigation emite el siguiente evento — úsalo en una automatización para iniciar el riego. Los datos del evento incluyen el nombre de este disparador (y su tipo/desfase), así que puedes reaccionar a él específicamente:"},no_triggers:"No hay disparadores de inicio de riego configurados. El sistema usará el comportamiento por defecto (amanecer con la duración total de las zonas). Añade disparadores para personalizar cuándo empieza el riego.",offset_auto:"Auto (calculado a partir de la duración total de las zonas)",confirm_delete:'¿Seguro que quieres eliminar el disparador "{name}"?',validation:{name_required:"El nombre del disparador es obligatorio",azimuth_invalid:"El ángulo de azimut debe ser un número válido"},help:{sunrise_offset:"Para los disparadores de amanecer: usa valores negativos para empezar antes del amanecer y positivos para después. Pon 0 para empezar automáticamente con suficiente antelación para completar todas las zonas antes del amanecer.",sunset_offset:"Para los disparadores de atardecer: usa valores negativos para empezar antes del atardecer y positivos para después del atardecer.",azimuth_explanation:"El azimut solar es la dirección de la brújula hacia el sol. 0°=Norte, 90°=Este, 180°=Sur, 270°=Oeste. Puedes introducir cualquier valor de ángulo (p. ej., 450°=90°, -30°=330°). Úsalo para activar el riego cuando el sol alcance una posición concreta.",multiple_triggers:"Puedes configurar varios disparadores. Cada disparador activado programará los inicios de riego de forma independiente."},active_label:"Disparador activo",active_default:"Predeterminado (amanecer menos la duración total del riego)",active_hint:'Solo el disparador seleccionado inicia el riego, de modo que se ejecuta una vez al día. "Predeterminado" programa el riego para que termine justo al amanecer. Añade disparadores personalizados (atardecer, azimut, desfases) más abajo y luego elige uno aquí.'},Rt={title:"Omisión de riego según el tiempo",description:"Omitir automáticamente el riego cuando se prevé precipitación. Esta función requiere que haya un servicio meteorológico configurado.",threshold_label:"Umbral de precipitación",threshold_description:"Cantidad mínima de precipitación (en mm) prevista para hoy y mañana para omitir el riego."},Vt={title:"Coordenadas de Ubicación",description:"Configure las coordenadas de ubicación para obtener datos meteorológicos. Puede usar coordenadas manuales diferentes a la ubicación de Home Assistant si es necesario.",manual_enabled:"Usar coordenadas manuales",use_ha_location:"Usar ubicación de Home Assistant",latitude:"Latitud (grados decimales)",longitude:"Longitud (grados decimales)",elevation:"Elevación (metros sobre el nivel del mar)",current_ha_coords:"Coordenadas actuales de Home Assistant"},qt={title:"Días Entre Riegos",description:"Configure el número mínimo de días que deben pasar entre eventos de riego. Esto ayuda a controlar la frecuencia de riego para la conservación del agua y el manejo de la salud de las plantas.\n\nCasos de uso típicos:\n• Cuidado del césped: intervalos de 1-2 días previenen el exceso de riego\n• Restricciones de sequía: intervalos de 6+ días para riego semanal\n• Plantas de raíces profundas: intervalos de 3-7 días para riego menos frecuente\n• Conservación del agua: personalizable según el clima y las condiciones del suelo",label:"Días mínimos entre riegos",help_text:"Establezca en 0 para desactivar esta función. Se admiten valores de 1-365 días. Esta configuración funciona junto con la lógica de pronóstico de precipitación existente."},Ft={title:"Riego observado (lazo cerrado)",description:"Acredita automáticamente el bucket de cada zona a partir del riego real, en lugar de restablecer el bucket desde una automatización. Una vez activado, elige una entidad de válvula/interruptor por zona en la pestaña Zonas: mientras está abierta, el bucket se acredita a partir del tiempo de funcionamiento y el rendimiento de la zona. Para una contabilidad exacta también puedes elegir un contador de volumen acumulado (un total de tipo contador de agua) por zona, y se utiliza el volumen medido en su lugar. Importante: cuando esto está activado es lo único que acredita el bucket, así que elimina cualquier llamada a reset_bucket de tu automatización de riego para evitar el doble conteo.",enabled_label:"Activar riego observado",direct_control_label:"Permitir que Smart Irrigation controle la válvula",direct_control_description:"Cuando está activado, Smart Irrigation abre la válvula vinculada de cada zona, espera la duración calculada y luego la cierra, sin necesidad de automatización. Un riego en curso se reanuda tras un reinicio. Seguridad: si Home Assistant se cae durante mucho tiempo en mitad de un riego, la válvula permanece abierta y sigue regando, así que dale a tu válvula un mecanismo de seguridad por hardware (un tiempo máximo de funcionamiento).",sequencing_label:"Secuenciación de zonas",sequencing:{sequential:"Secuencial (una zona a la vez)",parallel:"Paralelo (todas las zonas a la vez)"}},Wt={common:Pt,defaults:Ct,module:Ht,calcmodules:It,panels:Lt,title:Bt,irrigation_start_triggers:Ut,weather_skip:Rt,coordinate_config:Vt,days_between_irrigation:qt,observed_watering:Ft},Gt=Object.freeze({__proto__:null,calcmodules:It,common:Pt,coordinate_config:Vt,days_between_irrigation:qt,default:Wt,defaults:Ct,irrigation_start_triggers:Ut,module:Ht,observed_watering:Ft,panels:Lt,title:Bt,weather_skip:Rt}),Yt={loading:"Ladataan",saving:"Tallennetaan",actions:{delete:"Poista"},labels:{module:"Moduuli",no:"Ei",select:"Valitse",yes:"Kyllä",enabled:"Käytössä",disabled:"Pois käytöstä",before:"ennen",after:"jälkeen"},units:{seconds:"sekuntia"},attributes:{size:"koko",throughput:"läpäisy",state:"tila",bucket:"bucket",last_updated:"viimeksi päivitetty",last_calculated:"viimeksi laskettu",number_of_data_points:"datapisteiden määrä"},"loading-messages":{configuration:"Ladataan määritystä...",modules:"Ladataan moduuleja...",general:"Ladataan..."},"saving-messages":{adding:"Lisätään...",saving:"Tallennetaan..."}},Zt={"default-zone":"Oletusvyöhyke","default-mapping":"Oletusanturiryhmä"},Kt={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Huomaa: tässä selityksessä desimaalierottimena käytetään pistettä '.', ja arvot näytetään pyöristettyinä ja metrijärjestelmän mukaisina. Moduuli palautti haihdunnan (evapotranspiraation) vajeen ( = et0 * hour_multiplier + sademäärä), joka on","bucket-was":"Bucket oli","new-bucket-values-is":"Uusi bucket-arvo on",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Koska bucket < 0, kastelu on tarpeen","steps-taken-to-calculate-duration":"Tarkan keston laskemiseksi suoritettiin seuraavat vaiheet","precipitation-rate-defined-as":"Sademäärän nopeus määritellään seuraavasti","duration-is-calculated-as":"Kesto lasketaan seuraavasti",drainage:"drainage","drainage-rate":"drainage_rate",hours:"tuntia","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Nyt sovelletaan kerrointa. Kerroin on","duration-after-multiplier-is":"joten kesto on","maximum-duration-is-applied":"Sitten sovelletaan enimmäiskestoa. Enimmäiskesto on","duration-after-maximum-duration-is":"joten kesto on","lead-time-is-applied":"Lopuksi sovelletaan ennakkoaikaa. Ennakkoaika on","duration-after-lead-time-is":"joten lopullinen kesto on","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Koska bucket >= 0, kastelu ei ole tarpeen ja kestoksi asetetaan","maximum-bucket-is":"Bucketin enimmäiskoko on","drainage-rate-is":"Valumisnopeus kyllästyneenä (bucket maksimissa) on","current-drainage-is":"Nykyinen valuminen lasketaan seuraavasti","no-drainage":"Nykyinen valuminen on 0, koska"}}},Jt={pyeto:{description:"Laske kesto PyETO-kirjaston FAO56-laskennan perusteella"},static:{description:"'Dummy'-moduuli, jolla on staattinen määritettävä delta"},passthrough:{description:"Läpivientimoduuli, joka palauttaa haihdunta-anturin arvon deltana"}},Qt={weatherservice:{title:"Sääpalvelu",description:"Tarkastele ja vaihda säätietojen hakuun käytettävää sääpalvelua — integraatiota ei tarvitse asentaa uudelleen. API-avain vahvistetaan ja muutos otetaan käyttöön välittömästi.",labels:{"use-weather-service":"Käytä sääpalvelua",service:"Sääpalvelu","api-key":"API-avain"},actions:{save:"Tallenna",saving:"Tallennetaan…"},messages:{"no-service":"Sääpalvelua ei käytetä — säätiedot tulevat vain omilta antureiltasi.",saved:"Sääpalvelu päivitetty ja otettu käyttöön.","reload-note":"Tallennus vahvistaa API-avaimen palvelua vasten ja ottaa muutoksen käyttöön välittömästi."}},backuprestore:{title:"Varmuuskopiointi / palautus",description:"Vie koko Smart Irrigation -määritys JSON-tiedostoon tai palauta se aiemmasta varmuuskopiosta.",cards:{backup:{title:"Varmuuskopiointi",description:"Lataa koko määritys (yleisasetukset, vyöhykkeet, moduulit ja anturiryhmät) JSON-tiedostona."},restore:{title:"Palautus",description:"Lataa aiemmin viety JSON-tiedosto korvataksesi nykyisen määrityksen."}},actions:{export:"Vie JSON-muotoon","choose-file":"Valitse varmuuskopiotiedosto…",restore:"Palauta tämä varmuuskopio",restoring:"Palautetaan…"},messages:{exported:"Varmuuskopiotiedosto ladattu.",restored:"Määritys palautettu — ladataan integraatio uudelleen.","invalid-file":"Tämä tiedosto ei ole kelvollinen Smart Irrigation -varmuuskopio.","confirm-title":"Korvataanko koko määritys?",summary:"Tämä varmuuskopio sisältää","confirm-warning":"Palautus korvaa kaikki nykyiset yleisasetukset, vyöhykkeet, moduulit ja anturiryhmät. Tätä ei voi peruuttaa.","reload-note":"Palautus korvaa kaiken ja lataa integraation uudelleen muutoksen käyttöönottamiseksi."}},general:{cards:{"automatic-duration-calculation":{header:"Automaattinen keston laskenta",description:"Laskenta käyttää siihen mennessä kerättyjä säätietoja ja päivittää kunkin automaattisen vyöhykkeen bucketin. Sen jälkeen kestoa säädetään uuden bucket-arvon perusteella ja kerätyt säätiedot poistetaan.",labels:{"auto-calc-enabled":"Laske kastelukestot automaattisesti","calc-time":"Laske kello"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Varoitus: säätietojen päivitysaika on laskenta-ajankohtana tai sen jälkeen"},header:"Automaattinen säätietojen päivitys",description:"Kerää ja tallenna säätiedot automaattisesti. Säätietoja tarvitaan vyöhykkeiden bucketien ja kestojen laskemiseen.",labels:{"auto-update-enabled":"Päivitä säätiedot automaattisesti","auto-update-schedule":"Päivitysaikataulu","auto-update-time":"Päivitä kello","auto-update-interval":"Päivitä anturitiedot välein","auto-update-delay":"Päivitysviive"},options:{minutes:"minuuttia",hours:"tuntia",days:"päivää"}},"automatic-clear":{header:"Automaattinen säätietojen karsinta",description:"Poista kerätyt säätiedot automaattisesti määritettynä ajankohtana. Käytä tätä varmistaaksesi, ettei edellisiltä päiviltä jää ylimääräisiä säätietoja. Älä poista säätietoja ennen laskentaa ja käytä tätä asetusta vain, jos odotat automaattisen päivityksen keräävän säätietoja sen jälkeen, kun olet laskenut päivän tiedot. Ihanteellisesti karsinta tehdään mahdollisimman myöhään päivällä.",labels:{"automatic-clear-enabled":"Tyhjennä kerätyt säätiedot automaattisesti","automatic-clear-time":"Tyhjennä säätiedot kello"}},continuousupdates:{header:"Jatkuvat päivitykset antureille (kokeellinen)",description:"Tämä kokeellinen ominaisuus päivittää anturitietoja jatkuvasti. Tästä on hyötyä anturiryhmille, jotka käyttävät jatkuvaa dataa tarjoavia lähteitä, kuten sääasemia. Tätä ominaisuutta ei voi käyttää anturiryhmille, jotka ainakin osittain hyödyntävät sääpalveluita, koska API-rajapintojen jatkuva kysely aiheuttaa kustannuksia. Pidä mielessä, että tämä on kokeellinen ja ei välttämättä toimi odotetusti. Käyttö omalla vastuulla.",labels:{continuousupdates:"Ota jatkuvat päivitykset käyttöön",sensor_debounce:"Anturin debounce"}}},description:"Tämä sivu tarjoaa yleiset asetukset.",title:"Yleiset"},help:{title:"Ohje",cards:{"how-to-get-help":{title:"Kuinka saada apua","first-read-the":"Lue ensin",wiki:"Wiki","if-you-still-need-help":"Jos tarvitset edelleen apua, ota yhteyttä","community-forum":"Yhteisöfoorumi","or-open-a":"tai avaa","github-issue":"Github-issue","english-only":"Vain englanniksi"}}},info:{title:"Tiedot",description:"Tarkastele tietoja seuraavasta kastelusta ja järjestelmän tilasta.","configuration-not-available":"Määritys ei ole saatavilla.",cards:{"zone-bucket-values":{title:"Vyöhykkeen bucket-arvot ja kesto",labels:{bucket:"Bucket",duration:"Kesto"},"no-zones":"Vyöhykkeitä ei ole määritetty"},"next-irrigation":{title:"Seuraava kastelu",labels:{"next-start":"Seuraava aloitus",duration:"Kesto",zones:"Vyöhykkeet"},"no-data":"Ei tietoja saatavilla"},"irrigation-reason":{title:"Kastelun syy",labels:{reason:"Syy",sunrise:"Auringonnousu","total-duration":"Kokonaiskesto",explanation:"Selitys"},"no-data":"Ei tietoja saatavilla"}}},mappings:{cards:{"add-mapping":{actions:{add:"Lisää anturiryhmä"},header:"Lisää anturiryhmiä"},mapping:{aggregates:{average:"Keskiarvo",first:"Ensimmäinen",last:"Viimeinen",maximum:"Maksimi",median:"Mediaani",minimum:"Minimi",riemannsum:"Riemannin summa",sum:"Summa",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Et voi poistaa tätä anturiryhmää, koska vähintään yksi vyöhyke käyttää sitä.",invalid_source:"Virheellinen lähde",source_does_not_exist:"Lähdettä ei ole olemassa. Anna kelvollinen lähde, kuten 'sensor.mysensor'."},items:{dewpoint:"Kastepiste",evapotranspiration:"Haihdunta",humidity:"Kosteus","maximum temperature":"Maksimilämpötila","minimum temperature":"Minimilämpötila",precipitation:"Kokonaissademäärä","current precipitation":"Nykyinen sademäärä",pressure:"Paine","solar radiation":"Auringonsäteily",temperature:"Lämpötila",windspeed:"Tuulennopeus"},pressure_types:{absolute:"absoluuttinen",relative:"suhteellinen"},"pressure-type":"Paine on","sensor-aggregate-of-sensor-values-to-calculate":"anturiarvoista keston laskemiseksi","sensor-aggregate-use-the":"Käytä","sensor-entity":"Anturientiteetti",static_value:"Arvo","input-units":"Syöte antaa arvot yksikössä",source:"Lähde",sources:{none:"Ei mitään",weather_service:"Sääpalvelu",sensor:"Anturi",static:"Staattinen arvo"}}},description:"Lisää yksi tai useampi anturiryhmä, joka hakee säätietoja sääpalvelusta, antureista tai näiden yhdistelmästä. Voit liittää kunkin anturiryhmän yhteen tai useampaan vyöhykkeeseen",labels:{"mapping-name":"Nimi"},no_items:"Anturiryhmiä ei ole vielä määritetty.",title:"Anturiryhmät","weather-records":{title:"Säätietueet (viimeiset 10)",timestamp:"Aika",temperature:"Lämpö",humidity:"Kosteus",precipitation:"Sade","retrieval-time":"Haettu","no-data":"Tälle anturiryhmälle ei ole saatavilla säätietoja"}},modules:{cards:{"add-module":{actions:{add:"Lisää moduuli"},header:"Lisää moduuli"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Et voi poistaa tätä moduulia, koska vähintään yksi vyöhyke käyttää sitä."},labels:{configuration:"Määritys",required:"osoittaa pakollisen kentän"},"translated-options":{DontEstimate:"Älä arvioi",EstimateFromSunHours:"Arvioi aurinkotuntien perusteella",EstimateFromTemp:"Arvioi lämpötilan perusteella",EstimateFromSunHoursAndTemperature:"Arvioi aurinkotuntien ja lämpötilan keskiarvosta"}}},description:"Lisää yksi tai useampi moduuli, joka laskee kastelun keston. Jokaisella moduulilla on oma määrityksensä, ja sitä voidaan käyttää keston laskemiseen yhdelle tai useammalle vyöhykkeelle.",no_items:"Moduuleja ei ole vielä määritetty.",title:"Moduulit"},zones:{actions:{add:"Lisää",calculate:"Laske",information:"Tiedot",update:"Päivitä","reset-bucket":"Nollaa bucket","view-weather-info":"Näytä säätiedot","view-weather-info-message":"Säätietoja saatavilla:","view-watering-calendar":"Näytä kastelukalenteri"},cards:{"add-zone":{actions:{add:"Lisää vyöhyke"},header:"Lisää vyöhyke"},"zone-actions":{actions:{"calculate-all":"Laske kaikki vyöhykkeet","update-all":"Päivitä kaikki vyöhykkeet","reset-all-buckets":"Nollaa kaikki bucketit","clear-all-weatherdata":"Tyhjennä kaikki säätiedot"},header:"Toiminnot kaikille vyöhykkeille"}},description:"Määritä tässä yksi tai useampi kasteluvyöhyke. Kastelun kesto lasketaan vyöhykekohtaisesti koon, läpäisyn, tilan, moduulin ja anturiryhmän mukaan.",labels:{bucket:"Bucket",duration:"Kesto","lead-time":"Ennakkoaika",mapping:"Anturiryhmä","maximum-duration":"Enimmäiskesto",multiplier:"Kerroin",name:"Nimi",size:"Koko",state:"Tila",states:{automatic:"Automaattinen",disabled:"Pois käytöstä",manual:"Manuaalinen"},throughput:"Läpäisy","maximum-bucket":"Bucketin enimmäisarvo",last_calculated:"Viimeksi laskettu","data-last-updated":"Tiedot viimeksi päivitetty","data-number-of-data-points":"Datapisteiden määrä",drainage_rate:"Valumisnopeus","linked-entity":"Liitetty venttiili/kytkin","linked-entity-hint":"Venttiili tai kytkin, joka kastelee tämän vyöhykkeen. Aina kun se on käynnissä (manuaalinen hana, automaatio tai Smart Irrigation itse, kun suora venttiilin ohjaus on käytössä), bucketiin hyvitetään käyntiaika ja vyöhykkeen läpäisy. Vaaditaan suljetun silmukan ominaisuuksiin.","flow-sensor":"Kumulatiivinen tilavuusmittari","flow-sensor-hint":"Tarkkaa hyvitystä varten läpäisyn ja ajan sijaan: kumulatiivinen vesimittarin kokonaislukema (tilaluokka total_increasing), ei hetkellinen virtausnopeus. Yksikkö luetaan automaattisesti (L, mL, m³, gal, ft³).",optional:"valinnainen"},no_items:"Vyöhykkeitä ei ole vielä määritetty.",title:"Vyöhykkeet"}},Xt="Smart Irrigation",ei={title:"Kastelun aloitusliipaisimet",description:"Määritä, milloin kastelun tulee alkaa aurinkotapahtumien perusteella. Voit lisätä useita liipaisimia eri aikatauluja varten. Auringonnousuliipaisimissa siirtymän jättäminen arvoon 0 käyttää automaattisesti kaikkien käytössä olevien vyöhykkeiden kokonaiskestoa.",usage_before:"Kun liipaisin laukeaa, Smart Irrigation lähettää tapahtuman ",usage_after:" — kuuntele sitä automaatiossa aloittaaksesi kastelun. Tapahtuman tiedot sisältävät kentät trigger_name, trigger_type ja offset_minutes, joten voit reagoida eri tavoin liipaisinkohtaisesti. Sadeohitus- ja kastelujen väliset päivät -asetukset ovat edelleen voimassa: ohituspäivänä tapahtumaa ei lähetetä.",add_trigger:"Lisää liipaisin",edit_trigger:"Muokkaa liipaisinta",delete_trigger:"Poista liipaisin",trigger_types:{sunrise:"Auringonnousu",sunset:"Auringonlasku",solar_azimuth:"Auringon atsimuutti"},fields:{name:{name:"Liipaisimen nimi",description:"Kuvaava nimi tämän liipaisimen tunnistamiseksi"},type:{name:"Liipaisimen tyyppi",description:"Aurinkotapahtuman tyyppi, joka laukaisee liipaisimen"},enabled:{name:"Käytössä",description:"Onko tämä liipaisin tällä hetkellä aktiivinen"},offset_minutes:{name:"Siirtymä (minuuttia)",description:"Minuutteja ennen (-) tai jälkeen (+) aurinkotapahtuman. Auringonnousuliipaisimissa käytä arvoa 0 automaattiseen ajoitukseen vyöhykkeiden kokonaiskeston perusteella."},azimuth_angle:{name:"Atsimuuttikulma (asteina)",description:"Auringon atsimuuttikulma asteina, jossa 0=Pohjoinen, 90=Itä, 180=Etelä, 270=Länsi"},account_for_duration:{name:"Huomioi kesto",description:"Kun tämä on käytössä, kastelu alkaa riittävän aikaisin valmistuakseen määritettyyn aikaan mennessä. Kun tämä on pois käytöstä, kastelu alkaa täsmälleen määritettynä aikana."}},dialog:{add_title:"Lisää kastelun aloitusliipaisin",edit_title:"Muokkaa kastelun aloitusliipaisinta",cancel:"Peruuta",save:"Tallenna",delete:"Poista",help:"Kun tämä liipaisin laukeaa, Smart Irrigation lähettää seuraavan tapahtuman — käytä sitä automaatiossa aloittaaksesi kastelun. Tapahtuman tiedot sisältävät tämän liipaisimen nimen (sekä tyypin/siirtymän), joten voit reagoida juuri siihen:"},no_triggers:"Kastelun aloitusliipaisimia ei ole määritetty. Järjestelmä käyttää oletustoimintaa (auringonnousu vyöhykkeiden kokonaiskestolla). Lisää liipaisimia mukauttaaksesi, milloin kastelu alkaa.",offset_auto:"Automaattinen (laskettu vyöhykkeiden kokonaiskestosta)",confirm_delete:"Haluatko varmasti poistaa liipaisimen '{name}'?",validation:{name_required:"Liipaisimen nimi on pakollinen",azimuth_invalid:"Atsimuuttikulman on oltava kelvollinen luku"},help:{sunrise_offset:"Auringonnousuliipaisimissa: Käytä negatiivisia arvoja aloittaaksesi ennen auringonnousua, positiivisia aloittaaksesi sen jälkeen. Aseta arvoon 0 aloittaaksesi automaattisesti riittävän aikaisin, jotta kaikki vyöhykkeet ehtivät valmistua ennen auringonnousua.",sunset_offset:"Auringonlaskuliipaisimissa: Käytä negatiivisia arvoja aloittaaksesi ennen auringonlaskua, positiivisia aloittaaksesi auringonlaskun jälkeen.",azimuth_explanation:"Auringon atsimuutti on auringon kompassisuunta. 0°=Pohjoinen, 90°=Itä, 180°=Etelä, 270°=Länsi. Voit syöttää minkä tahansa kulma-arvon (esim. 450° = 90°, -30° = 330°). Käytä tätä laukaistaksesi kastelun, kun aurinko saavuttaa tietyn aseman.",multiple_triggers:"Voit määrittää useita liipaisimia. Jokainen käytössä oleva liipaisin ajoittaa kastelun aloitukset itsenäisesti."},active_label:"Aktiivinen liipaisin",active_default:"Oletus (auringonnousu miinus kokonaiskasteluaika)",active_hint:'Vain valittu liipaisin käynnistää kastelun, joten se suoritetaan kerran päivässä. "Oletus" ajoittaa ajon päättymään juuri auringonnousuun. Lisää mukautettuja liipaisimia (auringonlasku, atsimuutti, siirtymät) alle ja valitse sitten yksi tästä.'},ai={title:"Sääperusteinen kastelun ohitus",description:"Ohita kastelu automaattisesti, kun sadetta ennustetaan. Tämä ominaisuus edellyttää sääpalvelun määrittämistä.",threshold_label:"Sademäärän kynnysarvo",threshold_description:"Tälle päivälle ja huomiselle ennustettu vähimmäissademäärä (millimetreinä), jolla kastelu ohitetaan."},ti={title:"Sijainnin koordinaatit",description:"Määritä sijainnin koordinaatit säätietojen hakua varten. Voit tarvittaessa käyttää Home Assistant -sijainnista poikkeavia manuaalisia koordinaatteja.",manual_enabled:"Käytä manuaalisia koordinaatteja",use_ha_location:"Käytä Home Assistant -sijaintia",latitude:"Leveysaste (desimaaliasteet)",longitude:"Pituusaste (desimaaliasteet)",elevation:"Korkeus (metriä merenpinnan yläpuolella)",current_ha_coords:"Nykyiset Home Assistant -koordinaatit"},ii={title:"Kastelujen väliset päivät",description:"Määritä vähimmäismäärä päiviä, joiden on kuluttava kastelujen välillä. Tämä auttaa hallitsemaan kastelutiheyttä veden säästämiseksi ja kasvien terveyden ylläpitämiseksi.\n\nTyypillisiä käytännön käyttötapauksia:\n• Nurmikon hoito: 1–2 päivän välit estävät liikakastelun\n• Kuivuusrajoitukset: 6+ päivän välit viikoittaiseen kasteluun\n• Syväjuuriset kasvit: 3–7 päivän välit harvempaan kasteluun\n• Veden säästö: Mukautettavissa ilmaston ja maaperän olosuhteiden mukaan",label:"Vähimmäismäärä päiviä kastelujen välillä",help_text:"Aseta arvoon 0 poistaaksesi tämän ominaisuuden käytöstä. Arvot väliltä 1–365 päivää ovat tuettuja. Tämä asetus toimii yhdessä olemassa olevan sadeennustelogiikan kanssa."},ni={title:"Havaittu kastelu (suljettu silmukka)",description:"Hyvitä jokaisen vyöhykkeen bucket automaattisesti todellisesta kastelusta sen sijaan, että nollaisit bucketin automaatiosta. Kun tämä on käytössä, valitse venttiili-/kytkinentiteetti kullekin vyöhykkeelle Vyöhykkeet-välilehdellä: kun se on auki, bucketiin hyvitetään käyntiaika ja vyöhykkeen läpäisy. Tarkkaa kirjanpitoa varten voit myös valita kumulatiivisen tilavuusmittarin (vesimittarityyppinen kokonaislukema) kullekin vyöhykkeelle, jolloin käytetään mitattua tilavuutta. Tärkeää: kun tämä on käytössä, se on ainoa asia, joka hyvittää bucketin, joten poista kaikki reset_bucket-kutsut kasteluautomaatiostasi kaksinkertaisen laskennan välttämiseksi.",enabled_label:"Ota havaittu kastelu käyttöön",direct_control_label:"Anna Smart Irrigationin ohjata venttiiliä",direct_control_description:"Kun tämä on käytössä, Smart Irrigation avaa kunkin vyöhykkeen liitetyn venttiilin, odottaa lasketun keston ja sulkee sen sitten - automaatiota ei tarvita. Käynnissä oleva ajo jatkuu uudelleenkäynnistyksen jälkeen. Turvallisuus: jos Home Assistant kaatuu pitkäksi aikaa kesken ajon, venttiili jää auki ja jatkaa kastelua, joten anna venttiilillesi laitteistotason vikaturva (enimmäiskäyntiaika).",sequencing_label:"Vyöhykkeiden järjestys",sequencing:{sequential:"Peräkkäin (yksi vyöhyke kerrallaan)",parallel:"Rinnakkain (kaikki vyöhykkeet kerralla)"}},ri={common:Yt,defaults:Zt,module:Kt,calcmodules:Jt,panels:Qt,title:Xt,irrigation_start_triggers:ei,weather_skip:ai,coordinate_config:ti,days_between_irrigation:ii,observed_watering:ni},si=Object.freeze({__proto__:null,calcmodules:Jt,common:Yt,coordinate_config:ti,days_between_irrigation:ii,default:ri,defaults:Zt,irrigation_start_triggers:ei,module:Kt,observed_watering:ni,panels:Qt,title:Xt,weather_skip:ai}),oi={loading:"Chargement",saving:"Enregistrement",actions:{delete:"Suppression"},labels:{module:"Module",no:"Non",select:"Sélectionner",yes:"Oui",enabled:"Activé",disabled:"Désactivé",before:"avant",after:"après"},units:{seconds:"secondes"},attributes:{size:"taille",throughput:"débit",state:"état",bucket:"bucket",last_updated:"dernière mise à jour",last_calculated:"dernier calcul",number_of_data_points:"nombre de points de données"},"loading-messages":{configuration:"Chargement de la configuration…",modules:"Chargement des modules…",general:"Chargement…"},"saving-messages":{adding:"Ajout…",saving:"Enregistrement…"}},li={"default-zone":"Zone par défaut","default-mapping":"Groupe de capteurs par défaut"},di={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"NB: cette explication utilise '.' comme séparateur décimal, et affiche des valeurs arrondies. Le module a donné un manque d'Évapotranspiration de","bucket-was":"Le seau (bucket) était de","new-bucket-values-is":"La nouvelle valeur du seau (bucket) est",bucket:"seau (bucket)","old-bucket-variable":"ancien_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Puisque le seau (bucket) est < 0, l'irrigation est nécessaire","steps-taken-to-calculate-duration":"Pour calculer la durée d'irrigation, les étapes suivantes ont été réalisées","precipitation-rate-defined-as":"Le taux de précipitation est défini comme","duration-is-calculated-as":"La durée d'irrigation est calculée avec",drainage:"drainage","drainage-rate":"drainage_rate",hours:"heures","precipitation-rate-variable":"taux_precipitation","multiplier-is-applied":"Le multiplicateur est appliqué. Le multiplicateur est","duration-after-multiplier-is":"donc la durée d'irrigation est de","maximum-duration-is-applied":"Ensuite la durée maximale est appliquée. La durée maximale est de","duration-after-maximum-duration-is":"donc la durée d'irrigation est de","lead-time-is-applied":"Enfin, le délai est appliqué. Le délai est de","duration-after-lead-time-is":"et donc la durée finale est de","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Puisque le seau (bucket) est >= 0, l'irrigation n'est pas nécessaire, et la durée est réglée à","maximum-bucket-is":"la taille du seau (bucket) maximale est","drainage-rate-is":"Le taux de drainage à saturation (bucket au max) est de","current-drainage-is":"Le drainage actuel est calculé comme","no-drainage":"Le drainage actuel est de 0 car"}}},ui={pyeto:{description:"Le calcul de durée est basée sur le calcul FAO56 de la bibliothèque PyETO"},static:{description:"Module 'Dummy' avec un delta statique configurable"},passthrough:{description:"Module passerelle qui renvoie la valeur d'un capteur d'Évapotranspiration comme delta"}},ci={weatherservice:{title:"Service météo",description:"Consultez et modifiez le service météo utilisé pour récupérer les données — sans réinstaller l'intégration. La clé API est validée et le changement est appliqué immédiatement.",labels:{"use-weather-service":"Utiliser un service météo",service:"Service météo","api-key":"Clé API"},actions:{save:"Enregistrer",saving:"Enregistrement…"},messages:{"no-service":"Aucun service météo utilisé — les données proviennent uniquement de vos capteurs.",saved:"Service météo mis à jour et appliqué.","reload-note":"L'enregistrement valide la clé API auprès du service et applique le changement immédiatement."}},backuprestore:{title:"Sauvegarde / restauration",description:"Exportez toute la configuration Smart Irrigation dans un fichier JSON, ou restaurez-la depuis une sauvegarde précédente.",cards:{backup:{title:"Sauvegarde",description:"Téléchargez la configuration complète (réglages généraux, zones, modules et groupes de capteurs) dans un fichier JSON."},restore:{title:"Restauration",description:"Chargez un fichier JSON exporté précédemment pour remplacer la configuration actuelle."}},actions:{export:"Exporter en JSON","choose-file":"Choisir un fichier de sauvegarde…",restore:"Restaurer cette sauvegarde",restoring:"Restauration…"},messages:{exported:"Fichier de sauvegarde téléchargé.",restored:"Configuration restaurée — rechargement de l'intégration.","invalid-file":"Ce fichier n'est pas une sauvegarde Smart Irrigation valide.","confirm-title":"Remplacer toute la configuration ?",summary:"Cette sauvegarde contient","confirm-warning":"La restauration écrase tous les réglages généraux, zones, modules et groupes de capteurs actuels. Action irréversible.","reload-note":"La restauration remplace tout et recharge l'intégration pour appliquer le changement."}},general:{cards:{"automatic-duration-calculation":{header:"Calcul automatique de la durée",description:"Le calcul prend en compte les données météo jusqu'à ce point et met à jour le seau (bucket) pour chaque zone automatique. Ensuite, la durée est ajustée par la nouvelle valeur de seau (bucket) et les données météo sont supprimées.",labels:{"auto-calc-enabled":"Calcule automatiquement la durée par zone","calc-time":"Calculer à"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Attention: mise à jour des données météo au moment du, ou après le, calcul"},header:"Mise à jour automatique des données météo",description:"Récupère et stocke les données météo automatiquement. Des données météo sont nécessaires pour calculer les seaux (buckets) par zone et les durées.",labels:{"auto-update-enabled":"Met à jour les données météo automatiquement","auto-update-schedule":"Fréquence de mise à jour","auto-update-time":"Mettre à jour à","auto-update-interval":"Mettre à jour les données des capteurs toutes les","auto-update-delay":"Délai de mise à jour"},options:{minutes:"minutes",hours:"heures",days:"jours"}},"automatic-clear":{header:"Délestage automatique des données météo",description:"Suppression automatique des données météo collectées à une heure donnée. Utilisez ceci pour être sûr qu'il n'y ait plus de restes des données météo des jours précédents. Ne supprimez pas les données météo avant le calcul et n'utilisez cette option que si vous vous attendez à ce que les données météo soient récupérées après le calcul du jour. Idéalement, vous voudrez \"élaguer\" les données le plus tard possible dans la journée.",labels:{"automatic-clear-enabled":"Suppression automatique des données météo collectées","automatic-clear-time":"Supprimer les données météo à"}},continuousupdates:{header:"Mises à jour continues pour les capteurs (expérimental)",description:"Cette fonctionnalité expérimentale met à jour en continu les données des capteurs. C'est utile pour les groupes de capteurs qui utilisent des sources fournissant des données continues, comme les stations météo. Elle ne peut pas être utilisée pour les groupes de capteurs qui s'appuient au moins en partie sur des services météo, car l'interrogation continue des API engendre des coûts. Gardez à l'esprit que cette fonctionnalité est expérimentale et peut ne pas fonctionner comme prévu. À utiliser à vos propres risques.",labels:{continuousupdates:"Activer les mises à jour continues",sensor_debounce:"Anti-rebond capteur"}}},description:"Cette page fournit les réglages globaux.",title:"Général"},help:{title:"Aide",cards:{"how-to-get-help":{title:"Comment obtenir de l'aide","first-read-the":"Premièrement, lisez ",wiki:"Wiki","if-you-still-need-help":"Si vous avez toujours besoin d'aide, adressez vous sur le","community-forum":"forum communautaire","or-open-a":"ou ouvrez un","github-issue":"problème Github","english-only":"en Anglais uniquement"}}},info:{title:"Infos",description:"Consultez les informations sur la prochaine irrigation et l'état du système.","configuration-not-available":"Configuration non disponible.",cards:{"zone-bucket-values":{title:"Valeurs de bucket et durée par zone",labels:{bucket:"Bucket",duration:"Durée"},"no-zones":"Aucune zone configurée"},"next-irrigation":{title:"Prochaine irrigation",labels:{"next-start":"Prochain démarrage",duration:"Durée",zones:"Zones"},"no-data":"Aucune donnée disponible"},"irrigation-reason":{title:"Raison de l'irrigation",labels:{reason:"Raison",sunrise:"Lever du soleil","total-duration":"Durée totale",explanation:"Explication"},"no-data":"Aucune donnée disponible"}}},mappings:{cards:{"add-mapping":{actions:{add:"Ajouter un groupe de capteurs"},header:"Ajouter des groupes de capteurs"},mapping:{aggregates:{average:"Moyenne",first:"Premier",last:"Dernier",maximum:"Maximum",median:"Médian",minimum:"Minimum",riemannsum:"Somme de Riemann",sum:"Somme",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Vous ne pouvez pas supprimer ce groupe de capteurs car au moins une zone l'utilise.",invalid_source:"Source invalide",source_does_not_exist:'La source n\'existe pas. Veuillez saisir une source valide, telle que "sensor.mysensor".'},items:{dewpoint:"Point de rosée",evapotranspiration:"Évapotranspiration",humidity:"Humidité","maximum temperature":"Température maximale","minimum temperature":"Température minimale",precipitation:"Précipitation totale","current precipitation":"Précipitations actuelles",pressure:"Pression","solar radiation":"Rayonnement solaire",temperature:"Température",windspeed:"Vitesse du vent"},pressure_types:{absolute:"absolue",relative:"relative"},"pressure-type":"La pression est","sensor-aggregate-of-sensor-values-to-calculate":"des valeurs des capteurs pour calculer la durée","sensor-aggregate-use-the":"Utiliser les","sensor-entity":"Entité capteur",static_value:"Valeur","input-units":"L'entité fournit des entrées en",source:"Source",sources:{none:"Aucun",weather_service:"Weather service",sensor:"Capteur",static:"Valeur statique"}}},description:"Ajouter un ou plusieurs groupes de capteurs qui récupèrent les données météo de Weather service, de capteurs locaux ou d'une combinaison de tous ceux-ci. Vous pouvez associer chaque groupe de capteurs avec une ou plusieurs zones",labels:{"mapping-name":"Nom"},no_items:"Il n'y a pas encore de groupe de capteurs définis.",title:"Groupes de capteurs","weather-records":{title:"Relevés météo (10 derniers)",timestamp:"Heure",temperature:"Temp.",humidity:"Humidité",precipitation:"Précip.","retrieval-time":"Récupéré","no-data":"Aucune donnée météo disponible pour ce groupe de capteurs"}},modules:{cards:{"add-module":{actions:{add:"Ajouter un module"},header:"Ajout d'un module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Vous ne pouvez pas supprimer ce module car au moins une zone l'utilise."},labels:{configuration:"Configuration",required:"indique un champ requis"},"translated-options":{DontEstimate:"Ne fait pas d'estimation",EstimateFromSunHours:"Estimation à partir des heures d'ensoleillement",EstimateFromTemp:"Estimation à partir de la température",EstimateFromSunHoursAndTemperature:"Estimer à partir de la moyenne des heures d'ensoleillement et de la température"}}},description:"Ajouter un ou plusieurs modules qui calcule la durée d'irrigation. Chaque module vient avec sa propre configuration et peut être utilisé pour calculer la durée d'irrigation d'une ou plusieurs zones.",no_items:"Il n'y a aucun module défini pour l'instant.",title:"Modules"},zones:{actions:{add:"Ajouter",calculate:"Calculer",information:"Information",update:"Mise à jour","reset-bucket":"Mise à zéro du seau (bucket)","view-weather-info":"Voir les données météo","view-weather-info-message":"Données météo disponibles pour","view-watering-calendar":"Voir le calendrier d'arrosage"},cards:{"add-zone":{actions:{add:"Ajouter une zone"},header:"Ajout d'une zone"},"zone-actions":{actions:{"calculate-all":"Calculer pour toutes les zones","update-all":"Mise à jour de toutes les zones","reset-all-buckets":"Mise à zéro de tous les seaux (buckets)","clear-all-weatherdata":"Mise à zéro de toutes les données météo"},header:"Actions sur toutes les zones"}},description:"Spécifiez une ou plusieurs zones d'irrigation ici. La durée d'irrigation est calculée par zone, en fonction de la taille, du débit, état, module et groupe de capteurs.",labels:{bucket:"Seau","et-deficiency":"Déficit ET journalier",duration:"Durée","lead-time":"Délai",mapping:"Groupe de capteurs","maximum-duration":"Durée maximale",multiplier:"Multiplicateur",name:"Nom",size:"Taille",state:"État",states:{automatic:"Automatique",disabled:"Désactivé",manual:"Manuel"},throughput:"Débit","maximum-bucket":"Seau (bucket) maximum",last_calculated:"Dernier calcul","data-last-updated":"Dernière mise à jour","data-number-of-data-points":"Nombre de points de données",drainage_rate:"Taux de drainage","linked-entity":"Vanne/interrupteur lié","linked-entity-hint":"La vanne ou l'interrupteur qui arrose cette zone. Dès qu'il fonctionne (robinet manuel, automatisation, ou Smart Irrigation lui-même si le pilotage direct est activé), le réservoir est crédité d'après la durée de fonctionnement et le débit de la zone. Nécessaire pour les fonctions en boucle fermée.","flow-sensor":"Compteur de volume cumulé","flow-sensor-hint":"Pour un comptage exact au lieu de débit x temps : un total de compteur d'eau cumulé (state class total_increasing), pas un débit instantané. L'unité est lue automatiquement (L, mL, m³, gal, ft³).",optional:"option"},no_items:"Il n'y a pas encore de zone définie.",title:"Zones"}},pi="Smart Irrigation",mi={title:"Déclencheurs de démarrage d'irrigation",description:"Configurez le moment où l'irrigation doit démarrer en fonction des événements solaires. Définissez vos déclencheurs ci-dessous, puis choisissez lequel (un seul) démarre l'irrigation. Pour les déclencheurs au lever du soleil, laisser le décalage à 0 utilisera automatiquement la durée totale de toutes les zones activées.",active_label:"Déclencheur actif",active_default:"Par défaut (lever du soleil moins la durée totale d'arrosage)",active_hint:"Seul le déclencheur sélectionné démarre l'irrigation, donc un seul run par jour. « Par défaut » cale le run pour qu'il finisse pile au lever du soleil. Ajoute des déclencheurs custom (coucher, azimut, décalages) ci-dessous, puis choisis-en un ici.",usage_before:"Lorsqu'un déclencheur s'active, Smart Irrigation émet l'événement ",usage_after:" — écoutez-le dans une automatisation pour démarrer l'arrosage. Les données de l'événement incluent trigger_name, trigger_type et offset_minutes, vous pouvez donc réagir différemment selon le déclencheur. Les réglages de saut pour précipitations et de jours entre arrosages s'appliquent toujours : un jour de saut, aucun événement n'est émis.",add_trigger:"Ajouter un déclencheur",edit_trigger:"Modifier le déclencheur",delete_trigger:"Supprimer le déclencheur",trigger_types:{sunrise:"Lever du soleil",sunset:"Coucher du soleil",solar_azimuth:"Azimut solaire"},fields:{name:{name:"Nom du déclencheur",description:"Un nom descriptif pour identifier ce déclencheur"},type:{name:"Type de déclencheur",description:"Le type d'événement solaire qui déclenche"},enabled:{name:"Activé",description:"Indique si ce déclencheur est actuellement actif"},offset_minutes:{name:"Décalage (minutes)",description:"Minutes avant (-) ou après (+) l'événement solaire. Pour les déclencheurs au lever du soleil, utilisez 0 pour un calage automatique basé sur la durée totale des zones."},azimuth_angle:{name:"Angle d'azimut (degrés)",description:"Angle d'azimut solaire en degrés, où 0=Nord, 90=Est, 180=Sud, 270=Ouest"},account_for_duration:{name:"Tenir compte de la durée",description:"Lorsqu'elle est activée, l'irrigation démarre assez tôt pour se terminer à l'heure indiquée. Lorsqu'elle est désactivée, l'irrigation démarre exactement à l'heure indiquée."}},dialog:{add_title:"Ajouter un déclencheur de démarrage d'irrigation",edit_title:"Modifier le déclencheur de démarrage d'irrigation",cancel:"Annuler",save:"Enregistrer",delete:"Supprimer",help:"Lorsque ce déclencheur s'active, Smart Irrigation émet l'événement suivant — utilisez-le dans une automatisation pour démarrer l'arrosage. Les données de l'événement incluent le nom de ce déclencheur (ainsi que son type/décalage), vous pouvez donc y réagir spécifiquement :"},no_triggers:"Aucun déclencheur de démarrage d'irrigation configuré. Le système utilisera le comportement par défaut (lever du soleil avec la durée totale des zones). Ajoutez des déclencheurs pour personnaliser le moment où l'irrigation démarre.",offset_auto:"Auto (calculé d'après la durée totale des zones)",confirm_delete:'Voulez-vous vraiment supprimer le déclencheur "{name}" ?',validation:{name_required:"Le nom du déclencheur est obligatoire",azimuth_invalid:"L'angle d'azimut doit être un nombre valide"},help:{sunrise_offset:"Pour les déclencheurs au lever du soleil : utilisez des valeurs négatives pour démarrer avant le lever, positives pour démarrer après. Réglez sur 0 pour démarrer automatiquement assez tôt afin de terminer toutes les zones avant le lever du soleil.",sunset_offset:"Pour les déclencheurs au coucher du soleil : utilisez des valeurs négatives pour démarrer avant le coucher, positives pour démarrer après le coucher.",azimuth_explanation:"L'azimut solaire est la direction de la boussole vers le soleil. 0°=Nord, 90°=Est, 180°=Sud, 270°=Ouest. Vous pouvez saisir n'importe quelle valeur d'angle (p. ex. 450°=90°, -30°=330°). Utilisez-le pour déclencher l'irrigation lorsque le soleil atteint une position précise.",multiple_triggers:"Vous pouvez configurer plusieurs déclencheurs. Chaque déclencheur activé planifiera indépendamment les démarrages d'irrigation."}},gi={title:"Saut d'irrigation basé sur la météo",description:"Saute automatiquement l'irrigation lorsque des précipitations sont prévues. Cette fonctionnalité nécessite qu'un service météo soit configuré.",threshold_label:"Seuil de précipitations",threshold_description:"Quantité minimale de précipitations (en mm) prévue pour aujourd'hui et demain pour sauter l'irrigation."},hi={title:"Coordonnées de localisation",description:"Configurez les coordonnées de localisation pour la récupération des données météo. Vous pouvez utiliser des coordonnées manuelles différentes de votre emplacement Home Assistant si nécessaire.",manual_enabled:"Utiliser des coordonnées manuelles",use_ha_location:"Utiliser l'emplacement Home Assistant",latitude:"Latitude (degrés décimaux)",longitude:"Longitude (degrés décimaux)",elevation:"Élévation (mètres au-dessus du niveau de la mer)",current_ha_coords:"Coordonnées actuelles de Home Assistant"},vi={title:"Jours entre irrigations",description:"Configurez le nombre minimum de jours qui doivent s'écouler entre les événements d'irrigation. Cela aide à contrôler la fréquence d'arrosage pour la conservation de l'eau et la gestion de la santé des plantes.\n\nCas d'usage typiques:\n• Entretien de pelouse: intervalles de 1-2 jours préviennent l'arrosage excessif\n• Restrictions de sécheresse: intervalles de 6+ jours pour arrosage hebdomadaire\n• Plantes à racines profondes: intervalles de 3-7 jours pour arrosage moins fréquent\n• Conservation de l'eau: personnalisable selon le climat et les conditions du sol",label:"Jours minimum entre irrigations",help_text:"Définir à 0 pour désactiver cette fonction. Les valeurs de 1-365 jours sont prises en charge. Ce paramètre fonctionne avec la logique de prévision de précipitation existante."},fi={title:"Arrosage observé (boucle fermée)",description:"Crédite automatiquement le réservoir de chaque zone à partir de l'arrosage réel, au lieu de le réinitialiser depuis une automatisation. Une fois activé, choisissez une entité vanne/interrupteur par zone dans l'onglet Zones : pendant qu'elle est ouverte, le réservoir est crédité d'après la durée et le débit de la zone. Pour un comptage exact, vous pouvez aussi choisir un compteur de volume cumulé (type compteur d'eau) par zone, et le volume mesuré est alors utilisé. Important : quand c'est activé, c'est la seule chose qui crédite le réservoir, donc retirez tout appel à reset_bucket de votre automatisation d'irrigation pour éviter un double comptage.",enabled_label:"Activer l'arrosage observé",direct_control_label:"Laisser Smart Irrigation piloter la vanne",direct_control_description:"Une fois activé, Smart Irrigation ouvre la vanne liée de chaque zone, attend la durée calculée, puis la referme - aucune automatisation nécessaire. Un arrosage en cours reprend après un redémarrage. Sécurité : si Home Assistant tombe longtemps en plein arrosage, la vanne reste ouverte et continue d'arroser, donnez donc à votre vanne un failsafe matériel (une durée d'ouverture maximale).",sequencing_label:"Séquencement des zones",sequencing:{sequential:"Séquentiel (une zone à la fois)",parallel:"Parallèle (toutes les zones en même temps)"}},bi={common:oi,defaults:li,module:di,calcmodules:ui,panels:ci,title:pi,irrigation_start_triggers:mi,weather_skip:gi,coordinate_config:hi,days_between_irrigation:vi,observed_watering:fi},ki=Object.freeze({__proto__:null,calcmodules:ui,common:oi,coordinate_config:hi,days_between_irrigation:vi,default:bi,defaults:li,irrigation_start_triggers:mi,module:di,observed_watering:fi,panels:ci,title:pi,weather_skip:gi}),yi={loading:"Betöltés",saving:"Mentés",actions:{delete:"Törlés"},labels:{module:"Modul",no:"Nem",select:"Kiválasztás",yes:"Igen",enabled:"Engedélyezve",disabled:"Letiltva",before:"előtte",after:"utána"},units:{seconds:"másodperc"},attributes:{size:"méret",throughput:"átfolyás",state:"állapot",bucket:"vödör",last_updated:"utolsó frissítés",last_calculated:"utolsó számítás",number_of_data_points:"adatpontok száma"},"loading-messages":{configuration:"Konfiguráció betöltése…",modules:"Modulok betöltése…",general:"Betöltés…"},"saving-messages":{adding:"Hozzáadás…",saving:"Mentés…"}},_i={"default-zone":"Alapértelmezett zóna","default-mapping":"Alapértelmezett érzékelőcsoport"},zi={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Megjegyzés: ez a magyarázat „.” jelet használ tizedesjelként, és kerekített, metrikus értékeket mutat. A modul által visszaadott evapotranspirációs hiány ( = et0 * hour_multiplier + precipitation) értéke","bucket-was":"A vödör értéke volt","new-bucket-values-is":"Az új vödörérték",bucket:"vödör","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Mivel a vödör < 0, az öntözés szükséges","steps-taken-to-calculate-duration":"A pontos időtartam kiszámításához a következő lépéseket tettük","precipitation-rate-defined-as":"A csapadékmennyiség a következőképpen van meghatározva","duration-is-calculated-as":"Az időtartam a következőképpen kerül kiszámításra",drainage:"drainage","drainage-rate":"drainage_rate",hours:"óra","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Most a szorzó kerül alkalmazásra. A szorzó","duration-after-multiplier-is":"így az időtartam","maximum-duration-is-applied":"Ezután a maximális időtartam kerül alkalmazásra. A maximális időtartam","duration-after-maximum-duration-is":"így az időtartam","lead-time-is-applied":"Végül az átfutási idő kerül alkalmazásra. Az átfutási idő","duration-after-lead-time-is":"így a végső időtartam","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Mivel a vödör >= 0, öntözésre nincs szükség, és az időtartam beállítása","maximum-bucket-is":"A maximális vödörméret","drainage-rate-is":"A telített állapotú elvezetési sebesség (a vödör maximumon) ","current-drainage-is":"Az aktuális elvezetés a következőképpen kerül kiszámításra","no-drainage":"Az aktuális elvezetés 0, mert"}}},wi={pyeto:{description:"Az időtartam kiszámítása a PyETO könyvtár FAO56 számítása alapján"},static:{description:"„Próba” modul statikus, konfigurálható deltával"},passthrough:{description:"Átengedő modul, amely egy evapotranspirációs érzékelő értékét adja vissza deltaként"}},xi={weatherservice:{title:"Időjárás-szolgáltatás",description:"Tekintse meg és módosítsa az időjárási adatok lekéréséhez használt időjárás-szolgáltatást — nincs szükség az integráció újratelepítésére. Az API-kulcs ellenőrzésre kerül, és a változás azonnal érvénybe lép.",labels:{"use-weather-service":"Időjárás-szolgáltatás használata",service:"Időjárás-szolgáltatás","api-key":"API-kulcs"},actions:{save:"Mentés",saving:"Mentés…"},messages:{"no-service":"Nincs használatban időjárás-szolgáltatás — az időjárási adatok kizárólag a saját érzékelőiből származnak.",saved:"Az időjárás-szolgáltatás frissítve és alkalmazva.","reload-note":"A mentés ellenőrzi az API-kulcsot a szolgáltatásnál, és azonnal alkalmazza a változást."}},backuprestore:{title:"Biztonsági mentés / visszaállítás",description:"Exportálja a teljes Smart Irrigation konfigurációt egy JSON-fájlba, vagy állítsa vissza egy korábbi biztonsági mentésből.",cards:{backup:{title:"Biztonsági mentés",description:"Töltse le a teljes konfigurációt (általános beállítások, zónák, modulok és érzékelőcsoportok) JSON-fájlként."},restore:{title:"Visszaállítás",description:"Töltsön be egy korábban exportált JSON-fájlt az aktuális konfiguráció lecseréléséhez."}},actions:{export:"Exportálás JSON-ba","choose-file":"Válasszon biztonsági mentési fájlt…",restore:"Ennek a biztonsági mentésnek a visszaállítása",restoring:"Visszaállítás…"},messages:{exported:"Biztonsági mentési fájl letöltve.",restored:"A konfiguráció visszaállítva — az integráció újratöltése folyamatban.","invalid-file":"Ez a fájl nem érvényes Smart Irrigation biztonsági mentés.","confirm-title":"Lecseréli a teljes konfigurációt?",summary:"Ez a biztonsági mentés a következőket tartalmazza","confirm-warning":"A visszaállítás felülírja az összes jelenlegi általános beállítást, zónát, modult és érzékelőcsoportot. Ez nem vonható vissza.","reload-note":"A visszaállítás mindent lecserél, és újratölti az integrációt a változás érvénybe léptetéséhez."}},general:{cards:{"automatic-duration-calculation":{header:"Automatikus időtartam-számítás",description:"A számítás az addig gyűjtött időjárási adatokat veszi alapul, és frissíti a vödröt minden automatikus zónánál. Ezután az időtartam az új vödörérték alapján kerül beállításra, és a gyűjtött időjárási adatok eltávolításra kerülnek.",labels:{"auto-calc-enabled":"Az öntözési időtartamok automatikus kiszámítása","calc-time":"Számítás ekkor"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Figyelmeztetés: az időjárási adatok frissítési ideje a számítás idejére vagy az után esik"},header:"Automatikus időjárásiadat-frissítés",description:"Az időjárási adatok automatikus gyűjtése és tárolása. Az időjárási adatok szükségesek a zónák vödreinek és időtartamainak kiszámításához.",labels:{"auto-update-enabled":"Az időjárási adatok automatikus frissítése","auto-update-schedule":"Frissítési ütemezés","auto-update-time":"Frissítés ekkor","auto-update-interval":"Érzékelőadatok frissítése ennyente","auto-update-delay":"Frissítési késleltetés"},options:{minutes:"perc",hours:"óra",days:"nap"}},"automatic-clear":{header:"Automatikus időjárásiadat-tisztítás",description:"A gyűjtött időjárási adatok automatikus eltávolítása egy beállított időpontban. Ezzel biztosíthatja, hogy ne maradjon megmaradt időjárási adat az előző napokról. Ne távolítsa el az időjárási adatokat a számítás előtt, és csak akkor használja ezt a lehetőséget, ha azt várja, hogy az automatikus frissítés a napra történő számítás után is gyűjt időjárási adatokat. Ideális esetben a lehető legkésőbb érdemes tisztítani a nap folyamán.",labels:{"automatic-clear-enabled":"A gyűjtött időjárási adatok automatikus törlése","automatic-clear-time":"Időjárási adatok törlése ekkor"}},continuousupdates:{header:"Folyamatos frissítések az érzékelőkhöz (kísérleti)",description:"Ez a kísérleti funkció folyamatosan frissíti az érzékelőadatokat. Ez hasznos azoknál az érzékelőcsoportoknál, amelyek folyamatos adatot szolgáltató forrásokat használnak, például időjárás-állomásokat. Ez a funkció nem használható olyan érzékelőcsoportoknál, amelyek legalább részben időjárás-szolgáltatásokra támaszkodnak, mivel az API-k folyamatos lekérdezése költségekkel jár. Ne feledje, hogy ez kísérleti, és előfordulhat, hogy nem a várt módon működik. A használata saját felelősségre történik.",labels:{continuousupdates:"Folyamatos frissítések engedélyezése",sensor_debounce:"Érzékelő-pergésmentesítés"}}},description:"Ez az oldal globális beállításokat biztosít.",title:"Általános"},help:{title:"Súgó",cards:{"how-to-get-help":{title:"Hogyan kérhet segítséget","first-read-the":"Először olvassa el a",wiki:"Wiki","if-you-still-need-help":"Ha továbbra is segítségre van szüksége, forduljon a","community-forum":"Közösségi fórum","or-open-a":"vagy nyisson egy","github-issue":"Github-hibajegy","english-only":"Csak angol nyelven"}}},info:{title:"Információ",description:"Tekintse meg a következő öntözéssel és a rendszer állapotával kapcsolatos információkat.","configuration-not-available":"A konfiguráció nem érhető el.",cards:{"zone-bucket-values":{title:"Zóna vödörértékei és időtartama",labels:{bucket:"Vödör",duration:"Időtartam"},"no-zones":"Nincs konfigurált zóna"},"next-irrigation":{title:"Következő öntözés",labels:{"next-start":"Következő indulás",duration:"Időtartam",zones:"Zónák"},"no-data":"Nincs elérhető adat"},"irrigation-reason":{title:"Öntözés oka",labels:{reason:"Ok",sunrise:"Napkelte","total-duration":"Teljes időtartam",explanation:"Magyarázat"},"no-data":"Nincs elérhető adat"}}},mappings:{cards:{"add-mapping":{actions:{add:"Érzékelőcsoport hozzáadása"},header:"Érzékelőcsoportok hozzáadása"},mapping:{aggregates:{average:"Átlag",first:"Első",last:"Utolsó",maximum:"Maximum",median:"Medián",minimum:"Minimum",riemannsum:"Riemann-összeg",sum:"Összeg",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Nem törölheti ezt az érzékelőcsoportot, mert legalább egy zóna használja.",invalid_source:"Érvénytelen forrás",source_does_not_exist:"A forrás nem létezik. Kérjük, adjon meg egy érvényes forrást, például a „sensor.mysensor” értéket."},items:{dewpoint:"Harmatpont",evapotranspiration:"Evapotranspiráció",humidity:"Páratartalom","maximum temperature":"Maximális hőmérséklet","minimum temperature":"Minimális hőmérséklet",precipitation:"Teljes csapadékmennyiség","current precipitation":"Aktuális csapadékmennyiség",pressure:"Nyomás","solar radiation":"Napsugárzás",temperature:"Hőmérséklet",windspeed:"Szélsebesség"},pressure_types:{absolute:"abszolút",relative:"relatív"},"pressure-type":"A nyomás","sensor-aggregate-of-sensor-values-to-calculate":"az érzékelőértékekből az időtartam kiszámításához","sensor-aggregate-use-the":"Használja a","sensor-entity":"Érzékelő entitás",static_value:"Érték","input-units":"A bemenet az értékeket a következő egységben adja meg",source:"Forrás",sources:{none:"Nincs",weather_service:"Időjárás-szolgáltatás",sensor:"Érzékelő",static:"Statikus érték"}}},description:"Adjon hozzá egy vagy több érzékelőcsoportot, amelyek időjárási adatokat kérnek le az időjárás-szolgáltatásból, érzékelőkből vagy ezek kombinációjából. Minden érzékelőcsoportot egy vagy több zónához rendelhet",labels:{"mapping-name":"Név"},no_items:"Még nincs definiált érzékelőcsoport.",title:"Érzékelőcsoportok","weather-records":{title:"Időjárási feljegyzések (utolsó 10)",timestamp:"Idő",temperature:"Hőm.",humidity:"Páratartalom",precipitation:"Csapadék","retrieval-time":"Lekérve","no-data":"Ehhez az érzékelőcsoporthoz nincs elérhető időjárási adat"}},modules:{cards:{"add-module":{actions:{add:"Modul hozzáadása"},header:"Modul hozzáadása"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Nem törölheti ezt a modult, mert legalább egy zóna használja."},labels:{configuration:"Konfiguráció",required:"kötelező mezőt jelez"},"translated-options":{DontEstimate:"Ne becsülje",EstimateFromSunHours:"Becslés a napsütéses órákból",EstimateFromTemp:"Becslés a hőmérsékletből",EstimateFromSunHoursAndTemperature:"Becslés a napsütéses órák és a hőmérséklet átlagából"}}},description:"Adjon hozzá egy vagy több modult, amely kiszámítja az öntözési időtartamot. Minden modulnak saját konfigurációja van, és egy vagy több zóna időtartamának kiszámítására használható.",no_items:"Még nincs definiált modul.",title:"Modulok"},zones:{actions:{add:"Hozzáadás",calculate:"Számítás",information:"Információ",update:"Frissítés","reset-bucket":"Vödör visszaállítása","view-weather-info":"Időjárási adatok megtekintése","view-weather-info-message":"Időjárási adatok elérhetők ehhez:","view-watering-calendar":"Öntözési naptár megtekintése"},cards:{"add-zone":{actions:{add:"Zóna hozzáadása"},header:"Zóna hozzáadása"},"zone-actions":{actions:{"calculate-all":"Összes zóna kiszámítása","update-all":"Összes zóna frissítése","reset-all-buckets":"Összes vödör visszaállítása","clear-all-weatherdata":"Összes időjárási adat törlése"},header:"Műveletek az összes zónán"}},description:"Adjon meg itt egy vagy több öntözési zónát. Az öntözési időtartam zónánként kerül kiszámításra, a méret, az átfolyás, az állapot, a modul és az érzékelőcsoport függvényében.",labels:{bucket:"Vödör",duration:"Időtartam","lead-time":"Átfutási idő",mapping:"Érzékelőcsoport","maximum-duration":"Maximális időtartam",multiplier:"Szorzó",name:"Név",size:"Méret",state:"Állapot",states:{automatic:"Automatikus",disabled:"Letiltva",manual:"Kézi"},throughput:"Átfolyás","maximum-bucket":"Maximális vödör",last_calculated:"Utolsó számítás","data-last-updated":"Adatok utolsó frissítése","data-number-of-data-points":"Adatpontok száma",drainage_rate:"Elvezetési sebesség","linked-entity":"Csatlakoztatott szelep/kapcsoló","linked-entity-hint":"A szelep vagy kapcsoló, amely ezt a zónát öntözi. Amikor működik (kézi nyitás, automatizálás vagy maga a Smart Irrigation, ha a közvetlen szelepvezérlés be van kapcsolva), a vödör a működési időből és a zóna átfolyásából töltődik fel. A zárt hurkú funkciókhoz szükséges.","flow-sensor":"Kumulatív térfogatmérő","flow-sensor-hint":"Az átfolyás x idő helyett pontos feltöltéshez: egy kumulatív vízmérő összérték (total_increasing állapotosztály), nem pillanatnyi átfolyási sebesség. A mértékegység automatikusan beolvasásra kerül (L, mL, m³, gal, ft³).",optional:"opcionális"},no_items:"Még nincs definiált zóna.",title:"Zónák"}},ji="Smart Irrigation",Si={title:"Öntözésindítási triggerek",description:"Állítsa be, mikor kezdődjön az öntözés napeseményeken alapulva. Több triggert is hozzáadhat különböző ütemezésekhez. Napkelte triggereknél az eltolás 0 értéken hagyása automatikusan az összes engedélyezett zóna teljes időtartamát használja.",usage_before:"Amikor egy trigger aktiválódik, a Smart Irrigation kibocsátja a következő eseményt: ",usage_after:" — figyelje ezt egy automatizálásban az öntözés indításához. Az esemény adatai tartalmazzák a trigger_name, trigger_type és offset_minutes mezőket, így triggerenként eltérően reagálhat. A csapadékalapú kihagyás és az öntözések közötti napok beállításai továbbra is érvényesek: kihagyott napon nem keletkezik esemény.",add_trigger:"Trigger hozzáadása",edit_trigger:"Trigger szerkesztése",delete_trigger:"Trigger törlése",trigger_types:{sunrise:"Napkelte",sunset:"Napnyugta",solar_azimuth:"Nap azimutja"},fields:{name:{name:"Trigger neve",description:"Beszédes név a trigger azonosításához"},type:{name:"Trigger típusa",description:"A napesemény típusa, amelyre triggerelni kell"},enabled:{name:"Engedélyezve",description:"Hogy ez a trigger jelenleg aktív-e"},offset_minutes:{name:"Eltolás (perc)",description:"A napesemény előtti (-) vagy utáni (+) percek száma. Napkelte triggereknél használja a 0 értéket a teljes zónaidőtartam alapján történő automatikus időzítéshez."},azimuth_angle:{name:"Azimutszög (fok)",description:"A nap azimutszöge fokban, ahol 0=Észak, 90=Kelet, 180=Dél, 270=Nyugat"},account_for_duration:{name:"Időtartam figyelembevétele",description:"Ha engedélyezve van, az öntözés elég korán indul, hogy a megadott időpontra befejeződjön. Ha le van tiltva, az öntözés pontosan a megadott időpontban indul."}},dialog:{add_title:"Öntözésindítási trigger hozzáadása",edit_title:"Öntözésindítási trigger szerkesztése",cancel:"Mégse",save:"Mentés",delete:"Törlés",help:"Amikor ez a trigger aktiválódik, a Smart Irrigation kibocsátja a következő eseményt — használja egy automatizálásban az öntözés indításához. Az esemény adatai tartalmazzák ennek a triggernek a nevét (valamint a típusát/eltolását), így konkrétan reagálhat rá:"},no_triggers:"Nincsenek konfigurált öntözésindítási triggerek. A rendszer az alapértelmezett viselkedést használja (napkelte a teljes zónaidőtartammal). Adjon hozzá triggereket az öntözés indításának testreszabásához.",offset_auto:"Automatikus (a teljes zónaidőtartamból számítva)",confirm_delete:"Biztosan törli a(z) „{name}” triggert?",validation:{name_required:"A trigger neve kötelező",azimuth_invalid:"Az azimutszögnek érvényes számnak kell lennie"},help:{sunrise_offset:"Napkelte triggereknél: Használjon negatív értékeket a napkelte előtti indításhoz, pozitívat a napkelte utánihoz. Állítsa 0-ra, hogy automatikusan elég korán induljon az összes zóna befejezéséhez napkelte előtt.",sunset_offset:"Napnyugta triggereknél: Használjon negatív értékeket a napnyugta előtti indításhoz, pozitívat a napnyugta utánihoz.",azimuth_explanation:"A nap azimutja a nap iránytű szerinti iránya. 0°=Észak, 90°=Kelet, 180°=Dél, 270°=Nyugat. Bármilyen szögértéket megadhat (pl. 450° = 90°, -30° = 330°). Ezzel akkor indíthatja az öntözést, amikor a nap egy adott pozíciót ér el.",multiple_triggers:"Több triggert is konfigurálhat. Minden engedélyezett trigger önállóan ütemezi az öntözések indítását."},active_label:"Aktív trigger",active_default:"Alapértelmezett (napkelte mínusz a teljes öntözési időtartam)",active_hint:'Csak a kiválasztott trigger indítja az öntözést, így naponta egyszer fut le. Az "Alapértelmezett" úgy időzíti a működést, hogy pontosan napkeltekor fejeződjön be. Adj hozzá egyéni triggereket (naplemente, azimut, eltolások) alább, majd válassz egyet itt.'},Ai={title:"Időjárás-alapú öntözéskihagyás",description:"Automatikusan kihagyja az öntözést, ha csapadék van előrejelezve. Ehhez a funkcióhoz időjárás-szolgáltatás konfigurálása szükséges.",threshold_label:"Csapadékküszöb",threshold_description:"A mai és holnapi napra előrejelzett csapadék minimális mennyisége (mm-ben) az öntözés kihagyásához."},$i={title:"Helykoordináták",description:"Állítsa be a helykoordinátákat az időjárási adatok lekéréséhez. Szükség esetén a Home Assistant helyétől eltérő, kézi koordinátákat is használhat.",manual_enabled:"Kézi koordináták használata",use_ha_location:"A Home Assistant helyének használata",latitude:"Szélesség (tizedfok)",longitude:"Hosszúság (tizedfok)",elevation:"Magasság (méter tengerszint felett)",current_ha_coords:"Jelenlegi Home Assistant koordináták"},Ei={title:"Öntözések közötti napok",description:"Állítsa be az öntözési események között eltelő napok minimális számát. Ez segít szabályozni az öntözés gyakoriságát a vízmegtakarítás és a növények egészségének megőrzése érdekében.\n\nTipikus valós felhasználási esetek:\n• Gyepápolás: az 1-2 napos időközök megakadályozzák a túlöntözést\n• Aszálykorlátozások: 6+ napos időközök a heti öntözéshez\n• Mélygyökerű növények: 3-7 napos időközök a ritkább öntözéshez\n• Vízmegtakarítás: az éghajlat és a talajviszonyok alapján testreszabható",label:"Öntözések közötti minimális napok",help_text:"Állítsa 0-ra a funkció letiltásához. 1-365 nap közötti értékek támogatottak. Ez a beállítás a meglévő csapadék-előrejelzési logikával együtt működik."},Ti={title:"Megfigyelt öntözés (zárt hurok)",description:"Töltsd fel minden zóna vödrét automatikusan a valós öntözésből, ahelyett hogy a vödröt egy automatizálásból állítanád vissza. Az engedélyezés után válassz egy szelep/kapcsoló entitást zónánként a Zónák lapon: amíg nyitva van, a vödör a működési időből és a zóna átfolyásából töltődik fel. A pontos elszámoláshoz zónánként választhatsz egy kumulatív térfogatmérőt is (vízmérő jellegű összérték), és a mért térfogat lesz felhasználva helyette. Fontos: amikor ez be van kapcsolva, csak ez tölti fel a vödröt, ezért távolítsd el a reset_bucket hívást az öntözési automatizálásodból a dupla számolás elkerülése érdekében.",enabled_label:"Megfigyelt öntözés engedélyezése",direct_control_label:"A Smart Irrigation vezérelje a szelepet",direct_control_description:"Bekapcsolva a Smart Irrigation kinyitja minden zóna csatlakoztatott szelepét, megvárja a kiszámított időtartamot, majd bezárja - nincs szükség automatizálásra. A folyamatban lévő működés újraindítás után folytatódik. Biztonság: ha a Home Assistant hosszú időre leáll működés közben, a szelep nyitva marad és tovább öntöz, ezért adj a szelepednek hardveres vészleállítást (egy maximális működési időt).",sequencing_label:"Zóna sorrend",sequencing:{sequential:"Szekvenciális (egy zóna egyszerre)",parallel:"Párhuzamos (minden zóna egyszerre)"}},Mi={common:yi,defaults:_i,module:zi,calcmodules:wi,panels:xi,title:ji,irrigation_start_triggers:Si,weather_skip:Ai,coordinate_config:$i,days_between_irrigation:Ei,observed_watering:Ti},Di=Object.freeze({__proto__:null,calcmodules:wi,common:yi,coordinate_config:$i,days_between_irrigation:Ei,default:Mi,defaults:_i,irrigation_start_triggers:Si,module:zi,observed_watering:Ti,panels:xi,title:ji,weather_skip:Ai}),Oi={loading:"Caricamento",saving:"Salvataggio",actions:{delete:"Cancella"},labels:{module:"Modulo",no:"No",select:"Seleziona",yes:"Si",enabled:"Attivato",disabled:"Disattivato",before:"prima",after:"dopo"},units:{seconds:"secondi"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"secchio",last_updated:"ultimo aggiornamento",last_calculated:"ultimo calcolo",number_of_data_points:"numero di punti dati"},"loading-messages":{configuration:"Caricamento della configurazione…",modules:"Caricamento dei moduli…",general:"Caricamento…"},"saving-messages":{adding:"Aggiunta…",saving:"Salvataggio…"}},Ni={"default-zone":"Zona predefinita","default-mapping":"Mappatura predefinita"},Pi={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Il modulo ha restituito un deficit di evapotraspirazione del","bucket-was":"Il secchio era","new-bucket-values-is":"Il nuovo valore del secchio è",bucket:"secchio","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Poiché secchio < 0, è necessaria l'irrigazione","steps-taken-to-calculate-duration":"Per calcolare la durata esatta, sono stati eseguiti i seguenti passaggi","precipitation-rate-defined-as":"Il tasso di precipitazione è definito come","duration-is-calculated-as":"La durata viene calcolata come",drainage:"drenaggio","drainage-rate":"tasso_di_drenaggio",hours:"ore","precipitation-rate-variable":"tasso_di_precipitazione","multiplier-is-applied":"Ora viene applicato il moltiplicatore. Il moltiplicatore è","duration-after-multiplier-is":"quindi la durata è","maximum-duration-is-applied":"Quindi, viene applicata la durata massima. La durata massima è","duration-after-maximum-duration-is":"quindi la durata è","lead-time-is-applied":"Infine, viene applicato il lead time. Il tempo di consegna è","duration-after-lead-time-is":"quindi la durata finale è","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Poiché secchio >= 0, non è necessaria alcuna irrigazione e la durata è impostata su","maximum-bucket-is":"la dimensione massima del secchio è","drainage-rate-is":"Il tasso di drenaggio in condizioni di saturazione (secchio al massimo) è di","current-drainage-is":"Il drenaggio attuale è calcolato come","no-drainage":"Il drenaggio attuale è 0 perché"}}},Ci={pyeto:{description:"Calcola la durata in base al calcolo FAO56 dalla libreria PyETO"},static:{description:"Modulo 'fittizio' con un delta configurabile statico"},passthrough:{description:"Modulo passthrough che restituisce il valore di un sensore di Evapotraspirazione sotto forma di delta"}},Hi={weatherservice:{title:"Servizio meteo",description:"Visualizza e cambia il servizio meteo usato per recuperare i dati meteo — senza reinstallare l'integrazione. La chiave API viene convalidata e la modifica applicata immediatamente.",labels:{"use-weather-service":"Usa un servizio meteo",service:"Servizio meteo","api-key":"Chiave API"},actions:{save:"Salva",saving:"Salvataggio…"},messages:{"no-service":"Non viene usato alcun servizio meteo — i dati meteo provengono solo dai tuoi sensori.",saved:"Servizio meteo aggiornato e applicato.","reload-note":"Al salvataggio la chiave API viene convalidata con il servizio e la modifica applicata immediatamente."}},backuprestore:{title:"Backup / ripristino",description:"Esporta l'intera configurazione di Smart Irrigation in un file JSON, oppure ripristinala da un backup precedente.",cards:{backup:{title:"Backup",description:"Scarica la configurazione completa (impostazioni generali, zone, moduli e gruppi di sensori) come file JSON."},restore:{title:"Ripristina",description:"Carica un file JSON esportato in precedenza per sostituire la configurazione attuale."}},actions:{export:"Esporta in JSON","choose-file":"Scegli un file di backup…",restore:"Ripristina questo backup",restoring:"Ripristino…"},messages:{exported:"File di backup scaricato.",restored:"Configurazione ripristinata — ricaricamento dell'integrazione.","invalid-file":"Questo file non è un backup valido di Smart Irrigation.","confirm-title":"Sostituire l'intera configurazione?",summary:"Questo backup contiene","confirm-warning":"Il ripristino sovrascrive tutte le impostazioni generali, le zone, i moduli e i gruppi di sensori attuali. L'operazione non può essere annullata.","reload-note":"Il ripristino sostituisce tutto e ricarica l'integrazione per applicare la modifica."}},general:{cards:{"automatic-duration-calculation":{header:"Calcolo automatico della durata",description:"Il calcolo prende i dati meteorologici raccolti fino a quel momento e aggiorna il bucket per ciascuna zona automatica. Quindi, la durata viene regolata in base al nuovo valore del segmento e i dati meteorologici raccolti vengono rimossi.",labels:{"auto-calc-enabled":"Calcola automaticamente la durata delle zone","calc-time":"Calcola alle"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Attenzione: ora di aggiornamento dei dati meteorologici in corrispondenza o dopo l'ora di calcolo"},header:"Aggiornamento automatico dei dati meteorologici",description:"Raccogli e archivia automaticamente i dati meteorologici. I dati meteorologici sono necessari per calcolare gli intervalli e le durate delle zone.",labels:{"auto-update-enabled":"Aggiorna automaticamente i dati meteorologici","auto-update-schedule":"Programma di aggiornamento","auto-update-time":"Aggiorna alle","auto-update-interval":"Aggiorna i dati del sensore ogni","auto-update-delay":"Ritardo di aggiornamento"},options:{minutes:"minuti",hours:"ore",days:"giorni"}},"automatic-clear":{header:"Eliminazione automatica dei dati meteo",description:"Rimuovi automaticamente i dati meteo raccolti a un orario configurato. Usa questa opzione per assicurarti che non vi siano dati meteo residui dei giorni precedenti. Non rimuovere i dati meteo prima di effettuare il calcolo e utilizza questa opzione solo se prevedi che l'aggiornamento automatico raccolga i dati meteo dopo aver effettuato il calcolo giornaliero. Idealmente, la rimozione dei dati meteo dovrebbe avvenire il più tardi possibile.",labels:{"automatic-clear-enabled":"Cancella automaticamente i dati meteorologici raccolti","automatic-clear-time":"Cancella dati meteo a"}},continuousupdates:{header:"Aggiornamenti continui per i sensori (sperimentale)",description:"Questa funzione sperimentale aggiorna continuamente i dati dei sensori. È utile per i gruppi di sensori che utilizzano fonti che forniscono dati continui, come le stazioni meteorologiche. Questa funzione non può essere utilizzata per i gruppi di sensori che si affidano almeno in parte ai servizi meteo, poiché il polling continuo delle API comporta dei costi. Tenere presente che si tratta di una funzione sperimentale e che potrebbe non funzionare come previsto. Utilizzatela a vostro rischio e pericolo.",labels:{continuousupdates:"Abilita gli aggiornamenti continui",sensor_debounce:"Rimbalzo del sensore"}}},description:"Questa pagina fornisce le impostazioni globali.",title:"Generale"},help:{title:"Aiuto",cards:{"how-to-get-help":{title:"Come ottenere aiuto","first-read-the":"Per prima cosa, leggi il",wiki:"Wiki","if-you-still-need-help":"Se hai ancora bisogno di aiuto, contatta il","community-forum":"Forum della Comunità","or-open-a":"oppure apri un","github-issue":"Problema su Github","english-only":"soltanto in Inglese"}}},info:{title:"Info",description:"Visualizza le informazioni sulla prossima irrigazione e sullo stato del sistema.","configuration-not-available":"Configurazione non disponibile.",cards:{"zone-bucket-values":{title:"Valori bucket e durata per zona",labels:{bucket:"Bucket",duration:"Durata"},"no-zones":"Nessuna zona configurata"},"next-irrigation":{title:"Prossima Irrigazione",labels:{"next-start":"Prossimo avvio",duration:"Durata",zones:"Zone"},"no-data":"Non ci sono dati disponibili"},"irrigation-reason":{title:"Motivo dell'irrigazione",labels:{reason:"Motivazione",sunrise:"Alba","total-duration":"Durata totale",explanation:"Spiegazione"},"no-data":"Non ci sono dati disponibili"}}},mappings:{cards:{"add-mapping":{actions:{add:"Aggiungi gruppo di sensori"},header:"Aggiungi gruppo di sensori"},mapping:{aggregates:{average:"Media",first:"Primo",last:"Ultimo",maximum:"Massimo",median:"Mediana",minimum:"Minimo",riemannsum:"Somma di Riemann",sum:"Somma",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Non è possibile eliminare questo gruppo di sensori perché almeno una zona lo utilizza.",invalid_source:"Fonte non valida",source_does_not_exist:"La fonte non esiste. Inserire una fonte valida, ad esempio 'sensor.mysensor'."},items:{dewpoint:"Punto di rugiada",evapotranspiration:"Evapotraspirazione",humidity:"Umidità","maximum temperature":"Temperatura massima","minimum temperature":"Temperatura minima",precipitation:"Precipitazione","current precipitation":"Precipitazioni attuali",pressure:"Pressione","solar radiation":"Irradiamento solare",temperature:"Temperatura",windspeed:"Velocità del vento"},pressure_types:{absolute:"assoluta",relative:"relativa"},"pressure-type":"La pressione è","sensor-aggregate-of-sensor-values-to-calculate":"dei valori del sensore per calcolare la durata","sensor-aggregate-use-the":"Usa il","sensor-entity":"Entità sensore",static_value:"Valore","input-units":"L'input fornisce valori in",source:"Fonte",sources:{none:"Nessuna",weather_service:"Weather service",sensor:"Sensore",static:"Valore statico"}}},description:"Aggiungi uno o più gruppi di sensori che recuperano i dati meteorologici da Weather service, da sensori o da una combinazione di questi. È possibile mappare ciascun gruppo di sensori su una o più zone",labels:{"mapping-name":"Nome"},no_items:"Non è ancora stato definito alcun gruppo di sensori.",title:"Gruppi di sensori","weather-records":{title:"Record meteo (ultimi 10)",timestamp:"Tempo",temperature:"Temp",humidity:"Umidità",precipitation:"Precip","retrieval-time":"Recuperato","no-data":"Non sono disponibili dati meteo per questo gruppo di sensori"}},modules:{cards:{"add-module":{actions:{add:"Aggiungi modulo"},header:"Aggiungi modulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Non puoi eliminare questo modulo perché almeno una zona lo utilizza."},labels:{configuration:"Configurazione",required:"indica un campo richiesto"},"translated-options":{DontEstimate:"Non stimare",EstimateFromSunHours:"Stima dalle ore solari",EstimateFromTemp:"Stima dalla temperatura",EstimateFromSunHoursAndTemperature:"Stima dalla media delle ore di sole e della temperatura"}}},description:"Aggiungi uno o più moduli che calcolano la durata dell'irrigazione. Ogni modulo viene fornito con la propria configurazione e può essere utilizzato per calcolare la durata di una o più zone.",no_items:"Non ci sono ancora moduli definiti.",title:"Moduli"},zones:{actions:{add:"Aggiungi",calculate:"Calcola",information:"Informazioni",update:"Aggiorna","reset-bucket":"Reimposta il secchio","view-weather-info":"Visualizza le informazioni meteo","view-weather-info-message":"Informazioni meteo disponibili per","view-watering-calendar":"Visualizza il calendario delle irrigazioni"},cards:{"add-zone":{actions:{add:"Aggiungi zona"},header:"Aggiungi zona"},"zone-actions":{actions:{"calculate-all":"Calcola tutte le zone","update-all":"Aggiorna tutte le zone","reset-all-buckets":"Reimposta tutte le zone","clear-all-weatherdata":"Cancella tutti i dati meteo"},header:"Azioni su tutte le zone"}},description:"Specificare qui una o più zone di irrigazione. La durata dell'irrigazione viene calcolata per zona, a seconda delle dimensioni, della produttività, dello stato, del modulo e del gruppo di sensori.",labels:{bucket:"Secchio",duration:"Durata","lead-time":"Tempi di esecuzione",mapping:"Gruppo di sensori","maximum-duration":"Durata massima",multiplier:"Moltiplicatore",name:"Nome",size:"Misura",state:"Stato",states:{automatic:"Automatico",disabled:"Disabilitato",manual:"Manuale"},throughput:"Portata","maximum-bucket":"Secchio massimo",last_calculated:"Ultimo calcolo","data-last-updated":"Ultimo aggiornamento dei dati","data-number-of-data-points":"Numero di dati",drainage_rate:"Tasso di drenaggio","linked-entity":"Valvola/interruttore collegato","linked-entity-hint":"La valvola o l'interruttore che irriga questa zona. Ogni volta che si attiva (un rubinetto manuale, un'automazione o Smart Irrigation stesso quando il controllo diretto della valvola è attivo), il secchio viene accreditato in base al tempo di funzionamento e alla portata della zona. Necessario per le funzioni ad anello chiuso.","flow-sensor":"Contatore di volume cumulativo","flow-sensor-hint":"Per un accredito esatto invece di portata x tempo: un totale cumulativo del contatore d'acqua (classe di stato total_increasing), non una portata istantanea. L'unità viene letta automaticamente (L, mL, m³, gal, ft³).",optional:"opzionale"},no_items:"Non ci sono ancora zone definite.",title:"Zone"}},Ii="Smart Irrigation",Li={title:"Trigger di avvio irrigazione",description:"Configura quando deve iniziare l'irrigazione in base agli eventi solari. Puoi aggiungere più trigger per programmi diversi. Per i trigger all'alba, lasciando lo scostamento a 0 verrà usata automaticamente la durata totale di tutte le zone attive.",usage_before:"Quando un trigger scatta, Smart Irrigation emette l'evento ",usage_after:" — ascoltalo in un'automazione per avviare l'irrigazione. I dati dell'evento includono trigger_name, trigger_type e offset_minutes, così puoi reagire in modo diverso per ogni trigger. Le impostazioni di salto per precipitazioni e di giorni tra le irrigazioni continuano ad applicarsi: in un giorno di salto non viene emesso alcun evento.",add_trigger:"Aggiungi trigger",edit_trigger:"Modifica trigger",delete_trigger:"Elimina trigger",trigger_types:{sunrise:"Alba",sunset:"Tramonto",solar_azimuth:"Azimut solare"},fields:{name:{name:"Nome del trigger",description:"Un nome descrittivo per identificare questo trigger"},type:{name:"Tipo di trigger",description:"Il tipo di evento solare su cui attivare il trigger"},enabled:{name:"Attivato",description:"Se questo trigger è attualmente attivo"},offset_minutes:{name:"Scostamento (minuti)",description:"Minuti prima (-) o dopo (+) l'evento solare. Per i trigger all'alba, usa 0 per una temporizzazione automatica basata sulla durata totale delle zone."},azimuth_angle:{name:"Angolo di azimut (gradi)",description:"Angolo di azimut solare in gradi, dove 0=Nord, 90=Est, 180=Sud, 270=Ovest"},account_for_duration:{name:"Considera la durata",description:"Se attivato, l'irrigazione inizierà abbastanza presto da terminare all'ora indicata. Se disattivato, l'irrigazione inizierà esattamente all'ora indicata."}},dialog:{add_title:"Aggiungi trigger di avvio irrigazione",edit_title:"Modifica trigger di avvio irrigazione",cancel:"Annulla",save:"Salva",delete:"Elimina",help:"Quando questo trigger scatta, Smart Irrigation emette il seguente evento — usalo in un'automazione per avviare l'irrigazione. I dati dell'evento includono il nome di questo trigger (e tipo/scostamento), così puoi reagire in modo specifico:"},no_triggers:"Nessun trigger di avvio irrigazione configurato. Il sistema userà il comportamento predefinito (alba con la durata totale delle zone). Aggiungi trigger per personalizzare quando inizia l'irrigazione.",offset_auto:"Auto (calcolato dalla durata totale delle zone)",confirm_delete:'Vuoi davvero eliminare il trigger "{name}"?',validation:{name_required:"Il nome del trigger è obbligatorio",azimuth_invalid:"L'angolo di azimut deve essere un numero valido"},help:{sunrise_offset:"Per i trigger all'alba: usa valori negativi per iniziare prima dell'alba, positivi per iniziare dopo. Imposta 0 per iniziare automaticamente abbastanza presto da completare tutte le zone prima dell'alba.",sunset_offset:"Per i trigger al tramonto: usa valori negativi per iniziare prima del tramonto, positivi per iniziare dopo il tramonto.",azimuth_explanation:"L'azimut solare è la direzione bussola del sole. 0°=Nord, 90°=Est, 180°=Sud, 270°=Ovest. Puoi inserire qualsiasi valore di angolo (es. 450°=90°, -30°=330°). Usalo per avviare l'irrigazione quando il sole raggiunge una posizione specifica.",multiple_triggers:"Puoi configurare più trigger. Ogni trigger attivo pianificherà gli avvii di irrigazione in modo indipendente."},active_label:"Trigger attivo",active_default:"Predefinito (alba meno la durata totale dell'irrigazione)",active_hint:"Solo il trigger selezionato avvia l'irrigazione, quindi viene eseguita una volta al giorno. \"Predefinito\" calcola l'irrigazione in modo che termini esattamente all'alba. Aggiungi trigger personalizzati (tramonto, azimut, scostamenti) qui sotto, poi selezionane uno qui."},Bi={title:"Salto dell'irrigazione in base al meteo",description:"Salta automaticamente l'irrigazione quando sono previste precipitazioni. Questa funzione richiede un servizio meteo configurato.",threshold_label:"Soglia di precipitazione",threshold_description:"Quantità minima di precipitazioni (in mm) prevista per oggi e domani per saltare l'irrigazione."},Ui={title:"Coordinate di Posizione",description:"Configura le coordinate di posizione per il recupero dei dati meteorologici. Puoi usare coordinate manuali diverse dalla tua posizione Home Assistant se necessario.",manual_enabled:"Usa coordinate manuali",use_ha_location:"Usa posizione di Home Assistant",latitude:"Latitudine (gradi decimali)",longitude:"Longitudine (gradi decimali)",elevation:"Elevazione (metri sul livello del mare)",current_ha_coords:"Coordinate attuali di Home Assistant"},Ri={title:"Giorni Tra Irrigazioni",description:"Configura il numero minimo di giorni che devono passare tra gli eventi di irrigazione. Questo aiuta a controllare la frequenza di irrigazione per la conservazione dell'acqua e la gestione della salute delle piante.\n\nCasi d'uso tipici:\n• Cura del prato: intervalli di 1-2 giorni prevengono l'eccesso di irrigazione\n• Restrizioni di siccità: intervalli di 6+ giorni per irrigazione settimanale\n• Piante a radici profonde: intervalli di 3-7 giorni per irrigazione meno frequente\n• Conservazione dell'acqua: personalizzabile in base al clima e alle condizioni del suolo",label:"Giorni minimi tra irrigazioni",help_text:"Imposta a 0 per disabilitare questa funzione. Sono supportati valori da 1-365 giorni. Questa impostazione funziona insieme alla logica di previsione delle precipitazioni esistente."},Vi={title:"Irrigazione osservata (anello chiuso)",description:"Accredita automaticamente il secchio di ogni zona in base all'irrigazione reale, invece di azzerare il secchio da un'automazione. Una volta attivato, scegli un'entità valvola/interruttore per ogni zona nella scheda Zone: mentre è aperta, il secchio viene accreditato in base al tempo di funzionamento e alla portata della zona. Per una contabilità esatta puoi anche scegliere un contatore di volume cumulativo (un totale in stile contatore d'acqua) per ogni zona, e viene utilizzato il volume misurato. Importante: quando questa opzione è attiva, è l'unica cosa che accredita il secchio, quindi rimuovi qualsiasi chiamata reset_bucket dalla tua automazione di irrigazione per evitare doppi conteggi.",enabled_label:"Attiva l'irrigazione osservata",direct_control_label:"Consenti a Smart Irrigation di controllare la valvola",direct_control_description:"Quando è attivo, Smart Irrigation apre la valvola collegata di ogni zona, attende la durata calcolata, poi la chiude - nessuna automazione necessaria. Un'irrigazione in corso riprende dopo un riavvio. Sicurezza: se Home Assistant si arresta a lungo durante un'irrigazione, la valvola rimane aperta e continua a irrigare, quindi dota la tua valvola di una protezione hardware (un tempo di funzionamento massimo).",sequencing_label:"Sequenza delle zone",sequencing:{sequential:"Sequenziale (una zona alla volta)",parallel:"Parallelo (tutte le zone contemporaneamente)"}},qi={common:Oi,defaults:Ni,module:Pi,calcmodules:Ci,panels:Hi,title:Ii,irrigation_start_triggers:Li,weather_skip:Bi,coordinate_config:Ui,days_between_irrigation:Ri,observed_watering:Vi},Fi=Object.freeze({__proto__:null,calcmodules:Ci,common:Oi,coordinate_config:Ui,days_between_irrigation:Ri,default:qi,defaults:Ni,irrigation_start_triggers:Li,module:Pi,observed_watering:Vi,panels:Hi,title:Ii,weather_skip:Bi}),Wi={loading:"Laden",saving:"Opslaan",actions:{delete:"Verwijderen"},labels:{module:"Module",no:"Nee",select:"Kies",yes:"Ja",enabled:"Ingeschakeld",disabled:"Uitgeschakeld",before:"voor",after:"na"},units:{seconds:"seconden"},attributes:{size:"afmeting",throughput:"doorvoer",state:"status",bucket:"bucket",last_updated:"laatst bijgewerkt",last_calculated:"laatst berekend",number_of_data_points:"aantal gegevenspunten"},"loading-messages":{configuration:"Configuratie laden…",modules:"Modules laden…",general:"Laden…"},"saving-messages":{adding:"Toevoegen…",saving:"Opslaan…"}},Gi={"default-zone":"Standaard zone","default-mapping":"Standaard sensorgroep"},Yi={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"NB: in deze uitleg wordt de '.' as decimaalscheidingsteken gebruikt, worden afgeronde en metrische getallen getoond. Module berekende ET waarde van","bucket-was":"Voorraad was","new-bucket-values-is":"Nieuwe voorraad is",bucket:"voorraad","old-bucket-variable":"oude_voorraad","max-bucket-variable":"max_bucket",delta:"verandering","bucket-less-than-zero-irrigation-necessary":"Omdat de voorraad < 0 is, is irrigatie nodig","steps-taken-to-calculate-duration":"On de exacte duur te berekenen werd het volgende gedaan","precipitation-rate-defined-as":"De neerslag is","duration-is-calculated-as":"De duur is",drainage:"drainage","drainage-rate":"drainage_rate",hours:"uur","precipitation-rate-variable":"neerslag","multiplier-is-applied":"De vermenigvuldiger wordt toegepast. Deze is","duration-after-multiplier-is":"dus de duur is","maximum-duration-is-applied":"De maximum duur wordt toegepast. Deze is","duration-after-maximum-duration-is":"dus de duur is","lead-time-is-applied":"As laatste wordt de aanlooptijd toegepast. Deze is","duration-after-lead-time-is":"dus de uiteindelijke duur is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Omdat de voorraad >= 0 is er geen irrigatie nodig en is de duur gelijk aan","maximum-bucket-is":"maximale voorraad grootte is","drainage-rate-is":"De afvoersnelheid bij verzadiging (bucket op max) is","current-drainage-is":"De huidige afvoer wordt berekend als","no-drainage":"De huidige afvoer is 0 omdat"}}},Zi={pyeto:{description:"Bereken duur op basis van de FAU56 formule en de PyETO library"},static:{description:"Module met instelbare verandering"},passthrough:{description:"Geeft waarde van ET sensor as verandering terug"}},Ki={weatherservice:{title:"Weerdienst",description:"Bekijk en wijzig de weerdienst die wordt gebruikt om weergegevens op te halen — zonder de integratie opnieuw te installeren. De API-sleutel wordt gevalideerd en de wijziging wordt direct toegepast.",labels:{"use-weather-service":"Een weerdienst gebruiken",service:"Weerdienst","api-key":"API-sleutel"},actions:{save:"Opslaan",saving:"Opslaan…"},messages:{"no-service":"Er wordt geen weerdienst gebruikt — de weergegevens komen alleen van je eigen sensoren.",saved:"Weerdienst bijgewerkt en toegepast.","reload-note":"Bij het opslaan wordt de API-sleutel bij de dienst gevalideerd en de wijziging direct toegepast."}},backuprestore:{title:"Back-up / herstel",description:"Exporteer de volledige Smart Irrigation-configuratie naar een JSON-bestand, of herstel deze vanuit een eerdere back-up.",cards:{backup:{title:"Back-up",description:"Download de volledige configuratie (algemene instellingen, zones, modules en sensorgroepen) als JSON-bestand."},restore:{title:"Herstellen",description:"Laad een eerder geëxporteerd JSON-bestand om de huidige configuratie te vervangen."}},actions:{export:"Exporteren naar JSON","choose-file":"Kies een back-upbestand…",restore:"Deze back-up herstellen",restoring:"Herstellen…"},messages:{exported:"Back-upbestand gedownload.",restored:"Configuratie hersteld — integratie wordt herladen.","invalid-file":"Dit bestand is geen geldige Smart Irrigation-back-up.","confirm-title":"De volledige configuratie vervangen?",summary:"Deze back-up bevat","confirm-warning":"Herstellen overschrijft alle huidige algemene instellingen, zones, modules en sensorgroepen. Dit kan niet ongedaan worden gemaakt.","reload-note":"Herstellen vervangt alles en herlaadt de integratie om de wijziging toe te passen."}},general:{cards:{"automatic-duration-calculation":{header:"Automatische berekening van irrigatietijd",description:"Bij het berekenen wordt de verzamelde weersinformatie gebruikt om the voorraad en irrigatieduur per zone aan te passen. Daarna wordt de verzamelde weersinformatie verwijderd.",labels:{"auto-calc-enabled":"Automatisch irrigatietijd berekening voor elke zone","calc-time":"Berekenen om"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Let op: het automatisch bijwerken van weersinformatie vind plaats op of na de automatische berekening van irrigatietijd"},header:"Automatisch bijwerken van weersinformatie",description:"Verzamel en bewaar weersinformatie automatisch. Weersinformatie is nodig om vorraad en irrigatieduur per zone te berekenen.",labels:{"auto-update-enabled":"Automatisch weersinformatie bijwerken","auto-update-schedule":"Updateschema","auto-update-time":"Bijwerken om","auto-update-interval":"Sensor data bijwerken elke","auto-update-delay":"Vertraging"},options:{minutes:"minuten",hours:"uren",days:"dagen"}},"automatic-clear":{header:"Automatisch weersinformatie opruimen",description:"Verwijder weersinformatie op het ingestelde moment. Dit zorgt ervoor dat er geen weersinformatie van de vorige dag gebruikt kan worden voor berekeningen. Let op: verwijder geen weersinformatie voordat de berekening heeft plaatsgevonden. Gebruik deze optie als je verwacht dat er weersinformatie zal worden verzameld nadat de berekeningen voor de dag gedaan zijn. Verwijder weersinformatie zo laat mogelijk op de dag.",labels:{"automatic-clear-enabled":"Automatisch weersinformatie verwijderen","automatic-clear-time":"Verwijder weersinformatie om"}},continuousupdates:{header:"Continue updates voor sensoren (experimenteel)",description:"Deze experimentele functie werkt de sensorgegevens continu bij. Dit is handig voor sensorgroepen die bronnen met continue gegevens gebruiken, zoals weerstations. Deze functie kan niet worden gebruikt voor sensorgroepen die ten minste deels afhankelijk zijn van weerdiensten, omdat continu pollen van API's kosten met zich meebrengt. Houd er rekening mee dat dit experimenteel is en mogelijk niet werkt zoals verwacht. Gebruik op eigen risico.",labels:{continuousupdates:"Continue updates inschakelen",sensor_debounce:"Sensor-debounce"}}},description:"Dit zijn de algemene instellingen.",title:"Algemeen"},help:{title:"Hulp",cards:{"how-to-get-help":{title:"Hulp vragen","first-read-the":"Allereerst, lees de",wiki:"Wiki","if-you-still-need-help":"Als je hierna nog steeds hulp nodig hebt, laat een bericht achter op het","community-forum":"Community forum","or-open-a":"of open een","github-issue":"Github Issue","english-only":"alleen Engels"}}},info:{title:"Info",description:"Bekijk informatie over de volgende irrigatie en de systeemstatus.","configuration-not-available":"Configuratie niet beschikbaar.",cards:{"zone-bucket-values":{title:"Bucketwaarden en duur per zone",labels:{bucket:"Bucket",duration:"Duur"},"no-zones":"Geen zones geconfigureerd"},"next-irrigation":{title:"Volgende irrigatie",labels:{"next-start":"Volgende start",duration:"Duur",zones:"Zones"},"no-data":"Geen gegevens beschikbaar"},"irrigation-reason":{title:"Reden voor irrigatie",labels:{reason:"Reden",sunrise:"Zonsopgang","total-duration":"Totale duur",explanation:"Uitleg"},"no-data":"Geen gegevens beschikbaar"}}},mappings:{cards:{"add-mapping":{actions:{add:"Toevoegen"},header:"Voeg sensorgroep toe"},mapping:{aggregates:{average:"Gemiddelde",first:"Eerste",last:"Laatste",maximum:"Maximum",median:"Mediaan",minimum:"Minimum",riemannsum:"Riemann-som",sum:"Totaal",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt.",invalid_source:"Ongeldige bron",source_does_not_exist:'De bron bestaat niet. Voer een geldige bron in, zoals "sensor.mysensor".'},items:{dewpoint:"Dauwpunt",evapotranspiration:"Verdamping",humidity:"Vochtigheid","maximum temperature":"Maximum temperatuur","minimum temperature":"Minimum temperatuur",precipitation:"Totale neerslag","current precipitation":"Huidige neerslag",pressure:"Druk","solar radiation":"Zonnestraling",temperature:"Temperatuur",windspeed:"Wind snelheid"},pressure_types:{absolute:"absoluut",relative:"relatief"},"pressure-type":"Druk is","sensor-aggregate-of-sensor-values-to-calculate":"van de sensor waardes om irrigatietijd te berekenen","sensor-aggregate-use-the":"Gebruik de/het","sensor-entity":"Sensor entiteit",static_value:"Waarde","input-units":"Invoer geeft waardes in",source:"Bron",sources:{none:"Geen",weather_service:"Weather service",sensor:"Sensor",static:"Vaste waarde"}}},description:"Voeg een of meer sensorgroepen toe die weergegevens ophalen van Weather service, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",labels:{"mapping-name":"Name"},no_items:"Er zijn nog geen sensorgroepen.",title:"Sensorgroepen","weather-records":{title:"Weerregistraties (laatste 10)",timestamp:"Tijd",temperature:"Temp.",humidity:"Vochtigheid",precipitation:"Neersl.","retrieval-time":"Opgehaald","no-data":"Geen weergegevens beschikbaar voor deze sensorgroep"}},modules:{cards:{"add-module":{actions:{add:"Toevoegen"},header:"Voeg module toe"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."},labels:{configuration:"Instellingen",required:"verplicht veld"},"translated-options":{DontEstimate:"Niet berekenen",EstimateFromSunHours:"Gebaseerd op zon uren",EstimateFromTemp:"Gebaseerd op temperatuur",EstimateFromSunHoursAndTemperature:"Schatten op basis van het gemiddelde van zonuren en temperatuur"}}},description:"Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones.",no_items:"Er zijn nog geen modules.",title:"Modules"},zones:{actions:{add:"Toevoegen",calculate:"Bereken",information:"Informatie",update:"Bijwerken","reset-bucket":"Leeg voorraad","view-weather-info":"Weergegevens bekijken","view-weather-info-message":"Weergegevens beschikbaar voor","view-watering-calendar":"Irrigatiekalender bekijken"},cards:{"add-zone":{actions:{add:"Toevoegen"},header:"Voeg zone toe"},"zone-actions":{actions:{"calculate-all":"Bereken alle zones","update-all":"Werk alle zone data bij","reset-all-buckets":"Leeg alle voorraden","clear-all-weatherdata":"Verwijder alle weersinformatie"},header:"Acties voor alle zones"}},description:"Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",labels:{bucket:"Voorraad",duration:"Irrigatieduur","lead-time":"Aanlooptijd",mapping:"Sensorgroep","maximum-duration":"Maximale duur",multiplier:"Vermenigvuldiger",name:"Naam",size:"Afmeting",state:"Status",states:{automatic:"Automatisch",disabled:"Uit",manual:"Manueel"},throughput:"Doorvoer","maximum-bucket":"Maximale voorraad",last_calculated:"Berekend op","data-last-updated":"Bijgewerkt op","data-number-of-data-points":"Aantal datapunten",drainage_rate:"Afvoersnelheid","linked-entity":"Gekoppelde klep/schakelaar","linked-entity-hint":"De klep of schakelaar die deze zone bewatert. Telkens als die actief is (een handmatige kraan, een automatisering of Smart Irrigation zelf wanneer directe klepbesturing aanstaat), wordt de bucket bijgewerkt op basis van de looptijd en de doorvoer van de zone. Vereist voor de closed-loop-functies.","flow-sensor":"Cumulatieve volumemeter","flow-sensor-hint":"Voor exacte verrekening in plaats van doorvoer x tijd: een cumulatief watermetertotaal (state class total_increasing), geen momentaan debiet. De eenheid wordt automatisch uitgelezen (L, mL, m³, gal, ft³).",optional:"optioneel"},no_items:"Er zijn nog geen zones.",title:"Zones"}},Ji="Smart Irrigation",Qi={title:"Irrigatiestart-triggers",description:"Stel in wanneer de irrigatie moet starten op basis van zonne-evenementen. Je kunt meerdere triggers toevoegen voor verschillende schema's. Bij zonsopgang-triggers wordt met een offset van 0 automatisch de totale duur van alle ingeschakelde zones gebruikt.",usage_before:"Wanneer een trigger afgaat, zendt Smart Irrigation de gebeurtenis ",usage_after:" — luister ernaar in een automatisering om de irrigatie te starten. De gebeurtenisgegevens bevatten trigger_name, trigger_type en offset_minutes, zodat je per trigger anders kunt reageren. De instellingen voor overslaan bij neerslag en dagen tussen irrigaties blijven gelden: op een overslagdag wordt geen gebeurtenis verzonden.",add_trigger:"Trigger toevoegen",edit_trigger:"Trigger bewerken",delete_trigger:"Trigger verwijderen",trigger_types:{sunrise:"Zonsopgang",sunset:"Zonsondergang",solar_azimuth:"Zonne-azimut"},fields:{name:{name:"Triggernaam",description:"Een beschrijvende naam om deze trigger te identificeren"},type:{name:"Triggertype",description:"Het type zonne-evenement waarop wordt getriggerd"},enabled:{name:"Ingeschakeld",description:"Of deze trigger momenteel actief is"},offset_minutes:{name:"Offset (minuten)",description:"Minuten vóór (-) of na (+) het zonne-evenement. Gebruik bij zonsopgang-triggers 0 voor automatische timing op basis van de totale zoneduur."},azimuth_angle:{name:"Azimuthoek (graden)",description:"Zonne-azimuthoek in graden, waarbij 0=Noord, 90=Oost, 180=Zuid, 270=West"},account_for_duration:{name:"Rekening houden met duur",description:"Indien ingeschakeld start de irrigatie vroeg genoeg om op het opgegeven tijdstip klaar te zijn. Indien uitgeschakeld start de irrigatie precies op het opgegeven tijdstip."}},dialog:{add_title:"Irrigatiestart-trigger toevoegen",edit_title:"Irrigatiestart-trigger bewerken",cancel:"Annuleren",save:"Opslaan",delete:"Verwijderen",help:"Wanneer deze trigger afgaat, zendt Smart Irrigation de volgende gebeurtenis uit — gebruik die in een automatisering om de irrigatie te starten. De gebeurtenisgegevens bevatten de naam van deze trigger (en het type/de offset), zodat je er specifiek op kunt reageren:"},no_triggers:"Geen irrigatiestart-triggers geconfigureerd. Het systeem gebruikt het standaardgedrag (zonsopgang met de totale zoneduur). Voeg triggers toe om aan te passen wanneer de irrigatie start.",offset_auto:"Auto (berekend uit de totale zoneduur)",confirm_delete:'Weet je zeker dat je de trigger "{name}" wilt verwijderen?',validation:{name_required:"De triggernaam is verplicht",azimuth_invalid:"De azimuthoek moet een geldig getal zijn"},help:{sunrise_offset:"Voor zonsopgang-triggers: gebruik negatieve waarden om vóór zonsopgang te starten, positieve om erna te starten. Stel in op 0 om automatisch vroeg genoeg te starten zodat alle zones vóór zonsopgang klaar zijn.",sunset_offset:"Voor zonsondergang-triggers: gebruik negatieve waarden om vóór zonsondergang te starten, positieve om na zonsondergang te starten.",azimuth_explanation:"Het zonne-azimut is de kompasrichting van de zon. 0°=Noord, 90°=Oost, 180°=Zuid, 270°=West. Je kunt elke hoekwaarde invoeren (bijv. 450°=90°, -30°=330°). Gebruik dit om de irrigatie te starten wanneer de zon een specifieke positie bereikt.",multiple_triggers:"Je kunt meerdere triggers configureren. Elke ingeschakelde trigger plant irrigatiestarts onafhankelijk."},active_label:"Actieve trigger",active_default:"Standaard (zonsopkomst min totale bewateringsduur)",active_hint:'Alleen de geselecteerde trigger start de irrigatie, zodat die eenmaal per dag draait. "Standaard" plant de beurt zo dat hij precies bij zonsopkomst klaar is. Voeg hieronder aangepaste triggers toe (zonsondergang, azimut, offsets) en kies er hier vervolgens één.'},Xi={title:"Weergebaseerd overslaan van irrigatie",description:"Sla de irrigatie automatisch over wanneer neerslag wordt voorspeld. Voor deze functie moet een weerdienst zijn geconfigureerd.",threshold_label:"Neerslagdrempel",threshold_description:"Minimale hoeveelheid neerslag (in mm) die voor vandaag en morgen wordt voorspeld om de irrigatie over te slaan."},en={title:"Locatie Coördinaten",description:"Configureer locatie coördinaten voor het ophalen van weergegevens. Je kunt handmatige coördinaten gebruiken die verschillen van je Home Assistant locatie indien nodig.",manual_enabled:"Handmatige coördinaten gebruiken",use_ha_location:"Home Assistant locatie gebruiken",latitude:"Breedtegraad (decimale graden)",longitude:"Lengtegraad (decimale graden)",elevation:"Hoogte (meters boven zeeniveau)",current_ha_coords:"Huidige Home Assistant coördinaten"},an={title:"Dagen Tussen Irrigaties",description:"Configureer het minimum aantal dagen dat moet verstrijken tussen irrigatie gebeurtenissen. Dit helpt bij het controleren van de bevloeiingsfrequentie voor waterbesparing en plantgezondheid beheer.\n\nTypische gebruikssituaties:\n• Gazonverzorging: 1-2 dag intervallen voorkomen overbewatering\n• Droogte beperkingen: 6+ dag intervallen voor wekelijkse bewatering\n• Diepwortelende planten: 3-7 dag intervallen voor minder frequente bewatering\n• Waterbesparing: aanpasbaar op basis van klimaat en bodemcondities",label:"Minimum dagen tussen irrigaties",help_text:"Stel in op 0 om deze functie uit te schakelen. Waarden van 1-365 dagen worden ondersteund. Deze instelling werkt samen met de bestaande neerslagvoorspelling logica."},tn={title:"Waargenomen bewatering (closed loop)",description:"Werk de bucket van elke zone automatisch bij op basis van echte irrigatie, in plaats van de bucket te resetten vanuit een automatisering. Zodra dit is ingeschakeld, kies je per zone een klep/schakelaar-entiteit op het tabblad Zones: zolang die open is, wordt de bucket bijgewerkt op basis van de looptijd en de doorvoer van de zone. Voor exacte verrekening kun je ook per zone een cumulatieve volumemeter kiezen (een watermetertotaal), en dan wordt het gemeten volume gebruikt. Belangrijk: als dit aanstaat, is het het enige dat de bucket bijwerkt, dus verwijder elke reset_bucket-aanroep uit je irrigatie-automatisering om dubbeltelling te voorkomen.",enabled_label:"Waargenomen bewatering inschakelen",direct_control_label:"Smart Irrigation de klep laten besturen",direct_control_description:"Wanneer dit aanstaat, opent Smart Irrigation de gekoppelde klep van elke zone, wacht de berekende duur af en sluit hem daarna - geen automatisering nodig. Een lopende beurt wordt na een herstart hervat. Veiligheid: als Home Assistant lange tijd uitvalt midden in een beurt, blijft de klep open en blijft hij bewateren, dus geef je klep een hardwarematige beveiliging (een maximale looptijd).",sequencing_label:"Volgorde van zones",sequencing:{sequential:"Sequentieel (één zone tegelijk)",parallel:"Parallel (alle zones tegelijk)"}},nn={common:Wi,defaults:Gi,module:Yi,calcmodules:Zi,panels:Ki,title:Ji,irrigation_start_triggers:Qi,weather_skip:Xi,coordinate_config:en,days_between_irrigation:an,observed_watering:tn},rn=Object.freeze({__proto__:null,calcmodules:Zi,common:Wi,coordinate_config:en,days_between_irrigation:an,default:nn,defaults:Gi,irrigation_start_triggers:Qi,module:Yi,observed_watering:tn,panels:Ki,title:Ji,weather_skip:Xi}),sn={loading:"Laster",saving:"Lagrer",actions:{delete:"Slett"},labels:{module:"Modul",no:"Nei",select:"Velg",yes:"Ja",enabled:"Aktivert",disabled:"Deaktivert",before:"før",after:"etter"},units:{seconds:"sekunder"},attributes:{size:"størrelse",throughput:"kapasitet",state:"status",bucket:"bucket",last_updated:"sist oppdatert",last_calculated:"sist beregnet",number_of_data_points:"antall datapunkter"},"loading-messages":{configuration:"Laster konfigurasjon…",modules:"Laster moduler…",general:"Laster…"},"saving-messages":{adding:"Legger til…",saving:"Lagrer…"}},on={"default-zone":"Standard sone","default-mapping":"Standard sensorguppe"},ln={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Merk: Denne forklaringen bruker '.' som desimaltegn og viser avrundede verdier. Modulen returnerte evapotranspirasjonsunderskudd på","bucket-was":"Bucket var","new-bucket-values-is":"Ny bucket verdien er",bucket:"bucket","old-bucket-variable":"gammel_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Siden bucket < 0, Vanning er nødvendig.","steps-taken-to-calculate-duration":"For å beregne nøyaktig varighet, ble følgende trinn utført","precipitation-rate-defined-as":"Nedbørshastigheten er definert som","duration-is-calculated-as":"Varigheten beregnes som",drainage:"drainage","drainage-rate":"drainage_rate",hours:"timer","precipitation-rate-variable":"nedbørshastighet","multiplier-is-applied":"Nå blir multiplikatoren brukt. Multiplikatoren er","duration-after-multiplier-is":"derfor er varigheten","maximum-duration-is-applied":"Deretter blir den maksimale varigheten brukt. Den maksimale varigheten er","duration-after-maximum-duration-is":"derfor er varigheten","lead-time-is-applied":"Til slutt blir ledetiden brukt. Ledetiden er","duration-after-lead-time-is":"derfor er den endelige varigheten","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Siden bucket >= 0, Ingen vanning er nødvendig, og varigheten er satt til","maximum-bucket-is":"maksimum bucket stærrelse er","drainage-rate-is":"Dreneringsraten ved metning (bucket på maks) er","current-drainage-is":"Nåværende drenering beregnes som","no-drainage":"Nåværende drenering er 0 fordi"}}},dn={pyeto:{description:"Beregn varigheten basert på FAO56-beregningen fra PyETO-biblioteket"},static:{description:"'Dummy'-modul med en statisk konfigurerbar endring (delta)"},passthrough:{description:"En 'Passthrough'-modul som returnerer verdien av en Evapotranspiration-sensor som delta"}},un={weatherservice:{title:"Værtjeneste",description:"Vis og endre værtjenesten som brukes til å hente værdata — uten å installere integrasjonen på nytt. API-nøkkelen valideres og endringen brukes umiddelbart.",labels:{"use-weather-service":"Bruk en værtjeneste",service:"Værtjeneste","api-key":"API-nøkkel"},actions:{save:"Lagre",saving:"Lagrer…"},messages:{"no-service":"Ingen værtjeneste brukes — værdataene kommer kun fra dine egne sensorer.",saved:"Værtjeneste oppdatert og tatt i bruk.","reload-note":"Når du lagrer, valideres API-nøkkelen mot tjenesten og endringen brukes umiddelbart."}},backuprestore:{title:"Sikkerhetskopiering / gjenoppretting",description:"Eksporter hele Smart Irrigation-konfigurasjonen til en JSON-fil, eller gjenopprett den fra en tidligere sikkerhetskopi.",cards:{backup:{title:"Sikkerhetskopi",description:"Last ned hele konfigurasjonen (generelle innstillinger, soner, moduler og sensorgrupper) som en JSON-fil."},restore:{title:"Gjenopprett",description:"Last inn en tidligere eksportert JSON-fil for å erstatte den nåværende konfigurasjonen."}},actions:{export:"Eksporter til JSON","choose-file":"Velg en sikkerhetskopifil…",restore:"Gjenopprett denne sikkerhetskopien",restoring:"Gjenoppretter…"},messages:{exported:"Sikkerhetskopifil lastet ned.",restored:"Konfigurasjon gjenopprettet — laster integrasjonen på nytt.","invalid-file":"Denne filen er ikke en gyldig Smart Irrigation-sikkerhetskopi.","confirm-title":"Erstatte hele konfigurasjonen?",summary:"Denne sikkerhetskopien inneholder","confirm-warning":"Gjenoppretting overskriver alle nåværende generelle innstillinger, soner, moduler og sensorgrupper. Dette kan ikke angres.","reload-note":"Gjenoppretting erstatter alt og laster integrasjonen på nytt for å bruke endringen."}},general:{cards:{"automatic-duration-calculation":{header:"Automatisk varighetsberegning",description:"Beregningen tar de innsamlede værdataene frem til det tidspunktet og oppdaterer bucket for hver automatiske sone. Deretter justeres varigheten basert på den nye bucket-verdien, og de innsamlede værdataene fjernes.",labels:{"auto-calc-enabled":"Beregn sonevarigheter automatisk","calc-time":"Beregn kl."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Advarsel: Oppdateringstidspunkt for værdata på eller etter beregningstidspunktet"},header:"Automatisk oppdatering av værdata",description:"Samle inn og lagre værdata automatisk. Værdata kreves for å beregne sone-buckets og varigheter.",labels:{"auto-update-enabled":"Oppdater værdata automatisk","auto-update-schedule":"Oppdateringsplan","auto-update-time":"Oppdater kl.","auto-update-interval":"Oppdater sensordata hvert","auto-update-delay":"Oppdateringsforsinkelse"},options:{minutes:"minutter",hours:"timer",days:"dager"}},"automatic-clear":{header:"Automatisk opprydding av værdata",description:"Fjern innsamlede værdata automatisk på et konfigurert tidspunkt. Bruk dette for å sikre at det ikke er igjen værdata fra tidligere dager. Ikke fjern værdataene før du beregner, og bruk bare dette alternativet hvis du forventer at den automatiske oppdateringen samler inn værdata etter at du har beregnet for dagen. Ideelt sett bør du rydde så sent på dagen som mulig.",labels:{"automatic-clear-enabled":"Slett innsamlede værdata automatisk","automatic-clear-time":"Slett værdata kl."}},continuousupdates:{header:"Kontinuerlige oppdateringer for sensorer (eksperimentell)",description:"Denne eksperimentelle funksjonen oppdaterer sensordataene kontinuerlig. Dette er nyttig for sensorgrupper som bruker kilder med kontinuerlige data, som værstasjoner. Denne funksjonen kan ikke brukes for sensorgrupper som i det minste delvis er avhengige av værtjenester, ettersom kontinuerlig spørring av API-er medfører kostnader. Husk at dette er eksperimentelt og kanskje ikke fungerer som forventet. Bruk på eget ansvar.",labels:{continuousupdates:"Aktiver kontinuerlige oppdateringer",sensor_debounce:"Sensor-debounce"}}},description:"Denne siden gir globale innstillinger.",title:"Generelt"},help:{title:"Hjelp",cards:{"how-to-get-help":{title:"Hvordan få hjelp","first-read-the":"Først, les",wiki:"Wikien","if-you-still-need-help":"Hvis du fremdeles trenger hjelp, ta kontakt på","community-forum":"Fellesskapsforumet","or-open-a":"eller åpne en","github-issue":"Github-sak","english-only":"Kun på engelsk"}}},info:{title:"Info",description:"Vis informasjon om neste vanning og systemstatus.","configuration-not-available":"Konfigurasjon ikke tilgjengelig.",cards:{"zone-bucket-values":{title:"Bucket-verdier og varighet per sone",labels:{bucket:"Bucket",duration:"Varighet"},"no-zones":"Ingen soner konfigurert"},"next-irrigation":{title:"Neste vanning",labels:{"next-start":"Neste start",duration:"Varighet",zones:"Soner"},"no-data":"Ingen data tilgjengelig"},"irrigation-reason":{title:"Vanningsårsak",labels:{reason:"Årsak",sunrise:"Soloppgang","total-duration":"Total varighet",explanation:"Forklaring"},"no-data":"Ingen data tilgjengelig"}}},mappings:{cards:{"add-mapping":{actions:{add:"Legg til sensorguppe"},header:"Legg til sensorgupper"},mapping:{aggregates:{average:"Gjennomsnitt",first:"Første",last:"Siste",maximum:"Maksimum",median:"Median",minimum:"Minimum",riemannsum:"Riemann-sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Du kan ikke slette denne sensorguppen fordi minst én sone bruker den.",invalid_source:"Ugyldig kilde",source_does_not_exist:'Kilden finnes ikke. Angi en gyldig kilde, for eksempel "sensor.mysensor".'},items:{dewpoint:"Duggpunkt",evapotranspiration:"Evapotranspirasjon",humidity:"Luftfuktighet","maximum temperature":"Maksimumstemperatur","minimum temperature":"Minimumstemperatur",precipitation:"Total nedbør","current precipitation":"Nåværende nedbør",pressure:"Trykk","solar radiation":"Solstråling",temperature:"Temperatur",windspeed:"Vindhastighet"},pressure_types:{absolute:"absolutt",relative:"relativ"},"pressure-type":"Trykket er","sensor-aggregate-of-sensor-values-to-calculate":"av sensordata for å beregne varighet","sensor-aggregate-use-the":"Bruk","sensor-entity":"Sensorenhet",static_value:"Verdi","input-units":"Inndata gir verdier i",source:"Kilde",sources:{none:"Ingen",weather_service:"Weather service",sensor:"Sensor",static:"Statisk verdi"}}},description:"Legg til en eller flere sensorgupper som henter værdata fra Weather service, fra sensorer eller en kombinasjon av disse. Du kan tilordne hver sensorguppe til en eller flere soner",labels:{"mapping-name":"Navn"},no_items:"Det er ingen definerte sensorgupper ennå.",title:"Sensorgupper","weather-records":{title:"Værregistreringer (siste 10)",timestamp:"Tid",temperature:"Temp.",humidity:"Luftfuktighet",precipitation:"Nedbør","retrieval-time":"Hentet","no-data":"Ingen værdata tilgjengelig for denne sensorgruppen"}},modules:{cards:{"add-module":{actions:{add:"Legg til modul"},header:"Legg til modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Du kan ikke slette denne modulen fordi minst én sone bruker den."},labels:{configuration:"Konfigurasjon",required:"indikerer et obligatorisk felt"},"translated-options":{DontEstimate:"Ikke beregn",EstimateFromSunHours:"Beregn fra soltimer",EstimateFromTemp:"Beregn fra temperatur",EstimateFromSunHoursAndTemperature:"Estimer fra gjennomsnittet av soltimer og temperatur"}}},description:"Legg til en eller flere moduler som beregner vanningsvarighet. Hver modul har sin egen konfigurasjon og kan brukes til å beregne varighet for en eller flere soner.",no_items:"Det er ingen definerte moduler ennå.",title:"Moduler"},zones:{actions:{add:"Legg til",calculate:"Beregn",information:"Informasjon",update:"Oppdater","reset-bucket":"Nullstill bøtte","view-weather-info":"Vis værdata","view-weather-info-message":"Værdata tilgjengelig for","view-watering-calendar":"Vis vanningskalender"},cards:{"add-zone":{actions:{add:"Legg til sone"},header:"Legg til sone"},"zone-actions":{actions:{"calculate-all":"Beregn alle soner","update-all":"Oppdater alle soner","reset-all-buckets":"Nullstill alle bøtter","clear-all-weatherdata":"Slett alle værdata"},header:"Handlinger på alle soner"}},description:"Spesifiser en eller flere vanningssoner her. Vanningens varighet beregnes per sone, avhengig av størrelse, gjennomstrømning, tilstand, modul og sensorguppe.",labels:{bucket:"Bøtte",duration:"Varighet","lead-time":"Ledetid",mapping:"Sensorguppe","maximum-duration":"Maksimal varighet",multiplier:"Multiplikator",name:"Navn",size:"Størrelse",state:"Tilstand",states:{automatic:"Automatisk",disabled:"Deaktivert",manual:"Manuell"},throughput:"Gjennomstrømning","maximum-bucket":"Maksimal bøtte",last_calculated:"Sist beregnet","data-last-updated":"Data sist oppdatert","data-number-of-data-points":"Antall datapunkter",drainage_rate:"Dreneringsrate","linked-entity":"Tilknyttet ventil/bryter","linked-entity-hint":"Ventilen eller bryteren som vanner denne sonen. Hver gang den kjører (en manuell kran, en automasjon, eller Smart Irrigation selv når direkte ventilstyring er på), krediteres bucketen ut fra kjøretiden og sonens kapasitet. Påkrevd for funksjonene med lukket sløyfe.","flow-sensor":"Kumulativ volummåler","flow-sensor-hint":"For nøyaktig kreditering i stedet for kapasitet x tid: en kumulativ vannmålertotal (tilstandsklasse total_increasing), ikke en momentan strømningshastighet. Enheten leses automatisk (L, mL, m³, gal, ft³).",optional:"valgfritt"},no_items:"Det er ingen definerte soner ennå.",title:"Soner"}},cn="Smart Irrigation",pn={title:"Utløsere for vanningsstart",description:"Konfigurer når vanningen skal starte basert på solhendelser. Du kan legge til flere utløsere for ulike tidsplaner. For soloppgangsutløsere brukes den totale varigheten av alle aktiverte soner automatisk når forskyvningen står på 0.",usage_before:"Når en utløser utløses, sender Smart Irrigation hendelsen ",usage_after:" — lytt etter den i en automasjon for å starte vanning. Hendelsesdataene inneholder trigger_name, trigger_type og offset_minutes, slik at du kan reagere ulikt per utløser. Innstillingene for nedbørshopp og dager mellom vanninger gjelder fortsatt: på en hoppdag sendes ingen hendelse.",add_trigger:"Legg til utløser",edit_trigger:"Rediger utløser",delete_trigger:"Slett utløser",trigger_types:{sunrise:"Soloppgang",sunset:"Solnedgang",solar_azimuth:"Solazimut"},fields:{name:{name:"Utløsernavn",description:"Et beskrivende navn for å identifisere denne utløseren"},type:{name:"Utløsertype",description:"Typen solhendelse som skal utløse"},enabled:{name:"Aktivert",description:"Om denne utløseren er aktiv for øyeblikket"},offset_minutes:{name:"Forskyvning (minutter)",description:"Minutter før (-) eller etter (+) solhendelsen. For soloppgangsutløsere bruk 0 for automatisk timing basert på total sonevarighet."},azimuth_angle:{name:"Azimutvinkel (grader)",description:"Solazimutvinkel i grader, der 0=Nord, 90=Øst, 180=Sør, 270=Vest"},account_for_duration:{name:"Ta hensyn til varighet",description:"Når aktivert starter vanningen tidlig nok til å være ferdig til angitt tidspunkt. Når deaktivert starter vanningen nøyaktig på angitt tidspunkt."}},dialog:{add_title:"Legg til utløser for vanningsstart",edit_title:"Rediger utløser for vanningsstart",cancel:"Avbryt",save:"Lagre",delete:"Slett",help:"Når denne utløseren utløses, sender Smart Irrigation følgende hendelse — bruk den i en automasjon for å starte vanning. Hendelsesdataene inneholder navnet på denne utløseren (samt type/forskyvning), slik at du kan reagere spesifikt på den:"},no_triggers:"Ingen utløsere for vanningsstart er konfigurert. Systemet bruker standardatferden (soloppgang med total sonevarighet). Legg til utløsere for å tilpasse når vanningen starter.",offset_auto:"Auto (beregnet fra total sonevarighet)",confirm_delete:'Er du sikker på at du vil slette utløseren "{name}"?',validation:{name_required:"Utløsernavn er påkrevd",azimuth_invalid:"Azimutvinkelen må være et gyldig tall"},help:{sunrise_offset:"For soloppgangsutløsere: bruk negative verdier for å starte før soloppgang, positive for å starte etter. Sett til 0 for å starte automatisk tidlig nok til å fullføre alle soner før soloppgang.",sunset_offset:"For solnedgangsutløsere: bruk negative verdier for å starte før solnedgang, positive for å starte etter solnedgang.",azimuth_explanation:"Solazimut er solens kompassretning. 0°=Nord, 90°=Øst, 180°=Sør, 270°=Vest. Du kan angi en hvilken som helst vinkelverdi (f.eks. 450°=90°, -30°=330°). Bruk dette til å utløse vanning når solen når en bestemt posisjon.",multiple_triggers:"Du kan konfigurere flere utløsere. Hver aktivert utløser planlegger vanningsstart uavhengig."},active_label:"Aktiv utløser",active_default:"Standard (soloppgang minus total vanningsvarighet)",active_hint:'Bare den valgte utløseren starter vanning, så den kjører én gang per dag. "Standard" tidsbestemmer kjøringen til å avsluttes akkurat ved soloppgang. Legg til egendefinerte utløsere (solnedgang, asimut, forskyvninger) nedenfor, og velg én her.'},mn={title:"Værbasert hopp over vanning",description:"Hopp automatisk over vanning når det er meldt nedbør. Denne funksjonen krever at en værtjeneste er konfigurert.",threshold_label:"Nedbørsterskel",threshold_description:"Minste nedbørsmengde (i mm) som er meldt for i dag og i morgen for å hoppe over vanning."},gn={title:"Stedskoordinater",description:"Konfigurer stedskoordinater for innhenting av værdata. Du kan bruke manuelle koordinater som er forskjellige fra din Home Assistant plassering om nødvendig.",manual_enabled:"Bruk manuelle koordinater",use_ha_location:"Bruk Home Assistant plassering",latitude:"Breddegrad (desimalgrader)",longitude:"Lengdegrad (desimalgrader)",elevation:"Høyde (meter over havet)",current_ha_coords:"Gjeldende Home Assistant koordinater"},hn={title:"Dager Mellom Vanninger",description:"Konfigurer minimum antall dager som må gå mellom vanningshendelser. Dette hjelper med å kontrollere vanningsfrekvensen for vannsparing og plantehelse.\n\nTypiske brukstilfeller:\n• Plenpleie: 1-2 dagers intervaller forhindrer overvanning\n• Tørkerestriksjoner: 6+ dagers intervaller for ukentlig vanning\n• Dyprottede planter: 3-7 dagers intervaller for mindre hyppig vanning\n• Vannsparing: tilpassbar basert på klima og jordforhold",label:"Minimum dager mellom vanninger",help_text:"Sett til 0 for å deaktivere denne funksjonen. Verdier fra 1-365 dager støttes. Denne innstillingen fungerer sammen med eksisterende nedbørprognosering logikk."},vn={title:"Observert vanning (lukket sløyfe)",description:"Krediter hver sones bucket automatisk fra reell vanning, i stedet for å nullstille bucketen fra en automasjon. Når dette er aktivert, velg en ventil/bryter-entitet per sone i Soner-fanen: mens den er åpen, krediteres bucketen ut fra kjøretiden og sonens kapasitet. For nøyaktig regnskap kan du også velge en kumulativ volummåler (en vannmålertotal) per sone, og det målte volumet brukes i stedet. Viktig: når dette er på er det det eneste som krediterer bucketen, så fjern ethvert reset_bucket-kall fra vanningsautomasjonen din for å unngå dobbelttelling.",enabled_label:"Aktiver observert vanning",direct_control_label:"La Smart Irrigation styre ventilen",direct_control_description:"Når dette er på, åpner Smart Irrigation hver sones tilknyttede ventil, venter den beregnede varigheten, og lukker den deretter - ingen automasjon nødvendig. En pågående kjøring gjenopptas etter en omstart. Sikkerhet: hvis Home Assistant går ned i lengre tid midt i en kjøring, forblir ventilen åpen og fortsetter å vanne, så gi ventilen din en maskinvarebeskyttelse (en maksimal kjøretid).",sequencing_label:"Sonesekvensering",sequencing:{sequential:"Sekvensiell (én sone om gangen)",parallel:"Parallell (alle soner samtidig)"}},fn={common:sn,defaults:on,module:ln,calcmodules:dn,panels:un,title:cn,irrigation_start_triggers:pn,weather_skip:mn,coordinate_config:gn,days_between_irrigation:hn,observed_watering:vn},bn=Object.freeze({__proto__:null,calcmodules:dn,common:sn,coordinate_config:gn,days_between_irrigation:hn,default:fn,defaults:on,irrigation_start_triggers:pn,module:ln,observed_watering:vn,panels:un,title:cn,weather_skip:mn}),kn={loading:"Ładowanie",saving:"Zapisywanie",actions:{delete:"Usuń"},labels:{module:"Moduł",no:"Nie",select:"Wybierz",yes:"Tak",enabled:"Włączone",disabled:"Wyłączone",before:"przed",after:"po"},units:{seconds:"sekundy"},attributes:{size:"rozmiar",throughput:"przepływ",state:"stan",bucket:"bucket",last_updated:"ostatnia aktualizacja",last_calculated:"ostatnio obliczono",number_of_data_points:"liczba punktów danych"},"loading-messages":{configuration:"Ładowanie konfiguracji...",modules:"Ładowanie modułów...",general:"Ładowanie..."},"saving-messages":{adding:"Dodawanie...",saving:"Zapisywanie..."}},yn={"default-zone":"Strefa domyślna","default-mapping":"Domyślna grupa czujników"},_n={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Uwaga: to wyjaśnienie używa „.” jako separatora dziesiętnego, pokazuje zaokrąglone wartości metryczne. Moduł zwrócił niedobór ewapotranspiracji ( = et0 * hour_multiplier + opady) wynoszący","bucket-was":"Bucket wynosił","new-bucket-values-is":"Nowa wartość bucket wynosi",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Ponieważ bucket < 0, nawadnianie jest konieczne","steps-taken-to-calculate-duration":"Aby obliczyć dokładny czas trwania, wykonano następujące kroki","precipitation-rate-defined-as":"Natężenie opadów jest zdefiniowane jako","duration-is-calculated-as":"Czas trwania jest obliczany jako",drainage:"drainage","drainage-rate":"drainage_rate",hours:"godziny","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Teraz stosowany jest mnożnik. Mnożnik wynosi","duration-after-multiplier-is":"zatem czas trwania wynosi","maximum-duration-is-applied":"Następnie stosowany jest maksymalny czas trwania. Maksymalny czas trwania wynosi","duration-after-maximum-duration-is":"zatem czas trwania wynosi","lead-time-is-applied":"Na koniec stosowany jest czas wyprzedzenia. Czas wyprzedzenia wynosi","duration-after-lead-time-is":"zatem ostateczny czas trwania wynosi","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Ponieważ bucket >= 0, nawadnianie nie jest konieczne, a czas trwania ustawiono na","maximum-bucket-is":"Maksymalny rozmiar bucket wynosi","drainage-rate-is":"Natężenie drenażu przy nasyceniu (bucket na maksimum) wynosi","current-drainage-is":"Bieżący drenaż jest obliczany jako","no-drainage":"Bieżący drenaż wynosi 0, ponieważ"}}},zn={pyeto:{description:"Oblicz czas trwania na podstawie obliczeń FAO56 z biblioteki PyETO"},static:{description:"Moduł „atrapa” ze statyczną, konfigurowalną deltą"},passthrough:{description:"Moduł przekazujący, który zwraca wartość czujnika ewapotranspiracji jako deltę"}},wn={weatherservice:{title:"Usługa pogodowa",description:"Przeglądaj i zmieniaj usługę pogodową używaną do pobierania danych pogodowych — bez potrzeby ponownej instalacji integracji. Klucz API jest weryfikowany, a zmiana jest stosowana natychmiast.",labels:{"use-weather-service":"Użyj usługi pogodowej",service:"Usługa pogodowa","api-key":"Klucz API"},actions:{save:"Zapisz",saving:"Zapisywanie…"},messages:{"no-service":"Nie jest używana żadna usługa pogodowa — dane pogodowe pochodzą wyłącznie z Twoich własnych czujników.",saved:"Usługa pogodowa zaktualizowana i zastosowana.","reload-note":"Zapisanie weryfikuje klucz API w usłudze i stosuje zmianę natychmiast."}},backuprestore:{title:"Kopia zapasowa / przywracanie",description:"Wyeksportuj pełną konfigurację Smart Irrigation do pliku JSON lub przywróć ją z wcześniejszej kopii zapasowej.",cards:{backup:{title:"Kopia zapasowa",description:"Pobierz pełną konfigurację (ustawienia ogólne, strefy, moduły i grupy czujników) jako plik JSON."},restore:{title:"Przywracanie",description:"Wczytaj wcześniej wyeksportowany plik JSON, aby zastąpić bieżącą konfigurację."}},actions:{export:"Eksportuj do JSON","choose-file":"Wybierz plik kopii zapasowej…",restore:"Przywróć tę kopię zapasową",restoring:"Przywracanie…"},messages:{exported:"Plik kopii zapasowej pobrany.",restored:"Konfiguracja przywrócona — ponowne ładowanie integracji.","invalid-file":"Ten plik nie jest prawidłową kopią zapasową Smart Irrigation.","confirm-title":"Zastąpić całą konfigurację?",summary:"Ta kopia zapasowa zawiera","confirm-warning":"Przywracanie nadpisuje wszystkie bieżące ustawienia ogólne, strefy, moduły i grupy czujników. Tej operacji nie można cofnąć.","reload-note":"Przywracanie zastępuje wszystko i ponownie ładuje integrację, aby zastosować zmianę."}},general:{cards:{"automatic-duration-calculation":{header:"Automatyczne obliczanie czasu trwania",description:"Obliczanie wykorzystuje zebrane do tej pory dane pogodowe i aktualizuje bucket dla każdej strefy automatycznej. Następnie czas trwania jest dostosowywany na podstawie nowej wartości bucket, a zebrane dane pogodowe są usuwane.",labels:{"auto-calc-enabled":"Automatycznie obliczaj czasy trwania nawadniania","calc-time":"Oblicz o"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Ostrzeżenie: czas aktualizacji danych pogodowych jest równy lub późniejszy niż czas obliczania"},header:"Automatyczna aktualizacja danych pogodowych",description:"Zbieraj i przechowuj dane pogodowe automatycznie. Dane pogodowe są wymagane do obliczania bucketów i czasów trwania stref.",labels:{"auto-update-enabled":"Automatycznie aktualizuj dane pogodowe","auto-update-schedule":"Harmonogram aktualizacji","auto-update-time":"Aktualizuj o","auto-update-interval":"Aktualizuj dane czujników co","auto-update-delay":"Opóźnienie aktualizacji"},options:{minutes:"minuty",hours:"godziny",days:"dni"}},"automatic-clear":{header:"Automatyczne czyszczenie danych pogodowych",description:"Automatycznie usuwaj zebrane dane pogodowe o skonfigurowanej porze. Użyj tej opcji, aby upewnić się, że nie pozostają żadne dane pogodowe z poprzednich dni. Nie usuwaj danych pogodowych przed obliczeniem i korzystaj z tej opcji tylko wtedy, gdy spodziewasz się, że automatyczna aktualizacja zbierze dane pogodowe po obliczeniu danego dnia. Najlepiej czyścić dane jak najpóźniej w ciągu dnia.",labels:{"automatic-clear-enabled":"Automatycznie czyść zebrane dane pogodowe","automatic-clear-time":"Czyść dane pogodowe o"}},continuousupdates:{header:"Ciągłe aktualizacje dla czujników (eksperymentalne)",description:"Ta eksperymentalna funkcja będzie ciągle aktualizować dane czujników. Jest to przydatne dla grup czujników korzystających ze źródeł dostarczających dane ciągłe, takich jak stacje pogodowe. Tej funkcji nie można używać dla grup czujników, które przynajmniej częściowo polegają na usługach pogodowych, ponieważ ciągłe odpytywanie API wiąże się z kosztami. Pamiętaj, że jest to funkcja eksperymentalna i może nie działać zgodnie z oczekiwaniami. Korzystasz z niej na własne ryzyko.",labels:{continuousupdates:"Włącz ciągłe aktualizacje",sensor_debounce:"Opóźnienie czujnika (debounce)"}}},description:"Ta strona zawiera ustawienia globalne.",title:"Ogólne"},help:{title:"Pomoc",cards:{"how-to-get-help":{title:"Jak uzyskać pomoc","first-read-the":"Najpierw przeczytaj",wiki:"Wiki","if-you-still-need-help":"Jeśli nadal potrzebujesz pomocy, skontaktuj się na","community-forum":"Forum społeczności","or-open-a":"lub otwórz","github-issue":"zgłoszenie na GitHub","english-only":"Tylko w języku angielskim"}}},info:{title:"Informacje",description:"Wyświetl informacje o następnym nawadnianiu i stanie systemu.","configuration-not-available":"Konfiguracja niedostępna.",cards:{"zone-bucket-values":{title:"Wartości bucket strefy i czas trwania",labels:{bucket:"Bucket",duration:"Czas trwania"},"no-zones":"Brak skonfigurowanych stref"},"next-irrigation":{title:"Następne nawadnianie",labels:{"next-start":"Następny start",duration:"Czas trwania",zones:"Strefy"},"no-data":"Brak dostępnych danych"},"irrigation-reason":{title:"Powód nawadniania",labels:{reason:"Powód",sunrise:"Wschód słońca","total-duration":"Łączny czas trwania",explanation:"Wyjaśnienie"},"no-data":"Brak dostępnych danych"}}},mappings:{cards:{"add-mapping":{actions:{add:"Dodaj grupę czujników"},header:"Dodaj grupy czujników"},mapping:{aggregates:{average:"Średnia",first:"Pierwsza",last:"Ostatnia",maximum:"Maksimum",median:"Mediana",minimum:"Minimum",riemannsum:"Suma Riemanna",sum:"Suma",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Nie możesz usunąć tej grupy czujników, ponieważ korzysta z niej co najmniej jedna strefa.",invalid_source:"Nieprawidłowe źródło",source_does_not_exist:"Źródło nie istnieje. Podaj prawidłowe źródło, takie jak „sensor.mysensor”."},items:{dewpoint:"Punkt rosy",evapotranspiration:"Ewapotranspiracja",humidity:"Wilgotność","maximum temperature":"Temperatura maksymalna","minimum temperature":"Temperatura minimalna",precipitation:"Łączne opady","current precipitation":"Bieżące opady",pressure:"Ciśnienie","solar radiation":"Promieniowanie słoneczne",temperature:"Temperatura",windspeed:"Prędkość wiatru"},pressure_types:{absolute:"absolutne",relative:"względne"},"pressure-type":"Ciśnienie jest","sensor-aggregate-of-sensor-values-to-calculate":"wartości czujników do obliczenia czasu trwania","sensor-aggregate-use-the":"Użyj","sensor-entity":"Encja czujnika",static_value:"Wartość","input-units":"Dane wejściowe podają wartości w",source:"Źródło",sources:{none:"Brak",weather_service:"Usługa pogodowa",sensor:"Czujnik",static:"Wartość statyczna"}}},description:"Dodaj jedną lub więcej grup czujników, które pobierają dane pogodowe z usługi pogodowej, z czujników lub ich kombinacji. Każdą grupę czujników możesz przypisać do jednej lub więcej stref",labels:{"mapping-name":"Nazwa"},no_items:"Nie zdefiniowano jeszcze żadnej grupy czujników.",title:"Grupy czujników","weather-records":{title:"Zapisy pogodowe (ostatnie 10)",timestamp:"Czas",temperature:"Temp.",humidity:"Wilgotność",precipitation:"Opady","retrieval-time":"Pobrano","no-data":"Brak dostępnych danych pogodowych dla tej grupy czujników"}},modules:{cards:{"add-module":{actions:{add:"Dodaj moduł"},header:"Dodaj moduł"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Nie możesz usunąć tego modułu, ponieważ korzysta z niego co najmniej jedna strefa."},labels:{configuration:"Konfiguracja",required:"oznacza pole wymagane"},"translated-options":{DontEstimate:"Nie szacuj",EstimateFromSunHours:"Szacuj na podstawie godzin nasłonecznienia",EstimateFromTemp:"Szacuj na podstawie temperatury",EstimateFromSunHoursAndTemperature:"Szacuj na podstawie średniej godzin nasłonecznienia i temperatury"}}},description:"Dodaj jeden lub więcej modułów obliczających czas trwania nawadniania. Każdy moduł ma własną konfigurację i może być używany do obliczania czasu trwania dla jednej lub więcej stref.",no_items:"Nie zdefiniowano jeszcze żadnych modułów.",title:"Moduły"},zones:{actions:{add:"Dodaj",calculate:"Oblicz",information:"Informacje",update:"Aktualizuj","reset-bucket":"Zeruj bucket","view-weather-info":"Wyświetl dane pogodowe","view-weather-info-message":"Dane pogodowe dostępne dla","view-watering-calendar":"Wyświetl kalendarz podlewania"},cards:{"add-zone":{actions:{add:"Dodaj strefę"},header:"Dodaj strefę"},"zone-actions":{actions:{"calculate-all":"Oblicz wszystkie strefy","update-all":"Aktualizuj wszystkie strefy","reset-all-buckets":"Zeruj wszystkie buckets","clear-all-weatherdata":"Wyczyść wszystkie dane pogodowe"},header:"Akcje na wszystkich strefach"}},description:"Określ tutaj jedną lub więcej stref nawadniania. Czas trwania nawadniania jest obliczany dla każdej strefy w zależności od rozmiaru, przepływu, stanu, modułu i grupy czujników.",labels:{bucket:"Bucket",duration:"Czas trwania","lead-time":"Czas wyprzedzenia",mapping:"Grupa czujników","maximum-duration":"Maksymalny czas trwania",multiplier:"Mnożnik",name:"Nazwa",size:"Rozmiar",state:"Stan",states:{automatic:"Automatyczny",disabled:"Wyłączony",manual:"Ręczny"},throughput:"Przepływ","maximum-bucket":"Maksymalny bucket",last_calculated:"Ostatnio obliczono","data-last-updated":"Dane ostatnio zaktualizowane","data-number-of-data-points":"Liczba punktów danych",drainage_rate:"Natężenie drenażu","linked-entity":"Połączony zawór/przełącznik","linked-entity-hint":"Zawór lub przełącznik nawadniający tę strefę. Za każdym razem, gdy działa (ręczne odkręcenie, automatyzacja lub sam Smart Irrigation, gdy włączone jest bezpośrednie sterowanie zaworem), bucket jest zasilany na podstawie czasu działania i przepływu strefy. Wymagane dla funkcji zamkniętej pętli.","flow-sensor":"Licznik skumulowanej objętości","flow-sensor-hint":"Dla dokładnego zasilania zamiast przepływu x czas: skumulowana suma wodomierza (klasa stanu total_increasing), a nie chwilowe natężenie przepływu. Jednostka jest odczytywana automatycznie (L, mL, m³, gal, ft³).",optional:"opcjonalne"},no_items:"Nie zdefiniowano jeszcze żadnych stref.",title:"Strefy"}},xn="Smart Irrigation",jn={title:"Wyzwalacze startu nawadniania",description:"Skonfiguruj, kiedy nawadnianie powinno się rozpocząć na podstawie zdarzeń słonecznych. Możesz dodać wiele wyzwalaczy dla różnych harmonogramów. Dla wyzwalaczy wschodu słońca pozostawienie przesunięcia na 0 spowoduje automatyczne użycie łącznego czasu trwania wszystkich włączonych stref.",usage_before:"Gdy wyzwalacz zadziała, Smart Irrigation emituje zdarzenie ",usage_after:" — nasłuchuj go w automatyzacji, aby rozpocząć podlewanie. Dane zdarzenia zawierają trigger_name, trigger_type i offset_minutes, dzięki czemu możesz reagować inaczej dla każdego wyzwalacza. Ustawienia pomijania z powodu opadów oraz dni między nawadnianiem nadal obowiązują: w dniu pominięcia żadne zdarzenie nie jest emitowane.",add_trigger:"Dodaj wyzwalacz",edit_trigger:"Edytuj wyzwalacz",delete_trigger:"Usuń wyzwalacz",trigger_types:{sunrise:"Wschód słońca",sunset:"Zachód słońca",solar_azimuth:"Azymut słońca"},fields:{name:{name:"Nazwa wyzwalacza",description:"Opisowa nazwa identyfikująca ten wyzwalacz"},type:{name:"Typ wyzwalacza",description:"Typ zdarzenia słonecznego, które ma wyzwalać"},enabled:{name:"Włączony",description:"Czy ten wyzwalacz jest obecnie aktywny"},offset_minutes:{name:"Przesunięcie (minuty)",description:"Minuty przed (-) lub po (+) zdarzeniu słonecznym. Dla wyzwalaczy wschodu słońca użyj 0 dla automatycznego ustalania czasu na podstawie łącznego czasu trwania stref."},azimuth_angle:{name:"Kąt azymutu (stopnie)",description:"Kąt azymutu słońca w stopniach, gdzie 0=Północ, 90=Wschód, 180=Południe, 270=Zachód"},account_for_duration:{name:"Uwzględnij czas trwania",description:"Gdy włączone, nawadnianie rozpocznie się odpowiednio wcześnie, aby zakończyć się o określonej porze. Gdy wyłączone, nawadnianie rozpocznie się dokładnie o określonej porze."}},dialog:{add_title:"Dodaj wyzwalacz startu nawadniania",edit_title:"Edytuj wyzwalacz startu nawadniania",cancel:"Anuluj",save:"Zapisz",delete:"Usuń",help:"Gdy ten wyzwalacz zadziała, Smart Irrigation emituje następujące zdarzenie — użyj go w automatyzacji, aby rozpocząć podlewanie. Dane zdarzenia zawierają nazwę tego wyzwalacza (oraz typ/przesunięcie), dzięki czemu możesz na nie reagować konkretnie:"},no_triggers:"Nie skonfigurowano żadnych wyzwalaczy startu nawadniania. System użyje zachowania domyślnego (wschód słońca z łącznym czasem trwania stref). Dodaj wyzwalacze, aby dostosować, kiedy rozpoczyna się nawadnianie.",offset_auto:"Auto (obliczone z łącznego czasu trwania stref)",confirm_delete:"Czy na pewno chcesz usunąć wyzwalacz „{name}”?",validation:{name_required:"Nazwa wyzwalacza jest wymagana",azimuth_invalid:"Kąt azymutu musi być prawidłową liczbą"},help:{sunrise_offset:"Dla wyzwalaczy wschodu słońca: użyj wartości ujemnych, aby rozpocząć przed wschodem słońca, dodatnich, aby rozpocząć po nim. Ustaw na 0, aby automatycznie rozpocząć odpowiednio wcześnie, by ukończyć wszystkie strefy przed wschodem słońca.",sunset_offset:"Dla wyzwalaczy zachodu słońca: użyj wartości ujemnych, aby rozpocząć przed zachodem słońca, dodatnich, aby rozpocząć po zachodzie słońca.",azimuth_explanation:"Azymut słońca to kierunek kompasowy słońca. 0°=Północ, 90°=Wschód, 180°=Południe, 270°=Zachód. Możesz wprowadzić dowolną wartość kąta (np. 450° = 90°, -30° = 330°). Użyj tego, aby wyzwolić nawadnianie, gdy słońce osiągnie określone położenie.",multiple_triggers:"Możesz skonfigurować wiele wyzwalaczy. Każdy włączony wyzwalacz będzie niezależnie planował starty nawadniania."},active_label:"Aktywny wyzwalacz",active_default:"Domyślny (wschód słońca minus całkowity czas nawadniania)",active_hint:'Tylko wybrany wyzwalacz uruchamia nawadnianie, więc działa ono raz dziennie. "Domyślny" tak dobiera czas, aby zakończyć podlewanie dokładnie o wschodzie słońca. Dodaj poniżej własne wyzwalacze (zachód słońca, azymut, przesunięcia), a następnie wybierz jeden tutaj.'},Sn={title:"Pomijanie nawadniania na podstawie pogody",description:"Automatycznie pomijaj nawadnianie, gdy prognozowane są opady. Ta funkcja wymaga skonfigurowanej usługi pogodowej.",threshold_label:"Próg opadów",threshold_description:"Minimalna ilość opadów (w mm) prognozowana na dziś i jutro, aby pominąć nawadnianie."},An={title:"Współrzędne lokalizacji",description:"Skonfiguruj współrzędne lokalizacji na potrzeby pobierania danych pogodowych. W razie potrzeby możesz użyć ręcznych współrzędnych różnych od lokalizacji Home Assistant.",manual_enabled:"Użyj ręcznych współrzędnych",use_ha_location:"Użyj lokalizacji Home Assistant",latitude:"Szerokość geograficzna (stopnie dziesiętne)",longitude:"Długość geograficzna (stopnie dziesiętne)",elevation:"Wysokość (metry nad poziomem morza)",current_ha_coords:"Bieżące współrzędne Home Assistant"},$n={title:"Dni między nawadnianiem",description:"Skonfiguruj minimalną liczbę dni, które muszą upłynąć między zdarzeniami nawadniania. Pomaga to kontrolować częstotliwość podlewania w celu oszczędzania wody i dbania o zdrowie roślin.\n\nTypowe zastosowania w praktyce:\n• Pielęgnacja trawnika: odstępy 1–2 dni zapobiegają przelewaniu\n• Ograniczenia w czasie suszy: odstępy 6+ dni dla cotygodniowego podlewania\n• Rośliny głęboko ukorzenione: odstępy 3–7 dni dla rzadszego podlewania\n• Oszczędzanie wody: dostosowywalne w zależności od klimatu i warunków glebowych",label:"Minimalna liczba dni między nawadnianiem",help_text:"Ustaw na 0, aby wyłączyć tę funkcję. Obsługiwane są wartości od 1 do 365 dni. To ustawienie współdziała z istniejącą logiką prognozowania opadów."},En={title:"Obserwowane nawadnianie (zamknięta pętla)",description:"Automatycznie zasilaj bucket każdej strefy na podstawie rzeczywistego nawadniania, zamiast resetować bucket z automatyzacji. Po włączeniu wybierz w zakładce Strefy encję zaworu/przełącznika dla każdej strefy: gdy jest otwarty, bucket jest zasilany na podstawie czasu działania i przepływu strefy. Dla dokładnego rozliczenia możesz też wybrać licznik skumulowanej objętości (sumę typu wodomierza) dla każdej strefy, a zamiast tego użyta zostanie zmierzona objętość. Ważne: gdy ta funkcja jest włączona, jest jedynym, co zasila bucket, więc usuń wszelkie wywołania reset_bucket z automatyzacji nawadniania, aby uniknąć podwójnego liczenia.",enabled_label:"Włącz obserwowane nawadnianie",direct_control_label:"Pozwól Smart Irrigation sterować zaworem",direct_control_description:"Gdy włączone, Smart Irrigation otwiera połączony zawór każdej strefy, czeka przez obliczony czas, a następnie go zamyka - bez potrzeby automatyzacji. Trwające działanie zostaje wznowione po ponownym uruchomieniu. Bezpieczeństwo: jeśli Home Assistant przestanie działać na długo w trakcie nawadniania, zawór pozostaje otwarty i dalej podlewa, więc zapewnij zaworowi sprzętowe zabezpieczenie (maksymalny czas działania).",sequencing_label:"Sekwencjonowanie stref",sequencing:{sequential:"Sekwencyjnie (jedna strefa naraz)",parallel:"Równolegle (wszystkie strefy naraz)"}},Tn={common:kn,defaults:yn,module:_n,calcmodules:zn,panels:wn,title:xn,irrigation_start_triggers:jn,weather_skip:Sn,coordinate_config:An,days_between_irrigation:$n,observed_watering:En},Mn=Object.freeze({__proto__:null,calcmodules:zn,common:kn,coordinate_config:An,days_between_irrigation:$n,default:Tn,defaults:yn,irrigation_start_triggers:jn,module:_n,observed_watering:En,panels:wn,title:xn,weather_skip:Sn}),Dn={loading:"A carregar",saving:"A guardar",actions:{delete:"Eliminar"},labels:{module:"Módulo",no:"Não",select:"Selecionar",yes:"Sim",enabled:"Ativado",disabled:"Desativado",before:"antes",after:"depois"},units:{seconds:"segundos"},attributes:{size:"tamanho",throughput:"débito",state:"estado",bucket:"bucket",last_updated:"última atualização",last_calculated:"último cálculo",number_of_data_points:"número de pontos de dados"},"loading-messages":{configuration:"A carregar configuração...",modules:"A carregar módulos...",general:"A carregar..."},"saving-messages":{adding:"A adicionar...",saving:"A guardar..."}},On={"default-zone":"Zona predefinida","default-mapping":"Grupo de sensores predefinido"},Nn={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Nota: esta explicação utiliza '.' como separador decimal e mostra valores arredondados e métricos. O módulo devolveu uma deficiência de evapotranspiração ( = et0 * hour_multiplier + precipitation) de","bucket-was":"O bucket era","new-bucket-values-is":"O novo valor do bucket é",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Como bucket < 0, a irrigação é necessária","steps-taken-to-calculate-duration":"Para calcular a duração exata, foram seguidos os seguintes passos","precipitation-rate-defined-as":"A taxa de precipitação é definida como","duration-is-calculated-as":"A duração é calculada como",drainage:"drainage","drainage-rate":"drainage_rate",hours:"horas","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Agora, o multiplicador é aplicado. O multiplicador é","duration-after-multiplier-is":"logo a duração é","maximum-duration-is-applied":"Em seguida, é aplicada a duração máxima. A duração máxima é","duration-after-maximum-duration-is":"logo a duração é","lead-time-is-applied":"Por fim, é aplicado o tempo de antecedência. O tempo de antecedência é","duration-after-lead-time-is":"logo a duração final é","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Como bucket >= 0, não é necessária irrigação e a duração é definida como","maximum-bucket-is":"O tamanho máximo do bucket é","drainage-rate-is":"A taxa de drenagem quando saturado (bucket no máximo) é","current-drainage-is":"A drenagem atual é calculada como","no-drainage":"A drenagem atual é 0 porque"}}},Pn={pyeto:{description:"Calcular a duração com base no cálculo FAO56 da biblioteca PyETO"},static:{description:"Módulo 'fictício' com um delta estático configurável"},passthrough:{description:"Módulo de passagem que devolve o valor de um sensor de evapotranspiração como delta"}},Cn={weatherservice:{title:"Serviço meteorológico",description:"Veja e altere o serviço meteorológico utilizado para obter dados meteorológicos — sem necessidade de reinstalar a integração. A chave de API é validada e a alteração é aplicada de imediato.",labels:{"use-weather-service":"Utilizar um serviço meteorológico",service:"Serviço meteorológico","api-key":"Chave de API"},actions:{save:"Guardar",saving:"A guardar…"},messages:{"no-service":"Não é utilizado nenhum serviço meteorológico — os dados meteorológicos provêm apenas dos seus próprios sensores.",saved:"Serviço meteorológico atualizado e aplicado.","reload-note":"Ao guardar, a chave de API é validada junto do serviço e a alteração é aplicada de imediato."}},backuprestore:{title:"Cópia de segurança / restauro",description:"Exporte a configuração completa do Smart Irrigation para um ficheiro JSON, ou restaure-a a partir de uma cópia de segurança anterior.",cards:{backup:{title:"Cópia de segurança",description:"Transfira a configuração completa (definições gerais, zonas, módulos e grupos de sensores) como ficheiro JSON."},restore:{title:"Restaurar",description:"Carregue um ficheiro JSON exportado anteriormente para substituir a configuração atual."}},actions:{export:"Exportar para JSON","choose-file":"Escolher um ficheiro de cópia de segurança…",restore:"Restaurar esta cópia de segurança",restoring:"A restaurar…"},messages:{exported:"Ficheiro de cópia de segurança transferido.",restored:"Configuração restaurada — a recarregar a integração.","invalid-file":"Este ficheiro não é uma cópia de segurança válida do Smart Irrigation.","confirm-title":"Substituir toda a configuração?",summary:"Esta cópia de segurança contém","confirm-warning":"O restauro substitui todas as definições gerais, zonas, módulos e grupos de sensores atuais. Esta ação não pode ser anulada.","reload-note":"O restauro substitui tudo e recarrega a integração para aplicar a alteração."}},general:{cards:{"automatic-duration-calculation":{header:"Cálculo automático da duração",description:"O cálculo utiliza os dados meteorológicos recolhidos até esse momento e atualiza o bucket de cada zona automática. Depois, a duração é ajustada com base no novo valor do bucket e os dados meteorológicos recolhidos são removidos.",labels:{"auto-calc-enabled":"Calcular automaticamente as durações de irrigação","calc-time":"Calcular às"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Aviso: a hora de atualização dos dados meteorológicos é igual ou posterior à hora de cálculo"},header:"Atualização automática dos dados meteorológicos",description:"Recolher e armazenar dados meteorológicos automaticamente. Os dados meteorológicos são necessários para calcular os buckets e as durações das zonas.",labels:{"auto-update-enabled":"Atualizar automaticamente os dados meteorológicos","auto-update-schedule":"Agendamento da atualização","auto-update-time":"Atualizar às","auto-update-interval":"Atualizar os dados dos sensores a cada","auto-update-delay":"Atraso da atualização"},options:{minutes:"minutos",hours:"horas",days:"dias"}},"automatic-clear":{header:"Eliminação automática dos dados meteorológicos",description:"Remova automaticamente os dados meteorológicos recolhidos a uma hora configurada. Use esta opção para garantir que não ficam dados meteorológicos de dias anteriores. Não remova os dados meteorológicos antes de calcular e use esta opção apenas se esperar que a atualização automática recolha dados meteorológicos após ter calculado para o dia. Idealmente, deve eliminar o mais tarde possível no dia.",labels:{"automatic-clear-enabled":"Limpar automaticamente os dados meteorológicos recolhidos","automatic-clear-time":"Limpar os dados meteorológicos às"}},continuousupdates:{header:"Atualizações contínuas para sensores (experimental)",description:"Esta funcionalidade experimental atualiza continuamente os dados dos sensores. É útil para grupos de sensores que utilizam fontes que fornecem dados contínuos, como estações meteorológicas. Esta funcionalidade não pode ser usada para grupos de sensores que dependam, pelo menos em parte, de serviços meteorológicos, pois a consulta contínua de APIs implica custos. Tenha em conta que isto é experimental e pode não funcionar como esperado. Use por sua conta e risco.",labels:{continuousupdates:"Ativar atualizações contínuas",sensor_debounce:"Debounce do sensor"}}},description:"Esta página fornece definições globais.",title:"Geral"},help:{title:"Ajuda",cards:{"how-to-get-help":{title:"Como obter ajuda","first-read-the":"Primeiro, leia a",wiki:"Wiki","if-you-still-need-help":"Se ainda precisar de ajuda, contacte através do","community-forum":"Fórum da comunidade","or-open-a":"ou abra uma","github-issue":"Issue no Github","english-only":"Apenas em inglês"}}},info:{title:"Informação",description:"Veja informação sobre a próxima irrigação e o estado do sistema.","configuration-not-available":"Configuração não disponível.",cards:{"zone-bucket-values":{title:"Valores de bucket e duração das zonas",labels:{bucket:"Bucket",duration:"Duração"},"no-zones":"Nenhuma zona configurada"},"next-irrigation":{title:"Próxima irrigação",labels:{"next-start":"Próximo início",duration:"Duração",zones:"Zonas"},"no-data":"Sem dados disponíveis"},"irrigation-reason":{title:"Motivo da irrigação",labels:{reason:"Motivo",sunrise:"Nascer do sol","total-duration":"Duração total",explanation:"Explicação"},"no-data":"Sem dados disponíveis"}}},mappings:{cards:{"add-mapping":{actions:{add:"Adicionar grupo de sensores"},header:"Adicionar grupos de sensores"},mapping:{aggregates:{average:"Média",first:"Primeiro",last:"Último",maximum:"Máximo",median:"Mediana",minimum:"Mínimo",riemannsum:"Soma de Riemann",sum:"Soma",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Não pode eliminar este grupo de sensores porque existe pelo menos uma zona a utilizá-lo.",invalid_source:"Fonte inválida",source_does_not_exist:"A fonte não existe. Introduza uma fonte válida, como 'sensor.mysensor'."},items:{dewpoint:"Ponto de orvalho",evapotranspiration:"Evapotranspiração",humidity:"Humidade","maximum temperature":"Temperatura máxima","minimum temperature":"Temperatura mínima",precipitation:"Precipitação total","current precipitation":"Precipitação atual",pressure:"Pressão","solar radiation":"Radiação solar",temperature:"Temperatura",windspeed:"Velocidade do vento"},pressure_types:{absolute:"absoluta",relative:"relativa"},"pressure-type":"A pressão é","sensor-aggregate-of-sensor-values-to-calculate":"dos valores dos sensores para calcular a duração","sensor-aggregate-use-the":"Utilizar a","sensor-entity":"Entidade do sensor",static_value:"Valor","input-units":"A entrada fornece valores em",source:"Fonte",sources:{none:"Nenhuma",weather_service:"Serviço meteorológico",sensor:"Sensor",static:"Valor estático"}}},description:"Adicione um ou mais grupos de sensores que obtêm dados meteorológicos a partir do serviço meteorológico, de sensores ou de uma combinação destes. Pode associar cada grupo de sensores a uma ou mais zonas",labels:{"mapping-name":"Nome"},no_items:"Ainda não existem grupos de sensores definidos.",title:"Grupos de sensores","weather-records":{title:"Registos meteorológicos (últimos 10)",timestamp:"Hora",temperature:"Temp",humidity:"Humidade",precipitation:"Precip","retrieval-time":"Obtido","no-data":"Sem dados meteorológicos disponíveis para este grupo de sensores"}},modules:{cards:{"add-module":{actions:{add:"Adicionar módulo"},header:"Adicionar módulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Não pode eliminar este módulo porque existe pelo menos uma zona a utilizá-lo."},labels:{configuration:"Configuração",required:"indica um campo obrigatório"},"translated-options":{DontEstimate:"Não estimar",EstimateFromSunHours:"Estimar a partir das horas de sol",EstimateFromTemp:"Estimar a partir da temperatura",EstimateFromSunHoursAndTemperature:"Estimar a partir da média das horas de sol e da temperatura"}}},description:"Adicione um ou mais módulos que calculam a duração da irrigação. Cada módulo tem a sua própria configuração e pode ser usado para calcular a duração de uma ou mais zonas.",no_items:"Ainda não existem módulos definidos.",title:"Módulos"},zones:{actions:{add:"Adicionar",calculate:"Calcular",information:"Informação",update:"Atualizar","reset-bucket":"Repor bucket","view-weather-info":"Ver dados meteorológicos","view-weather-info-message":"Dados meteorológicos disponíveis para","view-watering-calendar":"Ver calendário de rega"},cards:{"add-zone":{actions:{add:"Adicionar zona"},header:"Adicionar zona"},"zone-actions":{actions:{"calculate-all":"Calcular todas as zonas","update-all":"Atualizar todas as zonas","reset-all-buckets":"Repor todos os buckets","clear-all-weatherdata":"Limpar todos os dados meteorológicos"},header:"Ações em todas as zonas"}},description:"Especifique aqui uma ou mais zonas de irrigação. A duração da irrigação é calculada por zona, dependendo do tamanho, do débito, do estado, do módulo e do grupo de sensores.",labels:{bucket:"Bucket",duration:"Duração","lead-time":"Tempo de antecedência",mapping:"Grupo de sensores","maximum-duration":"Duração máxima",multiplier:"Multiplicador",name:"Nome",size:"Tamanho",state:"Estado",states:{automatic:"Automático",disabled:"Desativado",manual:"Manual"},throughput:"Débito","maximum-bucket":"Bucket máximo",last_calculated:"Último cálculo","data-last-updated":"Dados atualizados pela última vez","data-number-of-data-points":"Número de pontos de dados",drainage_rate:"Taxa de drenagem","linked-entity":"Válvula/interruptor associado","linked-entity-hint":"A válvula ou interruptor que rega esta zona. Sempre que funcionar (uma torneira manual, uma automação ou o próprio Smart Irrigation quando o controlo direto da válvula está ativo), o bucket é creditado a partir do tempo de funcionamento e do débito da zona. Necessário para as funcionalidades de circuito fechado.","flow-sensor":"Medidor de volume acumulado","flow-sensor-hint":"Para um crédito exato em vez de débito x tempo: um total de contador de água acumulado (classe de estado total_increasing), não um caudal instantâneo. A unidade é lida automaticamente (L, mL, m³, gal, ft³).",optional:"opcional"},no_items:"Ainda não existem zonas definidas.",title:"Zonas"}},Hn="Smart Irrigation",In={title:"Acionadores de início de irrigação",description:"Configure quando a irrigação deve começar com base em eventos solares. Pode adicionar vários acionadores para diferentes agendamentos. Para acionadores ao nascer do sol, deixar o desvio a 0 utilizará automaticamente a duração total de todas as zonas ativadas.",usage_before:"Quando um acionador dispara, o Smart Irrigation emite o evento ",usage_after:" — escute-o numa automação para começar a regar. Os dados do evento incluem trigger_name, trigger_type e offset_minutes, para que possa reagir de forma diferente a cada acionador. As definições de salto por precipitação e de dias entre irrigações continuam a aplicar-se: num dia de salto não é emitido nenhum evento.",add_trigger:"Adicionar acionador",edit_trigger:"Editar acionador",delete_trigger:"Eliminar acionador",trigger_types:{sunrise:"Nascer do sol",sunset:"Pôr do sol",solar_azimuth:"Azimute solar"},fields:{name:{name:"Nome do acionador",description:"Um nome descritivo para identificar este acionador"},type:{name:"Tipo de acionador",description:"O tipo de evento solar que dispara o acionador"},enabled:{name:"Ativado",description:"Se este acionador está atualmente ativo"},offset_minutes:{name:"Desvio (minutos)",description:"Minutos antes (-) ou depois (+) do evento solar. Para acionadores ao nascer do sol, use 0 para um agendamento automático baseado na duração total das zonas."},azimuth_angle:{name:"Ângulo de azimute (graus)",description:"Ângulo de azimute solar em graus, onde 0=Norte, 90=Este, 180=Sul, 270=Oeste"},account_for_duration:{name:"Considerar a duração",description:"Quando ativado, a irrigação começa com antecedência suficiente para terminar à hora especificada. Quando desativado, a irrigação começa exatamente à hora especificada."}},dialog:{add_title:"Adicionar acionador de início de irrigação",edit_title:"Editar acionador de início de irrigação",cancel:"Cancelar",save:"Guardar",delete:"Eliminar",help:"Quando este acionador dispara, o Smart Irrigation emite o evento seguinte — utilize-o numa automação para começar a regar. Os dados do evento incluem o nome deste acionador (e o tipo/desvio), para que possa reagir-lhe especificamente:"},no_triggers:"Não há acionadores de início de irrigação configurados. O sistema utilizará o comportamento predefinido (nascer do sol com a duração total das zonas). Adicione acionadores para personalizar quando a irrigação começa.",offset_auto:"Automático (calculado a partir da duração total das zonas)",confirm_delete:"Tem a certeza de que pretende eliminar o acionador '{name}'?",validation:{name_required:"O nome do acionador é obrigatório",azimuth_invalid:"O ângulo de azimute deve ser um número válido"},help:{sunrise_offset:"Para acionadores ao nascer do sol: use valores negativos para começar antes do nascer do sol, positivos para começar depois. Defina como 0 para começar automaticamente com antecedência suficiente para concluir todas as zonas antes do nascer do sol.",sunset_offset:"Para acionadores ao pôr do sol: use valores negativos para começar antes do pôr do sol, positivos para começar depois do pôr do sol.",azimuth_explanation:"O azimute solar é a direção da bússola do sol. 0°=Norte, 90°=Este, 180°=Sul, 270°=Oeste. Pode introduzir qualquer valor de ângulo (por exemplo, 450° = 90°, -30° = 330°). Use isto para acionar a irrigação quando o sol atinge uma posição específica.",multiple_triggers:"Pode configurar vários acionadores. Cada acionador ativado agendará independentemente os inícios de irrigação."},active_label:"Acionador ativo",active_default:"Predefinido (nascer do sol menos a duração total de rega)",active_hint:'Apenas o acionador selecionado inicia a rega, por isso esta corre uma vez por dia. "Predefinido" calcula a rega para terminar exatamente ao nascer do sol. Adicione acionadores personalizados (pôr do sol, azimute, desvios) abaixo e depois escolha um aqui.'},Ln={title:"Salto de irrigação com base no tempo",description:"Saltar automaticamente a irrigação quando há precipitação prevista. Esta funcionalidade requer um serviço meteorológico configurado.",threshold_label:"Limiar de precipitação",threshold_description:"Quantidade mínima de precipitação (em mm) prevista para hoje e amanhã para saltar a irrigação."},Bn={title:"Coordenadas de localização",description:"Configure as coordenadas de localização para a obtenção de dados meteorológicos. Se necessário, pode usar coordenadas manuais diferentes da localização do seu Home Assistant.",manual_enabled:"Utilizar coordenadas manuais",use_ha_location:"Utilizar a localização do Home Assistant",latitude:"Latitude (graus decimais)",longitude:"Longitude (graus decimais)",elevation:"Altitude (metros acima do nível do mar)",current_ha_coords:"Coordenadas atuais do Home Assistant"},Un={title:"Dias entre irrigações",description:"Configure o número mínimo de dias que devem decorrer entre eventos de irrigação. Isto ajuda a controlar a frequência de rega para conservação da água e gestão da saúde das plantas.\n\nCasos de uso típicos do mundo real:\n• Cuidado do relvado: intervalos de 1-2 dias evitam o excesso de rega\n• Restrições por seca: intervalos de 6+ dias para rega semanal\n• Plantas de raízes profundas: intervalos de 3-7 dias para rega menos frequente\n• Conservação da água: personalizável consoante o clima e as condições do solo",label:"Mínimo de dias entre irrigações",help_text:"Defina como 0 para desativar esta funcionalidade. São suportados valores de 1-365 dias. Esta definição funciona em conjunto com a lógica de previsão de precipitação existente."},Rn={title:"Rega observada (circuito fechado)",description:"Credita automaticamente o bucket de cada zona a partir da rega real, em vez de repor o bucket a partir de uma automação. Uma vez ativado, escolha uma entidade de válvula/interruptor por zona no separador Zonas: enquanto estiver aberta, o bucket é creditado a partir do tempo de funcionamento e do débito da zona. Para uma contabilidade exata, também pode escolher um medidor de volume acumulado (um total estilo contador de água) por zona, e o volume medido é usado em vez disso. Importante: quando isto está ativo, é a única coisa a creditar o bucket, por isso remova qualquer chamada reset_bucket da sua automação de rega para evitar contagem dupla.",enabled_label:"Ativar rega observada",direct_control_label:"Permitir que o Smart Irrigation controle a válvula",direct_control_description:"Quando ativo, o Smart Irrigation abre a válvula associada de cada zona, aguarda a duração calculada e depois fecha-a - sem necessidade de automação. Uma rega em curso é retomada após um reinício. Segurança: se o Home Assistant ficar indisponível durante muito tempo a meio de uma rega, a válvula permanece aberta e continua a regar, por isso atribua à sua válvula um mecanismo de segurança por hardware (um tempo máximo de funcionamento).",sequencing_label:"Sequenciamento de zonas",sequencing:{sequential:"Sequencial (uma zona de cada vez)",parallel:"Paralelo (todas as zonas em simultâneo)"}},Vn={common:Dn,defaults:On,module:Nn,calcmodules:Pn,panels:Cn,title:Hn,irrigation_start_triggers:In,weather_skip:Ln,coordinate_config:Bn,days_between_irrigation:Un,observed_watering:Rn},qn=Object.freeze({__proto__:null,calcmodules:Pn,common:Dn,coordinate_config:Bn,days_between_irrigation:Un,default:Vn,defaults:On,irrigation_start_triggers:In,module:Nn,observed_watering:Rn,panels:Cn,title:Hn,weather_skip:Ln}),Fn={loading:"Carregando",saving:"Salvando",actions:{delete:"Excluir"},labels:{module:"Módulo",no:"Não",select:"Selecionar",yes:"Sim",enabled:"Ativado",disabled:"Desativado",before:"antes",after:"depois"},units:{seconds:"segundos"},attributes:{size:"tamanho",throughput:"vazão",state:"estado",bucket:"bucket",last_updated:"última atualização",last_calculated:"último cálculo",number_of_data_points:"número de pontos de dados"},"loading-messages":{configuration:"Carregando configuração...",modules:"Carregando módulos...",general:"Carregando..."},"saving-messages":{adding:"Adicionando...",saving:"Salvando..."}},Wn={"default-zone":"Zona padrão","default-mapping":"Grupo de sensores padrão"},Gn={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Observação: esta explicação usa '.' como separador decimal e mostra valores arredondados e métricos. O módulo retornou a deficiência de evapotranspiração ( = et0 * hour_multiplier + precipitação) de","bucket-was":"O bucket era","new-bucket-values-is":"O novo valor do bucket é",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Como bucket < 0, a irrigação é necessária","steps-taken-to-calculate-duration":"Para calcular a duração exata, os seguintes passos foram executados","precipitation-rate-defined-as":"A taxa de precipitação é definida como","duration-is-calculated-as":"A duração é calculada como",drainage:"drainage","drainage-rate":"drainage_rate",hours:"horas","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Agora, o multiplicador é aplicado. O multiplicador é","duration-after-multiplier-is":"portanto a duração é","maximum-duration-is-applied":"Em seguida, a duração máxima é aplicada. A duração máxima é","duration-after-maximum-duration-is":"portanto a duração é","lead-time-is-applied":"Por fim, o tempo de antecedência é aplicado. O tempo de antecedência é","duration-after-lead-time-is":"portanto a duração final é","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Como bucket >= 0, nenhuma irrigação é necessária e a duração é definida como","maximum-bucket-is":"O tamanho máximo do bucket é","drainage-rate-is":"A taxa de drenagem quando saturado (bucket no máximo) é","current-drainage-is":"A drenagem atual é calculada como","no-drainage":"A drenagem atual é 0 porque"}}},Yn={pyeto:{description:"Calcula a duração com base no cálculo FAO56 da biblioteca PyETO"},static:{description:"Módulo 'fictício' com um delta estático configurável"},passthrough:{description:"Módulo de passagem que retorna o valor de um sensor de evapotranspiração como delta"}},Zn={weatherservice:{title:"Serviço de meteorologia",description:"Visualize e altere o serviço de meteorologia usado para obter dados meteorológicos — sem precisar reinstalar a integração. A chave de API é validada e a alteração é aplicada imediatamente.",labels:{"use-weather-service":"Usar um serviço de meteorologia",service:"Serviço de meteorologia","api-key":"Chave de API"},actions:{save:"Salvar",saving:"Salvando…"},messages:{"no-service":"Nenhum serviço de meteorologia é usado — os dados meteorológicos vêm apenas dos seus próprios sensores.",saved:"Serviço de meteorologia atualizado e aplicado.","reload-note":"Salvar valida a chave de API junto ao serviço e aplica a alteração imediatamente."}},backuprestore:{title:"Backup / restauração",description:"Exporte toda a configuração do Smart Irrigation para um arquivo JSON ou restaure-a a partir de um backup anterior.",cards:{backup:{title:"Backup",description:"Baixe a configuração completa (configurações gerais, zonas, módulos e grupos de sensores) como um arquivo JSON."},restore:{title:"Restaurar",description:"Carregue um arquivo JSON exportado anteriormente para substituir a configuração atual."}},actions:{export:"Exportar para JSON","choose-file":"Escolher um arquivo de backup…",restore:"Restaurar este backup",restoring:"Restaurando…"},messages:{exported:"Arquivo de backup baixado.",restored:"Configuração restaurada — recarregando a integração.","invalid-file":"Este arquivo não é um backup válido do Smart Irrigation.","confirm-title":"Substituir toda a configuração?",summary:"Este backup contém","confirm-warning":"A restauração substitui todas as configurações gerais, zonas, módulos e grupos de sensores atuais. Isso não pode ser desfeito.","reload-note":"A restauração substitui tudo e recarrega a integração para aplicar a alteração."}},general:{cards:{"automatic-duration-calculation":{header:"Cálculo automático de duração",description:"O cálculo usa os dados meteorológicos coletados até aquele momento e atualiza o bucket de cada zona automática. Em seguida, a duração é ajustada com base no novo valor do bucket e os dados meteorológicos coletados são removidos.",labels:{"auto-calc-enabled":"Calcular automaticamente as durações de irrigação","calc-time":"Calcular às"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Aviso: horário de atualização dos dados meteorológicos igual ou posterior ao horário de cálculo"},header:"Atualização automática de dados meteorológicos",description:"Colete e armazene dados meteorológicos automaticamente. Os dados meteorológicos são necessários para calcular os buckets e as durações das zonas.",labels:{"auto-update-enabled":"Atualizar dados meteorológicos automaticamente","auto-update-schedule":"Agendamento de atualização","auto-update-time":"Atualizar às","auto-update-interval":"Atualizar dados do sensor a cada","auto-update-delay":"Atraso de atualização"},options:{minutes:"minutos",hours:"horas",days:"dias"}},"automatic-clear":{header:"Limpeza automática de dados meteorológicos",description:"Remova automaticamente os dados meteorológicos coletados em um horário configurado. Use isto para garantir que não haja dados meteorológicos remanescentes de dias anteriores. Não remova os dados meteorológicos antes de calcular e use esta opção apenas se você espera que a atualização automática colete dados meteorológicos após o cálculo do dia. Idealmente, você deve fazer a limpeza o mais tarde possível no dia.",labels:{"automatic-clear-enabled":"Limpar automaticamente os dados meteorológicos coletados","automatic-clear-time":"Limpar dados meteorológicos às"}},continuousupdates:{header:"Atualizações contínuas para sensores (experimental)",description:"Este recurso experimental atualizará continuamente os dados dos sensores. Isto é útil para grupos de sensores que usam fontes que fornecem dados contínuos, como estações meteorológicas. Este recurso não pode ser usado para grupos de sensores que dependem, pelo menos em parte, de serviços de meteorologia, pois a consulta contínua de APIs gera custos. Tenha em mente que isto é experimental e pode não funcionar como esperado. Use por sua conta e risco.",labels:{continuousupdates:"Ativar atualizações contínuas",sensor_debounce:"Debounce do sensor"}}},description:"Esta página fornece configurações globais.",title:"Geral"},help:{title:"Ajuda",cards:{"how-to-get-help":{title:"Como obter ajuda","first-read-the":"Primeiro, leia a",wiki:"Wiki","if-you-still-need-help":"Se ainda precisar de ajuda, entre em contato no","community-forum":"Fórum da comunidade","or-open-a":"ou abra uma","github-issue":"Issue no Github","english-only":"Somente em inglês"}}},info:{title:"Informações",description:"Visualize informações sobre a próxima irrigação e o status do sistema.","configuration-not-available":"Configuração não disponível.",cards:{"zone-bucket-values":{title:"Valores de bucket e duração da zona",labels:{bucket:"Bucket",duration:"Duração"},"no-zones":"Nenhuma zona configurada"},"next-irrigation":{title:"Próxima irrigação",labels:{"next-start":"Próximo início",duration:"Duração",zones:"Zonas"},"no-data":"Nenhum dado disponível"},"irrigation-reason":{title:"Motivo da irrigação",labels:{reason:"Motivo",sunrise:"Nascer do sol","total-duration":"Duração total",explanation:"Explicação"},"no-data":"Nenhum dado disponível"}}},mappings:{cards:{"add-mapping":{actions:{add:"Adicionar grupo de sensores"},header:"Adicionar grupos de sensores"},mapping:{aggregates:{average:"Média",first:"Primeiro",last:"Último",maximum:"Máximo",median:"Mediana",minimum:"Mínimo",riemannsum:"Soma de Riemann",sum:"Soma",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Você não pode excluir este grupo de sensores porque há pelo menos uma zona usando-o.",invalid_source:"Fonte inválida",source_does_not_exist:"A fonte não existe. Insira uma fonte válida, como 'sensor.mysensor'."},items:{dewpoint:"Ponto de orvalho",evapotranspiration:"Evapotranspiração",humidity:"Umidade","maximum temperature":"Temperatura máxima","minimum temperature":"Temperatura mínima",precipitation:"Precipitação total","current precipitation":"Precipitação atual",pressure:"Pressão","solar radiation":"Radiação solar",temperature:"Temperatura",windspeed:"Velocidade do vento"},pressure_types:{absolute:"absoluta",relative:"relativa"},"pressure-type":"A pressão é","sensor-aggregate-of-sensor-values-to-calculate":"dos valores do sensor para calcular a duração","sensor-aggregate-use-the":"Use a","sensor-entity":"Entidade do sensor",static_value:"Valor","input-units":"A entrada fornece valores em",source:"Fonte",sources:{none:"Nenhuma",weather_service:"Serviço de meteorologia",sensor:"Sensor",static:"Valor estático"}}},description:"Adicione um ou mais grupos de sensores que obtêm dados meteorológicos do serviço de meteorologia, de sensores ou de uma combinação destes. Você pode mapear cada grupo de sensores para uma ou mais zonas",labels:{"mapping-name":"Nome"},no_items:"Ainda não há nenhum grupo de sensores definido.",title:"Grupos de sensores","weather-records":{title:"Registros meteorológicos (últimos 10)",timestamp:"Hora",temperature:"Temp",humidity:"Umidade",precipitation:"Precip","retrieval-time":"Obtido","no-data":"Nenhum dado meteorológico disponível para este grupo de sensores"}},modules:{cards:{"add-module":{actions:{add:"Adicionar módulo"},header:"Adicionar módulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Você não pode excluir este módulo porque há pelo menos uma zona usando-o."},labels:{configuration:"Configuração",required:"indica um campo obrigatório"},"translated-options":{DontEstimate:"Não estimar",EstimateFromSunHours:"Estimar a partir das horas de sol",EstimateFromTemp:"Estimar a partir da temperatura",EstimateFromSunHoursAndTemperature:"Estimar a partir da média das horas de sol e da temperatura"}}},description:"Adicione um ou mais módulos que calculam a duração da irrigação. Cada módulo vem com sua própria configuração e pode ser usado para calcular a duração de uma ou mais zonas.",no_items:"Ainda não há nenhum módulo definido.",title:"Módulos"},zones:{actions:{add:"Adicionar",calculate:"Calcular",information:"Informações",update:"Atualizar","reset-bucket":"Redefinir bucket","view-weather-info":"Ver dados meteorológicos","view-weather-info-message":"Dados meteorológicos disponíveis para","view-watering-calendar":"Ver calendário de irrigação"},cards:{"add-zone":{actions:{add:"Adicionar zona"},header:"Adicionar zona"},"zone-actions":{actions:{"calculate-all":"Calcular todas as zonas","update-all":"Atualizar todas as zonas","reset-all-buckets":"Redefinir todos os buckets","clear-all-weatherdata":"Limpar todos os dados meteorológicos"},header:"Ações em todas as zonas"}},description:"Especifique uma ou mais zonas de irrigação aqui. A duração da irrigação é calculada por zona, dependendo do tamanho, da vazão, do estado, do módulo e do grupo de sensores.",labels:{bucket:"Bucket",duration:"Duração","lead-time":"Tempo de antecedência",mapping:"Grupo de sensores","maximum-duration":"Duração máxima",multiplier:"Multiplicador",name:"Nome",size:"Tamanho",state:"Estado",states:{automatic:"Automático",disabled:"Desativado",manual:"Manual"},throughput:"Vazão","maximum-bucket":"Bucket máximo",last_calculated:"Último cálculo","data-last-updated":"Dados atualizados pela última vez","data-number-of-data-points":"Número de pontos de dados",drainage_rate:"Taxa de drenagem","linked-entity":"Válvula/interruptor vinculado","linked-entity-hint":"A válvula ou interruptor que rega esta zona. Sempre que for acionado (uma torneira manual, uma automação ou o próprio Smart Irrigation quando o controle direto da válvula está ativo), o balde é creditado a partir do tempo de funcionamento e da vazão da zona. Necessário para os recursos de malha fechada.","flow-sensor":"Medidor de volume acumulado","flow-sensor-hint":"Para crédito exato em vez de vazão x tempo: um total acumulado de hidrômetro (classe de estado total_increasing), não uma taxa de vazão instantânea. A unidade é lida automaticamente (L, mL, m³, gal, ft³).",optional:"opcional"},no_items:"Ainda não há nenhuma zona definida.",title:"Zonas"}},Kn="Smart Irrigation",Jn={title:"Gatilhos de início de irrigação",description:"Configure quando a irrigação deve começar com base em eventos solares. Você pode adicionar vários gatilhos para diferentes agendamentos. Para gatilhos de nascer do sol, deixar o deslocamento em 0 usará automaticamente a duração total de todas as zonas ativadas.",usage_before:"Quando um gatilho dispara, o Smart Irrigation emite o evento ",usage_after:" — escute-o em uma automação para iniciar a irrigação. Os dados do evento incluem trigger_name, trigger_type e offset_minutes, para que você possa reagir de forma diferente por gatilho. As configurações de pular por precipitação e de dias entre irrigações continuam valendo: em um dia de pulo, nenhum evento é disparado.",add_trigger:"Adicionar gatilho",edit_trigger:"Editar gatilho",delete_trigger:"Excluir gatilho",trigger_types:{sunrise:"Nascer do sol",sunset:"Pôr do sol",solar_azimuth:"Azimute solar"},fields:{name:{name:"Nome do gatilho",description:"Um nome descritivo para identificar este gatilho"},type:{name:"Tipo de gatilho",description:"O tipo de evento solar que aciona o gatilho"},enabled:{name:"Ativado",description:"Se este gatilho está atualmente ativo"},offset_minutes:{name:"Deslocamento (minutos)",description:"Minutos antes (-) ou depois (+) do evento solar. Para gatilhos de nascer do sol, use 0 para o cálculo automático do horário com base na duração total das zonas."},azimuth_angle:{name:"Ângulo de azimute (graus)",description:"Ângulo de azimute solar em graus, onde 0=Norte, 90=Leste, 180=Sul, 270=Oeste"},account_for_duration:{name:"Considerar a duração",description:"Quando ativado, a irrigação começará cedo o suficiente para terminar no horário especificado. Quando desativado, a irrigação começará exatamente no horário especificado."}},dialog:{add_title:"Adicionar gatilho de início de irrigação",edit_title:"Editar gatilho de início de irrigação",cancel:"Cancelar",save:"Salvar",delete:"Excluir",help:"Quando este gatilho dispara, o Smart Irrigation emite o seguinte evento — use-o em uma automação para iniciar a irrigação. Os dados do evento incluem o nome deste gatilho (e o tipo/deslocamento), para que você possa reagir a ele especificamente:"},no_triggers:"Nenhum gatilho de início de irrigação configurado. O sistema usará o comportamento padrão (nascer do sol com a duração total das zonas). Adicione gatilhos para personalizar quando a irrigação começa.",offset_auto:"Automático (calculado a partir da duração total das zonas)",confirm_delete:"Tem certeza de que deseja excluir o gatilho '{name}'?",validation:{name_required:"O nome do gatilho é obrigatório",azimuth_invalid:"O ângulo de azimute deve ser um número válido"},help:{sunrise_offset:"Para gatilhos de nascer do sol: use valores negativos para começar antes do nascer do sol, positivos para começar depois. Defina como 0 para começar automaticamente cedo o suficiente para concluir todas as zonas antes do nascer do sol.",sunset_offset:"Para gatilhos de pôr do sol: use valores negativos para começar antes do pôr do sol, positivos para começar depois do pôr do sol.",azimuth_explanation:"O azimute solar é a direção do sol na bússola. 0°=Norte, 90°=Leste, 180°=Sul, 270°=Oeste. Você pode inserir qualquer valor de ângulo (por exemplo, 450° = 90°, -30° = 330°). Use isto para acionar a irrigação quando o sol atingir uma posição específica.",multiple_triggers:"Você pode configurar vários gatilhos. Cada gatilho ativado agendará os inícios de irrigação de forma independente."},active_label:"Gatilho ativo",active_default:"Padrão (nascer do sol menos a duração total de rega)",active_hint:'Apenas o gatilho selecionado inicia a irrigação, então ela é executada uma vez por dia. "Padrão" cronometra a execução para terminar exatamente ao nascer do sol. Adicione gatilhos personalizados (pôr do sol, azimute, deslocamentos) abaixo e depois escolha um aqui.'},Qn={title:"Pular irrigação com base na meteorologia",description:"Pular automaticamente a irrigação quando houver previsão de precipitação. Este recurso requer um serviço de meteorologia configurado.",threshold_label:"Limite de precipitação",threshold_description:"Quantidade mínima de precipitação (em mm) prevista para hoje e amanhã para pular a irrigação."},Xn={title:"Coordenadas da localização",description:"Configure as coordenadas da localização para a obtenção de dados meteorológicos. Você pode usar coordenadas manuais diferentes da localização do seu Home Assistant, se necessário.",manual_enabled:"Usar coordenadas manuais",use_ha_location:"Usar a localização do Home Assistant",latitude:"Latitude (graus decimais)",longitude:"Longitude (graus decimais)",elevation:"Altitude (metros acima do nível do mar)",current_ha_coords:"Coordenadas atuais do Home Assistant"},er={title:"Dias entre irrigações",description:"Configure o número mínimo de dias que devem se passar entre os eventos de irrigação. Isto ajuda a controlar a frequência de irrigação para conservação de água e manejo da saúde das plantas.\n\nCasos de uso típicos do mundo real:\n• Cuidado com o gramado: intervalos de 1 a 2 dias evitam o excesso de irrigação\n• Restrições de seca: intervalos de 6+ dias para irrigação semanal\n• Plantas de raízes profundas: intervalos de 3 a 7 dias para irrigação menos frequente\n• Conservação de água: personalizável conforme as condições de clima e solo",label:"Mínimo de dias entre irrigações",help_text:"Defina como 0 para desativar este recurso. Valores de 1 a 365 dias são suportados. Esta configuração funciona em conjunto com a lógica de previsão de precipitação existente."},ar={title:"Rega observada (malha fechada)",description:"Credite o balde de cada zona automaticamente a partir da irrigação real, em vez de zerar o balde por uma automação. Depois de ativado, escolha uma entidade de válvula/interruptor por zona na aba Zonas: enquanto estiver aberta, o balde é creditado a partir do tempo de funcionamento e da vazão da zona. Para uma contabilização exata, você também pode escolher um medidor de volume acumulado (um total no estilo de hidrômetro) por zona, e o volume medido é usado em vez disso. Importante: quando isto está ativo, é a única coisa que credita o balde, então remova qualquer chamada reset_bucket da sua automação de irrigação para evitar contagem dupla.",enabled_label:"Ativar rega observada",direct_control_label:"Permitir que o Smart Irrigation controle a válvula",direct_control_description:"Quando ativo, o Smart Irrigation abre a válvula vinculada de cada zona, aguarda a duração calculada e depois a fecha - nenhuma automação necessária. Uma execução em andamento é retomada após uma reinicialização. Segurança: se o Home Assistant ficar fora do ar por muito tempo durante uma execução, a válvula permanece aberta e continua regando, então dê à sua válvula um mecanismo de segurança em hardware (um tempo máximo de funcionamento).",sequencing_label:"Sequenciamento de zonas",sequencing:{sequential:"Sequencial (uma zona por vez)",parallel:"Paralelo (todas as zonas ao mesmo tempo)"}},tr={common:Fn,defaults:Wn,module:Gn,calcmodules:Yn,panels:Zn,title:Kn,irrigation_start_triggers:Jn,weather_skip:Qn,coordinate_config:Xn,days_between_irrigation:er,observed_watering:ar},ir=Object.freeze({__proto__:null,calcmodules:Yn,common:Fn,coordinate_config:Xn,days_between_irrigation:er,default:tr,defaults:Wn,irrigation_start_triggers:Jn,module:Gn,observed_watering:ar,panels:Zn,title:Kn,weather_skip:Qn}),nr={loading:"Загрузка",saving:"Сохранение",actions:{delete:"Удалить"},labels:{module:"Модуль",no:"Нет",select:"Выбрать",yes:"Да",enabled:"Включено",disabled:"Отключено",before:"до",after:"после"},units:{seconds:"секунд"},attributes:{size:"размер",throughput:"пропускная способность",state:"состояние",bucket:"bucket",last_updated:"последнее обновление",last_calculated:"последний расчёт",number_of_data_points:"количество точек данных"},"loading-messages":{configuration:"Загрузка конфигурации…",modules:"Загрузка модулей…",general:"Загрузка…"},"saving-messages":{adding:"Добавление…",saving:"Сохранение…"}},rr={"default-zone":"Зона по умолчанию","default-mapping":"Группа датчиков по умолчанию"},sr={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Примечание: в этом пояснении в качестве десятичного разделителя используется «.», значения округлены и приведены в метрической системе. Модуль вернул дефицит эвапотранспирации ( = et0 * hour_multiplier + precipitation), равный","bucket-was":"Bucket был равен","new-bucket-values-is":"Новое значение bucket равно",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Поскольку bucket < 0, орошение необходимо","steps-taken-to-calculate-duration":"Для расчёта точной длительности были выполнены следующие шаги","precipitation-rate-defined-as":"Интенсивность осадков определяется как","duration-is-calculated-as":"Длительность рассчитывается как",drainage:"drainage","drainage-rate":"drainage_rate",hours:"часов","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Теперь применяется множитель. Множитель равен","duration-after-multiplier-is":"следовательно, длительность равна","maximum-duration-is-applied":"Затем применяется максимальная длительность. Максимальная длительность равна","duration-after-maximum-duration-is":"следовательно, длительность равна","lead-time-is-applied":"Наконец, применяется время упреждения. Время упреждения равно","duration-after-lead-time-is":"следовательно, итоговая длительность равна","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Поскольку bucket >= 0, орошение не требуется, и длительность устанавливается равной","maximum-bucket-is":"Максимальный размер bucket равен","drainage-rate-is":"Интенсивность дренажа при насыщении (bucket на максимуме) равна","current-drainage-is":"Текущий дренаж рассчитывается как","no-drainage":"Текущий дренаж равен 0, потому что"}}},or={pyeto:{description:"Рассчитать длительность на основе расчёта FAO56 из библиотеки PyETO"},static:{description:"«Фиктивный» модуль со статической настраиваемой delta"},passthrough:{description:"Транзитный модуль, который возвращает значение датчика эвапотранспирации в качестве delta"}},lr={weatherservice:{title:"Служба погоды",description:"Просматривайте и изменяйте службу погоды, используемую для получения данных о погоде, — без необходимости переустанавливать интеграцию. API-ключ проверяется, и изменение применяется немедленно.",labels:{"use-weather-service":"Использовать службу погоды",service:"Служба погоды","api-key":"API-ключ"},actions:{save:"Сохранить",saving:"Сохранение…"},messages:{"no-service":"Служба погоды не используется — данные о погоде поступают только с ваших собственных датчиков.",saved:"Служба погоды обновлена и применена.","reload-note":"При сохранении API-ключ проверяется службой, и изменение применяется немедленно."}},backuprestore:{title:"Резервное копирование / восстановление",description:"Экспортируйте полную конфигурацию Smart Irrigation в файл JSON или восстановите её из предыдущей резервной копии.",cards:{backup:{title:"Резервная копия",description:"Скачайте полную конфигурацию (общие настройки, зоны, модули и группы датчиков) в виде файла JSON."},restore:{title:"Восстановление",description:"Загрузите ранее экспортированный файл JSON, чтобы заменить текущую конфигурацию."}},actions:{export:"Экспорт в JSON","choose-file":"Выберите файл резервной копии…",restore:"Восстановить эту резервную копию",restoring:"Восстановление…"},messages:{exported:"Файл резервной копии скачан.",restored:"Конфигурация восстановлена — перезагрузка интеграции.","invalid-file":"Этот файл не является допустимой резервной копией Smart Irrigation.","confirm-title":"Заменить всю конфигурацию?",summary:"Эта резервная копия содержит","confirm-warning":"Восстановление перезаписывает все текущие общие настройки, зоны, модули и группы датчиков. Это действие нельзя отменить.","reload-note":"Восстановление заменяет всё и перезагружает интеграцию для применения изменений."}},general:{cards:{"automatic-duration-calculation":{header:"Автоматический расчёт длительности",description:"Расчёт использует собранные до этого момента данные о погоде и обновляет bucket для каждой автоматической зоны. Затем длительность корректируется на основе нового значения bucket, а собранные данные о погоде удаляются.",labels:{"auto-calc-enabled":"Автоматически рассчитывать длительность орошения","calc-time":"Рассчитывать в"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Предупреждение: время обновления данных о погоде совпадает со временем расчёта или наступает после него"},header:"Автоматическое обновление данных о погоде",description:"Автоматически собирайте и сохраняйте данные о погоде. Данные о погоде необходимы для расчёта bucket и длительности зон.",labels:{"auto-update-enabled":"Автоматически обновлять данные о погоде","auto-update-schedule":"Расписание обновления","auto-update-time":"Обновлять в","auto-update-interval":"Обновлять данные датчиков каждые","auto-update-delay":"Задержка обновления"},options:{minutes:"минут",hours:"часов",days:"дней"}},"automatic-clear":{header:"Автоматическая очистка данных о погоде",description:"Автоматически удаляйте собранные данные о погоде в заданное время. Используйте это, чтобы убедиться, что не остаётся данных о погоде с предыдущих дней. Не удаляйте данные о погоде до выполнения расчёта и используйте эту опцию только в том случае, если ожидаете, что автоматическое обновление соберёт данные о погоде уже после расчёта за день. В идеале очистку следует выполнять как можно позже в течение дня.",labels:{"automatic-clear-enabled":"Автоматически очищать собранные данные о погоде","automatic-clear-time":"Очищать данные о погоде в"}},continuousupdates:{header:"Непрерывные обновления датчиков (экспериментально)",description:"Эта экспериментальная функция будет непрерывно обновлять данные датчиков. Это полезно для групп датчиков, использующих источники с непрерывными данными, такие как метеостанции. Эту функцию нельзя использовать для групп датчиков, которые хотя бы частично полагаются на службы погоды, поскольку непрерывный опрос API повлечёт за собой расходы. Помните, что это экспериментальная функция, и она может работать не так, как ожидается. Используйте на свой страх и риск.",labels:{continuousupdates:"Включить непрерывные обновления",sensor_debounce:"Подавление дребезга датчиков"}}},description:"На этой странице приведены глобальные настройки.",title:"Общие"},help:{title:"Справка",cards:{"how-to-get-help":{title:"Как получить помощь","first-read-the":"Сначала прочитайте",wiki:"Wiki","if-you-still-need-help":"Если вам всё ещё нужна помощь, обратитесь на","community-forum":"Форум сообщества","or-open-a":"или откройте","github-issue":"Issue на Github","english-only":"Только на английском"}}},info:{title:"Информация",description:"Просмотр информации о следующем орошении и состоянии системы.","configuration-not-available":"Конфигурация недоступна.",cards:{"zone-bucket-values":{title:"Значения bucket зон и длительность",labels:{bucket:"Bucket",duration:"Длительность"},"no-zones":"Зоны не настроены"},"next-irrigation":{title:"Следующее орошение",labels:{"next-start":"Следующий запуск",duration:"Длительность",zones:"Зоны"},"no-data":"Нет доступных данных"},"irrigation-reason":{title:"Причина орошения",labels:{reason:"Причина",sunrise:"Восход","total-duration":"Общая длительность",explanation:"Пояснение"},"no-data":"Нет доступных данных"}}},mappings:{cards:{"add-mapping":{actions:{add:"Добавить группу датчиков"},header:"Добавить группы датчиков"},mapping:{aggregates:{average:"Среднее",first:"Первое",last:"Последнее",maximum:"Максимум",median:"Медиана",minimum:"Минимум",riemannsum:"Сумма Римана",sum:"Сумма",delta:"Дельта"},errors:{"cannot-delete-mapping-because-zones-use-it":"Вы не можете удалить эту группу датчиков, поскольку её использует хотя бы одна зона.",invalid_source:"Недопустимый источник",source_does_not_exist:"Источник не существует. Введите допустимый источник, например «sensor.mysensor»."},items:{dewpoint:"Точка росы",evapotranspiration:"Эвапотранспирация",humidity:"Влажность","maximum temperature":"Максимальная температура","minimum temperature":"Минимальная температура",precipitation:"Суммарные осадки","current precipitation":"Текущие осадки",pressure:"Давление","solar radiation":"Солнечная радиация",temperature:"Температура",windspeed:"Скорость ветра"},pressure_types:{absolute:"абсолютное",relative:"относительное"},"pressure-type":"Давление","sensor-aggregate-of-sensor-values-to-calculate":"значений датчиков для расчёта длительности","sensor-aggregate-use-the":"Использовать","sensor-entity":"Объект датчика",static_value:"Значение","input-units":"Входные данные предоставляются в",source:"Источник",sources:{none:"Нет",weather_service:"Служба погоды",sensor:"Датчик",static:"Статическое значение"}}},description:"Добавьте одну или несколько групп датчиков, которые получают данные о погоде от службы погоды, от датчиков или их сочетания. Вы можете сопоставить каждую группу датчиков с одной или несколькими зонами",labels:{"mapping-name":"Имя"},no_items:"Группы датчиков пока не определены.",title:"Группы датчиков","weather-records":{title:"Записи о погоде (последние 10)",timestamp:"Время",temperature:"Темп.",humidity:"Влажность",precipitation:"Осадки","retrieval-time":"Получено","no-data":"Нет доступных данных о погоде для этой группы датчиков"}},modules:{cards:{"add-module":{actions:{add:"Добавить модуль"},header:"Добавить модуль"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Вы не можете удалить этот модуль, поскольку его использует хотя бы одна зона."},labels:{configuration:"Конфигурация",required:"обозначает обязательное поле"},"translated-options":{DontEstimate:"Не оценивать",EstimateFromSunHours:"Оценивать по часам солнечного света",EstimateFromTemp:"Оценивать по температуре",EstimateFromSunHoursAndTemperature:"Оценивать по среднему значению часов солнечного света и температуры"}}},description:"Добавьте один или несколько модулей, которые рассчитывают длительность орошения. Каждый модуль имеет собственную конфигурацию и может использоваться для расчёта длительности для одной или нескольких зон.",no_items:"Модули пока не определены.",title:"Модули"},zones:{actions:{add:"Добавить",calculate:"Рассчитать",information:"Информация",update:"Обновить","reset-bucket":"Сбросить bucket","view-weather-info":"Просмотреть данные о погоде","view-weather-info-message":"Данные о погоде доступны для","view-watering-calendar":"Просмотреть календарь полива"},cards:{"add-zone":{actions:{add:"Добавить зону"},header:"Добавить зону"},"zone-actions":{actions:{"calculate-all":"Рассчитать все зоны","update-all":"Обновить все зоны","reset-all-buckets":"Сбросить все bucket","clear-all-weatherdata":"Очистить все данные о погоде"},header:"Действия для всех зон"}},description:"Укажите здесь одну или несколько зон орошения. Длительность орошения рассчитывается для каждой зоны в зависимости от размера, пропускной способности, состояния, модуля и группы датчиков.",labels:{bucket:"Bucket",duration:"Длительность","lead-time":"Время упреждения",mapping:"Группа датчиков","maximum-duration":"Максимальная длительность",multiplier:"Множитель",name:"Имя",size:"Размер",state:"Состояние",states:{automatic:"Автоматически",disabled:"Отключено",manual:"Вручную"},throughput:"Пропускная способность","maximum-bucket":"Максимальный bucket",last_calculated:"Последний расчёт","data-last-updated":"Последнее обновление данных","data-number-of-data-points":"Количество точек данных",drainage_rate:"Интенсивность дренажа","linked-entity":"Связанный клапан/переключатель","linked-entity-hint":"Клапан или переключатель, который поливает эту зону. Каждый раз, когда он работает (ручное открытие крана, автоматизация или сама Smart Irrigation при включённом прямом управлении клапаном), bucket пополняется на основе времени работы и пропускной способности зоны. Обязательно для функций замкнутого контура.","flow-sensor":"Счётчик накопленного объёма","flow-sensor-hint":"Для точного учёта вместо «пропускная способность x время»: накопительный показатель водомера (класс состояния total_increasing), а не мгновенный расход. Единица измерения считывается автоматически (L, mL, m³, gal, ft³).",optional:"необязательно"},no_items:"Зоны пока не определены.",title:"Зоны"}},dr="Smart Irrigation",ur={title:"Триггеры запуска орошения",description:"Настройте, когда должно начинаться орошение, на основе солнечных событий. Вы можете добавить несколько триггеров для разных расписаний. Для триггеров восхода оставление смещения равным 0 автоматически использует общую длительность всех включённых зон.",usage_before:"Когда триггер срабатывает, Smart Irrigation генерирует событие ",usage_after:" — слушайте его в автоматизации, чтобы запустить полив. Данные события включают trigger_name, trigger_type и offset_minutes, поэтому вы можете реагировать по-разному для каждого триггера. Настройки пропуска при осадках и количества дней между орошениями по-прежнему действуют: в день пропуска событие не генерируется.",add_trigger:"Добавить триггер",edit_trigger:"Редактировать триггер",delete_trigger:"Удалить триггер",trigger_types:{sunrise:"Восход",sunset:"Закат",solar_azimuth:"Солнечный азимут"},fields:{name:{name:"Имя триггера",description:"Описательное имя для идентификации этого триггера"},type:{name:"Тип триггера",description:"Тип солнечного события для срабатывания"},enabled:{name:"Включено",description:"Активен ли этот триггер в данный момент"},offset_minutes:{name:"Смещение (минуты)",description:"Минуты до (-) или после (+) солнечного события. Для триггеров восхода используйте 0 для автоматического расчёта времени на основе общей длительности зон."},azimuth_angle:{name:"Угол азимута (градусы)",description:"Солнечный азимутальный угол в градусах, где 0=Север, 90=Восток, 180=Юг, 270=Запад"},account_for_duration:{name:"Учитывать длительность",description:"Когда включено, орошение начнётся достаточно рано, чтобы завершиться в указанное время. Когда отключено, орошение начнётся точно в указанное время."}},dialog:{add_title:"Добавить триггер запуска орошения",edit_title:"Редактировать триггер запуска орошения",cancel:"Отмена",save:"Сохранить",delete:"Удалить",help:"Когда этот триггер срабатывает, Smart Irrigation генерирует следующее событие — используйте его в автоматизации, чтобы запустить полив. Данные события включают имя этого триггера (а также тип/смещение), поэтому вы можете реагировать на него отдельно:"},no_triggers:"Триггеры запуска орошения не настроены. Система будет использовать поведение по умолчанию (восход с общей длительностью зон). Добавьте триггеры, чтобы настроить, когда начинается орошение.",offset_auto:"Авто (рассчитывается из общей длительности зон)",confirm_delete:"Вы уверены, что хотите удалить триггер «{name}»?",validation:{name_required:"Имя триггера обязательно",azimuth_invalid:"Угол азимута должен быть допустимым числом"},help:{sunrise_offset:"Для триггеров восхода: используйте отрицательные значения, чтобы начать до восхода, положительные — чтобы начать после. Установите 0, чтобы автоматически начать достаточно рано для завершения всех зон до восхода.",sunset_offset:"Для триггеров заката: используйте отрицательные значения, чтобы начать до заката, положительные — чтобы начать после заката.",azimuth_explanation:"Солнечный азимут — это направление на солнце по компасу. 0°=Север, 90°=Восток, 180°=Юг, 270°=Запад. Вы можете ввести любое значение угла (например, 450° = 90°, -30° = 330°). Используйте это, чтобы запускать орошение, когда солнце достигает определённого положения.",multiple_triggers:"Вы можете настроить несколько триггеров. Каждый включённый триггер будет независимо планировать запуски орошения."},active_label:"Активный триггер",active_default:"По умолчанию (восход минус общая продолжительность полива)",active_hint:"Полив запускает только выбранный триггер, поэтому он срабатывает один раз в день. «По умолчанию» рассчитывает время так, чтобы полив завершился точно к восходу. Добавьте пользовательские триггеры (закат, азимут, смещения) ниже, затем выберите один из них здесь."},cr={title:"Пропуск орошения на основе погоды",description:"Автоматически пропускать орошение, когда прогнозируются осадки. Для этой функции требуется настроенная служба погоды.",threshold_label:"Порог осадков",threshold_description:"Минимальное количество осадков (в мм), прогнозируемых на сегодня и завтра, для пропуска орошения."},pr={title:"Координаты местоположения",description:"Настройте координаты местоположения для получения данных о погоде. При необходимости вы можете использовать координаты, отличные от местоположения Home Assistant.",manual_enabled:"Использовать координаты вручную",use_ha_location:"Использовать местоположение Home Assistant",latitude:"Широта (десятичные градусы)",longitude:"Долгота (десятичные градусы)",elevation:"Высота (метры над уровнем моря)",current_ha_coords:"Текущие координаты Home Assistant"},mr={title:"Дни между орошениями",description:"Настройте минимальное количество дней, которое должно пройти между событиями орошения. Это помогает контролировать частоту полива для экономии воды и поддержания здоровья растений.\n\nТипичные сценарии использования в реальной жизни:\n• Уход за газоном: интервалы 1-2 дня предотвращают переувлажнение\n• Ограничения при засухе: интервалы 6+ дней для еженедельного полива\n• Растения с глубокой корневой системой: интервалы 3-7 дней для менее частого полива\n• Экономия воды: настраивается в зависимости от климата и состояния почвы",label:"Минимальное количество дней между орошениями",help_text:"Установите 0, чтобы отключить эту функцию. Поддерживаются значения от 1 до 365 дней. Эта настройка работает совместно с существующей логикой прогнозирования осадков."},gr={title:"Наблюдаемый полив (замкнутый контур)",description:"Автоматически пополняйте bucket каждой зоны на основе реального полива вместо сброса bucket из автоматизации. После включения выберите для каждой зоны сущность клапана/переключателя на вкладке «Зоны»: пока он открыт, bucket пополняется на основе времени работы и пропускной способности зоны. Для точного учёта можно также выбрать для каждой зоны счётчик накопленного объёма (показатель типа водомера), и тогда используется измеренный объём. Важно: когда эта функция включена, она является единственным источником пополнения bucket, поэтому удалите все вызовы reset_bucket из вашей автоматизации полива, чтобы избежать двойного учёта.",enabled_label:"Включить наблюдаемый полив",direct_control_label:"Разрешить Smart Irrigation управлять клапаном",direct_control_description:"Когда включено, Smart Irrigation открывает связанный клапан каждой зоны, ждёт рассчитанную продолжительность, затем закрывает его — автоматизация не нужна. Текущий полив возобновляется после перезапуска. Безопасность: если Home Assistant надолго отключится во время полива, клапан останется открытым и продолжит полив, поэтому обеспечьте клапану аппаратную защиту (максимальное время работы).",sequencing_label:"Последовательность зон",sequencing:{sequential:"Последовательно (по одной зоне за раз)",parallel:"Параллельно (все зоны одновременно)"}},hr={common:nr,defaults:rr,module:sr,calcmodules:or,panels:lr,title:dr,irrigation_start_triggers:ur,weather_skip:cr,coordinate_config:pr,days_between_irrigation:mr,observed_watering:gr},vr=Object.freeze({__proto__:null,calcmodules:or,common:nr,coordinate_config:pr,days_between_irrigation:mr,default:hr,defaults:rr,irrigation_start_triggers:ur,module:sr,observed_watering:gr,panels:lr,title:dr,weather_skip:cr}),fr={loading:"Načítava sa",saving:"Ukladá sa",actions:{delete:"Zmazať"},labels:{module:"Modul",no:"Nie",select:"Zvoliť",yes:"Áno",enabled:"Povolené",disabled:"Zakázané",before:"pred",after:"po"},units:{seconds:"sekúnd"},attributes:{size:"size",throughput:"priepustnosť",state:"stav",bucket:"nádoba",last_updated:"naposledy aktualizované",last_calculated:"naposledy vypočítané",number_of_data_points:"počet dátových bodov"},"loading-messages":{configuration:"Načítava sa konfigurácia…",modules:"Načítavajú sa moduly…",general:"Načítava sa…"},"saving-messages":{adding:"Pridáva sa…",saving:"Ukladá sa…"}},br={"default-zone":"Predvolená zóna","default-mapping":"Predvolená skupina snímačov"},kr={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Poznámka: toto vysvetlenie používa '.' ako oddeľovač desatinných miest zobrazuje zaokrúhlené a metrické hodnoty. Modul vrátil nedostatok evapotranspirácie","bucket-was":"Vedro bolo","new-bucket-values-is":"Hodnota nového vedra je",bucket:"vedro","old-bucket-variable":"staré_vedro","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Keďže vedro < 0, je potrebné zavlažovanie","steps-taken-to-calculate-duration":"Na výpočet presného trvania sa vykonali nasledujúce kroky","precipitation-rate-defined-as":"Miera zrážok je definovaná ako","duration-is-calculated-as":"Trvanie sa vypočíta ako",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hodín","precipitation-rate-variable":"úhrn zrážok","multiplier-is-applied":"Teraz sa použije multiplikátor. Násobiteľ je","duration-after-multiplier-is":"teda trvanie je","maximum-duration-is-applied":"Potom sa použije maximálne trvanie. Maximálne trvanie je","duration-after-maximum-duration-is":"teda trvanie je","lead-time-is-applied":"Nakoniec sa použije dodacia lehota. Dodacia lehota je","duration-after-lead-time-is":"teda konečné trvanie je","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Keďže vedro >= 0, nie je potrebné žiadne zavlažovanie a trvanie je nastavené na","maximum-bucket-is":"maximálna veľkosť vedra je","drainage-rate-is":"Rýchlosť odvodnenia pri nasýtení (bucket na maxime) je","current-drainage-is":"Aktuálne odvodnenie sa vypočíta ako","no-drainage":"Aktuálne odvodnenie je 0, pretože"}}},yr={pyeto:{description:"Vypočítajte trvanie na základe výpočtu FAO56 z knižnice PyETO"},static:{description:"'Atrapa' modul so statickou konfigurovateľnou deltou"},passthrough:{description:"Priechodný modul, ktorý vracia hodnotu evapotranspiračného senzora ako delta"}},_r={weatherservice:{title:"Poveternostná služba",description:"Zobrazte a zmeňte poveternostnú službu používanú na získavanie meteorologických údajov — bez potreby preinštalovať integráciu. API kľúč sa overí a zmena sa použije okamžite.",labels:{"use-weather-service":"Použiť poveternostnú službu",service:"Poveternostná služba","api-key":"API kľúč"},actions:{save:"Uložiť",saving:"Ukladá sa…"},messages:{"no-service":"Nepoužíva sa žiadna poveternostná služba — meteorologické údaje pochádzajú iba z vašich vlastných senzorov.",saved:"Poveternostná služba aktualizovaná a použitá.","reload-note":"Pri uložení sa API kľúč overí voči službe a zmena sa použije okamžite."}},backuprestore:{title:"Zálohovanie / obnovenie",description:"Exportujte celú konfiguráciu Smart Irrigation do súboru JSON alebo ju obnovte z predchádzajúcej zálohy.",cards:{backup:{title:"Záloha",description:"Stiahnite si celú konfiguráciu (všeobecné nastavenia, zóny, moduly a skupiny senzorov) ako súbor JSON."},restore:{title:"Obnoviť",description:"Načítajte predtým exportovaný súbor JSON na nahradenie aktuálnej konfigurácie."}},actions:{export:"Exportovať do JSON","choose-file":"Vyberte súbor zálohy…",restore:"Obnoviť túto zálohu",restoring:"Obnovuje sa…"},messages:{exported:"Súbor zálohy stiahnutý.",restored:"Konfigurácia obnovená — integrácia sa znova načítava.","invalid-file":"Tento súbor nie je platná záloha Smart Irrigation.","confirm-title":"Nahradiť celú konfiguráciu?",summary:"Táto záloha obsahuje","confirm-warning":"Obnovenie prepíše všetky aktuálne všeobecné nastavenia, zóny, moduly a skupiny senzorov. Túto akciu nemožno vrátiť späť.","reload-note":"Obnovenie nahradí všetko a znova načíta integráciu, aby sa zmena prejavila."}},general:{cards:{"automatic-duration-calculation":{header:"Automatický výpočet trvania",description:"Výpočet berie zhromaždené údaje o počasí až do tohto bodu a aktualizuje vedro pre každú automatickú zónu. Potom sa trvanie upraví na základe novej hodnoty segmentu a zhromaždené údaje o počasí sa odstránia.",labels:{"auto-calc-enabled":"Automaticky vypočítajte trvanie zón","calc-time":"Vypočítať o"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Upozornenie: Čas aktualizácie údajov o počasí v čase výpočtu alebo po ňom"},header:"Automatic weather data update",description:"Automaticky zbierajte a ukladajte údaje o počasí. Údaje o počasí sú potrebné na výpočet segmentov zón a trvania.",labels:{"auto-update-enabled":"Automaticky aktualizovať údaje o počasí","auto-update-schedule":"Plán aktualizácie","auto-update-time":"Aktualizovať o","auto-update-interval":"Aktualizujte údaje snímača každý","auto-update-delay":"Oneskorenie aktualizácie"},options:{minutes:"minúty",hours:"hodiny",days:"dni"}},"automatic-clear":{header:"Automatické orezávanie údajov o počasí",description:"Automaticky odstráňte zhromaždené údaje o počasí v nakonfigurovanom čase. Použite to, aby ste sa uistili, že nezostali žiadne údaje o počasí z predchádzajúcich dní. Neodstraňujte údaje o počasí pred výpočtom a túto možnosť použite iba vtedy, ak očakávate, že automatická aktualizácia bude zhromažďovať údaje o počasí až po výpočte na daný deň. V ideálnom prípade chcete prerezávať tak neskoro, ako je to možné.",labels:{"automatic-clear-enabled":"Automaticky vymazať zhromaždené údaje o počasí","automatic-clear-time":"Vymazať údaje o počasí o"}},continuousupdates:{header:"Nepretržité aktualizácie pre senzory (experimentálne)",description:"Táto experimentálna funkcia nepretržite aktualizuje údaje senzorov. Je užitočná pre skupiny senzorov, ktoré používajú zdroje s nepretržitými údajmi, ako sú meteorologické stanice. Túto funkciu nemožno použiť pre skupiny senzorov, ktoré sa aspoň čiastočne spoliehajú na poveternostné služby, pretože nepretržité dopytovanie API spôsobuje náklady. Majte na pamäti, že je to experimentálne a nemusí to fungovať podľa očakávania. Použitie na vlastné riziko.",labels:{continuousupdates:"Povoliť nepretržité aktualizácie",sensor_debounce:"Debounce senzora"}}},description:"Táto stránka poskytuje globálne nastavenia.",title:"Všeobecné"},help:{title:"Pomoc",cards:{"how-to-get-help":{title:"Ako získať pomoc","first-read-the":"Najprv si prečítajte",wiki:"Wiki","if-you-still-need-help":"Ak stále potrebujete pomoc, obráťte sa na","community-forum":"komunitné fórum","or-open-a":"alebo otvorte a","github-issue":"Problém Github","english-only":"len anglicky"}}},info:{title:"Informácie",description:"Zobraziť informácie o ďalšom zavlažovaní a stave systému.","configuration-not-available":"Konfigurácia nie je k dispozícii.",cards:{"zone-bucket-values":{title:"Hodnoty bucket a trvanie podľa zóny",labels:{bucket:"Bucket",duration:"Trvanie"},"no-zones":"Nie sú nakonfigurované žiadne zóny"},"next-irrigation":{title:"Ďalšie zavlažovanie",labels:{"next-start":"Ďalší štart",duration:"Trvanie",zones:"Zóny"},"no-data":"Žiadne údaje k dispozícii"},"irrigation-reason":{title:"Dôvod zavlažovania",labels:{reason:"Dôvod",sunrise:"Východ slnka","total-duration":"Celkové trvanie",explanation:"Vysvetlenie"},"no-data":"Žiadne údaje k dispozícii"}}},mappings:{cards:{"add-mapping":{actions:{add:"Pridať skupinu snímačov"},header:"Pridajte skupiny senzorov"},mapping:{aggregates:{average:"Priemer",first:"Prvý",last:"Posledný",maximum:"Maximum",median:"Medián",minimum:"Minimum",riemannsum:"Riemannova suma",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Túto skupinu senzorov nemôžete vymazať, pretože ju používa aspoň jedna zóna.",invalid_source:"Neplatný zdroj",source_does_not_exist:'Zdroj neexistuje. Zadajte platný zdroj, napríklad "sensor.mysensor".'},items:{dewpoint:"Rosný bod",evapotranspiration:"Evapotranspirácia",humidity:"Vlhkosť","maximum temperature":"Maximálna teplota","minimum temperature":"Minimálna teplota",precipitation:"Úhrn zrážok","current precipitation":"Aktuálne zrážky",pressure:"Tlak","solar radiation":"Slnečné žiarenie",temperature:"Teplota",windspeed:"Rýchlosť vetra"},pressure_types:{absolute:"absolútne",relative:"relatítne"},"pressure-type":"Tlak je","sensor-aggregate-of-sensor-values-to-calculate":"hodnôt snímača na výpočet trvania","sensor-aggregate-use-the":"Použiť","sensor-entity":"Entita snímača",static_value:"Hodnota","input-units":"Vstup poskytuje hodnoty v",source:"Zdroj",sources:{none:"Nie je",weather_service:"Weather service",sensor:"Snímač",static:"Statická hodnota"}}},description:"Pridajte jednu alebo viac skupín senzorov, ktoré získavajú údaje o počasí z Weather service, zo senzorov alebo ich kombinácie. Každú skupinu senzorov môžete namapovať na jednu alebo viac zón",labels:{"mapping-name":"Názov"},no_items:"Zatiaľ nie je definovaná žiadna skupina senzorov.",title:"Skupiny senzorov","weather-records":{title:"Záznamy o počasí (posledných 10)",timestamp:"Čas",temperature:"Tepl.",humidity:"Vlhkosť",precipitation:"Zrážky","retrieval-time":"Získané","no-data":"Pre túto skupinu senzorov nie sú k dispozícii žiadne meteorologické údaje"}},modules:{cards:{"add-module":{actions:{add:"Pridať modul"},header:"Pridať modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Tento modul nemôžete vymazať, pretože ho používa aspoň jedna zóna."},labels:{configuration:"Konfigurácia",required:"označuje povinné pole"},"translated-options":{DontEstimate:"Bez odhadu",EstimateFromSunHours:"Odhad zo slnečných hodín",EstimateFromTemp:"Odhad z teploty",EstimateFromSunHoursAndTemperature:"Odhad z priemeru hodín slnečného svitu a teploty"}}},description:"Pridajte jeden alebo viac modulov, ktoré vypočítavajú trvanie zavlažovania. Každý modul sa dodáva s vlastnou konfiguráciou a možno ho použiť na výpočet trvania pre jednu alebo viac zón.",no_items:"Zatiaľ nie sú definované žiadne moduly.",title:"Moduly"},zones:{actions:{add:"Pridať",calculate:"Vypočítať",information:"Informácia",update:"Aktualizovať","reset-bucket":"Resetovať vedro","view-weather-info":"Zobraziť meteorologické údaje","view-weather-info-message":"Meteorologické údaje k dispozícii pre","view-watering-calendar":"Zobraziť kalendár zavlažovania"},cards:{"add-zone":{actions:{add:"Pridať zónu"},header:"Pridať zónu"},"zone-actions":{actions:{"calculate-all":"Vypočítajte všetky zóny","update-all":"Aktualizujte všetky zóny","reset-all-buckets":"Obnovte všetky vedrá","clear-all-weatherdata":"Vymazať všetky údaje o počasí"},header:"Akcie vo všetkých zónach"}},description:"Tu špecifikujte jednu alebo viac zavlažovacích zón. Trvanie zavlažovania sa vypočíta pre zónu v závislosti od veľkosti, výkonu, stavu, modulu a skupiny senzorov.",labels:{bucket:"Vedro",duration:"Trvanie","lead-time":"Dodacia lehota",mapping:"Skupina senzorov","maximum-duration":"Maximálne trvanie",multiplier:"Násobiteľ",name:"Názov",size:"Veľkosť",state:"Stav",states:{automatic:"Automatický",disabled:"Zakázaný",manual:"Manuány"},throughput:"Priepustnosť","maximum-bucket":"Maximálne vedro",last_calculated:"Naposledy vypočítané","data-last-updated":"Údaje boli naposledy aktualizované","data-number-of-data-points":"Počet údajových bodov",drainage_rate:"Rýchlosť odvodnenia","linked-entity":"Prepojený ventil/spínač","linked-entity-hint":"Ventil alebo spínač, ktorý zavlažuje túto zónu. Vždy keď je spustený (ručným kohútikom, automatizáciou alebo samotnou Smart Irrigation pri zapnutom priamom ovládaní ventilu), sa do nádoby pripíše hodnota z času behu a priepustnosti zóny. Vyžaduje sa pre funkcie uzavretej slučky.","flow-sensor":"Kumulatívny merač objemu","flow-sensor-hint":"Pre presné pripisovanie namiesto priepustnosť x čas: kumulatívny celkový stav vodomeru (trieda stavu total_increasing), nie okamžitý prietok. Jednotka sa načíta automaticky (L, mL, m³, gal, ft³).",optional:"voliteľné"},no_items:"Zatiaľ nie sú definované žiadne zóny.",title:"Zóny"}},zr="Inteligentné zavlažovanie",wr={title:"Spúšťače spustenia zavlažovania",description:"Nastavte, kedy sa má spustiť zavlažovanie na základe slnečných udalostí. Môžete pridať viacero spúšťačov pre rôzne plány. Pri spúšťačoch východu slnka sa ponechaním posunu na 0 automaticky použije celkové trvanie všetkých povolených zón.",usage_before:"Keď sa spúšťač spustí, Smart Irrigation odošle udalosť ",usage_after:" — počúvajte ju v automatizácii na spustenie zavlažovania. Údaje udalosti obsahujú trigger_name, trigger_type a offset_minutes, takže môžete reagovať odlišne pre každý spúšťač. Nastavenia preskočenia pri zrážkach a dní medzi zavlažovaniami stále platia: v deň preskočenia sa neodošle žiadna udalosť.",add_trigger:"Pridať spúšťač",edit_trigger:"Upraviť spúšťač",delete_trigger:"Odstrániť spúšťač",trigger_types:{sunrise:"Východ slnka",sunset:"Západ slnka",solar_azimuth:"Slnečný azimut"},fields:{name:{name:"Názov spúšťača",description:"Popisný názov na identifikáciu tohto spúšťača"},type:{name:"Typ spúšťača",description:"Typ slnečnej udalosti, na ktorú sa má spustiť"},enabled:{name:"Povolené",description:"Či je tento spúšťač momentálne aktívny"},offset_minutes:{name:"Posun (minúty)",description:"Minúty pred (-) alebo po (+) slnečnej udalosti. Pri spúšťačoch východu slnka použite 0 pre automatické načasovanie podľa celkového trvania zón."},azimuth_angle:{name:"Azimutový uhol (stupne)",description:"Azimutový uhol slnka v stupňoch, kde 0=Sever, 90=Východ, 180=Juh, 270=Západ"},account_for_duration:{name:"Zohľadniť trvanie",description:"Keď je povolené, zavlažovanie sa spustí dostatočne skoro, aby skončilo v zadanom čase. Keď je zakázané, zavlažovanie sa spustí presne v zadanom čase."}},dialog:{add_title:"Pridať spúšťač spustenia zavlažovania",edit_title:"Upraviť spúšťač spustenia zavlažovania",cancel:"Zrušiť",save:"Uložiť",delete:"Odstrániť",help:"Keď sa tento spúšťač spustí, Smart Irrigation odošle nasledujúcu udalosť — použite ju v automatizácii na spustenie zavlažovania. Údaje udalosti obsahujú názov tohto spúšťača (a typ/posun), takže naň môžete reagovať konkrétne:"},no_triggers:"Nie sú nakonfigurované žiadne spúšťače spustenia zavlažovania. Systém použije predvolené správanie (východ slnka s celkovým trvaním zón). Pridajte spúšťače na prispôsobenie času spustenia zavlažovania.",offset_auto:"Automaticky (vypočítané z celkového trvania zón)",confirm_delete:"Naozaj chcete odstrániť spúšťač „{name}“?",validation:{name_required:"Názov spúšťača je povinný",azimuth_invalid:"Azimutový uhol musí byť platné číslo"},help:{sunrise_offset:"Pre spúšťače východu slnka: použite záporné hodnoty na spustenie pred východom slnka, kladné na spustenie po ňom. Nastavte na 0, aby sa spustenie automaticky začalo dostatočne skoro a všetky zóny sa dokončili pred východom slnka.",sunset_offset:"Pre spúšťače západu slnka: použite záporné hodnoty na spustenie pred západom slnka, kladné na spustenie po západe slnka.",azimuth_explanation:"Slnečný azimut je smer kompasu k slnku. 0°=Sever, 90°=Východ, 180°=Juh, 270°=Západ. Môžete zadať akúkoľvek hodnotu uhla (napr. 450°=90°, -30°=330°). Použite to na spustenie zavlažovania, keď slnko dosiahne konkrétnu polohu.",multiple_triggers:"Môžete nakonfigurovať viacero spúšťačov. Každý povolený spúšťač naplánuje spustenie zavlažovania nezávisle."},active_label:"Aktívny spúšťač",active_default:"Predvolené (východ slnka mínus celková doba zavlažovania)",active_hint:'Zavlažovanie spúšťa len vybraný spúšťač, takže prebehne raz za deň. "Predvolené" načasuje beh tak, aby skončil presne pri východe slnka. Nižšie pridajte vlastné spúšťače (západ slnka, azimut, posuny) a potom tu jeden vyberte.'},xr={title:"Preskočenie zavlažovania na základe počasia",description:"Automaticky preskočiť zavlažovanie, keď sú predpovedané zrážky. Táto funkcia vyžaduje nakonfigurovanú poveternostnú službu.",threshold_label:"Prah zrážok",threshold_description:"Minimálne množstvo zrážok (v mm) predpovedané na dnes a zajtra na preskočenie zavlažovania."},jr={title:"Súradnice Polohy",description:"Nakonfigurujte súradnice polohy pre získavanie meteorologických údajov. Môžete použiť manuálne súradnice odlišné od vašej polohy Home Assistant ak je to potrebné.",manual_enabled:"Použiť manuálne súradnice",use_ha_location:"Použiť polohu Home Assistant",latitude:"Zemepisná šírka (desatinné stupne)",longitude:"Zemepisná dĺžka (desatinné stupne)",elevation:"Nadmorská výška (metre nad morom)",current_ha_coords:"Aktuálne súradnice Home Assistant"},Sr={title:"Dni Medzi Zavlažovaním",description:"Nakonfigurujte minimálny počet dní, ktoré musia uplynúť medzi udalosťami zavlažovania. Toto pomáha kontrolovať frekvenciu zavlažovania pre úsporu vody a správu zdravia rastlín.\n\nTypické prípady použitia:\n• Starostlivosť o trávnik: intervaly 1-2 dní zabránia nadmernému zalievaniu\n• Obmedzenia sucha: intervaly 6+ dní pre týždenné zalievanie\n• Hlbokokorenné rastliny: intervaly 3-7 dní pre menej časté zalievanie\n• Úspora vody: prispôsobiteľné na základe podnebia a podmienok pôdy",label:"Minimálne dni medzi zavlažovaním",help_text:"Nastavte na 0 pre deaktiváciu tejto funkcie. Podporované sú hodnoty 1-365 dní. Toto nastavenie funguje spolu s existujúcou logikou predpovede zrážok."},Ar={title:"Sledované zavlažovanie (uzavretá slučka)",description:"Automaticky pripisuje do nádoby každej zóny zo skutočného zavlažovania namiesto resetovania nádoby z automatizácie. Po zapnutí vyberte v záložke Zóny pre každú zónu entitu ventilu/spínača: kým je otvorený, do nádoby sa pripisuje hodnota z času behu a priepustnosti zóny. Pre presné účtovanie môžete pre každú zónu vybrať aj kumulatívny merač objemu (celkový stav v štýle vodomeru), a použije sa nameraný objem. Dôležité: keď je toto zapnuté, je to jediná vec, ktorá pripisuje do nádoby, preto odstráňte zo svojej zavlažovacej automatizácie každé volanie reset_bucket, aby ste predišli dvojitému počítaniu.",enabled_label:"Povoliť sledované zavlažovanie",direct_control_label:"Nechať Smart Irrigation ovládať ventil",direct_control_description:"Keď je zapnuté, Smart Irrigation otvorí prepojený ventil každej zóny, počká vypočítanú dobu a potom ho zatvorí - nie je potrebná žiadna automatizácia. Prebiehajúci beh pokračuje po reštarte. Bezpečnosť: ak Home Assistant počas behu na dlhší čas vypadne, ventil zostane otvorený a pokračuje v zavlažovaní, preto dajte svojmu ventilu hardvérovú poistku (maximálnu dobu behu).",sequencing_label:"Poradie zón",sequencing:{sequential:"Postupne (jedna zóna po druhej)",parallel:"Súbežne (všetky zóny naraz)"}},$r={common:fr,defaults:br,module:kr,calcmodules:yr,panels:_r,title:zr,irrigation_start_triggers:wr,weather_skip:xr,coordinate_config:jr,days_between_irrigation:Sr,observed_watering:Ar},Er=Object.freeze({__proto__:null,calcmodules:yr,common:fr,coordinate_config:jr,days_between_irrigation:Sr,default:$r,defaults:br,irrigation_start_triggers:wr,module:kr,observed_watering:Ar,panels:_r,title:zr,weather_skip:xr}),Tr={loading:"Laddar",saving:"Sparar",actions:{delete:"Radera"},labels:{module:"Modul",no:"Nej",select:"Välj",yes:"Ja",enabled:"Aktiverad",disabled:"Inaktiverad",before:"före",after:"efter"},units:{seconds:"sekunder"},attributes:{size:"storlek",throughput:"flöde",state:"tillstånd",bucket:"bucket",last_updated:"senast uppdaterad",last_calculated:"senast beräknad",number_of_data_points:"antal datapunkter"},"loading-messages":{configuration:"Laddar konfiguration...",modules:"Laddar moduler...",general:"Laddar..."},"saving-messages":{adding:"Lägger till...",saving:"Sparar..."}},Mr={"default-zone":"Standardzon","default-mapping":"Standardsensorgrupp"},Dr={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Obs: denna förklaring använder '.' som decimaltecken och visar avrundade metriska värden. Modulen returnerade en evapotranspirationsbrist ( = et0 * hour_multiplier + nederbörd) på","bucket-was":"Bucket var","new-bucket-values-is":"Nytt bucket-värde är",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Eftersom bucket < 0 är bevattning nödvändig","steps-taken-to-calculate-duration":"För att beräkna den exakta varaktigheten togs följande steg","precipitation-rate-defined-as":"Nederbördshastigheten definieras som","duration-is-calculated-as":"Varaktigheten beräknas som",drainage:"drainage","drainage-rate":"drainage_rate",hours:"timmar","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Nu tillämpas multiplikatorn. Multiplikatorn är","duration-after-multiplier-is":"därmed är varaktigheten","maximum-duration-is-applied":"Sedan tillämpas den maximala varaktigheten. Den maximala varaktigheten är","duration-after-maximum-duration-is":"därmed är varaktigheten","lead-time-is-applied":"Slutligen tillämpas ledtiden. Ledtiden är","duration-after-lead-time-is":"därmed är den slutliga varaktigheten","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Eftersom bucket >= 0 är ingen bevattning nödvändig och varaktigheten sätts till","maximum-bucket-is":"Maximal bucket-storlek är","drainage-rate-is":"Dräneringshastighet vid mättnad (bucket på max) är","current-drainage-is":"Aktuell dränering beräknas som","no-drainage":"Aktuell dränering är 0 eftersom"}}},Or={pyeto:{description:"Beräkna varaktighet baserat på FAO56-beräkningen från PyETO-biblioteket"},static:{description:"'Dummy'-modul med en statisk konfigurerbar delta"},passthrough:{description:"Genomströmningsmodul som returnerar värdet från en evapotranspirationssensor som delta"}},Nr={weatherservice:{title:"Vädertjänst",description:"Visa och ändra vädertjänsten som används för att hämta väderdata — utan att behöva installera om integrationen. API-nyckeln valideras och ändringen tillämpas omedelbart.",labels:{"use-weather-service":"Använd en vädertjänst",service:"Vädertjänst","api-key":"API-nyckel"},actions:{save:"Spara",saving:"Sparar…"},messages:{"no-service":"Ingen vädertjänst används — väderdata kommer enbart från dina egna sensorer.",saved:"Vädertjänsten uppdaterad och tillämpad.","reload-note":"När du sparar valideras API-nyckeln mot tjänsten och ändringen tillämpas omedelbart."}},backuprestore:{title:"Säkerhetskopiering / återställning",description:"Exportera hela Smart Irrigation-konfigurationen till en JSON-fil, eller återställ den från en tidigare säkerhetskopia.",cards:{backup:{title:"Säkerhetskopiering",description:"Ladda ner den kompletta konfigurationen (allmänna inställningar, zoner, moduler och sensorgrupper) som en JSON-fil."},restore:{title:"Återställning",description:"Ladda en tidigare exporterad JSON-fil för att ersätta den aktuella konfigurationen."}},actions:{export:"Exportera till JSON","choose-file":"Välj en säkerhetskopia…",restore:"Återställ denna säkerhetskopia",restoring:"Återställer…"},messages:{exported:"Säkerhetskopian nedladdad.",restored:"Konfigurationen återställd — laddar om integrationen.","invalid-file":"Den här filen är inte en giltig Smart Irrigation-säkerhetskopia.","confirm-title":"Ersätta hela konfigurationen?",summary:"Den här säkerhetskopian innehåller","confirm-warning":"Återställning skriver över alla aktuella allmänna inställningar, zoner, moduler och sensorgrupper. Detta kan inte ångras.","reload-note":"Återställning ersätter allt och laddar om integrationen för att tillämpa ändringen."}},general:{cards:{"automatic-duration-calculation":{header:"Automatisk beräkning av varaktighet",description:"Beräkningen tar insamlad väderdata fram till den tidpunkten och uppdaterar bucket för varje automatisk zon. Sedan justeras varaktigheten baserat på det nya bucket-värdet och den insamlade väderdatan tas bort.",labels:{"auto-calc-enabled":"Beräkna bevattningsvaraktigheter automatiskt","calc-time":"Beräkna kl."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Varning: tidpunkten för uppdatering av väderdata är på eller efter beräkningstidpunkten"},header:"Automatisk uppdatering av väderdata",description:"Samla in och lagra väderdata automatiskt. Väderdata krävs för att beräkna zonernas buckets och varaktigheter.",labels:{"auto-update-enabled":"Uppdatera väderdata automatiskt","auto-update-schedule":"Uppdateringsschema","auto-update-time":"Uppdatera kl.","auto-update-interval":"Uppdatera sensordata var","auto-update-delay":"Uppdateringsfördröjning"},options:{minutes:"minuter",hours:"timmar",days:"dagar"}},"automatic-clear":{header:"Automatisk rensning av väderdata",description:"Ta bort insamlad väderdata automatiskt vid en konfigurerad tidpunkt. Använd detta för att säkerställa att det inte finns kvar väderdata från tidigare dagar. Ta inte bort väderdatan innan du beräknar, och använd endast det här alternativet om du förväntar dig att den automatiska uppdateringen samlar in väderdata efter att du har beräknat för dagen. Helst vill du rensa så sent på dagen som möjligt.",labels:{"automatic-clear-enabled":"Rensa insamlad väderdata automatiskt","automatic-clear-time":"Rensa väderdata kl."}},continuousupdates:{header:"Kontinuerliga uppdateringar för sensorer (experimentell)",description:"Den här experimentella funktionen uppdaterar sensordatan kontinuerligt. Detta är användbart för sensorgrupper som använder källor som tillhandahåller kontinuerlig data, till exempel väderstationer. Den här funktionen kan inte användas för sensorgrupper som åtminstone delvis förlitar sig på vädertjänster, eftersom kontinuerlig polling av API:er medför kostnader. Tänk på att detta är experimentellt och kanske inte fungerar som förväntat. Använd på egen risk.",labels:{continuousupdates:"Aktivera kontinuerliga uppdateringar",sensor_debounce:"Sensor-debounce"}}},description:"Den här sidan tillhandahåller globala inställningar.",title:"Allmänt"},help:{title:"Hjälp",cards:{"how-to-get-help":{title:"Så får du hjälp","first-read-the":"Läs först",wiki:"Wikin","if-you-still-need-help":"Om du fortfarande behöver hjälp, kontakta oss på","community-forum":"Communityforumet","or-open-a":"eller öppna en","github-issue":"Github-issue","english-only":"Endast engelska"}}},info:{title:"Info",description:"Visa information om nästa bevattning och systemstatus.","configuration-not-available":"Konfiguration inte tillgänglig.",cards:{"zone-bucket-values":{title:"Zonens bucket-värden & varaktighet",labels:{bucket:"Bucket",duration:"Varaktighet"},"no-zones":"Inga zoner konfigurerade"},"next-irrigation":{title:"Nästa bevattning",labels:{"next-start":"Nästa start",duration:"Varaktighet",zones:"Zoner"},"no-data":"Ingen data tillgänglig"},"irrigation-reason":{title:"Bevattningsorsak",labels:{reason:"Orsak",sunrise:"Soluppgång","total-duration":"Total varaktighet",explanation:"Förklaring"},"no-data":"Ingen data tillgänglig"}}},mappings:{cards:{"add-mapping":{actions:{add:"Lägg till sensorgrupp"},header:"Lägg till sensorgrupper"},mapping:{aggregates:{average:"Medelvärde",first:"Första",last:"Sista",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemannsumma",sum:"Summa",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"Du kan inte radera den här sensorgruppen eftersom det finns minst en zon som använder den.",invalid_source:"Ogiltig källa",source_does_not_exist:"Källan finns inte. Ange en giltig källa, till exempel 'sensor.mysensor'."},items:{dewpoint:"Daggpunkt",evapotranspiration:"Evapotranspiration",humidity:"Luftfuktighet","maximum temperature":"Maxtemperatur","minimum temperature":"Mintemperatur",precipitation:"Total nederbörd","current precipitation":"Aktuell nederbörd",pressure:"Lufttryck","solar radiation":"Solstrålning",temperature:"Temperatur",windspeed:"Vindhastighet"},pressure_types:{absolute:"absolut",relative:"relativt"},"pressure-type":"Lufttrycket är","sensor-aggregate-of-sensor-values-to-calculate":"av sensorvärden för att beräkna varaktighet","sensor-aggregate-use-the":"Använd","sensor-entity":"Sensorentitet",static_value:"Värde","input-units":"Indata anges i",source:"Källa",sources:{none:"Ingen",weather_service:"Vädertjänst",sensor:"Sensor",static:"Statiskt värde"}}},description:"Lägg till en eller flera sensorgrupper som hämtar väderdata från en vädertjänst, från sensorer eller en kombination av dessa. Du kan koppla varje sensorgrupp till en eller flera zoner",labels:{"mapping-name":"Namn"},no_items:"Det finns inga sensorgrupper definierade ännu.",title:"Sensorgrupper","weather-records":{title:"Väderposter (senaste 10)",timestamp:"Tid",temperature:"Temp",humidity:"Luftfuktighet",precipitation:"Nederb.","retrieval-time":"Hämtad","no-data":"Ingen väderdata tillgänglig för den här sensorgruppen"}},modules:{cards:{"add-module":{actions:{add:"Lägg till modul"},header:"Lägg till modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Du kan inte radera den här modulen eftersom det finns minst en zon som använder den."},labels:{configuration:"Konfiguration",required:"anger ett obligatoriskt fält"},"translated-options":{DontEstimate:"Uppskatta inte",EstimateFromSunHours:"Uppskatta från soltimmar",EstimateFromTemp:"Uppskatta från temperatur",EstimateFromSunHoursAndTemperature:"Uppskatta från medelvärdet av soltimmar och temperatur"}}},description:"Lägg till en eller flera moduler som beräknar bevattningsvaraktighet. Varje modul har sin egen konfiguration och kan användas för att beräkna varaktighet för en eller flera zoner.",no_items:"Det finns inga moduler definierade ännu.",title:"Moduler"},zones:{actions:{add:"Lägg till",calculate:"Beräkna",information:"Information",update:"Uppdatera","reset-bucket":"Återställ bucket","view-weather-info":"Visa väderdata","view-weather-info-message":"Väderdata tillgänglig för","view-watering-calendar":"Visa bevattningskalender"},cards:{"add-zone":{actions:{add:"Lägg till zon"},header:"Lägg till zon"},"zone-actions":{actions:{"calculate-all":"Beräkna alla zoner","update-all":"Uppdatera alla zoner","reset-all-buckets":"Återställ alla buckets","clear-all-weatherdata":"Rensa all väderdata"},header:"Åtgärder på alla zoner"}},description:"Ange en eller flera bevattningszoner här. Bevattningsvaraktigheten beräknas per zon, beroende på storlek, flöde, tillstånd, modul och sensorgrupp.",labels:{bucket:"Bucket",duration:"Varaktighet","lead-time":"Ledtid",mapping:"Sensorgrupp","maximum-duration":"Maximal varaktighet",multiplier:"Multiplikator",name:"Namn",size:"Storlek",state:"Tillstånd",states:{automatic:"Automatisk",disabled:"Inaktiverad",manual:"Manuell"},throughput:"Flöde","maximum-bucket":"Maximal bucket",last_calculated:"Senast beräknad","data-last-updated":"Data senast uppdaterad","data-number-of-data-points":"Antal datapunkter",drainage_rate:"Dräneringshastighet","linked-entity":"Länkad ventil/brytare","linked-entity-hint":"Ventilen eller brytaren som vattnar denna zon. Varje gång den körs (en manuell kran, en automation eller Smart Irrigation själv när direkt ventilstyrning är på) krediteras bucket utifrån körtiden och zonens flöde. Krävs för de slutna funktionerna.","flow-sensor":"Kumulativ volymmätare","flow-sensor-hint":"För exakt kreditering i stället för flöde x tid: en kumulativ vattenmätarsumma (tillståndsklass total_increasing), inte ett momentant flöde. Enheten läses av automatiskt (L, mL, m³, gal, ft³).",optional:"valfritt"},no_items:"Det finns inga zoner definierade ännu.",title:"Zoner"}},Pr="Smart Irrigation",Cr={title:"Utlösare för bevattningsstart",description:"Konfigurera när bevattningen ska starta baserat på solhändelser. Du kan lägga till flera utlösare för olika scheman. För soluppgångsutlösare används automatiskt den totala varaktigheten för alla aktiverade zoner om offset lämnas på 0.",usage_before:"När en utlösare aktiveras sänder Smart Irrigation ut händelsen ",usage_after:" — lyssna på den i en automation för att starta bevattningen. Händelsedatan innehåller trigger_name, trigger_type och offset_minutes, så att du kan reagera olika per utlösare. Inställningarna för nederbördsöverhoppning och dagar mellan bevattning gäller fortfarande: på en överhoppningsdag sänds ingen händelse ut.",add_trigger:"Lägg till utlösare",edit_trigger:"Redigera utlösare",delete_trigger:"Radera utlösare",trigger_types:{sunrise:"Soluppgång",sunset:"Solnedgång",solar_azimuth:"Solens azimut"},fields:{name:{name:"Utlösarens namn",description:"Ett beskrivande namn för att identifiera den här utlösaren"},type:{name:"Utlösartyp",description:"Typen av solhändelse att utlösa på"},enabled:{name:"Aktiverad",description:"Om den här utlösaren är aktiv för närvarande"},offset_minutes:{name:"Offset (minuter)",description:"Minuter före (-) eller efter (+) solhändelsen. För soluppgångsutlösare, använd 0 för automatisk tidsstyrning baserad på den totala zonvaraktigheten."},azimuth_angle:{name:"Azimutvinkel (grader)",description:"Solens azimutvinkel i grader där 0=Norr, 90=Öst, 180=Söder, 270=Väst"},account_for_duration:{name:"Ta hänsyn till varaktighet",description:"När detta är aktiverat startar bevattningen tillräckligt tidigt för att avslutas vid den angivna tidpunkten. När det är inaktiverat startar bevattningen exakt vid den angivna tidpunkten."}},dialog:{add_title:"Lägg till utlösare för bevattningsstart",edit_title:"Redigera utlösare för bevattningsstart",cancel:"Avbryt",save:"Spara",delete:"Radera",help:"När den här utlösaren aktiveras sänder Smart Irrigation ut följande händelse — använd den i en automation för att starta bevattningen. Händelsedatan innehåller den här utlösarens namn (och typ/offset), så att du kan reagera specifikt på den:"},no_triggers:"Inga utlösare för bevattningsstart konfigurerade. Systemet använder standardbeteendet (soluppgång med total zonvaraktighet). Lägg till utlösare för att anpassa när bevattningen startar.",offset_auto:"Auto (beräknas från total zonvaraktighet)",confirm_delete:"Är du säker på att du vill radera utlösaren '{name}'?",validation:{name_required:"Utlösarens namn är obligatoriskt",azimuth_invalid:"Azimutvinkeln måste vara ett giltigt tal"},help:{sunrise_offset:"För soluppgångsutlösare: Använd negativa värden för att starta före soluppgången, positiva för att starta efter. Ställ in på 0 för att automatiskt starta tillräckligt tidigt för att slutföra alla zoner före soluppgången.",sunset_offset:"För solnedgångsutlösare: Använd negativa värden för att starta före solnedgången, positiva för att starta efter solnedgången.",azimuth_explanation:"Solens azimut är solens kompassriktning. 0°=Norr, 90°=Öst, 180°=Söder, 270°=Väst. Du kan ange vilket vinkelvärde som helst (t.ex. 450° = 90°, -30° = 330°). Använd detta för att utlösa bevattning när solen når en specifik position.",multiple_triggers:"Du kan konfigurera flera utlösare. Varje aktiverad utlösare schemalägger bevattningsstarter oberoende av varandra."},active_label:"Aktiv utlösare",active_default:"Standard (soluppgång minus total bevattningstid)",active_hint:'Endast den valda utlösaren startar bevattningen, så den körs en gång per dag. "Standard" tidsbestämmer körningen så att den avslutas exakt vid soluppgången. Lägg till egna utlösare (solnedgång, azimut, förskjutningar) nedan och välj sedan en här.'},Hr={title:"Väderbaserad överhoppning av bevattning",description:"Hoppa automatiskt över bevattning när nederbörd är prognostiserad. Den här funktionen kräver att en vädertjänst är konfigurerad.",threshold_label:"Nederbördströskel",threshold_description:"Minsta mängd nederbörd (i mm) som prognostiserats för idag och imorgon för att hoppa över bevattning."},Ir={title:"Platskoordinater",description:"Konfigurera platskoordinater för hämtning av väderdata. Du kan använda manuella koordinater som skiljer sig från din Home Assistant-plats om det behövs.",manual_enabled:"Använd manuella koordinater",use_ha_location:"Använd Home Assistant-platsen",latitude:"Latitud (decimalgrader)",longitude:"Longitud (decimalgrader)",elevation:"Höjd (meter över havet)",current_ha_coords:"Aktuella Home Assistant-koordinater"},Lr={title:"Dagar mellan bevattning",description:"Konfigurera det minsta antalet dagar som måste gå mellan bevattningstillfällen. Detta hjälper till att kontrollera bevattningsfrekvensen för vattenbesparing och växthälsa.\n\nTypiska verkliga användningsfall:\n• Gräsmatteskötsel: 1–2 dagars intervall förhindrar överbevattning\n• Torkrestriktioner: 6+ dagars intervall för veckovis bevattning\n• Djuprotade växter: 3–7 dagars intervall för mindre frekvent bevattning\n• Vattenbesparing: Anpassningsbar utifrån klimat och markförhållanden",label:"Minsta antal dagar mellan bevattning",help_text:"Ställ in på 0 för att inaktivera den här funktionen. Värden från 1–365 dagar stöds. Den här inställningen fungerar tillsammans med befintlig logik för nederbördsprognoser."},Br={title:"Observerad bevattning (sluten slinga)",description:"Kreditera varje zons bucket automatiskt utifrån verklig bevattning, i stället för att nollställa bucket från en automation. När det är aktiverat väljer du en ventil-/brytarentitet per zon på fliken Zoner: medan den är öppen krediteras bucket utifrån körtiden och zonens flöde. För exakt bokföring kan du även välja en kumulativ volymmätare (en vattenmätarsumma) per zon, och den uppmätta volymen används i stället. Viktigt: när detta är på är det det enda som krediterar bucket, så ta bort alla reset_bucket-anrop från din bevattningsautomation för att undvika dubbelräkning.",enabled_label:"Aktivera observerad bevattning",direct_control_label:"Låt Smart Irrigation styra ventilen",direct_control_description:"När detta är på öppnar Smart Irrigation varje zons länkade ventil, väntar den beräknade tiden och stänger den sedan - ingen automation behövs. En pågående körning återupptas efter en omstart. Säkerhet: om Home Assistant ligger nere en längre tid mitt i en körning förblir ventilen öppen och fortsätter vattna, så ge din ventil ett maskinvaruskydd (en maximal körtid).",sequencing_label:"Zonsekvensering",sequencing:{sequential:"Sekventiell (en zon i taget)",parallel:"Parallell (alla zoner samtidigt)"}},Ur={common:Tr,defaults:Mr,module:Dr,calcmodules:Or,panels:Nr,title:Pr,irrigation_start_triggers:Cr,weather_skip:Hr,coordinate_config:Ir,days_between_irrigation:Lr,observed_watering:Br},Rr=Object.freeze({__proto__:null,calcmodules:Or,common:Tr,coordinate_config:Ir,days_between_irrigation:Lr,default:Ur,defaults:Mr,irrigation_start_triggers:Cr,module:Dr,observed_watering:Br,panels:Nr,title:Pr,weather_skip:Hr}),Vr={loading:"Завантаження",saving:"Збереження",actions:{delete:"Видалити"},labels:{module:"Модуль",no:"Ні",select:"Вибрати",yes:"Так",enabled:"Увімкнено",disabled:"Вимкнено",before:"до",after:"після"},units:{seconds:"секунд"},attributes:{size:"розмір",throughput:"пропускна здатність",state:"стан",bucket:"bucket",last_updated:"останнє оновлення",last_calculated:"останній розрахунок",number_of_data_points:"кількість точок даних"},"loading-messages":{configuration:"Завантаження конфігурації...",modules:"Завантаження модулів...",general:"Завантаження..."},"saving-messages":{adding:"Додавання...",saving:"Збереження..."}},qr={"default-zone":"Зона за замовчуванням","default-mapping":"Група датчиків за замовчуванням"},Fr={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Примітка: це пояснення використовує «.» як десятковий роздільник, показує округлені та метричні значення. Модуль повернув дефіцит евапотранспірації ( = et0 * hour_multiplier + опади), що становить","bucket-was":"Bucket був","new-bucket-values-is":"Нове значення bucket становить",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Оскільки bucket < 0, зрошення необхідне","steps-taken-to-calculate-duration":"Щоб розрахувати точну тривалість, було виконано такі кроки","precipitation-rate-defined-as":"Інтенсивність опадів визначається як","duration-is-calculated-as":"Тривалість розраховується як",drainage:"drainage","drainage-rate":"drainage_rate",hours:"годин","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Тепер застосовується множник. Множник дорівнює","duration-after-multiplier-is":"отже тривалість становить","maximum-duration-is-applied":"Потім застосовується максимальна тривалість. Максимальна тривалість становить","duration-after-maximum-duration-is":"отже тривалість становить","lead-time-is-applied":"Нарешті, застосовується час випередження. Час випередження становить","duration-after-lead-time-is":"отже остаточна тривалість становить","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Оскільки bucket >= 0, зрошення не потрібне, і тривалість встановлюється на","maximum-bucket-is":"Максимальний розмір bucket становить","drainage-rate-is":"Швидкість дренажу при насиченні (bucket на максимумі) становить","current-drainage-is":"Поточний дренаж розраховується як","no-drainage":"Поточний дренаж дорівнює 0, оскільки"}}},Wr={pyeto:{description:"Розрахунок тривалості на основі розрахунку FAO56 з бібліотеки PyETO"},static:{description:"«Фіктивний» модуль зі статичною налаштовуваною delta"},passthrough:{description:"Транзитний модуль, який повертає значення датчика евапотранспірації як delta"}},Gr={weatherservice:{title:"Погодний сервіс",description:"Переглядайте та змінюйте погодний сервіс, який використовується для отримання погодних даних — без потреби перевстановлювати інтеграцію. Ключ API перевіряється, і зміна застосовується негайно.",labels:{"use-weather-service":"Використовувати погодний сервіс",service:"Погодний сервіс","api-key":"Ключ API"},actions:{save:"Зберегти",saving:"Збереження…"},messages:{"no-service":"Погодний сервіс не використовується — погодні дані надходять лише з ваших власних датчиків.",saved:"Погодний сервіс оновлено та застосовано.","reload-note":"Збереження перевіряє ключ API щодо сервісу та застосовує зміну негайно."}},backuprestore:{title:"Резервне копіювання / відновлення",description:"Експортуйте повну конфігурацію Smart Irrigation у файл JSON або відновіть її з попередньої резервної копії.",cards:{backup:{title:"Резервна копія",description:"Завантажте повну конфігурацію (загальні налаштування, зони, модулі та групи датчиків) у вигляді файлу JSON."},restore:{title:"Відновлення",description:"Завантажте раніше експортований файл JSON, щоб замінити поточну конфігурацію."}},actions:{export:"Експортувати в JSON","choose-file":"Виберіть файл резервної копії…",restore:"Відновити цю резервну копію",restoring:"Відновлення…"},messages:{exported:"Файл резервної копії завантажено.",restored:"Конфігурацію відновлено — перезавантаження інтеграції.","invalid-file":"Цей файл не є дійсною резервною копією Smart Irrigation.","confirm-title":"Замінити всю конфігурацію?",summary:"Ця резервна копія містить","confirm-warning":"Відновлення перезаписує всі поточні загальні налаштування, зони, модулі та групи датчиків. Цю дію неможливо скасувати.","reload-note":"Відновлення замінює все та перезавантажує інтеграцію для застосування зміни."}},general:{cards:{"automatic-duration-calculation":{header:"Автоматичний розрахунок тривалості",description:"Розрахунок бере зібрані до цього моменту погодні дані та оновлює bucket для кожної автоматичної зони. Потім тривалість коригується на основі нового значення bucket, а зібрані погодні дані видаляються.",labels:{"auto-calc-enabled":"Автоматично розраховувати тривалість зрошення","calc-time":"Розраховувати о"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Попередження: час оновлення погодних даних збігається або настає після часу розрахунку"},header:"Автоматичне оновлення погодних даних",description:"Збирайте та зберігайте погодні дані автоматично. Погодні дані потрібні для розрахунку bucket та тривалості зон.",labels:{"auto-update-enabled":"Автоматично оновлювати погодні дані","auto-update-schedule":"Розклад оновлення","auto-update-time":"Оновлювати о","auto-update-interval":"Оновлювати дані датчиків кожні","auto-update-delay":"Затримка оновлення"},options:{minutes:"хвилин",hours:"годин",days:"днів"}},"automatic-clear":{header:"Автоматичне очищення погодних даних",description:"Автоматично видаляти зібрані погодні дані у налаштований час. Використовуйте це, щоб переконатися, що не залишилося погодних даних із попередніх днів. Не видаляйте погодні дані до розрахунку та використовуйте цей параметр лише в тому випадку, якщо ви очікуєте, що автоматичне оновлення збиратиме погодні дані після того, як ви виконали розрахунок на цей день. В ідеалі слід виконувати очищення якомога пізніше протягом дня.",labels:{"automatic-clear-enabled":"Автоматично очищувати зібрані погодні дані","automatic-clear-time":"Очищувати погодні дані о"}},continuousupdates:{header:"Безперервні оновлення для датчиків (експериментально)",description:"Ця експериментальна функція безперервно оновлюватиме дані датчиків. Це корисно для груп датчиків, які використовують джерела, що надають безперервні дані, наприклад метеостанції. Цю функцію не можна використовувати для груп датчиків, які принаймні частково покладаються на погодні сервіси, оскільки безперервне опитування API спричинить витрати. Майте на увазі, що це експериментально і може працювати не так, як очікувалося. Використовуйте на власний ризик.",labels:{continuousupdates:"Увімкнути безперервні оновлення",sensor_debounce:"Антидребезг датчика"}}},description:"Ця сторінка містить глобальні налаштування.",title:"Загальні"},help:{title:"Довідка",cards:{"how-to-get-help":{title:"Як отримати допомогу","first-read-the":"Спершу прочитайте",wiki:"Wiki","if-you-still-need-help":"Якщо вам усе ще потрібна допомога, зверніться на","community-forum":"Форум спільноти","or-open-a":"або відкрийте","github-issue":"Issue на Github","english-only":"Лише англійською"}}},info:{title:"Інформація",description:"Перегляньте інформацію про наступне зрошення та стан системи.","configuration-not-available":"Конфігурація недоступна.",cards:{"zone-bucket-values":{title:"Значення bucket зони та тривалість",labels:{bucket:"Bucket",duration:"Тривалість"},"no-zones":"Зони не налаштовано"},"next-irrigation":{title:"Наступне зрошення",labels:{"next-start":"Наступний запуск",duration:"Тривалість",zones:"Зони"},"no-data":"Дані недоступні"},"irrigation-reason":{title:"Причина зрошення",labels:{reason:"Причина",sunrise:"Схід сонця","total-duration":"Загальна тривалість",explanation:"Пояснення"},"no-data":"Дані недоступні"}}},mappings:{cards:{"add-mapping":{actions:{add:"Додати групу датчиків"},header:"Додати групи датчиків"},mapping:{aggregates:{average:"Середнє",first:"Перше",last:"Останнє",maximum:"Максимум",median:"Медіана",minimum:"Мінімум",riemannsum:"Сума Рімана",sum:"Сума",delta:"Дельта"},errors:{"cannot-delete-mapping-because-zones-use-it":"Ви не можете видалити цю групу датчиків, оскільки її використовує принаймні одна зона.",invalid_source:"Невірне джерело",source_does_not_exist:"Джерело не існує. Введіть дійсне джерело, наприклад «sensor.mysensor»."},items:{dewpoint:"Точка роси",evapotranspiration:"Евапотранспірація",humidity:"Вологість","maximum temperature":"Максимальна температура","minimum temperature":"Мінімальна температура",precipitation:"Загальна кількість опадів","current precipitation":"Поточні опади",pressure:"Тиск","solar radiation":"Сонячна радіація",temperature:"Температура",windspeed:"Швидкість вітру"},pressure_types:{absolute:"абсолютний",relative:"відносний"},"pressure-type":"Тиск є","sensor-aggregate-of-sensor-values-to-calculate":"значень датчиків для розрахунку тривалості","sensor-aggregate-use-the":"Використовуйте","sensor-entity":"Сутність датчика",static_value:"Значення","input-units":"Вхідні дані надають значення в",source:"Джерело",sources:{none:"Немає",weather_service:"Погодний сервіс",sensor:"Датчик",static:"Статичне значення"}}},description:"Додайте одну або кілька груп датчиків, які отримують погодні дані з погодного сервісу, з датчиків або з їх комбінації. Ви можете зіставити кожну групу датчиків з однією або кількома зонами",labels:{"mapping-name":"Назва"},no_items:"Ще не визначено жодної групи датчиків.",title:"Групи датчиків","weather-records":{title:"Записи погоди (останні 10)",timestamp:"Час",temperature:"Темп.",humidity:"Вологість",precipitation:"Опади","retrieval-time":"Отримано","no-data":"Немає доступних погодних даних для цієї групи датчиків"}},modules:{cards:{"add-module":{actions:{add:"Додати модуль"},header:"Додати модуль"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Ви не можете видалити цей модуль, оскільки його використовує принаймні одна зона."},labels:{configuration:"Конфігурація",required:"позначає обов’язкове поле"},"translated-options":{DontEstimate:"Не оцінювати",EstimateFromSunHours:"Оцінювати за годинами сонячного сяйва",EstimateFromTemp:"Оцінювати за температурою",EstimateFromSunHoursAndTemperature:"Оцінювати за середнім значенням годин сонячного сяйва та температури"}}},description:"Додайте один або кілька модулів, які розраховують тривалість зрошення. Кожен модуль має власну конфігурацію та може використовуватися для розрахунку тривалості для однієї або кількох зон.",no_items:"Ще не визначено жодного модуля.",title:"Модулі"},zones:{actions:{add:"Додати",calculate:"Розрахувати",information:"Інформація",update:"Оновити","reset-bucket":"Скинути bucket","view-weather-info":"Переглянути погодні дані","view-weather-info-message":"Погодні дані доступні для","view-watering-calendar":"Переглянути календар поливу"},cards:{"add-zone":{actions:{add:"Додати зону"},header:"Додати зону"},"zone-actions":{actions:{"calculate-all":"Розрахувати всі зони","update-all":"Оновити всі зони","reset-all-buckets":"Скинути всі bucket","clear-all-weatherdata":"Очистити всі погодні дані"},header:"Дії над усіма зонами"}},description:"Вкажіть тут одну або кілька зон зрошення. Тривалість зрошення розраховується для кожної зони залежно від розміру, пропускної здатності, стану, модуля та групи датчиків.",labels:{bucket:"Bucket",duration:"Тривалість","lead-time":"Час випередження",mapping:"Група датчиків","maximum-duration":"Максимальна тривалість",multiplier:"Множник",name:"Назва",size:"Розмір",state:"Стан",states:{automatic:"Автоматичний",disabled:"Вимкнено",manual:"Ручний"},throughput:"Пропускна здатність","maximum-bucket":"Максимальний bucket",last_calculated:"Останній розрахунок","data-last-updated":"Дані востаннє оновлено","data-number-of-data-points":"Кількість точок даних",drainage_rate:"Швидкість дренажу","linked-entity":"Підключений клапан/перемикач","linked-entity-hint":"Клапан або перемикач, який поливає цю зону. Щоразу, коли він спрацьовує (ручне відкриття крана, автоматизація або сама Smart Irrigation за увімкненого прямого керування клапаном), резервуар поповнюється на основі часу роботи та пропускної здатності зони. Обов'язково для функцій із замкненим контуром.","flow-sensor":"Накопичувальний лічильник об'єму","flow-sensor-hint":"Для точного обліку замість «пропускна здатність × час»: накопичувальна сума водяного лічильника (клас стану total_increasing), а не миттєва витрата. Одиниця вимірювання зчитується автоматично (L, mL, m³, gal, ft³).",optional:"необов'язково"},no_items:"Ще не визначено жодної зони.",title:"Зони"}},Yr="Smart Irrigation",Zr={title:"Тригери запуску зрошення",description:"Налаштуйте, коли має починатися зрошення, на основі сонячних подій. Ви можете додати кілька тригерів для різних розкладів. Для тригерів сходу сонця, якщо залишити зміщення на 0, автоматично використовуватиметься загальна тривалість усіх увімкнених зон.",usage_before:"Коли тригер спрацьовує, Smart Irrigation генерує подію ",usage_after:" — слухайте її в автоматизації, щоб розпочати полив. Дані події містять trigger_name, trigger_type та offset_minutes, тож ви можете реагувати по-різному для кожного тригера. Налаштування пропуску через опади та днів між зрошенням усе ще діють: у день пропуску подія не генерується.",add_trigger:"Додати тригер",edit_trigger:"Редагувати тригер",delete_trigger:"Видалити тригер",trigger_types:{sunrise:"Схід сонця",sunset:"Захід сонця",solar_azimuth:"Сонячний азимут"},fields:{name:{name:"Назва тригера",description:"Описова назва для ідентифікації цього тригера"},type:{name:"Тип тригера",description:"Тип сонячної події, на яку реагує тригер"},enabled:{name:"Увімкнено",description:"Чи активний цей тригер наразі"},offset_minutes:{name:"Зміщення (хвилини)",description:"Хвилин до (-) або після (+) сонячної події. Для тригерів сходу сонця використовуйте 0 для автоматичного визначення часу на основі загальної тривалості зон."},azimuth_angle:{name:"Кут азимута (градуси)",description:"Сонячний азимутальний кут у градусах, де 0=Північ, 90=Схід, 180=Південь, 270=Захід"},account_for_duration:{name:"Враховувати тривалість",description:"Якщо увімкнено, зрошення розпочнеться достатньо рано, щоб завершитися у вказаний час. Якщо вимкнено, зрошення розпочнеться точно у вказаний час."}},dialog:{add_title:"Додати тригер запуску зрошення",edit_title:"Редагувати тригер запуску зрошення",cancel:"Скасувати",save:"Зберегти",delete:"Видалити",help:"Коли цей тригер спрацьовує, Smart Irrigation генерує наступну подію — використовуйте її в автоматизації, щоб розпочати полив. Дані події містять назву цього тригера (а також тип/зміщення), тож ви можете реагувати на нього конкретно:"},no_triggers:"Тригери запуску зрошення не налаштовано. Система використовуватиме типову поведінку (схід сонця із загальною тривалістю зон). Додайте тригери, щоб налаштувати, коли починається зрошення.",offset_auto:"Авто (розраховано із загальної тривалості зон)",confirm_delete:"Ви впевнені, що хочете видалити тригер «{name}»?",validation:{name_required:"Назва тригера обов’язкова",azimuth_invalid:"Кут азимута має бути дійсним числом"},help:{sunrise_offset:"Для тригерів сходу сонця: використовуйте від’ємні значення, щоб почати до сходу сонця, додатні — щоб почати після. Встановіть 0, щоб автоматично почати достатньо рано для завершення всіх зон до сходу сонця.",sunset_offset:"Для тригерів заходу сонця: використовуйте від’ємні значення, щоб почати до заходу сонця, додатні — щоб почати після заходу сонця.",azimuth_explanation:"Сонячний азимут — це напрямок сонця за компасом. 0°=Північ, 90°=Схід, 180°=Південь, 270°=Захід. Ви можете ввести будь-яке значення кута (наприклад, 450° = 90°, -30° = 330°). Використовуйте це, щоб запускати зрошення, коли сонце досягає певного положення.",multiple_triggers:"Ви можете налаштувати кілька тригерів. Кожен увімкнений тригер незалежно планує запуски зрошення."},active_label:"Активний тригер",active_default:"За замовчуванням (схід сонця мінус загальна тривалість поливу)",active_hint:"Полив запускає лише обраний тригер, тож він спрацьовує раз на день. «За замовчуванням» розраховує час так, щоб завершити полив саме на схід сонця. Додайте власні тригери (захід сонця, азимут, зміщення) нижче, а потім оберіть один тут."},Kr={title:"Пропуск зрошення на основі погоди",description:"Автоматично пропускати зрошення, коли прогнозуються опади. Ця функція потребує налаштованого погодного сервісу.",threshold_label:"Поріг опадів",threshold_description:"Мінімальна кількість опадів (у мм), прогнозованих на сьогодні та завтра, щоб пропустити зрошення."},Jr={title:"Координати розташування",description:"Налаштуйте координати розташування для отримання погодних даних. За потреби можна використати координати вручну, відмінні від розташування Home Assistant.",manual_enabled:"Використовувати координати вручну",use_ha_location:"Використовувати розташування Home Assistant",latitude:"Широта (десяткові градуси)",longitude:"Довгота (десяткові градуси)",elevation:"Висота (метри над рівнем моря)",current_ha_coords:"Поточні координати Home Assistant"},Qr={title:"Дні між зрошенням",description:"Налаштуйте мінімальну кількість днів, які мають минути між подіями зрошення. Це допомагає контролювати частоту поливу для збереження води та підтримання здоров’я рослин.\n\nТипові реальні сценарії використання:\n• Догляд за газоном: інтервали 1-2 дні запобігають надмірному поливу\n• Обмеження через посуху: інтервали 6+ днів для щотижневого поливу\n• Рослини з глибоким корінням: інтервали 3-7 днів для рідшого поливу\n• Збереження води: налаштовується залежно від клімату та стану ґрунту",label:"Мінімум днів між зрошенням",help_text:"Встановіть 0, щоб вимкнути цю функцію. Підтримуються значення від 1 до 365 днів. Це налаштування працює разом із наявною логікою прогнозування опадів."},Xr={title:"Спостережуваний полив (замкнений контур)",description:"Автоматично поповнюйте резервуар кожної зони на основі реального поливу замість скидання резервуара з автоматизації. Після ввімкнення оберіть сутність клапана/перемикача для кожної зони на вкладці «Зони»: поки він відкритий, резервуар поповнюється на основі часу роботи та пропускної здатності зони. Для точного обліку ви також можете обрати накопичувальний лічильник об'єму (на кшталт суми водяного лічильника) для кожної зони, і тоді використовуватиметься виміряний об'єм. Важливо: коли це ввімкнено, лише воно поповнює резервуар, тож вилучіть будь-який виклик reset_bucket зі своєї автоматизації поливу, щоб уникнути подвійного підрахунку.",enabled_label:"Увімкнути спостережуваний полив",direct_control_label:"Дозволити Smart Irrigation керувати клапаном",direct_control_description:"Коли ввімкнено, Smart Irrigation відкриває підключений клапан кожної зони, чекає розраховану тривалість, а потім закриває його — без потреби в автоматизації. Запущений полив відновлюється після перезапуску. Безпека: якщо Home Assistant надовго вимкнеться посеред поливу, клапан залишиться відкритим і продовжуватиме поливати, тож забезпечте свій клапан апаратним захистом (максимальним часом роботи).",sequencing_label:"Послідовність зон",sequencing:{sequential:"Послідовно (по одній зоні за раз)",parallel:"Паралельно (усі зони одночасно)"}},es={common:Vr,defaults:qr,module:Fr,calcmodules:Wr,panels:Gr,title:Yr,irrigation_start_triggers:Zr,weather_skip:Kr,coordinate_config:Jr,days_between_irrigation:Qr,observed_watering:Xr},as=Object.freeze({__proto__:null,calcmodules:Wr,common:Vr,coordinate_config:Jr,days_between_irrigation:Qr,default:es,defaults:qr,irrigation_start_triggers:Zr,module:Fr,observed_watering:Xr,panels:Gr,title:Yr,weather_skip:Kr}),ts={loading:"加载中",saving:"保存中",actions:{delete:"删除"},labels:{module:"模块",no:"否",select:"选择",yes:"是",enabled:"已启用",disabled:"已禁用",before:"之前",after:"之后"},units:{seconds:"秒"},attributes:{size:"面积",throughput:"流量",state:"状态",bucket:"bucket",last_updated:"上次更新",last_calculated:"上次计算",number_of_data_points:"数据点数量"},"loading-messages":{configuration:"正在加载配置……",modules:"正在加载模块……",general:"加载中……"},"saving-messages":{adding:"正在添加……",saving:"正在保存……"}},is={"default-zone":"默认区域","default-mapping":"默认传感器组"},ns={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"注意：此说明使用 '.' 作为小数分隔符，显示四舍五入后的公制值。模块返回的蒸散亏缺（ = et0 * hour_multiplier + precipitation）为","bucket-was":"bucket 原值为","new-bucket-values-is":"新的 bucket 值为",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"由于 bucket < 0，需要进行灌溉","steps-taken-to-calculate-duration":"为计算精确的持续时间，执行了以下步骤","precipitation-rate-defined-as":"降水速率定义为","duration-is-calculated-as":"持续时间的计算方式为",drainage:"drainage","drainage-rate":"drainage_rate",hours:"小时","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"现在应用乘数。乘数为","duration-after-multiplier-is":"因此持续时间为","maximum-duration-is-applied":"然后应用最大持续时间。最大持续时间为","duration-after-maximum-duration-is":"因此持续时间为","lead-time-is-applied":"最后应用提前时间。提前时间为","duration-after-lead-time-is":"因此最终持续时间为","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"由于 bucket >= 0，无需灌溉，持续时间设置为","maximum-bucket-is":"最大 bucket 容量为","drainage-rate-is":"饱和时（bucket 处于最大值）的排水速率为","current-drainage-is":"当前排水量的计算方式为","no-drainage":"当前排水量为 0，原因是"}}},rs={pyeto:{description:"基于 PyETO 库的 FAO56 算法计算持续时间"},static:{description:"带有可配置静态 delta 的“虚拟”模块"},passthrough:{description:"直通模块，将蒸散传感器的值作为 delta 返回"}},ss={weatherservice:{title:"天气服务",description:"查看并更改用于获取天气数据的天气服务——无需重新安装集成。API 密钥将被验证，更改会立即生效。",labels:{"use-weather-service":"使用天气服务",service:"天气服务","api-key":"API 密钥"},actions:{save:"保存",saving:"正在保存…"},messages:{"no-service":"未使用任何天气服务——天气数据仅来自您自己的传感器。",saved:"天气服务已更新并应用。","reload-note":"保存时会针对该服务验证 API 密钥并立即应用更改。"}},backuprestore:{title:"备份 / 恢复",description:"将完整的 Smart Irrigation 配置导出为 JSON 文件，或从先前的备份中恢复。",cards:{backup:{title:"备份",description:"将完整配置（常规设置、区域、模块和传感器组）下载为 JSON 文件。"},restore:{title:"恢复",description:"加载先前导出的 JSON 文件以替换当前配置。"}},actions:{export:"导出为 JSON","choose-file":"选择一个备份文件…",restore:"恢复此备份",restoring:"正在恢复…"},messages:{exported:"备份文件已下载。",restored:"配置已恢复——正在重新加载集成。","invalid-file":"此文件不是有效的 Smart Irrigation 备份。","confirm-title":"替换整个配置？",summary:"此备份包含","confirm-warning":"恢复将覆盖当前所有的常规设置、区域、模块和传感器组。此操作无法撤销。","reload-note":"恢复会替换所有内容并重新加载集成以应用更改。"}},general:{cards:{"automatic-duration-calculation":{header:"自动计算持续时间",description:"计算时会采用到目前为止收集的天气数据，并更新每个自动区域的 bucket。然后根据新的 bucket 值调整持续时间，并移除收集的天气数据。",labels:{"auto-calc-enabled":"自动计算灌溉持续时间","calc-time":"计算时间"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"警告：天气数据更新时间等于或晚于计算时间"},header:"自动更新天气数据",description:"自动收集并存储天气数据。计算区域的 bucket 和持续时间需要天气数据。",labels:{"auto-update-enabled":"自动更新天气数据","auto-update-schedule":"更新计划","auto-update-time":"更新时间","auto-update-interval":"更新传感器数据的间隔","auto-update-delay":"更新延迟"},options:{minutes:"分钟",hours:"小时",days:"天"}},"automatic-clear":{header:"自动清理天气数据",description:"在配置的时间自动移除收集的天气数据。使用此功能可确保不会残留前几天的天气数据。请勿在计算之前移除天气数据，并且仅在您预期自动更新会在当天计算之后收集天气数据时才使用此选项。理想情况下，您应尽可能在一天中较晚的时间进行清理。",labels:{"automatic-clear-enabled":"自动清除收集的天气数据","automatic-clear-time":"清除天气数据的时间"}},continuousupdates:{header:"传感器连续更新（实验性）",description:"此实验性功能将连续更新传感器数据。这对于使用提供连续数据的来源（例如气象站）的传感器组很有用。此功能不能用于至少部分依赖天气服务的传感器组，因为连续轮询 API 会产生费用。请记住这是实验性功能，可能无法按预期工作。使用风险自负。",labels:{continuousupdates:"启用连续更新",sensor_debounce:"传感器防抖"}}},description:"此页面提供全局设置。",title:"常规"},help:{title:"帮助",cards:{"how-to-get-help":{title:"如何获取帮助","first-read-the":"首先，请阅读",wiki:"Wiki","if-you-still-need-help":"如果您仍需帮助，请通过以下方式联系","community-forum":"社区论坛","or-open-a":"或提交一个","github-issue":"Github Issue","english-only":"仅限英语"}}},info:{title:"信息",description:"查看有关下次灌溉和系统状态的信息。","configuration-not-available":"配置不可用。",cards:{"zone-bucket-values":{title:"区域 bucket 值和持续时间",labels:{bucket:"Bucket",duration:"持续时间"},"no-zones":"未配置任何区域"},"next-irrigation":{title:"下次灌溉",labels:{"next-start":"下次开始",duration:"持续时间",zones:"区域"},"no-data":"无可用数据"},"irrigation-reason":{title:"灌溉原因",labels:{reason:"原因",sunrise:"日出","total-duration":"总持续时间",explanation:"说明"},"no-data":"无可用数据"}}},mappings:{cards:{"add-mapping":{actions:{add:"添加传感器组"},header:"添加传感器组"},mapping:{aggregates:{average:"平均值",first:"首个",last:"最后",maximum:"最大值",median:"中位数",minimum:"最小值",riemannsum:"黎曼和",sum:"总和",delta:"差值"},errors:{"cannot-delete-mapping-because-zones-use-it":"无法删除此传感器组，因为至少有一个区域正在使用它。",invalid_source:"来源无效",source_does_not_exist:"来源不存在。请输入有效的来源，例如 'sensor.mysensor'。"},items:{dewpoint:"露点",evapotranspiration:"蒸散量",humidity:"湿度","maximum temperature":"最高温度","minimum temperature":"最低温度",precipitation:"总降水量","current precipitation":"当前降水量",pressure:"气压","solar radiation":"太阳辐射",temperature:"温度",windspeed:"风速"},pressure_types:{absolute:"绝对",relative:"相对"},"pressure-type":"气压为","sensor-aggregate-of-sensor-values-to-calculate":"传感器值以计算持续时间","sensor-aggregate-use-the":"使用","sensor-entity":"传感器实体",static_value:"值","input-units":"输入提供的值的单位为",source:"来源",sources:{none:"无",weather_service:"天气服务",sensor:"传感器",static:"静态值"}}},description:"添加一个或多个传感器组，从天气服务、传感器或两者的组合中获取天气数据。您可以将每个传感器组映射到一个或多个区域",labels:{"mapping-name":"名称"},no_items:"尚未定义任何传感器组。",title:"传感器组","weather-records":{title:"天气记录（最近 10 条）",timestamp:"时间",temperature:"温度",humidity:"湿度",precipitation:"降水","retrieval-time":"获取时间","no-data":"此传感器组没有可用的天气数据"}},modules:{cards:{"add-module":{actions:{add:"添加模块"},header:"添加模块"},module:{errors:{"cannot-delete-module-because-zones-use-it":"无法删除此模块，因为至少有一个区域正在使用它。"},labels:{configuration:"配置",required:"表示必填字段"},"translated-options":{DontEstimate:"不估算",EstimateFromSunHours:"根据日照时数估算",EstimateFromTemp:"根据温度估算",EstimateFromSunHoursAndTemperature:"根据日照时数和温度的平均值估算"}}},description:"添加一个或多个用于计算灌溉持续时间的模块。每个模块都有自己的配置，可用于计算一个或多个区域的持续时间。",no_items:"尚未定义任何模块。",title:"模块"},zones:{actions:{add:"添加",calculate:"计算",information:"信息",update:"更新","reset-bucket":"重置 bucket","view-weather-info":"查看天气数据","view-weather-info-message":"可用天气数据：","view-watering-calendar":"查看浇水日历"},cards:{"add-zone":{actions:{add:"添加区域"},header:"添加区域"},"zone-actions":{actions:{"calculate-all":"计算所有区域","update-all":"更新所有区域","reset-all-buckets":"重置所有 bucket","clear-all-weatherdata":"清除所有天气数据"},header:"对所有区域的操作"}},description:"在此处指定一个或多个灌溉区域。灌溉持续时间按区域计算，取决于面积、流量、状态、模块和传感器组。",labels:{bucket:"Bucket",duration:"持续时间","lead-time":"提前时间",mapping:"传感器组","maximum-duration":"最大持续时间",multiplier:"乘数",name:"名称",size:"面积",state:"状态",states:{automatic:"自动",disabled:"已禁用",manual:"手动"},throughput:"流量","maximum-bucket":"最大 bucket",last_calculated:"上次计算","data-last-updated":"数据上次更新","data-number-of-data-points":"数据点数量",drainage_rate:"排水速率","linked-entity":"关联的阀门/开关","linked-entity-hint":"为该区域浇水的阀门或开关。每当它运行时（手动开启、自动化，或在启用直接阀门控制时由 Smart Irrigation 自身运行），都会根据运行时间和该区域的流量为 bucket 计入水量。闭环功能需要此项。","flow-sensor":"累计水量计","flow-sensor-hint":"若需精确计量而非以流量×时间估算：请提供一个累计用水总量（状态类别为 total_increasing），而非瞬时流速。单位会自动读取（L、mL、m³、gal、ft³）。",optional:"可选"},no_items:"尚未定义任何区域。",title:"区域"}},os="Smart Irrigation",ls={title:"灌溉启动触发器",description:"根据太阳事件配置灌溉应何时开始。您可以为不同的计划添加多个触发器。对于日出触发器，将偏移量保持为 0 将自动使用所有已启用区域的总持续时间。",usage_before:"当触发器触发时，Smart Irrigation 会发出事件 ",usage_after:" ——在自动化中监听该事件以开始浇水。事件数据包含 trigger_name、trigger_type 和 offset_minutes，因此您可以针对每个触发器做出不同的响应。降水跳过和灌溉间隔天数设置仍然适用：在跳过日不会发出任何事件。",add_trigger:"添加触发器",edit_trigger:"编辑触发器",delete_trigger:"删除触发器",trigger_types:{sunrise:"日出",sunset:"日落",solar_azimuth:"太阳方位角"},fields:{name:{name:"触发器名称",description:"用于标识此触发器的描述性名称"},type:{name:"触发器类型",description:"触发所依据的太阳事件类型"},enabled:{name:"已启用",description:"此触发器当前是否处于活动状态"},offset_minutes:{name:"偏移量（分钟）",description:"太阳事件之前（-）或之后（+）的分钟数。对于日出触发器，使用 0 表示根据区域总持续时间自动计时。"},azimuth_angle:{name:"方位角（度）",description:"太阳方位角（度），其中 0=北，90=东，180=南，270=西"},account_for_duration:{name:"考虑持续时间",description:"启用时，灌溉将提前开始，以便在指定时间完成。禁用时，灌溉将正好在指定时间开始。"}},dialog:{add_title:"添加灌溉启动触发器",edit_title:"编辑灌溉启动触发器",cancel:"取消",save:"保存",delete:"删除",help:"当此触发器触发时，Smart Irrigation 会发出以下事件——在自动化中使用它来开始浇水。事件数据包含此触发器的名称（以及类型/偏移量），因此您可以专门对其做出响应："},no_triggers:"未配置任何灌溉启动触发器。系统将使用默认行为（按区域总持续时间在日出时灌溉）。添加触发器以自定义灌溉的开始时间。",offset_auto:"自动（根据区域总持续时间计算）",confirm_delete:"确定要删除触发器“{name}”吗？",validation:{name_required:"触发器名称为必填项",azimuth_invalid:"方位角必须是有效的数字"},help:{sunrise_offset:"对于日出触发器：使用负值在日出之前开始，使用正值在日出之后开始。设置为 0 可自动提前开始，以便在日出之前完成所有区域。",sunset_offset:"对于日落触发器：使用负值在日落之前开始，使用正值在日落之后开始。",azimuth_explanation:"太阳方位角是太阳所处的罗盘方向。0°=北，90°=东，180°=南，270°=西。您可以输入任何角度值（例如 450° = 90°，-30° = 330°）。使用此功能可在太阳到达特定位置时触发灌溉。",multiple_triggers:"您可以配置多个触发器。每个已启用的触发器都将独立安排灌溉的开始。"},active_label:"活动触发器",active_default:"默认（日出时间减去总浇水时长）",active_hint:"只有所选触发器会启动灌溉，因此每天运行一次。“默认”会安排运行使其恰好在日出时结束。可在下方添加自定义触发器（日落、方位角、偏移量），然后在此处选择一个。"},ds={title:"基于天气的灌溉跳过",description:"当预报有降水时自动跳过灌溉。此功能需要配置天气服务。",threshold_label:"降水阈值",threshold_description:"今天和明天预报的最低降水量（毫米），达到该值则跳过灌溉。"},us={title:"位置坐标",description:"配置用于获取天气数据的位置坐标。如有需要，您可以使用与 Home Assistant 位置不同的手动坐标。",manual_enabled:"使用手动坐标",use_ha_location:"使用 Home Assistant 位置",latitude:"纬度（十进制度）",longitude:"经度（十进制度）",elevation:"海拔（海平面以上米数）",current_ha_coords:"当前 Home Assistant 坐标"},cs={title:"灌溉间隔天数",description:"配置两次灌溉事件之间必须经过的最少天数。这有助于控制浇水频率，以实现节水和植物健康管理。\n\n典型的实际使用场景：\n• 草坪养护：1-2 天间隔可防止过度浇水\n• 干旱限制：6 天以上间隔用于每周浇水\n• 深根植物：3-7 天间隔用于减少浇水频率\n• 节约用水：可根据气候和土壤条件自定义",label:"灌溉之间的最少天数",help_text:"设置为 0 可禁用此功能。支持 1-365 天的值。此设置与现有的降水预报逻辑配合使用。"},ps={title:"实测浇水（闭环）",description:"根据实际灌溉自动为各区域的 bucket 计入水量，而非通过自动化重置 bucket。启用后，请在“区域”选项卡中为每个区域选择一个阀门/开关实体：当其开启时，会根据运行时间和该区域的流量为 bucket 计入水量。若需精确核算，也可为每个区域选择一个累计水量计（类似水表的累计总量），届时将改用实测水量。重要提示：启用此功能后，它将成为唯一为 bucket 计水的来源，因此请从你的灌溉自动化中移除所有 reset_bucket 调用，以免重复计量。",enabled_label:"启用实测浇水",direct_control_label:"让 Smart Irrigation 控制阀门",direct_control_description:"启用后，Smart Irrigation 会打开每个区域关联的阀门，等待计算出的时长，然后将其关闭，无需自动化。进行中的运行会在重启后恢复。安全提示：若 Home Assistant 在运行过程中长时间宕机，阀门将保持打开并持续浇水，因此请为你的阀门设置硬件故障保护（最大运行时长）。",sequencing_label:"区域排序",sequencing:{sequential:"顺序（一次一个区域）",parallel:"并行（所有区域同时）"}},ms={common:ts,defaults:is,module:ns,calcmodules:rs,panels:ss,title:os,irrigation_start_triggers:ls,weather_skip:ds,coordinate_config:us,days_between_irrigation:cs,observed_watering:ps},gs=Object.freeze({__proto__:null,calcmodules:rs,common:ts,coordinate_config:us,days_between_irrigation:cs,default:ms,defaults:is,irrigation_start_triggers:ls,module:ns,observed_watering:ps,panels:ss,title:os,weather_skip:ds});function hs(e,a){var t=a&&a.cache?a.cache:js,i=a&&a.serializer?a.serializer:ys;return(a&&a.strategy?a.strategy:ks)(e,{cache:t,serializer:i})}function vs(e,a,t,i){var n,r=null==(n=i)||"number"==typeof n||"boolean"==typeof n?i:t(i),s=a.get(r);return void 0===s&&(s=e.call(this,i),a.set(r,s)),s}function fs(e,a,t){var i=Array.prototype.slice.call(arguments,3),n=t(i),r=a.get(n);return void 0===r&&(r=e.apply(this,i),a.set(n,r)),r}function bs(e,a,t,i,n){return t.bind(a,e,i,n)}function ks(e,a){return bs(e,this,1===e.length?vs:fs,a.cache.create(),a.serializer)}var ys=function(){return JSON.stringify(arguments)};function _s(){this.cache=Object.create(null)}_s.prototype.get=function(e){return this.cache[e]},_s.prototype.set=function(e,a){this.cache[e]=a};var zs,ws,xs,js={create:function(){return new _s}},Ss={variadic:function(e,a){return bs(e,this,fs,a.cache.create(),a.serializer)}};function As(e){return e.type===ws.literal}function $s(e){return e.type===ws.argument}function Es(e){return e.type===ws.number}function Ts(e){return e.type===ws.date}function Ms(e){return e.type===ws.time}function Ds(e){return e.type===ws.select}function Os(e){return e.type===ws.plural}function Ns(e){return e.type===ws.pound}function Ps(e){return e.type===ws.tag}function Cs(e){return!(!e||"object"!=typeof e||e.type!==xs.number)}function Hs(e){return!(!e||"object"!=typeof e||e.type!==xs.dateTime)}!function(e){e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG"}(zs||(zs={})),function(e){e[e.literal=0]="literal",e[e.argument=1]="argument",e[e.number=2]="number",e[e.date=3]="date",e[e.time=4]="time",e[e.select=5]="select",e[e.plural=6]="plural",e[e.pound=7]="pound",e[e.tag=8]="tag"}(ws||(ws={})),function(e){e[e.number=0]="number",e[e.dateTime=1]="dateTime"}(xs||(xs={}));var Is=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,Ls=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Bs(e){var a={};return e.replace(Ls,(function(e){var t=e.length;switch(e[0]){case"G":a.era=4===t?"long":5===t?"narrow":"short";break;case"y":a.year=2===t?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":a.month=["numeric","2-digit","short","long","narrow"][t-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":a.day=["numeric","2-digit"][t-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":a.weekday=4===t?"long":5===t?"narrow":"short";break;case"e":if(t<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");a.weekday=["short","long","narrow","short"][t-4];break;case"c":if(t<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");a.weekday=["short","long","narrow","short"][t-4];break;case"a":a.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":a.hourCycle="h12",a.hour=["numeric","2-digit"][t-1];break;case"H":a.hourCycle="h23",a.hour=["numeric","2-digit"][t-1];break;case"K":a.hourCycle="h11",a.hour=["numeric","2-digit"][t-1];break;case"k":a.hourCycle="h24",a.hour=["numeric","2-digit"][t-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":a.minute=["numeric","2-digit"][t-1];break;case"s":a.second=["numeric","2-digit"][t-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":a.timeZoneName=t<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),a}var Us=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;var Rs=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,Vs=/^(@+)?(\+|#+)?[rs]?$/g,qs=/(\*)(0+)|(#+)(0+)|(0+)/g,Fs=/^(0+)$/;function Ws(e){var a={};return"r"===e[e.length-1]?a.roundingPriority="morePrecision":"s"===e[e.length-1]&&(a.roundingPriority="lessPrecision"),e.replace(Vs,(function(e,t,i){return"string"!=typeof i?(a.minimumSignificantDigits=t.length,a.maximumSignificantDigits=t.length):"+"===i?a.minimumSignificantDigits=t.length:"#"===t[0]?a.maximumSignificantDigits=t.length:(a.minimumSignificantDigits=t.length,a.maximumSignificantDigits=t.length+("string"==typeof i?i.length:0)),""})),a}function Gs(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function Ys(e){var a;if("E"===e[0]&&"E"===e[1]?(a={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(a={notation:"scientific"},e=e.slice(1)),a){var t=e.slice(0,2);if("+!"===t?(a.signDisplay="always",e=e.slice(2)):"+?"===t&&(a.signDisplay="exceptZero",e=e.slice(2)),!Fs.test(e))throw new Error("Malformed concise eng/scientific notation");a.minimumIntegerDigits=e.length}return a}function Zs(e){var a=Gs(e);return a||{}}function Ks(e){for(var a={},t=0,n=e;t<n.length;t++){var r=n[t];switch(r.stem){case"percent":case"%":a.style="percent";continue;case"%x100":a.style="percent",a.scale=100;continue;case"currency":a.style="currency",a.currency=r.options[0];continue;case"group-off":case",_":a.useGrouping=!1;continue;case"precision-integer":case".":a.maximumFractionDigits=0;continue;case"measure-unit":case"unit":a.style="unit",a.unit=r.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":a.notation="compact",a.compactDisplay="short";continue;case"compact-long":case"KK":a.notation="compact",a.compactDisplay="long";continue;case"scientific":a=i(i(i({},a),{notation:"scientific"}),r.options.reduce((function(e,a){return i(i({},e),Zs(a))}),{}));continue;case"engineering":a=i(i(i({},a),{notation:"engineering"}),r.options.reduce((function(e,a){return i(i({},e),Zs(a))}),{}));continue;case"notation-simple":a.notation="standard";continue;case"unit-width-narrow":a.currencyDisplay="narrowSymbol",a.unitDisplay="narrow";continue;case"unit-width-short":a.currencyDisplay="code",a.unitDisplay="short";continue;case"unit-width-full-name":a.currencyDisplay="name",a.unitDisplay="long";continue;case"unit-width-iso-code":a.currencyDisplay="symbol";continue;case"scale":a.scale=parseFloat(r.options[0]);continue;case"rounding-mode-floor":a.roundingMode="floor";continue;case"rounding-mode-ceiling":a.roundingMode="ceil";continue;case"rounding-mode-down":a.roundingMode="trunc";continue;case"rounding-mode-up":a.roundingMode="expand";continue;case"rounding-mode-half-even":a.roundingMode="halfEven";continue;case"rounding-mode-half-down":a.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":a.roundingMode="halfExpand";continue;case"integer-width":if(r.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");r.options[0].replace(qs,(function(e,t,i,n,r,s){if(t)a.minimumIntegerDigits=i.length;else{if(n&&r)throw new Error("We currently do not support maximum integer digits");if(s)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(Fs.test(r.stem))a.minimumIntegerDigits=r.stem.length;else if(Rs.test(r.stem)){if(r.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");r.stem.replace(Rs,(function(e,t,i,n,r,s){return"*"===i?a.minimumFractionDigits=t.length:n&&"#"===n[0]?a.maximumFractionDigits=n.length:r&&s?(a.minimumFractionDigits=r.length,a.maximumFractionDigits=r.length+s.length):(a.minimumFractionDigits=t.length,a.maximumFractionDigits=t.length),""}));var s=r.options[0];"w"===s?a=i(i({},a),{trailingZeroDisplay:"stripIfInteger"}):s&&(a=i(i({},a),Ws(s)))}else if(Vs.test(r.stem))a=i(i({},a),Ws(r.stem));else{var o=Gs(r.stem);o&&(a=i(i({},a),o));var l=Ys(r.stem);l&&(a=i(i({},a),l))}}return a}var Js,Qs={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function Xs(e){var a=e.hourCycle;if(void 0===a&&e.hourCycles&&e.hourCycles.length&&(a=e.hourCycles[0]),a)switch(a){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}var t,i=e.language;return"root"!==i&&(t=e.maximize().region),(Qs[t||""]||Qs[i||""]||Qs["".concat(i,"-001")]||Qs["001"])[0]}var eo=new RegExp("^".concat(Is.source,"*")),ao=new RegExp("".concat(Is.source,"*$"));function to(e,a){return{start:e,end:a}}var io=!!String.prototype.startsWith&&"_a".startsWith("a",1),no=!!String.fromCodePoint,ro=!!Object.fromEntries,so=!!String.prototype.codePointAt,oo=!!String.prototype.trimStart,lo=!!String.prototype.trimEnd,uo=!!Number.isSafeInteger?Number.isSafeInteger:function(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e&&Math.abs(e)<=9007199254740991},co=!0;try{co="a"===(null===(Js=ko("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu").exec("a"))||void 0===Js?void 0:Js[0])}catch(I){co=!1}var po,mo=io?function(e,a,t){return e.startsWith(a,t)}:function(e,a,t){return e.slice(t,t+a.length)===a},go=no?String.fromCodePoint:function(){for(var e=[],a=0;a<arguments.length;a++)e[a]=arguments[a];for(var t,i="",n=e.length,r=0;n>r;){if((t=e[r++])>1114111)throw RangeError(t+" is not a valid code point");i+=t<65536?String.fromCharCode(t):String.fromCharCode(55296+((t-=65536)>>10),t%1024+56320)}return i},ho=ro?Object.fromEntries:function(e){for(var a={},t=0,i=e;t<i.length;t++){var n=i[t],r=n[0],s=n[1];a[r]=s}return a},vo=so?function(e,a){return e.codePointAt(a)}:function(e,a){var t=e.length;if(!(a<0||a>=t)){var i,n=e.charCodeAt(a);return n<55296||n>56319||a+1===t||(i=e.charCodeAt(a+1))<56320||i>57343?n:i-56320+(n-55296<<10)+65536}},fo=oo?function(e){return e.trimStart()}:function(e){return e.replace(eo,"")},bo=lo?function(e){return e.trimEnd()}:function(e){return e.replace(ao,"")};function ko(e,a){return new RegExp(e,a)}if(co){var yo=ko("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");po=function(e,a){var t;return yo.lastIndex=a,null!==(t=yo.exec(e)[1])&&void 0!==t?t:""}}else po=function(e,a){for(var t=[];;){var i=vo(e,a);if(void 0===i||jo(i)||So(i))break;t.push(i),a+=i>=65536?2:1}return go.apply(void 0,t)};var _o,zo=function(){function e(e,a){void 0===a&&(a={}),this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!a.ignoreTag,this.locale=a.locale,this.requiresOtherClause=!!a.requiresOtherClause,this.shouldParseSkeletons=!!a.shouldParseSkeletons}return e.prototype.parse=function(){if(0!==this.offset())throw Error("parser can only be used once");return this.parseMessage(0,"",!1)},e.prototype.parseMessage=function(e,a,t){for(var i=[];!this.isEOF();){var n=this.char();if(123===n){if((r=this.parseArgument(e,t)).err)return r;i.push(r.val)}else{if(125===n&&e>0)break;if(35!==n||"plural"!==a&&"selectordinal"!==a){if(60===n&&!this.ignoreTag&&47===this.peek()){if(t)break;return this.error(zs.UNMATCHED_CLOSING_TAG,to(this.clonePosition(),this.clonePosition()))}if(60===n&&!this.ignoreTag&&wo(this.peek()||0)){if((r=this.parseTag(e,a)).err)return r;i.push(r.val)}else{var r;if((r=this.parseLiteral(e,a)).err)return r;i.push(r.val)}}else{var s=this.clonePosition();this.bump(),i.push({type:ws.pound,location:to(s,this.clonePosition())})}}}return{val:i,err:null}},e.prototype.parseTag=function(e,a){var t=this.clonePosition();this.bump();var i=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:ws.literal,value:"<".concat(i,"/>"),location:to(t,this.clonePosition())},err:null};if(this.bumpIf(">")){var n=this.parseMessage(e+1,a,!0);if(n.err)return n;var r=n.val,s=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!wo(this.char()))return this.error(zs.INVALID_TAG,to(s,this.clonePosition()));var o=this.clonePosition();return i!==this.parseTagName()?this.error(zs.UNMATCHED_CLOSING_TAG,to(o,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:ws.tag,value:i,children:r,location:to(t,this.clonePosition())},err:null}:this.error(zs.INVALID_TAG,to(s,this.clonePosition())))}return this.error(zs.UNCLOSED_TAG,to(t,this.clonePosition()))}return this.error(zs.INVALID_TAG,to(t,this.clonePosition()))},e.prototype.parseTagName=function(){var e=this.offset();for(this.bump();!this.isEOF()&&xo(this.char());)this.bump();return this.message.slice(e,this.offset())},e.prototype.parseLiteral=function(e,a){for(var t=this.clonePosition(),i="";;){var n=this.tryParseQuote(a);if(n)i+=n;else{var r=this.tryParseUnquoted(e,a);if(r)i+=r;else{var s=this.tryParseLeftAngleBracket();if(!s)break;i+=s}}}var o=to(t,this.clonePosition());return{val:{type:ws.literal,value:i,location:o},err:null}},e.prototype.tryParseLeftAngleBracket=function(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(wo(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e},e.prototype.tryParseQuote=function(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();var a=[this.char()];for(this.bump();!this.isEOF();){var t=this.char();if(39===t){if(39!==this.peek()){this.bump();break}a.push(39),this.bump()}else a.push(t);this.bump()}return go.apply(void 0,a)},e.prototype.tryParseUnquoted=function(e,a){if(this.isEOF())return null;var t=this.char();return 60===t||123===t||35===t&&("plural"===a||"selectordinal"===a)||125===t&&e>0?null:(this.bump(),go(t))},e.prototype.parseArgument=function(e,a){var t=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(zs.EXPECT_ARGUMENT_CLOSING_BRACE,to(t,this.clonePosition()));if(125===this.char())return this.bump(),this.error(zs.EMPTY_ARGUMENT,to(t,this.clonePosition()));var i=this.parseIdentifierIfPossible().value;if(!i)return this.error(zs.MALFORMED_ARGUMENT,to(t,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(zs.EXPECT_ARGUMENT_CLOSING_BRACE,to(t,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:ws.argument,value:i,location:to(t,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(zs.EXPECT_ARGUMENT_CLOSING_BRACE,to(t,this.clonePosition())):this.parseArgumentOptions(e,a,i,t);default:return this.error(zs.MALFORMED_ARGUMENT,to(t,this.clonePosition()))}},e.prototype.parseIdentifierIfPossible=function(){var e=this.clonePosition(),a=this.offset(),t=po(this.message,a),i=a+t.length;return this.bumpTo(i),{value:t,location:to(e,this.clonePosition())}},e.prototype.parseArgumentOptions=function(e,a,t,n){var r,s=this.clonePosition(),o=this.parseIdentifierIfPossible().value,l=this.clonePosition();switch(o){case"":return this.error(zs.EXPECT_ARGUMENT_TYPE,to(s,l));case"number":case"date":case"time":this.bumpSpace();var d=null;if(this.bumpIf(",")){this.bumpSpace();var u=this.clonePosition();if((b=this.parseSimpleArgStyleIfPossible()).err)return b;if(0===(g=bo(b.val)).length)return this.error(zs.EXPECT_ARGUMENT_STYLE,to(this.clonePosition(),this.clonePosition()));d={style:g,styleLocation:to(u,this.clonePosition())}}if((k=this.tryParseArgumentClose(n)).err)return k;var c=to(n,this.clonePosition());if(d&&mo(null==d?void 0:d.style,"::",0)){var p=fo(d.style.slice(2));if("number"===o)return(b=this.parseNumberSkeletonFromString(p,d.styleLocation)).err?b:{val:{type:ws.number,value:t,location:c,style:b.val},err:null};if(0===p.length)return this.error(zs.EXPECT_DATE_TIME_SKELETON,c);var m=p;this.locale&&(m=function(e,a){for(var t="",i=0;i<e.length;i++){var n=e.charAt(i);if("j"===n){for(var r=0;i+1<e.length&&e.charAt(i+1)===n;)r++,i++;var s=1+(1&r),o=r<2?1:3+(r>>1),l=Xs(a);for("H"!=l&&"k"!=l||(o=0);o-- >0;)t+="a";for(;s-- >0;)t=l+t}else t+="J"===n?"H":n}return t}(p,this.locale));var g={type:xs.dateTime,pattern:m,location:d.styleLocation,parsedOptions:this.shouldParseSkeletons?Bs(m):{}};return{val:{type:"date"===o?ws.date:ws.time,value:t,location:c,style:g},err:null}}return{val:{type:"number"===o?ws.number:"date"===o?ws.date:ws.time,value:t,location:c,style:null!==(r=null==d?void 0:d.style)&&void 0!==r?r:null},err:null};case"plural":case"selectordinal":case"select":var h=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(zs.EXPECT_SELECT_ARGUMENT_OPTIONS,to(h,i({},h)));this.bumpSpace();var v=this.parseIdentifierIfPossible(),f=0;if("select"!==o&&"offset"===v.value){if(!this.bumpIf(":"))return this.error(zs.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,to(this.clonePosition(),this.clonePosition()));var b;if(this.bumpSpace(),(b=this.tryParseDecimalInteger(zs.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,zs.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err)return b;this.bumpSpace(),v=this.parseIdentifierIfPossible(),f=b.val}var k,y=this.tryParsePluralOrSelectOptions(e,o,a,v);if(y.err)return y;if((k=this.tryParseArgumentClose(n)).err)return k;var _=to(n,this.clonePosition());return"select"===o?{val:{type:ws.select,value:t,options:ho(y.val),location:_},err:null}:{val:{type:ws.plural,value:t,options:ho(y.val),offset:f,pluralType:"plural"===o?"cardinal":"ordinal",location:_},err:null};default:return this.error(zs.INVALID_ARGUMENT_TYPE,to(s,l))}},e.prototype.tryParseArgumentClose=function(e){return this.isEOF()||125!==this.char()?this.error(zs.EXPECT_ARGUMENT_CLOSING_BRACE,to(e,this.clonePosition())):(this.bump(),{val:!0,err:null})},e.prototype.parseSimpleArgStyleIfPossible=function(){for(var e=0,a=this.clonePosition();!this.isEOF();){switch(this.char()){case 39:this.bump();var t=this.clonePosition();if(!this.bumpUntil("'"))return this.error(zs.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,to(t,this.clonePosition()));this.bump();break;case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(a.offset,this.offset()),err:null};e-=1;break;default:this.bump()}}return{val:this.message.slice(a.offset,this.offset()),err:null}},e.prototype.parseNumberSkeletonFromString=function(e,a){var t=[];try{t=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");for(var a=e.split(Us).filter((function(e){return e.length>0})),t=[],i=0,n=a;i<n.length;i++){var r=n[i].split("/");if(0===r.length)throw new Error("Invalid number skeleton");for(var s=r[0],o=r.slice(1),l=0,d=o;l<d.length;l++)if(0===d[l].length)throw new Error("Invalid number skeleton");t.push({stem:s,options:o})}return t}(e)}catch(e){return this.error(zs.INVALID_NUMBER_SKELETON,a)}return{val:{type:xs.number,tokens:t,location:a,parsedOptions:this.shouldParseSkeletons?Ks(t):{}},err:null}},e.prototype.tryParsePluralOrSelectOptions=function(e,a,t,i){for(var n,r=!1,s=[],o=new Set,l=i.value,d=i.location;;){if(0===l.length){var u=this.clonePosition();if("select"===a||!this.bumpIf("="))break;var c=this.tryParseDecimalInteger(zs.EXPECT_PLURAL_ARGUMENT_SELECTOR,zs.INVALID_PLURAL_ARGUMENT_SELECTOR);if(c.err)return c;d=to(u,this.clonePosition()),l=this.message.slice(u.offset,this.offset())}if(o.has(l))return this.error("select"===a?zs.DUPLICATE_SELECT_ARGUMENT_SELECTOR:zs.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,d);"other"===l&&(r=!0),this.bumpSpace();var p=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===a?zs.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT:zs.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,to(this.clonePosition(),this.clonePosition()));var m=this.parseMessage(e+1,a,t);if(m.err)return m;var g=this.tryParseArgumentClose(p);if(g.err)return g;s.push([l,{value:m.val,location:to(p,this.clonePosition())}]),o.add(l),this.bumpSpace(),l=(n=this.parseIdentifierIfPossible()).value,d=n.location}return 0===s.length?this.error("select"===a?zs.EXPECT_SELECT_ARGUMENT_SELECTOR:zs.EXPECT_PLURAL_ARGUMENT_SELECTOR,to(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!r?this.error(zs.MISSING_OTHER_CLAUSE,to(this.clonePosition(),this.clonePosition())):{val:s,err:null}},e.prototype.tryParseDecimalInteger=function(e,a){var t=1,i=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(t=-1);for(var n=!1,r=0;!this.isEOF();){var s=this.char();if(!(s>=48&&s<=57))break;n=!0,r=10*r+(s-48),this.bump()}var o=to(i,this.clonePosition());return n?uo(r*=t)?{val:r,err:null}:this.error(a,o):this.error(e,o)},e.prototype.offset=function(){return this.position.offset},e.prototype.isEOF=function(){return this.offset()===this.message.length},e.prototype.clonePosition=function(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}},e.prototype.char=function(){var e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");var a=vo(this.message,e);if(void 0===a)throw Error("Offset ".concat(e," is at invalid UTF-16 code unit boundary"));return a},e.prototype.error=function(e,a){return{val:null,err:{kind:e,message:this.message,location:a}}},e.prototype.bump=function(){if(!this.isEOF()){var e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}},e.prototype.bumpIf=function(e){if(mo(this.message,e,this.offset())){for(var a=0;a<e.length;a++)this.bump();return!0}return!1},e.prototype.bumpUntil=function(e){var a=this.offset(),t=this.message.indexOf(e,a);return t>=0?(this.bumpTo(t),!0):(this.bumpTo(this.message.length),!1)},e.prototype.bumpTo=function(e){if(this.offset()>e)throw Error("targetOffset ".concat(e," must be greater than or equal to the current offset ").concat(this.offset()));for(e=Math.min(e,this.message.length);;){var a=this.offset();if(a===e)break;if(a>e)throw Error("targetOffset ".concat(e," is at invalid UTF-16 code unit boundary"));if(this.bump(),this.isEOF())break}},e.prototype.bumpSpace=function(){for(;!this.isEOF()&&jo(this.char());)this.bump()},e.prototype.peek=function(){if(this.isEOF())return null;var e=this.char(),a=this.offset(),t=this.message.charCodeAt(a+(e>=65536?2:1));return null!=t?t:null},e}();function wo(e){return e>=97&&e<=122||e>=65&&e<=90}function xo(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function jo(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function So(e){return e>=33&&e<=35||36===e||e>=37&&e<=39||40===e||41===e||42===e||43===e||44===e||45===e||e>=46&&e<=47||e>=58&&e<=59||e>=60&&e<=62||e>=63&&e<=64||91===e||92===e||93===e||94===e||96===e||123===e||124===e||125===e||126===e||161===e||e>=162&&e<=165||166===e||167===e||169===e||171===e||172===e||174===e||176===e||177===e||182===e||187===e||191===e||215===e||247===e||e>=8208&&e<=8213||e>=8214&&e<=8215||8216===e||8217===e||8218===e||e>=8219&&e<=8220||8221===e||8222===e||8223===e||e>=8224&&e<=8231||e>=8240&&e<=8248||8249===e||8250===e||e>=8251&&e<=8254||e>=8257&&e<=8259||8260===e||8261===e||8262===e||e>=8263&&e<=8273||8274===e||8275===e||e>=8277&&e<=8286||e>=8592&&e<=8596||e>=8597&&e<=8601||e>=8602&&e<=8603||e>=8604&&e<=8607||8608===e||e>=8609&&e<=8610||8611===e||e>=8612&&e<=8613||8614===e||e>=8615&&e<=8621||8622===e||e>=8623&&e<=8653||e>=8654&&e<=8655||e>=8656&&e<=8657||8658===e||8659===e||8660===e||e>=8661&&e<=8691||e>=8692&&e<=8959||e>=8960&&e<=8967||8968===e||8969===e||8970===e||8971===e||e>=8972&&e<=8991||e>=8992&&e<=8993||e>=8994&&e<=9e3||9001===e||9002===e||e>=9003&&e<=9083||9084===e||e>=9085&&e<=9114||e>=9115&&e<=9139||e>=9140&&e<=9179||e>=9180&&e<=9185||e>=9186&&e<=9254||e>=9255&&e<=9279||e>=9280&&e<=9290||e>=9291&&e<=9311||e>=9472&&e<=9654||9655===e||e>=9656&&e<=9664||9665===e||e>=9666&&e<=9719||e>=9720&&e<=9727||e>=9728&&e<=9838||9839===e||e>=9840&&e<=10087||10088===e||10089===e||10090===e||10091===e||10092===e||10093===e||10094===e||10095===e||10096===e||10097===e||10098===e||10099===e||10100===e||10101===e||e>=10132&&e<=10175||e>=10176&&e<=10180||10181===e||10182===e||e>=10183&&e<=10213||10214===e||10215===e||10216===e||10217===e||10218===e||10219===e||10220===e||10221===e||10222===e||10223===e||e>=10224&&e<=10239||e>=10240&&e<=10495||e>=10496&&e<=10626||10627===e||10628===e||10629===e||10630===e||10631===e||10632===e||10633===e||10634===e||10635===e||10636===e||10637===e||10638===e||10639===e||10640===e||10641===e||10642===e||10643===e||10644===e||10645===e||10646===e||10647===e||10648===e||e>=10649&&e<=10711||10712===e||10713===e||10714===e||10715===e||e>=10716&&e<=10747||10748===e||10749===e||e>=10750&&e<=11007||e>=11008&&e<=11055||e>=11056&&e<=11076||e>=11077&&e<=11078||e>=11079&&e<=11084||e>=11085&&e<=11123||e>=11124&&e<=11125||e>=11126&&e<=11157||11158===e||e>=11159&&e<=11263||e>=11776&&e<=11777||11778===e||11779===e||11780===e||11781===e||e>=11782&&e<=11784||11785===e||11786===e||11787===e||11788===e||11789===e||e>=11790&&e<=11798||11799===e||e>=11800&&e<=11801||11802===e||11803===e||11804===e||11805===e||e>=11806&&e<=11807||11808===e||11809===e||11810===e||11811===e||11812===e||11813===e||11814===e||11815===e||11816===e||11817===e||e>=11818&&e<=11822||11823===e||e>=11824&&e<=11833||e>=11834&&e<=11835||e>=11836&&e<=11839||11840===e||11841===e||11842===e||e>=11843&&e<=11855||e>=11856&&e<=11857||11858===e||e>=11859&&e<=11903||e>=12289&&e<=12291||12296===e||12297===e||12298===e||12299===e||12300===e||12301===e||12302===e||12303===e||12304===e||12305===e||e>=12306&&e<=12307||12308===e||12309===e||12310===e||12311===e||12312===e||12313===e||12314===e||12315===e||12316===e||12317===e||e>=12318&&e<=12319||12320===e||12336===e||64830===e||64831===e||e>=65093&&e<=65094}function Ao(e){e.forEach((function(e){if(delete e.location,Ds(e)||Os(e))for(var a in e.options)delete e.options[a].location,Ao(e.options[a].value);else Es(e)&&Cs(e.style)||(Ts(e)||Ms(e))&&Hs(e.style)?delete e.style.location:Ps(e)&&Ao(e.children)}))}function $o(e,a){void 0===a&&(a={}),a=i({shouldParseSkeletons:!0,requiresOtherClause:!0},a);var t=new zo(e,a).parse();if(t.err){var n=SyntaxError(zs[t.err.kind]);throw n.location=t.err.location,n.originalMessage=t.err.message,n}return(null==a?void 0:a.captureLocation)||Ao(t.val),t.val}!function(e){e.MISSING_VALUE="MISSING_VALUE",e.INVALID_VALUE="INVALID_VALUE",e.MISSING_INTL_API="MISSING_INTL_API"}(_o||(_o={}));var Eo,To=function(e){function a(a,t,i){var n=e.call(this,a)||this;return n.code=t,n.originalMessage=i,n}return t(a,e),a.prototype.toString=function(){return"[formatjs Error: ".concat(this.code,"] ").concat(this.message)},a}(Error),Mo=function(e){function a(a,t,i,n){return e.call(this,'Invalid values for "'.concat(a,'": "').concat(t,'". Options are "').concat(Object.keys(i).join('", "'),'"'),_o.INVALID_VALUE,n)||this}return t(a,e),a}(To),Do=function(e){function a(a,t,i){return e.call(this,'Value for "'.concat(a,'" must be of type ').concat(t),_o.INVALID_VALUE,i)||this}return t(a,e),a}(To),Oo=function(e){function a(a,t){return e.call(this,'The intl string context variable "'.concat(a,'" was not provided to the string "').concat(t,'"'),_o.MISSING_VALUE,t)||this}return t(a,e),a}(To);function No(e){return"function"==typeof e}function Po(e,a,t,i,n,r,s){if(1===e.length&&As(e[0]))return[{type:Eo.literal,value:e[0].value}];for(var o=[],l=0,d=e;l<d.length;l++){var u=d[l];if(As(u))o.push({type:Eo.literal,value:u.value});else if(Ns(u))"number"==typeof r&&o.push({type:Eo.literal,value:t.getNumberFormat(a).format(r)});else{var c=u.value;if(!n||!(c in n))throw new Oo(c,s);var p=n[c];if($s(u))p&&"string"!=typeof p&&"number"!=typeof p||(p="string"==typeof p||"number"==typeof p?String(p):""),o.push({type:"string"==typeof p?Eo.literal:Eo.object,value:p});else if(Ts(u)){var m="string"==typeof u.style?i.date[u.style]:Hs(u.style)?u.style.parsedOptions:void 0;o.push({type:Eo.literal,value:t.getDateTimeFormat(a,m).format(p)})}else if(Ms(u)){m="string"==typeof u.style?i.time[u.style]:Hs(u.style)?u.style.parsedOptions:i.time.medium;o.push({type:Eo.literal,value:t.getDateTimeFormat(a,m).format(p)})}else if(Es(u)){(m="string"==typeof u.style?i.number[u.style]:Cs(u.style)?u.style.parsedOptions:void 0)&&m.scale&&(p*=m.scale||1),o.push({type:Eo.literal,value:t.getNumberFormat(a,m).format(p)})}else{if(Ps(u)){var g=u.children,h=u.value,v=n[h];if(!No(v))throw new Do(h,"function",s);var f=v(Po(g,a,t,i,n,r).map((function(e){return e.value})));Array.isArray(f)||(f=[f]),o.push.apply(o,f.map((function(e){return{type:"string"==typeof e?Eo.literal:Eo.object,value:e}})))}if(Ds(u)){if(!(b=u.options[p]||u.options.other))throw new Mo(u.value,p,Object.keys(u.options),s);o.push.apply(o,Po(b.value,a,t,i,n))}else if(Os(u)){var b;if(!(b=u.options["=".concat(p)])){if(!Intl.PluralRules)throw new To('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',_o.MISSING_INTL_API,s);var k=t.getPluralRules(a,{type:u.pluralType}).select(p-(u.offset||0));b=u.options[k]||u.options.other}if(!b)throw new Mo(u.value,p,Object.keys(u.options),s);o.push.apply(o,Po(b.value,a,t,i,n,p-(u.offset||0)))}else;}}}return function(e){return e.length<2?e:e.reduce((function(e,a){var t=e[e.length-1];return t&&t.type===Eo.literal&&a.type===Eo.literal?t.value+=a.value:e.push(a),e}),[])}(o)}function Co(e,a){return a?Object.keys(e).reduce((function(t,n){var r,s;return t[n]=(r=e[n],(s=a[n])?i(i(i({},r||{}),s||{}),Object.keys(r).reduce((function(e,a){return e[a]=i(i({},r[a]),s[a]||{}),e}),{})):r),t}),i({},e)):e}function Ho(e){return{create:function(){return{get:function(a){return e[a]},set:function(a,t){e[a]=t}}}}}!function(e){e[e.literal=0]="literal",e[e.object=1]="object"}(Eo||(Eo={}));var Io=function(){function e(a,t,r,o){void 0===t&&(t=e.defaultLocale);var l,d=this;if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=function(e){var a=d.formatToParts(e);if(1===a.length)return a[0].value;var t=a.reduce((function(e,a){return e.length&&a.type===Eo.literal&&"string"==typeof e[e.length-1]?e[e.length-1]+=a.value:e.push(a.value),e}),[]);return t.length<=1?t[0]||"":t},this.formatToParts=function(e){return Po(d.ast,d.locales,d.formatters,d.formats,e,void 0,d.message)},this.resolvedOptions=function(){var e;return{locale:(null===(e=d.resolvedLocale)||void 0===e?void 0:e.toString())||Intl.NumberFormat.supportedLocalesOf(d.locales)[0]}},this.getAst=function(){return d.ast},this.locales=t,this.resolvedLocale=e.resolveLocale(t),"string"==typeof a){if(this.message=a,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");var u=o||{};u.formatters;var c=n(u,["formatters"]);this.ast=e.__parse(a,i(i({},c),{locale:this.resolvedLocale}))}else this.ast=a;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Co(e.formats,r),this.formatters=o&&o.formatters||(void 0===(l=this.formatterCache)&&(l={number:{},dateTime:{},pluralRules:{}}),{getNumberFormat:hs((function(){for(var e,a=[],t=0;t<arguments.length;t++)a[t]=arguments[t];return new((e=Intl.NumberFormat).bind.apply(e,s([void 0],a,!1)))}),{cache:Ho(l.number),strategy:Ss.variadic}),getDateTimeFormat:hs((function(){for(var e,a=[],t=0;t<arguments.length;t++)a[t]=arguments[t];return new((e=Intl.DateTimeFormat).bind.apply(e,s([void 0],a,!1)))}),{cache:Ho(l.dateTime),strategy:Ss.variadic}),getPluralRules:hs((function(){for(var e,a=[],t=0;t<arguments.length;t++)a[t]=arguments[t];return new((e=Intl.PluralRules).bind.apply(e,s([void 0],a,!1)))}),{cache:Ho(l.pluralRules),strategy:Ss.variadic})})}return Object.defineProperty(e,"defaultLocale",{get:function(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale},enumerable:!1,configurable:!0}),e.memoizedDefaultLocale=null,e.resolveLocale=function(e){if(void 0!==Intl.Locale){var a=Intl.NumberFormat.supportedLocalesOf(e);return a.length>0?new Intl.Locale(a[0]):new Intl.Locale("string"==typeof e?e:e[0])}},e.__parse=$o,e.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},e}();const Lo={cs:Za,da:lt,de:_t,en:Nt,es:Gt,fi:si,fr:ki,hu:Di,it:Fi,nl:rn,no:bn,pl:Mn,pt:qn,"pt-BR":ir,ru:vr,sk:Er,sv:Rr,uk:as,"zh-Hans":gs};function Bo(e,a,...t){const i=a.replace(/['"]+/g,"");let n;try{n=e.split(".").reduce(((e,a)=>e[a]),Lo[i])}catch(a){n=e.split(".").reduce(((e,a)=>e[a]),Lo.en)}if(void 0===n&&(n=e.split(".").reduce(((e,a)=>e[a]),Lo.en)),!t.length)return n;const r={};for(let e=0;e<t.length;e+=2){let a=t[e];a=a.replace(/^{([^}]+)?}$/,"$1"),r[a]=t[e+1]}try{return new Io(n,a).format(r)}catch(e){return"Translation "+e}}var Uo="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",Ro="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Vo="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",qo="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",Fo="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",Wo="M7,10L12,15L17,10H7Z",Go="M19,13H5V11H19V13Z",Yo="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",Zo="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Ko="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",Jo="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z";const Qo=p`
  /* Existing common styles */
  ha-card {
    display: flex;
    flex-direction: column;
    margin: 5px;
    max-width: calc(100vw - 10px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
  }
  .card-header .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.dialog-header {
    font-size: 24px;
    letter-spacing: -0.012em;
    line-height: 48px;
    padding: 12px 16px 16px;
    display: block;
    margin-block: 0px;
    font-weight: 400;
  }

  div.warning {
    color: var(--error-color);
    margin-top: 20px;
  }

  div.checkbox-row {
    min-height: 40px;
    display: flex;
    align-items: center;
  }

  div.checkbox-row ha-switch {
    margin-right: 20px;
  }

  div.checkbox-row.right ha-switch {
    margin-left: 20px;
    position: absolute;
    right: 0px;
  }

  div.entity-row {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin: 10px 0px;
  }
  div.entity-row .info {
    margin-left: 16px;
    flex: 1 0 60px;
  }
  div.entity-row .info,
  div.entity-row .info > * {
    color: var(--primary-text-color);
    transition: color 0.2s ease-in-out;
  }
  div.entity-row .secondary {
    display: block;
    color: var(--secondary-text-color);
    transition: color 0.2s ease-in-out;
  }
  div.entity-row state-badge {
    flex: 0 0 40px;
  }

  ha-dialog div.wrapper {
    margin-bottom: -20px;
  }

  ha-textfield {
    min-width: 220px;
  }

  a,
  a:visited {
    color: var(--primary-color);
  }
  ha-card settings-row:first-child,
  ha-card settings-row:first-of-type {
    border-top: 0px;
  }

  ha-card > ha-card {
    margin: 10px;
  }

  /* Common utility classes shared across views */
  .hidden {
    display: none;
  }

  .shortinput {
    width: 50px;
  }

  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: var(--primary-text-color);
    font-style: italic;
  }

  .saving {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .saving-indicator {
    color: var(--primary-color);
    font-style: italic;
    margin-top: 8px;
    font-size: 0.9em;
  }

  /* Disabled input styling */
  button:disabled,
  select:disabled,
  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Common line/row layouts */
  .zoneline,
  .mappingsettingline,
  .schemaline {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    margin-left: 0;
    margin-top: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .zoneline label,
  .mappingsettingline label,
  .schemaline label {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .zoneline input,
  .zoneline select,
  .mappingsettingline input,
  .mappingsettingline select,
  .schemaline input,
  .schemaline select {
    justify-self: end;
  }

  /* Common container styles */
  .zone,
  .mapping {
    margin-top: 25px;
    margin-bottom: 25px;
  }

  /* Mapping-specific container */
  .mappingline {
    margin-top: 16px;
    padding: 8px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
  }

  /* Note/alert styles - consolidated */
  .weather-note,
  .calendar-note,
  .info-note {
    padding: 8px;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border-radius: 4px;
    font-size: 0.9em;
    font-style: italic;
  }

  .info-note {
    margin-top: 16px;
    background: var(--warning-color);
    color: var(--text-primary-color);
  }

  /* Radio button group styling */
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 8px 0;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .radio-group input[type="radio"] {
    margin: 0;
  }

  input[type="radio"] {
    margin-right: 5px;
    margin-left: 10px;
  }

  input[type="radio"] + label {
    margin-right: 15px;
  }

  /* Common header styles */
  .subheader,
  .mappingsettingname {
    font-weight: bold;
  }

  /* Load more button styling */
  .load-more {
    text-align: center;
    padding: 16px;
  }

  .load-more button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .load-more button:hover {
    background: var(--primary-color-dark, var(--primary-color));
  }

  /* Strikethrough utility */
  .strikethrough {
    text-decoration: line-through;
  }

  /* Information text styling */
  .information {
    margin-left: 20px;
    margin-top: 5px;
  }

  /* Calendar and weather table styles */
  .watering-calendar,
  .weather-records {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .watering-calendar h4,
  .weather-records h4 {
    margin: 0 0 12px 0;
    font-size: 1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .calendar-table,
  .weather-table {
    display: grid;
    gap: 8px;
    font-size: 0.85em;
  }

  .calendar-table {
    grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr;
  }

  .weather-table {
    grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 1fr;
  }

  .calendar-header,
  .weather-header {
    display: contents;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .calendar-header span,
  .weather-header span {
    padding: 4px;
    background: var(--card-background-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .calendar-row,
  .weather-row {
    display: contents;
    color: var(--secondary-text-color);
  }

  .calendar-row span,
  .weather-row span {
    padding: 4px;
    border-bottom: 1px solid var(--divider-color);
  }

  .calendar-info {
    margin-top: 8px;
    padding: 4px 8px;
    background: var(--info-color, var(--primary-color));
    color: white;
    border-radius: 4px;
    font-size: 0.8em;
  }

  /* Zone info table styles */
  .zone-info-table {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    margin-bottom: 16px;
  }

  .zone-info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .zone-info-label {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .zone-info-value {
    color: var(--secondary-text-color);
    text-align: right;
  }

  /* Info item styles */
  .info-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .info-item label {
    font-weight: 500;
    min-width: 120px;
    color: var(--primary-text-color);
  }

  .info-item .value {
    color: var(--secondary-text-color);
    font-family: monospace;
    text-align: right;
    justify-self: end;
  }

  .info-item.explanation {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .explanation-text {
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    padding: 8px;
    font-size: 0.9em;
    line-height: 1.4;
    white-space: pre-wrap;
    margin-top: 4px;
    width: 100%;
    box-sizing: border-box;
  }

  /* Action button containers for zones page */
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
    padding: 12px 8px;
    border-top: 1px solid var(--divider-color);
  }

  .action-buttons-left,
  .action-buttons-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Labeled action button - generic class for all pages */
  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: var(--secondary-background-color);
  }

  /* For zones page - left column has label on right of icon */
  .action-button-left {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-direction: row;
  }

  /* For zones page - right column has label on left of icon */
  .action-button-right {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: right;
    justify-content: flex-end;
  }

  .action-button-left:hover,
  .action-button-right:hover {
    background-color: var(--secondary-background-color);
  }

  .action-button svg {
    flex-shrink: 0;
  }

  .action-button-label {
    font-size: 0.85em;
    color: var(--primary-text-color);
    white-space: nowrap;
  }
`,Xo=p`
  /* ha-dialog styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-heading-ink-color: var(--primary-text-color);
    --mdc-dialog-content-ink-color: var(--primary-text-color);
    --justify-action-buttons: space-between;
  }
  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-max-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  ha-dialog div.description {
    margin-bottom: 10px;
  }
`;let el=class extends ce{async showDialog(e){var a,t,i,n,r,s,o,l,d;if(this.params=e,e.createTrigger)this._trigger={type:$e,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const u=e.trigger;this._trigger=u.type===Ee?{type:u.type,name:null!==(a=u.name)&&void 0!==a?a:"",enabled:null===(t=u.enabled)||void 0===t||t,offset_minutes:null!==(i=u.offset_minutes)&&void 0!==i?i:0,azimuth_angle:null!==(n=u.azimuth_angle)&&void 0!==n?n:90,account_for_duration:null===(r=u.account_for_duration)||void 0===r||r}:{type:u.type,name:null!==(s=u.name)&&void 0!==s?s:"",enabled:null===(o=u.enabled)||void 0===o||o,offset_minutes:null!==(l=u.offset_minutes)&&void 0!==l?l:0,account_for_duration:null===(d=u.account_for_duration)||void 0===d||d}}else this._trigger=void 0;await this.updateComplete}_closeDialog(){this.params=void 0,this._trigger=void 0}_saveTrigger(){var e,a,t,i,r;if(!this._trigger||!this.params)return;const s=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(s){const e=null!==(t=null!==(a=s.value)&&void 0!==a?a:s.selected)&&void 0!==t?t:void 0;if(e&&e!==this._trigger.type){if(e===Ee)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(i=this._trigger.azimuth_angle)&&void 0!==i?i:90});else{const a=this._trigger,{azimuth_angle:t}=a,i=n(a,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},i),{type:e})}this.requestUpdate()}}if(null===(r=this._trigger.name)||void 0===r?void 0:r.trim()){if(this._trigger.type===Ee){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void alert(Bo("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else alert(Bo("irrigation_start_triggers.validation.name_required",this.hass.language))}_deleteTrigger(){this.params&&!this.params.createTrigger&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,a;if(!this.params||!this._trigger)return q``;const t=this.params.createTrigger,i=Bo(t?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return q`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${Vo}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${i}</span>
        </div>

        <div class="wrapper">
          <div class="dialog-help">
            ${Bo("irrigation_start_triggers.dialog.help",this.hass.language)}
            <code>smart_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${Bo("irrigation_start_triggers.fields.name.name",this.hass.language)}</label
            >
            <input
              class="form-input"
              type="text"
              .value=${this._trigger.name||""}
              @input=${this._nameChanged}
              required
            />
          </div>

          <div class="form-group">
            <ha-select
              .label=${Bo("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${$e}>
                ${Bo("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${"sunset"}>
                ${Bo("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${Ee}>
                ${Bo("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${Bo("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${Bo("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}</label
            >
            <input
              class="form-input"
              type="number"
              .value=${(null===(e=this._trigger.offset_minutes)||void 0===e?void 0:e.toString())||"0"}
              min="-1440"
              max="1440"
              step="1"
              @input=${this._offsetChanged}
            />
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${Bo("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===Ee?q`
                <div class="form-group">
                  <label class="form-label"
                    >${Bo("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="number"
                    .value=${(null===(a=this._trigger.azimuth_angle)||void 0===a?void 0:a.toString())||"90"}
                    min="0"
                    max="359"
                    step="1"
                    @input=${this._azimuthChanged}
                  />
                </div>
              `:""}
        </div>

        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            appearance="plain"
            @click=${this._closeDialog}
          >
            ${Bo("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </ha-button>
          ${t?"":q`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${Bo("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </ha-button>
              `}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${Bo("irrigation_start_triggers.dialog.save",this.hass.language)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}_nameChanged(e){const a=e.target;this._updateTrigger({name:a.value})}_typeChanged(e){var a,t,i,n,r,s,o,l,d,u,c,p,m,g,h,v,f,b,k,y,_,z,w,x;const j=null!==(n=null!==(t=null===(a=null==e?void 0:e.detail)||void 0===a?void 0:a.value)&&void 0!==t?t:null===(i=e.target)||void 0===i?void 0:i.value)&&void 0!==n?n:null===(s=null===(r=this.shadowRoot)||void 0===r?void 0:r.querySelector("ha-select"))||void 0===s?void 0:s.value,S=String(j);let A;A=S===Ee?{type:Ee,name:null!==(l=null===(o=this._trigger)||void 0===o?void 0:o.name)&&void 0!==l?l:"",enabled:null===(u=null===(d=this._trigger)||void 0===d?void 0:d.enabled)||void 0===u||u,offset_minutes:null!==(p=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==p?p:0,azimuth_angle:null!==(g=null===(m=this._trigger)||void 0===m?void 0:m.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(v=null===(h=this._trigger)||void 0===h?void 0:h.account_for_duration)||void 0===v||v}:{type:S,name:null!==(b=null===(f=this._trigger)||void 0===f?void 0:f.name)&&void 0!==b?b:"",enabled:null===(y=null===(k=this._trigger)||void 0===k?void 0:k.enabled)||void 0===y||y,offset_minutes:null!==(z=null===(_=this._trigger)||void 0===_?void 0:_.offset_minutes)&&void 0!==z?z:0,account_for_duration:null===(x=null===(w=this._trigger)||void 0===w?void 0:w.account_for_duration)||void 0===x||x},this._trigger=A,this.requestUpdate()}_enabledChanged(e){const a=e.target;this._updateTrigger({enabled:a.checked})}_offsetChanged(e){const a=e.target;this._updateTrigger({offset_minutes:parseInt(a.value)||0})}_accountForDurationChanged(e){const a=e.target;this._updateTrigger({account_for_duration:a.checked})}_azimuthChanged(e){var a;if((null===(a=this._trigger)||void 0===a?void 0:a.type)!==Ee)return;const t=e.target;let i=parseInt(t.value,10);isNaN(i)&&(i=90),this._updateTrigger({azimuth_angle:i})}static get styles(){return[Xo,p`
        .wrapper {
          color: var(--primary-text-color);
        }

        .warning {
          --mdc-theme-primary: var(--error-color);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        ha-select {
          width: 100%;
        }

        /* native text inputs (ha-textfield isn't reliably registered in this
           dialog on HA 2026.3+, so we use the same .field look as the views) */
        .form-label {
          display: block;
          color: var(--primary-text-color);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .form-input {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: none;
          border-bottom: 1px solid
            var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
          border-radius: 4px 4px 0 0;
          background: var(
            --mdc-text-field-fill-color,
            var(--input-fill-color, rgba(0, 0, 0, 0.04))
          );
          color: var(--primary-text-color);
          font-size: 1rem;
        }
        .form-input:focus {
          outline: none;
          border-bottom: 2px solid var(--primary-color);
        }
        .dialog-help {
          margin-bottom: 16px;
          color: var(--secondary-text-color);
          font-size: 0.9em;
          line-height: 1.5;
        }
        .dialog-help code {
          font-family: var(--ha-font-family-code, monospace);
          background: var(--secondary-background-color);
          padding: 1px 6px;
          border-radius: 4px;
          color: var(--primary-text-color);
          white-space: nowrap;
        }

        ha-formfield {
          width: 100%;
        }
        .dialog-header-bar {
          display: flex;
          align-items: center;
          padding: 0 24px 0 8px;
          min-height: 56px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          background: var(
            --dialog-header-background,
            var(--card-background-color)
          );
        }
        .dialog-header {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--primary-text-color);
          flex: 1;
          text-align: left;
          margin-left: 8px;
        }
        .dialog-close {
          margin-right: 8px;
        }
      `]}};r([he({attribute:!1})],el.prototype,"hass",void 0),r([he({attribute:!1})],el.prototype,"params",void 0),r([ve()],el.prototype,"_trigger",void 0),el=r([me("smart-irrigation-trigger-dialog")],el);const al=p`
  /* --- collapsible card: a plain ha-card with a clickable header --- */
  .si-card {
    overflow: hidden;
  }
  .si-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    user-select: none;
  }
  .si-head:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .si-head-text {
    flex: 1 1 auto;
    min-width: 0;
  }
  .si-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .si-title {
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 0 1 auto;
    min-width: 0;
  }
  .si-sub {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .si-chevron {
    flex: 0 0 auto;
    color: var(--secondary-text-color);
    transition: transform 0.2s ease;
  }
  .si-chevron.open {
    transform: rotate(180deg);
  }
  .si-body {
    padding: 12px 16px 16px;
    border-top: 1px solid var(--divider-color);
  }

  /* --- native HA state pill (ha-label), tinted by state --- */
  ha-label.state-label {
    flex: 0 0 auto;
    --ha-label-background-color: rgba(
      var(--rgb-disabled-text-color, 120, 120, 120),
      0.15
    );
  }
  ha-label.state-label--automatic {
    --ha-label-background-color: rgba(
      var(--rgb-success-color, 67, 160, 71),
      0.18
    );
  }
  ha-label.state-label--manual {
    --ha-label-background-color: rgba(
      var(--rgb-warning-color, 255, 166, 0),
      0.22
    );
  }

  /* --- meta summary row --- */
  .si-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 28px;
    padding: 4px 0 12px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .meta-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
  }
  .meta-value {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  /* --- settings rows --- */
  .settings {
    display: flex;
    flex-direction: column;
  }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 52px;
    padding: 4px 0;
    border-bottom: 1px solid var(--divider-color);
  }
  .setting-row:last-child {
    border-bottom: 0;
  }
  .setting-label {
    color: var(--primary-text-color);
    font-weight: 500;
  }
  .setting-label .unit {
    color: var(--secondary-text-color);
    font-weight: 400;
    font-size: 0.85em;
  }

  /* --- per-field sub-group: section heading + its controls (shared by views) --- */
  .si-subgroup {
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color);
  }
  .si-subgroup:last-child {
    border-bottom: 0;
  }
  .si-subgroup-title {
    /* same font as the field labels below (.setting-label), just a touch larger
       and heavier so the section reads as a heading. em is relative to the
       surrounding body text, so it stays "a bit bigger than Source" whatever
       the base size is. */
    font-size: 1.05em;
    font-weight: 600;
    color: var(--primary-text-color);
    margin-bottom: 4px;
  }
  /* a sub-group's own setting-rows shouldn't draw their own divider line
     (the sub-group already has one), keeps the nested look clean */
  .si-subgroup .setting-row {
    border-bottom: 0;
    min-height: 44px;
  }

  /* --- unified field style for inputs AND selects (HA filled look) --- */
  .field {
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
    height: 44px;
    box-sizing: border-box;
    padding: 0 12px;
    border: none;
    border-bottom: 1px solid
      var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
    border-radius: 4px 4px 0 0;
    background: var(
      --mdc-text-field-fill-color,
      var(--input-fill-color, rgba(0, 0, 0, 0.04))
    );
    color: var(--primary-text-color);
    font-size: 1rem;
    font-family: var(--paper-font-body1_-_font-family, inherit);
    line-height: normal;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .field:hover {
    border-bottom-color: var(
      --mdc-text-field-hover-line-color,
      var(--primary-text-color)
    );
  }
  .field:focus {
    outline: none;
    border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
  }
  input.field[readonly] {
    opacity: 0.55;
    cursor: not-allowed;
  }
  /* keep the native up/down spinner arrows (they respect the per-field step);
     the spinner is the integrated, compact replacement for external +/- */

  /* number field: native up/down spinner (external +/- buttons removed) */
  .num-field {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
  }
  .num-field .num-input {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
    max-width: none;
    text-align: left;
  }
  .num-field .step-btn {
    display: none;
  }

  /* --- native select with themed chevron --- */
  .select-wrap {
    position: relative;
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
    display: inline-flex;
  }
  .select-wrap .field {
    width: 100%;
    max-width: 100%;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 36px;
    cursor: pointer;
  }
  .select-wrap .chev {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    pointer-events: none;
    fill: var(--secondary-text-color);
  }

  /* --- action buttons (native ha-button, tonal) in a 2-col grid --- */
  .si-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }
  /* a variant without the top border/margin (e.g. standalone action cards) */
  .si-actions.plain {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
  .si-actions ha-button {
    width: 100%;
  }
  .si-actions ha-button::part(base) {
    justify-content: flex-start;
  }
  .si-actions ha-button::part(label) {
    text-align: left;
  }
  .si-actions ha-button ha-svg-icon,
  .si-form-actions ha-button ha-svg-icon {
    --mdc-icon-size: 18px;
  }
  .si-form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }

  @media (max-width: 600px) {
    .si-actions {
      grid-template-columns: 1fr;
    }
    .setting-row {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
    .field,
    .select-wrap,
    .num-field {
      width: 100%;
      max-width: 100%;
    }
  }
`;let tl=class extends(Ca(ce)){constructor(){super(...arguments),this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null;return a=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this.saveData(a),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:je+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await Ma(this.hass),this.data=(e=this.config,a=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","autoclearenabled","cleardatatime","continuousupdates","sensor_debounce","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter((([e])=>a.includes(e))).reduce(((e,[a,t])=>Object.assign(e,{[a]:t})),{}):{})}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,a}}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}render(){var e,a,t;if(!this.hass||!this.config||!this.data)return q`<div class="loading-indicator">
        ${Bo("common.loading-messages.configuration",null!==(a=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==a?a:"en")}
      </div>`;if(this.isLoading)return q`<div class="loading-indicator">
        ${Bo("common.loading-messages.general",this.hass.language)}
      </div>`;{let e=q` <div class="card-content">
          ${Bo("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autocalcenabled}
              @change=${e=>this.handleConfigChange({autocalcenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autocalcenabled&&(e=q`${e}
          <div class="card-content">
            ${this._timeRow(Bo("panels.general.cards.automatic-duration-calculation.labels.calc-time",this.hass.language),this.config.calctime,(e=>this.handleConfigChange({calctime:e})))}
          </div>`),e=q`<ha-card
        header="${Bo("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}"
      >
        ${e}</ha-card
      >`;let a=q` <div class="card-content">
          ${Bo("panels.general.cards.automatic-update.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoupdateenabled&&(a=q`${a}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${Bo("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${null!==(t=this.data.autoupdateinterval)&&void 0!==t?t:""}
                  @change=${e=>this.saveData({autoupdateinterval:parseInt(e.target.value)})}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>this.saveData({autoupdateschedule:e.target.value})}
                  >
                    <option
                      value="${Te}"
                      ?selected=${this.data.autoupdateschedule===Te}
                    >
                      ${Bo("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${Me}"
                      ?selected=${this.data.autoupdateschedule===Me}
                    >
                      ${Bo("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${De}"
                      ?selected=${this.data.autoupdateschedule===De}
                    >
                      ${Bo("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Wo}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(a=q`${a}
          <div class="card-content">
            ${this._numRow(Bo("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,(e=>this.saveData({autoupdatedelay:parseInt(e)})),1)}
          </div>`),a=q`<ha-card header="${Bo("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${a}</ha-card>`;let i=q` <div class="card-content">
          ${Bo("panels.general.cards.automatic-clear.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.general.cards.automatic-clear.labels.automatic-clear-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoclearenabled}
              @change=${e=>this.handleConfigChange({autoclearenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoclearenabled&&(i=q`${i}
          <div class="card-content">
            ${this._timeRow(Bo("panels.general.cards.automatic-clear.labels.automatic-clear-time",this.hass.language),this.config.cleardatatime,(e=>this.handleConfigChange({cleardatatime:e})))}
          </div>`),i=q`<ha-card
        header="${Bo("panels.general.cards.automatic-clear.header",this.hass.language)}"
        >${i}</ha-card
      >`;let n=q`<div class="card-content">
          ${Bo("panels.general.cards.continuousupdates.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.continuousupdates&&(n=q`${n}
          <div class="card-content">
            ${this._numRow(Bo("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,(e=>this.handleConfigChange({sensor_debounce:parseInt(e)})),1)}
          </div>`),n=q`<ha-card
        header="${Bo("panels.general.cards.continuousupdates.header",this.hass.language)}"
        >${n}</ha-card
      > `;const r=this.renderTriggersCard(),s=this.renderWeatherSkipCard(),o=this.renderCoordinateCard(),l=this.renderDaysBetweenIrrigationCard(),d=this.renderObservedWateringCard();return q`<ha-card
          header="${Bo("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Bo("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${a}${e}${i}${n}${r}${s}${o}${l}${d}`}}renderTriggersCard(){if(!this.config||!this.data||!this.hass)return q``;const e=this.config.irrigation_start_triggers||[];return q`
      <ha-card
        header="${Bo("irrigation_start_triggers.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Bo("irrigation_start_triggers.description",this.hass.language)}
        </div>

        <div class="card-content trigger-usage">
          ${Bo("irrigation_start_triggers.usage_before",this.hass.language)}
          <code>smart_irrigation_start_irrigation_all_zones</code>${Bo("irrigation_start_triggers.usage_after",this.hass.language)}
        </div>

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("irrigation_start_triggers.active_label",this.hass.language)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({active_start_trigger:e.target.value})}
            >
              <option
                value="default"
                ?selected=${"default"===(this.config.active_start_trigger||"default")}
              >
                ${Bo("irrigation_start_triggers.active_default",this.hass.language)}
              </option>
              ${e.map((e=>q`
                  <option
                    value="${e.name}"
                    ?selected=${this.config.active_start_trigger===e.name}
                  >
                    ${e.name}
                  </option>
                `))}
            </select>
          </div>
          <div class="trigger-active-hint">
            ${Bo("irrigation_start_triggers.active_hint",this.hass.language)}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${0===e.length?q`
                  <div class="no-triggers">
                    ${Bo("irrigation_start_triggers.no_triggers",this.hass.language)}
                  </div>
                `:e.map(((e,a)=>this.renderTriggerItem(e,a)))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(Zo,Bo("irrigation_start_triggers.add_trigger",this.hass.language),(()=>this._addTrigger()))}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,a){if(!this.hass)return q``;const t=Bo(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let i="";if(e.type===$e&&0===e.offset_minutes)i=Bo("irrigation_start_triggers.offset_auto",this.hass.language);else{const a=Math.abs(e.offset_minutes),t=Math.floor(a/60),n=a%60,r=e.offset_minutes<0?Bo("common.labels.before",this.hass.language):Bo("common.labels.after",this.hass.language);i=t>0?`${t}h ${n}m ${r}`:`${n}m ${r}`}let n="";return e.type===Ee&&void 0!==e.azimuth_angle&&(n=` (${e.azimuth_angle}°)`),q`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${t}${n} - ${i}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?Bo("common.labels.enabled",this.hass.language):Bo("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(a)}"
            title="${Bo("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${Fo}"
            @click="${()=>this._deleteTrigger(a)}"
            title="${Bo("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var a,t;const i=null===(t=null===(a=this.config)||void 0===a?void 0:a.irrigation_start_triggers)||void 0===t?void 0:t[e];i&&this._showTriggerDialog({trigger:i,triggerIndex:e})}_deleteTrigger(e){var a,t;if(!(null===(a=this.config)||void 0===a?void 0:a.irrigation_start_triggers)||!this.hass)return;const i=(null===(t=this.config.irrigation_start_triggers[e])||void 0===t?void 0:t.name)||"Unknown";if(confirm(Bo("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",i))){const a=[...this.config.irrigation_start_triggers];a.splice(e,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:a}),this.saveData({[Ae]:a}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}}async _showTriggerDialog(e){if(!this.hass)return;const a=document.createElement("smart-irrigation-trigger-dialog");a.hass=this.hass,a.addEventListener("trigger-save",(e=>{this._handleTriggerSave(e.detail)})),a.addEventListener("trigger-delete",(e=>{this._handleTriggerDelete(e.detail)})),document.body.appendChild(a),await a.showDialog(e),a.addEventListener("closed",(e=>{const t=e.target;t&&"ha-dialog"===t.tagName.toLowerCase()&&document.body.removeChild(a)}))}_handleTriggerSave(e){if(!this.config)return;const a=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?a.push(e.trigger):void 0!==e.index&&(a[e.index]=e.trigger),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:a}),this.saveData({[Ae]:a}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}_handleTriggerDelete(e){var a;if(!(null===(a=this.config)||void 0===a?void 0:a.irrigation_start_triggers)||void 0===e.index)return;const t=[...this.config.irrigation_start_triggers];t.splice(e.index,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[Ae]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?q`
      <ha-card header="${Bo("weather_skip.title",this.hass.language)}">
        <div class="card-content">
          ${Bo("weather_skip.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("weather_skip.title",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.skip_irrigation_on_precipitation}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation?this._numRow(Bo("weather_skip.threshold_label",this.hass.language),$a(this.config,Se),this.config.precipitation_threshold_mm,(e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)})),.1):""}
        </div>
      </ha-card>
    `:q``}renderObservedWateringCard(){if(!this.config||!this.data||!this.hass)return q``;const e=this.hass.language;return q`
      <ha-card header="${Bo("observed_watering.title",e)}">
        <div class="card-content">
          ${Bo("observed_watering.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("observed_watering.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.observed_watering_enabled}
              @change=${e=>this.handleConfigChange({observed_watering_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              ${Bo("observed_watering.direct_control_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.direct_valve_control_enabled}
              @change=${e=>this.handleConfigChange({direct_valve_control_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.direct_valve_control_enabled?q`
                <div class="card-content">
                  ${Bo("observed_watering.direct_control_description",e)}
                </div>
                <div class="setting-row">
                  <div class="setting-label">
                    ${Bo("observed_watering.sequencing_label",e)}
                  </div>
                  <select
                    class="field"
                    @change=${e=>this.handleConfigChange({zone_sequencing:e.target.value})}
                  >
                    <option
                      value="sequential"
                      ?selected=${"sequential"===this.config.zone_sequencing}
                    >
                      ${Bo("observed_watering.sequencing.sequential",e)}
                    </option>
                    <option
                      value="parallel"
                      ?selected=${"parallel"===this.config.zone_sequencing}
                    >
                      ${Bo("observed_watering.sequencing.parallel",e)}
                    </option>
                  </select>
                </div>
              `:""}
        </div>
      </ha-card>
    `}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return q``;const e=this.hass.config,a=(null==e?void 0:e.latitude)||0,t=(null==e?void 0:e.longitude)||0,i=(null==e?void 0:e.elevation)||0;return q`
      <ha-card
        header="${Bo("coordinate_config.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Bo("coordinate_config.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${e=>this.saveData({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.data.manual_coordinates_enabled?q`
                    ${this._numRow(Bo("coordinate_config.latitude",this.hass.language),"",this.data.manual_latitude||a,(e=>this.handleConfigChange({manual_latitude:parseFloat(e)})),.1)}
                    ${this._numRow(Bo("coordinate_config.longitude",this.hass.language),"",this.data.manual_longitude||t,(e=>this.handleConfigChange({manual_longitude:parseFloat(e)})),.1)}
                    ${this._numRow(Bo("coordinate_config.elevation",this.hass.language),"",this.data.manual_elevation||i,(e=>this.handleConfigChange({manual_elevation:parseFloat(e)})),1)}
                  `:q`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${Bo("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${Bo("coordinate_config.latitude",this.hass.language)}:
                      ${a}<br />
                      ${Bo("coordinate_config.longitude",this.hass.language)}:
                      ${t}<br />
                      ${Bo("coordinate_config.elevation",this.hass.language)}:
                      ${i}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){return this.config&&this.data&&this.hass?q`
      <ha-card
        header="${Bo("days_between_irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Bo("days_between_irrigation.description",this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(Bo("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,(e=>this.handleConfigChange({days_between_irrigation:parseInt(e)})),1)}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${Bo("days_between_irrigation.help_text",this.hass.language)}
            </div>
          </div>
        </div>
      </ha-card>
    `:q``}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this.config=Object.assign(Object.assign({},this.config),e),this._scheduleUpdate(),await(a=this.hass,t=this.data,a.callApi("POST",je+"/config",t))}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),Ea(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var a,t}}handleConfigChange(e){this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback()}_textRow(e,a,t,i){return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==t?"":String(t)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_timeRow(e,a,t){return q`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <input
          class="field"
          type="time"
          .value=${a?String(a):""}
          @change=${e=>t(e.target.value)}
        />
      </div>
    `}_numRow(e,a,t,i,n=1,r=!1){const s=(String(n).split(".")[1]||"").length,o=(e,a)=>{const t=parseFloat(e.value),r=+((isNaN(t)?0:t)+a*n).toFixed(s);e.value=String(r),i(String(r))};return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${r}
            .value=${null==t?"":String(t)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Go}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Zo}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,a,t){return q`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${t}>
            ${a}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Wo}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,a,t,i=!1,n=!1){return q`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${t}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${a}
      </ha-button>
    `}static get styles(){return p`
      ${Qo} ${al} /* View-specific styles only - most common styles are now in globalStyle */

      /* Drop the clickable (i) toggles and just always show the section
         descriptions (they're short and not in the way). */
      .card-content:has(> svg[id$="description"]) {
        display: none;
      }
      label[id$="description"] {
        display: block;
        margin: 0 0 8px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* number + unit-select on a single line (e.g. update interval) */
      .combo-field {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }
      .combo-field .combo-num {
        width: 90px;
        max-width: none;
      }
      .combo-field .select-wrap {
        width: 150px;
        max-width: none;
      }
      @media (max-width: 600px) {
        .combo-field {
          width: 100%;
        }
        .combo-field .combo-num {
          flex: 1 1 auto;
        }
      }

      /* Irrigation triggers styles */
      .trigger-usage {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.5;
      }
      .trigger-active-hint {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        line-height: 1.4;
        margin-top: 6px;
      }
      .trigger-usage code {
        font-family: var(--ha-font-family-code, monospace);
        background: var(--secondary-background-color);
        padding: 1px 6px;
        border-radius: 4px;
        color: var(--primary-text-color);
        white-space: nowrap;
      }

      .triggers-list {
        margin: 16px 0;
      }

      .no-triggers {
        text-align: left;
        padding: 16px 0;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .trigger-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        margin: 8px 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .trigger-item.disabled {
        opacity: 0.6;
      }

      .trigger-main {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 16px;
      }

      .trigger-info {
        flex: 1;
      }

      .trigger-name {
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .trigger-details {
        font-size: 0.875rem;
        color: var(--secondary-text-color);
      }

      .trigger-status {
        font-size: 0.875rem;
        padding: 4px 8px;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        min-width: 60px;
        text-align: center;
      }

      .trigger-item.disabled .trigger-status {
        background: var(--disabled-text-color);
      }

      .trigger-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .add-trigger-section {
        margin-top: 16px;
        text-align: right;
      }

      .add-trigger-section ha-button {
        --mdc-theme-primary: var(--primary-color);
      }

      .add-trigger-section ha-icon {
        margin-right: 8px;
      }
    `}};r([he()],tl.prototype,"narrow",void 0),r([he()],tl.prototype,"path",void 0),r([he()],tl.prototype,"data",void 0),r([he()],tl.prototype,"config",void 0),r([he({type:Boolean})],tl.prototype,"isLoading",void 0),r([he({type:Boolean})],tl.prototype,"isSaving",void 0),tl=r([me("smart-irrigation-view-general")],tl);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:il}=oe,nl=()=>document.createComment(""),rl=(e,a,t)=>{var i;const n=e._$AA.parentNode,r=void 0===a?e._$AB:a._$AA;if(void 0===t){const a=n.insertBefore(nl(),r),i=n.insertBefore(nl(),r);t=new il(a,i,e,e.options)}else{const a=t._$AB.nextSibling,s=t._$AM,o=s!==e;if(o){let a;null===(i=t._$AQ)||void 0===i||i.call(t,e),t._$AM=e,void 0!==t._$AP&&(a=e._$AU)!==s._$AU&&t._$AP(a)}if(a!==r||o){let e=t._$AA;for(;e!==a;){const a=e.nextSibling;n.insertBefore(e,r),e=a}}}return t},sl=(e,a,t=e)=>(e._$AI(a,t),e),ol={},ll=(e,a=ol)=>e._$AH=a,dl=e=>{var a;null===(a=e._$AP)||void 0===a||a.call(e,!1,!0);let t=e._$AA;const i=e._$AB.nextSibling;for(;t!==i;){const e=t.nextSibling;t.remove(),t=e}},ul=(e,a,t)=>{const i=new Map;for(let n=a;n<=t;n++)i.set(e[n],n);return i},cl=wa(class extends xa{constructor(e){if(super(e),e.type!==za)throw Error("repeat() can only be used in text expressions")}ct(e,a,t){let i;void 0===t?t=a:void 0!==a&&(i=a);const n=[],r=[];let s=0;for(const a of e)n[s]=i?i(a,s):s,r[s]=t(a,s),s++;return{values:r,keys:n}}render(e,a,t){return this.ct(e,a,t).values}update(e,[a,t,i]){var n;const r=(e=>e._$AH)(e),{values:s,keys:o}=this.ct(a,t,i);if(!Array.isArray(r))return this.ut=o,s;const l=null!==(n=this.ut)&&void 0!==n?n:this.ut=[],d=[];let u,c,p=0,m=r.length-1,g=0,h=s.length-1;for(;p<=m&&g<=h;)if(null===r[p])p++;else if(null===r[m])m--;else if(l[p]===o[g])d[g]=sl(r[p],s[g]),p++,g++;else if(l[m]===o[h])d[h]=sl(r[m],s[h]),m--,h--;else if(l[p]===o[h])d[h]=sl(r[p],s[h]),rl(e,d[h+1],r[p]),p++,h--;else if(l[m]===o[g])d[g]=sl(r[m],s[g]),rl(e,r[p],r[m]),m--,g++;else if(void 0===u&&(u=ul(o,g,h),c=ul(l,p,m)),u.has(l[p]))if(u.has(l[m])){const a=c.get(o[g]),t=void 0!==a?r[a]:null;if(null===t){const a=rl(e,r[p]);sl(a,s[g]),d[g]=a}else d[g]=sl(t,s[g]),rl(e,r[p],t),r[a]=null;g++}else dl(r[m]),m--;else dl(r[p]),p++;for(;g<=h;){const a=rl(e,d[h+1]);sl(a,s[g]),d[g++]=a}for(;p<=m;){const e=r[p++];null!==e&&dl(e)}return this.ut=o,ll(e,d),F}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var pl,ml;function gl(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function hl(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth"}(pl||(pl={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(ml||(ml={}));var vl,fl={exports:{}};var bl,kl=(vl||(vl=1,(bl=fl).exports=function(){var e,a;function t(){return e.apply(null,arguments)}function i(a){e=a}function n(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function r(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function s(e,a){return Object.prototype.hasOwnProperty.call(e,a)}function o(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var a;for(a in e)if(s(e,a))return!1;return!0}function l(e){return void 0===e}function d(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function u(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function c(e,a){var t,i=[],n=e.length;for(t=0;t<n;++t)i.push(a(e[t],t));return i}function p(e,a){for(var t in a)s(a,t)&&(e[t]=a[t]);return s(a,"toString")&&(e.toString=a.toString),s(a,"valueOf")&&(e.valueOf=a.valueOf),e}function m(e,a,t,i){return Wt(e,a,t,i,!0).utc()}function g(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function h(e){return null==e._pf&&(e._pf=g()),e._pf}function v(e){var t=null,i=!1,n=e._d&&!isNaN(e._d.getTime());return n&&(t=h(e),i=a.call(t.parsedDateParts,(function(e){return null!=e})),n=t.overflow<0&&!t.empty&&!t.invalidEra&&!t.invalidMonth&&!t.invalidWeekday&&!t.weekdayMismatch&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated&&(!t.meridiem||t.meridiem&&i),e._strict&&(n=n&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?n:(e._isValid=n,e._isValid)}function f(e){var a=m(NaN);return null!=e?p(h(a),e):h(a).userInvalidated=!0,a}a=Array.prototype.some?Array.prototype.some:function(e){var a,t=Object(this),i=t.length>>>0;for(a=0;a<i;a++)if(a in t&&e.call(this,t[a],a,t))return!0;return!1};var b=t.momentProperties=[],k=!1;function y(e,a){var t,i,n,r=b.length;if(l(a._isAMomentObject)||(e._isAMomentObject=a._isAMomentObject),l(a._i)||(e._i=a._i),l(a._f)||(e._f=a._f),l(a._l)||(e._l=a._l),l(a._strict)||(e._strict=a._strict),l(a._tzm)||(e._tzm=a._tzm),l(a._isUTC)||(e._isUTC=a._isUTC),l(a._offset)||(e._offset=a._offset),l(a._pf)||(e._pf=h(a)),l(a._locale)||(e._locale=a._locale),r>0)for(t=0;t<r;t++)l(n=a[i=b[t]])||(e[i]=n);return e}function _(e){y(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===k&&(k=!0,t.updateOffset(this),k=!1)}function z(e){return e instanceof _||null!=e&&null!=e._isAMomentObject}function w(e){!1===t.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function x(e,a){var i=!0;return p((function(){if(null!=t.deprecationHandler&&t.deprecationHandler(null,e),i){var n,r,o,l=[],d=arguments.length;for(r=0;r<d;r++){if(n="","object"==typeof arguments[r]){for(o in n+="\n["+r+"] ",arguments[0])s(arguments[0],o)&&(n+=o+": "+arguments[0][o]+", ");n=n.slice(0,-2)}else n=arguments[r];l.push(n)}w(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),i=!1}return a.apply(this,arguments)}),a)}var j,S={};function A(e,a){null!=t.deprecationHandler&&t.deprecationHandler(e,a),S[e]||(w(a),S[e]=!0)}function $(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}function E(e){var a,t;for(t in e)s(e,t)&&($(a=e[t])?this[t]=a:this["_"+t]=a);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function T(e,a){var t,i=p({},e);for(t in a)s(a,t)&&(r(e[t])&&r(a[t])?(i[t]={},p(i[t],e[t]),p(i[t],a[t])):null!=a[t]?i[t]=a[t]:delete i[t]);for(t in e)s(e,t)&&!s(a,t)&&r(e[t])&&(i[t]=p({},i[t]));return i}function M(e){null!=e&&this.set(e)}t.suppressDeprecationWarnings=!1,t.deprecationHandler=null,j=Object.keys?Object.keys:function(e){var a,t=[];for(a in e)s(e,a)&&t.push(a);return t};var D={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function O(e,a,t){var i=this._calendar[e]||this._calendar.sameElse;return $(i)?i.call(a,t):i}function N(e,a,t){var i=""+Math.abs(e),n=a-i.length;return(e>=0?t?"+":"":"-")+Math.pow(10,Math.max(0,n)).toString().substr(1)+i}var P=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,C=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,H={},I={};function L(e,a,t,i){var n=i;"string"==typeof i&&(n=function(){return this[i]()}),e&&(I[e]=n),a&&(I[a[0]]=function(){return N(n.apply(this,arguments),a[1],a[2])}),t&&(I[t]=function(){return this.localeData().ordinal(n.apply(this,arguments),e)})}function B(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function U(e){var a,t,i=e.match(P);for(a=0,t=i.length;a<t;a++)I[i[a]]?i[a]=I[i[a]]:i[a]=B(i[a]);return function(a){var n,r="";for(n=0;n<t;n++)r+=$(i[n])?i[n].call(a,e):i[n];return r}}function R(e,a){return e.isValid()?(a=V(a,e.localeData()),H[a]=H[a]||U(a),H[a](e)):e.localeData().invalidDate()}function V(e,a){var t=5;function i(e){return a.longDateFormat(e)||e}for(C.lastIndex=0;t>=0&&C.test(e);)e=e.replace(C,i),C.lastIndex=0,t-=1;return e}var q={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function F(e){var a=this._longDateFormat[e],t=this._longDateFormat[e.toUpperCase()];return a||!t?a:(this._longDateFormat[e]=t.match(P).map((function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e})).join(""),this._longDateFormat[e])}var W="Invalid date";function G(){return this._invalidDate}var Y="%d",Z=/\d{1,2}/;function K(e){return this._ordinal.replace("%d",e)}var J={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function Q(e,a,t,i){var n=this._relativeTime[t];return $(n)?n(e,a,t,i):n.replace(/%d/i,e)}function X(e,a){var t=this._relativeTime[e>0?"future":"past"];return $(t)?t(a):t.replace(/%s/i,a)}var ee={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function ae(e){return"string"==typeof e?ee[e]||ee[e.toLowerCase()]:void 0}function te(e){var a,t,i={};for(t in e)s(e,t)&&(a=ae(t))&&(i[a]=e[t]);return i}var ie={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function ne(e){var a,t=[];for(a in e)s(e,a)&&t.push({unit:a,priority:ie[a]});return t.sort((function(e,a){return e.priority-a.priority})),t}var re,se=/\d/,oe=/\d\d/,le=/\d{3}/,de=/\d{4}/,ue=/[+-]?\d{6}/,ce=/\d\d?/,pe=/\d\d\d\d?/,me=/\d\d\d\d\d\d?/,ge=/\d{1,3}/,he=/\d{1,4}/,ve=/[+-]?\d{1,6}/,fe=/\d+/,be=/[+-]?\d+/,ke=/Z|[+-]\d\d:?\d\d/gi,ye=/Z|[+-]\d\d(?::?\d\d)?/gi,_e=/[+-]?\d+(\.\d{1,3})?/,ze=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,we=/^[1-9]\d?/,xe=/^([1-9]\d|\d)/;function je(e,a,t){re[e]=$(a)?a:function(e,i){return e&&t?t:a}}function Se(e,a){return s(re,e)?re[e](a._strict,a._locale):new RegExp(Ae(e))}function Ae(e){return $e(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,(function(e,a,t,i,n){return a||t||i||n})))}function $e(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Ee(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function Te(e){var a=+e,t=0;return 0!==a&&isFinite(a)&&(t=Ee(a)),t}re={};var Me={};function De(e,a){var t,i,n=a;for("string"==typeof e&&(e=[e]),d(a)&&(n=function(e,t){t[a]=Te(e)}),i=e.length,t=0;t<i;t++)Me[e[t]]=n}function Oe(e,a){De(e,(function(e,t,i,n){i._w=i._w||{},a(e,i._w,i,n)}))}function Ne(e,a,t){null!=a&&s(Me,e)&&Me[e](a,t._a,t,e)}function Pe(e){return e%4==0&&e%100!=0||e%400==0}var Ce=0,He=1,Ie=2,Le=3,Be=4,Ue=5,Re=6,Ve=7,qe=8;function Fe(e){return Pe(e)?366:365}L("Y",0,0,(function(){var e=this.year();return e<=9999?N(e,4):"+"+e})),L(0,["YY",2],0,(function(){return this.year()%100})),L(0,["YYYY",4],0,"year"),L(0,["YYYYY",5],0,"year"),L(0,["YYYYYY",6,!0],0,"year"),je("Y",be),je("YY",ce,oe),je("YYYY",he,de),je("YYYYY",ve,ue),je("YYYYYY",ve,ue),De(["YYYYY","YYYYYY"],Ce),De("YYYY",(function(e,a){a[Ce]=2===e.length?t.parseTwoDigitYear(e):Te(e)})),De("YY",(function(e,a){a[Ce]=t.parseTwoDigitYear(e)})),De("Y",(function(e,a){a[Ce]=parseInt(e,10)})),t.parseTwoDigitYear=function(e){return Te(e)+(Te(e)>68?1900:2e3)};var We,Ge=Ze("FullYear",!0);function Ye(){return Pe(this.year())}function Ze(e,a){return function(i){return null!=i?(Je(this,e,i),t.updateOffset(this,a),this):Ke(this,e)}}function Ke(e,a){if(!e.isValid())return NaN;var t=e._d,i=e._isUTC;switch(a){case"Milliseconds":return i?t.getUTCMilliseconds():t.getMilliseconds();case"Seconds":return i?t.getUTCSeconds():t.getSeconds();case"Minutes":return i?t.getUTCMinutes():t.getMinutes();case"Hours":return i?t.getUTCHours():t.getHours();case"Date":return i?t.getUTCDate():t.getDate();case"Day":return i?t.getUTCDay():t.getDay();case"Month":return i?t.getUTCMonth():t.getMonth();case"FullYear":return i?t.getUTCFullYear():t.getFullYear();default:return NaN}}function Je(e,a,t){var i,n,r,s,o;if(e.isValid()&&!isNaN(t)){switch(i=e._d,n=e._isUTC,a){case"Milliseconds":return void(n?i.setUTCMilliseconds(t):i.setMilliseconds(t));case"Seconds":return void(n?i.setUTCSeconds(t):i.setSeconds(t));case"Minutes":return void(n?i.setUTCMinutes(t):i.setMinutes(t));case"Hours":return void(n?i.setUTCHours(t):i.setHours(t));case"Date":return void(n?i.setUTCDate(t):i.setDate(t));case"FullYear":break;default:return}r=t,s=e.month(),o=29!==(o=e.date())||1!==s||Pe(r)?o:28,n?i.setUTCFullYear(r,s,o):i.setFullYear(r,s,o)}}function Qe(e){return $(this[e=ae(e)])?this[e]():this}function Xe(e,a){if("object"==typeof e){var t,i=ne(e=te(e)),n=i.length;for(t=0;t<n;t++)this[i[t].unit](e[i[t].unit])}else if($(this[e=ae(e)]))return this[e](a);return this}function ea(e,a){return(e%a+a)%a}function aa(e,a){if(isNaN(e)||isNaN(a))return NaN;var t=ea(a,12);return e+=(a-t)/12,1===t?Pe(e)?29:28:31-t%7%2}We=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var a;for(a=0;a<this.length;++a)if(this[a]===e)return a;return-1},L("M",["MM",2],"Mo",(function(){return this.month()+1})),L("MMM",0,0,(function(e){return this.localeData().monthsShort(this,e)})),L("MMMM",0,0,(function(e){return this.localeData().months(this,e)})),je("M",ce,we),je("MM",ce,oe),je("MMM",(function(e,a){return a.monthsShortRegex(e)})),je("MMMM",(function(e,a){return a.monthsRegex(e)})),De(["M","MM"],(function(e,a){a[He]=Te(e)-1})),De(["MMM","MMMM"],(function(e,a,t,i){var n=t._locale.monthsParse(e,i,t._strict);null!=n?a[He]=n:h(t).invalidMonth=e}));var ta="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ia="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),na=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,ra=ze,sa=ze;function oa(e,a){return e?n(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||na).test(a)?"format":"standalone"][e.month()]:n(this._months)?this._months:this._months.standalone}function la(e,a){return e?n(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[na.test(a)?"format":"standalone"][e.month()]:n(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function da(e,a,t){var i,n,r,s=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],i=0;i<12;++i)r=m([2e3,i]),this._shortMonthsParse[i]=this.monthsShort(r,"").toLocaleLowerCase(),this._longMonthsParse[i]=this.months(r,"").toLocaleLowerCase();return t?"MMM"===a?-1!==(n=We.call(this._shortMonthsParse,s))?n:null:-1!==(n=We.call(this._longMonthsParse,s))?n:null:"MMM"===a?-1!==(n=We.call(this._shortMonthsParse,s))||-1!==(n=We.call(this._longMonthsParse,s))?n:null:-1!==(n=We.call(this._longMonthsParse,s))||-1!==(n=We.call(this._shortMonthsParse,s))?n:null}function ua(e,a,t){var i,n,r;if(this._monthsParseExact)return da.call(this,e,a,t);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),i=0;i<12;i++){if(n=m([2e3,i]),t&&!this._longMonthsParse[i]&&(this._longMonthsParse[i]=new RegExp("^"+this.months(n,"").replace(".","")+"$","i"),this._shortMonthsParse[i]=new RegExp("^"+this.monthsShort(n,"").replace(".","")+"$","i")),t||this._monthsParse[i]||(r="^"+this.months(n,"")+"|^"+this.monthsShort(n,""),this._monthsParse[i]=new RegExp(r.replace(".",""),"i")),t&&"MMMM"===a&&this._longMonthsParse[i].test(e))return i;if(t&&"MMM"===a&&this._shortMonthsParse[i].test(e))return i;if(!t&&this._monthsParse[i].test(e))return i}}function ca(e,a){if(!e.isValid())return e;if("string"==typeof a)if(/^\d+$/.test(a))a=Te(a);else if(!d(a=e.localeData().monthsParse(a)))return e;var t=a,i=e.date();return i=i<29?i:Math.min(i,aa(e.year(),t)),e._isUTC?e._d.setUTCMonth(t,i):e._d.setMonth(t,i),e}function pa(e){return null!=e?(ca(this,e),t.updateOffset(this,!0),this):Ke(this,"Month")}function ma(){return aa(this.year(),this.month())}function ga(e){return this._monthsParseExact?(s(this,"_monthsRegex")||va.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(s(this,"_monthsShortRegex")||(this._monthsShortRegex=ra),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function ha(e){return this._monthsParseExact?(s(this,"_monthsRegex")||va.call(this),e?this._monthsStrictRegex:this._monthsRegex):(s(this,"_monthsRegex")||(this._monthsRegex=sa),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function va(){function e(e,a){return a.length-e.length}var a,t,i,n,r=[],s=[],o=[];for(a=0;a<12;a++)t=m([2e3,a]),i=$e(this.monthsShort(t,"")),n=$e(this.months(t,"")),r.push(i),s.push(n),o.push(n),o.push(i);r.sort(e),s.sort(e),o.sort(e),this._monthsRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+s.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+r.join("|")+")","i")}function fa(e,a,t,i,n,r,s){var o;return e<100&&e>=0?(o=new Date(e+400,a,t,i,n,r,s),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,a,t,i,n,r,s),o}function ba(e){var a,t;return e<100&&e>=0?((t=Array.prototype.slice.call(arguments))[0]=e+400,a=new Date(Date.UTC.apply(null,t)),isFinite(a.getUTCFullYear())&&a.setUTCFullYear(e)):a=new Date(Date.UTC.apply(null,arguments)),a}function ka(e,a,t){var i=7+a-t;return-(7+ba(e,0,i).getUTCDay()-a)%7+i-1}function ya(e,a,t,i,n){var r,s,o=1+7*(a-1)+(7+t-i)%7+ka(e,i,n);return o<=0?s=Fe(r=e-1)+o:o>Fe(e)?(r=e+1,s=o-Fe(e)):(r=e,s=o),{year:r,dayOfYear:s}}function _a(e,a,t){var i,n,r=ka(e.year(),a,t),s=Math.floor((e.dayOfYear()-r-1)/7)+1;return s<1?i=s+za(n=e.year()-1,a,t):s>za(e.year(),a,t)?(i=s-za(e.year(),a,t),n=e.year()+1):(n=e.year(),i=s),{week:i,year:n}}function za(e,a,t){var i=ka(e,a,t),n=ka(e+1,a,t);return(Fe(e)-i+n)/7}function wa(e){return _a(e,this._week.dow,this._week.doy).week}L("w",["ww",2],"wo","week"),L("W",["WW",2],"Wo","isoWeek"),je("w",ce,we),je("ww",ce,oe),je("W",ce,we),je("WW",ce,oe),Oe(["w","ww","W","WW"],(function(e,a,t,i){a[i.substr(0,1)]=Te(e)}));var xa={dow:0,doy:6};function ja(){return this._week.dow}function Sa(){return this._week.doy}function Aa(e){var a=this.localeData().week(this);return null==e?a:this.add(7*(e-a),"d")}function $a(e){var a=_a(this,1,4).week;return null==e?a:this.add(7*(e-a),"d")}function Ea(e,a){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=a.weekdaysParse(e))?e:null:parseInt(e,10)}function Ta(e,a){return"string"==typeof e?a.weekdaysParse(e)%7||7:isNaN(e)?null:e}function Ma(e,a){return e.slice(a,7).concat(e.slice(0,a))}L("d",0,"do","day"),L("dd",0,0,(function(e){return this.localeData().weekdaysMin(this,e)})),L("ddd",0,0,(function(e){return this.localeData().weekdaysShort(this,e)})),L("dddd",0,0,(function(e){return this.localeData().weekdays(this,e)})),L("e",0,0,"weekday"),L("E",0,0,"isoWeekday"),je("d",ce),je("e",ce),je("E",ce),je("dd",(function(e,a){return a.weekdaysMinRegex(e)})),je("ddd",(function(e,a){return a.weekdaysShortRegex(e)})),je("dddd",(function(e,a){return a.weekdaysRegex(e)})),Oe(["dd","ddd","dddd"],(function(e,a,t,i){var n=t._locale.weekdaysParse(e,i,t._strict);null!=n?a.d=n:h(t).invalidWeekday=e})),Oe(["d","e","E"],(function(e,a,t,i){a[i]=Te(e)}));var Da="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Oa="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Na="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),Pa=ze,Ca=ze,Ha=ze;function Ia(e,a){var t=n(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(a)?"format":"standalone"];return!0===e?Ma(t,this._week.dow):e?t[e.day()]:t}function La(e){return!0===e?Ma(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function Ba(e){return!0===e?Ma(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function Ua(e,a,t){var i,n,r,s=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],i=0;i<7;++i)r=m([2e3,1]).day(i),this._minWeekdaysParse[i]=this.weekdaysMin(r,"").toLocaleLowerCase(),this._shortWeekdaysParse[i]=this.weekdaysShort(r,"").toLocaleLowerCase(),this._weekdaysParse[i]=this.weekdays(r,"").toLocaleLowerCase();return t?"dddd"===a?-1!==(n=We.call(this._weekdaysParse,s))?n:null:"ddd"===a?-1!==(n=We.call(this._shortWeekdaysParse,s))?n:null:-1!==(n=We.call(this._minWeekdaysParse,s))?n:null:"dddd"===a?-1!==(n=We.call(this._weekdaysParse,s))||-1!==(n=We.call(this._shortWeekdaysParse,s))||-1!==(n=We.call(this._minWeekdaysParse,s))?n:null:"ddd"===a?-1!==(n=We.call(this._shortWeekdaysParse,s))||-1!==(n=We.call(this._weekdaysParse,s))||-1!==(n=We.call(this._minWeekdaysParse,s))?n:null:-1!==(n=We.call(this._minWeekdaysParse,s))||-1!==(n=We.call(this._weekdaysParse,s))||-1!==(n=We.call(this._shortWeekdaysParse,s))?n:null}function Ra(e,a,t){var i,n,r;if(this._weekdaysParseExact)return Ua.call(this,e,a,t);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),i=0;i<7;i++){if(n=m([2e3,1]).day(i),t&&!this._fullWeekdaysParse[i]&&(this._fullWeekdaysParse[i]=new RegExp("^"+this.weekdays(n,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[i]=new RegExp("^"+this.weekdaysShort(n,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[i]=new RegExp("^"+this.weekdaysMin(n,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[i]||(r="^"+this.weekdays(n,"")+"|^"+this.weekdaysShort(n,"")+"|^"+this.weekdaysMin(n,""),this._weekdaysParse[i]=new RegExp(r.replace(".",""),"i")),t&&"dddd"===a&&this._fullWeekdaysParse[i].test(e))return i;if(t&&"ddd"===a&&this._shortWeekdaysParse[i].test(e))return i;if(t&&"dd"===a&&this._minWeekdaysParse[i].test(e))return i;if(!t&&this._weekdaysParse[i].test(e))return i}}function Va(e){if(!this.isValid())return null!=e?this:NaN;var a=Ke(this,"Day");return null!=e?(e=Ea(e,this.localeData()),this.add(e-a,"d")):a}function qa(e){if(!this.isValid())return null!=e?this:NaN;var a=(this.day()+7-this.localeData()._week.dow)%7;return null==e?a:this.add(e-a,"d")}function Fa(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var a=Ta(e,this.localeData());return this.day(this.day()%7?a:a-7)}return this.day()||7}function Wa(e){return this._weekdaysParseExact?(s(this,"_weekdaysRegex")||Za.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(s(this,"_weekdaysRegex")||(this._weekdaysRegex=Pa),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function Ga(e){return this._weekdaysParseExact?(s(this,"_weekdaysRegex")||Za.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(s(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=Ca),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Ya(e){return this._weekdaysParseExact?(s(this,"_weekdaysRegex")||Za.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(s(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=Ha),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Za(){function e(e,a){return a.length-e.length}var a,t,i,n,r,s=[],o=[],l=[],d=[];for(a=0;a<7;a++)t=m([2e3,1]).day(a),i=$e(this.weekdaysMin(t,"")),n=$e(this.weekdaysShort(t,"")),r=$e(this.weekdays(t,"")),s.push(i),o.push(n),l.push(r),d.push(i),d.push(n),d.push(r);s.sort(e),o.sort(e),l.sort(e),d.sort(e),this._weekdaysRegex=new RegExp("^("+d.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+s.join("|")+")","i")}function Ka(){return this.hours()%12||12}function Ja(){return this.hours()||24}function Qa(e,a){L(e,0,0,(function(){return this.localeData().meridiem(this.hours(),this.minutes(),a)}))}function Xa(e,a){return a._meridiemParse}function et(e){return"p"===(e+"").toLowerCase().charAt(0)}L("H",["HH",2],0,"hour"),L("h",["hh",2],0,Ka),L("k",["kk",2],0,Ja),L("hmm",0,0,(function(){return""+Ka.apply(this)+N(this.minutes(),2)})),L("hmmss",0,0,(function(){return""+Ka.apply(this)+N(this.minutes(),2)+N(this.seconds(),2)})),L("Hmm",0,0,(function(){return""+this.hours()+N(this.minutes(),2)})),L("Hmmss",0,0,(function(){return""+this.hours()+N(this.minutes(),2)+N(this.seconds(),2)})),Qa("a",!0),Qa("A",!1),je("a",Xa),je("A",Xa),je("H",ce,xe),je("h",ce,we),je("k",ce,we),je("HH",ce,oe),je("hh",ce,oe),je("kk",ce,oe),je("hmm",pe),je("hmmss",me),je("Hmm",pe),je("Hmmss",me),De(["H","HH"],Le),De(["k","kk"],(function(e,a,t){var i=Te(e);a[Le]=24===i?0:i})),De(["a","A"],(function(e,a,t){t._isPm=t._locale.isPM(e),t._meridiem=e})),De(["h","hh"],(function(e,a,t){a[Le]=Te(e),h(t).bigHour=!0})),De("hmm",(function(e,a,t){var i=e.length-2;a[Le]=Te(e.substr(0,i)),a[Be]=Te(e.substr(i)),h(t).bigHour=!0})),De("hmmss",(function(e,a,t){var i=e.length-4,n=e.length-2;a[Le]=Te(e.substr(0,i)),a[Be]=Te(e.substr(i,2)),a[Ue]=Te(e.substr(n)),h(t).bigHour=!0})),De("Hmm",(function(e,a,t){var i=e.length-2;a[Le]=Te(e.substr(0,i)),a[Be]=Te(e.substr(i))})),De("Hmmss",(function(e,a,t){var i=e.length-4,n=e.length-2;a[Le]=Te(e.substr(0,i)),a[Be]=Te(e.substr(i,2)),a[Ue]=Te(e.substr(n))}));var at=/[ap]\.?m?\.?/i,tt=Ze("Hours",!0);function it(e,a,t){return e>11?t?"pm":"PM":t?"am":"AM"}var nt,rt={calendar:D,longDateFormat:q,invalidDate:W,ordinal:Y,dayOfMonthOrdinalParse:Z,relativeTime:J,months:ta,monthsShort:ia,week:xa,weekdays:Da,weekdaysMin:Na,weekdaysShort:Oa,meridiemParse:at},st={},ot={};function lt(e,a){var t,i=Math.min(e.length,a.length);for(t=0;t<i;t+=1)if(e[t]!==a[t])return t;return i}function dt(e){return e?e.toLowerCase().replace("_","-"):e}function ut(e){for(var a,t,i,n,r=0;r<e.length;){for(a=(n=dt(e[r]).split("-")).length,t=(t=dt(e[r+1]))?t.split("-"):null;a>0;){if(i=pt(n.slice(0,a).join("-")))return i;if(t&&t.length>=a&&lt(n,t)>=a-1)break;a--}r++}return nt}function ct(e){return!(!e||!e.match("^[^/\\\\]*$"))}function pt(e){var a=null;if(void 0===st[e]&&bl&&bl.exports&&ct(e))try{a=nt._abbr,hl("./locale/"+e),mt(a)}catch(a){st[e]=null}return st[e]}function mt(e,a){var t;return e&&((t=l(a)?vt(e):gt(e,a))?nt=t:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),nt._abbr}function gt(e,a){if(null!==a){var t,i=rt;if(a.abbr=e,null!=st[e])A("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),i=st[e]._config;else if(null!=a.parentLocale)if(null!=st[a.parentLocale])i=st[a.parentLocale]._config;else{if(null==(t=pt(a.parentLocale)))return ot[a.parentLocale]||(ot[a.parentLocale]=[]),ot[a.parentLocale].push({name:e,config:a}),null;i=t._config}return st[e]=new M(T(i,a)),ot[e]&&ot[e].forEach((function(e){gt(e.name,e.config)})),mt(e),st[e]}return delete st[e],null}function ht(e,a){if(null!=a){var t,i,n=rt;null!=st[e]&&null!=st[e].parentLocale?st[e].set(T(st[e]._config,a)):(null!=(i=pt(e))&&(n=i._config),a=T(n,a),null==i&&(a.abbr=e),(t=new M(a)).parentLocale=st[e],st[e]=t),mt(e)}else null!=st[e]&&(null!=st[e].parentLocale?(st[e]=st[e].parentLocale,e===mt()&&mt(e)):null!=st[e]&&delete st[e]);return st[e]}function vt(e){var a;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return nt;if(!n(e)){if(a=pt(e))return a;e=[e]}return ut(e)}function ft(){return j(st)}function bt(e){var a,t=e._a;return t&&-2===h(e).overflow&&(a=t[He]<0||t[He]>11?He:t[Ie]<1||t[Ie]>aa(t[Ce],t[He])?Ie:t[Le]<0||t[Le]>24||24===t[Le]&&(0!==t[Be]||0!==t[Ue]||0!==t[Re])?Le:t[Be]<0||t[Be]>59?Be:t[Ue]<0||t[Ue]>59?Ue:t[Re]<0||t[Re]>999?Re:-1,h(e)._overflowDayOfYear&&(a<Ce||a>Ie)&&(a=Ie),h(e)._overflowWeeks&&-1===a&&(a=Ve),h(e)._overflowWeekday&&-1===a&&(a=qe),h(e).overflow=a),e}var kt=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,yt=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,_t=/Z|[+-]\d\d(?::?\d\d)?/,zt=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],wt=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],xt=/^\/?Date\((-?\d+)/i,jt=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,St={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function At(e){var a,t,i,n,r,s,o=e._i,l=kt.exec(o)||yt.exec(o),d=zt.length,u=wt.length;if(l){for(h(e).iso=!0,a=0,t=d;a<t;a++)if(zt[a][1].exec(l[1])){n=zt[a][0],i=!1!==zt[a][2];break}if(null==n)return void(e._isValid=!1);if(l[3]){for(a=0,t=u;a<t;a++)if(wt[a][1].exec(l[3])){r=(l[2]||" ")+wt[a][0];break}if(null==r)return void(e._isValid=!1)}if(!i&&null!=r)return void(e._isValid=!1);if(l[4]){if(!_t.exec(l[4]))return void(e._isValid=!1);s="Z"}e._f=n+(r||"")+(s||""),Lt(e)}else e._isValid=!1}function $t(e,a,t,i,n,r){var s=[Et(e),ia.indexOf(a),parseInt(t,10),parseInt(i,10),parseInt(n,10)];return r&&s.push(parseInt(r,10)),s}function Et(e){var a=parseInt(e,10);return a<=49?2e3+a:a<=999?1900+a:a}function Tt(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function Mt(e,a,t){return!e||Oa.indexOf(e)===new Date(a[0],a[1],a[2]).getDay()||(h(t).weekdayMismatch=!0,t._isValid=!1,!1)}function Dt(e,a,t){if(e)return St[e];if(a)return 0;var i=parseInt(t,10),n=i%100;return(i-n)/100*60+n}function Ot(e){var a,t=jt.exec(Tt(e._i));if(t){if(a=$t(t[4],t[3],t[2],t[5],t[6],t[7]),!Mt(t[1],a,e))return;e._a=a,e._tzm=Dt(t[8],t[9],t[10]),e._d=ba.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),h(e).rfc2822=!0}else e._isValid=!1}function Nt(e){var a=xt.exec(e._i);null===a?(At(e),!1===e._isValid&&(delete e._isValid,Ot(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:t.createFromInputFallback(e)))):e._d=new Date(+a[1])}function Pt(e,a,t){return null!=e?e:null!=a?a:t}function Ct(e){var a=new Date(t.now());return e._useUTC?[a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()]:[a.getFullYear(),a.getMonth(),a.getDate()]}function Ht(e){var a,t,i,n,r,s=[];if(!e._d){for(i=Ct(e),e._w&&null==e._a[Ie]&&null==e._a[He]&&It(e),null!=e._dayOfYear&&(r=Pt(e._a[Ce],i[Ce]),(e._dayOfYear>Fe(r)||0===e._dayOfYear)&&(h(e)._overflowDayOfYear=!0),t=ba(r,0,e._dayOfYear),e._a[He]=t.getUTCMonth(),e._a[Ie]=t.getUTCDate()),a=0;a<3&&null==e._a[a];++a)e._a[a]=s[a]=i[a];for(;a<7;a++)e._a[a]=s[a]=null==e._a[a]?2===a?1:0:e._a[a];24===e._a[Le]&&0===e._a[Be]&&0===e._a[Ue]&&0===e._a[Re]&&(e._nextDay=!0,e._a[Le]=0),e._d=(e._useUTC?ba:fa).apply(null,s),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[Le]=24),e._w&&void 0!==e._w.d&&e._w.d!==n&&(h(e).weekdayMismatch=!0)}}function It(e){var a,t,i,n,r,s,o,l,d;null!=(a=e._w).GG||null!=a.W||null!=a.E?(r=1,s=4,t=Pt(a.GG,e._a[Ce],_a(Gt(),1,4).year),i=Pt(a.W,1),((n=Pt(a.E,1))<1||n>7)&&(l=!0)):(r=e._locale._week.dow,s=e._locale._week.doy,d=_a(Gt(),r,s),t=Pt(a.gg,e._a[Ce],d.year),i=Pt(a.w,d.week),null!=a.d?((n=a.d)<0||n>6)&&(l=!0):null!=a.e?(n=a.e+r,(a.e<0||a.e>6)&&(l=!0)):n=r),i<1||i>za(t,r,s)?h(e)._overflowWeeks=!0:null!=l?h(e)._overflowWeekday=!0:(o=ya(t,i,n,r,s),e._a[Ce]=o.year,e._dayOfYear=o.dayOfYear)}function Lt(e){if(e._f!==t.ISO_8601)if(e._f!==t.RFC_2822){e._a=[],h(e).empty=!0;var a,i,n,r,s,o,l,d=""+e._i,u=d.length,c=0;for(l=(n=V(e._f,e._locale).match(P)||[]).length,a=0;a<l;a++)r=n[a],(i=(d.match(Se(r,e))||[])[0])&&((s=d.substr(0,d.indexOf(i))).length>0&&h(e).unusedInput.push(s),d=d.slice(d.indexOf(i)+i.length),c+=i.length),I[r]?(i?h(e).empty=!1:h(e).unusedTokens.push(r),Ne(r,i,e)):e._strict&&!i&&h(e).unusedTokens.push(r);h(e).charsLeftOver=u-c,d.length>0&&h(e).unusedInput.push(d),e._a[Le]<=12&&!0===h(e).bigHour&&e._a[Le]>0&&(h(e).bigHour=void 0),h(e).parsedDateParts=e._a.slice(0),h(e).meridiem=e._meridiem,e._a[Le]=Bt(e._locale,e._a[Le],e._meridiem),null!==(o=h(e).era)&&(e._a[Ce]=e._locale.erasConvertYear(o,e._a[Ce])),Ht(e),bt(e)}else Ot(e);else At(e)}function Bt(e,a,t){var i;return null==t?a:null!=e.meridiemHour?e.meridiemHour(a,t):null!=e.isPM?((i=e.isPM(t))&&a<12&&(a+=12),i||12!==a||(a=0),a):a}function Ut(e){var a,t,i,n,r,s,o=!1,l=e._f.length;if(0===l)return h(e).invalidFormat=!0,void(e._d=new Date(NaN));for(n=0;n<l;n++)r=0,s=!1,a=y({},e),null!=e._useUTC&&(a._useUTC=e._useUTC),a._f=e._f[n],Lt(a),v(a)&&(s=!0),r+=h(a).charsLeftOver,r+=10*h(a).unusedTokens.length,h(a).score=r,o?r<i&&(i=r,t=a):(null==i||r<i||s)&&(i=r,t=a,s&&(o=!0));p(e,t||a)}function Rt(e){if(!e._d){var a=te(e._i),t=void 0===a.day?a.date:a.day;e._a=c([a.year,a.month,t,a.hour,a.minute,a.second,a.millisecond],(function(e){return e&&parseInt(e,10)})),Ht(e)}}function Vt(e){var a=new _(bt(qt(e)));return a._nextDay&&(a.add(1,"d"),a._nextDay=void 0),a}function qt(e){var a=e._i,t=e._f;return e._locale=e._locale||vt(e._l),null===a||void 0===t&&""===a?f({nullInput:!0}):("string"==typeof a&&(e._i=a=e._locale.preparse(a)),z(a)?new _(bt(a)):(u(a)?e._d=a:n(t)?Ut(e):t?Lt(e):Ft(e),v(e)||(e._d=null),e))}function Ft(e){var a=e._i;l(a)?e._d=new Date(t.now()):u(a)?e._d=new Date(a.valueOf()):"string"==typeof a?Nt(e):n(a)?(e._a=c(a.slice(0),(function(e){return parseInt(e,10)})),Ht(e)):r(a)?Rt(e):d(a)?e._d=new Date(a):t.createFromInputFallback(e)}function Wt(e,a,t,i,s){var l={};return!0!==a&&!1!==a||(i=a,a=void 0),!0!==t&&!1!==t||(i=t,t=void 0),(r(e)&&o(e)||n(e)&&0===e.length)&&(e=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=s,l._l=t,l._i=e,l._f=a,l._strict=i,Vt(l)}function Gt(e,a,t,i){return Wt(e,a,t,i,!1)}t.createFromInputFallback=x("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",(function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))})),t.ISO_8601=function(){},t.RFC_2822=function(){};var Yt=x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=Gt.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:f()})),Zt=x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=Gt.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:f()}));function Kt(e,a){var t,i;if(1===a.length&&n(a[0])&&(a=a[0]),!a.length)return Gt();for(t=a[0],i=1;i<a.length;++i)a[i].isValid()&&!a[i][e](t)||(t=a[i]);return t}function Jt(){return Kt("isBefore",[].slice.call(arguments,0))}function Qt(){return Kt("isAfter",[].slice.call(arguments,0))}var Xt=function(){return Date.now?Date.now():+new Date},ei=["year","quarter","month","week","day","hour","minute","second","millisecond"];function ai(e){var a,t,i=!1,n=ei.length;for(a in e)if(s(e,a)&&(-1===We.call(ei,a)||null!=e[a]&&isNaN(e[a])))return!1;for(t=0;t<n;++t)if(e[ei[t]]){if(i)return!1;parseFloat(e[ei[t]])!==Te(e[ei[t]])&&(i=!0)}return!0}function ti(){return this._isValid}function ii(){return Si(NaN)}function ni(e){var a=te(e),t=a.year||0,i=a.quarter||0,n=a.month||0,r=a.week||a.isoWeek||0,s=a.day||0,o=a.hour||0,l=a.minute||0,d=a.second||0,u=a.millisecond||0;this._isValid=ai(a),this._milliseconds=+u+1e3*d+6e4*l+1e3*o*60*60,this._days=+s+7*r,this._months=+n+3*i+12*t,this._data={},this._locale=vt(),this._bubble()}function ri(e){return e instanceof ni}function si(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function oi(e,a,t){var i,n=Math.min(e.length,a.length),r=Math.abs(e.length-a.length),s=0;for(i=0;i<n;i++)Te(e[i])!==Te(a[i])&&s++;return s+r}function li(e,a){L(e,0,0,(function(){var e=this.utcOffset(),t="+";return e<0&&(e=-e,t="-"),t+N(~~(e/60),2)+a+N(~~e%60,2)}))}li("Z",":"),li("ZZ",""),je("Z",ye),je("ZZ",ye),De(["Z","ZZ"],(function(e,a,t){t._useUTC=!0,t._tzm=ui(ye,e)}));var di=/([\+\-]|\d\d)/gi;function ui(e,a){var t,i,n=(a||"").match(e);return null===n?null:0===(i=60*(t=((n[n.length-1]||[])+"").match(di)||["-",0,0])[1]+Te(t[2]))?0:"+"===t[0]?i:-i}function ci(e,a){var i,n;return a._isUTC?(i=a.clone(),n=(z(e)||u(e)?e.valueOf():Gt(e).valueOf())-i.valueOf(),i._d.setTime(i._d.valueOf()+n),t.updateOffset(i,!1),i):Gt(e).local()}function pi(e){return-Math.round(e._d.getTimezoneOffset())}function mi(e,a,i){var n,r=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=ui(ye,e)))return this}else Math.abs(e)<16&&!i&&(e*=60);return!this._isUTC&&a&&(n=pi(this)),this._offset=e,this._isUTC=!0,null!=n&&this.add(n,"m"),r!==e&&(!a||this._changeInProgress?Mi(this,Si(e-r,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,t.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?r:pi(this)}function gi(e,a){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,a),this):-this.utcOffset()}function hi(e){return this.utcOffset(0,e)}function vi(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract(pi(this),"m")),this}function fi(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=ui(ke,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function bi(e){return!!this.isValid()&&(e=e?Gt(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function ki(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function yi(){if(!l(this._isDSTShifted))return this._isDSTShifted;var e,a={};return y(a,this),(a=qt(a))._a?(e=a._isUTC?m(a._a):Gt(a._a),this._isDSTShifted=this.isValid()&&oi(a._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function _i(){return!!this.isValid()&&!this._isUTC}function zi(){return!!this.isValid()&&this._isUTC}function wi(){return!!this.isValid()&&this._isUTC&&0===this._offset}t.updateOffset=function(){};var xi=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,ji=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Si(e,a){var t,i,n,r=e,o=null;return ri(e)?r={ms:e._milliseconds,d:e._days,M:e._months}:d(e)||!isNaN(+e)?(r={},a?r[a]=+e:r.milliseconds=+e):(o=xi.exec(e))?(t="-"===o[1]?-1:1,r={y:0,d:Te(o[Ie])*t,h:Te(o[Le])*t,m:Te(o[Be])*t,s:Te(o[Ue])*t,ms:Te(si(1e3*o[Re]))*t}):(o=ji.exec(e))?(t="-"===o[1]?-1:1,r={y:Ai(o[2],t),M:Ai(o[3],t),w:Ai(o[4],t),d:Ai(o[5],t),h:Ai(o[6],t),m:Ai(o[7],t),s:Ai(o[8],t)}):null==r?r={}:"object"==typeof r&&("from"in r||"to"in r)&&(n=Ei(Gt(r.from),Gt(r.to)),(r={}).ms=n.milliseconds,r.M=n.months),i=new ni(r),ri(e)&&s(e,"_locale")&&(i._locale=e._locale),ri(e)&&s(e,"_isValid")&&(i._isValid=e._isValid),i}function Ai(e,a){var t=e&&parseFloat(e.replace(",","."));return(isNaN(t)?0:t)*a}function $i(e,a){var t={};return t.months=a.month()-e.month()+12*(a.year()-e.year()),e.clone().add(t.months,"M").isAfter(a)&&--t.months,t.milliseconds=+a-+e.clone().add(t.months,"M"),t}function Ei(e,a){var t;return e.isValid()&&a.isValid()?(a=ci(a,e),e.isBefore(a)?t=$i(e,a):((t=$i(a,e)).milliseconds=-t.milliseconds,t.months=-t.months),t):{milliseconds:0,months:0}}function Ti(e,a){return function(t,i){var n;return null===i||isNaN(+i)||(A(a,"moment()."+a+"(period, number) is deprecated. Please use moment()."+a+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),n=t,t=i,i=n),Mi(this,Si(t,i),e),this}}function Mi(e,a,i,n){var r=a._milliseconds,s=si(a._days),o=si(a._months);e.isValid()&&(n=null==n||n,o&&ca(e,Ke(e,"Month")+o*i),s&&Je(e,"Date",Ke(e,"Date")+s*i),r&&e._d.setTime(e._d.valueOf()+r*i),n&&t.updateOffset(e,s||o))}Si.fn=ni.prototype,Si.invalid=ii;var Di=Ti(1,"add"),Oi=Ti(-1,"subtract");function Ni(e){return"string"==typeof e||e instanceof String}function Pi(e){return z(e)||u(e)||Ni(e)||d(e)||Hi(e)||Ci(e)||null==e}function Ci(e){var a,t,i=r(e)&&!o(e),n=!1,l=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],d=l.length;for(a=0;a<d;a+=1)t=l[a],n=n||s(e,t);return i&&n}function Hi(e){var a=n(e),t=!1;return a&&(t=0===e.filter((function(a){return!d(a)&&Ni(e)})).length),a&&t}function Ii(e){var a,t,i=r(e)&&!o(e),n=!1,l=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(a=0;a<l.length;a+=1)t=l[a],n=n||s(e,t);return i&&n}function Li(e,a){var t=e.diff(a,"days",!0);return t<-6?"sameElse":t<-1?"lastWeek":t<0?"lastDay":t<1?"sameDay":t<2?"nextDay":t<7?"nextWeek":"sameElse"}function Bi(e,a){1===arguments.length&&(arguments[0]?Pi(arguments[0])?(e=arguments[0],a=void 0):Ii(arguments[0])&&(a=arguments[0],e=void 0):(e=void 0,a=void 0));var i=e||Gt(),n=ci(i,this).startOf("day"),r=t.calendarFormat(this,n)||"sameElse",s=a&&($(a[r])?a[r].call(this,i):a[r]);return this.format(s||this.localeData().calendar(r,this,Gt(i)))}function Ui(){return new _(this)}function Ri(e,a){var t=z(e)?e:Gt(e);return!(!this.isValid()||!t.isValid())&&("millisecond"===(a=ae(a)||"millisecond")?this.valueOf()>t.valueOf():t.valueOf()<this.clone().startOf(a).valueOf())}function Vi(e,a){var t=z(e)?e:Gt(e);return!(!this.isValid()||!t.isValid())&&("millisecond"===(a=ae(a)||"millisecond")?this.valueOf()<t.valueOf():this.clone().endOf(a).valueOf()<t.valueOf())}function qi(e,a,t,i){var n=z(e)?e:Gt(e),r=z(a)?a:Gt(a);return!!(this.isValid()&&n.isValid()&&r.isValid())&&("("===(i=i||"()")[0]?this.isAfter(n,t):!this.isBefore(n,t))&&(")"===i[1]?this.isBefore(r,t):!this.isAfter(r,t))}function Fi(e,a){var t,i=z(e)?e:Gt(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(a=ae(a)||"millisecond")?this.valueOf()===i.valueOf():(t=i.valueOf(),this.clone().startOf(a).valueOf()<=t&&t<=this.clone().endOf(a).valueOf()))}function Wi(e,a){return this.isSame(e,a)||this.isAfter(e,a)}function Gi(e,a){return this.isSame(e,a)||this.isBefore(e,a)}function Yi(e,a,t){var i,n,r;if(!this.isValid())return NaN;if(!(i=ci(e,this)).isValid())return NaN;switch(n=6e4*(i.utcOffset()-this.utcOffset()),a=ae(a)){case"year":r=Zi(this,i)/12;break;case"month":r=Zi(this,i);break;case"quarter":r=Zi(this,i)/3;break;case"second":r=(this-i)/1e3;break;case"minute":r=(this-i)/6e4;break;case"hour":r=(this-i)/36e5;break;case"day":r=(this-i-n)/864e5;break;case"week":r=(this-i-n)/6048e5;break;default:r=this-i}return t?r:Ee(r)}function Zi(e,a){if(e.date()<a.date())return-Zi(a,e);var t=12*(a.year()-e.year())+(a.month()-e.month()),i=e.clone().add(t,"months");return-(t+(a-i<0?(a-i)/(i-e.clone().add(t-1,"months")):(a-i)/(e.clone().add(t+1,"months")-i)))||0}function Ki(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function Ji(e){if(!this.isValid())return null;var a=!0!==e,t=a?this.clone().utc():this;return t.year()<0||t.year()>9999?R(t,a?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):$(Date.prototype.toISOString)?a?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",R(t,"Z")):R(t,a?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function Qi(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,a,t,i,n="moment",r="";return this.isLocal()||(n=0===this.utcOffset()?"moment.utc":"moment.parseZone",r="Z"),e="["+n+'("]',a=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",t="-MM-DD[T]HH:mm:ss.SSS",i=r+'[")]',this.format(e+a+t+i)}function Xi(e){e||(e=this.isUtc()?t.defaultFormatUtc:t.defaultFormat);var a=R(this,e);return this.localeData().postformat(a)}function en(e,a){return this.isValid()&&(z(e)&&e.isValid()||Gt(e).isValid())?Si({to:this,from:e}).locale(this.locale()).humanize(!a):this.localeData().invalidDate()}function an(e){return this.from(Gt(),e)}function tn(e,a){return this.isValid()&&(z(e)&&e.isValid()||Gt(e).isValid())?Si({from:this,to:e}).locale(this.locale()).humanize(!a):this.localeData().invalidDate()}function nn(e){return this.to(Gt(),e)}function rn(e){var a;return void 0===e?this._locale._abbr:(null!=(a=vt(e))&&(this._locale=a),this)}t.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",t.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var sn=x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",(function(e){return void 0===e?this.localeData():this.locale(e)}));function on(){return this._locale}var ln=1e3,dn=60*ln,un=60*dn,cn=3506328*un;function pn(e,a){return(e%a+a)%a}function mn(e,a,t){return e<100&&e>=0?new Date(e+400,a,t)-cn:new Date(e,a,t).valueOf()}function gn(e,a,t){return e<100&&e>=0?Date.UTC(e+400,a,t)-cn:Date.UTC(e,a,t)}function hn(e){var a,i;if(void 0===(e=ae(e))||"millisecond"===e||!this.isValid())return this;switch(i=this._isUTC?gn:mn,e){case"year":a=i(this.year(),0,1);break;case"quarter":a=i(this.year(),this.month()-this.month()%3,1);break;case"month":a=i(this.year(),this.month(),1);break;case"week":a=i(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":a=i(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":a=i(this.year(),this.month(),this.date());break;case"hour":a=this._d.valueOf(),a-=pn(a+(this._isUTC?0:this.utcOffset()*dn),un);break;case"minute":a=this._d.valueOf(),a-=pn(a,dn);break;case"second":a=this._d.valueOf(),a-=pn(a,ln)}return this._d.setTime(a),t.updateOffset(this,!0),this}function vn(e){var a,i;if(void 0===(e=ae(e))||"millisecond"===e||!this.isValid())return this;switch(i=this._isUTC?gn:mn,e){case"year":a=i(this.year()+1,0,1)-1;break;case"quarter":a=i(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":a=i(this.year(),this.month()+1,1)-1;break;case"week":a=i(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":a=i(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":a=i(this.year(),this.month(),this.date()+1)-1;break;case"hour":a=this._d.valueOf(),a+=un-pn(a+(this._isUTC?0:this.utcOffset()*dn),un)-1;break;case"minute":a=this._d.valueOf(),a+=dn-pn(a,dn)-1;break;case"second":a=this._d.valueOf(),a+=ln-pn(a,ln)-1}return this._d.setTime(a),t.updateOffset(this,!0),this}function fn(){return this._d.valueOf()-6e4*(this._offset||0)}function bn(){return Math.floor(this.valueOf()/1e3)}function kn(){return new Date(this.valueOf())}function yn(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function _n(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function zn(){return this.isValid()?this.toISOString():null}function wn(){return v(this)}function xn(){return p({},h(this))}function jn(){return h(this).overflow}function Sn(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function An(e,a){var i,n,r,s=this._eras||vt("en")._eras;for(i=0,n=s.length;i<n;++i)switch("string"==typeof s[i].since&&(r=t(s[i].since).startOf("day"),s[i].since=r.valueOf()),typeof s[i].until){case"undefined":s[i].until=1/0;break;case"string":r=t(s[i].until).startOf("day").valueOf(),s[i].until=r.valueOf()}return s}function $n(e,a,t){var i,n,r,s,o,l=this.eras();for(e=e.toUpperCase(),i=0,n=l.length;i<n;++i)if(r=l[i].name.toUpperCase(),s=l[i].abbr.toUpperCase(),o=l[i].narrow.toUpperCase(),t)switch(a){case"N":case"NN":case"NNN":if(s===e)return l[i];break;case"NNNN":if(r===e)return l[i];break;case"NNNNN":if(o===e)return l[i]}else if([r,s,o].indexOf(e)>=0)return l[i]}function En(e,a){var i=e.since<=e.until?1:-1;return void 0===a?t(e.since).year():t(e.since).year()+(a-e.offset)*i}function Tn(){var e,a,t,i=this.localeData().eras();for(e=0,a=i.length;e<a;++e){if(t=this.clone().startOf("day").valueOf(),i[e].since<=t&&t<=i[e].until)return i[e].name;if(i[e].until<=t&&t<=i[e].since)return i[e].name}return""}function Mn(){var e,a,t,i=this.localeData().eras();for(e=0,a=i.length;e<a;++e){if(t=this.clone().startOf("day").valueOf(),i[e].since<=t&&t<=i[e].until)return i[e].narrow;if(i[e].until<=t&&t<=i[e].since)return i[e].narrow}return""}function Dn(){var e,a,t,i=this.localeData().eras();for(e=0,a=i.length;e<a;++e){if(t=this.clone().startOf("day").valueOf(),i[e].since<=t&&t<=i[e].until)return i[e].abbr;if(i[e].until<=t&&t<=i[e].since)return i[e].abbr}return""}function On(){var e,a,i,n,r=this.localeData().eras();for(e=0,a=r.length;e<a;++e)if(i=r[e].since<=r[e].until?1:-1,n=this.clone().startOf("day").valueOf(),r[e].since<=n&&n<=r[e].until||r[e].until<=n&&n<=r[e].since)return(this.year()-t(r[e].since).year())*i+r[e].offset;return this.year()}function Nn(e){return s(this,"_erasNameRegex")||Un.call(this),e?this._erasNameRegex:this._erasRegex}function Pn(e){return s(this,"_erasAbbrRegex")||Un.call(this),e?this._erasAbbrRegex:this._erasRegex}function Cn(e){return s(this,"_erasNarrowRegex")||Un.call(this),e?this._erasNarrowRegex:this._erasRegex}function Hn(e,a){return a.erasAbbrRegex(e)}function In(e,a){return a.erasNameRegex(e)}function Ln(e,a){return a.erasNarrowRegex(e)}function Bn(e,a){return a._eraYearOrdinalRegex||fe}function Un(){var e,a,t,i,n,r=[],s=[],o=[],l=[],d=this.eras();for(e=0,a=d.length;e<a;++e)t=$e(d[e].name),i=$e(d[e].abbr),n=$e(d[e].narrow),s.push(t),r.push(i),o.push(n),l.push(t),l.push(i),l.push(n);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+s.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+r.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+o.join("|")+")","i")}function Rn(e,a){L(0,[e,e.length],0,a)}function Vn(e){return Zn.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function qn(e){return Zn.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function Fn(){return za(this.year(),1,4)}function Wn(){return za(this.isoWeekYear(),1,4)}function Gn(){var e=this.localeData()._week;return za(this.year(),e.dow,e.doy)}function Yn(){var e=this.localeData()._week;return za(this.weekYear(),e.dow,e.doy)}function Zn(e,a,t,i,n){var r;return null==e?_a(this,i,n).year:(a>(r=za(e,i,n))&&(a=r),Kn.call(this,e,a,t,i,n))}function Kn(e,a,t,i,n){var r=ya(e,a,t,i,n),s=ba(r.year,0,r.dayOfYear);return this.year(s.getUTCFullYear()),this.month(s.getUTCMonth()),this.date(s.getUTCDate()),this}function Jn(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}L("N",0,0,"eraAbbr"),L("NN",0,0,"eraAbbr"),L("NNN",0,0,"eraAbbr"),L("NNNN",0,0,"eraName"),L("NNNNN",0,0,"eraNarrow"),L("y",["y",1],"yo","eraYear"),L("y",["yy",2],0,"eraYear"),L("y",["yyy",3],0,"eraYear"),L("y",["yyyy",4],0,"eraYear"),je("N",Hn),je("NN",Hn),je("NNN",Hn),je("NNNN",In),je("NNNNN",Ln),De(["N","NN","NNN","NNNN","NNNNN"],(function(e,a,t,i){var n=t._locale.erasParse(e,i,t._strict);n?h(t).era=n:h(t).invalidEra=e})),je("y",fe),je("yy",fe),je("yyy",fe),je("yyyy",fe),je("yo",Bn),De(["y","yy","yyy","yyyy"],Ce),De(["yo"],(function(e,a,t,i){var n;t._locale._eraYearOrdinalRegex&&(n=e.match(t._locale._eraYearOrdinalRegex)),t._locale.eraYearOrdinalParse?a[Ce]=t._locale.eraYearOrdinalParse(e,n):a[Ce]=parseInt(e,10)})),L(0,["gg",2],0,(function(){return this.weekYear()%100})),L(0,["GG",2],0,(function(){return this.isoWeekYear()%100})),Rn("gggg","weekYear"),Rn("ggggg","weekYear"),Rn("GGGG","isoWeekYear"),Rn("GGGGG","isoWeekYear"),je("G",be),je("g",be),je("GG",ce,oe),je("gg",ce,oe),je("GGGG",he,de),je("gggg",he,de),je("GGGGG",ve,ue),je("ggggg",ve,ue),Oe(["gggg","ggggg","GGGG","GGGGG"],(function(e,a,t,i){a[i.substr(0,2)]=Te(e)})),Oe(["gg","GG"],(function(e,a,i,n){a[n]=t.parseTwoDigitYear(e)})),L("Q",0,"Qo","quarter"),je("Q",se),De("Q",(function(e,a){a[He]=3*(Te(e)-1)})),L("D",["DD",2],"Do","date"),je("D",ce,we),je("DD",ce,oe),je("Do",(function(e,a){return e?a._dayOfMonthOrdinalParse||a._ordinalParse:a._dayOfMonthOrdinalParseLenient})),De(["D","DD"],Ie),De("Do",(function(e,a){a[Ie]=Te(e.match(ce)[0])}));var Qn=Ze("Date",!0);function Xn(e){var a=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?a:this.add(e-a,"d")}L("DDD",["DDDD",3],"DDDo","dayOfYear"),je("DDD",ge),je("DDDD",le),De(["DDD","DDDD"],(function(e,a,t){t._dayOfYear=Te(e)})),L("m",["mm",2],0,"minute"),je("m",ce,xe),je("mm",ce,oe),De(["m","mm"],Be);var er=Ze("Minutes",!1);L("s",["ss",2],0,"second"),je("s",ce,xe),je("ss",ce,oe),De(["s","ss"],Ue);var ar,tr,ir=Ze("Seconds",!1);for(L("S",0,0,(function(){return~~(this.millisecond()/100)})),L(0,["SS",2],0,(function(){return~~(this.millisecond()/10)})),L(0,["SSS",3],0,"millisecond"),L(0,["SSSS",4],0,(function(){return 10*this.millisecond()})),L(0,["SSSSS",5],0,(function(){return 100*this.millisecond()})),L(0,["SSSSSS",6],0,(function(){return 1e3*this.millisecond()})),L(0,["SSSSSSS",7],0,(function(){return 1e4*this.millisecond()})),L(0,["SSSSSSSS",8],0,(function(){return 1e5*this.millisecond()})),L(0,["SSSSSSSSS",9],0,(function(){return 1e6*this.millisecond()})),je("S",ge,se),je("SS",ge,oe),je("SSS",ge,le),ar="SSSS";ar.length<=9;ar+="S")je(ar,fe);function nr(e,a){a[Re]=Te(1e3*("0."+e))}for(ar="S";ar.length<=9;ar+="S")De(ar,nr);function rr(){return this._isUTC?"UTC":""}function sr(){return this._isUTC?"Coordinated Universal Time":""}tr=Ze("Milliseconds",!1),L("z",0,0,"zoneAbbr"),L("zz",0,0,"zoneName");var or=_.prototype;function lr(e){return Gt(1e3*e)}function dr(){return Gt.apply(null,arguments).parseZone()}function ur(e){return e}or.add=Di,or.calendar=Bi,or.clone=Ui,or.diff=Yi,or.endOf=vn,or.format=Xi,or.from=en,or.fromNow=an,or.to=tn,or.toNow=nn,or.get=Qe,or.invalidAt=jn,or.isAfter=Ri,or.isBefore=Vi,or.isBetween=qi,or.isSame=Fi,or.isSameOrAfter=Wi,or.isSameOrBefore=Gi,or.isValid=wn,or.lang=sn,or.locale=rn,or.localeData=on,or.max=Zt,or.min=Yt,or.parsingFlags=xn,or.set=Xe,or.startOf=hn,or.subtract=Oi,or.toArray=yn,or.toObject=_n,or.toDate=kn,or.toISOString=Ji,or.inspect=Qi,"undefined"!=typeof Symbol&&null!=Symbol.for&&(or[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),or.toJSON=zn,or.toString=Ki,or.unix=bn,or.valueOf=fn,or.creationData=Sn,or.eraName=Tn,or.eraNarrow=Mn,or.eraAbbr=Dn,or.eraYear=On,or.year=Ge,or.isLeapYear=Ye,or.weekYear=Vn,or.isoWeekYear=qn,or.quarter=or.quarters=Jn,or.month=pa,or.daysInMonth=ma,or.week=or.weeks=Aa,or.isoWeek=or.isoWeeks=$a,or.weeksInYear=Gn,or.weeksInWeekYear=Yn,or.isoWeeksInYear=Fn,or.isoWeeksInISOWeekYear=Wn,or.date=Qn,or.day=or.days=Va,or.weekday=qa,or.isoWeekday=Fa,or.dayOfYear=Xn,or.hour=or.hours=tt,or.minute=or.minutes=er,or.second=or.seconds=ir,or.millisecond=or.milliseconds=tr,or.utcOffset=mi,or.utc=hi,or.local=vi,or.parseZone=fi,or.hasAlignedHourOffset=bi,or.isDST=ki,or.isLocal=_i,or.isUtcOffset=zi,or.isUtc=wi,or.isUTC=wi,or.zoneAbbr=rr,or.zoneName=sr,or.dates=x("dates accessor is deprecated. Use date instead.",Qn),or.months=x("months accessor is deprecated. Use month instead",pa),or.years=x("years accessor is deprecated. Use year instead",Ge),or.zone=x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",gi),or.isDSTShifted=x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",yi);var cr=M.prototype;function pr(e,a,t,i){var n=vt(),r=m().set(i,a);return n[t](r,e)}function mr(e,a,t){if(d(e)&&(a=e,e=void 0),e=e||"",null!=a)return pr(e,a,t,"month");var i,n=[];for(i=0;i<12;i++)n[i]=pr(e,i,t,"month");return n}function gr(e,a,t,i){"boolean"==typeof e?(d(a)&&(t=a,a=void 0),a=a||""):(t=a=e,e=!1,d(a)&&(t=a,a=void 0),a=a||"");var n,r=vt(),s=e?r._week.dow:0,o=[];if(null!=t)return pr(a,(t+s)%7,i,"day");for(n=0;n<7;n++)o[n]=pr(a,(n+s)%7,i,"day");return o}function hr(e,a){return mr(e,a,"months")}function vr(e,a){return mr(e,a,"monthsShort")}function fr(e,a,t){return gr(e,a,t,"weekdays")}function br(e,a,t){return gr(e,a,t,"weekdaysShort")}function kr(e,a,t){return gr(e,a,t,"weekdaysMin")}cr.calendar=O,cr.longDateFormat=F,cr.invalidDate=G,cr.ordinal=K,cr.preparse=ur,cr.postformat=ur,cr.relativeTime=Q,cr.pastFuture=X,cr.set=E,cr.eras=An,cr.erasParse=$n,cr.erasConvertYear=En,cr.erasAbbrRegex=Pn,cr.erasNameRegex=Nn,cr.erasNarrowRegex=Cn,cr.months=oa,cr.monthsShort=la,cr.monthsParse=ua,cr.monthsRegex=ha,cr.monthsShortRegex=ga,cr.week=wa,cr.firstDayOfYear=Sa,cr.firstDayOfWeek=ja,cr.weekdays=Ia,cr.weekdaysMin=Ba,cr.weekdaysShort=La,cr.weekdaysParse=Ra,cr.weekdaysRegex=Wa,cr.weekdaysShortRegex=Ga,cr.weekdaysMinRegex=Ya,cr.isPM=et,cr.meridiem=it,mt("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var a=e%10;return e+(1===Te(e%100/10)?"th":1===a?"st":2===a?"nd":3===a?"rd":"th")}}),t.lang=x("moment.lang is deprecated. Use moment.locale instead.",mt),t.langData=x("moment.langData is deprecated. Use moment.localeData instead.",vt);var yr=Math.abs;function _r(){var e=this._data;return this._milliseconds=yr(this._milliseconds),this._days=yr(this._days),this._months=yr(this._months),e.milliseconds=yr(e.milliseconds),e.seconds=yr(e.seconds),e.minutes=yr(e.minutes),e.hours=yr(e.hours),e.months=yr(e.months),e.years=yr(e.years),this}function zr(e,a,t,i){var n=Si(a,t);return e._milliseconds+=i*n._milliseconds,e._days+=i*n._days,e._months+=i*n._months,e._bubble()}function wr(e,a){return zr(this,e,a,1)}function xr(e,a){return zr(this,e,a,-1)}function jr(e){return e<0?Math.floor(e):Math.ceil(e)}function Sr(){var e,a,t,i,n,r=this._milliseconds,s=this._days,o=this._months,l=this._data;return r>=0&&s>=0&&o>=0||r<=0&&s<=0&&o<=0||(r+=864e5*jr($r(o)+s),s=0,o=0),l.milliseconds=r%1e3,e=Ee(r/1e3),l.seconds=e%60,a=Ee(e/60),l.minutes=a%60,t=Ee(a/60),l.hours=t%24,s+=Ee(t/24),o+=n=Ee(Ar(s)),s-=jr($r(n)),i=Ee(o/12),o%=12,l.days=s,l.months=o,l.years=i,this}function Ar(e){return 4800*e/146097}function $r(e){return 146097*e/4800}function Er(e){if(!this.isValid())return NaN;var a,t,i=this._milliseconds;if("month"===(e=ae(e))||"quarter"===e||"year"===e)switch(a=this._days+i/864e5,t=this._months+Ar(a),e){case"month":return t;case"quarter":return t/3;case"year":return t/12}else switch(a=this._days+Math.round($r(this._months)),e){case"week":return a/7+i/6048e5;case"day":return a+i/864e5;case"hour":return 24*a+i/36e5;case"minute":return 1440*a+i/6e4;case"second":return 86400*a+i/1e3;case"millisecond":return Math.floor(864e5*a)+i;default:throw new Error("Unknown unit "+e)}}function Tr(e){return function(){return this.as(e)}}var Mr=Tr("ms"),Dr=Tr("s"),Or=Tr("m"),Nr=Tr("h"),Pr=Tr("d"),Cr=Tr("w"),Hr=Tr("M"),Ir=Tr("Q"),Lr=Tr("y"),Br=Mr;function Ur(){return Si(this)}function Rr(e){return e=ae(e),this.isValid()?this[e+"s"]():NaN}function Vr(e){return function(){return this.isValid()?this._data[e]:NaN}}var qr=Vr("milliseconds"),Fr=Vr("seconds"),Wr=Vr("minutes"),Gr=Vr("hours"),Yr=Vr("days"),Zr=Vr("months"),Kr=Vr("years");function Jr(){return Ee(this.days()/7)}var Qr=Math.round,Xr={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function es(e,a,t,i,n){return n.relativeTime(a||1,!!t,e,i)}function as(e,a,t,i){var n=Si(e).abs(),r=Qr(n.as("s")),s=Qr(n.as("m")),o=Qr(n.as("h")),l=Qr(n.as("d")),d=Qr(n.as("M")),u=Qr(n.as("w")),c=Qr(n.as("y")),p=r<=t.ss&&["s",r]||r<t.s&&["ss",r]||s<=1&&["m"]||s<t.m&&["mm",s]||o<=1&&["h"]||o<t.h&&["hh",o]||l<=1&&["d"]||l<t.d&&["dd",l];return null!=t.w&&(p=p||u<=1&&["w"]||u<t.w&&["ww",u]),(p=p||d<=1&&["M"]||d<t.M&&["MM",d]||c<=1&&["y"]||["yy",c])[2]=a,p[3]=+e>0,p[4]=i,es.apply(null,p)}function ts(e){return void 0===e?Qr:"function"==typeof e&&(Qr=e,!0)}function is(e,a){return void 0!==Xr[e]&&(void 0===a?Xr[e]:(Xr[e]=a,"s"===e&&(Xr.ss=a-1),!0))}function ns(e,a){if(!this.isValid())return this.localeData().invalidDate();var t,i,n=!1,r=Xr;return"object"==typeof e&&(a=e,e=!1),"boolean"==typeof e&&(n=e),"object"==typeof a&&(r=Object.assign({},Xr,a),null!=a.s&&null==a.ss&&(r.ss=a.s-1)),i=as(this,!n,r,t=this.localeData()),n&&(i=t.pastFuture(+this,i)),t.postformat(i)}var rs=Math.abs;function ss(e){return(e>0)-(e<0)||+e}function os(){if(!this.isValid())return this.localeData().invalidDate();var e,a,t,i,n,r,s,o,l=rs(this._milliseconds)/1e3,d=rs(this._days),u=rs(this._months),c=this.asSeconds();return c?(e=Ee(l/60),a=Ee(e/60),l%=60,e%=60,t=Ee(u/12),u%=12,i=l?l.toFixed(3).replace(/\.?0+$/,""):"",n=c<0?"-":"",r=ss(this._months)!==ss(c)?"-":"",s=ss(this._days)!==ss(c)?"-":"",o=ss(this._milliseconds)!==ss(c)?"-":"",n+"P"+(t?r+t+"Y":"")+(u?r+u+"M":"")+(d?s+d+"D":"")+(a||e||l?"T":"")+(a?o+a+"H":"")+(e?o+e+"M":"")+(l?o+i+"S":"")):"P0D"}var ls=ni.prototype;return ls.isValid=ti,ls.abs=_r,ls.add=wr,ls.subtract=xr,ls.as=Er,ls.asMilliseconds=Mr,ls.asSeconds=Dr,ls.asMinutes=Or,ls.asHours=Nr,ls.asDays=Pr,ls.asWeeks=Cr,ls.asMonths=Hr,ls.asQuarters=Ir,ls.asYears=Lr,ls.valueOf=Br,ls._bubble=Sr,ls.clone=Ur,ls.get=Rr,ls.milliseconds=qr,ls.seconds=Fr,ls.minutes=Wr,ls.hours=Gr,ls.days=Yr,ls.weeks=Jr,ls.months=Zr,ls.years=Kr,ls.humanize=ns,ls.toISOString=os,ls.toString=os,ls.toJSON=os,ls.locale=rn,ls.localeData=on,ls.toIsoString=x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",os),ls.lang=sn,L("X",0,0,"unix"),L("x",0,0,"valueOf"),je("x",be),je("X",_e),De("X",(function(e,a,t){t._d=new Date(1e3*parseFloat(e))})),De("x",(function(e,a,t){t._d=new Date(Te(e))})),
//! moment.js
t.version="2.30.1",i(Gt),t.fn=or,t.min=Jt,t.max=Qt,t.now=Xt,t.utc=m,t.unix=lr,t.months=hr,t.isDate=u,t.locale=mt,t.invalid=f,t.duration=Si,t.isMoment=z,t.weekdays=fr,t.parseZone=dr,t.localeData=vt,t.isDuration=ri,t.monthsShort=vr,t.weekdaysMin=kr,t.defineLocale=gt,t.updateLocale=ht,t.locales=ft,t.weekdaysShort=br,t.normalizeUnits=ae,t.relativeTimeRounding=ts,t.relativeTimeThreshold=is,t.calendarFormat=Li,t.prototype=or,t.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},t}()),fl.exports),yl=gl(kl);let _l=class extends(Ca(ce)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.zoneCache=new Map,this._expanded=new Set}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:je+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,a,t,i]=await Promise.all([Ma(this.hass),Da(this.hass),Oa(this.hass),Na(this.hass)]);this.config=e,this.zones=a,this.modules=t,this.mappings=i,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",je+"/zones",{calculate_all:!0})).catch((e=>{console.error("Failed to calculate all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",je+"/zones",{update_all:!0})).catch((e=>{console.error("Failed to update all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleResetAllBuckets(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",je+"/zones",{reset_all_buckets:!0})).catch((e=>{console.error("Failed to reset all buckets:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleClearAllWeatherdata(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",je+"/zones",{clear_all_weatherdata:!0})).catch((e=>{console.error("Failed to clear all weather data:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:ml.Automatic,duration:0,bucket:0,module:void 0,delta:0,et_deficiency:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then((()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleEditZone(e,a){this.hass&&(this.zones[e]=a,a.id&&this.zoneCache.delete(a.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{this.isSaving=!0,this._suppressNextConfigUpdate=!0,this.saveToHA(a).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate())}handleRemoveZone(e,a){if(!this.hass)return;const t=this.zones[a].id;if(!this.zones[a]||null==t)return;const i=[...this.zones];var n,r;this.zones=this.zones.filter(((e,t)=>t!==a)),this.zoneCache.delete(t.toString()),this.isSaving=!0,(n=this.hass,r=t.toString(),n.callApi("POST",je+"/zones",{id:r,remove:!0})).catch((e=>{console.error("Failed to delete zone:",e),this.zones=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleCalculateZone(e){const a=this.zones[e];var t,i;a&&null!=a.id&&(this.hass&&(t=this.hass,i=a.id.toString(),t.callApi("POST",je+"/zones",{id:i,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const a=this.zones[e];var t,i;a&&null!=a.id&&(this.hass&&(t=this.hass,i=a.id.toString(),t.callApi("POST",je+"/zones",{id:i,update:!0})))}handleViewWeatherInfo(e){var a;const t=this.zones[e];if(!t||null==t.mapping)return;const i=`#weather-section-${t.id}`,n=null===(a=this.shadowRoot)||void 0===a?void 0:a.querySelector(i);n&&(n.hasAttribute("hidden")?n.removeAttribute("hidden"):n.setAttribute("hidden",""))}handleViewWateringCalendar(e){var a;const t=this.zones[e];if(!t||null==t.id)return;const i=`#calendar-section-${t.id}`,n=null===(a=this.shadowRoot)||void 0===a?void 0:a.querySelector(i);n&&(n.hasAttribute("hidden")?n.removeAttribute("hidden"):n.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const a=await Pa(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,a)}catch(a){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,a)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const t of this.zones)if(void 0!==t.id)try{const i=await(e=this.hass,a=t.id.toString(),e.callWS({type:je+"/watering_calendar",zone_id:a}));this.wateringCalendars.set(t.id,i)}catch(e){console.error(`Failed to fetch watering calendar for zone ${t.id}:`,e)}var e,a;this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return q``;const a=this.weatherRecords.get(e.id)||[];return q`
      <div class="weather-records">
        <h4>
          ${Bo("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===a.length?q`
              <div class="weather-note">
                ${Bo("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:q`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${Bo("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${a.slice(0,10).map((e=>q`
                    <div class="weather-row">
                      <span
                        >${yl(e.timestamp).format("MM-DD HH:mm")}</span
                      >
                      <span
                        >${null!==e.temperature&&void 0!==e.temperature?e.temperature.toFixed(1)+"°C":"-"}</span
                      >
                      <span
                        >${null!==e.humidity&&void 0!==e.humidity?e.humidity.toFixed(1)+"%":"-"}</span
                      >
                      <span
                        >${null!==e.precipitation&&void 0!==e.precipitation?e.precipitation.toFixed(1)+"mm":"-"}</span
                      >
                      <span
                        >${e.retrieval_time?yl(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `))}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){if(!this.hass||"number"!=typeof e.id)return q``;const a=this.wateringCalendars.get(e.id),t=a&&e.id in a?a[e.id]:null,i=(null==t?void 0:t.monthly_estimates)||[];return q` <div class="watering-calendar">
      <h4>Watering Calendar (12-Month Estimates)</h4>
      ${0===i.length?q`
            <div class="calendar-note">
              ${(null==t?void 0:t.error)?`Error generating calendar: ${t.error}`:"No watering calendar data available for this zone"}
            </div>
          `:q` <div class="calendar-table">
              <div class="calendar-header">
                <span>Month</span>
                <span>ET (mm)</span>
                <span>Precipitation (mm)</span>
                <span>Watering (L)</span>
                <span>Avg Temp (°C)</span>
              </div>
              ${i.map((e=>q`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${null!==e.estimated_et_mm&&void 0!==e.estimated_et_mm?e.estimated_et_mm.toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.average_precipitation_mm&&void 0!==e.average_precipitation_mm?e.average_precipitation_mm.toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.estimated_watering_volume_liters&&void 0!==e.estimated_watering_volume_liters?e.estimated_watering_volume_liters.toFixed(0):"-"}</span
                    >
                    <span
                      >${null!==e.average_temperature_c&&void 0!==e.average_temperature_c?e.average_temperature_c.toFixed(1):"-"}</span
                    >
                  </div>
                `))}
            </div>
            ${(null==t?void 0:t.calculation_method)?q`
                  <div class="calendar-info">
                    Method: ${t.calculation_method}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");var a,t;await(a=this.hass,t=e,a.callApi("POST",je+"/zones",t))}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,a,t,i;(null===(a=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===a?void 0:a.trim())||(null===(t=this.sizeInput)||void 0===t?void 0:t.value)||(null===(i=this.throughputInput)||void 0===i?void 0:i.value)||(this.isCreatingZone=!1)}renderTheOptions(e,a){if(this.hass){let t=q`<option value="" ?selected=${void 0===a}">---${Bo("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,i])=>t=q`${t}
            <option
              value="${i.id}"
              ?selected="${a===i.id}"
            >
              ${i.id}: ${i.name}
            </option>`)),t}return q``}renderZone(e,a){var t,i,n;if(!this.hass)return q``;const r=this.hass.language,s=e.state===ml.Automatic,o=e.state===ml.Disabled||e.state===ml.Automatic,l=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const a=this.mappings.filter((a=>a.id===e.mapping))[0];null!=a&&null!=a.data&&(e.number_of_data_points=a.data.length)}const d=Bo("panels.zones.labels.states."+e.state,r),u=`${Math.round(Number(e.duration)||0)} s`,c=null!=e.id&&this._expanded.has(e.id);return q`
      <ha-card class="zone-card">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${c?"true":"false"}
          @click=${()=>this._toggleZone(e.id)}
          @keydown=${a=>{"Enter"!==a.key&&" "!==a.key||(a.preventDefault(),this._toggleZone(e.id))}}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${e.name||"—"}</span>
              <ha-label class="state-label state-label--${e.state}" dense
                >${d}</ha-label
              >
            </div>
            <div class="zone-sub">${u}</div>
          </div>
          <ha-svg-icon
            class="zone-chevron ${c?"open":""}"
            .path=${Ro}
          ></ha-svg-icon>
        </div>
        ${c?q` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${Bo("panels.zones.labels.last_calculated",r)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?yl(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${Bo("panels.zones.labels.data-last-updated",r)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?yl(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${Bo("panels.zones.labels.data-number-of-data-points",r)}</span
                  >
                  <span class="meta-value"
                    >${null!==(t=e.number_of_data_points)&&void 0!==t?t:"—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(Bo("panels.zones.labels.name",r),"",e.name,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[oa]:t}))))}
                ${this._numRow(Bo("panels.zones.labels.size",r),$a(this.config,la),e.size,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[la]:parseFloat(t)}))),.1)}
                ${this._numRow(Bo("panels.zones.labels.throughput",r),$a(this.config,da),e.throughput,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[da]:parseFloat(t)}))),.1)}
                ${this._numRow(Bo("panels.zones.labels.drainage_rate",r),$a(this.config,ka),e.drainage_rate,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ka]:parseFloat(t)}))),.1)}
                ${this._selectRow(Bo("panels.zones.labels.state",r),q`
                    <option
                      value="${ml.Automatic}"
                      ?selected=${e.state===ml.Automatic}
                    >
                      ${Bo("panels.zones.labels.states.automatic",r)}
                    </option>
                    <option
                      value="${ml.Disabled}"
                      ?selected=${e.state===ml.Disabled}
                    >
                      ${Bo("panels.zones.labels.states.disabled",r)}
                    </option>
                    <option
                      value="${ml.Manual}"
                      ?selected=${e.state===ml.Manual}
                    >
                      ${Bo("panels.zones.labels.states.manual",r)}
                    </option>
                  `,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ua]:t.target.value,[ca]:0}))))}
                ${this._selectRow(Bo("common.labels.module",r),this.renderTheOptions(this.modules,e.module),(t=>{const i=t.target.value;this.handleEditZone(a,Object.assign(Object.assign({},e),{[pa]:""===i?void 0:parseInt(i)}))}))}
                ${this._selectRow(Bo("panels.zones.labels.mapping",r),this.renderTheOptions(this.mappings,e.mapping),(t=>{const i=t.target.value;this.handleEditZone(a,Object.assign(Object.assign({},e),{[ha]:""===i?void 0:parseInt(i)}))}))}
                ${this._numRow(Bo("panels.zones.labels.bucket",r),$a(this.config,ma),Number(e.bucket).toFixed(1),(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ma]:parseFloat(t)}))),.1)}
                ${this._numRow(Bo("panels.zones.labels.maximum-bucket",r),$a(this.config,ma),Number(e.maximum_bucket).toFixed(1),(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ba]:parseFloat(t)}))),.1)}
                ${this._numRow(Bo("panels.zones.labels.et-deficiency",r),$a(this.config,ma),null!=e.et_deficiency?Number(e.et_deficiency).toFixed(2):"",(()=>{}),.01,!0)}
                ${(null===(i=this.config)||void 0===i?void 0:i.observed_watering_enabled)?this._entityRow(Bo("panels.zones.labels.linked-entity",r),Bo("panels.zones.labels.optional",r),e.linked_entity,["switch","valve","input_boolean","binary_sensor"],(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ya]:t||void 0}))),Bo("panels.zones.labels.linked-entity-hint",r)):""}
                ${(null===(n=this.config)||void 0===n?void 0:n.observed_watering_enabled)&&e.linked_entity?this._entityRow(Bo("panels.zones.labels.flow-sensor",r),Bo("panels.zones.labels.optional",r),e.flow_sensor,["sensor"],(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[_a]:t||void 0}))),Bo("panels.zones.labels.flow-sensor-hint",r)):""}
                ${this._numRow(Bo("panels.zones.labels.lead-time",r),"s",e.lead_time,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[va]:parseInt(t,10)}))),1)}
                ${this._numRow(Bo("panels.zones.labels.maximum-duration",r),"s",e.maximum_duration,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[fa]:parseInt(t,10)}))),1)}
                ${this._numRow(Bo("panels.zones.labels.multiplier",r),"",e.multiplier,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ga]:parseFloat(t)}))),.1)}
                ${this._numRow(Bo("panels.zones.labels.duration",r),"s",e.duration,(t=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ca]:parseInt(t,10)}))),1,o)}
              </div>

              <div class="zone-actions">
                ${s?q`
                      ${this._actionBtn(Uo,Bo("panels.zones.actions.calculate",r),(()=>this.handleCalculateZone(a)))}
                      ${this._actionBtn(Ko,Bo("panels.zones.actions.update",r),(()=>this.handleUpdateZone(a)))}
                    `:""}
                ${this._actionBtn(Yo,Bo("panels.zones.actions.reset-bucket",r),(()=>this.handleEditZone(a,Object.assign(Object.assign({},e),{[ma]:0}))))}
                ${null!=e.mapping?this._actionBtn(qo,Bo("panels.zones.actions.view-weather-info",r),(()=>this.handleViewWeatherInfo(a))):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",Bo("panels.zones.actions.view-watering-calendar",r),(()=>this.handleViewWateringCalendar(a)))}
                ${l?this._actionBtn("M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",Bo("panels.zones.actions.information",r),(()=>this.toggleExplanation(a))):""}
                ${this._actionBtn(Fo,Bo("common.actions.delete",r),(e=>this.handleRemoveZone(e,a)),!0)}
              </div>

              ${l?q`<label class="hidden" id="calcresults${a}"
                    >${Sa("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
    `}_textRow(e,a,t,i){return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==t?"":String(t)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,a,t,i,n=1,r=!1){const s=(String(n).split(".")[1]||"").length,o=(e,a)=>{const t=parseFloat(e.value),r=+((isNaN(t)?0:t)+a*n).toFixed(s);e.value=String(r),i(String(r))};return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${r}
            .value=${null==t?"":String(t)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Go}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Zo}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,a,t){return q`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${t}>
            ${a}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Wo}></path>
          </svg>
        </div>
      </div>
    `}_entityRow(e,a,t,i,n,r){return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
          ${r?q`<div class="setting-hint">${r}</div>`:""}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${t||""}
          .includeDomains=${i}
          allow-custom-entity
          @value-changed=${e=>{var a;return n((null===(a=e.detail)||void 0===a?void 0:a.value)||"")}}
        ></ha-entity-picker>
      </div>
    `}_actionBtn(e,a,t,i=!1,n=!1){return q`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${t}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${a}
      </ha-button>
    `}toggleExplanation(e){var a;const t=null===(a=this.shadowRoot)||void 0===a?void 0:a.querySelector("#calcresults"+e);t&&("hidden"!=t.className?t.className="hidden":t.className="explanation")}render(){return this.hass?this.isLoading?q`
        <ha-card header="${Bo("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${Bo("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:q`
      <ha-card header="${Bo("panels.zones.title",this.hass.language)}">
        <div class="card-content">
          ${Bo("panels.zones.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Bo("panels.zones.cards.add-zone.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.zones.labels.name",this.hass.language)}
            </div>
            <input
              id="nameInput"
              class="field"
              type="text"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.zones.labels.size",this.hass.language)}
              <span class="unit">(${$a(this.config,la)})</span>
            </div>
            <input
              id="sizeInput"
              class="field"
              type="number"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.zones.labels.throughput",this.hass.language)}
              <span class="unit"
                >(${$a(this.config,da)})</span
              >
            </div>
            <input
              id="throughputInput"
              class="field"
              type="number"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="add-zone-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddZone}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${Zo}></ha-svg-icon>
              ${this.isSaving?Bo("common.saving-messages.adding",this.hass.language):Bo("panels.zones.cards.add-zone.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${cl(this.zones,(e=>{var a;return null!==(a=e.id)&&void 0!==a?a:e.name}),((e,a)=>this.renderZone(e,a)))}

      <ha-card
        header="${Bo("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(Uo,Bo("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),(()=>this.handleCalculateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(Ko,Bo("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),(()=>this.handleUpdateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(Yo,Bo("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),(()=>this.handleResetAllBuckets()),!1,this.isSaving)}
            ${this._actionBtn(qo,Bo("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),(()=>this.handleClearAllWeatherdata()),!1,this.isSaving)}
          </div>
        </div>
      </ha-card>
    `:q``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return p`
      ${Qo}

      /* --- Modern zone cards (HA-native look) --- */
      /* own collapsible: a plain ha-card (white surface like every HA card)
         with a clickable header — no mystery hover/focus tints */
      .zone-card {
        overflow: hidden;
      }
      .zone-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        user-select: none;
      }
      .zone-head:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .zone-head-text {
        flex: 1 1 auto;
        min-width: 0;
      }
      .zone-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .zone-title {
        font-size: 1.15rem;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 0 1 auto;
        min-width: 0;
      }
      /* native HA state pill (ha-label), tinted by zone state */
      ha-label.state-label {
        flex: 0 0 auto;
        --ha-label-background-color: rgba(
          var(--rgb-disabled-text-color, 120, 120, 120),
          0.15
        );
      }
      ha-label.state-label--automatic {
        --ha-label-background-color: rgba(
          var(--rgb-success-color, 67, 160, 71),
          0.18
        );
      }
      ha-label.state-label--manual {
        --ha-label-background-color: rgba(
          var(--rgb-warning-color, 255, 166, 0),
          0.22
        );
      }
      .zone-sub {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .zone-chevron {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
      }
      .zone-chevron.open {
        transform: rotate(180deg);
      }

      .zone-body {
        padding: 12px 16px 16px;
        border-top: 1px solid var(--divider-color);
      }

      .zone-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 28px;
        padding: 4px 0 12px;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .meta-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
      }
      .meta-value {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .settings {
        display: flex;
        flex-direction: column;
      }
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 52px;
        padding: 4px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .setting-row:last-child {
        border-bottom: 0;
      }
      .setting-label {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .setting-label .unit {
        color: var(--secondary-text-color);
        font-weight: 400;
        font-size: 0.85em;
      }
      /* one unified field style for BOTH inputs and selects, themed with the
         same MDC variables HA's own ha-textfield/ha-select use (native feel) */
      .setting-hint {
        font-size: 0.8rem;
        font-weight: normal;
        color: var(--secondary-text-color);
        margin-top: 2px;
        max-width: 460px;
      }
      /* HA entity picker: sized like the other controls, but it brings its own
         input chrome, so it must NOT get the .field text-input background. */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      .field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
        height: 44px;
        box-sizing: border-box;
        padding: 0 12px;
        border: none;
        border-bottom: 1px solid
          var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
        border-radius: 4px 4px 0 0;
        background: var(
          --mdc-text-field-fill-color,
          var(--input-fill-color, rgba(0, 0, 0, 0.04))
        );
        color: var(--primary-text-color);
        font-size: 1rem;
        font-family: var(--paper-font-body1_-_font-family, inherit);
        line-height: normal;
        transition:
          border-color 0.15s,
          background 0.15s;
      }
      .field:hover {
        border-bottom-color: var(
          --mdc-text-field-hover-line-color,
          var(--primary-text-color)
        );
      }
      .field:focus {
        outline: none;
        border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
      }
      input.field[readonly] {
        opacity: 0.55;
        cursor: not-allowed;
      }
      /* keep native up/down spinners (they respect the per-field step) */
      /* number field with clean HA +/- steppers */
      .num-field {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      .num-field .num-input {
        flex: 1 1 auto;
        width: auto;
        min-width: 0;
        max-width: none;
        /* text on the left, like the fields without steppers */
        text-align: left;
      }
      .num-field .step-btn {
        display: none;
      }
      /* native select wrapped so we can draw a themed chevron */
      .select-wrap {
        position: relative;
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
        display: inline-flex;
      }
      .select-wrap .field {
        width: 100%;
        max-width: 100%;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 36px;
        cursor: pointer;
      }
      .select-wrap .chev {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        pointer-events: none;
        fill: var(--secondary-text-color);
      }

      .zone-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .zone-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .add-zone-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }
      /* native ha-button: appearance/variant handle the colors. 2-col grid,
         full-width cells, content left-aligned so the icon stays fixed left. */
      .zone-actions ha-button,
      .zone-actions-grid ha-button {
        width: 100%;
      }
      .zone-actions ha-button::part(base),
      .zone-actions-grid ha-button::part(base) {
        justify-content: flex-start;
      }
      .zone-actions ha-button::part(label),
      .zone-actions-grid ha-button::part(label) {
        text-align: left;
      }
      .zone-actions ha-button ha-svg-icon,
      .zone-actions-grid ha-button ha-svg-icon,
      .add-zone-actions ha-button ha-svg-icon {
        --mdc-icon-size: 18px;
      }
      @media (max-width: 600px) {
        .zone-actions,
        .zone-actions-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .setting-row {
          flex-direction: column;
          align-items: stretch;
          gap: 6px;
        }
        .field,
        .select-wrap,
        .num-field {
          width: 100%;
          max-width: 100%;
        }
      }
    `}};r([he()],_l.prototype,"config",void 0),r([he({type:Array})],_l.prototype,"zones",void 0),r([he({type:Array})],_l.prototype,"modules",void 0),r([he({type:Array})],_l.prototype,"mappings",void 0),r([he({type:Map})],_l.prototype,"wateringCalendars",void 0),r([he({type:Map})],_l.prototype,"weatherRecords",void 0),r([he({type:Boolean})],_l.prototype,"isLoading",void 0),r([he({type:Boolean})],_l.prototype,"isSaving",void 0),r([he({type:Boolean})],_l.prototype,"isCreatingZone",void 0),r([fe("#nameInput")],_l.prototype,"nameInput",void 0),r([fe("#sizeInput")],_l.prototype,"sizeInput",void 0),r([fe("#throughputInput")],_l.prototype,"throughputInput",void 0),_l=r([me("smart-irrigation-view-zones")],_l);let zl=class extends(Ca(ce)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.moduleCache=new Map,this._expanded=new Set,this.debouncedSave=(()=>{let e=null;return a=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this._suppressNextConfigUpdate=!0,this.saveToHA(a).catch((()=>{this._suppressNextConfigUpdate=!1})),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:je+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{const[a,t,i,n]=await Promise.all([Ma(this.hass),Da(this.hass),Oa(this.hass),(e=this.hass,e.callWS({type:je+"/allmodules"}))]);this.config=a,this.zones=t,this.modules=i,this.allmodules=n,this.moduleCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e}}async handleAddModule(){var e,a;if((null===(a=null===(e=this.moduleInput)||void 0===e?void 0:e.selectedOptions)||void 0===a?void 0:a[0])&&!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.moduleInput.selectedOptions[0].text,a=this.allmodules.find((a=>a.name===e));if(!a)return;const t={name:e,description:a.description,config:a.config,schema:a.schema};this.modules=[...this.modules,t],this.moduleCache.clear(),this._scheduleUpdate(),await this.saveToHA(t),await this._fetchData()}catch(e){console.error("Error adding module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}async handleRemoveModule(e,a){if(!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.modules[a],n=null==e?void 0:e.id;this.modules;this.modules=this.modules.filter(((e,t)=>t!==a)),this.moduleCache.clear(),this._scheduleUpdate(),this.hass&&void 0!==n&&await(t=this.hass,i=n.toString(),t.callApi("POST",je+"/modules",{id:i,remove:!0}))}catch(e){console.error("Error removing module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var t,i}}async saveToHA(e){var a,t;if(this.hass)try{await(a=this.hass,t=e,a.callApi("POST",je+"/modules",t))}catch(e){throw console.error("Error saving module:",e),e}}renderModule(e,a){var t,i;if(!this.hass)return q``;const n=this.zones.filter((a=>a.module===e.id)).length,r=null!==(t=e.id)&&void 0!==t?t:a,s=this._expanded.has(r),o=e.description||(null===(i=this.allmodules.find((a=>a.name===e.name)))||void 0===i?void 0:i.description)||"",l=`module-${e.id||a}-${s?"open":"closed"}-${JSON.stringify(e)}`;if(this.moduleCache.has(l))return this.moduleCache.get(l);const d=q`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${s?"true":"false"}
          @click=${()=>this._toggleItem(r)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleItem(r))}}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${null!=e.id?`${e.id}: ${e.name}`:e.name}</span
              >
            </div>
            <div class="si-sub">${o}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${s?"open":""}"
            .path=${Ro}
          ></ha-svg-icon>
        </div>
        ${s?q` <div class="si-body">
              <div class="moduleconfig">
                <label class="subheader"
                  >${Bo("panels.modules.cards.module.labels.configuration",this.hass.language)}
                  (*
                  ${Bo("panels.modules.cards.module.labels.required",this.hass.language)})</label
                >
                <div class="settings">
                  ${e.schema?Object.entries(e.schema).map((([e])=>this.renderConfig(a,e))):null}
                </div>
              </div>
              ${n?q`<div class="weather-note">
                    ${Bo("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}
                  </div>`:q`<div class="si-actions">
                    ${this._actionBtn(Fo,Bo("common.actions.delete",this.hass.language),(e=>this.handleRemoveModule(e,a)),!0)}
                  </div>`}
            </div>`:""}
      </ha-card>
    `;return this.moduleCache.set(l,d),d}renderConfig(e,a){const t=Object.values(this.modules).at(e);if(!t||!this.hass)return;const i=t.schema[a],n=i.name,r=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(n);let s="";null==t.config&&(t.config=[]),n in t.config&&(s=t.config[n]);const o=i.required?`${r} *`:null!=r?r:"";if("boolean"==i.type)return q`
        <div class="setting-row">
          <div class="setting-label">${o}</div>
          <input
            type="checkbox"
            id="${n+e}"
            .checked=${s}
            @change="${a=>this.handleEditConfig(e,Object.assign(Object.assign({},t),{config:Object.assign(Object.assign({},t.config),{[n]:a.target.checked})}))}"
          />
        </div>
      `;if("float"==i.type||"integer"==i.type)return this._numRow(o,"",t.config[n],(a=>this.handleEditConfig(e,Object.assign(Object.assign({},t),{config:Object.assign(Object.assign({},t.config),{[n]:a})}))),1);if("string"==i.type)return this._textRow(o,"",s,(a=>this.handleEditConfig(e,Object.assign(Object.assign({},t),{config:Object.assign(Object.assign({},t.config),{[n]:a})}))));if("select"==i.type){const a=this.hass.language,r=q`
        ${Object.entries(i.options).map((([e,t])=>q`<option
              value="${Aa(t,0)}"
              ?selected="${s===Aa(t,0)}"
            >
              ${Bo("panels.modules.cards.module.translated-options."+Aa(t,1),a)}
            </option>`))}
      `;return this._selectRow(o,r,(a=>this.handleEditConfig(e,Object.assign(Object.assign({},t),{config:Object.assign(Object.assign({},t.config),{[n]:a.target.value})}))))}return q``}_textRow(e,a,t,i){return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==t?"":String(t)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,a,t,i,n=1,r=!1){const s=(String(n).split(".")[1]||"").length,o=(e,a)=>{const t=parseFloat(e.value),r=+((isNaN(t)?0:t)+a*n).toFixed(s);e.value=String(r),i(String(r))};return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${r}
            .value=${null==t?"":String(t)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Go}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Zo}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,a,t){return q`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${t}>
            ${a}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Wo}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,a,t,i=!1,n=!1){return q`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${t}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${a}
      </ha-button>
    `}handleEditConfig(e,a){this.modules=Object.values(this.modules).map(((t,i)=>i===e?a:t)),this.moduleCache.clear(),this._scheduleUpdate(),this.debouncedSave(a)}renderOption(e,a){return this.hass?q`<option value="${e}>${a}</option>`:q``}render(){return this.hass?q`
      <ha-card header="${Bo("panels.modules.title",this.hass.language)}">
        <div class="card-content">
          ${Bo("panels.modules.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Bo("panels.modules.cards.add-module.header",this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading?q`<div class="loading-indicator">
                ${Bo("common.loading-messages.general",this.hass.language)}
              </div>`:q`
                <div class="setting-row">
                  <div class="setting-label">
                    ${Bo("common.labels.module",this.hass.language)}
                  </div>
                  <div class="select-wrap">
                    <select
                      id="moduleInput"
                      class="field"
                      ?disabled="${this.isSaving}"
                    >
                      ${Object.entries(this.allmodules).map((([e,a])=>q`<option value="${a.id}">
                            ${a.name}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Wo}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${Zo}></ha-svg-icon>
                    ${this.isSaving?Bo("common.saving-messages.adding",this.hass.language):Bo("panels.modules.cards.add-module.actions.add",this.hass.language)}
                  </ha-button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading?q`<div class="loading-indicator">
            ${Bo("common.loading-messages.modules",this.hass.language)}
          </div>`:cl(this.modules,(e=>{var a;return null!==(a=e.id)&&void 0!==a?a:e.name}),((e,a)=>this.renderModule(e,a)))}
    `:q``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.moduleCache.clear()}static get styles(){return p`
      ${Qo} ${al} /* View-specific styles only - most common styles are now in globalStyle */
    `}};r([he()],zl.prototype,"config",void 0),r([he({type:Array})],zl.prototype,"zones",void 0),r([he({type:Array})],zl.prototype,"modules",void 0),r([he({type:Array})],zl.prototype,"allmodules",void 0),r([he({type:Boolean})],zl.prototype,"isLoading",void 0),r([he({type:Boolean})],zl.prototype,"isSaving",void 0),r([fe("#moduleInput")],zl.prototype,"moduleInput",void 0),zl=r([me("smart-irrigation-view-modules")],zl);let wl=class extends(Ca(ce)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this.globalDebounceTimer=null,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}),this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:je+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,a,t]=await Promise.all([Ma(this.hass),Da(this.hass),Na(this.hass)]);this.config=e,this.zones=a,this.mappings=t,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(a){console.error("Error fetching data:",a),Ea({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const a=await Pa(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,a)}catch(a){console.error(`Failed to fetch weather records for mapping ${e.id}:`,a),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return q``;const a=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return q`
      <div class="weather-records">
        <h4>
          ${Bo("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===a.length?q`
              <div class="weather-note">
                ${Bo("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:q`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${Bo("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${Bo("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${a.slice(0,10).map((e=>{let a="-",t="-";try{if(e.timestamp&&null!==e.timestamp){const t=yl(e.timestamp);t.isValid()&&(a=t.format("MM-DD HH:mm"))}}catch(a){console.warn("Error formatting timestamp:",e.timestamp,a)}try{if(e.retrieval_time&&null!==e.retrieval_time){const a=yl(e.retrieval_time);a.isValid()&&(t=a.format("MM-DD HH:mm"))}}catch(a){console.warn("Error formatting retrieval_time:",e.retrieval_time,a)}return q`
                    <div class="weather-row">
                      <span>${a}</span>
                      <span
                        >${null!==e.temperature&&void 0!==e.temperature?e.temperature.toFixed(1)+"°C":"-"}</span
                      >
                      <span
                        >${null!==e.humidity&&void 0!==e.humidity?e.humidity.toFixed(1)+"%":"-"}</span
                      >
                      <span
                        >${null!==e.precipitation&&void 0!==e.precipitation?e.precipitation.toFixed(1)+"mm":"-"}</span
                      >
                      <span>${t}</span>
                    </div>
                  `}))}
              </div>
            `}
      </div>
    `}handleAddMapping(){if(!this.mappingNameInput.value.trim())return;const e={[Pe]:"",[Ce]:"",[He]:"",[Ie]:"",[Le]:"",[Be]:"",[Ue]:"",[Re]:"",[Ve]:""},a={name:this.mappingNameInput.value.trim(),mappings:e};this.mappings=[...this.mappings,a],this.isSaving=!0,this.saveToHA(a).then((()=>(this.mappingNameInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleRemoveMapping(e,a){const t=this.mappings[a].id;if(null==t)return;const i=[...this.mappings];var n,r;(this.mappings=this.mappings.filter(((e,t)=>t!==a)),this.mappingCache.delete(t.toString()),this.hass)&&(this.isSaving=!0,(n=this.hass,r=t.toString(),n.callApi("POST",je+"/mappings",{id:r,remove:!0})).catch((e=>{console.error("Failed to delete mapping:",e),this.mappings=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleEditMapping(e,a){this.mappings[e]=a,a.id&&this.mappingCache.delete(a.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{this.isSaving=!0,this._suppressNextConfigUpdate=!0,this.saveToHA(a).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}async saveToHA(e){var a;if(!this.hass)throw new Error("Home Assistant connection not available");const t=[],i=this.hass.states;for(const a in e.mappings){const n=e.mappings[a].sensorentity;if(n&&""!==n.trim()){const r=n.trim();e.mappings[a].sensorentity=r,r in i||t.push(r)}}if(t.length>0){const e=null===(a=this.shadowRoot)||void 0===a?void 0:a.querySelector("ha-card");throw e&&Ea({body:{message:Bo("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+t.join(", ")},error:Bo("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}const{id:n,name:r,mappings:s}=e;var o,l;await(o=this.hass,l={id:n,name:r,mappings:s},o.callApi("POST",je+"/mappings",l))}renderMapping(e,a){if(!this.hass)return q``;const t=`${e.id}_${JSON.stringify(e).slice(0,100)}`;if(this.mappingCache.has(t))return this.mappingCache.get(t);const i=this.zones.filter((a=>a.mapping===e.id)).length,n=q`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${Bo("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @change="${t=>this.handleEditMapping(a,Object.assign(Object.assign({},e),{name:t.target.value}))}"
            />
            ${Object.entries(e.mappings).map((([e])=>this.renderMappingSetting(a,e)))}
            ${i?q`<div class="weather-note">
                  ${Bo("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}
                </div>`:q` <div
                  class="action-button"
                  @click="${e=>this.handleRemoveMapping(e,a)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${Fo}" />
                  </svg>
                  <span class="action-button-label">
                    ${Bo("common.actions.delete",this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;return this.mappingCache.set(t,n),n}renderMappingSetting(e,a){const t=this.mappings[e];if(!t||!this.hass)return q``;const i=t.mappings[a];return q`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${Bo(`panels.mappings.cards.mapping.items.${a.toLowerCase()}`,this.hass.language)}
        </div>
        ${this._selectRow(Bo("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,a,i),(t=>this.handleSimpleSourceChange(e,a,t)))}
        ${this.renderMappingInputs(e,a,i)}
      </div>
    `}renderSimpleRadioOptions(e,a,t){if(!this.hass||!this.config)return q``;const i=a===Ce||a===Ue,n=t[Xe],r=!!this.config.use_weather_service,s=i&&this.config.weather_service!==qe;return q`
      ${r?q`<option
            value="${We}"
            ?selected=${n===We}
          >
            ${Bo("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${s?" (via Open-Meteo)":""}
          </option>`:""}
      ${i?q`<option
            value="${Qe}"
            ?selected=${n===Qe}
          >
            ${Bo("panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${Ge}"
        ?selected=${n===Ge}
      >
        ${Bo("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      <option
        value="${Ye}"
        ?selected=${n===Ye}
      >
        ${Bo("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
    `}handleSimpleSourceChange(e,a,t){const i=this.mappings[e],n=t.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[Xe]:n,[ea]:""})})}))}handleSimpleInputChange(e,a,t,i){const n=this.mappings[e],r=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[a]:Object.assign(Object.assign({},n.mappings[a]),{[t]:r})})}))}renderSourceOptions(e,a,t){var i;if(!this.hass)return q``;const n=`${a}_${e}`,r=a===Ce||a===Ue,s=!!(null===(i=this.config)||void 0===i?void 0:i.use_weather_service);return q`
      <div class="mappingsettingline">
        <label for="${n}_source">
          ${Bo("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${s?this.renderWeatherServiceOption(e,a,t):""}
        ${r?this.renderNoneOption(e,a,t):""}
        ${this.renderSensorOption(e,a,t)}
        ${this.renderStaticValueOption(e,a,t)}
      </div>
    `}renderWeatherServiceOption(e,a,t){if(!this.hass||!this.config)return q``;const i=`${a}_${e}`,n=!this.config.use_weather_service,r=this.config.use_weather_service&&t[Xe]===We,s=(a===Ce||a===Ue)&&this.config.weather_service!==qe;return q`
      <label class="${n?"strikethrough":""}">
        <input
          type="radio"
          id="${i}_weather"
          value="${We}"
          name="${i}_source"
          ?checked="${r}"
          ?disabled="${n}"
          @change="${t=>this.handleSourceChange(e,a,t)}"
        />
        ${Bo("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${s?" (via Open-Meteo)":""}
      </label>
    `}renderNoneOption(e,a,t){if(!this.hass)return q``;const i=`${a}_${e}`,n=t[Xe]===Qe;return q`
      <label>
        <input
          type="radio"
          id="${i}_none"
          value="${Qe}"
          name="${i}_source"
          ?checked="${n}"
          @change="${t=>this.handleSourceChange(e,a,t)}"
        />
        ${Bo("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,a,t){if(!this.hass)return q``;const i=`${a}_${e}`,n=t[Xe]===Ge;return q`
      <label>
        <input
          type="radio"
          id="${i}_sensor"
          value="${Ge}"
          name="${i}_source"
          ?checked="${n}"
          @change="${t=>this.handleSourceChange(e,a,t)}"
        />
        ${Bo("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,a,t){if(!this.hass)return q``;const i=`${a}_${e}`,n=t[Xe]===Ye;return q`
      <label>
        <input
          type="radio"
          id="${i}_static"
          value="${Ye}"
          name="${i}_source"
          ?checked="${n}"
          @change="${t=>this.handleSourceChange(e,a,t)}"
        />
        ${Bo("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,a,t){const i=this.mappings[e],n=t.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[Xe]:n,[ea]:""})})}))}renderMappingInputs(e,a,t){if(!this.hass)return q``;const i=t[Xe];return q`
      ${i===Ge?this.renderSensorInput(e,a,t):""}
      ${i===Ye?this.renderStaticValueInput(e,a,t):""}
      ${i===Ge||i===Ye?this.renderUnitSelect(e,a,t):""}
      ${a!==Be||i!==Ge&&i!==Ye?"":this.renderPressureTypeSelect(e,a,t)}
      ${i===Ge?this.renderAggregateSelect(e,a,t):""}
    `}renderSensorInput(e,a,t){return this.hass?q`
      <div class="setting-row">
        <div class="setting-label">
          ${Bo("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${t[ea]||""}
          allow-custom-entity
          @value-changed=${t=>{var i;return this.handleSensorChange(e,a,{target:{value:(null===(i=t.detail)||void 0===i?void 0:i.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:q``}renderStaticValueInput(e,a,t){return this.hass?this._numRow(Bo("panels.mappings.cards.mapping.static_value",this.hass.language),"",t[aa]||"",(t=>this.handleStaticValueChange(e,a,{target:{value:t}})),.1):q``}renderUnitSelect(e,a,t){return this.hass&&this.config?this._selectRow(Bo("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(a,t),(t=>this.handleUnitChange(e,a,t))):q``}renderPressureTypeSelect(e,a,t){return this.hass?this._selectRow(Bo("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(a,t),(t=>this.handlePressureTypeChange(e,a,t))):q``}renderAggregateSelect(e,a,t){return this.hass?q`
      <div class="setting-row">
        <div class="setting-label">
          ${Bo("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
          <span class="unit"
            >${Bo("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",this.hass.language)}</span
          >
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${t=>this.handleAggregateChange(e,a,t)}"
          >
            ${this.renderAggregateOptionsForMapping(a,t)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Wo}></path>
          </svg>
        </div>
      </div>
    `:q``}handleSensorChange(e,a,t){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[ea]:t.target.value})})}))}handleStaticValueChange(e,a,t){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[aa]:t.target.value})})}))}handleUnitChange(e,a,t){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[ta]:t.target.value})})}))}handlePressureTypeChange(e,a,t){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[Ze]:t.target.value})})}))}handleAggregateChange(e,a,t){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[a]:Object.assign(Object.assign({},i.mappings[a]),{[ia]:t.target.value})})}))}renderAggregateOptionsForMapping(e,a){if(!this.hass||!this.config)return q``;let t="average";return e===Ie&&(t="delta"),e===Le&&(t="average"),a[ia]&&(t=a[ia]),q`
      ${na.map((e=>this.renderAggregateOption(e,t)))}
    `}renderAggregateOption(e,a){if(this.hass&&this.config){return q`<option value="${e}" ?selected="${e===a}">
        ${Bo("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return q``}renderPressureTypes(e,a){if(this.hass&&this.config){let e=q``;const t=a[Ze];return e=q`${e}
        <option
          value="${Ke}"
          ?selected="${t===Ke}"
        >
          ${Bo("panels.mappings.cards.mapping.pressure_types."+Ke,this.hass.language)}
        </option>
        <option
          value="${Je}"
          ?selected="${t===Je}"
        >
          ${Bo("panels.mappings.cards.mapping.pressure_types."+Je,this.hass.language)}
        </option>`,e}return q``}renderUnitOptionsForMapping(e,a){if(!this.hass||!this.config)return q``;const t=function(e){switch(e){case Pe:case Re:return[{unit:"°C",system:Ne},{unit:"°F",system:Oe}];case Ie:case Ce:return[{unit:"mm",system:Ne},{unit:"in",system:Oe}];case Le:return[{unit:ra,system:Ne},{unit:sa,system:Oe}];case He:return[{unit:"%",system:[Ne,Oe]}];case Be:return[{unit:"millibar",system:Ne},{unit:"hPa",system:Ne},{unit:"psi",system:Oe},{unit:"inch Hg",system:Oe}];case Ve:return[{unit:"km/h",system:Ne},{unit:"meter/s",system:Ne},{unit:"mile/h",system:Oe}];case Ue:return[{unit:"W/m2",system:Ne},{unit:"MJ/day/m2",system:Ne},{unit:"W/sq ft",system:Oe},{unit:"MJ/day/sq ft",system:Oe}];default:return[]}}(e);let i=a[ta];const n=this.config.units;if(!a[ta])for(const e of t)if("string"==typeof e.system){if(n===e.system){i=e.unit;break}}else{for(const a of e.system)if(n===a.system){i=e.unit;break}if(i===e.unit)break}return q`
      ${t.map((e=>q`
          <option value="${e.unit}" ?selected="${i===e.unit}">
            ${e.unit}
          </option>
        `))}
    `}_textRow(e,a,t,i){return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==t?"":String(t)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,a,t,i,n=1,r=!1){const s=(String(n).split(".")[1]||"").length,o=(e,a)=>{const t=parseFloat(e.value),r=+((isNaN(t)?0:t)+a*n).toFixed(s);e.value=String(r),i(String(r))};return q`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${a?q` <span class="unit">(${a})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${r}
            .value=${null==t?"":String(t)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Go}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Zo}
            ?disabled=${r}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,a,t){return q`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${t}>
            ${a}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Wo}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,a,t,i=!1,n=!1){return q`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${t}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${a}
      </ha-button>
    `}render(){return this.hass?this.isLoading?q`
        <ha-card
          header="${Bo("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Bo("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:q`
      <ha-card
        header="${Bo("panels.mappings.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Bo("panels.mappings.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Bo("panels.mappings.cards.add-mapping.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.mappings.labels.mapping-name",this.hass.language)}
            </div>
            <input id="mappingNameInput" class="field" type="text" />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${Zo}></ha-svg-icon>
              ${this.isSaving?Bo("common.saving-messages.adding",this.hass.language):Bo("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `:q``}renderMappingsList(){const e=this.mappings.slice(0,Math.min(this.mappings.length,10)),a=this.mappings.slice(10);return q`
      ${cl(e,(e=>{var a;return null!==(a=e.id)&&void 0!==a?a:e.name}),((e,a)=>this.renderMappingCard(e,a)))}
      ${a.length>0?q`
            <div class="si-form-actions">
              ${this._actionBtn(Zo,`Load ${a.length} more mappings...`,(()=>this.loadMoreMappings()))}
            </div>
          `:""}
    `}renderMappingCard(e,a){if(!this.hass)return q``;const t=this.hass.language,i=this.zones.filter((a=>a.mapping===e.id)).length,n=Object.keys(e.mappings||{}).length,r=[];r.push(`${n} ${Bo("panels.mappings.title",t).toLowerCase()}`),i&&r.push(`${i} ${Bo("panels.zones.title",t).toLowerCase()}`);const s=r.join(" · "),o=null!=e.id&&this._expanded.has(e.id);return q`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${o?"true":"false"}
          @click=${()=>this._toggleItem(e.id)}
          @keydown=${a=>{"Enter"!==a.key&&" "!==a.key||(a.preventDefault(),this._toggleItem(e.id))}}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${e.id}: ${e.name||"—"}</span
              >
            </div>
            <div class="si-sub">${s}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${o?"open":""}"
            .path=${Ro}
          ></ha-svg-icon>
        </div>
        ${o?q`<div class="si-body">
              <div class="settings">
                ${this._textRow(Bo("panels.mappings.labels.mapping-name",t),"",e.name,(t=>this.handleEditMapping(a,Object.assign(Object.assign({},e),{name:t}))))}
                ${this.renderMappingSettings(e,a)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${i?q`<div class="weather-note">
                      ${Bo("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",t)}
                    </div>`:this._actionBtn(Fo,Bo("common.actions.delete",t),(e=>this.handleRemoveMapping(e,a)),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}renderMappingSettings(e,a){const t=Object.entries(e.mappings);return q`
      ${t.map((([e])=>this.renderMappingSetting(a,e)))}
    `}loadMoreMappings(){this._scheduleUpdate()}static get styles(){return p`
      ${Qo} ${al}

      /* .si-subgroup / .si-subgroup-title now live in modern-style (shared) */
      /* source radios laid out inline like the other field controls */
      .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
        flex: 0 0 auto;
        width: 240px;
        max-width: 50%;
      }
      .radio-group label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--primary-text-color);
      }
      .radio-group label.strikethrough {
        text-decoration: line-through;
        opacity: 0.55;
      }
      /* HA entity picker, sized like the other controls */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      @media (max-width: 600px) {
        .radio-group,
        .entity-field {
          width: 100%;
          max-width: 100%;
        }
      }
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach((e=>{clearTimeout(e)})),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};r([he()],wl.prototype,"config",void 0),r([he({type:Array})],wl.prototype,"zones",void 0),r([he({type:Array})],wl.prototype,"mappings",void 0),r([he({type:Map})],wl.prototype,"weatherRecords",void 0),r([he({type:Boolean})],wl.prototype,"isLoading",void 0),r([he({type:Boolean})],wl.prototype,"isSaving",void 0),r([fe("#mappingNameInput")],wl.prototype,"mappingNameInput",void 0),wl=r([me("smart-irrigation-view-mappings")],wl);let xl=class extends ce{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)})),this._load()}async _load(){var e;if(this.hass)try{const a=await(e=this.hass,e.callWS({type:je+"/weatherservice"}));this._info=a,this._use=!!a.use_weather_service,this._service=a.weather_service||(a.services&&a.services.includes(qe)?qe:a.services&&a.services.length?a.services[0]:null),this._apiKey=a.weather_service_api_key||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1;try{await(e=this.hass,a={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null},e.callWS(Object.assign({type:je+"/set_weatherservice"},a))),this._saved=!0,window.setTimeout((()=>this._load()),800)}catch(e){this._error=this._errText(e)}finally{this._saving=!1}var e,a}}render(){var e;if(!this.hass)return q``;const a=this.hass.language;return this._loading&&!this._info?q`
        <ha-card header="${Bo("panels.weatherservice.title",a)}">
          <div class="card-content">
            ${Bo("common.loading-messages.general",a)}...
          </div>
        </ha-card>
      `:q`
      <ha-card header="${Bo("panels.weatherservice.title",a)}">
        <div class="card-content ws-description">
          ${Bo("panels.weatherservice.description",a)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Bo("panels.weatherservice.labels.use-weather-service",a)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?q`
                <div class="setting-row">
                  <div class="setting-label">
                    ${Bo("panels.weatherservice.labels.service",a)}
                  </div>
                  <div class="select-wrap">
                    <select
                      class="field"
                      @change=${e=>{this._service=e.target.value,this._saved=!1}}
                    >
                      ${((null===(e=this._info)||void 0===e?void 0:e.services)||[]).map((e=>q`<option
                            value="${e}"
                            ?selected=${this._service===e}
                          >
                            ${e}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Wo}></path>
                    </svg>
                  </div>
                </div>
                ${this._service&&Fe.includes(this._service)?"":q`<div class="setting-row">
                      <div class="setting-label">
                        ${Bo("panels.weatherservice.labels.api-key",a)}
                      </div>
                      <input
                        class="field"
                        type="text"
                        autocomplete="off"
                        .value=${this._apiKey}
                        @change=${e=>{this._apiKey=e.target.value,this._saved=!1}}
                      />
                    </div>`}
              `:q`<div class="ws-note">
                ${Bo("panels.weatherservice.messages.no-service",a)}
              </div>`}
          ${this._error?q`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?q`<div class="ws-msg ws-msg--success">
                ${Bo("panels.weatherservice.messages.saved",a)}
              </div>`:""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?Bo("panels.weatherservice.actions.saving",a):Bo("panels.weatherservice.actions.save",a)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${Bo("panels.weatherservice.messages.reload-note",a)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return p`
      ${Qo} ${al}

      .ws-description {
        /* description toujours en couleur de texte primaire, comme l'intro des
           autres modules (pas de gris secondaire) */
        color: var(--primary-text-color);
        line-height: 1.4;
      }
      .ws-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
      }
      .ws-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 8px;
      }
      .ws-reload-note {
        text-align: right;
      }
      .ws-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .ws-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }
      .ws-msg--success {
        background: rgba(var(--rgb-success-color, 67, 160, 71), 0.16);
        color: var(--success-color, #2e7d32);
      }
    `}};r([he()],xl.prototype,"narrow",void 0),r([he()],xl.prototype,"path",void 0),r([ve()],xl.prototype,"_info",void 0),r([ve()],xl.prototype,"_use",void 0),r([ve()],xl.prototype,"_service",void 0),r([ve()],xl.prototype,"_apiKey",void 0),r([ve()],xl.prototype,"_loading",void 0),r([ve()],xl.prototype,"_saving",void 0),r([ve()],xl.prototype,"_error",void 0),r([ve()],xl.prototype,"_saved",void 0),xl=r([me("smart-irrigation-view-weatherservice")],xl);let jl=class extends ce{constructor(){super(...arguments),this._busy=!1,this._error="",this._message="",this._pendingName=""}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}_reset(){this._error="",this._message="",this._pending=void 0,this._pendingName=""}async _export(){if(this.hass){this._reset(),this._busy=!0;try{const a=await(e=this.hass,e.callApi("GET",je+"/export")),t=JSON.stringify(a,null,2),i=new Blob([t],{type:"application/json"}),n=URL.createObjectURL(i),r=document.createElement("a");r.href=n;const s=(new Date).toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");r.download=`smart_irrigation_backup_${s}.json`,r.click(),URL.revokeObjectURL(n),this._message=Bo("panels.backuprestore.messages.exported",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e}}async _onFile(e){this._reset();const a=e.target,t=a.files&&a.files[0];if(t)try{const e=await t.text(),a=JSON.parse(e);if(!a||"object"!=typeof a||!a.config)throw new Error(Bo("panels.backuprestore.messages.invalid-file",this.hass.language));this._pending=a,this._pendingName=t.name}catch(e){this._error=this._errText(e)}finally{a.value=""}}async _restore(){if(this.hass&&this._pending){this._busy=!0,this._error="",this._message="";try{const t=await(e=this.hass,a=this._pending,e.callApi("POST",je+"/restore",a));if(t&&!1===t.success)throw new Error(t.error||"restore failed");this._pending=void 0,this._pendingName="",this._message=Bo("panels.backuprestore.messages.restored",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e,a}}_count(e){const a=this._pending&&this._pending[e];return Array.isArray(a)?a.length:0}render(){if(!this.hass)return q``;const e=this.hass.language;return q`
      <ha-card header="${Bo("panels.backuprestore.title",e)}">
        <div class="card-content br-description">
          ${Bo("panels.backuprestore.description",e)}
        </div>
      </ha-card>

      <ha-card
        header="${Bo("panels.backuprestore.cards.backup.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${Bo("panels.backuprestore.cards.backup.description",e)}
          </div>
          ${this._message?q`<div class="br-msg br-msg--success">${this._message}</div>`:""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"}></ha-svg-icon>
              ${Bo("panels.backuprestore.actions.export",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${Bo("panels.backuprestore.cards.restore.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${Bo("panels.backuprestore.cards.restore.description",e)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${Jo}></ha-svg-icon>
            ${Bo("panels.backuprestore.actions.choose-file",e)}
          </label>

          ${this._pending?q`
                <div class="br-warning">
                  <ha-svg-icon .path=${"M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${Bo("panels.backuprestore.messages.confirm-title",e)}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${Bo("panels.backuprestore.messages.summary",e)}:
                      ${this._count("zones")}
                      ${Bo("panels.zones.title",e)} ·
                      ${this._count("modules")}
                      ${Bo("panels.modules.title",e)} ·
                      ${this._count("mappings")}
                      ${Bo("panels.mappings.title",e)}
                    </div>
                    <div class="br-warning-text">
                      ${Bo("panels.backuprestore.messages.confirm-warning",e)}
                    </div>
                  </div>
                </div>
              `:""}
          ${this._error?q`<div class="br-msg br-msg--error">${this._error}</div>`:""}
          ${this._pending?q`<div class="br-actions">
                <ha-button
                  appearance="filled"
                  variant="danger"
                  ?disabled=${this._busy}
                  @click=${this._restore}
                >
                  <ha-svg-icon slot="start" .path=${Jo}></ha-svg-icon>
                  ${this._busy?Bo("panels.backuprestore.actions.restoring",e):Bo("panels.backuprestore.actions.restore",e)}
                </ha-button>
              </div>`:""}
          <div class="br-note">
            ${Bo("panels.backuprestore.messages.reload-note",e)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return p`
      ${Qo} ${al}

      .br-description {
        color: var(--primary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }
      .br-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
      }
      /* File picker styled as a native-looking button (hides the raw input). */
      .br-file {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 14px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        color: var(--primary-text-color);
      }
      .br-file:hover {
        background: var(--secondary-background-color);
      }
      .br-file input {
        display: none;
      }
      .br-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 12px;
        text-align: right;
      }
      .br-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .br-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }
      .br-msg--success {
        background: rgba(var(--rgb-success-color, 67, 160, 71), 0.16);
        color: var(--success-color, #2e7d32);
      }
      .br-warning {
        display: flex;
        gap: 12px;
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 10px;
        background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.12);
      }
      .br-warning ha-svg-icon {
        color: var(--warning-color, #ffa600);
        flex: 0 0 auto;
      }
      .br-warning-title {
        font-weight: 500;
      }
      .br-file-name {
        font-family: monospace;
        font-size: 0.9em;
        margin: 2px 0;
      }
      .br-summary {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin: 4px 0;
      }
      .br-warning-text {
        margin-top: 4px;
      }
    `}};r([he()],jl.prototype,"narrow",void 0),r([he()],jl.prototype,"path",void 0),r([ve()],jl.prototype,"_busy",void 0),r([ve()],jl.prototype,"_error",void 0),r([ve()],jl.prototype,"_message",void 0),r([ve()],jl.prototype,"_pending",void 0),r([ve()],jl.prototype,"_pendingName",void 0),jl=r([me("smart-irrigation-view-backuprestore")],jl);let Sl=class extends(Ca(ce)){constructor(){super(...arguments),this.zones=[],this.isLoading=!0,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}firstUpdated(){_e().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:je+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[a,t,i]=await Promise.all([Ma(this.hass),(e=this.hass,e.callWS({type:je+"/info"})),Da(this.hass)]);this.config=a,this.info=t,this.zones=i}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._scheduleUpdate()}}render(){return this.hass?this.isLoading?q`
        <ha-card header="${Bo("panels.info.title",this.hass.language)}">
          <div class="card-content">
            ${Bo("common.loading",this.hass.language)}...
          </div>
        </ha-card>
      `:this.config?q`
      <ha-card header="${Bo("panels.info.title",this.hass.language)}">
        <div class="card-content">
          ${Bo("panels.info.description",this.hass.language)}
        </div>
      </ha-card>

      ${this.renderZoneBucketsCard()} ${this.renderNextIrrigationCard()}
      ${this.renderIrrigationReasonCard()}
    `:q`
        <ha-card header="${Bo("panels.info.title",this.hass.language)}">
          <div class="card-content">
            ${Bo("panels.info.configuration-not-available",this.hass.language)}
          </div>
        </ha-card>
      `:q``}renderZoneBucketsCard(){if(!this.hass)return q``;if(!this.zones||0===this.zones.length)return q`
        <ha-card
          header="${Bo("panels.info.cards.zone-bucket-values.title",this.hass.language)}"
        >
          <div class="card-content">
            <div class="info-item">
              <span class="value"
                >${Bo("panels.info.cards.zone-bucket-values.no-zones",this.hass.language)}</span
              >
            </div>
          </div>
        </ha-card>
      `;const e=this.config?$a(this.config,ma):"mm";return q`
      <ha-card
        header="${Bo("panels.info.cards.zone-bucket-values.title",this.hass.language)}"
      >
        <div class="card-content">
          ${this.zones.map((a=>{var t,i,n,r,s,o,l,d;return q`
              <div class="zone-info">
                <div class="zone-header">
                  <label class="zone-name">${a.name}</label>
                </div>
                <div class="zone-details">
                  <div class="zone-bucket">
                    <span class="label"
                      >${Bo("panels.info.cards.zone-bucket-values.labels.bucket",null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en")}:</span
                    >
                    <span class="value">
                      ${Number(a.bucket).toFixed(1)} ${e}
                    </span>
                  </div>
                  <div class="zone-duration">
                    <span class="label"
                      >${Bo("panels.info.cards.zone-bucket-values.labels.duration",null!==(r=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==r?r:"en")}:</span
                    >
                    <span class="value">
                      ${a.duration?`${Math.round(a.duration)} ${Bo("common.units.seconds",null!==(o=null===(s=this.hass)||void 0===s?void 0:s.language)&&void 0!==o?o:"en")}`:`0 ${Bo("common.units.seconds",null!==(d=null===(l=this.hass)||void 0===l?void 0:l.language)&&void 0!==d?d:"en")}`}
                    </span>
                  </div>
                </div>
              </div>
            `}))}
        </div>
      </ha-card>
    `}renderNextIrrigationCard(){var e,a,t,i,n,r,s,o;return this.hass&&this.info?q`
      <ha-card
        header="${Bo("panels.info.cards.next-irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${Bo("panels.info.cards.next-irrigation.labels.next-start",this.hass.language)}:</label
            >
            <span class="value">
              ${this.info.next_irrigation_start?yl(this.info.next_irrigation_start).format("YYYY-MM-DD HH:mm:ss"):Bo("panels.info.cards.next-irrigation.no-data",this.hass.language)}
            </span>
          </div>

          ${this.info.next_irrigation_duration?q`
                <div class="info-item">
                  <label
                    >${Bo("panels.info.cards.next-irrigation.labels.duration",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_duration}
                    ${Bo("common.units.seconds",this.hass.language)}</span
                  >
                </div>
              `:""}
          ${this.info.next_irrigation_zones&&this.info.next_irrigation_zones.length>0?q`
                <div class="info-item">
                  <label
                    >${Bo("panels.info.cards.next-irrigation.labels.zones",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_zones.join(", ")}</span
                  >
                </div>
              `:""}
        </div>
      </ha-card>
    `:q`
        <ha-card
          header="${Bo("panels.info.cards.next-irrigation.title",null!==(a=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==a?a:"en")}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${Bo("panels.info.cards.next-irrigation.labels.next-start",null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en")}:</label
              >
              <span class="value">
                ${Bo("panels.info.cards.next-irrigation.no-data",null!==(r=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==r?r:"en")}
              </span>
            </div>
            <div class="info-note">
              ${Bo("panels.info.cards.next-irrigation.backend-todo",null!==(o=null===(s=this.hass)||void 0===s?void 0:s.language)&&void 0!==o?o:"en")}
            </div>
          </div>
        </ha-card>
      `}renderIrrigationReasonCard(){var e,a,t,i,n,r,s,o;return this.hass&&this.info?q`
      <ha-card
        header="${Bo("panels.info.cards.irrigation-reason.title",this.hass.language)}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${Bo("panels.info.cards.irrigation-reason.labels.reason",this.hass.language)}:</label
            >
            <span class="value">
              ${this.info.irrigation_reason||Bo("panels.info.cards.irrigation-reason.no-data",this.hass.language)}
            </span>
          </div>

          ${this.info.sunrise_time?q`
                <div class="info-item">
                  <label
                    >${Bo("panels.info.cards.irrigation-reason.labels.sunrise",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${yl(this.info.sunrise_time).format("HH:mm:ss")}</span
                  >
                </div>
              `:""}
          ${void 0!==this.info.total_irrigation_duration?q`
                <div class="info-item">
                  <label
                    >${Bo("panels.info.cards.irrigation-reason.labels.total-duration",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.total_irrigation_duration}
                    ${Bo("common.units.seconds",this.hass.language)}</span
                  >
                </div>
              `:""}
          ${this.info.irrigation_explanation?q`
                <div class="info-item explanation">
                  <label
                    >${Bo("panels.info.cards.irrigation-reason.labels.explanation",this.hass.language)}:</label
                  >
                  <div class="explanation-text">
                    ${this.info.irrigation_explanation}
                  </div>
                </div>
              `:""}
        </div>
      </ha-card>
    `:q`
        <ha-card
          header="${Bo("panels.info.cards.irrigation-reason.title",null!==(a=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==a?a:"en")}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${Bo("panels.info.cards.irrigation-reason.labels.reason",null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en")}:</label
              >
              <span class="value">
                ${Bo("panels.info.cards.irrigation-reason.no-data",null!==(r=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==r?r:"en")}
              </span>
            </div>
            <div class="info-note">
              ${Bo("panels.info.cards.irrigation-reason.backend-todo",null!==(o=null===(s=this.hass)||void 0===s?void 0:s.language)&&void 0!==o?o:"en")}
            </div>
          </div>
        </ha-card>
      `}static get styles(){return p`
      ${Qo} ${al}

      /* Align the Info view with the shared modern look used on the other
         pages: each zone is a sub-group (heading + rows), and every label/value
         line matches .setting-row / .setting-label typography and spacing. */
      .card-content {
        display: flex;
        flex-direction: column;
      }

      /* each zone reads as a section, like .si-subgroup elsewhere */
      .zone-info {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .zone-info:last-child {
        border-bottom: 0;
      }
      .zone-header {
        margin-bottom: 4px;
      }
      .zone-name {
        font-size: 1.05em;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      /* a zone's bucket + duration: compact, left-aligned label:value pairs
         that sit next to each other and wrap as a whole (never mid-value),
         using the free space instead of cramming to the right. */
      .zone-details {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 28px;
        margin-top: 2px;
      }
      .zone-bucket,
      .zone-duration {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
      }
      .zone-bucket .label,
      .zone-duration .label {
        color: var(--secondary-text-color);
      }
      .zone-bucket .value,
      .zone-duration .value {
        color: var(--primary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      /* single label/value rows in the other cards (next irrigation, reason):
         label left, value right, like a .setting-row */
      .info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 44px;
        padding: 2px 0;
      }
      .info-item label {
        color: var(--secondary-text-color);
      }
      .info-item .value {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .info-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 8px;
      }
    `}};r([he()],Sl.prototype,"config",void 0),r([he({type:Object})],Sl.prototype,"info",void 0),r([he({type:Array})],Sl.prototype,"zones",void 0),r([he({type:Boolean})],Sl.prototype,"isLoading",void 0),Sl=r([me("smart-irrigation-view-info")],Sl);const Al=Qo,$l=()=>{const e=e=>{let a={};for(let t=0;t<e.length;t+=2){const i=e[t],n=t<e.length?e[t+1]:void 0;a=Object.assign(Object.assign({},a),{[i]:n})}return a},a=window.location.pathname.split("/");let t={page:a[2]||"general",params:{}};if(a.length>3){let i=a.slice(3);if(a.includes("filter")){const a=i.findIndex((e=>"filter"==e)),n=i.slice(a+1);i=i.slice(0,a),t=Object.assign(Object.assign({},t),{filter:e(n)})}i.length&&(i.length%2&&(t=Object.assign(Object.assign({},t),{subpage:i.shift()})),i.length&&(t=Object.assign(Object.assign({},t),{params:e(i)})))}return t},El=(e,...a)=>{let t={page:e,params:{}};a.forEach((e=>{"string"==typeof e?t=Object.assign(Object.assign({},t),{subpage:e}):"params"in e?t=Object.assign(Object.assign({},t),{params:e.params}):"filter"in e&&(t=Object.assign(Object.assign({},t),{filter:e.filter}))}));const i=e=>{let a=Object.keys(e);a=a.filter((a=>e[a])),a.sort();let t="";return a.forEach((a=>{const i=e[a];t=t.length?`${t}/${a}/${i}`:`${a}/${i}`})),t};let n=`/${je}/${t.page}`;return t.subpage&&(n=`${n}/${t.subpage}`),i(t.params).length&&(n=`${n}/${i(t.params)}`),t.filter&&(n=`${n}/filter/${i(t.filter)}`),n};var Tl;!function(e){e.Info="info",e.General="general",e.Zones="zones",e.Modules="modules",e.Mappings="mappings",e.WeatherService="weatherservice",e.BackupRestore="backuprestore",e.Help="help"}(Tl||(Tl={})),e.SmartIrrigationPanel=class extends ce{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}async firstUpdated(){const e=$l();e.page&&Object.values(Tl).includes(e.page)?(window.addEventListener("location-changed",(()=>{if(!window.location.pathname.includes("smart_irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())})),_e().then((()=>{this._scheduleUpdate()})).catch((e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()}))):Ta(0,El(Tl.General))}render(){const e=$l(),a=!!customElements.get("ha-tab-group"),t=!!customElements.get("ha-tab-group-tab");return q`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Bo("title",this.hass.language)}</div>
          <div class="version">${"v2026.7.0-beta2"}</div>
        </div>

        ${a&&t?q`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${Object.values(Tl).map((a=>q`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${a}"
                      .active=${e.page===a}
                    >
                      ${Bo(`panels.${a}.title`,this.hass.language)}
                    </ha-tab-group-tab>
                  `))}
              </ha-tab-group>
            `:q`
              <div class="custom-tabs">
                ${Object.values(Tl).map((a=>q`
                    <button
                      class="custom-tab ${e.page===a?"active":""}"
                      @click=${()=>this.navigateToPage(a)}
                    >
                      ${Bo(`panels.${a}.title`,this.hass.language)}
                    </button>
                  `))}
              </div>
            `}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}getView(e){switch(e.page){case"info":return q`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-info>
        `;case"general":return q`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-general>
        `;case"zones":return q`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-zones>
        `;case"modules":return q`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-modules>
        `;case"mappings":return q`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-mappings>
        `;case"weatherservice":return q`
          <smart-irrigation-view-weatherservice
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-weatherservice>
        `;case"backuprestore":return q`
          <smart-irrigation-view-backuprestore
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-backuprestore>
        `;case"help":return q`<ha-card
          header="${Bo("panels.help.cards.how-to-get-help.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Bo("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
            <a href="https://altmenorg.github.io/HAsmartirrigation/"
              >${Bo("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
            >.
            ${Bo("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${Bo("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
            >
            ${Bo("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
            <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
              >${Bo("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
            >
            (${Bo("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
          </div></ha-card
        >`;default:return q`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}navigateToPage(e){if(e!==$l().page){const a=El(e);Ta(0,a),this.requestUpdate()}else scrollTo(0,0)}handlePageSelected(e){const a=e.detail.name;if(a!==$l().page){const e=El(a);Ta(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[Al,p`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
        }
        .header {
          background-color: var(--app-header-background-color);
          color: var(--app-header-text-color, white);
          border-bottom: var(--app-header-border-bottom, none);
        }
        .toolbar {
          height: var(--header-height);
          display: flex;
          align-items: center;
          font-size: 20px;
          padding: 0 16px;
          font-weight: 400;
          box-sizing: border-box;
        }
        .main-title {
          margin: 0 0 0 24px;
          line-height: 20px;
          flex-grow: 1;
        }
        ha-tab-group {
          margin-left: max(env(safe-area-inset-left), 24px);
          margin-right: max(env(safe-area-inset-right), 24px);
          --ha-tab-active-text-color: var(--app-header-text-color, white);
          --ha-tab-indicator-color: var(--app-header-text-color, white);
          --ha-tab-track-color: transparent;
        }

        .custom-tabs {
          display: flex;
          margin-left: max(env(safe-area-inset-left), 24px);
          margin-right: max(env(safe-area-inset-right), 24px);
          border-bottom: 1px solid
            rgba(
              var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
              0.12
            );
          overflow-x: auto;
        }

        .custom-tab {
          background: transparent;
          border: none;
          color: rgba(
            var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
            0.7
          );
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          line-height: 48px;
          margin: 0;
          min-width: 72px;
          outline: none;
          padding: 0 12px;
          position: relative;
          text-transform: uppercase;
          transition: color 0.15s ease-in-out;
          white-space: nowrap;
          letter-spacing: 0.1em;
        }

        .custom-tab:hover {
          color: var(--app-header-text-color, white);
          background-color: rgba(
            var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
            0.04
          );
        }

        .custom-tab.active {
          color: var(--app-header-text-color, white);
        }

        .custom-tab.active::after {
          background-color: var(--app-header-text-color, white);
          bottom: 0;
          content: "";
          height: 2px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .view {
          height: calc(100vh - 112px);
          display: flex;
          justify-content: center;
          overflow-y: auto;
        }

        .view > * {
          width: 100%;
          max-width: 1100px;
        }

        .view > *:last-child {
          margin-bottom: 20px;
        }

        .version {
          font-size: 14px;
          font-weight: 500;
          color: rgba(var(--rgb-text-primary-color), 0.9);
        }
      `]}},r([he({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),r([he({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),e.SmartIrrigationPanel=r([me("smart-irrigation")],e.SmartIrrigationPanel);let Ml=class extends ce{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?q`
      <ha-dialog
        open
        .heading=${!0}
        @closed=${this.closeDialog}
        @close-dialog=${this.closeDialog}
      >
        <div slot="heading">
          <ha-header-bar>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .path=${Vo}
            ></ha-icon-button>
            <span class="errortitle" slot="title">
              ${this.hass.localize("state_badge.default.error")}
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._params.error||""}</div>

        <ha-dialog-footer slot="footer">
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this.closeDialog}
            dialogAction="close"
          >
            ${this.hass.localize("ui.dialogs.generic.ok")}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `:q``}static get styles(){return p`
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.errortitle {
        font-size: 2em;
        font-weight: bold;
        vertical-align: bottom;
      }
    `}};r([he({attribute:!1})],Ml.prototype,"hass",void 0),r([ve()],Ml.prototype,"_params",void 0),Ml=r([me("smart-irrigation-error-dialog")],Ml);var Dl=Object.freeze({__proto__:null,get ErrorDialog(){return Ml}})}({});
//# sourceMappingURL=smart-irrigation.js.map
