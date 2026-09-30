!function(e){"use strict";function t(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i}function i(e,t,i,s){var a,n=arguments.length,r=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,s);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(r=(n<3?a(r):n>3?a(t,i,r):a(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const s=globalThis,a=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const l=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1]),e[0]);return new o(i,e,n)},h=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,n))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,{is:d,defineProperty:c,getOwnPropertyDescriptor:u,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:m}=Object,f=globalThis,v=f.trustedTypes,_=v?v.emptyScript:"",b=f.reactiveElementPolyfillSupport,y=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},$=(e,t)=>!d(e,t),x={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:a}=u(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);a?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(h(e))}else void 0!==e&&t.push(h(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const i of t){const t=document.createElement("style"),a=s.litNonce;void 0!==a&&t.setAttribute("nonce",a),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=s;const n=a.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,a){if(void 0!==e){const n=this.constructor;if(!1===s&&(a=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??$)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:a},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[y("elementProperties")]=new Map,k[y("finalized")]=new Map,b?.({ReactiveElement:k}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const S=globalThis,T=S.trustedTypes,O=T?T.createPolicy("lit-html",{createHTML:e=>e}):void 0,M="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+z,A=`<${E}>`,H=document,C=()=>H.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,P="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,U=/>/g,I=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,j=/"/g,Y=/^(?:script|style|textarea|title)$/i,F=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),W=F(1),V=F(2),G=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),q=new WeakMap,K=H.createTreeWalker(H,129);function J(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==O?O.createHTML(t):t}class X{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let a=0,n=0;const r=e.length-1,o=this.parts,[l,h]=((e,t)=>{const i=e.length-1,s=[];let a,n=2===t?"<svg>":3===t?"<math>":"",r=R;for(let t=0;t<i;t++){const i=e[t];let o,l,h=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===R?"!--"===l[1]?r=L:void 0!==l[1]?r=U:void 0!==l[2]?(Y.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=I):void 0!==l[3]&&(r=I):r===I?">"===l[0]?(r=a??R,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?I:'"'===l[3]?j:B):r===j||r===B?r=I:r===L||r===U?r=R:(r=I,a=void 0);const c=r===I&&e[t+1].startsWith("/>")?" ":"";n+=r===R?i+A:h>=0?(s.push(o),i.slice(0,h)+M+i.slice(h)+z+c):i+z+(-2===h?t:c)}return[J(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=X.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=K.nextNode())&&o.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(M)){const t=h[n++],i=s.getAttribute(e).split(z),r=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:r[2],strings:i,ctor:"."===r[1]?se:"?"===r[1]?ae:"@"===r[1]?ne:ie}),s.removeAttribute(e)}else e.startsWith(z)&&(o.push({type:6,index:a}),s.removeAttribute(e));if(Y.test(s.tagName)){const e=s.textContent.split(z),t=e.length-1;if(t>0){s.textContent=T?T.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],C()),K.nextNode(),o.push({type:2,index:++a});s.append(e[t],C())}}}else if(8===s.nodeType)if(s.data===E)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=s.data.indexOf(z,e+1));)o.push({type:7,index:a}),e+=z.length-1}a++}}static createElement(e,t){const i=H.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,s){if(t===G)return t;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const n=D(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(t=Q(e,a._$AS(e,t.values),a,s)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??H).importNode(t,!0);K.currentNode=s;let a=K.nextNode(),n=0,r=0,o=i[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new te(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new re(a,this,e)),this._$AV.push(t),o=i[++r]}n!==o?.index&&(a=K.nextNode(),n++)}return K.currentNode=H,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),D(e)?e===Z||null==e||""===e?(this._$AH!==Z&&this._$AR(),this._$AH=Z):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Z&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=X.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ee(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new X(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const a of e)s===t.length?t.push(i=new te(this.O(C()),this.O(C()),this,this.options)):i=t[s],i._$AI(a),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,a){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(e,t=this,i,s){const a=this.strings;let n=!1;if(void 0===a)e=Q(this,e,t,0),n=!D(e)||e!==this._$AH&&e!==G,n&&(this._$AH=e);else{const s=e;let r,o;for(e=a[0],r=0;r<a.length-1;r++)o=Q(this,s[i+r],t,r),o===G&&(o=this._$AH[r]),n||=!D(o)||o!==this._$AH[r],o===Z?e=Z:e!==Z&&(e+=(o??"")+a[r+1]),this._$AH[r]=o}n&&!s&&this.j(e)}j(e){e===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Z?void 0:e}}class ae extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Z)}}class ne extends ie{constructor(e,t,i,s,a){super(e,t,i,s,a),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Z)===G)return;const i=this._$AH,s=e===Z&&i!==Z||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const oe={I:te},le=S.litHtmlPolyfillSupport;le?.(X,te),(S.litHtmlVersions??=[]).push("3.3.3");const he=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */let de=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let a=s._$litPart$;if(void 0===a){const e=i?.renderBefore??null;s._$litPart$=a=new te(t.insertBefore(C(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};de._$litElement$=!0,de.finalized=!0,he.litElementHydrateSupport?.({LitElement:de});const ce=he.litElementPolyfillSupport;ce?.({LitElement:de}),(he.litElementVersions??=[]).push("4.2.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ue=e=>(t,i)=>{void 0!==i?i.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,pe={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:$},ge=(e=pe,t,i)=>{const{kind:s,metadata:a}=i;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,a,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const a=this[s];t.call(this,i),this.requestUpdate(s,a,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function me(e){return(t,i)=>"object"==typeof i?ge(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function fe(e){return me({...e,state:!0,attribute:!1})}
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
function ve(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}let _e=!1,be=null;const ye=async()=>{if(_e&&be)return be;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();_e=!0,be=async function(){try{await new Promise((e=>{"requestIdleCallback"in window?requestIdleCallback((()=>e())):setTimeout((()=>e()),0)})),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),t=document.createElement("partial-panel-resolver");e.appendChild(t),t.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise((e=>queueMicrotask((()=>e())))),t._updateRoutes(),await t.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise((e=>queueMicrotask((()=>e()))));const i=document.createElement("ha-panel-config");e.appendChild(i),await i.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await be}finally{_e=!1,be=null}};var we={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds",minutes:"min",hours:"h"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"bucket",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."},modes:{manual:"Manual",standard:"Standard",advanced:"Advanced"}},$e={"default-zone":"Default zone","default-mapping":"Default sensor group"},xe={calculation:{explanation:{"formatting-note":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values.","module-returned-evapotranspiration-deficiency":"Module returned Crop evapotranspiration deficiency ( = et0 * hour_multiplier * Kc + precipitation) of","module-returned-hourly-evapotranspiration-deficiency":"Module summed the Crop evapotranspiration deficiency hour by hour ( = sum of hourly et0 * Kc + precipitation) over","crop-factor-is":"Crop factor is","bucket-was":"Bucket was","new-bucket-values-is":"New bucket value is",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since bucket < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","precipitation-rate-is":"The precipitation rate is","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since bucket >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum bucket size is","drainage-rate-is":"Drainage rate when saturated (bucket at max) is","current-drainage-is":"Current drainage is calculated as","no-drainage":"Current drainage is 0 because","below-irrigation-threshold":"The deficit has not reached this zone's irrigation threshold yet, so no irrigation is necessary and the duration is set to 0. Deficit / threshold:"}}},ke={pyeto:{description:"The full calculation, from your own weather sensors: temperature, humidity, pressure, wind and solar radiation. The most accurate option, and the one that asks for the most."},static:{description:"A fixed amount of evaporation per day, which you set yourself. No sensors and no weather service."},passthrough:{description:"Takes an evapotranspiration figure that already exists, from a sensor or from a weather service that publishes one. The recommended path when you have one."}},Se={setup:{title:"Setup",description:"A guided way to create your first zone. It asks one question at a time, and only the questions your previous answers leave open.",next:"Next",back:"Back",create:"Create it",creating:"Creating...",failed:"Something went wrong and nothing was created. The other tabs are still there if you would rather set it up by hand.",done:"Your zone is ready.","done-note":"It appears under Zones, with its sensor group under Sensor groups. Nothing here is special: edit either of them as you would any other. Run an update and a calculation once your sensors have reported, and the zone will start producing a duration.",steps:{zone:{question:"What are you watering?",help:"One zone is one valve, watering one area.",name:"Name",size:"Area",throughput:"Throughput","throughput-help":"How much water this zone delivers per minute. Measure it if you can, rather than taking it from a datasheet: it is what every duration is derived from, and it is the quietest way to water twice as long as you meant to."},environment:{question:"Where does it grow?",outdoors:"Outdoors","outdoors-help":"Open air. Rain reaches it, and the sky is worth asking about.","under-glass":"Under glass or plastic","under-glass-help":"A greenhouse, a polytunnel, a conservatory. No rain arrives, and a forecast describes weather these plants never see."},weather:{question:"Where should the evaporation figure come from?",service:"The weather service you configured","service-help":"Nothing else to install. Smart Irrigation takes the weather for your location and computes evapotranspiration from it.","no-service-indoors":"A weather service is not offered here: it describes the sky, which these plants are not under.",sensors:"My own weather sensors","sensors-help":"You have sensors for temperature, humidity and the rest. The most accurate option, because it measures where the plants actually are.",et:"A sensor that already reports evapotranspiration","et-help":"Something else already computes it, and Smart Irrigation should use that figure as it stands.",static:"A fixed amount per day","static-help":"No sensors and no service. You give one number and it is used every day. Rough, but it still tracks what you have already watered."},sensors:{question:"Which entities should it read?",help:"Only the ones the calculation actually uses are asked for.","lux-hint":"Under glass a light sensor can stand in for solar radiation: pick your illuminance entity here and set its source to Light sensor (lux) afterwards, in the sensor group.","static-question":"How much does it evaporate per day?","static-help":"A depth of water, in the unit your zones use. Somewhere around 4 to 5 mm a day is common for a temperate summer.","static-label":"Evaporation per day"},review:{question:"Ready to create",zone:"Zone",environment:"Environment",engine:"Calculation engine",sources:"Sources","from-the-service":"from the weather service",help:"This creates a calculation module, a sensor group and a zone, exactly as the other tabs would. Nothing is locked afterwards."}},step:"step"},weatherservice:{history:{title:"History",refresh:"Refresh","last-update":"Last update",time:"Retrieved","sensor-group":"Sensor group","no-data":"No data has been retrieved from the weather service yet."},title:"Weather service",description:"View and change the weather service used to fetch weather data — no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key"},actions:{save:"Save",saving:"Saving…"},messages:{"no-service":"No weather service is used — weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately.","owm-onecall-hint":"OpenWeatherMap needs the One Call API 3.0 plan (One Call by Call). It is free up to 1000 calls/day but must be activated with a card, and a new key can take up to a couple of hours to work. A plain default key is rejected."}},backuprestore:{title:"Backup / restore",description:"Export the full Smart Irrigation configuration to a JSON file, or restore it from a previous backup.",cards:{backup:{title:"Backup",description:"Download the complete configuration (general settings, zones, modules and sensor groups) as a JSON file."},restore:{title:"Restore",description:"Load a previously exported JSON file to replace the current configuration."}},actions:{export:"Export to JSON","choose-file":"Choose a backup file…",restore:"Restore this backup",restoring:"Restoring…"},messages:{exported:"Backup file downloaded.",restored:"Configuration restored — reloading the integration.","invalid-file":"This file is not a valid Smart Irrigation backup.","confirm-title":"Replace the entire configuration?",summary:"This backup contains","confirm-warning":"Restoring overwrites all current general settings, zones, modules and sensor groups. This cannot be undone.","reload-note":"Restoring replaces everything and reloads the integration to apply the change."}},general:{cards:{"automatic-duration-calculation":{header:"Automatic duration calculation",description:"Calculation takes collected weather data up to that point and updates the bucket for each automatic zone. Then, the duration is adjusted based on the new bucket value and the collected weather data is removed.",labels:{"auto-calc-enabled":"Automatically calculate irrigation durations","calc-time":"Calculate at","hourly-calculation":"Calculate evapotranspiration hour by hour","hourly-calculation-hint":"Sums the FAO-56 hourly equation over each hour since the last calculation, instead of applying the daily equation to the averages, which hides whether the sun and the heat came together. A new installation starts on it; an installation set up before it arrived keeps the daily equation until you switch, because the two give different numbers and your watering should not change on an update. The sun of each hour comes from a radiation or illuminance sensor, from the weather service's own hourly history, or from the day's temperature range. It is worth having when readings arrive through the day: one update a day leaves a single reading held across twenty-four hours, and neither form is trustworthy then. A greenhouse with no sensor of its own keeps the daily equation."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Update sensor data every","auto-update-delay":"Update delay"},options:{minutes:"minutes",hours:"hours",days:"days"}},continuousupdates:{header:"Continuous updates for sensors (experimental)",description:"This experimental feature will continuously update the sensor data. This is useful for sensor groups that use sources that provide continuous data, such as weather stations. This feature cannot be used for sensor groups that at least partly rely on weather services as continous polling of APIs will incur costs. Keep in mind that this is experimental and may not work as expected. Use at your own risk.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}},"panel-mode":{header:"Panel",labels:{advanced:"Advanced settings","advanced-hint":"Shows the settings that tune the model: drainage, thresholds, multiplier, how far ahead a zone looks. They have sound defaults; leave this off unless you know you need them. Your values are kept either way."}},"setup-assistant":{description:"Four questions at most, and it creates a sensor group and a zone for you, choosing what each needs. For a first zone, another one, or a fresh start. It used to be a tab, which invited an installation that was already set up to set itself up.",open:"Open the assistant"}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"},translate:{title:"Help translate",text:"Apart from English and French, the translations of this panel were machine-made and nobody who speaks the language has checked them yet. If a word or a sentence reads oddly in yours, you can correct it in your browser, with no technical knowledge needed.",link:"Translate on Weblate"}}},info:{title:"Info",description:"What will happen at the next start, and why.","configuration-not-available":"Configuration not available.",cards:{"next-run":{title:"Next run",labels:{start:"Starts",duration:"Total duration",zones:"Zones watering",trigger:"Trigger"},"no-start":"No start time could be worked out yet.","nothing-to-water":"Nothing to water: no zone has reached its irrigation threshold.","trigger-default":"Default, finishing at sunrise","accounts-for-duration":"counted back so the run finishes then","starts-at-trigger":"starts at that moment","sequencing-sequential":"one zone at a time, so the total is every zone added up","sequencing-parallel":"all zones at once, so the total is the longest zone","headline-nothing":"Nothing to water","sub-nothing":"No zone is short enough of water yet. The next start would be {start}.","headline-watering":"Watering {start}","headline-watering-soon":"Watering at the next start","sub-watering":"{count} zone(s), {duration} in all.","headline-postponed":"Watering is held back","sub-postponed":"You postponed it. It resumes by itself, and nothing is lost: a zone that is short of water still is.","headline-skipped":"No watering today","headline-not-scheduled":"A run is owed, and nothing is scheduled to start it","sub-not-scheduled":"The time above is when it would start. No start trigger is armed right now, which happens when the active trigger is disabled or was not registered. Check the trigger under Settings, and if it looks right, a calculation re-arms it."},decision:{title:"Will it be skipped?","will-run":"Nothing is holding the run back.","will-skip":"The run would be skipped.","preview-note":"Evaluated just now. A forecast can still change before the start.",unavailable:"The skip conditions could not be evaluated.","last-title":"Last real decision","last-none":"No run has been decided yet.","last-skipped":"Skipped","last-ran":"Went ahead","check-precipitation":"Rain forecast","check-days_between":"Days between irrigation","state-off":"Off","state-unavailable":"Could not be checked","state-passing":"Not blocking","state-blocking":"Blocking","detail-forecast":"Forecast","detail-threshold":"Threshold","detail-days-since":"Days since last run","detail-days-required":"Days required","check-rain_sensor":"Rain sensor","check-freeze":"Freeze","check-wind":"Wind","check-soil_moisture":"Soil moisture","detail-now":"Now","detail-weather-service":"weather service","detail-raining":"It is raining","detail-dry":"Not raining","detail-held":"sits out this run","check-postponed":"Postponed by you"},estimate:{title:"Where each zone stands now",note:"Estimated by running the calculation on the readings collected since it last ran. Nothing is committed: a zone keeps the value from its last calculation until the next one.",none:"No zone can be estimated yet.",labels:{now:"Now","at-last-calculation":"At last calculation","would-water":"Would water","last-irrigation":"Last watered"},nothing:"nothing","never-watered":"never"},postpone:{prompt:"Rain the forecast missed, or a reason of your own?","for-24":"Hold for 24 h","for-48":"Hold for 48 h",until:"Watering is held back until",resume:"Resume now"},forecast:{today:"Today"},stale:{title:"A zone is no longer being calculated",body:"Its water need is older than the others, so it is watering on old weather. Check that its sensor group still receives data, and look at the log for what the calculation said about it.",never:"never calculated"}},gaps:{auto_calc_off:{title:"Nothing is being calculated",body:"Automatic duration calculation is off, so the zones' durations never update. Turn it back on under Settings, or calculate by hand when you want a run."},no_automatic_zone:{title:"No zone waters on its own",body:"Every zone is manual or disabled, so a start reaches nothing. Set a zone to automatic for it to be watered by the schedule."},no_valve_path:{title:"Nothing here opens a valve",body:"Smart Irrigation calculates how long to water; something has to act on it. Either link a valve to a zone and turn on direct valve control, or write an automation on the start event (the blueprints do this for you). If an automation already does it, there is nothing to change."}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-of-sensor-values-to-calculate":"of sensor values to calculate duration","sensor-aggregate-use-the":"Use the","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",weather_service:"Weather service",sensor:"Sensor",static:"Static value",illuminance:"Light sensor (lux)"},luminous_efficacy:"Luminous efficacy",greenhouse:"Greenhouse",greenhouse_description:"An enclosed environment: a greenhouse, a polytunnel, anything under glass or plastic. No rain reaches these zones, so precipitation is left out of their water balance and its fields are hidden. Two things to set yourself, because they cannot be guessed: give Wind speed a static value near 0, since the calculation assumes open air, and use a light sensor for Solar Radiation, since the glazing filters the sky.",module:"Calculation engine",module_description:"This group only offers the sources this engine reads. The zones using it inherit the choice.",module_undecided:"No engine chosen yet, so every source is offered and each zone using this group keeps its own. Pick one to see only the sources it reads.",wind_height:"Anemometer height (empty: taken at 2 m)"}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name"},no_items:"There are no sensor group defined yet.",title:"Sensor groups","weather-records":{title:"Weather records (last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"},summary:{"sources-one":"{n} source","sources-other":"{n} sources","zones-one":"{n} zone","zones-other":"{n} zones"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket","et-deficiency":"Daily ET deficiency",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Crop factor (Kc)",name:"Name","input-method":"Input method","input-methods":{throughput:"Throughput & area",direct:"Precipitation rate"},"precipitation-rate":"Precipitation rate",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate","linked-entity":"Linked valve/switch","linked-entity-hint":"The valve or switch that waters this zone. Smart Irrigation opens and closes it when direct valve control is on. With observed watering on, any run of it (a manual tap, an automation, or Smart Irrigation itself) credits the bucket from the run time and the zone's throughput.","flow-sensor":"Cumulative volume meter","flow-sensor-hint":"For exact crediting instead of throughput x time: a cumulative water-meter total (state class total_increasing), not an instant flow rate. The unit is read automatically (L, mL, m³, gal, ft³).",optional:"optional","irrigation-threshold":"Irrigation threshold","soil-moisture-sensor":"Soil moisture sensor","soil-moisture-sensor-hint":"The zone sits out a run while the soil is at or above the threshold. The bucket is kept.","soil-moisture-threshold":"Skip at or above","calculation-method":"Evapotranspiration","calculation-method-help":{from_weather:"From your measurements: temperature, humidity, wind, sun.",provided:"You already have an evapotranspiration in mm; it is taken as it is.",fixed:"So many mm a day, whatever the weather."},"calculation-methods":{from_weather:"Calculated by Smart Irrigation",provided:"Provided by a sensor or a service",fixed:"A fixed amount"},"forecast-days":"Look ahead","forecast-days-help":"0: the zone waters what the weather actually took. 1: tomorrow is taken into account as well, 2: tomorrow and the day after, and so on. The hotter the days ahead, the more is watered today. This is not the rain skip, which is a setting of its own.","fixed-amount":"Fixed amount","engine-shared-help":"This setting belongs to this zone alone: each zone has its own, and changing it here changes nothing anywhere else.","soil-type":"Soil","plant-type":"What grows here","soil-types":{sand:"Sandy",sandy_loam:"Sandy loam",loam:"Loam",clay_loam:"Clay loam",clay:"Clay",custom:"I set the drainage rate myself"},"plant-types":{lawn:"Lawn",vegetables:"Vegetables",flowers:"Flowers",shrubs:"Shrubs",hedge:"Hedge",fruit_trees:"Fruit trees",vines:"Vines",ground_cover:"Ground cover",custom:"I set the crop coefficient myself"},"duration-readonly-automatic":"Calculated for you: this zone's run comes from its water balance. Set it to manual to type a duration yourself.","duration-readonly-disabled":"A disabled zone is never watered, so it has no run time.","et-deficiency-help":"What this zone needs per day: ETc, the reference evapotranspiration times the crop factor, seasonal adjustment included. Before the interval scaling and before rain, which is what makes it comparable from one configuration to the next. The zone sensor also carries the reference figure on its own, as the `eto` attribute, for holding against what a weather service publishes."},no_items:"There are no zones defined yet.",title:"Zones","module-comes-from-the-group":"The calculation engine comes from this zone's sensor group. Change it there, and every zone using that group follows.",status:{"will-water":"Will water {duration} at the next start.",idle:"Nothing to water: {short} short.",satisfied:"Nothing to water: this zone has what it needs.","under-threshold":"Nothing to water yet: {short} short, under this zone's threshold.",manual:"Waters only when you ask.",disabled:"Disabled: never watered, and its balance is not kept.",threshold:"threshold"},calendar:{title:"Watering calendar (12 months, estimated)",caveat:"A planning estimate, not your weather: the months are modelled from your latitude and a typical seasonal pattern, so a continental summer reads hotter and drier than it is. It influences nothing, calculates nothing and waters nothing.",month:"Month",et:"ET",precipitation:"Precipitation",watering:"Watering","avg-temp":"Avg temp",none:"No watering calendar data available for this zone",error:"Could not generate the calendar"}},history:{title:"History",description:"Every irrigation run Smart Irrigation has credited to a zone: when it started, how long it watered and how much water it used. Runs are recorded by direct valve control and by observed watering, and are kept for 90 days.",refresh:"Refresh","no-data":"No irrigation runs have been recorded yet.",table:{title:"Irrigation runs",start:"Start",zone:"Zone",duration:"Duration",water:"Water used",truncated:"Showing the {count} most recent runs out of {total}."},charts:{"total-title":"Total water used per day (last 30 days)","per-zone-title":"Water used per day, per zone (last 30 days)","no-data":"No water was used in this period."}},groups:{home:"Home",zones:"Zones",data:"Data",settings:"Settings"}},Te="Smart Irrigation",Oe={title:"Irrigation start triggers",description:"Configure when irrigation should start based on solar events. Define your triggers below, then choose which single one starts irrigation. For sunrise triggers, leaving offset at 0 will automatically use the total duration of all enabled zones.",active_label:"Active trigger",active_default:"Default (sunrise minus total watering duration)",active_hint:'Only the selected trigger starts irrigation, so it runs once per day. "Default" times the run to finish right at sunrise. Add custom triggers (sunset, azimuth, offsets) below, then pick one here.',usage_before:"When a trigger fires, Smart Irrigation emits the event ",usage_after:" — listen to it in an automation to start watering. The event data includes trigger_name, trigger_type and offset_minutes, so you can react differently per trigger. The precipitation skip and days-between-irrigation settings still apply: on a skip day no event is fired.",add_trigger:"Add trigger",edit_trigger:"Edit Trigger",delete_trigger:"Delete Trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth",time:"Fixed time"},fields:{name:{name:"Trigger Name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger Type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Offset (minutes)",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth Angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for Duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."},at:{name:"Time"}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete",help:"When this trigger fires, Smart Irrigation emits the following event — use it in an automation to start watering. The event data includes this trigger's name (and type/offset), so you can react to it specifically:"},no_triggers:"No irrigation start triggers configured. The system will use the default behavior (sunrise with total zone duration). Add triggers to customize when irrigation starts.",offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number",time_invalid:"Please enter a valid time as HH:MM."},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can configure multiple triggers. Each enabled trigger will independently schedule irrigation starts."}},Me={title:"Weather-based irrigation skip",description:"Automatically skip irrigation when precipitation is forecasted. This feature requires a weather service to be configured.",threshold_label:"Precipitation Threshold",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation."},ze={title:"Location coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Ee={title:"Days between irrigation",description:"Configure the minimum number of days that must pass between irrigation events. This helps control watering frequency for water conservation and plant health management.\n\nTypical real-world use cases:\n• Lawn care: 1-2 day intervals prevent overwatering\n• Drought restrictions: 6+ day intervals for weekly watering\n• Deep-rooted plants: 3-7 day intervals for less frequent watering\n• Water conservation: Customizable based on climate and soil conditions",label:"Minimum days between irrigation",help_text:"Set to 0 to disable this feature. Values from 1-365 days are supported. This setting works alongside existing precipitation forecasting logic."},Ae={title:"Observed watering (closed loop)",description:"Credit each zone's bucket automatically from real irrigation, instead of resetting the bucket from an automation. Once enabled, pick a valve/switch entity per zone in the Zones tab: while it is open, the bucket is credited from the run time and the zone's throughput. For exact accounting you can also pick a cumulative volume meter (a water-meter style total) per zone, and the measured volume is used instead. Important: when this is on it is the only thing crediting the bucket, so remove any reset_bucket call from your irrigation automation to avoid double counting.",enabled_label:"Enable observed watering",direct_control_label:"Let Smart Irrigation control the valve",direct_control_description:"When on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it - no automation needed. An in-flight run resumes after a restart. Safety: if Home Assistant goes down for a long time mid-run the valve stays open and keeps watering, so give your valve a hardware failsafe (a maximum runtime).",sequencing_label:"Zone sequencing",sequencing:{sequential:"Sequential (one zone at a time)",parallel:"Parallel (all zones at once)"},sequencing_description:"How your zones are watered. This sets what a start trigger works back from when it has to finish at sunrise: one after another takes the sum of every zone's run time, all at once takes the longest of them. It applies whether Smart Irrigation opens the valves itself or an automation of your own does.",passes_label:"Water in several passes",passes_description:"Cycle and soak: the same water, split into shorter passes with a pause between them, so heavy soil takes it in instead of letting it run off. One pass waters in a single go, which is the default. A run too short to split is left alone.",soak_label:"Soak between passes",pause_between_zones_label:"Pause between zones",pause_between_zones_description:"A wait between two zones of a sequential run: time for the line pressure to recover, or for a slow valve to finish closing before the next one opens.",minutes:"minutes",seconds:"seconds"},He={title:"Calculation log",description:"Write the complete input of every calculation to a file, so two days that look alike but water very differently can be compared afterwards. Each calculation appends one line: the sensor group records and how they were aggregated, the module intermediates (solar radiation, net radiation, ET0), and the resulting bucket, duration and volume. Off by default; the file is capped in size and rotated, so it can be left on for a season.",enabled_label:"Log calculation inputs to a file",file_hint:"Written to config/smart_irrigation/calc_log.jsonl, one JSON record per line. The most recent records are also included in the diagnostics download (coordinates rounded, entity ids removed), so you can attach them to an issue in one step."},Ce={title:"Skip on measured conditions",description:"Checked at the start of each run, from a sensor or the weather service. A sensor that cannot be read never stops a run.",enabled:"Enabled",threshold:"Threshold",sensor:"Sensor","sensor-optional":"Sensor (optional)",rain:{title:"Rain sensor",description:"Skip the run while a rain sensor says it is raining.","sensor-hint":"A binary sensor that is on while it rains.","history-label":"Shorten runs after recent rain","history-description":"For a zone that has no rain in millimetres at all: no gauge, and a weather service that gives none. The sensor's own history over the last five days is read, weighted so that yesterday counts for more than four days ago, and the run is shortened by it. A day of reported rain today takes the whole run; four days ago takes a tenth of it. It never touches the water balance, because it does not know how many millimetres fell: the deficit stays and is watered off once the weather turns. A zone whose sensor group does report rain in millimetres is left alone, since the balance already has it. This needs a sensor that stays on while it rains rather than one that pulses per tip."},freeze:{title:"Freeze",description:"Skip the run when the temperature is at or below the threshold.","sensor-hint":"Empty: the weather service's current temperature."},wind:{title:"Wind",description:"Skip the run when the wind is at or above the threshold: a sprinkler in strong wind waters the path, not the bed.","sensor-hint":"Empty: the weather service's current wind, at 10 m."}},De={next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"rain forecast",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water"}},Ne={common:we,defaults:$e,module:xe,calcmodules:ke,panels:Se,title:Te,irrigation_start_triggers:Oe,weather_skip:Me,coordinate_config:ze,days_between_irrigation:Ee,observed_watering:Ae,calculation_log:He,measured_skip:Ce,card:De},Pe=Object.freeze({__proto__:null,calcmodules:ke,calculation_log:He,card:De,common:we,coordinate_config:ze,days_between_irrigation:Ee,default:Ne,defaults:$e,irrigation_start_triggers:Oe,measured_skip:Ce,module:xe,observed_watering:Ae,panels:Se,title:Te,weather_skip:Me});function Re(e,t){const i=t&&t.cache?t.cache:Fe,s=t&&t.serializer?t.serializer:je;return(t&&t.strategy?t.strategy:Be)(e,{cache:i,serializer:s})}function Le(e,t,i,s){const a=null==(n=s)||"number"==typeof n||"boolean"==typeof n?s:i(s);var n;let r=t.get(a);return void 0===r&&(r=e.call(this,s),t.set(a,r)),r}function Ue(e,t,i){const s=Array.prototype.slice.call(arguments,3),a=i(s);let n=t.get(a);return void 0===n&&(n=e.apply(this,s),t.set(a,n)),n}function Ie(e,t,i,s,a){return i.bind(t,e,s,a)}function Be(e,t){return Ie(e,this,1===e.length?Le:Ue,t.cache.create(),t.serializer)}const je=function(){return JSON.stringify(arguments)};var Ye=class{constructor(){this.cache=Object.create(null)}get(e){return this.cache[e]}set(e,t){this.cache[e]=t}};const Fe={create:function(){return new Ye}},We={variadic:function(e,t){return Ie(e,this,Ue,t.cache.create(),t.serializer)}},Ve=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Ge(e){const t={};return e.replace(Ve,(e=>{const i=e.length;switch(e[0]){case"G":t.era=4===i?"long":5===i?"narrow":"short";break;case"y":t.year=2===i?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][i-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][i-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===i?"long":5===i?"narrow":"short";break;case"e":if(i<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"c":if(i<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][i-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][i-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][i-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][i-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][i-1];break;case"s":t.second=["numeric","2-digit"][i-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=i<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}const Ze=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;const qe=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,Ke=/^(@+)?(\+|#+)?[rs]?$/g,Je=/(\*)(0+)|(#+)(0+)|(0+)/g,Xe=/^(0+)$/;function Qe(e){const t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(Ke,(function(e,i,s){return"string"!=typeof s?(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length):"+"===s?t.minimumSignificantDigits=i.length:"#"===i[0]?t.maximumSignificantDigits=i.length:(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length+("string"==typeof s?s.length:0)),""})),t}function et(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function tt(e){let t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){const i=e.slice(0,2);if("+!"===i?(t.signDisplay="always",e=e.slice(2)):"+?"===i&&(t.signDisplay="exceptZero",e=e.slice(2)),!Xe.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function it(e){const t=et(e);return t||{}}function st(e){let t={};for(const i of e){switch(i.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=i.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=i.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t={...t,notation:"scientific",...i.options.reduce(((e,t)=>({...e,...it(t)})),{})};continue;case"engineering":t={...t,notation:"engineering",...i.options.reduce(((e,t)=>({...e,...it(t)})),{})};continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(i.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(i.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");i.options[0].replace(Je,(function(e,i,s,a,n,r){if(i)t.minimumIntegerDigits=s.length;else{if(a&&n)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(Xe.test(i.stem)){t.minimumIntegerDigits=i.stem.length;continue}if(qe.test(i.stem)){if(i.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");i.stem.replace(qe,(function(e,i,s,a,n,r){return"*"===s?t.minimumFractionDigits=i.length:a&&"#"===a[0]?t.maximumFractionDigits=a.length:n&&r?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+r.length):(t.minimumFractionDigits=i.length,t.maximumFractionDigits=i.length),""}));const e=i.options[0];"w"===e?t={...t,trailingZeroDisplay:"stripIfInteger"}:e&&(t={...t,...Qe(e)});continue}if(Ke.test(i.stem)){t={...t,...Qe(i.stem)};continue}const e=et(i.stem);e&&(t={...t,...e});const s=tt(i.stem);s&&(t={...t,...s})}return t}let at=function(e){return e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG",e}({});function nt(e){return 0===e.type}function rt(e){return 1===e.type}function ot(e){return 2===e.type}function lt(e){return 3===e.type}function ht(e){return 4===e.type}function dt(e){return 5===e.type}function ct(e){return 6===e.type}function ut(e){return 7===e.type}function pt(e){return 8===e.type}function gt(e){return!(!e||"object"!=typeof e||0!==e.type)}function mt(e){return!(!e||"object"!=typeof e||1!==e.type)}const ft=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,vt={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GS:["H","h","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ku-SY":["H","hB"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function _t(e){let t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}const i=e.language;let s;return"root"!==i&&(s=e.maximize().region),(vt[s||""]||vt[i||""]||vt[`${i}-001`]||vt["001"])[0]}const bt=new RegExp(`^${ft.source}*`),yt=new RegExp(`${ft.source}*$`);function wt(e,t){return{start:e,end:t}}const $t=!!Object.fromEntries,xt=!!String.prototype.trimStart,kt=!!String.prototype.trimEnd,St=$t?Object.fromEntries:function(e){const t={};for(const[i,s]of e)t[i]=s;return t},Tt=xt?function(e){return e.trimStart()}:function(e){return e.replace(bt,"")},Ot=kt?function(e){return e.trimEnd()}:function(e){return e.replace(yt,"")},Mt=new RegExp("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");var zt=class{constructor(e,t={}){this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}parse(){if(0!==this.offset())throw Error("parser can only be used once");if(this.message.length>0){const e=this.message.charCodeAt(0);if(35!==e&&39!==e&&60!==e&&123!==e&&125!==e){const e=function(e){if(0===e.length)return null;let t=1,i=1;for(let s=0;s<e.length;){const a=e.charCodeAt(s);switch(a){case 35:case 39:case 60:case 123:case 125:return null}if(10===a)t++,i=1,s++;else if(i++,a>=55296&&a<=56319&&s+1<e.length){const t=e.charCodeAt(s+1);s+=t>=56320&&t<=57343?2:1}else s++}return{offset:e.length,line:t,column:i}}(this.message);if(e){const t=this.clonePosition();return this.position=e,{val:[{type:0,value:this.message,location:wt(t,this.clonePosition())}],err:null}}}}return this.parseMessage(0,"",!1)}parseMessage(e,t,i){let s=[];for(;!this.isEOF();){const a=this.char();if(123===a){const t=this.parseArgument(e,i);if(t.err)return t;s.push(t.val)}else{if(125===a&&e>0)break;if(35!==a||"plural"!==t&&"selectordinal"!==t){if(60===a&&!this.ignoreTag&&47===this.peek()){if(i)break;return this.error(26,wt(this.clonePosition(),this.clonePosition()))}if(60===a&&!this.ignoreTag&&Et(this.peek()||0)){const i=this.parseTag(e,t);if(i.err)return i;s.push(i.val)}else{const i=this.parseLiteral(e,t);if(i.err)return i;s.push(i.val)}}else{const e=this.clonePosition();this.bump(),s.push({type:7,location:wt(e,this.clonePosition())})}}}return{val:s,err:null}}parseTag(e,t){const i=this.clonePosition();this.bump();const s=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:0,value:`<${s}/>`,location:wt(i,this.clonePosition())},err:null};if(this.bumpIf(">")){const a=this.parseMessage(e+1,t,!0);if(a.err)return a;const n=a.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!Et(this.char()))return this.error(23,wt(r,this.clonePosition()));const e=this.clonePosition();return s!==this.parseTagName()?this.error(26,wt(e,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:8,value:s,children:n,location:wt(i,this.clonePosition())},err:null}:this.error(23,wt(r,this.clonePosition())))}return this.error(27,wt(i,this.clonePosition()))}return this.error(23,wt(i,this.clonePosition()))}parseTagName(){const e=this.offset();for(this.bump();!this.isEOF()&&At(this.char());)this.bump();return this.message.slice(e,this.offset())}parseLiteral(e,t){const i=this.clonePosition();let s="";for(;;){const i=this.tryParseQuote(t);if(i){s+=i;continue}const a=this.tryParseUnquoted(e,t);if(a){s+=a;continue}const n=this.tryParseLeftAngleBracket();if(!n)break;s+=n}return{val:{type:0,value:s,location:wt(i,this.clonePosition())},err:null}}tryParseLeftAngleBracket(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(Et(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e}tryParseQuote(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();const t=[this.char()];for(this.bump();!this.isEOF();){const e=this.char();if(39===e){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(e);this.bump()}return String.fromCodePoint(...t)}tryParseUnquoted(e,t){if(this.isEOF())return null;const i=this.char();return 60===i||123===i||35===i&&("plural"===t||"selectordinal"===t)||125===i&&e>0?null:(this.bump(),String.fromCodePoint(i))}parseArgument(e,t){const i=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(1,wt(i,this.clonePosition()));if(125===this.char())return this.bump(),this.error(2,wt(i,this.clonePosition()));let s=this.parseIdentifierIfPossible().value;if(!s)return this.error(3,wt(i,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(1,wt(i,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:1,value:s,location:wt(i,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(1,wt(i,this.clonePosition())):this.parseArgumentOptions(e,t,s,i);default:return this.error(3,wt(i,this.clonePosition()))}}parseIdentifierIfPossible(){const e=this.clonePosition(),t=this.offset(),i=function(e,t){return Mt.lastIndex=t,Mt.exec(e)[1]??""}(this.message,t),s=t+i.length;return this.bumpTo(s),{value:i,location:wt(e,this.clonePosition())}}parseArgumentOptions(e,t,i,s){let a=this.clonePosition(),n=this.parseIdentifierIfPossible().value,r=this.clonePosition();switch(n){case"":return this.error(4,wt(a,r));case"number":case"date":case"time":{this.bumpSpace();let e=null;if(this.bumpIf(",")){this.bumpSpace();const t=this.clonePosition(),i=this.parseSimpleArgStyleIfPossible();if(i.err)return i;const s=Ot(i.val);if(0===s.length)return this.error(6,wt(this.clonePosition(),this.clonePosition()));e={style:s,styleLocation:wt(t,this.clonePosition())}}const t=this.tryParseArgumentClose(s);if(t.err)return t;const a=wt(s,this.clonePosition());if(e&&e.style.startsWith("::")){let t=Tt(e.style.slice(2));if("number"===n){const s=this.parseNumberSkeletonFromString(t,e.styleLocation);return s.err?s:{val:{type:2,value:i,location:a,style:s.val},err:null}}{if(0===t.length)return this.error(10,a);let s=t;this.locale&&(s=function(e,t){let i="";for(let s=0;s<e.length;s++){const a=e.charAt(s);if("j"===a){let n=0;for(;s+1<e.length&&e.charAt(s+1)===a;)n++,s++;let r=1+(1&n),o=n<2?1:3+(n>>1),l="a",h=_t(t);for("H"!=h&&"k"!=h||(o=0);o-- >0;)i+=l;for(;r-- >0;)i=h+i}else i+="J"===a?"H":a}return i}(t,this.locale));return{val:{type:"date"===n?3:4,value:i,location:a,style:{type:1,pattern:s,location:e.styleLocation,parsedOptions:this.shouldParseSkeletons?Ge(s):{}}},err:null}}}return{val:{type:"number"===n?2:"date"===n?3:4,value:i,location:a,style:e?.style??null},err:null}}case"plural":case"selectordinal":case"select":{const a=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(12,wt(a,{...a}));this.bumpSpace();let r=this.parseIdentifierIfPossible(),o=0;if("select"!==n&&"offset"===r.value){if(!this.bumpIf(":"))return this.error(13,wt(this.clonePosition(),this.clonePosition()));this.bumpSpace();const e=this.tryParseDecimalInteger(13,14);if(e.err)return e;this.bumpSpace(),r=this.parseIdentifierIfPossible(),o=e.val}const l=this.tryParsePluralOrSelectOptions(e,n,t,r);if(l.err)return l;const h=this.tryParseArgumentClose(s);if(h.err)return h;const d=wt(s,this.clonePosition());return"select"===n?{val:{type:5,value:i,options:St(l.val),location:d},err:null}:{val:{type:6,value:i,options:St(l.val),offset:o,pluralType:"plural"===n?"cardinal":"ordinal",location:d},err:null}}default:return this.error(5,wt(a,r))}}tryParseArgumentClose(e){return this.isEOF()||125!==this.char()?this.error(1,wt(e,this.clonePosition())):(this.bump(),{val:!0,err:null})}parseSimpleArgStyleIfPossible(){let e=0;const t=this.clonePosition();for(;!this.isEOF();)switch(this.char()){case 39:{this.bump();let e=this.clonePosition();if(!this.bumpUntil("'"))return this.error(11,wt(e,this.clonePosition()));this.bump();break}case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}return{val:this.message.slice(t.offset,this.offset()),err:null}}parseNumberSkeletonFromString(e,t){let i=[];try{i=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");const t=e.split(Ze).filter((e=>e.length>0)),i=[];for(const e of t){let t=e.split("/");if(0===t.length)throw new Error("Invalid number skeleton");const[s,...a]=t;for(const e of a)if(0===e.length)throw new Error("Invalid number skeleton");i.push({stem:s,options:a})}return i}(e)}catch{return this.error(7,t)}return{val:{type:0,tokens:i,location:t,parsedOptions:this.shouldParseSkeletons?st(i):{}},err:null}}tryParsePluralOrSelectOptions(e,t,i,s){let a=!1;const n=[],r=new Set;let{value:o,location:l}=s;for(;;){if(0===o.length){const e=this.clonePosition();if("select"===t||!this.bumpIf("="))break;{const t=this.tryParseDecimalInteger(16,19);if(t.err)return t;l=wt(e,this.clonePosition()),o=this.message.slice(e.offset,this.offset())}}if(r.has(o))return this.error("select"===t?21:20,l);"other"===o&&(a=!0),this.bumpSpace();const s=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?17:18,wt(this.clonePosition(),this.clonePosition()));const h=this.parseMessage(e+1,t,i);if(h.err)return h;const d=this.tryParseArgumentClose(s);if(d.err)return d;n.push([o,{value:h.val,location:wt(s,this.clonePosition())}]),r.add(o),this.bumpSpace(),({value:o,location:l}=this.parseIdentifierIfPossible())}return 0===n.length?this.error("select"===t?15:16,wt(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!a?this.error(22,wt(this.clonePosition(),this.clonePosition())):{val:n,err:null}}tryParseDecimalInteger(e,t){let i=1;const s=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(i=-1);let a=!1,n=0;for(;!this.isEOF();){const e=this.char();if(!(e>=48&&e<=57))break;a=!0,n=10*n+(e-48),this.bump()}const r=wt(s,this.clonePosition());return a?(n*=i,Number.isSafeInteger(n)?{val:n,err:null}:this.error(t,r)):this.error(e,r)}offset(){return this.position.offset}isEOF(){return this.offset()===this.message.length}clonePosition(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}}char(){const e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");const t=this.message.codePointAt(e);if(void 0===t)throw Error(`Offset ${e} is at invalid UTF-16 code unit boundary`);return t}error(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}}bump(){if(this.isEOF())return;const e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}bumpIf(e){if(this.message.startsWith(e,this.offset())){for(let t=0;t<e.length;t++)this.bump();return!0}return!1}bumpUntil(e){const t=this.offset(),i=this.message.indexOf(e,t);return i>=0?(this.bumpTo(i),!0):(this.bumpTo(this.message.length),!1)}bumpTo(e){if(this.offset()>e)throw Error(`targetOffset ${e} must be greater than or equal to the current offset ${this.offset()}`);for(e=Math.min(e,this.message.length);;){const t=this.offset();if(t===e)break;if(t>e)throw Error(`targetOffset ${e} is at invalid UTF-16 code unit boundary`);if(this.bump(),this.isEOF())break}}bumpSpace(){for(;!this.isEOF()&&Ht(this.char());)this.bump()}peek(){if(this.isEOF())return null;const e=this.char(),t=this.offset();return this.message.charCodeAt(t+(e>=65536?2:1))??null}};function Et(e){return e>=97&&e<=122||e>=65&&e<=90}function At(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function Ht(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function Ct(e){e.forEach((e=>{if(delete e.location,dt(e)||ct(e))for(const t in e.options)delete e.options[t].location,Ct(e.options[t].value);else ot(e)&&gt(e.style)||(lt(e)||ht(e))&&mt(e.style)?delete e.style.location:pt(e)&&Ct(e.children)}))}function Dt(e,t={}){t={shouldParseSkeletons:!0,requiresOtherClause:!0,...t};const i=new zt(e,t).parse();if(i.err){const e=SyntaxError(at[i.err.kind]);throw e.location=i.err.location,e.originalMessage=i.err.message,e}return t?.captureLocation||Ct(i.val),i.val}var Nt=class extends Error{constructor(e,t,i){super(e),this.code=t,this.originalMessage=i}toString(){return`[formatjs Error: ${this.code}] ${this.message}`}},Pt=class extends Nt{constructor(e,t,i,s){super(`Invalid values for "${e}": "${t}". Options are "${Object.keys(i).join('", "')}"`,"INVALID_VALUE",s)}},Rt=class extends Nt{constructor(e,t,i){super(`Value for "${e}" must be of type ${t}`,"INVALID_VALUE",i)}},Lt=class extends Nt{constructor(e,t){super(`The intl string context variable "${e}" was not provided to the string "${t}"`,"MISSING_VALUE",t)}};function Ut(e){return"function"==typeof e}function It(e,t,i,s,a,n,r){if(1===e.length&&nt(e[0]))return[{type:0,value:e[0].value}];const o=[];for(const l of e){if(nt(l)){o.push({type:0,value:l.value});continue}if(ut(l)){"number"==typeof n&&o.push({type:0,value:i.getNumberFormat(t).format(n)});continue}const{value:e}=l;if(!a||!(e in a))throw new Lt(e,r);let h=a[e];if(rt(l))h&&"string"!=typeof h&&"number"!=typeof h&&"bigint"!=typeof h||(h="string"==typeof h||"number"==typeof h||"bigint"==typeof h?String(h):""),o.push({type:"string"==typeof h?0:1,value:h});else if(lt(l)){const e="string"==typeof l.style?s.date[l.style]:mt(l.style)?l.style.parsedOptions:void 0;o.push({type:0,value:i.getDateTimeFormat(t,e).format(h)})}else if(ht(l)){const e="string"==typeof l.style?s.time[l.style]:mt(l.style)?l.style.parsedOptions:s.time.medium;o.push({type:0,value:i.getDateTimeFormat(t,e).format(h)})}else if(ot(l)){const e="string"==typeof l.style?s.number[l.style]:gt(l.style)?l.style.parsedOptions:void 0;if(e&&e.scale){const t=e.scale||1;if("bigint"==typeof h){if(!Number.isInteger(t))throw new TypeError(`Cannot apply fractional scale ${t} to bigint value. Scale must be an integer when formatting bigint.`);h*=BigInt(t)}else h*=t}o.push({type:0,value:i.getNumberFormat(t,e).format(h)})}else{if(pt(l)){const{children:e,value:h}=l,d=a[h];if(!Ut(d))throw new Rt(h,"function",r);let c=d(It(e,t,i,s,a,n).map((e=>e.value)));Array.isArray(c)||(c=[c]),o.push(...c.map((e=>({type:"string"==typeof e?0:1,value:e}))))}if(dt(l)){const e=h,n=(Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0)||l.options.other;if(!n)throw new Pt(l.value,h,Object.keys(l.options),r);o.push(...It(n.value,t,i,s,a))}else if(ct(l)){const e=`=${h}`;let n=Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0;if(!n){if(!Intl.PluralRules)throw new Nt('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',"MISSING_INTL_API",r);const e="bigint"==typeof h?Number(h):h,s=i.getPluralRules(t,{type:l.pluralType}).select(e-(l.offset||0));n=(Object.prototype.hasOwnProperty.call(l.options,s)?l.options[s]:void 0)||l.options.other}if(!n)throw new Pt(l.value,h,Object.keys(l.options),r);const d="bigint"==typeof h?Number(h):h;o.push(...It(n.value,t,i,s,a,d-(l.offset||0)))}else;}}return(l=o).length<2?l:l.reduce(((e,t)=>{const i=e[e.length-1];return i&&0===i.type&&0===t.type?i.value+=t.value:e.push(t),e}),[]);var l}function Bt(e,t){return t?Object.keys(e).reduce(((i,s)=>{var a,n;return i[s]=(a=e[s],(n=t[s])?{...a,...n,...Object.keys(a).reduce(((e,t)=>(e[t]={...a[t],...n[t]},e)),{})}:a),i}),{...e}):e}function jt(e){return{create:()=>({get:t=>e[t],set(t,i){e[t]=i}})}}var Yt=class e{constructor(t,i=e.defaultLocale,s,a){if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=e=>{const t=this.formatToParts(e);if(1===t.length)return t[0].value;const i=t.reduce(((e,t)=>(e.length&&0===t.type&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e)),[]);return i.length<=1?i[0]||"":i},this.formatToParts=e=>It(this.ast,this.locales,this.formatters,this.formats,e,void 0,this.message),this.resolvedOptions=()=>({locale:this.resolvedLocale?.toString()||Intl.NumberFormat.supportedLocalesOf(this.locales)[0]}),this.getAst=()=>this.ast,this.locales=i,this.resolvedLocale=e.resolveLocale(i),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");const{...i}=a||{};this.ast=e.__parse(t,{...i,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Bt(e.formats,s),this.formatters=a&&a.formatters||function(e={number:{},dateTime:{},pluralRules:{}}){return{getNumberFormat:Re(((...e)=>new Intl.NumberFormat(...e)),{cache:jt(e.number),strategy:We.variadic}),getDateTimeFormat:Re(((...e)=>new Intl.DateTimeFormat(...e)),{cache:jt(e.dateTime),strategy:We.variadic}),getPluralRules:Re(((...e)=>new Intl.PluralRules(...e)),{cache:jt(e.pluralRules),strategy:We.variadic})}}(this.formatterCache)}static{this.memoizedDefaultLocale=null}static get defaultLocale(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale}static{this.resolveLocale=e=>{if(void 0===Intl.Locale)return;const t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])}}static{this.__parse=Dt}static{this.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}}}};const Ft="/api/smart_irrigation/languages",Wt=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sv","uk","zh-Hans"],Vt={en:Pe},Gt={};function Zt(e){return(e||"").replace(/['"]+/g,"")}function qt(e,t,...i){const s=Zt(t);let a;try{a=e.split(".").reduce(((e,t)=>e[t]),Vt[s])}catch(t){a=e.split(".").reduce(((e,t)=>e[t]),Vt.en)}if(void 0===a&&(a=e.split(".").reduce(((e,t)=>e[t]),Vt.en)),!i.length)return a;const n={};for(let e=0;e<i.length;e+=2){let t=i[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=i[e+1]}try{return new Yt(a,t).format(n)}catch(e){return"Translation "+e}}var Kt,Jt;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(Kt||(Kt={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Jt||(Jt={}));const Xt=(e,t,i,s)=>{s=s||{},i=null==i?{}:i;const a=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return a.detail=i,e.dispatchEvent(a),a},Qt="v2026.9.3-beta7",ei="smart_irrigation",ti="precipitation_threshold_mm",ii="irrigation_start_triggers",si="sunrise",ai="solar_azimuth",ni="time",ri="minutes",oi="hours",li="days",hi="imperial",di="metric",ci="Dewpoint",ui="Evapotranspiration",pi="Humidity",gi="Maximum Temperature",mi="Minimum Temperature",fi="Precipitation",vi="module",_i="Current Precipitation",bi="Pressure",yi="Solar Radiation",wi="Temperature",$i="Windspeed",xi="Open-Meteo",ki=[xi],Si="weather_service",Ti="sensor",Oi="static",Mi="illuminance",zi="pressure_type",Ei="wind_height",Ai="absolute",Hi="relative",Ci="none",Di="source",Ni="sensorentity",Pi="static_value",Ri="luminous_efficacy",Li="unit",Ui="aggregate",Ii=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],Bi="sq ft",ji="l/minute",Yi="gal/minute",Fi="°C",Wi="mm",Vi="in",Gi="meter/s",Zi="MJ/day/m2",qi="mm/h",Ki="in/h",Ji="name",Xi="size",Qi="throughput",es="state",ts="duration",is="water_volume",ss="bucket",as="multiplier",ns="mapping",rs="lead_time",os="maximum_duration",ls="maximum_bucket",hs="irrigation_threshold",ds="drainage_rate",cs="linked_entity",us="flow_sensor",ps="soil_moisture_sensor",gs="soil_moisture_threshold",ms="input_method",fs="throughput",vs="direct",_s="precipitation_rate",bs=2,ys=e=>(...t)=>({_$litDirective$:e,values:t});let ws=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class $s extends ws{constructor(e){if(super(e),this.it=Z,e.type!==bs)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===Z||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}$s.directiveName="unsafeHTML",$s.resultType=1;const xs=ys($s);function ks(e,t){return(e=e.toString()).split(",")[t]}function Ss(e,t,i){var s,a,n;const r=new Date(e);if(isNaN(r.getTime()))return"-";const o=null!==(n=null!==(a=null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)&&void 0!==a?a:null==t?void 0:t.language)&&void 0!==n?n:navigator.language;try{return new Intl.DateTimeFormat(o,i).format(r)}catch(e){return r.toLocaleString()}}function Ts(e,t){switch(t){case ds:case _s:return e.units==di?W`${xs(qi)}`:W`${xs(Ki)}`;case ti:case ss:return e.units==di?W`${xs(Wi)}`:W`${xs(Vi)}`;case Xi:return e.units==di?W`${xs("m<sup>2</sup>")}`:W`${xs(Bi)}`;case Qi:return e.units==di?W`${xs(ji)}`:W`${xs(Yi)}`;case is:return e.units==di?W`${xs("L")}`:W`${xs("gal")}`;default:return W``}}function Os(e){const t=Math.max(0,Math.round(Number(e)||0)),i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60,n=e=>String(e).padStart(2,"0");return`${n(i)}:${n(s)}:${n(a)}`}function Ms(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===di?i:i/3.785411784}function zs(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===di?i:i/25.4}function Es(e,t){!function(e,t){Xt(e,"show-dialog",{dialogTag:"smart-irrigation-error-dialog",dialogImport:()=>Promise.resolve().then((function(){return Qa})),dialogParams:{error:t}})}(t,W`
    ${e.error}:${e.body.message?W` ${e.body.message} `:""}
  `)}const As=(e,t,i=!1)=>{i?history.replaceState(null,"",t):history.pushState(null,"",t),Xt(window,"location-changed",{replace:i})},Hs={Static:"manual",Passthrough:"standard",PyETO:"advanced"};function Cs(e,t){if(!e)return"";const i=Hs[e];return i?qt(`common.modes.${i}`,t):e}const Ds=e=>e.callWS({type:ei+"/config"}),Ns=e=>e.callWS({type:ei+"/weatherservice"}),Ps=e=>e.callWS({type:ei+"/zones"}),Rs=(e,t)=>e.callApi("POST",ei+"/zones",t),Ls=e=>e.callWS({type:ei+"/modules"}),Us=e=>e.callWS({type:ei+"/allmodules"}),Is=(e,t)=>e.callApi("POST",ei+"/modules",t),Bs=e=>e.callWS({type:ei+"/mappings"}),js=(e,t)=>e.callApi("POST",ei+"/mappings",t),Ys=(e,t,i=10)=>e.callWS({type:ei+"/weather_records",mapping_id:t,limit:i}),Fs=(e,t=500)=>e.callWS({type:ei+"/irrigation_history",limit:t}),Ws=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return i([me({attribute:!1})],t.prototype,"hass",void 0),t};var Vs="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",Gs="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Zs="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",qs="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",Ks="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",Js="M7,10L12,15L17,10H7Z",Xs="M19,13H5V11H19V13Z",Qs="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",ea="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",ta="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",ia="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",sa="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z";const aa=l`
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
`,na=l`
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
`,ra="06:00";let oa=class extends de{async showDialog(e){if(this.params=e,e.createTrigger)this._trigger={type:si,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const t=e.trigger;this._trigger=function(e){var t,i,s,a,n,r;const o={type:e.type,name:null!==(t=e.name)&&void 0!==t?t:"",enabled:null===(i=e.enabled)||void 0===i||i,offset_minutes:null!==(s=e.offset_minutes)&&void 0!==s?s:0,account_for_duration:null===(a=e.account_for_duration)||void 0===a||a};return e.type===ai?Object.assign(Object.assign({},o),{azimuth_angle:null!==(n=e.azimuth_angle)&&void 0!==n?n:90}):e.type===ni?Object.assign(Object.assign({},o),{at:null!==(r=e.at)&&void 0!==r?r:ra}):o}(t)}else this._trigger=void 0;await this.updateComplete}_closeDialog(){this.params=void 0,this._trigger=void 0}_saveTrigger(){var e,i,s,a,n,r,o;if(!this._trigger||!this.params)return;const l=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(l){const e=null!==(s=null!==(i=l.value)&&void 0!==i?i:l.selected)&&void 0!==s?s:void 0;if(e&&e!==this._trigger.type){if(e===ai)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(a=this._trigger.azimuth_angle)&&void 0!==a?a:90});else if(e===ni){const i=this._trigger,{azimuth_angle:s}=i,a=t(i,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},a),{type:e,at:null!==(n=this._trigger.at)&&void 0!==n?n:ra})}else{const i=this._trigger,{azimuth_angle:s,at:a}=i,n=t(i,["azimuth_angle","at"]);this._trigger=Object.assign(Object.assign({},n),{type:e})}this.requestUpdate()}}if(null===(r=this._trigger.name)||void 0===r?void 0:r.trim())if(this._trigger.type!==ni||/^\d{1,2}:\d{2}$/.test(null!==(o=this._trigger.at)&&void 0!==o?o:"")){if(this._trigger.type===ai){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void alert(qt("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else alert(qt("irrigation_start_triggers.validation.time_invalid",this.hass.language));else alert(qt("irrigation_start_triggers.validation.name_required",this.hass.language))}_deleteTrigger(){this.params&&!this.params.createTrigger&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,t;if(!this.params||!this._trigger)return W``;const i=this.params.createTrigger,s=qt(i?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return W`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${Zs}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${s}</span>
        </div>

        <div class="wrapper">
          <div class="dialog-help">
            ${qt("irrigation_start_triggers.dialog.help",this.hass.language)}
            <code>smart_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${qt("irrigation_start_triggers.fields.name.name",this.hass.language)}</label
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
              .label=${qt("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${si}>
                ${qt("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${"sunset"}>
                ${qt("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${ai}>
                ${qt("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${ni}>
                ${qt("irrigation_start_triggers.trigger_types.time",this.hass.language)}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${qt("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${qt("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}</label
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
              .label=${qt("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===ni?W`
                <div class="form-group">
                  <label class="form-label"
                    >${qt("irrigation_start_triggers.fields.at.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="time"
                    .value=${this._trigger.at||ra}
                    @input=${this._atChanged}
                  />
                </div>
              `:""}
          ${this._trigger.type===ai?W`
                <div class="form-group">
                  <label class="form-label"
                    >${qt("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="number"
                    .value=${(null===(t=this._trigger.azimuth_angle)||void 0===t?void 0:t.toString())||"90"}
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
            ${qt("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </ha-button>
          ${i?"":W`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${qt("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </ha-button>
              `}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${qt("irrigation_start_triggers.dialog.save",this.hass.language)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}_nameChanged(e){const t=e.target;this._updateTrigger({name:t.value})}_typeChanged(e){var t,i,s,a,n,r,o,l,h,d,c,u,p,g,m,f,v,_,b,y,w,$,x,k;const S=null!==(a=null!==(i=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.value)&&void 0!==i?i:null===(s=e.target)||void 0===s?void 0:s.value)&&void 0!==a?a:null===(r=null===(n=this.shadowRoot)||void 0===n?void 0:n.querySelector("ha-select"))||void 0===r?void 0:r.value,T=String(S);let O;O=T===ai?{type:ai,name:null!==(l=null===(o=this._trigger)||void 0===o?void 0:o.name)&&void 0!==l?l:"",enabled:null===(d=null===(h=this._trigger)||void 0===h?void 0:h.enabled)||void 0===d||d,offset_minutes:null!==(u=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==u?u:0,azimuth_angle:null!==(g=null===(p=this._trigger)||void 0===p?void 0:p.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(f=null===(m=this._trigger)||void 0===m?void 0:m.account_for_duration)||void 0===f||f}:{type:T,name:null!==(_=null===(v=this._trigger)||void 0===v?void 0:v.name)&&void 0!==_?_:"",enabled:null===(y=null===(b=this._trigger)||void 0===b?void 0:b.enabled)||void 0===y||y,offset_minutes:null!==($=null===(w=this._trigger)||void 0===w?void 0:w.offset_minutes)&&void 0!==$?$:0,account_for_duration:null===(k=null===(x=this._trigger)||void 0===x?void 0:x.account_for_duration)||void 0===k||k},this._trigger=O,this.requestUpdate()}_enabledChanged(e){const t=e.target;this._updateTrigger({enabled:t.checked})}_offsetChanged(e){const t=e.target;this._updateTrigger({offset_minutes:parseInt(t.value)||0})}_accountForDurationChanged(e){const t=e.target;this._updateTrigger({account_for_duration:t.checked})}_atChanged(e){const t=e.target.value;this._trigger=Object.assign(Object.assign({},this._trigger),{at:t})}_azimuthChanged(e){var t;if((null===(t=this._trigger)||void 0===t?void 0:t.type)!==ai)return;const i=e.target;let s=parseInt(i.value,10);isNaN(s)&&(s=90),this._updateTrigger({azimuth_angle:s})}static get styles(){return[na,l`
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
      `]}};i([me({attribute:!1})],oa.prototype,"hass",void 0),i([me({attribute:!1})],oa.prototype,"params",void 0),i([fe()],oa.prototype,"_trigger",void 0),oa=i([ue("smart-irrigation-trigger-dialog")],oa);const la=l`
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
  .setting-hint {
    font-size: 0.8rem;
    font-weight: normal;
    color: var(--secondary-text-color);
    margin-top: 2px;
    max-width: 460px;
  }
  /* HA entity picker: sized like the other controls, but it brings its own
     input chrome, so it must not get the .field text-input background. */
  .entity-field {
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
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
`;let ha=class extends(Ws(de)){constructor(){super(...arguments),this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null,t={};return i=>{t=Object.assign(Object.assign({},t),i),e&&clearTimeout(e),e=window.setTimeout((()=>{const i=t;t={},e=null,this.saveData(i)}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await Ds(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","continuousupdates","sensor_debounce","calc_log_enabled","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter((([e])=>t.includes(e))).reduce(((e,[t,i])=>Object.assign(e,{[t]:i})),{}):{})}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,t}}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}render(){var e,t,i;if(!this.hass||!this.config||!this.data)return W`<div class="loading-indicator">
        ${qt("common.loading-messages.configuration",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}
      </div>`;if(this.isLoading)return W`<div class="loading-indicator">
        ${qt("common.loading-messages.general",this.hass.language)}
      </div>`;{let e=W` <div class="card-content">
          ${qt("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autocalcenabled}
              @change=${e=>this.handleConfigChange({autocalcenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autocalcenabled&&(e=W`${e}
          <div class="card-content">
            ${this._timeRow(qt("panels.general.cards.automatic-duration-calculation.labels.calc-time",this.hass.language),this.config.calctime,(e=>this.handleConfigChange({calctime:e})))}
          </div>`),e=W`${e}
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.general.cards.automatic-duration-calculation.labels.hourly-calculation",this.hass.language)}
              <div class="setting-hint">
                ${qt("panels.general.cards.automatic-duration-calculation.labels.hourly-calculation-hint",this.hass.language)}
              </div>
            </div>
            <ha-switch
              .checked=${this.config.hourly_calculation}
              @change=${e=>this.handleConfigChange({hourly_calculation:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`,e=W`<ha-card
        header="${qt("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}"
      >
        ${e}</ha-card
      >`;let t=W` <div class="card-content">
          ${qt("panels.general.cards.automatic-update.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoupdateenabled&&(t=W`${t}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${qt("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${null!==(i=this.data.autoupdateinterval)&&void 0!==i?i:""}
                  @change=${e=>this.saveData({autoupdateinterval:parseInt(e.target.value)})}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>this.saveData({autoupdateschedule:e.target.value})}
                  >
                    <option
                      value="${ri}"
                      ?selected=${this.data.autoupdateschedule===ri}
                    >
                      ${qt("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${oi}"
                      ?selected=${this.data.autoupdateschedule===oi}
                    >
                      ${qt("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${li}"
                      ?selected=${this.data.autoupdateschedule===li}
                    >
                      ${qt("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Js}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(t=W`${t}
          <div class="card-content">
            ${this._numRow(qt("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,(e=>this.saveData({autoupdatedelay:parseInt(e)})),1)}
          </div>`),t=W`<ha-card header="${qt("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${t}</ha-card>`;let s=W`<div class="card-content">
          ${qt("panels.general.cards.continuousupdates.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.continuousupdates&&(s=W`${s}
          <div class="card-content">
            ${this._numRow(qt("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,(e=>this.handleConfigChange({sensor_debounce:parseInt(e)})),1)}
          </div>`),s=W`<ha-card
        header="${qt("panels.general.cards.continuousupdates.header",this.hass.language)}"
        >${s}</ha-card
      > `;const a=this.renderTriggersCard(),n=this.renderWeatherSkipCard(),r=this.renderCoordinateCard(),o=this.renderDaysBetweenIrrigationCard(),l=this.renderObservedWateringCard(),h=this.renderCalculationLogCard(),d=this.renderPanelModeCard(),c=this.renderSetupAssistantCard();return W`<ha-card
          header="${qt("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${qt("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${d}${t}${e}${s}${a}${n}${r}${o}${l}${h}${c}`}}renderSetupAssistantCard(){if(!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${qt("panels.setup.title",e)}">
        <div class="card-content">
          ${qt("panels.general.cards.setup-assistant.description",e)}
        </div>
        <div class="card-actions">
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/setup`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${qt("panels.general.cards.setup-assistant.open",e)}
          </ha-button>
        </div>
      </ha-card>
    `}renderTriggersCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.config.irrigation_start_triggers||[];return W`
      <ha-card
        header="${qt("irrigation_start_triggers.title",this.hass.language)}"
      >
        <div class="card-content">
          ${qt("irrigation_start_triggers.description",this.hass.language)}
        </div>

        <div class="card-content trigger-usage">
          ${qt("irrigation_start_triggers.usage_before",this.hass.language)}
          <code>smart_irrigation_start_irrigation_all_zones</code>${qt("irrigation_start_triggers.usage_after",this.hass.language)}
        </div>

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("irrigation_start_triggers.active_label",this.hass.language)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({active_start_trigger:e.target.value})}
            >
              <option
                value="default"
                ?selected=${"default"===(this.config.active_start_trigger||"default")}
              >
                ${qt("irrigation_start_triggers.active_default",this.hass.language)}
              </option>
              ${e.map((e=>W`
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
            ${qt("irrigation_start_triggers.active_hint",this.hass.language)}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${0===e.length?W`
                  <div class="no-triggers">
                    ${qt("irrigation_start_triggers.no_triggers",this.hass.language)}
                  </div>
                `:e.map(((e,t)=>this.renderTriggerItem(e,t)))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(ea,qt("irrigation_start_triggers.add_trigger",this.hass.language),(()=>this._addTrigger()))}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,t){if(!this.hass)return W``;const i=qt(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let s="";if(e.type===si&&0===e.offset_minutes)s=qt("irrigation_start_triggers.offset_auto",this.hass.language);else{const t=Math.abs(e.offset_minutes),i=Math.floor(t/60),a=t%60,n=e.offset_minutes<0?qt("common.labels.before",this.hass.language):qt("common.labels.after",this.hass.language);s=i>0?`${i}h ${a}m ${n}`:`${a}m ${n}`}let a="";return e.type===ai&&void 0!==e.azimuth_angle&&(a=` (${e.azimuth_angle}°)`),W`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${i}${a} - ${s}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?qt("common.labels.enabled",this.hass.language):qt("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(t)}"
            title="${qt("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${Ks}"
            @click="${()=>this._deleteTrigger(t)}"
            title="${qt("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var t,i;const s=null===(i=null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===i?void 0:i[e];s&&this._showTriggerDialog({trigger:s,triggerIndex:e})}_deleteTrigger(e){var t,i;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||!this.hass)return;const s=(null===(i=this.config.irrigation_start_triggers[e])||void 0===i?void 0:i.name)||"Unknown";if(confirm(qt("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",s))){const t=[...this.config.irrigation_start_triggers];t.splice(e,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[ii]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}}async _showTriggerDialog(e){if(!this.hass)return;const t=document.createElement("smart-irrigation-trigger-dialog");t.hass=this.hass,t.addEventListener("trigger-save",(e=>{this._handleTriggerSave(e.detail)})),t.addEventListener("trigger-delete",(e=>{this._handleTriggerDelete(e.detail)})),document.body.appendChild(t),await t.showDialog(e),t.addEventListener("closed",(e=>{const i=e.target;i&&"ha-dialog"===i.tagName.toLowerCase()&&document.body.removeChild(t)}))}_handleTriggerSave(e){if(!this.config)return;const t=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?t.push(e.trigger):void 0!==e.index&&(t[e.index]=e.trigger),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[ii]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}_handleTriggerDelete(e){var t;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===e.index)return;const i=[...this.config.irrigation_start_triggers];i.splice(e.index,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:i}),this.saveData({[ii]:i}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?W`
      <ha-card header="${qt("weather_skip.title",this.hass.language)}">
        <div class="card-content">
          ${qt("weather_skip.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("weather_skip.title",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.skip_irrigation_on_precipitation}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation?this._numRow(qt("weather_skip.threshold_label",this.hass.language),Ts(this.config,ti),this.config.precipitation_threshold_mm,(e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)})),.1):""}
        </div>
      </ha-card>
      ${this.renderMeasuredSkipCard()}
    `:W``}renderMeasuredSkipCard(){if(!this.config||!this.hass)return W``;const e=this.hass.language,t="imperial"!==this.config.units,i=t=>qt(`measured_skip.${t}`,e),s=(e,t)=>W`
      <ha-switch
        .checked=${!!t}
        @change=${t=>this.handleConfigChange({[e]:t.target.checked})}
      ></ha-switch>
    `,a=(e,t,i,s,a)=>W`
      <div class="setting-row">
        <div class="setting-label">
          ${s}
          <div class="setting-hint">${a}</div>
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${t||""}
          .includeDomains=${i}
          allow-custom-entity
          @value-changed=${t=>{var i;return this.handleConfigChange({[e]:(null===(i=t.detail)||void 0===i?void 0:i.value)||null})}}
        ></ha-entity-picker>
      </div>
    `,n=(e,t,i)=>W`
      <div class="si-subgroup">
        <div class="si-subgroup-title">${e}</div>
        <div class="setting-hint">${t}</div>
        ${i}
      </div>
    `,r=(e,t,s,a,n)=>this._numRow(i("threshold"),a,null!=t?t:s,(t=>this.handleConfigChange({[e]:""===t?null:parseFloat(t)})),n);return W`
      <ha-card header="${i("title")}">
        <div class="card-content">${i("description")}</div>
        <div class="card-content">
          ${n(i("rain.title"),i("rain.description"),W`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_rain_sensor",this.config.skip_on_rain_sensor)}
              </div>
              ${this.config.skip_on_rain_sensor?W`${a("rain_sensor",this.config.rain_sensor,["binary_sensor"],i("sensor"),i("rain.sensor-hint"))}
                  ${"advanced"===this.config.ui_mode?W`<div class="setting-row">
                          <div class="setting-label">
                            ${i("rain.history-label")}
                          </div>
                          ${s("rain_history_enabled",this.config.rain_history_enabled)}
                        </div>
                        <div class="card-content">
                          ${i("rain.history-description")}
                        </div>`:""}`:""}
            `)}
          ${n(i("freeze.title"),i("freeze.description"),W`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_freeze",this.config.skip_on_freeze)}
              </div>
              ${this.config.skip_on_freeze?W`${r("freeze_threshold",this.config.freeze_threshold,t?2:36,t?"°C":"°F",.5)}
                  ${a("freeze_sensor",this.config.freeze_sensor,["sensor"],i("sensor-optional"),i("freeze.sensor-hint"))}`:""}
            `)}
          ${n(i("wind.title"),i("wind.description"),W`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_wind",this.config.skip_on_wind)}
              </div>
              ${this.config.skip_on_wind?W`${r("wind_threshold",this.config.wind_threshold,t?20:12,t?"km/h":"mph",1)}
                  ${a("wind_sensor",this.config.wind_sensor,["sensor"],i("sensor-optional"),i("wind.sensor-hint"))}`:""}
            `)}
        </div>
      </ha-card>
    `}renderObservedWateringCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${qt("observed_watering.title",e)}">
        <div class="card-content">
          ${qt("observed_watering.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("observed_watering.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.observed_watering_enabled}
              @change=${e=>this.handleConfigChange({observed_watering_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              ${qt("observed_watering.direct_control_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.direct_valve_control_enabled}
              @change=${e=>this.handleConfigChange({direct_valve_control_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.direct_valve_control_enabled?W`
                <div class="card-content">
                  ${qt("observed_watering.direct_control_description",e)}
                </div>
              `:""}

          <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
          <div class="setting-row">
            <div class="setting-label">
              ${qt("observed_watering.sequencing_label",e)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({zone_sequencing:e.target.value})}
            >
              <option
                value="sequential"
                ?selected=${"sequential"===this.config.zone_sequencing}
              >
                ${qt("observed_watering.sequencing.sequential",e)}
              </option>
              <option
                value="parallel"
                ?selected=${"parallel"===this.config.zone_sequencing}
              >
                ${qt("observed_watering.sequencing.parallel",e)}
              </option>
            </select>
          </div>
          <div class="card-content">
            ${qt("observed_watering.sequencing_description",e)}
          </div>

          ${this.config.direct_valve_control_enabled&&"advanced"===this.config.ui_mode?this.renderCycleAndSoak(e):""}
        </div>
      </ha-card>
    `}renderCycleAndSoak(e){var t,i,s;if(!this.config)return W``;const a=this.config,n=Number(null!==(t=a.watering_passes)&&void 0!==t?t:1)||1,r="parallel"!==a.zone_sequencing;return W`
      ${this._numRow(qt("observed_watering.passes_label",e),"",n,(e=>this.handleConfigChange({watering_passes:Math.min(6,Math.max(1,parseInt(e)||1))})))}
      ${n>1?W`${this._numRow(qt("observed_watering.soak_label",e),qt("observed_watering.minutes",e),null!==(i=a.soak_minutes)&&void 0!==i?i:15,(e=>this.handleConfigChange({soak_minutes:Math.max(0,parseFloat(e)||0)})))}
            <div class="card-content">
              ${qt("observed_watering.passes_description",e)}
            </div>`:W`<div class="card-content">
            ${qt("observed_watering.passes_description",e)}
          </div>`}
      ${r?W`${this._numRow(qt("observed_watering.pause_between_zones_label",e),qt("observed_watering.seconds",e),null!==(s=a.pause_between_zones)&&void 0!==s?s:0,(e=>this.handleConfigChange({pause_between_zones:Math.max(0,parseFloat(e)||0)})))}
            <div class="card-content">
              ${qt("observed_watering.pause_between_zones_description",e)}
            </div>`:""}
    `}renderPanelModeCard(){if(!this.hass||!this.config)return W``;const e="advanced"===this.config.ui_mode;return W`<ha-card
      header="${qt("panels.general.cards.panel-mode.header",this.hass.language)}"
    >
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${qt("panels.general.cards.panel-mode.labels.advanced",this.hass.language)}
            <div class="setting-hint">
              ${qt("panels.general.cards.panel-mode.labels.advanced-hint",this.hass.language)}
            </div>
          </div>
          <ha-switch
            .checked=${e}
            @change=${e=>this.handleConfigChange({ui_mode:e.target.checked?"advanced":"standard"})}
          ></ha-switch>
        </div>
      </div>
    </ha-card>`}renderCalculationLogCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${qt("calculation_log.title",e)}">
        <div class="card-content">
          ${qt("calculation_log.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("calculation_log.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.calc_log_enabled}
              @change=${e=>this.handleConfigChange({calc_log_enabled:e.target.checked})}
            ></ha-switch>
          </div>
          ${this.config.calc_log_enabled?W`<div
                class="zoneline"
                style="color: var(--secondary-text-color); font-style: italic;"
              >
                ${qt("calculation_log.file_hint",e)}
              </div>`:""}
        </div>
      </ha-card>
    `}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.config,t=(null==e?void 0:e.latitude)||0,i=(null==e?void 0:e.longitude)||0,s=(null==e?void 0:e.elevation)||0;return W`
      <ha-card
        header="${qt("coordinate_config.title",this.hass.language)}"
      >
        <div class="card-content">
          ${qt("coordinate_config.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${e=>this.saveData({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.data.manual_coordinates_enabled?W`
                    ${this._numRow(qt("coordinate_config.latitude",this.hass.language),"",this.data.manual_latitude||t,(e=>this.handleConfigChange({manual_latitude:parseFloat(e)})),.1)}
                    ${this._numRow(qt("coordinate_config.longitude",this.hass.language),"",this.data.manual_longitude||i,(e=>this.handleConfigChange({manual_longitude:parseFloat(e)})),.1)}
                    ${this._numRow(qt("coordinate_config.elevation",this.hass.language),"",this.data.manual_elevation||s,(e=>this.handleConfigChange({manual_elevation:parseFloat(e)})),1)}
                  `:W`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${qt("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${qt("coordinate_config.latitude",this.hass.language)}:
                      ${t}<br />
                      ${qt("coordinate_config.longitude",this.hass.language)}:
                      ${i}<br />
                      ${qt("coordinate_config.elevation",this.hass.language)}:
                      ${s}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){return this.config&&this.data&&this.hass?W`
      <ha-card
        header="${qt("days_between_irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          ${qt("days_between_irrigation.description",this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(qt("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,(e=>this.handleConfigChange({days_between_irrigation:parseInt(e)})),1)}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${qt("days_between_irrigation.help_text",this.hass.language)}
            </div>
          </div>
        </div>
      </ha-card>
    `:W``}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this.config=Object.assign(Object.assign({},this.config),e),this._scheduleUpdate(),await(t=this.hass,i=this.data,t.callApi("POST",ei+"/config",i))}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),Es(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var t,i}}handleConfigChange(e){this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback()}_textRow(e,t,i,s){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_timeRow(e,t,i){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <input
          class="field"
          type="time"
          .value=${t?String(t):""}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${a}
            ?readonly=${n}
            .value=${null==i?"":String(i)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>s(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Xs}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ea}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Js}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,i,s=!1,a=!1){return W`
      <ha-button
        appearance=${s?"accent":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}static get styles(){return l`
      ${aa} ${la} /* View-specific styles only - most common styles are now in globalStyle */

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
    `}};i([me()],ha.prototype,"narrow",void 0),i([me()],ha.prototype,"path",void 0),i([me()],ha.prototype,"data",void 0),i([me()],ha.prototype,"config",void 0),i([me({type:Boolean})],ha.prototype,"isLoading",void 0),i([me({type:Boolean})],ha.prototype,"isSaving",void 0),ha=i([ue("smart-irrigation-view-general")],ha);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:da}=oe,ca=()=>document.createComment(""),ua=(e,t,i)=>{const s=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(ca(),a),n=s.insertBefore(ca(),a);i=new da(t,n,e,e.options)}else{const t=i._$AB.nextSibling,n=i._$AM,r=n!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==n._$AU&&i._$AP(t)}if(t!==a||r){let e=i._$AA;for(;e!==t;){const t=e.nextSibling;s.insertBefore(e,a),e=t}}}return i},pa=(e,t,i=e)=>(e._$AI(t,i),e),ga={},ma=(e,t=ga)=>e._$AH=t,fa=e=>{e._$AR(),e._$AA.remove()},va=(e,t,i)=>{const s=new Map;for(let a=t;a<=i;a++)s.set(e[a],a);return s},_a=ys(class extends ws{constructor(e){if(super(e),e.type!==bs)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const a=[],n=[];let r=0;for(const t of e)a[r]=s?s(t,r):r,n[r]=i(t,r),r++;return{values:n,keys:a}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const a=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,i,s);if(!Array.isArray(a))return this.ut=r,n;const o=this.ut??=[],l=[];let h,d,c=0,u=a.length-1,p=0,g=n.length-1;for(;c<=u&&p<=g;)if(null===a[c])c++;else if(null===a[u])u--;else if(o[c]===r[p])l[p]=pa(a[c],n[p]),c++,p++;else if(o[u]===r[g])l[g]=pa(a[u],n[g]),u--,g--;else if(o[c]===r[g])l[g]=pa(a[c],n[g]),ua(e,l[g+1],a[c]),c++,g--;else if(o[u]===r[p])l[p]=pa(a[u],n[p]),ua(e,a[c],a[u]),u--,p++;else if(void 0===h&&(h=va(r,p,g),d=va(o,c,u)),h.has(o[c]))if(h.has(o[u])){const t=d.get(r[p]),i=void 0!==t?a[t]:null;if(null===i){const t=ua(e,a[c]);pa(t,n[p]),l[p]=t}else l[p]=pa(i,n[p]),ua(e,a[c],i),a[t]=null;p++}else fa(a[u]),u--;else fa(a[c]),c++;for(;p<=g;){const t=ua(e,l[g+1]);pa(t,n[p]),l[p++]=t}for(;c<=u;){const e=a[c++];null!==e&&fa(e)}return this.ut=r,ma(e,l),G}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var ba,ya;function wa(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function $a(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth",e.Time="time"}(ba||(ba={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(ya||(ya={}));var xa,ka={exports:{}};var Sa,Ta=(xa||(xa=1,(Sa=ka).exports=function(){var e,t;function i(){return e.apply(null,arguments)}function s(t){e=t}function a(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function r(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function o(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(r(e,t))return!1;return!0}function l(e){return void 0===e}function h(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function d(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function c(e,t){var i,s=[],a=e.length;for(i=0;i<a;++i)s.push(t(e[i],i));return s}function u(e,t){for(var i in t)r(t,i)&&(e[i]=t[i]);return r(t,"toString")&&(e.toString=t.toString),r(t,"valueOf")&&(e.valueOf=t.valueOf),e}function p(e,t,i,s){return is(e,t,i,s,!0).utc()}function g(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidOffset:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function m(e){return null==e._pf&&(e._pf=g()),e._pf}function f(e){var i=null,s=!1,a=e._d&&!isNaN(e._d.getTime());return a&&(i=m(e),s=t.call(i.parsedDateParts,(function(e){return null!=e})),a=i.overflow<0&&!i.empty&&!i.invalidEra&&!i.invalidMonth&&!i.invalidOffset&&!i.invalidWeekday&&!i.weekdayMismatch&&!i.nullInput&&!i.invalidFormat&&!i.userInvalidated&&(!i.meridiem||i.meridiem&&s),e._strict&&(a=a&&0===i.charsLeftOver&&0===i.unusedTokens.length&&void 0===i.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?a:(e._isValid=a,e._isValid)}function v(e){var t=p(NaN);return null!=e?u(m(t),e):m(t).userInvalidated=!0,t}t=Array.prototype.some?Array.prototype.some:function(e){var t,i=Object(this),s=i.length>>>0;for(t=0;t<s;t++)if(t in i&&e.call(this,i[t],t,i))return!0;return!1};var _=i.momentProperties=[],b=!1;function y(e,t){var i,s,a,n=_.length;if(l(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),l(t._i)||(e._i=t._i),l(t._f)||(e._f=t._f),l(t._l)||(e._l=t._l),l(t._strict)||(e._strict=t._strict),l(t._tzm)||(e._tzm=t._tzm),l(t._isUTC)||(e._isUTC=t._isUTC),l(t._offset)||(e._offset=t._offset),l(t._pf)||(e._pf=m(t)),l(t._locale)||(e._locale=t._locale),n>0)for(i=0;i<n;i++)l(a=t[s=_[i]])||(e[s]=a);return e}function w(e){y(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===b&&(b=!0,i.updateOffset(this),b=!1)}function $(e){return e instanceof w||null!=e&&null!=e._isAMomentObject}function x(e){!1===i.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function k(e,t){var s=!0;return u((function(){if(null!=i.deprecationHandler&&i.deprecationHandler(null,e),s){var a,n,o,l=[],h=arguments.length;for(n=0;n<h;n++){if(a="","object"==typeof arguments[n]){for(o in a+="\n["+n+"] ",arguments[0])r(arguments[0],o)&&(a+=o+": "+arguments[0][o]+", ");a=a.slice(0,-2)}else a=arguments[n];l.push(a)}x(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),s=!1}return t.apply(this,arguments)}),t)}var S={};function T(e,t){null!=i.deprecationHandler&&i.deprecationHandler(e,t),S[e]||(x(t+"\n"+(new Error).stack),S[e]=!0)}function O(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}i.suppressDeprecationWarnings=!1,i.deprecationHandler=null;var M={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function z(e){return"string"==typeof e?M[e]||M[e.toLowerCase()]:void 0}function E(e){var t,i,s={};for(i in e)r(e,i)&&(t=z(i))&&(s[t]=e[i]);return s}var A={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function H(e){var t,i=[];for(t in e)r(e,t)&&i.push({unit:t,priority:A[t]});return i.sort((function(e,t){return e.priority-t.priority})),i}function C(e,t,i){var s=""+Math.abs(e),a=t-s.length;return(e>=0?i?"+":"":"-")+Math.pow(10,Math.max(0,a)).toString().substr(1)+s}var D=/(\[[^\[]*\])|(\\e)|(\\)?(eHHmm|[Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,P={},R={};function L(e,t,i,s){var a=s;"string"==typeof s&&(a=function(){return this[s]()}),e&&(R[e]=a),t&&(R[t[0]]=function(){return C(a.apply(this,arguments),t[1],t[2])}),i&&(R[i]=function(){return this.localeData().ordinal(a.apply(this,arguments),e)})}function U(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function I(e){var t,i,s=e.match(D);for(t=0,i=s.length;t<i;t++)R[s[t]]?s[t]=R[s[t]]:s[t]=U(s[t]);return function(t){var a,n="";for(a=0;a<i;a++)n+=O(s[a])?s[a].call(t,e):s[a];return n}}function B(e,t){if(!e.isValid())return e.localeData().invalidDate();var i="$"+(t=j(t,e.localeData()));return r(P,i)||(P[i]=I(t)),P[i](e)}function j(e,t){var i=5;function s(e){return t.longDateFormat(e)||e}for(N.lastIndex=0;i>=0&&N.test(e);)e=e.replace(N,s),N.lastIndex=0,i-=1;return e}var Y,F=/\d/,W=/\d\d/,V=/\d{3}/,G=/\d{4}/,Z=/[+-]?\d{6}/,q=/\d\d?/,K=/\d\d\d\d?/,J=/\d\d\d\d\d\d?/,X=/\d{1,3}/,Q=/\d{1,4}/,ee=/[+-]?\d{1,6}/,te=/\d+/,ie=/[+-]?\d+/,se=/Z|[+-]\d\d:?\d\d/gi,ae=/Z|[+-]\d\d(?::?\d\d)?/gi,ne=/[+-]?\d+(\.\d{1,3})?/,re=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,oe=/^[1-9]\d?/,le=/^([1-9]\d|\d)/;function he(e,t,i){Y[e]=O(t)?t:function(e,s){return e&&i?i:t}}function de(e,t){return r(Y,e)?Y[e](t._strict,t._locale):new RegExp(ce(e))}function ce(e){return ue(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,(function(e,t,i,s,a){return t||i||s||a})))}function ue(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function pe(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function ge(e){var t=+e,i=0;return 0!==t&&isFinite(t)&&(i=pe(t)),i}Y={};var me={};function fe(e,t){var i,s,a=t;for("string"==typeof e&&(e=[e]),h(t)&&(a=function(e,i){i[t]=ge(e)}),s=e.length,i=0;i<s;i++)me[e[i]]=a}function ve(e,t){fe(e,(function(e,i,s,a){s._w=s._w||{},t(e,s._w,s,a)}))}function _e(e,t,i){null!=t&&r(me,e)&&me[e](t,i._a,i,e)}function be(e){return e%4==0&&e%100!=0||e%400==0}var ye=0,we=1,$e=2,xe=3,ke=4,Se=5,Te=6,Oe=7,Me=8;function ze(e){return be(e)?366:365}L("Y",0,0,(function(){var e=this.year();return e<=9999?C(e,4):"+"+e})),L(0,["YY",2],0,(function(){return this.year()%100})),L(0,["YYYY",4],0,"year"),L(0,["YYYYY",5],0,"year"),L(0,["YYYYYY",6,!0],0,"year"),he("Y",ie),he("YY",q,W),he("YYYY",Q,G),he("YYYYY",ee,Z),he("YYYYYY",ee,Z),fe(["YYYYY","YYYYYY"],ye),fe("YYYY",(function(e,t){t[ye]=2===e.length?i.parseTwoDigitYear(e):ge(e)})),fe("YY",(function(e,t){t[ye]=i.parseTwoDigitYear(e)})),fe("Y",(function(e,t){t[ye]=parseInt(e,10)})),i.parseTwoDigitYear=function(e){return ge(e)+(ge(e)>68?1900:2e3)};var Ee,Ae=Ce("FullYear",!0);function He(){return be(this.year())}function Ce(e,t){return function(s){return null!=s?(Ne(this,e,s),i.updateOffset(this,t),this):De(this,e)}}function De(e,t){if(!e.isValid())return NaN;var i=e._d,s=e._isUTC;switch(t){case"Milliseconds":return s?i.getUTCMilliseconds():i.getMilliseconds();case"Seconds":return s?i.getUTCSeconds():i.getSeconds();case"Minutes":return s?i.getUTCMinutes():i.getMinutes();case"Hours":return s?i.getUTCHours():i.getHours();case"Date":return s?i.getUTCDate():i.getDate();case"Day":return s?i.getUTCDay():i.getDay();case"Month":return s?i.getUTCMonth():i.getMonth();case"FullYear":return s?i.getUTCFullYear():i.getFullYear();default:return NaN}}function Ne(e,t,i){var s,a,n,r,o;if(e.isValid()&&!isNaN(i)){switch(s=e._d,a=e._isUTC,t){case"Milliseconds":return void(a?s.setUTCMilliseconds(i):s.setMilliseconds(i));case"Seconds":return void(a?s.setUTCSeconds(i):s.setSeconds(i));case"Minutes":return void(a?s.setUTCMinutes(i):s.setMinutes(i));case"Hours":return void(a?s.setUTCHours(i):s.setHours(i));case"Date":return void(a?s.setUTCDate(i):s.setDate(i));case"FullYear":break;default:return}n=i,r=e.month(),o=29!==(o=e.date())||1!==r||be(n)?o:28,a?s.setUTCFullYear(n,r,o):s.setFullYear(n,r,o)}}function Pe(e){return O(this[e=z(e)])?this[e]():this}function Re(e,t){if("object"==typeof e){var i,s=H(e=E(e)),a=s.length;for(i=0;i<a;i++)this[s[i].unit](e[s[i].unit])}else if(O(this[e=z(e)]))return this[e](t);return this}function Le(e,t){return(e%t+t)%t}function Ue(e,t){if(isNaN(e)||isNaN(t))return NaN;var i=Le(t,12);return e+=(t-i)/12,1===i?be(e)?29:28:31-i%7%2}Ee=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},L("M",["MM",2],"Mo",(function(){return this.month()+1})),L("MMM",0,0,(function(e){return this.localeData().monthsShort(this,e)})),L("MMMM",0,0,(function(e){return this.localeData().months(this,e)})),he("M",q,oe),he("MM",q,W),he("MMM",(function(e,t){return t.monthsShortRegex(e)})),he("MMMM",(function(e,t){return t.monthsRegex(e)})),fe(["M","MM"],(function(e,t){t[we]=ge(e)-1})),fe(["MMM","MMMM"],(function(e,t,i,s){var a=i._locale.monthsParse(e,s,i._strict);null!=a?t[we]=a:m(i).invalidMonth=e}));var Ie="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Be="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),je=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Ye=re,Fe=re,We=["monthsParse","longMonthsParse","shortMonthsParse","monthsRegex","monthsShortRegex","monthsStrictRegex","monthsShortStrictRegex"];function Ve(e,t){var i,s;for(i=0;i<We.length;i++)r(t,s=We[i])||delete e["_"+s]}function Ge(e,t){return e?a(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||je).test(t)?"format":"standalone"][e.month()]:a(this._months)?this._months:this._months.standalone}function Ze(e,t){return e?a(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[je.test(t)?"format":"standalone"][e.month()]:a(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function qe(e,t,i){var s,a,n,r=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)n=p([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(n,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(n,"").toLocaleLowerCase();return i?"MMM"===t?-1!==(a=Ee.call(this._shortMonthsParse,r))?a:null:-1!==(a=Ee.call(this._longMonthsParse,r))?a:null:"MMM"===t?-1!==(a=Ee.call(this._shortMonthsParse,r))||-1!==(a=Ee.call(this._longMonthsParse,r))?a:null:-1!==(a=Ee.call(this._longMonthsParse,r))||-1!==(a=Ee.call(this._shortMonthsParse,r))?a:null}function Ke(e,t,i){var s,a,n;if(this._monthsParseExact)return qe.call(this,e,t,i);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(a=p([2e3,s]),i&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(a,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(a,"").replace(".","")+"$","i")),i||this._monthsParse[s]||(n="^"+this.months(a,"")+"|^"+this.monthsShort(a,""),this._monthsParse[s]=new RegExp(n.replace(".",""),"i")),i&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(i&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!i&&this._monthsParse[s].test(e))return s}}function Je(e,t){if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=ge(t);else if(!h(t=e.localeData().monthsParse(t)))return e;var i=t,s=e.date();return s=s<29?s:Math.min(s,Ue(e.year(),i)),e._isUTC?e._d.setUTCMonth(i,s):e._d.setMonth(i,s),e}function Xe(e){return null!=e?(Je(this,e),i.updateOffset(this,!0),this):De(this,"Month")}function Qe(){return Ue(this.year(),this.month())}function et(e){return this._monthsParseExact?(r(this,"_monthsRegex")||it.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(r(this,"_monthsShortRegex")||(this._monthsShortRegex=Ye),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function tt(e){return this._monthsParseExact?(r(this,"_monthsRegex")||it.call(this),e?this._monthsStrictRegex:this._monthsRegex):(r(this,"_monthsRegex")||(this._monthsRegex=Fe),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function it(){function e(e,t){return t.length-e.length}var t,i,s,a,n=[],r=[],o=[];for(t=0;t<12;t++)i=p([2e3,t]),s=ue(this.monthsShort(i,"")),a=ue(this.months(i,"")),n.push(s),r.push(a),o.push(a),o.push(s);n.sort(e),r.sort(e),o.sort(e),this._monthsRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+n.join("|")+")","i")}function st(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function at(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function nt(e,t){return e.slice(t,7).concat(e.slice(0,t))}L("d",0,"do","day"),L("dd",0,0,(function(e){return this.localeData().weekdaysMin(this,e)})),L("ddd",0,0,(function(e){return this.localeData().weekdaysShort(this,e)})),L("dddd",0,0,(function(e){return this.localeData().weekdays(this,e)})),L("e",0,0,"weekday"),L("E",0,0,"isoWeekday"),L("eHHmm",0,0,(function(){return""+this.weekday()+C(this.hours(),2)+C(this.minutes(),2)})),he("d",q),he("e",q),he("E",q),he("eHHmm",J),he("dd",(function(e,t){return t.weekdaysMinRegex(e)})),he("ddd",(function(e,t){return t.weekdaysShortRegex(e)})),he("dddd",(function(e,t){return t.weekdaysRegex(e)})),ve(["dd","ddd","dddd"],(function(e,t,i,s){var a=i._locale.weekdaysParse(e,s,i._strict);null!=a?t.d=a:m(i).invalidWeekday=e})),ve(["d","e","E"],(function(e,t,i,s){t[s]=ge(e)})),ve("eHHmm",(function(e,t,i){var s=e.length-4;t.e=ge(e.substr(0,s)),i._a[xe]=ge(e.substr(s,2)),i._a[ke]=ge(e.substr(s+2))}));var rt,ot="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),lt="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),ht="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),dt=re,ct=re,ut=re,pt=["weekdaysParse","fullWeekdaysParse","shortWeekdaysParse","minWeekdaysParse","weekdaysRegex","weekdaysShortRegex","weekdaysMinRegex","weekdaysStrictRegex","weekdaysShortStrictRegex","weekdaysMinStrictRegex"];function gt(e,t){var i,s;for(i=0;i<pt.length;i++)r(t,s=pt[i])||delete e["_"+s]}function mt(e,t){var i=a(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"];return!0===e?nt(i,this._week.dow):e?i[e.day()]:i}function ft(e){return!0===e?nt(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function vt(e){return!0===e?nt(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function _t(e,t,i){var s,a,n,r=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)n=p([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(n,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(n,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(n,"").toLocaleLowerCase();return i?"dddd"===t?-1!==(a=Ee.call(this._weekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ee.call(this._shortWeekdaysParse,r))?a:null:-1!==(a=Ee.call(this._minWeekdaysParse,r))?a:null:"dddd"===t?-1!==(a=Ee.call(this._weekdaysParse,r))||-1!==(a=Ee.call(this._shortWeekdaysParse,r))||-1!==(a=Ee.call(this._minWeekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ee.call(this._shortWeekdaysParse,r))||-1!==(a=Ee.call(this._weekdaysParse,r))||-1!==(a=Ee.call(this._minWeekdaysParse,r))?a:null:-1!==(a=Ee.call(this._minWeekdaysParse,r))||-1!==(a=Ee.call(this._weekdaysParse,r))||-1!==(a=Ee.call(this._shortWeekdaysParse,r))?a:null}function bt(e,t,i){var s,a,n;if(this._weekdaysParseExact)return _t.call(this,e,t,i);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(a=p([2e3,1]).day(s),i&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(a,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(a,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(a,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[s]||(n="^"+this.weekdays(a,"")+"|^"+this.weekdaysShort(a,"")+"|^"+this.weekdaysMin(a,""),this._weekdaysParse[s]=new RegExp(n.replace(".",""),"i")),i&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(i&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(i&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!i&&this._weekdaysParse[s].test(e))return s}}function yt(e){if(!this.isValid())return null!=e?this:NaN;var t=De(this,"Day");return null!=e?(e=st(e,this.localeData()),this.add(e-t,"d")):t}function wt(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function $t(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=at(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7}function xt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(r(this,"_weekdaysRegex")||(this._weekdaysRegex=dt),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function kt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(r(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ct),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function St(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(r(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=ut),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Tt(){function e(e,t){return t.length-e.length}var t,i,s,a,n,r=[],o=[],l=[],h=[];for(t=0;t<7;t++)i=p([2e3,1]).day(t),s=ue(this.weekdaysMin(i,"")),a=ue(this.weekdaysShort(i,"")),n=ue(this.weekdays(i,"")),r.push(s),o.push(a),l.push(n),h.push(s),h.push(a),h.push(n);r.sort(e),o.sort(e),l.sort(e),h.sort(e),this._weekdaysRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+r.join("|")+")","i")}function Ot(e){var t,i;for(i in Ve(this,e),gt(this,e),e)r(e,i)&&(O(t=e[i])?this[i]=t:this["_"+i]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function Mt(e,t){var i,s=u({},e);for(i in t)r(t,i)&&(n(e[i])&&n(t[i])?(s[i]={},u(s[i],e[i]),u(s[i],t[i])):null!=t[i]?s[i]=t[i]:delete s[i]);for(i in e)r(e,i)&&!r(t,i)&&n(e[i])&&(s[i]=u({},s[i]));return s}function zt(e){null!=e&&this.set(e)}rt=Object.keys?Object.keys:function(e){var t,i=[];for(t in e)r(e,t)&&i.push(t);return i};var Et={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function At(e,t,i){var s=this._calendar[e]||this._calendar.sameElse;return O(s)?s.call(t,i):s}var Ht={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function Ct(e){var t=this._longDateFormat[e],i=this._longDateFormat[e.toUpperCase()],s=this._longDateFormatCache;return t||!i?t:s&&s[e]&&s[e].formatUpper===i?s[e].format:(t=i.match(D).map((function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e})).join(""),s||(s=this._longDateFormatCache={}),s[e]={formatUpper:i,format:t},t)}var Dt="Invalid date";function Nt(){return this._invalidDate}var Pt="%d",Rt=/\d{1,2}/;function Lt(e){return this._ordinal.replace("%d",e)}var Ut={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function It(e,t,i,s){var a=this._relativeTime[i];return O(a)?a(e,t,i,s):a.replace(/%d/i,e)}function Bt(e,t,i,s){return this.postformat(It.call(this,e,t,i,s))}function jt(e,t){var i=this._relativeTime[e>0?"future":"past"];return O(i)?i(t):i.replace(/%s/i,t)}function Yt(e,t){return this.postformat(jt.call(this,e,t))}function Ft(e,t,i,s,a,n,r){var o;return e<100&&e>=0?(o=new Date(e+400,t,i,s,a,n,r),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,t,i,s,a,n,r),o}function Wt(e){var t,i;return e<100&&e>=0?((i=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,i)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function Vt(e,t,i){var s=7+t-i;return-(7+Wt(e,0,s).getUTCDay()-t)%7+s-1}function Gt(e,t,i,s,a){var n,r,o=1+7*(t-1)+(7+i-s)%7+Vt(e,s,a);return o<=0?r=ze(n=e-1)+o:o>ze(e)?(n=e+1,r=o-ze(e)):(n=e,r=o),{year:n,dayOfYear:r}}function Zt(e,t,i,s){var a,n,r=Vt(e,i,s),o=Math.floor((t-r-1)/7)+1;return o<1?a=o+Jt(n=e-1,i,s):o>Jt(e,i,s)?(a=o-Jt(e,i,s),n=e+1):(n=e,a=o),{week:a,year:n}}function qt(e,t,i){return Zt(e.year(),e.dayOfYear(),t,i)}function Kt(e,t,i,s,a){return Zt(e,Math.round((Wt(e,t,i)-Wt(e,0,1))/864e5)+1,s,a)}function Jt(e,t,i){var s=Vt(e,t,i),a=Vt(e+1,t,i);return(ze(e)-s+a)/7}function Xt(e){return qt(e,this._week.dow,this._week.doy).week}L("w",["ww",2],"wo","week"),L("W",["WW",2],"Wo","isoWeek"),he("w",q,oe),he("ww",q,W),he("W",q,oe),he("WW",q,W),ve(["w","ww","W","WW"],(function(e,t,i,s){t[s.substr(0,1)]=ge(e)}));var Qt={dow:0,doy:6};function ei(){return this._week.dow}function ti(){return this._week.doy}function ii(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function si(e){var t=qt(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function ai(){return this.hours()%12||12}function ni(){return this.hours()||24}function ri(e,t){L(e,0,0,(function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)}))}function oi(e,t){return t._meridiemParse}function li(e){return"p"===(e+"").toLowerCase().charAt(0)}L("H",["HH",2],0,"hour"),L("h",["hh",2],0,ai),L("k",["kk",2],0,ni),L("hmm",0,0,(function(){return""+ai.apply(this)+C(this.minutes(),2)})),L("hmmss",0,0,(function(){return""+ai.apply(this)+C(this.minutes(),2)+C(this.seconds(),2)})),L("Hmm",0,0,(function(){return""+this.hours()+C(this.minutes(),2)})),L("Hmmss",0,0,(function(){return""+this.hours()+C(this.minutes(),2)+C(this.seconds(),2)})),ri("a",!0),ri("A",!1),he("a",oi),he("A",oi),he("H",q,le),he("h",q,oe),he("k",q,oe),he("HH",q,W),he("hh",q,W),he("kk",q,W),he("hmm",K),he("hmmss",J),he("Hmm",K),he("Hmmss",J),fe(["H","HH"],xe),fe(["k","kk"],(function(e,t,i){var s=ge(e);t[xe]=24===s?0:s})),fe(["a","A"],(function(e,t,i){i._isPm=i._locale.isPM(e),i._meridiem=e})),fe(["h","hh"],(function(e,t,i){t[xe]=ge(e),m(i).bigHour=!0})),fe("hmm",(function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s)),m(i).bigHour=!0})),fe("hmmss",(function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[Se]=ge(e.substr(a)),m(i).bigHour=!0})),fe("Hmm",(function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s))})),fe("Hmmss",(function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[Se]=ge(e.substr(a))}));var hi=/[ap]\.?m?\.?/i,di=Ce("Hours",!0);function ci(e,t,i){return e>11?i?"pm":"PM":i?"am":"AM"}var ui,pi={calendar:Et,longDateFormat:Ht,invalidDate:Dt,ordinal:Pt,dayOfMonthOrdinalParse:Rt,relativeTime:Ut,months:Ie,monthsShort:Be,week:Qt,weekdays:ot,weekdaysMin:ht,weekdaysShort:lt,meridiemParse:hi},gi={},mi={};function fi(e,t){var i,s=Math.min(e.length,t.length);for(i=0;i<s;i+=1)if(e[i]!==t[i])return i;return s}function vi(e){return e?e.toLowerCase().replace("_","-"):e}function _i(e){for(var t,i,s,a,n=0;n<e.length;){for(t=(a=vi(e[n]).split("-")).length,i=(i=vi(e[n+1]))?i.split("-"):null;t>0;){if(s=yi(a.slice(0,t).join("-")))return s;if(i&&i.length>=t&&fi(a,i)>=t-1)break;t--}n++}return ui}function bi(e){return"string"==typeof e&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e)}function yi(e){var t,i=null;if(r(gi,e))return gi[e];if(t=vi(e),r(gi,t))return gi[t];if(Sa&&Sa.exports&&bi(t))try{i=ui._abbr,$a("./locale/"+t),wi(i)}catch(e){gi[t]=null}return r(gi,t)?gi[t]:void 0}function wi(e,t){var i;return e&&((i=l(t)?ki(e):$i(e,t))?ui=i:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),ui._abbr}function $i(e,t){if(null!==t){var i,s=pi;if(t.abbr=e,null!=gi[e])T("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),s=gi[e]._config;else if(null!=t.parentLocale)if(null!=gi[t.parentLocale])s=gi[t.parentLocale]._config;else{if(null==(i=yi(t.parentLocale)))return mi[t.parentLocale]||(mi[t.parentLocale]=[]),mi[t.parentLocale].push({name:e,config:t}),null;s=i._config}return gi[e]=new zt(Mt(s,t)),mi[e]&&mi[e].forEach((function(e){$i(e.name,e.config)})),wi(e),gi[e]}return delete gi[e],null}function xi(e,t){var i,s=yi(e),a=pi;return null!=s&&(e=s._abbr),null!=t?(null!=gi[e]&&null!=gi[e].parentLocale?gi[e].set(Mt(gi[e]._config,t)):(null!=s&&(a=s._config),t=Mt(a,t),null==s&&(t.abbr=e),(i=new zt(t)).parentLocale=gi[e],gi[e]=i),wi(e)):null!=gi[e]&&(null!=gi[e].parentLocale?(gi[e]=gi[e].parentLocale,e===wi()&&wi(e)):null!=gi[e]&&delete gi[e]),gi[e]}function ki(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return ui;if(!a(e)){if(t=yi(e))return t;e=[e]}return _i(e)}function Si(){return rt(gi)}function Ti(e){var t,i=e._a;return i&&-2===m(e).overflow&&(t=i[we]<0||i[we]>11?we:i[$e]<1||i[$e]>Ue(i[ye],i[we])?$e:i[xe]<0||i[xe]>24||24===i[xe]&&(0!==i[ke]||0!==i[Se]||0!==i[Te])?xe:i[ke]<0||i[ke]>59?ke:i[Se]<0||i[Se]>59?Se:i[Te]<0||i[Te]>999?Te:-1,m(e)._overflowDayOfYear&&(t<ye||t>$e)&&(t=$e),m(e)._overflowWeeks&&-1===t&&(t=Oe),m(e)._overflowWeekday&&-1===t&&(t=Me),m(e).overflow=t),e}var Oi=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Mi=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,zi=/Z|[+-]\d\d(?::?\d\d)?/,Ei=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],Ai=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Hi=/^\/?Date\((-?\d+)/i,Ci=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Di={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Ni(e){var t,i,s,a,n,r,o=e._i,l=Oi.exec(o)||Mi.exec(o),h=Ei.length,d=Ai.length;if(l){for(m(e).iso=!0,t=0,i=h;t<i;t++)if(Ei[t][1].exec(l[1])){a=Ei[t][0],s=!1!==Ei[t][2];break}if(null==a)return void(e._isValid=!1);if(l[3]){for(t=0,i=d;t<i;t++)if(Ai[t][1].exec(l[3])){n=(l[2]||" ")+Ai[t][0];break}if(null==n)return void(e._isValid=!1)}if(!s&&null!=n)return void(e._isValid=!1);if(l[4]){if(!zi.exec(l[4]))return void(e._isValid=!1);r="Z"}e._f=a+(n||"")+(r||""),qi(e)}else e._isValid=!1}function Pi(e,t,i,s,a,n){var r=[Ri(e),Be.indexOf(t),parseInt(i,10),parseInt(s,10),parseInt(a,10)];return n&&r.push(parseInt(n,10)),r}function Ri(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function Li(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function Ui(e,t,i){return!e||lt.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(m(i).weekdayMismatch=!0,i._isValid=!1,!1)}function Ii(e,t,i){if(e)return Di[e];if(t)return 0;var s=parseInt(i,10),a=s%100;return(s-a)/100*60+a}function Bi(e){var t,i=Ci.exec(Li(e._i));if(i){if(t=Pi(i[4],i[3],i[2],i[5],i[6],i[7]),!Ui(i[1],t,e))return;e._a=t,e._tzm=Ii(i[8],i[9],i[10]),e._d=Wt.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),m(e).rfc2822=!0}else e._isValid=!1}function ji(e){var t=Hi.exec(e._i);null===t?(Ni(e),!1===e._isValid&&(delete e._isValid,Bi(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:i.createFromInputFallback(e)))):e._d=new Date(+t[1])}function Yi(e,t,i){return null!=e?e:null!=t?t:i}function Fi(e,t,s){var a=Object.prototype.hasOwnProperty.call(e,"_isDefaultDatePartsForWeek"),n=e._isDefaultDatePartsForWeek;e._isDefaultDatePartsForWeek=!!s;try{return i._getDefaultDateParts(e,t,s)}finally{a?e._isDefaultDatePartsForWeek=n:delete e._isDefaultDatePartsForWeek}}function Wi(e){var t=e._defaultDatePartsNow;return t?(t.hasValue||(t.value=i.now(),t.hasValue=!0),t.value):i.now()}function Vi(e,t,i){var s=i||e._isDefaultDatePartsForWeek,a=s?ss(t):new Date(t);return s?[a.year(),a.month(),a.date()]:e._useUTC?[a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()]:[a.getFullYear(),a.getMonth(),a.getDate()]}function Gi(e){var t,i,s,a,n,r,o,l=[];if(!e._d){for(null!=e._a[ye]&&null!=e._a[we]&&null!=e._a[$e]||(a=Fi(e,s=Wi(e))),e._w&&null==e._a[$e]&&null==e._a[we]&&Zi(e,Fi(e,s,!0)),null!=e._dayOfYear&&(r=null!=e._a[ye]?e._a[ye]:a[ye],(e._dayOfYear>ze(r)||0===e._dayOfYear)&&(m(e)._overflowDayOfYear=!0),i=Wt(r,0,e._dayOfYear),e._a[we]=i.getUTCMonth(),e._a[$e]=i.getUTCDate()),o=null==e._a[ye]||null==e._a[we]||null==e._a[$e],t=0;t<3&&null==e._a[t];++t)e._a[t]=l[t]=a[t];for(;t<7;t++)e._a[t]=l[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[xe]&&0===e._a[ke]&&0===e._a[Se]&&0===e._a[Te]&&(e._nextDay=!0,e._a[xe]=0),e._d=(e._useUTC?Wt:Ft).apply(null,l),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[xe]=24),e._w&&void 0!==e._w.d&&!o&&e._w.d!==n&&(m(e).weekdayMismatch=!0)}}function Zi(e,t){var i,s,a,n,r,o,l,h,d;null!=(i=e._w).GG||null!=i.W||null!=i.E?(r=1,o=4,s=Yi(i.GG,e._a[ye],Kt(t[ye],t[we],t[$e],1,4).year),a=Yi(i.W,1),((n=Yi(i.E,1))<1||n>7)&&(h=!0)):(r=e._locale._week.dow,o=e._locale._week.doy,d=Kt(t[ye],t[we],t[$e],r,o),s=Yi(i.gg,e._a[ye],d.year),a=Yi(i.w,d.week),null!=i.d?((n=i.d)<0||n>6)&&(h=!0):null!=i.e?(n=i.e+r,(i.e<0||i.e>6)&&(h=!0)):n=r),a<1||a>Jt(s,r,o)?m(e)._overflowWeeks=!0:null!=h?m(e)._overflowWeekday=!0:(l=Gt(s,a,n,r,o),e._a[ye]=l.year,e._dayOfYear=l.dayOfYear)}function qi(e){if(e._f!==i.ISO_8601)if(e._f!==i.RFC_2822){e._a=[],m(e).empty=!0;var t,s,a,n,r,o,l,h=""+e._i,d=h.length,c=0;for(l=(a=j(e._f,e._locale).match(D)||[]).length,t=0;t<l;t++)n=a[t],(s=(h.match(de(n,e))||[])[0])&&((r=h.substr(0,h.indexOf(s))).length>0&&m(e).unusedInput.push(r),h=h.slice(h.indexOf(s)+s.length),c+=s.length),R[n]?(s?m(e).empty=!1:m(e).unusedTokens.push(n),_e(n,s,e)):e._strict&&!s&&m(e).unusedTokens.push(n);m(e).charsLeftOver=d-c,h.length>0&&m(e).unusedInput.push(h),e._a[xe]<=12&&!0===m(e).bigHour&&e._a[xe]>0&&(m(e).bigHour=void 0),m(e).parsedDateParts=e._a.slice(0),m(e).meridiem=e._meridiem,e._a[xe]=Ki(e._locale,e._a[xe],e._meridiem),null!==(o=m(e).era)&&(e._a[ye]=e._locale.erasConvertYear(o,e._a[ye])),Gi(e),Ti(e)}else Bi(e);else Ni(e)}function Ki(e,t,i){var s;return null==i?t:null!=e.meridiemHour?e.meridiemHour(t,i):null!=e.isPM?((s=e.isPM(i))&&t<12&&(t+=12),s||12!==t||(t=0),t):t}function Ji(e){var t,i,s,a,n,r,o=!1,l={},h=e._f.length;if(0===h)return m(e).invalidFormat=!0,void(e._d=new Date(NaN));for(a=0;a<h;a++)n=0,r=!1,t=y({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._defaultDatePartsNow=l,t._f=e._f[a],qi(t),f(t)&&(r=!0),n+=m(t).charsLeftOver,n+=10*m(t).unusedTokens.length,m(t).score=n,o?n<s&&(s=n,i=t):(null==s||n<s||r)&&(s=n,i=t,r&&(o=!0));u(e,i||t)}function Xi(e){if(!e._d){var t=E(e._i),i=void 0===t.day?t.date:t.day;e._a=c([t.year,t.month,i,t.hour,t.minute,t.second,t.millisecond],(function(e){return e&&parseInt(e,10)})),Gi(e)}}function Qi(e){var t=new w(Ti(es(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function es(e){var t=e._i,i=e._f;return e._locale=e._locale||ki(e._l),null===t||void 0===i&&""===t?v({nullInput:!0}):("string"==typeof t&&(e._i=t=e._locale.preparse(t)),$(t)?new w(Ti(t)):(d(t)?e._d=t:a(i)?Ji(e):i?qi(e):ts(e),f(e)||(e._d=null),e))}function ts(e){var t=e._i;l(t)?e._d=new Date(i.now()):d(t)?e._d=new Date(t.valueOf()):"string"==typeof t?ji(e):a(t)?(e._a=c(t.slice(0),(function(e){return parseInt(e,10)})),Gi(e)):n(t)?Xi(e):h(t)?e._d=new Date(t):i.createFromInputFallback(e)}function is(e,t,i,s,r){var l={};return!0!==t&&!1!==t||(s=t,t=void 0),!0!==i&&!1!==i||(s=i,i=void 0),(n(e)&&o(e)||a(e)&&0===e.length)&&(e=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=r,l._l=i,l._i=e,l._f=t,l._strict=s,Qi(l)}function ss(e,t,i,s){return is(e,t,i,s,!1)}i.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",(function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))})),i._getDefaultDateParts=Vi,i.ISO_8601=function(){},i.RFC_2822=function(){};var as=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:v()})),ns=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:v()}));function rs(e,t){var i,s;if(1===t.length&&a(t[0])&&(t=t[0]),!t.length)return ss();for(s=0;s<t.length;++s)if($(t[s])){i=t[s];break}if(!i)return v();for(++s;s<t.length;++s)!$(t[s])||t[s].isValid()&&!t[s][e](i)||(i=t[s]);return i}function os(){return rs("isBefore",[].slice.call(arguments,0))}function ls(){return rs("isAfter",[].slice.call(arguments,0))}var hs=function(){return Date.now?Date.now():+new Date},ds=["year","quarter","month","week","day","hour","minute","second","millisecond"];function cs(e){var t,i,s=!1,a=ds.length;for(t in e)if(r(e,t)&&(-1===Ee.call(ds,t)||null!=e[t]&&isNaN(e[t])))return!1;for(i=0;i<a;++i)if(e[ds[i]]){if(s)return!1;parseFloat(e[ds[i]])!==ge(e[ds[i]])&&(s=!0)}return!0}function us(){return this._isValid}function ps(){return Ps(NaN)}function gs(e){var t=E(e),i=t.year||0,s=t.quarter||0,a=t.month||0,n=t.week||t.isoWeek||0,r=t.day||0,o=t.hour||0,l=t.minute||0,h=t.second||0,d=t.millisecond||0;this._isValid=cs(t),this._milliseconds=+d+1e3*h+6e4*l+1e3*o*60*60,this._days=+r+7*n,this._months=+a+3*s+12*i,this._data={},this._locale=ki(),this._bubble()}function ms(e){return e instanceof gs}function fs(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function vs(e,t,i){var s,a=Math.min(e.length,t.length),n=Math.abs(e.length-t.length),r=0;for(s=0;s<a;s++)ge(e[s])!==ge(t[s])&&r++;return r+n}function _s(e,t){L(e,0,0,(function(){var e=this.utcOffset(),i="+";return e<0&&(e=-e,i="-"),i+C(~~(e/60),2)+t+C(~~e%60,2)}))}_s("Z",":"),_s("ZZ",""),he("Z",ae),he("ZZ",ae),fe(["Z","ZZ"],(function(e,t,i){var s=ys(ae,e);i._useUTC=!0,i._tzm=s,null===s&&(m(i).invalidOffset=e)}));var bs=/([\+\-]|\d\d)/gi;function ys(e,t){var i,s,a=(t||"").match(e);return null===a?null:(s=60*(i=((a[a.length-1]||[])+"").match(bs)||["-",0,0])[1]+ge(i[2]),ge(i[2])>59||("+"===i[0]?s>840:s>720)?null:0===s?0:"+"===i[0]?s:-s)}function ws(e,t){var s,a;return t._isUTC?(s=t.clone(),a=($(e)||d(e)?e.valueOf():ss(e).valueOf())-s.valueOf(),s._d.setTime(s._d.valueOf()+a),i.updateOffset(s,!1),s):ss(e).local()}function $s(e){return-Math.round(e._d.getTimezoneOffset())}function xs(e,t,s){var a,n=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=ys(ae,e)))return this}else Math.abs(e)<16&&!s&&(e*=60);return!this._isUTC&&t&&(a=$s(this)),this._offset=e,this._isUTC=!0,null!=a&&this.add(a,"m"),n!==e&&(!t||this._changeInProgress?Bs(this,Ps(e-n,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,i.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?n:$s(this)}function ks(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function Ss(e){return this.utcOffset(0,e)}function Ts(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract($s(this),"m")),this}function Os(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=ys(se,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function Ms(e){return!!this.isValid()&&(e=e?ss(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function zs(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Es(){if(!l(this._isDSTShifted))return this._isDSTShifted;var e,t={};return y(t,this),(t=es(t))._a?(e=t._isUTC?p(t._a):ss(t._a),this._isDSTShifted=this.isValid()&&vs(t._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function As(){return!!this.isValid()&&!this._isUTC}function Hs(){return!!this.isValid()&&this._isUTC}function Cs(){return!!this.isValid()&&this._isUTC&&0===this._offset}i.updateOffset=function(){};var Ds=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,Ns=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Ps(e,t){var i,s,a,n=e,o=null;return ms(e)?n={ms:e._milliseconds,d:e._days,M:e._months}:h(e)||!isNaN(+e)?(n={},t?n[t]=+e:n.milliseconds=+e):(o=Ds.exec(e))?(i="-"===o[1]?-1:1,n={y:0,d:ge(o[$e])*i,h:ge(o[xe])*i,m:ge(o[ke])*i,s:ge(o[Se])*i,ms:ge(fs(1e3*o[Te]))*i}):(o=Ns.exec(e))?(i="-"===o[1]?-1:1,n={y:Rs(o[2],i),M:Rs(o[3],i),w:Rs(o[4],i),d:Rs(o[5],i),h:Rs(o[6],i),m:Rs(o[7],i),s:Rs(o[8],i)}):null==n?n={}:"object"==typeof n&&("from"in n||"to"in n)&&(a=Us(ss(n.from),ss(n.to)),(n={}).ms=a.milliseconds,n.M=a.months),s=new gs(n),ms(e)&&r(e,"_locale")&&(s._locale=e._locale),ms(e)&&r(e,"_isValid")&&(s._isValid=e._isValid),s}function Rs(e,t){var i=e&&parseFloat(e.replace(",","."));return(isNaN(i)?0:i)*t}function Ls(e,t){var i={};return i.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(i.months,"M").isAfter(t)&&--i.months,i.milliseconds=+t-+e.clone().add(i.months,"M"),i}function Us(e,t){var i;return e.isValid()&&t.isValid()?(t=ws(t,e),e.isBefore(t)?i=Ls(e,t):((i=Ls(t,e)).milliseconds=-i.milliseconds,i.months=-i.months),i):{milliseconds:0,months:0}}function Is(e,t){return function(i,s){var a;return null===s||isNaN(+s)||(T(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),a=i,i=s,s=a),Bs(this,Ps(i,s),e),this}}function Bs(e,t,s,a){var n=t._milliseconds,r=fs(t._days),o=fs(t._months);e.isValid()&&(a=null==a||a,o&&Je(e,De(e,"Month")+o*s),r&&Ne(e,"Date",De(e,"Date")+r*s),n&&e._d.setTime(e._d.valueOf()+n*s),a&&i.updateOffset(e,r||o))}Ps.fn=gs.prototype,Ps.invalid=ps;var js=Is(1,"add"),Ys=Is(-1,"subtract");function Fs(e){return"string"==typeof e||e instanceof String}function Ws(e){return $(e)||d(e)||Fs(e)||h(e)||Gs(e)||Vs(e)||null==e}function Vs(e){var t,i,s=n(e)&&!o(e),a=!1,l=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],h=l.length;for(t=0;t<h;t+=1)i=l[t],a=a||r(e,i);return s&&a}function Gs(e){var t=a(e),i=!1;return t&&(i=0===e.filter((function(t){return!h(t)&&Fs(e)})).length),t&&i}function Zs(e){var t,i,s=n(e)&&!o(e),a=!1,l=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(t=0;t<l.length;t+=1)i=l[t],a=a||r(e,i);return s&&a}function qs(e,t){var i=e.diff(t,"days",!0);return i<-6?"sameElse":i<-1?"lastWeek":i<0?"lastDay":i<1?"sameDay":i<2?"nextDay":i<7?"nextWeek":"sameElse"}function Ks(e,t){1===arguments.length&&(arguments[0]?Ws(arguments[0])?(e=arguments[0],t=void 0):Zs(arguments[0])&&(t=arguments[0],e=void 0):(e=void 0,t=void 0));var s=e||ss(),a=ws(s,this).startOf("day"),n=i.calendarFormat(this,a)||"sameElse",r=t&&(O(t[n])?t[n].call(this,s):t[n]);return this.format(r||this.localeData().calendar(n,this,ss(s)))}function Js(){return new w(this)}function Xs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=z(t)||"millisecond")?this.valueOf()>i.valueOf():i.valueOf()<this.clone().startOf(t).valueOf())}function Qs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=z(t)||"millisecond")?this.valueOf()<i.valueOf():this.clone().endOf(t).valueOf()<i.valueOf())}function ea(e,t,i,s){var a=$(e)?e:ss(e),n=$(t)?t:ss(t);return!!(this.isValid()&&a.isValid()&&n.isValid())&&("("===(s=s||"()")[0]?this.isAfter(a,i):!this.isBefore(a,i))&&(")"===s[1]?this.isBefore(n,i):!this.isAfter(n,i))}function ta(e,t){var i,s=$(e)?e:ss(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=z(t)||"millisecond")?this.valueOf()===s.valueOf():(i=s.valueOf(),this.clone().startOf(t).valueOf()<=i&&i<=this.clone().endOf(t).valueOf()))}function ia(e,t){return this.isSame(e,t)||this.isAfter(e,t)}function sa(e,t){return this.isSame(e,t)||this.isBefore(e,t)}function aa(e,t,i){var s,a,n;if(!this.isValid())return NaN;if(!(s=ws(e,this)).isValid())return NaN;switch(a=6e4*(s.utcOffset()-this.utcOffset()),t=z(t)){case"year":n=na(this,s)/12;break;case"month":n=na(this,s);break;case"quarter":n=na(this,s)/3;break;case"second":n=(this-s)/1e3;break;case"minute":n=(this-s)/6e4;break;case"hour":n=(this-s)/36e5;break;case"day":n=(this-s-a)/864e5;break;case"week":n=(this-s-a)/6048e5;break;default:n=this-s}return i?n:pe(n)}function na(e,t){if(e.date()<t.date())return-na(t,e);var i=12*(t.year()-e.year())+(t.month()-e.month()),s=e.clone().add(i,"months");return-(i+(t-s<0?(t-s)/(s-e.clone().add(i-1,"months")):(t-s)/(e.clone().add(i+1,"months")-s)))||0}function ra(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function oa(e){if(!this.isValid())return null;var t=!0!==e,i=t?this.clone().utc():this;return i.year()<0||i.year()>9999?B(i,t?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):O(Date.prototype.toISOString)?t?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",B(i,"Z")):B(i,t?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function la(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,t,i,s,a="moment",n="";return this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",n="Z"),e="["+a+'("]',t=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",i="-MM-DD[T]HH:mm:ss.SSS",s=n+'[")]',this.format(e+t+i+s)}function ha(e){e||(e=this.isUtc()?i.defaultFormatUtc:i.defaultFormat);var t=B(this,e);return this.localeData().postformat(t)}function da(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Ps({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function ca(e){return this.from(ss(),e)}function ua(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Ps({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function pa(e){return this.to(ss(),e)}function ga(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ki(e))&&(this._locale=t),this)}i.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",i.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var ma=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",(function(e){return void 0===e?this.localeData():this.locale(e)}));function fa(){return this._locale}var va=1e3,_a=60*va,ba=60*_a,ya=3506328*ba;function wa(e,t){return(e%t+t)%t}function xa(e,t,i){return e<100&&e>=0?new Date(e+400,t,i)-ya:new Date(e,t,i).valueOf()}function ka(e,t,i){return e<100&&e>=0?Date.UTC(e+400,t,i)-ya:Date.UTC(e,t,i)}function Ta(e){var t,s;if(void 0===(e=z(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?ka:xa,e){case"year":t=s(this.year(),0,1);break;case"quarter":t=s(this.year(),this.month()-this.month()%3,1);break;case"month":t=s(this.year(),this.month(),1);break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=s(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=wa(t+(this._isUTC?0:this.utcOffset()*_a),ba);break;case"minute":t=this._d.valueOf(),t-=wa(t,_a);break;case"second":t=this._d.valueOf(),t-=wa(t,va)}return this._d.setTime(t),i.updateOffset(this,!0),this}function Oa(e){var t,s;if(void 0===(e=z(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?ka:xa,e){case"year":t=s(this.year()+1,0,1)-1;break;case"quarter":t=s(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=s(this.year(),this.month()+1,1)-1;break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=s(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=ba-wa(t+(this._isUTC?0:this.utcOffset()*_a),ba)-1;break;case"minute":t=this._d.valueOf(),t+=_a-wa(t,_a)-1;break;case"second":t=this._d.valueOf(),t+=va-wa(t,va)-1}return this._d.setTime(t),i.updateOffset(this,!0),this}function Ma(){return this._d.valueOf()-6e4*(this._offset||0)}function za(){return Math.floor(this.valueOf()/1e3)}function Ea(){return new Date(this.valueOf())}function Aa(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function Ha(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function Ca(){return this.isValid()?this.toISOString():null}function Da(){return f(this)}function Na(){return u({},m(this))}function Pa(){return m(this).overflow}function Ra(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function La(e,t){var s,a,n,r=this._eras||ki("en")._eras;for(s=0,a=r.length;s<a;++s)switch("string"==typeof r[s].since&&(n=i(r[s].since).startOf("day"),r[s].since=n.valueOf()),typeof r[s].until){case"undefined":r[s].until=1/0;break;case"string":n=i(r[s].until).startOf("day").valueOf(),r[s].until=n.valueOf()}return r}function Ua(e,t,i){var s,a,n,r,o,l=this.eras();for(e=e.toUpperCase(),s=0,a=l.length;s<a;++s)if(n=l[s].name.toUpperCase(),r=l[s].abbr.toUpperCase(),o=l[s].narrow.toUpperCase(),i)switch(t){case"N":case"NN":case"NNN":if(r===e)return l[s];break;case"NNNN":if(n===e)return l[s];break;case"NNNNN":if(o===e)return l[s]}else if([n,r,o].indexOf(e)>=0)return l[s]}function Ia(e,t){var s=e.since<=e.until?1:-1;return void 0===t?i(e.since).year():i(e.since).year()+(t-e.offset)*s}function Ba(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].name;if(s[e].until<=i&&i<=s[e].since)return s[e].name}return""}function ja(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].narrow;if(s[e].until<=i&&i<=s[e].since)return s[e].narrow}return""}function Ya(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].abbr;if(s[e].until<=i&&i<=s[e].since)return s[e].abbr}return""}function Fa(){var e,t,s,a,n=this.localeData().eras();for(e=0,t=n.length;e<t;++e)if(s=n[e].since<=n[e].until?1:-1,a=this.clone().startOf("day").valueOf(),n[e].since<=a&&a<=n[e].until||n[e].until<=a&&a<=n[e].since)return(this.year()-i(n[e].since).year())*s+n[e].offset;return this.year()}function Wa(e){return r(this,"_erasNameRegex")||Xa.call(this),e?this._erasNameRegex:this._erasRegex}function Va(e){return r(this,"_erasAbbrRegex")||Xa.call(this),e?this._erasAbbrRegex:this._erasRegex}function Ga(e){return r(this,"_erasNarrowRegex")||Xa.call(this),e?this._erasNarrowRegex:this._erasRegex}function Za(e,t){return t.erasAbbrRegex(e)}function qa(e,t){return t.erasNameRegex(e)}function Ka(e,t){return t.erasNarrowRegex(e)}function Ja(e,t){return t._eraYearOrdinalRegex||te}function Xa(){var e,t,i,s,a,n=[],r=[],o=[],l=[],h=this.eras();for(e=0,t=h.length;e<t;++e)i=ue(h[e].name),s=ue(h[e].abbr),a=ue(h[e].narrow),r.push(i),n.push(s),o.push(a),l.push(i),l.push(s),l.push(a);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+r.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+n.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+o.join("|")+")","i")}function Qa(e,t){L(0,[e,e.length],0,t)}function en(e){return on.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function tn(e){return on.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function sn(){return Jt(this.year(),1,4)}function an(){return Jt(this.isoWeekYear(),1,4)}function nn(){var e=this.localeData()._week;return Jt(this.year(),e.dow,e.doy)}function rn(){var e=this.localeData()._week;return Jt(this.weekYear(),e.dow,e.doy)}function on(e,t,i,s,a){var n;return null==e?qt(this,s,a).year:(t>(n=Jt(e,s,a))&&(t=n),ln.call(this,e,t,i,s,a))}function ln(e,t,i,s,a){var n=Gt(e,t,i,s,a),r=Wt(n.year,0,n.dayOfYear);return this.year(r.getUTCFullYear()),this.month(r.getUTCMonth()),this.date(r.getUTCDate()),this}function hn(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}L("N",0,0,"eraAbbr"),L("NN",0,0,"eraAbbr"),L("NNN",0,0,"eraAbbr"),L("NNNN",0,0,"eraName"),L("NNNNN",0,0,"eraNarrow"),L("y",["y",1],"yo","eraYear"),L("y",["yy",2],0,"eraYear"),L("y",["yyy",3],0,"eraYear"),L("y",["yyyy",4],0,"eraYear"),he("N",Za),he("NN",Za),he("NNN",Za),he("NNNN",qa),he("NNNNN",Ka),fe(["N","NN","NNN","NNNN","NNNNN"],(function(e,t,i,s){var a=i._locale.erasParse(e,s,i._strict);a?m(i).era=a:m(i).invalidEra=e})),he("y",te),he("yy",te),he("yyy",te),he("yyyy",te),he("yo",Ja),fe(["y","yy","yyy","yyyy"],ye),fe(["yo"],(function(e,t,i,s){var a;i._locale._eraYearOrdinalRegex&&(a=e.match(i._locale._eraYearOrdinalRegex)),i._locale.eraYearOrdinalParse?t[ye]=i._locale.eraYearOrdinalParse(e,a):t[ye]=parseInt(e,10)})),L(0,["gg",2],0,(function(){return this.weekYear()%100})),L(0,["GG",2],0,(function(){return this.isoWeekYear()%100})),Qa("gggg","weekYear"),Qa("ggggg","weekYear"),Qa("GGGG","isoWeekYear"),Qa("GGGGG","isoWeekYear"),he("G",ie),he("g",ie),he("GG",q,W),he("gg",q,W),he("GGGG",Q,G),he("gggg",Q,G),he("GGGGG",ee,Z),he("ggggg",ee,Z),ve(["gggg","ggggg","GGGG","GGGGG"],(function(e,t,i,s){t[s.substr(0,2)]=ge(e)})),ve(["gg","GG"],(function(e,t,s,a){t[a]=i.parseTwoDigitYear(e)})),L("Q",0,"Qo","quarter"),he("Q",F),fe("Q",(function(e,t){t[we]=3*(ge(e)-1)})),L("D",["DD",2],"Do","date"),he("D",q,oe),he("DD",q,W),he("Do",(function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient})),fe(["D","DD"],$e),fe("Do",(function(e,t){t[$e]=ge(e.match(q)[0])}));var dn=Ce("Date",!0);function cn(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}L("DDD",["DDDD",3],"DDDo","dayOfYear"),he("DDD",X),he("DDDD",V),fe(["DDD","DDDD"],(function(e,t,i){i._dayOfYear=ge(e)})),L("m",["mm",2],0,"minute"),he("m",q,le),he("mm",q,W),fe(["m","mm"],ke);var un=Ce("Minutes",!1);L("s",["ss",2],0,"second"),he("s",q,le),he("ss",q,W),fe(["s","ss"],Se);var pn,gn,mn=Ce("Seconds",!1);for(L("S",0,0,(function(){return~~(this.millisecond()/100)})),L(0,["SS",2],0,(function(){return~~(this.millisecond()/10)})),L(0,["SSS",3],0,"millisecond"),L(0,["SSSS",4],0,(function(){return 10*this.millisecond()})),L(0,["SSSSS",5],0,(function(){return 100*this.millisecond()})),L(0,["SSSSSS",6],0,(function(){return 1e3*this.millisecond()})),L(0,["SSSSSSS",7],0,(function(){return 1e4*this.millisecond()})),L(0,["SSSSSSSS",8],0,(function(){return 1e5*this.millisecond()})),L(0,["SSSSSSSSS",9],0,(function(){return 1e6*this.millisecond()})),he("S",X,F),he("SS",X,W),he("SSS",X,V),pn="SSSS";pn.length<=9;pn+="S")he(pn,te);function fn(e,t){t[Te]=ge(1e3*("0."+e))}for(pn="S";pn.length<=9;pn+="S")fe(pn,fn);function vn(){return this._isUTC?"UTC":""}function _n(){return this._isUTC?"Coordinated Universal Time":""}gn=Ce("Milliseconds",!1),L("z",0,0,"zoneAbbr"),L("zz",0,0,"zoneName");var bn=w.prototype;function yn(e){return ss(1e3*e)}function wn(){return ss.apply(null,arguments).parseZone()}function $n(e){return e}bn.add=js,bn.calendar=Ks,bn.clone=Js,bn.diff=aa,bn.endOf=Oa,bn.format=ha,bn.from=da,bn.fromNow=ca,bn.to=ua,bn.toNow=pa,bn.get=Pe,bn.invalidAt=Pa,bn.isAfter=Xs,bn.isBefore=Qs,bn.isBetween=ea,bn.isSame=ta,bn.isSameOrAfter=ia,bn.isSameOrBefore=sa,bn.isValid=Da,bn.lang=ma,bn.locale=ga,bn.localeData=fa,bn.max=ns,bn.min=as,bn.parsingFlags=Na,bn.set=Re,bn.startOf=Ta,bn.subtract=Ys,bn.toArray=Aa,bn.toObject=Ha,bn.toDate=Ea,bn.toISOString=oa,bn.inspect=la,"undefined"!=typeof Symbol&&null!=Symbol.for&&(bn[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),bn.toJSON=Ca,bn.toString=ra,bn.unix=za,bn.valueOf=Ma,bn.creationData=Ra,bn.eraName=Ba,bn.eraNarrow=ja,bn.eraAbbr=Ya,bn.eraYear=Fa,bn.year=Ae,bn.isLeapYear=He,bn.weekYear=en,bn.isoWeekYear=tn,bn.quarter=bn.quarters=hn,bn.month=Xe,bn.daysInMonth=Qe,bn.week=bn.weeks=ii,bn.isoWeek=bn.isoWeeks=si,bn.weeksInYear=nn,bn.weeksInWeekYear=rn,bn.isoWeeksInYear=sn,bn.isoWeeksInISOWeekYear=an,bn.date=dn,bn.day=bn.days=yt,bn.weekday=wt,bn.isoWeekday=$t,bn.dayOfYear=cn,bn.hour=bn.hours=di,bn.minute=bn.minutes=un,bn.second=bn.seconds=mn,bn.millisecond=bn.milliseconds=gn,bn.utcOffset=xs,bn.utc=Ss,bn.local=Ts,bn.parseZone=Os,bn.hasAlignedHourOffset=Ms,bn.isDST=zs,bn.isLocal=As,bn.isUtcOffset=Hs,bn.isUtc=Cs,bn.isUTC=Cs,bn.zoneAbbr=vn,bn.zoneName=_n,bn.dates=k("dates accessor is deprecated. Use date instead.",dn),bn.months=k("months accessor is deprecated. Use month instead",Xe),bn.years=k("years accessor is deprecated. Use year instead",Ae),bn.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",ks),bn.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Es);var xn=zt.prototype;function kn(e,t,i,s){var a=ki(),n=p().set(s,t);return a[i](n,e)}function Sn(e,t,i){if(h(e)&&(t=e,e=void 0),e=e||"",null!=t)return kn(e,t,i,"month");var s,a=[];for(s=0;s<12;s++)a[s]=kn(e,s,i,"month");return a}function Tn(e,t,i,s){"boolean"==typeof e?(h(t)&&(i=t,t=void 0),t=t||""):(i=t=e,e=!1,h(t)&&(i=t,t=void 0),t=t||"");var a,n=ki(),r=e?n._week.dow:0,o=[];if(null!=i)return kn(t,(i+r)%7,s,"day");for(a=0;a<7;a++)o[a]=kn(t,(a+r)%7,s,"day");return o}function On(e,t){return Sn(e,t,"months")}function Mn(e,t){return Sn(e,t,"monthsShort")}function zn(e,t,i){return Tn(e,t,i,"weekdays")}function En(e,t,i){return Tn(e,t,i,"weekdaysShort")}function An(e,t,i){return Tn(e,t,i,"weekdaysMin")}xn.calendar=At,xn.longDateFormat=Ct,xn.invalidDate=Nt,xn.ordinal=Lt,xn.preparse=$n,xn.postformat=$n,xn.relativeTime=Bt,xn.pastFuture=Yt,xn.set=Ot,xn.eras=La,xn.erasParse=Ua,xn.erasConvertYear=Ia,xn.erasAbbrRegex=Va,xn.erasNameRegex=Wa,xn.erasNarrowRegex=Ga,xn.months=Ge,xn.monthsShort=Ze,xn.monthsParse=Ke,xn.monthsRegex=tt,xn.monthsShortRegex=et,xn.week=Xt,xn.firstDayOfYear=ti,xn.firstDayOfWeek=ei,xn.weekdays=mt,xn.weekdaysMin=vt,xn.weekdaysShort=ft,xn.weekdaysParse=bt,xn.weekdaysRegex=xt,xn.weekdaysShortRegex=kt,xn.weekdaysMinRegex=St,xn.isPM=li,xn.meridiem=ci,wi("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===ge(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),i.lang=k("moment.lang is deprecated. Use moment.locale instead.",wi),i.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ki);var Hn=Math.abs;function Cn(){var e=this._data;return this._milliseconds=Hn(this._milliseconds),this._days=Hn(this._days),this._months=Hn(this._months),e.milliseconds=Hn(e.milliseconds),e.seconds=Hn(e.seconds),e.minutes=Hn(e.minutes),e.hours=Hn(e.hours),e.months=Hn(e.months),e.years=Hn(e.years),this}function Dn(e,t,i,s){var a=Ps(t,i);return e._milliseconds+=s*a._milliseconds,e._days+=s*a._days,e._months+=s*a._months,e._bubble()}function Nn(e,t){return Dn(this,e,t,1)}function Pn(e,t){return Dn(this,e,t,-1)}function Rn(e){return e<0?Math.floor(e):Math.ceil(e)}function Ln(){var e,t,i,s,a,n=this._milliseconds,r=this._days,o=this._months,l=this._data;return n>=0&&r>=0&&o>=0||n<=0&&r<=0&&o<=0||(n+=864e5*Rn(In(o)+r),r=0,o=0),l.milliseconds=n%1e3,e=pe(n/1e3),l.seconds=e%60,t=pe(e/60),l.minutes=t%60,i=pe(t/60),l.hours=i%24,r+=pe(i/24),o+=a=pe(Un(r)),r-=Rn(In(a)),s=pe(o/12),o%=12,l.days=r,l.months=o,l.years=s,this}function Un(e){return 4800*e/146097}function In(e){return 146097*e/4800}function Bn(e){if(!this.isValid())return NaN;var t,i,s=this._milliseconds;if("month"===(e=z(e))||"quarter"===e||"year"===e)switch(t=this._days+s/864e5,i=this._months+Un(t),e){case"month":return i;case"quarter":return i/3;case"year":return i/12}else switch(t=this._days+Math.round(In(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}}function jn(e){return function(){return this.as(e)}}var Yn=jn("ms"),Fn=jn("s"),Wn=jn("m"),Vn=jn("h"),Gn=jn("d"),Zn=jn("w"),qn=jn("M"),Kn=jn("Q"),Jn=jn("y"),Xn=Yn;function Qn(){return Ps(this)}function er(e){return e=z(e),this.isValid()?this[e+"s"]():NaN}function tr(e){return function(){return this.isValid()?this._data[e]:NaN}}var ir=tr("milliseconds"),sr=tr("seconds"),ar=tr("minutes"),nr=tr("hours"),rr=tr("days"),or=tr("months"),lr=tr("years");function hr(){return pe(this.days()/7)}var dr=Math.round,cr={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function ur(e,t,i,s,a){return It.call(a,t||1,!!i,e,s)}function pr(e,t,i,s){var a=Ps(e).abs(),n=dr(a.as("s")),r=dr(a.as("m")),o=dr(a.as("h")),l=dr(a.as("d")),h=dr(a.as("M")),d=dr(a.as("w")),c=dr(a.as("y")),u=n<=i.ss&&["s",n]||n<i.s&&["ss",n]||r<=1&&["m"]||r<i.m&&["mm",r]||o<=1&&["h"]||o<i.h&&["hh",o]||l<=1&&["d"]||l<i.d&&["dd",l];return null!=i.w&&(u=u||d<=1&&["w"]||d<i.w&&["ww",d]),(u=u||h<=1&&["M"]||h<i.M&&["MM",h]||c<=1&&["y"]||["yy",c])[2]=t,u[3]=+e>0,u[4]=s,ur.apply(null,u)}function gr(e){return void 0===e?dr:"function"==typeof e&&(dr=e,!0)}function mr(e,t){return void 0!==cr[e]&&(void 0===t?cr[e]:(cr[e]=t,"s"===e&&(cr.ss=t-1),!0))}function fr(e,t){if(!this.isValid())return this.localeData().invalidDate();var i,s,a=!1,n=cr;return"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(a=e),"object"==typeof t&&(n=u(u({},cr),t||{}),null!=t.s&&null==t.ss&&(n.ss=t.s-1)),s=pr(this,!a,n,i=this.localeData()),a&&(s=jt.call(i,+this,s)),i.postformat(s)}var vr=Math.abs;function _r(e){return(e>0)-(e<0)||+e}function br(){if(!this.isValid())return this.localeData().invalidDate();var e,t,i,s,a,n,r,o,l=vr(this._milliseconds)/1e3,h=vr(this._days),d=vr(this._months),c=this.asSeconds();return c?(e=pe(l/60),t=pe(e/60),l%=60,e%=60,i=pe(d/12),d%=12,s=l?l.toFixed(3).replace(/\.?0+$/,""):"",a=c<0?"-":"",n=_r(this._months)!==_r(c)?"-":"",r=_r(this._days)!==_r(c)?"-":"",o=_r(this._milliseconds)!==_r(c)?"-":"",a+"P"+(i?n+i+"Y":"")+(d?n+d+"M":"")+(h?r+h+"D":"")+(t||e||l?"T":"")+(t?o+t+"H":"")+(e?o+e+"M":"")+(l?o+s+"S":"")):"P0D"}var yr=gs.prototype;return yr.isValid=us,yr.abs=Cn,yr.add=Nn,yr.subtract=Pn,yr.as=Bn,yr.asMilliseconds=Yn,yr.asSeconds=Fn,yr.asMinutes=Wn,yr.asHours=Vn,yr.asDays=Gn,yr.asWeeks=Zn,yr.asMonths=qn,yr.asQuarters=Kn,yr.asYears=Jn,yr.valueOf=Xn,yr._bubble=Ln,yr.clone=Qn,yr.get=er,yr.milliseconds=ir,yr.seconds=sr,yr.minutes=ar,yr.hours=nr,yr.days=rr,yr.weeks=hr,yr.months=or,yr.years=lr,yr.humanize=fr,yr.toISOString=br,yr.toString=br,yr.toJSON=br,yr.locale=ga,yr.localeData=fa,yr.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",br),yr.lang=ma,L("X",0,0,"unix"),L("x",0,0,"valueOf"),he("x",ie),he("X",ne),fe("X",(function(e,t,i){i._d=new Date(1e3*parseFloat(e))})),fe("x",(function(e,t,i){i._d=new Date(ge(e))})),
//! moment.js
i.version="2.31.0",s(ss),i.fn=bn,i.min=os,i.max=ls,i.now=hs,i.utc=p,i.unix=yn,i.months=On,i.isDate=d,i.locale=wi,i.invalid=v,i.duration=Ps,i.isMoment=$,i.weekdays=zn,i.parseZone=wn,i.localeData=ki,i.isDuration=ms,i.monthsShort=Mn,i.weekdaysMin=An,i.defineLocale=$i,i.updateLocale=xi,i.locales=Si,i.weekdaysShort=En,i.normalizeUnits=z,i.relativeTimeRounding=gr,i.relativeTimeThreshold=mr,i.calendarFormat=qs,i.prototype=bn,i.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},i}()),ka.exports),Oa=wa(Ta);const Ma=["sand","sandy_loam","loam","clay_loam","clay","custom"],za=["lawn","vegetables","flowers","shrubs","hedge","fruit_trees","vines","ground_cover","custom"];let Ea=class extends(Ws(de)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this._pendingZoneChanges=new Map,this.zoneCache=new Map,this._expanded=new Set}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([Ds(this.hass),Ps(this.hass),Ls(this.hass),Bs(this.hass)]);this.config=e,this.zones=t,this.modules=i,this.mappings=s,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ei+"/zones",{calculate_all:!0})).catch((e=>{console.error("Failed to calculate all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ei+"/zones",{update_all:!0})).catch((e=>{console.error("Failed to update all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleResetAllBuckets(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ei+"/zones",{reset_all_buckets:!0})).catch((e=>{console.error("Failed to reset all buckets:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleClearAllWeatherdata(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",ei+"/zones",{clear_all_weatherdata:!0})).catch((e=>{console.error("Failed to clear all weather data:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:ya.Automatic,duration:0,bucket:0,module:void 0,delta:0,et_deficiency:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then((()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}_engineOptions(e,t,i){var s,a,n,r,o;const l=null!==(s=t.calculation_method)&&void 0!==s?s:"from_weather",h=null!==(a=t.method_config)&&void 0!==a?a:{},d=i=>this.handleEditZone(e,Object.assign(Object.assign({},t),{calculation_method:l,method_config:Object.assign(Object.assign({},h),i)}));return"from_weather"===l?"advanced"!==(null===(n=this.config)||void 0===n?void 0:n.ui_mode)?"":W`
        ${this._numRow(qt("panels.zones.labels.forecast-days",i),"",null!==(r=h.forecast_days)&&void 0!==r?r:0,(e=>d({forecast_days:parseInt(e,10)||0})))}
        <div class="setting-help">
          ${qt("panels.zones.labels.forecast-days-help",i)}
          ${qt("panels.zones.labels.engine-shared-help",i)}
        </div>
      `:"fixed"===l?W`
        ${this._numRow(qt("panels.zones.labels.fixed-amount",i),Ts(this.config,ss),null!==(o=h.delta)&&void 0!==o?o:0,(e=>d({delta:parseFloat(e)||0})))}
        <div class="setting-help">
          ${qt("panels.zones.labels.engine-shared-help",i)}
        </div>
      `:""}_zoneStatus(e,t){var i,s,a;const n=(e,...i)=>qt(`panels.zones.status.${e}`,t,...i),r=Math.max(0,-(null!==(i=e.bucket)&&void 0!==i?i:0)),o=null!==(s=e.irrigation_threshold)&&void 0!==s?s:0,l=function(e,t){const i=(null==e?void 0:e.units)==di;switch(t){case ds:case _s:return i?qi:Ki;case ti:case ss:return i?Wi:Vi;case Xi:return i?"m²":Bi;case Qi:return i?ji:Yi;case is:return i?"L":"gal";default:return""}}(this.config,ss),h=r>=.05?`${r.toFixed(1)} ${l}`:null;let d="idle",c=h?n("idle","{short}",h):n("satisfied");return e.state===ya.Disabled?(d="off",c=n("disabled")):e.state===ya.Manual?(d="off",c=n("manual")):(null!==(a=e.duration)&&void 0!==a?a:0)>0?(d="watering",c=n("will-water","{duration}",Os(e.duration))):h&&o>0&&(c=n("under-threshold","{short}",h)),W`
      <div class="zone-status zone-status--${d}">
        <ha-icon
          icon=${"watering"===d?"mdi:water-outline":"off"===d?"mdi:pause-circle-outline":"mdi:check-circle-outline"}
        ></ha-icon>
        <span>${c}</span>
        ${"off"!==d&&o>0?W`<span class="zone-status-numbers">
              ${n("threshold")}: ${o.toFixed(1)} ${l}
            </span>`:""}
      </div>
    `}_adv(e){var t;return"advanced"===(null===(t=this.config)||void 0===t?void 0:t.ui_mode)?e:""}handleEditZone(e,t){if(!this.hass)return;const i=this.zones[e],s=t.id,a=Object.assign(Object.assign({},void 0!==s?this._pendingZoneChanges.get(s):{}),function(e,t){const i={};for(const s of new Set([...Object.keys(null!=e?e:{}),...Object.keys(t)]))JSON.stringify(null==e?void 0:e[s])!==JSON.stringify(t[s])&&(i[s]=void 0===t[s]?null:t[s]);return i}(i,t));void 0!==s&&this._pendingZoneChanges.set(s,a),this.zones[e]=t,null!=t.id&&this.zoneCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{const e=[...this._pendingZoneChanges.entries()];this._pendingZoneChanges.clear();const t=e.filter((([,e])=>Object.keys(e).length>0)).map((([e,t])=>Object.assign(Object.assign({},t),{id:e})));if(0===t.length)return void(this.globalDebounceTimer=null);this.isSaving=!0,this._suppressNextConfigUpdate=!0;const i=t.some((e=>"soil_type"in e||"plant_type"in e||"calculation_method"in e||"method_config"in e));Promise.all(t.map((e=>this.saveToHA(e)))).then((()=>i?this._fetchData():void 0)).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}handleRemoveZone(e,t){if(!this.hass)return;const i=this.zones[t].id;if(!this.zones[t]||null==i)return;const s=[...this.zones];var a,n;this.zones=this.zones.filter(((e,i)=>i!==t)),this.zoneCache.delete(i.toString()),this.isSaving=!0,(a=this.hass,n=i.toString(),a.callApi("POST",ei+"/zones",{id:n,remove:!0})).catch((e=>{console.error("Failed to delete zone:",e),this.zones=s,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleCalculateZone(e){const t=this.zones[e];var i,s;t&&null!=t.id&&(this.hass&&(i=this.hass,s=t.id.toString(),i.callApi("POST",ei+"/zones",{id:s,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=this.zones[e];var i,s;t&&null!=t.id&&(this.hass&&(i=this.hass,s=t.id.toString(),i.callApi("POST",ei+"/zones",{id:s,update:!0})))}handleViewWeatherInfo(e){var t;const i=this.zones[e];if(!i||null==i.mapping)return;const s=`#weather-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}handleViewWateringCalendar(e){var t;const i=this.zones[e];if(!i||null==i.id)return;const s=`#calendar-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const t=await Ys(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,t)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const i of this.zones)if(void 0!==i.id)try{const s=await(e=this.hass,t=i.id.toString(),e.callWS({type:ei+"/watering_calendar",zone_id:t}));this.wateringCalendars.set(i.id,s)}catch(e){console.error(`Failed to fetch watering calendar for zone ${i.id}:`,e)}var e,t;this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return W``;const t=this.weatherRecords.get(e.id)||[];return W`
      <div class="weather-records">
        <h4>
          ${qt("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?W`
              <div class="weather-note">
                ${qt("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:W`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${qt("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>W`
                    <div class="weather-row">
                      <span
                        >${Oa(e.timestamp).format("MM-DD HH:mm")}</span
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
                        >${e.retrieval_time?Oa(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `))}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){var t;if(!this.hass||"number"!=typeof e.id)return W``;const i=this.wateringCalendars.get(e.id),s=i&&e.id in i?i[e.id]:null,a=(null==s?void 0:s.monthly_estimates)||[],n=this.hass.language,r=e=>qt(`panels.zones.calendar.${e}`,n);return W` <div class="watering-calendar">
      <h4>${r("title")}</h4>
      <div class="calendar-note">${r("caveat")}</div>
      ${0===a.length?W`
            <div class="calendar-note">
              ${(null==s?void 0:s.error)?`${r("error")}: ${s.error}`:r("none")}
            </div>
          `:W` <div class="calendar-table">
              <div class="calendar-header">
                <span>${r("month")}</span>
                <span
                  >${r("et")} (${Ts(this.config,ss)})</span
                >
                <span
                  >${r("precipitation")}
                  (${Ts(this.config,ss)})</span
                >
                <span
                  >${r("watering")}
                  (${Ts(this.config,is)})</span
                >
                <span
                  >${r("avg-temp")}
                  (${(null===(t=this.config)||void 0===t?void 0:t.units)===di?"°C":"°F"})</span
                >
              </div>
              ${a.map((e=>W`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${null!==e.estimated_et_mm&&void 0!==e.estimated_et_mm?zs(e.estimated_et_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.average_precipitation_mm&&void 0!==e.average_precipitation_mm?zs(e.average_precipitation_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.estimated_watering_volume_liters&&void 0!==e.estimated_watering_volume_liters?Ms(e.estimated_watering_volume_liters,this.config).toFixed(0):"-"}</span
                    >
                    <span
                      >${null!==e.average_temperature_c&&void 0!==e.average_temperature_c?function(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===di?i:1.8*i+32}(e.average_temperature_c,this.config).toFixed(1):"-"}</span
                    >
                  </div>
                `))}
            </div>
            ${(null==s?void 0:s.calculation_method)?W`
                  <div class="calendar-info">
                    ${qt("panels.zones.labels.calculation-method",n)}:
                    ${qt(`panels.zones.labels.calculation-methods.${s.calculation_method}`,n)}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");await Rs(this.hass,e)}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,t,i,s;(null===(t=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===t?void 0:t.trim())||(null===(i=this.sizeInput)||void 0===i?void 0:i.value)||(null===(s=this.throughputInput)||void 0===s?void 0:s.value)||(this.isCreatingZone=!1)}renderTheOptions(e,t,i){if(this.hass){let s=W`<option value="" ?selected=${void 0===t}">---${qt("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,a])=>s=W`${s}
            <option
              value="${a.id}"
              ?selected="${t===a.id}"
            >
              ${i?i(a):`${a.id}: ${a.name}`}
            </option>`)),s}return W``}renderZone(e,t){var i,s,a,n,r,o,l,h;if(!this.hass)return W``;const d=this.hass.language,c=e.state===ya.Automatic,u=e.state===ya.Disabled||e.state===ya.Automatic,p=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const t=this.mappings.filter((t=>t.id===e.mapping))[0];null!=t&&null!=t.data&&(e.number_of_data_points=t.data.length)}const g=qt("panels.zones.labels.states."+e.state,d),m=W`${Os(e.duration)}
    (${function(e,t){const i=Number(e)||0,s=Number(t)||0;return i<=0||s<=0?0:i/60*s}(e.duration,e.throughput).toFixed(1)}
    ${Ts(this.config,is)})`,f=null!=e.id&&this._expanded.has(e.id);return W`
      <ha-card class="zone-card">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${f?"true":"false"}
          @click=${()=>this._toggleZone(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleZone(e.id))}}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${e.name||"—"}</span>
              <ha-label class="state-label state-label--${e.state}" dense
                >${g}</ha-label
              >
            </div>
            <div class="zone-sub">${m}</div>
          </div>
          <ha-svg-icon
            class="zone-chevron ${f?"open":""}"
            .path=${Gs}
          ></ha-svg-icon>
        </div>
        ${this._zoneStatus(e,d)}
        ${f?W` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${qt("panels.zones.labels.last_calculated",d)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?Oa(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${qt("panels.zones.labels.data-last-updated",d)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?Oa(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${qt("panels.zones.labels.data-number-of-data-points",d)}</span
                  >
                  <span class="meta-value"
                    >${null!==(i=e.number_of_data_points)&&void 0!==i?i:"—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(qt("panels.zones.labels.name",d),"",e.name,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ji]:i}))))}
                ${this._adv(this._selectRow(qt("panels.zones.labels.calculation-method",d),W`
                      ${["from_weather","provided","fixed"].map((t=>{var i;return W`
                          <option
                            value="${t}"
                            ?selected=${(null!==(i=e.calculation_method)&&void 0!==i?i:"from_weather")===t}
                          >
                            ${qt(`panels.zones.labels.calculation-methods.${t}`,d)}
                          </option>
                        `}))}
                    `,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{calculation_method:i.target.value})))))}
                ${this._adv(W`<div class="setting-help">
                    ${qt(`panels.zones.labels.calculation-method-help.${null!==(s=e.calculation_method)&&void 0!==s?s:"from_weather"}`,d)}
                  </div>`)}
                ${this._engineOptions(t,e,d)}
                ${this._selectRow(qt("panels.zones.labels.input-method",d),W`
                    <option
                      value="${fs}"
                      ?selected=${(null!==(a=e.input_method)&&void 0!==a?a:fs)===fs}
                    >
                      ${qt("panels.zones.labels.input-methods.throughput",d)}
                    </option>
                    <option
                      value="${vs}"
                      ?selected=${e.input_method===vs}
                    >
                      ${qt("panels.zones.labels.input-methods.direct",d)}
                    </option>
                  `,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ms]:i.target.value}))))}
                ${e.input_method===vs?this._numRow(qt("panels.zones.labels.precipitation-rate",d),Ts(this.config,_s),e.precipitation_rate,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[_s]:parseFloat(i)}))),.1):W`
                      ${this._numRow(qt("panels.zones.labels.size",d),Ts(this.config,Xi),e.size,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Xi]:parseFloat(i)}))),.1)}
                      ${this._numRow(qt("panels.zones.labels.throughput",d),Ts(this.config,Qi),e.throughput,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Qi]:parseFloat(i)}))),.1)}
                    `}
                ${this._selectRow(qt("panels.zones.labels.soil-type",d),W`
                    ${Ma.map((t=>{var i;return W`
                        <option
                          value="${t}"
                          ?selected=${(null!==(i=e.soil_type)&&void 0!==i?i:"custom")===t}
                        >
                          ${qt(`panels.zones.labels.soil-types.${t}`,d)}
                        </option>
                      `}))}
                  `,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{soil_type:i.target.value}))))}
                ${this._selectRow(qt("panels.zones.labels.plant-type",d),W`
                    ${za.map((t=>{var i;return W`
                        <option
                          value="${t}"
                          ?selected=${(null!==(i=e.plant_type)&&void 0!==i?i:"custom")===t}
                        >
                          ${qt(`panels.zones.labels.plant-types.${t}`,d)}
                        </option>
                      `}))}
                  `,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{plant_type:i.target.value}))))}
                ${this._adv(this._numRow(qt("panels.zones.labels.drainage_rate",d),Ts(this.config,ds),e.drainage_rate,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ds]:parseFloat(i)}))),.1))}
                ${this._selectRow(qt("panels.zones.labels.state",d),W`
                    <option
                      value="${ya.Automatic}"
                      ?selected=${e.state===ya.Automatic}
                    >
                      ${qt("panels.zones.labels.states.automatic",d)}
                    </option>
                    <option
                      value="${ya.Disabled}"
                      ?selected=${e.state===ya.Disabled}
                    >
                      ${qt("panels.zones.labels.states.disabled",d)}
                    </option>
                    <option
                      value="${ya.Manual}"
                      ?selected=${e.state===ya.Manual}
                    >
                      ${qt("panels.zones.labels.states.manual",d)}
                    </option>
                  `,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[es]:i.target.value,[ts]:0}))))}
                ${this._selectRow(qt("panels.zones.labels.mapping",d),this.renderTheOptions(this.mappings,e.mapping),(i=>{const s=i.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[ns]:""===s?void 0:parseInt(s)}))}))}
                ${this._numRow(qt("panels.zones.labels.bucket",d),Ts(this.config,ss),Number(e.bucket).toFixed(1),(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ss]:parseFloat(i)}))),.1)}
                ${this._adv(this._numRow(qt("panels.zones.labels.maximum-bucket",d),Ts(this.config,ss),Number(e.maximum_bucket).toFixed(1),(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ls]:parseFloat(i)}))),.1))}
                ${this._adv(this._numRow(qt("panels.zones.labels.irrigation-threshold",d),Ts(this.config,ss),Number(null!==(n=e.irrigation_threshold)&&void 0!==n?n:0).toFixed(1),(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[hs]:parseFloat(i)}))),.1))}
                ${this._numRow(qt("panels.zones.labels.et-deficiency",d),Ts(this.config,ss),null!=e.et_deficiency?Number(e.et_deficiency).toFixed(2):"",(()=>{}),.01,!0)}
                <div class="setting-help">
                  ${qt("panels.zones.labels.et-deficiency-help",d)}
                </div>
                ${(null===(r=this.config)||void 0===r?void 0:r.observed_watering_enabled)||(null===(o=this.config)||void 0===o?void 0:o.direct_valve_control_enabled)?this._entityRow(qt("panels.zones.labels.linked-entity",d),qt("panels.zones.labels.optional",d),e.linked_entity,["switch","valve","input_boolean","binary_sensor"],(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[cs]:i||void 0}))),qt("panels.zones.labels.linked-entity-hint",d)):""}
                ${this._adv((null===(l=this.config)||void 0===l?void 0:l.observed_watering_enabled)&&e.linked_entity?this._entityRow(qt("panels.zones.labels.flow-sensor",d),qt("panels.zones.labels.optional",d),e.flow_sensor,["sensor"],(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[us]:i||void 0}))),qt("panels.zones.labels.flow-sensor-hint",d)):"")}
                ${this._adv(this._entityRow(qt("panels.zones.labels.soil-moisture-sensor",d),qt("panels.zones.labels.optional",d),e.soil_moisture_sensor,["sensor"],(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ps]:i||void 0}))),qt("panels.zones.labels.soil-moisture-sensor-hint",d)))}
                ${e.soil_moisture_sensor?this._numRow(qt("panels.zones.labels.soil-moisture-threshold",d),"%",null!==(h=e.soil_moisture_threshold)&&void 0!==h?h:50,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[gs]:parseFloat(i)}))),1):""}
                ${this._adv(this._numRow(qt("panels.zones.labels.lead-time",d),"s",e.lead_time,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[rs]:parseInt(i,10)}))),1))}
                ${this._adv(this._numRow(qt("panels.zones.labels.maximum-duration",d),"s",e.maximum_duration,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[os]:parseInt(i,10)}))),1))}
                ${this._adv(this._numRow(qt("panels.zones.labels.multiplier",d),"",e.multiplier,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[as]:parseFloat(i)}))),.1))}
                ${this._numRow(qt("panels.zones.labels.duration",d),"s",e.duration,(i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ts]:parseInt(i,10)}))),1,u)}
                ${u?W`<div class="setting-help">
                      ${qt(e.state===ya.Disabled?"panels.zones.labels.duration-readonly-disabled":"panels.zones.labels.duration-readonly-automatic",d)}
                    </div>`:""}
              </div>

              <div class="zone-actions">
                ${c?W`
                      ${this._actionBtn(Vs,qt("panels.zones.actions.calculate",d),(()=>this.handleCalculateZone(t)))}
                      ${this._actionBtn(ia,qt("panels.zones.actions.update",d),(()=>this.handleUpdateZone(t)))}
                    `:""}
                ${this._actionBtn(Qs,qt("panels.zones.actions.reset-bucket",d),(()=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ss]:0}))))}
                ${null!=e.mapping?this._actionBtn(qs,qt("panels.zones.actions.view-weather-info",d),(()=>this.handleViewWeatherInfo(t))):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",qt("panels.zones.actions.view-watering-calendar",d),(()=>this.handleViewWateringCalendar(t)))}
                ${p?this._actionBtn("M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",qt("panels.zones.actions.information",d),(()=>this.toggleExplanation(t))):""}
                ${this._actionBtn(Ks,qt("common.actions.delete",d),(e=>this.handleRemoveZone(e,t)),!0)}
              </div>

              ${p?W`<label class="hidden" id="calcresults${t}"
                    >${xs("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
    `}_textRow(e,t,i,s){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${a}
            ?readonly=${n}
            .value=${null==i?"":String(i)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>s(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Xs}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ea}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Js}></path>
          </svg>
        </div>
      </div>
    `}_entityRow(e,t,i,s,a,n){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
          ${n?W`<div class="setting-hint">${n}</div>`:""}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${i||""}
          .includeDomains=${s}
          allow-custom-entity
          @value-changed=${e=>{var t;return a((null===(t=e.detail)||void 0===t?void 0:t.value)||"")}}
        ></ha-entity-picker>
      </div>
    `}_actionBtn(e,t,i,s=!1,a=!1){return W`
      <ha-button
        appearance=${s?"accent":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}toggleExplanation(e){var t;const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);i&&("hidden"!=i.className?i.className="hidden":i.className="explanation")}render(){return this.hass?this.isLoading?W`
        <ha-card header="${qt("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${qt("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:W`
      <ha-card header="${qt("panels.zones.title",this.hass.language)}">
        <div class="card-content">
          ${qt("panels.zones.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${qt("panels.zones.cards.add-zone.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.zones.labels.name",this.hass.language)}
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
              ${qt("panels.zones.labels.size",this.hass.language)}
              <span class="unit">(${Ts(this.config,Xi)})</span>
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
              ${qt("panels.zones.labels.throughput",this.hass.language)}
              <span class="unit"
                >(${Ts(this.config,Qi)})</span
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
              <ha-svg-icon slot="start" .path=${ea}></ha-svg-icon>
              ${this.isSaving?qt("common.saving-messages.adding",this.hass.language):qt("panels.zones.cards.add-zone.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${_a(this.zones,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderZone(e,t)))}

      <ha-card
        header="${qt("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(Vs,qt("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),(()=>this.handleCalculateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(ia,qt("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),(()=>this.handleUpdateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(Qs,qt("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),(()=>this.handleResetAllBuckets()),!1,this.isSaving)}
            ${this._actionBtn(qs,qt("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),(()=>this.handleClearAllWeatherdata()),!1,this.isSaving)}
          </div>
        </div>
      </ha-card>
    `:W``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return l`
      ${aa}

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
      /* One sentence per zone, and a colour that says the same thing. */
      .zone-status {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 16px 12px 16px;
        padding: 10px 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 0.95em;
      }

      .zone-status ha-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        flex: none;
      }

      .zone-status--watering {
        background: rgba(3, 169, 244, 0.12);
      }

      .zone-status--watering ha-icon {
        color: var(--primary-color);
      }

      .zone-status--idle ha-icon {
        color: var(--success-color, #43a047);
      }

      .zone-status-numbers {
        margin-left: auto;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        white-space: nowrap;
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

      /* One line under a setting, saying what the choice above it means. */
      .setting-help {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        padding: 6px 0 10px 0;
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
    `}};i([me()],Ea.prototype,"config",void 0),i([me({type:Array})],Ea.prototype,"zones",void 0),i([me({type:Array})],Ea.prototype,"modules",void 0),i([me({type:Array})],Ea.prototype,"mappings",void 0),i([me({type:Map})],Ea.prototype,"wateringCalendars",void 0),i([me({type:Map})],Ea.prototype,"weatherRecords",void 0),i([me({type:Boolean})],Ea.prototype,"isLoading",void 0),i([me({type:Boolean})],Ea.prototype,"isSaving",void 0),i([me({type:Boolean})],Ea.prototype,"isCreatingZone",void 0),i([ve("#nameInput")],Ea.prototype,"nameInput",void 0),i([ve("#sizeInput")],Ea.prototype,"sizeInput",void 0),i([ve("#throughputInput")],Ea.prototype,"throughputInput",void 0),Ea=i([ue("smart-irrigation-view-zones")],Ea);let Aa=class extends(Ws(de)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.moduleCache=new Map,this._expanded=new Set,this.debouncedSave=(()=>{let e=null;return t=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch((()=>{this._suppressNextConfigUpdate=!1})),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{const[e,t,i,s]=await Promise.all([Ds(this.hass),Ps(this.hass),Ls(this.hass),Us(this.hass)]);this.config=e,this.zones=t,this.modules=i,this.allmodules=s,this.moduleCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}}async handleAddModule(){var e,t;if((null===(t=null===(e=this.moduleInput)||void 0===e?void 0:e.selectedOptions)||void 0===t?void 0:t[0])&&!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.moduleInput.selectedOptions[0].text,t=this.allmodules.find((t=>t.name===e));if(!t)return;const i={name:e,description:t.description,config:t.config,schema:t.schema};this.modules=[...this.modules,i],this.moduleCache.clear(),this._scheduleUpdate(),await this.saveToHA(i),await this._fetchData()}catch(e){console.error("Error adding module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}async handleRemoveModule(e,t){if(!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.modules[t],a=null==e?void 0:e.id;this.modules;this.modules=this.modules.filter(((e,i)=>i!==t)),this.moduleCache.clear(),this._scheduleUpdate(),this.hass&&void 0!==a&&await(i=this.hass,s=a.toString(),i.callApi("POST",ei+"/modules",{id:s,remove:!0}))}catch(e){console.error("Error removing module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var i,s}}async saveToHA(e){if(this.hass)try{await Is(this.hass,e)}catch(e){throw console.error("Error saving module:",e),e}}renderModule(e,t){var i,s;if(!this.hass)return W``;const a=this.zones.filter((t=>t.module===e.id)).length,n=null!==(i=e.id)&&void 0!==i?i:t,r=this._expanded.has(n),o=e.description||(null===(s=this.allmodules.find((t=>t.name===e.name)))||void 0===s?void 0:s.description)||"",l=`module-${e.id||t}-${r?"open":"closed"}-${JSON.stringify(e)}`;if(this.moduleCache.has(l))return this.moduleCache.get(l);const h=W`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${r?"true":"false"}
          @click=${()=>this._toggleItem(n)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleItem(n))}}
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
            .path=${Gs}
          ></ha-svg-icon>
        </div>
        ${r?W` <div class="si-body">
              <div class="moduleconfig">
                <label class="subheader"
                  >${qt("panels.modules.cards.module.labels.configuration",this.hass.language)}
                  (*
                  ${qt("panels.modules.cards.module.labels.required",this.hass.language)})</label
                >
                <div class="settings">
                  ${e.schema?Object.entries(e.schema).filter((([,t])=>{var i;return!(null!==(i=e.idle_options)&&void 0!==i?i:[]).includes(null==t?void 0:t.name)})).map((([e])=>this.renderConfig(t,e))):null}
                </div>
              </div>
              ${a?W`<div class="weather-note">
                    ${qt("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}
                  </div>`:W`<div class="si-actions">
                    ${this._actionBtn(Ks,qt("common.actions.delete",this.hass.language),(e=>this.handleRemoveModule(e,t)),!0)}
                  </div>`}
            </div>`:""}
      </ha-card>
    `;return this.moduleCache.set(l,h),h}renderConfig(e,t){const i=Object.values(this.modules).at(e);if(!i||!this.hass)return;const s=i.schema[t],a=s.name,n=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(a);let r="";null==i.config&&(i.config=[]),a in i.config&&(r=i.config[a]);const o=s.required?`${n} *`:null!=n?n:"";if("boolean"==s.type)return W`
        <div class="setting-row">
          <div class="setting-label">${o}</div>
          <input
            type="checkbox"
            id="${a+e}"
            .checked=${r}
            @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t.target.checked})}))}"
          />
        </div>
      `;if("float"==s.type||"integer"==s.type)return this._numRow(o,"",i.config[a],(t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t})}))),1);if("string"==s.type)return this._textRow(o,"",r,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t})}))));if("select"==s.type){const t=this.hass.language,n=W`
        ${Object.entries(s.options).map((([e,i])=>W`<option
              value="${ks(i,0)}"
              ?selected="${r===ks(i,0)}"
            >
              ${qt("panels.modules.cards.module.translated-options."+ks(i,1),t)}
            </option>`))}
      `;return this._selectRow(o,n,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t.target.value})}))))}return W``}_textRow(e,t,i,s){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${a}
            ?readonly=${n}
            .value=${null==i?"":String(i)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>s(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Xs}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ea}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Js}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,i,s=!1,a=!1){return W`
      <ha-button
        appearance=${s?"accent":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}handleEditConfig(e,t){this.modules=Object.values(this.modules).map(((i,s)=>s===e?t:i)),this.moduleCache.clear(),this._scheduleUpdate(),this.debouncedSave(t)}renderOption(e,t){return this.hass?W`<option value="${e}>${t}</option>`:W``}render(){return this.hass?W`
      <ha-card header="${qt("panels.modules.title",this.hass.language)}">
        <div class="card-content">
          ${qt("panels.modules.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${qt("panels.modules.cards.add-module.header",this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading?W`<div class="loading-indicator">
                ${qt("common.loading-messages.general",this.hass.language)}
              </div>`:W`
                <div class="setting-row">
                  <div class="setting-label">
                    ${qt("common.labels.module",this.hass.language)}
                  </div>
                  <div class="select-wrap">
                    <select
                      id="moduleInput"
                      class="field"
                      ?disabled="${this.isSaving}"
                    >
                      ${Object.entries(this.allmodules).map((([e,t])=>W`<option value="${t.id}">
                            ${t.name}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Js}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${ea}></ha-svg-icon>
                    ${this.isSaving?qt("common.saving-messages.adding",this.hass.language):qt("panels.modules.cards.add-module.actions.add",this.hass.language)}
                  </ha-button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading?W`<div class="loading-indicator">
            ${qt("common.loading-messages.modules",this.hass.language)}
          </div>`:_a(this.modules,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderModule(e,t)))}
    `:W``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.moduleCache.clear()}static get styles(){return l`
      ${aa} ${la} /* View-specific styles only - most common styles are now in globalStyle */
    `}};i([me()],Aa.prototype,"config",void 0),i([me({type:Array})],Aa.prototype,"zones",void 0),i([me({type:Array})],Aa.prototype,"modules",void 0),i([me({type:Array})],Aa.prototype,"allmodules",void 0),i([me({type:Boolean})],Aa.prototype,"isLoading",void 0),i([me({type:Boolean})],Aa.prototype,"isSaving",void 0),i([ve("#moduleInput")],Aa.prototype,"moduleInput",void 0),Aa=i([ue("smart-irrigation-view-modules")],Aa);let Ha=class extends(Ws(de)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this._pendingMappings=new Map,this.globalDebounceTimer=null,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set,this.modules=[]}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}),this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([Ds(this.hass),Ps(this.hass),Bs(this.hass),Ls(this.hass)]);this.config=e,this.zones=t,this.mappings=i,this.modules=s,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(t){console.error("Error fetching data:",t),Es({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const t=await Ys(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for mapping ${e.id}:`,t),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return W``;const t=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return W`
      <div class="weather-records">
        <h4>
          ${qt("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?W`
              <div class="weather-note">
                ${qt("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:W`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${qt("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${qt("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>{let t="-",i="-";try{if(e.timestamp&&null!==e.timestamp){const i=Oa(e.timestamp);i.isValid()&&(t=i.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting timestamp:",e.timestamp,t)}try{if(e.retrieval_time&&null!==e.retrieval_time){const t=Oa(e.retrieval_time);t.isValid()&&(i=t.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting retrieval_time:",e.retrieval_time,t)}return W`
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
                      <span>${i}</span>
                    </div>
                  `}))}
              </div>
            `}
      </div>
    `}handleAddMapping(){var e;if(!this.mappingNameInput.value.trim())return;const t=!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service),i=e=>e===ui||e===yi||e===fi?t?Ci:Ti:t?Si:Ti,s=Object.fromEntries([ci,ui,pi,fi,_i,bi,yi,wi,$i].map((e=>[e,{[Di]:i(e),[Ni]:"",[Li]:""}]))),a={name:this.mappingNameInput.value.trim(),mappings:s};this.mappings=[...this.mappings,a],this.isSaving=!0,this.saveToHA(a).then((()=>(this.mappingNameInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleRemoveMapping(e,t){const i=this.mappings[t].id;if(null==i)return;const s=[...this.mappings];var a,n;(this.mappings=this.mappings.filter(((e,i)=>i!==t)),this.mappingCache.delete(i.toString()),this.hass)&&(this.isSaving=!0,(a=this.hass,n=i.toString(),a.callApi("POST",ei+"/mappings",{id:n,remove:!0})).catch((e=>{console.error("Failed to delete mapping:",e),this.mappings=s,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleEditMapping(e,t){this.mappings[e]=t,t.id&&this.mappingCache.delete(t.id.toString()),void 0!==t.id&&this._pendingMappings.set(t.id,t),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{const e=[...this._pendingMappings.values()];this._pendingMappings.clear(),this.isSaving=!0,this._suppressNextConfigUpdate=!0,Promise.all(e.map((e=>this.saveToHA(e)))).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}async saveToHA(e){var t;if(!this.hass)throw new Error("Home Assistant connection not available");const i=[],s=this.hass.states;for(const t in e.mappings){const a=e.mappings[t].sensorentity;if(a&&""!==a.trim()){const n=a.trim();e.mappings[t].sensorentity=n,n in s||i.push(n)}}if(i.length>0){const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");throw e&&Es({body:{message:qt("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+i.join(", ")},error:qt("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}const{id:a,name:n,mappings:r}=e;await js(this.hass,{id:a,name:n,mappings:r})}consumedSources(e){var t;if(void 0===e.module||null===e.module)return null;const i=this.modules.find((t=>t.id===e.module));return null!==(t=null==i?void 0:i.consumes)&&void 0!==t?t:null}renderMapping(e,t){if(!this.hass)return W``;const i=`${e.id}_${JSON.stringify(e).slice(0,100)}`;if(this.mappingCache.has(i))return this.mappingCache.get(i);const s=this.zones.filter((t=>t.mapping===e.id)).length,a=W`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${qt("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @change="${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i.target.value}))}"
            />
            <div class="setting-row">
              <div class="setting-label">
                ${qt("panels.mappings.cards.mapping.greenhouse",this.hass.language)}
              </div>
              <ha-switch
                .checked=${!!e.greenhouse}
                @change=${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:i.target.checked}))}
              ></ha-switch>
            </div>
            <div class="setting-row">
              <div class="setting-label">
                ${qt("panels.mappings.cards.mapping.module",this.hass.language)}
              </div>
              <select
                @change=${i=>{const s=i.target.value;this.handleEditMapping(t,Object.assign(Object.assign({},e),{[vi]:""===s?void 0:parseInt(s)}))}}
              >
                <option
                  value=""
                  ?selected=${void 0===e.module||null===e.module}
                >
                  ---${qt("common.labels.select",this.hass.language)}---
                </option>
                ${this.modules.map((t=>W`<option
                      value="${t.id}"
                      ?selected=${t.id===e.module}
                    >
                      ${Cs(t.name,this.hass.language)}
                    </option>`))}
              </select>
            </div>
            <div class="weather-note">
              ${qt(void 0===e.module||null===e.module?"panels.mappings.cards.mapping.module_undecided":"panels.mappings.cards.mapping.module_description",this.hass.language)}
            </div>
            ${e.greenhouse?W`<div class="weather-note">
                  ${qt("panels.mappings.cards.mapping.greenhouse_description",this.hass.language)}
                </div>`:""}
            ${Object.entries(e.mappings).filter((([t])=>!e.greenhouse||t!==fi&&t!==_i)).filter((([t])=>{const i=this.consumedSources(e);return null===i||i.includes(t)})).map((([e])=>this.renderMappingSetting(t,e)))}
            ${s?W`<div class="weather-note">
                  ${qt("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}
                </div>`:W` <div
                  class="action-button"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${Ks}" />
                  </svg>
                  <span class="action-button-label">
                    ${qt("common.actions.delete",this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;return this.mappingCache.set(i,a),a}renderMappingSetting(e,t){const i=this.mappings[e];if(!i||!this.hass)return W``;const s=i.mappings[t];return W`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${qt(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`,this.hass.language)}
        </div>
        ${this._selectRow(qt("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,t,s),(i=>this.handleSimpleSourceChange(e,t,i)))}
        ${this.renderMappingInputs(e,t,s)}
      </div>
    `}renderSimpleRadioOptions(e,t,i){if(!this.hass||!this.config)return W``;const s=t===ui||t===yi,a=i[Di],n=t===fi,r=!!this.config.use_weather_service&&!n,o=s||n,l=s&&this.config.weather_service!==xi;return W`
      ${r?W`<option
            value="${Si}"
            ?selected=${a===Si}
          >
            ${qt("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${l?" (via Open-Meteo)":""}
          </option>`:""}
      ${o?W`<option
            value="${Ci}"
            ?selected=${a===Ci}
          >
            ${qt("panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${Ti}"
        ?selected=${a===Ti}
      >
        ${qt("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      <option
        value="${Oi}"
        ?selected=${a===Oi}
      >
        ${qt("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
      ${t===yi?W`<option
            value="${Mi}"
            ?selected=${a===Mi}
          >
            ${qt("panels.mappings.cards.mapping.sources.illuminance",this.hass.language)}
          </option>`:""}
    `}handleSimpleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Di]:a,[Ni]:""})})}))}handleSimpleInputChange(e,t,i,s){const a=this.mappings[e],n=s.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},a),{mappings:Object.assign(Object.assign({},a.mappings),{[t]:Object.assign(Object.assign({},a.mappings[t]),{[i]:n})})}))}renderSourceOptions(e,t,i){var s;if(!this.hass)return W``;const a=`${t}_${e}`,n=t===ui||t===yi,r=!!(null===(s=this.config)||void 0===s?void 0:s.use_weather_service);return W`
      <div class="mappingsettingline">
        <label for="${a}_source">
          ${qt("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${r?this.renderWeatherServiceOption(e,t,i):""}
        ${n?this.renderNoneOption(e,t,i):""}
        ${this.renderSensorOption(e,t,i)}
        ${this.renderStaticValueOption(e,t,i)}
      </div>
    `}renderWeatherServiceOption(e,t,i){if(!this.hass||!this.config)return W``;const s=`${t}_${e}`,a=!this.config.use_weather_service,n=this.config.use_weather_service&&i[Di]===Si,r=(t===ui||t===yi)&&this.config.weather_service!==xi;return W`
      <label class="${a?"strikethrough":""}">
        <input
          type="radio"
          id="${s}_weather"
          value="${Si}"
          name="${s}_source"
          ?checked="${n}"
          ?disabled="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${qt("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${r?" (via Open-Meteo)":""}
      </label>
    `}renderNoneOption(e,t,i){if(!this.hass)return W``;const s=`${t}_${e}`,a=i[Di]===Ci;return W`
      <label>
        <input
          type="radio"
          id="${s}_none"
          value="${Ci}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${qt("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,t,i){if(!this.hass)return W``;const s=`${t}_${e}`,a=i[Di]===Ti;return W`
      <label>
        <input
          type="radio"
          id="${s}_sensor"
          value="${Ti}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${qt("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,t,i){if(!this.hass)return W``;const s=`${t}_${e}`,a=i[Di]===Oi;return W`
      <label>
        <input
          type="radio"
          id="${s}_static"
          value="${Oi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${qt("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Di]:a,[Ni]:""})})}))}renderMappingInputs(e,t,i){if(!this.hass)return W``;const s=i[Di];return W`
      ${s===Ti||s===Mi?this.renderSensorInput(e,t,i):""}
      ${s===Mi?this.renderLuminousEfficacyInput(e,t,i):""}
      ${s===Oi?this.renderStaticValueInput(e,t,i):""}
      ${s===Ti||s===Oi?this.renderUnitSelect(e,t,i):""}
      ${t!==bi||s!==Ti&&s!==Oi?"":this.renderPressureTypeSelect(e,t,i)}
      ${t===$i&&s===Ti?this.renderWindHeightInput(e,t,i):""}
      ${s===Ti||s===Mi?this.renderAggregateSelect(e,t,i):""}
    `}renderWindHeightInput(e,t,i){var s;return this.hass?this._numRow(qt("panels.mappings.cards.mapping.wind_height",this.hass.language),"m",null!==(s=i[Ei])&&void 0!==s?s:"",(i=>{const s=this.mappings[e],a=parseFloat(i);this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ei]:Number.isFinite(a)?a:null})})}))}),.5):W``}renderSensorInput(e,t,i){return this.hass?W`
      <div class="setting-row">
        <div class="setting-label">
          ${qt("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${i[Ni]||""}
          allow-custom-entity
          @value-changed=${i=>{var s;return this.handleSensorChange(e,t,{target:{value:(null===(s=i.detail)||void 0===s?void 0:s.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:W``}renderLuminousEfficacyInput(e,t,i){var s;return this.hass?this._numRow(qt("panels.mappings.cards.mapping.luminous_efficacy",this.hass.language),"lm/W",null!==(s=i[Ri])&&void 0!==s?s:110,(i=>this.handleLuminousEfficacyChange(e,t,{target:{value:i}})),1):W``}handleLuminousEfficacyChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ri]:parseFloat(i.target.value)})})}))}renderStaticValueInput(e,t,i){return this.hass?this._numRow(qt("panels.mappings.cards.mapping.static_value",this.hass.language),"",i[Pi]||"",(i=>this.handleStaticValueChange(e,t,{target:{value:i}})),.1):W``}renderUnitSelect(e,t,i){return this.hass&&this.config?this._selectRow(qt("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(t,i),(i=>this.handleUnitChange(e,t,i))):W``}renderPressureTypeSelect(e,t,i){return this.hass?this._selectRow(qt("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(t,i),(i=>this.handlePressureTypeChange(e,t,i))):W``}renderAggregateSelect(e,t,i){return this.hass?W`
      <div class="setting-row">
        <div class="setting-label">
          ${qt("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
          <span class="unit"
            >${qt("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",this.hass.language)}</span
          >
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${i=>this.handleAggregateChange(e,t,i)}"
          >
            ${this.renderAggregateOptionsForMapping(t,i)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Js}></path>
          </svg>
        </div>
      </div>
    `:W``}handleSensorChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ni]:i.target.value})})}))}handleStaticValueChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Pi]:i.target.value})})}))}handleUnitChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Li]:i.target.value})})}))}handlePressureTypeChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[zi]:i.target.value})})}))}handleAggregateChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ui]:i.target.value})})}))}renderAggregateOptionsForMapping(e,t){if(!this.hass||!this.config)return W``;let i="average";return e===fi&&(i="delta"),e===_i&&(i="average"),t[Ui]&&(i=t[Ui]),W`
      ${Ii.map((e=>this.renderAggregateOption(e,i)))}
    `}renderAggregateOption(e,t){if(this.hass&&this.config){return W`<option value="${e}" ?selected="${e===t}">
        ${qt("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return W``}renderPressureTypes(e,t){if(this.hass&&this.config){let e=W``;const i=t[zi];return e=W`${e}
        <option
          value="${Ai}"
          ?selected="${i===Ai}"
        >
          ${qt("panels.mappings.cards.mapping.pressure_types."+Ai,this.hass.language)}
        </option>
        <option
          value="${Hi}"
          ?selected="${i===Hi}"
        >
          ${qt("panels.mappings.cards.mapping.pressure_types."+Hi,this.hass.language)}
        </option>`,e}return W``}renderUnitOptionsForMapping(e,t){if(!this.hass||!this.config)return W``;const i=function(e){switch(e){case ci:case wi:return[{unit:Fi,system:di},{unit:"°F",system:hi}];case fi:case ui:return[{unit:Wi,system:di},{unit:Vi,system:hi}];case _i:return[{unit:qi,system:di},{unit:Ki,system:hi}];case pi:return[{unit:"%",system:[di,hi]}];case bi:return[{unit:"millibar",system:di},{unit:"hPa",system:di},{unit:"psi",system:hi},{unit:"inch Hg",system:hi}];case $i:return[{unit:"km/h",system:di},{unit:Gi,system:di},{unit:"mile/h",system:hi},{unit:"knot",system:[di,hi]}];case yi:return[{unit:"W/m2",system:di},{unit:Zi,system:di},{unit:"W/sq ft",system:hi},{unit:"MJ/day/sq ft",system:hi}];default:return[]}}(e);let s=t[Li];const a=this.config.units;if(!t[Li])for(const e of i)if("string"==typeof e.system){if(a===e.system){s=e.unit;break}}else{for(const t of e.system)if(a===t.system){s=e.unit;break}if(s===e.unit)break}return W`
      ${i.map((e=>W`
          <option value="${e.unit}" ?selected="${s===e.unit}">
            ${e.unit}
          </option>
        `))}
    `}_textRow(e,t,i,s){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${a}
            ?readonly=${n}
            .value=${null==i?"":String(i)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>s(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Xs}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ea}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Js}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,i,s=!1,a=!1){return W`
      <ha-button
        appearance=${s?"accent":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}render(){return this.hass?this.isLoading?W`
        <ha-card
          header="${qt("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${qt("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:W`
      <ha-card
        header="${qt("panels.mappings.title",this.hass.language)}"
      >
        <div class="card-content">
          ${qt("panels.mappings.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${qt("panels.mappings.cards.add-mapping.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.mappings.labels.mapping-name",this.hass.language)}
            </div>
            <input id="mappingNameInput" class="field" type="text" />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${ea}></ha-svg-icon>
              ${this.isSaving?qt("common.saving-messages.adding",this.hass.language):qt("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `:W``}renderMappingsList(){const e=this.mappings.slice(0,Math.min(this.mappings.length,10)),t=this.mappings.slice(10);return W`
      ${_a(e,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderMappingCard(e,t)))}
      ${t.length>0?W`
            <div class="si-form-actions">
              ${this._actionBtn(ea,`Load ${t.length} more mappings...`,(()=>this.loadMoreMappings()))}
            </div>
          `:""}
    `}renderMappingCard(e,t){if(!this.hass)return W``;const i=this.hass.language,s=this.zones.filter((t=>t.mapping===e.id)).length,a=(e,t)=>qt(`panels.mappings.summary.${t}-${1===e?"one":"other"}`,i).replace("{n}",String(e)),n=[a(Object.values(e.mappings||{}).filter((e=>{const t="string"==typeof e?e:null==e?void 0:e.source;return!!t&&t!==Ci})).length,"sources")];s&&n.push(a(s,"zones"));const r=n.join(" · "),o=null!=e.id&&this._expanded.has(e.id);return W`
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
            .path=${Gs}
          ></ha-svg-icon>
        </div>
        ${o?W`<div class="si-body">
              <div class="settings">
                ${this._textRow(qt("panels.mappings.labels.mapping-name",i),"",e.name,(i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i}))))}
                ${this.renderMappingSettings(e,t)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${s?W`<div class="weather-note">
                      ${qt("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",i)}
                    </div>`:this._actionBtn(Ks,qt("common.actions.delete",i),(e=>this.handleRemoveMapping(e,t)),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}renderMappingSettings(e,t){const i=Object.entries(e.mappings);return W`
      ${i.map((([e])=>this.renderMappingSetting(t,e)))}
    `}loadMoreMappings(){this._scheduleUpdate()}static get styles(){return l`
      ${aa} ${la}

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
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach((e=>{clearTimeout(e)})),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};i([me()],Ha.prototype,"config",void 0),i([me({type:Array})],Ha.prototype,"zones",void 0),i([me({type:Array})],Ha.prototype,"mappings",void 0),i([me({type:Map})],Ha.prototype,"weatherRecords",void 0),i([me({type:Boolean})],Ha.prototype,"isLoading",void 0),i([me({type:Boolean})],Ha.prototype,"isSaving",void 0),i([me({type:Array})],Ha.prototype,"modules",void 0),i([ve("#mappingNameInput")],Ha.prototype,"mappingNameInput",void 0),Ha=i([ue("smart-irrigation-view-mappings")],Ha);const Ca={[wi]:{unit:Fi,decimals:1},[mi]:{unit:Fi,decimals:1},[gi]:{unit:Fi,decimals:1},[ci]:{unit:Fi,decimals:1},[pi]:{unit:"%",decimals:0},[bi]:{unit:"hPa",decimals:0},[$i]:{unit:Gi,decimals:1},[yi]:{unit:Zi,decimals:2},[fi]:{unit:Wi,decimals:2},[_i]:{unit:qi,decimals:2},[ui]:{unit:Wi,decimals:2}};let Da=class extends de{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1,this._historyLoading=!1,this._historyError=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)})),this._load()}async _load(){if(this.hass){try{const e=await Ns(this.hass);this._info=e,this._use=!!e.use_weather_service,this._service=e.weather_service||(e.services&&e.services.includes(xi)?xi:e.services&&e.services.length?e.services[0]:null),this._apiKey=e.weather_service_api_key||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}this._loadHistory()}}async _loadHistory(){if(this.hass){this._historyLoading=!0;try{this._history=await((e,t=20)=>e.callWS({type:ei+"/weatherservice_history",limit:t}))(this.hass,20),this._historyError=""}catch(e){this._historyError=this._errText(e)}finally{this._historyLoading=!1}}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1;try{await(e=this.hass,t={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null},e.callWS(Object.assign({type:ei+"/set_weatherservice"},t))),this._saved=!0,window.setTimeout((()=>this._load()),800)}catch(e){this._error=this._errText(e)}finally{this._saving=!1}var e,t}}render(){var e;if(!this.hass)return W``;const t=this.hass.language;return this._loading&&!this._info?W`
        <ha-card header="${qt("panels.weatherservice.title",t)}">
          <div class="card-content">
            ${qt("common.loading-messages.general",t)}...
          </div>
        </ha-card>
      `:W`
      <ha-card header="${qt("panels.weatherservice.title",t)}">
        <div class="card-content ws-description">
          ${qt("panels.weatherservice.description",t)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${qt("panels.weatherservice.labels.use-weather-service",t)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?W`
                <div class="setting-row">
                  <div class="setting-label">
                    ${qt("panels.weatherservice.labels.service",t)}
                  </div>
                  <div class="select-wrap">
                    <select
                      class="field"
                      @change=${e=>{this._service=e.target.value,this._saved=!1}}
                    >
                      ${((null===(e=this._info)||void 0===e?void 0:e.services)||[]).map((e=>W`<option
                            value="${e}"
                            ?selected=${this._service===e}
                          >
                            ${e}
                          </option>`))}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Js}></path>
                    </svg>
                  </div>
                </div>
                ${this._service&&ki.includes(this._service)?"":W`<div class="setting-row">
                      <div class="setting-label">
                        ${qt("panels.weatherservice.labels.api-key",t)}
                      </div>
                      <input
                        class="field"
                        type="text"
                        autocomplete="off"
                        .value=${this._apiKey}
                        @change=${e=>{this._apiKey=e.target.value,this._saved=!1}}
                      />
                    </div>`}
                ${"Open Weather Map"===this._service?W`<div class="ws-note ws-note--hint">
                      ${qt("panels.weatherservice.messages.owm-onecall-hint",t)}
                    </div>`:""}
              `:W`<div class="ws-note">
                ${qt("panels.weatherservice.messages.no-service",t)}
              </div>`}
          ${this._error?W`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?W`<div class="ws-msg ws-msg--success">
                ${qt("panels.weatherservice.messages.saved",t)}
              </div>`:""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?qt("panels.weatherservice.actions.saving",t):qt("panels.weatherservice.actions.save",t)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${qt("panels.weatherservice.messages.reload-note",t)}
          </div>
        </div>
        ${this._renderHistory(t)}
      </ha-card>
    `}_renderHistory(e){var t,i;const s=(null===(t=this._history)||void 0===t?void 0:t.records)||[],a=((null===(i=this._history)||void 0===i?void 0:i.fields)||[]).filter((e=>s.some((t=>t.values&&void 0!==t.values[e]&&null!==t.values[e])))),n=new Set(s.map((e=>e.mapping_name))).size>1,r=["minmax(120px, auto)",...n?["minmax(100px, auto)"]:[],...a.map((()=>"minmax(76px, 1fr)"))].join(" "),o=s.length?this._formatTime(s[0]):"";return W`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <h4>${qt("panels.weatherservice.history.title",e)}</h4>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${ta}></ha-svg-icon>
            ${qt("panels.weatherservice.history.refresh",e)}
          </ha-button>
        </div>
        ${o?W`<div class="ws-note ws-history-last">
              ${qt("panels.weatherservice.history.last-update",e)}:
              ${o}
            </div>`:""}
        ${this._historyError?W`<div class="ws-msg ws-msg--error">${this._historyError}</div>`:0===s.length?W`<div class="ws-note">
                ${this._historyLoading?qt("common.loading-messages.general",e)+"...":qt("panels.weatherservice.history.no-data",e)}
              </div>`:W`
                <div class="ws-history-scroll">
                  <div
                    class="weather-table"
                    style="grid-template-columns: ${r};"
                  >
                    <div class="weather-header">
                      <span
                        >${qt("panels.weatherservice.history.time",e)}</span
                      >
                      ${n?W`<span
                            >${qt("panels.weatherservice.history.sensor-group",e)}</span
                          >`:""}
                      ${a.map((t=>{var i;return W`<span
                            >${qt("panels.mappings.cards.mapping.items."+t.toLowerCase(),e)}
                            <span class="ws-history-unit"
                              >${(null===(i=Ca[t])||void 0===i?void 0:i.unit)||""}</span
                            ></span
                          >`}))}
                    </div>
                    ${s.map((e=>W`
                        <div class="weather-row">
                          <span>${this._formatTime(e)}</span>
                          ${n?W`<span>${e.mapping_name||"-"}</span>`:""}
                          ${a.map((t=>{var i;return W`<span
                                >${this._formatValue(t,null===(i=e.values)||void 0===i?void 0:i[t])}</span
                              >`}))}
                        </div>
                      `))}
                  </div>
                </div>
              `}
      </div>
    `}_formatTime(e){if(!e.retrieved)return"-";const t=Oa(e.retrieved);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}_formatValue(e,t){var i,s;return null==t||isNaN(t)?"-":t.toFixed(null!==(s=null===(i=Ca[e])||void 0===i?void 0:i.decimals)&&void 0!==s?s:1)}static get styles(){return l`
      ${aa} ${la}

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
      .ws-history {
        border-top: 1px solid var(--divider-color);
      }
      .ws-history-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ws-history-head h4 {
        margin: 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .ws-history-last {
        margin-top: 0;
        margin-bottom: 8px;
      }
      /* The table grows a column per weather value, so let it scroll sideways
         instead of squeezing the panel on a phone. */
      .ws-history-scroll {
        overflow-x: auto;
      }
      .ws-history-scroll .weather-table {
        min-width: 100%;
        width: max-content;
      }
      /* The unit is a span inside the header cell, so the global
         ".weather-header span" rule drew a second, narrower underline under it
         (#870). Only the cell itself is underlined. */
      .weather-header .ws-history-unit {
        display: block;
        padding: 0;
        background: none;
        border-bottom: none;
        font-weight: 400;
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
    `}};i([me()],Da.prototype,"narrow",void 0),i([me()],Da.prototype,"path",void 0),i([fe()],Da.prototype,"_info",void 0),i([fe()],Da.prototype,"_use",void 0),i([fe()],Da.prototype,"_service",void 0),i([fe()],Da.prototype,"_apiKey",void 0),i([fe()],Da.prototype,"_loading",void 0),i([fe()],Da.prototype,"_saving",void 0),i([fe()],Da.prototype,"_error",void 0),i([fe()],Da.prototype,"_saved",void 0),i([fe()],Da.prototype,"_history",void 0),i([fe()],Da.prototype,"_historyLoading",void 0),i([fe()],Da.prototype,"_historyError",void 0),Da=i([ue("smart-irrigation-view-weatherservice")],Da);const Na=10,Pa=8,Ra=26,La=46;let Ua=class extends(Ws(de)){constructor(){super(...arguments),this._records=[],this._loading=!0,this._error=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial history:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to refresh history:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){if(this.hass)try{const[e,t]=await Promise.all([Ds(this.hass),Fs(this.hass,500)]);this._config=e,this._records=(null==t?void 0:t.records)||[],this._error=""}catch(e){this._error=(null==e?void 0:e.message)||(null==e?void 0:e.code)||String(e)}finally{this._loading=!1}}_chartDays(){const e=Oa().startOf("day").subtract(29,"days"),t=[];for(let i=0;i<30;i++)t.push(e.clone().add(i,"days").format("YYYY-MM-DD"));return t}_daily(e,t){const i=new Map(e.map((e=>[e,0])));for(const e of this._records){if(!e.start||t&&!t(e))continue;const s=Oa(e.start);if(!s.isValid())continue;const a=s.format("YYYY-MM-DD");i.has(a)&&i.set(a,i.get(a)+Ms(e.water_used,this._config))}return e.map((e=>({key:e,value:i.get(e)})))}_chartedZones(e){const t=e[0],i=new Map;for(const e of this._records){if(!e.start)continue;const s=Oa(e.start);if(!s.isValid()||s.format("YYYY-MM-DD")<t)continue;const a=null!==e.zone_id?`#${e.zone_id}`:e.zone_name||"?";i.has(a)||i.set(a,{id:e.zone_id,name:e.zone_name||a})}return[...i.values()].sort(((e,t)=>e.name.localeCompare(t.name)))}render(){if(!this.hass)return W``;const e=this.hass.language;if(this._loading)return W`
        <ha-card header="${qt("panels.history.title",e)}">
          <div class="card-content">
            ${qt("common.loading-messages.general",e)}...
          </div>
        </ha-card>
      `;const t=this._chartDays(),i=this._chartedZones(t);return W`
      <ha-card header="${qt("panels.history.title",e)}">
        <div class="card-content">
          <div class="history-intro">
            ${qt("panels.history.description",e)}
          </div>
          ${this._error?W`<div class="history-msg history-msg--error">
                ${this._error}
              </div>`:""}
          <div class="history-actions">
            <ha-button appearance="plain" @click=${()=>this._fetchData()}>
              <ha-svg-icon slot="start" .path=${ta}></ha-svg-icon>
              ${qt("panels.history.refresh",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <!-- The config carries the unit system, so without it the volumes would
           be unlabelled: show the error above on its own instead. -->
      ${this._config?W`${this._renderTable(e)} ${this._renderTotalChart(e,t)}
          ${this._renderZoneCharts(e,t,i)}`:""}
    `}_renderTable(e){const t=this._records.slice(0,100),i=Ts(this._config,is);return W`
      <ha-card header="${qt("panels.history.table.title",e)}">
        <div class="card-content">
          ${0===t.length?W`<div class="history-note">
                ${qt("panels.history.no-data",e)}
              </div>`:W`
                <div class="history-scroll">
                  <div class="history-table">
                    <div class="history-header">
                      <span
                        >${qt("panels.history.table.start",e)}</span
                      >
                      <span
                        >${qt("panels.history.table.zone",e)}</span
                      >
                      <span
                        >${qt("panels.history.table.duration",e)}</span
                      >
                      <span
                        >${qt("panels.history.table.water",e)}
                        <span class="history-unit">(${i})</span></span
                      >
                    </div>
                    ${t.map((e=>W`
                        <div class="history-row">
                          <span>${this._formatStart(e.start)}</span>
                          <span>${e.zone_name||"-"}</span>
                          <span>${Os(e.duration)}</span>
                          <span
                            >${Ms(e.water_used,this._config).toFixed(1)}</span
                          >
                        </div>
                      `))}
                  </div>
                </div>
                ${this._records.length>100?W`<div class="history-note">
                      ${qt("panels.history.table.truncated",e,"{count}",100,"{total}",this._records.length)}
                    </div>`:""}
              `}
        </div>
      </ha-card>
    `}_renderTotalChart(e,t){const i=this._daily(t);return W`
      <ha-card header="${qt("panels.history.charts.total-title",e)}">
        <div class="card-content">${this._renderChart(i,e)}</div>
      </ha-card>
    `}_renderZoneCharts(e,t,i){return 0===i.length?W``:W`
      <ha-card
        header="${qt("panels.history.charts.per-zone-title",e)}"
      >
        <div class="card-content">
          ${i.map((i=>{const s=this._daily(t,(e=>null!==i.id?e.zone_id===i.id:e.zone_name===i.name));return W`
              <div class="zone-chart">
                <h4>${i.name}</h4>
                ${this._renderChart(s,e)}
              </div>
            `}))}
        </div>
      </ha-card>
    `}_renderChart(e,t){const i=Ts(this._config,is),s=Math.max(...e.map((e=>e.value)),0);if(s<=0)return W`<div class="history-note">
        ${qt("panels.history.charts.no-data",t)}
      </div>`;const a=this._niceMax(s),n=200-Na-Ra,r=Na+n,o=(720-La-Pa)/e.length,l=Math.max(o-3,1),h=[0,.5,1].map((e=>{const t=r-e*n;return V`
        <line
          class="grid"
          x1=${La}
          y1=${t}
          x2=${720-Pa}
          y2=${t}
        ></line>
        <text class="axis" x=${La-6} y=${t+3.5} text-anchor="end">
          ${this._formatAxis(a*e)}
        </text>
      `})),d=e.map(((e,t)=>{const i=e.value/a*n;return V`
        <rect
          class="bar"
          x=${La+t*o+(o-l)/2}
          y=${r-i}
          width=${l}
          height=${i}
          rx="1"
        >
          <title>
            ${Ss(e.key,this.hass,{dateStyle:"long"})}: ${e.value.toFixed(1)}
          </title>
        </rect>
      `})),c=e.map(((t,i)=>i%5!=0&&i!==e.length-1?V``:V`
        <text
          class="axis"
          x=${La+i*o+o/2}
          y=${192}
          text-anchor="middle"
        >
          ${Ss(t.key,this.hass,{day:"numeric",month:"short"})}
        </text>
      `));return W`
      <div class="chart-unit">${i}</div>
      <svg
        class="chart"
        viewBox="0 0 ${720} ${200}"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        ${h} ${d} ${c}
      </svg>
    `}_niceMax(e){const t=Math.pow(10,Math.floor(Math.log10(e))),i=e/t;return(i<=1?1:i<=2?2:i<=5?5:10)*t}_formatAxis(e){return e>=100?e.toFixed(0):e.toFixed(1)}_formatStart(e){if(!e)return"-";const t=Oa(e);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}static get styles(){return l`
      ${aa} ${la}

      .history-intro {
        color: var(--primary-text-color);
        line-height: 1.4;
      }
      .history-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }
      .history-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 8px;
      }
      .history-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .history-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }

      /* The table keeps four columns on any width by scrolling sideways. */
      .history-scroll {
        overflow-x: auto;
      }
      .history-table {
        display: grid;
        grid-template-columns:
          minmax(130px, auto) minmax(110px, 1fr)
          minmax(90px, auto) minmax(80px, auto);
        gap: 8px;
        font-size: 0.85em;
        min-width: 100%;
        width: max-content;
      }
      .history-header {
        display: contents;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .history-header span {
        padding: 4px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--primary-color);
      }
      .history-row {
        display: contents;
        color: var(--secondary-text-color);
      }
      .history-row span {
        padding: 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      .history-unit {
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .zone-chart + .zone-chart {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .zone-chart h4 {
        margin: 0 0 4px 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .chart-unit {
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
      .chart {
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .chart .bar {
        fill: var(--primary-color);
      }
      .chart .grid {
        stroke: var(--divider-color);
        stroke-width: 1;
      }
      .chart .axis {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
    `}};i([me()],Ua.prototype,"narrow",void 0),i([me()],Ua.prototype,"path",void 0),i([fe()],Ua.prototype,"_config",void 0),i([fe()],Ua.prototype,"_records",void 0),i([fe()],Ua.prototype,"_loading",void 0),i([fe()],Ua.prototype,"_error",void 0),Ua=i([ue("smart-irrigation-view-history")],Ua);let Ia=class extends de{constructor(){super(...arguments),this._busy=!1,this._error="",this._message="",this._pendingName=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}_reset(){this._error="",this._message="",this._pending=void 0,this._pendingName=""}async _export(){if(this.hass){this._reset(),this._busy=!0;try{const t=await(e=this.hass,e.callApi("GET",ei+"/export")),i=JSON.stringify(t,null,2),s=new Blob([i],{type:"application/json"}),a=URL.createObjectURL(s),n=document.createElement("a");n.href=a;const r=(new Date).toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");n.download=`smart_irrigation_backup_${r}.json`,n.click(),URL.revokeObjectURL(a),this._message=qt("panels.backuprestore.messages.exported",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e}}async _onFile(e){this._reset();const t=e.target,i=t.files&&t.files[0];if(i)try{const e=await i.text(),t=JSON.parse(e);if(!t||"object"!=typeof t||!t.config)throw new Error(qt("panels.backuprestore.messages.invalid-file",this.hass.language));this._pending=t,this._pendingName=i.name}catch(e){this._error=this._errText(e)}finally{t.value=""}}async _restore(){if(this.hass&&this._pending){this._busy=!0,this._error="",this._message="";try{const i=await(e=this.hass,t=this._pending,e.callApi("POST",ei+"/restore",t));if(i&&!1===i.success)throw new Error(i.error||"restore failed");this._pending=void 0,this._pendingName="",this._message=qt("panels.backuprestore.messages.restored",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e,t}}_count(e){const t=this._pending&&this._pending[e];return Array.isArray(t)?t.length:0}render(){if(!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${qt("panels.backuprestore.title",e)}">
        <div class="card-content br-description">
          ${qt("panels.backuprestore.description",e)}
        </div>
      </ha-card>

      <ha-card
        header="${qt("panels.backuprestore.cards.backup.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${qt("panels.backuprestore.cards.backup.description",e)}
          </div>
          ${this._message?W`<div class="br-msg br-msg--success">${this._message}</div>`:""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"}></ha-svg-icon>
              ${qt("panels.backuprestore.actions.export",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${qt("panels.backuprestore.cards.restore.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${qt("panels.backuprestore.cards.restore.description",e)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${sa}></ha-svg-icon>
            ${qt("panels.backuprestore.actions.choose-file",e)}
          </label>

          ${this._pending?W`
                <div class="br-warning">
                  <ha-svg-icon .path=${"M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${qt("panels.backuprestore.messages.confirm-title",e)}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${qt("panels.backuprestore.messages.summary",e)}:
                      ${this._count("zones")}
                      ${qt("panels.zones.title",e)} ·
                      ${this._count("modules")}
                      ${qt("panels.modules.title",e)} ·
                      ${this._count("mappings")}
                      ${qt("panels.mappings.title",e)}
                    </div>
                    <div class="br-warning-text">
                      ${qt("panels.backuprestore.messages.confirm-warning",e)}
                    </div>
                  </div>
                </div>
              `:""}
          ${this._error?W`<div class="br-msg br-msg--error">${this._error}</div>`:""}
          ${this._pending?W`<div class="br-actions">
                <ha-button
                  appearance="filled"
                  variant="danger"
                  ?disabled=${this._busy}
                  @click=${this._restore}
                >
                  <ha-svg-icon slot="start" .path=${sa}></ha-svg-icon>
                  ${this._busy?qt("panels.backuprestore.actions.restoring",e):qt("panels.backuprestore.actions.restore",e)}
                </ha-button>
              </div>`:""}
          <div class="br-note">
            ${qt("panels.backuprestore.messages.reload-note",e)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${aa} ${la}

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
    `}};i([me()],Ia.prototype,"narrow",void 0),i([me()],Ia.prototype,"path",void 0),i([fe()],Ia.prototype,"_busy",void 0),i([fe()],Ia.prototype,"_error",void 0),i([fe()],Ia.prototype,"_message",void 0),i([fe()],Ia.prototype,"_pending",void 0),i([fe()],Ia.prototype,"_pendingName",void 0),Ia=i([ue("smart-irrigation-view-backuprestore")],Ia);let Ba=class extends(Ws(de)){constructor(){super(...arguments),this.zones=[],this.isLoading=!0,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:ei+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[t,i,s]=await Promise.all([Ds(this.hass),(e=this.hass,e.callWS({type:ei+"/info"})),Ps(this.hass)]);this.config=t,this.info=i,this.zones=s}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._scheduleUpdate()}}get _lang(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e,...t){return qt(`panels.info.${e}`,this._lang,...t)}formatDuration(e){const t=Math.max(0,Math.round(null!=e?e:0)),i=qt("common.units.hours",this._lang),s=qt("common.units.minutes",this._lang),a=qt("common.units.seconds",this._lang);if(t<60)return`${t} ${a}`;if(t<3600)return`${Math.round(t/60)} ${s}`;const n=Math.floor(t/3600),r=Math.round(t%3600/60);return r?`${n} ${i} ${r} ${s}`:`${n} ${i}`}render(){return this.hass?this.isLoading?W`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${qt("common.loading",this._lang)}...
          </div>
        </ha-card>
      `:this.config?W`
      <ha-card header="${this.t("title")}">
        <div class="card-content">${this.t("description")}</div>
      </ha-card>

      ${this.renderPostpone()} ${this.renderDeliveryGap()}
      ${this.renderStaleZones()} ${this.renderNextRun()}
      ${this.renderForecast()} ${this.renderDecision()}
      ${this.renderEstimates()}
    `:W`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${this.t("configuration-not-available")}
          </div>
        </ha-card>
      `:W``}renderPostpone(){var e,t,i;const s=null===(i=null===(t=null===(e=this.info)||void 0===e?void 0:e.skip_preview)||void 0===t?void 0:t.checks)||void 0===i?void 0:i.find((e=>"postponed"===e.id&&e.skip));return W`
      <ha-card>
        <div class="card-content postpone">
          ${s?W`
                <ha-icon icon="mdi:pause-circle-outline"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.until")}
                  ${Ss(s.until,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </span>
                <ha-button @click=${()=>this.resumeIrrigation()}>
                  ${this.t("cards.postpone.resume")}
                </ha-button>
              `:W`
                <ha-icon icon="mdi:weather-pouring"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.prompt")}
                </span>
                <ha-button @click=${()=>this.postponeIrrigation(24)}>
                  ${this.t("cards.postpone.for-24")}
                </ha-button>
                <ha-button @click=${()=>this.postponeIrrigation(48)}>
                  ${this.t("cards.postpone.for-48")}
                </ha-button>
              `}
        </div>
      </ha-card>
    `}async postponeIrrigation(e){await this.hass.callService("smart_irrigation","postpone_irrigation",{hours:e}),await this._fetchData()}async resumeIrrigation(){await this.hass.callService("smart_irrigation","resume_irrigation",{}),await this._fetchData()}renderForecast(){var e,t,i,s,a;const n=null!==(t=null===(e=this.info)||void 0===e?void 0:e.forecast)&&void 0!==t?t:[];if(!n.length)return"";const r="mi"!==(null===(a=null===(s=null===(i=this.hass)||void 0===i?void 0:i.config)||void 0===s?void 0:s.unit_system)||void 0===a?void 0:a.length),o=e=>null==e?"—":r?`${Math.round(e)}°`:`${Math.round(1.8*e+32)}°`;return W`
      <ha-card>
        <div class="card-content forecast">
          ${n.map(((e,t)=>{var i;const s=(null!==(i=e.precipitation)&&void 0!==i?i:0)>0;return W`
              <div class="forecast-day">
                <div class="forecast-name">
                  ${0===t?this.t("cards.forecast.today"):Ss(e.date,this.hass,{weekday:"short"})}
                </div>
                <ha-icon
                  icon=${s?"mdi:weather-rainy":"mdi:weather-sunny"}
                  class=${s?"wet":"dry"}
                ></ha-icon>
                <div class="forecast-temps">
                  <span class="forecast-max">${o(e.temp_max)}</span>
                  <span class="forecast-min">${o(e.temp_min)}</span>
                </div>
                <div class="forecast-rain">${a=e.precipitation,null==a||a<=0?"":r?`${a.toFixed(1)} mm`:`${(a/25.4).toFixed(2)} in`}</div>
              </div>
            `;var a}))}
        </div>
      </ha-card>
    `}renderDeliveryGap(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.delivery_gap;return t?W`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:water-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t(`gaps.${t}.title`)}</div>
            <div class="info-note">${this.t(`gaps.${t}.body`)}</div>
          </div>
        </div>
      </ha-card>
    `:""}renderStaleZones(){var e,t;const i=null!==(t=null===(e=this.info)||void 0===e?void 0:e.stale_zones)&&void 0!==t?t:[];return i.length?W`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:clock-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t("cards.stale.title")}</div>
            <div class="info-note">${this.t("cards.stale.body")}</div>
            ${i.map((e=>W`
                <div class="info-note">
                  <b>${e.zone}</b>:
                  ${e.last_calculated?Ss(e.last_calculated,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.stale.never")}
                </div>
              `))}
          </div>
        </div>
      </ha-card>
    `:""}renderNextRun(){var e,t,i,s,a,n,r;const o=this.info,l=null!==(e=null==o?void 0:o.next_irrigation_zones)&&void 0!==e?e:[],h=null!==(t=null==o?void 0:o.next_irrigation_duration)&&void 0!==t?t:0,d=null===(s=null===(i=null==o?void 0:o.skip_preview)||void 0===i?void 0:i.checks)||void 0===s?void 0:s.find((e=>"postponed"===e.id&&e.skip)),c=(null===(a=null==o?void 0:o.skip_preview)||void 0===a?void 0:a.should_skip)?null===(n=null==o?void 0:o.skip_preview)||void 0===n?void 0:n.reason:null,u=(null==o?void 0:o.next_irrigation_start)?Ss(o.next_irrigation_start,this.hass,{weekday:"long",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):null;let p="mdi:water-off-outline",g=this.t("cards.next-run.headline-nothing"),m=u?this.t("cards.next-run.sub-nothing","{start}",u):this.t("cards.next-run.no-start");d?(p="mdi:pause-circle-outline",g=this.t("cards.next-run.headline-postponed"),m=this.t("cards.next-run.sub-postponed")):c&&"postponed"!==c?(p="mdi:calendar-remove-outline",g=this.t("cards.next-run.headline-skipped"),m=this.t(`cards.decision.check-${c}`)):l.length&&h>0&&(p="mdi:water-outline",g=u?this.t("cards.next-run.headline-watering","{start}",u):this.t("cards.next-run.headline-watering-soon"),m=this.t("cards.next-run.sub-watering","{count}",String(l.length),"{duration}",this.formatDuration(h)));return!(!1!==(null==o?void 0:o.start_trigger_armed))&&!d&&!c&&l.length&&h>0&&(p="mdi:calendar-alert",g=this.t("cards.next-run.headline-not-scheduled"),m=this.t("cards.next-run.sub-not-scheduled")),W`
      <ha-card>
        <div class="card-content hero">
          <ha-icon icon=${p}></ha-icon>
          <div class="hero-text">
            <div class="hero-headline">${g}</div>
            <div class="hero-sub">${m}</div>
          </div>
        </div>
        <div class="card-content hero-detail">
          <span>
            ${this.t("cards.next-run.labels.trigger")}:
            ${null!==(r=null==o?void 0:o.trigger_name)&&void 0!==r?r:this.t("cards.next-run.trigger-default")}
            ${(null==o?void 0:o.trigger_accounts_for_duration)?`(${this.t("cards.next-run.accounts-for-duration")})`:""}
          </span>
          ${l.length?W`<span
                >${this.t("cards.next-run.labels.zones")}:
                ${l.join(", ")}</span
              >`:""}
          ${(null==o?void 0:o.zone_sequencing)?W`<span
                >${this.t(`cards.next-run.sequencing-${o.zone_sequencing}`)}</span
              >`:""}
        </div>
      </ha-card>
    `}renderDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.skip_preview;return W`
      <ha-card header="${this.t("cards.decision.title")}">
        <div class="card-content">
          ${t?W`
                <div class="verdict ${t.should_skip?"skip":"run"}">
                  ${t.should_skip?this.t("cards.decision.will-skip"):this.t("cards.decision.will-run")}
                </div>
                ${t.checks.map((e=>this.renderCheck(e)))}
                <div class="info-note">
                  ${this.t("cards.decision.preview-note")}
                </div>
              `:W`<div class="info-note">
                ${this.t("cards.decision.unavailable")}
              </div>`}
          ${this.renderLastDecision()}
        </div>
      </ha-card>
    `}renderCheck(e){let t="passing";return e.enabled?e.available?e.skip&&(t="blocking"):t="unavailable":t="off",W`
      <div class="check">
        <div class="check-head">
          <span class="check-name"
            >${this.t(`cards.decision.check-${e.id}`)}</span
          >
          <span class="chip ${t}"
            >${this.t(`cards.decision.state-${t}`)}</span
          >
        </div>
        ${e.enabled&&e.available?W`<div class="check-detail">
              ${this.renderCheckNumbers(e)}
            </div>`:""}
      </div>
    `}renderCheckNumbers(e){var t,i,s,a,n,r,o,l,h,d;if("precipitation"===e.id)return W`
        <span
          >${this.t("cards.decision.detail-forecast")}:
          ${null!==(i=null===(t=e.forecast_mm)||void 0===t?void 0:t.toFixed(1))&&void 0!==i?i:"-"} mm</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!==(a=null===(s=e.threshold_mm)||void 0===s?void 0:s.toFixed(1))&&void 0!==a?a:"-"} mm</span
        >
      `;if("freeze"===e.id||"wind"===e.id){const t="weather_service"===e.source?this.t("cards.decision.detail-weather-service"):e.source;return W`
        <span
          >${this.t("cards.decision.detail-now")}: ${null!==(n=e.value)&&void 0!==n?n:"-"}
          ${null!==(r=e.unit)&&void 0!==r?r:""}</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!==(o=e.threshold)&&void 0!==o?o:"-"} ${null!==(l=e.unit)&&void 0!==l?l:""}</span
        >
        <span>${null!=t?t:""}</span>
      `}return"rain_sensor"===e.id?W`<span
        >${e.raining?this.t("cards.decision.detail-raining"):this.t("cards.decision.detail-dry")}</span
      >`:"soil_moisture"===e.id?W`${(e.zones||[]).map((e=>{var t;return W`<span
            >${e.name}: ${null!==(t=e.moisture)&&void 0!==t?t:"-"} % / ${e.threshold} %
            ${e.held?`(${this.t("cards.decision.detail-held")})`:""}</span
          >`}))}`:"days_between"===e.id?W`
        <span
          >${this.t("cards.decision.detail-days-since")}:
          ${null!==(h=e.days_since)&&void 0!==h?h:"-"}</span
        >
        <span
          >${this.t("cards.decision.detail-days-required")}:
          ${null!==(d=e.days_required)&&void 0!==d?d:"-"}</span
        >
      `:W``}renderLastDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.last_skip_evaluation;return W`
      <div class="last-decision">
        <span class="check-name">${this.t("cards.decision.last-title")}</span>
        ${t?W`<span class="value"
              >${t.should_skip?this.t("cards.decision.last-skipped"):this.t("cards.decision.last-ran")}${t.evaluated_at?` (${Ss(t.evaluated_at,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})`:""}</span
            >`:W`<span class="value"
              >${this.t("cards.decision.last-none")}</span
            >`}
      </div>
    `}renderEstimates(){var e,t;const i=null!==(t=null===(e=this.info)||void 0===e?void 0:e.zone_estimates)&&void 0!==t?t:{},s=this.config?Ts(this.config,ss):"mm",a=this.zones.filter((e=>i[String(e.id)]));return W`
      <ha-card header="${this.t("cards.estimate.title")}">
        <div class="card-content">
          ${0===a.length?W`<div class="info-note">
                ${this.t("cards.estimate.none")}
              </div>`:W`
                ${a.map((e=>{const t=i[String(e.id)];return W`
                    <div class="zone-info">
                      <div class="zone-header">
                        <label class="zone-name">${e.name}</label>
                      </div>
                      <div class="zone-details">
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.now")}:</span
                          >
                          <span class="value"
                            >${Number(t.bucket).toFixed(1)} ${s}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.at-last-calculation")}:</span
                          >
                          <span class="value"
                            >${Number(e.bucket).toFixed(1)} ${s}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.would-water")}:</span
                          >
                          <span class="value"
                            >${t.duration?this.formatDuration(t.duration):this.t("cards.estimate.nothing")}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.last-irrigation")}:</span
                          >
                          <span class="value"
                            >${e.last_irrigation?Ss(e.last_irrigation,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.estimate.never-watered")}</span
                          >
                        </div>
                      </div>
                    </div>
                  `}))}
                <div class="info-note">${this.t("cards.estimate.note")}</div>
              `}
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${aa} ${la}

      .card-content {
        display: flex;
        flex-direction: column;
      }

      /* label left, value right, matching .setting-row elsewhere */
      /* One sentence, said the way a person would say it. */
      .hero {
        /* The shared .card-content stacks its children, which put the icon on
           a line of its own. */
        flex-direction: row;
        gap: 16px;
        align-items: flex-start;
      }

      .hero ha-icon {
        --mdc-icon-size: 32px;
        color: var(--primary-color);
        flex: none;
        margin-top: 2px;
      }

      .hero-headline {
        font-size: 1.35em;
        font-weight: 400;
        line-height: 1.3;
      }

      .hero-sub {
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      /* The trigger and the zones: true, and nobody's first question. */
      .hero-detail {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px 20px;
        padding-top: 0;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      /* A line of days: what the sky is about to do. */
      .forecast {
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;
        overflow-x: auto;
      }

      .forecast-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 62px;
        padding: 4px 0;
      }

      .forecast-name {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        text-transform: capitalize;
      }

      .forecast ha-icon {
        --mdc-icon-size: 24px;
      }

      .forecast ha-icon.wet {
        color: var(--info-color, #4fc3f7);
      }

      .forecast ha-icon.dry {
        color: var(--warning-color, #ffb300);
      }

      .forecast-temps {
        display: flex;
        gap: 6px;
        align-items: baseline;
      }

      .forecast-min {
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }

      .forecast-rain {
        color: var(--info-color, #4fc3f7);
        font-size: 0.8em;
        min-height: 1em;
      }

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
        text-align: right;
      }

      /* A remark under a value, not an alert: the shared style paints
         .info-note as a warning banner, which read as something wrong. */
      .postpone {
        flex-direction: row;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .postpone ha-icon {
        color: var(--secondary-text-color);
        flex: none;
      }

      .postpone-state {
        flex: 1;
        min-width: 180px;
      }

      .gap-banner {
        flex-direction: row;
        gap: 12px;
        align-items: flex-start;
      }

      .gap-banner ha-icon {
        color: var(--warning-color, #ffa600);
        flex: none;
      }

      .gap-title {
        font-weight: 500;
      }

      .info-note {
        background: none;
        padding: 0;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
      }

      /* the headline answer of the decision card */
      .verdict {
        font-size: 1.05em;
        font-weight: 600;
        padding: 4px 0 12px;
      }
      .verdict.run {
        color: var(--success-color, var(--primary-text-color));
      }
      .verdict.skip {
        color: var(--warning-color, var(--primary-text-color));
      }

      .check {
        padding: 10px 0;
        border-top: 1px solid var(--divider-color);
      }
      .check-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .check-name {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .check-detail {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 24px;
        margin-top: 4px;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      /* state of one check, readable without relying on colour alone */
      .chip {
        border-radius: 12px;
        padding: 2px 10px;
        font-size: 0.85em;
        white-space: nowrap;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .chip.blocking {
        border-color: var(--warning-color, var(--divider-color));
        color: var(--warning-color, var(--primary-text-color));
      }
      .chip.passing {
        border-color: var(--success-color, var(--divider-color));
        color: var(--success-color, var(--primary-text-color));
      }

      .last-decision {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }
      .last-decision .value {
        color: var(--primary-text-color);
        font-weight: 500;
        text-align: right;
      }

      /* one zone reads as a section, as on the other pages */
      .zone-info {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .zone-info:last-of-type {
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
      .zone-details {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 28px;
        margin-top: 2px;
      }
      .pair {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
      }
      .pair .label {
        color: var(--secondary-text-color);
      }
      .pair .value {
        color: var(--primary-text-color);
        font-weight: 500;
      }
    `}};i([me()],Ba.prototype,"config",void 0),i([me({type:Object})],Ba.prototype,"info",void 0),i([me({type:Array})],Ba.prototype,"zones",void 0),i([me({type:Boolean})],Ba.prototype,"isLoading",void 0),Ba=i([ue("smart-irrigation-view-info")],Ba);const ja=[wi,ci,pi,bi,$i,yi,ui,fi,_i],Ya={sensors:"PyETO",et:"Passthrough",static:"Static"};let Fa=class extends de{constructor(){super(...arguments),this.step=0,this.allModules=[],this.modules=[],this.isSaving=!1,this.done=!1,this.zoneName="",this.zoneSize="",this.zoneThroughput="",this.underGlass=!1,this.weather="service",this.sensors={},this.staticDelta="",this.serviceSuppliesEt=!1}firstUpdated(){ye().catch((()=>{})),this._load().catch((e=>console.error("Setup wizard: load failed",e)))}async _load(){if(!this.hass)return;const[e,t,i,s]=await Promise.all([Ds(this.hass),Us(this.hass),Ls(this.hass),Ns(this.hass).catch((()=>{}))]);this.config=e,this.allModules=t,this.modules=i,this.serviceSuppliesEt=!!(null==s?void 0:s.supplies_evapotranspiration),this.usesWeatherService||(this.weather="sensors")}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e){return qt(`panels.setup.${e}`,this.lng)}get usesWeatherService(){var e;return!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service)}get engineName(){return"service"===this.weather?this.serviceSuppliesEt?"Passthrough":"PyETO":Ya[this.weather]}get sourcesToAsk(){var e;const t=this.allModules.find((e=>e.name===this.engineName)),i=null!==(e=null==t?void 0:t.consumes)&&void 0!==e?e:ja;return ja.filter((e=>i.includes(e)&&!(this.underGlass&&(e===fi||e===_i))))}get sensorsToAsk(){return"static"===this.weather?[]:"et"===this.weather?[ui]:"sensors"===this.weather?this.sourcesToAsk:[]}get steps(){const e=["zone","environment","weather"];return(this.sensorsToAsk.length||"static"===this.weather)&&e.push("sensors"),e.push("review"),e}get currentStep(){return this.steps[Math.min(this.step,this.steps.length-1)]}get canGoOn(){switch(this.currentStep){case"zone":return""!==this.zoneName.trim()&&Number(this.zoneSize)>0&&Number(this.zoneThroughput)>0;case"sensors":return"static"===this.weather?Number(this.staticDelta)>0:this.sensorsToAsk.every((e=>{var t;return""!==(null!==(t=this.sensors[e])&&void 0!==t?t:"")}));default:return!0}}render(){return this.hass?this.done?W`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            <div class="done">${this.t("done")}</div>
            <div class="note">${this.t("done-note")}</div>
          </div>
        </ha-card>
      `:W`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="note">${this.t("description")}</div>
          ${this.renderStep()}
          ${this.error?W`<div class="error">${this.error}</div>`:""}
          <div class="si-form-actions">
            <span class="step-count"
              >(${this.t("step")}
              ${Math.min(this.step,this.steps.length-1)+1} /
              ${this.steps.length})</span
            >
            ${this.step>0?W`<ha-button
                  appearance="plain"
                  @click=${()=>{this.step-=1,this.error=void 0}}
                >
                  <ha-svg-icon slot="start" .path=${"M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"}></ha-svg-icon>
                  ${this.t("back")}
                </ha-button>`:""}
            ${"review"===this.currentStep?W`<ha-button
                  appearance="filled"
                  ?disabled=${this.isSaving}
                  @click=${()=>this.create()}
                >
                  <ha-svg-icon slot="start" .path=${"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}></ha-svg-icon>
                  ${this.isSaving?this.t("creating"):this.t("create")}
                </ha-button>`:W`<ha-button
                  appearance="filled"
                  ?disabled=${!this.canGoOn}
                  @click=${()=>{this.step+=1,this.error=void 0}}
                >
                  ${this.t("next")}
                  <ha-svg-icon slot="end" .path=${"M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"}></ha-svg-icon>
                </ha-button>`}
          </div>
        </div>
      </ha-card>
    `:W``}renderStep(){switch(this.currentStep){case"zone":return this.renderZoneStep();case"environment":return this.renderEnvironmentStep();case"weather":return this.renderWeatherStep();case"sensors":return this.renderSensorsStep();default:return this.renderReviewStep()}}renderZoneStep(){return W`
      <h3>${this.t("steps.zone.question")}</h3>
      <div class="note">${this.t("steps.zone.help")}</div>
      <div class="setting-row">
        <div class="setting-label">${this.t("steps.zone.name")}</div>
        <input
          class="field"
          type="text"
          .value=${this.zoneName}
          @input=${e=>this.zoneName=e.target.value}
        />
      </div>
      <div class="setting-row">
        <div class="setting-label">
          ${this.t("steps.zone.size")}
          ${this.config?W`<span class="unit"
                >(${Ts(this.config,Xi)})</span
              >`:""}
        </div>
        <input
          class="field"
          type="number"
          min="0"
          .value=${this.zoneSize}
          @input=${e=>this.zoneSize=e.target.value}
        />
      </div>
      <div class="setting-row">
        <div class="setting-label">
          ${this.t("steps.zone.throughput")}
          ${this.config?W`<span class="unit"
                >(${Ts(this.config,Qi)})</span
              >`:""}
        </div>
        <input
          class="field"
          type="number"
          min="0"
          .value=${this.zoneThroughput}
          @input=${e=>this.zoneThroughput=e.target.value}
        />
      </div>
      <div class="note">${this.t("steps.zone.throughput-help")}</div>
    `}renderEnvironmentStep(){return W`
      <h3>${this.t("steps.environment.question")}</h3>
      ${this.choice(!this.underGlass,this.t("steps.environment.outdoors"),this.t("steps.environment.outdoors-help"),(()=>{this.underGlass=!1}))}
      ${this.choice(this.underGlass,this.t("steps.environment.under-glass"),this.t("steps.environment.under-glass-help"),(()=>{this.underGlass=!0,"service"===this.weather&&(this.weather="sensors")}))}
    `}renderWeatherStep(){return W`
      <h3>${this.t("steps.weather.question")}</h3>
      ${this.usesWeatherService&&!this.underGlass?this.choice("service"===this.weather,this.t("steps.weather.service"),this.t("steps.weather.service-help"),(()=>this.weather="service")):""}
      ${this.underGlass?W`<div class="note">
            ${this.t("steps.weather.no-service-indoors")}
          </div>`:""}
      ${this.choice("sensors"===this.weather,this.t("steps.weather.sensors"),this.t("steps.weather.sensors-help"),(()=>this.weather="sensors"))}
      ${this.choice("et"===this.weather,this.t("steps.weather.et"),this.t("steps.weather.et-help"),(()=>this.weather="et"))}
      ${this.choice("static"===this.weather,this.t("steps.weather.static"),this.t("steps.weather.static-help"),(()=>this.weather="static"))}
    `}renderSensorsStep(){return"static"===this.weather?W`
        <h3>${this.t("steps.sensors.static-question")}</h3>
        <div class="note">${this.t("steps.sensors.static-help")}</div>
        <div class="setting-row">
          <div class="setting-label">
            ${this.t("steps.sensors.static-label")}
          </div>
          <input
            class="field"
            type="number"
            min="0"
            step="0.1"
            .value=${this.staticDelta}
            @input=${e=>this.staticDelta=e.target.value}
          />
        </div>
      `:W`
      <h3>${this.t("steps.sensors.question")}</h3>
      <div class="note">${this.t("steps.sensors.help")}</div>
      ${this.underGlass&&this.sensorsToAsk.includes(yi)?W`<div class="note">${this.t("steps.sensors.lux-hint")}</div>`:""}
      ${this.sensorsToAsk.map((e=>{var t;return W`
          <div class="setting-row">
            <div class="setting-label">${e}</div>
            <ha-entity-picker
              class="entity-field"
              .hass=${this.hass}
              .value=${null!==(t=this.sensors[e])&&void 0!==t?t:""}
              allow-custom-entity
              @value-changed=${t=>{var i,s;this.sensors=Object.assign(Object.assign({},this.sensors),{[e]:null!==(s=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==s?s:""})}}
            ></ha-entity-picker>
          </div>
        `}))}
    `}renderReviewStep(){return W`
      <h3>${this.t("steps.review.question")}</h3>
      <div class="settings">
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.zone")}</div>
          <div class="review-value">${this.zoneName}</div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.environment")}</div>
          <div class="review-value">
            ${this.underGlass?this.t("steps.environment.under-glass"):this.t("steps.environment.outdoors")}
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.engine")}</div>
          <div class="review-value">
            ${Cs(this.engineName,this.lng)}
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.sources")}</div>
          <div class="review-value">
            ${this.sensorsToAsk.length?this.sensorsToAsk.join(", "):this.t("steps.review.from-the-service")}
          </div>
        </div>
      </div>
      <div class="note">${this.t("steps.review.help")}</div>
    `}choice(e,t,i,s){return W`
      <div class="choice ${e?"selected":""}" @click=${s}>
        <div class="choice-title">${t}</div>
        <div class="choice-help">${i}</div>
      </div>
    `}sourceFor(e){return this.sensors[e]?{[Di]:Ti,[Ni]:this.sensors[e],[Li]:""}:"service"===this.weather&&this.sourcesToAsk.includes(e)?{[Di]:Si,[Ni]:"",[Li]:""}:!this.underGlass||e!==fi&&e!==_i?{[Di]:Ci,[Ni]:"",[Li]:""}:{[Di]:Oi,[Ni]:"",[Li]:"",[Pi]:0}}async create(){if(this.hass&&!this.isSaving){this.isSaving=!0,this.error=void 0;try{let e=this.modules.find((e=>e.name===this.engineName));if(!e){const t=this.allModules.find((e=>e.name===this.engineName));if(!t)throw new Error(`Unknown calculation engine ${this.engineName}`);const i="static"===this.weather?Object.assign(Object.assign({},t.config),{delta:Number(this.staticDelta)}):t.config;await Is(this.hass,{name:t.name,description:t.description,config:i,schema:t.schema});const s=await Ls(this.hass);this.modules=s,e=s.find((e=>e.name===this.engineName))}const t={name:this.zoneName.trim(),mappings:Object.fromEntries(ja.map((e=>[e,this.sourceFor(e)]))),greenhouse:this.underGlass,[vi]:null==e?void 0:e.id};await js(this.hass,t);const i=(await Bs(this.hass)).find((e=>e.name===t.name));await Rs(this.hass,{name:this.zoneName.trim(),size:Number(this.zoneSize),throughput:Number(this.zoneThroughput),state:"automatic",[ns]:null==i?void 0:i.id}),await Ps(this.hass),this.done=!0}catch(e){console.error("Setup wizard: could not create the zone",e),this.error=this.t("failed")}finally{this.isSaving=!1}}}static get styles(){return l`
      ${aa} ${la}

      h3 {
        margin: 12px 0 4px;
        color: var(--primary-text-color);
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin: 4px 0 8px;
      }
      /* The recap's answers: the right-hand side of a row, reading as a
         value rather than as something still editable. */
      .review-value {
        color: var(--secondary-text-color);
        text-align: right;
      }
      /* The entity picker brings its own chrome, so it is sized like the
         other controls without taking the filled-field background. */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      /* one answer, big enough to tap, readable before it is chosen */
      .choice {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        cursor: pointer;
      }
      .choice.selected {
        border-color: var(--primary-color);
      }
      .choice-title {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .choice-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 2px;
      }

      /* Which step this is, beside the button that moves to the next one.
         Dots were eight grey pixels: countable in principle, unreadable in
         practice, and silent about how many were left. */
      .step-count {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      /* The shared row justifies to the end and sets no gap, which is right
         for a single button and too tight for three items. */
      .si-form-actions {
        gap: 12px;
        align-items: center;
      }

      .review div {
        padding: 4px 0;
        color: var(--primary-text-color);
      }
      .review span {
        color: var(--secondary-text-color);
        margin-right: 8px;
      }

      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      .done {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--success-color, var(--primary-text-color));
      }
    `}};i([me()],Fa.prototype,"hass",void 0),i([me()],Fa.prototype,"config",void 0),i([fe()],Fa.prototype,"step",void 0),i([fe()],Fa.prototype,"allModules",void 0),i([fe()],Fa.prototype,"modules",void 0),i([fe()],Fa.prototype,"isSaving",void 0),i([fe()],Fa.prototype,"error",void 0),i([fe()],Fa.prototype,"done",void 0),i([fe()],Fa.prototype,"zoneName",void 0),i([fe()],Fa.prototype,"zoneSize",void 0),i([fe()],Fa.prototype,"zoneThroughput",void 0),i([fe()],Fa.prototype,"underGlass",void 0),i([fe()],Fa.prototype,"weather",void 0),i([fe()],Fa.prototype,"sensors",void 0),i([fe()],Fa.prototype,"staticDelta",void 0),i([fe()],Fa.prototype,"serviceSuppliesEt",void 0),Fa=i([ue("smart-irrigation-view-setup")],Fa);const Wa=aa,Va=()=>{const e=e=>{let t={};for(let i=0;i<e.length;i+=2){const s=e[i],a=i<e.length?e[i+1]:void 0;t=Object.assign(Object.assign({},t),{[s]:a})}return t},t=window.location.pathname.split("/");let i={page:t[2]||"info",params:{}};if(t.length>3){let s=t.slice(3);if(t.includes("filter")){const t=s.findIndex((e=>"filter"==e)),a=s.slice(t+1);s=s.slice(0,t),i=Object.assign(Object.assign({},i),{filter:e(a)})}s.length&&(s.length%2&&(i=Object.assign(Object.assign({},i),{subpage:s.shift()})),s.length&&(i=Object.assign(Object.assign({},i),{params:e(s)})))}return i},Ga=(e,...t)=>{let i={page:e,params:{}};t.forEach((e=>{"string"==typeof e?i=Object.assign(Object.assign({},i),{subpage:e}):"params"in e?i=Object.assign(Object.assign({},i),{params:e.params}):"filter"in e&&(i=Object.assign(Object.assign({},i),{filter:e.filter}))}));const s=e=>{let t=Object.keys(e);t=t.filter((t=>e[t])),t.sort();let i="";return t.forEach((t=>{const s=e[t];i=i.length?`${i}/${t}/${s}`:`${t}/${s}`})),i};let a=`/${ei}/${i.page}`;return i.subpage&&(a=`${a}/${i.subpage}`),s(i.params).length&&(a=`${a}/${s(i.params)}`),i.filter&&(a=`${a}/filter/${s(i.filter)}`),a};var Za;!function(e){e.Setup="setup",e.Info="info",e.General="general",e.Zones="zones",e.Modules="modules",e.Mappings="mappings",e.WeatherService="weatherservice",e.History="history",e.BackupRestore="backuprestore",e.Help="help"}(Za||(Za={}));const qa=[{id:"home",pages:[Za.Info,Za.History]},{id:"zones",pages:[Za.Zones]},{id:"data",pages:[Za.WeatherService,Za.Mappings]},{id:"settings",pages:[Za.General,Za.BackupRestore,Za.Help]}],Ka={[Za.Modules]:"settings",[Za.Setup]:"settings"},Ja=e=>{const t=qa.find((t=>t.pages.includes(e)));if(t)return t;const i=Ka[e];if(i){const t=qa.find((e=>e.id===i));if(t)return Object.assign(Object.assign({},t),{pages:[...t.pages,e]})}return qa[0]};e.SmartIrrigationPanel=class extends de{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100,this._languageReady=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}willUpdate(){var e;const t=null===(e=this.hass)||void 0===e?void 0:e.language;if(!t||this._languageRequested===t)return;if(this._languageRequested=t,function(e){return Zt(e)in Vt}(t))return void(this._languageReady=!0);const i=()=>{this._languageReady=!0,this._refreshViews()},s=setTimeout(i,600);(async function(e,t=""){const i=Zt(e);if(i in Vt)return;if(!Wt.includes(i))return;if(i in Gt)return Gt[i];const s=(async()=>{const e=new AbortController,s=setTimeout((()=>e.abort()),5e3);try{const s=t?`${Ft}/${i}.json?v=${encodeURIComponent(t)}`:`${Ft}/${i}.json`,a=await fetch(s,{signal:e.signal});if(!a.ok)throw new Error(`HTTP ${a.status}`);const n=await a.json();if(!n||"object"!=typeof n)throw new Error("not an object");Vt[i]=n}catch(e){console.warn(`Smart Irrigation: could not load the ${i} translation, falling back to English`,e)}finally{clearTimeout(s),delete Gt[i]}})();return Gt[i]=s,s})(t,Qt).then((()=>{clearTimeout(s),i()}))}_refreshViews(){var e;this.requestUpdate(),null===(e=this.shadowRoot)||void 0===e||e.querySelectorAll("*").forEach((e=>{var t;return null===(t=e.requestUpdate)||void 0===t?void 0:t.call(e)}))}async firstUpdated(){const e=Va();e.page&&Object.values(Za).includes(e.page)?(window.addEventListener("location-changed",(()=>{if(!window.location.pathname.includes("smart_irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())})),ye().then((()=>{this._scheduleUpdate()})).catch((e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()}))):As(0,Ga(Za.Info))}render(){if(!this._languageReady)return W``;const e=Va(),t=!!customElements.get("ha-tab-group"),i=!!customElements.get("ha-tab-group-tab");return W`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${qt("title",this.hass.language)}</div>
          <div class="version">${Qt}</div>
        </div>

        ${t&&i?W`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${qa.map((t=>W`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${t.pages[0]}"
                      .active=${Ja(e.page).id===t.id}
                    >
                      ${qt(`panels.groups.${t.id}`,this.hass.language)}
                    </ha-tab-group-tab>
                  `))}
              </ha-tab-group>
            `:W`
              <div class="custom-tabs">
                ${qa.map((t=>W`
                    <button
                      class="custom-tab ${Ja(e.page).id===t.id?"active":""}"
                      @click=${()=>this.navigateToPage(t.pages[0])}
                    >
                      ${qt(`panels.groups.${t.id}`,this.hass.language)}
                    </button>
                  `))}
              </div>
            `}
        ${this.renderSubTabs(e.page)}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}renderSubTabs(e){const t=Ja(e);return t.pages.length<2?"":W`
      <div class="sub-tabs">
        ${t.pages.map((t=>W`
            <button
              class="sub-tab ${e===t?"active":""}"
              @click=${()=>this.navigateToPage(t)}
            >
              ${qt(`panels.${t}.title`,this.hass.language)}
            </button>
          `))}
      </div>
    `}getView(e){switch(e.page){case"setup":return W`
          <smart-irrigation-view-setup
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></smart-irrigation-view-setup>
        `;case"info":return W`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-info>
        `;case"general":return W`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-general>
        `;case"zones":return W`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-zones>
        `;case"modules":return W`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-modules>
        `;case"mappings":return W`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-mappings>
        `;case"weatherservice":return W`
          <smart-irrigation-view-weatherservice
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-weatherservice>
        `;case"history":return W`
          <smart-irrigation-view-history
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-history>
        `;case"backuprestore":return W`
          <smart-irrigation-view-backuprestore
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-backuprestore>
        `;case"help":return W`<div class="help-cards">
          <ha-card
            header="${qt("panels.help.cards.how-to-get-help.title",this.hass.language)}"
          >
            <div class="card-content">
              ${qt("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
              <a href="https://altmenorg.github.io/HAsmartirrigation/"
                >${qt("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
              >.
              ${qt("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
              <a
                href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
                >${qt("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
              >
              ${qt("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
              <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
                >${qt("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
              >
              (${qt("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
            </div></ha-card
          ><ha-card
            header="${qt("panels.help.cards.translate.title",this.hass.language)}"
          >
            <div class="card-content">
              ${qt("panels.help.cards.translate.text",this.hass.language)}
              <a
                href="https://hosted.weblate.org/engage/smart-irrigation/"
                target="_blank"
                rel="noreferrer"
                >${qt("panels.help.cards.translate.link",this.hass.language)}</a
              >.
            </div></ha-card
          >
        </div>`;default:return W`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}navigateToPage(e){if(e!==Va().page){const t=Ga(e);As(0,t),this.requestUpdate()}else scrollTo(0,0)}handlePageSelected(e){const t=e.detail.name;if(t!==Va().page){const e=Ga(t);As(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[Wa,l`
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
          border-bottom: var(--app-header-border-bottom, none);
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

        /* The pages of the group that is open. It sits below the header, on
           the page's own background, so it takes the page's colours: the
           header's are white on white here. A quieter row than the tabs above
           it, because this says where you are inside a section rather than
           offering a choice between sections. */
        .sub-tabs {
          display: flex;
          gap: 8px;
          padding: 8px max(env(safe-area-inset-left), 24px);
          background: var(
            --card-background-color,
            var(--primary-background-color)
          );
          border-bottom: 1px solid var(--divider-color);
          overflow-x: auto;
        }

        .sub-tab {
          background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
          border: none;
          border-radius: 16px;
          color: var(--secondary-text-color);
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          line-height: 30px;
          padding: 0 16px;
          white-space: nowrap;
        }

        .sub-tab:hover {
          color: var(--primary-text-color);
        }

        .sub-tab.active {
          background: var(--primary-color);
          color: var(--text-primary-color, white);
          font-weight: 500;
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

        .help-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 0;
        }

        .view > *:last-child {
          margin-bottom: 20px;
        }

        .version {
          font-size: 14px;
          font-weight: 500;
          color: rgba(var(--rgb-text-primary-color), 0.9);
        }
      `]}},i([me({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),i([me({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),i([fe()],e.SmartIrrigationPanel.prototype,"_languageReady",void 0),e.SmartIrrigationPanel=i([ue("smart-irrigation")],e.SmartIrrigationPanel);let Xa=class extends de{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?W`
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
              .path=${Zs}
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
    `:W``}static get styles(){return l`
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.errortitle {
        font-size: 2em;
        font-weight: bold;
        vertical-align: bottom;
      }
    `}};i([me({attribute:!1})],Xa.prototype,"hass",void 0),i([fe()],Xa.prototype,"_params",void 0),Xa=i([ue("smart-irrigation-error-dialog")],Xa);var Qa=Object.freeze({__proto__:null,get ErrorDialog(){return Xa}})}({});
//# sourceMappingURL=smart-irrigation.js.map
