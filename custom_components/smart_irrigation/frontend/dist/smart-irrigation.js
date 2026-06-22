!function(e){"use strict";var t=function(e,a){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var a in t)Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a])},t(e,a)};function a(e,a){if("function"!=typeof a&&null!==a)throw new TypeError("Class extends value "+String(a)+" is not a constructor or null");function i(){this.constructor=e}t(e,a),e.prototype=null===a?Object.create(a):(i.prototype=a.prototype,new i)}var i=function(){return i=Object.assign||function(e){for(var t,a=1,i=arguments.length;a<i;a++)for(var n in t=arguments[a])Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e},i.apply(this,arguments)};function n(e,t){var a={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(a[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(i=Object.getOwnPropertySymbols(e);n<i.length;n++)t.indexOf(i[n])<0&&Object.prototype.propertyIsEnumerable.call(e,i[n])&&(a[i[n]]=e[i[n]])}return a}function s(e,t,a,i){var n,s=arguments.length,r=s<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,a):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,a,i);else for(var o=e.length-1;o>=0;o--)(n=e[o])&&(r=(s<3?n(r):s>3?n(t,a,r):n(t,a))||r);return s>3&&r&&Object.defineProperty(t,a,r),r}function r(e,t,a){if(a||2===arguments.length)for(var i,n=0,s=t.length;n<s;n++)!i&&n in t||(i||(i=Array.prototype.slice.call(t,0,n)),i[n]=t[n]);return e.concat(i||Array.prototype.slice.call(t))}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const o=window,l=o.ShadowRoot&&(void 0===o.ShadyCSS||o.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,d=Symbol(),u=new WeakMap;class c{constructor(e,t,a){if(this._$cssResult$=!0,a!==d)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(l&&void 0===e){const a=void 0!==t&&1===t.length;a&&(e=u.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),a&&u.set(t,e))}return e}toString(){return this.cssText}}const h=(e,...t)=>{const a=1===e.length?e[0]:t.reduce(((t,a,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+e[i+1]),e[0]);return new c(a,e,d)},p=l?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const a of e.cssRules)t+=a.cssText;return(e=>new c("string"==typeof e?e:e+"",void 0,d))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var g;const m=window,f=m.trustedTypes,v=f?f.emptyScript:"",b=m.reactiveElementPolyfillSupport,_={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let a=e;switch(t){case Boolean:a=null!==e;break;case Number:a=null===e?null:Number(e);break;case Object:case Array:try{a=JSON.parse(e)}catch(e){a=null}}return a}},y=(e,t)=>t!==e&&(t==t||e==e),w={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:y},x="finalized";class k extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,a)=>{const i=this._$Ep(a,t);void 0!==i&&(this._$Ev.set(i,a),e.push(i))})),e}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const a="symbol"==typeof e?Symbol():"__"+e,i=this.getPropertyDescriptor(e,a,t);void 0!==i&&Object.defineProperty(this.prototype,e,i)}}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(i){const n=this[e];this[t]=i,this.requestUpdate(e,n,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||w}static finalize(){if(this.hasOwnProperty(x))return!1;this[x]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const a of t)this.createProperty(a,e[a])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const a=new Set(e.flat(1/0).reverse());for(const e of a)t.unshift(p(e))}else void 0!==e&&t.push(p(e));return t}static _$Ep(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,a;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(a=e.hostConnected)||void 0===a||a.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{l?e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((t=>{const a=document.createElement("style"),i=o.litNonce;void 0!==i&&a.setAttribute("nonce",i),a.textContent=t.cssText,e.appendChild(a)}))})(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,a){this._$AK(e,a)}_$EO(e,t,a=w){var i;const n=this.constructor._$Ep(e,a);if(void 0!==n&&!0===a.reflect){const s=(void 0!==(null===(i=a.converter)||void 0===i?void 0:i.toAttribute)?a.converter:_).toAttribute(t,a.type);this._$El=e,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$El=null}}_$AK(e,t){var a;const i=this.constructor,n=i._$Ev.get(e);if(void 0!==n&&this._$El!==n){const e=i.getPropertyOptions(n),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(a=e.converter)||void 0===a?void 0:a.fromAttribute)?e.converter:_;this._$El=n,this[n]=s.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,a){let i=!0;void 0!==e&&(((a=a||this.constructor.getPropertyOptions(e)).hasChanged||y)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===a.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,a))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const a=this._$AL;try{t=this.shouldUpdate(a),t?(this.willUpdate(a),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(a)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(a)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var $;k[x]=!0,k.elementProperties=new Map,k.elementStyles=[],k.shadowRootOptions={mode:"open"},null==b||b({ReactiveElement:k}),(null!==(g=m.reactiveElementVersions)&&void 0!==g?g:m.reactiveElementVersions=[]).push("1.6.3");const S=window,z=S.trustedTypes,A=z?z.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",T=`lit$${(Math.random()+"").slice(9)}$`,M="?"+T,D=`<${M}>`,C=document,O=()=>C.createComment(""),H=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,P=e=>N(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]),L="[ \t\n\f\r]",j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,I=/>/g,U=RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,F=/"/g,Y=/^(?:script|style|textarea|title)$/i,V=(e=>(t,...a)=>({_$litType$:e,strings:t,values:a}))(1),W=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),q=new WeakMap,Z=C.createTreeWalker(C,129,null,!1);function K(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const X=(e,t)=>{const a=e.length-1,i=[];let n,s=2===t?"<svg>":"",r=j;for(let t=0;t<a;t++){const a=e[t];let o,l,d=-1,u=0;for(;u<a.length&&(r.lastIndex=u,l=r.exec(a),null!==l);)u=r.lastIndex,r===j?"!--"===l[1]?r=R:void 0!==l[1]?r=I:void 0!==l[2]?(Y.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=U):void 0!==l[3]&&(r=U):r===U?">"===l[0]?(r=null!=n?n:j,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?U:'"'===l[3]?F:B):r===F||r===B?r=U:r===R||r===I?r=j:(r=U,n=void 0);const c=r===U&&e[t+1].startsWith("/>")?" ":"";s+=r===j?a+D:d>=0?(i.push(o),a.slice(0,d)+E+a.slice(d)+T+c):a+T+(-2===d?(i.push(void 0),t):c)}return[K(e,s+(e[a]||"<?>")+(2===t?"</svg>":"")),i]};class J{constructor({strings:e,_$litType$:t},a){let i;this.parts=[];let n=0,s=0;const r=e.length-1,o=this.parts,[l,d]=X(e,t);if(this.el=J.createElement(l,a),Z.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(i=Z.nextNode())&&o.length<r;){if(1===i.nodeType){if(i.hasAttributes()){const e=[];for(const t of i.getAttributeNames())if(t.endsWith(E)||t.startsWith(T)){const a=d[s++];if(e.push(t),void 0!==a){const e=i.getAttribute(a.toLowerCase()+E).split(T),t=/([.?@])?(.*)/.exec(a);o.push({type:1,index:n,name:t[2],strings:e,ctor:"."===t[1]?ie:"?"===t[1]?se:"@"===t[1]?re:ae})}else o.push({type:6,index:n})}for(const t of e)i.removeAttribute(t)}if(Y.test(i.tagName)){const e=i.textContent.split(T),t=e.length-1;if(t>0){i.textContent=z?z.emptyScript:"";for(let a=0;a<t;a++)i.append(e[a],O()),Z.nextNode(),o.push({type:2,index:++n});i.append(e[t],O())}}}else if(8===i.nodeType)if(i.data===M)o.push({type:2,index:n});else{let e=-1;for(;-1!==(e=i.data.indexOf(T,e+1));)o.push({type:7,index:n}),e+=T.length-1}n++}}static createElement(e,t){const a=C.createElement("template");return a.innerHTML=e,a}}function Q(e,t,a=e,i){var n,s,r,o;if(t===W)return t;let l=void 0!==i?null===(n=a._$Co)||void 0===n?void 0:n[i]:a._$Cl;const d=H(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==d&&(null===(s=null==l?void 0:l._$AO)||void 0===s||s.call(l,!1),void 0===d?l=void 0:(l=new d(e),l._$AT(e,a,i)),void 0!==i?(null!==(r=(o=a)._$Co)&&void 0!==r?r:o._$Co=[])[i]=l:a._$Cl=l),void 0!==l&&(t=Q(e,l._$AS(e,t.values),l,i)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:a},parts:i}=this._$AD,n=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:C).importNode(a,!0);Z.currentNode=n;let s=Z.nextNode(),r=0,o=0,l=i[0];for(;void 0!==l;){if(r===l.index){let t;2===l.type?t=new te(s,s.nextSibling,this,e):1===l.type?t=new l.ctor(s,l.name,l.strings,this,e):6===l.type&&(t=new oe(s,this,e)),this._$AV.push(t),l=i[++o]}r!==(null==l?void 0:l.index)&&(s=Z.nextNode(),r++)}return Z.currentNode=C,n}v(e){let t=0;for(const a of this._$AV)void 0!==a&&(void 0!==a.strings?(a._$AI(e,a,t),t+=a.strings.length-2):a._$AI(e[t])),t++}}class te{constructor(e,t,a,i){var n;this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=a,this.options=i,this._$Cp=null===(n=null==i?void 0:i.isConnected)||void 0===n||n}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),H(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==W&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):P(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==G&&H(this._$AH)?this._$AA.nextSibling.data=e:this.$(C.createTextNode(e)),this._$AH=e}g(e){var t;const{values:a,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(K(i.h,i.h[0]),this.options)),i);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===n)this._$AH.v(a);else{const e=new ee(n,this),t=e.u(this.options);e.v(a),this.$(t),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new J(e)),t}T(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let a,i=0;for(const n of e)i===t.length?t.push(a=new te(this.k(O()),this.k(O()),this,this.options)):a=t[i],a._$AI(n),i++;i<t.length&&(this._$AR(a&&a._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){var a;for(null===(a=this._$AP)||void 0===a||a.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class ae{constructor(e,t,a,i,n){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,a.length>2||""!==a[0]||""!==a[1]?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=G}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,a,i){const n=this.strings;let s=!1;if(void 0===n)e=Q(this,e,t,0),s=!H(e)||e!==this._$AH&&e!==W,s&&(this._$AH=e);else{const i=e;let r,o;for(e=n[0],r=0;r<n.length-1;r++)o=Q(this,i[a+r],t,r),o===W&&(o=this._$AH[r]),s||(s=!H(o)||o!==this._$AH[r]),o===G?e=G:e!==G&&(e+=(null!=o?o:"")+n[r+1]),this._$AH[r]=o}s&&!i&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class ie extends ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}const ne=z?z.emptyScript:"";class se extends ae{constructor(){super(...arguments),this.type=4}j(e){e&&e!==G?this.element.setAttribute(this.name,ne):this.element.removeAttribute(this.name)}}class re extends ae{constructor(e,t,a,i,n){super(e,t,a,i,n),this.type=5}_$AI(e,t=this){var a;if((e=null!==(a=Q(this,e,t,0))&&void 0!==a?a:G)===W)return;const i=this._$AH,n=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==G&&(i===G||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,a;"function"==typeof this._$AH?this._$AH.call(null!==(a=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==a?a:this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const le={O:E,P:T,A:M,C:1,M:X,L:ee,R:P,D:Q,I:te,V:ae,H:se,N:re,U:ie,F:oe},de=S.litHtmlPolyfillSupport;null==de||de(J,te),(null!==($=S.litHtmlVersions)&&void 0!==$?$:S.litHtmlVersions=[]).push("2.8.0");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var ue,ce;class he extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const a=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=a.firstChild),a}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,a)=>{var i,n;const s=null!==(i=null==a?void 0:a.renderBefore)&&void 0!==i?i:t;let r=s._$litPart$;if(void 0===r){const e=null!==(n=null==a?void 0:a.renderBefore)&&void 0!==n?n:null;s._$litPart$=r=new te(t.insertBefore(O(),e),e,void 0,null!=a?a:{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return W}}he.finalized=!0,he._$litElement$=!0,null===(ue=globalThis.litElementHydrateSupport)||void 0===ue||ue.call(globalThis,{LitElement:he});const pe=globalThis.litElementPolyfillSupport;null==pe||pe({LitElement:he}),(null!==(ce=globalThis.litElementVersions)&&void 0!==ce?ce:globalThis.litElementVersions=[]).push("3.3.3");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ge=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:a,elements:i}=t;return{kind:a,elements:i,finisher(t){customElements.define(e,t)}}})(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,me=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(a){a.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(a){a.createProperty(t.key,e)}};function fe(e){return(t,a)=>void 0!==a?((e,t,a)=>{t.constructor.createProperty(a,e)})(e,t,a):me(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function ve(e){return fe({...e,state:!0})}
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
function be(e,t){return(({finisher:e,descriptor:t})=>(a,i)=>{var n;if(void 0===i){const i=null!==(n=a.originalKey)&&void 0!==n?n:a.key,s=null!=t?{kind:"method",placement:"prototype",key:i,descriptor:t(a.key)}:{...a,key:i};return null!=e&&(s.finisher=function(t){e(t,i)}),s}{const n=a.constructor;void 0!==t&&Object.defineProperty(a,i,t(i)),null==e||e(n,i)}})({descriptor:a=>{const i={get(){var t,a;return null!==(a=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e))&&void 0!==a?a:null},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof a?Symbol():"__"+a;i.get=function(){var a,i;return void 0===this[t]&&(this[t]=null!==(i=null===(a=this.renderRoot)||void 0===a?void 0:a.querySelector(e))&&void 0!==i?i:null),this[t]}}return i}})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var _e;null===(_e=window.HTMLSlotElement)||void 0===_e||_e.prototype.assignedElements;let ye=!1,we=null;const xe=async()=>{if(ye&&we)return we;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();ye=!0,we=async function(){try{await new Promise((e=>{"requestIdleCallback"in window?requestIdleCallback((()=>e())):setTimeout((()=>e()),0)})),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),t=document.createElement("partial-panel-resolver");e.appendChild(t),t.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise((e=>queueMicrotask((()=>e())))),t._updateRoutes(),await t.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise((e=>queueMicrotask((()=>e()))));const a=document.createElement("ha-panel-config");e.appendChild(a),await a.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await we}finally{ye=!1,we=null}};var ke,$e;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ke||(ke={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}($e||($e={}));var Se=function(e,t,a,i){i=i||{},a=null==a?{}:a;var n=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return n.detail=a,e.dispatchEvent(n),n};const ze="smart_irrigation",Ae="precipitation_threshold_mm",Ee="irrigation_start_triggers",Te="sunrise",Me="solar_azimuth",De="minutes",Ce="hours",Oe="days",He="imperial",Ne="metric",Pe="Dewpoint",Le="Evapotranspiration",je="Humidity",Re="Precipitation",Ie="Current Precipitation",Ue="Pressure",Be="Solar Radiation",Fe="Temperature",Ye="Windspeed",Ve="weather_service",We="sensor",Ge="static",qe="pressure_type",Ze="absolute",Ke="relative",Xe="none",Je="source",Qe="sensorentity",et="static_value",tt="unit",at="aggregate",it=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],nt="mm/h",st="in/h",rt="name",ot="size",lt="throughput",dt="state",ut="duration",ct="module",ht="bucket",pt="multiplier",gt="mapping",mt="lead_time",ft="maximum_duration",vt="maximum_bucket",bt="drainage_rate",_t=2,yt=e=>(...t)=>({_$litDirective$:e,values:t});class wt{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,a){this._$Ct=e,this._$AM=t,this._$Ci=a}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class xt extends wt{constructor(e){if(super(e),this.et=G,e.type!==_t)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===G||null==e)return this.ft=void 0,this.et=e;if(e===W)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}}xt.directiveName="unsafeHTML",xt.resultType=1;const kt=yt(xt);function $t(e,t){return(e=e.toString()).split(",")[t]}function St(e,t){switch(t){case bt:return e.units==Ne?V`${kt(nt)}`:V`${kt(st)}`;case Ae:case ht:return e.units==Ne?V`${kt("mm")}`:V`${kt("in")}`;case ot:return e.units==Ne?V`${kt("m<sup>2</sup>")}`:V`${kt("sq ft")}`;case lt:return e.units==Ne?V`${kt("l/minute")}`:V`${kt("gal/minute")}`;default:return V``}}function zt(e,t){!function(e,t){Se(e,"show-dialog",{dialogTag:"error-dialog",dialogImport:()=>Promise.resolve().then((function(){return xs})),dialogParams:{error:t}})}(t,V`
    ${e.error}:${e.body.message?V` ${e.body.message} `:""}
  `)}const At=(e,t,a=!1)=>{a?history.replaceState(null,"",t):history.pushState(null,"",t),Se(window,"location-changed",{replace:a})},Et=e=>e.callWS({type:ze+"/config"}),Tt=e=>e.callWS({type:ze+"/zones"}),Mt=e=>e.callWS({type:ze+"/modules"}),Dt=e=>e.callWS({type:ze+"/mappings"}),Ct=(e,t,a=10)=>e.callWS({type:ze+"/weather_records",mapping_id:t,limit:a}),Ot=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return s([fe({attribute:!1})],t.prototype,"hass",void 0),t};var Ht={actions:{delete:"Lösche"},labels:{module:"Modul",no:"Nein",select:"Wähle",yes:"Ja"},attributes:{size:"Größe",throughput:"Durchfluss",state:"Zustand"}},Nt={"default-zone":"Standard Zone","default-mapping":"Standard Sensorgruppe"},Pt={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Beachte: Diese Beschreibung nutzt '.' als Dezimalzeichen und zeigt gerundete Werte. Das Modul berechnete einen Evapotranspirationsmangel von","bucket-was":"Der alte Vorrat war","new-bucket-values-is":"Der neue Vorrat ist","old-bucket-variable":"alter_Vorrat",delta:"Veränderung","bucket-less-than-zero-irrigation-necessary":"Wenn der Vorrat < 0 ist, ist eine Bewässerung nötig.","steps-taken-to-calculate-duration":"Für eine exakte Berechnung der Dauer, wurden folgende Schritte durchgeführt","precipitation-rate-defined-as":"Der Niederschlag ist","duration-is-calculated-as":"Die Dauer ist",bucket:"Vorrat","precipitation-rate-variable":"Niederschlag","multiplier-is-applied":"Der Multiplikator wird angewendet. Der Multiplikator ist","duration-after-multiplier-is":"also ist die Dauer","maximum-duration-is-applied":"Die maximale Dauer wird angewendet. Diese ist","duration-after-maximum-duration-is":"also ist die Dauer","lead-time-is-applied":"Zuletzt wird die Vorlaufzeit angewendet. Die Vorlaufzeit ist","duration-after-lead-time-is":"also ist die Dauer","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Wenn der Vorrat >= 0 ist, ist keine Bewässerung nötig und die Dauer ist gleich","maximum-bucket-is":"Der maximale Vorrat ist"}}},Lt={pyeto:{description:"Die Berechnung der Verunstungsrate basiert auf der FAO56-Formel aus der PyETO-Bibliothek"},static:{description:"Modul mit einer statisch konfigurierbaren Verdunstungsrate."},passthrough:{description:"Pass Through übernimmt den Evapotranspirationssensor und gibt seinen Wert zurück. Auf diese Weise werden alle Berechnungen der Verdunstung umgangen, außer der Anwendung von Aggregaten wie Summe, Durchschnitt etc)."}},jt={general:{cards:{"automatic-duration-calculation":{header:"Automatische Berechnung der Bewässerungsdauer",description:"Die Berechnung berücksichtigt die bis zu diesem Zeitpunkt gesammelten Wetterdaten und aktualisiert den Vorrat für jede automatische Zone. Anschließend wird die Dauer basierend auf dem neuen Vorrat angepasst und die gesammelten Wetterdaten entfernt.",labels:{"auto-calc-enabled":"Automatische Berechnung der Dauer pro Zone","auto-calc-time":"Berechne um"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungsdauer"},header:"Automatische Aktualisierung der Wetterdaten",description:"Die Wetterdaten werden automatisch gesammelt und gespeichert. Zur Berechnung der Zonen und Bewässerungsdauer sind Wetterdaten erforderlich.",labels:{"auto-update-enabled":"Automatisches Update der Wetterdaten","auto-update-delay":"Update Verzögerung","auto-update-interval":"Update der Sensordaten alle"},options:{days:"Tage",hours:"Stunden",minutes:"Minuten"}},"automatic-clear":{header:"Automatisches Löschen der Wetterdaten",description:"Gesammelte Wetterdaten zu einem bestimmten Zeitpunkt automatisch entfernen. Damit wird sicher gestellt, dass keine Wetterdaten von vergangenen Tagen übrig bleiben. Entferne die Wetterdaten nicht vor der Berechnung und verwende diese Option nur, wenn du erwartest, dass das automatische Update Wetterdaten erfasst hat, nachdem der Tag berechnet wurde. Idealerweise sollte dieser Schnitt so spät wie möglich Tag durchgeführt werden.",labels:{"automatic-clear-enabled":"Automatisches Löschen der Wetterdaten","automatic-clear-time":"Löschen der Wetterdaten um"}}},description:"Diese Seite ist für allgemeine Einstellungen.",title:"Allgemein"},help:{title:"Hilfe",cards:{"how-to-get-help":{title:"Hilfe bekommen","first-read-the":"Lies zuerst im",wiki:"Wiki","if-you-still-need-help":"Benötigst du weiterhin Hilfe, wende dich an das","community-forum":"Community Forum","or-open-a":"oder eröffne einen","github-issue":"Github Issue","english-only":"nur Englisch"}}},mappings:{cards:{"add-mapping":{actions:{add:"Hinzufügen"},header:"Sensorgruppe hinzufügen"},mapping:{aggregates:{average:"Durchschnitt",first:"Erster",last:"Letzter",maximum:"Maximum",median:"Median",minimum:"Minimum",sum:"Summe"},errors:{"cannot-delete-mapping-because-zones-use-it":"Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird."},items:{dewpoint:"Taupunkt",evapotranspiration:"Verdunstung",humidity:"Feuchtigkeit","maximum temperature":"Maximum-Temperatur","minimum temperature":"Minimum-Temperatur",precipitation:"Gesamtniederschlag",pressure:"Luftdruck","solar radiation":"Sonnenstrahlung",temperature:"Temperatur",windspeed:"Windgeschwindigkeit"},pressure_types:{absolute:"absolut",relative:"relativ"},"pressure-type":"Der Luftdruck ist","sensor-aggregate-of-sensor-values-to-calculate":"des Sensors für die Berechnung.","sensor-aggregate-use-the":"Nutze den/die/das","sensor-entity":"Sensor Entität",static_value:"Wert","input-units":"Sensor Werte in",source:"Quelle",sources:{none:"Keine",weather_service:"Weather service",sensor:"Sensor",static:"Fester Wert"}}},description:"Füge eine oder mehrere Sensorgruppen hinzu, die Wetterdaten von Weather service, Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",labels:{"mapping-name":"Name"},no_items:"Es ist noch keine Sensorgruppe angelegt.",title:"Sensorgruppen"},modules:{cards:{"add-module":{actions:{add:"Hinzufügen"},header:"Modul hinzufügen"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird."},labels:{configuration:"Konfiguration",required:"Feld ist erforderlich"},"translated-options":{DontEstimate:"Nicht berechnen",EstimateFromSunHours:"Basierend auf den Sonnenstunden",EstimateFromTemp:"Basierend auf der Temperatur",EstimateFromSunHoursAndTemperature:"Basierend auf dem Durchschnitt von Sonnenstunden und Temperatur"}}},description:"Füge ein oder mehrere Module hinzu. Module berechnen die Bewässerungsdauer. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungsdauer für eine oder mehrere Zonen verwendet werden.",no_items:"Es ist noch kein Module angelegt.",title:"Module"},zones:{actions:{add:"Hinzufügen",calculate:"Bewässerungsdauer berechnen.",information:"Information",update:"Wetterdaten aktualisieren.","reset-bucket":"Vorrat zurücksetzen"},cards:{"add-zone":{actions:{add:"Hinzufügen"},header:"Zone hinzufügen"},"zone-actions":{actions:{"calculate-all":"Alle Zonen berechnen","update-all":"Alle Zonen aktualisieren","reset-all-buckets":"Alle Vorräte zurücksetzen","clear-all-weatherdata":"Alle Wetterdaten löschen"},header:"Aktionen für alle Zonen"}},description:"Füge eine oder mehrere Zonen hinzu. Die Bewässerungsdauer wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",labels:{bucket:"Vorrat",duration:"Dauer","lead-time":"Vorlaufzeit",mapping:"Sensorgruppe","maximum-duration":"Maximale Dauer",multiplier:"Multiplikator",name:"Name",size:"Größe",state:"Berechnung",states:{automatic:"Automatisch",disabled:"Aus",manual:"Manuell"},throughput:"Durchfluss","maximum-bucket":"Maximaler Vorrat",last_calculated:"Zuletzt berechnet","data-last-updated":"Daten zuletzt aktualisiert","data-number-of-data-points":"Anzahl der Messungen"},no_items:"Es ist noch keine Zone vorhanden.",title:"Zonen"}},Rt="Smart Irrigation",It={title:"Standortkoordinaten",description:"Konfigurieren Sie Standortkoordinaten für den Abruf von Wetterdaten. Sie können manuelle Koordinaten verwenden, die sich von Ihrem Home Assistant Standort unterscheiden.",manual_enabled:"Manuelle Koordinaten verwenden",use_ha_location:"Home Assistant Standort verwenden",latitude:"Breitengrad (Dezimalgrad)",longitude:"Längengrad (Dezimalgrad)",elevation:"Höhe (Meter über dem Meeresspiegel)",current_ha_coords:"Aktuelle Home Assistant Koordinaten"},Ut={title:"Tage zwischen Bewässerungen",description:"Konfigurieren Sie die Mindestanzahl von Tagen, die zwischen Bewässerungsereignissen vergehen müssen. Dies hilft bei der Kontrolle der Bewässerungshäufigkeit für Wassereinsparung und Pflanzengesundheit.\n\nTypische Anwendungsfälle:\n• Rasenpflege: 1-2 Tage Intervalle verhindern Überwässerung\n• Dürrebeschränkungen: 6+ Tage Intervalle für wöchentliche Bewässerung\n• Tiefwurzelnde Pflanzen: 3-7 Tage Intervalle für seltene Bewässerung\n• Wassereinsparung: Anpassbar je nach Klima und Bodenbedingungen",label:"Mindest-Tage zwischen Bewässerungen",help_text:"Setzen Sie auf 0, um diese Funktion zu deaktivieren. Werte von 1-365 Tagen werden unterstützt. Diese Einstellung funktioniert zusammen mit der bestehenden Niederschlagsprognose-Logik."},Bt={common:Ht,defaults:Nt,module:Pt,calcmodules:Lt,panels:jt,title:Rt,coordinate_config:It,days_between_irrigation:Ut},Ft=Object.freeze({__proto__:null,common:Ht,defaults:Nt,module:Pt,calcmodules:Lt,panels:jt,title:Rt,coordinate_config:It,days_between_irrigation:Ut,default:Bt}),Yt={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"bucket",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."}},Vt={"default-zone":"Default zone","default-mapping":"Default sensor group"},Wt={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values. Module returned Evapotranspiration deficiency ( = et0 * hour_multiplier + precipitation) of","bucket-was":"Bucket was","new-bucket-values-is":"New bucket value is",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since bucket < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since bucket >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum bucket size is","drainage-rate-is":"Drainage rate when saturated (bucket at max) is","current-drainage-is":"Current drainage is calculated as","no-drainage":"Current drainage is 0 because"}}},Gt={pyeto:{description:"Calculate duration based on the FAO56 calculation from the PyETO library"},static:{description:"'Dummy' module with a static configurable delta"},passthrough:{description:"Passthrough module that returns the value of an Evapotranspiration sensor as delta"}},qt={weatherservice:{title:"Weather Service",description:"View and change the weather service used to fetch weather data — no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key"},actions:{save:"Save",saving:"Saving…"},messages:{"no-service":"No weather service is used — weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately."}},general:{cards:{"automatic-duration-calculation":{header:"Automatic duration calculation",description:"Calculation takes collected weather data up to that point and updates the bucket for each automatic zone. Then, the duration is adjusted based on the new bucket value and the collected weather data is removed.",labels:{"auto-calc-enabled":"Automatically calculate irrigation durations","calc-time":"Calculate at"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Update sensor data every","auto-update-delay":"Update delay"},options:{minutes:"minutes",hours:"hours",days:"days"}},"automatic-clear":{header:"Automatic weather data pruning",description:"Automatically remove collected weather data at a configured time. Use this to make sure that there is no left over weather data from previous days. Don't remove the weather data before you calculate and only use this option if you expect the automatic update to collect weather data after you calculated for the day. Ideally, you want to prune as late in the day as possible.",labels:{"automatic-clear-enabled":"Automatically clear collected weather data","automatic-clear-time":"Clear weather data at"}},continuousupdates:{header:"Continuous updates for sensors (experimental)",description:"This experimental feature will continuously update the sensor data. This is useful for sensor groups that use sources that provide continuous data, such as weather stations. This feature cannot be used for sensor groups that at least partly rely on weather services as continous polling of APIs will incur costs. Keep in mind that this is experimental and may not work as expected. Use at your own risk.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"}}},info:{title:"Info",description:"View information about next irrigation and system status.","configuration-not-available":"Configuration not available.",cards:{"zone-bucket-values":{title:"Zone Bucket Values & Duration",labels:{bucket:"Bucket",duration:"Duration"},"no-zones":"No zones configured"},"next-irrigation":{title:"Next Irrigation",labels:{"next-start":"Next start",duration:"Duration",zones:"Zones"},"no-data":"No data available"},"irrigation-reason":{title:"Irrigation Reason",labels:{reason:"Reason",sunrise:"Sunrise","total-duration":"Total duration",explanation:"Explanation"},"no-data":"No data available"}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-of-sensor-values-to-calculate":"of sensor values to calculate duration","sensor-aggregate-use-the":"Use the","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",weather_service:"Weather service",sensor:"Sensor",static:"Static value"}}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name"},no_items:"There are no sensor group defined yet.",title:"Sensor Groups","weather-records":{title:"Weather Records (Last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Multiplier",name:"Name",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate"},no_items:"There are no zones defined yet.",title:"Zones"}},Zt="Smart Irrigation",Kt={title:"Irrigation Start Triggers",description:"Configure when irrigation should start based on solar events. You can add multiple triggers for different schedules. For sunrise triggers, leaving offset at 0 will automatically use the total duration of all enabled zones.",add_trigger:"Add Trigger",edit_trigger:"Edit Trigger",delete_trigger:"Delete Trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth"},fields:{name:{name:"Trigger Name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger Type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Offset (minutes)",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth Angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for Duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete"},no_triggers:"No irrigation start triggers configured. The system will use the default behavior (sunrise with total zone duration). Add triggers to customize when irrigation starts.",offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number"},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can configure multiple triggers. Each enabled trigger will independently schedule irrigation starts."}},Xt={title:"Weather-based Irrigation Skip",description:"Automatically skip irrigation when precipitation is forecasted. This feature requires a weather service to be configured.",threshold_label:"Precipitation Threshold",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation."},Jt={title:"Location Coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Qt={title:"Days Between Irrigation",description:"Configure the minimum number of days that must pass between irrigation events. This helps control watering frequency for water conservation and plant health management.\n\nTypical real-world use cases:\n• Lawn care: 1-2 day intervals prevent overwatering\n• Drought restrictions: 6+ day intervals for weekly watering\n• Deep-rooted plants: 3-7 day intervals for less frequent watering\n• Water conservation: Customizable based on climate and soil conditions",label:"Minimum days between irrigation",help_text:"Set to 0 to disable this feature. Values from 1-365 days are supported. This setting works alongside existing precipitation forecasting logic."},ea={common:Yt,defaults:Vt,module:Wt,calcmodules:Gt,panels:qt,title:Zt,irrigation_start_triggers:Kt,weather_skip:Xt,coordinate_config:Jt,days_between_irrigation:Qt},ta=Object.freeze({__proto__:null,common:Yt,defaults:Vt,module:Wt,calcmodules:Gt,panels:qt,title:Zt,irrigation_start_triggers:Kt,weather_skip:Xt,coordinate_config:Jt,days_between_irrigation:Qt,default:ea}),aa={actions:{delete:"Eliminar"},labels:{module:"Módulo",no:"No",select:"Seleccionar",yes:"Sí"},attributes:{size:"Tamaño",throughput:"Rendimiento",state:"Estado"}},ia={"default-zone":"Zona de riego predeterminada","default-mapping":"Grupo de sensores predeterminado"},na={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Nota: esta explicación utiliza '.' como separador decimal y muestra valores redondeados. El módulo devuelve una deficiencia de evapotranspiración de","bucket-was":"El cubo era","new-bucket-values-is":"El nuevo valor del cubo es","old-bucket-variable":"old_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Dado que cubo < 0, el riego es necesario","steps-taken-to-calculate-duration":"Para calcular la duración exacta, se siguieron los siguientes pasos","precipitation-rate-defined-as":"La tasa de precipitación se define como","duration-is-calculated-as":"La duración se calcula como",bucket:"cubo","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"A continuación, se aplica el multiplicador. El multiplicador es","duration-after-multiplier-is":"por lo que la duración es","maximum-duration-is-applied":"A continuación, se aplica la duración máxima. La duración máxima es","duration-after-maximum-duration-is":"por lo que la duración es","lead-time-is-applied":"Por último, se aplica el plazo de entrega. El plazo de entrega es","duration-after-lead-time-is":"por lo que la duración final es","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Como cubo >= 0, no es necesario regar y la duración se fija en","maximum-bucket-is":"El tamaño máximo de cubo es"}}},sa={pyeto:{description:"Calcular la duración a partir del cálculo FAO56 de la biblioteca PyETO"},static:{description:"Módulo 'de prueba' con un delta estático configurable"},passthrough:{description:"Módulo de paso que devuelve el valor de un sensor de evapotranspiración como delta"}},ra={general:{cards:{"automatic-duration-calculation":{header:"Cálculo automático de la duración",labels:{"auto-calc-enabled":"Cálculo automático de la duración de las zonas","auto-calc-time":"Calcular en"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Advertencia: la hora de actualización de los datos meteorológicos es igual o posterior a la hora de cálculo"},header:"Actualización automática de los datos meteorológicos",labels:{"auto-update-enabled":"Actualizar automáticamente los datos meteorológicos","auto-update-first-update":"(Primer) Actualización a las","auto-update-interval":"Actualizar datos del sensor cada"},options:{days:"días",hours:"horas",minutes:"minutos"}}},description:"Esta página provee configuraciones globales.",title:"General"},help:{title:"Ayuda",cards:{"how-to-get-help":{title:"Cómo obtener ayuda","first-read-the":"Primero lee la",wiki:"Wiki","if-you-still-need-help":"Si aún necesitas ayuda, puedes:","community-forum":"Comunidad/Foro","or-open-a":"o abrir un","github-issue":"Github Issue","english-only":"sólo en inglés"}}},mappings:{cards:{"add-mapping":{actions:{add:"Añadir grupo de sensores"},header:"Añadir grupos de sensores"},mapping:{aggregates:{average:"Promedio",first:"Primero",last:"Último",maximum:"Máximo",median:"Mediana",minimum:"Mínimo",sum:"Suma"},errors:{"cannot-delete-mapping-because-zones-use-it":"No puedes eliminar este grupo de sensores porque hay al menos una zona que lo está usando."},items:{dewpoint:"Punto de rocío",evapotranspiration:"Evapotranspiración",humidity:"Humedad","maximum temperature":"Temperatura máxima","minimum temperature":"Temperatura mínima",precipitation:"Precipitación total",pressure:"Presión","solar radiation":"Radiación solar",temperature:"Temperatura",windspeed:"Velocidad del viento"},"sensor-aggregate-of-sensor-values-to-calculate":"de los valores de los sensores para calcular la duración","sensor-aggregate-use-the":"Usar la","sensor-entity":"Entidad de sensor",static_value:"Valor estático","input-units":"Unidades de entrada",source:"Fuente",sources:{none:"Ninguno",weather_service:"Weather service",sensor:"Sensor",static:"Valor estático"}}},description:"Añada uno o más grupos de sensores que recuperen datos meteorológicos de Weather service, de sensores o de una combinación de éstos. Puede asignar cada grupo de sensores a una o más zonas",labels:{"mapping-name":"Nombre del grupo de sensores"},no_items:"Aún no hay grupos de sensores definidos.",title:"Grupos de sensores"},modules:{cards:{"add-module":{actions:{add:"Añadir módulo"},header:"Añadir módulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"No puedes eliminar este módulo porque hay al menos una zona que lo está usando."},labels:{configuration:"Configuración",required:"Requerido"},"translated-options":{DontEstimate:"No estimar",EstimateFromSunHours:"Estimar desde horas de sol",EstimateFromTemp:"Estimar desde temperatura"}}},description:"Añada uno o varios módulos que calculen la duración del riego. Cada módulo tiene su propia configuración y puede utilizarse para calcular la duración de una o varias zonas.",no_items:"Aún no hay módulos definidos.",title:"Módulos"},zones:{actions:{add:"Añadir",calculate:"Calcular",information:"Información",update:"Actualizar","reset-bucket":"Resetear cubo"},cards:{"add-zone":{actions:{add:"Añadir zona"},header:"Añadir zona"},"zone-actions":{actions:{"calculate-all":"Calcular todas las zonas","update-all":"Actualizar todas las zonas","reset-all-buckets":"Resetear todos los cubos"},header:"Acciones en todas las zonas"}},description:"Especifique aquí una o varias zonas de riego. La duración del riego se calcula por zona, en función del tamaño, el rendimiento, el estado, el módulo y el grupo de sensores.",labels:{bucket:"Cubo",duration:"Duración","lead-time":"Tiempo de espera",mapping:"Grupo de sensores","maximum-duration":"Duración máxima",multiplier:"Multiplicador",name:"Nombre",size:"Tamaño",state:"Estado",states:{automatic:"Automático",disabled:"Desactivado",manual:"Manual"},throughput:"Rendimiento","maximum-bucket":"Cubo máximo"},no_items:"Aún no hay zonas definidas.",title:"Zonas"}},oa="Smart Irrigation",la={title:"Coordenadas de Ubicación",description:"Configure las coordenadas de ubicación para obtener datos meteorológicos. Puede usar coordenadas manuales diferentes a la ubicación de Home Assistant si es necesario.",manual_enabled:"Usar coordenadas manuales",use_ha_location:"Usar ubicación de Home Assistant",latitude:"Latitud (grados decimales)",longitude:"Longitud (grados decimales)",elevation:"Elevación (metros sobre el nivel del mar)",current_ha_coords:"Coordenadas actuales de Home Assistant"},da={title:"Días Entre Riegos",description:"Configure el número mínimo de días que deben pasar entre eventos de riego. Esto ayuda a controlar la frecuencia de riego para la conservación del agua y el manejo de la salud de las plantas.\n\nCasos de uso típicos:\n• Cuidado del césped: intervalos de 1-2 días previenen el exceso de riego\n• Restricciones de sequía: intervalos de 6+ días para riego semanal\n• Plantas de raíces profundas: intervalos de 3-7 días para riego menos frecuente\n• Conservación del agua: personalizable según el clima y las condiciones del suelo",label:"Días mínimos entre riegos",help_text:"Establezca en 0 para desactivar esta función. Se admiten valores de 1-365 días. Esta configuración funciona junto con la lógica de pronóstico de precipitación existente."},ua={common:aa,defaults:ia,module:na,calcmodules:sa,panels:ra,title:oa,coordinate_config:la,days_between_irrigation:da},ca=Object.freeze({__proto__:null,common:aa,defaults:ia,module:na,calcmodules:sa,panels:ra,title:oa,coordinate_config:la,days_between_irrigation:da,default:ua}),ha={actions:{delete:"Suppression"},labels:{module:"Module",no:"Non",select:"Sélectionner",yes:"Oui"},attributes:{size:"taille",throughput:"débit",state:"état"}},pa={"default-zone":"Zone par défaut","default-mapping":"Groupe de capteurs par défaut"},ga={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"NB: cette explication utilise '.' comme séparateur décimal, et affiche des valeurs arrondies. Le module a donné un manque d'Évapotranspiration de","bucket-was":"Le seau (bucket) était de","new-bucket-values-is":"La nouvelle valeur du seau (bucket) est","old-bucket-variable":"ancien_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Puisque le seau (bucket) est < 0, l'irrigation est nécessaire","steps-taken-to-calculate-duration":"Pour calculer la durée d'irrigation, les étapes suivantes ont été réalisées","precipitation-rate-defined-as":"Le taux de précipitation est défini comme","duration-is-calculated-as":"La durée d'irrigation est calculée avec",bucket:"seau (bucket)","precipitation-rate-variable":"taux_precipitation","multiplier-is-applied":"Le multiplicateur est appliqué. Le multiplicateur est","duration-after-multiplier-is":"donc la durée d'irrigation est de","maximum-duration-is-applied":"Ensuite la durée maximale est appliquée. La durée maximale est de","duration-after-maximum-duration-is":"donc la durée d'irrigation est de","lead-time-is-applied":"Enfin, le délai est appliqué. Le délai est de","duration-after-lead-time-is":"et donc la durée finale est de","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Puisque le seau (bucket) est >= 0, l'irrigation n'est pas nécessaire, et la durée est réglée à","maximum-bucket-is":"la taille du seau (bucket) maximale est"}}},ma={pyeto:{description:"Le calcul de durée est basée sur le calcul FAO56 de la bibliothèque PyETO"},static:{description:"Module 'Dummy' avec un delta statique configurable"},passthrough:{description:"Module passerelle qui renvoie la valeur d'un capteur d'Évapotranspiration comme delta"}},fa={weatherservice:{title:"Service météo",description:"Consultez et modifiez le service météo utilisé pour récupérer les données — sans réinstaller l'intégration. La clé API est validée et le changement est appliqué immédiatement.",labels:{"use-weather-service":"Utiliser un service météo",service:"Service météo","api-key":"Clé API"},actions:{save:"Enregistrer",saving:"Enregistrement…"},messages:{"no-service":"Aucun service météo utilisé — les données proviennent uniquement de vos capteurs.",saved:"Service météo mis à jour et appliqué.","reload-note":"L'enregistrement valide la clé API auprès du service et applique le changement immédiatement."}},general:{cards:{"automatic-duration-calculation":{header:"Calcul automatique de la durée",labels:{"auto-calc-enabled":"Calcule automatiquement la durée par zone","auto-calc-time":"Calcule à"},description:"Le calcul prend en compte les données météo jusqu'à ce point et met à jour le seau (bucket) pour chaque zone automatique. Ensuite, la durée est ajustée par la nouvelle valeur de seau (bucket) et les données météo sont supprimées."},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Attention: mise à jour des données météo au moment du, ou après le, calcul"},header:"Mise à jour automatique des données météo",labels:{"auto-update-enabled":"Met à jour les données météo automatiquement","auto-update-first-update":"(Première) Mise à jour à","auto-update-interval":"Mettre à jour les données des capteurs toutes les","auto-update-delay":"Délai de mise à jour"},options:{days:"jours",hours:"heures",minutes:"minutes"},description:"Récupère et stocke les données météo automatiquement. Des données météo sont nécessaires pour calculer les seaux (buckets) par zone et les durées."},"automatic-clear":{header:"Délestage automatique des données météo",description:"Suppression automatique des données météo collectées à une heure données. Utilisez ceci pour être sûr qu'il n'y ait plus de restes des données météo des jours précédents. Ne supprimez pas les données météo avant le calcul et n'utilisez cette option que si vous vous attendez à ce que les données météo soient récupérées après le calcul du jour. Idéalement, vous voudrez \"élaguer\" les données les plus tard possible dans la journée.",labels:{"automatic-clear-enabled":"Suppression automatique des données météo collectées","automatic-clear-time":"Supprimer les données météo à"}}},description:"Cette page fournit les réglages globaux.",title:"Général"},help:{title:"Aide",cards:{"how-to-get-help":{title:"Comment obtenir de l'aide","first-read-the":"Premièrement, lisez ",wiki:"Wiki","if-you-still-need-help":"Si vous avez toujours besoin d'aide, adressez vous sur le","community-forum":"forum communautaire","or-open-a":"ou ouvrez un","github-issue":"problème Github","english-only":"en Anglais uniquement"}}},mappings:{cards:{"add-mapping":{actions:{add:"Ajouter un groupe de capteurs"},header:"Ajouter des groupes de capteurs"},mapping:{aggregates:{average:"Moyenne",first:"Premier",last:"Dernier",maximum:"Maximum",median:"Médian",minimum:"Minimum",sum:"Somme"},errors:{"cannot-delete-mapping-because-zones-use-it":"Vous ne pouvez pas supprimer ce groupe de capteurs car au moins une zone l'utilise."},items:{dewpoint:"Point de rosée",evapotranspiration:"Évapotranspiration",humidity:"Humidité","maximum temperature":"Température maximale","minimum temperature":"Température minimale",precipitation:"Précipitation totale",pressure:"Pression","solar radiation":"Rayonnement solaire",temperature:"Température",windspeed:"Vitesse du vent"},"sensor-aggregate-of-sensor-values-to-calculate":"des valeurs des capteurs pour calculer la durée","sensor-aggregate-use-the":"Utiliser les","sensor-entity":"Entité capteur",static_value:"Valeur","input-units":"L'entité fournit des entrées en",source:"Source",sources:{none:"Aucun",weather_service:"Weather service",sensor:"Capteur",static:"Valeur statique"},pressure_types:{relative:"relative",absolute:"absolue"},"pressure-type":"La pression est","sensor-units":"Le capteur fournit les valeurs en"}},description:"Ajouter un ou plusieurs groupes de capteurs qui récupèrent les données météo de Weather service, de capteurs locaux ou d'une combinaison de tous ceux-ci. Vous pouvez associer chaque groupe de capteurs avec une ou plusieurs zones",labels:{"mapping-name":"Nom"},no_items:"Il n'y a pas encore de groupe de capteurs définis.",title:"Groupes de capteurs"},modules:{cards:{"add-module":{actions:{add:"Ajouter un module"},header:"Ajout d'un module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Vous ne pouvez pas supprimer ce module car au moins une zone l'utilise."},labels:{configuration:"Configuration",required:"indique un champ requis"},"translated-options":{DontEstimate:"Ne fait pas d'estimation",EstimateFromSunHours:"Estimation à partir des heures d'ensoleillement",EstimateFromTemp:"Estimation à partir de la température"}}},description:"Ajouter un ou plusieurs modules qui calcule la durée d'irrigation. Chaque module vient avec sa propre configuration et peut être utilisé pour calculer la durée d'irrigation d'une ou plusieurs zones.",no_items:"Il n'y a aucun module défini pour l'instant.",title:"Modules"},zones:{actions:{add:"Ajouter",calculate:"Calculer",information:"Information",update:"Mise à jour","reset-bucket":"Mise à zéro du seau (bucket)"},cards:{"add-zone":{actions:{add:"Ajouter une zone"},header:"Ajout d'une zone"},"zone-actions":{actions:{"calculate-all":"Calculer pour toutes les zones","update-all":"Mise à jour de toutes les zones","reset-all-buckets":"Mise à zéro de tous les seaux (buckets)","clear-all-weatherdata":"Mise à zéro de toutes les données météo"},header:"Actions sur toutes les zones"}},description:"Spécifiez une ou plusieurs zones d'irrigation ici. La durée d'irrigation est calculée par zone, en fonction de la taille, du débit, état, module et groupe de capteurs.",labels:{bucket:"Seau",duration:"Durée","lead-time":"Délai",mapping:"Groupe de capteurs","maximum-duration":"Durée maximale",multiplier:"Multiplicateur",name:"Nom",size:"Taille",state:"État",states:{automatic:"Automatique",disabled:"Désactivé",manual:"Manuel"},throughput:"Débit","maximum-bucket":"Seau (bucket) maximum",last_calculated:"Dernier calcul","data-last-updated":"Dernière mise à jour","data-number-of-data-points":"Nombre de points de données"},no_items:"Il n'y a pas encore de zone définie.",title:"Zones"}},va="Smart Irrigation",ba={title:"Coordonnées de Localisation",description:"Configurez les coordonnées de localisation pour la récupération des données météo. Vous pouvez utiliser des coordonnées manuelles différentes de votre emplacement Home Assistant si nécessaire.",manual_enabled:"Utiliser des coordonnées manuelles",use_ha_location:"Utiliser l'emplacement Home Assistant",latitude:"Latitude (degrés décimaux)",longitude:"Longitude (degrés décimaux)",elevation:"Élévation (mètres au-dessus du niveau de la mer)",current_ha_coords:"Coordonnées actuelles de Home Assistant"},_a={title:"Jours Entre Irrigations",description:"Configurez le nombre minimum de jours qui doivent s'écouler entre les événements d'irrigation. Cela aide à contrôler la fréquence d'arrosage pour la conservation de l'eau et la gestion de la santé des plantes.\n\nCas d'usage typiques:\n• Entretien de pelouse: intervalles de 1-2 jours préviennent l'arrosage excessif\n• Restrictions de sécheresse: intervalles de 6+ jours pour arrosage hebdomadaire\n• Plantes à racines profondes: intervalles de 3-7 jours pour arrosage moins fréquent\n• Conservation de l'eau: personnalisable selon le climat et les conditions du sol",label:"Jours minimum entre irrigations",help_text:"Définir à 0 pour désactiver cette fonction. Les valeurs de 1-365 jours sont prises en charge. Ce paramètre fonctionne avec la logique de prévision de précipitation existante."},ya={common:ha,defaults:pa,module:ga,calcmodules:ma,panels:fa,title:va,coordinate_config:ba,days_between_irrigation:_a},wa=Object.freeze({__proto__:null,common:ha,defaults:pa,module:ga,calcmodules:ma,panels:fa,title:va,coordinate_config:ba,days_between_irrigation:_a,default:ya}),xa={actions:{delete:"Cancella"},labels:{module:"Modulo",no:"No",select:"Seleziona",yes:"Si"},units:{seconds:"secondi"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"secchio",last_updated:"ultimo aggiornamento",last_calculated:"ultimo calcolo",number_of_data_points:"numero di punti dati"}},ka={"default-zone":"Zona predefinita","default-mapping":"Mappatura predefinita"},$a={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Il modulo ha restituito un deficit di evapotraspirazione del","bucket-was":"Il secchio era","new-bucket-values-is":"Il nuovo valore del secchio è",bucket:"secchio","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Poiché secchio < 0, è necessaria l'irrigazione","steps-taken-to-calculate-duration":"Per calcolare la durata esatta, sono stati eseguiti i seguenti passaggi","precipitation-rate-defined-as":"Il tasso di precipitazione è definito come","duration-is-calculated-as":"La durata viene calcolata come",drainage:"drenaggio","drainage-rate":"tasso_di_drenaggio",hours:"ore","precipitation-rate-variable":"tasso_di_precipitazione","multiplier-is-applied":"Ora viene applicato il moltiplicatore. Il moltiplicatore è","duration-after-multiplier-is":"quindi la durata è","maximum-duration-is-applied":"Quindi, viene applicata la durata massima. La durata massima è","duration-after-maximum-duration-is":"quindi la durata è","lead-time-is-applied":"Infine, viene applicato il lead time. Il tempo di consegna è","duration-after-lead-time-is":"quindi la durata finale è","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Poiché secchio >= 0, non è necessaria alcuna irrigazione e la durata è impostata su","maximum-bucket-is":"la dimensione massima del secchio è","drainage-rate-is":"Il tasso di drenaggio in condizioni di saturazione (secchio al massimo) è di","current-drainage-is":"Il drenaggio attuale è calcolato come","no-drainage":"Il drenaggio attuale è 0 perché"}}},Sa={pyeto:{description:"Calcola la durata in base al calcolo FAO56 dalla libreria PyETO"},static:{description:"Modulo 'fittizio' con un delta configurabile statico"},passthrough:{description:"Modulo passthrough che restituisce il valore di un sensore di Evapotraspirazione sotto forma di delta"}},za={general:{cards:{"automatic-duration-calculation":{header:"Calcolo automatico della durata",description:"Il calcolo prende i dati meteorologici raccolti fino a quel momento e aggiorna il bucket per ciascuna zona automatica. Quindi, la durata viene regolata in base al nuovo valore del segmento e i dati meteorologici raccolti vengono rimossi.",labels:{"auto-calc-enabled":"Calcola automaticamente la durata delle zone","auto-calc-time":"Calcola a"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Attenzione: ora di aggiornamento dei dati meteorologici in corrispondenza o dopo l'ora di calcolo"},header:"Aggiornamento automatico dei dati meteorologici",description:"Raccogli e archivia automaticamente i dati meteorologici. I dati meteorologici sono necessari per calcolare gli intervalli e le durate delle zone.",labels:{"auto-update-enabled":"Aggiorna automaticamente i dati meteorologici","auto-update-first-update":"(Primo) aggiornamento alle","auto-update-interval":"Aggiorna i dati del sensore ogni"},options:{days:"giorni",hours:"ore",minutes:"minuti"}},"automatic-clear":{header:"Eliminazione automatica dei dati meteo",description:"Rimuovi automaticamente i dati meteo raccolti a un orario configurato. Usa questa opzione per assicurarti che non vi siano dati meteo residui dei giorni precedenti. Non rimuovere i dati meteo prima di effettuare il calcolo e utilizza questa opzione solo se prevedi che l'aggiornamento automatico raccolga i dati meteo dopo aver effettuato il calcolo giornaliero. Idealmente, la rimozione dei dati meteo dovrebbe avvenire il più tardi possibile.",labels:{"automatic-clear-enabled":"Cancella automaticamente i dati meteorologici raccolti","automatic-clear-time":"Cancella dati meteo a"}},continuousupdates:{header:"Aggiornamenti continui per i sensori (sperimentale)",description:"Questa funzione sperimentale aggiorna continuamente i dati dei sensori. È utile per i gruppi di sensori che utilizzano fonti che forniscono dati continui, come le stazioni meteorologiche. Questa funzione non può essere utilizzata per i gruppi di sensori che si affidano almeno in parte ai servizi meteo, poiché il polling continuo delle API comporta dei costi. Tenere presente che si tratta di una funzione sperimentale e che potrebbe non funzionare come previsto. Utilizzatela a vostro rischio e pericolo.",labels:{continuousupdates:"Abilita gli aggiornamenti continui",sensor_debounce:"Rimbalzo del sensore"}}},description:"Questa pagina fornisce le impostazioni globali.",title:"Generale"},help:{title:"Aiuto",cards:{"how-to-get-help":{title:"Come ottenere aiuto","first-read-the":"Per prima cosa, leggi il",wiki:"Wiki","if-you-still-need-help":"Se hai ancora bisogno di aiuto, contatta il","community-forum":"Forum della Comunità","or-open-a":"oppure apri un","github-issue":"Problema su Github","english-only":"soltanto in Inglese"}}},info:{title:"Info",description:"Visualizza le informazioni sulla prossima irrigazione e sullo stato del sistema.",cards:{"next-irrigation":{title:"Prossima Irrigazione",labels:{"next-start":"Prossimo avvio",duration:"Durata",zones:"Zone"},"no-data":"Non ci sono dati disponibili","backend-todo":"TODO: API di backend necessaria per le informazioni sull'irrigazione"},"irrigation-reason":{title:"Motivo dell'irrigazione",labels:{reason:"Motivazione",sunrise:"Alba","total-duration":"Durata totale",explanation:"Spiegazione"},"no-data":"Non ci sono dati disponibili","backend-todo":"TODO: API di backend necessaria per le informazioni sull'irrigazione"}}},mappings:{cards:{"add-mapping":{actions:{add:"Aggiungi gruppo di sensori"},header:"Aggiungi gruppo di sensori"},mapping:{aggregates:{average:"Media",first:"Primo",last:"Ultimo",maximum:"Massimo",median:"Mediana",minimum:"Minimo",riemannsum:"Somma di Riemann",sum:"Somma"},errors:{"cannot-delete-mapping-because-zones-use-it":"Non è possibile eliminare questo gruppo di sensori perché almeno una zona lo utilizza.",invalid_source:"Fonte non valida",source_does_not_exist:"La fonte non esiste. Inserire una fonte valida, ad esempio 'sensor.mysensor'."},items:{dewpoint:"Punto di rugiada",evapotranspiration:"Evapotraspirazione",humidity:"Umidità","maximum temperature":"Temperatura massima","minimum temperature":"Temperatura minima",precipitation:"Precipitazione","current precipitation":"Precipitazioni attuali",pressure:"Pressione","solar radiation":"Irradiamento solare",temperature:"Temperatura",windspeed:"Velocità del vento"},pressure_types:{absolute:"assoluta",relative:"relativa"},"pressure-type":"La pressione è","sensor-aggregate-of-sensor-values-to-calculate":"dei valori del sensore per calcolare la durata","sensor-aggregate-use-the":"Usa il","sensor-entity":"Entità sensore",static_value:"Valore","input-units":"L'input fornisce valori in",source:"Fonte",sources:{none:"Nessuna",weather_service:"Weather service",sensor:"Sensore",static:"Valore statico"}}},description:"Aggiungi uno o più gruppi di sensori che recuperano i dati meteorologici da Weather service, da sensori o da una combinazione di questi. È possibile mappare ciascun gruppo di sensori su una o più zone",labels:{"mapping-name":"Nome"},no_items:"Non è ancora stato definito alcun gruppo di sensori.",title:"Gruppi di sensori","weather-records":{title:"Record meteo (ultimi 10)",timestamp:"Tempo",temperature:"Temp",humidity:"Umidità",precipitation:"Precip","retrieval-time":"Recuperato","no-data":"Non sono disponibili dati meteo per questo gruppo di sensori"}},modules:{cards:{"add-module":{actions:{add:"Aggiungi modulo"},header:"Aggiungi modulo"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Non puoi eliminare questo modulo perché almeno una zona lo utilizza."},labels:{configuration:"Configurazione",required:"indica un campo richiesto"},"translated-options":{DontEstimate:"Non stimare",EstimateFromSunHours:"Stima dalle ore solari",EstimateFromTemp:"Stima dalla temperatura",EstimateFromSunHoursAndTemperature:"Stima dalla media delle ore di sole e della temperatura"}}},description:"Aggiungi uno o più moduli che calcolano la durata dell'irrigazione. Ogni modulo viene fornito con la propria configurazione e può essere utilizzato per calcolare la durata di una o più zone.",no_items:"Non ci sono ancora moduli definiti.",title:"Moduli"},zones:{actions:{add:"Aggiungi",calculate:"Calcola",information:"Informazioni",update:"Aggiorna","reset-bucket":"Reimposta il secchio","view-weather-info":"Visualizza le informazioni meteo","view-weather-info-message":"Informazioni meteo disponibili per","view-weather-info-todo":"TODO: Implementare la navigazione ai dettagli del gruppo di sensori","view-watering-calendar":"Visualizza il calendario delle irrigazioni"},cards:{"add-zone":{actions:{add:"Aggiungi zona"},header:"Aggiungi zona"},"zone-actions":{actions:{"calculate-all":"Calcola tutte le zone","update-all":"Aggiorna tutte le zone","reset-all-buckets":"Reimposta tutte le zone","clear-all-weatherdata":"Cancella tutti i dati meteo"},header:"Azioni su tutte le zone"}},description:"Specificare qui una o più zone di irrigazione. La durata dell'irrigazione viene calcolata per zona, a seconda delle dimensioni, della produttività, dello stato, del modulo e del gruppo di sensori.",labels:{bucket:"Secchio",duration:"Durata","lead-time":"Tempi di esecuzione",mapping:"Gruppo di sensori","maximum-duration":"Durata massima",multiplier:"Moltiplicatore",name:"Nome",size:"Misura",state:"Stato",states:{automatic:"Automatico",disabled:"Disabilitato",manual:"Manuale"},throughput:"Portata","maximum-bucket":"Secchio massimo",last_calculated:"Ultimo calcolo","data-last-updated":"Ultimo aggiornamento dei dati","data-number-of-data-points":"Numero di dati",tasso_di_drenaggio:"tasso di drenaggio"},no_items:"Non ci sono ancora zone definite.",title:"Zone"}},Aa="Smart Irrigation",Ea={title:"Coordinate di Posizione",description:"Configura le coordinate di posizione per il recupero dei dati meteorologici. Puoi usare coordinate manuali diverse dalla tua posizione Home Assistant se necessario.",manual_enabled:"Usa coordinate manuali",use_ha_location:"Usa posizione di Home Assistant",latitude:"Latitudine (gradi decimali)",longitude:"Longitudine (gradi decimali)",elevation:"Elevazione (metri sul livello del mare)",current_ha_coords:"Coordinate attuali di Home Assistant"},Ta={title:"Giorni Tra Irrigazioni",description:"Configura il numero minimo di giorni che devono passare tra gli eventi di irrigazione. Questo aiuta a controllare la frequenza di irrigazione per la conservazione dell'acqua e la gestione della salute delle piante.\n\nCasi d'uso tipici:\n• Cura del prato: intervalli di 1-2 giorni prevengono l'eccesso di irrigazione\n• Restrizioni di siccità: intervalli di 6+ giorni per irrigazione settimanale\n• Piante a radici profonde: intervalli di 3-7 giorni per irrigazione meno frequente\n• Conservazione dell'acqua: personalizzabile in base al clima e alle condizioni del suolo",label:"Giorni minimi tra irrigazioni",help_text:"Imposta a 0 per disabilitare questa funzione. Sono supportati valori da 1-365 giorni. Questa impostazione funziona insieme alla logica di previsione delle precipitazioni esistente."},Ma={common:xa,defaults:ka,module:$a,calcmodules:Sa,panels:za,title:Aa,coordinate_config:Ea,days_between_irrigation:Ta},Da=Object.freeze({__proto__:null,common:xa,defaults:ka,module:$a,calcmodules:Sa,panels:za,title:Aa,coordinate_config:Ea,days_between_irrigation:Ta,default:Ma}),Ca={actions:{delete:"Verwijderen"},labels:{module:"Module",no:"Nee",select:"Kies",yes:"Ja"},attributes:{size:"afmeting",throughput:"doorvoer",state:"status"}},Oa={"default-zone":"Standaard zone","default-mapping":"Standaard sensorgroep"},Ha={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"NB: in deze uitleg wordt de '.' as decimaalscheidingsteken gebruikt, worden afgeronde en metrische getallen getoond. Module berekende ET waarde van","bucket-was":"Voorraad was","new-bucket-values-is":"Nieuwe voorraad is","old-bucket-variable":"oude_voorraad",delta:"verandering","bucket-less-than-zero-irrigation-necessary":"Omdat de voorraad < 0 is, is irrigatie nodig","steps-taken-to-calculate-duration":"On de exacte duur te berekenen werd het volgende gedaan","precipitation-rate-defined-as":"De neerslag is","duration-is-calculated-as":"De duur is",bucket:"voorraad","precipitation-rate-variable":"neerslag","multiplier-is-applied":"De vermenigvuldiger wordt toegepast. Deze is","duration-after-multiplier-is":"dus de duur is","maximum-duration-is-applied":"De maximum duur wordt toegepast. Deze is","duration-after-maximum-duration-is":"dus de duur is","lead-time-is-applied":"As laatste wordt de aanlooptijd toegepast. Deze is","duration-after-lead-time-is":"dus de uiteindelijke duur is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Omdat de voorraad >= 0 is er geen irrigatie nodig en is de duur gelijk aan","maximum-bucket-is":"maximale voorraad grootte is"}}},Na={pyeto:{description:"Bereken duur op basis van de FAU56 formule en de PyETO library"},static:{description:"Module met instelbare verandering"},passthrough:{description:"Geeft waarde van ET sensor as verandering terug"}},Pa={general:{cards:{"automatic-duration-calculation":{header:"Automatische berekening van irrigatietijd",description:"Bij het berekenen wordt de verzamelde weersinformatie gebruikt om the voorraad en irrigatieduur per zone aan te passen. Daarna wordt de verzamelde weersinformatie verwijderd.",labels:{"auto-calc-enabled":"Automatisch irrigatietijd berekening voor elke zone","auto-calc-time":"Berekenen op"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Let op: het automatisch bijwerken van weersinformatie vind plaats op of na de automatische berekening van irrigatietijd"},header:"Automatisch bijwerken van weersinformatie",description:"Verzamel en bewaar weersinformatie automatisch. Weersinformatie is nodig om vorraad en irrigatieduur per zone te berekenen.",labels:{"auto-update-enabled":"Automatisch weersinformatie bijwerken","auto-update-delay":"Vertraging","auto-update-interval":"Sensor data bijwerken elke"},options:{days:"dagen",hours:"uren",minutes:"minuten"}},"automatic-clear":{header:"Automatisch weersinformatie opruimen",description:"Verwijder weersinformatie op het ingestelde moment. Dit zorgt ervoor dat er geen weersinformatie van de vorige dag gebruikt kan worden voor berekeningen. Let op: verwijder geen weersinformatie voordat de berekening heeft plaatsgevonden. Gebruik deze optie als je verwacht dat er weersinformatie zal worden verzameld nadat de berekeningen voor de dag gedaan zijn. Verwijder weersinformatie zo laat mogelijk op de dag.",labels:{"automatic-clear-enabled":"Automatisch weersinformatie verwijderen","automatic-clear-time":"Verwijder weersinformatie om"}}},description:"Dit zijn de algemene instellingen.",title:"Algemeen"},help:{title:"Hulp",cards:{"how-to-get-help":{title:"Hulp vragen","first-read-the":"Allereerst, lees de",wiki:"Wiki","if-you-still-need-help":"Als je hierna nog steeds hulp nodig hebt, laat een bericht achter op het","community-forum":"Community forum","or-open-a":"of open een","github-issue":"Github Issue","english-only":"alleen Engels"}}},mappings:{cards:{"add-mapping":{actions:{add:"Toevoegen"},header:"Voeg sensorgroep toe"},mapping:{aggregates:{average:"Gemiddelde",first:"Eerste",last:"Laatste",maximum:"Maximum",median:"Mediaan",minimum:"Minimum",sum:"Totaal"},errors:{"cannot-delete-mapping-because-zones-use-it":"Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."},items:{dewpoint:"Dauwpunt",evapotranspiration:"Verdamping",humidity:"Vochtigheid","maximum temperature":"Maximum temperatuur","minimum temperature":"Minimum temperatuur",precipitation:"Totale neerslag",pressure:"Druk","solar radiation":"Zonnestraling",temperature:"Temperatuur",windspeed:"Wind snelheid"},pressure_types:{absolute:"absoluut",relative:"relatief"},"pressure-type":"Druk is","sensor-aggregate-of-sensor-values-to-calculate":"van de sensor waardes om irrigatietijd te berekenen","sensor-aggregate-use-the":"Gebruik de/het","sensor-entity":"Sensor entiteit","input-units":"Invoer geeft waardes in",static_value:"Waarde",source:"Bron",sources:{none:"Geen",weather_service:"Weather service",sensor:"Sensor",static:"Vaste waarde"}}},description:"Voeg een of meer sensorgroepen toe die weergegevens ophalen van Weather service, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",labels:{"mapping-name":"Name"},no_items:"Er zijn nog geen sensorgroepen.",title:"Sensorgroepen"},modules:{cards:{"add-module":{actions:{add:"Toevoegen"},header:"Voeg module toe"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."},labels:{configuration:"Instellingen",required:"verplicht veld"},"translated-options":{DontEstimate:"Niet berekenen",EstimateFromSunHours:"Gebaseerd op zon uren",EstimateFromTemp:"Gebaseerd op temperatuur"}}},description:"Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones.",no_items:"Er zijn nog geen modules.",title:"Modules"},zones:{actions:{add:"Toevoegen",calculate:"Bereken",information:"Informatie",update:"Bijwerken","reset-bucket":"Leeg voorraad"},cards:{"add-zone":{actions:{add:"Toevoegen"},header:"Voeg zone toe"},"zone-actions":{actions:{"calculate-all":"Bereken alle zones","update-all":"Werk alle zone data bij","reset-all-buckets":"Leeg alle voorraden","clear-all-weatherdata":"Verwijder alle weersinformatie"},header:"Acties voor alle zones"}},description:"Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",labels:{bucket:"Voorraad",duration:"Irrigatieduur","lead-time":"Aanlooptijd",mapping:"Sensorgroep","maximum-duration":"Maximale duur",multiplier:"Vermenigvuldiger",name:"Naam",size:"Afmeting",state:"Status",states:{automatic:"Automatisch",disabled:"Uit",manual:"Manueel"},throughput:"Doorvoer","maximum-bucket":"Maximale voorraad",last_calculated:"Berekend op","data-last-updated":"Bijgewerkt op","data-number-of-data-points":"Aantal datapunten"},no_items:"Er zijn nog geen zones.",title:"Zones"}},La="Smart Irrigation",ja={title:"Locatie Coördinaten",description:"Configureer locatie coördinaten voor het ophalen van weergegevens. Je kunt handmatige coördinaten gebruiken die verschillen van je Home Assistant locatie indien nodig.",manual_enabled:"Handmatige coördinaten gebruiken",use_ha_location:"Home Assistant locatie gebruiken",latitude:"Breedtegraad (decimale graden)",longitude:"Lengtegraad (decimale graden)",elevation:"Hoogte (meters boven zeeniveau)",current_ha_coords:"Huidige Home Assistant coördinaten"},Ra={title:"Dagen Tussen Irrigaties",description:"Configureer het minimum aantal dagen dat moet verstrijken tussen irrigatie gebeurtenissen. Dit helpt bij het controleren van de bevloeiingsfrequentie voor waterbesparing en plantgezondheid beheer.\n\nTypische gebruikssituaties:\n• Gazonverzorging: 1-2 dag intervallen voorkomen overbewatering\n• Droogte beperkingen: 6+ dag intervallen voor wekelijkse bewatering\n• Diepwortelende planten: 3-7 dag intervallen voor minder frequente bewatering\n• Waterbesparing: aanpasbaar op basis van klimaat en bodemcondities",label:"Minimum dagen tussen irrigaties",help_text:"Stel in op 0 om deze functie uit te schakelen. Waarden van 1-365 dagen worden ondersteund. Deze instelling werkt samen met de bestaande neerslagvoorspelling logica."},Ia={common:Ca,defaults:Oa,module:Ha,calcmodules:Na,panels:Pa,title:La,coordinate_config:ja,days_between_irrigation:Ra},Ua=Object.freeze({__proto__:null,common:Ca,defaults:Oa,module:Ha,calcmodules:Na,panels:Pa,title:La,coordinate_config:ja,days_between_irrigation:Ra,default:Ia}),Ba={actions:{delete:"Slett"},labels:{module:"Modul",no:"Nei",select:"Velg",yes:"Ja"},attributes:{size:"størrelse",throughput:"kapasitet",state:"status"}},Fa={"default-zone":"Standard sone","default-mapping":"Standard sensorguppe"},Ya={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Merk: Denne forklaringen bruker '.' som desimaltegn og viser avrundede verdier. Modulen returnerte evapotranspirasjonsunderskudd på","bucket-was":"Bucket var","new-bucket-values-is":"Ny bucket verdien er","old-bucket-variable":"gammel_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Siden bucket < 0, Vanning er nødvendig.","steps-taken-to-calculate-duration":"For å beregne nøyaktig varighet, ble følgende trinn utført","precipitation-rate-defined-as":"Nedbørshastigheten er definert som","duration-is-calculated-as":"Varigheten beregnes som",bucket:"bucket","precipitation-rate-variable":"nedbørshastighet","multiplier-is-applied":"Nå blir multiplikatoren brukt. Multiplikatoren er","duration-after-multiplier-is":"derfor er varigheten","maximum-duration-is-applied":"Deretter blir den maksimale varigheten brukt. Den maksimale varigheten er","duration-after-maximum-duration-is":"derfor er varigheten","lead-time-is-applied":"Til slutt blir ledetiden brukt. Ledetiden er","duration-after-lead-time-is":"derfor er den endelige varigheten","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Siden bucket >= 0, Ingen vanning er nødvendig, og varigheten er satt til","maximum-bucket-is":"maksimum bucket stærrelse er"}}},Va={pyeto:{description:"Beregn varigheten basert på FAO56-beregningen fra PyETO-biblioteket"},static:{description:"'Dummy'-modul med en statisk konfigurerbar endring (delta)"},passthrough:{description:"En 'Passthrough'-modul som returnerer verdien av en Evapotranspiration-sensor som delta"}},Wa={general:{cards:{"automatic-duration-calculation":{header:"Automatisk varighetsberegning",labels:{"auto-calc-enabled":"Beregn sonevarigheter automatisk","auto-calc-time":"Beregn ved"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Advarsel: Oppdateringstidspunkt for værdata på eller etter beregningstidspunktet"},header:"Automatisk oppdatering av værdata",labels:{"auto-update-enabled":"Oppdater værdata automatisk","auto-update-first-update":"(Første) Oppdatering kl","auto-update-interval":"Oppdater sensordata hvert"},options:{days:"dager",hours:"timer",minutes:"minutter"}}},description:"Denne siden gir globale innstillinger.",title:"Generelt"},help:{title:"Hjelp",cards:{"how-to-get-help":{title:"Hvordan få hjelp","first-read-the":"Først, les",wiki:"Wikien","if-you-still-need-help":"Hvis du fremdeles trenger hjelp, ta kontakt på","community-forum":"Fellesskapsforumet","or-open-a":"eller åpne en","github-issue":"Github-sak","english-only":"Kun på engelsk"}}},mappings:{cards:{"add-mapping":{actions:{add:"Legg til sensorguppe"},header:"Legg til sensorgupper"},mapping:{aggregates:{average:"Gjennomsnitt",first:"Første",last:"Siste",maximum:"Maksimum",median:"Median",minimum:"Minimum",sum:"Sum"},errors:{"cannot-delete-mapping-because-zones-use-it":"Du kan ikke slette denne sensorguppen fordi minst én sone bruker den."},items:{dewpoint:"Duggpunkt",evapotranspiration:"Evapotranspirasjon",humidity:"Luftfuktighet","maximum temperature":"Maksimumstemperatur","minimum temperature":"Minimumstemperatur",precipitation:"Total nedbør",pressure:"Trykk","solar radiation":"Solstråling",temperature:"Temperatur",windspeed:"Vindhastighet"},"sensor-aggregate-of-sensor-values-to-calculate":"av sensordata for å beregne varighet","sensor-aggregate-use-the":"Bruk","sensor-entity":"Sensorenhet",static_value:"Verdi","input-units":"Inndata gir verdier i",source:"Kilde",sources:{none:"Ingen",weather_service:"Weather service",sensor:"Sensor",static:"Statisk verdi"}}},description:"Legg til en eller flere sensorgupper som henter værdata fra Weather service, fra sensorer eller en kombinasjon av disse. Du kan tilordne hver sensorguppe til en eller flere soner",labels:{"mapping-name":"Navn"},no_items:"Det er ingen definerte sensorgupper ennå.",title:"Sensorgupper"},modules:{cards:{"add-module":{actions:{add:"Legg til modul"},header:"Legg til modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Du kan ikke slette denne modulen fordi minst én sone bruker den."},labels:{configuration:"Konfigurasjon",required:"indikerer et obligatorisk felt"},"translated-options":{DontEstimate:"Ikke beregn",EstimateFromSunHours:"Beregn fra soltimer",EstimateFromTemp:"Beregn fra temperatur"}}},description:"Legg til en eller flere moduler som beregner vanningsvarighet. Hver modul har sin egen konfigurasjon og kan brukes til å beregne varighet for en eller flere soner.",no_items:"Det er ingen definerte moduler ennå.",title:"Moduler"},zones:{actions:{add:"Legg til",calculate:"Beregn",information:"Informasjon",update:"Oppdater","reset-bucket":"Nullstill bøtte"},cards:{"add-zone":{actions:{add:"Legg til sone"},header:"Legg til sone"},"zone-actions":{actions:{"calculate-all":"Beregn alle soner","update-all":"Oppdater alle soner","reset-all-buckets":"Nullstill alle bøtter"},header:"Handlinger på alle soner"}},description:"Spesifiser en eller flere vanningssoner her. Vanningens varighet beregnes per sone, avhengig av størrelse, gjennomstrømning, tilstand, modul og sensorguppe.",labels:{bucket:"Bøtte",duration:"Varighet","lead-time":"Ledetid",mapping:"Sensorguppe","maximum-duration":"Maksimal varighet",multiplier:"Multiplikator",name:"Navn",size:"Størrelse",state:"Tilstand",states:{automatic:"Automatisk",disabled:"Deaktivert",manual:"Manuell"},throughput:"Gjennomstrømning","maximum-bucket":"Maksimal bøtte"},no_items:"Det er ingen definerte soner ennå.",title:"Soner"},title:"Smart vanning"},Ga={title:"Stedskoordinater",description:"Konfigurer stedskoordinater for innhenting av værdata. Du kan bruke manuelle koordinater som er forskjellige fra din Home Assistant plassering om nødvendig.",manual_enabled:"Bruk manuelle koordinater",use_ha_location:"Bruk Home Assistant plassering",latitude:"Breddegrad (desimalgrader)",longitude:"Lengdegrad (desimalgrader)",elevation:"Høyde (meter over havet)",current_ha_coords:"Gjeldende Home Assistant koordinater"},qa={title:"Dager Mellom Vanninger",description:"Konfigurer minimum antall dager som må gå mellom vanningshendelser. Dette hjelper med å kontrollere vanningsfrekvensen for vannsparing og plantehelse.\n\nTypiske brukstilfeller:\n• Plenpleie: 1-2 dagers intervaller forhindrer overvanning\n• Tørkerestriksjoner: 6+ dagers intervaller for ukentlig vanning\n• Dyprottede planter: 3-7 dagers intervaller for mindre hyppig vanning\n• Vannsparing: tilpassbar basert på klima og jordforhold",label:"Minimum dager mellom vanninger",help_text:"Sett til 0 for å deaktivere denne funksjonen. Verdier fra 1-365 dager støttes. Denne innstillingen fungerer sammen med eksisterende nedbørprognosering logikk."},Za={common:Ba,defaults:Fa,module:Ya,calcmodules:Va,panels:Wa,coordinate_config:Ga,days_between_irrigation:qa},Ka=Object.freeze({__proto__:null,common:Ba,defaults:Fa,module:Ya,calcmodules:Va,panels:Wa,coordinate_config:Ga,days_between_irrigation:qa,default:Za}),Xa={actions:{delete:"Zmazať"},labels:{module:"Modul",no:"Nie",select:"Zvoliť",yes:"Áno"},attributes:{size:"size",throughput:"priepustnosť",state:"stav",bucket:"nádoba"}},Ja={"default-zone":"Predvolená zóna","default-mapping":"Predvolená skupina snímačov"},Qa={calculation:{explanation:{"module-returned-evapotranspiration-deficiency":"Poznámka: toto vysvetlenie používa '.' ako oddeľovač desatinných miest zobrazuje zaokrúhlené a metrické hodnoty. Modul vrátil nedostatok evapotranspirácie","bucket-was":"Vedro bolo","new-bucket-values-is":"Hodnota nového vedra je","old-bucket-variable":"staré_vedro",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Keďže vedro < 0, je potrebné zavlažovanie","steps-taken-to-calculate-duration":"Na výpočet presného trvania sa vykonali nasledujúce kroky","precipitation-rate-defined-as":"Miera zrážok je definovaná ako","duration-is-calculated-as":"Trvanie sa vypočíta ako",bucket:"vedro","precipitation-rate-variable":"úhrn zrážok","multiplier-is-applied":"Teraz sa použije multiplikátor. Násobiteľ je","duration-after-multiplier-is":"teda trvanie je","maximum-duration-is-applied":"Potom sa použije maximálne trvanie. Maximálne trvanie je","duration-after-maximum-duration-is":"teda trvanie je","lead-time-is-applied":"Nakoniec sa použije dodacia lehota. Dodacia lehota je","duration-after-lead-time-is":"teda konečné trvanie je","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Keďže vedro >= 0, nie je potrebné žiadne zavlažovanie a trvanie je nastavené na","maximum-bucket-is":"maximálna veľkosť vedra je"}}},ei={pyeto:{description:"Vypočítajte trvanie na základe výpočtu FAO56 z knižnice PyETO"},static:{description:"'Atrapa' modul so statickou konfigurovateľnou deltou"},passthrough:{description:"Priechodný modul, ktorý vracia hodnotu evapotranspiračného senzora ako delta"}},ti={general:{cards:{"automatic-duration-calculation":{header:"Automatický výpočet trvania",description:"Výpočet berie zhromaždené údaje o počasí až do tohto bodu a aktualizuje vedro pre každú automatickú zónu. Potom sa trvanie upraví na základe novej hodnoty segmentu a zhromaždené údaje o počasí sa odstránia.",labels:{"auto-calc-enabled":"Automaticky vypočítajte trvanie zón","auto-calc-time":"Vypočítajte pri"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Upozornenie: Čas aktualizácie údajov o počasí v čase výpočtu alebo po ňom"},header:"Automatic weather data update",description:"Automaticky zbierajte a ukladajte údaje o počasí. Údaje o počasí sú potrebné na výpočet segmentov zón a trvania.",labels:{"auto-update-enabled":"Automaticky aktualizovať údaje o počasí","auto-update-delay":"Oneskorenie aktualizácie","auto-update-interval":"Aktualizujte údaje snímača každý"},options:{days:"dni",hours:"hodiny",minutes:"minúty"}},"automatic-clear":{header:"Automatické orezávanie údajov o počasí",description:"Automaticky odstráňte zhromaždené údaje o počasí v nakonfigurovanom čase. Použite to, aby ste sa uistili, že nezostali žiadne údaje o počasí z predchádzajúcich dní. Neodstraňujte údaje o počasí pred výpočtom a túto možnosť použite iba vtedy, ak očakávate, že automatická aktualizácia bude zhromažďovať údaje o počasí až po výpočte na daný deň. V ideálnom prípade chcete prerezávať tak neskoro, ako je to možné.",labels:{"automatic-clear-enabled":"Automaticky vymazať zhromaždené údaje o počasí","automatic-clear-time":"Vymazať údaje o počasí o"}}},description:"Táto stránka poskytuje globálne nastavenia.",title:"Všeobecné"},help:{title:"Pomoc",cards:{"how-to-get-help":{title:"Ako získať pomoc","first-read-the":"Najprv si prečítajte",wiki:"Wiki","if-you-still-need-help":"Ak stále potrebujete pomoc, obráťte sa na","community-forum":"komunitné fórum","or-open-a":"alebo otvorte a","github-issue":"Problém Github","english-only":"len anglicky"}}},mappings:{cards:{"add-mapping":{actions:{add:"Pridať skupinu snímačov"},header:"Pridajte skupiny senzorov"},mapping:{aggregates:{average:"Priemer",first:"Prvý",last:"Posledný",maximum:"Maximum",median:"Medián",minimum:"Minimum",sum:"Sum"},errors:{"cannot-delete-mapping-because-zones-use-it":"Túto skupinu senzorov nemôžete vymazať, pretože ju používa aspoň jedna zóna."},items:{dewpoint:"Rosný bod",evapotranspiration:"Evapotranspirácia",humidity:"Vlhkosť","maximum temperature":"Maximálna teplota","minimum temperature":"Minimálna teplota",precipitation:"Úhrn zrážok",pressure:"Tlak","solar radiation":"Slnečné žiarenie",temperature:"Teplota",windspeed:"Rýchlosť vetra"},pressure_types:{absolute:"absolútne",relative:"relatítne"},"pressure-type":"Tlak je","sensor-aggregate-of-sensor-values-to-calculate":"hodnôt snímača na výpočet trvania","sensor-aggregate-use-the":"Použiť","sensor-entity":"Entita snímača",static_value:"Hodnota","input-units":"Vstup poskytuje hodnoty v",source:"Zdroj",sources:{none:"Nie je",weather_service:"Weather service",sensor:"Snímač",static:"Statická hodnota"}}},description:"Pridajte jednu alebo viac skupín senzorov, ktoré získavajú údaje o počasí z Weather service, zo senzorov alebo ich kombinácie. Každú skupinu senzorov môžete namapovať na jednu alebo viac zón",labels:{"mapping-name":"Názov"},no_items:"Zatiaľ nie je definovaná žiadna skupina senzorov.",title:"Skupiny senzorov"},modules:{cards:{"add-module":{actions:{add:"Pridať modul"},header:"Pridať modul"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Tento modul nemôžete vymazať, pretože ho používa aspoň jedna zóna."},labels:{configuration:"Konfigurácia",required:"označuje povinné pole"},"translated-options":{DontEstimate:"Bez odhadu",EstimateFromSunHours:"Odhad zo slnečných hodín",EstimateFromTemp:"Odhad z teploty"}}},description:"Pridajte jeden alebo viac modulov, ktoré vypočítavajú trvanie zavlažovania. Každý modul sa dodáva s vlastnou konfiguráciou a možno ho použiť na výpočet trvania pre jednu alebo viac zón.",no_items:"Zatiaľ nie sú definované žiadne moduly.",title:"Moduly"},zones:{actions:{add:"Pridať",calculate:"Vypočítať",information:"Informácia",update:"Aktualizovať","reset-bucket":"Resetovať vedro"},cards:{"add-zone":{actions:{add:"Pridať zónu"},header:"Pridať zónu"},"zone-actions":{actions:{"calculate-all":"Vypočítajte všetky zóny","update-all":"Aktualizujte všetky zóny","reset-all-buckets":"Obnovte všetky vedrá","clear-all-weatherdata":"Vymazať všetky údaje o počasí"},header:"Akcie vo všetkých zónach"}},description:"Tu špecifikujte jednu alebo viac zavlažovacích zón. Trvanie zavlažovania sa vypočíta pre zónu v závislosti od veľkosti, výkonu, stavu, modulu a skupiny senzorov.",labels:{bucket:"Vedro",duration:"Trvanie","lead-time":"Dodacia lehota",mapping:"Skupina senzorov","maximum-duration":"Maximálne trvanie",multiplier:"Násobiteľ",name:"Názov",size:"Veľkosť",state:"Stav",states:{automatic:"Automatický",disabled:"Zakázaný",manual:"Manuány"},throughput:"Priepustnosť","maximum-bucket":"Maximálne vedro",last_calculated:"Naposledy vypočítané","data-last-updated":"Údaje boli naposledy aktualizované","data-number-of-data-points":"Počet údajových bodov"},no_items:"Zatiaľ nie sú definované žiadne zóny.",title:"Zóny"}},ai="Inteligentné zavlažovanie",ii={title:"Súradnice Polohy",description:"Nakonfigurujte súradnice polohy pre získavanie meteorologických údajov. Môžete použiť manuálne súradnice odlišné od vašej polohy Home Assistant ak je to potrebné.",manual_enabled:"Použiť manuálne súradnice",use_ha_location:"Použiť polohu Home Assistant",latitude:"Zemepisná šírka (desatinné stupne)",longitude:"Zemepisná dĺžka (desatinné stupne)",elevation:"Nadmorská výška (metre nad morom)",current_ha_coords:"Aktuálne súradnice Home Assistant"},ni={title:"Dni Medzi Zavlažovaním",description:"Nakonfigurujte minimálny počet dní, ktoré musia uplynúť medzi udalosťami zavlažovania. Toto pomáha kontrolovať frekvenciu zavlažovania pre úsporu vody a správu zdravia rastlín.\n\nTypické prípady použitia:\n• Starostlivosť o trávnik: intervaly 1-2 dní zabránia nadmernému zalievaniu\n• Obmedzenia sucha: intervaly 6+ dní pre týždenné zalievanie\n• Hlbokokorenné rastliny: intervaly 3-7 dní pre menej časté zalievanie\n• Úspora vody: prispôsobiteľné na základe podnebia a podmienok pôdy",label:"Minimálne dni medzi zavlažovaním",help_text:"Nastavte na 0 pre deaktiváciu tejto funkcie. Podporované sú hodnoty 1-365 dní. Toto nastavenie funguje spolu s existujúcou logikou predpovede zrážok."},si={common:Xa,defaults:Ja,module:Qa,calcmodules:ei,panels:ti,title:ai,coordinate_config:ii,days_between_irrigation:ni},ri=Object.freeze({__proto__:null,common:Xa,defaults:Ja,module:Qa,calcmodules:ei,panels:ti,title:ai,coordinate_config:ii,days_between_irrigation:ni,default:si});function oi(e,t){var a=t&&t.cache?t.cache:vi,i=t&&t.serializer?t.serializer:hi;return(t&&t.strategy?t.strategy:ci)(e,{cache:a,serializer:i})}function li(e,t,a,i){var n,s=null==(n=i)||"number"==typeof n||"boolean"==typeof n?i:a(i),r=t.get(s);return void 0===r&&(r=e.call(this,i),t.set(s,r)),r}function di(e,t,a){var i=Array.prototype.slice.call(arguments,3),n=a(i),s=t.get(n);return void 0===s&&(s=e.apply(this,i),t.set(n,s)),s}function ui(e,t,a,i,n){return a.bind(t,e,i,n)}function ci(e,t){return ui(e,this,1===e.length?li:di,t.cache.create(),t.serializer)}var hi=function(){return JSON.stringify(arguments)};function pi(){this.cache=Object.create(null)}pi.prototype.get=function(e){return this.cache[e]},pi.prototype.set=function(e,t){this.cache[e]=t};var gi,mi,fi,vi={create:function(){return new pi}},bi={variadic:function(e,t){return ui(e,this,di,t.cache.create(),t.serializer)},monadic:function(e,t){return ui(e,this,li,t.cache.create(),t.serializer)}};function _i(e){return e.type===mi.literal}function yi(e){return e.type===mi.argument}function wi(e){return e.type===mi.number}function xi(e){return e.type===mi.date}function ki(e){return e.type===mi.time}function $i(e){return e.type===mi.select}function Si(e){return e.type===mi.plural}function zi(e){return e.type===mi.pound}function Ai(e){return e.type===mi.tag}function Ei(e){return!(!e||"object"!=typeof e||e.type!==fi.number)}function Ti(e){return!(!e||"object"!=typeof e||e.type!==fi.dateTime)}!function(e){e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG"}(gi||(gi={})),function(e){e[e.literal=0]="literal",e[e.argument=1]="argument",e[e.number=2]="number",e[e.date=3]="date",e[e.time=4]="time",e[e.select=5]="select",e[e.plural=6]="plural",e[e.pound=7]="pound",e[e.tag=8]="tag"}(mi||(mi={})),function(e){e[e.number=0]="number",e[e.dateTime=1]="dateTime"}(fi||(fi={}));var Mi=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,Di=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Ci(e){var t={};return e.replace(Di,(function(e){var a=e.length;switch(e[0]){case"G":t.era=4===a?"long":5===a?"narrow":"short";break;case"y":t.year=2===a?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][a-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][a-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===a?"long":5===a?"narrow":"short";break;case"e":if(a<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][a-4];break;case"c":if(a<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][a-4];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][a-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][a-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][a-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][a-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][a-1];break;case"s":t.second=["numeric","2-digit"][a-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=a<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}var Oi=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;var Hi=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,Ni=/^(@+)?(\+|#+)?[rs]?$/g,Pi=/(\*)(0+)|(#+)(0+)|(0+)/g,Li=/^(0+)$/;function ji(e){var t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(Ni,(function(e,a,i){return"string"!=typeof i?(t.minimumSignificantDigits=a.length,t.maximumSignificantDigits=a.length):"+"===i?t.minimumSignificantDigits=a.length:"#"===a[0]?t.maximumSignificantDigits=a.length:(t.minimumSignificantDigits=a.length,t.maximumSignificantDigits=a.length+("string"==typeof i?i.length:0)),""})),t}function Ri(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function Ii(e){var t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){var a=e.slice(0,2);if("+!"===a?(t.signDisplay="always",e=e.slice(2)):"+?"===a&&(t.signDisplay="exceptZero",e=e.slice(2)),!Li.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function Ui(e){var t=Ri(e);return t||{}}function Bi(e){for(var t={},a=0,n=e;a<n.length;a++){var s=n[a];switch(s.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=s.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=s.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t=i(i(i({},t),{notation:"scientific"}),s.options.reduce((function(e,t){return i(i({},e),Ui(t))}),{}));continue;case"engineering":t=i(i(i({},t),{notation:"engineering"}),s.options.reduce((function(e,t){return i(i({},e),Ui(t))}),{}));continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(s.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(s.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");s.options[0].replace(Pi,(function(e,a,i,n,s,r){if(a)t.minimumIntegerDigits=i.length;else{if(n&&s)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(Li.test(s.stem))t.minimumIntegerDigits=s.stem.length;else if(Hi.test(s.stem)){if(s.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");s.stem.replace(Hi,(function(e,a,i,n,s,r){return"*"===i?t.minimumFractionDigits=a.length:n&&"#"===n[0]?t.maximumFractionDigits=n.length:s&&r?(t.minimumFractionDigits=s.length,t.maximumFractionDigits=s.length+r.length):(t.minimumFractionDigits=a.length,t.maximumFractionDigits=a.length),""}));var r=s.options[0];"w"===r?t=i(i({},t),{trailingZeroDisplay:"stripIfInteger"}):r&&(t=i(i({},t),ji(r)))}else if(Ni.test(s.stem))t=i(i({},t),ji(s.stem));else{var o=Ri(s.stem);o&&(t=i(i({},t),o));var l=Ii(s.stem);l&&(t=i(i({},t),l))}}return t}var Fi,Yi={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function Vi(e){var t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}var a,i=e.language;return"root"!==i&&(a=e.maximize().region),(Yi[a||""]||Yi[i||""]||Yi["".concat(i,"-001")]||Yi["001"])[0]}var Wi=new RegExp("^".concat(Mi.source,"*")),Gi=new RegExp("".concat(Mi.source,"*$"));function qi(e,t){return{start:e,end:t}}var Zi=!!String.prototype.startsWith&&"_a".startsWith("a",1),Ki=!!String.fromCodePoint,Xi=!!Object.fromEntries,Ji=!!String.prototype.codePointAt,Qi=!!String.prototype.trimStart,en=!!String.prototype.trimEnd,tn=!!Number.isSafeInteger?Number.isSafeInteger:function(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e&&Math.abs(e)<=9007199254740991},an=!0;try{an="a"===(null===(Fi=cn("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu").exec("a"))||void 0===Fi?void 0:Fi[0])}catch(R){an=!1}var nn,sn=Zi?function(e,t,a){return e.startsWith(t,a)}:function(e,t,a){return e.slice(a,a+t.length)===t},rn=Ki?String.fromCodePoint:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var a,i="",n=e.length,s=0;n>s;){if((a=e[s++])>1114111)throw RangeError(a+" is not a valid code point");i+=a<65536?String.fromCharCode(a):String.fromCharCode(55296+((a-=65536)>>10),a%1024+56320)}return i},on=Xi?Object.fromEntries:function(e){for(var t={},a=0,i=e;a<i.length;a++){var n=i[a],s=n[0],r=n[1];t[s]=r}return t},ln=Ji?function(e,t){return e.codePointAt(t)}:function(e,t){var a=e.length;if(!(t<0||t>=a)){var i,n=e.charCodeAt(t);return n<55296||n>56319||t+1===a||(i=e.charCodeAt(t+1))<56320||i>57343?n:i-56320+(n-55296<<10)+65536}},dn=Qi?function(e){return e.trimStart()}:function(e){return e.replace(Wi,"")},un=en?function(e){return e.trimEnd()}:function(e){return e.replace(Gi,"")};function cn(e,t){return new RegExp(e,t)}if(an){var hn=cn("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");nn=function(e,t){var a;return hn.lastIndex=t,null!==(a=hn.exec(e)[1])&&void 0!==a?a:""}}else nn=function(e,t){for(var a=[];;){var i=ln(e,t);if(void 0===i||vn(i)||bn(i))break;a.push(i),t+=i>=65536?2:1}return rn.apply(void 0,a)};var pn,gn=function(){function e(e,t){void 0===t&&(t={}),this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}return e.prototype.parse=function(){if(0!==this.offset())throw Error("parser can only be used once");return this.parseMessage(0,"",!1)},e.prototype.parseMessage=function(e,t,a){for(var i=[];!this.isEOF();){var n=this.char();if(123===n){if((s=this.parseArgument(e,a)).err)return s;i.push(s.val)}else{if(125===n&&e>0)break;if(35!==n||"plural"!==t&&"selectordinal"!==t){if(60===n&&!this.ignoreTag&&47===this.peek()){if(a)break;return this.error(gi.UNMATCHED_CLOSING_TAG,qi(this.clonePosition(),this.clonePosition()))}if(60===n&&!this.ignoreTag&&mn(this.peek()||0)){if((s=this.parseTag(e,t)).err)return s;i.push(s.val)}else{var s;if((s=this.parseLiteral(e,t)).err)return s;i.push(s.val)}}else{var r=this.clonePosition();this.bump(),i.push({type:mi.pound,location:qi(r,this.clonePosition())})}}}return{val:i,err:null}},e.prototype.parseTag=function(e,t){var a=this.clonePosition();this.bump();var i=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:mi.literal,value:"<".concat(i,"/>"),location:qi(a,this.clonePosition())},err:null};if(this.bumpIf(">")){var n=this.parseMessage(e+1,t,!0);if(n.err)return n;var s=n.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!mn(this.char()))return this.error(gi.INVALID_TAG,qi(r,this.clonePosition()));var o=this.clonePosition();return i!==this.parseTagName()?this.error(gi.UNMATCHED_CLOSING_TAG,qi(o,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:mi.tag,value:i,children:s,location:qi(a,this.clonePosition())},err:null}:this.error(gi.INVALID_TAG,qi(r,this.clonePosition())))}return this.error(gi.UNCLOSED_TAG,qi(a,this.clonePosition()))}return this.error(gi.INVALID_TAG,qi(a,this.clonePosition()))},e.prototype.parseTagName=function(){var e=this.offset();for(this.bump();!this.isEOF()&&fn(this.char());)this.bump();return this.message.slice(e,this.offset())},e.prototype.parseLiteral=function(e,t){for(var a=this.clonePosition(),i="";;){var n=this.tryParseQuote(t);if(n)i+=n;else{var s=this.tryParseUnquoted(e,t);if(s)i+=s;else{var r=this.tryParseLeftAngleBracket();if(!r)break;i+=r}}}var o=qi(a,this.clonePosition());return{val:{type:mi.literal,value:i,location:o},err:null}},e.prototype.tryParseLeftAngleBracket=function(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(mn(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e},e.prototype.tryParseQuote=function(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();var t=[this.char()];for(this.bump();!this.isEOF();){var a=this.char();if(39===a){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(a);this.bump()}return rn.apply(void 0,t)},e.prototype.tryParseUnquoted=function(e,t){if(this.isEOF())return null;var a=this.char();return 60===a||123===a||35===a&&("plural"===t||"selectordinal"===t)||125===a&&e>0?null:(this.bump(),rn(a))},e.prototype.parseArgument=function(e,t){var a=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(gi.EXPECT_ARGUMENT_CLOSING_BRACE,qi(a,this.clonePosition()));if(125===this.char())return this.bump(),this.error(gi.EMPTY_ARGUMENT,qi(a,this.clonePosition()));var i=this.parseIdentifierIfPossible().value;if(!i)return this.error(gi.MALFORMED_ARGUMENT,qi(a,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(gi.EXPECT_ARGUMENT_CLOSING_BRACE,qi(a,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:mi.argument,value:i,location:qi(a,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(gi.EXPECT_ARGUMENT_CLOSING_BRACE,qi(a,this.clonePosition())):this.parseArgumentOptions(e,t,i,a);default:return this.error(gi.MALFORMED_ARGUMENT,qi(a,this.clonePosition()))}},e.prototype.parseIdentifierIfPossible=function(){var e=this.clonePosition(),t=this.offset(),a=nn(this.message,t),i=t+a.length;return this.bumpTo(i),{value:a,location:qi(e,this.clonePosition())}},e.prototype.parseArgumentOptions=function(e,t,a,n){var s,r=this.clonePosition(),o=this.parseIdentifierIfPossible().value,l=this.clonePosition();switch(o){case"":return this.error(gi.EXPECT_ARGUMENT_TYPE,qi(r,l));case"number":case"date":case"time":this.bumpSpace();var d=null;if(this.bumpIf(",")){this.bumpSpace();var u=this.clonePosition();if((b=this.parseSimpleArgStyleIfPossible()).err)return b;if(0===(g=un(b.val)).length)return this.error(gi.EXPECT_ARGUMENT_STYLE,qi(this.clonePosition(),this.clonePosition()));d={style:g,styleLocation:qi(u,this.clonePosition())}}if((_=this.tryParseArgumentClose(n)).err)return _;var c=qi(n,this.clonePosition());if(d&&sn(null==d?void 0:d.style,"::",0)){var h=dn(d.style.slice(2));if("number"===o)return(b=this.parseNumberSkeletonFromString(h,d.styleLocation)).err?b:{val:{type:mi.number,value:a,location:c,style:b.val},err:null};if(0===h.length)return this.error(gi.EXPECT_DATE_TIME_SKELETON,c);var p=h;this.locale&&(p=function(e,t){for(var a="",i=0;i<e.length;i++){var n=e.charAt(i);if("j"===n){for(var s=0;i+1<e.length&&e.charAt(i+1)===n;)s++,i++;var r=1+(1&s),o=s<2?1:3+(s>>1),l=Vi(t);for("H"!=l&&"k"!=l||(o=0);o-- >0;)a+="a";for(;r-- >0;)a=l+a}else a+="J"===n?"H":n}return a}(h,this.locale));var g={type:fi.dateTime,pattern:p,location:d.styleLocation,parsedOptions:this.shouldParseSkeletons?Ci(p):{}};return{val:{type:"date"===o?mi.date:mi.time,value:a,location:c,style:g},err:null}}return{val:{type:"number"===o?mi.number:"date"===o?mi.date:mi.time,value:a,location:c,style:null!==(s=null==d?void 0:d.style)&&void 0!==s?s:null},err:null};case"plural":case"selectordinal":case"select":var m=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(gi.EXPECT_SELECT_ARGUMENT_OPTIONS,qi(m,i({},m)));this.bumpSpace();var f=this.parseIdentifierIfPossible(),v=0;if("select"!==o&&"offset"===f.value){if(!this.bumpIf(":"))return this.error(gi.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,qi(this.clonePosition(),this.clonePosition()));var b;if(this.bumpSpace(),(b=this.tryParseDecimalInteger(gi.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,gi.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err)return b;this.bumpSpace(),f=this.parseIdentifierIfPossible(),v=b.val}var _,y=this.tryParsePluralOrSelectOptions(e,o,t,f);if(y.err)return y;if((_=this.tryParseArgumentClose(n)).err)return _;var w=qi(n,this.clonePosition());return"select"===o?{val:{type:mi.select,value:a,options:on(y.val),location:w},err:null}:{val:{type:mi.plural,value:a,options:on(y.val),offset:v,pluralType:"plural"===o?"cardinal":"ordinal",location:w},err:null};default:return this.error(gi.INVALID_ARGUMENT_TYPE,qi(r,l))}},e.prototype.tryParseArgumentClose=function(e){return this.isEOF()||125!==this.char()?this.error(gi.EXPECT_ARGUMENT_CLOSING_BRACE,qi(e,this.clonePosition())):(this.bump(),{val:!0,err:null})},e.prototype.parseSimpleArgStyleIfPossible=function(){for(var e=0,t=this.clonePosition();!this.isEOF();){switch(this.char()){case 39:this.bump();var a=this.clonePosition();if(!this.bumpUntil("'"))return this.error(gi.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,qi(a,this.clonePosition()));this.bump();break;case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}}return{val:this.message.slice(t.offset,this.offset()),err:null}},e.prototype.parseNumberSkeletonFromString=function(e,t){var a=[];try{a=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");for(var t=e.split(Oi).filter((function(e){return e.length>0})),a=[],i=0,n=t;i<n.length;i++){var s=n[i].split("/");if(0===s.length)throw new Error("Invalid number skeleton");for(var r=s[0],o=s.slice(1),l=0,d=o;l<d.length;l++)if(0===d[l].length)throw new Error("Invalid number skeleton");a.push({stem:r,options:o})}return a}(e)}catch(e){return this.error(gi.INVALID_NUMBER_SKELETON,t)}return{val:{type:fi.number,tokens:a,location:t,parsedOptions:this.shouldParseSkeletons?Bi(a):{}},err:null}},e.prototype.tryParsePluralOrSelectOptions=function(e,t,a,i){for(var n,s=!1,r=[],o=new Set,l=i.value,d=i.location;;){if(0===l.length){var u=this.clonePosition();if("select"===t||!this.bumpIf("="))break;var c=this.tryParseDecimalInteger(gi.EXPECT_PLURAL_ARGUMENT_SELECTOR,gi.INVALID_PLURAL_ARGUMENT_SELECTOR);if(c.err)return c;d=qi(u,this.clonePosition()),l=this.message.slice(u.offset,this.offset())}if(o.has(l))return this.error("select"===t?gi.DUPLICATE_SELECT_ARGUMENT_SELECTOR:gi.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,d);"other"===l&&(s=!0),this.bumpSpace();var h=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?gi.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT:gi.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,qi(this.clonePosition(),this.clonePosition()));var p=this.parseMessage(e+1,t,a);if(p.err)return p;var g=this.tryParseArgumentClose(h);if(g.err)return g;r.push([l,{value:p.val,location:qi(h,this.clonePosition())}]),o.add(l),this.bumpSpace(),l=(n=this.parseIdentifierIfPossible()).value,d=n.location}return 0===r.length?this.error("select"===t?gi.EXPECT_SELECT_ARGUMENT_SELECTOR:gi.EXPECT_PLURAL_ARGUMENT_SELECTOR,qi(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!s?this.error(gi.MISSING_OTHER_CLAUSE,qi(this.clonePosition(),this.clonePosition())):{val:r,err:null}},e.prototype.tryParseDecimalInteger=function(e,t){var a=1,i=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(a=-1);for(var n=!1,s=0;!this.isEOF();){var r=this.char();if(!(r>=48&&r<=57))break;n=!0,s=10*s+(r-48),this.bump()}var o=qi(i,this.clonePosition());return n?tn(s*=a)?{val:s,err:null}:this.error(t,o):this.error(e,o)},e.prototype.offset=function(){return this.position.offset},e.prototype.isEOF=function(){return this.offset()===this.message.length},e.prototype.clonePosition=function(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}},e.prototype.char=function(){var e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");var t=ln(this.message,e);if(void 0===t)throw Error("Offset ".concat(e," is at invalid UTF-16 code unit boundary"));return t},e.prototype.error=function(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}},e.prototype.bump=function(){if(!this.isEOF()){var e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}},e.prototype.bumpIf=function(e){if(sn(this.message,e,this.offset())){for(var t=0;t<e.length;t++)this.bump();return!0}return!1},e.prototype.bumpUntil=function(e){var t=this.offset(),a=this.message.indexOf(e,t);return a>=0?(this.bumpTo(a),!0):(this.bumpTo(this.message.length),!1)},e.prototype.bumpTo=function(e){if(this.offset()>e)throw Error("targetOffset ".concat(e," must be greater than or equal to the current offset ").concat(this.offset()));for(e=Math.min(e,this.message.length);;){var t=this.offset();if(t===e)break;if(t>e)throw Error("targetOffset ".concat(e," is at invalid UTF-16 code unit boundary"));if(this.bump(),this.isEOF())break}},e.prototype.bumpSpace=function(){for(;!this.isEOF()&&vn(this.char());)this.bump()},e.prototype.peek=function(){if(this.isEOF())return null;var e=this.char(),t=this.offset(),a=this.message.charCodeAt(t+(e>=65536?2:1));return null!=a?a:null},e}();function mn(e){return e>=97&&e<=122||e>=65&&e<=90}function fn(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function vn(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function bn(e){return e>=33&&e<=35||36===e||e>=37&&e<=39||40===e||41===e||42===e||43===e||44===e||45===e||e>=46&&e<=47||e>=58&&e<=59||e>=60&&e<=62||e>=63&&e<=64||91===e||92===e||93===e||94===e||96===e||123===e||124===e||125===e||126===e||161===e||e>=162&&e<=165||166===e||167===e||169===e||171===e||172===e||174===e||176===e||177===e||182===e||187===e||191===e||215===e||247===e||e>=8208&&e<=8213||e>=8214&&e<=8215||8216===e||8217===e||8218===e||e>=8219&&e<=8220||8221===e||8222===e||8223===e||e>=8224&&e<=8231||e>=8240&&e<=8248||8249===e||8250===e||e>=8251&&e<=8254||e>=8257&&e<=8259||8260===e||8261===e||8262===e||e>=8263&&e<=8273||8274===e||8275===e||e>=8277&&e<=8286||e>=8592&&e<=8596||e>=8597&&e<=8601||e>=8602&&e<=8603||e>=8604&&e<=8607||8608===e||e>=8609&&e<=8610||8611===e||e>=8612&&e<=8613||8614===e||e>=8615&&e<=8621||8622===e||e>=8623&&e<=8653||e>=8654&&e<=8655||e>=8656&&e<=8657||8658===e||8659===e||8660===e||e>=8661&&e<=8691||e>=8692&&e<=8959||e>=8960&&e<=8967||8968===e||8969===e||8970===e||8971===e||e>=8972&&e<=8991||e>=8992&&e<=8993||e>=8994&&e<=9e3||9001===e||9002===e||e>=9003&&e<=9083||9084===e||e>=9085&&e<=9114||e>=9115&&e<=9139||e>=9140&&e<=9179||e>=9180&&e<=9185||e>=9186&&e<=9254||e>=9255&&e<=9279||e>=9280&&e<=9290||e>=9291&&e<=9311||e>=9472&&e<=9654||9655===e||e>=9656&&e<=9664||9665===e||e>=9666&&e<=9719||e>=9720&&e<=9727||e>=9728&&e<=9838||9839===e||e>=9840&&e<=10087||10088===e||10089===e||10090===e||10091===e||10092===e||10093===e||10094===e||10095===e||10096===e||10097===e||10098===e||10099===e||10100===e||10101===e||e>=10132&&e<=10175||e>=10176&&e<=10180||10181===e||10182===e||e>=10183&&e<=10213||10214===e||10215===e||10216===e||10217===e||10218===e||10219===e||10220===e||10221===e||10222===e||10223===e||e>=10224&&e<=10239||e>=10240&&e<=10495||e>=10496&&e<=10626||10627===e||10628===e||10629===e||10630===e||10631===e||10632===e||10633===e||10634===e||10635===e||10636===e||10637===e||10638===e||10639===e||10640===e||10641===e||10642===e||10643===e||10644===e||10645===e||10646===e||10647===e||10648===e||e>=10649&&e<=10711||10712===e||10713===e||10714===e||10715===e||e>=10716&&e<=10747||10748===e||10749===e||e>=10750&&e<=11007||e>=11008&&e<=11055||e>=11056&&e<=11076||e>=11077&&e<=11078||e>=11079&&e<=11084||e>=11085&&e<=11123||e>=11124&&e<=11125||e>=11126&&e<=11157||11158===e||e>=11159&&e<=11263||e>=11776&&e<=11777||11778===e||11779===e||11780===e||11781===e||e>=11782&&e<=11784||11785===e||11786===e||11787===e||11788===e||11789===e||e>=11790&&e<=11798||11799===e||e>=11800&&e<=11801||11802===e||11803===e||11804===e||11805===e||e>=11806&&e<=11807||11808===e||11809===e||11810===e||11811===e||11812===e||11813===e||11814===e||11815===e||11816===e||11817===e||e>=11818&&e<=11822||11823===e||e>=11824&&e<=11833||e>=11834&&e<=11835||e>=11836&&e<=11839||11840===e||11841===e||11842===e||e>=11843&&e<=11855||e>=11856&&e<=11857||11858===e||e>=11859&&e<=11903||e>=12289&&e<=12291||12296===e||12297===e||12298===e||12299===e||12300===e||12301===e||12302===e||12303===e||12304===e||12305===e||e>=12306&&e<=12307||12308===e||12309===e||12310===e||12311===e||12312===e||12313===e||12314===e||12315===e||12316===e||12317===e||e>=12318&&e<=12319||12320===e||12336===e||64830===e||64831===e||e>=65093&&e<=65094}function _n(e){e.forEach((function(e){if(delete e.location,$i(e)||Si(e))for(var t in e.options)delete e.options[t].location,_n(e.options[t].value);else wi(e)&&Ei(e.style)||(xi(e)||ki(e))&&Ti(e.style)?delete e.style.location:Ai(e)&&_n(e.children)}))}function yn(e,t){void 0===t&&(t={}),t=i({shouldParseSkeletons:!0,requiresOtherClause:!0},t);var a=new gn(e,t).parse();if(a.err){var n=SyntaxError(gi[a.err.kind]);throw n.location=a.err.location,n.originalMessage=a.err.message,n}return(null==t?void 0:t.captureLocation)||_n(a.val),a.val}!function(e){e.MISSING_VALUE="MISSING_VALUE",e.INVALID_VALUE="INVALID_VALUE",e.MISSING_INTL_API="MISSING_INTL_API"}(pn||(pn={}));var wn,xn=function(e){function t(t,a,i){var n=e.call(this,t)||this;return n.code=a,n.originalMessage=i,n}return a(t,e),t.prototype.toString=function(){return"[formatjs Error: ".concat(this.code,"] ").concat(this.message)},t}(Error),kn=function(e){function t(t,a,i,n){return e.call(this,'Invalid values for "'.concat(t,'": "').concat(a,'". Options are "').concat(Object.keys(i).join('", "'),'"'),pn.INVALID_VALUE,n)||this}return a(t,e),t}(xn),$n=function(e){function t(t,a,i){return e.call(this,'Value for "'.concat(t,'" must be of type ').concat(a),pn.INVALID_VALUE,i)||this}return a(t,e),t}(xn),Sn=function(e){function t(t,a){return e.call(this,'The intl string context variable "'.concat(t,'" was not provided to the string "').concat(a,'"'),pn.MISSING_VALUE,a)||this}return a(t,e),t}(xn);function zn(e){return"function"==typeof e}function An(e,t,a,i,n,s,r){if(1===e.length&&_i(e[0]))return[{type:wn.literal,value:e[0].value}];for(var o=[],l=0,d=e;l<d.length;l++){var u=d[l];if(_i(u))o.push({type:wn.literal,value:u.value});else if(zi(u))"number"==typeof s&&o.push({type:wn.literal,value:a.getNumberFormat(t).format(s)});else{var c=u.value;if(!n||!(c in n))throw new Sn(c,r);var h=n[c];if(yi(u))h&&"string"!=typeof h&&"number"!=typeof h||(h="string"==typeof h||"number"==typeof h?String(h):""),o.push({type:"string"==typeof h?wn.literal:wn.object,value:h});else if(xi(u)){var p="string"==typeof u.style?i.date[u.style]:Ti(u.style)?u.style.parsedOptions:void 0;o.push({type:wn.literal,value:a.getDateTimeFormat(t,p).format(h)})}else if(ki(u)){p="string"==typeof u.style?i.time[u.style]:Ti(u.style)?u.style.parsedOptions:i.time.medium;o.push({type:wn.literal,value:a.getDateTimeFormat(t,p).format(h)})}else if(wi(u)){(p="string"==typeof u.style?i.number[u.style]:Ei(u.style)?u.style.parsedOptions:void 0)&&p.scale&&(h*=p.scale||1),o.push({type:wn.literal,value:a.getNumberFormat(t,p).format(h)})}else{if(Ai(u)){var g=u.children,m=u.value,f=n[m];if(!zn(f))throw new $n(m,"function",r);var v=f(An(g,t,a,i,n,s).map((function(e){return e.value})));Array.isArray(v)||(v=[v]),o.push.apply(o,v.map((function(e){return{type:"string"==typeof e?wn.literal:wn.object,value:e}})))}if($i(u)){if(!(b=u.options[h]||u.options.other))throw new kn(u.value,h,Object.keys(u.options),r);o.push.apply(o,An(b.value,t,a,i,n))}else if(Si(u)){var b;if(!(b=u.options["=".concat(h)])){if(!Intl.PluralRules)throw new xn('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',pn.MISSING_INTL_API,r);var _=a.getPluralRules(t,{type:u.pluralType}).select(h-(u.offset||0));b=u.options[_]||u.options.other}if(!b)throw new kn(u.value,h,Object.keys(u.options),r);o.push.apply(o,An(b.value,t,a,i,n,h-(u.offset||0)))}else;}}}return function(e){return e.length<2?e:e.reduce((function(e,t){var a=e[e.length-1];return a&&a.type===wn.literal&&t.type===wn.literal?a.value+=t.value:e.push(t),e}),[])}(o)}function En(e,t){return t?Object.keys(e).reduce((function(a,n){var s,r;return a[n]=(s=e[n],(r=t[n])?i(i(i({},s||{}),r||{}),Object.keys(s).reduce((function(e,t){return e[t]=i(i({},s[t]),r[t]||{}),e}),{})):s),a}),i({},e)):e}function Tn(e){return{create:function(){return{get:function(t){return e[t]},set:function(t,a){e[t]=a}}}}}!function(e){e[e.literal=0]="literal",e[e.object=1]="object"}(wn||(wn={}));var Mn=function(){function e(t,a,s,o){void 0===a&&(a=e.defaultLocale);var l,d=this;if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=function(e){var t=d.formatToParts(e);if(1===t.length)return t[0].value;var a=t.reduce((function(e,t){return e.length&&t.type===wn.literal&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e}),[]);return a.length<=1?a[0]||"":a},this.formatToParts=function(e){return An(d.ast,d.locales,d.formatters,d.formats,e,void 0,d.message)},this.resolvedOptions=function(){var e;return{locale:(null===(e=d.resolvedLocale)||void 0===e?void 0:e.toString())||Intl.NumberFormat.supportedLocalesOf(d.locales)[0]}},this.getAst=function(){return d.ast},this.locales=a,this.resolvedLocale=e.resolveLocale(a),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");var u=o||{};u.formatters;var c=n(u,["formatters"]);this.ast=e.__parse(t,i(i({},c),{locale:this.resolvedLocale}))}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=En(e.formats,s),this.formatters=o&&o.formatters||(void 0===(l=this.formatterCache)&&(l={number:{},dateTime:{},pluralRules:{}}),{getNumberFormat:oi((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.NumberFormat).bind.apply(e,r([void 0],t,!1)))}),{cache:Tn(l.number),strategy:bi.variadic}),getDateTimeFormat:oi((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.DateTimeFormat).bind.apply(e,r([void 0],t,!1)))}),{cache:Tn(l.dateTime),strategy:bi.variadic}),getPluralRules:oi((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.PluralRules).bind.apply(e,r([void 0],t,!1)))}),{cache:Tn(l.pluralRules),strategy:bi.variadic})})}return Object.defineProperty(e,"defaultLocale",{get:function(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale},enumerable:!1,configurable:!0}),e.memoizedDefaultLocale=null,e.resolveLocale=function(e){if(void 0!==Intl.Locale){var t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])}},e.__parse=yn,e.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},e}(),Dn=Mn;const Cn={de:Ft,en:ta,es:ca,fr:wa,it:Da,nl:Ua,no:Ka,sk:ri};function On(e,t,...a){const i=t.replace(/['"]+/g,"");let n;try{n=e.split(".").reduce(((e,t)=>e[t]),Cn[i])}catch(t){n=e.split(".").reduce(((e,t)=>e[t]),Cn.en)}if(void 0===n&&(n=e.split(".").reduce(((e,t)=>e[t]),Cn.en)),!a.length)return n;const s={};for(let e=0;e<a.length;e+=2){let t=a[e];t=t.replace(/^{([^}]+)?}$/,"$1"),s[t]=a[e+1]}try{return new Dn(n,t).format(s)}catch(e){return"Translation "+e}}var Hn="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",Nn="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Pn="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",Ln="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",jn="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",Rn="M7,10L12,15L17,10H7Z",In="M19,13H5V11H19V13Z",Un="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",Bn="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Fn="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z";const Yn=h`
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

  mwc-button.active {
    background: var(--primary-color);
    --mdc-theme-primary: var(--text-primary-color);
    border-radius: 4px;
  }
  mwc-button.warning {
    --mdc-theme-primary: var(--error-color);
  }
  mwc-button.success {
    --mdc-theme-primary: var(--success-color);
  }

  mwc-button.disabled.active {
    opacity: 0.5;
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
  mwc-button ha-icon {
    padding-right: 11px;
  }
  mwc-button[trailingIcon] ha-icon {
    padding: 0px 0px 0px 6px;
  }
  mwc-button.vertical {
    height: 60px;
    --mdc-button-height: 60px;
    background: var(--primary-color);
    --mdc-theme-primary: var(--text-primary-color);
  }
  mwc-button.vertical div {
    display: flex;
    flex-direction: column;
  }
  mwc-button.vertical span {
    display: flex;
  }
  mwc-button.vertical ha-icon {
    display: flex;
    margin-left: 50%;
  }
  mwc-tab {
    --mdc-tab-color-default: var(--secondary-text-color);
    --mdc-tab-text-label-color-default: var(--secondary-text-color);
  }
  mwc-tab ha-icon {
    --mdc-icon-size: 20px;
  }
  mwc-tab.disabled {
    --mdc-theme-primary: var(--disabled-text-color);
    --mdc-tab-color-default: var(--disabled-text-color);
    --mdc-tab-text-label-color-default: var(--disabled-text-color);
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
`,Vn=h`
  /* mwc-dialog (ha-dialog) styles */
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
`;let Wn=class extends he{async showDialog(e){var t,a,i,n,s,r,o,l,d;if(this.params=e,e.createTrigger)this._trigger={type:Te,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const u=e.trigger;this._trigger=u.type===Me?{type:u.type,name:null!==(t=u.name)&&void 0!==t?t:"",enabled:null===(a=u.enabled)||void 0===a||a,offset_minutes:null!==(i=u.offset_minutes)&&void 0!==i?i:0,azimuth_angle:null!==(n=u.azimuth_angle)&&void 0!==n?n:90,account_for_duration:null===(s=u.account_for_duration)||void 0===s||s}:{type:u.type,name:null!==(r=u.name)&&void 0!==r?r:"",enabled:null===(o=u.enabled)||void 0===o||o,offset_minutes:null!==(l=u.offset_minutes)&&void 0!==l?l:0,account_for_duration:null===(d=u.account_for_duration)||void 0===d||d}}else this._trigger=void 0;console.log("showDialog _trigger:",this._trigger),await this.updateComplete}_closeDialog(){this.params=void 0,this._trigger=void 0}_saveTrigger(){var e,t,a,i,s,r,o;if(!this._trigger||!this.params)return;const l=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(l){const e=null!==(a=null!==(t=l.value)&&void 0!==t?t:l.selected)&&void 0!==a?a:void 0;if(e&&e!==this._trigger.type){if(e===Me)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(i=this._trigger.azimuth_angle)&&void 0!==i?i:90});else{const t=n(this._trigger,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},t),{type:e})}this.requestUpdate(),console.log("SYNCED _trigger from select before save:",this._trigger)}}if(null===(s=this._trigger.name)||void 0===s?void 0:s.trim()){if(this._trigger.type===Me){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void alert(On("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}console.log("DISPATCH: trigger-save",this._trigger,{isNew:null===(r=this.params)||void 0===r?void 0:r.createTrigger,index:null===(o=this.params)||void 0===o?void 0:o.triggerIndex}),this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else alert(On("irrigation_start_triggers.validation.name_required",this.hass.language))}_deleteTrigger(){this.params&&!this.params.createTrigger&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,t;if(console.log("RENDER: _trigger",this._trigger),!this.params||!this._trigger)return V``;const a=this.params.createTrigger,i=On(a?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return V`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${Pn}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${i}</span>
        </div>

        <div class="wrapper">
          <div class="form-group">
            <ha-textfield
              .label=${On("irrigation_start_triggers.fields.name.name",this.hass.language)}
              .value=${this._trigger.name||""}
              @input=${this._nameChanged}
              required
            ></ha-textfield>
          </div>

          <div class="form-group">
            <ha-select
              .label=${On("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @value-changed=${this._typeChanged}
              @change=${this._typeChanged}
            >
              <mwc-list-item value=${Te}>
                ${On("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </mwc-list-item>
              <mwc-list-item value=${"sunset"}>
                ${On("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </mwc-list-item>
              <mwc-list-item value=${Me}>
                ${On("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </mwc-list-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${On("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <ha-textfield
              type="number"
              .label=${On("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}
              .value=${(null===(e=this._trigger.offset_minutes)||void 0===e?void 0:e.toString())||"0"}
              min="-1440"
              max="1440"
              step="1"
              suffix="min"
              @input=${this._offsetChanged}
            ></ha-textfield>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${On("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===Me?V`
                <div class="form-group">
                  <ha-textfield
                    type="number"
                    .label=${On("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}
                    .value=${(null===(t=this._trigger.azimuth_angle)||void 0===t?void 0:t.toString())||"90"}
                    min="0"
                    max="359"
                    step="1"
                    suffix="°"
                    @input=${this._azimuthChanged}
                  ></ha-textfield>
                </div>
              `:""}
        </div>

        <div slot="primaryAction">
          <mwc-button @click=${this._saveTrigger}>
            ${On("irrigation_start_triggers.dialog.save",this.hass.language)}
          </mwc-button>
        </div>

        <div slot="secondaryAction">
          <mwc-button @click=${this._closeDialog}>
            ${On("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </mwc-button>
          ${a?"":V`
                <mwc-button @click=${this._deleteTrigger} class="warning">
                  ${On("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </mwc-button>
              `}
        </div>
      </ha-dialog>
    `}_nameChanged(e){const t=e.target;this._updateTrigger({name:t.value})}_typeChanged(e){var t,a,i,n,s,r,o,l,d,u,c,h,p,g,m,f,v,b,_,y,w,x,k,$;const S=null!==(n=null!==(a=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.value)&&void 0!==a?a:null===(i=e.target)||void 0===i?void 0:i.value)&&void 0!==n?n:null===(r=null===(s=this.shadowRoot)||void 0===s?void 0:s.querySelector("ha-select"))||void 0===r?void 0:r.value,z=String(S);let A;console.log("TYPE CHANGED: newType",z,"old _trigger",this._trigger),A=z===Me?{type:Me,name:null!==(l=null===(o=this._trigger)||void 0===o?void 0:o.name)&&void 0!==l?l:"",enabled:null===(u=null===(d=this._trigger)||void 0===d?void 0:d.enabled)||void 0===u||u,offset_minutes:null!==(h=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==h?h:0,azimuth_angle:null!==(g=null===(p=this._trigger)||void 0===p?void 0:p.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(f=null===(m=this._trigger)||void 0===m?void 0:m.account_for_duration)||void 0===f||f}:{type:z,name:null!==(b=null===(v=this._trigger)||void 0===v?void 0:v.name)&&void 0!==b?b:"",enabled:null===(y=null===(_=this._trigger)||void 0===_?void 0:_.enabled)||void 0===y||y,offset_minutes:null!==(x=null===(w=this._trigger)||void 0===w?void 0:w.offset_minutes)&&void 0!==x?x:0,account_for_duration:null===($=null===(k=this._trigger)||void 0===k?void 0:k.account_for_duration)||void 0===$||$},this._trigger=A,console.log("NEW _trigger",this._trigger),this.requestUpdate()}_enabledChanged(e){const t=e.target;this._updateTrigger({enabled:t.checked})}_offsetChanged(e){const t=e.target;this._updateTrigger({offset_minutes:parseInt(t.value)||0})}_accountForDurationChanged(e){const t=e.target;this._updateTrigger({account_for_duration:t.checked})}_azimuthChanged(e){var t;if((null===(t=this._trigger)||void 0===t?void 0:t.type)!==Me)return;const a=e.target;let i=parseInt(a.value,10);isNaN(i)&&(i=90),this._updateTrigger({azimuth_angle:i})}static get styles(){return[Vn,h`
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

        ha-textfield,
        ha-select {
          width: 100%;
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
      `]}};s([fe({attribute:!1})],Wn.prototype,"hass",void 0),s([fe({attribute:!1})],Wn.prototype,"params",void 0),s([ve()],Wn.prototype,"_trigger",void 0),Wn=s([ge("trigger-dialog")],Wn);const Gn=h`
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
`;let qn=class extends(Ot(he)){constructor(){super(...arguments),this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null;return t=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this.saveData(t),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ze+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await Et(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","autoclearenabled","cleardatatime","continuousupdates","sensor_debounce","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter((([e])=>t.includes(e))).reduce(((e,[t,a])=>Object.assign(e,{[t]:a})),{}):{})}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,t}}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)}))}render(){var e,t,a;if(!this.hass||!this.config||!this.data)return V`<div class="loading-indicator">
        ${On("common.loading-messages.configuration",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}
      </div>`;if(this.isLoading)return V`<div class="loading-indicator">
        ${On("common.loading-messages.general",this.hass.language)}
      </div>`;{let e=V` <div class="card-content">
          ${On("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autocalcenabled}
              @change=${e=>this.handleConfigChange({autocalcenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autocalcenabled&&(e=V`${e}
          <div class="card-content">
            ${this._timeRow(On("panels.general.cards.automatic-duration-calculation.labels.calc-time",this.hass.language),this.config.calctime,(e=>this.handleConfigChange({calctime:e})))}
          </div>`),e=V`<ha-card
        header="${On("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}"
      >
        ${e}</ha-card
      >`;let t=V` <div class="card-content">
          ${On("panels.general.cards.automatic-update.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoupdateenabled&&(t=V`${t}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${On("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${null!==(a=this.data.autoupdateinterval)&&void 0!==a?a:""}
                  @change=${e=>this.saveData({autoupdateinterval:parseInt(e.target.value)})}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>this.saveData({autoupdateschedule:e.target.value})}
                  >
                    <option
                      value="${De}"
                      ?selected=${this.data.autoupdateschedule===De}
                    >
                      ${On("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${Ce}"
                      ?selected=${this.data.autoupdateschedule===Ce}
                    >
                      ${On("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${Oe}"
                      ?selected=${this.data.autoupdateschedule===Oe}
                    >
                      ${On("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Rn}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(t=V`${t}
          <div class="card-content">
            ${this._numRow(On("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,(e=>this.saveData({autoupdatedelay:parseInt(e)})),1)}
          </div>`),t=V`<ha-card header="${On("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${t}</ha-card>`;let i=V` <div class="card-content">
          ${On("panels.general.cards.automatic-clear.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.general.cards.automatic-clear.labels.automatic-clear-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoclearenabled}
              @change=${e=>this.handleConfigChange({autoclearenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoclearenabled&&(i=V`${i}
          <div class="card-content">
            ${this._timeRow(On("panels.general.cards.automatic-clear.labels.automatic-clear-time",this.hass.language),this.config.cleardatatime,(e=>this.handleConfigChange({cleardatatime:e})))}
          </div>`),i=V`<ha-card
        header="${On("panels.general.cards.automatic-clear.header",this.hass.language)}"
        >${i}</ha-card
      >`;let n=V`<div class="card-content">
          ${On("panels.general.cards.continuousupdates.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.continuousupdates&&(n=V`${n}
          <div class="card-content">
            ${this._numRow(On("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,(e=>this.handleConfigChange({sensor_debounce:parseInt(e)})),1)}
          </div>`),n=V`<ha-card
        header="${On("panels.general.cards.continuousupdates.header",this.hass.language)}"
        >${n}</ha-card
      > `;const s=this.renderTriggersCard(),r=this.renderWeatherSkipCard(),o=this.renderCoordinateCard(),l=this.renderDaysBetweenIrrigationCard();return V`<ha-card
          header="${On("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${On("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${t}${e}${i}${n}${s}${r}${o}${l}`}}renderTriggersCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.config.irrigation_start_triggers||[];return V`
      <ha-card
        header="${On("irrigation_start_triggers.title",this.hass.language)}"
      >
        <div class="card-content">
          ${On("irrigation_start_triggers.description",this.hass.language)}
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${0===e.length?V`
                  <div class="no-triggers">
                    ${On("irrigation_start_triggers.no_triggers",this.hass.language)}
                  </div>
                `:e.map(((e,t)=>this.renderTriggerItem(e,t)))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(Bn,On("irrigation_start_triggers.add_trigger",this.hass.language),(()=>this._addTrigger()))}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,t){if(!this.hass)return V``;const a=On(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let i="";if(e.type===Te&&0===e.offset_minutes)i=On("irrigation_start_triggers.offset_auto",this.hass.language);else{const t=Math.abs(e.offset_minutes),a=Math.floor(t/60),n=t%60,s=e.offset_minutes<0?On("common.labels.before",this.hass.language):On("common.labels.after",this.hass.language);i=a>0?`${a}h ${n}m ${s}`:`${n}m ${s}`}let n="";return e.type===Me&&void 0!==e.azimuth_angle&&(n=` (${e.azimuth_angle}°)`),V`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${a}${n} - ${i}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?On("common.labels.enabled",this.hass.language):On("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(t)}"
            title="${On("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${jn}"
            @click="${()=>this._deleteTrigger(t)}"
            title="${On("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var t,a;const i=null===(a=null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===a?void 0:a[e];i&&this._showTriggerDialog({trigger:i,triggerIndex:e})}_deleteTrigger(e){var t,a;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||!this.hass)return;const i=(null===(a=this.config.irrigation_start_triggers[e])||void 0===a?void 0:a.name)||"Unknown";if(confirm(On("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",i))){const t=[...this.config.irrigation_start_triggers];t.splice(e,1),this.handleConfigChange({[Ee]:t})}}async _showTriggerDialog(e){if(!this.hass)return;const t=document.createElement("trigger-dialog");t.hass=this.hass,t.addEventListener("trigger-save",(e=>{this._handleTriggerSave(e.detail)})),t.addEventListener("trigger-delete",(e=>{this._handleTriggerDelete(e.detail)})),document.body.appendChild(t),await t.showDialog(e),t.addEventListener("closed",(e=>{const a=e.target;a&&"ha-dialog"===a.tagName.toLowerCase()&&document.body.removeChild(t)}))}_handleTriggerSave(e){if(!this.config)return;const t=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?t.push(e.trigger):void 0!==e.index&&(t[e.index]=e.trigger),console.log("RECEIVED trigger-save in view-general",{detail:e,triggers:t}),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[Ee]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}_handleTriggerDelete(e){var t;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===e.index)return;const a=[...this.config.irrigation_start_triggers];a.splice(e.index,1),this.handleConfigChange({[Ee]:a})}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?V`
      <ha-card header="${On("weather_skip.title",this.hass.language)}">
        <div class="card-content">
          ${On("weather_skip.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("weather_skip.title",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.skip_irrigation_on_precipitation}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation?this._numRow(On("weather_skip.threshold_label",this.hass.language),St(this.config,Ae),this.config.precipitation_threshold_mm,(e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)})),.1):""}
        </div>
      </ha-card>
    `:V``}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.hass.config,t=(null==e?void 0:e.latitude)||0,a=(null==e?void 0:e.longitude)||0,i=(null==e?void 0:e.elevation)||0;return V`
      <ha-card
        header="${On("coordinate_config.title",this.hass.language)}"
      >
        <div class="card-content">
          ${On("coordinate_config.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.manual_coordinates_enabled}
              @change=${e=>this.handleConfigChange({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.config.manual_coordinates_enabled?V`
                    ${this._numRow(On("coordinate_config.latitude",this.hass.language),"",this.config.manual_latitude||t,(e=>this.handleConfigChange({manual_latitude:parseFloat(e)})),.1)}
                    ${this._numRow(On("coordinate_config.longitude",this.hass.language),"",this.config.manual_longitude||a,(e=>this.handleConfigChange({manual_longitude:parseFloat(e)})),.1)}
                    ${this._numRow(On("coordinate_config.elevation",this.hass.language),"",this.config.manual_elevation||i,(e=>this.handleConfigChange({manual_elevation:parseFloat(e)})),1)}
                  `:V`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${On("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${On("coordinate_config.latitude",this.hass.language)}:
                      ${t}<br />
                      ${On("coordinate_config.longitude",this.hass.language)}:
                      ${a}<br />
                      ${On("coordinate_config.elevation",this.hass.language)}:
                      ${i}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){return this.config&&this.data&&this.hass?V`
      <ha-card
        header="${On("days_between_irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          ${On("days_between_irrigation.description",this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(On("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,(e=>this.handleConfigChange({days_between_irrigation:parseInt(e)})),1)}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${On("days_between_irrigation.help_text",this.hass.language)}
            </div>
          </div>
        </div>
      </ha-card>
    `:V``}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this._scheduleUpdate(),await(t=this.hass,a=this.data,t.callApi("POST",ze+"/config",a))}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),zt(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var t,a}}handleConfigChange(e){this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback()}_textRow(e,t,a,i){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==a?"":String(a)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_timeRow(e,t,a){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <input
          class="field"
          type="time"
          .value=${t?String(t):""}
          @change=${e=>a(e.target.value)}
        />
      </div>
    `}_numRow(e,t,a,i,n=1,s=!1){const r=(String(n).split(".")[1]||"").length,o=(e,t)=>{const a=parseFloat(e.value),s=+((isNaN(a)?0:a)+t*n).toFixed(r);e.value=String(s),i(String(s))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${s}
            .value=${null==a?"":String(a)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${In}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Bn}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,a){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${a}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Rn}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,a,i=!1,n=!1){return V`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${a}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}static get styles(){return h`
      ${Yn} ${Gn} /* View-specific styles only - most common styles are now in globalStyle */

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
      .triggers-list {
        margin: 16px 0;
      }

      .no-triggers {
        text-align: center;
        padding: 32px 16px;
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
        text-align: center;
      }

      .add-trigger-section ha-button {
        --mdc-theme-primary: var(--primary-color);
      }

      .add-trigger-section ha-icon {
        margin-right: 8px;
      }
    `}};s([fe()],qn.prototype,"narrow",void 0),s([fe()],qn.prototype,"path",void 0),s([fe()],qn.prototype,"data",void 0),s([fe()],qn.prototype,"config",void 0),s([fe({type:Boolean})],qn.prototype,"isLoading",void 0),s([fe({type:Boolean})],qn.prototype,"isSaving",void 0),qn=s([ge("smart-irrigation-view-general")],qn);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:Zn}=le,Kn=()=>document.createComment(""),Xn=(e,t,a)=>{var i;const n=e._$AA.parentNode,s=void 0===t?e._$AB:t._$AA;if(void 0===a){const t=n.insertBefore(Kn(),s),i=n.insertBefore(Kn(),s);a=new Zn(t,i,e,e.options)}else{const t=a._$AB.nextSibling,r=a._$AM,o=r!==e;if(o){let t;null===(i=a._$AQ)||void 0===i||i.call(a,e),a._$AM=e,void 0!==a._$AP&&(t=e._$AU)!==r._$AU&&a._$AP(t)}if(t!==s||o){let e=a._$AA;for(;e!==t;){const t=e.nextSibling;n.insertBefore(e,s),e=t}}}return a},Jn=(e,t,a=e)=>(e._$AI(t,a),e),Qn={},es=(e,t=Qn)=>e._$AH=t,ts=e=>{var t;null===(t=e._$AP)||void 0===t||t.call(e,!1,!0);let a=e._$AA;const i=e._$AB.nextSibling;for(;a!==i;){const e=a.nextSibling;a.remove(),a=e}},as=(e,t,a)=>{const i=new Map;for(let n=t;n<=a;n++)i.set(e[n],n);return i},is=yt(class extends wt{constructor(e){if(super(e),e.type!==_t)throw Error("repeat() can only be used in text expressions")}ct(e,t,a){let i;void 0===a?a=t:void 0!==t&&(i=t);const n=[],s=[];let r=0;for(const t of e)n[r]=i?i(t,r):r,s[r]=a(t,r),r++;return{values:s,keys:n}}render(e,t,a){return this.ct(e,t,a).values}update(e,[t,a,i]){var n;const s=(e=>e._$AH)(e),{values:r,keys:o}=this.ct(t,a,i);if(!Array.isArray(s))return this.ut=o,r;const l=null!==(n=this.ut)&&void 0!==n?n:this.ut=[],d=[];let u,c,h=0,p=s.length-1,g=0,m=r.length-1;for(;h<=p&&g<=m;)if(null===s[h])h++;else if(null===s[p])p--;else if(l[h]===o[g])d[g]=Jn(s[h],r[g]),h++,g++;else if(l[p]===o[m])d[m]=Jn(s[p],r[m]),p--,m--;else if(l[h]===o[m])d[m]=Jn(s[h],r[m]),Xn(e,d[m+1],s[h]),h++,m--;else if(l[p]===o[g])d[g]=Jn(s[p],r[g]),Xn(e,s[h],s[p]),p--,g++;else if(void 0===u&&(u=as(o,g,m),c=as(l,h,p)),u.has(l[h]))if(u.has(l[p])){const t=c.get(o[g]),a=void 0!==t?s[t]:null;if(null===a){const t=Xn(e,s[h]);Jn(t,r[g]),d[g]=t}else d[g]=Jn(a,r[g]),Xn(e,s[h],a),s[t]=null;g++}else ts(s[p]),p--;else ts(s[h]),h++;for(;g<=m;){const t=Xn(e,d[m+1]);Jn(t,r[g]),d[g++]=t}for(;h<=p;){const e=s[h++];null!==e&&ts(e)}return this.ut=o,es(e,d),W}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var ns,ss;function rs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function os(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth"}(ns||(ns={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(ss||(ss={}));var ls,ds={exports:{}};var us=(ls||(ls=1,function(e){e.exports=function(){var t,a;function i(){return t.apply(null,arguments)}function n(e){t=e}function s(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function r(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function l(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(o(e,t))return!1;return!0}function d(e){return void 0===e}function u(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function c(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function h(e,t){var a,i=[],n=e.length;for(a=0;a<n;++a)i.push(t(e[a],a));return i}function p(e,t){for(var a in t)o(t,a)&&(e[a]=t[a]);return o(t,"toString")&&(e.toString=t.toString),o(t,"valueOf")&&(e.valueOf=t.valueOf),e}function g(e,t,a,i){return Ga(e,t,a,i,!0).utc()}function m(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function f(e){return null==e._pf&&(e._pf=m()),e._pf}function v(e){var t=null,i=!1,n=e._d&&!isNaN(e._d.getTime());return n&&(t=f(e),i=a.call(t.parsedDateParts,(function(e){return null!=e})),n=t.overflow<0&&!t.empty&&!t.invalidEra&&!t.invalidMonth&&!t.invalidWeekday&&!t.weekdayMismatch&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated&&(!t.meridiem||t.meridiem&&i),e._strict&&(n=n&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?n:(e._isValid=n,e._isValid)}function b(e){var t=g(NaN);return null!=e?p(f(t),e):f(t).userInvalidated=!0,t}a=Array.prototype.some?Array.prototype.some:function(e){var t,a=Object(this),i=a.length>>>0;for(t=0;t<i;t++)if(t in a&&e.call(this,a[t],t,a))return!0;return!1};var _=i.momentProperties=[],y=!1;function w(e,t){var a,i,n,s=_.length;if(d(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),d(t._i)||(e._i=t._i),d(t._f)||(e._f=t._f),d(t._l)||(e._l=t._l),d(t._strict)||(e._strict=t._strict),d(t._tzm)||(e._tzm=t._tzm),d(t._isUTC)||(e._isUTC=t._isUTC),d(t._offset)||(e._offset=t._offset),d(t._pf)||(e._pf=f(t)),d(t._locale)||(e._locale=t._locale),s>0)for(a=0;a<s;a++)d(n=t[i=_[a]])||(e[i]=n);return e}function x(e){w(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===y&&(y=!0,i.updateOffset(this),y=!1)}function k(e){return e instanceof x||null!=e&&null!=e._isAMomentObject}function $(e){!1===i.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function S(e,t){var a=!0;return p((function(){if(null!=i.deprecationHandler&&i.deprecationHandler(null,e),a){var n,s,r,l=[],d=arguments.length;for(s=0;s<d;s++){if(n="","object"==typeof arguments[s]){for(r in n+="\n["+s+"] ",arguments[0])o(arguments[0],r)&&(n+=r+": "+arguments[0][r]+", ");n=n.slice(0,-2)}else n=arguments[s];l.push(n)}$(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),a=!1}return t.apply(this,arguments)}),t)}var z,A={};function E(e,t){null!=i.deprecationHandler&&i.deprecationHandler(e,t),A[e]||($(t),A[e]=!0)}function T(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}function M(e){var t,a;for(a in e)o(e,a)&&(T(t=e[a])?this[a]=t:this["_"+a]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function D(e,t){var a,i=p({},e);for(a in t)o(t,a)&&(r(e[a])&&r(t[a])?(i[a]={},p(i[a],e[a]),p(i[a],t[a])):null!=t[a]?i[a]=t[a]:delete i[a]);for(a in e)o(e,a)&&!o(t,a)&&r(e[a])&&(i[a]=p({},i[a]));return i}function C(e){null!=e&&this.set(e)}i.suppressDeprecationWarnings=!1,i.deprecationHandler=null,z=Object.keys?Object.keys:function(e){var t,a=[];for(t in e)o(e,t)&&a.push(t);return a};var O={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function H(e,t,a){var i=this._calendar[e]||this._calendar.sameElse;return T(i)?i.call(t,a):i}function N(e,t,a){var i=""+Math.abs(e),n=t-i.length;return(e>=0?a?"+":"":"-")+Math.pow(10,Math.max(0,n)).toString().substr(1)+i}var P=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,L=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,j={},R={};function I(e,t,a,i){var n=i;"string"==typeof i&&(n=function(){return this[i]()}),e&&(R[e]=n),t&&(R[t[0]]=function(){return N(n.apply(this,arguments),t[1],t[2])}),a&&(R[a]=function(){return this.localeData().ordinal(n.apply(this,arguments),e)})}function U(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function B(e){var t,a,i=e.match(P);for(t=0,a=i.length;t<a;t++)R[i[t]]?i[t]=R[i[t]]:i[t]=U(i[t]);return function(t){var n,s="";for(n=0;n<a;n++)s+=T(i[n])?i[n].call(t,e):i[n];return s}}function F(e,t){return e.isValid()?(t=Y(t,e.localeData()),j[t]=j[t]||B(t),j[t](e)):e.localeData().invalidDate()}function Y(e,t){var a=5;function i(e){return t.longDateFormat(e)||e}for(L.lastIndex=0;a>=0&&L.test(e);)e=e.replace(L,i),L.lastIndex=0,a-=1;return e}var V={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function W(e){var t=this._longDateFormat[e],a=this._longDateFormat[e.toUpperCase()];return t||!a?t:(this._longDateFormat[e]=a.match(P).map((function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e})).join(""),this._longDateFormat[e])}var G="Invalid date";function q(){return this._invalidDate}var Z="%d",K=/\d{1,2}/;function X(e){return this._ordinal.replace("%d",e)}var J={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function Q(e,t,a,i){var n=this._relativeTime[a];return T(n)?n(e,t,a,i):n.replace(/%d/i,e)}function ee(e,t){var a=this._relativeTime[e>0?"future":"past"];return T(a)?a(t):a.replace(/%s/i,t)}var te={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function ae(e){return"string"==typeof e?te[e]||te[e.toLowerCase()]:void 0}function ie(e){var t,a,i={};for(a in e)o(e,a)&&(t=ae(a))&&(i[t]=e[a]);return i}var ne={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function se(e){var t,a=[];for(t in e)o(e,t)&&a.push({unit:t,priority:ne[t]});return a.sort((function(e,t){return e.priority-t.priority})),a}var re,oe=/\d/,le=/\d\d/,de=/\d{3}/,ue=/\d{4}/,ce=/[+-]?\d{6}/,he=/\d\d?/,pe=/\d\d\d\d?/,ge=/\d\d\d\d\d\d?/,me=/\d{1,3}/,fe=/\d{1,4}/,ve=/[+-]?\d{1,6}/,be=/\d+/,_e=/[+-]?\d+/,ye=/Z|[+-]\d\d:?\d\d/gi,we=/Z|[+-]\d\d(?::?\d\d)?/gi,xe=/[+-]?\d+(\.\d{1,3})?/,ke=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,$e=/^[1-9]\d?/,Se=/^([1-9]\d|\d)/;function ze(e,t,a){re[e]=T(t)?t:function(e,i){return e&&a?a:t}}function Ae(e,t){return o(re,e)?re[e](t._strict,t._locale):new RegExp(Ee(e))}function Ee(e){return Te(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,(function(e,t,a,i,n){return t||a||i||n})))}function Te(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Me(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function De(e){var t=+e,a=0;return 0!==t&&isFinite(t)&&(a=Me(t)),a}re={};var Ce={};function Oe(e,t){var a,i,n=t;for("string"==typeof e&&(e=[e]),u(t)&&(n=function(e,a){a[t]=De(e)}),i=e.length,a=0;a<i;a++)Ce[e[a]]=n}function He(e,t){Oe(e,(function(e,a,i,n){i._w=i._w||{},t(e,i._w,i,n)}))}function Ne(e,t,a){null!=t&&o(Ce,e)&&Ce[e](t,a._a,a,e)}function Pe(e){return e%4==0&&e%100!=0||e%400==0}var Le=0,je=1,Re=2,Ie=3,Ue=4,Be=5,Fe=6,Ye=7,Ve=8;function We(e){return Pe(e)?366:365}I("Y",0,0,(function(){var e=this.year();return e<=9999?N(e,4):"+"+e})),I(0,["YY",2],0,(function(){return this.year()%100})),I(0,["YYYY",4],0,"year"),I(0,["YYYYY",5],0,"year"),I(0,["YYYYYY",6,!0],0,"year"),ze("Y",_e),ze("YY",he,le),ze("YYYY",fe,ue),ze("YYYYY",ve,ce),ze("YYYYYY",ve,ce),Oe(["YYYYY","YYYYYY"],Le),Oe("YYYY",(function(e,t){t[Le]=2===e.length?i.parseTwoDigitYear(e):De(e)})),Oe("YY",(function(e,t){t[Le]=i.parseTwoDigitYear(e)})),Oe("Y",(function(e,t){t[Le]=parseInt(e,10)})),i.parseTwoDigitYear=function(e){return De(e)+(De(e)>68?1900:2e3)};var Ge,qe=Ke("FullYear",!0);function Ze(){return Pe(this.year())}function Ke(e,t){return function(a){return null!=a?(Je(this,e,a),i.updateOffset(this,t),this):Xe(this,e)}}function Xe(e,t){if(!e.isValid())return NaN;var a=e._d,i=e._isUTC;switch(t){case"Milliseconds":return i?a.getUTCMilliseconds():a.getMilliseconds();case"Seconds":return i?a.getUTCSeconds():a.getSeconds();case"Minutes":return i?a.getUTCMinutes():a.getMinutes();case"Hours":return i?a.getUTCHours():a.getHours();case"Date":return i?a.getUTCDate():a.getDate();case"Day":return i?a.getUTCDay():a.getDay();case"Month":return i?a.getUTCMonth():a.getMonth();case"FullYear":return i?a.getUTCFullYear():a.getFullYear();default:return NaN}}function Je(e,t,a){var i,n,s,r,o;if(e.isValid()&&!isNaN(a)){switch(i=e._d,n=e._isUTC,t){case"Milliseconds":return void(n?i.setUTCMilliseconds(a):i.setMilliseconds(a));case"Seconds":return void(n?i.setUTCSeconds(a):i.setSeconds(a));case"Minutes":return void(n?i.setUTCMinutes(a):i.setMinutes(a));case"Hours":return void(n?i.setUTCHours(a):i.setHours(a));case"Date":return void(n?i.setUTCDate(a):i.setDate(a));case"FullYear":break;default:return}s=a,r=e.month(),o=29!==(o=e.date())||1!==r||Pe(s)?o:28,n?i.setUTCFullYear(s,r,o):i.setFullYear(s,r,o)}}function Qe(e){return T(this[e=ae(e)])?this[e]():this}function et(e,t){if("object"==typeof e){var a,i=se(e=ie(e)),n=i.length;for(a=0;a<n;a++)this[i[a].unit](e[i[a].unit])}else if(T(this[e=ae(e)]))return this[e](t);return this}function tt(e,t){return(e%t+t)%t}function at(e,t){if(isNaN(e)||isNaN(t))return NaN;var a=tt(t,12);return e+=(t-a)/12,1===a?Pe(e)?29:28:31-a%7%2}Ge=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},I("M",["MM",2],"Mo",(function(){return this.month()+1})),I("MMM",0,0,(function(e){return this.localeData().monthsShort(this,e)})),I("MMMM",0,0,(function(e){return this.localeData().months(this,e)})),ze("M",he,$e),ze("MM",he,le),ze("MMM",(function(e,t){return t.monthsShortRegex(e)})),ze("MMMM",(function(e,t){return t.monthsRegex(e)})),Oe(["M","MM"],(function(e,t){t[je]=De(e)-1})),Oe(["MMM","MMMM"],(function(e,t,a,i){var n=a._locale.monthsParse(e,i,a._strict);null!=n?t[je]=n:f(a).invalidMonth=e}));var it="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),nt="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),st=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,rt=ke,ot=ke;function lt(e,t){return e?s(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||st).test(t)?"format":"standalone"][e.month()]:s(this._months)?this._months:this._months.standalone}function dt(e,t){return e?s(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[st.test(t)?"format":"standalone"][e.month()]:s(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function ut(e,t,a){var i,n,s,r=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],i=0;i<12;++i)s=g([2e3,i]),this._shortMonthsParse[i]=this.monthsShort(s,"").toLocaleLowerCase(),this._longMonthsParse[i]=this.months(s,"").toLocaleLowerCase();return a?"MMM"===t?-1!==(n=Ge.call(this._shortMonthsParse,r))?n:null:-1!==(n=Ge.call(this._longMonthsParse,r))?n:null:"MMM"===t?-1!==(n=Ge.call(this._shortMonthsParse,r))||-1!==(n=Ge.call(this._longMonthsParse,r))?n:null:-1!==(n=Ge.call(this._longMonthsParse,r))||-1!==(n=Ge.call(this._shortMonthsParse,r))?n:null}function ct(e,t,a){var i,n,s;if(this._monthsParseExact)return ut.call(this,e,t,a);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),i=0;i<12;i++){if(n=g([2e3,i]),a&&!this._longMonthsParse[i]&&(this._longMonthsParse[i]=new RegExp("^"+this.months(n,"").replace(".","")+"$","i"),this._shortMonthsParse[i]=new RegExp("^"+this.monthsShort(n,"").replace(".","")+"$","i")),a||this._monthsParse[i]||(s="^"+this.months(n,"")+"|^"+this.monthsShort(n,""),this._monthsParse[i]=new RegExp(s.replace(".",""),"i")),a&&"MMMM"===t&&this._longMonthsParse[i].test(e))return i;if(a&&"MMM"===t&&this._shortMonthsParse[i].test(e))return i;if(!a&&this._monthsParse[i].test(e))return i}}function ht(e,t){if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=De(t);else if(!u(t=e.localeData().monthsParse(t)))return e;var a=t,i=e.date();return i=i<29?i:Math.min(i,at(e.year(),a)),e._isUTC?e._d.setUTCMonth(a,i):e._d.setMonth(a,i),e}function pt(e){return null!=e?(ht(this,e),i.updateOffset(this,!0),this):Xe(this,"Month")}function gt(){return at(this.year(),this.month())}function mt(e){return this._monthsParseExact?(o(this,"_monthsRegex")||vt.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(o(this,"_monthsShortRegex")||(this._monthsShortRegex=rt),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function ft(e){return this._monthsParseExact?(o(this,"_monthsRegex")||vt.call(this),e?this._monthsStrictRegex:this._monthsRegex):(o(this,"_monthsRegex")||(this._monthsRegex=ot),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function vt(){function e(e,t){return t.length-e.length}var t,a,i,n,s=[],r=[],o=[];for(t=0;t<12;t++)a=g([2e3,t]),i=Te(this.monthsShort(a,"")),n=Te(this.months(a,"")),s.push(i),r.push(n),o.push(n),o.push(i);s.sort(e),r.sort(e),o.sort(e),this._monthsRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+s.join("|")+")","i")}function bt(e,t,a,i,n,s,r){var o;return e<100&&e>=0?(o=new Date(e+400,t,a,i,n,s,r),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,t,a,i,n,s,r),o}function _t(e){var t,a;return e<100&&e>=0?((a=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,a)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function yt(e,t,a){var i=7+t-a;return-(7+_t(e,0,i).getUTCDay()-t)%7+i-1}function wt(e,t,a,i,n){var s,r,o=1+7*(t-1)+(7+a-i)%7+yt(e,i,n);return o<=0?r=We(s=e-1)+o:o>We(e)?(s=e+1,r=o-We(e)):(s=e,r=o),{year:s,dayOfYear:r}}function xt(e,t,a){var i,n,s=yt(e.year(),t,a),r=Math.floor((e.dayOfYear()-s-1)/7)+1;return r<1?i=r+kt(n=e.year()-1,t,a):r>kt(e.year(),t,a)?(i=r-kt(e.year(),t,a),n=e.year()+1):(n=e.year(),i=r),{week:i,year:n}}function kt(e,t,a){var i=yt(e,t,a),n=yt(e+1,t,a);return(We(e)-i+n)/7}function $t(e){return xt(e,this._week.dow,this._week.doy).week}I("w",["ww",2],"wo","week"),I("W",["WW",2],"Wo","isoWeek"),ze("w",he,$e),ze("ww",he,le),ze("W",he,$e),ze("WW",he,le),He(["w","ww","W","WW"],(function(e,t,a,i){t[i.substr(0,1)]=De(e)}));var St={dow:0,doy:6};function zt(){return this._week.dow}function At(){return this._week.doy}function Et(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function Tt(e){var t=xt(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function Mt(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function Dt(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function Ct(e,t){return e.slice(t,7).concat(e.slice(0,t))}I("d",0,"do","day"),I("dd",0,0,(function(e){return this.localeData().weekdaysMin(this,e)})),I("ddd",0,0,(function(e){return this.localeData().weekdaysShort(this,e)})),I("dddd",0,0,(function(e){return this.localeData().weekdays(this,e)})),I("e",0,0,"weekday"),I("E",0,0,"isoWeekday"),ze("d",he),ze("e",he),ze("E",he),ze("dd",(function(e,t){return t.weekdaysMinRegex(e)})),ze("ddd",(function(e,t){return t.weekdaysShortRegex(e)})),ze("dddd",(function(e,t){return t.weekdaysRegex(e)})),He(["dd","ddd","dddd"],(function(e,t,a,i){var n=a._locale.weekdaysParse(e,i,a._strict);null!=n?t.d=n:f(a).invalidWeekday=e})),He(["d","e","E"],(function(e,t,a,i){t[i]=De(e)}));var Ot="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Ht="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Nt="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),Pt=ke,Lt=ke,jt=ke;function Rt(e,t){var a=s(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"];return!0===e?Ct(a,this._week.dow):e?a[e.day()]:a}function It(e){return!0===e?Ct(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function Ut(e){return!0===e?Ct(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function Bt(e,t,a){var i,n,s,r=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],i=0;i<7;++i)s=g([2e3,1]).day(i),this._minWeekdaysParse[i]=this.weekdaysMin(s,"").toLocaleLowerCase(),this._shortWeekdaysParse[i]=this.weekdaysShort(s,"").toLocaleLowerCase(),this._weekdaysParse[i]=this.weekdays(s,"").toLocaleLowerCase();return a?"dddd"===t?-1!==(n=Ge.call(this._weekdaysParse,r))?n:null:"ddd"===t?-1!==(n=Ge.call(this._shortWeekdaysParse,r))?n:null:-1!==(n=Ge.call(this._minWeekdaysParse,r))?n:null:"dddd"===t?-1!==(n=Ge.call(this._weekdaysParse,r))||-1!==(n=Ge.call(this._shortWeekdaysParse,r))||-1!==(n=Ge.call(this._minWeekdaysParse,r))?n:null:"ddd"===t?-1!==(n=Ge.call(this._shortWeekdaysParse,r))||-1!==(n=Ge.call(this._weekdaysParse,r))||-1!==(n=Ge.call(this._minWeekdaysParse,r))?n:null:-1!==(n=Ge.call(this._minWeekdaysParse,r))||-1!==(n=Ge.call(this._weekdaysParse,r))||-1!==(n=Ge.call(this._shortWeekdaysParse,r))?n:null}function Ft(e,t,a){var i,n,s;if(this._weekdaysParseExact)return Bt.call(this,e,t,a);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),i=0;i<7;i++){if(n=g([2e3,1]).day(i),a&&!this._fullWeekdaysParse[i]&&(this._fullWeekdaysParse[i]=new RegExp("^"+this.weekdays(n,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[i]=new RegExp("^"+this.weekdaysShort(n,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[i]=new RegExp("^"+this.weekdaysMin(n,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[i]||(s="^"+this.weekdays(n,"")+"|^"+this.weekdaysShort(n,"")+"|^"+this.weekdaysMin(n,""),this._weekdaysParse[i]=new RegExp(s.replace(".",""),"i")),a&&"dddd"===t&&this._fullWeekdaysParse[i].test(e))return i;if(a&&"ddd"===t&&this._shortWeekdaysParse[i].test(e))return i;if(a&&"dd"===t&&this._minWeekdaysParse[i].test(e))return i;if(!a&&this._weekdaysParse[i].test(e))return i}}function Yt(e){if(!this.isValid())return null!=e?this:NaN;var t=Xe(this,"Day");return null!=e?(e=Mt(e,this.localeData()),this.add(e-t,"d")):t}function Vt(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function Wt(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=Dt(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7}function Gt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||Kt.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(o(this,"_weekdaysRegex")||(this._weekdaysRegex=Pt),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function qt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||Kt.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(o(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=Lt),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Zt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||Kt.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(o(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=jt),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Kt(){function e(e,t){return t.length-e.length}var t,a,i,n,s,r=[],o=[],l=[],d=[];for(t=0;t<7;t++)a=g([2e3,1]).day(t),i=Te(this.weekdaysMin(a,"")),n=Te(this.weekdaysShort(a,"")),s=Te(this.weekdays(a,"")),r.push(i),o.push(n),l.push(s),d.push(i),d.push(n),d.push(s);r.sort(e),o.sort(e),l.sort(e),d.sort(e),this._weekdaysRegex=new RegExp("^("+d.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+r.join("|")+")","i")}function Xt(){return this.hours()%12||12}function Jt(){return this.hours()||24}function Qt(e,t){I(e,0,0,(function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)}))}function ea(e,t){return t._meridiemParse}function ta(e){return"p"===(e+"").toLowerCase().charAt(0)}I("H",["HH",2],0,"hour"),I("h",["hh",2],0,Xt),I("k",["kk",2],0,Jt),I("hmm",0,0,(function(){return""+Xt.apply(this)+N(this.minutes(),2)})),I("hmmss",0,0,(function(){return""+Xt.apply(this)+N(this.minutes(),2)+N(this.seconds(),2)})),I("Hmm",0,0,(function(){return""+this.hours()+N(this.minutes(),2)})),I("Hmmss",0,0,(function(){return""+this.hours()+N(this.minutes(),2)+N(this.seconds(),2)})),Qt("a",!0),Qt("A",!1),ze("a",ea),ze("A",ea),ze("H",he,Se),ze("h",he,$e),ze("k",he,$e),ze("HH",he,le),ze("hh",he,le),ze("kk",he,le),ze("hmm",pe),ze("hmmss",ge),ze("Hmm",pe),ze("Hmmss",ge),Oe(["H","HH"],Ie),Oe(["k","kk"],(function(e,t,a){var i=De(e);t[Ie]=24===i?0:i})),Oe(["a","A"],(function(e,t,a){a._isPm=a._locale.isPM(e),a._meridiem=e})),Oe(["h","hh"],(function(e,t,a){t[Ie]=De(e),f(a).bigHour=!0})),Oe("hmm",(function(e,t,a){var i=e.length-2;t[Ie]=De(e.substr(0,i)),t[Ue]=De(e.substr(i)),f(a).bigHour=!0})),Oe("hmmss",(function(e,t,a){var i=e.length-4,n=e.length-2;t[Ie]=De(e.substr(0,i)),t[Ue]=De(e.substr(i,2)),t[Be]=De(e.substr(n)),f(a).bigHour=!0})),Oe("Hmm",(function(e,t,a){var i=e.length-2;t[Ie]=De(e.substr(0,i)),t[Ue]=De(e.substr(i))})),Oe("Hmmss",(function(e,t,a){var i=e.length-4,n=e.length-2;t[Ie]=De(e.substr(0,i)),t[Ue]=De(e.substr(i,2)),t[Be]=De(e.substr(n))}));var aa=/[ap]\.?m?\.?/i,ia=Ke("Hours",!0);function na(e,t,a){return e>11?a?"pm":"PM":a?"am":"AM"}var sa,ra={calendar:O,longDateFormat:V,invalidDate:G,ordinal:Z,dayOfMonthOrdinalParse:K,relativeTime:J,months:it,monthsShort:nt,week:St,weekdays:Ot,weekdaysMin:Nt,weekdaysShort:Ht,meridiemParse:aa},oa={},la={};function da(e,t){var a,i=Math.min(e.length,t.length);for(a=0;a<i;a+=1)if(e[a]!==t[a])return a;return i}function ua(e){return e?e.toLowerCase().replace("_","-"):e}function ca(e){for(var t,a,i,n,s=0;s<e.length;){for(t=(n=ua(e[s]).split("-")).length,a=(a=ua(e[s+1]))?a.split("-"):null;t>0;){if(i=pa(n.slice(0,t).join("-")))return i;if(a&&a.length>=t&&da(n,a)>=t-1)break;t--}s++}return sa}function ha(e){return!(!e||!e.match("^[^/\\\\]*$"))}function pa(t){var a=null;if(void 0===oa[t]&&e&&e.exports&&ha(t))try{a=sa._abbr,os("./locale/"+t),ga(a)}catch(e){oa[t]=null}return oa[t]}function ga(e,t){var a;return e&&((a=d(t)?va(e):ma(e,t))?sa=a:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),sa._abbr}function ma(e,t){if(null!==t){var a,i=ra;if(t.abbr=e,null!=oa[e])E("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),i=oa[e]._config;else if(null!=t.parentLocale)if(null!=oa[t.parentLocale])i=oa[t.parentLocale]._config;else{if(null==(a=pa(t.parentLocale)))return la[t.parentLocale]||(la[t.parentLocale]=[]),la[t.parentLocale].push({name:e,config:t}),null;i=a._config}return oa[e]=new C(D(i,t)),la[e]&&la[e].forEach((function(e){ma(e.name,e.config)})),ga(e),oa[e]}return delete oa[e],null}function fa(e,t){if(null!=t){var a,i,n=ra;null!=oa[e]&&null!=oa[e].parentLocale?oa[e].set(D(oa[e]._config,t)):(null!=(i=pa(e))&&(n=i._config),t=D(n,t),null==i&&(t.abbr=e),(a=new C(t)).parentLocale=oa[e],oa[e]=a),ga(e)}else null!=oa[e]&&(null!=oa[e].parentLocale?(oa[e]=oa[e].parentLocale,e===ga()&&ga(e)):null!=oa[e]&&delete oa[e]);return oa[e]}function va(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return sa;if(!s(e)){if(t=pa(e))return t;e=[e]}return ca(e)}function ba(){return z(oa)}function _a(e){var t,a=e._a;return a&&-2===f(e).overflow&&(t=a[je]<0||a[je]>11?je:a[Re]<1||a[Re]>at(a[Le],a[je])?Re:a[Ie]<0||a[Ie]>24||24===a[Ie]&&(0!==a[Ue]||0!==a[Be]||0!==a[Fe])?Ie:a[Ue]<0||a[Ue]>59?Ue:a[Be]<0||a[Be]>59?Be:a[Fe]<0||a[Fe]>999?Fe:-1,f(e)._overflowDayOfYear&&(t<Le||t>Re)&&(t=Re),f(e)._overflowWeeks&&-1===t&&(t=Ye),f(e)._overflowWeekday&&-1===t&&(t=Ve),f(e).overflow=t),e}var ya=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,wa=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,xa=/Z|[+-]\d\d(?::?\d\d)?/,ka=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],$a=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Sa=/^\/?Date\((-?\d+)/i,za=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Aa={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Ea(e){var t,a,i,n,s,r,o=e._i,l=ya.exec(o)||wa.exec(o),d=ka.length,u=$a.length;if(l){for(f(e).iso=!0,t=0,a=d;t<a;t++)if(ka[t][1].exec(l[1])){n=ka[t][0],i=!1!==ka[t][2];break}if(null==n)return void(e._isValid=!1);if(l[3]){for(t=0,a=u;t<a;t++)if($a[t][1].exec(l[3])){s=(l[2]||" ")+$a[t][0];break}if(null==s)return void(e._isValid=!1)}if(!i&&null!=s)return void(e._isValid=!1);if(l[4]){if(!xa.exec(l[4]))return void(e._isValid=!1);r="Z"}e._f=n+(s||"")+(r||""),Ia(e)}else e._isValid=!1}function Ta(e,t,a,i,n,s){var r=[Ma(e),nt.indexOf(t),parseInt(a,10),parseInt(i,10),parseInt(n,10)];return s&&r.push(parseInt(s,10)),r}function Ma(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function Da(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function Ca(e,t,a){return!e||Ht.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(f(a).weekdayMismatch=!0,a._isValid=!1,!1)}function Oa(e,t,a){if(e)return Aa[e];if(t)return 0;var i=parseInt(a,10),n=i%100;return(i-n)/100*60+n}function Ha(e){var t,a=za.exec(Da(e._i));if(a){if(t=Ta(a[4],a[3],a[2],a[5],a[6],a[7]),!Ca(a[1],t,e))return;e._a=t,e._tzm=Oa(a[8],a[9],a[10]),e._d=_t.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),f(e).rfc2822=!0}else e._isValid=!1}function Na(e){var t=Sa.exec(e._i);null===t?(Ea(e),!1===e._isValid&&(delete e._isValid,Ha(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:i.createFromInputFallback(e)))):e._d=new Date(+t[1])}function Pa(e,t,a){return null!=e?e:null!=t?t:a}function La(e){var t=new Date(i.now());return e._useUTC?[t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()]:[t.getFullYear(),t.getMonth(),t.getDate()]}function ja(e){var t,a,i,n,s,r=[];if(!e._d){for(i=La(e),e._w&&null==e._a[Re]&&null==e._a[je]&&Ra(e),null!=e._dayOfYear&&(s=Pa(e._a[Le],i[Le]),(e._dayOfYear>We(s)||0===e._dayOfYear)&&(f(e)._overflowDayOfYear=!0),a=_t(s,0,e._dayOfYear),e._a[je]=a.getUTCMonth(),e._a[Re]=a.getUTCDate()),t=0;t<3&&null==e._a[t];++t)e._a[t]=r[t]=i[t];for(;t<7;t++)e._a[t]=r[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[Ie]&&0===e._a[Ue]&&0===e._a[Be]&&0===e._a[Fe]&&(e._nextDay=!0,e._a[Ie]=0),e._d=(e._useUTC?_t:bt).apply(null,r),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[Ie]=24),e._w&&void 0!==e._w.d&&e._w.d!==n&&(f(e).weekdayMismatch=!0)}}function Ra(e){var t,a,i,n,s,r,o,l,d;null!=(t=e._w).GG||null!=t.W||null!=t.E?(s=1,r=4,a=Pa(t.GG,e._a[Le],xt(qa(),1,4).year),i=Pa(t.W,1),((n=Pa(t.E,1))<1||n>7)&&(l=!0)):(s=e._locale._week.dow,r=e._locale._week.doy,d=xt(qa(),s,r),a=Pa(t.gg,e._a[Le],d.year),i=Pa(t.w,d.week),null!=t.d?((n=t.d)<0||n>6)&&(l=!0):null!=t.e?(n=t.e+s,(t.e<0||t.e>6)&&(l=!0)):n=s),i<1||i>kt(a,s,r)?f(e)._overflowWeeks=!0:null!=l?f(e)._overflowWeekday=!0:(o=wt(a,i,n,s,r),e._a[Le]=o.year,e._dayOfYear=o.dayOfYear)}function Ia(e){if(e._f!==i.ISO_8601)if(e._f!==i.RFC_2822){e._a=[],f(e).empty=!0;var t,a,n,s,r,o,l,d=""+e._i,u=d.length,c=0;for(l=(n=Y(e._f,e._locale).match(P)||[]).length,t=0;t<l;t++)s=n[t],(a=(d.match(Ae(s,e))||[])[0])&&((r=d.substr(0,d.indexOf(a))).length>0&&f(e).unusedInput.push(r),d=d.slice(d.indexOf(a)+a.length),c+=a.length),R[s]?(a?f(e).empty=!1:f(e).unusedTokens.push(s),Ne(s,a,e)):e._strict&&!a&&f(e).unusedTokens.push(s);f(e).charsLeftOver=u-c,d.length>0&&f(e).unusedInput.push(d),e._a[Ie]<=12&&!0===f(e).bigHour&&e._a[Ie]>0&&(f(e).bigHour=void 0),f(e).parsedDateParts=e._a.slice(0),f(e).meridiem=e._meridiem,e._a[Ie]=Ua(e._locale,e._a[Ie],e._meridiem),null!==(o=f(e).era)&&(e._a[Le]=e._locale.erasConvertYear(o,e._a[Le])),ja(e),_a(e)}else Ha(e);else Ea(e)}function Ua(e,t,a){var i;return null==a?t:null!=e.meridiemHour?e.meridiemHour(t,a):null!=e.isPM?((i=e.isPM(a))&&t<12&&(t+=12),i||12!==t||(t=0),t):t}function Ba(e){var t,a,i,n,s,r,o=!1,l=e._f.length;if(0===l)return f(e).invalidFormat=!0,void(e._d=new Date(NaN));for(n=0;n<l;n++)s=0,r=!1,t=w({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._f=e._f[n],Ia(t),v(t)&&(r=!0),s+=f(t).charsLeftOver,s+=10*f(t).unusedTokens.length,f(t).score=s,o?s<i&&(i=s,a=t):(null==i||s<i||r)&&(i=s,a=t,r&&(o=!0));p(e,a||t)}function Fa(e){if(!e._d){var t=ie(e._i),a=void 0===t.day?t.date:t.day;e._a=h([t.year,t.month,a,t.hour,t.minute,t.second,t.millisecond],(function(e){return e&&parseInt(e,10)})),ja(e)}}function Ya(e){var t=new x(_a(Va(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function Va(e){var t=e._i,a=e._f;return e._locale=e._locale||va(e._l),null===t||void 0===a&&""===t?b({nullInput:!0}):("string"==typeof t&&(e._i=t=e._locale.preparse(t)),k(t)?new x(_a(t)):(c(t)?e._d=t:s(a)?Ba(e):a?Ia(e):Wa(e),v(e)||(e._d=null),e))}function Wa(e){var t=e._i;d(t)?e._d=new Date(i.now()):c(t)?e._d=new Date(t.valueOf()):"string"==typeof t?Na(e):s(t)?(e._a=h(t.slice(0),(function(e){return parseInt(e,10)})),ja(e)):r(t)?Fa(e):u(t)?e._d=new Date(t):i.createFromInputFallback(e)}function Ga(e,t,a,i,n){var o={};return!0!==t&&!1!==t||(i=t,t=void 0),!0!==a&&!1!==a||(i=a,a=void 0),(r(e)&&l(e)||s(e)&&0===e.length)&&(e=void 0),o._isAMomentObject=!0,o._useUTC=o._isUTC=n,o._l=a,o._i=e,o._f=t,o._strict=i,Ya(o)}function qa(e,t,a,i){return Ga(e,t,a,i,!1)}i.createFromInputFallback=S("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",(function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))})),i.ISO_8601=function(){},i.RFC_2822=function(){};var Za=S("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=qa.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:b()})),Ka=S("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=qa.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:b()}));function Xa(e,t){var a,i;if(1===t.length&&s(t[0])&&(t=t[0]),!t.length)return qa();for(a=t[0],i=1;i<t.length;++i)t[i].isValid()&&!t[i][e](a)||(a=t[i]);return a}function Ja(){return Xa("isBefore",[].slice.call(arguments,0))}function Qa(){return Xa("isAfter",[].slice.call(arguments,0))}var ei=function(){return Date.now?Date.now():+new Date},ti=["year","quarter","month","week","day","hour","minute","second","millisecond"];function ai(e){var t,a,i=!1,n=ti.length;for(t in e)if(o(e,t)&&(-1===Ge.call(ti,t)||null!=e[t]&&isNaN(e[t])))return!1;for(a=0;a<n;++a)if(e[ti[a]]){if(i)return!1;parseFloat(e[ti[a]])!==De(e[ti[a]])&&(i=!0)}return!0}function ii(){return this._isValid}function ni(){return Ai(NaN)}function si(e){var t=ie(e),a=t.year||0,i=t.quarter||0,n=t.month||0,s=t.week||t.isoWeek||0,r=t.day||0,o=t.hour||0,l=t.minute||0,d=t.second||0,u=t.millisecond||0;this._isValid=ai(t),this._milliseconds=+u+1e3*d+6e4*l+1e3*o*60*60,this._days=+r+7*s,this._months=+n+3*i+12*a,this._data={},this._locale=va(),this._bubble()}function ri(e){return e instanceof si}function oi(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function li(e,t,a){var i,n=Math.min(e.length,t.length),s=Math.abs(e.length-t.length),r=0;for(i=0;i<n;i++)(a&&e[i]!==t[i]||!a&&De(e[i])!==De(t[i]))&&r++;return r+s}function di(e,t){I(e,0,0,(function(){var e=this.utcOffset(),a="+";return e<0&&(e=-e,a="-"),a+N(~~(e/60),2)+t+N(~~e%60,2)}))}di("Z",":"),di("ZZ",""),ze("Z",we),ze("ZZ",we),Oe(["Z","ZZ"],(function(e,t,a){a._useUTC=!0,a._tzm=ci(we,e)}));var ui=/([\+\-]|\d\d)/gi;function ci(e,t){var a,i,n=(t||"").match(e);return null===n?null:0===(i=60*(a=((n[n.length-1]||[])+"").match(ui)||["-",0,0])[1]+De(a[2]))?0:"+"===a[0]?i:-i}function hi(e,t){var a,n;return t._isUTC?(a=t.clone(),n=(k(e)||c(e)?e.valueOf():qa(e).valueOf())-a.valueOf(),a._d.setTime(a._d.valueOf()+n),i.updateOffset(a,!1),a):qa(e).local()}function pi(e){return-Math.round(e._d.getTimezoneOffset())}function gi(e,t,a){var n,s=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=ci(we,e)))return this}else Math.abs(e)<16&&!a&&(e*=60);return!this._isUTC&&t&&(n=pi(this)),this._offset=e,this._isUTC=!0,null!=n&&this.add(n,"m"),s!==e&&(!t||this._changeInProgress?Ci(this,Ai(e-s,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,i.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?s:pi(this)}function mi(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function fi(e){return this.utcOffset(0,e)}function vi(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract(pi(this),"m")),this}function bi(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=ci(ye,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function _i(e){return!!this.isValid()&&(e=e?qa(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function yi(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function wi(){if(!d(this._isDSTShifted))return this._isDSTShifted;var e,t={};return w(t,this),(t=Va(t))._a?(e=t._isUTC?g(t._a):qa(t._a),this._isDSTShifted=this.isValid()&&li(t._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function xi(){return!!this.isValid()&&!this._isUTC}function ki(){return!!this.isValid()&&this._isUTC}function $i(){return!!this.isValid()&&this._isUTC&&0===this._offset}i.updateOffset=function(){};var Si=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,zi=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Ai(e,t){var a,i,n,s=e,r=null;return ri(e)?s={ms:e._milliseconds,d:e._days,M:e._months}:u(e)||!isNaN(+e)?(s={},t?s[t]=+e:s.milliseconds=+e):(r=Si.exec(e))?(a="-"===r[1]?-1:1,s={y:0,d:De(r[Re])*a,h:De(r[Ie])*a,m:De(r[Ue])*a,s:De(r[Be])*a,ms:De(oi(1e3*r[Fe]))*a}):(r=zi.exec(e))?(a="-"===r[1]?-1:1,s={y:Ei(r[2],a),M:Ei(r[3],a),w:Ei(r[4],a),d:Ei(r[5],a),h:Ei(r[6],a),m:Ei(r[7],a),s:Ei(r[8],a)}):null==s?s={}:"object"==typeof s&&("from"in s||"to"in s)&&(n=Mi(qa(s.from),qa(s.to)),(s={}).ms=n.milliseconds,s.M=n.months),i=new si(s),ri(e)&&o(e,"_locale")&&(i._locale=e._locale),ri(e)&&o(e,"_isValid")&&(i._isValid=e._isValid),i}function Ei(e,t){var a=e&&parseFloat(e.replace(",","."));return(isNaN(a)?0:a)*t}function Ti(e,t){var a={};return a.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(a.months,"M").isAfter(t)&&--a.months,a.milliseconds=+t-+e.clone().add(a.months,"M"),a}function Mi(e,t){var a;return e.isValid()&&t.isValid()?(t=hi(t,e),e.isBefore(t)?a=Ti(e,t):((a=Ti(t,e)).milliseconds=-a.milliseconds,a.months=-a.months),a):{milliseconds:0,months:0}}function Di(e,t){return function(a,i){var n;return null===i||isNaN(+i)||(E(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),n=a,a=i,i=n),Ci(this,Ai(a,i),e),this}}function Ci(e,t,a,n){var s=t._milliseconds,r=oi(t._days),o=oi(t._months);e.isValid()&&(n=null==n||n,o&&ht(e,Xe(e,"Month")+o*a),r&&Je(e,"Date",Xe(e,"Date")+r*a),s&&e._d.setTime(e._d.valueOf()+s*a),n&&i.updateOffset(e,r||o))}Ai.fn=si.prototype,Ai.invalid=ni;var Oi=Di(1,"add"),Hi=Di(-1,"subtract");function Ni(e){return"string"==typeof e||e instanceof String}function Pi(e){return k(e)||c(e)||Ni(e)||u(e)||ji(e)||Li(e)||null==e}function Li(e){var t,a,i=r(e)&&!l(e),n=!1,s=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],d=s.length;for(t=0;t<d;t+=1)a=s[t],n=n||o(e,a);return i&&n}function ji(e){var t=s(e),a=!1;return t&&(a=0===e.filter((function(t){return!u(t)&&Ni(e)})).length),t&&a}function Ri(e){var t,a,i=r(e)&&!l(e),n=!1,s=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(t=0;t<s.length;t+=1)a=s[t],n=n||o(e,a);return i&&n}function Ii(e,t){var a=e.diff(t,"days",!0);return a<-6?"sameElse":a<-1?"lastWeek":a<0?"lastDay":a<1?"sameDay":a<2?"nextDay":a<7?"nextWeek":"sameElse"}function Ui(e,t){1===arguments.length&&(arguments[0]?Pi(arguments[0])?(e=arguments[0],t=void 0):Ri(arguments[0])&&(t=arguments[0],e=void 0):(e=void 0,t=void 0));var a=e||qa(),n=hi(a,this).startOf("day"),s=i.calendarFormat(this,n)||"sameElse",r=t&&(T(t[s])?t[s].call(this,a):t[s]);return this.format(r||this.localeData().calendar(s,this,qa(a)))}function Bi(){return new x(this)}function Fi(e,t){var a=k(e)?e:qa(e);return!(!this.isValid()||!a.isValid())&&("millisecond"===(t=ae(t)||"millisecond")?this.valueOf()>a.valueOf():a.valueOf()<this.clone().startOf(t).valueOf())}function Yi(e,t){var a=k(e)?e:qa(e);return!(!this.isValid()||!a.isValid())&&("millisecond"===(t=ae(t)||"millisecond")?this.valueOf()<a.valueOf():this.clone().endOf(t).valueOf()<a.valueOf())}function Vi(e,t,a,i){var n=k(e)?e:qa(e),s=k(t)?t:qa(t);return!!(this.isValid()&&n.isValid()&&s.isValid())&&("("===(i=i||"()")[0]?this.isAfter(n,a):!this.isBefore(n,a))&&(")"===i[1]?this.isBefore(s,a):!this.isAfter(s,a))}function Wi(e,t){var a,i=k(e)?e:qa(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=ae(t)||"millisecond")?this.valueOf()===i.valueOf():(a=i.valueOf(),this.clone().startOf(t).valueOf()<=a&&a<=this.clone().endOf(t).valueOf()))}function Gi(e,t){return this.isSame(e,t)||this.isAfter(e,t)}function qi(e,t){return this.isSame(e,t)||this.isBefore(e,t)}function Zi(e,t,a){var i,n,s;if(!this.isValid())return NaN;if(!(i=hi(e,this)).isValid())return NaN;switch(n=6e4*(i.utcOffset()-this.utcOffset()),t=ae(t)){case"year":s=Ki(this,i)/12;break;case"month":s=Ki(this,i);break;case"quarter":s=Ki(this,i)/3;break;case"second":s=(this-i)/1e3;break;case"minute":s=(this-i)/6e4;break;case"hour":s=(this-i)/36e5;break;case"day":s=(this-i-n)/864e5;break;case"week":s=(this-i-n)/6048e5;break;default:s=this-i}return a?s:Me(s)}function Ki(e,t){if(e.date()<t.date())return-Ki(t,e);var a=12*(t.year()-e.year())+(t.month()-e.month()),i=e.clone().add(a,"months");return-(a+(t-i<0?(t-i)/(i-e.clone().add(a-1,"months")):(t-i)/(e.clone().add(a+1,"months")-i)))||0}function Xi(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function Ji(e){if(!this.isValid())return null;var t=!0!==e,a=t?this.clone().utc():this;return a.year()<0||a.year()>9999?F(a,t?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):T(Date.prototype.toISOString)?t?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",F(a,"Z")):F(a,t?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function Qi(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,t,a,i,n="moment",s="";return this.isLocal()||(n=0===this.utcOffset()?"moment.utc":"moment.parseZone",s="Z"),e="["+n+'("]',t=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",a="-MM-DD[T]HH:mm:ss.SSS",i=s+'[")]',this.format(e+t+a+i)}function en(e){e||(e=this.isUtc()?i.defaultFormatUtc:i.defaultFormat);var t=F(this,e);return this.localeData().postformat(t)}function tn(e,t){return this.isValid()&&(k(e)&&e.isValid()||qa(e).isValid())?Ai({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function an(e){return this.from(qa(),e)}function nn(e,t){return this.isValid()&&(k(e)&&e.isValid()||qa(e).isValid())?Ai({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function sn(e){return this.to(qa(),e)}function rn(e){var t;return void 0===e?this._locale._abbr:(null!=(t=va(e))&&(this._locale=t),this)}i.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",i.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var on=S("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",(function(e){return void 0===e?this.localeData():this.locale(e)}));function ln(){return this._locale}var dn=1e3,un=60*dn,cn=60*un,hn=3506328*cn;function pn(e,t){return(e%t+t)%t}function gn(e,t,a){return e<100&&e>=0?new Date(e+400,t,a)-hn:new Date(e,t,a).valueOf()}function mn(e,t,a){return e<100&&e>=0?Date.UTC(e+400,t,a)-hn:Date.UTC(e,t,a)}function fn(e){var t,a;if(void 0===(e=ae(e))||"millisecond"===e||!this.isValid())return this;switch(a=this._isUTC?mn:gn,e){case"year":t=a(this.year(),0,1);break;case"quarter":t=a(this.year(),this.month()-this.month()%3,1);break;case"month":t=a(this.year(),this.month(),1);break;case"week":t=a(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=a(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=a(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=pn(t+(this._isUTC?0:this.utcOffset()*un),cn);break;case"minute":t=this._d.valueOf(),t-=pn(t,un);break;case"second":t=this._d.valueOf(),t-=pn(t,dn)}return this._d.setTime(t),i.updateOffset(this,!0),this}function vn(e){var t,a;if(void 0===(e=ae(e))||"millisecond"===e||!this.isValid())return this;switch(a=this._isUTC?mn:gn,e){case"year":t=a(this.year()+1,0,1)-1;break;case"quarter":t=a(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=a(this.year(),this.month()+1,1)-1;break;case"week":t=a(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=a(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=a(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=cn-pn(t+(this._isUTC?0:this.utcOffset()*un),cn)-1;break;case"minute":t=this._d.valueOf(),t+=un-pn(t,un)-1;break;case"second":t=this._d.valueOf(),t+=dn-pn(t,dn)-1}return this._d.setTime(t),i.updateOffset(this,!0),this}function bn(){return this._d.valueOf()-6e4*(this._offset||0)}function _n(){return Math.floor(this.valueOf()/1e3)}function yn(){return new Date(this.valueOf())}function wn(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function xn(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function kn(){return this.isValid()?this.toISOString():null}function $n(){return v(this)}function Sn(){return p({},f(this))}function zn(){return f(this).overflow}function An(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function En(e,t){var a,n,s,r=this._eras||va("en")._eras;for(a=0,n=r.length;a<n;++a)switch("string"==typeof r[a].since&&(s=i(r[a].since).startOf("day"),r[a].since=s.valueOf()),typeof r[a].until){case"undefined":r[a].until=1/0;break;case"string":s=i(r[a].until).startOf("day").valueOf(),r[a].until=s.valueOf()}return r}function Tn(e,t,a){var i,n,s,r,o,l=this.eras();for(e=e.toUpperCase(),i=0,n=l.length;i<n;++i)if(s=l[i].name.toUpperCase(),r=l[i].abbr.toUpperCase(),o=l[i].narrow.toUpperCase(),a)switch(t){case"N":case"NN":case"NNN":if(r===e)return l[i];break;case"NNNN":if(s===e)return l[i];break;case"NNNNN":if(o===e)return l[i]}else if([s,r,o].indexOf(e)>=0)return l[i]}function Mn(e,t){var a=e.since<=e.until?1:-1;return void 0===t?i(e.since).year():i(e.since).year()+(t-e.offset)*a}function Dn(){var e,t,a,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(a=this.clone().startOf("day").valueOf(),i[e].since<=a&&a<=i[e].until)return i[e].name;if(i[e].until<=a&&a<=i[e].since)return i[e].name}return""}function Cn(){var e,t,a,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(a=this.clone().startOf("day").valueOf(),i[e].since<=a&&a<=i[e].until)return i[e].narrow;if(i[e].until<=a&&a<=i[e].since)return i[e].narrow}return""}function On(){var e,t,a,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(a=this.clone().startOf("day").valueOf(),i[e].since<=a&&a<=i[e].until)return i[e].abbr;if(i[e].until<=a&&a<=i[e].since)return i[e].abbr}return""}function Hn(){var e,t,a,n,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e)if(a=s[e].since<=s[e].until?1:-1,n=this.clone().startOf("day").valueOf(),s[e].since<=n&&n<=s[e].until||s[e].until<=n&&n<=s[e].since)return(this.year()-i(s[e].since).year())*a+s[e].offset;return this.year()}function Nn(e){return o(this,"_erasNameRegex")||Bn.call(this),e?this._erasNameRegex:this._erasRegex}function Pn(e){return o(this,"_erasAbbrRegex")||Bn.call(this),e?this._erasAbbrRegex:this._erasRegex}function Ln(e){return o(this,"_erasNarrowRegex")||Bn.call(this),e?this._erasNarrowRegex:this._erasRegex}function jn(e,t){return t.erasAbbrRegex(e)}function Rn(e,t){return t.erasNameRegex(e)}function In(e,t){return t.erasNarrowRegex(e)}function Un(e,t){return t._eraYearOrdinalRegex||be}function Bn(){var e,t,a,i,n,s=[],r=[],o=[],l=[],d=this.eras();for(e=0,t=d.length;e<t;++e)a=Te(d[e].name),i=Te(d[e].abbr),n=Te(d[e].narrow),r.push(a),s.push(i),o.push(n),l.push(a),l.push(i),l.push(n);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+r.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+s.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+o.join("|")+")","i")}function Fn(e,t){I(0,[e,e.length],0,t)}function Yn(e){return Kn.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function Vn(e){return Kn.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function Wn(){return kt(this.year(),1,4)}function Gn(){return kt(this.isoWeekYear(),1,4)}function qn(){var e=this.localeData()._week;return kt(this.year(),e.dow,e.doy)}function Zn(){var e=this.localeData()._week;return kt(this.weekYear(),e.dow,e.doy)}function Kn(e,t,a,i,n){var s;return null==e?xt(this,i,n).year:(t>(s=kt(e,i,n))&&(t=s),Xn.call(this,e,t,a,i,n))}function Xn(e,t,a,i,n){var s=wt(e,t,a,i,n),r=_t(s.year,0,s.dayOfYear);return this.year(r.getUTCFullYear()),this.month(r.getUTCMonth()),this.date(r.getUTCDate()),this}function Jn(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}I("N",0,0,"eraAbbr"),I("NN",0,0,"eraAbbr"),I("NNN",0,0,"eraAbbr"),I("NNNN",0,0,"eraName"),I("NNNNN",0,0,"eraNarrow"),I("y",["y",1],"yo","eraYear"),I("y",["yy",2],0,"eraYear"),I("y",["yyy",3],0,"eraYear"),I("y",["yyyy",4],0,"eraYear"),ze("N",jn),ze("NN",jn),ze("NNN",jn),ze("NNNN",Rn),ze("NNNNN",In),Oe(["N","NN","NNN","NNNN","NNNNN"],(function(e,t,a,i){var n=a._locale.erasParse(e,i,a._strict);n?f(a).era=n:f(a).invalidEra=e})),ze("y",be),ze("yy",be),ze("yyy",be),ze("yyyy",be),ze("yo",Un),Oe(["y","yy","yyy","yyyy"],Le),Oe(["yo"],(function(e,t,a,i){var n;a._locale._eraYearOrdinalRegex&&(n=e.match(a._locale._eraYearOrdinalRegex)),a._locale.eraYearOrdinalParse?t[Le]=a._locale.eraYearOrdinalParse(e,n):t[Le]=parseInt(e,10)})),I(0,["gg",2],0,(function(){return this.weekYear()%100})),I(0,["GG",2],0,(function(){return this.isoWeekYear()%100})),Fn("gggg","weekYear"),Fn("ggggg","weekYear"),Fn("GGGG","isoWeekYear"),Fn("GGGGG","isoWeekYear"),ze("G",_e),ze("g",_e),ze("GG",he,le),ze("gg",he,le),ze("GGGG",fe,ue),ze("gggg",fe,ue),ze("GGGGG",ve,ce),ze("ggggg",ve,ce),He(["gggg","ggggg","GGGG","GGGGG"],(function(e,t,a,i){t[i.substr(0,2)]=De(e)})),He(["gg","GG"],(function(e,t,a,n){t[n]=i.parseTwoDigitYear(e)})),I("Q",0,"Qo","quarter"),ze("Q",oe),Oe("Q",(function(e,t){t[je]=3*(De(e)-1)})),I("D",["DD",2],"Do","date"),ze("D",he,$e),ze("DD",he,le),ze("Do",(function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient})),Oe(["D","DD"],Re),Oe("Do",(function(e,t){t[Re]=De(e.match(he)[0])}));var Qn=Ke("Date",!0);function es(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}I("DDD",["DDDD",3],"DDDo","dayOfYear"),ze("DDD",me),ze("DDDD",de),Oe(["DDD","DDDD"],(function(e,t,a){a._dayOfYear=De(e)})),I("m",["mm",2],0,"minute"),ze("m",he,Se),ze("mm",he,le),Oe(["m","mm"],Ue);var ts=Ke("Minutes",!1);I("s",["ss",2],0,"second"),ze("s",he,Se),ze("ss",he,le),Oe(["s","ss"],Be);var as,is,ns=Ke("Seconds",!1);for(I("S",0,0,(function(){return~~(this.millisecond()/100)})),I(0,["SS",2],0,(function(){return~~(this.millisecond()/10)})),I(0,["SSS",3],0,"millisecond"),I(0,["SSSS",4],0,(function(){return 10*this.millisecond()})),I(0,["SSSSS",5],0,(function(){return 100*this.millisecond()})),I(0,["SSSSSS",6],0,(function(){return 1e3*this.millisecond()})),I(0,["SSSSSSS",7],0,(function(){return 1e4*this.millisecond()})),I(0,["SSSSSSSS",8],0,(function(){return 1e5*this.millisecond()})),I(0,["SSSSSSSSS",9],0,(function(){return 1e6*this.millisecond()})),ze("S",me,oe),ze("SS",me,le),ze("SSS",me,de),as="SSSS";as.length<=9;as+="S")ze(as,be);function ss(e,t){t[Fe]=De(1e3*("0."+e))}for(as="S";as.length<=9;as+="S")Oe(as,ss);function rs(){return this._isUTC?"UTC":""}function ls(){return this._isUTC?"Coordinated Universal Time":""}is=Ke("Milliseconds",!1),I("z",0,0,"zoneAbbr"),I("zz",0,0,"zoneName");var ds=x.prototype;function us(e){return qa(1e3*e)}function cs(){return qa.apply(null,arguments).parseZone()}function hs(e){return e}ds.add=Oi,ds.calendar=Ui,ds.clone=Bi,ds.diff=Zi,ds.endOf=vn,ds.format=en,ds.from=tn,ds.fromNow=an,ds.to=nn,ds.toNow=sn,ds.get=Qe,ds.invalidAt=zn,ds.isAfter=Fi,ds.isBefore=Yi,ds.isBetween=Vi,ds.isSame=Wi,ds.isSameOrAfter=Gi,ds.isSameOrBefore=qi,ds.isValid=$n,ds.lang=on,ds.locale=rn,ds.localeData=ln,ds.max=Ka,ds.min=Za,ds.parsingFlags=Sn,ds.set=et,ds.startOf=fn,ds.subtract=Hi,ds.toArray=wn,ds.toObject=xn,ds.toDate=yn,ds.toISOString=Ji,ds.inspect=Qi,"undefined"!=typeof Symbol&&null!=Symbol.for&&(ds[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),ds.toJSON=kn,ds.toString=Xi,ds.unix=_n,ds.valueOf=bn,ds.creationData=An,ds.eraName=Dn,ds.eraNarrow=Cn,ds.eraAbbr=On,ds.eraYear=Hn,ds.year=qe,ds.isLeapYear=Ze,ds.weekYear=Yn,ds.isoWeekYear=Vn,ds.quarter=ds.quarters=Jn,ds.month=pt,ds.daysInMonth=gt,ds.week=ds.weeks=Et,ds.isoWeek=ds.isoWeeks=Tt,ds.weeksInYear=qn,ds.weeksInWeekYear=Zn,ds.isoWeeksInYear=Wn,ds.isoWeeksInISOWeekYear=Gn,ds.date=Qn,ds.day=ds.days=Yt,ds.weekday=Vt,ds.isoWeekday=Wt,ds.dayOfYear=es,ds.hour=ds.hours=ia,ds.minute=ds.minutes=ts,ds.second=ds.seconds=ns,ds.millisecond=ds.milliseconds=is,ds.utcOffset=gi,ds.utc=fi,ds.local=vi,ds.parseZone=bi,ds.hasAlignedHourOffset=_i,ds.isDST=yi,ds.isLocal=xi,ds.isUtcOffset=ki,ds.isUtc=$i,ds.isUTC=$i,ds.zoneAbbr=rs,ds.zoneName=ls,ds.dates=S("dates accessor is deprecated. Use date instead.",Qn),ds.months=S("months accessor is deprecated. Use month instead",pt),ds.years=S("years accessor is deprecated. Use year instead",qe),ds.zone=S("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",mi),ds.isDSTShifted=S("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",wi);var ps=C.prototype;function gs(e,t,a,i){var n=va(),s=g().set(i,t);return n[a](s,e)}function ms(e,t,a){if(u(e)&&(t=e,e=void 0),e=e||"",null!=t)return gs(e,t,a,"month");var i,n=[];for(i=0;i<12;i++)n[i]=gs(e,i,a,"month");return n}function fs(e,t,a,i){"boolean"==typeof e?(u(t)&&(a=t,t=void 0),t=t||""):(a=t=e,e=!1,u(t)&&(a=t,t=void 0),t=t||"");var n,s=va(),r=e?s._week.dow:0,o=[];if(null!=a)return gs(t,(a+r)%7,i,"day");for(n=0;n<7;n++)o[n]=gs(t,(n+r)%7,i,"day");return o}function vs(e,t){return ms(e,t,"months")}function bs(e,t){return ms(e,t,"monthsShort")}function _s(e,t,a){return fs(e,t,a,"weekdays")}function ys(e,t,a){return fs(e,t,a,"weekdaysShort")}function ws(e,t,a){return fs(e,t,a,"weekdaysMin")}ps.calendar=H,ps.longDateFormat=W,ps.invalidDate=q,ps.ordinal=X,ps.preparse=hs,ps.postformat=hs,ps.relativeTime=Q,ps.pastFuture=ee,ps.set=M,ps.eras=En,ps.erasParse=Tn,ps.erasConvertYear=Mn,ps.erasAbbrRegex=Pn,ps.erasNameRegex=Nn,ps.erasNarrowRegex=Ln,ps.months=lt,ps.monthsShort=dt,ps.monthsParse=ct,ps.monthsRegex=ft,ps.monthsShortRegex=mt,ps.week=$t,ps.firstDayOfYear=At,ps.firstDayOfWeek=zt,ps.weekdays=Rt,ps.weekdaysMin=Ut,ps.weekdaysShort=It,ps.weekdaysParse=Ft,ps.weekdaysRegex=Gt,ps.weekdaysShortRegex=qt,ps.weekdaysMinRegex=Zt,ps.isPM=ta,ps.meridiem=na,ga("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===De(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),i.lang=S("moment.lang is deprecated. Use moment.locale instead.",ga),i.langData=S("moment.langData is deprecated. Use moment.localeData instead.",va);var xs=Math.abs;function ks(){var e=this._data;return this._milliseconds=xs(this._milliseconds),this._days=xs(this._days),this._months=xs(this._months),e.milliseconds=xs(e.milliseconds),e.seconds=xs(e.seconds),e.minutes=xs(e.minutes),e.hours=xs(e.hours),e.months=xs(e.months),e.years=xs(e.years),this}function $s(e,t,a,i){var n=Ai(t,a);return e._milliseconds+=i*n._milliseconds,e._days+=i*n._days,e._months+=i*n._months,e._bubble()}function Ss(e,t){return $s(this,e,t,1)}function zs(e,t){return $s(this,e,t,-1)}function As(e){return e<0?Math.floor(e):Math.ceil(e)}function Es(){var e,t,a,i,n,s=this._milliseconds,r=this._days,o=this._months,l=this._data;return s>=0&&r>=0&&o>=0||s<=0&&r<=0&&o<=0||(s+=864e5*As(Ms(o)+r),r=0,o=0),l.milliseconds=s%1e3,e=Me(s/1e3),l.seconds=e%60,t=Me(e/60),l.minutes=t%60,a=Me(t/60),l.hours=a%24,r+=Me(a/24),o+=n=Me(Ts(r)),r-=As(Ms(n)),i=Me(o/12),o%=12,l.days=r,l.months=o,l.years=i,this}function Ts(e){return 4800*e/146097}function Ms(e){return 146097*e/4800}function Ds(e){if(!this.isValid())return NaN;var t,a,i=this._milliseconds;if("month"===(e=ae(e))||"quarter"===e||"year"===e)switch(t=this._days+i/864e5,a=this._months+Ts(t),e){case"month":return a;case"quarter":return a/3;case"year":return a/12}else switch(t=this._days+Math.round(Ms(this._months)),e){case"week":return t/7+i/6048e5;case"day":return t+i/864e5;case"hour":return 24*t+i/36e5;case"minute":return 1440*t+i/6e4;case"second":return 86400*t+i/1e3;case"millisecond":return Math.floor(864e5*t)+i;default:throw new Error("Unknown unit "+e)}}function Cs(e){return function(){return this.as(e)}}var Os=Cs("ms"),Hs=Cs("s"),Ns=Cs("m"),Ps=Cs("h"),Ls=Cs("d"),js=Cs("w"),Rs=Cs("M"),Is=Cs("Q"),Us=Cs("y"),Bs=Os;function Fs(){return Ai(this)}function Ys(e){return e=ae(e),this.isValid()?this[e+"s"]():NaN}function Vs(e){return function(){return this.isValid()?this._data[e]:NaN}}var Ws=Vs("milliseconds"),Gs=Vs("seconds"),qs=Vs("minutes"),Zs=Vs("hours"),Ks=Vs("days"),Xs=Vs("months"),Js=Vs("years");function Qs(){return Me(this.days()/7)}var er=Math.round,tr={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function ar(e,t,a,i,n){return n.relativeTime(t||1,!!a,e,i)}function ir(e,t,a,i){var n=Ai(e).abs(),s=er(n.as("s")),r=er(n.as("m")),o=er(n.as("h")),l=er(n.as("d")),d=er(n.as("M")),u=er(n.as("w")),c=er(n.as("y")),h=s<=a.ss&&["s",s]||s<a.s&&["ss",s]||r<=1&&["m"]||r<a.m&&["mm",r]||o<=1&&["h"]||o<a.h&&["hh",o]||l<=1&&["d"]||l<a.d&&["dd",l];return null!=a.w&&(h=h||u<=1&&["w"]||u<a.w&&["ww",u]),(h=h||d<=1&&["M"]||d<a.M&&["MM",d]||c<=1&&["y"]||["yy",c])[2]=t,h[3]=+e>0,h[4]=i,ar.apply(null,h)}function nr(e){return void 0===e?er:"function"==typeof e&&(er=e,!0)}function sr(e,t){return void 0!==tr[e]&&(void 0===t?tr[e]:(tr[e]=t,"s"===e&&(tr.ss=t-1),!0))}function rr(e,t){if(!this.isValid())return this.localeData().invalidDate();var a,i,n=!1,s=tr;return"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(n=e),"object"==typeof t&&(s=Object.assign({},tr,t),null!=t.s&&null==t.ss&&(s.ss=t.s-1)),i=ir(this,!n,s,a=this.localeData()),n&&(i=a.pastFuture(+this,i)),a.postformat(i)}var or=Math.abs;function lr(e){return(e>0)-(e<0)||+e}function dr(){if(!this.isValid())return this.localeData().invalidDate();var e,t,a,i,n,s,r,o,l=or(this._milliseconds)/1e3,d=or(this._days),u=or(this._months),c=this.asSeconds();return c?(e=Me(l/60),t=Me(e/60),l%=60,e%=60,a=Me(u/12),u%=12,i=l?l.toFixed(3).replace(/\.?0+$/,""):"",n=c<0?"-":"",s=lr(this._months)!==lr(c)?"-":"",r=lr(this._days)!==lr(c)?"-":"",o=lr(this._milliseconds)!==lr(c)?"-":"",n+"P"+(a?s+a+"Y":"")+(u?s+u+"M":"")+(d?r+d+"D":"")+(t||e||l?"T":"")+(t?o+t+"H":"")+(e?o+e+"M":"")+(l?o+i+"S":"")):"P0D"}var ur=si.prototype;return ur.isValid=ii,ur.abs=ks,ur.add=Ss,ur.subtract=zs,ur.as=Ds,ur.asMilliseconds=Os,ur.asSeconds=Hs,ur.asMinutes=Ns,ur.asHours=Ps,ur.asDays=Ls,ur.asWeeks=js,ur.asMonths=Rs,ur.asQuarters=Is,ur.asYears=Us,ur.valueOf=Bs,ur._bubble=Es,ur.clone=Fs,ur.get=Ys,ur.milliseconds=Ws,ur.seconds=Gs,ur.minutes=qs,ur.hours=Zs,ur.days=Ks,ur.weeks=Qs,ur.months=Xs,ur.years=Js,ur.humanize=rr,ur.toISOString=dr,ur.toString=dr,ur.toJSON=dr,ur.locale=rn,ur.localeData=ln,ur.toIsoString=S("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",dr),ur.lang=on,I("X",0,0,"unix"),I("x",0,0,"valueOf"),ze("x",_e),ze("X",xe),Oe("X",(function(e,t,a){a._d=new Date(1e3*parseFloat(e))})),Oe("x",(function(e,t,a){a._d=new Date(De(e))})),
//! moment.js
i.version="2.30.1",n(qa),i.fn=ds,i.min=Ja,i.max=Qa,i.now=ei,i.utc=g,i.unix=us,i.months=vs,i.isDate=c,i.locale=ga,i.invalid=b,i.duration=Ai,i.isMoment=k,i.weekdays=_s,i.parseZone=cs,i.localeData=va,i.isDuration=ri,i.monthsShort=bs,i.weekdaysMin=ws,i.defineLocale=ma,i.updateLocale=fa,i.locales=ba,i.weekdaysShort=ys,i.normalizeUnits=ae,i.relativeTimeRounding=nr,i.relativeTimeThreshold=sr,i.calendarFormat=Ii,i.prototype=ds,i.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},i}()}(ds)),ds.exports),cs=rs(us);let hs=class extends(Ot(he)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.zoneCache=new Map,this._expanded=new Set}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ze+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,a,i]=await Promise.all([Et(this.hass),Tt(this.hass),Mt(this.hass),Dt(this.hass)]);this.config=e,this.zones=t,this.modules=a,this.mappings=i,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ze+"/zones",{calculate_all:!0})).catch((e=>{console.error("Failed to calculate all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ze+"/zones",{update_all:!0})).catch((e=>{console.error("Failed to update all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleResetAllBuckets(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ze+"/zones",{reset_all_buckets:!0})).catch((e=>{console.error("Failed to reset all buckets:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleClearAllWeatherdata(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ze+"/zones",{clear_all_weatherdata:!0})).catch((e=>{console.error("Failed to clear all weather data:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:ss.Automatic,duration:0,bucket:0,module:void 0,delta:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then((()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleEditZone(e,t){this.hass&&(this.zones[e]=t,t.id&&this.zoneCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{this.isSaving=!0,this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate())}handleRemoveZone(e,t){if(!this.hass)return;const a=this.zones[t].id;if(!this.zones[t]||null==a)return;const i=[...this.zones];var n,s;this.zones=this.zones.filter(((e,a)=>a!==t)),this.zoneCache.delete(a.toString()),this.isSaving=!0,(n=this.hass,s=a.toString(),n.callApi("POST",ze+"/zones",{id:s,remove:!0})).catch((e=>{console.error("Failed to delete zone:",e),this.zones=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleCalculateZone(e){const t=this.zones[e];var a,i;t&&null!=t.id&&(this.hass&&(a=this.hass,i=t.id.toString(),a.callApi("POST",ze+"/zones",{id:i,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=this.zones[e];var a,i;t&&null!=t.id&&(this.hass&&(a=this.hass,i=t.id.toString(),a.callApi("POST",ze+"/zones",{id:i,update:!0})))}handleViewWeatherInfo(e){var t;const a=this.zones[e];if(!a||null==a.mapping)return;const i=`#weather-section-${a.id}`,n=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(i);n&&(n.hasAttribute("hidden")?n.removeAttribute("hidden"):n.setAttribute("hidden",""))}handleViewWateringCalendar(e){var t;const a=this.zones[e];if(!a||null==a.id)return;const i=`#calendar-section-${a.id}`,n=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(i);n&&(n.hasAttribute("hidden")?n.removeAttribute("hidden"):n.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const t=await Ct(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,t)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const a of this.zones)if(void 0!==a.id)try{const i=await(e=this.hass,t=a.id.toString(),e.callWS({type:ze+"/watering_calendar",zone_id:t}));this.wateringCalendars.set(a.id,i)}catch(e){console.error(`Failed to fetch watering calendar for zone ${a.id}:`,e)}var e,t;this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return V``;const t=this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${On("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${On("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${On("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>V`
                    <div class="weather-row">
                      <span
                        >${cs(e.timestamp).format("MM-DD HH:mm")}</span
                      >
                      <span
                        >${e.temperature?e.temperature.toFixed(1)+"°C":"-"}</span
                      >
                      <span
                        >${e.humidity?e.humidity.toFixed(1)+"%":"-"}</span
                      >
                      <span
                        >${e.precipitation?e.precipitation.toFixed(1)+"mm":"-"}</span
                      >
                      <span
                        >${e.retrieval_time?cs(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `))}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){if(!this.hass||"number"!=typeof e.id)return V``;const t=this.wateringCalendars.get(e.id),a=t&&e.id in t?t[e.id]:null,i=(null==a?void 0:a.monthly_estimates)||[];return V` <div class="watering-calendar">
      <h4>Watering Calendar (12-Month Estimates)</h4>
      ${0===i.length?V`
            <div class="calendar-note">
              ${(null==a?void 0:a.error)?`Error generating calendar: ${a.error}`:"No watering calendar data available for this zone"}
            </div>
          `:V` <div class="calendar-table">
              <div class="calendar-header">
                <span>Month</span>
                <span>ET (mm)</span>
                <span>Precipitation (mm)</span>
                <span>Watering (L)</span>
                <span>Avg Temp (°C)</span>
              </div>
              ${i.map((e=>V`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${e.estimated_et_mm?e.estimated_et_mm.toFixed(1):"-"}</span
                    >
                    <span
                      >${e.average_precipitation_mm?e.average_precipitation_mm.toFixed(1):"-"}</span
                    >
                    <span
                      >${e.estimated_watering_volume_liters?e.estimated_watering_volume_liters.toFixed(0):"-"}</span
                    >
                    <span
                      >${e.average_temperature_c?e.average_temperature_c.toFixed(1):"-"}</span
                    >
                  </div>
                `))}
            </div>
            ${(null==a?void 0:a.calculation_method)?V`
                  <div class="calendar-info">
                    Method: ${a.calculation_method}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");var t,a;await(t=this.hass,a=e,t.callApi("POST",ze+"/zones",a))}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,t,a,i;(null===(t=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===t?void 0:t.trim())||(null===(a=this.sizeInput)||void 0===a?void 0:a.value)||(null===(i=this.throughputInput)||void 0===i?void 0:i.value)||(this.isCreatingZone=!1)}renderTheOptions(e,t){if(this.hass){let a=V`<option value="" ?selected=${void 0===t}">---${On("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,i])=>a=V`${a}
            <option
              value="${i.id}"
              ?selected="${t===i.id}"
            >
              ${i.id}: ${i.name}
            </option>`)),a}return V``}renderZone(e,t){var a;if(!this.hass)return V``;const i=this.hass.language,n=e.state===ss.Automatic,s=e.state===ss.Disabled||e.state===ss.Automatic,r=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const t=this.mappings.filter((t=>t.id===e.mapping))[0];null!=t&&null!=t.data&&(e.number_of_data_points=t.data.length)}const o=On("panels.zones.labels.states."+e.state,i),l=`${Math.round(Number(e.duration)||0)} s`,d=null!=e.id&&this._expanded.has(e.id);return V`
      <ha-card class="zone-card">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${d?"true":"false"}
          @click=${()=>this._toggleZone(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleZone(e.id))}}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${e.name||"—"}</span>
              <ha-label class="state-label state-label--${e.state}" dense
                >${o}</ha-label
              >
            </div>
            <div class="zone-sub">${l}</div>
          </div>
          <ha-svg-icon
            class="zone-chevron ${d?"open":""}"
            .path=${Nn}
          ></ha-svg-icon>
        </div>
        ${d?V` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${On("panels.zones.labels.last_calculated",i)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?cs(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${On("panels.zones.labels.data-last-updated",i)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?cs(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${On("panels.zones.labels.data-number-of-data-points",i)}</span
                  >
                  <span class="meta-value"
                    >${null!==(a=e.number_of_data_points)&&void 0!==a?a:"—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(On("panels.zones.labels.name",i),"",e.name,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[rt]:a}))))}
                ${this._numRow(On("panels.zones.labels.size",i),St(this.config,ot),e.size,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ot]:parseFloat(a)}))),.1)}
                ${this._numRow(On("panels.zones.labels.throughput",i),St(this.config,lt),e.throughput,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[lt]:parseFloat(a)}))),.1)}
                ${this._numRow(On("panels.zones.labels.drainage_rate",i),St(this.config,bt),e.drainage_rate,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[bt]:parseFloat(a)}))),.1)}
                ${this._selectRow(On("panels.zones.labels.state",i),V`
                    <option
                      value="${ss.Automatic}"
                      ?selected=${e.state===ss.Automatic}
                    >
                      ${On("panels.zones.labels.states.automatic",i)}
                    </option>
                    <option
                      value="${ss.Disabled}"
                      ?selected=${e.state===ss.Disabled}
                    >
                      ${On("panels.zones.labels.states.disabled",i)}
                    </option>
                    <option
                      value="${ss.Manual}"
                      ?selected=${e.state===ss.Manual}
                    >
                      ${On("panels.zones.labels.states.manual",i)}
                    </option>
                  `,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[dt]:a.target.value,[ut]:0}))))}
                ${this._selectRow(On("common.labels.module",i),this.renderTheOptions(this.modules,e.module),(a=>{const i=a.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[ct]:""===i?void 0:parseInt(i)}))}))}
                ${this._selectRow(On("panels.zones.labels.mapping",i),this.renderTheOptions(this.mappings,e.mapping),(a=>{const i=a.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[gt]:""===i?void 0:parseInt(i)}))}))}
                ${this._numRow(On("panels.zones.labels.bucket",i),St(this.config,ht),Number(e.bucket).toFixed(1),(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ht]:parseFloat(a)}))),.1)}
                ${this._numRow(On("panels.zones.labels.maximum-bucket",i),St(this.config,ht),Number(e.maximum_bucket).toFixed(1),(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[vt]:parseFloat(a)}))),.1)}
                ${this._numRow(On("panels.zones.labels.lead-time",i),"s",e.lead_time,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[mt]:parseInt(a,10)}))),1)}
                ${this._numRow(On("panels.zones.labels.maximum-duration",i),"s",e.maximum_duration,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ft]:parseInt(a,10)}))),1)}
                ${this._numRow(On("panels.zones.labels.multiplier",i),"",e.multiplier,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[pt]:parseFloat(a)}))),.1)}
                ${this._numRow(On("panels.zones.labels.duration",i),"s",e.duration,(a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ut]:parseInt(a,10)}))),1,s)}
              </div>

              <div class="zone-actions">
                ${n?V`
                      ${this._actionBtn(Hn,On("panels.zones.actions.calculate",i),(()=>this.handleCalculateZone(t)))}
                      ${this._actionBtn(Fn,On("panels.zones.actions.update",i),(()=>this.handleUpdateZone(t)))}
                    `:""}
                ${this._actionBtn(Un,On("panels.zones.actions.reset-bucket",i),(()=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ht]:0}))))}
                ${null!=e.mapping?this._actionBtn(Ln,On("panels.zones.actions.view-weather-info",i),(()=>this.handleViewWeatherInfo(t))):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",On("panels.zones.actions.view-watering-calendar",i),(()=>this.handleViewWateringCalendar(t)))}
                ${r?this._actionBtn("M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",On("panels.zones.actions.information",i),(()=>this.toggleExplanation(t))):""}
                ${this._actionBtn(jn,On("common.actions.delete",i),(e=>this.handleRemoveZone(e,t)),!0)}
              </div>

              ${r?V`<label class="hidden" id="calcresults${t}"
                    >${kt("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
    `}_textRow(e,t,a,i){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==a?"":String(a)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,a,i,n=1,s=!1){const r=(String(n).split(".")[1]||"").length,o=(e,t)=>{const a=parseFloat(e.value),s=+((isNaN(a)?0:a)+t*n).toFixed(r);e.value=String(s),i(String(s))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${s}
            .value=${null==a?"":String(a)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${In}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Bn}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,a){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${a}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Rn}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,a,i=!1,n=!1){return V`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${a}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}toggleExplanation(e){var t;const a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);a&&("hidden"!=a.className?a.className="hidden":a.className="explanation")}render(){return this.hass?this.isLoading?V`
        <ha-card header="${On("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${On("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:V`
      <ha-card header="${On("panels.zones.title",this.hass.language)}">
        <div class="card-content">
          ${On("panels.zones.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${On("panels.zones.cards.add-zone.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.zones.labels.name",this.hass.language)}
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
              ${On("panels.zones.labels.size",this.hass.language)}
              <span class="unit">(${St(this.config,ot)})</span>
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
              ${On("panels.zones.labels.throughput",this.hass.language)}
              <span class="unit"
                >(${St(this.config,lt)})</span
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
              <ha-svg-icon slot="start" .path=${Bn}></ha-svg-icon>
              ${this.isSaving?On("common.saving-messages.adding",this.hass.language):On("panels.zones.cards.add-zone.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${is(this.zones,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderZone(e,t)))}

      <ha-card
        header="${On("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(Hn,On("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),(()=>this.handleCalculateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(Fn,On("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),(()=>this.handleUpdateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(Un,On("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),(()=>this.handleResetAllBuckets()),!1,this.isSaving)}
            ${this._actionBtn(Ln,On("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),(()=>this.handleClearAllWeatherdata()),!1,this.isSaving)}
          </div>
        </div>
      </ha-card>
    `:V``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return h`
      ${Yn}

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
    `}};s([fe()],hs.prototype,"config",void 0),s([fe({type:Array})],hs.prototype,"zones",void 0),s([fe({type:Array})],hs.prototype,"modules",void 0),s([fe({type:Array})],hs.prototype,"mappings",void 0),s([fe({type:Map})],hs.prototype,"wateringCalendars",void 0),s([fe({type:Map})],hs.prototype,"weatherRecords",void 0),s([fe({type:Boolean})],hs.prototype,"isLoading",void 0),s([fe({type:Boolean})],hs.prototype,"isSaving",void 0),s([fe({type:Boolean})],hs.prototype,"isCreatingZone",void 0),s([be("#nameInput")],hs.prototype,"nameInput",void 0),s([be("#sizeInput")],hs.prototype,"sizeInput",void 0),s([be("#throughputInput")],hs.prototype,"throughputInput",void 0),hs=s([ge("smart-irrigation-view-zones")],hs);let ps=class extends(Ot(he)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.moduleCache=new Map,this._expanded=new Set,this.debouncedSave=(()=>{let e=null;return t=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch((()=>{this._suppressNextConfigUpdate=!1})),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ze+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{const[t,a,i,n]=await Promise.all([Et(this.hass),Tt(this.hass),Mt(this.hass),(e=this.hass,e.callWS({type:ze+"/allmodules"}))]);this.config=t,this.zones=a,this.modules=i,this.allmodules=n,this.moduleCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e}}async handleAddModule(){var e,t;if((null===(t=null===(e=this.moduleInput)||void 0===e?void 0:e.selectedOptions)||void 0===t?void 0:t[0])&&!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.moduleInput.selectedOptions[0].text,t=this.allmodules.find((t=>t.name===e));if(!t)return;const a={name:e,description:t.description,config:t.config,schema:t.schema};this.modules=[...this.modules,a],this.moduleCache.clear(),this._scheduleUpdate(),await this.saveToHA(a),await this._fetchData()}catch(e){console.error("Error adding module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}async handleRemoveModule(e,t){if(!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.modules[t],n=null==e?void 0:e.id;this.modules;this.modules=this.modules.filter(((e,a)=>a!==t)),this.moduleCache.clear(),this._scheduleUpdate(),this.hass&&void 0!==n&&await(a=this.hass,i=n.toString(),a.callApi("POST",ze+"/modules",{id:i,remove:!0}))}catch(e){console.error("Error removing module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var a,i}}async saveToHA(e){var t,a;if(this.hass)try{await(t=this.hass,a=e,t.callApi("POST",ze+"/modules",a))}catch(e){throw console.error("Error saving module:",e),e}}renderModule(e,t){var a,i;if(!this.hass)return V``;const n=this.zones.filter((t=>t.module===e.id)).length,s=null!==(a=e.id)&&void 0!==a?a:t,r=this._expanded.has(s),o=e.description||(null===(i=this.allmodules.find((t=>t.name===e.name)))||void 0===i?void 0:i.description)||"",l=`module-${e.id||t}-${r?"open":"closed"}-${JSON.stringify(e)}`;if(this.moduleCache.has(l))return this.moduleCache.get(l);const d=V`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${r?"true":"false"}
          @click=${()=>this._toggleItem(s)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleItem(s))}}
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
            class="si-chevron ${r?"open":""}"
            .path=${Nn}
          ></ha-svg-icon>
        </div>
        ${r?V` <div class="si-body">
              <div class="moduleconfig">
                <label class="subheader"
                  >${On("panels.modules.cards.module.labels.configuration",this.hass.language)}
                  (*
                  ${On("panels.modules.cards.module.labels.required",this.hass.language)})</label
                >
                <div class="settings">
                  ${e.schema?Object.entries(e.schema).map((([e])=>this.renderConfig(t,e))):null}
                </div>
              </div>
              ${n?V`<div class="weather-note">
                    ${On("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}
                  </div>`:V`<div class="si-actions">
                    ${this._actionBtn(jn,On("common.actions.delete",this.hass.language),(e=>this.handleRemoveModule(e,t)),!0)}
                  </div>`}
            </div>`:""}
      </ha-card>
    `;return this.moduleCache.set(l,d),d}renderConfig(e,t){const a=Object.values(this.modules).at(e);if(!a||!this.hass)return;const i=a.schema[t],n=i.name,s=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(n);let r="";null==a.config&&(a.config=[]),n in a.config&&(r=a.config[n]);const o=i.required?`${s} *`:null!=s?s:"";if("boolean"==i.type)return V`
        <div class="setting-row">
          <div class="setting-label">${o}</div>
          <input
            type="checkbox"
            id="${n+e}"
            .checked=${r}
            @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[n]:t.target.checked})}))}"
          />
        </div>
      `;if("float"==i.type||"integer"==i.type)return this._numRow(o,"",a.config[n],(t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[n]:t})}))),1);if("string"==i.type)return this._textRow(o,"",r,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[n]:t})}))));if("select"==i.type){const t=this.hass.language,s=V`
        ${Object.entries(i.options).map((([e,a])=>V`<option
              value="${$t(a,0)}"
              ?selected="${r===$t(a,0)}"
            >
              ${On("panels.modules.cards.module.translated-options."+$t(a,1),t)}
            </option>`))}
      `;return this._selectRow(o,s,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[n]:t.target.value})}))))}return V``}_textRow(e,t,a,i){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==a?"":String(a)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,a,i,n=1,s=!1){const r=(String(n).split(".")[1]||"").length,o=(e,t)=>{const a=parseFloat(e.value),s=+((isNaN(a)?0:a)+t*n).toFixed(r);e.value=String(s),i(String(s))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${s}
            .value=${null==a?"":String(a)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${In}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Bn}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,a){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${a}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Rn}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,a,i=!1,n=!1){return V`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${a}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}handleEditConfig(e,t){this.modules=Object.values(this.modules).map(((a,i)=>i===e?t:a)),this.moduleCache.clear(),this._scheduleUpdate(),this.debouncedSave(t)}renderOption(e,t){return this.hass?V`<option value="${e}>${t}</option>`:V``}render(){return this.hass?V`
      <ha-card header="${On("panels.modules.title",this.hass.language)}">
        <div class="card-content">
          ${On("panels.modules.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${On("panels.modules.cards.add-module.header",this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading?V`<div class="loading-indicator">
                ${On("common.loading-messages.general",this.hass.language)}
              </div>`:V`
                <div class="setting-row">
                  <div class="setting-label">
                    ${On("common.labels.module",this.hass.language)}
                  </div>
                  <div class="select-wrap">
                    <select
                      id="moduleInput"
                      class="field"
                      ?disabled="${this.isSaving}"
                    >
                      ${Object.entries(this.allmodules).map((([e,t])=>V`<option value="${t.id}">
                            ${t.name}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Rn}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${Bn}></ha-svg-icon>
                    ${this.isSaving?On("common.saving-messages.adding",this.hass.language):On("panels.modules.cards.add-module.actions.add",this.hass.language)}
                  </ha-button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading?V`<div class="loading-indicator">
            ${On("common.loading-messages.modules",this.hass.language)}
          </div>`:is(this.modules,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderModule(e,t)))}
    `:V``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.moduleCache.clear()}static get styles(){return h`
      ${Yn} ${Gn} /* View-specific styles only - most common styles are now in globalStyle */
    `}};s([fe()],ps.prototype,"config",void 0),s([fe({type:Array})],ps.prototype,"zones",void 0),s([fe({type:Array})],ps.prototype,"modules",void 0),s([fe({type:Array})],ps.prototype,"allmodules",void 0),s([fe({type:Boolean})],ps.prototype,"isLoading",void 0),s([fe({type:Boolean})],ps.prototype,"isSaving",void 0),s([be("#moduleInput")],ps.prototype,"moduleInput",void 0),ps=s([ge("smart-irrigation-view-modules")],ps);let gs=class extends(Ot(he)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this.globalDebounceTimer=null,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}),this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ze+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,a]=await Promise.all([Et(this.hass),Tt(this.hass),Dt(this.hass)]);this.config=e,this.zones=t,this.mappings=a,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(t){console.error("Error fetching data:",t),zt({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const t=await Ct(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for mapping ${e.id}:`,t),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return V``;const t=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${On("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${On("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${On("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${On("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>{let t="-",a="-";try{if(e.timestamp&&null!==e.timestamp){const a=cs(e.timestamp);a.isValid()&&(t=a.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting timestamp:",e.timestamp,t)}try{if(e.retrieval_time&&null!==e.retrieval_time){const t=cs(e.retrieval_time);t.isValid()&&(a=t.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting retrieval_time:",e.retrieval_time,t)}return V`
                    <div class="weather-row">
                      <span>${t}</span>
                      <span
                        >${null!==e.temperature&&void 0!==e.temperature?e.temperature.toFixed(1)+"°C":"-"}</span
                      >
                      <span
                        >${null!==e.humidity&&void 0!==e.humidity?e.humidity.toFixed(1)+"%":"-"}</span
                      >
                      <span
                        >${null!==e.precipitation&&void 0!==e.precipitation?e.precipitation.toFixed(1)+"mm":"-"}</span
                      >
                      <span>${a}</span>
                    </div>
                  `}))}
              </div>
            `}
      </div>
    `}handleAddMapping(){if(!this.mappingNameInput.value.trim())return;const e={[Pe]:"",[Le]:"",[je]:"",[Re]:"",[Ie]:"",[Ue]:"",[Be]:"",[Fe]:"",[Ye]:""},t={name:this.mappingNameInput.value.trim(),mappings:e};this.mappings=[...this.mappings,t],this.isSaving=!0,this.saveToHA(t).then((()=>(this.mappingNameInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleRemoveMapping(e,t){const a=this.mappings[t].id;if(null==a)return;const i=[...this.mappings];var n,s;(this.mappings=this.mappings.filter(((e,a)=>a!==t)),this.mappingCache.delete(a.toString()),this.hass)&&(this.isSaving=!0,(n=this.hass,s=a.toString(),n.callApi("POST",ze+"/mappings",{id:s,remove:!0})).catch((e=>{console.error("Failed to delete mapping:",e),this.mappings=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleEditMapping(e,t){this.mappings[e]=t,t.id&&this.mappingCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{this.isSaving=!0,this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}async saveToHA(e){var t;if(!this.hass)throw new Error("Home Assistant connection not available");const a=[],i=this.hass.states;for(const t in e.mappings){const n=e.mappings[t].sensorentity;if(n&&""!==n.trim()){const s=n.trim();e.mappings[t].sensorentity=s,s in i||a.push(s)}}if(a.length>0){const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");throw e&&zt({body:{message:On("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+a.join(", ")},error:On("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}var n,s;await(n=this.hass,s=e,n.callApi("POST",ze+"/mappings",s))}renderMapping(e,t){if(!this.hass)return V``;const a=`${e.id}_${JSON.stringify(e).slice(0,100)}`;if(this.mappingCache.has(a))return this.mappingCache.get(a);const i=this.zones.filter((t=>t.mapping===e.id)).length,n=V`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${On("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @change="${a=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:a.target.value}))}"
            />
            ${Object.entries(e.mappings).map((([e])=>this.renderMappingSetting(t,e)))}
            ${i?V`<div class="weather-note">
                  ${On("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}
                </div>`:V` <div
                  class="action-button"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${jn}" />
                  </svg>
                  <span class="action-button-label">
                    ${On("common.actions.delete",this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;return this.mappingCache.set(a,n),n}renderMappingSetting(e,t){const a=this.mappings[e];if(!a||!this.hass)return V``;const i=a.mappings[t];return V`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${On(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`,this.hass.language)}
        </div>
        ${this._selectRow(On("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,t,i),(a=>this.handleSimpleSourceChange(e,t,a)))}
        ${this.renderMappingInputs(e,t,i)}
      </div>
    `}renderSimpleRadioOptions(e,t,a){if(!this.hass||!this.config)return V``;const i=t===Le||t===Be,n=a[Je];return V`
      ${!i&&this.config.use_weather_service?V`<option
            value="${Ve}"
            ?selected=${n===Ve}
          >
            ${On("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}
          </option>`:""}
      ${i?V`<option
            value="${Xe}"
            ?selected=${n===Xe}
          >
            ${On("panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${We}"
        ?selected=${n===We}
      >
        ${On("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      <option
        value="${Ge}"
        ?selected=${n===Ge}
      >
        ${On("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
    `}handleSimpleSourceChange(e,t,a){const i=this.mappings[e],n=a.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Je]:n,[Qe]:""})})}))}handleSimpleInputChange(e,t,a,i){const n=this.mappings[e],s=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[a]:s})})}))}renderSourceOptions(e,t,a){if(!this.hass)return V``;const i=t===Le||t===Be;return V`
      <div class="mappingsettingline">
        <label for="${`${t}_${e}`}_source">
          ${On("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${i?"":this.renderWeatherServiceOption(e,t,a)}
        ${i?this.renderNoneOption(e,t,a):""}
        ${this.renderSensorOption(e,t,a)}
        ${this.renderStaticValueOption(e,t,a)}
      </div>
    `}renderWeatherServiceOption(e,t,a){if(!this.hass||!this.config)return V``;const i=`${t}_${e}`,n=!this.config.use_weather_service,s=this.config.use_weather_service&&a[Je]===Ve;return V`
      <label class="${n?"strikethrough":""}">
        <input
          type="radio"
          id="${i}_weather"
          value="${Ve}"
          name="${i}_source"
          ?checked="${s}"
          ?disabled="${n}"
          @change="${a=>this.handleSourceChange(e,t,a)}"
        />
        ${On("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}
      </label>
    `}renderNoneOption(e,t,a){if(!this.hass)return V``;const i=`${t}_${e}`,n=a[Je]===Xe;return V`
      <label>
        <input
          type="radio"
          id="${i}_none"
          value="${Xe}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a=>this.handleSourceChange(e,t,a)}"
        />
        ${On("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,t,a){if(!this.hass)return V``;const i=`${t}_${e}`,n=a[Je]===We;return V`
      <label>
        <input
          type="radio"
          id="${i}_sensor"
          value="${We}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a=>this.handleSourceChange(e,t,a)}"
        />
        ${On("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,t,a){if(!this.hass)return V``;const i=`${t}_${e}`,n=a[Je]===Ge;return V`
      <label>
        <input
          type="radio"
          id="${i}_static"
          value="${Ge}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a=>this.handleSourceChange(e,t,a)}"
        />
        ${On("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,t,a){const i=this.mappings[e],n=a.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Je]:n,[Qe]:""})})}))}renderMappingInputs(e,t,a){if(!this.hass)return V``;const i=a[Je];return V`
      ${i===We?this.renderSensorInput(e,t,a):""}
      ${i===Ge?this.renderStaticValueInput(e,t,a):""}
      ${i===We||i===Ge?this.renderUnitSelect(e,t,a):""}
      ${t!==Ue||i!==We&&i!==Ge?"":this.renderPressureTypeSelect(e,t,a)}
      ${i===We?this.renderAggregateSelect(e,t,a):""}
    `}renderSensorInput(e,t,a){return this.hass?V`
      <div class="setting-row">
        <div class="setting-label">
          ${On("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${a[Qe]||""}
          allow-custom-entity
          @value-changed=${a=>{var i;return this.handleSensorChange(e,t,{target:{value:(null===(i=a.detail)||void 0===i?void 0:i.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:V``}renderStaticValueInput(e,t,a){return this.hass?this._numRow(On("panels.mappings.cards.mapping.static_value",this.hass.language),"",a[et]||"",(a=>this.handleStaticValueChange(e,t,{target:{value:a}})),.1):V``}renderUnitSelect(e,t,a){return this.hass&&this.config?this._selectRow(On("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(t,a),(a=>this.handleUnitChange(e,t,a))):V``}renderPressureTypeSelect(e,t,a){return this.hass?this._selectRow(On("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(t,a),(a=>this.handlePressureTypeChange(e,t,a))):V``}renderAggregateSelect(e,t,a){return this.hass?V`
      <div class="setting-row">
        <div class="setting-label">
          ${On("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
          <span class="unit"
            >${On("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",this.hass.language)}</span
          >
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${a=>this.handleAggregateChange(e,t,a)}"
          >
            ${this.renderAggregateOptionsForMapping(t,a)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Rn}></path>
          </svg>
        </div>
      </div>
    `:V``}handleSensorChange(e,t,a){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Qe]:a.target.value})})}))}handleStaticValueChange(e,t,a){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[et]:a.target.value})})}))}handleUnitChange(e,t,a){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[tt]:a.target.value})})}))}handlePressureTypeChange(e,t,a){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[qe]:a.target.value})})}))}handleAggregateChange(e,t,a){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[at]:a.target.value})})}))}renderAggregateOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;let a="average";return e===Re&&(a="delta"),e===Ie&&(a="average"),t[at]&&(a=t[at]),V`
      ${it.map((e=>this.renderAggregateOption(e,a)))}
    `}renderAggregateOption(e,t){if(this.hass&&this.config){return V`<option value="${e}" ?selected="${e===t}">
        ${On("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return V``}renderPressureTypes(e,t){if(this.hass&&this.config){let e=V``;const a=t[qe];return e=V`${e}
        <option
          value="${Ze}"
          ?selected="${a===Ze}"
        >
          ${On("panels.mappings.cards.mapping.pressure_types."+Ze,this.hass.language)}
        </option>
        <option
          value="${Ke}"
          ?selected="${a===Ke}"
        >
          ${On("panels.mappings.cards.mapping.pressure_types."+Ke,this.hass.language)}
        </option>`,e}return V``}renderUnitOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;const a=function(e){switch(e){case Pe:case Fe:return[{unit:"°C",system:Ne},{unit:"°F",system:He}];case Re:case Le:return[{unit:"mm",system:Ne},{unit:"in",system:He}];case Ie:return[{unit:nt,system:Ne},{unit:st,system:He}];case je:return[{unit:"%",system:[Ne,He]}];case Ue:return[{unit:"millibar",system:Ne},{unit:"hPa",system:Ne},{unit:"psi",system:He},{unit:"inch Hg",system:He}];case Ye:return[{unit:"km/h",system:Ne},{unit:"meter/s",system:Ne},{unit:"mile/h",system:He}];case Be:return[{unit:"W/m2",system:Ne},{unit:"MJ/day/m2",system:Ne},{unit:"W/sq ft",system:He},{unit:"MJ/day/sq ft",system:He}];default:return[]}}(e);let i=t[tt];const n=this.config.units;if(!t[tt])for(const e of a)if("string"==typeof e.system){if(n===e.system){i=e.unit;break}}else{for(const t of e.system)if(n===t.system){i=e.unit;break}if(i===e.unit)break}return V`
      ${a.map((e=>V`
          <option value="${e.unit}" ?selected="${i===e.unit}">
            ${e.unit}
          </option>
        `))}
    `}_textRow(e,t,a,i){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==a?"":String(a)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,a,i,n=1,s=!1){const r=(String(n).split(".")[1]||"").length,o=(e,t)=>{const a=parseFloat(e.value),s=+((isNaN(a)?0:a)+t*n).toFixed(r);e.value=String(s),i(String(s))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${n}
            ?readonly=${s}
            .value=${null==a?"":String(a)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${In}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Bn}
            ?disabled=${s}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,a){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${a}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Rn}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,a,i=!1,n=!1){return V`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${n}
        @click=${a}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}render(){return this.hass?this.isLoading?V`
        <ha-card
          header="${On("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${On("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:V`
      <ha-card
        header="${On("panels.mappings.title",this.hass.language)}"
      >
        <div class="card-content">
          ${On("panels.mappings.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${On("panels.mappings.cards.add-mapping.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.mappings.labels.mapping-name",this.hass.language)}
            </div>
            <input id="mappingNameInput" class="field" type="text" />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${Bn}></ha-svg-icon>
              ${this.isSaving?On("common.saving-messages.adding",this.hass.language):On("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `:V``}renderMappingsList(){const e=this.mappings.slice(0,Math.min(this.mappings.length,10)),t=this.mappings.slice(10);return V`
      ${is(e,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderMappingCard(e,t)))}
      ${t.length>0?V`
            <div class="si-form-actions">
              ${this._actionBtn(Bn,`Load ${t.length} more mappings...`,(()=>this.loadMoreMappings()))}
            </div>
          `:""}
    `}renderMappingCard(e,t){if(!this.hass)return V``;const a=this.hass.language,i=this.zones.filter((t=>t.mapping===e.id)).length,n=Object.keys(e.mappings||{}).length,s=[];s.push(`${n} ${On("panels.mappings.title",a).toLowerCase()}`),i&&s.push(`${i} ${On("panels.zones.title",a).toLowerCase()}`);const r=s.join(" · "),o=null!=e.id&&this._expanded.has(e.id);return V`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${o?"true":"false"}
          @click=${()=>this._toggleItem(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleItem(e.id))}}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${e.id}: ${e.name||"—"}</span
              >
            </div>
            <div class="si-sub">${r}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${o?"open":""}"
            .path=${Nn}
          ></ha-svg-icon>
        </div>
        ${o?V`<div class="si-body">
              <div class="settings">
                ${this._textRow(On("panels.mappings.labels.mapping-name",a),"",e.name,(a=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:a}))))}
                ${this.renderMappingSettings(e,t)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${i?V`<div class="weather-note">
                      ${On("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",a)}
                    </div>`:this._actionBtn(jn,On("common.actions.delete",a),(e=>this.handleRemoveMapping(e,t)),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}renderMappingSettings(e,t){const a=Object.entries(e.mappings);return V`
      ${a.map((([e])=>this.renderMappingSetting(t,e)))}
    `}loadMoreMappings(){this._scheduleUpdate()}static get styles(){return h`
      ${Yn} ${Gn}

      /* --- mappings: per-field sub-group inside the expanded card body --- */
      .si-subgroup {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .si-subgroup:last-child {
        border-bottom: 0;
      }
      .si-subgroup-title {
        font-size: 0.95rem;
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
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach((e=>{clearTimeout(e)})),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};s([fe()],gs.prototype,"config",void 0),s([fe({type:Array})],gs.prototype,"zones",void 0),s([fe({type:Array})],gs.prototype,"mappings",void 0),s([fe({type:Map})],gs.prototype,"weatherRecords",void 0),s([fe({type:Boolean})],gs.prototype,"isLoading",void 0),s([fe({type:Boolean})],gs.prototype,"isSaving",void 0),s([be("#mappingNameInput")],gs.prototype,"mappingNameInput",void 0),gs=s([ge("smart-irrigation-view-mappings")],gs);let ms=class extends he{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)})),this._load()}async _load(){var e;if(this.hass)try{const t=await(e=this.hass,e.callWS({type:ze+"/weatherservice"}));this._info=t,this._use=!!t.use_weather_service,this._service=t.weather_service||(t.services&&t.services.length?t.services[0]:null),this._apiKey=t.weather_service_api_key||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1;try{await(e=this.hass,t={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null},e.callWS(Object.assign({type:ze+"/set_weatherservice"},t))),this._saved=!0,window.setTimeout((()=>this._load()),800)}catch(e){this._error=this._errText(e)}finally{this._saving=!1}var e,t}}render(){var e;if(!this.hass)return V``;const t=this.hass.language;return this._loading&&!this._info?V`
        <ha-card header="${On("panels.weatherservice.title",t)}">
          <div class="card-content">
            ${On("common.loading-messages.general",t)}...
          </div>
        </ha-card>
      `:V`
      <ha-card header="${On("panels.weatherservice.title",t)}">
        <div class="card-content ws-description">
          ${On("panels.weatherservice.description",t)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${On("panels.weatherservice.labels.use-weather-service",t)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?V`
                <div class="setting-row">
                  <div class="setting-label">
                    ${On("panels.weatherservice.labels.service",t)}
                  </div>
                  <div class="select-wrap">
                    <select
                      class="field"
                      @change=${e=>{this._service=e.target.value,this._saved=!1}}
                    >
                      ${((null===(e=this._info)||void 0===e?void 0:e.services)||[]).map((e=>V`<option
                            value="${e}"
                            ?selected=${this._service===e}
                          >
                            ${e}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Rn}></path>
                    </svg>
                  </div>
                </div>
                <div class="setting-row">
                  <div class="setting-label">
                    ${On("panels.weatherservice.labels.api-key",t)}
                  </div>
                  <input
                    class="field"
                    type="text"
                    autocomplete="off"
                    .value=${this._apiKey}
                    @change=${e=>{this._apiKey=e.target.value,this._saved=!1}}
                  />
                </div>
              `:V`<div class="ws-note">
                ${On("panels.weatherservice.messages.no-service",t)}
              </div>`}
          ${this._error?V`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?V`<div class="ws-msg ws-msg--success">
                ${On("panels.weatherservice.messages.saved",t)}
              </div>`:""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?On("panels.weatherservice.actions.saving",t):On("panels.weatherservice.actions.save",t)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${On("panels.weatherservice.messages.reload-note",t)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return h`
      ${Yn} ${Gn}

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
    `}};s([fe()],ms.prototype,"narrow",void 0),s([fe()],ms.prototype,"path",void 0),s([ve()],ms.prototype,"_info",void 0),s([ve()],ms.prototype,"_use",void 0),s([ve()],ms.prototype,"_service",void 0),s([ve()],ms.prototype,"_apiKey",void 0),s([ve()],ms.prototype,"_loading",void 0),s([ve()],ms.prototype,"_saving",void 0),s([ve()],ms.prototype,"_error",void 0),s([ve()],ms.prototype,"_saved",void 0),ms=s([ge("smart-irrigation-view-weatherservice")],ms);let fs=class extends(Ot(he)){constructor(){super(...arguments),this.zones=[],this.isLoading=!0,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}firstUpdated(){xe().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ze+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[t,a,i]=await Promise.all([Et(this.hass),(e=this.hass,e.callWS({type:ze+"/info"})),Tt(this.hass)]);this.config=t,this.info=a,this.zones=i}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._scheduleUpdate()}}render(){return this.hass?this.isLoading?V`
        <ha-card header="${On("panels.info.title",this.hass.language)}">
          <div class="card-content">
            ${On("common.loading",this.hass.language)}...
          </div>
        </ha-card>
      `:this.config?V`
      <ha-card header="${On("panels.info.title",this.hass.language)}">
        <div class="card-content">
          ${On("panels.info.description",this.hass.language)}
        </div>
      </ha-card>

      ${this.renderZoneBucketsCard()} ${this.renderNextIrrigationCard()}
      ${this.renderIrrigationReasonCard()}
    `:V`
        <ha-card header="${On("panels.info.title",this.hass.language)}">
          <div class="card-content">
            ${On("panels.info.configuration-not-available",this.hass.language)}
          </div>
        </ha-card>
      `:V``}renderZoneBucketsCard(){if(!this.hass)return V``;if(!this.zones||0===this.zones.length)return V`
        <ha-card
          header="${On("panels.info.cards.zone-bucket-values.title",this.hass.language)}"
        >
          <div class="card-content">
            <div class="info-item">
              <span class="value"
                >${On("panels.info.cards.zone-bucket-values.no-zones",this.hass.language)}</span
              >
            </div>
          </div>
        </ha-card>
      `;const e=this.config?St(this.config,ht):"mm";return V`
      <ha-card
        header="${On("panels.info.cards.zone-bucket-values.title",this.hass.language)}"
      >
        <div class="card-content">
          ${this.zones.map((t=>{var a,i,n,s,r,o,l,d;return V`
              <div class="info-item zone-info">
                <div class="zone-header">
                  <label class="zone-name">${t.name}:</label>
                </div>
                <div class="zone-details">
                  <div class="zone-bucket">
                    <span class="label"
                      >${On("panels.info.cards.zone-bucket-values.labels.bucket",null!==(i=null===(a=this.hass)||void 0===a?void 0:a.language)&&void 0!==i?i:"en")}:</span
                    >
                    <span class="value">
                      ${Number(t.bucket).toFixed(1)} ${e}
                    </span>
                  </div>
                  <div class="zone-duration">
                    <span class="label"
                      >${On("panels.info.cards.zone-bucket-values.labels.duration",null!==(s=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==s?s:"en")}:</span
                    >
                    <span class="value">
                      ${t.duration?`${Math.round(t.duration)} ${On("common.units.seconds",null!==(o=null===(r=this.hass)||void 0===r?void 0:r.language)&&void 0!==o?o:"en")}`:`0 ${On("common.units.seconds",null!==(d=null===(l=this.hass)||void 0===l?void 0:l.language)&&void 0!==d?d:"en")}`}
                    </span>
                  </div>
                </div>
              </div>
            `}))}
        </div>
      </ha-card>
    `}renderNextIrrigationCard(){var e,t,a,i,n,s,r,o;return this.hass&&this.info?V`
      <ha-card
        header="${On("panels.info.cards.next-irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${On("panels.info.cards.next-irrigation.labels.next-start",this.hass.language)}:</label
            >
            <span class="value">
              ${this.info.next_irrigation_start?cs(this.info.next_irrigation_start).format("YYYY-MM-DD HH:mm:ss"):On("panels.info.cards.next-irrigation.no-data",this.hass.language)}
            </span>
          </div>

          ${this.info.next_irrigation_duration?V`
                <div class="info-item">
                  <label
                    >${On("panels.info.cards.next-irrigation.labels.duration",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_duration}
                    ${On("common.units.seconds",this.hass.language)}</span
                  >
                </div>
              `:""}
          ${this.info.next_irrigation_zones&&this.info.next_irrigation_zones.length>0?V`
                <div class="info-item">
                  <label
                    >${On("panels.info.cards.next-irrigation.labels.zones",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_zones.join(", ")}</span
                  >
                </div>
              `:""}
        </div>
      </ha-card>
    `:V`
        <ha-card
          header="${On("panels.info.cards.next-irrigation.title",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${On("panels.info.cards.next-irrigation.labels.next-start",null!==(i=null===(a=this.hass)||void 0===a?void 0:a.language)&&void 0!==i?i:"en")}:</label
              >
              <span class="value">
                ${On("panels.info.cards.next-irrigation.no-data",null!==(s=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==s?s:"en")}
              </span>
            </div>
            <div class="info-note">
              ${On("panels.info.cards.next-irrigation.backend-todo",null!==(o=null===(r=this.hass)||void 0===r?void 0:r.language)&&void 0!==o?o:"en")}
            </div>
          </div>
        </ha-card>
      `}renderIrrigationReasonCard(){var e,t,a,i,n,s,r,o;return this.hass&&this.info?V`
      <ha-card
        header="${On("panels.info.cards.irrigation-reason.title",this.hass.language)}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${On("panels.info.cards.irrigation-reason.labels.reason",this.hass.language)}:</label
            >
            <span class="value">
              ${this.info.irrigation_reason||On("panels.info.cards.irrigation-reason.no-data",this.hass.language)}
            </span>
          </div>

          ${this.info.sunrise_time?V`
                <div class="info-item">
                  <label
                    >${On("panels.info.cards.irrigation-reason.labels.sunrise",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${cs(this.info.sunrise_time).format("HH:mm:ss")}</span
                  >
                </div>
              `:""}
          ${void 0!==this.info.total_irrigation_duration?V`
                <div class="info-item">
                  <label
                    >${On("panels.info.cards.irrigation-reason.labels.total-duration",this.hass.language)}:</label
                  >
                  <span class="value"
                    >${this.info.total_irrigation_duration}
                    ${On("common.units.seconds",this.hass.language)}</span
                  >
                </div>
              `:""}
          ${this.info.irrigation_explanation?V`
                <div class="info-item explanation">
                  <label
                    >${On("panels.info.cards.irrigation-reason.labels.explanation",this.hass.language)}:</label
                  >
                  <div class="explanation-text">
                    ${this.info.irrigation_explanation}
                  </div>
                </div>
              `:""}
        </div>
      </ha-card>
    `:V`
        <ha-card
          header="${On("panels.info.cards.irrigation-reason.title",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${On("panels.info.cards.irrigation-reason.labels.reason",null!==(i=null===(a=this.hass)||void 0===a?void 0:a.language)&&void 0!==i?i:"en")}:</label
              >
              <span class="value">
                ${On("panels.info.cards.irrigation-reason.no-data",null!==(s=null===(n=this.hass)||void 0===n?void 0:n.language)&&void 0!==s?s:"en")}
              </span>
            </div>
            <div class="info-note">
              ${On("panels.info.cards.irrigation-reason.backend-todo",null!==(o=null===(r=this.hass)||void 0===r?void 0:r.language)&&void 0!==o?o:"en")}
            </div>
          </div>
        </ha-card>
      `}static get styles(){return h`
      ${Yn} /* View-specific styles only - most common styles are now in globalStyle */

      .zone-info {
        margin-bottom: 16px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .zone-info:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .zone-header {
        margin-bottom: 8px;
      }

      .zone-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .zone-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 12px;
      }

      .zone-bucket,
      .zone-duration {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .zone-bucket .label,
      .zone-duration .label {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      .zone-bucket .value,
      .zone-duration .value {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      @media (min-width: 768px) {
        .zone-details {
          flex-direction: row;
          gap: 24px;
        }

        .zone-bucket,
        .zone-duration {
          flex: 1;
        }
      }
    `}};s([fe()],fs.prototype,"config",void 0),s([fe({type:Object})],fs.prototype,"info",void 0),s([fe({type:Array})],fs.prototype,"zones",void 0),s([fe({type:Boolean})],fs.prototype,"isLoading",void 0),fs=s([ge("smart-irrigation-view-info")],fs);const vs=Yn,bs=()=>{const e=e=>{let t={};for(let a=0;a<e.length;a+=2){const i=e[a],n=a<e.length?e[a+1]:void 0;t=Object.assign(Object.assign({},t),{[i]:n})}return t},t=window.location.pathname.split("/");let a={page:t[2]||"general",params:{}};if(t.length>3){let i=t.slice(3);if(t.includes("filter")){const t=i.findIndex((e=>"filter"==e)),n=i.slice(t+1);i=i.slice(0,t),a=Object.assign(Object.assign({},a),{filter:e(n)})}i.length&&(i.length%2&&(a=Object.assign(Object.assign({},a),{subpage:i.shift()})),i.length&&(a=Object.assign(Object.assign({},a),{params:e(i)})))}return a},_s=(e,...t)=>{let a={page:e,params:{}};t.forEach((e=>{"string"==typeof e?a=Object.assign(Object.assign({},a),{subpage:e}):"params"in e?a=Object.assign(Object.assign({},a),{params:e.params}):"filter"in e&&(a=Object.assign(Object.assign({},a),{filter:e.filter}))}));const i=e=>{let t=Object.keys(e);t=t.filter((t=>e[t])),t.sort();let a="";return t.forEach((t=>{const i=e[t];a=a.length?`${a}/${t}/${i}`:`${t}/${i}`})),a};let n=`/${ze}/${a.page}`;return a.subpage&&(n=`${n}/${a.subpage}`),i(a.params).length&&(n=`${n}/${i(a.params)}`),a.filter&&(n=`${n}/filter/${i(a.filter)}`),n};var ys;!function(e){e.Info="info",e.General="general",e.Zones="zones",e.Modules="modules",e.Mappings="mappings",e.WeatherService="weatherservice",e.Help="help"}(ys||(ys={})),e.SmartIrrigationPanel=class extends he{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}async firstUpdated(){const e=bs();e.page&&Object.values(ys).includes(e.page)?(window.addEventListener("location-changed",(()=>{if(!window.location.pathname.includes("smart-irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())})),xe().then((()=>{this._scheduleUpdate()})).catch((e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()}))):At(0,_s(ys.General))}render(){const e=bs(),t=!!customElements.get("ha-tab-group"),a=!!customElements.get("ha-tab-group-tab");return V`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${On("title",this.hass.language)}</div>
          <div class="version">${"v2025.10.0"}</div>
        </div>

        ${t&&a?V`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${Object.values(ys).map((t=>V`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${t}"
                      .active=${e.page===t}
                    >
                      ${On(`panels.${t}.title`,this.hass.language)}
                    </ha-tab-group-tab>
                  `))}
              </ha-tab-group>
            `:V`
              <div class="custom-tabs">
                ${Object.values(ys).map((t=>V`
                    <button
                      class="custom-tab ${e.page===t?"active":""}"
                      @click=${()=>this.navigateToPage(t)}
                    >
                      ${On(`panels.${t}.title`,this.hass.language)}
                    </button>
                  `))}
              </div>
            `}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}getView(e){switch(e.page){case"info":return V`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-info>
        `;case"general":return V`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-general>
        `;case"zones":return V`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-zones>
        `;case"modules":return V`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-modules>
        `;case"mappings":return V`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-mappings>
        `;case"weatherservice":return V`
          <smart-irrigation-view-weatherservice
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-weatherservice>
        `;case"help":return V`<ha-card
          header="${On("panels.help.cards.how-to-get-help.title",this.hass.language)}"
        >
          <div class="card-content">
            ${On("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
            <a href="https://github.com/jeroenterheerdt/HAsmartirrigation/wiki"
              >${On("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
            >.
            ${On("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${On("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
            >
            ${On("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
            <a
              href="https://github.com/jeroenterheerdt/HAsmartirrigation/issues"
              >${On("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
            >
            (${On("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
          </div></ha-card
        >`;default:return V`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}navigateToPage(e){if(e!==bs().page){const t=_s(e);At(0,t),this.requestUpdate()}else scrollTo(0,0)}handlePageSelected(e){const t=e.detail.name;if(t!==bs().page){const e=_s(t);At(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[vs,h`
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
      `]}},s([fe({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),s([fe({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),e.SmartIrrigationPanel=s([ge("smart-irrigation")],e.SmartIrrigationPanel);let ws=class extends he{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?V`
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
              .path=${Pn}
            ></ha-icon-button>
            <span class="errortitle" slot="title">
              ${this.hass.localize("state_badge.default.error")}
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._params.error||""}</div>

        <mwc-button
          slot="primaryAction"
          style="float: left"
          @click=${this.closeDialog}
          dialogAction="close"
        >
          ${this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    `:V``}static get styles(){return h`
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.errortitle {
        font-size: 2em;
        font-weight: bold;
        vertical-align: bottom;
      }
    `}};s([fe({attribute:!1})],ws.prototype,"hass",void 0),s([ve()],ws.prototype,"_params",void 0),ws=s([ge("error-dialog")],ws);var xs=Object.freeze({__proto__:null,get ErrorDialog(){return ws}});Object.defineProperty(e,"__esModule",{value:!0})}({});
//# sourceMappingURL=smart-irrigation.js.map
