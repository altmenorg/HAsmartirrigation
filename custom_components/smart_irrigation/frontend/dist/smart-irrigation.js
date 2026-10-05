!function(e){"use strict";function t(e,t){var s={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(s[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(i=Object.getOwnPropertySymbols(e);a<i.length;a++)t.indexOf(i[a])<0&&Object.prototype.propertyIsEnumerable.call(e,i[a])&&(s[i[a]]=e[i[a]])}return s}function s(e,t,s,i){var a,n=arguments.length,r=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,s,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(r=(n<3?a(r):n>3?a(t,s,r):a(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const i=globalThis,a=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let o=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(t,e))}return e}toString(){return this.cssText}};const l=(e,...t)=>{const s=1===e.length?e[0]:t.reduce(((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1]),e[0]);return new o(s,e,n)},h=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,n))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,{is:d,defineProperty:c,getOwnPropertyDescriptor:u,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:m}=Object,f=globalThis,v=f.trustedTypes,_=v?v.emptyScript:"",b=f.reactiveElementPolyfillSupport,y=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},$=(e,t)=>!d(e,t),x={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:a}=u(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const n=i?.call(this);a?.call(this,t),this.requestUpdate(e,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(h(e))}else void 0!==e&&t.push(h(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const s of t){const t=document.createElement("style"),a=i.litNonce;void 0!==a&&t.setAttribute("nonce",a),t.textContent=s.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const a=(void 0!==s.converter?.toAttribute?s.converter:w).toAttribute(t,s.type);this._$Em=e,null==a?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=i;const n=a.fromAttribute(t,e.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(e,t,s,i=!1,a){if(void 0!==e){const n=this.constructor;if(!1===i&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??$)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[y("elementProperties")]=new Map,k[y("finalized")]=new Map,b?.({ReactiveElement:k}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const S=globalThis,T=S.trustedTypes,z=T?T.createPolicy("lit-html",{createHTML:e=>e}):void 0,M="$lit$",O=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+O,E=`<${A}>`,C=document,H=()=>C.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,N=Array.isArray,R="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,j=/>/g,I=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,U=/"/g,F=/^(?:script|style|textarea|title)$/i,Y=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),W=Y(1),V=Y(2),G=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),q=new WeakMap,K=C.createTreeWalker(C,129);function J(e,t){if(!N(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(t):t}class X{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let a=0,n=0;const r=e.length-1,o=this.parts,[l,h]=((e,t)=>{const s=e.length-1,i=[];let a,n=2===t?"<svg>":3===t?"<math>":"",r=P;for(let t=0;t<s;t++){const s=e[t];let o,l,h=-1,d=0;for(;d<s.length&&(r.lastIndex=d,l=r.exec(s),null!==l);)d=r.lastIndex,r===P?"!--"===l[1]?r=L:void 0!==l[1]?r=j:void 0!==l[2]?(F.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=I):void 0!==l[3]&&(r=I):r===I?">"===l[0]?(r=a??P,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?I:'"'===l[3]?U:B):r===U||r===B?r=I:r===L||r===j?r=P:(r=I,a=void 0);const c=r===I&&e[t+1].startsWith("/>")?" ":"";n+=r===P?s+E:h>=0?(i.push(o),s.slice(0,h)+M+s.slice(h)+O+c):s+O+(-2===h?t:c)}return[J(e,n+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=X.createElement(l,s),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=K.nextNode())&&o.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(M)){const t=h[n++],s=i.getAttribute(e).split(O),r=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:r[2],strings:s,ctor:"."===r[1]?ie:"?"===r[1]?ae:"@"===r[1]?ne:se}),i.removeAttribute(e)}else e.startsWith(O)&&(o.push({type:6,index:a}),i.removeAttribute(e));if(F.test(i.tagName)){const e=i.textContent.split(O),t=e.length-1;if(t>0){i.textContent=T?T.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],H()),K.nextNode(),o.push({type:2,index:++a});i.append(e[t],H())}}}else if(8===i.nodeType)if(i.data===A)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=i.data.indexOf(O,e+1));)o.push({type:7,index:a}),e+=O.length-1}a++}}static createElement(e,t){const s=C.createElement("template");return s.innerHTML=e,s}}function Q(e,t,s=e,i){if(t===G)return t;let a=void 0!==i?s._$Co?.[i]:s._$Cl;const n=D(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=a:s._$Cl=a),void 0!==a&&(t=Q(e,a._$AS(e,t.values),a,i)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??C).importNode(t,!0);K.currentNode=i;let a=K.nextNode(),n=0,r=0,o=s[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new te(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new re(a,this,e)),this._$AV.push(t),o=s[++r]}n!==o?.index&&(a=K.nextNode(),n++)}return K.currentNode=C,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),D(e)?e===Z||null==e||""===e?(this._$AH!==Z&&this._$AR(),this._$AH=Z):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>N(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Z&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=X.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ee(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new X(e)),t}k(e){N(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const a of e)i===t.length?t.push(s=new te(this.O(H()),this.O(H()),this,this.options)):s=t[i],s._$AI(a),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,a){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=a,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=Z}_$AI(e,t=this,s,i){const a=this.strings;let n=!1;if(void 0===a)e=Q(this,e,t,0),n=!D(e)||e!==this._$AH&&e!==G,n&&(this._$AH=e);else{const i=e;let r,o;for(e=a[0],r=0;r<a.length-1;r++)o=Q(this,i[s+r],t,r),o===G&&(o=this._$AH[r]),n||=!D(o)||o!==this._$AH[r],o===Z?e=Z:e!==Z&&(e+=(o??"")+a[r+1]),this._$AH[r]=o}n&&!i&&this.j(e)}j(e){e===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Z?void 0:e}}class ae extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Z)}}class ne extends se{constructor(e,t,s,i,a){super(e,t,s,i,a),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Z)===G)return;const s=this._$AH,i=e===Z&&s!==Z||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==Z&&(s===Z||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const oe={I:te},le=S.litHtmlPolyfillSupport;le?.(X,te),(S.litHtmlVersions??=[]).push("3.3.3");const he=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */let de=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let a=i._$litPart$;if(void 0===a){const e=s?.renderBefore??null;i._$litPart$=a=new te(t.insertBefore(H(),e),e,void 0,s??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};de._$litElement$=!0,de.finalized=!0,he.litElementHydrateSupport?.({LitElement:de});const ce=he.litElementPolyfillSupport;ce?.({LitElement:de}),(he.litElementVersions??=[]).push("4.2.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ue=e=>(t,s)=>{void 0!==s?s.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,pe={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:$},ge=(e=pe,t,s)=>{const{kind:i,metadata:a}=s;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),n.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const a=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,a,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const a=this[i];t.call(this,s),this.requestUpdate(i,a,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function me(e){return(t,s)=>"object"==typeof s?ge(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)
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
function ve(e,t){return(t,s,i)=>((e,t,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,s),s))(t,s,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}let _e=!1,be=null;const ye=async()=>{if(_e&&be)return be;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();_e=!0,be=async function(){try{await new Promise((e=>{"requestIdleCallback"in window?requestIdleCallback((()=>e())):setTimeout((()=>e()),0)})),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),t=document.createElement("partial-panel-resolver");e.appendChild(t),t.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise((e=>queueMicrotask((()=>e())))),t._updateRoutes(),await t.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise((e=>queueMicrotask((()=>e()))));const s=document.createElement("ha-panel-config");e.appendChild(s),await s.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await be}finally{_e=!1,be=null}};var we={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds",minutes:"min",hours:"h"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"bucket",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."},modes:{manual:"Manual",standard:"Standard",advanced:"Advanced"}},$e={"default-zone":"Default zone","default-mapping":"Default sensor group"},xe={calculation:{explanation:{"formatting-note":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values.","module-returned-evapotranspiration-deficiency":"Module returned Crop evapotranspiration deficiency ( = et0 * hour_multiplier * Kc + precipitation) of","module-returned-hourly-evapotranspiration-deficiency":"Module summed the Crop evapotranspiration deficiency hour by hour ( = sum of hourly et0 * Kc + precipitation) over","crop-factor-is":"Crop factor is","bucket-was":"Bucket was","new-bucket-values-is":"New bucket value is",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since bucket < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","precipitation-rate-is":"The precipitation rate is","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since bucket >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum bucket size is","drainage-rate-is":"Drainage rate when saturated (bucket at max) is","current-drainage-is":"Current drainage is calculated as","no-drainage":"Current drainage is 0 because","below-irrigation-threshold":"The deficit has not reached this zone's irrigation threshold yet, so no irrigation is necessary and the duration is set to 0. Deficit / threshold:"}}},ke={pyeto:{description:"The full calculation, from your own weather sensors: temperature, humidity, pressure, wind and solar radiation. The most accurate option, and the one that asks for the most."},static:{description:"A fixed amount of evaporation per day, which you set yourself. No sensors and no weather service."},passthrough:{description:"Takes an evapotranspiration figure that already exists, from a sensor or from a weather service that publishes one. The recommended path when you have one."}},Se={setup:{title:"Setup",description:"A guided way to create your first zone. It asks one question at a time, and only the questions your previous answers leave open.",next:"Next",back:"Back",create:"Create it",creating:"Creating...",failed:"Something went wrong and nothing was created. The other tabs are still there if you would rather set it up by hand.",done:"Your zone is ready.","done-note":"It appears under Zones, with its sensor group under Sensor groups. Nothing here is special: edit either of them as you would any other. Run an update and a calculation once your sensors have reported, and the zone will start producing a duration.",steps:{zone:{question:"What are you watering?",help:"One zone is one valve, watering one area.",name:"Name",size:"Area",throughput:"Throughput","throughput-help":"How much water this zone delivers per minute. Measure it if you can, rather than taking it from a datasheet: it is what every duration is derived from, and it is the quietest way to water twice as long as you meant to."},environment:{question:"Where does it grow?",outdoors:"Outdoors","outdoors-help":"Open air. Rain reaches it, and the sky is worth asking about.","under-glass":"Under glass or plastic","under-glass-help":"A greenhouse, a polytunnel, a conservatory. No rain arrives, and a forecast describes weather these plants never see."},weather:{question:"Where should the evaporation figure come from?",service:"The weather service you configured","service-help":"Nothing else to install. Smart Irrigation takes the weather for your location and computes evapotranspiration from it.","no-service-indoors":"A weather service is not offered here: it describes the sky, which these plants are not under.",sensors:"My own weather sensors","sensors-help":"You have sensors for temperature, humidity and the rest. The most accurate option, because it measures where the plants actually are.",et:"A sensor that already reports evapotranspiration","et-help":"Something else already computes it, and Smart Irrigation should use that figure as it stands.",static:"A fixed amount per day","static-help":"No sensors and no service. You give one number and it is used every day. Rough, but it still tracks what you have already watered."},sensors:{question:"Which entities should it read?",help:"Only the ones the calculation actually uses are asked for.","lux-hint":"Under glass a light sensor can stand in for solar radiation: pick your illuminance entity here and set its source to Light sensor (lux) afterwards, in the sensor group.","static-question":"How much does it evaporate per day?","static-help":"A depth of water, in the unit your zones use. Somewhere around 4 to 5 mm a day is common for a temperate summer.","static-label":"Evaporation per day"},review:{question:"Ready to create",zone:"Zone",environment:"Environment",engine:"Calculation engine",sources:"Sources","from-the-service":"from the weather service",help:"This creates a calculation module, a sensor group and a zone, exactly as the other tabs would. Nothing is locked afterwards."}},step:"step"},weatherservice:{history:{title:"History",refresh:"Refresh","last-update":"Last update",time:"Retrieved","sensor-group":"Sensor group","no-data":"No data has been retrieved from the weather service yet."},title:"Weather service",description:"View and change the weather service used to fetch weather data — no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key"},actions:{save:"Save",saving:"Saving…"},messages:{"no-service":"No weather service is used — weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately.","owm-onecall-hint":"OpenWeatherMap needs the One Call API 3.0 plan (One Call by Call). It is free up to 1000 calls/day but must be activated with a card, and a new key can take up to a couple of hours to work. A plain default key is rejected."}},backuprestore:{title:"Backup / restore",description:"Export the full Smart Irrigation configuration to a JSON file, or restore it from a previous backup.",cards:{backup:{title:"Backup",description:"Download the complete configuration (general settings, zones, modules and sensor groups) as a JSON file."},restore:{title:"Restore",description:"Load a previously exported JSON file to replace the current configuration."}},actions:{export:"Export to JSON","choose-file":"Choose a backup file…",restore:"Restore this backup",restoring:"Restoring…"},messages:{exported:"Backup file downloaded.",restored:"Configuration restored — reloading the integration.","invalid-file":"This file is not a valid Smart Irrigation backup.","confirm-title":"Replace the entire configuration?",summary:"This backup contains","confirm-warning":"Restoring overwrites all current general settings, zones, modules and sensor groups. This cannot be undone.","reload-note":"Restoring replaces everything and reloads the integration to apply the change."}},general:{cards:{"automatic-duration-calculation":{header:"Calculating the watering duration",description:"The watering duration of each zone comes from its water balance: what the weather took out of the soil, minus the rain. Here you choose when it is calculated. What starts the watering is decided elsewhere, by the start trigger.",labels:{"calc-when":"Watering duration calculated","calc-when-time":"At a fixed time","calc-when-start":"Just before each start","calc-when-manual":"Only when I ask","calc-when-hint":"Just before each start: at the time of the start trigger, with the freshest weather. The right choice when Smart Irrigation starts the watering (direct valve control or the start event). At a fixed time: every day at the time below, for something other than Smart Irrigation that starts the watering and reads the durations when it likes (Irrigation Unlimited, a schedule of your own). Only when I ask: nothing is calculated by itself, use the calculate buttons or the services.","calc-time":"Calculate at","calc-time-hint":"The daily calculation: the water lost is added to the bucket of each zone and the watering durations are set.","hourly-calculation":"Calculate evapotranspiration hour by hour","hourly-calculation-hint":"Sums the FAO-56 hourly equation over each hour since the last calculation, instead of applying the daily equation to the averages, which hides whether the sun and the heat came together. A new installation starts on it; an installation set up before it arrived keeps the daily equation until you switch, because the two give different numbers and your watering should not change on an update. The sun of each hour comes from a radiation or illuminance sensor, from the weather service's own hourly history, or from the day's temperature range. It is worth having when readings arrive through the day: one update a day leaves a single reading held across twenty-four hours, and neither form is trustworthy then. A greenhouse with no sensor of its own keeps the daily equation."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Update sensor data every","auto-update-delay":"Update delay"},options:{minutes:"minutes",hours:"hours",days:"days"}},continuousupdates:{header:"Continuous updates for sensors",description:"Records every change of a sensor of the group, instead of one reading per update. The hourly calculation and the pluviometer both get finer averages from it. It no longer calculates the zones again at each change: the scheduled calculation does that, once, from the readings recorded. It cannot be used for sensor groups that at least partly rely on a weather service, as polling the API continuously would incur costs.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}},"panel-mode":{header:"Panel",labels:{advanced:"Advanced settings","advanced-hint":"Shows the settings that tune the model: drainage, thresholds, multiplier, how far ahead a zone looks. They have sound defaults; leave this off unless you know you need them. Your values are kept either way."}},"setup-assistant":{description:"Four questions at most, and it creates a sensor group and a zone for you, choosing what each needs. For a first zone, another one, or a fresh start.",open:"Open the assistant"}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"},translate:{title:"Help translate",text:"Apart from English and French, the translations of this panel were machine-made and nobody who speaks the language has checked them yet. If a word or a sentence reads oddly in yours, you can correct it in your browser, with no technical knowledge needed.",link:"Translate on Weblate"}}},info:{title:"Info",description:"What will happen at the next start, and why.","configuration-not-available":"Configuration not available.",cards:{"next-run":{title:"Next run",labels:{start:"Starts",duration:"Total duration",zones:"Zones watering",trigger:"Trigger"},"no-start":"No start time could be worked out yet.","nothing-to-water":"Nothing to water: no zone has reached its irrigation threshold.","trigger-default":"Default, finishing at sunrise","accounts-for-duration":"counted back so the run finishes then","starts-at-trigger":"starts at that moment","sequencing-sequential":"one zone at a time, so the total is every zone added up",estimated:"Estimated: the zones are calculated again just before the start.","sequencing-parallel":"all zones at once, so the total is the longest zone","headline-nothing":"Nothing to water","sub-nothing":"No zone is short enough of water yet. The next start would be {start}.","headline-watering":"Watering {start}","headline-watering-soon":"Watering at the next start","sub-watering":"{count} zone(s), {duration} in all.","headline-postponed":"Watering is held back","sub-postponed":"You postponed it. It resumes by itself, and nothing is lost: a zone that is short of water still is.","headline-skipped":"No watering today","headline-not-scheduled":"A run is owed, and nothing is scheduled to start it","sub-not-scheduled":"The time above is when it would start. No start trigger is armed right now, which happens when the active trigger is disabled or was not registered. Check the trigger under Settings, and if it looks right, a calculation re-arms it.","headline-no-trigger":"No trigger is active","sub-no-trigger":"Smart Irrigation starts no watering. Choose a start trigger in the settings to have it water."},decision:{title:"Will it be skipped?","will-run":"Nothing is holding the run back.","will-skip":"The run would be skipped.","preview-note":"Evaluated just now. A forecast can still change before the start.",unavailable:"The skip conditions could not be evaluated.","last-title":"Last real decision","last-none":"No run has been decided yet.","last-skipped":"Skipped","last-ran":"Went ahead","check-precipitation":"Rain forecast","check-days_between":"Days between irrigation","state-off":"Off","state-unavailable":"Could not be checked","state-passing":"Not blocking","state-blocking":"Blocking","detail-forecast":"Forecast","detail-threshold":"Threshold","detail-days-since":"Days since last run","detail-days-required":"Days required","check-rain_sensor":"Rain sensor","check-freeze":"Freeze","check-wind":"Wind","check-soil_moisture":"Soil moisture","detail-now":"Now","detail-weather-service":"weather service","detail-raining":"It is raining","detail-dry":"Not raining","detail-held":"sits out this run","check-postponed":"Postponed by you"},estimate:{title:"Where each zone stands now",note:"Estimated by running the calculation on the readings collected since it last ran. Nothing is committed: a zone keeps the value from its last calculation until the next one.",none:"No zone can be estimated yet.",labels:{now:"Now","at-last-calculation":"At last calculation","would-water":"Would water","last-irrigation":"Last watered"},nothing:"nothing","never-watered":"never"},postpone:{prompt:"Rain the forecast missed, or a reason of your own?","for-24":"Hold for 24 h","for-48":"Hold for 48 h",until:"Watering is held back until",resume:"Resume now"},forecast:{today:"Today"},stale:{title:"A zone is no longer being calculated",body:"Its water need is older than the others, so it is watering on old weather. Check that its sensor group still receives data, and look at the log for what the calculation said about it.",never:"never calculated"}},gaps:{auto_calc_off:{title:"No watering duration is being calculated",body:'The watering duration is set to "Only when I ask", so the zones\' durations never update by themselves. Choose "At a fixed time" or "Just before each start" under Settings, or calculate by hand when you want a run.'},no_automatic_zone:{title:"No zone waters on its own",body:"Every zone is manual or disabled, so a start reaches nothing. Set a zone to automatic for it to be watered by the schedule."},no_valve_path:{title:"Nothing here opens a valve",body:"Smart Irrigation calculates how long to water; something has to act on it. Either link a valve to a zone and turn on direct valve control, or write an automation on the start event (the blueprints do this for you). If an automation already does it, there is nothing to change."}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},hidden_sources:"{n} reading(s) not asked: the evapotranspiration is given ready-made, they would only serve to recalculate it.",et_ignored:"Zone(s) {zones} are calculated from the weather and do not read this evapotranspiration. Set them to provided by a sensor or a service on the zone.",et_missing:"Zone(s) {zones} expect a ready-made evapotranspiration: choose a source for it above.",hints:{temperature:"Air temperature, in the shade. The day's minimum and maximum are taken from it.",dewpoint:"The temperature at which the air would be saturated, which tells how much vapour it holds. The weather service is fine here.",humidity:"Relative humidity of the air. Dry air draws more water out of the plants.",pressure:"Atmospheric pressure. It changes the result very little: the weather service is enough.",windspeed:"Wind carries the humidity away from the leaves. Under glass, set a fixed value near 0.","solar radiation":"The energy of the sun, the main driver of evaporation. Without it the calculation estimates it from the day's temperature range. Under glass, use a radiation sensor or a light sensor.",precipitation:"Rain that fell, as a total, from a rain gauge of your own that adds up. With a weather service, leave it on None.","current precipitation":"Rain falling now, as a rate. The weather service provides it; a rain sensor of your own is more precise.",evapotranspiration:"The water the plants lost, already calculated by your sensor or service. Used by the zones set to provided by a sensor or a service."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-use-the":"How the readings are combined","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",weather_service:"Weather service",sensor:"Sensor",static:"Static value",radiation_sensor:"Radiation sensor",illuminance:"Light sensor (lux)"},greenhouse:"Greenhouse",greenhouse_description:"An enclosed environment: a greenhouse, a polytunnel, anything under glass or plastic. No rain reaches these zones, so precipitation is left out of their water balance and its fields are hidden. Two things to set yourself, because they cannot be guessed: give Wind speed a static value near 0, since the calculation assumes open air, and use a light sensor for Solar Radiation, since the glazing filters the sky.",module:"Calculation engine",module_description:"This group only offers the sources this engine reads. The zones using it inherit the choice.",module_undecided:"No engine chosen yet, so every source is offered and each zone using this group keeps its own. Pick one to see only the sources it reads.",wind_height:"Anemometer height (empty: taken at 2 m)"}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name"},no_items:"There are no sensor group defined yet.",title:"Sensor groups","weather-records":{title:"Weather records (last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"},summary:{"sources-one":"{n} source","sources-other":"{n} sources","zones-one":"{n} zone","zones-other":"{n} zones"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket","et-deficiency":"Daily ET deficiency",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Crop factor (Kc)",name:"Name","input-method":"Input method","input-methods":{throughput:"Throughput & area",direct:"Precipitation rate"},"input-method-hint":"How the water delivered is known: from the area and the flow of the zone, or directly as a precipitation rate if you have measured it.","state-hint":"Automatic: Smart Irrigation calculates the duration from the water balance and waters at the start. Manual: it waters only when you ask, for the duration you type. Disabled: never watered, and its balance is not followed.","mapping-hint":"The group of sensors this zone reads its weather from: a weather service, your own sensors, or both.","bucket-hint":"The water balance of the zone. Negative: it is short of water. Zero: it has what it needs. Watering brings it back to zero.","maximum-bucket-hint":"The most water the soil is taken to hold. A positive balance never goes above it: the surplus is lost.","irrigation-threshold-hint":"The deficit from which the zone is watered. Under it, the zone is left alone and the deficit rolls over to the next calculation.","drainage_rate-hint":"How fast the soil lets surplus water go. Leave it at 0 if you do not know your soil.","precipitation-rate":"Precipitation rate",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate","linked-entity":"Linked valve/switch","linked-entity-hint":"The valve or switch that waters this zone. Smart Irrigation opens and closes it when direct valve control is on. With observed watering on, any run of it (a manual tap, an automation, or Smart Irrigation itself) credits the bucket from the run time and the zone's throughput.",supply:"Supply (pump or main valve)","supply-none":"None","flow-sensor":"Cumulative volume meter","flow-sensor-hint":"For exact crediting instead of throughput x time: a cumulative water-meter total (state class total_increasing), not an instant flow rate. The unit is read automatically (L, mL, m³, gal, ft³).","safety-off-topic":"Safety off MQTT topic","safety-off-state-key":"Safety off state key","safety-off-topic-help":'Optional hardware dead-man. An MQTT set-topic (e.g. zigbee2mqtt/my_valve/set) the valve\'s device listens on. Smart Irrigation publishes an "on with timed off" there so the device shuts the valve off by itself if Home Assistant stops mid-run and never sends the close. The state key is the device\'s on/off property ("state", or "state_l1"…"state_l4" for a multi-channel device). Support depends on the device firmware (on_time) — test it before relying on it. Leave empty to disable.',optional:"optional","irrigation-threshold":"Irrigation threshold",days:"days","days-between-irrigation":"Days between irrigation","crop-factor-by-month":"Crop factor by month","crop-factor-by-month-help":"For a crop whose water use follows its growth: the crop factor (Kc) of each month, January first. A month left empty uses the crop factor above, and all twelve empty is that crop factor all year. Seasonal adjustments still apply on top.",months:{1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"},"available-water":"Available water","allowed-depletion":"Allowed depletion","available-water-help":"How much water the soil of this zone holds for the plants, in mm (the root depth in mm times what the soil holds per mm: about 1.5 for sand, 2 for loam, 2.5 for clay). Leave empty to leave things as they are. When set, the deficit cannot go below it, and once the plants have used up the allowed share of it (50% unless you change it) they draw less water, so the deficit stops growing as fast.","distribution-efficiency":"Distribution efficiency","distribution-efficiency-help":"The share of the water leaving the emitters that reaches the plants, in %. Sprinklers in wind or on a slope lose some, drip loses almost none. Leave empty for 100%. A zone at 80% waters 25% longer for the same depth, and credits only 80% of what it delivers.","days-between-irrigation-help":"Leave empty to follow the general setting (Settings, Days between irrigation). A number replaces the general setting for this zone alone: 1 waters it every day if it needs water, 3 at most every third day, 0 removes the restriction. The days are counted from the last time this zone was watered.","soil-moisture-sensor":"Soil moisture sensor","soil-moisture-sensor-hint":"The zone sits out a run while the soil is at or above the threshold. The bucket is kept.","soil-moisture-threshold":"Skip at or above","calculation-method":"Evapotranspiration","calculation-method-help":{from_weather:"From your measurements: temperature, humidity, wind, sun.",provided:"You already have an evapotranspiration in mm; it is taken as it is.",fixed:"So many mm a day, whatever the weather."},"calculation-methods":{from_weather:"Calculated by Smart Irrigation",provided:"Provided by a sensor or a service",fixed:"A fixed amount"},"forecast-days":"Look ahead","forecast-days-help":"0: the zone waters what the weather actually took. 1: tomorrow is taken into account as well, 2: tomorrow and the day after, and so on. The hotter the days ahead, the more is watered today. This is not the rain skip, which is a setting of its own.","fixed-amount":"Fixed amount","engine-shared-help":"This setting belongs to this zone alone: each zone has its own, and changing it here changes nothing anywhere else.","soil-type":"Soil","plant-type":"What grows here","soil-types":{sand:"Sandy",sandy_loam:"Sandy loam",loam:"Loam",clay_loam:"Clay loam",clay:"Clay",custom:"I set the drainage rate myself"},"plant-types":{lawn:"Lawn",vegetables:"Vegetables",flowers:"Flowers",shrubs:"Shrubs",hedge:"Hedge",fruit_trees:"Fruit trees",vines:"Vines",ground_cover:"Ground cover",custom:"I set the crop coefficient myself"},"duration-readonly-automatic":"Calculated for you: this zone's run comes from its water balance. Set it to manual to type a duration yourself.","duration-readonly-disabled":"A disabled zone is never watered, so it has no run time.","et-deficiency-help":"What this zone needs per day: ETc, the reference evapotranspiration times the crop factor, seasonal adjustment included. Before the interval scaling and before rain, which is what makes it comparable from one configuration to the next. The zone sensor also carries the reference figure on its own, as the `eto` attribute, for holding against what a weather service publishes."},no_items:"There are no zones defined yet.",title:"Zones","module-comes-from-the-group":"The calculation engine comes from this zone's sensor group. Change it there, and every zone using that group follows.",status:{estimate:"Short by {short}: about {duration} ({volume}) at the next calculation.","will-water":"Will water {duration} at the next start.",idle:"Nothing to water: {short} short.",satisfied:"Nothing to water: this zone has what it needs.","under-threshold":"Nothing to water yet: {short} short, under this zone's threshold.",manual:"Waters only when you ask.",disabled:"Disabled: never watered, and its balance is not kept.",threshold:"threshold"},calendar:{title:"Watering calendar (12 months, estimated)",caveat:"A planning estimate, not your weather: the months are modelled from your latitude and a typical seasonal pattern, so a continental summer reads hotter and drier than it is. It influences nothing, calculates nothing and waters nothing.",month:"Month",et:"ET",precipitation:"Precipitation",watering:"Watering","avg-temp":"Avg temp",none:"No watering calendar data available for this zone",error:"Could not generate the calendar"}},history:{title:"History",description:"Every irrigation run Smart Irrigation has credited to a zone: when it started, how long it watered and how much water it used. Runs are recorded by direct valve control and by observed watering, and are kept for 90 days.",refresh:"Refresh","no-data":"No irrigation runs have been recorded yet.",table:{title:"Irrigation runs",start:"Start",zone:"Zone",duration:"Duration",water:"Water used",truncated:"Showing the {count} most recent runs out of {total}."},charts:{"total-title":"Total water used per day (last 30 days)","per-zone-title":"Water used per day, per zone (last 30 days)","no-data":"No water was used in this period."}},groups:{home:"Home",zones:"Zones",data:"Data",settings:"Settings"}},Te="Smart Irrigation",ze={title:"Irrigation start triggers",description:"Configure when irrigation should start based on solar events. Define your triggers below, then choose which single one starts irrigation. For sunrise triggers, leaving offset at 0 will automatically use the total duration of all enabled zones.",active_label:"Active trigger",active_default:"Default (sunrise minus total watering duration)",active_hint:'Only the selected trigger starts irrigation, so it runs once per day. "Default" times the run to finish right at sunrise. Add custom triggers (sunset, azimuth, offsets) below, then pick one here.',usage_before:"When a trigger fires, Smart Irrigation emits the event ",usage_after:" — listen to it in an automation to start watering. The event data includes trigger_name, trigger_type and offset_minutes, so you can react differently per trigger. The precipitation skip and days-between-irrigation settings still apply: on a skip day no event is fired.",add_trigger:"Add trigger",edit_trigger:"Edit Trigger",delete_trigger:"Delete Trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth",time:"Fixed time"},fields:{name:{name:"Trigger Name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger Type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Offset (minutes)",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth Angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for Duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."},at:{name:"Time"}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete",help:"When this trigger fires, Smart Irrigation emits the following event — use it in an automation to start watering. The event data includes this trigger's name (and type/offset), so you can react to it specifically:"},offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number",time_invalid:"Please enter a valid time as HH:MM."},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can configure multiple triggers. Each enabled trigger will independently schedule irrigation starts."},active_none:"None (Smart Irrigation starts no watering)",none_selected:"No trigger is active: Smart Irrigation starts no watering, whatever the weather. The durations are still calculated; start the watering yourself or from an automation of your own."},Me={title:"Seasonal adjustments",description:"A crop factor and a threshold that follow the season. Each adjustment covers a range of months and some zones; several covering the same month multiply. The multiplier scales the zone's crop factor (1 changes nothing, 0.5 halves the water use) and the threshold adds to its irrigation threshold. A month-by-month crop factor can also be set in each zone.",add:"Add an adjustment",delete:"Delete",new_name:"New adjustment",name:"Name",month_start:"From month",month_end:"To month",multiplier:"Crop factor multiplier",threshold:"Threshold offset",zones:"Zones",zones_hint:"all, or the numbers of the zones, separated by commas.",enabled:"Enabled"},Oe={title:"Rain forecast",description:"When rain is forecast, Smart Irrigation waters less. This feature requires a weather service to be configured.",threshold_label:"Skip the run from",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation.",effective_rain_label:"Count only rain that reaches the roots",effective_rain_description:"Ignore a shower smaller than a fifth of the evapotranspiration of the period: it wets the leaves and evaporates. It is judged on the whole period between two calculations.",forecast_label:"Take the forecast rain into account",forecast_description:"Below the threshold, each zone is watered for its deficit less the rain forecast for the next 24 hours, weighted by the probability the weather service gives: 4 mm forecast against a 10 mm deficit waters 6 mm. At or above the threshold, the run is skipped for the zones in the open. Zones in a greenhouse are not affected."},Ae={title:"Location coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Ee={title:"Days between irrigation",description:"Configure the minimum number of days that must pass between irrigation events. This helps control watering frequency for water conservation and plant health management.\n\nTypical real-world use cases:\n• Lawn care: 1-2 day intervals prevent overwatering\n• Drought restrictions: 6+ day intervals for weekly watering\n• Deep-rooted plants: 3-7 day intervals for less frequent watering\n• Water conservation: Customizable based on climate and soil conditions",label:"Minimum days between irrigation",help_text:"Set to 0 to disable this feature. Values from 1-365 days are supported. This setting works alongside existing precipitation forecasting logic. A zone can have its own number of days in the Zones tab, which replaces this setting for that zone."},Ce={title:"Planning",description:"What the programs will water over the next three days. The weather is not known that far ahead: a run goes ahead if nothing holds it back.",nothing_planned:"No program is planned. Add a schedule to a program.",nothing_now:"Nothing is watering now.",paused:"Paused",waiting:"waiting for its turn",step:"step",tour:"round",tours:"rounds",remaining:"left"},He={title:"Programs",description:"A program waters its steps one after the other. A step is one zone, or several watered together, and by default takes the duration Smart Irrigation calculated for it. Several programs never run at the same time: the next one waits its turn.",main_description:"The main program waters every zone with the start trigger, the sequencing and the pauses set in the cards above. It has nothing else to edit here.",name:"Name",step:"Step",step_zones:"Zones",step_zones_help:"Zones ticked in the same step are watered at the same time.",step_duration:"Duration",mode_calculated:"Calculated by Smart Irrigation",mode_percent:"Calculated, times a percentage",mode_fixed:"Fixed",percent:"Percentage of the calculated water",seconds:"Seconds of water",passes:"Passes (cycle and soak)",step_delay:"Wait after this step",step_delay_help:"Empty: the program's wait.",delay:"Wait between steps",delay_help:"Seconds waited after each step, for line pressure or a slow valve.",tours:"Rounds",tours_help:"The whole list is watered this many times, each round with its share of the water, so the soil can take it in between.",enabled:"Enabled",add_step:"Add a step",delete_step:"Delete the step",add:"Add a program",delete:"Delete the program",schedule:"Schedule",add_schedule:"Add a schedule",delete_schedule:"Delete the schedule",schedule_moment:"At",moment_time:"A time of day",moment_sunrise:"Sunrise",moment_sunset:"Sunset",schedule_time:"Time",schedule_offset:"Offset from the sun",schedule_anchor:"That moment is when the program",anchor_start:"starts",anchor_end:"must be done",schedule_anchor_help:'With "must be done", the program starts early enough, from the length of what it has to water, to finish at that moment.',schedule_weekdays:"Days of the week",schedule_weekdays_help:"None ticked: every day.",schedule_every:"Every",schedule_days:"days",schedule_every_offset:"Shifted by",schedule_every_help:"Every 3 days with a shift of 0, 1 or 2 lets three programs take turns, one day in three, never on the same day.",schedule_parity:"Days of the month",parity_any:"All",parity_even:"Even days",parity_odd:"Odd days",schedule_months:"Months",schedule_months_help:"None ticked: every month.",schedule_from:"From",schedule_until:"Until",schedule_period_help:"A period of the year, which may run over New Year (11-01 to 03-01). Empty: the whole year.",schedule_weather:"Take the weather into account",schedule_weather_help:"Rain, frost, wind, a wet soil and the days you postponed can hold the run back or shorten it. Turn it off for a greenhouse drip line that does not care.",pause:"Pause",resume:"Resume",next_step:"Next step",stop:"Stop",controls_help:"For a watering that is under way. Pause closes the valves and holds everything; the rest is watered after the resume. Next step ends the zones the program is on. Stop ends everything.",run_now:"Run now"},De={title:"Pumps and main valves",description:"A supply runs while a zone it feeds is being watered: a pump, or a main valve in front of the zone valves. Pick it in each zone's settings. The delays are in seconds and signed.",name:"Name",entities:"Entities",entities_hint:"separate several with commas",delay_before:"Delay before",delay_before_help:"Positive: the supply comes on this long before the zone valve opens. Negative: the valve opens first and the supply comes on this long after.",delay_after:"Delay after",delay_after_help:"Positive: the supply stays on this long after the zone valve closes. Negative: the supply goes off this long before the valve closes, so a pump never pushes against a closed valve.",enabled:"Enabled",add:"Add a supply",delete:"Delete"},Ne={title:"Observed watering (closed loop)",description:"Credit each zone's bucket automatically from real irrigation, instead of resetting the bucket from an automation. Once enabled, pick a valve/switch entity per zone in the Zones tab: while it is open, the bucket is credited from the run time and the zone's throughput. For exact accounting you can also pick a cumulative volume meter (a water-meter style total) per zone, and the measured volume is used instead. Important: when this is on it is the only thing crediting the bucket, so remove any reset_bucket call from your irrigation automation to avoid double counting.",enabled_label:"Enable observed watering",direct_control_label:"Let Smart Irrigation control the valve",direct_control_description:"When on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it - no automation needed. An in-flight run resumes after a restart. Safety: if Home Assistant goes down for a long time mid-run the valve stays open and keeps watering, so give your valve a hardware failsafe (a maximum runtime).",full_controller_label:"Full controller: Smart Irrigation runs all my watering",full_controller_description:"Turns on valve control and a main program built from the settings below. Nothing changes for your zones until you add more: the start trigger, the sequencing, the pause between zones and cycle and soak keep working as they did. Switching it off brings back exactly the previous behaviour. A valve found open at startup that no run of ours owns is closed.",sequencing_label:"Zone sequencing",sequencing:{sequential:"Sequential (one zone at a time)",parallel:"Parallel (all zones at once)"},sequencing_description:"How your zones are watered. This sets what a start trigger works back from when it has to finish at sunrise: one after another takes the sum of every zone's run time, all at once takes the longest of them. It applies whether Smart Irrigation opens the valves itself or an automation of your own does.",passes_label:"Water in several passes",passes_description:"Cycle and soak: the same water, split into shorter passes with a pause between them, so heavy soil takes it in instead of letting it run off. One pass waters in a single go, which is the default. A run too short to split is left alone.",soak_label:"Soak between passes",pause_between_zones_label:"Pause between zones",pause_between_zones_description:"A wait between two zones of a sequential run: time for the line pressure to recover, or for a slow valve to finish closing before the next one opens.",minutes:"minutes",seconds:"seconds"},Re={title:"Calculation log",description:"Write the complete input of every calculation to a file, so two days that look alike but water very differently can be compared afterwards. Each calculation appends one line: the sensor group records and how they were aggregated, the module intermediates (solar radiation, net radiation, ET0), and the resulting bucket, duration and volume. Off by default; the file is capped in size and rotated, so it can be left on for a season.",enabled_label:"Log calculation inputs to a file",file_hint:"Written to config/smart_irrigation/calc_log.jsonl, one JSON record per line. The most recent records are also included in the diagnostics download (coordinates rounded, entity ids removed), so you can attach them to an issue in one step."},Pe={title:"Skip on measured conditions",description:"Checked at the start of each run, from a sensor or the weather service. A sensor that cannot be read never stops a run.",enabled:"Enabled",threshold:"Threshold",sensor:"Sensor","sensor-optional":"Sensor (optional)",rain:{title:"Rain sensor",description:"Skip the run while a rain sensor says it is raining.","sensor-hint":"A binary sensor that is on while it rains.","history-label":"Shorten runs after recent rain","history-description":"For a zone that has no rain in millimetres at all: no gauge, and a weather service that gives none. The sensor's own history over the last five days is read, weighted so that yesterday counts for more than four days ago, and the run is shortened by it. A day of reported rain today takes the whole run; four days ago takes a tenth of it. It never touches the water balance, because it does not know how many millimetres fell: the deficit stays and is watered off once the weather turns. A zone whose sensor group does report rain in millimetres is left alone, since the balance already has it. This needs a sensor that stays on while it rains rather than one that pulses per tip."},freeze:{title:"Freeze",description:"Skip the run when the temperature is at or below the threshold.","sensor-hint":"Empty: the weather service's current temperature."},wind:{title:"Wind",description:"Skip the run when the wind is at or above the threshold: a sprinkler in strong wind waters the path, not the bed.","sensor-hint":"Empty: the weather service's current wind, at 10 m."}},Le={next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"rain forecast",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water"}},je={common:we,defaults:$e,module:xe,calcmodules:ke,panels:Se,title:Te,irrigation_start_triggers:ze,seasonal_adjustments:Me,weather_skip:Oe,coordinate_config:Ae,days_between_irrigation:Ee,planning:Ce,programs:He,supplies:De,observed_watering:Ne,calculation_log:Re,measured_skip:Pe,card:Le},Ie=Object.freeze({__proto__:null,calcmodules:ke,calculation_log:Re,card:Le,common:we,coordinate_config:Ae,days_between_irrigation:Ee,default:je,defaults:$e,irrigation_start_triggers:ze,measured_skip:Pe,module:xe,observed_watering:Ne,panels:Se,planning:Ce,programs:He,seasonal_adjustments:Me,supplies:De,title:Te,weather_skip:Oe});function Be(e,t){const s=t&&t.cache?t.cache:Ze,i=t&&t.serializer?t.serializer:Ve;return(t&&t.strategy?t.strategy:We)(e,{cache:s,serializer:i})}function Ue(e,t,s,i){const a=null==(n=i)||"number"==typeof n||"boolean"==typeof n?i:s(i);var n;let r=t.get(a);return void 0===r&&(r=e.call(this,i),t.set(a,r)),r}function Fe(e,t,s){const i=Array.prototype.slice.call(arguments,3),a=s(i);let n=t.get(a);return void 0===n&&(n=e.apply(this,i),t.set(a,n)),n}function Ye(e,t,s,i,a){return s.bind(t,e,i,a)}function We(e,t){return Ye(e,this,1===e.length?Ue:Fe,t.cache.create(),t.serializer)}const Ve=function(){return JSON.stringify(arguments)};var Ge=class{constructor(){this.cache=Object.create(null)}get(e){return this.cache[e]}set(e,t){this.cache[e]=t}};const Ze={create:function(){return new Ge}},qe={variadic:function(e,t){return Ye(e,this,Fe,t.cache.create(),t.serializer)}},Ke=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Je(e){const t={};return e.replace(Ke,(e=>{const s=e.length;switch(e[0]){case"G":t.era=4===s?"long":5===s?"narrow":"short";break;case"y":t.year=2===s?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][s-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][s-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===s?"long":5===s?"narrow":"short";break;case"e":if(s<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][s-3];break;case"c":if(s<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][s-3];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][s-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][s-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][s-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][s-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][s-1];break;case"s":t.second=["numeric","2-digit"][s-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=s<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}const Xe=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;const Qe=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,et=/^(@+)?(\+|#+)?[rs]?$/g,tt=/(\*)(0+)|(#+)(0+)|(0+)/g,st=/^(0+)$/;function it(e){const t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(et,(function(e,s,i){return"string"!=typeof i?(t.minimumSignificantDigits=s.length,t.maximumSignificantDigits=s.length):"+"===i?t.minimumSignificantDigits=s.length:"#"===s[0]?t.maximumSignificantDigits=s.length:(t.minimumSignificantDigits=s.length,t.maximumSignificantDigits=s.length+("string"==typeof i?i.length:0)),""})),t}function at(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function nt(e){let t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){const s=e.slice(0,2);if("+!"===s?(t.signDisplay="always",e=e.slice(2)):"+?"===s&&(t.signDisplay="exceptZero",e=e.slice(2)),!st.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function rt(e){const t=at(e);return t||{}}function ot(e){let t={};for(const s of e){switch(s.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=s.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=s.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t={...t,notation:"scientific",...s.options.reduce(((e,t)=>({...e,...rt(t)})),{})};continue;case"engineering":t={...t,notation:"engineering",...s.options.reduce(((e,t)=>({...e,...rt(t)})),{})};continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(s.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(s.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");s.options[0].replace(tt,(function(e,s,i,a,n,r){if(s)t.minimumIntegerDigits=i.length;else{if(a&&n)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(st.test(s.stem)){t.minimumIntegerDigits=s.stem.length;continue}if(Qe.test(s.stem)){if(s.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");s.stem.replace(Qe,(function(e,s,i,a,n,r){return"*"===i?t.minimumFractionDigits=s.length:a&&"#"===a[0]?t.maximumFractionDigits=a.length:n&&r?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+r.length):(t.minimumFractionDigits=s.length,t.maximumFractionDigits=s.length),""}));const e=s.options[0];"w"===e?t={...t,trailingZeroDisplay:"stripIfInteger"}:e&&(t={...t,...it(e)});continue}if(et.test(s.stem)){t={...t,...it(s.stem)};continue}const e=at(s.stem);e&&(t={...t,...e});const i=nt(s.stem);i&&(t={...t,...i})}return t}let lt=function(e){return e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG",e}({});function ht(e){return 0===e.type}function dt(e){return 1===e.type}function ct(e){return 2===e.type}function ut(e){return 3===e.type}function pt(e){return 4===e.type}function gt(e){return 5===e.type}function mt(e){return 6===e.type}function ft(e){return 7===e.type}function vt(e){return 8===e.type}function _t(e){return!(!e||"object"!=typeof e||0!==e.type)}function bt(e){return!(!e||"object"!=typeof e||1!==e.type)}const yt=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,wt={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GS:["H","h","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ku-SY":["H","hB"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function $t(e){let t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}const s=e.language;let i;return"root"!==s&&(i=e.maximize().region),(wt[i||""]||wt[s||""]||wt[`${s}-001`]||wt["001"])[0]}const xt=new RegExp(`^${yt.source}*`),kt=new RegExp(`${yt.source}*$`);function St(e,t){return{start:e,end:t}}const Tt=!!Object.fromEntries,zt=!!String.prototype.trimStart,Mt=!!String.prototype.trimEnd,Ot=Tt?Object.fromEntries:function(e){const t={};for(const[s,i]of e)t[s]=i;return t},At=zt?function(e){return e.trimStart()}:function(e){return e.replace(xt,"")},Et=Mt?function(e){return e.trimEnd()}:function(e){return e.replace(kt,"")},Ct=new RegExp("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");var Ht=class{constructor(e,t={}){this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}parse(){if(0!==this.offset())throw Error("parser can only be used once");if(this.message.length>0){const e=this.message.charCodeAt(0);if(35!==e&&39!==e&&60!==e&&123!==e&&125!==e){const e=function(e){if(0===e.length)return null;let t=1,s=1;for(let i=0;i<e.length;){const a=e.charCodeAt(i);switch(a){case 35:case 39:case 60:case 123:case 125:return null}if(10===a)t++,s=1,i++;else if(s++,a>=55296&&a<=56319&&i+1<e.length){const t=e.charCodeAt(i+1);i+=t>=56320&&t<=57343?2:1}else i++}return{offset:e.length,line:t,column:s}}(this.message);if(e){const t=this.clonePosition();return this.position=e,{val:[{type:0,value:this.message,location:St(t,this.clonePosition())}],err:null}}}}return this.parseMessage(0,"",!1)}parseMessage(e,t,s){let i=[];for(;!this.isEOF();){const a=this.char();if(123===a){const t=this.parseArgument(e,s);if(t.err)return t;i.push(t.val)}else{if(125===a&&e>0)break;if(35!==a||"plural"!==t&&"selectordinal"!==t){if(60===a&&!this.ignoreTag&&47===this.peek()){if(s)break;return this.error(26,St(this.clonePosition(),this.clonePosition()))}if(60===a&&!this.ignoreTag&&Dt(this.peek()||0)){const s=this.parseTag(e,t);if(s.err)return s;i.push(s.val)}else{const s=this.parseLiteral(e,t);if(s.err)return s;i.push(s.val)}}else{const e=this.clonePosition();this.bump(),i.push({type:7,location:St(e,this.clonePosition())})}}}return{val:i,err:null}}parseTag(e,t){const s=this.clonePosition();this.bump();const i=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:0,value:`<${i}/>`,location:St(s,this.clonePosition())},err:null};if(this.bumpIf(">")){const a=this.parseMessage(e+1,t,!0);if(a.err)return a;const n=a.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!Dt(this.char()))return this.error(23,St(r,this.clonePosition()));const e=this.clonePosition();return i!==this.parseTagName()?this.error(26,St(e,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:8,value:i,children:n,location:St(s,this.clonePosition())},err:null}:this.error(23,St(r,this.clonePosition())))}return this.error(27,St(s,this.clonePosition()))}return this.error(23,St(s,this.clonePosition()))}parseTagName(){const e=this.offset();for(this.bump();!this.isEOF()&&Nt(this.char());)this.bump();return this.message.slice(e,this.offset())}parseLiteral(e,t){const s=this.clonePosition();let i="";for(;;){const s=this.tryParseQuote(t);if(s){i+=s;continue}const a=this.tryParseUnquoted(e,t);if(a){i+=a;continue}const n=this.tryParseLeftAngleBracket();if(!n)break;i+=n}return{val:{type:0,value:i,location:St(s,this.clonePosition())},err:null}}tryParseLeftAngleBracket(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(Dt(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e}tryParseQuote(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();const t=[this.char()];for(this.bump();!this.isEOF();){const e=this.char();if(39===e){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(e);this.bump()}return String.fromCodePoint(...t)}tryParseUnquoted(e,t){if(this.isEOF())return null;const s=this.char();return 60===s||123===s||35===s&&("plural"===t||"selectordinal"===t)||125===s&&e>0?null:(this.bump(),String.fromCodePoint(s))}parseArgument(e,t){const s=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(1,St(s,this.clonePosition()));if(125===this.char())return this.bump(),this.error(2,St(s,this.clonePosition()));let i=this.parseIdentifierIfPossible().value;if(!i)return this.error(3,St(s,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(1,St(s,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:1,value:i,location:St(s,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(1,St(s,this.clonePosition())):this.parseArgumentOptions(e,t,i,s);default:return this.error(3,St(s,this.clonePosition()))}}parseIdentifierIfPossible(){const e=this.clonePosition(),t=this.offset(),s=function(e,t){return Ct.lastIndex=t,Ct.exec(e)[1]??""}(this.message,t),i=t+s.length;return this.bumpTo(i),{value:s,location:St(e,this.clonePosition())}}parseArgumentOptions(e,t,s,i){let a=this.clonePosition(),n=this.parseIdentifierIfPossible().value,r=this.clonePosition();switch(n){case"":return this.error(4,St(a,r));case"number":case"date":case"time":{this.bumpSpace();let e=null;if(this.bumpIf(",")){this.bumpSpace();const t=this.clonePosition(),s=this.parseSimpleArgStyleIfPossible();if(s.err)return s;const i=Et(s.val);if(0===i.length)return this.error(6,St(this.clonePosition(),this.clonePosition()));e={style:i,styleLocation:St(t,this.clonePosition())}}const t=this.tryParseArgumentClose(i);if(t.err)return t;const a=St(i,this.clonePosition());if(e&&e.style.startsWith("::")){let t=At(e.style.slice(2));if("number"===n){const i=this.parseNumberSkeletonFromString(t,e.styleLocation);return i.err?i:{val:{type:2,value:s,location:a,style:i.val},err:null}}{if(0===t.length)return this.error(10,a);let i=t;this.locale&&(i=function(e,t){let s="";for(let i=0;i<e.length;i++){const a=e.charAt(i);if("j"===a){let n=0;for(;i+1<e.length&&e.charAt(i+1)===a;)n++,i++;let r=1+(1&n),o=n<2?1:3+(n>>1),l="a",h=$t(t);for("H"!=h&&"k"!=h||(o=0);o-- >0;)s+=l;for(;r-- >0;)s=h+s}else s+="J"===a?"H":a}return s}(t,this.locale));return{val:{type:"date"===n?3:4,value:s,location:a,style:{type:1,pattern:i,location:e.styleLocation,parsedOptions:this.shouldParseSkeletons?Je(i):{}}},err:null}}}return{val:{type:"number"===n?2:"date"===n?3:4,value:s,location:a,style:e?.style??null},err:null}}case"plural":case"selectordinal":case"select":{const a=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(12,St(a,{...a}));this.bumpSpace();let r=this.parseIdentifierIfPossible(),o=0;if("select"!==n&&"offset"===r.value){if(!this.bumpIf(":"))return this.error(13,St(this.clonePosition(),this.clonePosition()));this.bumpSpace();const e=this.tryParseDecimalInteger(13,14);if(e.err)return e;this.bumpSpace(),r=this.parseIdentifierIfPossible(),o=e.val}const l=this.tryParsePluralOrSelectOptions(e,n,t,r);if(l.err)return l;const h=this.tryParseArgumentClose(i);if(h.err)return h;const d=St(i,this.clonePosition());return"select"===n?{val:{type:5,value:s,options:Ot(l.val),location:d},err:null}:{val:{type:6,value:s,options:Ot(l.val),offset:o,pluralType:"plural"===n?"cardinal":"ordinal",location:d},err:null}}default:return this.error(5,St(a,r))}}tryParseArgumentClose(e){return this.isEOF()||125!==this.char()?this.error(1,St(e,this.clonePosition())):(this.bump(),{val:!0,err:null})}parseSimpleArgStyleIfPossible(){let e=0;const t=this.clonePosition();for(;!this.isEOF();)switch(this.char()){case 39:{this.bump();let e=this.clonePosition();if(!this.bumpUntil("'"))return this.error(11,St(e,this.clonePosition()));this.bump();break}case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}return{val:this.message.slice(t.offset,this.offset()),err:null}}parseNumberSkeletonFromString(e,t){let s=[];try{s=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");const t=e.split(Xe).filter((e=>e.length>0)),s=[];for(const e of t){let t=e.split("/");if(0===t.length)throw new Error("Invalid number skeleton");const[i,...a]=t;for(const e of a)if(0===e.length)throw new Error("Invalid number skeleton");s.push({stem:i,options:a})}return s}(e)}catch{return this.error(7,t)}return{val:{type:0,tokens:s,location:t,parsedOptions:this.shouldParseSkeletons?ot(s):{}},err:null}}tryParsePluralOrSelectOptions(e,t,s,i){let a=!1;const n=[],r=new Set;let{value:o,location:l}=i;for(;;){if(0===o.length){const e=this.clonePosition();if("select"===t||!this.bumpIf("="))break;{const t=this.tryParseDecimalInteger(16,19);if(t.err)return t;l=St(e,this.clonePosition()),o=this.message.slice(e.offset,this.offset())}}if(r.has(o))return this.error("select"===t?21:20,l);"other"===o&&(a=!0),this.bumpSpace();const i=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?17:18,St(this.clonePosition(),this.clonePosition()));const h=this.parseMessage(e+1,t,s);if(h.err)return h;const d=this.tryParseArgumentClose(i);if(d.err)return d;n.push([o,{value:h.val,location:St(i,this.clonePosition())}]),r.add(o),this.bumpSpace(),({value:o,location:l}=this.parseIdentifierIfPossible())}return 0===n.length?this.error("select"===t?15:16,St(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!a?this.error(22,St(this.clonePosition(),this.clonePosition())):{val:n,err:null}}tryParseDecimalInteger(e,t){let s=1;const i=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(s=-1);let a=!1,n=0;for(;!this.isEOF();){const e=this.char();if(!(e>=48&&e<=57))break;a=!0,n=10*n+(e-48),this.bump()}const r=St(i,this.clonePosition());return a?(n*=s,Number.isSafeInteger(n)?{val:n,err:null}:this.error(t,r)):this.error(e,r)}offset(){return this.position.offset}isEOF(){return this.offset()===this.message.length}clonePosition(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}}char(){const e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");const t=this.message.codePointAt(e);if(void 0===t)throw Error(`Offset ${e} is at invalid UTF-16 code unit boundary`);return t}error(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}}bump(){if(this.isEOF())return;const e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}bumpIf(e){if(this.message.startsWith(e,this.offset())){for(let t=0;t<e.length;t++)this.bump();return!0}return!1}bumpUntil(e){const t=this.offset(),s=this.message.indexOf(e,t);return s>=0?(this.bumpTo(s),!0):(this.bumpTo(this.message.length),!1)}bumpTo(e){if(this.offset()>e)throw Error(`targetOffset ${e} must be greater than or equal to the current offset ${this.offset()}`);for(e=Math.min(e,this.message.length);;){const t=this.offset();if(t===e)break;if(t>e)throw Error(`targetOffset ${e} is at invalid UTF-16 code unit boundary`);if(this.bump(),this.isEOF())break}}bumpSpace(){for(;!this.isEOF()&&Rt(this.char());)this.bump()}peek(){if(this.isEOF())return null;const e=this.char(),t=this.offset();return this.message.charCodeAt(t+(e>=65536?2:1))??null}};function Dt(e){return e>=97&&e<=122||e>=65&&e<=90}function Nt(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function Rt(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function Pt(e){e.forEach((e=>{if(delete e.location,gt(e)||mt(e))for(const t in e.options)delete e.options[t].location,Pt(e.options[t].value);else ct(e)&&_t(e.style)||(ut(e)||pt(e))&&bt(e.style)?delete e.style.location:vt(e)&&Pt(e.children)}))}function Lt(e,t={}){t={shouldParseSkeletons:!0,requiresOtherClause:!0,...t};const s=new Ht(e,t).parse();if(s.err){const e=SyntaxError(lt[s.err.kind]);throw e.location=s.err.location,e.originalMessage=s.err.message,e}return t?.captureLocation||Pt(s.val),s.val}var jt=class extends Error{constructor(e,t,s){super(e),this.code=t,this.originalMessage=s}toString(){return`[formatjs Error: ${this.code}] ${this.message}`}},It=class extends jt{constructor(e,t,s,i){super(`Invalid values for "${e}": "${t}". Options are "${Object.keys(s).join('", "')}"`,"INVALID_VALUE",i)}},Bt=class extends jt{constructor(e,t,s){super(`Value for "${e}" must be of type ${t}`,"INVALID_VALUE",s)}},Ut=class extends jt{constructor(e,t){super(`The intl string context variable "${e}" was not provided to the string "${t}"`,"MISSING_VALUE",t)}};function Ft(e){return"function"==typeof e}function Yt(e,t,s,i,a,n,r){if(1===e.length&&ht(e[0]))return[{type:0,value:e[0].value}];const o=[];for(const l of e){if(ht(l)){o.push({type:0,value:l.value});continue}if(ft(l)){"number"==typeof n&&o.push({type:0,value:s.getNumberFormat(t).format(n)});continue}const{value:e}=l;if(!a||!(e in a))throw new Ut(e,r);let h=a[e];if(dt(l))h&&"string"!=typeof h&&"number"!=typeof h&&"bigint"!=typeof h||(h="string"==typeof h||"number"==typeof h||"bigint"==typeof h?String(h):""),o.push({type:"string"==typeof h?0:1,value:h});else if(ut(l)){const e="string"==typeof l.style?i.date[l.style]:bt(l.style)?l.style.parsedOptions:void 0;o.push({type:0,value:s.getDateTimeFormat(t,e).format(h)})}else if(pt(l)){const e="string"==typeof l.style?i.time[l.style]:bt(l.style)?l.style.parsedOptions:i.time.medium;o.push({type:0,value:s.getDateTimeFormat(t,e).format(h)})}else if(ct(l)){const e="string"==typeof l.style?i.number[l.style]:_t(l.style)?l.style.parsedOptions:void 0;if(e&&e.scale){const t=e.scale||1;if("bigint"==typeof h){if(!Number.isInteger(t))throw new TypeError(`Cannot apply fractional scale ${t} to bigint value. Scale must be an integer when formatting bigint.`);h*=BigInt(t)}else h*=t}o.push({type:0,value:s.getNumberFormat(t,e).format(h)})}else{if(vt(l)){const{children:e,value:h}=l,d=a[h];if(!Ft(d))throw new Bt(h,"function",r);let c=d(Yt(e,t,s,i,a,n).map((e=>e.value)));Array.isArray(c)||(c=[c]),o.push(...c.map((e=>({type:"string"==typeof e?0:1,value:e}))))}if(gt(l)){const e=h,n=(Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0)||l.options.other;if(!n)throw new It(l.value,h,Object.keys(l.options),r);o.push(...Yt(n.value,t,s,i,a))}else if(mt(l)){const e=`=${h}`;let n=Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0;if(!n){if(!Intl.PluralRules)throw new jt('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',"MISSING_INTL_API",r);const e="bigint"==typeof h?Number(h):h,i=s.getPluralRules(t,{type:l.pluralType}).select(e-(l.offset||0));n=(Object.prototype.hasOwnProperty.call(l.options,i)?l.options[i]:void 0)||l.options.other}if(!n)throw new It(l.value,h,Object.keys(l.options),r);const d="bigint"==typeof h?Number(h):h;o.push(...Yt(n.value,t,s,i,a,d-(l.offset||0)))}else;}}return(l=o).length<2?l:l.reduce(((e,t)=>{const s=e[e.length-1];return s&&0===s.type&&0===t.type?s.value+=t.value:e.push(t),e}),[]);var l}function Wt(e,t){return t?Object.keys(e).reduce(((s,i)=>{var a,n;return s[i]=(a=e[i],(n=t[i])?{...a,...n,...Object.keys(a).reduce(((e,t)=>(e[t]={...a[t],...n[t]},e)),{})}:a),s}),{...e}):e}function Vt(e){return{create:()=>({get:t=>e[t],set(t,s){e[t]=s}})}}var Gt=class e{constructor(t,s=e.defaultLocale,i,a){if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=e=>{const t=this.formatToParts(e);if(1===t.length)return t[0].value;const s=t.reduce(((e,t)=>(e.length&&0===t.type&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e)),[]);return s.length<=1?s[0]||"":s},this.formatToParts=e=>Yt(this.ast,this.locales,this.formatters,this.formats,e,void 0,this.message),this.resolvedOptions=()=>({locale:this.resolvedLocale?.toString()||Intl.NumberFormat.supportedLocalesOf(this.locales)[0]}),this.getAst=()=>this.ast,this.locales=s,this.resolvedLocale=e.resolveLocale(s),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");const{...s}=a||{};this.ast=e.__parse(t,{...s,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Wt(e.formats,i),this.formatters=a&&a.formatters||function(e={number:{},dateTime:{},pluralRules:{}}){return{getNumberFormat:Be(((...e)=>new Intl.NumberFormat(...e)),{cache:Vt(e.number),strategy:qe.variadic}),getDateTimeFormat:Be(((...e)=>new Intl.DateTimeFormat(...e)),{cache:Vt(e.dateTime),strategy:qe.variadic}),getPluralRules:Be(((...e)=>new Intl.PluralRules(...e)),{cache:Vt(e.pluralRules),strategy:qe.variadic})}}(this.formatterCache)}static{this.memoizedDefaultLocale=null}static get defaultLocale(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale}static{this.resolveLocale=e=>{if(void 0===Intl.Locale)return;const t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])}}static{this.__parse=Lt}static{this.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}}}};const Zt="/api/smart_irrigation/languages",qt=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sv","uk","zh-Hans"],Kt={en:Ie},Jt={};function Xt(e){return(e||"").replace(/['"]+/g,"")}function Qt(e,t,...s){const i=Xt(t);let a;try{a=e.split(".").reduce(((e,t)=>e[t]),Kt[i])}catch(t){a=e.split(".").reduce(((e,t)=>e[t]),Kt.en)}if(void 0===a&&(a=e.split(".").reduce(((e,t)=>e[t]),Kt.en)),!s.length)return a;const n={};for(let e=0;e<s.length;e+=2){let t=s[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=s[e+1]}try{return new Gt(a,t).format(n)}catch(e){return"Translation "+e}}var es,ts;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(es||(es={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ts||(ts={}));const ss=(e,t,s,i)=>{i=i||{},s=null==s?{}:s;const a=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return a.detail=s,e.dispatchEvent(a),a},is="v2026.10.1",as="smart_irrigation",ns="precipitation_threshold_mm",rs="irrigation_start_triggers",os="sunrise",ls="solar_azimuth",hs="time",ds="minutes",cs="hours",us="days",ps="imperial",gs="metric",ms="Dewpoint",fs="Evapotranspiration",vs="Humidity",_s="Maximum Temperature",bs="Minimum Temperature",ys="Precipitation",ws="module",$s="Current Precipitation",xs="Pressure",ks="Solar Radiation",Ss="Temperature",Ts="Windspeed",zs="Open-Meteo",Ms=[zs],Os="weather_service",As="sensor",Es="static",Cs="illuminance",Hs="pressure_type",Ds="wind_height",Ns="absolute",Rs="relative",Ps="none",Ls="source",js="sensorentity",Is="static_value",Bs="unit",Us="aggregate",Fs=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],Ys="sq ft",Ws="l/minute",Vs="gal/minute",Gs="°C",Zs="mm",qs="in",Ks="meter/s",Js="MJ/day/m2",Xs="mm/h",Qs="in/h",ei="name",ti="size",si="throughput",ii="state",ai="duration",ni="water_volume",ri="bucket",oi="multiplier",li="mapping",hi="lead_time",di="maximum_duration",ci="maximum_bucket",ui="irrigation_threshold",pi="drainage_rate",gi="linked_entity",mi="days_between_irrigation",fi="available_water",vi="crop_factor_by_month",_i="allowed_depletion",bi="distribution_efficiency",yi="safety_off_topic",wi="supply_id",$i="safety_off_state_key",xi="flow_sensor",ki="soil_moisture_sensor",Si="soil_moisture_threshold",Ti="input_method",zi="throughput",Mi="direct",Oi="precipitation_rate",Ai=2,Ei=e=>(...t)=>({_$litDirective$:e,values:t});let Ci=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class Hi extends Ci{constructor(e){if(super(e),this.it=Z,e.type!==Ai)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===Z||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Hi.directiveName="unsafeHTML",Hi.resultType=1;const Di=Ei(Hi);function Ni(e,t){return(e=e.toString()).split(",")[t]}function Ri(e,t,s){var i,a,n;const r=new Date(e);if(isNaN(r.getTime()))return"-";const o=null!==(n=null!==(a=null===(i=null==t?void 0:t.locale)||void 0===i?void 0:i.language)&&void 0!==a?a:null==t?void 0:t.language)&&void 0!==n?n:navigator.language;try{return new Intl.DateTimeFormat(o,s).format(r)}catch(e){return r.toLocaleString()}}function Pi(e,t){const s=(null==e?void 0:e.units)==gs;switch(t){case pi:case Oi:return s?Xs:Qs;case ns:case ri:return s?Zs:qs;case ti:return s?"m²":Ys;case si:return s?Ws:Vs;case ni:return s?"L":"gal";default:return""}}function Li(e,t){switch(t){case pi:case Oi:return e.units==gs?W`${Di(Xs)}`:W`${Di(Qs)}`;case ns:case ri:return e.units==gs?W`${Di(Zs)}`:W`${Di(qs)}`;case ti:return e.units==gs?W`${Di("m<sup>2</sup>")}`:W`${Di(Ys)}`;case si:return e.units==gs?W`${Di(Ws)}`:W`${Di(Vs)}`;case ni:return e.units==gs?W`${Di("L")}`:W`${Di("gal")}`;default:return W``}}function ji(e){const t=Math.max(0,Math.round(Number(e)||0)),s=Math.floor(t/3600),i=Math.floor(t%3600/60),a=t%60,n=e=>String(e).padStart(2,"0");return`${n(s)}:${n(i)}:${n(a)}`}function Ii(e,t){const s=Number(e)||0,i=Number(t)||0;return s<=0||i<=0?0:s/60*i}function Bi(e,t){const s=Number(e)||0;return(null==t?void 0:t.units)===gs?s:s/3.785411784}function Ui(e,t){const s=Number(e)||0;return(null==t?void 0:t.units)===gs?s:s/25.4}function Fi(e){switch(e){case ms:case Ss:return[{unit:Gs,system:gs},{unit:"°F",system:ps}];case ys:case fs:return[{unit:Zs,system:gs},{unit:qs,system:ps}];case $s:return[{unit:Xs,system:gs},{unit:Qs,system:ps}];case vs:return[{unit:"%",system:[gs,ps]}];case xs:return[{unit:"millibar",system:gs},{unit:"hPa",system:gs},{unit:"psi",system:ps},{unit:"inch Hg",system:ps}];case Ts:return[{unit:"km/h",system:gs},{unit:Ks,system:gs},{unit:"mile/h",system:ps},{unit:"knot",system:[gs,ps]}];case ks:return[{unit:"W/m2",system:gs},{unit:Js,system:gs},{unit:"W/sq ft",system:ps},{unit:"MJ/day/sq ft",system:ps}];default:return[]}}function Yi(e,t){!function(e,t){ss(e,"show-dialog",{dialogTag:"smart-irrigation-error-dialog",dialogImport:()=>Promise.resolve().then((function(){return mn})),dialogParams:{error:t}})}(t,W`
    ${e.error}:${e.body.message?W` ${e.body.message} `:""}
  `)}const Wi=(e,t,s=!1)=>{s?history.replaceState(null,"",t):history.pushState(null,"",t),ss(window,"location-changed",{replace:s})},Vi={Static:"manual",Passthrough:"standard",PyETO:"advanced"};function Gi(e,t){if(!e)return"";const s=Vi[e];return s?Qt(`common.modes.${s}`,t):e}const Zi=e=>e.callWS({type:as+"/config"}),qi=e=>e.callWS({type:as+"/weatherservice"}),Ki=e=>e.callWS({type:as+"/zones"}),Ji=(e,t)=>e.callApi("POST",as+"/zones",t),Xi=e=>e.callWS({type:as+"/modules"}),Qi=e=>e.callWS({type:as+"/allmodules"}),ea=(e,t)=>e.callApi("POST",as+"/modules",t),ta=e=>e.callWS({type:as+"/mappings"}),sa=(e,t)=>e.callApi("POST",as+"/mappings",t),ia=(e,t,s=10)=>e.callWS({type:as+"/weather_records",mapping_id:t,limit:s}),aa=(e,t=500)=>e.callWS({type:as+"/irrigation_history",limit:t}),na=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return s([me({attribute:!1})],t.prototype,"hass",void 0),t};var ra="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",oa="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",la="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",ha="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",da="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",ca="M7,10L12,15L17,10H7Z",ua="M19,13H5V11H19V13Z",pa="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",ga="M8,5.14V19.14L19,12.14L8,5.14Z",ma="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",fa="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",va="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",_a="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z";const ba=l`
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
`,ya=l`
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
`,wa="06:00";let $a=class extends de{async showDialog(e){if(this.params=e,e.createTrigger)this._trigger={type:os,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const t=e.trigger;this._trigger=function(e){var t,s,i,a,n,r;const o={type:e.type,name:null!==(t=e.name)&&void 0!==t?t:"",enabled:null===(s=e.enabled)||void 0===s||s,offset_minutes:null!==(i=e.offset_minutes)&&void 0!==i?i:0,account_for_duration:null===(a=e.account_for_duration)||void 0===a||a};return e.type===ls?Object.assign(Object.assign({},o),{azimuth_angle:null!==(n=e.azimuth_angle)&&void 0!==n?n:90}):e.type===hs?Object.assign(Object.assign({},o),{at:null!==(r=e.at)&&void 0!==r?r:wa}):o}(t)}else this._trigger=void 0;await this.updateComplete}_closeDialog(){this.params=void 0,this._trigger=void 0}_saveTrigger(){var e,s,i,a,n,r,o;if(!this._trigger||!this.params)return;const l=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(l){const e=null!==(i=null!==(s=l.value)&&void 0!==s?s:l.selected)&&void 0!==i?i:void 0;if(e&&e!==this._trigger.type){if(e===ls)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(a=this._trigger.azimuth_angle)&&void 0!==a?a:90});else if(e===hs){const s=this._trigger,{azimuth_angle:i}=s,a=t(s,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},a),{type:e,at:null!==(n=this._trigger.at)&&void 0!==n?n:wa})}else{const s=this._trigger,{azimuth_angle:i,at:a}=s,n=t(s,["azimuth_angle","at"]);this._trigger=Object.assign(Object.assign({},n),{type:e})}this.requestUpdate()}}if(null===(r=this._trigger.name)||void 0===r?void 0:r.trim())if(this._trigger.type!==hs||/^\d{1,2}:\d{2}$/.test(null!==(o=this._trigger.at)&&void 0!==o?o:"")){if(this._trigger.type===ls){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void alert(Qt("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else alert(Qt("irrigation_start_triggers.validation.time_invalid",this.hass.language));else alert(Qt("irrigation_start_triggers.validation.name_required",this.hass.language))}_deleteTrigger(){this.params&&!this.params.createTrigger&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,t;if(!this.params||!this._trigger)return W``;const s=this.params.createTrigger,i=Qt(s?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return W`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${la}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${i}</span>
        </div>

        <div class="wrapper">
          <div class="dialog-help">
            ${Qt("irrigation_start_triggers.dialog.help",this.hass.language)}
            <code>smart_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${Qt("irrigation_start_triggers.fields.name.name",this.hass.language)}</label
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
              .label=${Qt("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${os}>
                ${Qt("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${"sunset"}>
                ${Qt("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${ls}>
                ${Qt("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${hs}>
                ${Qt("irrigation_start_triggers.trigger_types.time",this.hass.language)}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${Qt("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${Qt("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}</label
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
              .label=${Qt("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===hs?W`
                <div class="form-group">
                  <label class="form-label"
                    >${Qt("irrigation_start_triggers.fields.at.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="time"
                    .value=${this._trigger.at||wa}
                    @input=${this._atChanged}
                  />
                </div>
              `:""}
          ${this._trigger.type===ls?W`
                <div class="form-group">
                  <label class="form-label"
                    >${Qt("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}</label
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
            ${Qt("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </ha-button>
          ${s?"":W`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${Qt("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </ha-button>
              `}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${Qt("irrigation_start_triggers.dialog.save",this.hass.language)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}_nameChanged(e){const t=e.target;this._updateTrigger({name:t.value})}_typeChanged(e){var t,s,i,a,n,r,o,l,h,d,c,u,p,g,m,f,v,_,b,y,w,$,x,k;const S=null!==(a=null!==(s=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.value)&&void 0!==s?s:null===(i=e.target)||void 0===i?void 0:i.value)&&void 0!==a?a:null===(r=null===(n=this.shadowRoot)||void 0===n?void 0:n.querySelector("ha-select"))||void 0===r?void 0:r.value,T=String(S);let z;z=T===ls?{type:ls,name:null!==(l=null===(o=this._trigger)||void 0===o?void 0:o.name)&&void 0!==l?l:"",enabled:null===(d=null===(h=this._trigger)||void 0===h?void 0:h.enabled)||void 0===d||d,offset_minutes:null!==(u=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==u?u:0,azimuth_angle:null!==(g=null===(p=this._trigger)||void 0===p?void 0:p.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(f=null===(m=this._trigger)||void 0===m?void 0:m.account_for_duration)||void 0===f||f}:{type:T,name:null!==(_=null===(v=this._trigger)||void 0===v?void 0:v.name)&&void 0!==_?_:"",enabled:null===(y=null===(b=this._trigger)||void 0===b?void 0:b.enabled)||void 0===y||y,offset_minutes:null!==($=null===(w=this._trigger)||void 0===w?void 0:w.offset_minutes)&&void 0!==$?$:0,account_for_duration:null===(k=null===(x=this._trigger)||void 0===x?void 0:x.account_for_duration)||void 0===k||k},this._trigger=z,this.requestUpdate()}_enabledChanged(e){const t=e.target;this._updateTrigger({enabled:t.checked})}_offsetChanged(e){const t=e.target;this._updateTrigger({offset_minutes:parseInt(t.value)||0})}_accountForDurationChanged(e){const t=e.target;this._updateTrigger({account_for_duration:t.checked})}_atChanged(e){const t=e.target.value;this._trigger=Object.assign(Object.assign({},this._trigger),{at:t})}_azimuthChanged(e){var t;if((null===(t=this._trigger)||void 0===t?void 0:t.type)!==ls)return;const s=e.target;let i=parseInt(s.value,10);isNaN(i)&&(i=90),this._updateTrigger({azimuth_angle:i})}static get styles(){return[ya,l`
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
      `]}};s([me({attribute:!1})],$a.prototype,"hass",void 0),s([me({attribute:!1})],$a.prototype,"params",void 0),s([fe()],$a.prototype,"_trigger",void 0),$a=s([ue("smart-irrigation-trigger-dialog")],$a);const xa=l`
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
`;let ka=class extends(na(de)){constructor(){super(...arguments),this.zones=[],this.planning=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null,t={};return s=>{t=Object.assign(Object.assign({},t),s),e&&clearTimeout(e),e=window.setTimeout((()=>{const s=t;t={},e=null,this.saveData(s)}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await Zi(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","continuousupdates","sensor_debounce","calc_log_enabled","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter((([e])=>t.includes(e))).reduce(((e,[t,s])=>Object.assign(e,{[t]:s})),{}):{});try{this.zones=await Ki(this.hass)}catch(e){console.error("Error fetching zones:",e)}}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,t}}connectedCallback(){super.connectedCallback();let e=0;this._liveTimer=window.setInterval((()=>{e+=1,this._fetchLive(e%6==0)}),5e3)}firstUpdated(){this._fetchLive(!0),ye().catch((e=>{console.error("Failed to load HA form:",e)}))}render(){var e,t,s;if(!this.hass||!this.config||!this.data)return W`<div class="loading-indicator">
        ${Qt("common.loading-messages.configuration",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}
      </div>`;if(this.isLoading)return W`<div class="loading-indicator">
        ${Qt("common.loading-messages.general",this.hass.language)}
      </div>`;{const e="panels.general.cards.automatic-duration-calculation.labels",t=this.config.recalculate_before_start?"start":this.config.autocalcenabled?"time":"manual";let i=W` <div class="card-content">
          ${Qt("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}
        </div>
        <div class="card-content">
          ${this._selectRow(W`${Qt(`${e}.calc-when`,this.hass.language)}
              <div class="setting-hint">
                ${Qt(`${e}.calc-when-hint`,this.hass.language)}
              </div>`,W`
              <option value="time" ?selected=${"time"===t}>
                ${Qt(`${e}.calc-when-time`,this.hass.language)}
              </option>
              <option value="start" ?selected=${"start"===t}>
                ${Qt(`${e}.calc-when-start`,this.hass.language)}
              </option>
              <option value="manual" ?selected=${"manual"===t}>
                ${Qt(`${e}.calc-when-manual`,this.hass.language)}
              </option>
            `,(e=>{const t=e.target.value;this.handleConfigChange({autocalcenabled:"time"===t,recalculate_before_start:"start"===t})}))}
        </div>`;"time"===t&&(i=W`${i}
          <div class="card-content">
            ${this._timeRow(Qt(`${e}.calc-time`,this.hass.language),this.config.calctime,(e=>this.handleConfigChange({calctime:e})),Qt(`${e}.calc-time-hint`,this.hass.language))}
          </div>`),i=W`${i}
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt(`${e}.hourly-calculation`,this.hass.language)}
              <div class="setting-hint">
                ${Qt(`${e}.hourly-calculation-hint`,this.hass.language)}
              </div>
            </div>
            <ha-switch
              .checked=${this.config.hourly_calculation}
              @change=${e=>this.handleConfigChange({hourly_calculation:e.target.checked})}
            ></ha-switch>
          </div>
          ${"advanced"!==this.config.ui_mode&&this.config.effective_rain?"":W`<div class="setting-row">
                  <div class="setting-label">
                    ${Qt("weather_skip.effective_rain_label",this.hass.language)}
                    <div class="setting-hint">
                      ${Qt("weather_skip.effective_rain_description",this.hass.language)}
                    </div>
                  </div>
                  <ha-switch
                    .checked=${!!this.config.effective_rain}
                    @change=${e=>this.handleConfigChange({effective_rain:e.target.checked})}
                  ></ha-switch>
                </div>`}
        </div>`,i=W`<ha-card
        header="${Qt("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}"
      >
        ${i}</ha-card
      >`;let a=W` <div class="card-content">
          ${Qt("panels.general.cards.automatic-update.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoupdateenabled&&(a=W`${a}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${Qt("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${null!==(s=this.data.autoupdateinterval)&&void 0!==s?s:""}
                  @change=${e=>this.saveData({autoupdateinterval:parseInt(e.target.value)})}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>this.saveData({autoupdateschedule:e.target.value})}
                  >
                    <option
                      value="${ds}"
                      ?selected=${this.data.autoupdateschedule===ds}
                    >
                      ${Qt("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${cs}"
                      ?selected=${this.data.autoupdateschedule===cs}
                    >
                      ${Qt("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${us}"
                      ?selected=${this.data.autoupdateschedule===us}
                    >
                      ${Qt("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${ca}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(a=W`${a}
          <div class="card-content">
            ${this._numRow(Qt("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,(e=>this.saveData({autoupdatedelay:parseInt(e)})),1)}
          </div>`),a=W`<ha-card header="${Qt("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${a}</ha-card>`;const n="advanced"===this.config.ui_mode||!!this.config.continuousupdates;let r=W`<div class="card-content">
          ${Qt("panels.general.cards.continuousupdates.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.continuousupdates&&(r=W`${r}
          <div class="card-content">
            ${this._numRow(Qt("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,(e=>this.handleConfigChange({sensor_debounce:parseInt(e)})),1)}
          </div>`),r=W`<ha-card
        header="${Qt("panels.general.cards.continuousupdates.header",this.hass.language)}"
        >${r}</ha-card
      > `;const o=this.renderTriggersCard(),l=this.renderWeatherSkipCard(),h=this.renderCoordinateCard(),d=this.renderDaysBetweenIrrigationCard(),c=this.renderObservedWateringCard(),u=this.renderCalculationLogCard(),p=this.renderPanelModeCard(),g=this.renderSeasonalAdjustmentsCard(),m=this.renderSuppliesCard(),f=this.renderProgramsCard(),v=this.renderPlanningCard(),_=this.renderSetupAssistantCard();return W`<ha-card
          header="${Qt("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Qt("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${_}${p}${a}${i}${n?r:""}${o}${l}${h}${d}${c}${v}${f}${m}${u}${g}`}}renderLiveState(){const e=this.programsState;if(!this.hass||!e)return W``;const t=this.hass.language,s=e=>Qt(`planning.${e}`,t),i=e.live;if(!i)return W``;const a=e=>{const t=Math.floor(e/60),s=Math.round(e%60);return`${t}:${String(s).padStart(2,"0")}`},n=[...i.paused?[W`<div class="setting-note">
              <strong>${s("paused")}</strong>
            </div>`]:[],...(i.programs||[]).map((e=>W`
          <div class="setting-note">
            <strong>${e.name}</strong>
            ${"waiting"===e.state?W` - ${s("waiting")}`:W` - ${s("step")}
                ${e.step}/${e.steps}${e.tours>1?W`, ${s("tour")} ${e.tour}/${e.tours}`:""},
                ${e.percent} %, ${s("remaining")}
                ${a(e.remaining_seconds||0)}`}
          </div>
        `)),...(i.valves||[]).map((e=>W`
          <div class="setting-note">
            ${e.zone}: ${s("remaining")} ${a(e.remaining_seconds)}
            (${e.percent} %)
          </div>
        `))];return n.length?W`${n}`:W`<div class="setting-note">${s("nothing_now")}</div>`}renderPlanningCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return W``;const e=this.hass.language,t=t=>Qt(`planning.${t}`,e),s=t=>new Intl.DateTimeFormat(e,{hour:"2-digit",minute:"2-digit"}).format(new Date(t)),i=this.planning||[];return W`
      <ha-card header="${t("title")}">
        <div class="card-content">
          ${t("description")} ${this.renderLiveState()}
        </div>
        ${i.length?i.map((i=>{return W`
                <div class="card-content">
                  <div class="setting-note">
                    <strong>${a=i.start,new Intl.DateTimeFormat(e,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(a))}</strong> ${i.program}
                    (${s(i.start)} - ${s(i.end)})
                  </div>
                  ${i.steps.map(((e,t)=>W`
                      <div class="setting-note">
                        ${t+1}.
                        ${e.zones.map((e=>{return`${e.zone} ${t=e.seconds,`${Math.round(t/60)} min`}`;var t})).join(" + ")}
                      </div>
                    `))}
                  ${i.tours>1?W`<div class="setting-note">
                        ${i.tours} ${t("tours")}
                      </div>`:""}
                </div>
              `;var a})):W`<div class="card-content">${t("nothing_planned")}</div>`}
      </ha-card>
    `}async _fetchLive(e){var t;if(this.hass&&!0===(null===(t=this.config)||void 0===t?void 0:t.full_controller))try{this.programsState=await this.hass.callWS({type:as+"/programs_state"}),e&&(this.planning=await this.hass.callWS({type:as+"/planning",days:3})),this._scheduleUpdate()}catch(e){console.error("Error fetching the programs' state:",e)}}renderProgramsCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return W``;const e=this.hass.language,t=t=>Qt(`programs.${t}`,e),s=this.config.programs||[],i=e=>this.handleConfigChange({programs:e}),a=(e,t)=>i(s.map(((s,i)=>i===e?Object.assign(Object.assign({},s),t):s))),n=(e,t=0)=>{const s=parseFloat(e);return isNaN(s)?t:s},r=e=>this.hass.callService(as,"run_program",{program_id:e}),o=e=>this.hass.callService(as,e,{}),l=()=>Math.random().toString(36).slice(2,8),h=(s,i,r,o)=>{const l=e=>a(i,{steps:(s.steps||[]).map(((t,s)=>s===o?Object.assign(Object.assign({},t),e):t))});return W`
        <div class="setting-note">
          <strong>${t("step")} ${o+1}</strong>
        </div>
        <div class="setting-row">
          <div class="setting-label">${t("step_zones")}</div>
          <div>
            ${this.zones.map((e=>W`
                <label style="margin-right: 12px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(r.zones||[]).includes(e.id)}
                    @change=${t=>((e,t)=>{const s=(r.zones||[]).filter((t=>t!==e));l({zones:t?[...s,e]:s})})(e.id,t.target.checked)}
                  />
                  ${e.name}
                </label>
              `))}
          </div>
        </div>
        <div class="setting-note">${t("step_zones_help")}</div>
        ${this._selectRow(t("step_duration"),W`
            <option value="calculated" ?selected=${"calculated"===r.mode}>
              ${t("mode_calculated")}
            </option>
            <option value="percent" ?selected=${"percent"===r.mode}>
              ${t("mode_percent")}
            </option>
            <option value="fixed" ?selected=${"fixed"===r.mode}>
              ${t("mode_fixed")}
            </option>
          `,(e=>l({mode:e.target.value})))}
        ${"percent"===r.mode?this._numRow(t("percent"),"%",r.percent,(e=>l({percent:n(e,100)}))):""}
        ${"fixed"===r.mode?this._numRow(t("seconds"),Qt("units.seconds",e),r.seconds,(e=>l({seconds:n(e)}))):""}
        ${this._numRow(t("passes"),"",r.passes,(e=>l({passes:Math.max(1,Math.round(n(e,1)))})))}
        ${this._textRow(t("step_delay"),Qt("units.seconds",e),null===r.delay||void 0===r.delay?"":r.delay,(e=>l({delay:""===e.trim()?null:n(e)})))}
        <div class="setting-note">${t("step_delay_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("enabled")}</div>
          <ha-switch
            .checked=${!1!==r.enabled}
            @change=${e=>l({enabled:e.target.checked})}
          ></ha-switch>
        </div>
        ${this._actionBtn(da,t("delete_step"),(()=>a(i,{steps:(s.steps||[]).filter(((e,t)=>t!==o))})),!0)}
      `},d=(s,i,r,o)=>{var l,h,d,c,u;const p=e=>a(i,{schedules:(s.schedules||[]).map(((t,s)=>s===o?Object.assign(Object.assign({},t),e):t))}),g=(e,t,s)=>{const i=(e||[]).filter((e=>e!==t));return s?[...i,t].sort(((e,t)=>e-t)):i};return W`
        <div class="setting-note">
          <strong>${t("schedule")} ${o+1}</strong>
        </div>
        ${this._selectRow(t("schedule_moment"),W`
            <option value="time" ?selected=${"time"===r.type}>
              ${t("moment_time")}
            </option>
            <option
              value="sunrise"
              ?selected=${"sun"===r.type&&"sunrise"===r.event}
            >
              ${t("moment_sunrise")}
            </option>
            <option
              value="sunset"
              ?selected=${"sun"===r.type&&"sunset"===r.event}
            >
              ${t("moment_sunset")}
            </option>
          `,(e=>{const t=e.target.value;p("time"===t?{type:"time"}:{type:"sun",event:t})}))}
        ${"time"===r.type?this._timeRow(t("schedule_time"),r.time,(e=>p({time:e}))):this._numRow(t("schedule_offset"),Qt("units.minutes",e),r.offset_minutes,(e=>p({offset_minutes:Math.round(n(e))})))}
        ${this._selectRow(t("schedule_anchor"),W`
            <option value="start" ?selected=${"end"!==r.anchor}>
              ${t("anchor_start")}
            </option>
            <option value="end" ?selected=${"end"===r.anchor}>
              ${t("anchor_end")}
            </option>
          `,(e=>p({anchor:e.target.value})))}
        <div class="setting-note">${t("schedule_anchor_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("schedule_weekdays")}</div>
          <div>
            ${[0,1,2,3,4,5,6].map((t=>W`
                <label style="margin-right: 10px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(r.weekdays||[]).includes(t)}
                    @change=${e=>p({weekdays:g(r.weekdays,t,e.target.checked)})}
                  />
                  ${(t=>new Intl.DateTimeFormat(e,{weekday:"short"}).format(new Date(2024,0,1+t)))(t)}
                </label>
              `))}
          </div>
        </div>
        <div class="setting-note">${t("schedule_weekdays_help")}</div>
        ${this._numRow(t("schedule_every"),t("schedule_days"),null!==(l=r.every_n_days)&&void 0!==l?l:1,(e=>p({every_n_days:Math.max(1,Math.round(n(e,1)))})))}
        ${(null!==(h=r.every_n_days)&&void 0!==h?h:1)>1?this._numRow(t("schedule_every_offset"),t("schedule_days"),null!==(d=r.every_offset)&&void 0!==d?d:0,(e=>p({every_offset:Math.max(0,Math.round(n(e)))}))):""}
        <div class="setting-note">${t("schedule_every_help")}</div>
        ${this._selectRow(t("schedule_parity"),W`
            <option
              value="any"
              ?selected=${"even"!==r.parity&&"odd"!==r.parity}
            >
              ${t("parity_any")}
            </option>
            <option value="even" ?selected=${"even"===r.parity}>
              ${t("parity_even")}
            </option>
            <option value="odd" ?selected=${"odd"===r.parity}>
              ${t("parity_odd")}
            </option>
          `,(e=>p({parity:e.target.value})))}
        <div class="setting-row">
          <div class="setting-label">${t("schedule_months")}</div>
          <div>
            ${[0,1,2,3,4,5,6,7,8,9,10,11].map((t=>W`
                <label style="margin-right: 10px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(r.months||[]).includes(t+1)}
                    @change=${e=>p({months:g(r.months,t+1,e.target.checked)})}
                  />
                  ${(t=>new Intl.DateTimeFormat(e,{month:"short"}).format(new Date(2024,t,1)))(t)}
                </label>
              `))}
          </div>
        </div>
        <div class="setting-note">${t("schedule_months_help")}</div>
        ${this._textRow(t("schedule_from"),"MM-DD",null!==(c=r.from_date)&&void 0!==c?c:"",(e=>p({from_date:e.trim()||null})))}
        ${this._textRow(t("schedule_until"),"MM-DD",null!==(u=r.until_date)&&void 0!==u?u:"",(e=>p({until_date:e.trim()||null})))}
        <div class="setting-note">${t("schedule_period_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("schedule_weather")}</div>
          <ha-switch
            .checked=${!1!==r.weather}
            @change=${e=>p({weather:e.target.checked})}
          ></ha-switch>
        </div>
        <div class="setting-note">${t("schedule_weather_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("enabled")}</div>
          <ha-switch
            .checked=${!1!==r.enabled}
            @change=${e=>p({enabled:e.target.checked})}
          ></ha-switch>
        </div>
        ${this._actionBtn(da,t("delete_schedule"),(()=>a(i,{schedules:(s.schedules||[]).filter(((e,t)=>t!==o))})),!0)}
      `};return W`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        <div class="card-content">
          ${this._actionBtn("M14,19H18V5H14M6,19H10V5H6V19Z",t("pause"),(()=>o("pause_watering")))}
          ${this._actionBtn(ga,t("resume"),(()=>o("resume_watering")))}
          ${this._actionBtn("M16,18H18V6H16M6,18L14.5,12L6,6V18Z",t("next_step"),(()=>o("next_step")))}
          ${this._actionBtn("M18,18H6V6H18V18Z",t("stop"),(()=>o("stop_watering")),!0)}
          <div class="setting-note">${t("controls_help")}</div>
        </div>
        ${s.map(((o,c)=>{var u,p;return o.main?W`
                <div class="card-content">
                  <div class="setting-note">
                    <strong>${o.name}</strong>
                  </div>
                  <div class="setting-note">${t("main_description")}</div>
                  <div class="setting-row">
                    <div class="setting-label">${t("enabled")}</div>
                    <ha-switch
                      .checked=${!1!==o.enabled}
                      @change=${e=>a(c,{enabled:e.target.checked})}
                    ></ha-switch>
                  </div>
                  ${this._actionBtn(ga,t("run_now"),(()=>r(o.id)))}
                </div>
              `:W`
                <div class="card-content">
                  ${this._textRow(t("name"),"",o.name,(e=>a(c,{name:e})))}
                  ${(o.steps||[]).map(((e,t)=>h(o,c,e,t)))}
                  ${this._actionBtn(ma,t("add_step"),(()=>a(c,{steps:[...o.steps||[],{id:"step_"+l(),zones:[],mode:"calculated",percent:100,seconds:0,passes:1,delay:null,enabled:!0}]})))}
                  ${(o.schedules||[]).map(((e,t)=>d(o,c,e,t)))}
                  ${this._actionBtn(ma,t("add_schedule"),(()=>a(c,{schedules:[...o.schedules||[],{id:"schedule_"+l(),enabled:!0,type:"time",time:"06:00",event:"sunrise",offset_minutes:0,anchor:"start",weekdays:[],every_n_days:1,every_offset:0,parity:"any",months:[],from_date:null,until_date:null,weather:!0}]})))}
                  ${this._numRow(t("delay"),Qt("units.seconds",e),null!==(u=o.delay)&&void 0!==u?u:0,(e=>a(c,{delay:n(e)})))}
                  <div class="setting-note">${t("delay_help")}</div>
                  ${this._numRow(t("tours"),"",null!==(p=o.tours)&&void 0!==p?p:1,(e=>a(c,{tours:Math.max(1,Math.round(n(e,1)))})))}
                  <div class="setting-note">${t("tours_help")}</div>
                  <div class="setting-row">
                    <div class="setting-label">${t("enabled")}</div>
                    <ha-switch
                      .checked=${!1!==o.enabled}
                      @change=${e=>a(c,{enabled:e.target.checked})}
                    ></ha-switch>
                  </div>
                  ${this._actionBtn(ga,t("run_now"),(()=>r(o.id)))}
                  ${this._actionBtn(da,t("delete"),(()=>i(s.filter(((e,t)=>t!==c)))),!0)}
                </div>
              `}))}
        <div class="card-content">
          ${this._actionBtn(ma,t("add"),(()=>i([...s,{id:"program_"+l(),name:"",enabled:!0,steps:[],delay:0,tours:1,schedules:[]}])))}
        </div>
      </ha-card>
    `}renderSuppliesCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return W``;const e=this.hass.language,t=t=>Qt(`supplies.${t}`,e),s=this.config.supplies||[],i=e=>this.handleConfigChange({supplies:e}),a=(e,t)=>i(s.map(((s,i)=>i===e?Object.assign(Object.assign({},s),t):s))),n=e=>{const t=parseFloat(e);return isNaN(t)?0:t};return W`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${s.map(((r,o)=>W`
            <div class="card-content">
              ${this._textRow(t("name"),"",r.name,(e=>a(o,{name:e})))}
              ${this._textRow(t("entities"),t("entities_hint"),(r.entities||[]).join(", "),(e=>a(o,{entities:e.split(",").map((e=>e.trim())).filter((e=>e))})))}
              ${this._numRow(t("delay_before"),Qt("units.seconds",e),r.delay_before,(e=>a(o,{delay_before:n(e)})))}
              <div class="setting-note">${t("delay_before_help")}</div>
              ${this._numRow(t("delay_after"),Qt("units.seconds",e),r.delay_after,(e=>a(o,{delay_after:n(e)})))}
              <div class="setting-note">${t("delay_after_help")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${!1!==r.enabled}
                  @change=${e=>a(o,{enabled:e.target.checked})}
                ></ha-switch>
              </div>
              ${this._actionBtn(da,t("delete"),(()=>i(s.filter(((e,t)=>t!==o)))),!0)}
            </div>
          `))}
        <div class="card-content">
          ${this._actionBtn(ma,t("add"),(()=>i([...s,{id:"supply_"+Math.random().toString(36).slice(2,8),name:"",entities:[],delay_before:0,delay_after:0,enabled:!0}])))}
        </div>
      </ha-card>
    `}async _seasonalCall(e,t){if(this.hass){try{await this.hass.callService(as,e,t)}catch(t){console.error("Seasonal adjustment "+e+" failed:",t)}await this._fetchData()}}renderSeasonalAdjustmentsCard(){if(!this.config||!this.hass||"advanced"!==this.config.ui_mode)return W``;const e=this.hass.language,t=t=>Qt(`seasonal_adjustments.${t}`,e),s=this.config.seasonal_adjustments||[],i=(e,t)=>this._seasonalCall("update_seasonal_adjustment",Object.assign({adjustment_id:e},t));return W`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${s.map((e=>{var s,a,n;return W`
            <div class="card-content si-subgroup">
              ${this._textRow(t("name"),"",e.name,(t=>i(e.id,{name:t||e.name})))}
              ${this._numRow(t("month_start"),"1-12",e.month_start,(t=>i(e.id,{month_start:Math.min(12,Math.max(1,parseInt(t,10)||1))})),1)}
              ${this._numRow(t("month_end"),"1-12",e.month_end,(t=>i(e.id,{month_end:Math.min(12,Math.max(1,parseInt(t,10)||12))})),1)}
              ${this._numRow(t("multiplier"),"x",null!==(s=e.multiplier_adjustment)&&void 0!==s?s:1,(t=>i(e.id,{multiplier_adjustment:Math.max(0,parseFloat(t)||0)})),.05)}
              ${this._numRow(t("threshold"),Li(this.config,ns),null!==(a=e.threshold_adjustment)&&void 0!==a?a:0,(t=>i(e.id,{threshold_adjustment:parseFloat(t)||0})),.5)}
              ${this._textRow(t("zones"),"",Array.isArray(e.zones)?e.zones.join(", "):null!==(n=e.zones)&&void 0!==n?n:"all",(t=>i(e.id,{zones:t.trim()||"all"})))}
              <div class="setting-hint">${t("zones_hint")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${!1!==e.enabled}
                  @change=${t=>i(e.id,{enabled:t.target.checked})}
                ></ha-switch>
              </div>
              <ha-button
                @click=${()=>this._seasonalCall("delete_seasonal_adjustment",{adjustment_id:e.id})}
              >
                ${t("delete")}
              </ha-button>
            </div>
          `}))}
        <div class="card-actions">
          <ha-button
            @click=${()=>this._seasonalCall("create_seasonal_adjustment",{name:t("new_name"),month_start:6,month_end:8,multiplier_adjustment:1,threshold_adjustment:0,zones:"all",enabled:!0})}
          >
            ${t("add")}
          </ha-button>
        </div>
      </ha-card>
    `}renderSetupAssistantCard(){if(!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${Qt("panels.setup.title",e)}">
        <div class="card-content">
          ${Qt("panels.general.cards.setup-assistant.description",e)}
        </div>
        <div class="card-actions">
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/setup`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${Qt("panels.general.cards.setup-assistant.open",e)}
          </ha-button>
        </div>
      </ha-card>
    `}renderTriggersCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.config.irrigation_start_triggers||[];return W`
      <ha-card
        header="${Qt("irrigation_start_triggers.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Qt("irrigation_start_triggers.description",this.hass.language)}
        </div>

        <div class="card-content trigger-usage">
          ${Qt("irrigation_start_triggers.usage_before",this.hass.language)}
          <code>smart_irrigation_start_irrigation_all_zones</code>${Qt("irrigation_start_triggers.usage_after",this.hass.language)}
        </div>

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("irrigation_start_triggers.active_label",this.hass.language)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({active_start_trigger:e.target.value})}
            >
              <option
                value="default"
                ?selected=${"default"===(this.config.active_start_trigger||"default")}
              >
                ${Qt("irrigation_start_triggers.active_default",this.hass.language)}
              </option>
              ${e.map((e=>W`
                  <option
                    value="${e.name}"
                    ?selected=${this.config.active_start_trigger===e.name}
                  >
                    ${e.name}
                  </option>
                `))}
              <option
                value="none"
                ?selected=${"none"===this.config.active_start_trigger}
              >
                ${Qt("irrigation_start_triggers.active_none",this.hass.language)}
              </option>
            </select>
          </div>
          <div class="trigger-active-hint">
            ${Qt("irrigation_start_triggers.active_hint",this.hass.language)}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${"none"===this.config.active_start_trigger?W`
                  <div class="no-triggers">
                    ${Qt("irrigation_start_triggers.none_selected",this.hass.language)}
                  </div>
                `:""}
            ${e.map(((e,t)=>this.renderTriggerItem(e,t)))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(ma,Qt("irrigation_start_triggers.add_trigger",this.hass.language),(()=>this._addTrigger()))}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,t){if(!this.hass)return W``;const s=Qt(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let i="";if(e.type===os&&0===e.offset_minutes)i=Qt("irrigation_start_triggers.offset_auto",this.hass.language);else{const t=Math.abs(e.offset_minutes),s=Math.floor(t/60),a=t%60,n=e.offset_minutes<0?Qt("common.labels.before",this.hass.language):Qt("common.labels.after",this.hass.language);i=s>0?`${s}h ${a}m ${n}`:`${a}m ${n}`}let a="";return e.type===ls&&void 0!==e.azimuth_angle&&(a=` (${e.azimuth_angle}°)`),W`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${s}${a} - ${i}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?Qt("common.labels.enabled",this.hass.language):Qt("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(t)}"
            title="${Qt("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${da}"
            @click="${()=>this._deleteTrigger(t)}"
            title="${Qt("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var t,s;const i=null===(s=null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===s?void 0:s[e];i&&this._showTriggerDialog({trigger:i,triggerIndex:e})}_deleteTrigger(e){var t,s;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||!this.hass)return;const i=(null===(s=this.config.irrigation_start_triggers[e])||void 0===s?void 0:s.name)||"Unknown";if(confirm(Qt("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",i))){const t=[...this.config.irrigation_start_triggers];t.splice(e,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[rs]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}}async _showTriggerDialog(e){if(!this.hass)return;const t=document.createElement("smart-irrigation-trigger-dialog");t.hass=this.hass,t.addEventListener("trigger-save",(e=>{this._handleTriggerSave(e.detail)})),t.addEventListener("trigger-delete",(e=>{this._handleTriggerDelete(e.detail)})),document.body.appendChild(t),await t.showDialog(e),t.addEventListener("closed",(e=>{const s=e.target;s&&"ha-dialog"===s.tagName.toLowerCase()&&document.body.removeChild(t)}))}_handleTriggerSave(e){if(!this.config)return;const t=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?t.push(e.trigger):void 0!==e.index&&(t[e.index]=e.trigger),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[rs]:t}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}_handleTriggerDelete(e){var t;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===e.index)return;const s=[...this.config.irrigation_start_triggers];s.splice(e.index,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:s}),this.saveData({[rs]:s}).catch((e=>{console.error("Error saving triggers:",e),this._fetchData().catch((()=>{}))}))}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?W`
      <ha-card header="${Qt("weather_skip.title",this.hass.language)}">
        <div class="card-content">
          ${Qt("weather_skip.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("weather_skip.forecast_label",this.hass.language)}
              <div class="setting-hint">
                ${Qt("weather_skip.forecast_description",this.hass.language)}
              </div>
            </div>
            <ha-switch
              .checked=${!(!this.config.skip_irrigation_on_precipitation&&!this.config.forecast_rain_credit)}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked,forecast_rain_credit:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation||this.config.forecast_rain_credit?this._numRow(Qt("weather_skip.threshold_label",this.hass.language),Li(this.config,ns),this.config.precipitation_threshold_mm,(e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)})),.1):""}
        </div>
      </ha-card>
      ${this.renderMeasuredSkipCard()}
    `:W``}renderMeasuredSkipCard(){if(!this.config||!this.hass)return W``;const e=this.hass.language,t="imperial"!==this.config.units,s=t=>Qt(`measured_skip.${t}`,e),i=(e,t)=>W`
      <ha-switch
        .checked=${!!t}
        @change=${t=>this.handleConfigChange({[e]:t.target.checked})}
      ></ha-switch>
    `,a=(e,t,s,i,a)=>W`
      <div class="setting-row">
        <div class="setting-label">
          ${i}
          <div class="setting-hint">${a}</div>
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${t||""}
          .includeDomains=${s}
          allow-custom-entity
          @value-changed=${t=>{var s;return this.handleConfigChange({[e]:(null===(s=t.detail)||void 0===s?void 0:s.value)||null})}}
        ></ha-entity-picker>
      </div>
    `,n=(e,t,s)=>W`
      <div class="si-subgroup">
        <div class="si-subgroup-title">${e}</div>
        <div class="setting-hint">${t}</div>
        ${s}
      </div>
    `,r=(e,t,i,a,n)=>this._numRow(s("threshold"),a,null!=t?t:i,(t=>this.handleConfigChange({[e]:""===t?null:parseFloat(t)})),n);return W`
      <ha-card header="${s("title")}">
        <div class="card-content">${s("description")}</div>
        <div class="card-content">
          ${n(s("rain.title"),s("rain.description"),W`
              <div class="setting-row">
                <div class="setting-label">${s("enabled")}</div>
                ${i("skip_on_rain_sensor",this.config.skip_on_rain_sensor)}
              </div>
              ${this.config.skip_on_rain_sensor?W`${a("rain_sensor",this.config.rain_sensor,["binary_sensor"],s("sensor"),s("rain.sensor-hint"))}
                  ${"advanced"===this.config.ui_mode?W`<div class="setting-row">
                          <div class="setting-label">
                            ${s("rain.history-label")}
                          </div>
                          ${i("rain_history_enabled",this.config.rain_history_enabled)}
                        </div>
                        <div class="card-content">
                          ${s("rain.history-description")}
                        </div>`:""}`:""}
            `)}
          ${n(s("freeze.title"),s("freeze.description"),W`
              <div class="setting-row">
                <div class="setting-label">${s("enabled")}</div>
                ${i("skip_on_freeze",this.config.skip_on_freeze)}
              </div>
              ${this.config.skip_on_freeze?W`${r("freeze_threshold",this.config.freeze_threshold,t?2:36,t?"°C":"°F",.5)}
                  ${a("freeze_sensor",this.config.freeze_sensor,["sensor"],s("sensor-optional"),s("freeze.sensor-hint"))}`:""}
            `)}
          ${n(s("wind.title"),s("wind.description"),W`
              <div class="setting-row">
                <div class="setting-label">${s("enabled")}</div>
                ${i("skip_on_wind",this.config.skip_on_wind)}
              </div>
              ${this.config.skip_on_wind?W`${r("wind_threshold",this.config.wind_threshold,t?20:12,t?"km/h":"mph",1)}
                  ${a("wind_sensor",this.config.wind_sensor,["sensor"],s("sensor-optional"),s("wind.sensor-hint"))}`:""}
            `)}
        </div>
      </ha-card>
    `}renderObservedWateringCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${Qt("observed_watering.title",e)}">
        <div class="card-content">
          ${Qt("observed_watering.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("observed_watering.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.observed_watering_enabled}
              @change=${e=>this.handleConfigChange({observed_watering_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              ${Qt("observed_watering.direct_control_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.direct_valve_control_enabled}
              @change=${e=>this.handleConfigChange({direct_valve_control_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.direct_valve_control_enabled?W`
                <div class="setting-note">
                  ${Qt("observed_watering.direct_control_description",e)}
                </div>
              `:""}

          <div class="setting-row">
            <div class="setting-label">
              ${Qt("observed_watering.full_controller_label",e)}
            </div>
            <ha-switch
              .checked=${!0===this.config.full_controller}
              @change=${e=>this.handleConfigChange(Object.assign({full_controller:e.target.checked},e.target.checked?{direct_valve_control_enabled:!0}:{}))}
            ></ha-switch>
          </div>
          <div class="setting-note">
            ${Qt("observed_watering.full_controller_description",e)}
          </div>

          <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("observed_watering.sequencing_label",e)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({zone_sequencing:e.target.value})}
            >
              <option
                value="sequential"
                ?selected=${"sequential"===this.config.zone_sequencing}
              >
                ${Qt("observed_watering.sequencing.sequential",e)}
              </option>
              <option
                value="parallel"
                ?selected=${"parallel"===this.config.zone_sequencing}
              >
                ${Qt("observed_watering.sequencing.parallel",e)}
              </option>
            </select>
          </div>
          <div class="setting-note">
            ${Qt("observed_watering.sequencing_description",e)}
          </div>

          ${this.config.direct_valve_control_enabled&&"advanced"===this.config.ui_mode?this.renderCycleAndSoak(e):""}
        </div>
      </ha-card>
    `}renderCycleAndSoak(e){var t,s,i;if(!this.config)return W``;const a=this.config,n=Number(null!==(t=a.watering_passes)&&void 0!==t?t:1)||1,r="parallel"!==a.zone_sequencing;return W`
      ${this._numRow(Qt("observed_watering.passes_label",e),"",n,(e=>this.handleConfigChange({watering_passes:Math.min(6,Math.max(1,parseInt(e)||1))})))}
      ${n>1?W`${this._numRow(Qt("observed_watering.soak_label",e),Qt("observed_watering.minutes",e),null!==(s=a.soak_minutes)&&void 0!==s?s:15,(e=>this.handleConfigChange({soak_minutes:Math.max(0,parseFloat(e)||0)})))}
            <div class="card-content">
              ${Qt("observed_watering.passes_description",e)}
            </div>`:W`<div class="card-content">
            ${Qt("observed_watering.passes_description",e)}
          </div>`}
      ${r?W`${this._numRow(Qt("observed_watering.pause_between_zones_label",e),Qt("observed_watering.seconds",e),null!==(i=a.pause_between_zones)&&void 0!==i?i:0,(e=>this.handleConfigChange({pause_between_zones:Math.max(0,parseFloat(e)||0)})))}
            <div class="card-content">
              ${Qt("observed_watering.pause_between_zones_description",e)}
            </div>`:""}
    `}renderPanelModeCard(){if(!this.hass||!this.config)return W``;const e="advanced"===this.config.ui_mode;return W`<ha-card
      header="${Qt("panels.general.cards.panel-mode.header",this.hass.language)}"
    >
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${Qt("panels.general.cards.panel-mode.labels.advanced",this.hass.language)}
            <div class="setting-hint">
              ${Qt("panels.general.cards.panel-mode.labels.advanced-hint",this.hass.language)}
            </div>
          </div>
          <ha-switch
            .checked=${e}
            @change=${e=>this.handleConfigChange({ui_mode:e.target.checked?"advanced":"standard"})}
          ></ha-switch>
        </div>
      </div>
    </ha-card>`}renderCalculationLogCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${Qt("calculation_log.title",e)}">
        <div class="card-content">
          ${Qt("calculation_log.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("calculation_log.enabled_label",e)}
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
                ${Qt("calculation_log.file_hint",e)}
              </div>`:""}
        </div>
      </ha-card>
    `}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return W``;const e=this.hass.config,t=(null==e?void 0:e.latitude)||0,s=(null==e?void 0:e.longitude)||0,i=(null==e?void 0:e.elevation)||0;return W`
      <ha-card
        header="${Qt("coordinate_config.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Qt("coordinate_config.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${e=>this.saveData({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.data.manual_coordinates_enabled?W`
                    ${this._numRow(Qt("coordinate_config.latitude",this.hass.language),"",this.data.manual_latitude||t,(e=>this.handleConfigChange({manual_latitude:parseFloat(e)})),.1)}
                    ${this._numRow(Qt("coordinate_config.longitude",this.hass.language),"",this.data.manual_longitude||s,(e=>this.handleConfigChange({manual_longitude:parseFloat(e)})),.1)}
                    ${this._numRow(Qt("coordinate_config.elevation",this.hass.language),"",this.data.manual_elevation||i,(e=>this.handleConfigChange({manual_elevation:parseFloat(e)})),1)}
                  `:W`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${Qt("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${Qt("coordinate_config.latitude",this.hass.language)}:
                      ${t}<br />
                      ${Qt("coordinate_config.longitude",this.hass.language)}:
                      ${s}<br />
                      ${Qt("coordinate_config.elevation",this.hass.language)}:
                      ${i}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){return this.config&&this.data&&this.hass?W`
      <ha-card
        header="${Qt("days_between_irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Qt("days_between_irrigation.description",this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(Qt("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,(e=>this.handleConfigChange({days_between_irrigation:parseInt(e)})),1)}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${Qt("days_between_irrigation.help_text",this.hass.language)}
            </div>
          </div>
        </div>
      </ha-card>
    `:W``}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this.config=Object.assign(Object.assign({},this.config),e),this._scheduleUpdate(),await(t=this.hass,s=this.data,t.callApi("POST",as+"/config",s))}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),Yi(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var t,s}}handleConfigChange(e){this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback(),void 0!==this._liveTimer&&(window.clearInterval(this._liveTimer),this._liveTimer=void 0)}_textRow(e,t,s,i){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==s?"":String(s)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_timeRow(e,t,s,i=""){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${i?W`<div class="setting-hint">${i}</div>`:""}
        </div>
        <input
          class="field"
          type="time"
          .value=${t?String(t):""}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,s,i,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const s=parseFloat(e.value),n=+((isNaN(s)?0:s)+t*a).toFixed(r);e.value=String(n),i(String(n))};return W`
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
            .value=${null==s?"":String(s)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${ua}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ma}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,s){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${s}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${ca}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,s,i=!1,a=!1){return W`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${a}
        @click=${s}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}static get styles(){return l`
      ${ba} ${xa} /* View-specific styles only - most common styles are now in globalStyle */

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

      /* The explanation under a setting: a nested .card-content has no
         padding of its own, so the text sat on the divider above it. */
      .setting-note {
        padding: 10px 0 12px;
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
    `}};s([me()],ka.prototype,"narrow",void 0),s([me()],ka.prototype,"path",void 0),s([me()],ka.prototype,"data",void 0),s([me()],ka.prototype,"config",void 0),s([me({attribute:!1})],ka.prototype,"zones",void 0),s([me({attribute:!1})],ka.prototype,"planning",void 0),s([me({attribute:!1})],ka.prototype,"programsState",void 0),s([me({type:Boolean})],ka.prototype,"isLoading",void 0),s([me({type:Boolean})],ka.prototype,"isSaving",void 0),ka=s([ue("smart-irrigation-view-general")],ka);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:Sa}=oe,Ta=()=>document.createComment(""),za=(e,t,s)=>{const i=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===s){const t=i.insertBefore(Ta(),a),n=i.insertBefore(Ta(),a);s=new Sa(t,n,e,e.options)}else{const t=s._$AB.nextSibling,n=s._$AM,r=n!==e;if(r){let t;s._$AQ?.(e),s._$AM=e,void 0!==s._$AP&&(t=e._$AU)!==n._$AU&&s._$AP(t)}if(t!==a||r){let e=s._$AA;for(;e!==t;){const t=e.nextSibling;i.insertBefore(e,a),e=t}}}return s},Ma=(e,t,s=e)=>(e._$AI(t,s),e),Oa={},Aa=(e,t=Oa)=>e._$AH=t,Ea=e=>{e._$AR(),e._$AA.remove()},Ca=(e,t,s)=>{const i=new Map;for(let a=t;a<=s;a++)i.set(e[a],a);return i},Ha=Ei(class extends Ci{constructor(e){if(super(e),e.type!==Ai)throw Error("repeat() can only be used in text expressions")}dt(e,t,s){let i;void 0===s?s=t:void 0!==t&&(i=t);const a=[],n=[];let r=0;for(const t of e)a[r]=i?i(t,r):r,n[r]=s(t,r),r++;return{values:n,keys:a}}render(e,t,s){return this.dt(e,t,s).values}update(e,[t,s,i]){const a=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,s,i);if(!Array.isArray(a))return this.ut=r,n;const o=this.ut??=[],l=[];let h,d,c=0,u=a.length-1,p=0,g=n.length-1;for(;c<=u&&p<=g;)if(null===a[c])c++;else if(null===a[u])u--;else if(o[c]===r[p])l[p]=Ma(a[c],n[p]),c++,p++;else if(o[u]===r[g])l[g]=Ma(a[u],n[g]),u--,g--;else if(o[c]===r[g])l[g]=Ma(a[c],n[g]),za(e,l[g+1],a[c]),c++,g--;else if(o[u]===r[p])l[p]=Ma(a[u],n[p]),za(e,a[c],a[u]),u--,p++;else if(void 0===h&&(h=Ca(r,p,g),d=Ca(o,c,u)),h.has(o[c]))if(h.has(o[u])){const t=d.get(r[p]),s=void 0!==t?a[t]:null;if(null===s){const t=za(e,a[c]);Ma(t,n[p]),l[p]=t}else l[p]=Ma(s,n[p]),za(e,a[c],s),a[t]=null;p++}else Ea(a[u]),u--;else Ea(a[c]),c++;for(;p<=g;){const t=za(e,l[g+1]);Ma(t,n[p]),l[p++]=t}for(;c<=u;){const e=a[c++];null!==e&&Ea(e)}return this.ut=r,Aa(e,l),G}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var Da,Na;function Ra(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function Pa(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth",e.Time="time"}(Da||(Da={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(Na||(Na={}));var La,ja={exports:{}};var Ia,Ba=(La||(La=1,(Ia=ja).exports=function(){var e,t;function s(){return e.apply(null,arguments)}function i(t){e=t}function a(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function r(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function o(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(r(e,t))return!1;return!0}function l(e){return void 0===e}function h(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function d(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function c(e,t){var s,i=[],a=e.length;for(s=0;s<a;++s)i.push(t(e[s],s));return i}function u(e,t){for(var s in t)r(t,s)&&(e[s]=t[s]);return r(t,"toString")&&(e.toString=t.toString),r(t,"valueOf")&&(e.valueOf=t.valueOf),e}function p(e,t,s,i){return si(e,t,s,i,!0).utc()}function g(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidOffset:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function m(e){return null==e._pf&&(e._pf=g()),e._pf}function f(e){var s=null,i=!1,a=e._d&&!isNaN(e._d.getTime());return a&&(s=m(e),i=t.call(s.parsedDateParts,(function(e){return null!=e})),a=s.overflow<0&&!s.empty&&!s.invalidEra&&!s.invalidMonth&&!s.invalidOffset&&!s.invalidWeekday&&!s.weekdayMismatch&&!s.nullInput&&!s.invalidFormat&&!s.userInvalidated&&(!s.meridiem||s.meridiem&&i),e._strict&&(a=a&&0===s.charsLeftOver&&0===s.unusedTokens.length&&void 0===s.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?a:(e._isValid=a,e._isValid)}function v(e){var t=p(NaN);return null!=e?u(m(t),e):m(t).userInvalidated=!0,t}t=Array.prototype.some?Array.prototype.some:function(e){var t,s=Object(this),i=s.length>>>0;for(t=0;t<i;t++)if(t in s&&e.call(this,s[t],t,s))return!0;return!1};var _=s.momentProperties=[],b=!1;function y(e,t){var s,i,a,n=_.length;if(l(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),l(t._i)||(e._i=t._i),l(t._f)||(e._f=t._f),l(t._l)||(e._l=t._l),l(t._strict)||(e._strict=t._strict),l(t._tzm)||(e._tzm=t._tzm),l(t._isUTC)||(e._isUTC=t._isUTC),l(t._offset)||(e._offset=t._offset),l(t._pf)||(e._pf=m(t)),l(t._locale)||(e._locale=t._locale),n>0)for(s=0;s<n;s++)l(a=t[i=_[s]])||(e[i]=a);return e}function w(e){y(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===b&&(b=!0,s.updateOffset(this),b=!1)}function $(e){return e instanceof w||null!=e&&null!=e._isAMomentObject}function x(e){!1===s.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function k(e,t){var i=!0;return u((function(){if(null!=s.deprecationHandler&&s.deprecationHandler(null,e),i){var a,n,o,l=[],h=arguments.length;for(n=0;n<h;n++){if(a="","object"==typeof arguments[n]){for(o in a+="\n["+n+"] ",arguments[0])r(arguments[0],o)&&(a+=o+": "+arguments[0][o]+", ");a=a.slice(0,-2)}else a=arguments[n];l.push(a)}x(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),i=!1}return t.apply(this,arguments)}),t)}var S={};function T(e,t){null!=s.deprecationHandler&&s.deprecationHandler(e,t),S[e]||(x(t+"\n"+(new Error).stack),S[e]=!0)}function z(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}s.suppressDeprecationWarnings=!1,s.deprecationHandler=null;var M={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function O(e){return"string"==typeof e?M[e]||M[e.toLowerCase()]:void 0}function A(e){var t,s,i={};for(s in e)r(e,s)&&(t=O(s))&&(i[t]=e[s]);return i}var E={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function C(e){var t,s=[];for(t in e)r(e,t)&&s.push({unit:t,priority:E[t]});return s.sort((function(e,t){return e.priority-t.priority})),s}function H(e,t,s){var i=""+Math.abs(e),a=t-i.length;return(e>=0?s?"+":"":"-")+Math.pow(10,Math.max(0,a)).toString().substr(1)+i}var D=/(\[[^\[]*\])|(\\e)|(\\)?(eHHmm|[Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,R={},P={};function L(e,t,s,i){var a=i;"string"==typeof i&&(a=function(){return this[i]()}),e&&(P[e]=a),t&&(P[t[0]]=function(){return H(a.apply(this,arguments),t[1],t[2])}),s&&(P[s]=function(){return this.localeData().ordinal(a.apply(this,arguments),e)})}function j(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function I(e){var t,s,i=e.match(D);for(t=0,s=i.length;t<s;t++)P[i[t]]?i[t]=P[i[t]]:i[t]=j(i[t]);return function(t){var a,n="";for(a=0;a<s;a++)n+=z(i[a])?i[a].call(t,e):i[a];return n}}function B(e,t){if(!e.isValid())return e.localeData().invalidDate();var s="$"+(t=U(t,e.localeData()));return r(R,s)||(R[s]=I(t)),R[s](e)}function U(e,t){var s=5;function i(e){return t.longDateFormat(e)||e}for(N.lastIndex=0;s>=0&&N.test(e);)e=e.replace(N,i),N.lastIndex=0,s-=1;return e}var F,Y=/\d/,W=/\d\d/,V=/\d{3}/,G=/\d{4}/,Z=/[+-]?\d{6}/,q=/\d\d?/,K=/\d\d\d\d?/,J=/\d\d\d\d\d\d?/,X=/\d{1,3}/,Q=/\d{1,4}/,ee=/[+-]?\d{1,6}/,te=/\d+/,se=/[+-]?\d+/,ie=/Z|[+-]\d\d:?\d\d/gi,ae=/Z|[+-]\d\d(?::?\d\d)?/gi,ne=/[+-]?\d+(\.\d{1,3})?/,re=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,oe=/^[1-9]\d?/,le=/^([1-9]\d|\d)/;function he(e,t,s){F[e]=z(t)?t:function(e,i){return e&&s?s:t}}function de(e,t){return r(F,e)?F[e](t._strict,t._locale):new RegExp(ce(e))}function ce(e){return ue(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,(function(e,t,s,i,a){return t||s||i||a})))}function ue(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function pe(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function ge(e){var t=+e,s=0;return 0!==t&&isFinite(t)&&(s=pe(t)),s}F={};var me={};function fe(e,t){var s,i,a=t;for("string"==typeof e&&(e=[e]),h(t)&&(a=function(e,s){s[t]=ge(e)}),i=e.length,s=0;s<i;s++)me[e[s]]=a}function ve(e,t){fe(e,(function(e,s,i,a){i._w=i._w||{},t(e,i._w,i,a)}))}function _e(e,t,s){null!=t&&r(me,e)&&me[e](t,s._a,s,e)}function be(e){return e%4==0&&e%100!=0||e%400==0}var ye=0,we=1,$e=2,xe=3,ke=4,Se=5,Te=6,ze=7,Me=8;function Oe(e){return be(e)?366:365}L("Y",0,0,(function(){var e=this.year();return e<=9999?H(e,4):"+"+e})),L(0,["YY",2],0,(function(){return this.year()%100})),L(0,["YYYY",4],0,"year"),L(0,["YYYYY",5],0,"year"),L(0,["YYYYYY",6,!0],0,"year"),he("Y",se),he("YY",q,W),he("YYYY",Q,G),he("YYYYY",ee,Z),he("YYYYYY",ee,Z),fe(["YYYYY","YYYYYY"],ye),fe("YYYY",(function(e,t){t[ye]=2===e.length?s.parseTwoDigitYear(e):ge(e)})),fe("YY",(function(e,t){t[ye]=s.parseTwoDigitYear(e)})),fe("Y",(function(e,t){t[ye]=parseInt(e,10)})),s.parseTwoDigitYear=function(e){return ge(e)+(ge(e)>68?1900:2e3)};var Ae,Ee=He("FullYear",!0);function Ce(){return be(this.year())}function He(e,t){return function(i){return null!=i?(Ne(this,e,i),s.updateOffset(this,t),this):De(this,e)}}function De(e,t){if(!e.isValid())return NaN;var s=e._d,i=e._isUTC;switch(t){case"Milliseconds":return i?s.getUTCMilliseconds():s.getMilliseconds();case"Seconds":return i?s.getUTCSeconds():s.getSeconds();case"Minutes":return i?s.getUTCMinutes():s.getMinutes();case"Hours":return i?s.getUTCHours():s.getHours();case"Date":return i?s.getUTCDate():s.getDate();case"Day":return i?s.getUTCDay():s.getDay();case"Month":return i?s.getUTCMonth():s.getMonth();case"FullYear":return i?s.getUTCFullYear():s.getFullYear();default:return NaN}}function Ne(e,t,s){var i,a,n,r,o;if(e.isValid()&&!isNaN(s)){switch(i=e._d,a=e._isUTC,t){case"Milliseconds":return void(a?i.setUTCMilliseconds(s):i.setMilliseconds(s));case"Seconds":return void(a?i.setUTCSeconds(s):i.setSeconds(s));case"Minutes":return void(a?i.setUTCMinutes(s):i.setMinutes(s));case"Hours":return void(a?i.setUTCHours(s):i.setHours(s));case"Date":return void(a?i.setUTCDate(s):i.setDate(s));case"FullYear":break;default:return}n=s,r=e.month(),o=29!==(o=e.date())||1!==r||be(n)?o:28,a?i.setUTCFullYear(n,r,o):i.setFullYear(n,r,o)}}function Re(e){return z(this[e=O(e)])?this[e]():this}function Pe(e,t){if("object"==typeof e){var s,i=C(e=A(e)),a=i.length;for(s=0;s<a;s++)this[i[s].unit](e[i[s].unit])}else if(z(this[e=O(e)]))return this[e](t);return this}function Le(e,t){return(e%t+t)%t}function je(e,t){if(isNaN(e)||isNaN(t))return NaN;var s=Le(t,12);return e+=(t-s)/12,1===s?be(e)?29:28:31-s%7%2}Ae=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},L("M",["MM",2],"Mo",(function(){return this.month()+1})),L("MMM",0,0,(function(e){return this.localeData().monthsShort(this,e)})),L("MMMM",0,0,(function(e){return this.localeData().months(this,e)})),he("M",q,oe),he("MM",q,W),he("MMM",(function(e,t){return t.monthsShortRegex(e)})),he("MMMM",(function(e,t){return t.monthsRegex(e)})),fe(["M","MM"],(function(e,t){t[we]=ge(e)-1})),fe(["MMM","MMMM"],(function(e,t,s,i){var a=s._locale.monthsParse(e,i,s._strict);null!=a?t[we]=a:m(s).invalidMonth=e}));var Ie="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Be="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Ue=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Fe=re,Ye=re,We=["monthsParse","longMonthsParse","shortMonthsParse","monthsRegex","monthsShortRegex","monthsStrictRegex","monthsShortStrictRegex"];function Ve(e,t){var s,i;for(s=0;s<We.length;s++)r(t,i=We[s])||delete e["_"+i]}function Ge(e,t){return e?a(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||Ue).test(t)?"format":"standalone"][e.month()]:a(this._months)?this._months:this._months.standalone}function Ze(e,t){return e?a(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[Ue.test(t)?"format":"standalone"][e.month()]:a(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function qe(e,t,s){var i,a,n,r=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],i=0;i<12;++i)n=p([2e3,i]),this._shortMonthsParse[i]=this.monthsShort(n,"").toLocaleLowerCase(),this._longMonthsParse[i]=this.months(n,"").toLocaleLowerCase();return s?"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,r))?a:null:-1!==(a=Ae.call(this._longMonthsParse,r))?a:null:"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,r))||-1!==(a=Ae.call(this._longMonthsParse,r))?a:null:-1!==(a=Ae.call(this._longMonthsParse,r))||-1!==(a=Ae.call(this._shortMonthsParse,r))?a:null}function Ke(e,t,s){var i,a,n;if(this._monthsParseExact)return qe.call(this,e,t,s);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),i=0;i<12;i++){if(a=p([2e3,i]),s&&!this._longMonthsParse[i]&&(this._longMonthsParse[i]=new RegExp("^"+this.months(a,"").replace(".","")+"$","i"),this._shortMonthsParse[i]=new RegExp("^"+this.monthsShort(a,"").replace(".","")+"$","i")),s||this._monthsParse[i]||(n="^"+this.months(a,"")+"|^"+this.monthsShort(a,""),this._monthsParse[i]=new RegExp(n.replace(".",""),"i")),s&&"MMMM"===t&&this._longMonthsParse[i].test(e))return i;if(s&&"MMM"===t&&this._shortMonthsParse[i].test(e))return i;if(!s&&this._monthsParse[i].test(e))return i}}function Je(e,t){if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=ge(t);else if(!h(t=e.localeData().monthsParse(t)))return e;var s=t,i=e.date();return i=i<29?i:Math.min(i,je(e.year(),s)),e._isUTC?e._d.setUTCMonth(s,i):e._d.setMonth(s,i),e}function Xe(e){return null!=e?(Je(this,e),s.updateOffset(this,!0),this):De(this,"Month")}function Qe(){return je(this.year(),this.month())}function et(e){return this._monthsParseExact?(r(this,"_monthsRegex")||st.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(r(this,"_monthsShortRegex")||(this._monthsShortRegex=Fe),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function tt(e){return this._monthsParseExact?(r(this,"_monthsRegex")||st.call(this),e?this._monthsStrictRegex:this._monthsRegex):(r(this,"_monthsRegex")||(this._monthsRegex=Ye),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function st(){function e(e,t){return t.length-e.length}var t,s,i,a,n=[],r=[],o=[];for(t=0;t<12;t++)s=p([2e3,t]),i=ue(this.monthsShort(s,"")),a=ue(this.months(s,"")),n.push(i),r.push(a),o.push(a),o.push(i);n.sort(e),r.sort(e),o.sort(e),this._monthsRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+n.join("|")+")","i")}function it(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function at(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function nt(e,t){return e.slice(t,7).concat(e.slice(0,t))}L("d",0,"do","day"),L("dd",0,0,(function(e){return this.localeData().weekdaysMin(this,e)})),L("ddd",0,0,(function(e){return this.localeData().weekdaysShort(this,e)})),L("dddd",0,0,(function(e){return this.localeData().weekdays(this,e)})),L("e",0,0,"weekday"),L("E",0,0,"isoWeekday"),L("eHHmm",0,0,(function(){return""+this.weekday()+H(this.hours(),2)+H(this.minutes(),2)})),he("d",q),he("e",q),he("E",q),he("eHHmm",J),he("dd",(function(e,t){return t.weekdaysMinRegex(e)})),he("ddd",(function(e,t){return t.weekdaysShortRegex(e)})),he("dddd",(function(e,t){return t.weekdaysRegex(e)})),ve(["dd","ddd","dddd"],(function(e,t,s,i){var a=s._locale.weekdaysParse(e,i,s._strict);null!=a?t.d=a:m(s).invalidWeekday=e})),ve(["d","e","E"],(function(e,t,s,i){t[i]=ge(e)})),ve("eHHmm",(function(e,t,s){var i=e.length-4;t.e=ge(e.substr(0,i)),s._a[xe]=ge(e.substr(i,2)),s._a[ke]=ge(e.substr(i+2))}));var rt,ot="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),lt="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),ht="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),dt=re,ct=re,ut=re,pt=["weekdaysParse","fullWeekdaysParse","shortWeekdaysParse","minWeekdaysParse","weekdaysRegex","weekdaysShortRegex","weekdaysMinRegex","weekdaysStrictRegex","weekdaysShortStrictRegex","weekdaysMinStrictRegex"];function gt(e,t){var s,i;for(s=0;s<pt.length;s++)r(t,i=pt[s])||delete e["_"+i]}function mt(e,t){var s=a(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"];return!0===e?nt(s,this._week.dow):e?s[e.day()]:s}function ft(e){return!0===e?nt(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function vt(e){return!0===e?nt(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function _t(e,t,s){var i,a,n,r=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],i=0;i<7;++i)n=p([2e3,1]).day(i),this._minWeekdaysParse[i]=this.weekdaysMin(n,"").toLocaleLowerCase(),this._shortWeekdaysParse[i]=this.weekdaysShort(n,"").toLocaleLowerCase(),this._weekdaysParse[i]=this.weekdays(n,"").toLocaleLowerCase();return s?"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,r))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._shortWeekdaysParse,r))||-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,r))||-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,r))||-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._shortWeekdaysParse,r))?a:null}function bt(e,t,s){var i,a,n;if(this._weekdaysParseExact)return _t.call(this,e,t,s);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),i=0;i<7;i++){if(a=p([2e3,1]).day(i),s&&!this._fullWeekdaysParse[i]&&(this._fullWeekdaysParse[i]=new RegExp("^"+this.weekdays(a,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[i]=new RegExp("^"+this.weekdaysShort(a,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[i]=new RegExp("^"+this.weekdaysMin(a,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[i]||(n="^"+this.weekdays(a,"")+"|^"+this.weekdaysShort(a,"")+"|^"+this.weekdaysMin(a,""),this._weekdaysParse[i]=new RegExp(n.replace(".",""),"i")),s&&"dddd"===t&&this._fullWeekdaysParse[i].test(e))return i;if(s&&"ddd"===t&&this._shortWeekdaysParse[i].test(e))return i;if(s&&"dd"===t&&this._minWeekdaysParse[i].test(e))return i;if(!s&&this._weekdaysParse[i].test(e))return i}}function yt(e){if(!this.isValid())return null!=e?this:NaN;var t=De(this,"Day");return null!=e?(e=it(e,this.localeData()),this.add(e-t,"d")):t}function wt(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function $t(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=at(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7}function xt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(r(this,"_weekdaysRegex")||(this._weekdaysRegex=dt),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function kt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(r(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ct),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function St(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||Tt.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(r(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=ut),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Tt(){function e(e,t){return t.length-e.length}var t,s,i,a,n,r=[],o=[],l=[],h=[];for(t=0;t<7;t++)s=p([2e3,1]).day(t),i=ue(this.weekdaysMin(s,"")),a=ue(this.weekdaysShort(s,"")),n=ue(this.weekdays(s,"")),r.push(i),o.push(a),l.push(n),h.push(i),h.push(a),h.push(n);r.sort(e),o.sort(e),l.sort(e),h.sort(e),this._weekdaysRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+r.join("|")+")","i")}function zt(e){var t,s;for(s in Ve(this,e),gt(this,e),e)r(e,s)&&(z(t=e[s])?this[s]=t:this["_"+s]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function Mt(e,t){var s,i=u({},e);for(s in t)r(t,s)&&(n(e[s])&&n(t[s])?(i[s]={},u(i[s],e[s]),u(i[s],t[s])):null!=t[s]?i[s]=t[s]:delete i[s]);for(s in e)r(e,s)&&!r(t,s)&&n(e[s])&&(i[s]=u({},i[s]));return i}function Ot(e){null!=e&&this.set(e)}rt=Object.keys?Object.keys:function(e){var t,s=[];for(t in e)r(e,t)&&s.push(t);return s};var At={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function Et(e,t,s){var i=this._calendar[e]||this._calendar.sameElse;return z(i)?i.call(t,s):i}var Ct={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function Ht(e){var t=this._longDateFormat[e],s=this._longDateFormat[e.toUpperCase()],i=this._longDateFormatCache;return t||!s?t:i&&i[e]&&i[e].formatUpper===s?i[e].format:(t=s.match(D).map((function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e})).join(""),i||(i=this._longDateFormatCache={}),i[e]={formatUpper:s,format:t},t)}var Dt="Invalid date";function Nt(){return this._invalidDate}var Rt="%d",Pt=/\d{1,2}/;function Lt(e){return this._ordinal.replace("%d",e)}var jt={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function It(e,t,s,i){var a=this._relativeTime[s];return z(a)?a(e,t,s,i):a.replace(/%d/i,e)}function Bt(e,t,s,i){return this.postformat(It.call(this,e,t,s,i))}function Ut(e,t){var s=this._relativeTime[e>0?"future":"past"];return z(s)?s(t):s.replace(/%s/i,t)}function Ft(e,t){return this.postformat(Ut.call(this,e,t))}function Yt(e,t,s,i,a,n,r){var o;return e<100&&e>=0?(o=new Date(e+400,t,s,i,a,n,r),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,t,s,i,a,n,r),o}function Wt(e){var t,s;return e<100&&e>=0?((s=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,s)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function Vt(e,t,s){var i=7+t-s;return-(7+Wt(e,0,i).getUTCDay()-t)%7+i-1}function Gt(e,t,s,i,a){var n,r,o=1+7*(t-1)+(7+s-i)%7+Vt(e,i,a);return o<=0?r=Oe(n=e-1)+o:o>Oe(e)?(n=e+1,r=o-Oe(e)):(n=e,r=o),{year:n,dayOfYear:r}}function Zt(e,t,s,i){var a,n,r=Vt(e,s,i),o=Math.floor((t-r-1)/7)+1;return o<1?a=o+Jt(n=e-1,s,i):o>Jt(e,s,i)?(a=o-Jt(e,s,i),n=e+1):(n=e,a=o),{week:a,year:n}}function qt(e,t,s){return Zt(e.year(),e.dayOfYear(),t,s)}function Kt(e,t,s,i,a){return Zt(e,Math.round((Wt(e,t,s)-Wt(e,0,1))/864e5)+1,i,a)}function Jt(e,t,s){var i=Vt(e,t,s),a=Vt(e+1,t,s);return(Oe(e)-i+a)/7}function Xt(e){return qt(e,this._week.dow,this._week.doy).week}L("w",["ww",2],"wo","week"),L("W",["WW",2],"Wo","isoWeek"),he("w",q,oe),he("ww",q,W),he("W",q,oe),he("WW",q,W),ve(["w","ww","W","WW"],(function(e,t,s,i){t[i.substr(0,1)]=ge(e)}));var Qt={dow:0,doy:6};function es(){return this._week.dow}function ts(){return this._week.doy}function ss(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function is(e){var t=qt(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function as(){return this.hours()%12||12}function ns(){return this.hours()||24}function rs(e,t){L(e,0,0,(function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)}))}function os(e,t){return t._meridiemParse}function ls(e){return"p"===(e+"").toLowerCase().charAt(0)}L("H",["HH",2],0,"hour"),L("h",["hh",2],0,as),L("k",["kk",2],0,ns),L("hmm",0,0,(function(){return""+as.apply(this)+H(this.minutes(),2)})),L("hmmss",0,0,(function(){return""+as.apply(this)+H(this.minutes(),2)+H(this.seconds(),2)})),L("Hmm",0,0,(function(){return""+this.hours()+H(this.minutes(),2)})),L("Hmmss",0,0,(function(){return""+this.hours()+H(this.minutes(),2)+H(this.seconds(),2)})),rs("a",!0),rs("A",!1),he("a",os),he("A",os),he("H",q,le),he("h",q,oe),he("k",q,oe),he("HH",q,W),he("hh",q,W),he("kk",q,W),he("hmm",K),he("hmmss",J),he("Hmm",K),he("Hmmss",J),fe(["H","HH"],xe),fe(["k","kk"],(function(e,t,s){var i=ge(e);t[xe]=24===i?0:i})),fe(["a","A"],(function(e,t,s){s._isPm=s._locale.isPM(e),s._meridiem=e})),fe(["h","hh"],(function(e,t,s){t[xe]=ge(e),m(s).bigHour=!0})),fe("hmm",(function(e,t,s){var i=e.length-2;t[xe]=ge(e.substr(0,i)),t[ke]=ge(e.substr(i)),m(s).bigHour=!0})),fe("hmmss",(function(e,t,s){var i=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,i)),t[ke]=ge(e.substr(i,2)),t[Se]=ge(e.substr(a)),m(s).bigHour=!0})),fe("Hmm",(function(e,t,s){var i=e.length-2;t[xe]=ge(e.substr(0,i)),t[ke]=ge(e.substr(i))})),fe("Hmmss",(function(e,t,s){var i=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,i)),t[ke]=ge(e.substr(i,2)),t[Se]=ge(e.substr(a))}));var hs=/[ap]\.?m?\.?/i,ds=He("Hours",!0);function cs(e,t,s){return e>11?s?"pm":"PM":s?"am":"AM"}var us,ps={calendar:At,longDateFormat:Ct,invalidDate:Dt,ordinal:Rt,dayOfMonthOrdinalParse:Pt,relativeTime:jt,months:Ie,monthsShort:Be,week:Qt,weekdays:ot,weekdaysMin:ht,weekdaysShort:lt,meridiemParse:hs},gs={},ms={};function fs(e,t){var s,i=Math.min(e.length,t.length);for(s=0;s<i;s+=1)if(e[s]!==t[s])return s;return i}function vs(e){return e?e.toLowerCase().replace("_","-"):e}function _s(e){for(var t,s,i,a,n=0;n<e.length;){for(t=(a=vs(e[n]).split("-")).length,s=(s=vs(e[n+1]))?s.split("-"):null;t>0;){if(i=ys(a.slice(0,t).join("-")))return i;if(s&&s.length>=t&&fs(a,s)>=t-1)break;t--}n++}return us}function bs(e){return"string"==typeof e&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e)}function ys(e){var t,s=null;if(r(gs,e))return gs[e];if(t=vs(e),r(gs,t))return gs[t];if(Ia&&Ia.exports&&bs(t))try{s=us._abbr,Pa("./locale/"+t),ws(s)}catch(e){gs[t]=null}return r(gs,t)?gs[t]:void 0}function ws(e,t){var s;return e&&((s=l(t)?ks(e):$s(e,t))?us=s:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),us._abbr}function $s(e,t){if(null!==t){var s,i=ps;if(t.abbr=e,null!=gs[e])T("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),i=gs[e]._config;else if(null!=t.parentLocale)if(null!=gs[t.parentLocale])i=gs[t.parentLocale]._config;else{if(null==(s=ys(t.parentLocale)))return ms[t.parentLocale]||(ms[t.parentLocale]=[]),ms[t.parentLocale].push({name:e,config:t}),null;i=s._config}return gs[e]=new Ot(Mt(i,t)),ms[e]&&ms[e].forEach((function(e){$s(e.name,e.config)})),ws(e),gs[e]}return delete gs[e],null}function xs(e,t){var s,i=ys(e),a=ps;return null!=i&&(e=i._abbr),null!=t?(null!=gs[e]&&null!=gs[e].parentLocale?gs[e].set(Mt(gs[e]._config,t)):(null!=i&&(a=i._config),t=Mt(a,t),null==i&&(t.abbr=e),(s=new Ot(t)).parentLocale=gs[e],gs[e]=s),ws(e)):null!=gs[e]&&(null!=gs[e].parentLocale?(gs[e]=gs[e].parentLocale,e===ws()&&ws(e)):null!=gs[e]&&delete gs[e]),gs[e]}function ks(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return us;if(!a(e)){if(t=ys(e))return t;e=[e]}return _s(e)}function Ss(){return rt(gs)}function Ts(e){var t,s=e._a;return s&&-2===m(e).overflow&&(t=s[we]<0||s[we]>11?we:s[$e]<1||s[$e]>je(s[ye],s[we])?$e:s[xe]<0||s[xe]>24||24===s[xe]&&(0!==s[ke]||0!==s[Se]||0!==s[Te])?xe:s[ke]<0||s[ke]>59?ke:s[Se]<0||s[Se]>59?Se:s[Te]<0||s[Te]>999?Te:-1,m(e)._overflowDayOfYear&&(t<ye||t>$e)&&(t=$e),m(e)._overflowWeeks&&-1===t&&(t=ze),m(e)._overflowWeekday&&-1===t&&(t=Me),m(e).overflow=t),e}var zs=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ms=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Os=/Z|[+-]\d\d(?::?\d\d)?/,As=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],Es=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Cs=/^\/?Date\((-?\d+)/i,Hs=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Ds={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Ns(e){var t,s,i,a,n,r,o=e._i,l=zs.exec(o)||Ms.exec(o),h=As.length,d=Es.length;if(l){for(m(e).iso=!0,t=0,s=h;t<s;t++)if(As[t][1].exec(l[1])){a=As[t][0],i=!1!==As[t][2];break}if(null==a)return void(e._isValid=!1);if(l[3]){for(t=0,s=d;t<s;t++)if(Es[t][1].exec(l[3])){n=(l[2]||" ")+Es[t][0];break}if(null==n)return void(e._isValid=!1)}if(!i&&null!=n)return void(e._isValid=!1);if(l[4]){if(!Os.exec(l[4]))return void(e._isValid=!1);r="Z"}e._f=a+(n||"")+(r||""),qs(e)}else e._isValid=!1}function Rs(e,t,s,i,a,n){var r=[Ps(e),Be.indexOf(t),parseInt(s,10),parseInt(i,10),parseInt(a,10)];return n&&r.push(parseInt(n,10)),r}function Ps(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function Ls(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function js(e,t,s){return!e||lt.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(m(s).weekdayMismatch=!0,s._isValid=!1,!1)}function Is(e,t,s){if(e)return Ds[e];if(t)return 0;var i=parseInt(s,10),a=i%100;return(i-a)/100*60+a}function Bs(e){var t,s=Hs.exec(Ls(e._i));if(s){if(t=Rs(s[4],s[3],s[2],s[5],s[6],s[7]),!js(s[1],t,e))return;e._a=t,e._tzm=Is(s[8],s[9],s[10]),e._d=Wt.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),m(e).rfc2822=!0}else e._isValid=!1}function Us(e){var t=Cs.exec(e._i);null===t?(Ns(e),!1===e._isValid&&(delete e._isValid,Bs(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:s.createFromInputFallback(e)))):e._d=new Date(+t[1])}function Fs(e,t,s){return null!=e?e:null!=t?t:s}function Ys(e,t,i){var a=Object.prototype.hasOwnProperty.call(e,"_isDefaultDatePartsForWeek"),n=e._isDefaultDatePartsForWeek;e._isDefaultDatePartsForWeek=!!i;try{return s._getDefaultDateParts(e,t,i)}finally{a?e._isDefaultDatePartsForWeek=n:delete e._isDefaultDatePartsForWeek}}function Ws(e){var t=e._defaultDatePartsNow;return t?(t.hasValue||(t.value=s.now(),t.hasValue=!0),t.value):s.now()}function Vs(e,t,s){var i=s||e._isDefaultDatePartsForWeek,a=i?ii(t):new Date(t);return i?[a.year(),a.month(),a.date()]:e._useUTC?[a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()]:[a.getFullYear(),a.getMonth(),a.getDate()]}function Gs(e){var t,s,i,a,n,r,o,l=[];if(!e._d){for(null!=e._a[ye]&&null!=e._a[we]&&null!=e._a[$e]||(a=Ys(e,i=Ws(e))),e._w&&null==e._a[$e]&&null==e._a[we]&&Zs(e,Ys(e,i,!0)),null!=e._dayOfYear&&(r=null!=e._a[ye]?e._a[ye]:a[ye],(e._dayOfYear>Oe(r)||0===e._dayOfYear)&&(m(e)._overflowDayOfYear=!0),s=Wt(r,0,e._dayOfYear),e._a[we]=s.getUTCMonth(),e._a[$e]=s.getUTCDate()),o=null==e._a[ye]||null==e._a[we]||null==e._a[$e],t=0;t<3&&null==e._a[t];++t)e._a[t]=l[t]=a[t];for(;t<7;t++)e._a[t]=l[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[xe]&&0===e._a[ke]&&0===e._a[Se]&&0===e._a[Te]&&(e._nextDay=!0,e._a[xe]=0),e._d=(e._useUTC?Wt:Yt).apply(null,l),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[xe]=24),e._w&&void 0!==e._w.d&&!o&&e._w.d!==n&&(m(e).weekdayMismatch=!0)}}function Zs(e,t){var s,i,a,n,r,o,l,h,d;null!=(s=e._w).GG||null!=s.W||null!=s.E?(r=1,o=4,i=Fs(s.GG,e._a[ye],Kt(t[ye],t[we],t[$e],1,4).year),a=Fs(s.W,1),((n=Fs(s.E,1))<1||n>7)&&(h=!0)):(r=e._locale._week.dow,o=e._locale._week.doy,d=Kt(t[ye],t[we],t[$e],r,o),i=Fs(s.gg,e._a[ye],d.year),a=Fs(s.w,d.week),null!=s.d?((n=s.d)<0||n>6)&&(h=!0):null!=s.e?(n=s.e+r,(s.e<0||s.e>6)&&(h=!0)):n=r),a<1||a>Jt(i,r,o)?m(e)._overflowWeeks=!0:null!=h?m(e)._overflowWeekday=!0:(l=Gt(i,a,n,r,o),e._a[ye]=l.year,e._dayOfYear=l.dayOfYear)}function qs(e){if(e._f!==s.ISO_8601)if(e._f!==s.RFC_2822){e._a=[],m(e).empty=!0;var t,i,a,n,r,o,l,h=""+e._i,d=h.length,c=0;for(l=(a=U(e._f,e._locale).match(D)||[]).length,t=0;t<l;t++)n=a[t],(i=(h.match(de(n,e))||[])[0])&&((r=h.substr(0,h.indexOf(i))).length>0&&m(e).unusedInput.push(r),h=h.slice(h.indexOf(i)+i.length),c+=i.length),P[n]?(i?m(e).empty=!1:m(e).unusedTokens.push(n),_e(n,i,e)):e._strict&&!i&&m(e).unusedTokens.push(n);m(e).charsLeftOver=d-c,h.length>0&&m(e).unusedInput.push(h),e._a[xe]<=12&&!0===m(e).bigHour&&e._a[xe]>0&&(m(e).bigHour=void 0),m(e).parsedDateParts=e._a.slice(0),m(e).meridiem=e._meridiem,e._a[xe]=Ks(e._locale,e._a[xe],e._meridiem),null!==(o=m(e).era)&&(e._a[ye]=e._locale.erasConvertYear(o,e._a[ye])),Gs(e),Ts(e)}else Bs(e);else Ns(e)}function Ks(e,t,s){var i;return null==s?t:null!=e.meridiemHour?e.meridiemHour(t,s):null!=e.isPM?((i=e.isPM(s))&&t<12&&(t+=12),i||12!==t||(t=0),t):t}function Js(e){var t,s,i,a,n,r,o=!1,l={},h=e._f.length;if(0===h)return m(e).invalidFormat=!0,void(e._d=new Date(NaN));for(a=0;a<h;a++)n=0,r=!1,t=y({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._defaultDatePartsNow=l,t._f=e._f[a],qs(t),f(t)&&(r=!0),n+=m(t).charsLeftOver,n+=10*m(t).unusedTokens.length,m(t).score=n,o?n<i&&(i=n,s=t):(null==i||n<i||r)&&(i=n,s=t,r&&(o=!0));u(e,s||t)}function Xs(e){if(!e._d){var t=A(e._i),s=void 0===t.day?t.date:t.day;e._a=c([t.year,t.month,s,t.hour,t.minute,t.second,t.millisecond],(function(e){return e&&parseInt(e,10)})),Gs(e)}}function Qs(e){var t=new w(Ts(ei(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function ei(e){var t=e._i,s=e._f;return e._locale=e._locale||ks(e._l),null===t||void 0===s&&""===t?v({nullInput:!0}):("string"==typeof t&&(e._i=t=e._locale.preparse(t)),$(t)?new w(Ts(t)):(d(t)?e._d=t:a(s)?Js(e):s?qs(e):ti(e),f(e)||(e._d=null),e))}function ti(e){var t=e._i;l(t)?e._d=new Date(s.now()):d(t)?e._d=new Date(t.valueOf()):"string"==typeof t?Us(e):a(t)?(e._a=c(t.slice(0),(function(e){return parseInt(e,10)})),Gs(e)):n(t)?Xs(e):h(t)?e._d=new Date(t):s.createFromInputFallback(e)}function si(e,t,s,i,r){var l={};return!0!==t&&!1!==t||(i=t,t=void 0),!0!==s&&!1!==s||(i=s,s=void 0),(n(e)&&o(e)||a(e)&&0===e.length)&&(e=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=r,l._l=s,l._i=e,l._f=t,l._strict=i,Qs(l)}function ii(e,t,s,i){return si(e,t,s,i,!1)}s.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",(function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))})),s._getDefaultDateParts=Vs,s.ISO_8601=function(){},s.RFC_2822=function(){};var ai=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=ii.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:v()})),ni=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",(function(){var e=ii.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:v()}));function ri(e,t){var s,i;if(1===t.length&&a(t[0])&&(t=t[0]),!t.length)return ii();for(i=0;i<t.length;++i)if($(t[i])){s=t[i];break}if(!s)return v();for(++i;i<t.length;++i)!$(t[i])||t[i].isValid()&&!t[i][e](s)||(s=t[i]);return s}function oi(){return ri("isBefore",[].slice.call(arguments,0))}function li(){return ri("isAfter",[].slice.call(arguments,0))}var hi=function(){return Date.now?Date.now():+new Date},di=["year","quarter","month","week","day","hour","minute","second","millisecond"];function ci(e){var t,s,i=!1,a=di.length;for(t in e)if(r(e,t)&&(-1===Ae.call(di,t)||null!=e[t]&&isNaN(e[t])))return!1;for(s=0;s<a;++s)if(e[di[s]]){if(i)return!1;parseFloat(e[di[s]])!==ge(e[di[s]])&&(i=!0)}return!0}function ui(){return this._isValid}function pi(){return Ri(NaN)}function gi(e){var t=A(e),s=t.year||0,i=t.quarter||0,a=t.month||0,n=t.week||t.isoWeek||0,r=t.day||0,o=t.hour||0,l=t.minute||0,h=t.second||0,d=t.millisecond||0;this._isValid=ci(t),this._milliseconds=+d+1e3*h+6e4*l+1e3*o*60*60,this._days=+r+7*n,this._months=+a+3*i+12*s,this._data={},this._locale=ks(),this._bubble()}function mi(e){return e instanceof gi}function fi(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function vi(e,t,s){var i,a=Math.min(e.length,t.length),n=Math.abs(e.length-t.length),r=0;for(i=0;i<a;i++)ge(e[i])!==ge(t[i])&&r++;return r+n}function _i(e,t){L(e,0,0,(function(){var e=this.utcOffset(),s="+";return e<0&&(e=-e,s="-"),s+H(~~(e/60),2)+t+H(~~e%60,2)}))}_i("Z",":"),_i("ZZ",""),he("Z",ae),he("ZZ",ae),fe(["Z","ZZ"],(function(e,t,s){var i=yi(ae,e);s._useUTC=!0,s._tzm=i,null===i&&(m(s).invalidOffset=e)}));var bi=/([\+\-]|\d\d)/gi;function yi(e,t){var s,i,a=(t||"").match(e);return null===a?null:(i=60*(s=((a[a.length-1]||[])+"").match(bi)||["-",0,0])[1]+ge(s[2]),ge(s[2])>59||("+"===s[0]?i>840:i>720)?null:0===i?0:"+"===s[0]?i:-i)}function wi(e,t){var i,a;return t._isUTC?(i=t.clone(),a=($(e)||d(e)?e.valueOf():ii(e).valueOf())-i.valueOf(),i._d.setTime(i._d.valueOf()+a),s.updateOffset(i,!1),i):ii(e).local()}function $i(e){return-Math.round(e._d.getTimezoneOffset())}function xi(e,t,i){var a,n=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=yi(ae,e)))return this}else Math.abs(e)<16&&!i&&(e*=60);return!this._isUTC&&t&&(a=$i(this)),this._offset=e,this._isUTC=!0,null!=a&&this.add(a,"m"),n!==e&&(!t||this._changeInProgress?Bi(this,Ri(e-n,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,s.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?n:$i(this)}function ki(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function Si(e){return this.utcOffset(0,e)}function Ti(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract($i(this),"m")),this}function zi(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=yi(ie,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function Mi(e){return!!this.isValid()&&(e=e?ii(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function Oi(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ai(){if(!l(this._isDSTShifted))return this._isDSTShifted;var e,t={};return y(t,this),(t=ei(t))._a?(e=t._isUTC?p(t._a):ii(t._a),this._isDSTShifted=this.isValid()&&vi(t._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function Ei(){return!!this.isValid()&&!this._isUTC}function Ci(){return!!this.isValid()&&this._isUTC}function Hi(){return!!this.isValid()&&this._isUTC&&0===this._offset}s.updateOffset=function(){};var Di=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,Ni=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Ri(e,t){var s,i,a,n=e,o=null;return mi(e)?n={ms:e._milliseconds,d:e._days,M:e._months}:h(e)||!isNaN(+e)?(n={},t?n[t]=+e:n.milliseconds=+e):(o=Di.exec(e))?(s="-"===o[1]?-1:1,n={y:0,d:ge(o[$e])*s,h:ge(o[xe])*s,m:ge(o[ke])*s,s:ge(o[Se])*s,ms:ge(fi(1e3*o[Te]))*s}):(o=Ni.exec(e))?(s="-"===o[1]?-1:1,n={y:Pi(o[2],s),M:Pi(o[3],s),w:Pi(o[4],s),d:Pi(o[5],s),h:Pi(o[6],s),m:Pi(o[7],s),s:Pi(o[8],s)}):null==n?n={}:"object"==typeof n&&("from"in n||"to"in n)&&(a=ji(ii(n.from),ii(n.to)),(n={}).ms=a.milliseconds,n.M=a.months),i=new gi(n),mi(e)&&r(e,"_locale")&&(i._locale=e._locale),mi(e)&&r(e,"_isValid")&&(i._isValid=e._isValid),i}function Pi(e,t){var s=e&&parseFloat(e.replace(",","."));return(isNaN(s)?0:s)*t}function Li(e,t){var s={};return s.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(s.months,"M").isAfter(t)&&--s.months,s.milliseconds=+t-+e.clone().add(s.months,"M"),s}function ji(e,t){var s;return e.isValid()&&t.isValid()?(t=wi(t,e),e.isBefore(t)?s=Li(e,t):((s=Li(t,e)).milliseconds=-s.milliseconds,s.months=-s.months),s):{milliseconds:0,months:0}}function Ii(e,t){return function(s,i){var a;return null===i||isNaN(+i)||(T(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),a=s,s=i,i=a),Bi(this,Ri(s,i),e),this}}function Bi(e,t,i,a){var n=t._milliseconds,r=fi(t._days),o=fi(t._months);e.isValid()&&(a=null==a||a,o&&Je(e,De(e,"Month")+o*i),r&&Ne(e,"Date",De(e,"Date")+r*i),n&&e._d.setTime(e._d.valueOf()+n*i),a&&s.updateOffset(e,r||o))}Ri.fn=gi.prototype,Ri.invalid=pi;var Ui=Ii(1,"add"),Fi=Ii(-1,"subtract");function Yi(e){return"string"==typeof e||e instanceof String}function Wi(e){return $(e)||d(e)||Yi(e)||h(e)||Gi(e)||Vi(e)||null==e}function Vi(e){var t,s,i=n(e)&&!o(e),a=!1,l=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],h=l.length;for(t=0;t<h;t+=1)s=l[t],a=a||r(e,s);return i&&a}function Gi(e){var t=a(e),s=!1;return t&&(s=0===e.filter((function(t){return!h(t)&&Yi(e)})).length),t&&s}function Zi(e){var t,s,i=n(e)&&!o(e),a=!1,l=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(t=0;t<l.length;t+=1)s=l[t],a=a||r(e,s);return i&&a}function qi(e,t){var s=e.diff(t,"days",!0);return s<-6?"sameElse":s<-1?"lastWeek":s<0?"lastDay":s<1?"sameDay":s<2?"nextDay":s<7?"nextWeek":"sameElse"}function Ki(e,t){1===arguments.length&&(arguments[0]?Wi(arguments[0])?(e=arguments[0],t=void 0):Zi(arguments[0])&&(t=arguments[0],e=void 0):(e=void 0,t=void 0));var i=e||ii(),a=wi(i,this).startOf("day"),n=s.calendarFormat(this,a)||"sameElse",r=t&&(z(t[n])?t[n].call(this,i):t[n]);return this.format(r||this.localeData().calendar(n,this,ii(i)))}function Ji(){return new w(this)}function Xi(e,t){var s=$(e)?e:ii(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()>s.valueOf():s.valueOf()<this.clone().startOf(t).valueOf())}function Qi(e,t){var s=$(e)?e:ii(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()<s.valueOf():this.clone().endOf(t).valueOf()<s.valueOf())}function ea(e,t,s,i){var a=$(e)?e:ii(e),n=$(t)?t:ii(t);return!!(this.isValid()&&a.isValid()&&n.isValid())&&("("===(i=i||"()")[0]?this.isAfter(a,s):!this.isBefore(a,s))&&(")"===i[1]?this.isBefore(n,s):!this.isAfter(n,s))}function ta(e,t){var s,i=$(e)?e:ii(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()===i.valueOf():(s=i.valueOf(),this.clone().startOf(t).valueOf()<=s&&s<=this.clone().endOf(t).valueOf()))}function sa(e,t){return this.isSame(e,t)||this.isAfter(e,t)}function ia(e,t){return this.isSame(e,t)||this.isBefore(e,t)}function aa(e,t,s){var i,a,n;if(!this.isValid())return NaN;if(!(i=wi(e,this)).isValid())return NaN;switch(a=6e4*(i.utcOffset()-this.utcOffset()),t=O(t)){case"year":n=na(this,i)/12;break;case"month":n=na(this,i);break;case"quarter":n=na(this,i)/3;break;case"second":n=(this-i)/1e3;break;case"minute":n=(this-i)/6e4;break;case"hour":n=(this-i)/36e5;break;case"day":n=(this-i-a)/864e5;break;case"week":n=(this-i-a)/6048e5;break;default:n=this-i}return s?n:pe(n)}function na(e,t){if(e.date()<t.date())return-na(t,e);var s=12*(t.year()-e.year())+(t.month()-e.month()),i=e.clone().add(s,"months");return-(s+(t-i<0?(t-i)/(i-e.clone().add(s-1,"months")):(t-i)/(e.clone().add(s+1,"months")-i)))||0}function ra(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function oa(e){if(!this.isValid())return null;var t=!0!==e,s=t?this.clone().utc():this;return s.year()<0||s.year()>9999?B(s,t?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):z(Date.prototype.toISOString)?t?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",B(s,"Z")):B(s,t?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function la(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,t,s,i,a="moment",n="";return this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",n="Z"),e="["+a+'("]',t=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",s="-MM-DD[T]HH:mm:ss.SSS",i=n+'[")]',this.format(e+t+s+i)}function ha(e){e||(e=this.isUtc()?s.defaultFormatUtc:s.defaultFormat);var t=B(this,e);return this.localeData().postformat(t)}function da(e,t){return this.isValid()&&($(e)&&e.isValid()||ii(e).isValid())?Ri({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function ca(e){return this.from(ii(),e)}function ua(e,t){return this.isValid()&&($(e)&&e.isValid()||ii(e).isValid())?Ri({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function pa(e){return this.to(ii(),e)}function ga(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ks(e))&&(this._locale=t),this)}s.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",s.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var ma=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",(function(e){return void 0===e?this.localeData():this.locale(e)}));function fa(){return this._locale}var va=1e3,_a=60*va,ba=60*_a,ya=3506328*ba;function wa(e,t){return(e%t+t)%t}function $a(e,t,s){return e<100&&e>=0?new Date(e+400,t,s)-ya:new Date(e,t,s).valueOf()}function xa(e,t,s){return e<100&&e>=0?Date.UTC(e+400,t,s)-ya:Date.UTC(e,t,s)}function ka(e){var t,i;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(i=this._isUTC?xa:$a,e){case"year":t=i(this.year(),0,1);break;case"quarter":t=i(this.year(),this.month()-this.month()%3,1);break;case"month":t=i(this.year(),this.month(),1);break;case"week":t=i(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=i(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=i(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=wa(t+(this._isUTC?0:this.utcOffset()*_a),ba);break;case"minute":t=this._d.valueOf(),t-=wa(t,_a);break;case"second":t=this._d.valueOf(),t-=wa(t,va)}return this._d.setTime(t),s.updateOffset(this,!0),this}function Sa(e){var t,i;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(i=this._isUTC?xa:$a,e){case"year":t=i(this.year()+1,0,1)-1;break;case"quarter":t=i(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=i(this.year(),this.month()+1,1)-1;break;case"week":t=i(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=i(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=i(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=ba-wa(t+(this._isUTC?0:this.utcOffset()*_a),ba)-1;break;case"minute":t=this._d.valueOf(),t+=_a-wa(t,_a)-1;break;case"second":t=this._d.valueOf(),t+=va-wa(t,va)-1}return this._d.setTime(t),s.updateOffset(this,!0),this}function Ta(){return this._d.valueOf()-6e4*(this._offset||0)}function za(){return Math.floor(this.valueOf()/1e3)}function Ma(){return new Date(this.valueOf())}function Oa(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function Aa(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function Ea(){return this.isValid()?this.toISOString():null}function Ca(){return f(this)}function Ha(){return u({},m(this))}function Da(){return m(this).overflow}function Na(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function Ra(e,t){var i,a,n,r=this._eras||ks("en")._eras;for(i=0,a=r.length;i<a;++i)switch("string"==typeof r[i].since&&(n=s(r[i].since).startOf("day"),r[i].since=n.valueOf()),typeof r[i].until){case"undefined":r[i].until=1/0;break;case"string":n=s(r[i].until).startOf("day").valueOf(),r[i].until=n.valueOf()}return r}function La(e,t,s){var i,a,n,r,o,l=this.eras();for(e=e.toUpperCase(),i=0,a=l.length;i<a;++i)if(n=l[i].name.toUpperCase(),r=l[i].abbr.toUpperCase(),o=l[i].narrow.toUpperCase(),s)switch(t){case"N":case"NN":case"NNN":if(r===e)return l[i];break;case"NNNN":if(n===e)return l[i];break;case"NNNNN":if(o===e)return l[i]}else if([n,r,o].indexOf(e)>=0)return l[i]}function ja(e,t){var i=e.since<=e.until?1:-1;return void 0===t?s(e.since).year():s(e.since).year()+(t-e.offset)*i}function Ba(){var e,t,s,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(s=this.clone().startOf("day").valueOf(),i[e].since<=s&&s<=i[e].until)return i[e].name;if(i[e].until<=s&&s<=i[e].since)return i[e].name}return""}function Ua(){var e,t,s,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(s=this.clone().startOf("day").valueOf(),i[e].since<=s&&s<=i[e].until)return i[e].narrow;if(i[e].until<=s&&s<=i[e].since)return i[e].narrow}return""}function Fa(){var e,t,s,i=this.localeData().eras();for(e=0,t=i.length;e<t;++e){if(s=this.clone().startOf("day").valueOf(),i[e].since<=s&&s<=i[e].until)return i[e].abbr;if(i[e].until<=s&&s<=i[e].since)return i[e].abbr}return""}function Ya(){var e,t,i,a,n=this.localeData().eras();for(e=0,t=n.length;e<t;++e)if(i=n[e].since<=n[e].until?1:-1,a=this.clone().startOf("day").valueOf(),n[e].since<=a&&a<=n[e].until||n[e].until<=a&&a<=n[e].since)return(this.year()-s(n[e].since).year())*i+n[e].offset;return this.year()}function Wa(e){return r(this,"_erasNameRegex")||Xa.call(this),e?this._erasNameRegex:this._erasRegex}function Va(e){return r(this,"_erasAbbrRegex")||Xa.call(this),e?this._erasAbbrRegex:this._erasRegex}function Ga(e){return r(this,"_erasNarrowRegex")||Xa.call(this),e?this._erasNarrowRegex:this._erasRegex}function Za(e,t){return t.erasAbbrRegex(e)}function qa(e,t){return t.erasNameRegex(e)}function Ka(e,t){return t.erasNarrowRegex(e)}function Ja(e,t){return t._eraYearOrdinalRegex||te}function Xa(){var e,t,s,i,a,n=[],r=[],o=[],l=[],h=this.eras();for(e=0,t=h.length;e<t;++e)s=ue(h[e].name),i=ue(h[e].abbr),a=ue(h[e].narrow),r.push(s),n.push(i),o.push(a),l.push(s),l.push(i),l.push(a);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+r.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+n.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+o.join("|")+")","i")}function Qa(e,t){L(0,[e,e.length],0,t)}function en(e){return on.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function tn(e){return on.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function sn(){return Jt(this.year(),1,4)}function an(){return Jt(this.isoWeekYear(),1,4)}function nn(){var e=this.localeData()._week;return Jt(this.year(),e.dow,e.doy)}function rn(){var e=this.localeData()._week;return Jt(this.weekYear(),e.dow,e.doy)}function on(e,t,s,i,a){var n;return null==e?qt(this,i,a).year:(t>(n=Jt(e,i,a))&&(t=n),ln.call(this,e,t,s,i,a))}function ln(e,t,s,i,a){var n=Gt(e,t,s,i,a),r=Wt(n.year,0,n.dayOfYear);return this.year(r.getUTCFullYear()),this.month(r.getUTCMonth()),this.date(r.getUTCDate()),this}function hn(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}L("N",0,0,"eraAbbr"),L("NN",0,0,"eraAbbr"),L("NNN",0,0,"eraAbbr"),L("NNNN",0,0,"eraName"),L("NNNNN",0,0,"eraNarrow"),L("y",["y",1],"yo","eraYear"),L("y",["yy",2],0,"eraYear"),L("y",["yyy",3],0,"eraYear"),L("y",["yyyy",4],0,"eraYear"),he("N",Za),he("NN",Za),he("NNN",Za),he("NNNN",qa),he("NNNNN",Ka),fe(["N","NN","NNN","NNNN","NNNNN"],(function(e,t,s,i){var a=s._locale.erasParse(e,i,s._strict);a?m(s).era=a:m(s).invalidEra=e})),he("y",te),he("yy",te),he("yyy",te),he("yyyy",te),he("yo",Ja),fe(["y","yy","yyy","yyyy"],ye),fe(["yo"],(function(e,t,s,i){var a;s._locale._eraYearOrdinalRegex&&(a=e.match(s._locale._eraYearOrdinalRegex)),s._locale.eraYearOrdinalParse?t[ye]=s._locale.eraYearOrdinalParse(e,a):t[ye]=parseInt(e,10)})),L(0,["gg",2],0,(function(){return this.weekYear()%100})),L(0,["GG",2],0,(function(){return this.isoWeekYear()%100})),Qa("gggg","weekYear"),Qa("ggggg","weekYear"),Qa("GGGG","isoWeekYear"),Qa("GGGGG","isoWeekYear"),he("G",se),he("g",se),he("GG",q,W),he("gg",q,W),he("GGGG",Q,G),he("gggg",Q,G),he("GGGGG",ee,Z),he("ggggg",ee,Z),ve(["gggg","ggggg","GGGG","GGGGG"],(function(e,t,s,i){t[i.substr(0,2)]=ge(e)})),ve(["gg","GG"],(function(e,t,i,a){t[a]=s.parseTwoDigitYear(e)})),L("Q",0,"Qo","quarter"),he("Q",Y),fe("Q",(function(e,t){t[we]=3*(ge(e)-1)})),L("D",["DD",2],"Do","date"),he("D",q,oe),he("DD",q,W),he("Do",(function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient})),fe(["D","DD"],$e),fe("Do",(function(e,t){t[$e]=ge(e.match(q)[0])}));var dn=He("Date",!0);function cn(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}L("DDD",["DDDD",3],"DDDo","dayOfYear"),he("DDD",X),he("DDDD",V),fe(["DDD","DDDD"],(function(e,t,s){s._dayOfYear=ge(e)})),L("m",["mm",2],0,"minute"),he("m",q,le),he("mm",q,W),fe(["m","mm"],ke);var un=He("Minutes",!1);L("s",["ss",2],0,"second"),he("s",q,le),he("ss",q,W),fe(["s","ss"],Se);var pn,gn,mn=He("Seconds",!1);for(L("S",0,0,(function(){return~~(this.millisecond()/100)})),L(0,["SS",2],0,(function(){return~~(this.millisecond()/10)})),L(0,["SSS",3],0,"millisecond"),L(0,["SSSS",4],0,(function(){return 10*this.millisecond()})),L(0,["SSSSS",5],0,(function(){return 100*this.millisecond()})),L(0,["SSSSSS",6],0,(function(){return 1e3*this.millisecond()})),L(0,["SSSSSSS",7],0,(function(){return 1e4*this.millisecond()})),L(0,["SSSSSSSS",8],0,(function(){return 1e5*this.millisecond()})),L(0,["SSSSSSSSS",9],0,(function(){return 1e6*this.millisecond()})),he("S",X,Y),he("SS",X,W),he("SSS",X,V),pn="SSSS";pn.length<=9;pn+="S")he(pn,te);function fn(e,t){t[Te]=ge(1e3*("0."+e))}for(pn="S";pn.length<=9;pn+="S")fe(pn,fn);function vn(){return this._isUTC?"UTC":""}function _n(){return this._isUTC?"Coordinated Universal Time":""}gn=He("Milliseconds",!1),L("z",0,0,"zoneAbbr"),L("zz",0,0,"zoneName");var bn=w.prototype;function yn(e){return ii(1e3*e)}function wn(){return ii.apply(null,arguments).parseZone()}function $n(e){return e}bn.add=Ui,bn.calendar=Ki,bn.clone=Ji,bn.diff=aa,bn.endOf=Sa,bn.format=ha,bn.from=da,bn.fromNow=ca,bn.to=ua,bn.toNow=pa,bn.get=Re,bn.invalidAt=Da,bn.isAfter=Xi,bn.isBefore=Qi,bn.isBetween=ea,bn.isSame=ta,bn.isSameOrAfter=sa,bn.isSameOrBefore=ia,bn.isValid=Ca,bn.lang=ma,bn.locale=ga,bn.localeData=fa,bn.max=ni,bn.min=ai,bn.parsingFlags=Ha,bn.set=Pe,bn.startOf=ka,bn.subtract=Fi,bn.toArray=Oa,bn.toObject=Aa,bn.toDate=Ma,bn.toISOString=oa,bn.inspect=la,"undefined"!=typeof Symbol&&null!=Symbol.for&&(bn[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),bn.toJSON=Ea,bn.toString=ra,bn.unix=za,bn.valueOf=Ta,bn.creationData=Na,bn.eraName=Ba,bn.eraNarrow=Ua,bn.eraAbbr=Fa,bn.eraYear=Ya,bn.year=Ee,bn.isLeapYear=Ce,bn.weekYear=en,bn.isoWeekYear=tn,bn.quarter=bn.quarters=hn,bn.month=Xe,bn.daysInMonth=Qe,bn.week=bn.weeks=ss,bn.isoWeek=bn.isoWeeks=is,bn.weeksInYear=nn,bn.weeksInWeekYear=rn,bn.isoWeeksInYear=sn,bn.isoWeeksInISOWeekYear=an,bn.date=dn,bn.day=bn.days=yt,bn.weekday=wt,bn.isoWeekday=$t,bn.dayOfYear=cn,bn.hour=bn.hours=ds,bn.minute=bn.minutes=un,bn.second=bn.seconds=mn,bn.millisecond=bn.milliseconds=gn,bn.utcOffset=xi,bn.utc=Si,bn.local=Ti,bn.parseZone=zi,bn.hasAlignedHourOffset=Mi,bn.isDST=Oi,bn.isLocal=Ei,bn.isUtcOffset=Ci,bn.isUtc=Hi,bn.isUTC=Hi,bn.zoneAbbr=vn,bn.zoneName=_n,bn.dates=k("dates accessor is deprecated. Use date instead.",dn),bn.months=k("months accessor is deprecated. Use month instead",Xe),bn.years=k("years accessor is deprecated. Use year instead",Ee),bn.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",ki),bn.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Ai);var xn=Ot.prototype;function kn(e,t,s,i){var a=ks(),n=p().set(i,t);return a[s](n,e)}function Sn(e,t,s){if(h(e)&&(t=e,e=void 0),e=e||"",null!=t)return kn(e,t,s,"month");var i,a=[];for(i=0;i<12;i++)a[i]=kn(e,i,s,"month");return a}function Tn(e,t,s,i){"boolean"==typeof e?(h(t)&&(s=t,t=void 0),t=t||""):(s=t=e,e=!1,h(t)&&(s=t,t=void 0),t=t||"");var a,n=ks(),r=e?n._week.dow:0,o=[];if(null!=s)return kn(t,(s+r)%7,i,"day");for(a=0;a<7;a++)o[a]=kn(t,(a+r)%7,i,"day");return o}function zn(e,t){return Sn(e,t,"months")}function Mn(e,t){return Sn(e,t,"monthsShort")}function On(e,t,s){return Tn(e,t,s,"weekdays")}function An(e,t,s){return Tn(e,t,s,"weekdaysShort")}function En(e,t,s){return Tn(e,t,s,"weekdaysMin")}xn.calendar=Et,xn.longDateFormat=Ht,xn.invalidDate=Nt,xn.ordinal=Lt,xn.preparse=$n,xn.postformat=$n,xn.relativeTime=Bt,xn.pastFuture=Ft,xn.set=zt,xn.eras=Ra,xn.erasParse=La,xn.erasConvertYear=ja,xn.erasAbbrRegex=Va,xn.erasNameRegex=Wa,xn.erasNarrowRegex=Ga,xn.months=Ge,xn.monthsShort=Ze,xn.monthsParse=Ke,xn.monthsRegex=tt,xn.monthsShortRegex=et,xn.week=Xt,xn.firstDayOfYear=ts,xn.firstDayOfWeek=es,xn.weekdays=mt,xn.weekdaysMin=vt,xn.weekdaysShort=ft,xn.weekdaysParse=bt,xn.weekdaysRegex=xt,xn.weekdaysShortRegex=kt,xn.weekdaysMinRegex=St,xn.isPM=ls,xn.meridiem=cs,ws("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===ge(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),s.lang=k("moment.lang is deprecated. Use moment.locale instead.",ws),s.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ks);var Cn=Math.abs;function Hn(){var e=this._data;return this._milliseconds=Cn(this._milliseconds),this._days=Cn(this._days),this._months=Cn(this._months),e.milliseconds=Cn(e.milliseconds),e.seconds=Cn(e.seconds),e.minutes=Cn(e.minutes),e.hours=Cn(e.hours),e.months=Cn(e.months),e.years=Cn(e.years),this}function Dn(e,t,s,i){var a=Ri(t,s);return e._milliseconds+=i*a._milliseconds,e._days+=i*a._days,e._months+=i*a._months,e._bubble()}function Nn(e,t){return Dn(this,e,t,1)}function Rn(e,t){return Dn(this,e,t,-1)}function Pn(e){return e<0?Math.floor(e):Math.ceil(e)}function Ln(){var e,t,s,i,a,n=this._milliseconds,r=this._days,o=this._months,l=this._data;return n>=0&&r>=0&&o>=0||n<=0&&r<=0&&o<=0||(n+=864e5*Pn(In(o)+r),r=0,o=0),l.milliseconds=n%1e3,e=pe(n/1e3),l.seconds=e%60,t=pe(e/60),l.minutes=t%60,s=pe(t/60),l.hours=s%24,r+=pe(s/24),o+=a=pe(jn(r)),r-=Pn(In(a)),i=pe(o/12),o%=12,l.days=r,l.months=o,l.years=i,this}function jn(e){return 4800*e/146097}function In(e){return 146097*e/4800}function Bn(e){if(!this.isValid())return NaN;var t,s,i=this._milliseconds;if("month"===(e=O(e))||"quarter"===e||"year"===e)switch(t=this._days+i/864e5,s=this._months+jn(t),e){case"month":return s;case"quarter":return s/3;case"year":return s/12}else switch(t=this._days+Math.round(In(this._months)),e){case"week":return t/7+i/6048e5;case"day":return t+i/864e5;case"hour":return 24*t+i/36e5;case"minute":return 1440*t+i/6e4;case"second":return 86400*t+i/1e3;case"millisecond":return Math.floor(864e5*t)+i;default:throw new Error("Unknown unit "+e)}}function Un(e){return function(){return this.as(e)}}var Fn=Un("ms"),Yn=Un("s"),Wn=Un("m"),Vn=Un("h"),Gn=Un("d"),Zn=Un("w"),qn=Un("M"),Kn=Un("Q"),Jn=Un("y"),Xn=Fn;function Qn(){return Ri(this)}function er(e){return e=O(e),this.isValid()?this[e+"s"]():NaN}function tr(e){return function(){return this.isValid()?this._data[e]:NaN}}var sr=tr("milliseconds"),ir=tr("seconds"),ar=tr("minutes"),nr=tr("hours"),rr=tr("days"),or=tr("months"),lr=tr("years");function hr(){return pe(this.days()/7)}var dr=Math.round,cr={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function ur(e,t,s,i,a){return It.call(a,t||1,!!s,e,i)}function pr(e,t,s,i){var a=Ri(e).abs(),n=dr(a.as("s")),r=dr(a.as("m")),o=dr(a.as("h")),l=dr(a.as("d")),h=dr(a.as("M")),d=dr(a.as("w")),c=dr(a.as("y")),u=n<=s.ss&&["s",n]||n<s.s&&["ss",n]||r<=1&&["m"]||r<s.m&&["mm",r]||o<=1&&["h"]||o<s.h&&["hh",o]||l<=1&&["d"]||l<s.d&&["dd",l];return null!=s.w&&(u=u||d<=1&&["w"]||d<s.w&&["ww",d]),(u=u||h<=1&&["M"]||h<s.M&&["MM",h]||c<=1&&["y"]||["yy",c])[2]=t,u[3]=+e>0,u[4]=i,ur.apply(null,u)}function gr(e){return void 0===e?dr:"function"==typeof e&&(dr=e,!0)}function mr(e,t){return void 0!==cr[e]&&(void 0===t?cr[e]:(cr[e]=t,"s"===e&&(cr.ss=t-1),!0))}function fr(e,t){if(!this.isValid())return this.localeData().invalidDate();var s,i,a=!1,n=cr;return"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(a=e),"object"==typeof t&&(n=u(u({},cr),t||{}),null!=t.s&&null==t.ss&&(n.ss=t.s-1)),i=pr(this,!a,n,s=this.localeData()),a&&(i=Ut.call(s,+this,i)),s.postformat(i)}var vr=Math.abs;function _r(e){return(e>0)-(e<0)||+e}function br(){if(!this.isValid())return this.localeData().invalidDate();var e,t,s,i,a,n,r,o,l=vr(this._milliseconds)/1e3,h=vr(this._days),d=vr(this._months),c=this.asSeconds();return c?(e=pe(l/60),t=pe(e/60),l%=60,e%=60,s=pe(d/12),d%=12,i=l?l.toFixed(3).replace(/\.?0+$/,""):"",a=c<0?"-":"",n=_r(this._months)!==_r(c)?"-":"",r=_r(this._days)!==_r(c)?"-":"",o=_r(this._milliseconds)!==_r(c)?"-":"",a+"P"+(s?n+s+"Y":"")+(d?n+d+"M":"")+(h?r+h+"D":"")+(t||e||l?"T":"")+(t?o+t+"H":"")+(e?o+e+"M":"")+(l?o+i+"S":"")):"P0D"}var yr=gi.prototype;return yr.isValid=ui,yr.abs=Hn,yr.add=Nn,yr.subtract=Rn,yr.as=Bn,yr.asMilliseconds=Fn,yr.asSeconds=Yn,yr.asMinutes=Wn,yr.asHours=Vn,yr.asDays=Gn,yr.asWeeks=Zn,yr.asMonths=qn,yr.asQuarters=Kn,yr.asYears=Jn,yr.valueOf=Xn,yr._bubble=Ln,yr.clone=Qn,yr.get=er,yr.milliseconds=sr,yr.seconds=ir,yr.minutes=ar,yr.hours=nr,yr.days=rr,yr.weeks=hr,yr.months=or,yr.years=lr,yr.humanize=fr,yr.toISOString=br,yr.toString=br,yr.toJSON=br,yr.locale=ga,yr.localeData=fa,yr.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",br),yr.lang=ma,L("X",0,0,"unix"),L("x",0,0,"valueOf"),he("x",se),he("X",ne),fe("X",(function(e,t,s){s._d=new Date(1e3*parseFloat(e))})),fe("x",(function(e,t,s){s._d=new Date(ge(e))})),
//! moment.js
s.version="2.31.0",i(ii),s.fn=bn,s.min=oi,s.max=li,s.now=hi,s.utc=p,s.unix=yn,s.months=zn,s.isDate=d,s.locale=ws,s.invalid=v,s.duration=Ri,s.isMoment=$,s.weekdays=On,s.parseZone=wn,s.localeData=ks,s.isDuration=mi,s.monthsShort=Mn,s.weekdaysMin=En,s.defineLocale=$s,s.updateLocale=xs,s.locales=Ss,s.weekdaysShort=An,s.normalizeUnits=O,s.relativeTimeRounding=gr,s.relativeTimeThreshold=mr,s.calendarFormat=qi,s.prototype=bn,s.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},s}()),ja.exports),Ua=Ra(Ba);const Fa=["sand","sandy_loam","loam","clay_loam","clay","custom"],Ya=["lawn","vegetables","flowers","shrubs","hedge","fruit_trees","vines","ground_cover","custom"];let Wa=class extends(na(de)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this._pendingZoneChanges=new Map,this.zoneCache=new Map,this._expanded=new Set}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,s,i]=await Promise.all([Zi(this.hass),Ki(this.hass),Xi(this.hass),ta(this.hass)]);this.config=e,this.zones=t,this.modules=s,this.mappings=i,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",as+"/zones",{calculate_all:!0})).catch((e=>{console.error("Failed to calculate all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",as+"/zones",{update_all:!0})).catch((e=>{console.error("Failed to update all zones:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleResetAllBuckets(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",as+"/zones",{reset_all_buckets:!0})).catch((e=>{console.error("Failed to reset all buckets:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleClearAllWeatherdata(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",as+"/zones",{clear_all_weatherdata:!0})).catch((e=>{console.error("Failed to clear all weather data:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:Na.Automatic,duration:0,bucket:0,module:void 0,delta:0,et_deficiency:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then((()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}_engineOptions(e,t,s){var i,a,n,r,o;const l=null!==(i=t.calculation_method)&&void 0!==i?i:"from_weather",h=null!==(a=t.method_config)&&void 0!==a?a:{},d=s=>this.handleEditZone(e,Object.assign(Object.assign({},t),{calculation_method:l,method_config:Object.assign(Object.assign({},h),s)}));return"from_weather"===l?"advanced"!==(null===(n=this.config)||void 0===n?void 0:n.ui_mode)?"":W`
        ${this._numRow(Qt("panels.zones.labels.forecast-days",s),"",null!==(r=h.forecast_days)&&void 0!==r?r:0,(e=>d({forecast_days:parseInt(e,10)||0})))}
        <div class="setting-help">
          ${Qt("panels.zones.labels.forecast-days-help",s)}
          ${Qt("panels.zones.labels.engine-shared-help",s)}
        </div>
      `:"fixed"===l?W`
        ${this._numRow(Qt("panels.zones.labels.fixed-amount",s),Li(this.config,ri),null!==(o=h.delta)&&void 0!==o?o:0,(e=>d({delta:parseFloat(e)||0})))}
        <div class="setting-help">
          ${Qt("panels.zones.labels.engine-shared-help",s)}
        </div>
      `:""}_friendlyDuration(e){const t=Math.max(0,Math.round(e||0)),s=Math.floor(t/3600),i=Math.floor(t%3600/60),a=t%60;return s>0?`${s} h ${String(i).padStart(2,"0")} min`:i>0?a?`${i} min ${a} s`:`${i} min`:`${a} s`}_volumeText(e,t){return`${Ii(e,t).toFixed(1)} ${Pi(this.config,ni)}`}_liveEstimate(e){var t,s,i;const a=null!==(s=null===(t=this.hass)||void 0===t?void 0:t.states)&&void 0!==s?s:{};for(const t of Object.keys(a)){if(!t.endsWith("_live_bucket"))continue;const s=a[t],n=null!==(i=null==s?void 0:s.attributes)&&void 0!==i?i:{};if(String(n.zone_id)!==String(e.id))continue;if(!0!==n.live)return;const r=parseFloat(s.state);if(!Number.isFinite(r))return;return{bucket:r,duration:Number(n.duration)||0}}}_zoneStatus(e,t){var s,i,a;const n=(e,...s)=>Qt(`panels.zones.status.${e}`,t,...s),r=this._liveEstimate(e),o=r?r.bucket:null!==(s=e.bucket)&&void 0!==s?s:0,l=Math.max(0,-o),h=null!==(i=e.irrigation_threshold)&&void 0!==i?i:0,d=Pi(this.config,ri),c=l>=.05?`${l.toFixed(1)} ${d}`:null;let u="idle",p=c?n("idle","{short}",c):n("satisfied");return e.state===Na.Disabled?(u="off",p=n("disabled")):e.state===Na.Manual?(u="off",p=n("manual")):(null!==(a=e.duration)&&void 0!==a?a:0)>0?(u="watering",p=n("will-water","{duration}",this._friendlyDuration(e.duration)).replace(/\.$/,"")+` (${this._volumeText(e.duration,e.throughput)}).`):r&&r.duration>0?(u="watering",p=n("estimate","{short}",null!=c?c:"","{duration}",this._friendlyDuration(r.duration),"{volume}",this._volumeText(r.duration,e.throughput))):c&&h>0&&(p=n("under-threshold","{short}",c)),W`
      <div class="zone-status zone-status--${u}">
        <ha-icon
          icon=${"watering"===u?"mdi:water-outline":"off"===u?"mdi:pause-circle-outline":"mdi:check-circle-outline"}
        ></ha-icon>
        <span>${p}</span>
        ${"off"!==u&&h>0?W`<span class="zone-status-numbers">
              ${n("threshold")}: ${h.toFixed(1)} ${d}
            </span>`:""}
      </div>
    `}_cropFactorByMonth(e,t,s){const i=e.crop_factor_by_month&&12===e.crop_factor_by_month.length?e.crop_factor_by_month:new Array(12).fill(null),a=(s,a)=>{const n=[...i],r=parseFloat(a);n[s]=isNaN(r)||r<=0?null:r,this.handleEditZone(t,Object.assign(Object.assign({},e),{[vi]:n.every((e=>null===e))?null:n}))};return W`
      <div class="setting-row">
        <div class="setting-label">
          ${Qt("panels.zones.labels.crop-factor-by-month",s)}
        </div>
      </div>
      <div class="month-grid">
        ${i.map(((e,t)=>W`
            <label class="month-cell">
              <span class="unit"
                >${Qt(`panels.zones.labels.months.${t+1}`,s)}</span
              >
              <input
                class="field num-input"
                type="number"
                min="0"
                step="0.05"
                .value=${null===e?"":String(e)}
                @change=${e=>a(t,e.target.value)}
              />
            </label>
          `))}
      </div>
      <div class="setting-help">
        ${Qt("panels.zones.labels.crop-factor-by-month-help",s)}
      </div>
    `}_adv(e){var t;return"advanced"===(null===(t=this.config)||void 0===t?void 0:t.ui_mode)?e:""}handleEditZone(e,t){if(!this.hass)return;const s=this.zones[e],i=t.id,a=Object.assign(Object.assign({},void 0!==i?this._pendingZoneChanges.get(i):{}),function(e,t){const s={};for(const i of new Set([...Object.keys(null!=e?e:{}),...Object.keys(t)]))JSON.stringify(null==e?void 0:e[i])!==JSON.stringify(t[i])&&(s[i]=void 0===t[i]?null:t[i]);return s}(s,t));void 0!==i&&this._pendingZoneChanges.set(i,a),this.zones[e]=t,null!=t.id&&this.zoneCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{const e=[...this._pendingZoneChanges.entries()];this._pendingZoneChanges.clear();const t=e.filter((([,e])=>Object.keys(e).length>0)).map((([e,t])=>Object.assign(Object.assign({},t),{id:e})));if(0===t.length)return void(this.globalDebounceTimer=null);this.isSaving=!0,this._suppressNextConfigUpdate=!0;const s=t.some((e=>"soil_type"in e||"plant_type"in e||"calculation_method"in e||"method_config"in e));Promise.all(t.map((e=>this.saveToHA(e)))).then((()=>s?this._fetchData():void 0)).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}handleRemoveZone(e,t){if(!this.hass)return;const s=this.zones[t].id;if(!this.zones[t]||null==s)return;const i=[...this.zones];var a,n;this.zones=this.zones.filter(((e,s)=>s!==t)),this.zoneCache.delete(s.toString()),this.isSaving=!0,(a=this.hass,n=s.toString(),a.callApi("POST",as+"/zones",{id:n,remove:!0})).catch((e=>{console.error("Failed to delete zone:",e),this.zones=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleCalculateZone(e){const t=this.zones[e];var s,i;t&&null!=t.id&&(this.hass&&(s=this.hass,i=t.id.toString(),s.callApi("POST",as+"/zones",{id:i,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=this.zones[e];var s,i;t&&null!=t.id&&(this.hass&&(s=this.hass,i=t.id.toString(),s.callApi("POST",as+"/zones",{id:i,update:!0})))}handleViewWeatherInfo(e){var t;const s=this.zones[e];if(!s||null==s.mapping)return;const i=`#weather-section-${s.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(i);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}handleViewWateringCalendar(e){var t;const s=this.zones[e];if(!s||null==s.id)return;const i=`#calendar-section-${s.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(i);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const t=await ia(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,t)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const s of this.zones)if(void 0!==s.id)try{const i=await(e=this.hass,t=s.id.toString(),e.callWS({type:as+"/watering_calendar",zone_id:t}));this.wateringCalendars.set(s.id,i)}catch(e){console.error(`Failed to fetch watering calendar for zone ${s.id}:`,e)}var e,t;this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return W``;const t=this.weatherRecords.get(e.id)||[];return W`
      <div class="weather-records">
        <h4>
          ${Qt("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?W`
              <div class="weather-note">
                ${Qt("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:W`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${Qt("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>W`
                    <div class="weather-row">
                      <span
                        >${Ua(e.timestamp).format("MM-DD HH:mm")}</span
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
                        >${e.retrieval_time?Ua(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `))}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){var t;if(!this.hass||"number"!=typeof e.id)return W``;const s=this.wateringCalendars.get(e.id),i=s&&e.id in s?s[e.id]:null,a=(null==i?void 0:i.monthly_estimates)||[],n=this.hass.language,r=e=>Qt(`panels.zones.calendar.${e}`,n);return W` <div class="watering-calendar">
      <h4>${r("title")}</h4>
      <div class="calendar-note">${r("caveat")}</div>
      ${0===a.length?W`
            <div class="calendar-note">
              ${(null==i?void 0:i.error)?`${r("error")}: ${i.error}`:r("none")}
            </div>
          `:W` <div class="calendar-table">
              <div class="calendar-header">
                <span>${r("month")}</span>
                <span
                  >${r("et")} (${Li(this.config,ri)})</span
                >
                <span
                  >${r("precipitation")}
                  (${Li(this.config,ri)})</span
                >
                <span
                  >${r("watering")}
                  (${Li(this.config,ni)})</span
                >
                <span
                  >${r("avg-temp")}
                  (${(null===(t=this.config)||void 0===t?void 0:t.units)===gs?"°C":"°F"})</span
                >
              </div>
              ${a.map((e=>W`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${null!==e.estimated_et_mm&&void 0!==e.estimated_et_mm?Ui(e.estimated_et_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.average_precipitation_mm&&void 0!==e.average_precipitation_mm?Ui(e.average_precipitation_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.estimated_watering_volume_liters&&void 0!==e.estimated_watering_volume_liters?Bi(e.estimated_watering_volume_liters,this.config).toFixed(0):"-"}</span
                    >
                    <span
                      >${null!==e.average_temperature_c&&void 0!==e.average_temperature_c?function(e,t){const s=Number(e)||0;return(null==t?void 0:t.units)===gs?s:1.8*s+32}(e.average_temperature_c,this.config).toFixed(1):"-"}</span
                    >
                  </div>
                `))}
            </div>
            ${(null==i?void 0:i.calculation_method)?W`
                  <div class="calendar-info">
                    ${Qt("panels.zones.labels.calculation-method",n)}:
                    ${Qt(`panels.zones.labels.calculation-methods.${i.calculation_method}`,n)}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");await Ji(this.hass,e)}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,t,s,i;(null===(t=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===t?void 0:t.trim())||(null===(s=this.sizeInput)||void 0===s?void 0:s.value)||(null===(i=this.throughputInput)||void 0===i?void 0:i.value)||(this.isCreatingZone=!1)}renderTheOptions(e,t,s){if(this.hass){let i=W`<option value="" ?selected=${void 0===t}">---${Qt("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,a])=>i=W`${i}
            <option
              value="${a.id}"
              ?selected="${t===a.id}"
            >
              ${s?s(a):`${a.id}: ${a.name}`}
            </option>`)),i}return W``}renderZone(e,t){var s,i,a,n,r,o,l,h,d,c,u,p,g,m;if(!this.hass)return W``;const f=this.hass.language,v=e.state===Na.Automatic,_=e.state===Na.Disabled||e.state===Na.Automatic,b=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const t=this.mappings.filter((t=>t.id===e.mapping))[0];null!=t&&null!=t.data&&(e.number_of_data_points=t.data.length)}const y=Qt("panels.zones.labels.states."+e.state,f),w=W`${ji(e.duration)}
    (${Ii(e.duration,e.throughput).toFixed(1)}
    ${Li(this.config,ni)})`,$=null!=e.id&&this._expanded.has(e.id);return W`
      <ha-card class="zone-card">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${$?"true":"false"}
          @click=${()=>this._toggleZone(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleZone(e.id))}}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${e.name||"—"}</span>
              <ha-label class="state-label state-label--${e.state}" dense
                >${y}</ha-label
              >
            </div>
            ${e.state===Na.Manual?W`<div class="zone-sub">${w}</div>`:""}
          </div>
          <ha-svg-icon
            class="zone-chevron ${$?"open":""}"
            .path=${oa}
          ></ha-svg-icon>
        </div>
        ${this._zoneStatus(e,f)}
        ${$?W` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${Qt("panels.zones.labels.last_calculated",f)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?Ua(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${Qt("panels.zones.labels.data-last-updated",f)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?Ua(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${Qt("panels.zones.labels.data-number-of-data-points",f)}</span
                  >
                  <span class="meta-value"
                    >${null!==(s=e.number_of_data_points)&&void 0!==s?s:"—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(Qt("panels.zones.labels.name",f),"",e.name,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ei]:s}))))}
                ${this._adv(this._selectRow(Qt("panels.zones.labels.calculation-method",f),W`
                      ${["from_weather","provided","fixed"].map((t=>{var s;return W`
                          <option
                            value="${t}"
                            ?selected=${(null!==(s=e.calculation_method)&&void 0!==s?s:"from_weather")===t}
                          >
                            ${Qt(`panels.zones.labels.calculation-methods.${t}`,f)}
                          </option>
                        `}))}
                    `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{calculation_method:s.target.value})))))}
                ${this._adv(W`<div class="setting-help">
                    ${Qt(`panels.zones.labels.calculation-method-help.${null!==(i=e.calculation_method)&&void 0!==i?i:"from_weather"}`,f)}
                  </div>`)}
                ${this._engineOptions(t,e,f)}
                ${this._selectRow(this._labelWithHint("input-method",f),W`
                    <option
                      value="${zi}"
                      ?selected=${(null!==(a=e.input_method)&&void 0!==a?a:zi)===zi}
                    >
                      ${Qt("panels.zones.labels.input-methods.throughput",f)}
                    </option>
                    <option
                      value="${Mi}"
                      ?selected=${e.input_method===Mi}
                    >
                      ${Qt("panels.zones.labels.input-methods.direct",f)}
                    </option>
                  `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ti]:s.target.value}))))}
                ${e.input_method===Mi?this._numRow(Qt("panels.zones.labels.precipitation-rate",f),Li(this.config,Oi),e.precipitation_rate,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Oi]:parseFloat(s)}))),.1):W`
                      ${this._numRow(Qt("panels.zones.labels.size",f),Li(this.config,ti),e.size,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ti]:parseFloat(s)}))),.1)}
                      ${this._numRow(Qt("panels.zones.labels.throughput",f),Li(this.config,si),e.throughput,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[si]:parseFloat(s)}))),.1)}
                    `}
                ${this._selectRow(Qt("panels.zones.labels.soil-type",f),W`
                    ${Fa.map((t=>{var s;return W`
                        <option
                          value="${t}"
                          ?selected=${(null!==(s=e.soil_type)&&void 0!==s?s:"custom")===t}
                        >
                          ${Qt(`panels.zones.labels.soil-types.${t}`,f)}
                        </option>
                      `}))}
                  `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{soil_type:s.target.value}))))}
                ${"custom"===(null!==(n=e.soil_type)&&void 0!==n?n:"custom")?this._numRow(this._labelWithHint("drainage_rate",f),Li(this.config,pi),e.drainage_rate,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[pi]:parseFloat(s)}))),.1):""}
                ${this._selectRow(Qt("panels.zones.labels.plant-type",f),W`
                    ${Ya.map((t=>{var s;return W`
                        <option
                          value="${t}"
                          ?selected=${(null!==(s=e.plant_type)&&void 0!==s?s:"custom")===t}
                        >
                          ${Qt(`panels.zones.labels.plant-types.${t}`,f)}
                        </option>
                      `}))}
                  `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{plant_type:s.target.value}))))}
                ${"custom"===(null!==(r=e.plant_type)&&void 0!==r?r:"custom")?this._numRow(Qt("panels.zones.labels.multiplier",f),"",e.multiplier,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[oi]:parseFloat(s)}))),.1):""}
                ${this._selectRow(this._labelWithHint("state",f),W`
                    <option
                      value="${Na.Automatic}"
                      ?selected=${e.state===Na.Automatic}
                    >
                      ${Qt("panels.zones.labels.states.automatic",f)}
                    </option>
                    <option
                      value="${Na.Disabled}"
                      ?selected=${e.state===Na.Disabled}
                    >
                      ${Qt("panels.zones.labels.states.disabled",f)}
                    </option>
                    <option
                      value="${Na.Manual}"
                      ?selected=${e.state===Na.Manual}
                    >
                      ${Qt("panels.zones.labels.states.manual",f)}
                    </option>
                  `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ii]:s.target.value,[ai]:0}))))}
                ${this._selectRow(this._labelWithHint("mapping",f),this.renderTheOptions(this.mappings,e.mapping),(s=>{const i=s.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[li]:""===i?void 0:parseInt(i)}))}))}
                ${this._numRow(this._labelWithHint("bucket",f),Li(this.config,ri),Number(e.bucket).toFixed(1),(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ri]:parseFloat(s)}))),.1)}
                ${this._adv(this._numRow(this._labelWithHint("maximum-bucket",f),Li(this.config,ri),Number(e.maximum_bucket).toFixed(1),(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ci]:parseFloat(s)}))),.1))}
                ${this._adv(this._numRow(this._labelWithHint("irrigation-threshold",f),Li(this.config,ri),Number(null!==(o=e.irrigation_threshold)&&void 0!==o?o:0).toFixed(1),(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ui]:parseFloat(s)}))),.1))}
                ${this._adv(W`${this._numRow(Qt("panels.zones.labels.days-between-irrigation",f),Qt("panels.zones.labels.days",f),e.days_between_irrigation,(s=>{const i=parseInt(s,10);this.handleEditZone(t,Object.assign(Object.assign({},e),{[mi]:isNaN(i)?null:Math.max(0,i)}))}),1)}
                    <div class="setting-help">
                      ${Qt("panels.zones.labels.days-between-irrigation-help",f)}
                    </div>`)}
                ${this._adv(this._cropFactorByMonth(e,t,f))}
                ${this._adv(W`${this._numRow(Qt("panels.zones.labels.available-water",f),Li(this.config,ri),null!=e.available_water?Number(e.available_water).toFixed(1):"",(s=>{const i=parseFloat(s);this.handleEditZone(t,Object.assign(Object.assign({},e),{[fi]:isNaN(i)||i<=0?null:i}))}),1)}
                    ${this._numRow(Qt("panels.zones.labels.allowed-depletion",f),"%",null!=e.allowed_depletion?Number(e.allowed_depletion).toFixed(0):"",(s=>{const i=parseFloat(s);this.handleEditZone(t,Object.assign(Object.assign({},e),{[_i]:isNaN(i)?null:Math.min(95,Math.max(5,i))}))}),5)}
                    <div class="setting-help">
                      ${Qt("panels.zones.labels.available-water-help",f)}
                    </div>`)}
                ${this._adv(W`${this._numRow(Qt("panels.zones.labels.distribution-efficiency",f),"%",null!=e.distribution_efficiency?Number(e.distribution_efficiency).toFixed(0):"",(s=>{const i=parseFloat(s);this.handleEditZone(t,Object.assign(Object.assign({},e),{[bi]:isNaN(i)?null:Math.min(100,Math.max(5,i))}))}),5)}
                    <div class="setting-help">
                      ${Qt("panels.zones.labels.distribution-efficiency-help",f)}
                    </div>`)}
                ${this._numRow(Qt("panels.zones.labels.et-deficiency",f),Li(this.config,ri),null!=e.et_deficiency?Number(e.et_deficiency).toFixed(2):"",(()=>{}),.01,!0)}
                <div class="setting-help">
                  ${Qt("panels.zones.labels.et-deficiency-help",f)}
                </div>
                ${(null===(l=this.config)||void 0===l?void 0:l.observed_watering_enabled)||(null===(h=this.config)||void 0===h?void 0:h.direct_valve_control_enabled)?this._entityRow(Qt("panels.zones.labels.linked-entity",f),Qt("panels.zones.labels.optional",f),e.linked_entity,["switch","valve","input_boolean","binary_sensor"],(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[gi]:s||void 0}))),Qt("panels.zones.labels.linked-entity-hint",f)):""}
                ${(null===(d=this.config)||void 0===d?void 0:d.full_controller)&&((null===(c=this.config)||void 0===c?void 0:c.supplies)||[]).length?this._selectRow(Qt("panels.zones.labels.supply",f),W`
                        <option value="" ?selected=${!e.supply_id}>
                          ${Qt("panels.zones.labels.supply-none",f)}
                        </option>
                        ${((null===(u=this.config)||void 0===u?void 0:u.supplies)||[]).map((t=>W`
                            <option
                              value=${t.id||""}
                              ?selected=${e.supply_id===t.id}
                            >
                              ${t.name}
                            </option>
                          `))}
                      `,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[wi]:s.target.value||null})))):""}
                ${(null===(p=this.config)||void 0===p?void 0:p.direct_valve_control_enabled)&&e.linked_entity?this._adv(W`
                      ${this._textRow(Qt("panels.zones.labels.safety-off-topic",f),Qt("panels.zones.labels.optional",f),e.safety_off_topic,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[yi]:s||void 0}))))}
                      ${e.safety_off_topic?this._textRow(Qt("panels.zones.labels.safety-off-state-key",f),"",e.safety_off_state_key,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[$i]:s||void 0})))):""}
                      <div class="setting-help">
                        ${Qt("panels.zones.labels.safety-off-topic-help",f)}
                      </div>
                    `):""}
                ${this._adv((null===(g=this.config)||void 0===g?void 0:g.observed_watering_enabled)&&e.linked_entity?this._entityRow(Qt("panels.zones.labels.flow-sensor",f),Qt("panels.zones.labels.optional",f),e.flow_sensor,["sensor"],(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[xi]:s||void 0}))),Qt("panels.zones.labels.flow-sensor-hint",f)):"")}
                ${this._adv(this._entityRow(Qt("panels.zones.labels.soil-moisture-sensor",f),Qt("panels.zones.labels.optional",f),e.soil_moisture_sensor,["sensor"],(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ki]:s||void 0}))),Qt("panels.zones.labels.soil-moisture-sensor-hint",f)))}
                ${e.soil_moisture_sensor?this._numRow(Qt("panels.zones.labels.soil-moisture-threshold",f),"%",null!==(m=e.soil_moisture_threshold)&&void 0!==m?m:50,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Si]:parseFloat(s)}))),1):""}
                ${this._adv(this._numRow(Qt("panels.zones.labels.lead-time",f),"s",e.lead_time,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[hi]:parseInt(s,10)}))),1))}
                ${this._adv(this._numRow(Qt("panels.zones.labels.maximum-duration",f),"s",e.maximum_duration,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[di]:parseInt(s,10)}))),1))}
                ${this._numRow(Qt("panels.zones.labels.duration",f),"s",e.duration,(s=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ai]:parseInt(s,10)}))),1,_)}
                ${_?W`<div class="setting-help">
                      ${Qt(e.state===Na.Disabled?"panels.zones.labels.duration-readonly-disabled":"panels.zones.labels.duration-readonly-automatic",f)}
                    </div>`:""}
              </div>

              <div class="zone-actions">
                ${v?W`
                      ${this._actionBtn(ra,Qt("panels.zones.actions.calculate",f),(()=>this.handleCalculateZone(t)))}
                      ${this._actionBtn(va,Qt("panels.zones.actions.update",f),(()=>this.handleUpdateZone(t)))}
                    `:""}
                ${this._actionBtn(pa,Qt("panels.zones.actions.reset-bucket",f),(()=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ri]:0}))))}
                ${null!=e.mapping?this._actionBtn(ha,Qt("panels.zones.actions.view-weather-info",f),(()=>this.handleViewWeatherInfo(t))):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",Qt("panels.zones.actions.view-watering-calendar",f),(()=>this.handleViewWateringCalendar(t)))}
                ${b?this._actionBtn("M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",Qt("panels.zones.actions.information",f),(()=>this.toggleExplanation(t))):""}
                ${this._actionBtn(da,Qt("common.actions.delete",f),(e=>this.handleRemoveZone(e,t)),!0)}
              </div>

              ${b?W`<label class="hidden" id="calcresults${t}"
                    >${Di("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
    `}_textRow(e,t,s,i){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==s?"":String(s)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,s,i,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const s=parseFloat(e.value),n=+((isNaN(s)?0:s)+t*a).toFixed(r);e.value=String(n),i(String(n))};return W`
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
            .value=${null==s?"":String(s)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${ua}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ma}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_labelWithHint(e,t){return W`${Qt(`panels.zones.labels.${e}`,t)}
      <div class="setting-hint">
        ${Qt(`panels.zones.labels.${e}-hint`,t)}
      </div>`}_selectRow(e,t,s){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${s}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${ca}></path>
          </svg>
        </div>
      </div>
    `}_entityRow(e,t,s,i,a,n){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
          ${n?W`<div class="setting-hint">${n}</div>`:""}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${s||""}
          .includeDomains=${i}
          allow-custom-entity
          @value-changed=${e=>{var t;return a((null===(t=e.detail)||void 0===t?void 0:t.value)||"")}}
        ></ha-entity-picker>
      </div>
    `}_actionBtn(e,t,s,i=!1,a=!1){return W`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${a}
        @click=${s}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}toggleExplanation(e){var t;const s=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);s&&("hidden"!=s.className?s.className="hidden":s.className="explanation")}render(){return this.hass?this.isLoading?W`
        <ha-card header="${Qt("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${Qt("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:W`
      <ha-card header="${Qt("panels.zones.title",this.hass.language)}">
        <div class="card-content">
          ${Qt("panels.zones.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Qt("panels.zones.cards.add-zone.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("panels.zones.labels.name",this.hass.language)}
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
              ${Qt("panels.zones.labels.size",this.hass.language)}
              <span class="unit">(${Li(this.config,ti)})</span>
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
              ${Qt("panels.zones.labels.throughput",this.hass.language)}
              <span class="unit"
                >(${Li(this.config,si)})</span
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
              <ha-svg-icon slot="start" .path=${ma}></ha-svg-icon>
              ${this.isSaving?Qt("common.saving-messages.adding",this.hass.language):Qt("panels.zones.cards.add-zone.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${Ha(this.zones,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderZone(e,t)))}

      <ha-card
        header="${Qt("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(ra,Qt("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),(()=>this.handleCalculateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(va,Qt("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),(()=>this.handleUpdateAllZones()),!1,this.isSaving)}
            ${this._actionBtn(pa,Qt("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),(()=>this.handleResetAllBuckets()),!1,this.isSaving)}
            ${this._actionBtn(ha,Qt("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),(()=>this.handleClearAllWeatherdata()),!1,this.isSaving)}
          </div>
        </div>
      </ha-card>
    `:W``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return l`
      ${ba}

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

      .month-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        padding: 4px 0 8px;
      }
      @media (max-width: 600px) {
        .month-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .month-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 12px;
      }
      .month-cell input {
        width: 100%;
        box-sizing: border-box;
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
    `}};s([me()],Wa.prototype,"config",void 0),s([me({type:Array})],Wa.prototype,"zones",void 0),s([me({type:Array})],Wa.prototype,"modules",void 0),s([me({type:Array})],Wa.prototype,"mappings",void 0),s([me({type:Map})],Wa.prototype,"wateringCalendars",void 0),s([me({type:Map})],Wa.prototype,"weatherRecords",void 0),s([me({type:Boolean})],Wa.prototype,"isLoading",void 0),s([me({type:Boolean})],Wa.prototype,"isSaving",void 0),s([me({type:Boolean})],Wa.prototype,"isCreatingZone",void 0),s([ve("#nameInput")],Wa.prototype,"nameInput",void 0),s([ve("#sizeInput")],Wa.prototype,"sizeInput",void 0),s([ve("#throughputInput")],Wa.prototype,"throughputInput",void 0),Wa=s([ue("smart-irrigation-view-zones")],Wa);let Va=class extends(na(de)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.moduleCache=new Map,this._expanded=new Set,this.debouncedSave=(()=>{let e=null;return t=>{e&&clearTimeout(e),e=window.setTimeout((()=>{this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch((()=>{this._suppressNextConfigUpdate=!1})),e=null}),500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{const[e,t,s,i]=await Promise.all([Zi(this.hass),Ki(this.hass),Xi(this.hass),Qi(this.hass)]);this.config=e,this.zones=t,this.modules=s,this.allmodules=i,this.moduleCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}}async handleAddModule(){var e,t;if((null===(t=null===(e=this.moduleInput)||void 0===e?void 0:e.selectedOptions)||void 0===t?void 0:t[0])&&!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.moduleInput.selectedOptions[0].text,t=this.allmodules.find((t=>t.name===e));if(!t)return;const s={name:e,description:t.description,config:t.config,schema:t.schema};this.modules=[...this.modules,s],this.moduleCache.clear(),this._scheduleUpdate(),await this.saveToHA(s),await this._fetchData()}catch(e){console.error("Error adding module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}async handleRemoveModule(e,t){if(!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.modules[t],a=null==e?void 0:e.id;this.modules;this.modules=this.modules.filter(((e,s)=>s!==t)),this.moduleCache.clear(),this._scheduleUpdate(),this.hass&&void 0!==a&&await(s=this.hass,i=a.toString(),s.callApi("POST",as+"/modules",{id:i,remove:!0}))}catch(e){console.error("Error removing module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var s,i}}async saveToHA(e){if(this.hass)try{await ea(this.hass,e)}catch(e){throw console.error("Error saving module:",e),e}}renderModule(e,t){var s,i;if(!this.hass)return W``;const a=this.zones.filter((t=>t.module===e.id)).length,n=null!==(s=e.id)&&void 0!==s?s:t,r=this._expanded.has(n),o=e.description||(null===(i=this.allmodules.find((t=>t.name===e.name)))||void 0===i?void 0:i.description)||"",l=`module-${e.id||t}-${r?"open":"closed"}-${JSON.stringify(e)}`;if(this.moduleCache.has(l))return this.moduleCache.get(l);const h=W`
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
            .path=${oa}
          ></ha-svg-icon>
        </div>
        ${r?W` <div class="si-body">
              <div class="moduleconfig">
                <label class="subheader"
                  >${Qt("panels.modules.cards.module.labels.configuration",this.hass.language)}
                  (*
                  ${Qt("panels.modules.cards.module.labels.required",this.hass.language)})</label
                >
                <div class="settings">
                  ${e.schema?Object.entries(e.schema).filter((([,t])=>{var s;return!(null!==(s=e.idle_options)&&void 0!==s?s:[]).includes(null==t?void 0:t.name)})).map((([e])=>this.renderConfig(t,e))):null}
                </div>
              </div>
              ${a?W`<div class="weather-note">
                    ${Qt("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}
                  </div>`:W`<div class="si-actions">
                    ${this._actionBtn(da,Qt("common.actions.delete",this.hass.language),(e=>this.handleRemoveModule(e,t)),!0)}
                  </div>`}
            </div>`:""}
      </ha-card>
    `;return this.moduleCache.set(l,h),h}renderConfig(e,t){const s=Object.values(this.modules).at(e);if(!s||!this.hass)return;const i=s.schema[t],a=i.name,n=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(a);let r="";null==s.config&&(s.config=[]),a in s.config&&(r=s.config[a]);const o=i.required?`${n} *`:null!=n?n:"";if("boolean"==i.type)return W`
        <div class="setting-row">
          <div class="setting-label">${o}</div>
          <input
            type="checkbox"
            id="${a+e}"
            .checked=${r}
            @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},s),{config:Object.assign(Object.assign({},s.config),{[a]:t.target.checked})}))}"
          />
        </div>
      `;if("float"==i.type||"integer"==i.type)return this._numRow(o,"",s.config[a],(t=>this.handleEditConfig(e,Object.assign(Object.assign({},s),{config:Object.assign(Object.assign({},s.config),{[a]:t})}))),1);if("string"==i.type)return this._textRow(o,"",r,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},s),{config:Object.assign(Object.assign({},s.config),{[a]:t})}))));if("select"==i.type){const t=this.hass.language,n=W`
        ${Object.entries(i.options).map((([e,s])=>W`<option
              value="${Ni(s,0)}"
              ?selected="${r===Ni(s,0)}"
            >
              ${Qt("panels.modules.cards.module.translated-options."+Ni(s,1),t)}
            </option>`))}
      `;return this._selectRow(o,n,(t=>this.handleEditConfig(e,Object.assign(Object.assign({},s),{config:Object.assign(Object.assign({},s.config),{[a]:t.target.value})}))))}return W``}_textRow(e,t,s,i){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==s?"":String(s)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,s,i,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const s=parseFloat(e.value),n=+((isNaN(s)?0:s)+t*a).toFixed(r);e.value=String(n),i(String(n))};return W`
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
            .value=${null==s?"":String(s)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${ua}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ma}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,s){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${s}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${ca}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,s,i=!1,a=!1){return W`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${a}
        @click=${s}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}handleEditConfig(e,t){this.modules=Object.values(this.modules).map(((s,i)=>i===e?t:s)),this.moduleCache.clear(),this._scheduleUpdate(),this.debouncedSave(t)}renderOption(e,t){return this.hass?W`<option value="${e}>${t}</option>`:W``}render(){return this.hass?W`
      <ha-card header="${Qt("panels.modules.title",this.hass.language)}">
        <div class="card-content">
          ${Qt("panels.modules.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Qt("panels.modules.cards.add-module.header",this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading?W`<div class="loading-indicator">
                ${Qt("common.loading-messages.general",this.hass.language)}
              </div>`:W`
                <div class="setting-row">
                  <div class="setting-label">
                    ${Qt("common.labels.module",this.hass.language)}
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
                      <path d=${ca}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${ma}></ha-svg-icon>
                    ${this.isSaving?Qt("common.saving-messages.adding",this.hass.language):Qt("panels.modules.cards.add-module.actions.add",this.hass.language)}
                  </ha-button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading?W`<div class="loading-indicator">
            ${Qt("common.loading-messages.modules",this.hass.language)}
          </div>`:Ha(this.modules,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderModule(e,t)))}
    `:W``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.moduleCache.clear()}static get styles(){return l`
      ${ba} ${xa} /* View-specific styles only - most common styles are now in globalStyle */
    `}};s([me()],Va.prototype,"config",void 0),s([me({type:Array})],Va.prototype,"zones",void 0),s([me({type:Array})],Va.prototype,"modules",void 0),s([me({type:Array})],Va.prototype,"allmodules",void 0),s([me({type:Boolean})],Va.prototype,"isLoading",void 0),s([me({type:Boolean})],Va.prototype,"isSaving",void 0),s([ve("#moduleInput")],Va.prototype,"moduleInput",void 0),Va=s([ue("smart-irrigation-view-modules")],Va);let Ga=class extends(na(de)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this._pendingMappings=new Map,this.globalDebounceTimer=null,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set,this.modules=[]}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}),this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()})))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,s,i]=await Promise.all([Zi(this.hass),Ki(this.hass),ta(this.hass),Xi(this.hass)]);this.config=e,this.zones=t,this.mappings=s,this.modules=i,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(t){console.error("Error fetching data:",t),Yi({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const t=await ia(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for mapping ${e.id}:`,t),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return W``;const t=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return W`
      <div class="weather-records">
        <h4>
          ${Qt("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?W`
              <div class="weather-note">
                ${Qt("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:W`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${Qt("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${Qt("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map((e=>{let t="-",s="-";try{if(e.timestamp&&null!==e.timestamp){const s=Ua(e.timestamp);s.isValid()&&(t=s.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting timestamp:",e.timestamp,t)}try{if(e.retrieval_time&&null!==e.retrieval_time){const t=Ua(e.retrieval_time);t.isValid()&&(s=t.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting retrieval_time:",e.retrieval_time,t)}return W`
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
                      <span>${s}</span>
                    </div>
                  `}))}
              </div>
            `}
      </div>
    `}handleAddMapping(){var e;if(!this.mappingNameInput.value.trim())return;const t=!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service),s=e=>e===fs||e===ks||e===ys?t?Ps:As:t?Os:As,i=Object.fromEntries([ms,fs,vs,ys,$s,xs,ks,Ss,Ts].map((e=>[e,{[Ls]:s(e),[js]:"",[Bs]:""}]))),a={name:this.mappingNameInput.value.trim(),mappings:i};this.mappings=[...this.mappings,a],this.isSaving=!0,this.saveToHA(a).then((()=>(this.mappingNameInput.value="",this._fetchData()))).catch((e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleRemoveMapping(e,t){const s=this.mappings[t].id;if(null==s)return;const i=[...this.mappings];var a,n;(this.mappings=this.mappings.filter(((e,s)=>s!==t)),this.mappingCache.delete(s.toString()),this.hass)&&(this.isSaving=!0,(a=this.hass,n=s.toString(),a.callApi("POST",as+"/mappings",{id:n,remove:!0})).catch((e=>{console.error("Failed to delete mapping:",e),this.mappings=i,this._fetchData().catch((e=>{console.error("Failed to refresh data after delete error:",e)}))})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleEditMapping(e,t){this.mappings[e]=t,t.id&&this.mappingCache.delete(t.id.toString()),void 0!==t.id&&this._pendingMappings.set(t.id,t),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout((()=>{const e=[...this._pendingMappings.values()];this._pendingMappings.clear(),this.isSaving=!0,this._suppressNextConfigUpdate=!0,Promise.all(e.map((e=>this.saveToHA(e)))).catch((e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)})).finally((()=>{this.isSaving=!1,this._scheduleUpdate()})),this.globalDebounceTimer=null}),500),this._scheduleUpdate()}async saveToHA(e){var t;if(!this.hass)throw new Error("Home Assistant connection not available");const s=[],i=this.hass.states;for(const t in e.mappings){const a=e.mappings[t].sensorentity;if(a&&""!==a.trim()){const n=a.trim();e.mappings[t].sensorentity=n,n in i||s.push(n)}}if(s.length>0){const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");throw e&&Yi({body:{message:Qt("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+s.join(", ")},error:Qt("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}const{id:a,name:n,mappings:r,greenhouse:o}=e;await sa(this.hass,{id:a,name:n,mappings:r,greenhouse:o})}consumedSources(e){var t;if(void 0===e.module||null===e.module)return null;const s=this.modules.find((t=>t.id===e.module));return null!==(t=null==s?void 0:s.consumes)&&void 0!==t?t:null}renderMapping(e,t){if(!this.hass)return W``;const s=`${e.id}_${JSON.stringify(e).slice(0,100)}`;if(this.mappingCache.has(s))return this.mappingCache.get(s);const i=this.zones.filter((t=>t.mapping===e.id)).length,a=W`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${Qt("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @change="${s=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:s.target.value}))}"
            />
            <div class="setting-row">
              <div class="setting-label">
                ${Qt("panels.mappings.cards.mapping.greenhouse",this.hass.language)}
              </div>
              <ha-switch
                .checked=${!!e.greenhouse}
                @change=${s=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:s.target.checked}))}
              ></ha-switch>
            </div>
            <div class="setting-row">
              <div class="setting-label">
                ${Qt("panels.mappings.cards.mapping.module",this.hass.language)}
              </div>
              <select
                @change=${s=>{const i=s.target.value;this.handleEditMapping(t,Object.assign(Object.assign({},e),{[ws]:""===i?void 0:parseInt(i)}))}}
              >
                <option
                  value=""
                  ?selected=${void 0===e.module||null===e.module}
                >
                  ---${Qt("common.labels.select",this.hass.language)}---
                </option>
                ${this.modules.map((t=>W`<option
                      value="${t.id}"
                      ?selected=${t.id===e.module}
                    >
                      ${Gi(t.name,this.hass.language)}
                    </option>`))}
              </select>
            </div>
            <div class="weather-note">
              ${Qt(void 0===e.module||null===e.module?"panels.mappings.cards.mapping.module_undecided":"panels.mappings.cards.mapping.module_description",this.hass.language)}
            </div>
            ${e.greenhouse?W`<div class="weather-note">
                  ${Qt("panels.mappings.cards.mapping.greenhouse_description",this.hass.language)}
                </div>`:""}
            ${Object.entries(e.mappings).filter((([t])=>!e.greenhouse||t!==ys&&t!==$s)).filter((([t])=>{const s=this.consumedSources(e);return null===s||s.includes(t)})).map((([e])=>this.renderMappingSetting(t,e)))}
            ${i?W`<div class="weather-note">
                  ${Qt("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}
                </div>`:W` <div
                  class="action-button"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${da}" />
                  </svg>
                  <span class="action-button-label">
                    ${Qt("common.actions.delete",this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;return this.mappingCache.set(s,a),a}renderMappingSetting(e,t){const s=this.mappings[e];if(!s||!this.hass)return W``;const i=s.mappings[t];return W`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${Qt(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`,this.hass.language)}
        </div>
        ${this.renderSourceHint(t)}
        ${this._selectRow(Qt("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,t,i),(s=>this.handleSimpleSourceChange(e,t,s)))}
        ${this.renderMappingInputs(e,t,i)}
      </div>
    `}renderSourceHint(e){if(!this.hass)return W``;const t=Qt(`panels.mappings.cards.mapping.hints.${e.toLowerCase()}`,this.hass.language);return t?W`<div class="setting-hint">${t}</div>`:W``}renderSimpleRadioOptions(e,t,s){if(!this.hass||!this.config)return W``;const i=t===fs||t===ks,a=s[Ls],n=t===ys,r=!!this.config.use_weather_service&&!n,o=i||n,l=i&&this.config.weather_service!==zs;return W`
      ${r?W`<option
            value="${Os}"
            ?selected=${a===Os}
          >
            ${Qt("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${l?" (via Open-Meteo)":""}
          </option>`:""}
      ${o?W`<option
            value="${Ps}"
            ?selected=${a===Ps}
          >
            ${Qt("panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${As}"
        ?selected=${a===As}
      >
        ${Qt(t===ks?"panels.mappings.cards.mapping.sources.radiation_sensor":"panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      ${t===ks?W`<option
            value="${Cs}"
            ?selected=${a===Cs}
          >
            ${Qt("panels.mappings.cards.mapping.sources.illuminance",this.hass.language)}
          </option>`:""}
      <option
        value="${Es}"
        ?selected=${a===Es}
      >
        ${Qt("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
    `}handleSimpleSourceChange(e,t,s){const i=this.mappings[e],a=s.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Ls]:a,[js]:""})})}))}handleSimpleInputChange(e,t,s,i){const a=this.mappings[e],n=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},a),{mappings:Object.assign(Object.assign({},a.mappings),{[t]:Object.assign(Object.assign({},a.mappings[t]),{[s]:n})})}))}renderSourceOptions(e,t,s){var i;if(!this.hass)return W``;const a=`${t}_${e}`,n=t===fs||t===ks,r=!!(null===(i=this.config)||void 0===i?void 0:i.use_weather_service);return W`
      <div class="mappingsettingline">
        <label for="${a}_source">
          ${Qt("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${r?this.renderWeatherServiceOption(e,t,s):""}
        ${n?this.renderNoneOption(e,t,s):""}
        ${this.renderSensorOption(e,t,s)}
        ${this.renderStaticValueOption(e,t,s)}
      </div>
    `}renderWeatherServiceOption(e,t,s){if(!this.hass||!this.config)return W``;const i=`${t}_${e}`,a=!this.config.use_weather_service,n=this.config.use_weather_service&&s[Ls]===Os,r=(t===fs||t===ks)&&this.config.weather_service!==zs;return W`
      <label class="${a?"strikethrough":""}">
        <input
          type="radio"
          id="${i}_weather"
          value="${Os}"
          name="${i}_source"
          ?checked="${n}"
          ?disabled="${a}"
          @change="${s=>this.handleSourceChange(e,t,s)}"
        />
        ${Qt("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${r?" (via Open-Meteo)":""}
      </label>
    `}renderNoneOption(e,t,s){if(!this.hass)return W``;const i=`${t}_${e}`,a=s[Ls]===Ps;return W`
      <label>
        <input
          type="radio"
          id="${i}_none"
          value="${Ps}"
          name="${i}_source"
          ?checked="${a}"
          @change="${s=>this.handleSourceChange(e,t,s)}"
        />
        ${Qt("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,t,s){if(!this.hass)return W``;const i=`${t}_${e}`,a=s[Ls]===As;return W`
      <label>
        <input
          type="radio"
          id="${i}_sensor"
          value="${As}"
          name="${i}_source"
          ?checked="${a}"
          @change="${s=>this.handleSourceChange(e,t,s)}"
        />
        ${Qt("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,t,s){if(!this.hass)return W``;const i=`${t}_${e}`,a=s[Ls]===Es;return W`
      <label>
        <input
          type="radio"
          id="${i}_static"
          value="${Es}"
          name="${i}_source"
          ?checked="${a}"
          @change="${s=>this.handleSourceChange(e,t,s)}"
        />
        ${Qt("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,t,s){const i=this.mappings[e],a=s.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Ls]:a,[js]:""})})}))}renderMappingInputs(e,t,s){if(!this.hass)return W``;const i=s[Ls];return W`
      ${i===As||i===Cs?this.renderSensorInput(e,t,s):""}
      ${i===Es?this.renderStaticValueInput(e,t,s):""}
      ${i===As||i===Es?this.renderUnitSelect(e,t,s):""}
      ${t!==xs||i!==As&&i!==Es?"":this.renderPressureTypeSelect(e,t,s)}
      ${t===Ts&&i===As?this.renderWindHeightInput(e,t,s):""}
      ${i===As||i===Cs?this.renderAggregateSelect(e,t,s):""}
    `}renderWindHeightInput(e,t,s){var i;return this.hass?this._numRow(Qt("panels.mappings.cards.mapping.wind_height",this.hass.language),"m",null!==(i=s[Ds])&&void 0!==i?i:"",(s=>{const i=this.mappings[e],a=parseFloat(s);this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Ds]:Number.isFinite(a)?a:null})})}))}),.5):W``}renderSensorInput(e,t,s){return this.hass?W`
      <div class="setting-row">
        <div class="setting-label">
          ${Qt("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${s[js]||""}
          allow-custom-entity
          @value-changed=${s=>{var i;return this.handleSensorChange(e,t,{target:{value:(null===(i=s.detail)||void 0===i?void 0:i.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:W``}renderStaticValueInput(e,t,s){return this.hass?this._numRow(Qt("panels.mappings.cards.mapping.static_value",this.hass.language),"",s[Is]||"",(s=>this.handleStaticValueChange(e,t,{target:{value:s}})),.1):W``}renderUnitSelect(e,t,s){if(!this.hass||!this.config)return W``;const i=this.reportedUnit(t,s);return!i||s[Bs]&&s[Bs]!==i?this._selectRow(Qt("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(t,s),(s=>this.handleUnitChange(e,t,s))):W``}reportedUnit(e,t){var s,i,a,n,r;if(t[Ls]!==As)return;const o=(t[js]||"").trim(),l=null===(n=null===(a=null===(i=null===(s=this.hass)||void 0===s?void 0:s.states)||void 0===i?void 0:i[o])||void 0===a?void 0:a.attributes)||void 0===n?void 0:n.unit_of_measurement;if(!l)return;const h=null!==(r={"W/m²":"W/m2","m/s":"meter/s",mph:"mile/h",kn:"knot",inHg:"inch Hg",mbar:"millibar"}[l])&&void 0!==r?r:l;return Fi(e).some((e=>e.unit===h))?h:void 0}renderPressureTypeSelect(e,t,s){return this.hass?this._selectRow(Qt("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(t,s),(s=>this.handlePressureTypeChange(e,t,s))):W``}renderAggregateSelect(e,t,s){var i;return this.hass?"advanced"!==(null===(i=this.config)||void 0===i?void 0:i.ui_mode)?W``:W`
      <div class="setting-row">
        <div class="setting-label">
          ${Qt("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${s=>this.handleAggregateChange(e,t,s)}"
          >
            ${this.renderAggregateOptionsForMapping(t,s)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${ca}></path>
          </svg>
        </div>
      </div>
    `:W``}handleSensorChange(e,t,s){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[js]:s.target.value})})}))}handleStaticValueChange(e,t,s){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Is]:s.target.value})})}))}handleUnitChange(e,t,s){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Bs]:s.target.value})})}))}handlePressureTypeChange(e,t,s){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Hs]:s.target.value})})}))}handleAggregateChange(e,t,s){const i=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},i),{mappings:Object.assign(Object.assign({},i.mappings),{[t]:Object.assign(Object.assign({},i.mappings[t]),{[Us]:s.target.value})})}))}renderAggregateOptionsForMapping(e,t){if(!this.hass||!this.config)return W``;let s="average";return e===ys&&(s="delta"),e===$s&&(s="average"),t[Us]&&(s=t[Us]),W`
      ${Fs.map((e=>this.renderAggregateOption(e,s)))}
    `}renderAggregateOption(e,t){if(this.hass&&this.config){return W`<option value="${e}" ?selected="${e===t}">
        ${Qt("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return W``}renderPressureTypes(e,t){if(this.hass&&this.config){let e=W``;const s=t[Hs];return e=W`${e}
        <option
          value="${Ns}"
          ?selected="${s===Ns}"
        >
          ${Qt("panels.mappings.cards.mapping.pressure_types."+Ns,this.hass.language)}
        </option>
        <option
          value="${Rs}"
          ?selected="${s===Rs}"
        >
          ${Qt("panels.mappings.cards.mapping.pressure_types."+Rs,this.hass.language)}
        </option>`,e}return W``}renderUnitOptionsForMapping(e,t){if(!this.hass||!this.config)return W``;const s=Fi(e);let i=t[Bs];const a=this.config.units;if(!t[Bs])for(const e of s)if("string"==typeof e.system){if(a===e.system){i=e.unit;break}}else{for(const t of e.system)if(a===t.system){i=e.unit;break}if(i===e.unit)break}return W`
      ${s.map((e=>W`
          <option value="${e.unit}" ?selected="${i===e.unit}">
            ${e.unit}
          </option>
        `))}
    `}_textRow(e,t,s,i){return W`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?W` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==s?"":String(s)}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_numRow(e,t,s,i,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const s=parseFloat(e.value),n=+((isNaN(s)?0:s)+t*a).toFixed(r);e.value=String(n),i(String(n))};return W`
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
            .value=${null==s?"":String(s)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            @change=${e=>i(e.target.value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${ua}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${ma}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,s){return W`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${s}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${ca}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,s,i=!1,a=!1){return W`
      <ha-button
        appearance=${i?"accent":"filled"}
        variant=${i?"danger":"brand"}
        ?disabled=${a}
        @click=${s}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}render(){return this.hass?this.isLoading?W`
        <ha-card
          header="${Qt("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Qt("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:W`
      <ha-card
        header="${Qt("panels.mappings.title",this.hass.language)}"
      >
        <div class="card-content">
          ${Qt("panels.mappings.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Qt("panels.mappings.cards.add-mapping.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("panels.mappings.labels.mapping-name",this.hass.language)}
            </div>
            <input id="mappingNameInput" class="field" type="text" />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${ma}></ha-svg-icon>
              ${this.isSaving?Qt("common.saving-messages.adding",this.hass.language):Qt("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `:W``}renderMappingsList(){const e=this.mappings.slice(0,Math.min(this.mappings.length,10)),t=this.mappings.slice(10);return W`
      ${Ha(e,(e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name}),((e,t)=>this.renderMappingCard(e,t)))}
      ${t.length>0?W`
            <div class="si-form-actions">
              ${this._actionBtn(ma,`Load ${t.length} more mappings...`,(()=>this.loadMoreMappings()))}
            </div>
          `:""}
    `}renderMappingCard(e,t){if(!this.hass)return W``;const s=this.hass.language,i=this.zones.filter((t=>t.mapping===e.id)).length,a=(e,t)=>Qt(`panels.mappings.summary.${t}-${1===e?"one":"other"}`,s).replace("{n}",String(e)),n=[a(Object.values(e.mappings||{}).filter((e=>{const t="string"==typeof e?e:null==e?void 0:e.source;return!!t&&t!==Ps})).length,"sources")];i&&n.push(a(i,"zones"));const r=n.join(" · "),o=null!=e.id&&this._expanded.has(e.id);return W`
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
            .path=${oa}
          ></ha-svg-icon>
        </div>
        ${o?W`<div class="si-body">
              <div class="settings">
                ${this._textRow(Qt("panels.mappings.labels.mapping-name",s),"",e.name,(s=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:s}))))}
                <div class="setting-row">
                  <div class="setting-label">
                    ${Qt("panels.mappings.cards.mapping.greenhouse",s)}
                  </div>
                  <ha-switch
                    .checked=${!!e.greenhouse}
                    @change=${s=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:s.target.checked}))}
                  ></ha-switch>
                </div>
                ${e.greenhouse?W`<div class="weather-note">
                      ${Qt("panels.mappings.cards.mapping.greenhouse_description",s)}
                    </div>`:""}
                ${this.renderMappingSettings(e,t)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${i?W`<div class="weather-note">
                      ${Qt("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",s)}
                    </div>`:this._actionBtn(da,Qt("common.actions.delete",s),(e=>this.handleRemoveMapping(e,t)),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}renderMappingSettings(e,t){var s;const i="advanced"===(null===(s=this.config)||void 0===s?void 0:s.ui_mode),a=Object.entries(e.mappings).filter((([t])=>(!e.greenhouse||t!==ys&&t!==$s)&&(i||t!==ys||!(t=>{const s=e.mappings[t],i="string"==typeof s?s:null==s?void 0:s[Ls];return!i||i===Ps})(t)))),n=e.mappings[fs],r="string"==typeof n?n:null==n?void 0:n[Ls],o=!!r&&r!==Ps,l=a.filter((([e])=>!o||e===fs||e===ys||e===$s)).sort((([e],[t])=>Number(t===fs)-Number(e===fs))),h=a.length-l.length,d=this.hass.language,c=t=>this.zones.filter((t=>t.mapping===e.id)).filter((e=>{var s;const i=null===(s=this.modules.find((t=>t.id===e.module)))||void 0===s?void 0:s.name;return!!i&&t(i)})).map((e=>e.name)).join(", "),u=o?c((e=>"Passthrough"!==e)):"",p=o?"":c((e=>"Passthrough"===e));return W`
      ${l.map((([e])=>this.renderMappingSetting(t,e)))}
      ${h>0?W`<div class="weather-note">
            ${Qt("panels.mappings.cards.mapping.hidden_sources",d).replace("{n}",String(h))}
          </div>`:""}
      ${u?W`<div class="weather-note">
            ${Qt("panels.mappings.cards.mapping.et_ignored",d).replace("{zones}",u)}
          </div>`:""}
      ${p?W`<div class="weather-note">
            ${Qt("panels.mappings.cards.mapping.et_missing",d).replace("{zones}",p)}
          </div>`:""}
    `}loadMoreMappings(){this._scheduleUpdate()}static get styles(){return l`
      ${ba} ${xa}

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
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach((e=>{clearTimeout(e)})),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};s([me()],Ga.prototype,"config",void 0),s([me({type:Array})],Ga.prototype,"zones",void 0),s([me({type:Array})],Ga.prototype,"mappings",void 0),s([me({type:Map})],Ga.prototype,"weatherRecords",void 0),s([me({type:Boolean})],Ga.prototype,"isLoading",void 0),s([me({type:Boolean})],Ga.prototype,"isSaving",void 0),s([me({type:Array})],Ga.prototype,"modules",void 0),s([ve("#mappingNameInput")],Ga.prototype,"mappingNameInput",void 0),Ga=s([ue("smart-irrigation-view-mappings")],Ga);const Za={[Ss]:{unit:Gs,decimals:1},[bs]:{unit:Gs,decimals:1},[_s]:{unit:Gs,decimals:1},[ms]:{unit:Gs,decimals:1},[vs]:{unit:"%",decimals:0},[xs]:{unit:"hPa",decimals:0},[Ts]:{unit:Ks,decimals:1},[ks]:{unit:Js,decimals:2},[ys]:{unit:Zs,decimals:2},[$s]:{unit:Xs,decimals:2},[fs]:{unit:Zs,decimals:2}};let qa=class extends de{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1,this._historyLoading=!1,this._historyError=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)})),this._load()}async _load(){if(this.hass){try{const e=await qi(this.hass);this._info=e,this._use=!!e.use_weather_service,this._service=e.weather_service||(e.services&&e.services.includes(zs)?zs:e.services&&e.services.length?e.services[0]:null),this._apiKey=e.weather_service_api_key||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}this._loadHistory()}}async _loadHistory(){if(this.hass){this._historyLoading=!0;try{this._history=await((e,t=20)=>e.callWS({type:as+"/weatherservice_history",limit:t}))(this.hass,20),this._historyError=""}catch(e){this._historyError=this._errText(e)}finally{this._historyLoading=!1}}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1;try{await(e=this.hass,t={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null},e.callWS(Object.assign({type:as+"/set_weatherservice"},t))),this._saved=!0,window.setTimeout((()=>this._load()),800)}catch(e){this._error=this._errText(e)}finally{this._saving=!1}var e,t}}render(){var e;if(!this.hass)return W``;const t=this.hass.language;return this._loading&&!this._info?W`
        <ha-card header="${Qt("panels.weatherservice.title",t)}">
          <div class="card-content">
            ${Qt("common.loading-messages.general",t)}...
          </div>
        </ha-card>
      `:W`
      <ha-card header="${Qt("panels.weatherservice.title",t)}">
        <div class="card-content ws-description">
          ${Qt("panels.weatherservice.description",t)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${Qt("panels.weatherservice.labels.use-weather-service",t)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?W`
                <div class="setting-row">
                  <div class="setting-label">
                    ${Qt("panels.weatherservice.labels.service",t)}
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
                      <path d=${ca}></path>
                    </svg>
                  </div>
                </div>
                ${this._service&&Ms.includes(this._service)?"":W`<div class="setting-row">
                      <div class="setting-label">
                        ${Qt("panels.weatherservice.labels.api-key",t)}
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
                      ${Qt("panels.weatherservice.messages.owm-onecall-hint",t)}
                    </div>`:""}
              `:W`<div class="ws-note">
                ${Qt("panels.weatherservice.messages.no-service",t)}
              </div>`}
          ${this._error?W`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?W`<div class="ws-msg ws-msg--success">
                ${Qt("panels.weatherservice.messages.saved",t)}
              </div>`:""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?Qt("panels.weatherservice.actions.saving",t):Qt("panels.weatherservice.actions.save",t)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${Qt("panels.weatherservice.messages.reload-note",t)}
          </div>
        </div>
        ${this._renderHistory(t)}
      </ha-card>
    `}_renderHistory(e){var t,s;const i=(null===(t=this._history)||void 0===t?void 0:t.records)||[],a=((null===(s=this._history)||void 0===s?void 0:s.fields)||[]).filter((e=>i.some((t=>t.values&&void 0!==t.values[e]&&null!==t.values[e])))),n=new Set(i.map((e=>e.mapping_name))).size>1,r=["minmax(120px, auto)",...n?["minmax(100px, auto)"]:[],...a.map((()=>"minmax(76px, 1fr)"))].join(" "),o=i.length?this._formatTime(i[0]):"";return W`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <h4>${Qt("panels.weatherservice.history.title",e)}</h4>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${fa}></ha-svg-icon>
            ${Qt("panels.weatherservice.history.refresh",e)}
          </ha-button>
        </div>
        ${o?W`<div class="ws-note ws-history-last">
              ${Qt("panels.weatherservice.history.last-update",e)}:
              ${o}
            </div>`:""}
        ${this._historyError?W`<div class="ws-msg ws-msg--error">${this._historyError}</div>`:0===i.length?W`<div class="ws-note">
                ${this._historyLoading?Qt("common.loading-messages.general",e)+"...":Qt("panels.weatherservice.history.no-data",e)}
              </div>`:W`
                <div class="ws-history-scroll">
                  <div
                    class="weather-table"
                    style="grid-template-columns: ${r};"
                  >
                    <div class="weather-header">
                      <span
                        >${Qt("panels.weatherservice.history.time",e)}</span
                      >
                      ${n?W`<span
                            >${Qt("panels.weatherservice.history.sensor-group",e)}</span
                          >`:""}
                      ${a.map((t=>{var s;return W`<span
                            >${Qt("panels.mappings.cards.mapping.items."+t.toLowerCase(),e)}
                            <span class="ws-history-unit"
                              >${(null===(s=Za[t])||void 0===s?void 0:s.unit)||""}</span
                            ></span
                          >`}))}
                    </div>
                    ${i.map((e=>W`
                        <div class="weather-row">
                          <span>${this._formatTime(e)}</span>
                          ${n?W`<span>${e.mapping_name||"-"}</span>`:""}
                          ${a.map((t=>{var s;return W`<span
                                >${this._formatValue(t,null===(s=e.values)||void 0===s?void 0:s[t])}</span
                              >`}))}
                        </div>
                      `))}
                  </div>
                </div>
              `}
      </div>
    `}_formatTime(e){if(!e.retrieved)return"-";const t=Ua(e.retrieved);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}_formatValue(e,t){var s,i;return null==t||isNaN(t)?"-":t.toFixed(null!==(i=null===(s=Za[e])||void 0===s?void 0:s.decimals)&&void 0!==i?i:1)}static get styles(){return l`
      ${ba} ${xa}

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
    `}};s([me()],qa.prototype,"narrow",void 0),s([me()],qa.prototype,"path",void 0),s([fe()],qa.prototype,"_info",void 0),s([fe()],qa.prototype,"_use",void 0),s([fe()],qa.prototype,"_service",void 0),s([fe()],qa.prototype,"_apiKey",void 0),s([fe()],qa.prototype,"_loading",void 0),s([fe()],qa.prototype,"_saving",void 0),s([fe()],qa.prototype,"_error",void 0),s([fe()],qa.prototype,"_saved",void 0),s([fe()],qa.prototype,"_history",void 0),s([fe()],qa.prototype,"_historyLoading",void 0),s([fe()],qa.prototype,"_historyError",void 0),qa=s([ue("smart-irrigation-view-weatherservice")],qa);const Ka=10,Ja=8,Xa=26,Qa=46;let en=class extends(na(de)){constructor(){super(...arguments),this._records=[],this._loading=!0,this._error=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial history:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to refresh history:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){if(this.hass)try{const[e,t]=await Promise.all([Zi(this.hass),aa(this.hass,500)]);this._config=e,this._records=(null==t?void 0:t.records)||[],this._error=""}catch(e){this._error=(null==e?void 0:e.message)||(null==e?void 0:e.code)||String(e)}finally{this._loading=!1}}_chartDays(){const e=Ua().startOf("day").subtract(29,"days"),t=[];for(let s=0;s<30;s++)t.push(e.clone().add(s,"days").format("YYYY-MM-DD"));return t}_daily(e,t){const s=new Map(e.map((e=>[e,0])));for(const e of this._records){if(!e.start||t&&!t(e))continue;const i=Ua(e.start);if(!i.isValid())continue;const a=i.format("YYYY-MM-DD");s.has(a)&&s.set(a,s.get(a)+Bi(e.water_used,this._config))}return e.map((e=>({key:e,value:s.get(e)})))}_chartedZones(e){const t=e[0],s=new Map;for(const e of this._records){if(!e.start)continue;const i=Ua(e.start);if(!i.isValid()||i.format("YYYY-MM-DD")<t)continue;const a=null!==e.zone_id?`#${e.zone_id}`:e.zone_name||"?";s.has(a)||s.set(a,{id:e.zone_id,name:e.zone_name||a})}return[...s.values()].sort(((e,t)=>e.name.localeCompare(t.name)))}render(){if(!this.hass)return W``;const e=this.hass.language;if(this._loading)return W`
        <ha-card header="${Qt("panels.history.title",e)}">
          <div class="card-content">
            ${Qt("common.loading-messages.general",e)}...
          </div>
        </ha-card>
      `;const t=this._chartDays(),s=this._chartedZones(t);return W`
      <ha-card header="${Qt("panels.history.title",e)}">
        <div class="card-content">
          <div class="history-intro">
            ${Qt("panels.history.description",e)}
          </div>
          ${this._error?W`<div class="history-msg history-msg--error">
                ${this._error}
              </div>`:""}
          <div class="history-actions">
            <ha-button appearance="plain" @click=${()=>this._fetchData()}>
              <ha-svg-icon slot="start" .path=${fa}></ha-svg-icon>
              ${Qt("panels.history.refresh",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <!-- The config carries the unit system, so without it the volumes would
           be unlabelled: show the error above on its own instead. -->
      ${this._config?W`${this._renderTable(e)} ${this._renderTotalChart(e,t)}
          ${this._renderZoneCharts(e,t,s)}`:""}
    `}_renderTable(e){const t=this._records.slice(0,100),s=Li(this._config,ni);return W`
      <ha-card header="${Qt("panels.history.table.title",e)}">
        <div class="card-content">
          ${0===t.length?W`<div class="history-note">
                ${Qt("panels.history.no-data",e)}
              </div>`:W`
                <div class="history-scroll">
                  <div class="history-table">
                    <div class="history-header">
                      <span
                        >${Qt("panels.history.table.start",e)}</span
                      >
                      <span
                        >${Qt("panels.history.table.zone",e)}</span
                      >
                      <span
                        >${Qt("panels.history.table.duration",e)}</span
                      >
                      <span
                        >${Qt("panels.history.table.water",e)}
                        <span class="history-unit">(${s})</span></span
                      >
                    </div>
                    ${t.map((e=>W`
                        <div class="history-row">
                          <span>${this._formatStart(e.start)}</span>
                          <span>${e.zone_name||"-"}</span>
                          <span>${ji(e.duration)}</span>
                          <span
                            >${Bi(e.water_used,this._config).toFixed(1)}</span
                          >
                        </div>
                      `))}
                  </div>
                </div>
                ${this._records.length>100?W`<div class="history-note">
                      ${Qt("panels.history.table.truncated",e,"{count}",100,"{total}",this._records.length)}
                    </div>`:""}
              `}
        </div>
      </ha-card>
    `}_renderTotalChart(e,t){const s=this._daily(t);return W`
      <ha-card header="${Qt("panels.history.charts.total-title",e)}">
        <div class="card-content">${this._renderChart(s,e)}</div>
      </ha-card>
    `}_renderZoneCharts(e,t,s){return 0===s.length?W``:W`
      <ha-card
        header="${Qt("panels.history.charts.per-zone-title",e)}"
      >
        <div class="card-content">
          ${s.map((s=>{const i=this._daily(t,(e=>null!==s.id?e.zone_id===s.id:e.zone_name===s.name));return W`
              <div class="zone-chart">
                <h4>${s.name}</h4>
                ${this._renderChart(i,e)}
              </div>
            `}))}
        </div>
      </ha-card>
    `}_renderChart(e,t){const s=Li(this._config,ni),i=Math.max(...e.map((e=>e.value)),0);if(i<=0)return W`<div class="history-note">
        ${Qt("panels.history.charts.no-data",t)}
      </div>`;const a=this._niceMax(i),n=200-Ka-Xa,r=Ka+n,o=(720-Qa-Ja)/e.length,l=Math.max(o-3,1),h=[0,.5,1].map((e=>{const t=r-e*n;return V`
        <line
          class="grid"
          x1=${Qa}
          y1=${t}
          x2=${720-Ja}
          y2=${t}
        ></line>
        <text class="axis" x=${Qa-6} y=${t+3.5} text-anchor="end">
          ${this._formatAxis(a*e)}
        </text>
      `})),d=e.map(((e,t)=>{const s=e.value/a*n;return V`
        <rect
          class="bar"
          x=${Qa+t*o+(o-l)/2}
          y=${r-s}
          width=${l}
          height=${s}
          rx="1"
        >
          <title>
            ${Ri(e.key,this.hass,{dateStyle:"long"})}: ${e.value.toFixed(1)}
          </title>
        </rect>
      `})),c=e.map(((t,s)=>s%5!=0&&s!==e.length-1?V``:V`
        <text
          class="axis"
          x=${Qa+s*o+o/2}
          y=${192}
          text-anchor="middle"
        >
          ${Ri(t.key,this.hass,{day:"numeric",month:"short"})}
        </text>
      `));return W`
      <div class="chart-unit">${s}</div>
      <svg
        class="chart"
        viewBox="0 0 ${720} ${200}"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        ${h} ${d} ${c}
      </svg>
    `}_niceMax(e){const t=Math.pow(10,Math.floor(Math.log10(e))),s=e/t;return(s<=1?1:s<=2?2:s<=5?5:10)*t}_formatAxis(e){return e>=100?e.toFixed(0):e.toFixed(1)}_formatStart(e){if(!e)return"-";const t=Ua(e);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}static get styles(){return l`
      ${ba} ${xa}

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
    `}};s([me()],en.prototype,"narrow",void 0),s([me()],en.prototype,"path",void 0),s([fe()],en.prototype,"_config",void 0),s([fe()],en.prototype,"_records",void 0),s([fe()],en.prototype,"_loading",void 0),s([fe()],en.prototype,"_error",void 0),en=s([ue("smart-irrigation-view-history")],en);let tn=class extends de{constructor(){super(...arguments),this._busy=!1,this._error="",this._message="",this._pendingName=""}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}_reset(){this._error="",this._message="",this._pending=void 0,this._pendingName=""}async _export(){if(this.hass){this._reset(),this._busy=!0;try{const t=await(e=this.hass,e.callApi("GET",as+"/export")),s=JSON.stringify(t,null,2),i=new Blob([s],{type:"application/json"}),a=URL.createObjectURL(i),n=document.createElement("a");n.href=a;const r=(new Date).toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");n.download=`smart_irrigation_backup_${r}.json`,n.click(),URL.revokeObjectURL(a),this._message=Qt("panels.backuprestore.messages.exported",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e}}async _onFile(e){this._reset();const t=e.target,s=t.files&&t.files[0];if(s)try{const e=await s.text(),t=JSON.parse(e);if(!t||"object"!=typeof t||!t.config)throw new Error(Qt("panels.backuprestore.messages.invalid-file",this.hass.language));this._pending=t,this._pendingName=s.name}catch(e){this._error=this._errText(e)}finally{t.value=""}}async _restore(){if(this.hass&&this._pending){this._busy=!0,this._error="",this._message="";try{const s=await(e=this.hass,t=this._pending,e.callApi("POST",as+"/restore",t));if(s&&!1===s.success)throw new Error(s.error||"restore failed");this._pending=void 0,this._pendingName="",this._message=Qt("panels.backuprestore.messages.restored",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e,t}}_count(e){const t=this._pending&&this._pending[e];return Array.isArray(t)?t.length:0}render(){if(!this.hass)return W``;const e=this.hass.language;return W`
      <ha-card header="${Qt("panels.backuprestore.title",e)}">
        <div class="card-content br-description">
          ${Qt("panels.backuprestore.description",e)}
        </div>
      </ha-card>

      <ha-card
        header="${Qt("panels.backuprestore.cards.backup.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${Qt("panels.backuprestore.cards.backup.description",e)}
          </div>
          ${this._message?W`<div class="br-msg br-msg--success">${this._message}</div>`:""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"}></ha-svg-icon>
              ${Qt("panels.backuprestore.actions.export",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${Qt("panels.backuprestore.cards.restore.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${Qt("panels.backuprestore.cards.restore.description",e)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${_a}></ha-svg-icon>
            ${Qt("panels.backuprestore.actions.choose-file",e)}
          </label>

          ${this._pending?W`
                <div class="br-warning">
                  <ha-svg-icon .path=${"M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${Qt("panels.backuprestore.messages.confirm-title",e)}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${Qt("panels.backuprestore.messages.summary",e)}:
                      ${this._count("zones")}
                      ${Qt("panels.zones.title",e)} ·
                      ${this._count("modules")}
                      ${Qt("panels.modules.title",e)} ·
                      ${this._count("mappings")}
                      ${Qt("panels.mappings.title",e)}
                    </div>
                    <div class="br-warning-text">
                      ${Qt("panels.backuprestore.messages.confirm-warning",e)}
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
                  <ha-svg-icon slot="start" .path=${_a}></ha-svg-icon>
                  ${this._busy?Qt("panels.backuprestore.actions.restoring",e):Qt("panels.backuprestore.actions.restore",e)}
                </ha-button>
              </div>`:""}
          <div class="br-note">
            ${Qt("panels.backuprestore.messages.reload-note",e)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${ba} ${xa}

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
    `}};s([me()],tn.prototype,"narrow",void 0),s([me()],tn.prototype,"path",void 0),s([fe()],tn.prototype,"_busy",void 0),s([fe()],tn.prototype,"_error",void 0),s([fe()],tn.prototype,"_message",void 0),s([fe()],tn.prototype,"_pending",void 0),s([fe()],tn.prototype,"_pendingName",void 0),tn=s([ue("smart-irrigation-view-backuprestore")],tn);let sn=class extends(na(de)){constructor(){super(...arguments),this.zones=[],this.isLoading=!0,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}firstUpdated(){ye().catch((e=>{console.error("Failed to load HA form:",e)}))}hassSubscribe(){return this._fetchData().catch((e=>{console.error("Failed to fetch initial data:",e)})),[this.hass.connection.subscribeMessage((()=>{this._fetchData().catch((e=>{console.error("Failed to fetch data on config update:",e)}))}),{type:as+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[t,s,i]=await Promise.all([Zi(this.hass),(e=this.hass,e.callWS({type:as+"/info"})),Ki(this.hass)]);this.config=t,this.info=s,this.zones=i}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._scheduleUpdate()}}get _lang(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e,...t){return Qt(`panels.info.${e}`,this._lang,...t)}formatDuration(e){const t=Math.max(0,Math.round(null!=e?e:0)),s=Qt("common.units.hours",this._lang),i=Qt("common.units.minutes",this._lang),a=Qt("common.units.seconds",this._lang);if(t<60)return`${t} ${a}`;if(t<3600)return`${Math.round(t/60)} ${i}`;const n=Math.floor(t/3600),r=Math.round(t%3600/60);return r?`${n} ${s} ${r} ${i}`:`${n} ${s}`}render(){return this.hass?this.isLoading?W`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${Qt("common.loading",this._lang)}...
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
      `:W``}renderPostpone(){var e,t,s;const i=null===(s=null===(t=null===(e=this.info)||void 0===e?void 0:e.skip_preview)||void 0===t?void 0:t.checks)||void 0===s?void 0:s.find((e=>"postponed"===e.id&&e.skip));return W`
      <ha-card>
        <div class="card-content postpone">
          ${i?W`
                <ha-icon icon="mdi:pause-circle-outline"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.until")}
                  ${Ri(i.until,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
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
    `}async postponeIrrigation(e){await this.hass.callService("smart_irrigation","postpone_irrigation",{hours:e}),await this._fetchData()}async resumeIrrigation(){await this.hass.callService("smart_irrigation","resume_irrigation",{}),await this._fetchData()}renderForecast(){var e,t,s,i,a;const n=null!==(t=null===(e=this.info)||void 0===e?void 0:e.forecast)&&void 0!==t?t:[];if(!n.length)return"";const r="mi"!==(null===(a=null===(i=null===(s=this.hass)||void 0===s?void 0:s.config)||void 0===i?void 0:i.unit_system)||void 0===a?void 0:a.length),o=e=>null==e?"—":r?`${Math.round(e)}°`:`${Math.round(1.8*e+32)}°`;return W`
      <ha-card>
        <div class="card-content forecast">
          ${n.map(((e,t)=>{var s;const i=(null!==(s=e.precipitation)&&void 0!==s?s:0)>0;return W`
              <div class="forecast-day">
                <div class="forecast-name">
                  ${0===t?this.t("cards.forecast.today"):Ri(e.date,this.hass,{weekday:"short"})}
                </div>
                <ha-icon
                  icon=${i?"mdi:weather-rainy":"mdi:weather-sunny"}
                  class=${i?"wet":"dry"}
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
    `:""}renderStaleZones(){var e,t;const s=null!==(t=null===(e=this.info)||void 0===e?void 0:e.stale_zones)&&void 0!==t?t:[];return s.length?W`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:clock-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t("cards.stale.title")}</div>
            <div class="info-note">${this.t("cards.stale.body")}</div>
            ${s.map((e=>W`
                <div class="info-note">
                  <b>${e.zone}</b>:
                  ${e.last_calculated?Ri(e.last_calculated,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.stale.never")}
                </div>
              `))}
          </div>
        </div>
      </ha-card>
    `:""}renderNextRun(){var e,t,s,i,a,n,r;const o=this.info,l=null!==(e=null==o?void 0:o.next_irrigation_zones)&&void 0!==e?e:[],h=null!==(t=null==o?void 0:o.next_irrigation_duration)&&void 0!==t?t:0,d=null===(i=null===(s=null==o?void 0:o.skip_preview)||void 0===s?void 0:s.checks)||void 0===i?void 0:i.find((e=>"postponed"===e.id&&e.skip)),c=(null===(a=null==o?void 0:o.skip_preview)||void 0===a?void 0:a.should_skip)?null===(n=null==o?void 0:o.skip_preview)||void 0===n?void 0:n.reason:null,u=(null==o?void 0:o.next_irrigation_start)?Ri(o.next_irrigation_start,this.hass,{weekday:"long",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):null;let p="mdi:water-off-outline",g=this.t("cards.next-run.headline-nothing"),m=u?this.t("cards.next-run.sub-nothing","{start}",u):this.t("cards.next-run.no-start");const f="none"===(null==o?void 0:o.active_start_trigger);f?(p="mdi:calendar-remove-outline",g=this.t("cards.next-run.headline-no-trigger"),m=this.t("cards.next-run.sub-no-trigger")):d?(p="mdi:pause-circle-outline",g=this.t("cards.next-run.headline-postponed"),m=this.t("cards.next-run.sub-postponed")):c&&"postponed"!==c?(p="mdi:calendar-remove-outline",g=this.t("cards.next-run.headline-skipped"),m=this.t(`cards.decision.check-${c}`)):l.length&&h>0&&(p="mdi:water-outline",g=u?this.t("cards.next-run.headline-watering","{start}",u):this.t("cards.next-run.headline-watering-soon"),m=this.t("cards.next-run.sub-watering","{count}",String(l.length),"{duration}",this.formatDuration(h)));const v=!1!==(null==o?void 0:o.start_trigger_armed);return!f&&!v&&!d&&!c&&l.length&&h>0&&(p="mdi:calendar-alert",g=this.t("cards.next-run.headline-not-scheduled"),m=this.t("cards.next-run.sub-not-scheduled")),W`
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
          ${(null==o?void 0:o.durations_estimated)?W`<span>${this.t("cards.next-run.estimated")}</span>`:""}
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
    `}renderCheckNumbers(e){var t,s,i,a,n,r,o,l,h,d;if("precipitation"===e.id)return W`
        <span
          >${this.t("cards.decision.detail-forecast")}:
          ${null!==(s=null===(t=e.forecast_mm)||void 0===t?void 0:t.toFixed(1))&&void 0!==s?s:"-"} mm</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!==(a=null===(i=e.threshold_mm)||void 0===i?void 0:i.toFixed(1))&&void 0!==a?a:"-"} mm</span
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
              >${t.should_skip?this.t("cards.decision.last-skipped"):this.t("cards.decision.last-ran")}${t.evaluated_at?` (${Ri(t.evaluated_at,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})`:""}</span
            >`:W`<span class="value"
              >${this.t("cards.decision.last-none")}</span
            >`}
      </div>
    `}renderEstimates(){var e,t;const s=null!==(t=null===(e=this.info)||void 0===e?void 0:e.zone_estimates)&&void 0!==t?t:{},i=this.config?Li(this.config,ri):"mm",a=this.zones.filter((e=>s[String(e.id)]));return W`
      <ha-card header="${this.t("cards.estimate.title")}">
        <div class="card-content">
          ${0===a.length?W`<div class="info-note">
                ${this.t("cards.estimate.none")}
              </div>`:W`
                ${a.map((e=>{const t=s[String(e.id)];return W`
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
                            >${Number(t.bucket).toFixed(1)} ${i}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.at-last-calculation")}${e.last_calculated?` (${Ri(e.last_calculated,this.hass,{weekday:"short",hour:"2-digit",minute:"2-digit"})})`:""}:</span
                          >
                          <span class="value"
                            >${Number(e.bucket).toFixed(1)} ${i}</span
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
                            >${e.last_irrigation?Ri(e.last_irrigation,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.estimate.never-watered")}</span
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
      ${ba} ${xa}

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
    `}};s([me()],sn.prototype,"config",void 0),s([me({type:Object})],sn.prototype,"info",void 0),s([me({type:Array})],sn.prototype,"zones",void 0),s([me({type:Boolean})],sn.prototype,"isLoading",void 0),sn=s([ue("smart-irrigation-view-info")],sn);const an=[Ss,ms,vs,xs,Ts,ks,fs,ys,$s],nn={sensors:"PyETO",et:"Passthrough",static:"Static"};let rn=class extends de{constructor(){super(...arguments),this.step=0,this.allModules=[],this.modules=[],this.isSaving=!1,this.done=!1,this.zoneName="",this.zoneSize="",this.zoneThroughput="",this.underGlass=!1,this.weather="service",this.sensors={},this.staticDelta="",this.serviceSuppliesEt=!1}firstUpdated(){ye().catch((()=>{})),this._load().catch((e=>console.error("Setup wizard: load failed",e)))}async _load(){if(!this.hass)return;const[e,t,s,i]=await Promise.all([Zi(this.hass),Qi(this.hass),Xi(this.hass),qi(this.hass).catch((()=>{}))]);this.config=e,this.allModules=t,this.modules=s,this.serviceSuppliesEt=!!(null==i?void 0:i.supplies_evapotranspiration),this.usesWeatherService||(this.weather="sensors")}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e){return Qt(`panels.setup.${e}`,this.lng)}get usesWeatherService(){var e;return!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service)}get engineName(){return"service"===this.weather?this.serviceSuppliesEt?"Passthrough":"PyETO":nn[this.weather]}get sourcesToAsk(){var e;const t=this.allModules.find((e=>e.name===this.engineName)),s=null!==(e=null==t?void 0:t.consumes)&&void 0!==e?e:an;return an.filter((e=>s.includes(e)&&!(this.underGlass&&(e===ys||e===$s))))}get sensorsToAsk(){return"static"===this.weather?[]:"et"===this.weather?[fs]:"sensors"===this.weather?this.sourcesToAsk:[]}get steps(){const e=["zone","environment","weather"];return(this.sensorsToAsk.length||"static"===this.weather)&&e.push("sensors"),e.push("review"),e}get currentStep(){return this.steps[Math.min(this.step,this.steps.length-1)]}get canGoOn(){switch(this.currentStep){case"zone":return""!==this.zoneName.trim()&&Number(this.zoneSize)>0&&Number(this.zoneThroughput)>0;case"sensors":return"static"===this.weather?Number(this.staticDelta)>0:this.sensorsToAsk.every((e=>{var t;return""!==(null!==(t=this.sensors[e])&&void 0!==t?t:"")}));default:return!0}}render(){return this.hass?this.done?W`
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
                >(${Li(this.config,ti)})</span
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
                >(${Li(this.config,si)})</span
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
      ${this.underGlass&&this.sensorsToAsk.includes(ks)?W`<div class="note">${this.t("steps.sensors.lux-hint")}</div>`:""}
      ${this.sensorsToAsk.map((e=>{var t;return W`
          <div class="setting-row">
            <div class="setting-label">${e}</div>
            <ha-entity-picker
              class="entity-field"
              .hass=${this.hass}
              .value=${null!==(t=this.sensors[e])&&void 0!==t?t:""}
              allow-custom-entity
              @value-changed=${t=>{var s,i;this.sensors=Object.assign(Object.assign({},this.sensors),{[e]:null!==(i=null===(s=t.detail)||void 0===s?void 0:s.value)&&void 0!==i?i:""})}}
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
            ${Gi(this.engineName,this.lng)}
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
    `}choice(e,t,s,i){return W`
      <div class="choice ${e?"selected":""}" @click=${i}>
        <div class="choice-title">${t}</div>
        <div class="choice-help">${s}</div>
      </div>
    `}sourceFor(e){return this.sensors[e]?{[Ls]:As,[js]:this.sensors[e],[Bs]:""}:"service"===this.weather&&this.sourcesToAsk.includes(e)?{[Ls]:Os,[js]:"",[Bs]:""}:!this.underGlass||e!==ys&&e!==$s?{[Ls]:Ps,[js]:"",[Bs]:""}:{[Ls]:Es,[js]:"",[Bs]:"",[Is]:0}}async create(){if(this.hass&&!this.isSaving){this.isSaving=!0,this.error=void 0;try{let e=this.modules.find((e=>e.name===this.engineName));if(!e){const t=this.allModules.find((e=>e.name===this.engineName));if(!t)throw new Error(`Unknown calculation engine ${this.engineName}`);const s="static"===this.weather?Object.assign(Object.assign({},t.config),{delta:Number(this.staticDelta)}):t.config;await ea(this.hass,{name:t.name,description:t.description,config:s,schema:t.schema});const i=await Xi(this.hass);this.modules=i,e=i.find((e=>e.name===this.engineName))}const t={name:this.zoneName.trim(),mappings:Object.fromEntries(an.map((e=>[e,this.sourceFor(e)]))),greenhouse:this.underGlass,[ws]:null==e?void 0:e.id};await sa(this.hass,t);const s=(await ta(this.hass)).find((e=>e.name===t.name));await Ji(this.hass,{name:this.zoneName.trim(),size:Number(this.zoneSize),throughput:Number(this.zoneThroughput),state:"automatic",[li]:null==s?void 0:s.id}),await Ki(this.hass),this.done=!0}catch(e){console.error("Setup wizard: could not create the zone",e),this.error=this.t("failed")}finally{this.isSaving=!1}}}static get styles(){return l`
      ${ba} ${xa}

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
    `}};s([me()],rn.prototype,"hass",void 0),s([me()],rn.prototype,"config",void 0),s([fe()],rn.prototype,"step",void 0),s([fe()],rn.prototype,"allModules",void 0),s([fe()],rn.prototype,"modules",void 0),s([fe()],rn.prototype,"isSaving",void 0),s([fe()],rn.prototype,"error",void 0),s([fe()],rn.prototype,"done",void 0),s([fe()],rn.prototype,"zoneName",void 0),s([fe()],rn.prototype,"zoneSize",void 0),s([fe()],rn.prototype,"zoneThroughput",void 0),s([fe()],rn.prototype,"underGlass",void 0),s([fe()],rn.prototype,"weather",void 0),s([fe()],rn.prototype,"sensors",void 0),s([fe()],rn.prototype,"staticDelta",void 0),s([fe()],rn.prototype,"serviceSuppliesEt",void 0),rn=s([ue("smart-irrigation-view-setup")],rn);const on=ba,ln=()=>{const e=e=>{let t={};for(let s=0;s<e.length;s+=2){const i=e[s],a=s<e.length?e[s+1]:void 0;t=Object.assign(Object.assign({},t),{[i]:a})}return t},t=window.location.pathname.split("/");let s={page:t[2]||"info",params:{}};if(t.length>3){let i=t.slice(3);if(t.includes("filter")){const t=i.findIndex((e=>"filter"==e)),a=i.slice(t+1);i=i.slice(0,t),s=Object.assign(Object.assign({},s),{filter:e(a)})}i.length&&(i.length%2&&(s=Object.assign(Object.assign({},s),{subpage:i.shift()})),i.length&&(s=Object.assign(Object.assign({},s),{params:e(i)})))}return s},hn=(e,...t)=>{let s={page:e,params:{}};t.forEach((e=>{"string"==typeof e?s=Object.assign(Object.assign({},s),{subpage:e}):"params"in e?s=Object.assign(Object.assign({},s),{params:e.params}):"filter"in e&&(s=Object.assign(Object.assign({},s),{filter:e.filter}))}));const i=e=>{let t=Object.keys(e);t=t.filter((t=>e[t])),t.sort();let s="";return t.forEach((t=>{const i=e[t];s=s.length?`${s}/${t}/${i}`:`${t}/${i}`})),s};let a=`/${as}/${s.page}`;return s.subpage&&(a=`${a}/${s.subpage}`),i(s.params).length&&(a=`${a}/${i(s.params)}`),s.filter&&(a=`${a}/filter/${i(s.filter)}`),a};var dn;!function(e){e.Setup="setup",e.Info="info",e.General="general",e.Zones="zones",e.Modules="modules",e.Mappings="mappings",e.WeatherService="weatherservice",e.History="history",e.BackupRestore="backuprestore",e.Help="help"}(dn||(dn={}));const cn=[{id:"home",pages:[dn.Info,dn.History]},{id:"zones",pages:[dn.Zones]},{id:"data",pages:[dn.WeatherService,dn.Mappings]},{id:"settings",pages:[dn.General,dn.BackupRestore,dn.Help]}],un={[dn.Modules]:"settings",[dn.Setup]:"settings"},pn=e=>{const t=cn.find((t=>t.pages.includes(e)));if(t)return t;const s=un[e];if(s){const t=cn.find((e=>e.id===s));if(t)return Object.assign(Object.assign({},t),{pages:[...t.pages,e]})}return cn[0]};e.SmartIrrigationPanel=class extends de{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100,this._languageReady=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame((()=>{this._updateScheduled=!1,this.requestUpdate()})))}willUpdate(){var e;const t=null===(e=this.hass)||void 0===e?void 0:e.language;if(!t||this._languageRequested===t)return;if(this._languageRequested=t,function(e){return Xt(e)in Kt}(t))return void(this._languageReady=!0);const s=()=>{this._languageReady=!0,this._refreshViews()},i=setTimeout(s,600);(async function(e,t=""){const s=Xt(e);if(s in Kt)return;if(!qt.includes(s))return;if(s in Jt)return Jt[s];const i=(async()=>{const e=new AbortController,i=setTimeout((()=>e.abort()),5e3);try{const i=t?`${Zt}/${s}.json?v=${encodeURIComponent(t)}`:`${Zt}/${s}.json`,a=await fetch(i,{signal:e.signal});if(!a.ok)throw new Error(`HTTP ${a.status}`);const n=await a.json();if(!n||"object"!=typeof n)throw new Error("not an object");Kt[s]=n}catch(e){console.warn(`Smart Irrigation: could not load the ${s} translation, falling back to English`,e)}finally{clearTimeout(i),delete Jt[s]}})();return Jt[s]=i,i})(t,is).then((()=>{clearTimeout(i),s()}))}_refreshViews(){var e;this.requestUpdate(),null===(e=this.shadowRoot)||void 0===e||e.querySelectorAll("*").forEach((e=>{var t;return null===(t=e.requestUpdate)||void 0===t?void 0:t.call(e)}))}async firstUpdated(){const e=ln();e.page&&Object.values(dn).includes(e.page)?(window.addEventListener("location-changed",(()=>{if(!window.location.pathname.includes("smart_irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())})),ye().then((()=>{this._scheduleUpdate()})).catch((e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()}))):Wi(0,hn(dn.Info))}render(){if(!this._languageReady)return W``;const e=ln(),t=!!customElements.get("ha-tab-group"),s=!!customElements.get("ha-tab-group-tab");return W`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Qt("title",this.hass.language)}</div>
          <div class="version">${is}</div>
        </div>

        ${t&&s?W`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${cn.map((t=>W`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${t.pages[0]}"
                      .active=${pn(e.page).id===t.id}
                    >
                      ${Qt(`panels.groups.${t.id}`,this.hass.language)}
                    </ha-tab-group-tab>
                  `))}
              </ha-tab-group>
            `:W`
              <div class="custom-tabs">
                ${cn.map((t=>W`
                    <button
                      class="custom-tab ${pn(e.page).id===t.id?"active":""}"
                      @click=${()=>this.navigateToPage(t.pages[0])}
                    >
                      ${Qt(`panels.groups.${t.id}`,this.hass.language)}
                    </button>
                  `))}
              </div>
            `}
        ${this.renderSubTabs(e.page)}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}renderSubTabs(e){const t=pn(e);return t.pages.length<2?"":W`
      <div class="sub-tabs">
        ${t.pages.map((t=>W`
            <button
              class="sub-tab ${e===t?"active":""}"
              @click=${()=>this.navigateToPage(t)}
            >
              ${Qt(`panels.${t}.title`,this.hass.language)}
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
            header="${Qt("panels.help.cards.how-to-get-help.title",this.hass.language)}"
          >
            <div class="card-content">
              ${Qt("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
              <a href="https://altmenorg.github.io/HAsmartirrigation/"
                >${Qt("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
              >.
              ${Qt("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
              <a
                href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
                >${Qt("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
              >
              ${Qt("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
              <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
                >${Qt("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
              >
              (${Qt("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
            </div></ha-card
          ><ha-card
            header="${Qt("panels.help.cards.translate.title",this.hass.language)}"
          >
            <div class="card-content">
              ${Qt("panels.help.cards.translate.text",this.hass.language)}
              <a
                href="https://hosted.weblate.org/engage/smart-irrigation/"
                target="_blank"
                rel="noreferrer"
                >${Qt("panels.help.cards.translate.link",this.hass.language)}</a
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
        `}}navigateToPage(e){if(e!==ln().page){const t=hn(e);Wi(0,t),this.requestUpdate()}else scrollTo(0,0)}handlePageSelected(e){const t=e.detail.name;if(t!==ln().page){const e=hn(t);Wi(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[on,l`
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
          padding: 0;
        }

        /* The room under the last card is padding on the page itself: a margin
           on the last child of a scrolling flex container is not counted in the
           scrollable area, so on some pages the last card touched the bottom. */
        .view > * {
          padding-top: 11px;
          padding-bottom: 24px;
          box-sizing: border-box;
        }

        .version {
          font-size: 14px;
          font-weight: 500;
          color: rgba(var(--rgb-text-primary-color), 0.9);
        }
      `]}},s([me({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),s([me({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),s([fe()],e.SmartIrrigationPanel.prototype,"_languageReady",void 0),e.SmartIrrigationPanel=s([ue("smart-irrigation")],e.SmartIrrigationPanel);let gn=class extends de{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?W`
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
              .path=${la}
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
    `}};s([me({attribute:!1})],gn.prototype,"hass",void 0),s([fe()],gn.prototype,"_params",void 0),gn=s([ue("smart-irrigation-error-dialog")],gn);var mn=Object.freeze({__proto__:null,get ErrorDialog(){return gn}})}({});
//# sourceMappingURL=smart-irrigation.js.map
