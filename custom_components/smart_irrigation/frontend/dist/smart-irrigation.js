!function(e){"use strict";function t(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i}function i(e,t,i,s){var a,n=arguments.length,o=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(a=e[r])&&(o=(n<3?a(o):n>3?a(t,i,o):a(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const s=globalThis,a=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const l=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new r(i,e,n)},d=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:h,defineProperty:c,getOwnPropertyDescriptor:u,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:m}=Object,f=globalThis,v=f.trustedTypes,_=v?v.emptyScript:"",w=f.reactiveElementPolyfillSupport,y=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},$=(e,t)=>!h(e,t),x={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:a}=u(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);a?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(d(e))}else void 0!==e&&t.push(d(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),a=s.litNonce;void 0!==a&&t.setAttribute("nonce",a),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=s;const n=a.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,a){if(void 0!==e){const n=this.constructor;if(!1===s&&(a=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??$)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:a},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[y("elementProperties")]=new Map,k[y("finalized")]=new Map,w?.({ReactiveElement:k}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const z=globalThis,S=e=>e,M=z.trustedTypes,T=M?M.createPolicy("lit-html",{createHTML:e=>e}):void 0,O="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+A,H=`<${C}>`,E=document,D=()=>E.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,I=Array.isArray,j="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,P=/>/g,U=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,F=/"/g,W=/^(?:script|style|textarea|title)$/i,Y=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=Y(1),Z=Y(2),G=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),J=new WeakMap,K=E.createTreeWalker(E,129);function X(e,t){if(!I(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}class Q{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let a=0,n=0;const o=e.length-1,r=this.parts,[l,d]=((e,t)=>{const i=e.length-1,s=[];let a,n=2===t?"<svg>":3===t?"<math>":"",o=R;for(let t=0;t<i;t++){const i=e[t];let r,l,d=-1,h=0;for(;h<i.length&&(o.lastIndex=h,l=o.exec(i),null!==l);)h=o.lastIndex,o===R?"!--"===l[1]?o=L:void 0!==l[1]?o=P:void 0!==l[2]?(W.test(l[2])&&(a=RegExp("</"+l[2],"g")),o=U):void 0!==l[3]&&(o=U):o===U?">"===l[0]?(o=a??R,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,r=l[1],o=void 0===l[3]?U:'"'===l[3]?F:B):o===F||o===B?o=U:o===L||o===P?o=R:(o=U,a=void 0);const c=o===U&&e[t+1].startsWith("/>")?" ":"";n+=o===R?i+H:d>=0?(s.push(r),i.slice(0,d)+O+i.slice(d)+A+c):i+A+(-2===d?t:c)}return[X(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=Q.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=K.nextNode())&&r.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(O)){const t=d[n++],i=s.getAttribute(e).split(A),o=/([.?@])?(.*)/.exec(t);r.push({type:1,index:a,name:o[2],strings:i,ctor:"."===o[1]?ae:"?"===o[1]?ne:"@"===o[1]?oe:se}),s.removeAttribute(e)}else e.startsWith(A)&&(r.push({type:6,index:a}),s.removeAttribute(e));if(W.test(s.tagName)){const e=s.textContent.split(A),t=e.length-1;if(t>0){s.textContent=M?M.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],D()),K.nextNode(),r.push({type:2,index:++a});s.append(e[t],D())}}}else if(8===s.nodeType)if(s.data===C)r.push({type:2,index:a});else{let e=-1;for(;-1!==(e=s.data.indexOf(A,e+1));)r.push({type:7,index:a}),e+=A.length-1}a++}}static createElement(e,t){const i=E.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,s){if(t===G)return t;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const n=N(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(t=ee(e,a._$AS(e,t.values),a,s)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??E).importNode(t,!0);K.currentNode=s;let a=K.nextNode(),n=0,o=0,r=i[0];for(;void 0!==r;){if(n===r.index){let t;2===r.type?t=new ie(a,a.nextSibling,this,e):1===r.type?t=new r.ctor(a,r.name,r.strings,this,e):6===r.type&&(t=new re(a,this,e)),this._$AV.push(t),r=i[++o]}n!==r?.index&&(a=K.nextNode(),n++)}return K.currentNode=E,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),N(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>I(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new te(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=J.get(e.strings);return void 0===t&&J.set(e.strings,t=new Q(e)),t}k(e){I(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const a of e)s===t.length?t.push(i=new ie(this.O(D()),this.O(D()),this,this.options)):i=t[s],i._$AI(a),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,s){const a=this.strings;let n=!1;if(void 0===a)e=ee(this,e,t,0),n=!N(e)||e!==this._$AH&&e!==G,n&&(this._$AH=e);else{const s=e;let o,r;for(e=a[0],o=0;o<a.length-1;o++)r=ee(this,s[i+o],t,o),r===G&&(r=this._$AH[o]),n||=!N(r)||r!==this._$AH[o],r===q?e=q:e!==q&&(e+=(r??"")+a[o+1]),this._$AH[o]=r}n&&!s&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ae extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class ne extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class oe extends se{constructor(e,t,i,s,a){super(e,t,i,s,a),this.type=5}_$AI(e,t=this){if((e=ee(this,e,t,0)??q)===G)return;const i=this._$AH,s=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le={I:ie},de=z.litHtmlPolyfillSupport;de?.(Q,ie),(z.litHtmlVersions??=[]).push("3.3.3");const he=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */let ce=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let a=s._$litPart$;if(void 0===a){const e=i?.renderBefore??null;s._$litPart$=a=new ie(t.insertBefore(D(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};ce._$litElement$=!0,ce.finalized=!0,he.litElementHydrateSupport?.({LitElement:ce});const ue=he.litElementPolyfillSupport;ue?.({LitElement:ce}),(he.litElementVersions??=[]).push("4.2.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const pe=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ge={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:$},me=(e=ge,t,i)=>{const{kind:s,metadata:a}=i;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,a,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const a=this[s];t.call(this,i),this.requestUpdate(s,a,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function fe(e){return(t,i)=>"object"==typeof i?me(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function ve(e){return fe({...e,state:!0,attribute:!1})}
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
function _e(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}let we=!1,ye=null;const be=async()=>{if(we&&ye)return ye;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();we=!0,ye=async function(){try{await new Promise(e=>{"requestIdleCallback"in window?requestIdleCallback(()=>e()):setTimeout(()=>e(),0)}),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),t=document.createElement("partial-panel-resolver");e.appendChild(t),t.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise(e=>queueMicrotask(()=>e())),t._updateRoutes(),await t.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise(e=>queueMicrotask(()=>e()));const i=document.createElement("ha-panel-config");e.appendChild(i),await i.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await ye}finally{we=!1,ye=null}};const $e=async()=>{var e,t,i,s,a,n,o;if(customElements.get("ha-yaml-editor"))return;const r=document.createElement("partial-panel-resolver").getRoutes([{component_name:"developer-tools",url_path:"a"}]);await(null===(i=null===(t=null===(e=null==r?void 0:r.routes)||void 0===e?void 0:e.a)||void 0===t?void 0:t.load)||void 0===i?void 0:i.call(t));const l=document.createElement("developer-tools-router");await(null===(o=null===(n=null===(a=null===(s=null==l?void 0:l.routerOptions)||void 0===s?void 0:s.routes)||void 0===a?void 0:a.service)||void 0===n?void 0:n.load)||void 0===o?void 0:o.call(n))};var xe={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds",minutes:"min",hours:"h"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"water balance",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."},modes:{manual:"Manual",standard:"Standard",advanced:"Advanced"}},ke={"default-zone":"Default zone","default-mapping":"Default sensor group"},ze={calculation:{explanation:{"formatting-note":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values.","module-returned-evapotranspiration-deficiency":"Module returned Crop evapotranspiration deficiency ( = et0 * hour_multiplier * Kc + precipitation) of","module-returned-hourly-evapotranspiration-deficiency":"Module summed the Crop evapotranspiration deficiency hour by hour ( = sum of hourly et0 * Kc + precipitation) over","crop-factor-is":"Crop factor is","bucket-was":"Water balance was","new-bucket-values-is":"New water balance is",bucket:"water balance","old-bucket-variable":"old_water_balance","max-bucket-variable":"max_water_balance",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since water balance < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","precipitation-rate-is":"The precipitation rate is","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since water balance >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum water balance is","drainage-rate-is":"Drainage rate when saturated (water balance at max) is","current-drainage-is":"Current drainage is calculated as","drainage-replayed":"The window was replayed hour by hour, so each rain drained only from the hour it fell. Drainage over","no-drainage":"Current drainage is 0 because","below-irrigation-threshold":"The deficit has not reached this zone's irrigation threshold yet, so no irrigation is necessary and the duration is set to 0. Deficit / threshold:"}}},Se={pyeto:{description:"The full calculation, from your own weather sensors: temperature, humidity, pressure, wind and solar radiation. The most accurate option, and the one that asks for the most."},static:{description:"A fixed amount of evaporation per day, which you set yourself. No sensors and no weather service."},passthrough:{description:"Takes an evapotranspiration figure that already exists, from a sensor or from a weather service that publishes one. The recommended path when you have one."}},Me={setup:{title:"Setup",description:"A guided way to create your first zone. It asks one question at a time, and only the questions your previous answers leave open.",next:"Next",back:"Back",create:"Create it",creating:"Creating...",failed:"Something went wrong and nothing was created. The other tabs are still there if you would rather set it up by hand.",done:"Your zone is ready.",steps:{zone:{question:"What are you watering?",help:"One zone is one valve, watering one area.",name:"Name",size:"Area",throughput:"Throughput","throughput-help":"How much water this zone delivers per minute. Measure it if you can, rather than taking it from a datasheet: it is what every duration is derived from, and it is the quietest way to water twice as long as you meant to.",valve:"Valve","valve-help":"The valve or switch that waters this zone. Without one, the zone is calculated but not watered until you link one in Zones.","valve-help-calculate":"If Smart Irrigation should see when this zone is watered by hand or by your automation, to count that water."},environment:{question:"Where does it grow?",outdoors:"Outdoors","outdoors-help":"Open air. Rain reaches it, and the sky is worth asking about.","under-glass":"Under glass or plastic","under-glass-help":"A greenhouse, a polytunnel, a conservatory. No rain arrives, and a forecast describes weather these plants never see."},weather:{question:"Where should the evaporation figure come from?",service:"The weather service you configured","service-help":"Nothing else to install. Smart Irrigation takes the weather for your location and computes evapotranspiration from it.","no-service-indoors":"A weather service is not offered here: it describes the sky, which these plants are not under.",sensors:"My own weather sensors","sensors-help":"You have sensors for temperature, humidity and the rest. The most accurate option, because it measures where the plants actually are.",et:"A sensor that already reports evapotranspiration","et-help":"Something else already computes it, and Smart Irrigation should use that figure as it stands.",static:"A fixed amount per day","static-help":"No sensors and no service. You give one number and it is used every day. Rough, but it still tracks what you have already watered.","service-help-entity":"The current values and the forecast come from your weather entity, and Smart Irrigation computes evapotranspiration from them. The rain comes from a rain sensor of yours, asked for in the next step."},sensors:{question:"Which entities should it read?",help:"Only the ones the calculation actually uses are asked for.","help-optional":"Fields marked optional can stay empty: missing weather values are estimated, and without a rain sensor no rain is credited.","suggested-note":"Fields marked suggested are filled in from the sensors in your Home Assistant. Check that each is the one you mean.",optional:"optional",suggested:"suggested","lux-hint":"Under glass a light sensor can stand in for solar radiation: pick your illuminance entity here and set its source to Light sensor (lux) afterwards, in the sensor group.","static-question":"How much does it evaporate per day?","static-help":"A depth of water, in the unit your zones use. Somewhere around 4 to 5 mm a day is common for a temperate summer.","static-label":"Evaporation per day","rain-help-entity":"This weather entity only forecasts rain. Pick a sensor that measures rain for one of these fields: a rate or a gauge total. No rain sensor? Use Open-Meteo instead."},review:{question:"Ready to create",zone:"Zone",program:"Watered by","new-program":"A new program",environment:"Environment",engine:"Module",sources:"Sources","from-the-service":"from the weather service","no-sensor":"no sensor",help:"This creates a sensor group and a zone, exactly as the other tabs would. Nothing is locked afterwards.",mode:"Smart Irrigation","no-valve":"none"},mode:{question:"What should Smart Irrigation do?","water-help":"It works out what each zone needs and opens the valves itself, with a program that waters your zones, done by sunrise. You can change its schedule afterwards.","calculate-help":"It works out what each zone needs; your automation, Irrigation Unlimited or your controller opens the valves."}},step:"step","done-note-zone":"It appears under Zones, with its sensor group under Sensor groups. Nothing here is special: edit either of them as you would any other.","done-next-static":"With a fixed amount per day it needs no readings: the next calculation works out what it is short of.","done-next-service":"Its weather comes from the weather service, its duration with the first calculation. Calculate now fetches the weather and calculates the zone at once.","done-next-sensors":"Its duration comes with the first calculation. Calculate now reads your sensors and calculates the zone at once.","calc-now":"Calculate now","calc-duration":"Calculated: it waters {duration} at the next start.","calc-nothing":"Calculated: it is not short of water yet.","calc-failed":"The calculation did not work. The zone says why under Zones.","open-zone":"Open the zone",another:"Set up another zone","done-next-added":"It is now the last step of {program}, which waters it at its schedules. You find it under Watering.","done-next-new-program":"A new program, {program}, waters it every day, done by sunrise. You find it under Watering.","new-program-name":"Watering","done-next-no-valve":"Link it to a valve in Zones so that it is watered."},weatherservice:{history:{title:"History",refresh:"Refresh","last-update":"Last update",time:"Retrieved","sensor-group":"Sensor group","no-data":"No data has been retrieved from the weather service yet."},title:"Weather service",description:"View and change the weather service used to fetch weather data, with no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key","ha-weather-entity":"A weather entity in Home Assistant","weather-entity":"Weather entity"},actions:{save:"Save",saving:"Saving…","open-sensor-groups":"Open sensor groups"},messages:{"no-service":"No weather service is used: weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately.","owm-onecall-hint":"OpenWeatherMap needs the One Call API 3.0 plan (One Call by Call). It is free up to 1000 calls/day but must be activated with a card, and a new key can take up to a couple of hours to work. A plain default key is rejected.","ha-entity-hint":"Current values and the forecast come from this entity, solar radiation and reference ET from Open-Meteo. It only forecasts rain: give each sensor group a rain sensor under Current precipitation.","rain-groups-on-service":"{count, plural, one {# sensor group still takes its} other {# sensor groups still take their}} rain from the weather service, which reports none: {groups}. Choose a rain sensor under Current precipitation, or the zones are watered after every shower.","reload-note-entity":"Saving checks that the entity exists and applies the change immediately.","invalid-entity":"Choose a weather entity: this one does not exist any more, or is not a weather entity."}},backuprestore:{title:"Backup / restore",description:"Export the full Smart Irrigation configuration to a JSON file, or restore it from a previous backup.",cards:{backup:{title:"Backup",description:"Download the complete configuration (general settings, zones, modules and sensor groups) as a JSON file."},restore:{title:"Restore",description:"Load a previously exported JSON file to replace the current configuration."}},actions:{export:"Export to JSON","choose-file":"Choose a backup file…",restore:"Restore this backup",restoring:"Restoring…"},messages:{exported:"Backup file downloaded.",restored:"Configuration restored: reloading the integration.","invalid-file":"This file is not a valid Smart Irrigation backup.","confirm-title":"Replace the entire configuration?",summary:"This backup contains","confirm-warning":"Restoring overwrites all current general settings, zones, modules and sensor groups. This cannot be undone.","reload-note":"Restoring replaces everything and reloads the integration to apply the change."}},general:{cards:{"automatic-duration-calculation":{header:"Calculating the watering duration",description:"Each zone's watering time comes from its water balance: what the weather took from the soil, minus the rain. Here you choose when it is worked out.",labels:{"calc-when":"Watering duration calculated","calc-when-time":"At a fixed time","calc-when-start":"Just before each start","calc-when-manual":"Only when I ask","calc-when-hint":"Just before each start: when a program or the start event begins, with the freshest weather; the right choice when Smart Irrigation starts the watering. At a fixed time: every day at the time below, when something else starts the watering and reads the durations when it wants. Only when I ask: nothing is calculated on its own, use the calculation buttons or the actions. Just before each start keeps the daily calculation at the time below too, so the water balance moves between two starts.","calc-when-start-event":"Just before the start event","calc-when-hint-calc-only":"Just before the start event: when the start trigger fires, with the freshest weather, so whatever waters on that event gets up-to-date durations. At a fixed time: every day at the time below, when your own automation or controller reads the durations whenever it wants. Only when I ask: nothing is calculated on its own, use the calculation buttons or the actions. Just before the start event keeps the daily calculation at the time below too, so the water balance moves between two events.","calc-time":"Calculate at","calc-time-hint":"The daily calculation: the water lost is added to the water balance of each zone and the watering durations are set.","hourly-calculation":"Calculate evapotranspiration hour by hour","hourly-calculation-hint":"Adds up the FAO-56 hourly equation for each hour since the last calculation, instead of the daily one on averages, which hide whether sun and heat came together. Worth it when readings arrive through the day. New installs start on it; older ones keep the daily one until you switch."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone water balances and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Read the weather every","auto-update-delay":"Delay before the first update"},options:{minutes:"minutes",hours:"hours",days:"days"}},continuousupdates:{header:"Continuous updates for all sensor groups",description:"For every sensor group below: records each change of a group's sensors, not one reading per update, so the hourly calculation and the rain get finer data. Zones are still calculated on schedule, not at each change. A weather service in the group is still read once per update: no extra requests.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}},"panel-mode":{labels:{advanced:"Advanced settings","advanced-hint":"Shows the settings that tune the model: drainage, thresholds, multiplier, how far ahead a zone looks. They have sound defaults; leave this off unless you know you need them. Your values are kept either way."}},"setup-assistant":{description:"Four questions at most, and it creates a sensor group and a zone for you, choosing what each needs. For a first zone, another one, or a fresh start.",open:"Open the assistant"},"iu-import":{description:"Moving over from Irrigation Unlimited? Bring its zones, sequences and schedules here, with a preview of everything first.",open:"Import"},"master-switch":{title:"Smart Irrigation",mode:"What Smart Irrigation does","mode-water":"Calculate and water","mode-calculate":"Calculate only","mode-off":"Stop everything","off-note":"Switched off: nothing is calculated and nothing is watered. The weather readings carry on, and the time it is off will not be counted when it is switched on again.","calculate-note":"Calculating only: Smart Irrigation works out the water balances and the durations and fires its start event, but opens no valve. Your own automation, Irrigation Unlimited or your controller does the watering with those durations.","confirm-off":"Switch Smart Irrigation off? Whatever is watering stops now, and nothing is calculated or watered until it is switched on again.","confirm-calculate":"Calculate only? Smart Irrigation stops opening the valves: whatever it is watering stops now, and from now on your own automation does the watering with its durations.","water-note":"Calculating and watering: Smart Irrigation works out what each zone needs and opens the valves itself, with its programs. Each program waters the zones of its steps at its schedules."}},title:"General",sections:{calculation:"Calculation",control:"Control",system:"System","calculation-sub":"How much each zone needs, and when it is worked out.","control-sub":"What opens the valves, and what starts a run.","system-sub":"The panel, the blueprints, the setup assistant and moving over from Irrigation Unlimited."}},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"},translate:{title:"Help translate",text:"Apart from English and French, the translations of this panel were machine-made and nobody who speaks the language has checked them yet. If a word or a sentence reads oddly in yours, you can correct it in your browser, with no technical knowledge needed.",link:"Translate on Weblate"}}},info:{title:"Info","configuration-not-available":"Configuration not available.",cards:{"next-run":{title:"Next run",labels:{start:"Starts",duration:"Total duration",zones:"Zones watering",trigger:"Trigger",calculation:"Calculation","no-valve":"No valve linked, so not watered"},"no-start":"No start time could be worked out yet.","nothing-to-water":"Nothing to water: no zone has reached its irrigation threshold.","trigger-default":"Default, finishing at sunrise","calc-daily":"daily at {time}","calc-before-start":"just before each start","calc-manual":"only when you ask","program-schedules":"Started by the programs' schedules","accounts-for-duration":"counted back so the run finishes then","starts-at-trigger":"starts at that moment","sequencing-sequential":"one zone at a time, so the total is every zone added up",estimated:"Estimated: the zones are calculated again just before the start.","sequencing-parallel":"all zones at once, so the total is the longest zone","headline-nothing":"Nothing to water","sub-nothing":"No zone is short enough of water yet. The next start would be {start}.","headline-not-calculated":"Not calculated yet","sub-not-calculated":"The zones have no duration until their first calculation, {when}. Calculate all zones under Zones to do it now.","headline-watering":"Watering {start}","headline-watering-soon":"Watering at the next start","sub-watering":"{count} zones, {duration} in all.","headline-postponed":"Watering is held back","sub-postponed":"You postponed it. It resumes by itself, and nothing is lost: a zone that is short of water still is.","headline-skipped":"No watering today","headline-not-scheduled":"A run is owed, and nothing is scheduled to start it","sub-not-scheduled":"The time above is when it would start. No start trigger is armed right now, which happens when the active trigger is disabled or was not registered. Check the trigger under Settings, and if it looks right, a calculation re-arms it.","headline-no-trigger":"No trigger is active","sub-no-trigger":"Smart Irrigation starts no watering. Choose a start trigger in the settings to have it water.","headline-no-valve":"Nothing will be watered","sub-no-valve":"The zones short of water have no valve linked, so they aren't watered. Link one to each of them.","headline-no-zones":"No zone yet","sub-no-zones":"Smart Irrigation waters zones. The assistant sets up the first one with you.","headline-off":"Smart Irrigation is switched off","sub-off":"It keeps taking its weather readings, but calculates nothing and waters nothing until it is switched on again.","open-settings":"Open the settings","sub-watering-one":"One zone, {duration}.","next-runs":"Next up","run-waits":"waits for {program}, about {start} to {end}","run-skipped":"expected to be skipped: rain forecast","run-twice":"{zones} watered twice in a row","run-suspended":"suspended until {when}"},decision:{title:"Will it be skipped?","will-run":"Nothing is holding the run back.","will-skip":"The run would be skipped.","preview-note":"Evaluated just now. A forecast can still change before the start.",unavailable:"The skip conditions could not be evaluated.","last-title":"Last real decision","last-none":"No run has been decided yet.","last-skipped":"Skipped","last-ran":"Went ahead","check-precipitation":"Rain forecast","check-days_between":"Days between irrigation","state-off":"Off","state-unavailable":"Could not be checked","state-passing":"Not blocking","state-blocking":"Blocking","detail-forecast":"Forecast","detail-expected":"To expect (weighted by probability)","detail-anyway-deficit":"Goes ahead anyway: a zone that would water is {deficit} mm short, more than twice the rain to expect.","detail-anyway-skips":"Goes ahead anyway: the forecast already held the run back {days} days in a row.","detail-threshold":"Threshold","detail-days-since":"Days since last run","detail-days-required":"Days required","check-rain_sensor":"Rain sensor","check-freeze":"Freeze","check-wind":"Wind","check-soil_moisture":"Soil moisture","detail-now":"Now","detail-tonight":"Tonight (forecast low)","detail-weather-service":"weather service","detail-raining":"It is raining","detail-dry":"Not raining","detail-held":"sits out this run","check-postponed":"Postponed by you","title-next":"Will the next run be skipped?"},estimate:{title:"Where each zone stands now",note:"Estimated by running the calculation on the readings collected since it last ran. Nothing is committed: a zone keeps the value from its last calculation until the next one.",none:"No zone can be estimated yet.",labels:{now:"Now","at-last-calculation":"At last calculation","would-water":"Would water","last-irrigation":"Last watered"},nothing:"nothing","never-watered":"never","no-valve":"nothing, no valve linked"},postpone:{prompt:"Rain the forecast missed, or a reason of your own?","for-24":"Hold for 24 h","for-48":"Hold for 48 h",until:"Watering is held back until",resume:"Resume now"},forecast:{today:"Today"},stale:{title:"A zone is no longer being calculated",body:"Its water need is older than the others, so it is watering on old weather. Check that its sensor group still receives data, and look at the log for what the calculation said about it.",never:"never calculated"},running:{headline:"Watering now","headline-paused":"Watering paused","paused-until":"Until {when}, then it goes on by itself.",left:"{time} left ({percent} %)",program:"Program",step:"step {step}/{steps}","program-left":"{time} left","headline-soaking":"Soaking between two passes","headline-starting":"Watering is starting",pass:"pass {pass} of {passes}","at-most":"at most {volume}",soaking:"soaking, next pass at {when} ({pass} of {passes})",starting:"waiting for {supply} to come up",then:"Then: {names}, waiting for their turn"}},gaps:{auto_calc_off:{title:"No watering duration is being calculated",body:'The watering duration is set to "Only when I ask", so the zones\' durations never update by themselves. Choose "At a fixed time" or "Just before each start" under Settings, or calculate by hand when you want a run.'},no_automatic_zone:{title:"No zone waters on its own",body:"Every zone is manual or disabled, so a start reaches nothing. Set a zone to automatic for it to be watered by the schedule."},no_valve_path:{title:"Nothing here opens a valve",body:'Smart Irrigation calculates how long to water; something has to act on it. Either choose "Calculate and water" under Settings and link a valve to each zone, or write an automation on the start event (the blueprints do this for you). If an automation already does it, there is nothing to change.',action:"To valve control"}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group",cancel:"Cancel"},header:"Add sensor group"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},hidden_sources:"{n} reading(s) not asked: the evapotranspiration is given ready-made, they would only serve to recalculate it.",et_ignored:"Calculated from the weather, so they do not read this evapotranspiration: {zones}. Set them to provided by a sensor or a service on the zone.",et_missing:"Expecting a ready-made evapotranspiration: {zones}. Choose a source for it above.",et_unused:"Not used: every zone of this group is calculated by Smart Irrigation, which works the evapotranspiration out from the other readings. Set a zone to provided by a sensor or a service to give a ready-made value here.",et_needed:"A ready-made value is needed here: the zones of this group are set to provided by a sensor or a service, so None is not offered.",hints:{temperature:"Air temperature, in the shade. The day's minimum and maximum are taken from it.",dewpoint:"The temperature at which the air would be saturated, which tells how much vapour it holds. The weather service is fine here.",humidity:"Relative humidity of the air. Dry air draws more water out of the plants.",pressure:"Atmospheric pressure. It changes the result very little: the weather service is enough.",windspeed:"Wind carries the humidity away from the leaves. Under glass, set a fixed value near 0.","solar radiation":"The energy of the sun, the main driver of evaporation. Without it the calculation estimates it from the day's temperature range. Under glass, use a radiation sensor or a light sensor.",precipitation:"Rain that fell, as a total, from a rain gauge of your own that adds up. With a weather service, leave it on None.","current precipitation":"Rain falling now, as a rate. The weather service provides it; a rain sensor of your own is more precise.",evapotranspiration:"The water the plants lost (ET0), already calculated by your sensor or service. Read only by zones set to provided by a sensor or service; a zone Smart Irrigation calculates takes the weather inputs instead."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-use-the":"How the readings are combined","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",none_et:"None (Smart Irrigation calculates it)",none_estimated:"None (estimated)",weather_service:"Weather service",weather_service_et:"Ready-made ET₀ from the weather service",sensor:"Sensor",static:"Static value",radiation_sensor:"Radiation sensor",illuminance:"Light sensor (lux)"},greenhouse:"Greenhouse",greenhouse_description:"Under glass or plastic: a greenhouse, a polytunnel. No rain reaches it, so precipitation is left out and its fields are hidden. Set two things yourself: Wind speed to a static value near 0, as the calculation assumes open air, and a light sensor for Solar radiation, as the glazing filters the sky.",wind_height:"Anemometer height (empty: taken at 2 m)",rain_not_from_entity:"The weather entity reports no rain that fell, only a forecast: choose a rain sensor here, or the zones are watered after every shower.",rain_hint_entity:"Rain falling now, as a rate. The weather entity only forecasts it: choose a sensor that measures rain."}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name","show-more":"{count, plural, one {Show # more sensor group} other {Show # more sensor groups}}"},no_items:"There are no sensor group defined yet.",title:"Sensor groups","weather-records":{title:"Weather records (last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"},summary:{"sources-one":"{n} source","sources-other":"{n} sources","zones-one":"{n} zone","zones-other":"{n} zones"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset water balance","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar",water:"Water",calculating:"Calculating…",change:"Change",done:"Done"},cards:{"add-zone":{actions:{add:"Add zone",assistant:"Set it up with the assistant",cancel:"Cancel"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all water balances","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones","reset-hint":"These two discard data of every zone. Each asks first."}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Water balance","et-deficiency":"Daily ET deficiency",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Crop factor (Kc)",name:"Name","input-method":"Input method","input-methods":{throughput:"Throughput & area",direct:"Precipitation rate"},"input-method-hint":"How the water delivered is known: from the area and the flow of the zone, or directly as a precipitation rate if you have measured it.","state-hint":"Automatic: Smart Irrigation calculates the duration from the water balance and waters at the start. Manual: it waters the duration you set, at every start. Disabled: never watered, and its balance is not followed.","mapping-hint":"The group of sensors this zone reads its weather from: a weather service, your own sensors, or both.","bucket-hint":"The water balance of the zone. Negative: it is short of water. Zero: it has what it needs. Watering brings it back to zero.","maximum-bucket-hint":"The most water the soil is taken to hold. A positive balance never goes above it: the surplus is lost.","irrigation-threshold-hint":"The deficit from which the zone is watered. Under it, the zone is left alone and the deficit rolls over to the next calculation.","drainage_rate-hint":"How fast the soil lets surplus water go. Leave the default if you do not know your soil: 0 means the surplus never drains.","precipitation-rate":"Precipitation rate",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum water balance",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate","linked-entity":"Linked valve/switch","linked-entity-hint":'The valve or switch that waters this zone. With "Calculate and water", Smart Irrigation opens and closes it. With observed watering, every run of it (by hand, an automation or Smart Irrigation) credits the water balance from run time and throughput.',"valve-off":"A valve can be linked once Smart Irrigation waters (Calculate and water) or observed watering is on.","valve-off-link":"Turn on",supply:"Pump or main valve","supply-none":"None","measured-flow-help":"Over several runs the zone's flow meter measured a flow that differs from the one set above. It is advice, never applied on its own.","use-measured-flow":"Use the measured flow","extra-valves":"Other valves of the zone","extra-valves-hint":"opened and closed together with it","flow-sensor":"Cumulative volume meter","flow-sensor-hint":"For exact crediting instead of throughput x time: a cumulative water-meter total (state class total_increasing), not an instant flow rate. The unit is read automatically (L, mL, m³, gal, ft³).","observed-ignore-seconds":"Ignore runs up to","observed-ignore-seconds-help":"A run of the valve this long or shorter is not credited: a few minutes to cool the leaves on a hot afternoon mostly evaporates. A longer run counts in full. Empty credits every run.","confirm-timeout":"Wait for the valve to confirm","open-resends":"Send the open again","confirm-timeout-help":"How long the valve has to report that it opened or closed, and how often the open is resent meanwhile. Empty: 30 s and two resends; closing 5 s, always tried twice. Cloud valves such as Gardena: wait longer, 0 resends, each command counts against a quota.","safety-off-topic":"Safety off MQTT topic","safety-off-state-key":"Safety off state key","safety-off-mode":"Safety off mode","safety-off-mode-auto":"Automatic (MQTT topic, or a Sonoff SWV on ZHA)","safety-off-mode-zha":"ZHA timed off","safety-off-mode-off":"Off (no dead-man)","safety-off-mode-help":"Automatic: the MQTT topic above if set, or a Sonoff SWV on ZHA. ZHA timed off: any ZHA valve, with the standard timed-off command, untested beyond the SWV. Off: no hardware dead-man for this zone.","safety-off-required":"If the valve's own timer can't be set","safety-off-required-open":"Water all the same","safety-off-required-skip":"Leave the valve shut","safety-off-required-help":"Each watering gives the valve its own timer, so it still closes by itself if Home Assistant stops mid-run. When that fails (the valve asleep, MQTT down), it waters all the same by default, without that safety net. Leave the valve shut to skip the watering instead: the zone reports the problem, and the water it is owed is carried over to the next watering.","safety-off-topic-help":'Optional hardware dead-man: the valve device\'s MQTT set topic (e.g. zigbee2mqtt/my_valve/set). Smart Irrigation sends "on with timed off", so the device closes by itself if Home Assistant stops mid-run. State key: "state" or "state_l1"…"state_l4". Needs on_time in its firmware: test it.',optional:"optional","irrigation-threshold":"Irrigation threshold",days:"days","days-between-irrigation":"Days between irrigation","crop-factor-by-month":"Crop factor by month","crop-factor-by-month-help":"For a crop whose water use follows its growth: the crop factor (Kc) of each month, January first. A month left empty uses the crop factor above, and all twelve empty is that crop factor all year. Seasonal adjustments still apply on top.",months:{1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"},"available-water":"Available water","allowed-depletion":"Allowed depletion","available-water-help":"How much water this zone's soil holds for the plants, in mm: root depth in metres times what the soil holds per metre (FAO-56: sand 50–110, loam 130–180, clay 120–200). The deficit never exceeds it, and past the allowed share (50% by default) the plants draw less. Empty: not used.","distribution-efficiency":"Distribution efficiency","distribution-efficiency-help":"The share of the water from the emitters that reaches the plants, in %. Sprinklers in wind or on a slope lose some, drip almost none. Empty: 100%. At 80% a zone waters 25% longer and credits 80% of what it delivers.","days-between-irrigation-help":"Empty follows the general setting (Weather, Skip watering). A number applies to this zone alone, counted from its last watering: 1 every day if needed, 3 at most every third day, 0 no limit.","soil-moisture-sensor":"Soil moisture sensor","soil-moisture-sensor-hint":"The zone sits out a run while the soil is at or above the threshold. The water balance is kept.","soil-moisture-threshold":"Skip at or above","calculation-method":"Evapotranspiration","calculation-method-help":{from_weather:"From your measurements: temperature, humidity, wind, sun.",provided:"You already have an evapotranspiration in mm; it is taken as it is.",fixed:"So many mm a day, whatever the weather."},"calculation-methods":{from_weather:"Calculated by Smart Irrigation",provided:"Provided by a sensor or a service",fixed:"A fixed amount"},"forecast-days":"Look ahead",coastal:"Coastal site","coastal-help":"Used only when the solar radiation is estimated from the temperature, with no radiation sensor or service: by the sea or a large lake the days are milder, and FAO-56 uses another coefficient there.","forecast-days-help":"0: the zone waters what the weather actually took. 1: tomorrow is taken into account as well, 2: tomorrow and the day after, and so on. The hotter the days ahead, the more is watered today. This is not the rain skip, which is a setting of its own.","fixed-amount":"Evaporation per day","engine-shared-help":"This setting belongs to this zone alone: each zone has its own, and changing it here changes nothing anywhere else.","soil-type":"Soil","plant-type":"What grows here","soil-types":{default:"Not chosen yet: {value}",sand:"Sandy",sandy_loam:"Sandy loam",loam:"Loam",clay_loam:"Clay loam",clay:"Clay",custom:"I set the drainage rate myself"},"plant-types":{default:"Not chosen yet: factor {value}",lawn:"Lawn",vegetables:"Vegetables",flowers:"Flowers",shrubs:"Shrubs",hedge:"Hedge",fruit_trees:"Fruit trees",vines:"Vines",ground_cover:"Ground cover",custom:"I set the crop factor myself"},"duration-readonly-automatic":"Calculated for you: this zone's run comes from its water balance. Set it to manual to type a duration yourself.","duration-readonly-disabled":"A disabled zone is never watered, so it has no run time.","et-deficiency-help":"What this zone needs per day: ETc, ET0 times the crop factor with the seasonal adjustment, before rain and before scaling to the interval, so it compares across setups. ET0 alone is the zone sensor's `eto` attribute, to check against a weather service.","safety-off-entity":"Valve's own duration","safety-off-entity-help":'For a valve that closes by itself after a duration of its own, such as Gardena (its "watering duration" number, 1 min unless changed): pick that number here. Before each open, Smart Irrigation writes the pass\'s length plus 30 s to it, so the valve stays open for the whole pass and still closes by itself if Home Assistant stops. Without it, such a valve closes after its preset time.',yaml_only_item:"{label}: {value}"},no_items:"There are no zones defined yet.",title:"Zones","module-comes-from-the-group":"The module comes from this zone's sensor group. Change it there, and every zone using that group follows.",status:{estimate:"Short by {short}: about {duration} ({volume}) at the next calculation.","estimate-ahead":"About {duration} ({volume}) at the next calculation.","will-water":"Will water {duration} at the next start.",idle:"Nothing to water: {short} short.",satisfied:"Nothing to water: this zone has what it needs.","under-threshold":"Nothing to water yet: {short} short, under this zone's threshold.","not-calculated":"Not calculated yet: that happens {when}.",manual:"Waters the duration you set, at every start.",disabled:"Disabled: never watered, and its balance is not kept.",threshold:"threshold",problem:{no_sensor_group:"Cannot be calculated: it has no sensor group. Choose one on this card; not watered until then.",no_readings:"Cannot be calculated: its sensor group has no readings. Not watered until it has.",no_engine:"Cannot be calculated: it has no module. Not watered until it has one.",nothing_from_engine:"Cannot be calculated: its sensor group gives no evapotranspiration. Not watered until it does.",forecast_without_service:"Cannot be calculated: its module looks ahead, and no weather service is set up. Not watered.",error:"Cannot be calculated: {detail}. Not watered until it can be."},"no-valve":"No valve linked, so this zone isn't watered.","no-valve-action":"Link a valve",running:"Watering now, {time} left.","running-paused":"Watering paused, {time} left.","set-aside":"Set aside after {count} failed runs in a row: not watered until it is put back.","put-back":"Put back"},calendar:{title:"Watering calendar (12 months, estimated)",caveat:"A planning estimate, not your weather: the months are modelled from your latitude and a typical seasonal pattern, so a continental summer reads hotter and drier than it is. It influences nothing, calculates nothing and waters nothing.",month:"Month",et:"ET",precipitation:"Precipitation",watering:"Watering","avg-temp":"Avg temp",none:"No watering calendar data available for this zone",error:"Could not generate the calendar"},water:{question:'Water "{name}" now? Its valve opens straight away, or takes its turn if something is watering. The water is counted in its balance.',minutes:"Minutes, empty for the {calculated} of the planning","minutes-none":"Minutes (the calculation has nothing to water)"},"calculation-feedback":{"nothing-new":"{zone}: no new readings since the last calculation, so nothing changed.",failed:"{zone}: the calculation failed ({error})."},sections:{zone:"Zone and valve",need:"What it needs",status:"Where it stands"},yaml:{only_help:"Settings the visual editor does not show. Editing here keeps them.",help:"The zone's settings as text, in the units the panel shows. An optional setting left out is cleared; a required one (name, size...) is kept. Nothing is saved until you apply.",not_a_zone:"This is not a zone: a zone is a set of keys (name, size, throughput...).",not_settings:"Not settings of a zone, or not set here: {keys}",applied:"Zone saved"}},history:{title:"History",description:"Every irrigation run Smart Irrigation has credited to a zone: when it started, how long it watered and how much water it used. Runs are recorded when Smart Irrigation waters and by observed watering, and are kept for 90 days.",refresh:"Refresh","no-data":"No irrigation runs have been recorded yet.",table:{title:"Irrigation runs",start:"Start",zone:"Zone",duration:"Duration",water:"Water used",truncated:"Showing the {count} most recent runs out of {total}.",by_hand:"by hand"},charts:{"total-title":"Total water used per day (last 30 days)","per-zone-title":"Water used per day, per zone (last 30 days)","no-data":"No water was used in this period."}},groups:{home:"Home",zones:"Zones",data:"Weather",settings:"Settings",watering:"Watering"},planning:{title:"Planning"},programs:{title:"Programs"},supplies:{title:"Pumps and valves"},iu_import:{title:"Import from Irrigation Unlimited",description:"Brings your Irrigation Unlimited configuration over: its zones, sequences and schedules become zones, programs and their schedules here. You see everything before anything is changed, and nothing waters until you switch the schedules on.",loading:"Looking for an Irrigation Unlimited configuration…",step:"Step",back:"Back",next:"Next",import:"Import",importing:"Importing…",source:{question:"Which configuration?",help:"Smart Irrigation reads the configuration Home Assistant loads, or the one Irrigation Unlimited's own dialogs keep. You can also paste its YAML.","yaml-help":"The irrigation_unlimited section Home Assistant loads, with its packages, !include and !secret.","entry-help":"What Irrigation Unlimited's own dialogs keep.","none-found":"No Irrigation Unlimited configuration was found. If Irrigation Unlimited is no longer installed and its configuration was in a package, Home Assistant does not load it: paste it below.",paste:"Paste YAML","paste-help":"The irrigation_unlimited section, or what is under it. !include, !secret and !env_var are not followed here: write those values out, or import from configuration.yaml.",previous:"Imported before on {at}. Importing again updates what that import made.",unreadable:"Home Assistant could not read it:"},zones:{question:"What becomes of each zone?",help:"An Irrigation Unlimited zone becomes one of your zones, or a new one. An existing zone keeps its settings and calculation: only what it lacks is filled in.",none:"This configuration has no zones.",links:"{count, plural, one {# adjust-time automation feeds Irrigation Unlimited from Smart Irrigation: that step is calculated here.} other {# adjust-time automations feed Irrigation Unlimited from Smart Irrigation: those steps are calculated here.}}",becomes:"What {zone} becomes",new:"A new zone",creates:"A new zone is created, with its valve and pump.",uses:"Becomes {zone}: {reason}.",reason:{valve:"same valve",blueprint:"an adjust-time automation feeds it from this zone",name:"same name",imported:"made by the earlier import",chosen:"your choice"},fills:"Filled in:",fields:{linked_entity:"valve",supply_id:"pump",extra_entities:"more valves",confirm_timeout:"confirmation wait (s)",open_resends:"resends",flow_sensor:"flow sensor"},left:"No longer in Irrigation Unlimited, left as they are: {zones}."},programs:{question:"The programs",help:"Each sequence becomes a program, and so does a zone with schedules of its own. A sequence whose schedules have different durations becomes one program per duration.",none:"This configuration has no schedules to bring over.",action:{create:"new",update:"updated"},calculated:"calculated",passes:"{count} passes","step-off":"off","no-schedules":"No schedule.","schedules-off":"Its schedules are switched off until you switch them on.","schedules-stay-on":"You switched its schedules on: they stay as they are.",removed:"No longer in Irrigation Unlimited, removed: {programs}."},supplies:{title:"Pumps and main valves",create:"New: {name} ({entities}).",update:"Updated: {name} ({entities}).",removed:"No longer in Irrigation Unlimited, removed: {supplies}."},schedule:{sunrise:"Sunrise",sunset:"Sunset","done-by":"done by {time}",every:"every {count} days",odd:"odd days",even:"even days","days-of-month":"day {days} of the month",last:"last","off-in-iu":"off in Irrigation Unlimited"},report:{question:"What does not come over exactly",help:"Every option of Irrigation Unlimited has a rule. These are the ones that are approximated or left out; everything else comes over as it is.","all-carried":"Everything comes over as it is.",outcome:{not_carried:"Not carried over",unknown:"Not known to the import",approximated:"Approximated"},"summary-title":"What the import does",summary:{zones:"Zones: {created} new, {filled} filled in, {used} used as they are",programs:"Programs: {created} new, {updated} updated, {removed} removed",supplies:"Pumps and main valves: {created} new, {updated} updated, {removed} removed"},"nothing-waters":"Nothing is watered by the import. Irrigation Unlimited keeps watering until you switch it off and these schedules on.",blocked:"Resolve what is marked in red first; until then nothing can be imported.","full-controller-off":'Smart Irrigation is not set to "Calculate and water": the programs are imported, but they only water once it is.',"nothing-waters-iu-off":"The import waters nothing, and Irrigation Unlimited is not running: Home Assistant did not set it up (see its log). Nothing waters until you switch these schedules on."},errors:{generic:"The import did not go through.",changed:"The configuration or your zones changed since this preview. Here is what the import would do now: look again, then import.",no_source:"No Irrigation Unlimited configuration was found. Paste its YAML.",yaml_unreadable:"Home Assistant could not read its configuration.",yaml_invalid:"The pasted YAML could not be read.",yaml_missing:"Paste the YAML to import.",yaml_not_iu:"The pasted YAML is not an Irrigation Unlimited configuration.",unknown_zone:"That zone does not exist any more.",zone_not_created:"A zone could not be created.",not_ready:"Smart Irrigation is not ready yet.",conflicts:"Resolve what is marked in red first.",too_big:"This is far larger than an Irrigation Unlimited configuration, so it is not read.",not_finite:"The configuration holds an infinite value or one that is not a number (.inf or .nan), which Irrigation Unlimited does not have."},done:{title:"Imported.",zones:"Zones: {created} new, {updated} filled in",programs:"{count, plural, one {# program} other {# programs}}",next:"The schedules of new programs are off, so Irrigation Unlimited is still the one watering. Look at the programs, then switch over at the top of this page.","open-programs":"Open the programs","next-off":'Smart Irrigation is not set to "Calculate and water", so these programs do not water yet, and Irrigation Unlimited goes on watering. Choose "Calculate and water" in the settings, then switch over at the top of this page.',"open-settings":"Open the settings","next-iu-off":"The schedules of new programs are off, and Irrigation Unlimited is not running: nothing waters for now. Look at the programs, then switch their schedules on.","next-off-iu-off":'Smart Irrigation is not set to "Calculate and water", so these programs do not water yet, and Irrigation Unlimited is not running: nothing waters for now. Choose "Calculate and water" in the settings, then switch the programs\' schedules on.'},conflicts:{zone_twice:"{zone} and {other} would both become {target}. Choose another zone for one of them.",calculated_needs_zone:"{zone} is calculated by Smart Irrigation today, from the zone an adjust-time automation feeds it from. Choose that zone or another existing one.",program_exists:'A program "{name}" ({id}) is in the way: no import made it. Rename or delete it first, in Watering, Programs (once "Calculate and water" is chosen).',supply_exists:'A pump "{name}" ({id}) is in the way: no import made it. Rename or delete it first, in Watering, Pumps and valves (once "Calculate and water" is chosen).'},confirm_remove:"This import deletes what an earlier import made and Irrigation Unlimited no longer has: {names}. Go ahead?",cutover:{title:"Who waters: Irrigation Unlimited or Smart Irrigation","iu-waters":"Irrigation Unlimited waters. The imported schedules are off until you switch over.","si-waters":"Smart Irrigation waters since {at}. Irrigation Unlimited's controllers are off.","si-waters-now":"Smart Irrigation waters: imported schedules are on, and Irrigation Unlimited's controllers are off.","nobody-waters":"Nothing waters: Irrigation Unlimited's controllers are off, and so are the imported schedules.","both-on":"Both would water: Irrigation Unlimited has a controller on, and imported schedules are on too. Switch Irrigation Unlimited off, or the schedules.","full-controller-off":'Smart Irrigation is not set to "Calculate and water": choose it in the settings first, or the imported programs do not water.',programs:"The imported programs","schedules-on":"{on} of {count} schedules on","open-programs":"Look at them on the Programs page before you switch over","open-programs-after":"Open the programs","zones-off":"Irrigation Unlimited has these zones switched off and leaves them out of its sequences; here they water with their program: {list}. Switch their step off in the program if they should stay dry.",controllers:"Irrigation Unlimited's controllers","iu-not-running":"Irrigation Unlimited is not running: there is nothing to switch off.","no-controllers":"None found.",on:"on",off:"off",unknown:"unknown",over:"Switch over to Smart Irrigation",back:"Go back to Irrigation Unlimited","iu-off-again":"Switch Irrigation Unlimited off again","confirm-over":"Irrigation Unlimited's controllers are switched off, and the schedules Irrigation Unlimited had on are switched on here. From the next schedule on, Smart Irrigation waters. You can go back at any time.","confirm-back":"The imported schedules are switched off, and Irrigation Unlimited's controllers on again. Irrigation Unlimited waters again.",errors:{generic:"That did not work.",full_controller_off:'Choose "Calculate and water" first: without it, nothing waters.',not_imported:"Nothing has been imported yet.",iu_failed:"Irrigation Unlimited did not take the switch. What this step had changed is undone: see above who waters.",not_switched:"The watering has not been handed to Smart Irrigation, so there is nothing to go back from.",iu_not_running:"Irrigation Unlimited is not running: it could not water again. Start it first."},"follow-ups":{title:"What still uses Irrigation Unlimited",help:"These automations and scripts name Irrigation Unlimited's services or entities. Once you have switched over, change or remove them: nothing is changed for you.",none:"No automation or script uses Irrigation Unlimited.",automation:"automation",script:"script",edit:"Edit","adjust-time":"Hands Irrigation Unlimited a duration Smart Irrigation calculated. After the switch it has nothing to do: the imported steps are calculated here. Remove it.",uses:"Uses {uses}."},"left-off":"Left off, as Irrigation Unlimited had them switched off: {names}.",unrecorded:"Left off, as the import has no record of which of their schedules Irrigation Unlimited had on: {names}. Switch their schedules on yourself, or go back to Irrigation Unlimited, import again (it records them) and switch over again."},notes:{blueprint_zone_gone:"a blueprint automation feeds it from zone {zone}, which does not exist any more: it is not taken as calculated",calculated_schedule_durations:"calculated durations: the durations of the schedules are not used",check_back_partial:"wait {wait, number} s with {resends, plural, one {# resend} other {# resends}}; {lost} not carried",check_back_states:"IU does not check this valve; Smart Irrigation always confirms it",cron_days_both:"cron {cron}: days of the month and of the week together",cron_expanded:"cron {cron} became {count, plural, one {# time schedule} other {# time schedules}}",cron_fields:"cron {cron}: a cron expression has five fields",cron_not_carried:"cron {cron} is not carried",cron_too_many:"cron {cron}: more than {max, number} times a day",cron_unreadable:"cron {cron}: this cron expression cannot be read",different_bounds:"its zones have different bounds; all of them water the longest time",every_limit:"every {every, number} days: Smart Irrigation goes up to {max, number}",every_not_number:"{value} is not a number of days",feeds_other_zone:"an automation feeds it from zone {from}, but it is matched to zone {to}: its calculated duration is that zone's",full_controller_off:'Smart Irrigation is not set to "Calculate and water": the programs are imported, but they water only once it is',held_to_limit:"{seconds, number} s is held to {limit, number} s, the most Smart Irrigation allows",lead_kept:"{time} is kept: moving it earlier by the supply's lead of {lead, number} s would change the day",lead_time:'zone "{zone}" has a lead time of {lead, number} s, which Smart Irrigation adds to every fixed run: it waters that much longer than in IU, unless the lead time is set to 0 or the step shortened',no_configuration:"no Irrigation Unlimited configuration",no_step_zone:"no step has a zone",no_time:"no time of day in {value}",no_zone_id:"no zone with zone_id {ref} in this controller",not_litres:"{value} is not a number of litres",not_options:"{value} is not a set of options",off_in_iu_matched:'switched off in IU and matched to "{zone}", which stays as it is: the programs leave it out',offset_limit:"an offset of {offset, number} min: Smart Irrigation allows {max, number}",offset_rounded:"the offset of {seconds, number} s is rounded to {minutes, number} min: Smart Irrigation works in minutes there",shared_queue:"{count} controllers without a master: their programs run one after the other, as zones without a supply share one queue",overlap:"{count} zones and sequences have schedules: where their runs overlap, IU waters them at the same time, Smart Irrigation one after the other",passes_held:"{repeats, number} repeats are held to {max, number} passes",period_needs_both:"the period {from} to {until} needs both days: the schedule runs all year",program_per_duration:"{count} programs, one per schedule duration",rule_entity_states:"Smart Irrigation always sends on and off",rule_master_check_back:"the confirmation of the master; a supply is not confirmed",rule_master_volume:"a meter on the master; Smart Irrigation reads a meter per zone",rule_step_repeat:"passes: each a full IU run, but the wait between them is the soak setting, not the step's delay",rule_step_volume:"the step's maximum litres: a limit on a timed run, not 'until this volume'",rule_threshold:"no 'skip a run shorter than this'; the nearest is a step's minimum deficit, in mm",rule_zone_duration:"IU's default for manual runs; water_zone takes a duration of its own",rule_zone_volume:"the zone's flow sensor; Smart Irrigation reads its unit, IU's scale factors are not used",schedule_name:'the schedule "{name}" keeps no name',seconds_dropped:"{time} is taken as {minute}: Smart Irrigation starts on the minute",sun_event:"{event}: only sunrise and sunset are known",supply_leads_again:"after a wait of {wait, number} s the supply goes off and leads again: the next zone opens up to {lead, number} s later than under IU",supply_stays_on:"{seconds, number} s: the supply stays on until the last zone is done",tags_not_followed:"{tags} is not followed in pasted YAML: those values were read as the text written. Import from configuration.yaml to have them resolved",tours_held:"{repeats, number} repeats are held to {max, number}",unknown_option:"not an option Irrigation Unlimited knows",unknown_values:"{values} is no {option}",unknown_values_off:"{values} is no {option}: the schedule is disabled",wait_held:"a wait of {seconds, number} s is held to {held, number} s",zone_keeps_own:'zone "{zone}" keeps its own {kept}',zone_no_valve:'zone "{zone}" has no valve: it is created, but not watered until one is linked',zone_schedule_duration:"a zone's schedule needs a duration: it is not carried",zone_taken:'zone {zone} already belongs to "{name}": it gets a zone of its own'}},skip:{title:"Skip watering","soil-moisture":"Soil moisture is set per zone, since each zone has its own sensor.","soil-zones":"Soil moisture, set on the zone (skip at or above):","open-zones":"Open the zones"}},Te="Smart Irrigation",Oe={title:"Start triggers",description:"When the watering starts. By default it finishes at sunrise; add a trigger for another moment: sunset, an azimuth or a time, with an offset.",active_label:"Active trigger",active_default:"Default: done by sunrise",active_hint:"Only the selected trigger starts the watering, once a day. Default starts so that every zone is done by sunrise; with None, Smart Irrigation starts nothing.",usage_before:"When a trigger fires, Smart Irrigation emits the event ",usage_after:". React to it in an automation to start watering. Its data carries trigger_name, trigger_type and offset_minutes, to tell the triggers apart. On a day skipped for rain or for the days between irrigation, no event fires.",add_trigger:"Add trigger",edit_trigger:"Edit trigger",delete_trigger:"Delete trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth",time:"Fixed time"},fields:{name:{name:"Trigger name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Before (-) or after (+), in minutes",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."},at:{name:"Time"}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete",help:"When this trigger fires, Smart Irrigation emits the following event. Use it in an automation to start watering. The event data includes this trigger's name (and type/offset), so you can react to it specifically:"},offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number",time_invalid:"Please enter a valid time as HH:MM."},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can create several triggers, but only the one selected as active starts irrigation. The others are kept for later."},active_none:"None",none_selected:"No trigger is active: Smart Irrigation starts no watering, whatever the weather. The durations are still calculated; start the watering yourself or from an automation of your own."},Ae={title:"Seasonal adjustments",description:"A crop factor and threshold that follow the season, for the months and zones you pick; several in one month multiply. The multiplier scales the zone's crop factor (1 no change, 0.5 half the water), the offset adds to its threshold. A zone can also have a crop factor per month.",add:"Add an adjustment",delete:"Delete",new_name:"New adjustment",name:"Name",month_start:"From month",month_end:"To month",multiplier:"Crop factor multiplier",threshold:"Threshold offset",zones:"Zones",zones_hint:"all, or the numbers of the zones, separated by commas."},Ce={title:"Rain forecast",description:"When rain is forecast, Smart Irrigation waters less. This feature requires a weather service to be configured.",threshold_label:"Skip the run from",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation.",effective_rain_label:"Count only rain that reaches the roots",effective_rain_description:"Ignore a shower smaller than a fifth of the evapotranspiration of the period: it wets the leaves and evaporates. It is judged on the whole period between two calculations.",forecast_label:"Take the forecast rain into account",forecast_description:"Below the threshold, each zone gets its deficit less the rain forecast for 24 hours, weighted by its probability: 4 mm forecast against a 10 mm deficit waters 6 mm. At or above it, zones in the open are skipped. Greenhouse zones are not affected.",forecast_no_service:"Needs a weather service: the forecast comes from it.",forecast_no_service_on:"No weather service: there is no forecast to read, so this holds nothing back.",forecast_set_up_service:"Set up a weather service"},He={title:"Location coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Ee={title:"Days between irrigation",description:"The fewest days between two waterings of a zone; 0 is no limit. Lawns do well with short intervals, deep-rooted plants with 3 to 7 days and more water per run; 7 fits a once-a-week watering rule. A zone can set its own.",label:"Minimum days between irrigation",own:"Zones with days of their own:"},De={now:"Watering now",expected_skipped_precipitation:"Expected to be skipped: rain forecast ({mm} mm)",paused:"Paused",paused_until:"Paused until {when}, then the watering goes on by itself.",waiting:"waiting for its turn",step:"step",tour:"round",tours:"rounds",no_valve:"No valve linked, so not watered:",nothing_no_valve:"Nothing to water in this run: the zones short of water have no valve linked:",left:"{time} left",pass_of:"pass {pass} of {passes}",soaking:"soaking, next pass at {when} ({pass} of {passes})",starting:"waiting for {supply} to come up",waits_for:"Waits for {program}: about {start} to {end}.",after_program:"Starts right after {program}.",after_program_offset:"Starts {minutes} min after {program} ends.",watered_twice:"{zones} get their water twice in a row: {program} waters them just before.",expected_skipped_suspended:"Does not run: the program is suspended until {when}"},Ne={title:"Timeline of the run",water:"Watering",fill:"Pipe filling",soak:"Soaking",pass:"pass {n}",total:"Total {time}",nothing:"Nothing to water at the moment: no zone of this program needs water, or none has a valve."},Ie={title:"Programs",description:"A program waters its steps one after the other. A step is one zone, or several watered together, and by default takes the duration Smart Irrigation calculated for it. Programs whose zones share a supply, or have none, never run at the same time: the next one waits its turn. Programs on supplies of their own water side by side.",none_yet:"No program yet. A zone is watered once a program has it in a step: add one with New program.",run_options:"Options for this run",adjust_empty:"Enter a percentage or seconds to adjust the durations.",more_options:"More options",more_options_set:"with more rules",confirm_run:"Run {name} now? Its valves open straight away.",run_started:"{name} has started.",run_queued:"{name} is queued: it starts when what is watering now has finished.",run_nothing:"{name} found nothing to water.",run_failed:"{name} could not start: {error}",name:"Name",step:"Step",step_zones:"Zones",step_zones_help:"Zones ticked in the same step are watered at the same time.",step_duration:"Duration",mode_calculated:"Calculated by Smart Irrigation",mode_percent:"Calculated, times a percentage",mode_fixed:"Fixed",percent:"Percentage of the calculated water",seconds:"Seconds of water",passes:"Water in several passes",step_delay:"Wait after this step",step_delay_help:"Negative: the next step starts that long before this one ends.",tours:"Rounds",tours_help:"The whole list of steps is watered this many times, each round with its share of the water. Unlike passes, which repeat one step before going on, a round lets each zone soak while the others water.",enabled:"Enabled",add_step:"Add a step",delete_step:"Delete the step",add:"New program",all_zones_button_title:"Settings of the Irrigate all zones button",all_zones_now_help:"Only for the Irrigate all zones button: every zone with a valve, in this order, with these passes and pause. The programs keep their own steps.",delete:"Delete the program",schedule:"Schedule",add_schedule:"Add a schedule",delete_schedule:"Delete the schedule",schedule_moment:"When",moment_time:"A time of day",moment_sunrise:"Sunrise",moment_sunset:"Sunset",moment_azimuth:"The sun reaches a bearing",moment_after:"After a program",schedule_after_program:"Program",schedule_after_program_help:"Starts when that program has really watered and finished, by its schedule or by hand: not when the weather held it back, it was suspended, had nothing to water or was stopped. This schedule's days and weather still apply.",after_missing_short:"program not found",after_missing:"The program this schedule waited for is gone: choose another one, or it never starts.",schedule_after_offset:"Minutes after it ends",schedule_after_offset_help:"0: right away. It then takes its turn on its supplies like any run. A start still waiting survives a restart, and is given up when more than two hours late.",schedule_anchor_after_help:"After a program it always starts: the end of a run still to come cannot be aimed at.",after_would_loop:"would loop",summary_after:"after {program}",delete_blocked_after:"{programs} starts after this program: change that schedule before deleting it.",yaml_chain_loop:"These programs would start each other in a loop: {programs}",yaml_unknown_after:"No program by that name or id: {programs}",schedule_time:"Time",schedule_offset:"Before (-) or after (+) the sun",schedule_anchor:"That moment is when the program",anchor_start:"starts",anchor_end:"must be done",schedule_anchor_help:'With "must be done", the program starts early enough, from the length of what it has to water, to finish at that moment.',schedule_weekdays:"Days of the week",schedule_weekdays_help:"None ticked: every day.",schedule_every:"Every",schedule_days:"days",days_count:"{count, plural, one {# day} other {# days}}",schedule_every_offset:"Shifted by",schedule_every_help:"Every 3 days with a shift of 0, 1 or 2 lets three programs take turns, one day in three, never on the same day.",schedule_parity:"Days of the month",parity_even:"Even days",parity_odd:"Odd days",schedule_days_of_month:"Specific days of the month",schedule_days_of_month_help:'Day numbers separated by commas, and "last" for the last day of the month (for example 1, 15, last). A month too short for a day skips it. Empty: any day. It adds to the other filters.',schedule_fallback_time:"If there is no sunrise or sunset",schedule_months:"Months",schedule_months_help:"None ticked: every month.",schedule_from:"From",schedule_until:"Until",schedule_period_help:"A period of the year, which may run over New Year (from November to March). Empty: the whole year.",schedule_weather:"Take the weather into account",schedule_hard_deadline:"Cut the run at the end time",schedule_hard_deadline_help:"The run is cut at the end target: the zones that are open are closed and credited for what they watered, and what did not start is skipped.",condition_postponed:"Postponed days (always on)",condition_rain_sensor:"Rain sensor",condition_freeze:"Frost",condition_wind:"Wind",condition_precipitation:"Rain forecast",condition_days_between:"Days since the last watering",condition_soil_moisture:"Soil moisture",conditions_subset:"Only these weather checks",conditions_pick:"Untick the checks this schedule should ignore, the rain for a greenhouse for example. Postponed days always apply.",schedule_weather_help:"On, the checks of Weather, Skip watering can hold the run back or shorten it: rain, frost, wind, the days between waterings, a wet soil and the days you postponed. Turn it off for a greenhouse drip line that does not care.",pause:"Pause",resume:"Resume",next_step:"Next step",stop:"Stop",confirm_stop:"Stop all watering now? Every valve is closed and the runs under way end.",confirm_delete_program:'Delete the program "{name}", with its steps and schedules?',confirm_delete_step:"Delete this step?",confirm_delete_schedule:"Delete this schedule?",deleted_zone:"(deleted zone)",max_litres:"Volume limit",max_litres_help:"A zone of this step stops once its water meter has counted this volume, in litres or gallons as the panel shows volumes. 0: no limit. The meter reports every so often, so the volume is not exact. A zone without a meter ignores it.",new_program:"Program",run_now:"Run now",run_seconds:"Total duration",run_seconds_help:"Optional. Empty: the planned durations. Otherwise the whole program lasts this long, shared between its steps in proportion to their planned durations.",run_replace:"Replace what is running",run_replace_help:"Off: the program waits for its turn behind what is watering. On: what is watering is stopped cleanly first.",stop_program:"Stop this program",state_running:"Running",state_waiting:"Waiting for its turn",confirm_stop_program:'Stop the program "{name}"? Its open zones are closed, or it leaves the queue if it is waiting.',min_seconds:"Minimum water",max_seconds:"Maximum water",adjust_seconds:"Time added (+) or removed (-)",step_bounds_help:'Applied in this order: the program\'s "Adjust durations" percentage, if one is in force (it is set on the program), the time added or removed, then minimum and maximum (0: none). A step that needs no water stays at zero; the minimum never starts it.',min_deficit_mm:"Only water when the deficit is at least",min_deficit_mm_help:"In mm, 0 to always water. Set, it replaces the zone's own threshold for this step. Fixed-duration steps are always watered.",min_deficit_short:"Minimum deficit",adjust_title:"Adjust durations",adjust_none:"No adjustment in force.",adjust_percent:"Percent",adjust_hours:"Valid for",adjust_help:"Makes this program water longer or shorter for the runs that start after it is set. It replaces the previous adjustment. Hours empty: until it is reset.",adjust_apply:"Apply",adjust_reset:"Reset",confirm_reset_adjustment:"Remove the adjustment of this program?",mode_off:'No program waters: Smart Irrigation is not set to "Calculate and water". Choose it in Settings, General, under "What Smart Irrigation does".',no_zone:"no zone",mode_calculated_short:"calculated",every_day:"every day",anchor_start_short:"starts at",anchor_end_short:"done by",steps_none:"no steps",steps_one:"1 step",steps_many:"{n} steps",schedules_none:"no schedule",schedules_one:"1 schedule",schedules_many:"{n} schedules",no_schedule_on:"no schedule on",steps_title:"Steps",schedules_title:"Schedules",passes_help:"Cycle and soak for this step: its water split into this many passes, each zone soaking between two of them. 1: in a single go.",schedule_fallback_previous:"Use the time of the last one seen",summary_start_sunrise:"starts at sunrise",summary_start_sunset:"starts at sunset",summary_start_azimuth:"starts when the sun is at {deg}°",summary_end_sunrise:"done by sunrise",summary_end_sunset:"done by sunset",summary_end_azimuth:"done when the sun is at {deg}°",last_word:"last",adjust_per_step:"{time} per step",adjust_short:"{what}, until {when}",adjust_short_open:"{what}, until it is reset",adjust_in_force:"In force: {what}.",adjust_set:"Set an adjustment",adjust_change:"Change the adjustment",passes_short:"{n} passes",overlap_short:"starts the next {time} early",wait_short:"waits {time} before the next",soak_shared_help:"One soak time for every step in passes, in every program.",min_over_max:"The minimum is above the maximum: the maximum wins, {max}.",confirm_run_replace:"Run {name} now? What is watering is stopped first, then its valves open.",run_replacing:"What was watering is being stopped; {name} starts straight after.",suspended_until:"Suspended until {when}: its schedules do not start it.",suspended:"suspended",lift_suspension:"Lift",preview_title:"What the next watering would do",preview_help:"Each zone on its own line, with the durations Smart Irrigation would water now. They follow the weather, so a run may differ when it starts.",yaml_back:"Back to the editor",yaml_edit:"Edit in YAML",yaml_only_title:"Set in YAML (not editable here)",hidden_title:"Shown in the advanced mode or in YAML",hidden_help:"Settings this form shows in the advanced mode ({where}) or in YAML. Editing here keeps them.",yaml_only_help:"Settings the visual editor does not show. Editing here keeps them.",yaml_help:"The program as text. A step names its zones by name or by number, and what is left out takes its default. Nothing is saved until you apply: the timeline below shows what the program would do.",yaml_apply:"Apply",yaml_invalid:"This is not valid YAML.",yaml_not_a_program:"This is not a program: a program is a set of keys (name, steps, schedules).",yaml_unknown_zones:"Zone not found, or a name two zones share, left out: {zones}",yaml_not_watered:"Left out of the run (no valve, or disabled): {zones}",yaml_applied:"Program saved",notify_title:"Notifications",notify_help:"Tell someone when this program has watered: a phone, a notification entity, or a notification in Home Assistant. Nothing is sent while no target is ticked. A valve that does not close and a pump that does not answer are told at once.",notify_persistent:"Notification in Home Assistant",notify_when:"When to tell",notify_when_start_and_finish:"At the start and at the end of each watering",notify_when_finish:"At the end of each watering",notify_when_problems:"Only when something goes wrong",notify_none:"Home Assistant has no notification target yet: add the mobile app or a notify integration.",schedule_azimuth:"Sun's bearing",schedule_azimuth_help:"Degrees clockwise from north: 90 east, 180 south, 270 west. For a bed that the shade of a wall or a tree leaves at that moment.",view_flow:"Diagram",view_timeline:"Timeline",yaml_only_item:"{label}: {value}",parity_any:"All",cond_days_between:"at least {n} days",cond_freeze:"at {value} or below",cond_off:"turned off",cond_postponed:"the Postpone buttons of the Home page",cond_precipitation:"from {value} forecast",cond_soil:"{n} zones with a sensor",cond_soil_one:"{n} zone with a sensor",cond_wind:"from {value}"},je={title:"Pumps and main valves",description:"A pump or a main valve in front of the zone valves runs while a zone it feeds is being watered. Pick it in each zone's settings.",name:"Name",entities:"Entities",entities_hint:"separate several with commas",delay_before:"Delay before",delay_before_help:"Positive: the pump or main valve comes on this long before the zone valve opens. Negative: the zone valve opens first, and the pump or main valve comes on this long after.",delay_after:"Delay after",delay_after_help:"Positive: the pump or main valve stays on this long after the zone valve closes. Negative: it goes off this long before the zone valve closes, so a pump never pushes against a closed valve.",add:"Add a pump or main valve",delete:"Delete",confirm_delete:'Delete "{name}"? The zones that use it will no longer have a pump or main valve.',kick_seconds:"Power cut before starting",kick_seconds_help:"For a pump whose pressure controller only starts again after its power has been cut: it is switched off this long, then on, before each start. 0: switched on directly (the default)."},Re={title:"Observed watering (closed loop)",description:"Credits each zone's water balance from real watering, instead of an automation resetting it. Pick a valve or switch per zone under Zones: while it is open, run time times throughput is credited, or the volume a meter measured. Remove set_bucket and reset_bucket calls from your automations, or it counts twice.",enabled_label:"Enable observed watering",confirm_full_controller:"Calculate and water? Smart Irrigation will open the valves and start the watering itself, with its programs. A valve found open at startup that no run of ours owns is closed.",sequencing_label:"Zone sequencing",sequencing:{sequential:"Sequential (one zone at a time)",parallel:"Parallel (all zones at once)"},sequencing_description:"A start trigger that must finish at sunrise works back from it: one after another, from the sum of the run times; all at once, from the longest.",passes_label:"Water in several passes",passes_description:"Cycle and soak: the same water, split into shorter passes with a pause between them, so heavy soil takes it in instead of letting it run off. One pass waters in a single go, which is the default. A run too short to split is left alone.",soak_label:"Soak between passes",pause_between_zones_label:"Pause between zones",pause_between_zones_description:"A wait between two zones of a sequential run: time for the line pressure to recover, or for a slow valve to finish closing before the next one opens.",minutes:"minutes",seconds:"seconds",set_aside_label:"Set a zone aside after this many failed runs",set_aside_description:"A valve that did not open, gave no water or could not have its own timer set this many runs in a row is set aside: no program waters the zone until it is put back, rather than failing every morning. You are told at once (the programs' notifications, a repair in Home Assistant, the zone's problem sensor). It comes back by itself when its valve is seen opening, tried by hand once repaired. 0: never.",leak_label:"Leak alert after",leak_description:"With every valve closed, a zone's volume meter that counts this many litres is told as a leak: the hub's Leak sensor, the event smart_irrigation_leak, a repair and the programs' notifications. Only for a meter that measures the garden alone: a house meter also counts the taps. 0: not watched."},Le={title:"Calculation log",description:"Writes every calculation's full input to a file, to compare two similar days that watered very differently: the sensor group's records and how they were combined, the module's intermediates (radiation, ET0), water balance, duration and volume. Off by default; capped and rotated, so it can stay on.",enabled_label:"Log calculation inputs to a file",file_hint:"Written to config/smart_irrigation/calc_log.jsonl, one JSON record per line. The most recent records are also included in the diagnostics download (coordinates rounded, entity ids removed), so you can attach them to an issue in one step."},Pe={title:"Blueprints",install_label:"Install the example blueprints",install_help:"Smart Irrigation copies its example blueprints into your blueprints folder, each one once: a blueprint you delete is not put back. Switch this off to copy none at all; the ones already there are left as they are."},Ue={title:"Skip on measured conditions",description:"Checked at the start of each run, from a sensor or the weather service. A sensor that cannot be read never stops a run.",threshold:"Threshold",sensor:"Sensor","sensor-optional":"Sensor (optional)",rain:{title:"Rain sensor",description:"Skip the run while a rain sensor says it is raining.","sensor-hint":"A binary sensor that is on while it rains.","history-label":"Shorten runs after recent rain","history-description":"For zones with no rain in mm at all. The sensor's last five days shorten the run, recent ones more: a full day of rain today takes all of it, four days ago a tenth. The water balance is untouched, so the deficit stays. Needs a sensor that stays on while it rains, not one that pulses per tip."},freeze:{title:"Freeze",description:"Skip the run when the temperature is at or below the threshold.","sensor-hint":"Empty: the weather service's current temperature."},wind:{title:"Wind",description:"Skip the run when the wind is at or above the threshold: a sprinkler in strong wind waters the path, not the bed.","sensor-hint":"Empty: the weather service's current wind, at 10 m."},source:{sensor:"Reads {sensor}.",service:"Reads the current value of the weather service.",nothing:"No sensor and no weather service: this check holds nothing back.",same:"The same source as the sensor group {groups}, for the evaporation.",other:"For the evaporation, the sensor groups read this value elsewhere: {groups}.","service-short":"the weather service","static-short":"a fixed value",group:"“{group}”",adopt:"Use {sensor} here too"}},Be={next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",manual_runs:"waters {duration} at every start",manual_no_duration:"no duration entered, not watered",not_calculated:"not calculated yet",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"rain forecast",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},programs:{title:"Programs",start:"Start",stop:"Stop",confirm_stop:"Tap again to stop",pause:"Pause",resume:"Resume",next_step:"Next step",step_of:"step {step}/{steps}",remaining:"{time} left",until:"until {when}",states:{idle:"idle",running:"running",waiting:"waiting",paused:"paused",suspended:"suspended"},after:"starts after {name}",next_in_line:"starts next"},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water",show_programs:"Show the programs"},no_valve:"no valve linked, not watered",no_trigger:"No start trigger",not_scheduled:"Owed, but not scheduled",off:"Switched off",watering_left:"watering, {time} left",paused_left:"paused, {time} left",soaking:"soaking, next pass at {when} ({pass}/{passes})",pass_of:"pass {pass}/{passes}"},Fe={delete_zone:'Delete the zone "{name}"? Its settings and water balance are lost.',delete_mapping:'Delete the sensor group "{name}"? The zones that use it will have no weather data.',delete_module:'Delete the module "{name}"? The zones that use it can no longer be calculated.',reset_bucket:'Set the water balance of "{name}" back to zero?',reset_all_buckets:"Set the water balance of every zone back to zero?",clear_all_weather:"Clear all the weather data collected? The next calculation only has the readings that come after."},We={title_done:"{program}: watering done",title_problem:"{program}: a problem",title_started:"{program}: watering starts",zone_line:"{zone}: {minutes} min",zone_volume:", {litres} L",problem_line:"{zone}: {reason}",nothing:"No zone needed water.",stopped:"Stopped before the end.",cut:"Cut short to be done by its deadline.",reasons:{valve_did_not_open:"the valve did not open",valve_did_not_close:"the valve did not close",no_flow:"the valve opened but no water flowed",valve_timer_not_set:"the valve's own timer could not be set, so it stayed shut",supply_did_not_turn_on:"the pump or main valve did not start",supply_did_not_turn_off:"the pump or main valve did not stop",zone_set_aside:"set aside after several failed runs: not watered until it is put back"},title_leak:"Water is flowing with every valve closed",leak_line:"{litres} L counted with every valve closed ({zones}). Check for a leak or a valve stuck open."},Ye={title:"The next days",help:"Each run a block, its colour its program's; hatched, the soaks; faded, a run the weather may hold back. Hover a block for its zones, click it to open its program. Days ahead depend on the forecast.",days:"{n} days",today:"Today",tomorrow:"Tomorrow",held:"The weather may hold it back",nothing:"Nothing to water",done:"Done",running:"Under way",empty:"No program is planned."},Ve={start:"Start",by_hand:"Started by hand",weather:"Weather allows it?",weather_sub:"Rain, frost, wind…",weather_yes:"Yes",weather_yes_unread:"Yes, but {reason} could not be read",weather_no:"No: {reason}",otherwise:"Otherwise: nothing that day",supply_on:"{name} on",supply_before:"{time} before the valves",supply_after_valves:"{time} after the valves",supply_off:"{name} off",supply_after:"{time} after",step:"Step {n}",together:"together",passes:"{n} passes",soak:"{time} to soak in between passes",wait:"wait {time}",overlap:"overlaps by {time}",tours:"Everything again, {n} rounds",notify:"Notification",empty:"Nothing to water right now.",idle:"No water needed now",no_water:"nothing now"},Ze={common:xe,defaults:ke,module:ze,calcmodules:Se,panels:Me,title:Te,irrigation_start_triggers:Oe,seasonal_adjustments:Ae,weather_skip:Ce,coordinate_config:He,days_between_irrigation:Ee,planning:De,timeline:Ne,programs:Ie,supplies:je,observed_watering:Re,calculation_log:Le,blueprints:Pe,measured_skip:Ue,card:Be,confirm:Fe,notify:We,week:Ye,flow:Ve},Ge=Object.freeze({__proto__:null,blueprints:Pe,calcmodules:Se,calculation_log:Le,card:Be,common:xe,confirm:Fe,coordinate_config:He,days_between_irrigation:Ee,default:Ze,defaults:ke,flow:Ve,irrigation_start_triggers:Oe,measured_skip:Ue,module:ze,notify:We,observed_watering:Re,panels:Me,planning:De,programs:Ie,seasonal_adjustments:Ae,supplies:je,timeline:Ne,title:Te,weather_skip:Ce,week:Ye});function qe(e,t){const i=t&&t.cache?t.cache:it,s=t&&t.serializer?t.serializer:et;return(t&&t.strategy?t.strategy:Qe)(e,{cache:i,serializer:s})}function Je(e,t,i,s){const a=null==(n=s)||"number"==typeof n||"boolean"==typeof n?s:i(s);var n;let o=t.get(a);return void 0===o&&(o=e.call(this,s),t.set(a,o)),o}function Ke(e,t,i){const s=Array.prototype.slice.call(arguments,3),a=i(s);let n=t.get(a);return void 0===n&&(n=e.apply(this,s),t.set(a,n)),n}function Xe(e,t,i,s,a){return i.bind(t,e,s,a)}function Qe(e,t){return Xe(e,this,1===e.length?Je:Ke,t.cache.create(),t.serializer)}const et=function(){return JSON.stringify(arguments)};var tt=class{constructor(){this.cache=Object.create(null)}get(e){return this.cache[e]}set(e,t){this.cache[e]=t}};const it={create:function(){return new tt}},st={variadic:function(e,t){return Xe(e,this,Ke,t.cache.create(),t.serializer)}},at=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function nt(e){const t={};return e.replace(at,e=>{const i=e.length;switch(e[0]){case"G":t.era=4===i?"long":5===i?"narrow":"short";break;case"y":t.year=2===i?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][i-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][i-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===i?"long":5===i?"narrow":"short";break;case"e":if(i<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"c":if(i<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][i-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][i-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][i-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][i-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][i-1];break;case"s":t.second=["numeric","2-digit"][i-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=i<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""}),t}const ot=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;function rt(e){return e.replace(/^(.*?)-/,"")}const lt=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,dt=/^(@+)?(\+|#+)?[rs]?$/g,ht=/(\*)(0+)|(#+)(0+)|(0+)/g,ct=/^(0+)$/;function ut(e){const t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(dt,function(e,i,s){return"string"!=typeof s?(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length):"+"===s?t.minimumSignificantDigits=i.length:"#"===i[0]?t.maximumSignificantDigits=i.length:(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length+("string"==typeof s?s.length:0)),""}),t}function pt(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function gt(e){let t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){const i=e.slice(0,2);if("+!"===i?(t.signDisplay="always",e=e.slice(2)):"+?"===i&&(t.signDisplay="exceptZero",e=e.slice(2)),!ct.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function mt(e){const t=pt(e);return t||{}}function ft(e){let t={};for(const i of e){switch(i.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=i.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":t.style="unit",t.unit=rt(i.options[0]);continue;case"unit":t.style="unit",t.unit=i.options[0];continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t={...t,notation:"scientific",...i.options.reduce((e,t)=>({...e,...mt(t)}),{})};continue;case"engineering":t={...t,notation:"engineering",...i.options.reduce((e,t)=>({...e,...mt(t)}),{})};continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(i.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(i.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");i.options[0].replace(ht,function(e,i,s,a,n,o){if(i)t.minimumIntegerDigits=s.length;else{if(a&&n)throw new Error("We currently do not support maximum integer digits");if(o)throw new Error("We currently do not support exact integer digits")}return""});continue}if(ct.test(i.stem)){t.minimumIntegerDigits=i.stem.length;continue}if(lt.test(i.stem)){if(i.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");i.stem.replace(lt,function(e,i,s,a,n,o){return"*"===s?t.minimumFractionDigits=i.length:a&&"#"===a[0]?t.maximumFractionDigits=a.length:n&&o?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+o.length):(t.minimumFractionDigits=i.length,t.maximumFractionDigits=i.length),""});const e=i.options[0];"w"===e?t={...t,trailingZeroDisplay:"stripIfInteger"}:e&&(t={...t,...ut(e)});continue}if(dt.test(i.stem)){t={...t,...ut(i.stem)};continue}const e=pt(i.stem);e&&(t={...t,...e});const s=gt(i.stem);s&&(t={...t,...s})}return t}let vt=function(e){return e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG",e}({});function _t(e){return 0===e.type}function wt(e){return 1===e.type}function yt(e){return 2===e.type}function bt(e){return 3===e.type}function $t(e){return 4===e.type}function xt(e){return 5===e.type}function kt(e){return 6===e.type}function zt(e){return 7===e.type}function St(e){return 8===e.type}function Mt(e){return!(!e||"object"!=typeof e||0!==e.type)}function Tt(e){return!(!e||"object"!=typeof e||1!==e.type)}const Ot=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,At=/([^\t-\r -\/:-@\[-\^`\{-~\x85\xA0-\xA7\xA9\xAB\xAC\xAE\xB0\xB1\xB6\xBB\xBF\xD7\xF7\u1680\u2000-\u200A\u2010-\u2029\u202F-\u203E\u2041-\u2053\u2055-\u205F\u2190-\u245F\u2500-\u2775\u2794-\u2BFF\u2E00-\u2E7F\u3000-\u3003\u3008-\u3020\u3030\uFD3E\uFD3F\uFE45\uFE46]*)/g,Ct={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["H","h","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["H","h","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GS:["H","h","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HT:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["H","h","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["hB","hb","H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["H","h","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ku-SY":["H","hB"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function Ht(e){let t=e.hourCycle;if(void 0===t){const i=e;t=i.getHourCycles?.()[0]??i.hourCycles?.[0]}if(t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}const i=e.language;let s;return"root"!==i&&(s=e.maximize().region),(Ct[`${i}-${s}`]||Ct[s||""]||Ct[i||""]||Ct[`${i}-001`]||Ct["001"])[0].charAt(0)}const Et=new RegExp(`^${Ot.source}*`),Dt=new RegExp(`${Ot.source}*$`);function Nt(e,t){return{start:e,end:t}}const It=!!Object.fromEntries,jt=!!String.prototype.trimStart,Rt=!!String.prototype.trimEnd,Lt=It?Object.fromEntries:function(e){const t={};for(const[i,s]of e)t[i]=s;return t},Pt=jt?function(e){return e.trimStart()}:function(e){return e.replace(Et,"")},Ut=Rt?function(e){return e.trimEnd()}:function(e){return e.replace(Dt,"")};let Bt=function(){try{const e=new RegExp("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");if("a"===e.exec("a ")?.[1])return e}catch{}return At}();var Ft=class{constructor(e,t={}){this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons,this.captureEscapes=!!t.captureEscapes}parse(){if(0!==this.offset())throw Error("parser can only be used once");if(this.message.length>0){const e=this.message.charCodeAt(0);if(35!==e&&39!==e&&60!==e&&123!==e&&125!==e){const e=function(e){if(0===e.length)return null;let t=1,i=1;for(let s=0;s<e.length;){const a=e.charCodeAt(s);switch(a){case 35:case 39:case 60:case 123:case 125:return null}if(10===a)t++,i=1,s++;else if(i++,a>=55296&&a<=56319&&s+1<e.length){const t=e.charCodeAt(s+1);s+=t>=56320&&t<=57343?2:1}else s++}return{offset:e.length,line:t,column:i}}(this.message);if(e){const t=this.clonePosition();return this.position=e,{val:[{type:0,value:this.message,...this.captureEscapes&&{rawValue:this.message},location:Nt(t,this.clonePosition())}],err:null}}}}return this.parseMessage(0,"",!1)}parseMessage(e,t,i){let s=[];for(;!this.isEOF();){const a=this.char();if(123===a){const t=this.parseArgument(e,i);if(t.err)return t;s.push(t.val)}else{if(125===a&&e>0)break;if(35!==a||"plural"!==t&&"selectordinal"!==t){if(60===a&&!this.ignoreTag&&47===this.peek()){if(i)break;return this.error(26,Nt(this.clonePosition(),this.clonePosition()))}if(60===a&&!this.ignoreTag&&Wt(this.peek()||0)){const i=this.parseTag(e,t);if(i.err)return i;s.push(i.val)}else{const i=this.parseLiteral(e,t);if(i.err)return i;s.push(i.val)}}else{const e=this.clonePosition();this.bump(),s.push({type:7,location:Nt(e,this.clonePosition())})}}}return{val:s,err:null}}parseTag(e,t){const i=this.clonePosition();this.bump();const s=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:0,value:`<${s}/>`,location:Nt(i,this.clonePosition())},err:null};if(this.bumpIf(">")){const a=this.parseMessage(e+1,t,!0);if(a.err)return a;const n=a.val,o=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!Wt(this.char()))return this.error(23,Nt(o,this.clonePosition()));const e=this.clonePosition();return s!==this.parseTagName()?this.error(26,Nt(e,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:8,value:s,children:n,location:Nt(i,this.clonePosition())},err:null}:this.error(23,Nt(o,this.clonePosition())))}return this.error(27,Nt(i,this.clonePosition()))}return this.error(23,Nt(i,this.clonePosition()))}parseTagName(){const e=this.offset();for(this.bump();!this.isEOF()&&Yt(this.char());)this.bump();return this.message.slice(e,this.offset())}parseLiteral(e,t){const i=this.clonePosition();let s="";for(;;){const i=this.tryParseQuote(t);if(i){s+=i;continue}const a=this.tryParseUnquoted(e,t);if(a){s+=a;continue}const n=this.tryParseLeftAngleBracket();if(!n)break;s+=n}return{val:{type:0,value:s,location:Nt(i,this.clonePosition()),...this.captureEscapes&&{rawValue:this.message.slice(i.offset,this.offset())}},err:null}}tryParseLeftAngleBracket(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(Wt(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e}tryParseQuote(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();const t=[this.char()];for(this.bump();!this.isEOF();){const e=this.char();if(39===e){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(e);this.bump()}return String.fromCodePoint(...t)}tryParseUnquoted(e,t){if(this.isEOF())return null;const i=this.char();return 60===i||123===i||35===i&&("plural"===t||"selectordinal"===t)||125===i&&e>0?null:(this.bump(),String.fromCodePoint(i))}parseArgument(e,t){const i=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(1,Nt(i,this.clonePosition()));if(125===this.char())return this.bump(),this.error(2,Nt(i,this.clonePosition()));let s=this.parseIdentifierIfPossible().value;if(!s)return this.error(3,Nt(i,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(1,Nt(i,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:1,value:s,location:Nt(i,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(1,Nt(i,this.clonePosition())):this.parseArgumentOptions(e,t,s,i);default:return this.error(3,Nt(i,this.clonePosition()))}}parseIdentifierIfPossible(){const e=this.clonePosition(),t=this.offset(),i=function(e,t){return Bt.lastIndex=t,Bt.exec(e)[1]??""}(this.message,t),s=t+i.length;return this.bumpTo(s),{value:i,location:Nt(e,this.clonePosition())}}parseArgumentOptions(e,t,i,s){let a=this.clonePosition(),n=this.parseIdentifierIfPossible().value,o=this.clonePosition();switch(n){case"":return this.error(4,Nt(a,o));case"number":case"date":case"time":{this.bumpSpace();let e=null;if(this.bumpIf(",")){this.bumpSpace();const t=this.clonePosition(),i=this.parseSimpleArgStyleIfPossible();if(i.err)return i;const s=Ut(i.val);if(0===s.length)return this.error(6,Nt(this.clonePosition(),this.clonePosition()));e={style:s,styleLocation:Nt(t,this.clonePosition())}}const t=this.tryParseArgumentClose(s);if(t.err)return t;const a=Nt(s,this.clonePosition());if(e&&e.style.startsWith("::")){let t=Pt(e.style.slice(2));if("number"===n){const s=this.parseNumberSkeletonFromString(t,e.styleLocation);return s.err?s:{val:{type:2,value:i,location:a,style:s.val},err:null}}{if(0===t.length)return this.error(10,a);let s=t;this.locale&&(s=function(e,t){let i="";for(let s=0;s<e.length;s++){const a=e.charAt(s);if("j"===a){let n=0;for(;s+1<e.length&&e.charAt(s+1)===a;)n++,s++;let o=1+(1&n),r=n<2?1:3+(n>>1),l="a",d=Ht(t);for("H"!=d&&"k"!=d||(r=0);r-- >0;)i+=l;for(;o-- >0;)i=d+i}else i+="J"===a?"H":a}return i}(t,this.locale));return{val:{type:"date"===n?3:4,value:i,location:a,style:{type:1,pattern:s,location:e.styleLocation,parsedOptions:this.shouldParseSkeletons?nt(s):{}}},err:null}}}return{val:{type:"number"===n?2:"date"===n?3:4,value:i,location:a,style:e?.style??null},err:null}}case"plural":case"selectordinal":case"select":{const a=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(12,Nt(a,{...a}));this.bumpSpace();let o=this.parseIdentifierIfPossible(),r=0;if("select"!==n&&"offset"===o.value){if(!this.bumpIf(":"))return this.error(13,Nt(this.clonePosition(),this.clonePosition()));this.bumpSpace();const e=this.tryParseDecimalInteger(13,14);if(e.err)return e;this.bumpSpace(),o=this.parseIdentifierIfPossible(),r=e.val}const l=this.tryParsePluralOrSelectOptions(e,n,t,o);if(l.err)return l;const d=this.tryParseArgumentClose(s);if(d.err)return d;const h=Nt(s,this.clonePosition());return"select"===n?{val:{type:5,value:i,options:Lt(l.val),location:h},err:null}:{val:{type:6,value:i,options:Lt(l.val),offset:r,pluralType:"plural"===n?"cardinal":"ordinal",location:h},err:null}}default:return this.error(5,Nt(a,o))}}tryParseArgumentClose(e){return this.isEOF()||125!==this.char()?this.error(1,Nt(e,this.clonePosition())):(this.bump(),{val:!0,err:null})}parseSimpleArgStyleIfPossible(){let e=0;const t=this.clonePosition();for(;!this.isEOF();)switch(this.char()){case 39:{this.bump();let e=this.clonePosition();if(!this.bumpUntil("'"))return this.error(11,Nt(e,this.clonePosition()));this.bump();break}case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}return{val:this.message.slice(t.offset,this.offset()),err:null}}parseNumberSkeletonFromString(e,t){let i=[];try{i=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");const t=e.split(ot).filter(e=>e.length>0),i=[];for(const e of t){let t=e.split("/");if(0===t.length)throw new Error("Invalid number skeleton");const[s,...a]=t;for(const e of a)if(0===e.length)throw new Error("Invalid number skeleton");i.push({stem:s,options:a})}return i}(e)}catch{return this.error(7,t)}return{val:{type:0,tokens:i,location:t,parsedOptions:this.shouldParseSkeletons?ft(i):{}},err:null}}tryParsePluralOrSelectOptions(e,t,i,s){let a=!1;const n=[],o=new Set;let{value:r,location:l}=s;for(;;){if(0===r.length){const e=this.clonePosition();if("select"===t||!this.bumpIf("="))break;{const t=this.tryParseDecimalInteger(16,19);if(t.err)return t;l=Nt(e,this.clonePosition()),r=this.message.slice(e.offset,this.offset())}}if(o.has(r))return this.error("select"===t?21:20,l);"other"===r&&(a=!0),this.bumpSpace();const s=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?17:18,Nt(this.clonePosition(),this.clonePosition()));const d=this.parseMessage(e+1,t,i);if(d.err)return d;const h=this.tryParseArgumentClose(s);if(h.err)return h;n.push([r,{value:d.val,location:Nt(s,this.clonePosition())}]),o.add(r),this.bumpSpace(),({value:r,location:l}=this.parseIdentifierIfPossible())}return 0===n.length?this.error("select"===t?15:16,Nt(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!a?this.error(22,Nt(this.clonePosition(),this.clonePosition())):{val:n,err:null}}tryParseDecimalInteger(e,t){let i=1;const s=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(i=-1);let a=!1,n=0;for(;!this.isEOF();){const e=this.char();if(!(e>=48&&e<=57))break;a=!0,n=10*n+(e-48),this.bump()}const o=Nt(s,this.clonePosition());return a?(n*=i,Number.isSafeInteger(n)?{val:n,err:null}:this.error(t,o)):this.error(e,o)}offset(){return this.position.offset}isEOF(){return this.offset()===this.message.length}clonePosition(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}}char(){const e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");const t=this.message.codePointAt(e);if(void 0===t)throw Error(`Offset ${e} is at invalid UTF-16 code unit boundary`);return t}error(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}}bump(){if(this.isEOF())return;const e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}bumpIf(e){const t=this.offset();if(this.message.slice(t,t+e.length)===e){for(let t=0;t<e.length;t++)this.bump();return!0}return!1}bumpUntil(e){const t=this.offset(),i=this.message.indexOf(e,t);return i>=0?(this.bumpTo(i),!0):(this.bumpTo(this.message.length),!1)}bumpTo(e){if(this.offset()>e)throw Error(`targetOffset ${e} must be greater than or equal to the current offset ${this.offset()}`);for(e=Math.min(e,this.message.length);;){const t=this.offset();if(t===e)break;if(t>e)throw Error(`targetOffset ${e} is at invalid UTF-16 code unit boundary`);if(this.bump(),this.isEOF())break}}bumpSpace(){for(;!this.isEOF()&&Vt(this.char());)this.bump()}peek(){if(this.isEOF())return null;const e=this.char(),t=this.offset();return this.message.charCodeAt(t+(e>=65536?2:1))??null}};function Wt(e){return e>=97&&e<=122||e>=65&&e<=90}function Yt(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function Vt(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function Zt(e){e.forEach(e=>{if(delete e.location,xt(e)||kt(e))for(const t in e.options)delete e.options[t].location,Zt(e.options[t].value);else yt(e)&&Mt(e.style)||(bt(e)||$t(e))&&Tt(e.style)?delete e.style.location:St(e)&&Zt(e.children)})}function Gt(e,t={}){t={shouldParseSkeletons:!0,requiresOtherClause:!0,...t};const i=new Ft(e,t).parse();if(i.err){const e=SyntaxError(vt[i.err.kind]);throw e.location=i.err.location,e.originalMessage=i.err.message,e}return t?.captureLocation||Zt(i.val),i.val}var qt=class extends Error{constructor(e,t,i){super(e),this.code=t,this.originalMessage=i}toString(){return`[formatjs Error: ${this.code}] ${this.message}`}},Jt=class extends qt{constructor(e,t,i,s){super(`Invalid values for "${e}": "${t}". Options are "${Object.keys(i).join('", "')}"`,"INVALID_VALUE",s)}},Kt=class extends qt{constructor(e,t,i){super(`Value for "${e}" must be of type ${t}`,"INVALID_VALUE",i)}},Xt=class extends qt{constructor(e,t){super(`The intl string context variable "${e}" was not provided to the string "${t}"`,"MISSING_VALUE",t)}};function Qt(e){return"function"==typeof e}function ei(e,t,i,s,a,n,o){if(1===e.length&&_t(e[0]))return[{type:0,value:e[0].value}];const r=[];for(const l of e){if(_t(l)){r.push({type:0,value:l.value});continue}if(zt(l)){"number"==typeof n&&r.push({type:0,value:i.getNumberFormat(t).format(n)});continue}const{value:e}=l;if(!a||!(e in a))throw new Xt(e,o);let d=a[e];if(wt(l))d&&"string"!=typeof d&&"number"!=typeof d&&"bigint"!=typeof d||(d="string"==typeof d||"number"==typeof d||"bigint"==typeof d?String(d):""),r.push({type:"string"==typeof d?0:1,value:d});else{if(bt(l)){const e="string"==typeof l.style?s.date[l.style]:Tt(l.style)?l.style.parsedOptions:void 0;r.push({type:0,value:i.getDateTimeFormat(t,e).format(d)});continue}if($t(l)){const e="string"==typeof l.style?s.time[l.style]:Tt(l.style)?l.style.parsedOptions:s.time.medium;r.push({type:0,value:i.getDateTimeFormat(t,e).format(d)});continue}if(yt(l)){const e="string"==typeof l.style?s.number[l.style]:Mt(l.style)?l.style.parsedOptions:void 0;if(e&&e.scale){const t=e.scale||1;if("bigint"==typeof d){if(!Number.isInteger(t))throw new TypeError(`Cannot apply fractional scale ${t} to bigint value. Scale must be an integer when formatting bigint.`);d*=BigInt(t)}else d*=t}r.push({type:0,value:i.getNumberFormat(t,e).format(d)});continue}if(St(l)){const{children:e,value:d}=l,h=a[d];if(!Qt(h))throw new Kt(d,"function",o);let c=h(ei(e,t,i,s,a,n).map(e=>e.value));Array.isArray(c)||(c=[c]),r.push(...c.map(e=>({type:"string"==typeof e?0:1,value:e})))}if(xt(l)){const e=d,n=(Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0)||l.options.other;if(!n)throw new Jt(l.value,d,Object.keys(l.options),o);r.push(...ei(n.value,t,i,s,a));continue}if(kt(l)){const e=`=${d}`;let n=Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0;if(!n){if(!Intl.PluralRules)throw new qt('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',"MISSING_INTL_API",o);const e="bigint"==typeof d?Number(d):d,s=i.getPluralRules(t,{type:l.pluralType}).select(e-(l.offset||0));n=(Object.prototype.hasOwnProperty.call(l.options,s)?l.options[s]:void 0)||l.options.other}if(!n)throw new Jt(l.value,d,Object.keys(l.options),o);const h="bigint"==typeof d?Number(d):d;r.push(...ei(n.value,t,i,s,a,h-(l.offset||0)));continue}}}return(l=r).length<2?l:l.reduce((e,t)=>{const i=e[e.length-1];return i&&0===i.type&&0===t.type?i.value+=t.value:e.push(t),e},[]);var l}function ti(e,t){return t?Object.keys(e).reduce((i,s)=>{var a,n;return i[s]=(a=e[s],(n=t[s])?{...a,...n,...Object.keys(a).reduce((e,t)=>(e[t]={...a[t],...n[t]},e),{})}:a),i},{...e}):e}function ii(e){return{create:()=>({get:t=>e[t],set(t,i){e[t]=i}})}}var si=class e{constructor(t,i=e.defaultLocale,s,a){if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=e=>{const t=this.formatToParts(e);if(1===t.length)return t[0].value;const i=t.reduce((e,t)=>(e.length&&0===t.type&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e),[]);return i.length<=1?i[0]||"":i},this.formatToParts=e=>ei(this.ast,this.locales,this.formatters,this.formats,e,void 0,this.message),this.resolvedOptions=()=>({locale:this.resolvedLocale?.toString()||Intl.NumberFormat.supportedLocalesOf(this.locales)[0]}),this.getAst=()=>this.ast,this.locales=i,this.resolvedLocale=e.resolveLocale(i),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");const{...i}=a||{};this.ast=e.__parse(t,{...i,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=ti(e.formats,s),this.formatters=a&&a.formatters||function(e={number:{},dateTime:{},pluralRules:{}}){return{getNumberFormat:qe((...e)=>new Intl.NumberFormat(...e),{cache:ii(e.number),strategy:st.variadic}),getDateTimeFormat:qe((...e)=>new Intl.DateTimeFormat(...e),{cache:ii(e.dateTime),strategy:st.variadic}),getPluralRules:qe((...e)=>new Intl.PluralRules(...e),{cache:ii(e.pluralRules),strategy:st.variadic})}}(this.formatterCache)}static{this.memoizedDefaultLocale=null}static get defaultLocale(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale}static{this.resolveLocale=e=>{if(void 0===Intl.Locale)return;const t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])}}static{this.__parse=Gt}static{this.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}}}};const ai="/api/smart_irrigation/languages",ni=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sl","sv","uk","zh-Hans","zh-Hant"],oi={en:Ge},ri={};function li(e){return(e||"").replace(/['"]+/g,"")}function di(e,t,...i){const s=li(t);let a;try{a=e.split(".").reduce((e,t)=>e[t],oi[s])}catch(t){a=e.split(".").reduce((e,t)=>e[t],oi.en)}if(void 0===a&&(a=e.split(".").reduce((e,t)=>e[t],oi.en)),!i.length)return a;const n={};for(let e=0;e<i.length;e+=2){let t=i[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=i[e+1]}try{return new si(a,t).format(n)}catch(e){return"Translation "+e}}var hi,ci;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(hi||(hi={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ci||(ci={}));const ui=(e,t,i,s)=>{s=s||{},i=null==i?{}:i;const a=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return a.detail=i,e.dispatchEvent(a),a},pi="v2026.11.1-beta1",gi="smart_irrigation",mi="precipitation_threshold_mm",fi="irrigation_start_triggers",vi="sunrise",_i="solar_azimuth",wi="time",yi="06:00",bi="minutes",$i="hours",xi="days",ki="imperial",zi="metric",Si="Dewpoint",Mi="Evapotranspiration",Ti="Humidity",Oi="Maximum Temperature",Ai="Minimum Temperature",Ci="Precipitation",Hi="Current Precipitation",Ei="Pressure",Di="Solar Radiation",Ni="Temperature",Ii="Windspeed",ji="Open-Meteo",Ri="Home Assistant weather entity",Li=[ji,Ri],Pi=[Ri],Ui="weather_service",Bi="sensor",Fi="static",Wi="illuminance",Yi="pressure_type",Vi="wind_height",Zi="absolute",Gi="relative",qi="none",Ji="source",Ki="sensorentity",Xi="static_value",Qi="unit",es="aggregate",ts=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],is="sq ft",ss="l/minute",as="gal/minute",ns="°C",os="mm",rs="in",ls="meter/s",ds="MJ/day/m2",hs="mm/h",cs="in/h",us="name",ps="size",gs="throughput",ms="state",fs="duration",vs="water_volume",_s="bucket",ws="multiplier",ys="mapping",bs="lead_time",$s="maximum_duration",xs="maximum_bucket",ks="irrigation_threshold",zs="drainage_rate",Ss="linked_entity",Ms="days_between_irrigation",Ts="available_water",Os="crop_factor_by_month",As="allowed_depletion",Cs="distribution_efficiency",Hs="safety_off_topic",Es="safety_off_entity",Ds="supply_id",Ns="extra_entities",Is="safety_off_mode",js="safety_off_required",Rs="confirm_timeout",Ls="open_resends",Ps="flow_sensor",Us="observed_ignore_seconds",Bs="soil_moisture_sensor",Fs="soil_moisture_threshold",Ws="input_method",Ys="throughput",Vs="direct",Zs="precipitation_rate",Gs=2,qs=e=>(...t)=>({_$litDirective$:e,values:t});let Js=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class Ks extends Js{constructor(e){if(super(e),this.it=q,e.type!==Gs)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===q||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Ks.directiveName="unsafeHTML",Ks.resultType=1;const Xs=qs(Ks),Qs={comma_decimal:["de","es","it"],decimal_point:["en-US","en-CA","en-GB"],space_comma:["fr","sv","cs"],system:void 0},ea=(e,t,i,s)=>{if(!Number.isFinite(e))return String(e);const a=null==i?void 0:i.number_format;if("none"===a)return e.toFixed(t);const n=a&&a in Qs?Qs[a]:(null==i?void 0:i.language)||s||void 0;try{const i=new Intl.NumberFormat(n,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e);return/^-0([.,\s]0*)?$/.test(i)?i.slice(1):i}catch(i){return e.toFixed(t)}},ta=e=>{const t=Math.max(0,Math.round(Number(e)||0)),i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60;return i>0?`${i} h ${String(s).padStart(2,"0")} min`:s>0?a?`${s} min ${a} s`:`${s} min`:`${a} s`},ia=e=>{const t=Math.max(0,Math.round(Number(e)||0));return ta(t>=600?60*Math.ceil(t/60):t)},sa=(e,t,i,s=new Date)=>{const a=new Date(e);if(isNaN(a.getTime()))return e;const n=a.toLocaleTimeString(t,{hour:"2-digit",minute:"2-digit"}),o=new Date(s);o.setHours(0,0,0,0);const r=Math.floor((a.getTime()-o.getTime())/864e5);return 0===r?n:1===r?`${i.tomorrow} ${n}`:-1===r?`${i.yesterday} ${n}`:`${a.toLocaleDateString(t,{day:"numeric",month:"short"})} ${n}`};function aa(e){var t;return"automatic"===e.state&&!e.last_calculated&&!(null===(t=e.calculation_problem)||void 0===t?void 0:t.code)}const na=e=>[...(null==e?void 0:e.valves)||[],...(null==e?void 0:e.paused)&&(null==e?void 0:e.held)||[]],oa=e=>!!e&&(!0===e.paused||!!e.cycle||(e.valves||[]).length>0||(e.soaking||[]).length>0||(e.starting||[]).length>0||(e.programs||[]).some(e=>"running"===e.state));function ra(e,t,i){var s,a,n;const o=new Date(e);if(isNaN(o.getTime()))return"-";const r=null!==(n=null!==(a=null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)&&void 0!==a?a:null==t?void 0:t.language)&&void 0!==n?n:navigator.language;try{return new Intl.DateTimeFormat(r,i).format(o)}catch(e){return o.toLocaleString()}}function la(e,t){const i=(null==e?void 0:e.units)==zi;switch(t){case zs:case Zs:return i?hs:cs;case mi:case _s:return i?os:rs;case ps:return i?"m²":is;case gs:return i?ss:as;case vs:return i?"L":"gal";default:return""}}function da(e,t){switch(t){case zs:case Zs:return e.units==zi?V`${Xs(hs)}`:V`${Xs(cs)}`;case mi:case _s:return e.units==zi?V`${Xs(os)}`:V`${Xs(rs)}`;case ps:return e.units==zi?V`${Xs("m<sup>2</sup>")}`:V`${Xs(is)}`;case gs:return e.units==zi?V`${Xs(ss)}`:V`${Xs(as)}`;case vs:return e.units==zi?V`${Xs("L")}`:V`${Xs("gal")}`;default:return V``}}function ha(e){return ta(e)}function ca(e,t){const i=Number(e)||0,s=Number(t)||0;return i<=0||s<=0?0:i/60*s}const ua=3.785411784;function pa(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===zi?i:i/ua}function ga(e,t){const i=Number(e)||0,s=(null==t?void 0:t.units)===zi?i:i*ua;return Math.round(100*s)/100}function ma(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===zi?i:i/25.4}function fa(e){switch(e){case Si:case Ni:return[{unit:ns,system:zi},{unit:"°F",system:ki}];case Ci:case Mi:return[{unit:os,system:zi},{unit:rs,system:ki}];case Hi:return[{unit:hs,system:zi},{unit:cs,system:ki}];case Ti:return[{unit:"%",system:[zi,ki]}];case Ei:return[{unit:"millibar",system:zi},{unit:"hPa",system:zi},{unit:"psi",system:ki},{unit:"inch Hg",system:ki}];case Ii:return[{unit:"km/h",system:zi},{unit:ls,system:zi},{unit:"mile/h",system:ki},{unit:"knot",system:[zi,ki]}];case Di:return[{unit:"W/m2",system:zi},{unit:ds,system:zi},{unit:"W/sq ft",system:ki},{unit:"MJ/day/sq ft",system:ki}];default:return[]}}function va(e,t){var i,s,a;const n=null!==(s=null===(i=null==e?void 0:e.body)||void 0===i?void 0:i.message)&&void 0!==s?s:null==e?void 0:e.message;!function(e,t){ui(e,"show-dialog",{dialogTag:"smart-irrigation-error-dialog",dialogImport:()=>Promise.resolve().then(function(){return vr}),dialogParams:{error:t}})}(t,V`
    ${null!==(a=null==e?void 0:e.error)&&void 0!==a?a:""}${(null==e?void 0:e.error)&&n?":":""}${n?V` ${n} `:""}
  `)}const _a=(e,t,i=!1)=>{i?history.replaceState(null,"",t):history.pushState(null,"",t),ui(window,"location-changed",{replace:i})},wa={Static:"manual",Passthrough:"standard",PyETO:"advanced"};const ya={from_weather:"PyETO",provided:"Passthrough",fixed:"Static"};function ba(e){return-Math.abs(Number(e)||0)}const $a=(e,t)=>{var i;const s=(null!==(i=e.name)&&void 0!==i?i:"").trim();if(!s)return void 0!==e.id?`#${e.id}`:"—";const a=Object.values(null!=t?t:{}).some(t=>{var i;return t!==e&&t.id!==e.id&&(null!==(i=t.name)&&void 0!==i?i:"").trim()===s});return a&&void 0!==e.id?`${s} (#${e.id})`:s},xa={[Ni]:["temperature"],[Si]:["temperature"],[Ti]:["humidity"],[Ei]:["atmospheric_pressure","pressure"],[Ii]:["wind_speed"],[Di]:["irradiance"],[Ci]:["precipitation"],[Hi]:["precipitation_intensity"]},ka=["wind_speed","irradiance","precipitation","precipitation_intensity","atmospheric_pressure"],za=/dew|taupunkt|point[ _-]?de[ _-]?ros|rugiada|dauwpunt|rocío|rosný|harmatpont|duggpunkt|dugpunkt|kastepiste|ponto[ _-]?de[ _-]?orvalho|punkt[ _-]?rosy/i;function Sa(e,t,i={}){const s=Object.keys(t).filter(e=>{var s,a,n;return e.startsWith("sensor.")&&"smart_irrigation"!==(null===(s=i[e])||void 0===s?void 0:s.platform)&&!!(null===(n=null===(a=t[e])||void 0===a?void 0:a.attributes)||void 0===n?void 0:n.device_class)}),a=e=>t[e].attributes.device_class,n=e=>{var t;const s=null===(t=i[e])||void 0===t?void 0:t.device_id;if(s)return s;const a=e.indexOf("_",7);return a>0?e.slice(0,a):e},o=e=>s.filter(i=>{var s;if(!(null!==(s=xa[e])&&void 0!==s?s:[]).includes(a(i)))return!1;const n=za.test((e=>{var i,s;return`${e} ${null!==(s=null===(i=t[e].attributes)||void 0===i?void 0:i.friendly_name)&&void 0!==s?s:""}`})(i));return e===Si?n:e!==Ni||!n}),r=new Set;for(const e of ka){const t=s.filter(t=>a(t)===e);1===t.length&&r.add(n(t[0]))}const l={};for(const t of e){const e=o(t);if(1===e.length){l[t]=e[0];continue}if(1!==r.size||0===e.length)continue;const[i]=[...r],s=e.filter(e=>n(e)===i);1===s.length&&(l[t]=s[0])}return l}function Ma(e){return(null==e?void 0:e.recalculate_before_start)?"calc-before-start":(null==e?void 0:e.autocalcenabled)?"calc-daily":"calc-manual"}function Ta(e,t){return e<=0?t.none:1===e?t.one:t.many.replace("{n}",String(e))}function Oa(e){return(e.steps||[]).some(e=>!1!==e.enabled&&(e.zones||[]).length>0)}var Aa="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",Ca="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z",Ha="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",Ea="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",Da="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Na="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",Ia="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",ja="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z",Ra="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",La="M15 5H18L16.5 7L15 5M5 2H19C20.11 2 21 2.9 21 4V20C21 21.11 20.11 22 19 22H5C3.9 22 3 21.11 3 20V4C3 2.9 3.9 2 5 2M5 4V8H19V4H5M5 20H19V10H5V20M7 12H17V14H7V12M7 16H17V18H7V16Z",Pa="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",Ua="M7,10L12,15L17,10H7Z",Ba="M19,13H5V11H19V13Z",Fa="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",Wa="M8,5.14V19.14L19,12.14L8,5.14Z",Ya="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Va="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",Za="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",Ga="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z",qa="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z";let Ja=class extends ce{constructor(){super(...arguments),this._open=!1,this._hover=!1,this._focus=!1,this._close=e=>{e.composedPath().includes(this)||(this._open=!1)},this._follow=()=>{this._shown&&this._place()},this._enter=e=>{"mouse"===e.pointerType&&(this._hover=!0)},this._leave=e=>{"mouse"===e.pointerType&&(this._hover=!1)}}get _shown(){return this._open||this._hover||this._focus}connectedCallback(){super.connectedCallback(),this.addEventListener("pointerenter",this._enter),this.addEventListener("pointerleave",this._leave),document.addEventListener("click",this._close,!0),window.addEventListener("scroll",this._follow,{capture:!0,passive:!0}),window.addEventListener("resize",this._follow,{passive:!0})}disconnectedCallback(){this.removeEventListener("pointerenter",this._enter),this.removeEventListener("pointerleave",this._leave),document.removeEventListener("click",this._close,!0),window.removeEventListener("scroll",this._follow,{capture:!0}),window.removeEventListener("resize",this._follow),super.disconnectedCallback()}updated(){this._shown&&this._place()}_place(){const e=this._tip,t=this._icon;if(!e||!t)return;const i=document.documentElement.clientWidth||window.innerWidth,s=window.innerHeight;e.style.maxWidth=`${Math.max(0,Math.min(340,i-16))}px`,e.style.left="0px",e.style.top="0px";const a=e.getBoundingClientRect(),{x:n,y:o}=function(e,t,i,s=!1){const a=i.width-8-t.width;let n=s?e.right+8-t.width:e.left-8;n=Math.max(8,Math.min(n,a));let o=e.bottom+6;const r=e.top-6-t.height;return o+t.height>i.height-8&&r>=8&&(o=r),{x:n,y:o}}(t.getBoundingClientRect(),{width:a.width,height:a.height},{width:i,height:s},"rtl"===getComputedStyle(this).direction);e.style.left=n-a.left+"px",e.style.top=o-a.top+"px"}render(){return V`<span
        class="i"
        tabindex="0"
        role="button"
        aria-label="?"
        @focus=${()=>{var e;this._focus=!!(null===(e=this._icon)||void 0===e?void 0:e.matches(":focus-visible"))}}
        @blur=${()=>{this._focus=!1}}
        @click=${e=>{e.preventDefault(),e.stopPropagation(),this._open=!this._open,this._open||(this._focus=!1)}}
        @keydown=${e=>{"Enter"===e.key||" "===e.key?(e.preventDefault(),this._open=!this._open,this._open||(this._focus=!1)):"Escape"===e.key&&(this._open=!1,this._focus=!1)}}
        ><ha-svg-icon .path=${Pa}></ha-svg-icon></span
      ><span class="tip ${this._shown?"open":""}" role="tooltip"
        ><slot></slot
      ></span>`}};Ja.styles=l`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
      margin-inline-start: 4px;
      font-size: 0.875rem;
      font-weight: normal;
    }
    .i {
      display: inline-flex;
      color: var(--secondary-text-color);
      cursor: help;
      outline: none;
      border-radius: 50%;
    }
    .i:focus-visible {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    ha-svg-icon {
      --mdc-icon-size: 18px;
    }
    .tip {
      display: none;
      position: fixed;
      z-index: 20;
      left: 0;
      top: 0;
      box-sizing: border-box;
      width: max-content;
      max-width: min(340px, calc(100vw - 16px));
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      line-height: 1.4;
      white-space: normal;
      overflow-wrap: anywhere;
      text-align: start;
    }
    .tip.open {
      display: block;
    }
  `,i([ve()],Ja.prototype,"_open",void 0),i([ve()],Ja.prototype,"_hover",void 0),i([ve()],Ja.prototype,"_focus",void 0),i([_e(".i")],Ja.prototype,"_icon",void 0),i([_e(".tip")],Ja.prototype,"_tip",void 0),Ja=i([pe("si-info")],Ja);const Ka=e=>e.callWS({type:gi+"/config"}),Xa=(e,t)=>e.callApi("POST",gi+"/config",t),Qa=e=>e.callWS({type:gi+"/weatherservice"}),en=e=>e.callWS({type:gi+"/zones"}),tn=(e,t)=>e.callApi("POST",gi+"/zones",t),sn=(e,t)=>e.callApi("POST",gi+"/zones",{id:t,calculate:!0,override_cache:!0}),an=(e,t)=>e.callApi("POST",gi+"/zones",{id:t,update:!0}),nn=e=>e.callWS({type:gi+"/modules"}),on=e=>e.callWS({type:gi+"/mappings"}),rn=(e,t)=>e.callApi("POST",gi+"/mappings",t),ln=e=>e.callWS({type:gi+"/info"}),dn=(e,t,i=10)=>e.callWS({type:gi+"/weather_records",mapping_id:t,limit:i}),hn=(e,t=500)=>e.callWS({type:gi+"/irrigation_history",limit:t}),cn=(e,t)=>e.callWS({type:gi+"/watering_calendar",zone_id:t}),un=86400,pn=3600,gn=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()),mn=(e,t)=>new Date(e.getFullYear(),e.getMonth(),e.getDate()+t),fn=(e,t)=>{const i=t.to-t.from;return i<=0?0:Math.max(0,Math.min(100,(e-t.from)/i*100))},vn=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then(e=>e()):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return i([fe({attribute:!1})],t.prototype,"hass",void 0),t},_n=[30,60,120,300,600,900,1800,3600,7200,10800,21600,43200],wn=(e,t)=>t>0?Math.max(0,Math.min(100,e/t*100)):0,yn=e=>{const t=Math.round(e);if(t<=0)return"0";const i=Math.floor(t/3600);if(t<60)return`+${t} s`;const s=Math.round(t%3600/60);return i>0?s?`+${i} h ${String(s).padStart(2,"0")}`:`+${i} h`:`+${s} min`};let bn=class extends ce{constructor(){super(...arguments),this.lang="en"}_t(e){return di(`timeline.${e}`,this.lang)}_clock(e){if(!this.start)return yn(e);const t=new Date(new Date(this.start).getTime()+1e3*e);return isNaN(t.getTime())?yn(e):new Intl.DateTimeFormat(this.lang,{hour:"2-digit",minute:"2-digit"}).format(t)}_title(e,t){const i="water"===t.kind?this._t("water"):"fill"===t.kind?this._t("fill"):this._t("soak");return`${e} · ${this._t("pass").replace("{n}",String(t.pass+1))} · ${i} · ${ta(t.end-t.start)} (${this._clock(t.start)} - ${this._clock(t.end)})`}render(){var e,t;const i=((e,t=e=>`#${e}`)=>{var i;if(!(null===(i=null==e?void 0:e.segments)||void 0===i?void 0:i.length))return[];const s=new Map((e.zones||[]).map(e=>[e.zone_id,e.zone])),a=new Map;for(const i of e.segments){let e=a.get(i.zone_id);e||(e={zoneId:i.zone_id,name:s.get(i.zone_id)||t(i.zone_id),segments:[]},a.set(i.zone_id,e)),e.segments.push(i)}return[...a.values()]})(this.timeline,e=>`#${e}`);if(!i.length)return V`<div class="empty">${this._t("nothing")}</div>`;const s=Math.max(null!==(t=null===(e=this.timeline)||void 0===e?void 0:e.total)&&void 0!==t?t:0,...i.flatMap(e=>e.segments.map(e=>e.end))),a=((e,t=6)=>{var i;if(!(e>0))return[0];const s=null!==(i=_n.find(i=>e/i<=t))&&void 0!==i?i:3600*Math.ceil(e/t/3600),a=[];for(let t=0;t<=e+1e-6;t+=s)a.push(t);return a})(s),n=new Set(i.flatMap(e=>e.segments.map(e=>e.kind)));return V`
      <div class="timeline" role="img" aria-label=${this._t("title")}>
        ${i.map(e=>V`
            <div class="row">
              <div class="name" title=${e.name}>
                <span>${e.name}</span>
                <span class="sub"
                  >${ta((e=>e.segments.filter(e=>"water"===e.kind).reduce((e,t)=>e+(t.end-t.start),0))(e))}</span
                >
              </div>
              <div class="track">
                ${a.map(e=>V`<span
                      class="grid"
                      style="left: ${wn(e,s)}%"
                    ></span>`)}
                ${e.segments.map(t=>V`
                    <span
                      class="seg ${t.kind}"
                      style="left: ${wn(t.start,s)}%; width: ${wn(t.end-t.start,s)}%"
                      title=${this._title(e.name,t)}
                    ></span>
                  `)}
              </div>
            </div>
          `)}
        <div class="row axis">
          <div class="name"></div>
          <div class="track">
            ${a.map((e,t)=>V`
                <span
                  class="tick ${0===t?"first":""} ${t===a.length-1&&t>0?"last":""}"
                  style="left: ${wn(e,s)}%"
                  >${this._clock(e)}</span
                >
              `)}
          </div>
        </div>
        <div class="legend">
          <span><i class="seg water"></i>${this._t("water")}</span>
          ${n.has("fill")?V`<span><i class="seg fill"></i>${this._t("fill")}</span>`:""}
          ${n.has("soak")?V`<span><i class="seg soak"></i>${this._t("soak")}</span>`:""}
          <span class="total"
            >${this._t("total").replace("{time}",ta(s))}</span
          >
        </div>
      </div>
    `}};bn.styles=l`
    :host {
      display: block;
      margin: 8px 0;
    }
    .empty {
      opacity: 0.6;
      font-style: italic;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 26px;
    }
    .name {
      flex: 0 0 30%;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.9em;
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .name .sub {
      font-size: 0.8em;
      opacity: 0.65;
    }
    .track {
      position: relative;
      flex: 1;
      height: 18px;
      border-radius: 4px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .seg {
      position: absolute;
      top: 2px;
      bottom: 2px;
      min-width: 2px;
      border-radius: 3px;
      box-sizing: border-box;
    }
    .seg.water {
      background: var(--primary-color, #03a9f4);
    }
    .seg.fill {
      background: var(--primary-color, #03a9f4);
      opacity: 0.4;
    }
    .seg.soak {
      background: repeating-linear-gradient(
        135deg,
        transparent 0 3px,
        var(--secondary-text-color, #888) 3px 4px
      );
      opacity: 0.5;
    }
    .axis .track {
      background: none;
      height: 16px;
    }
    .tick {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.75em;
      opacity: 0.7;
      white-space: nowrap;
    }
    .tick.first {
      transform: none;
    }
    .tick.last {
      transform: translateX(-100%);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 6px;
      font-size: 0.8em;
      opacity: 0.85;
      align-items: center;
    }
    .legend i {
      position: relative;
      display: inline-block;
      width: 14px;
      height: 10px;
      margin-right: 4px;
      vertical-align: middle;
      top: auto;
      bottom: auto;
    }
    .legend .total {
      margin-left: auto;
    }
  `,i([fe({attribute:!1})],bn.prototype,"timeline",void 0),i([fe()],bn.prototype,"lang",void 0),i([fe()],bn.prototype,"start",void 0),bn=i([pe("si-program-timeline")],bn);const $n=["var(--blue-color, #2196f3)","var(--orange-color, #ff9800)","var(--green-color, #4caf50)","var(--purple-color, #9c27b0)","var(--teal-color, #009688)","var(--pink-color, #e91e63)","var(--amber-color, #ffc107)","var(--indigo-color, #3f51b5)"];let xn=class extends ce{constructor(){super(...arguments),this.planning=[],this.today=[],this.lang="en",this.days=7,this.programLabel=(e,t)=>t}_t(e){return di(`week.${e}`,this.lang)}_clock(e){const t=Math.floor(e/3600)%24,i=Math.floor(e%3600/60),s=new Date(2e3,0,1,t,i);return new Intl.DateTimeFormat(this.lang,{hour:"2-digit",minute:"2-digit"}).format(s)}_dayLabel(e,t){return 0===t?this._t("today"):1===t?this._t("tomorrow"):new Intl.DateTimeFormat(this.lang,{weekday:"short",day:"numeric"}).format(e)}_title(e){var t,i,s,a;const n=e.run,o=new Date(n.expected_start||n.start),r=new Date(n.expected_end||n.end),l=new Intl.DateTimeFormat(this.lang,{hour:"2-digit",minute:"2-digit"}),d=[`${this.programLabel(n.program_id,n.program)} · ${l.format(o)} - ${l.format(r)}`];for(const e of n.steps||[])d.push((e.zones||[]).map(e=>{var t,i;return`${e.zone} ${ta(null!==(i=null!==(t=e.expected_seconds)&&void 0!==t?t:e.seconds)&&void 0!==i?i:0)}`}).join(" + "));const h=e=>di(`planning.${e}`,this.lang),c=e=>this.programLabel(null==e?void 0:e.program_id,null==e?void 0:e.program)||"",u=e=>(e||[]).map(e=>e.zone).join(", ");n.after&&d.push((n.after.offset_minutes?h("after_program_offset").replace("{minutes}",String(n.after.offset_minutes)):h("after_program")).replace("{program}",c(n.after))),n.waits_for&&d.push(h("waits_for").replace("{program}",c(n.waits_for)).replace("{start}",l.format(o)).replace("{end}",l.format(r)));for(const e of n.watered_twice||[])d.push(h("watered_twice").replace("{zones}",e.zone).replace("{program}",c(e.by)));return(null===(t=n.zones_without_valve)||void 0===t?void 0:t.length)&&!n.nothing_to_water&&d.push(`${h("no_valve")} ${u(n.zones_without_valve)}`),n.running?d.push(this._t("running")):n.done?d.push(this._t("done")):n.nothing_to_water?d.push((null===(i=n.zones_without_valve)||void 0===i?void 0:i.length)?`${h("nothing_no_valve")} ${u(n.zones_without_valve)}`:this._t("nothing")):"suspended"===n.skipped_reason?d.push(h("expected_skipped_suspended").replace("{when}",sa(n.suspended_until,this.lang,{tomorrow:di("card.tomorrow",this.lang),yesterday:di("card.yesterday",this.lang)}))):"precipitation"===n.skipped_reason?d.push(h("expected_skipped_precipitation").replace("{mm}",String(Math.round(10*(null!==(a=null===(s=n.forecast)||void 0===s?void 0:s.forecast_mm)&&void 0!==a?a:0))/10))):n.skipped_reason&&d.push(this._t("held")),d.filter(Boolean).join("\n")}_open(e){this.dispatchEvent(new CustomEvent("open-program",{detail:{program_id:e.program_id},bubbles:!0,composed:!0}))}_setDays(e){this.dispatchEvent(new CustomEvent("days-changed",{detail:{days:e},bubbles:!0,composed:!0}))}render(){const e=new Date,t=[...this.today||[],...this.planning||[]],i=((e,t,i,s=4)=>{var a;const n=gn(i),o=Array.from({length:t},(e,t)=>({date:mn(n,t),blocks:[]})),r=[];let l=1/0,d=-1/0;for(const t of e||[]){const e=new Date(t.expected_start||t.start),i=new Date(t.expected_end||t.end);if(isNaN(e.getTime())||isNaN(i.getTime()))continue;r.includes(t.program_id)||r.push(t.program_id);const s=i>e?i:new Date(e.getTime()+6e4);for(const i of o){const n=i.date.getTime(),o=mn(i.date,1).getTime();if(s.getTime()<=n||e.getTime()>=o)continue;const r=Math.max(0,(e.getTime()-n)/1e3),h=Math.min(un,(s.getTime()-n)/1e3),c=(e.getTime()-n)/1e3,u=((null===(a=t.timeline)||void 0===a?void 0:a.segments)||[]).filter(e=>"soak"===e.kind).map(e=>({from:Math.max(r,c+e.start),to:Math.min(h,c+e.end)})).filter(e=>e.to>e.from);i.blocks.push({run:t,from:r,to:h,cutBefore:e.getTime()<n,cutAfter:s.getTime()>o,soaks:u,held:!!t.skipped_reason||!!t.nothing_to_water}),l=Math.min(l,r),d=Math.max(d,h)}}if(!isFinite(l))return{days:o,from:0,to:un,programs:r};let h=Math.max(0,Math.floor(l/pn)*pn-pn),c=Math.min(un,Math.ceil(d/pn)*pn+pn);const u=s*pn-(c-h);return u>0&&(h=Math.max(0,h-Math.ceil(u/2/pn)*pn),c=Math.min(un,h+s*pn),h=Math.max(0,c-s*pn)),{days:o,from:h,to:c,programs:r}})(t,this.days,e),s=(e=>{const t=(e.to-e.from)/pn,i=t<=6?1:t<=12?2:t<=18?3:6,s=[];for(let t=Math.ceil(e.from/(i*pn))*i*pn;t<=e.to;t+=i*pn)s.push(t);return s})(i),a=e=>$n[Math.max(0,i.programs.indexOf(e))%$n.length],n=(e.getTime()-new Date(e.toDateString()).getTime())/1e3,o=new Map(t.map(e=>[e.program_id,this.programLabel(e.program_id,e.program)]));return V`
      <div class="head">
        <div class="choices" role="group">
          ${[3,7,14].map(e=>V`<button
                class=${e===this.days?"on":""}
                @click=${()=>this._setDays(e)}
              >
                ${this._t("days").replace("{n}",String(e))}
              </button>`)}
        </div>
        <div class="legend">
          ${i.programs.map(e=>V`<span
                ><i style="background: ${a(e)}"></i>${o.get(e)}</span
              >`)}
        </div>
      </div>
      <div class="week">
        ${i.days.map((e,t)=>V`
            <div class="row">
              <div class="day ${0===t?"today":""}">
                ${this._dayLabel(e.date,t)}
              </div>
              <div class="track">
                ${s.map(e=>V`<span
                      class="grid"
                      style="left: ${fn(e,i)}%"
                    ></span>`)}
                ${0===t&&n>=i.from&&n<=i.to?V`<span
                      class="now"
                      style="left: ${fn(n,i)}%"
                    ></span>`:q}
                ${e.blocks.map(e=>V`
                    <button
                      class="run ${e.held?"held":""} ${e.run.done?"done":""} ${e.run.running?"running":""} ${e.cutBefore?"cut-before":""} ${e.cutAfter?"cut-after":""}"
                      style="left: ${fn(e.from,i)}%; width: ${Math.max(.6,fn(e.to,i)-fn(e.from,i))}%; --run: ${a(e.run.program_id)}"
                      title=${this._title(e)}
                      @click=${()=>this._open(e.run)}
                    >
                      ${e.soaks.map(t=>V`<span
                            class="soak"
                            style="left: ${(t.from-e.from)/Math.max(1,e.to-e.from)*100}%; width: ${(t.to-t.from)/Math.max(1,e.to-e.from)*100}%"
                          ></span>`)}
                    </button>
                  `)}
              </div>
            </div>
          `)}
        <div class="row axis">
          <div class="day"></div>
          <div class="track">
            ${s.map((e,t)=>V`<span
                  class="tick ${0===t&&e===i.from?"first":""} ${t===s.length-1&&e===i.to?"last":""}"
                  style="left: ${fn(e,i)}%"
                  >${this._clock(e)}</span
                >`)}
          </div>
        </div>
      </div>
      ${(this.planning||[]).length?q:V`<div class="empty">${this._t("empty")}</div>`}
    `}};xn.styles=l`
    :host {
      display: block;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .choices {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      overflow: hidden;
    }
    .choices button {
      border: 0;
      background: none;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85em;
      padding: 4px 12px;
      cursor: pointer;
    }
    .choices button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.85em;
    }
    .legend i {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 4px;
      vertical-align: -1px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 28px;
    }
    .day {
      flex: 0 0 84px;
      font-size: 0.85em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .day.today {
      font-weight: 600;
    }
    .track {
      position: relative;
      flex: 1;
      height: 22px;
      border-radius: 4px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .now {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: var(--error-color, #db4437);
      z-index: 2;
    }
    .run {
      position: absolute;
      top: 3px;
      bottom: 3px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: var(--run);
      cursor: pointer;
      overflow: hidden;
      min-width: 4px;
    }
    .run:hover {
      filter: brightness(1.1);
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .run.held {
      opacity: 0.35;
      background: repeating-linear-gradient(
        45deg,
        var(--run) 0 4px,
        transparent 4px 7px
      );
    }
    /* Over today: plain, fainter; going on: outlined. */
    .run.done {
      opacity: 0.55;
    }
    .run.running {
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .run.cut-before {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .run.cut-after {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .soak {
      position: absolute;
      top: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.75) 0 2px,
        transparent 2px 5px
      );
    }
    .axis .track {
      background: none;
      height: 16px;
    }
    .tick {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.75em;
      opacity: 0.7;
      white-space: nowrap;
    }
    .tick.first {
      transform: none;
    }
    .tick.last {
      transform: translateX(-100%);
    }
    .empty {
      margin-top: 8px;
      opacity: 0.6;
      font-style: italic;
    }
    @media (max-width: 500px) {
      .day {
        flex-basis: 56px;
      }
    }
  `,i([fe({attribute:!1})],xn.prototype,"planning",void 0),i([fe({attribute:!1})],xn.prototype,"today",void 0),i([fe()],xn.prototype,"lang",void 0),i([fe({type:Number})],xn.prototype,"days",void 0),i([fe({attribute:!1})],xn.prototype,"programLabel",void 0),xn=i([pe("si-week-view")],xn);let kn=class extends ce{constructor(){super(...arguments),this.schedules=[],this.weather={state:"off"},this.notify=!1,this.lang="en"}_t(e,t={}){let i=di(`flow.${e}`,this.lang);for(const[e,s]of Object.entries(t))i=i.replace(`{${e}}`,s);return i}_verdict(e){if("yes"===e.state)return e.unread?this._t("weather_yes_unread",{reason:di(`panels.info.cards.decision.check-${e.unread}`,this.lang)}):this._t("weather_yes");if("no"!==e.state)return this._t("weather_sub");let t=di(`panels.info.cards.decision.check-${e.reason}`,this.lang);return"precipitation"===e.reason&&null!=e.mm&&(t+=` ${Math.round(10*e.mm)/10} mm`),this._t("weather_no",{reason:t})}_openZone(e){this.dispatchEvent(new CustomEvent("open-zone",{detail:{zone_id:e},bubbles:!0,composed:!0}))}_arrow(e){return V`<div class="arrow">
      ${e?V`<span class="arrow-label">${e}</span>`:q}
    </div>`}render(){const e=this.flow;if(!e||!e.steps.length&&!e.idle.length)return V`<div class="empty">${this._t("empty")}</div>`;const t=e=>ta(Math.abs(e));return V`
      <div class="flow">
        <div class="node start">
          <div class="title">${this._t("start")}</div>
          ${this.schedules.length?this.schedules.map(e=>V`<div class="sub">${e}</div>`):V`<div class="sub">${this._t("by_hand")}</div>`}
        </div>
        ${"off"!==this.weather.state?V`${this._arrow()}
              <div class="branch">
                <div
                  class="node weather ${this.weather.state} ${"yes"===this.weather.state&&this.weather.unread?"unread":""}"
                >
                  <div class="title">${this._t("weather")}</div>
                  <div class="sub">${this._verdict(this.weather)}</div>
                </div>
                <div class="side">${this._t("otherwise")}</div>
              </div>`:q}
        ${e.supplies.map(e=>V`${this._arrow()}
              <div class="node supply">
                <div class="title">
                  ${this._t("supply_on",{name:e.name})}
                </div>
                ${e.before?V`<div class="sub">
                      ${this._t(e.before>0?"supply_before":"supply_after_valves",{time:t(e.before)})}
                    </div>`:q}
              </div>`)}
        ${e.steps.map((i,s)=>{var a,n,o,r;return V`
            ${this._arrow(0===s?void 0:(null!==(a=e.steps[s-1].waitAfter)&&void 0!==a?a:0)>0?this._t("wait",{time:t(null!==(n=e.steps[s-1].waitAfter)&&void 0!==n?n:0)}):(null!==(o=e.steps[s-1].waitAfter)&&void 0!==o?o:0)<0?this._t("overlap",{time:t(null!==(r=e.steps[s-1].waitAfter)&&void 0!==r?r:0)}):void 0)}
            <div class="step">
              <div class="step-head">
                <span
                  >${this._t("step",{n:String(s+1)})}${i.zones.length>1?` · ${this._t("together")}`:""}</span
                >
                ${Math.max(...i.zones.map(e=>e.passes))>1?V`<span
                      >${this._t("passes",{n:String(Math.max(...i.zones.map(e=>e.passes)))})}</span
                    >`:q}
              </div>
              <div class="valves">
                ${i.zones.map(e=>V`
                    <button
                      class="node valve"
                      @click=${()=>this._openZone(e.zoneId)}
                    >
                      <div class="title">${e.name}</div>
                      <div class="sub">${ta(e.seconds)}</div>
                    </button>
                  `)}
              </div>
              ${i.soakSeconds?V`<div class="note">
                    ↻ ${this._t("soak",{time:t(i.soakSeconds)})}
                  </div>`:q}
            </div>
          `})}
        ${e.idle.length?V`${e.steps.length?q:this._arrow()}
              <div class="step idle">
                <div class="step-head">
                  <span>${this._t("idle")}</span>
                </div>
                <div class="valves">
                  ${e.idle.map(e=>V`
                      <button
                        class="node valve"
                        @click=${()=>this._openZone(e.zoneId)}
                      >
                        <div class="title">${e.name}</div>
                        <div class="sub">${this._t("no_water")}</div>
                      </button>
                    `)}
                </div>
              </div>`:q}
        ${e.tours>1?V`<div class="note loop">
              ↻ ${this._t("tours",{n:String(e.tours)})}
            </div>`:q}
        ${e.supplies.map(e=>V`${this._arrow()}
              <div class="node supply">
                <div class="title">
                  ${this._t("supply_off",{name:e.name})}
                </div>
                ${e.after?V`<div class="sub">
                      ${this._t("supply_after",{time:t(e.after)})}
                    </div>`:q}
              </div>`)}
        ${this.notify?V`${this._arrow()}
              <div class="node end">
                <div class="title">${this._t("notify")}</div>
              </div>`:q}
      </div>
    `}};kn.styles=l`
    :host {
      display: block;
      margin: 8px 0;
    }
    .empty {
      opacity: 0.6;
      font-style: italic;
    }
    .flow {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .node {
      box-sizing: border-box;
      min-width: 180px;
      max-width: 100%;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      text-align: center;
      font: inherit;
      color: var(--primary-text-color);
    }
    .title {
      font-weight: 500;
    }
    .sub {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    .weather.yes {
      border-color: var(--success-color, #43a047);
    }
    .weather.yes .sub {
      color: var(--success-color, #43a047);
    }
    .weather.yes.unread {
      border-color: var(--warning-color, #ffa600);
    }
    .weather.yes.unread .sub {
      color: var(--warning-color, #ffa600);
    }
    .weather.no {
      border-color: var(--error-color, #db4437);
    }
    .weather.no .sub {
      color: var(--error-color, #db4437);
      font-weight: 500;
    }
    .supply {
      border-color: var(--success-color, #43a047);
    }
    .valve {
      border-color: var(--primary-color);
      cursor: pointer;
      min-width: 130px;
    }
    .valve:hover {
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    .arrow {
      position: relative;
      width: 2px;
      height: 26px;
      background: var(--secondary-text-color);
      opacity: 0.6;
      margin-bottom: 6px;
    }
    .arrow::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: -4px;
      border: 5px solid transparent;
      border-top: 6px solid var(--secondary-text-color);
      border-bottom: 0;
    }
    .arrow-label {
      position: absolute;
      left: 10px;
      top: 4px;
      white-space: nowrap;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .branch {
      position: relative;
      display: flex;
      justify-content: center;
    }
    .side {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      white-space: nowrap;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .side::before {
      content: "⇢ ";
    }
    .step {
      box-sizing: border-box;
      width: min(100%, 520px);
      padding: 8px 12px 10px;
      border: 1px dashed var(--divider-color);
      border-radius: 12px;
    }
    .step-head {
      display: flex;
      justify-content: space-between;
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .valves {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
    .note {
      margin-top: 6px;
      text-align: center;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .loop {
      margin-top: 8px;
    }
    .idle {
      margin-top: 10px;
      opacity: 0.55;
    }
    @media (max-width: 500px) {
      .side {
        position: static;
        transform: none;
        margin-left: 8px;
        align-self: center;
      }
      .branch {
        flex-wrap: wrap;
      }
    }
  `,i([fe({attribute:!1})],kn.prototype,"flow",void 0),i([fe({attribute:!1})],kn.prototype,"schedules",void 0),i([fe({attribute:!1})],kn.prototype,"weather",void 0),i([fe({type:Boolean})],kn.prototype,"notify",void 0),i([fe()],kn.prototype,"lang",void 0),kn=i([pe("si-program-flow")],kn);const zn={mode:"calculated",passes:1,max_litres:0,min_seconds:0,max_seconds:0,adjust_seconds:0,delay:null,enabled:!0},Sn={enabled:!0,type:"time",offset_minutes:0,anchor:"start",every_n_days:1,every_offset:0,parity:"any",from_date:null,until_date:null,weather:!0,hard_deadline:!1,fallback_time:null},Mn=(e,t)=>void 0===e||e===t||Array.isArray(e)&&0===e.length,Tn=(e,t,i=[])=>{const s={};for(const[a,n]of Object.entries(e))i.includes(a)||Mn(n,a in t?t[a]:null)||(s[a]=n);return s},On=(e,t,i=[])=>{var s,a,n,o,r;const l=e=>{var t;if(!e)return null;const s=i.find(t=>t.id===e),a=String(null!==(t=null==s?void 0:s.name)&&void 0!==t?t:"").trim(),n=i.filter(e=>{var t;return String(null!==(t=e.name)&&void 0!==t?t:"").trim().toLowerCase()===a.toLowerCase()});return s&&a&&1===n.length&&!i.some(e=>e.id===a)?a:e},d=new Map;for(const e of t){const t=String(null!==(s=e.name)&&void 0!==s?s:"").trim().toLowerCase();d.set(t,(null!==(a=d.get(t))&&void 0!==a?a:0)+1)}const h=e=>{var i;const s=t.find(t=>t.id===e),a=String(null!==(i=null==s?void 0:s.name)&&void 0!==i?i:"").trim().toLowerCase();return s&&a&&1===d.get(a)&&!/^-?\d+$/.test(a)?String(s.name).trim():e},c={id:e.id,name:e.name};return e.delay&&(c.delay=e.delay),(null!==(n=e.tours)&&void 0!==n?n:1)>1&&(c.tours=e.tours),c.steps=(e.steps||[]).map(e=>{const t=Tn(e,zn,["zones","mode","percent","seconds"]),i={id:e.id,zones:(e.zones||[]).map(h)};return e.mode&&"calculated"!==e.mode&&(i.mode=e.mode),"percent"===e.mode&&(i.percent=e.percent),"fixed"===e.mode&&(i.seconds=e.seconds),delete t.id,Object.assign(Object.assign({},i),t)}),c.schedules=(e.schedules||[]).map(e=>{if("after"===e.type){const t=Tn(e,Sn,["time","event","azimuth","anchor","fallback_time","hard_deadline"]),i={};for(const[s,a]of Object.entries(t))"after_program"!==s&&(i[s]=a,"type"===s&&(i.after_program=l(e.after_program)));return i}const t="sun"===e.type?["time","after_program"]:["event","offset_minutes","after_program"];return Tn(e,Sn,t)}),(null===(r=null===(o=e.notify)||void 0===o?void 0:o.targets)||void 0===r?void 0:r.length)&&(c.notify=Object.assign({},e.notify)),c},An=e=>!e||"object"!=typeof e||Array.isArray(e)?null:Object.assign({},e),Cn=e=>"after"===(null==e?void 0:e.type)&&e.after_program?e.after_program:null,Hn=(e,t,i)=>i===t||((e,t)=>{const i=new Set,s=[t];for(;s.length;){const t=s.pop(),a=e.find(e=>e.id===t);for(const e of(null==a?void 0:a.schedules)||[]){const t=Cn(e);t&&!i.has(t)&&(i.add(t),s.push(t))}}return i})(e,i).has(t),En=(e,t)=>t?e.filter(e=>void 0!==e.id&&(e.schedules||[]).some(e=>Cn(e)===t)):[],Dn=(e,t)=>"after"===t.type&&!e.some(e=>{var i;return void 0!==e.id&&e.id===(null!==(i=t.after_program)&&void 0!==i?i:"")}),Nn=new Set(["send_message","persistent_notification","notify"]),In=["postponed","rain_sensor","freeze","wind","precipitation","days_between","soil_moisture"],jn=(e,t,i)=>{const s=e("yaml_only_item");return(s.includes("{label}")?s:"{label}: {value}").replace("{label}",t).replace("{value}",i)},Rn=e=>({text:e,yamlOnly:!1}),Ln=e=>({text:e,yamlOnly:!0});function Pn(e,{t:t}){var i;const s=[];return(null!==(i=e.tours)&&void 0!==i?i:1)>1&&s.push(Rn(jn(t,t("tours"),`${e.tours}`))),s}function Un(e,{t:t,monthName:i,days:s}){var a;const n=[],o=null!==(a=e.every_offset)&&void 0!==a?a:0;if(o>0&&n.push(Rn(jn(t,t("schedule_every_offset"),s(o)))),"even"!==e.parity&&"odd"!==e.parity||n.push(Rn(jn(t,t("schedule_parity"),t(`parity_${e.parity}`)))),(e.days_of_month||[]).length&&n.push(Rn(jn(t,t("schedule_days_of_month"),(e.days_of_month||[]).map(e=>"last"===e?t("last_word"):`${e}`).join(", ")))),(e.months||[]).length&&n.push(Rn(jn(t,t("schedule_months"),function(e,t){const i=[...new Set(e)].filter(e=>e>=1&&e<=12).sort((e,t)=>e-t),s=[];for(let e=0;e<i.length;){let a=e;for(;a+1<i.length&&i[a+1]===i[a]+1;)a++;if(a-e>=2)s.push(`${t(i[e]-1)}–${t(i[a]-1)}`);else for(let n=e;n<=a;n++)s.push(t(i[n]-1));e=a+1}return s.join(", ")}(e.months,i)))),e.fallback_time&&n.push(Ln(jn(t,t("schedule_fallback_time"),"previous"===e.fallback_time?t("schedule_fallback_previous"):e.fallback_time))),Array.isArray(e.skip_conditions)){const i=In.filter(t=>"postponed"===t||e.skip_conditions.includes(t));n.push(Rn(jn(t,t("conditions_subset"),i.map(e=>t(`condition_${e}`)).join(", "))))}return n}function Bn(e,t,i){const s=(e=>"advanced"===e)(i)?t.filter(e=>e.yamlOnly):t;return s.length?{owner:e,items:s.map(e=>e.text),advanced:s.some(e=>!e.yamlOnly)}:null}function Fn(e,t,i){const s=[Bn("",Pn(e,i),t),...(e.steps||[]).map((e,s)=>Bn(`${i.t("step")} ${s+1}`,function(e,{t:t,num:i}){var s,a;const n=[],o=null!==(s=e.adjust_seconds)&&void 0!==s?s:0;return 0!==o&&n.push(Rn(jn(t,t("adjust_seconds"),`${o>0?"+":""}${o} s`))),(null!==(a=e.min_deficit_mm)&&void 0!==a?a:0)>0&&n.push(Rn(jn(t,t("min_deficit_short"),`${(null!=i?i:String)(e.min_deficit_mm)} mm`))),n}(e,i),t)),...(e.schedules||[]).map((e,s)=>Bn(`${i.t("schedule")} ${s+1}`,Un(e,i),t))];return s.filter(e=>null!==e)}function Wn(e){return e.some(e=>e.advanced)}function Yn(e,t,i){var s;const a=[],n=(null!==(s=e.safety_off_state_key)&&void 0!==s?s:"").trim();return n&&a.push(Ln(jn(i,i("safety-off-state-key"),n))),"number"==typeof e.open_resends&&a.push(Rn(jn(i,i("open-resends"),`${e.open_resends}`))),Bn("",a,t)}let Vn=class extends ce{constructor(){super(...arguments),this.value=""}showDialog(e){return this._options=e,this.value="",new Promise(e=>this._resolve=e)}_answer(e){const t=this._resolve;this._resolve=void 0,this._options=void 0,null==t||t(e)}render(){var e,t,i;if(!this._options)return V``;const s=(e,t)=>{var i,s;return(null===(s=null===(i=this.hass)||void 0===i?void 0:i.localize)||void 0===s?void 0:s.call(i,e))||t};return V`
      <ha-dialog
        open
        .heading=${s("ui.dialogs.generic.default_confirmation_title","Are you sure?")}
        @closed=${e=>{var t,i;"ha-dialog"===(null===(i=null===(t=e.target)||void 0===t?void 0:t.tagName)||void 0===i?void 0:i.toLowerCase())&&this._answer(!1)}}
      >
        <div class="text">${this._options.text}</div>
        ${this._options.number?V`
              <label class="number">
                <span>${this._options.number.label}</span>
                <span class="field">
                  <input
                    type="number"
                    inputmode="decimal"
                    .placeholder=${null!==(e=this._options.number.placeholder)&&void 0!==e?e:""}
                    min=${null!==(t=this._options.number.min)&&void 0!==t?t:""}
                    max=${null!==(i=this._options.number.max)&&void 0!==i?i:""}
                    @input=${e=>this.value=e.target.value}
                  />
                  ${this._options.number.unit?V`<span class="unit"
                        >${this._options.number.unit}</span
                      >`:""}
                </span>
              </label>
            `:""}
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            appearance="plain"
            @click=${()=>this._answer(!1)}
          >
            ${s("ui.common.cancel","Cancel")}
          </ha-button>
          <ha-button
            slot="primaryAction"
            appearance="accent"
            variant=${this._options.destructive?"danger":"brand"}
            @click=${()=>this._answer(!0)}
          >
            ${this._options.confirmText||s("ui.dialogs.generic.ok","OK")}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}static get styles(){return l`
      .text {
        color: var(--primary-text-color);
        white-space: pre-line;
      }
      .number {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 16px;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .number .field {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .number input {
        flex: 1;
        min-width: 0;
        padding: 10px 12px;
        font: inherit;
        font-size: 1rem;
        color: var(--primary-text-color);
        background: var(--secondary-background-color, transparent);
        border: none;
        border-bottom: 1px solid var(--secondary-text-color);
        border-radius: 4px 4px 0 0;
      }
      .number input:focus {
        outline: none;
        border-bottom: 2px solid var(--primary-color);
      }
      .number .unit {
        color: var(--secondary-text-color);
      }
    `}};async function Zn(e,t){const i=document.createElement("smart-irrigation-confirmation-dialog");i.hass=e,document.body.appendChild(i);try{return await i.showDialog(t)}finally{i.remove()}}i([fe({attribute:!1})],Vn.prototype,"hass",void 0),i([ve()],Vn.prototype,"_options",void 0),Vn=i([pe("smart-irrigation-confirmation-dialog")],Vn);const Gn=l`
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
`,qn=l`
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
`;let Jn=class extends ce{async showDialog(e){if(this.params=e,this._error=void 0,e.createTrigger)this._trigger={type:vi,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const t=e.trigger;this._trigger=function(e){var t,i,s,a,n,o;const r={type:e.type,name:null!==(t=e.name)&&void 0!==t?t:"",enabled:null===(i=e.enabled)||void 0===i||i,offset_minutes:null!==(s=e.offset_minutes)&&void 0!==s?s:0,account_for_duration:null===(a=e.account_for_duration)||void 0===a||a};return e.type===_i?Object.assign(Object.assign({},r),{azimuth_angle:null!==(n=e.azimuth_angle)&&void 0!==n?n:90}):e.type===wi?Object.assign(Object.assign({},r),{at:null!==(o=e.at)&&void 0!==o?o:yi}):r}(t)}else this._trigger=void 0;await this.updateComplete}_closeDialog(){this.params=void 0,this._error=void 0,this._trigger=void 0}_saveTrigger(){var e,i,s,a,n,o,r;if(!this._trigger||!this.params)return;const l=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(l){const e=null!==(s=null!==(i=l.value)&&void 0!==i?i:l.selected)&&void 0!==s?s:void 0;if(e&&e!==this._trigger.type){if(e===_i)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(a=this._trigger.azimuth_angle)&&void 0!==a?a:90});else if(e===wi){const i=this._trigger,{azimuth_angle:s}=i,a=t(i,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},a),{type:e,at:null!==(n=this._trigger.at)&&void 0!==n?n:yi})}else{const i=this._trigger,{azimuth_angle:s,at:a}=i,n=t(i,["azimuth_angle","at"]);this._trigger=Object.assign(Object.assign({},n),{type:e})}this.requestUpdate()}}if(null===(o=this._trigger.name)||void 0===o?void 0:o.trim())if(this._trigger.type!==wi||/^\d{1,2}:\d{2}$/.test(null!==(r=this._trigger.at)&&void 0!==r?r:"")){if(this._trigger.type===_i){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void(this._error=di("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else this._error=di("irrigation_start_triggers.validation.time_invalid",this.hass.language);else this._error=di("irrigation_start_triggers.validation.name_required",this.hass.language)}_ask(e,t=!1){return Zn(this.hass,{text:e,destructive:t})}async _deleteTrigger(){var e,t,i,s;this.params&&!this.params.createTrigger&&await this._ask(di("irrigation_start_triggers.confirm_delete",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en").replace("{name}",null!==(s=null===(i=this._trigger)||void 0===i?void 0:i.name)&&void 0!==s?s:""),!0)&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,t;if(!this.params||!this._trigger)return V``;const i=this.params.createTrigger,s=di(i?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return V`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${Na}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${s}</span>
        </div>

        <div class="wrapper">
          ${this._error?V`<ha-alert alert-type="error">${this._error}</ha-alert>`:""}
          <div class="dialog-help">
            ${di("irrigation_start_triggers.dialog.help",this.hass.language)}
            <code>smart_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${di("irrigation_start_triggers.fields.name.name",this.hass.language)}</label
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
              .label=${di("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${vi}>
                ${di("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${"sunset"}>
                ${di("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${_i}>
                ${di("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${wi}>
                ${di("irrigation_start_triggers.trigger_types.time",this.hass.language)}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${di("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${di("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}</label
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
              .label=${di("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===wi?V`
                <div class="form-group">
                  <label class="form-label"
                    >${di("irrigation_start_triggers.fields.at.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="time"
                    .value=${this._trigger.at||yi}
                    @input=${this._atChanged}
                  />
                </div>
              `:""}
          ${this._trigger.type===_i?V`
                <div class="form-group">
                  <label class="form-label"
                    >${di("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}</label
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
            ${di("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </ha-button>
          ${i?"":V`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${di("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </ha-button>
              `}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${di("irrigation_start_triggers.dialog.save",this.hass.language)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}_nameChanged(e){const t=e.target;this._updateTrigger({name:t.value})}_typeChanged(e){var t,i,s,a,n,o,r,l,d,h,c,u,p,g,m,f,v,_,w,y,b,$,x,k;const z=null!==(a=null!==(i=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.value)&&void 0!==i?i:null===(s=e.target)||void 0===s?void 0:s.value)&&void 0!==a?a:null===(o=null===(n=this.shadowRoot)||void 0===n?void 0:n.querySelector("ha-select"))||void 0===o?void 0:o.value,S=String(z);let M;M=S===_i?{type:_i,name:null!==(l=null===(r=this._trigger)||void 0===r?void 0:r.name)&&void 0!==l?l:"",enabled:null===(h=null===(d=this._trigger)||void 0===d?void 0:d.enabled)||void 0===h||h,offset_minutes:null!==(u=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==u?u:0,azimuth_angle:null!==(g=null===(p=this._trigger)||void 0===p?void 0:p.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(f=null===(m=this._trigger)||void 0===m?void 0:m.account_for_duration)||void 0===f||f}:{type:S,name:null!==(_=null===(v=this._trigger)||void 0===v?void 0:v.name)&&void 0!==_?_:"",enabled:null===(y=null===(w=this._trigger)||void 0===w?void 0:w.enabled)||void 0===y||y,offset_minutes:null!==($=null===(b=this._trigger)||void 0===b?void 0:b.offset_minutes)&&void 0!==$?$:0,account_for_duration:null===(k=null===(x=this._trigger)||void 0===x?void 0:x.account_for_duration)||void 0===k||k},this._trigger=M,this.requestUpdate()}_enabledChanged(e){const t=e.target;this._updateTrigger({enabled:t.checked})}_offsetChanged(e){const t=e.target;this._updateTrigger({offset_minutes:parseInt(t.value)||0})}_accountForDurationChanged(e){const t=e.target;this._updateTrigger({account_for_duration:t.checked})}_atChanged(e){const t=e.target.value;this._trigger=Object.assign(Object.assign({},this._trigger),{at:t})}_azimuthChanged(e){var t;if((null===(t=this._trigger)||void 0===t?void 0:t.type)!==_i)return;const i=e.target;let s=parseInt(i.value,10);isNaN(s)&&(s=90),this._updateTrigger({azimuth_angle:s})}static get styles(){return[qn,l`
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
      `]}};i([fe({attribute:!1})],Jn.prototype,"hass",void 0),i([fe({attribute:!1})],Jn.prototype,"params",void 0),i([ve()],Jn.prototype,"_trigger",void 0),i([ve()],Jn.prototype,"_error",void 0),Jn=i([pe("smart-irrigation-trigger-dialog")],Jn);const Kn=l`
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
  /* The hint of the row above it, set as close to it as a hint under a label.
     For rows whose control takes the whole line. */
  .row-hint {
    margin: -6px 0 12px 0;
  }
  /* A hint that says a setting will not do what it reads as. */
  .setting-hint.warning-hint {
    color: var(--warning-color, #ff9800);
  }
  /* Folded blocks of the Programs page: a program, a step, a schedule. */
  details.fold {
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    margin: 8px 0;
    padding: 0 12px;
  }
  details.fold > summary {
    cursor: pointer;
    padding: 10px 0;
    list-style-position: inside;
  }
  /* A summary line with a switch on its right (a step's or a schedule's
     "on"): the text takes the room, the switch keeps its own. */
  details.fold > summary .fold-head {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: calc(100% - 1.5em);
    vertical-align: middle;
  }
  details.fold > summary .fold-head-text {
    flex: 1;
    min-width: 0;
  }
  details.fold[open] > summary {
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 8px;
  }
  /* "More options" inside a step or a schedule: lighter than a fold, a line
     to open and the rarely used settings under it. */
  details.more {
    margin: 8px 0;
  }
  /* A chevron, as Home Assistant's own expandable rows have, rather than the
     browser's triangle: that one reads as a play icon, and sat right above the
     Run now button, which has one. */
  details.more > summary {
    cursor: pointer;
    padding: 6px 0;
    color: var(--primary-color);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  details.more > summary::-webkit-details-marker {
    display: none;
  }
  details.more > summary::before {
    content: "";
    width: 6px;
    height: 6px;
    margin-left: 2px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.15s;
  }
  details.more[open] > summary::before {
    transform: rotate(45deg);
  }
  details.more > .more-body {
    border-left: 2px solid var(--divider-color);
    padding-left: 12px;
  }
  /* Inside a folded block: room under its last buttons, and titled sections. */
  .fold-body {
    padding-bottom: 12px;
  }
  .si-actions:not(:last-child) {
    margin-bottom: 12px;
  }
  .fold-section {
    font-weight: 500;
    margin: 16px 0 4px 0;
  }
  .fold-title {
    font-weight: 500;
  }
  /* A title with the switch that turns it on, on its right: no "Enabled". */
  .si-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  /* The title wraps, the switch keeps its size and its line. */
  .si-head > span:first-child,
  .setting-row:has(> ha-switch) > .setting-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .si-head > ha-switch,
  .setting-row > ha-switch,
  .fold-head > ha-switch {
    flex: 0 0 auto;
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
  /* A sub-group's title with its switch (the rain sensor, freeze and wind
     checks): it borrowed the collapsible card's head, padding included, so
     each one sat indented inside 24 px of empty space more than its rows
     (#1048). It is a line of the card, not a card's head. */
  .si-subgroup-title.si-head {
    padding: 0;
    cursor: auto;
    user-select: auto;
  }
  .si-subgroup-title:last-child {
    margin-bottom: 0;
  }
  /* Inside a card's content, whose own padding is room enough. */
  .card-content > .si-subgroup:first-child {
    padding-top: 0;
  }
  .card-content > .si-subgroup:last-child {
    padding-bottom: 0;
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
  /* The row just above a group of buttons gives up its line to theirs. */
  .setting-row:has(+ .si-actions) {
    border-bottom: 0;
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
    /* A switch stays on the right of its title, never under it (#1049),
       and its row is no taller than the switch needs (#1048). */
    .setting-row:has(> ha-switch) {
      flex-direction: row;
      align-items: center;
      gap: 12px;
      min-height: 44px;
    }
    .card-content > .si-subgroup {
      padding: 8px 0;
    }
    .card-content > .si-subgroup:first-child {
      padding-top: 0;
    }
    .card-content > .si-subgroup:last-child {
      padding-bottom: 0;
    }
    .field,
    .select-wrap,
    .num-field {
      width: 100%;
      max-width: 100%;
    }
  }
`,Xn="smart_irrigation.week_days";const Qn=new Set,eo=new Set,to={},io={},so={},ao={},no={};let oo=class extends(vn(ce)){constructor(){super(...arguments),this.mappings=[],this.zones=[],this.planning=[],this._unfolded=Qn,this._weekDays=function(){try{const e=Number(window.localStorage.getItem(Xn));return[3,7,14].includes(e)?e:7}catch(e){return 7}}(),this._history=[],this._wasWatering=!1,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null,t={},i=[];return s=>{t=Object.assign(Object.assign({},t),s),e&&clearTimeout(e);const a=new Promise(e=>i.push(e));return e=window.setTimeout(()=>{const s=t,a=i;t={},i=[],e=null,this.saveData(s).catch(()=>{}).then(()=>a.forEach(e=>e()))},500),a}})()}_isOpen(e){return this._unfolded.has(e)}_openNew(e,t){return this._unfolded.add(`${e}:${t}`),t}_setOpen(e,t){t?this._unfolded.add(e):this._unfolded.delete(e)}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:gi+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await Ka(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","continuousupdates","sensor_debounce","calc_log_enabled","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter(([e])=>t.includes(e)).reduce((e,[t,i])=>Object.assign(e,{[t]:i}),{}):{});try{this.zones=await en(this.hass)}catch(e){console.error("Error fetching zones:",e)}if("skip"===this.section)try{this.mappings=await on(this.hass)}catch(e){console.error("Error fetching sensor groups:",e)}this._fetchLive(!0)}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,t}}connectedCallback(){super.connectedCallback();let e=0;this._liveTimer=window.setInterval(()=>{e+=1,this._fetchLive(e%6==0)},5e3)}updated(e){var t,i,s;super.updated(e);const a=null===(i=null===(t=this.path)||void 0===t?void 0:t.params)||void 0===i?void 0:i.at;a&&a!==this._scrolledTo&&(null===(s=this.shadowRoot)||void 0===s?void 0:s.querySelector(`#section-${a}`))&&(this._scrolledTo=a,window.setTimeout(()=>{var e,t;null===(t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(`#section-${a}`))||void 0===t||t.scrollIntoView({block:"start"})},400))}firstUpdated(){this._fetchLive(!0),be().catch(e=>{console.error("Failed to load HA form:",e)})}render(){var e,t,i,s,a,n,o,r;if(!this.hass||!this.config||!this.data)return V`<div class="loading-indicator">
        ${di("common.loading-messages.configuration",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}
      </div>`;if(this.isLoading)return V`<div class="loading-indicator">
        ${di("common.loading-messages.general",this.hass.language)}
      </div>`;{const e="panels.general.cards.automatic-duration-calculation.labels",t=this.config.recalculate_before_start?"start":this.config.autocalcenabled?"time":"manual",l="advanced"===this.config.ui_mode,d=!0!==this.config.full_controller,h=d||"start"!==t,c=l||!this.config.hourly_calculation,u=l||!this.config.effective_rain,p=l||!!this.config.calc_log_enabled;let g=V`${h?V`<div class="card-content">
            ${this._selectRow(V`${di(`${e}.calc-when`,this.hass.language)}
                <si-info>
                  ${di(d?`${e}.calc-when-hint-calc-only`:`${e}.calc-when-hint`,this.hass.language)}
                </si-info>`,V`
                <option value="time" ?selected=${"time"===t}>
                  ${di(`${e}.calc-when-time`,this.hass.language)}
                </option>
                <option value="start" ?selected=${"start"===t}>
                  ${di(d?`${e}.calc-when-start-event`:`${e}.calc-when-start`,this.hass.language)}
                </option>
                <option value="manual" ?selected=${"manual"===t}>
                  ${di(`${e}.calc-when-manual`,this.hass.language)}
                </option>
              `,e=>{const t=e.target.value;this.handleConfigChange({autocalcenabled:"time"===t,recalculate_before_start:"start"===t})})}
          </div>`:""}`;("time"===t||"start"===t&&h)&&(g=V`${g}
          <div class="card-content">
            ${this._timeRow(di(`${e}.calc-time`,this.hass.language),this.config.calctime,e=>this.handleConfigChange({calctime:e}),di(`${e}.calc-time-hint`,this.hass.language))}
          </div>`);const m=c||u||p;g=V`${g}
      ${m?V`<div class="card-content">
            ${c?V`<div class="setting-row">
                  <div class="setting-label">
                    ${di(`${e}.hourly-calculation`,this.hass.language)}<si-info
                      >${di(`${e}.hourly-calculation-hint`,this.hass.language)}</si-info
                    >
                  </div>
                  <ha-switch
                    .checked=${this.config.hourly_calculation}
                    @change=${e=>this.handleConfigChange({hourly_calculation:e.target.checked})}
                  ></ha-switch>
                </div>`:""}
            ${u?V`<div class="setting-row">
                    <div class="setting-label">
                      ${di("weather_skip.effective_rain_label",this.hass.language)}<si-info
                        >${di("weather_skip.effective_rain_description",this.hass.language)}</si-info
                      >
                    </div>
                    <ha-switch
                      .checked=${!!this.config.effective_rain}
                      @change=${e=>this.handleConfigChange({effective_rain:e.target.checked})}
                    ></ha-switch>
                  </div>`:""}
            ${p?V`<div class="setting-row">
                    <div class="setting-label">
                      ${di("calculation_log.title",this.hass.language)}<si-info
                        >${di("calculation_log.description",this.hass.language)}
                        ${di("calculation_log.file_hint",this.hass.language)}</si-info
                      >
                    </div>
                    <ha-switch
                      .checked=${!!this.config.calc_log_enabled}
                      @change=${e=>this.handleConfigChange({calc_log_enabled:e.target.checked})}
                    ></ha-switch>
                  </div>`:""}
          </div>`:""}`;g=h||m?V`<ha-card
            ><h1 class="card-header">
              <span
                >${di("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}<si-info
                  >${di("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}</si-info
                ></span
              >
            </h1>
            ${g}</ha-card
          >`:V``;const f="advanced"===this.config.ui_mode,v=f||!1===this.config.autoupdateenabled||1!==Number(null!==(i=this.config.autoupdateinterval)&&void 0!==i?i:1)||(null!==(s=this.config.autoupdateschedule)&&void 0!==s?s:$i)!==$i||0!==Number(null!==(a=this.config.autoupdatedelay)&&void 0!==a?a:0);let _=V`<div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${di("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
          </div>
          <ha-switch
            .checked=${this.config.autoupdateenabled}
            @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
          ></ha-switch>
        </div>
      </div>`;this.data.autoupdateenabled&&(_=V`${_}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${di("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${null!==(n=this.data.autoupdateinterval)&&void 0!==n?n:""}
                  @change=${e=>this.saveData({autoupdateinterval:parseInt(e.target.value)})}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>this.saveData({autoupdateschedule:e.target.value})}
                  >
                    <option
                      value="${bi}"
                      ?selected=${this.data.autoupdateschedule===bi}
                    >
                      ${di("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${$i}"
                      ?selected=${this.data.autoupdateschedule===$i}
                    >
                      ${di("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${xi}"
                      ?selected=${this.data.autoupdateschedule===xi}
                    >
                      ${di("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Ua}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(f||0!==Number(null!==(o=this.config.autoupdatedelay)&&void 0!==o?o:0))&&(_=V`${_}
          <div class="card-content">
            ${this._numRow(di("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,e=>this.saveData({autoupdatedelay:parseInt(e)}),1)}
          </div>`),_=V`<ha-card
        ><h1 class="card-header">
          <span
            >${di("panels.general.cards.automatic-update.header",this.hass.language)}<si-info
              >${di("panels.general.cards.automatic-update.description",this.hass.language)}</si-info
            ></span
          >
        </h1>
        ${_}</ha-card
      >`;const w="advanced"===this.config.ui_mode||!!this.config.continuousupdates;let y=V`<div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${di("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
          </div>
          <ha-switch
            .checked=${this.config.continuousupdates}
            @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
          ></ha-switch>
        </div>
      </div>`;this.data.continuousupdates&&(f||100!==Number(null!==(r=this.config.sensor_debounce)&&void 0!==r?r:100))&&(y=V`${y}
          <div class="card-content">
            ${this._numRow(di("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,e=>this.handleConfigChange({sensor_debounce:parseInt(e)}),1)}
          </div>`),y=V`<ha-card
        ><h1 class="card-header">
          <span
            >${di("panels.general.cards.continuousupdates.header",this.hass.language)}<si-info
              >${di("panels.general.cards.continuousupdates.description",this.hass.language)}</si-info
            ></span
          >
        </h1>
        ${y}</ha-card
      > `;const b=this.renderTriggersCard(),$=this.renderWeatherSkipCard(),x=f||this.data.manual_coordinates_enabled?this.renderCoordinateCard():V``,k=this.renderDaysBetweenIrrigationCard(),z=this.renderObservedWateringCard(),S=this.renderPanelModeCard(),M=this.renderSeasonalAdjustmentsCard();this.renderSuppliesCard();const T=this.renderSetupAssistantCard(),O=this.renderIuImportCard(),A=this.renderMasterSwitchCard();if("weather"===this.section)return V`${x}${v?_:""}`;if("sensors"===this.section)return w?y:V``;if("skip"===this.section)return this.renderSkipPage(V`${$}${k}`);if(this.section)return this.renderWateringSection(b);const C=!0===this.config.full_controller,H=this.hass.language,E={calculation:"mdi:calculator-variant-outline",control:"mdi:valve",system:"mdi:cog-outline"},D=e=>V`<div class="settings-section" id="section-${e}">
          <ha-icon icon=${E[e]}></ha-icon>
          <div>
            <h2>
              ${di(`panels.general.sections.${e}`,H)}<si-info
                >${di(`panels.general.sections.${e}-sub`,H)}</si-info
              >
            </h2>
          </div>
        </div>`;return V`${A} ${D("calculation")}${g}${M}
      ${C&&"advanced"!==this.config.ui_mode?"":V`${D("control")}${z}${C?"":b}`}
      ${D("system")}${S}${T}${O}`}}renderWateringSection(e){return this.config&&this.hass?!0!==this.config.full_controller?V`<ha-card>
        <div class="card-content">
          ${di("programs.mode_off",this.hass.language)}
        </div>
      </ha-card>`:"planning"===this.section?V`${this.renderWeekCard()} ${this.renderPlanningCard()}`:"supplies"===this.section?V`${this.renderSuppliesCard()}`:V`${this.renderProgramsCard()}`:V``}_zoneLinks(e){return e.map((e,t)=>V`${t?", ":""}<a
            href="/${gi}/zones/zone/${e.zone_id}"
            @click=${t=>{t.preventDefault(),_a(0,`/${gi}/zones/zone/${e.zone_id}`)}}
            >${e.zone}</a
          >`)}renderLiveState(){const e=this.programsState;if(!this.hass||!e)return;const t=this.hass.language,i=e=>di(`planning.${e}`,t),s=e.live;if(!s)return V``;const a=e=>i("left").replace("{time}",ia(e)),n=s.paused_until?i("paused_until").replace("{when}",sa(s.paused_until,t,{tomorrow:di("card.tomorrow",t),yesterday:di("card.yesterday",t)})):i("paused"),o=[...s.paused?[V`<div class="setting-note">
              <strong>${n}</strong>
            </div>`]:[],...(s.programs||[]).map(e=>V`
          <div class="setting-note">
            <strong>${this._programLabel(e.program_id,e.name)}</strong>
            ${"waiting"===e.state?V` - ${i("waiting")}`:V` - ${i("step")}
                ${e.step}/${e.steps}${e.tours>1?V`, ${i("tour")} ${e.tour}/${e.tours}`:""},
                ${e.percent} %, ${a(e.remaining_seconds||0)}`}
          </div>
        `),...na(s).map(e=>V`
          <div class="setting-note">
            ${e.zone}: ${a(e.remaining_seconds)} (${e.percent}
            %)${e.passes?`, ${i("pass_of").replace("{pass}",String(e.pass)).replace("{passes}",String(e.passes))}`:""}
          </div>
        `),...(s.soaking||[]).map(e=>V`
          <div class="setting-note">
            ${e.zone}:
            ${i("soaking").replace("{when}",sa(e.until,t,{tomorrow:di("card.tomorrow",t),yesterday:di("card.yesterday",t)})).replace("{pass}",String(e.next_pass)).replace("{passes}",String(e.passes))}
          </div>
        `),...(s.starting||[]).map(e=>V`
          <div class="setting-note">
            ${e.zone}: ${i("starting").replace("{supply}",e.supply||"")}
          </div>
        `)];return o.length?V`${o}`:void 0}renderWeekCard(){var e;if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const t=this.hass.language;return V`<ha-card>
      <h1 class="card-header">
        <span
          >${di("week.title",t)}<si-info
            >${di("week.help",t)}</si-info
          ></span
        >
      </h1>
      <div class="card-content">
        <si-week-view
          .planning=${this.planning||[]}
          .today=${((e,t,i,s=3600)=>{var a,n;const o=new Map((t||[]).map(e=>[e.program_id,e.name])),r=gn(i).getTime(),l=i.getTime(),d=new Map,h=(e,t)=>{d.has(e)||d.set(e,[]),d.get(e).push(t)};for(const t of e||[]){const e=t.program_id;if(!e||!o.has(e)||!t.start)continue;const i=Date.parse(t.start),s=Math.max(0,Number(t.duration)||0),a=i+1e3*s;isNaN(i)||a<=r||i>l||h(e,{from:i,to:Math.min(a,l),running:!1,zones:[{zone:t.zone_name||"",seconds:s}]})}for(const e of t||[]){if("running"!==e.state&&"paused"!==e.state)continue;const t=Date.parse(e.last_run||"");if(isNaN(t)||t>l)continue;const i=l+1e3*Math.max(0,null!==(n=null===(a=e.live)||void 0===a?void 0:a.remaining_seconds)&&void 0!==n?n:0);i<=r||h(e.program_id,{from:t,to:i,running:!0,zones:[]})}const c=[];for(const[e,t]of d){t.sort((e,t)=>e.from-t.from);const i=[];for(const e of t){const t=i[i.length-1];t&&e.from<=t.to+1e3*s?(t.to=Math.max(t.to,e.to),t.running=t.running||e.running,t.zones.push(...e.zones)):i.push(Object.assign(Object.assign({},e),{zones:[...e.zones]}))}for(const t of i)c.push({program_id:e,program:o.get(e)||e,start:new Date(t.from).toISOString(),end:new Date(t.to).toISOString(),steps:t.zones.length?[{zones:t.zones}]:[],running:t.running,done:!t.running})}return c.sort((e,t)=>e.start.localeCompare(t.start))})(this._history,(null===(e=this.programsState)||void 0===e?void 0:e.programs)||[],new Date)}
          .lang=${t}
          .days=${this._weekDays}
          .programLabel=${(e,t)=>this._programLabel(e,t)}
          @days-changed=${e=>{this._weekDays=e.detail.days,function(e){try{window.localStorage.setItem(Xn,String(e))}catch(e){}}(this._weekDays),this._fetchLive(!0)}}
          @open-program=${e=>{const t=e.detail.program_id;t&&this._setOpen(`program:${t}`,!0),_a(0,`/${gi}/programs`)}}
        ></si-week-view>
      </div>
    </ha-card>`}renderPlanningCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const e=this.renderLiveState();if(!e)return V``;const t=this.hass.language;return V`
      <ha-card header="${di("planning.now",t)}">
        <div class="card-content">${e}</div>
      </ha-card>
    `}async _fetchLive(e){var t,i,s,a;if(this.hass&&!0===(null===(t=this.config)||void 0===t?void 0:t.full_controller)&&"weather"!==this.section&&"sensors"!==this.section&&"skip"!==this.section)try{if(this.programsState=await this.hass.callWS({type:gi+"/programs_state"}),e&&(this.planning=await this.hass.callWS({type:gi+"/planning",days:Math.max(3,this._weekDays)}),"programs"===this.section))try{this._skipPreview=null!==(s=null===(i=await ln(this.hass))||void 0===i?void 0:i.skip_preview)&&void 0!==s?s:null}catch(e){this._skipPreview=void 0}const t=((null===(a=this.programsState)||void 0===a?void 0:a.programs)||[]).some(e=>"running"===e.state||"paused"===e.state);if("planning"===this.section&&(e||t||this._wasWatering))try{this._history=(await hn(this.hass,100)).records||[]}catch(e){}this._wasWatering=t,this._scheduleUpdate()}catch(e){console.error("Error fetching the programs' state:",e)}}_preview(e,t){var i;const s=JSON.stringify(t),a=ao[e];return a&&a.key===s&&Date.now()-a.at<6e4||(null==a?void 0:a.pending)||!this.hass||(ao[e]=Object.assign(Object.assign({},a||{}),{key:s,at:Date.now(),pending:!0}),window.setTimeout(async()=>{try{const i=await this.hass.callWS({type:gi+"/program_preview",program:t});ao[e]={key:s,at:Date.now(),data:i}}catch(t){console.error("Error drawing the program:",t),ao[e]={key:s,at:Date.now(),data:null==a?void 0:a.data}}this._scheduleUpdate()},400)),null===(i=ao[e])||void 0===i?void 0:i.data}_yamlPreview(e,t,i){const s=no[e];if(!s||!this.hass)return;const a=((e,t)=>{const i=An(e);return i?(t&&(i.id=t.id),i):null})(t,i);if(!a)return s.preview=void 0,s.error=di("programs.yaml_not_a_program",this.hass.language),void this._scheduleUpdate();const n=JSON.stringify(a);s.key=n,window.setTimeout(async()=>{var t;if(no[e]===s&&s.key===n){try{const e=await this.hass.callWS({type:gi+"/program_preview",program:a});if(s.key!==n)return;s.preview=e,s.error=void 0}catch(e){s.preview=void 0,s.error=null!==(t=null==e?void 0:e.message)&&void 0!==t?t:String(e)}this._scheduleUpdate()}},400)}renderProgramsCard(){var e,t,i;if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const s=this.hass.language,a=e=>di(`programs.${e}`,s),n=this.config.programs||[],o=e=>{this.config=Object.assign(Object.assign({},this.config),{programs:e}),this.handleConfigChange({programs:e}),this._scheduleUpdate()},r=(e,t)=>o(n.map((i,s)=>s===e?function(e,t){return Object.assign(Object.assign({},e),t)}(i,t):i)),l=(e,t=0)=>{const i=parseFloat(e);return isNaN(i)?t:i},d=e=>{var t;return this._programLabel(null!==(t=e.id)&&void 0!==t?t:"",e.name)},h=e=>ui(this,"hass-notification",{message:e}),c=async e=>{var t,i,s,n;const o=e.id,r=d(e),l=to[null!=o?o:""]||{},c=((null===(t=this.programsState)||void 0===t?void 0:t.programs)||[]).some(e=>["running","paused","waiting"].includes(e.state)),u=(l.replace&&c?a("confirm_run_replace"):a("confirm_run")).replace("{name}",r);if(!await this._ask(u))return;const g=Math.round(parseFloat(null!==(i=l.seconds)&&void 0!==i?i:"")),m={program_id:o};g>0&&(m.seconds=Math.min(g,86400)),l.replace&&(m.mode="replace");try{await this.hass.callService(gi,"run_program",m)}catch(e){return void h(a("run_failed").replace("{name}",r).replace("{error}",null!==(s=null==e?void 0:e.message)&&void 0!==s?s:String(e)))}await this._fetchLive(!1);const f=null===(n=p(o))||void 0===n?void 0:n.state;h(("running"===f?a("run_started"):"waiting"===f?l.replace?a("run_replacing"):a("run_queued"):a("run_nothing")).replace("{name}",r))},u=e=>{var t,i,n;return V`
      <details
        class="more"
        open
        @toggle=${t=>{t.target.open||(this._setOpen(`run_options:${e}`,!1),this._scheduleUpdate())}}
      >
        <summary>${a("run_options")}</summary>
        <div class="more-body">
          <div class="setting-row">
            <div class="setting-label">
              ${a("run_seconds")}
              <span class="unit"
                >(${di("common.units.seconds",s)})</span
              ><si-info>${a("run_seconds_help")}</si-info>
            </div>
            <input
              class="field"
              type="number"
              min="1"
              max="86400"
              .value=${null!==(i=null===(t=to[null!=e?e:""])||void 0===t?void 0:t.seconds)&&void 0!==i?i:""}
              @input=${t=>{var i;(to[i=null!=e?e:""]||(to[i]={})).seconds=t.target.value}}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${a("run_replace")}<si-info>${a("run_replace_help")}</si-info>
            </div>
            <ha-switch
              .checked=${!0===(null===(n=to[null!=e?e:""])||void 0===n?void 0:n.replace)}
              @change=${t=>{var i;(to[i=null!=e?e:""]||(to[i]={})).replace=t.target.checked}}
            ></ha-switch>
          </div>
        </div>
      </details>
    `},p=e=>{var t;return((null===(t=this.programsState)||void 0===t?void 0:t.programs)||[]).find(t=>t.program_id===e)},g=async e=>{await this._ask(a("confirm_stop_program").replace("{name}",e.name),!0)&&this.hass.callService(gi,"stop_program",{program_id:e.id}).then(()=>this._fetchLive(!1))},m=e=>{var t;const i=null===(t=p(e.id))||void 0===t?void 0:t.suspended_until;return i?V`
        <div class="setting-row">
          <div class="setting-label">
            ${a("suspended_until").replace("{when}",sa(i,s,{tomorrow:di("card.tomorrow",s),yesterday:di("card.yesterday",s)}))}
          </div>
          ${this._actionBtn(Wa,a("lift_suspension"),async()=>{await this.hass.callService(gi,"suspend",{program_id:e.id,hours:0}),await this._fetchLive(!1)})}
        </div>
      `:V``},f=e=>V`
      ${m(e)}
      ${Oa(e)&&this._isOpen(`run_options:${e.id}`)?u(e.id):""}
    `,v=e=>{var t;return null===(t=p(e.id))||void 0===t?void 0:t.adjustment},_=e=>{var t,i;const n=v(e);if(!n)return"";const o=Number(null!==(t=n.percent)&&void 0!==t?t:100),r=Math.round(Number(null!==(i=n.seconds)&&void 0!==i?i:0)),l=[100!==o?`${o} %`:"",0!==r?a("adjust_per_step").replace("{time}",`${r>0?"+":"−"}${ta(Math.abs(r))}`):""].filter(Boolean).join(", ");return n.until?a("adjust_short").replace("{what}",l).replace("{when}",sa(n.until,s,{tomorrow:di("card.tomorrow",s),yesterday:di("card.yesterday",s)})):a("adjust_short_open").replace("{what}",l)},w=e=>{var t;const i=null!==(t=e.id)&&void 0!==t?t:"",n=io[i]||(io[i]={}),o=v(e);if(!o&&!(e.steps||[]).length)return V``;const r=o?a("adjust_in_force").replace("{what}",_(e)):a("adjust_none"),l=(e,t,i,s)=>{var a;return V`
        <div class="setting-row">
          <div class="setting-label">
            ${e}${t?V` <span class="unit">(${t})</span>`:""}
          </div>
          <input
            class="field"
            type="number"
            placeholder=${s}
            .value=${null!==(a=n[i])&&void 0!==a?a:""}
            @input=${e=>{n[i]=e.target.value}}
          />
        </div>
      `},d=t=>this.hass.callService(gi,"adjust_program",Object.assign({program_id:e.id},t)).then(()=>this._fetchLive(!1));return V`
        <div class="fold-section">${a("adjust_title")}</div>
        <div class="setting-note">${r}</div>
        ${o?V`<div class="si-actions">
              ${this._actionBtn(Ra,a("adjust_reset"),async()=>{await this._ask(a("confirm_reset_adjustment"),!0)&&d({reset:!0})},!0)}
            </div>`:""}
        <details class="more">
          <summary>${a(o?"adjust_change":"adjust_set")}</summary>
          <div class="more-body">
            ${l(a("adjust_percent"),"%","percent","100")}
            ${l(a("adjust_seconds"),di("common.units.seconds",s),"seconds","0")}
            ${l(a("adjust_hours"),"h","hours","")}
            <div class="setting-hint row-hint">${a("adjust_help")}</div>
            <div class="si-actions">
              ${this._actionBtn(Ea,a("adjust_apply"),()=>{var e,t,i;const s={},o=parseFloat(null!==(e=n.percent)&&void 0!==e?e:""),r=parseFloat(null!==(t=n.seconds)&&void 0!==t?t:""),l=parseFloat(null!==(i=n.hours)&&void 0!==i?i:"");isNaN(o)||(s.percent=o),isNaN(r)||(s.seconds=Math.round(r)),!isNaN(l)&&l>=1&&(s.hours=Math.round(l)),void 0!==s.percent||void 0!==s.seconds?d(s):h(a("adjust_empty"))})}
            </div>
          </div>
        </details>
      `},y=()=>Math.random().toString(36).slice(2,8),b=e=>new Intl.DateTimeFormat(s,{weekday:"short"}).format(new Date(2024,0,1+e)),$=e=>new Intl.DateTimeFormat(s,{month:"short"}).format(new Date(2024,e,1)),x=e=>(e||[]).map(e=>{var t,i;return null!==(i=null===(t=this.zones.find(t=>t.id===e))||void 0===t?void 0:t.name)&&void 0!==i?i:a("deleted_zone")}).join(" + ")||a("no_zone"),k=e=>{var t,i,s,o;if("after"===e.type){const i=a("summary_after").replace("{program}",(e=>{const t=n.find(t=>void 0!==t.id&&t.id===e.after_program);return t?d(t):a("after_missing_short")})(e));return`${i}${e.offset_minutes?` +${e.offset_minutes} min`:""}${(e.weekdays||[]).length>0&&(e.weekdays||[]).length<7||(null!==(t=e.every_n_days)&&void 0!==t?t:1)>1||"even"===e.parity||"odd"===e.parity||(e.days_of_month||[]).length>0||(e.months||[]).length>0||!!e.from_date||!!e.until_date?` · ${a("more_options_set")}`:""}`}const r="end"===e.anchor?"end":"start",l=e.offset_minutes?` ${e.offset_minutes>0?"+":""}${e.offset_minutes} min`:"",h="sun"===e.type&&"azimuth"===e.event?`${a(`summary_${r}_azimuth`).replace("{deg}",String(null!==(i=e.azimuth)&&void 0!==i?i:180))}${l}`:"sun"===e.type?`${a(`summary_${r}_${"sunset"===e.event?"sunset":"sunrise"}`)}${l}`:`${a("end"===r?"anchor_end_short":"anchor_start_short")} ${e.time}`,c=(e.weekdays||[]).length>0&&(e.weekdays||[]).length<7?e.weekdays.map(e=>b(e)).join(", "):(null!==(s=e.every_n_days)&&void 0!==s?s:1)>1?`${a("schedule_every")} ${e.every_n_days} ${a("schedule_days")}`:a("every_day");return`${c} · ${h}${(null!==(o=e.every_n_days)&&void 0!==o?o:1)>1&&(e.weekdays||[]).length>0||"even"===e.parity||"odd"===e.parity||(e.days_of_month||[]).length>0||(e.months||[]).length>0||!!e.from_date||!!e.until_date?` · ${a("more_options_set")}`:""}`},z=(e,t,i)=>V`<span class="fold-head"
        ><span class="fold-head-text">${e}</span>${((e,t)=>V`
      <ha-switch
        .checked=${e}
        @click=${i=>{i.stopPropagation(),i.preventDefault(),t(!e)}}
      ></ha-switch>
    `)(t,i)}</span
      >`,S=(e,t,i)=>V`
      <details
        class="fold"
        ?open=${this._isOpen(e)}
        @toggle=${t=>this._setOpen(e,t.target.open)}
      >
        <summary>${t}</summary>
        <div class="fold-body">${i}</div>
      </details>
    `,M=(e,t,i)=>V`
      <details
        class="more"
        ?open=${this._isOpen(e)||t&&!eo.has(e)}
        @toggle=${t=>{const i=t.target.open;this._setOpen(e,i),i?eo.delete(e):eo.add(e)}}
      >
        <summary>
          ${a("more_options")}${t?V` · <em>${a("more_options_set")}</em>`:""}
        </summary>
        <div class="more-body">${i}</div>
      </details>
    `,T=e=>{const t=[...new Set((e.steps||[]).filter(e=>!1!==e.enabled).flatMap(e=>e.zones||[]))];return t.map(e=>{var t,i;return{id:Number(e),name:null!==(i=null===(t=this.zones.find(t=>t.id===e))||void 0===t?void 0:t.name)&&void 0!==i?i:`#${e}`}}).filter(e=>!isNaN(e.id))},O=(e,t)=>{var i,n,o,r,l;const d=null!==(i=e.id)&&void 0!==i?i:"",h=null!==(n=so[d])&&void 0!==n?n:"flow",c=(e.schedules||[]).filter(e=>!1!==e.enabled);return V`
        <div class="run-views" role="group">
          ${["flow","timeline"].map(e=>V`<button
                class=${e===h?"on":""}
                @click=${()=>{so[d]=e,this._scheduleUpdate()}}
              >
                ${a(`view_${e}`)}
              </button>`)}
        </div>
        ${"flow"===h?V`<si-program-flow
              .flow=${((e,t=[],i=[],s=[])=>{var a;const n=(null==e?void 0:e.segments)||[],o=new Map(((null==e?void 0:e.zones)||[]).map(e=>[e.zone_id,e.zone])),r=n.length?Math.max(...n.map(e=>e.tour))+1:1,l=n.filter(e=>0===e.tour),d=[...new Set(l.map(e=>e.step))].sort((e,t)=>e-t),h=d.map(e=>{const t=l.filter(t=>t.step===e),i=[];for(const e of t)i.includes(e.zone_id)||i.push(e.zone_id);const s=t.find(e=>"soak"===e.kind);return{zones:i.map(e=>{const i=t.filter(t=>t.zone_id===e&&"water"===t.kind);return{zoneId:e,name:o.get(e)||`#${e}`,seconds:Math.round(i.reduce((e,t)=>e+(t.end-t.start),0)),passes:new Set(i.map(e=>e.pass)).size||1}}),soakSeconds:s?Math.round(s.end-s.start):0,waitAfter:null}});for(let e=0;e+1<d.length;e++){const t=Math.max(...l.filter(t=>t.step===d[e]).map(e=>e.end)),i=Math.min(...l.filter(t=>t.step===d[e+1]).map(e=>e.start));h[e].waitAfter=Math.round(i-t)}const c=new Set;for(const e of h)for(const i of e.zones){const e=null===(a=t.find(e=>e.id===i.zoneId))||void 0===a?void 0:a.supply_id;e&&c.add(e)}const u=i.filter(e=>e.id&&c.has(e.id)&&!1!==e.enabled).map(e=>({name:e.name,before:Number(e.delay_before)||0,after:Number(e.delay_after)||0})),p=new Set(h.flatMap(e=>e.zones.map(e=>e.zoneId))),g=s.filter(e=>!p.has(e.id)).map(e=>({zoneId:e.id,name:e.name}));return{steps:h,supplies:u,tours:r,idle:g}})(t,this.zones,(null===(o=this.config)||void 0===o?void 0:o.supplies)||[],T(e))}
              .schedules=${c.map(e=>k(e))}
              .weather=${((e=[],t,i)=>{var s,a,n;const o=(e||[]).filter(e=>!1!==e.enabled&&!1!==e.weather);if(!o.length)return{state:"off"};let r=new Set(["postponed"]);for(const e of o){if(!Array.isArray(e.skip_conditions)){r=null;break}for(const t of e.skip_conditions)r.add(t)}const l=e=>null===r||r.has(e),d=!!(null==i?void 0:i.forecast_known);if("precipitation"===(null==i?void 0:i.skipped_reason)&&l("precipitation"))return{state:"no",reason:"precipitation",mm:null!==(a=null===(s=i.forecast)||void 0===s?void 0:s.forecast_mm)&&void 0!==a?a:null};const h=null==t?void 0:t.checks;if(!Array.isArray(h))return d?{state:"yes"}:{state:"unknown"};const c=h.find(e=>l(e.id)&&!1!==e.enabled&&!1!==e.available&&!0===e.skip&&!("precipitation"===e.id&&d));if(c)return"precipitation"===c.id?{state:"no",reason:c.id,mm:null!==(n=c.forecast_mm)&&void 0!==n?n:null}:{state:"no",reason:c.id};const u=h.find(e=>l(e.id)&&!1!==e.enabled&&!1===e.available&&!("precipitation"===e.id&&d));return u?{state:"yes",unread:u.id}:{state:"yes"}})(c,this._skipPreview,(this.planning||[]).find(t=>t.program_id===e.id))}
              .notify=${!!(null===(l=null===(r=e.notify)||void 0===r?void 0:r.targets)||void 0===l?void 0:l.length)}
              .lang=${s}
              @open-zone=${e=>_a(0,`/${gi}/zones/zone/${e.detail.zone_id}`)}
            ></si-program-flow>`:V`<si-program-timeline
              .timeline=${t}
              .lang=${s}
            ></si-program-timeline>`}
      `},A=(e,t)=>{var i;const s=null!==(i=e.id)&&void 0!==i?i:"";if(!this._isOpen(t))return V``;const n=this._preview(s,e);return V`
        <div class="fold-section">
          ${a("preview_title")}<si-info>${a("preview_help")}</si-info>
        </div>
        ${n?O(e,n.timeline):V`<div class="setting-note">…</div>`}
      `},C=e=>void 0!==no[e],H=async(e,t)=>{await $e().catch(()=>{}),no[e]={initial:t,value:t,valid:!0},this._yamlPreview(e,t,e?n.find(t=>t.id===e):void 0),this._scheduleUpdate()},E=e=>{delete no[e],this._scheduleUpdate()},D=(e,t)=>{const i=no[e],s=null===t?void 0:n[t],r=i.preview,l=r?[...r.unknown_zone_names.map(e=>`"${e}"`),...r.unknown_zones.map(e=>`#${e}`)]:[],d=(null==r?void 0:r.zones_not_watered)||[],c=(null==r?void 0:r.chain_loop)||null,u=(null==r?void 0:r.unknown_after_programs)||[];return V`
        <div class="fold-section">YAML<si-info>${a("yaml_help")}</si-info></div>
        <ha-yaml-editor
          .hass=${this.hass}
          .defaultValue=${i.initial}
          @value-changed=${t=>{t.stopPropagation();const{value:a,isValid:n}=t.detail||{};i.value=a,i.valid=!1!==n,i.valid&&this._yamlPreview(e,a,s),this._scheduleUpdate()}}
        ></ha-yaml-editor>
        ${i.valid?i.error?V`<div class="setting-hint row-hint warning-hint">
                ${i.error}
              </div>`:"":V`<div class="setting-hint row-hint warning-hint">
              ${a("yaml_invalid")}
            </div>`}
        ${l.length?V`<div class="setting-hint row-hint warning-hint">
              ${a("yaml_unknown_zones").replace("{zones}",l.join(", "))}
            </div>`:""}
        ${c?V`<div class="setting-hint row-hint warning-hint">
              ${a("yaml_chain_loop").replace("{programs}",c.join(" → "))}
            </div>`:""}
        ${u.length?V`<div class="setting-hint row-hint warning-hint">
              ${a("yaml_unknown_after").replace("{programs}",u.map(e=>`"${e}"`).join(", "))}
            </div>`:""}
        ${d.length?V`<div class="setting-hint row-hint warning-hint">
              ${a("yaml_not_watered").replace("{zones}",d.map(e=>{var t;return null!==(t=e.zone)&&void 0!==t?t:`#${e.zone_id}`}).join(", "))}
            </div>`:""}
        ${r&&i.valid&&!i.error?O(r.program,r.timeline):""}
        <div class="si-actions">
          ${this._actionBtn(Ea,a("yaml_apply"),()=>{if(!r||c||u.length)return;const i=Object.assign({},r.program);null===t?(this._setOpen(`program:${i.id}`,!0),o([...n,i])):o(n.map((e,s)=>s===t?i:e)),E(e),h(a("yaml_applied"))},!1,!i.valid||!r||!!i.error||!!c||u.length>0)}
        </div>
      `},N=e=>{var t;const i=null!==(t=e.id)&&void 0!==t?t:"",s=(e,t,i,s="")=>V`<ha-icon-button
          class=${s}
          .path=${e}
          .label=${t}
          title=${t}
          @click=${e=>{e.stopPropagation(),e.preventDefault(),i()}}
        ></ha-icon-button>`,o=()=>this._setOpen(`program:${i}`,!0),r=`run_options:${i}`;return V`<span class="head-actions">
        ${Oa(e)?s(Wa,a("run_now"),()=>c(e)):""}
        ${(e=>{var t;return["running","paused","waiting"].includes(null===(t=p(e.id))||void 0===t?void 0:t.state)})(e)?s("M18,18H6V6H18V18Z",a("stop_program"),()=>g(e),"danger"):""}
        ${C(i)?s(La,a("yaml_back"),()=>E(i)):s(ja,a("yaml_edit"),()=>{o(),H(i,On(e,this.zones,n))})}
        ${Oa(e)?s("M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z",a("run_options"),()=>{const e=!this._isOpen(r);this._setOpen(r,e),e&&o(),this._scheduleUpdate()},this._isOpen(r)?"on":""):""}
      </span>`},I=e=>{var t,i;const o=Fn(e,null===(t=this.config)||void 0===t?void 0:t.ui_mode,{t:a,monthName:$,days:e=>di("programs.days_count",s,"{count}",e),num:e=>{var t;return ea(e,Number.isInteger(e)?0:1,null===(t=this.hass)||void 0===t?void 0:t.locale,s)}});if(!o.length)return"";const r=null!==(i=e.id)&&void 0!==i?i:"",l=Wn(o);return V`<ha-alert
        alert-type="info"
        .title=${a(l?"hidden_title":"yaml_only_title")}
      >
        ${l?a("hidden_help").replace("{where}",this._advancedPath(s)):a("yaml_only_help")}
        ${o.map(e=>V`<div>${function(e){return[e.owner,...e.items].filter(e=>e).join(" · ")}(e)}</div>`)}
        <ha-button
          slot="action"
          appearance="plain"
          @click=${()=>H(r,On(e,this.zones,n))}
          >${a("yaml_edit")}</ha-button
        >
      </ha-alert>`},j="advanced"===(null===(e=this.config)||void 0===e?void 0:e.ui_mode),R=(e,t,i)=>{var s,n,o;return V`
      ${(null!==(s=e.every_n_days)&&void 0!==s?s:1)>1||(null!==(n=e.every_offset)&&void 0!==n?n:0)>0?this._numRow(a("schedule_every_offset"),a("schedule_days"),null!==(o=e.every_offset)&&void 0!==o?o:0,e=>t({every_offset:Math.max(0,Math.round(l(e)))})):""}
      ${this._selectRow(a("schedule_parity"),V`
          <option
            value="any"
            ?selected=${"even"!==e.parity&&"odd"!==e.parity}
          >
            ${a("parity_any")}
          </option>
          <option value="even" ?selected=${"even"===e.parity}>
            ${a("parity_even")}
          </option>
          <option value="odd" ?selected=${"odd"===e.parity}>
            ${a("parity_odd")}
          </option>
        `,e=>t({parity:e.target.value}))}
      ${this._textRow(V`${a("schedule_days_of_month")}<si-info
            >${a("schedule_days_of_month_help")}</si-info
          >`,`1, 15, ${a("last_word")}`,(e.days_of_month||[]).map(e=>"last"===e?a("last_word"):e).join(", "),e=>t({days_of_month:e.split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).map(e=>e===a("last_word").toLowerCase()?"last":e).filter(e=>"last"===e||/^\d+$/.test(e)&&Number(e)>=1&&Number(e)<=31).map(e=>"last"===e?e:Number(e))}))}
      <div class="setting-row">
        <div class="setting-label">
          ${a("schedule_months")}<si-info>${a("schedule_months_help")}</si-info>
        </div>
        <div>
          ${[0,1,2,3,4,5,6,7,8,9,10,11].map(s=>V`
              <label style="margin-right: 10px; white-space: nowrap;">
                <input
                  type="checkbox"
                  .checked=${(e.months||[]).includes(s+1)}
                  @change=${a=>t({months:i(e.months,s+1,a.target.checked)})}
                />
                ${$(s)}
              </label>
            `)}
        </div>
      </div>
    `},L=(e,t,i,n)=>{var o,d,h,c,u,p,g,m,f,v,_,w,y,b,$,k,T;const O=i=>r(t,function(e,t,i){return{steps:(e.steps||[]).map((e,s)=>s===t?Object.assign(Object.assign({},e),i):e)}}(e,n,i)),A=(e,t)=>{const s=(i.zones||[]).filter(t=>t!==e);O({zones:t?[...s,e]:s})},C=Math.max(1,Number(i.passes)||1),H=null===i.delay||void 0===i.delay?null:Number(i.delay),E=[C>1?a("passes_short").replace("{n}",String(C)):"",null!==H&&H<0?a("overlap_short").replace("{time}",ta(Math.abs(H))):"",null!==H&&H>0?a("wait_short").replace("{time}",ta(H)):""].filter(Boolean),D=(null!==(o=i.min_seconds)&&void 0!==o?o:0)>0&&(null!==(d=i.max_seconds)&&void 0!==d?d:0)>0&&(null!==(h=i.min_seconds)&&void 0!==h?h:0)>(null!==(c=i.max_seconds)&&void 0!==c?c:0);return S(`step:${i.id}`,z(V`<strong>${a("step")} ${n+1}</strong> ·
            ${x(i.zones)} ·
            ${(e=>"fixed"===e.mode?`${e.seconds} s`:"percent"===e.mode?`${a("mode_calculated_short")} × ${e.percent} %`:a("mode_calculated_short"))(i)}${E.map(e=>V` · ${e}`)}`,!1!==i.enabled,e=>O({enabled:e})),V`
          <div class="setting-row">
            <div class="setting-label">
              ${a("step_zones")}<si-info>${a("step_zones_help")}</si-info>
            </div>
            <div>
              ${(i.zones||[]).filter(e=>!this.zones.some(t=>t.id===e)).map(e=>V`
                    <label
                      style="margin-right: 12px; white-space: nowrap; color: var(--warning-color, #ff9800);"
                    >
                      <input
                        type="checkbox"
                        checked
                        @change=${t=>A(e,t.target.checked)}
                      />
                      &#9888; ${a("deleted_zone")}
                    </label>
                  `)}
              ${this.zones.map(e=>V`
                  <label style="margin-right: 12px; white-space: nowrap;">
                    <input
                      type="checkbox"
                      .checked=${(i.zones||[]).includes(e.id)}
                      @change=${t=>A(e.id,t.target.checked)}
                    />
                    ${e.name}
                  </label>
                `)}
            </div>
          </div>
          ${this._selectRow(a("step_duration"),V`
              <option
                value="calculated"
                ?selected=${"calculated"===i.mode}
              >
                ${a("mode_calculated")}
              </option>
              <option value="percent" ?selected=${"percent"===i.mode}>
                ${a("mode_percent")}
              </option>
              <option value="fixed" ?selected=${"fixed"===i.mode}>
                ${a("mode_fixed")}
              </option>
            `,e=>O({mode:e.target.value}))}
          ${"percent"===i.mode?this._numRow(a("percent"),"%",i.percent,e=>O({percent:Math.max(0,l(e,100))}),1,!1,0):""}
          ${"fixed"===i.mode?this._numRow(a("seconds"),"",i.seconds,e=>O({seconds:Math.max(0,l(e))}),1,!1,0):""}
          ${this._numRow(V`${a("passes")}<si-info>${a("passes_help")}</si-info>`,"",i.passes,e=>O({passes:Math.max(1,Math.round(l(e,1)))}),1,!1,1)}
          ${C>1?V`${this._numRow(V`${di("observed_watering.soak_label",s)}<si-info
                    >${a("soak_shared_help")}</si-info
                  >`,di("observed_watering.minutes",s),null!==(p=null===(u=this.config)||void 0===u?void 0:u.soak_minutes)&&void 0!==p?p:15,e=>this.handleConfigChange({soak_minutes:Math.max(0,parseFloat(e)||0)}))}`:""}
          ${M(`more:step:${i.id}`,(null!==(g=i.max_litres)&&void 0!==g?g:0)>0||(null!==(m=i.min_seconds)&&void 0!==m?m:0)>0||(null!==(f=i.max_seconds)&&void 0!==f?f:0)>0||j&&(0!==(null!==(v=i.adjust_seconds)&&void 0!==v?v:0)||(null!==(_=i.min_deficit_mm)&&void 0!==_?_:0)>0)||null!==i.delay&&void 0!==i.delay,V`
              ${this._numRow(V`${a("max_litres")}<si-info
                    >${a("max_litres_help")}</si-info
                  >`,la(this.config,vs),+pa(null!==(w=i.max_litres)&&void 0!==w?w:0,this.config).toFixed(2),e=>O({max_litres:Math.max(0,ga(l(e),this.config))}),1,!1,0)}
              ${this._numRow(V`${a("min_seconds")}<si-info
                    >${a("step_bounds_help")}</si-info
                  >`,di("common.units.seconds",s),null!==(y=i.min_seconds)&&void 0!==y?y:0,e=>O({min_seconds:Math.max(0,Math.round(l(e)))}),1,!1,0)}
              ${this._numRow(a("max_seconds"),di("common.units.seconds",s),null!==(b=i.max_seconds)&&void 0!==b?b:0,e=>O({max_seconds:Math.max(0,Math.round(l(e)))}),1,!1,0)}
              ${D?V`<div class="setting-hint row-hint warning-hint">
                    ${a("min_over_max").replace("{max}",ta(null!==($=i.max_seconds)&&void 0!==$?$:0))}
                  </div>`:""}
              ${j?V`${this._numRow(V`${a("adjust_seconds")}<si-info
                          >${a("step_bounds_help")}</si-info
                        >`,di("common.units.seconds",s),null!==(k=i.adjust_seconds)&&void 0!==k?k:0,e=>O({adjust_seconds:Math.max(-21600,Math.min(21600,Math.round(l(e))))}))}
                    ${this._numRow(V`${a("min_deficit_mm")}<si-info
                          >${a("min_deficit_mm_help")}</si-info
                        >`,"mm",null!==(T=i.min_deficit_mm)&&void 0!==T?T:0,e=>O({min_deficit_mm:Math.max(0,l(e))}),1,!1,0)}`:""}
              ${this._textRow(V`${a("step_delay")}<si-info
                    >${a("step_delay_help")}</si-info
                  >`,di("common.units.seconds",s),null===i.delay||void 0===i.delay?"":i.delay,e=>O({delay:""===e.trim()?null:l(e)}))}
            `)}
          <div class="si-actions">
            ${this._actionBtn(Ra,a("delete_step"),async()=>{await this._ask(a("confirm_delete_step"),!0)&&r(t,{steps:(e.steps||[]).filter((e,t)=>t!==n)})},!0)}
          </div>
        `)},P=(e,t,i,o)=>{var h,c,u,p;const g=i=>r(t,function(e,t,i){return{schedules:(e.schedules||[]).map((e,s)=>s===t?Object.assign(Object.assign({},e),i):e)}}(e,o,i)),m=n.filter(t=>{var i;return void 0!==t.id&&t.id!==e.id&&!Hn(n,null!==(i=e.id)&&void 0!==i?i:"",t.id)}),f=(e,t,i)=>{const s=(e||[]).filter(e=>e!==t);return i?[...s,t].sort((e,t)=>e-t):s};return S(`schedule:${i.id}`,z(V`<strong>${a("schedule")} ${o+1}</strong> ·
            ${k(i)}`,!1!==i.enabled,e=>g({enabled:e})),V`
          ${this._selectRow(a("schedule_moment"),V`
              <option value="time" ?selected=${"time"===i.type}>
                ${a("moment_time")}
              </option>
              <option
                value="sunrise"
                ?selected=${"sun"===i.type&&"sunrise"===i.event}
              >
                ${a("moment_sunrise")}
              </option>
              <option
                value="sunset"
                ?selected=${"sun"===i.type&&"sunset"===i.event}
              >
                ${a("moment_sunset")}
              </option>
              <option
                value="azimuth"
                ?selected=${"sun"===i.type&&"azimuth"===i.event}
              >
                ${a("moment_azimuth")}
              </option>
              <option
                value="after"
                ?selected=${"after"===i.type}
                ?disabled=${!m.length&&"after"!==i.type}
              >
                ${a("moment_after")}
              </option>
            `,e=>{var t,s,a,n;const o=e.target.value;g("after"!==o?"time"===o?{type:"time"}:Object.assign({type:"sun",event:o},"azimuth"===o?{azimuth:null!==(n=i.azimuth)&&void 0!==n?n:180}:{}):{type:"after",after_program:null!==(a=null!==(t=i.after_program)&&void 0!==t?t:null===(s=m[0])||void 0===s?void 0:s.id)&&void 0!==a?a:null,anchor:"start",hard_deadline:!1,offset_minutes:Math.max(0,i.offset_minutes||0)})})}
          ${"after"===i.type?V`${this._selectRow(V`${a("schedule_after_program")}<si-info
                    >${a("schedule_after_program_help")}</si-info
                  >`,V`${Dn(n,i)?V`<option value="" selected disabled>
                      ${a("after_missing_short")}
                    </option>`:""}
                ${n.filter(t=>void 0!==t.id&&t.id!==e.id).map(t=>{var s,o;return V`<option
                        value=${t.id}
                        ?selected=${t.id===i.after_program}
                        ?disabled=${Hn(n,null!==(s=e.id)&&void 0!==s?s:"",t.id)}
                      >
                        ${d(t)}${Hn(n,null!==(o=e.id)&&void 0!==o?o:"",t.id)?` (${a("after_would_loop")})`:""}
                      </option>`})}`,e=>g({after_program:e.target.value||null}))}
              ${Dn(n,i)?V`<div class="setting-hint row-hint warning-hint">
                    ${a("after_missing")}
                  </div>`:""}
              ${this._numRow(V`${a("schedule_after_offset")}<si-info
                    >${a("schedule_after_offset_help")}</si-info
                  >`,di("common.units.minutes",s),i.offset_minutes,e=>g({offset_minutes:Math.max(0,Math.round(l(e)))}),1,!1,0)}`:""}
          ${"sun"===i.type&&"azimuth"===i.event?V`${this._numRow(V`${a("schedule_azimuth")}<si-info
                    >${a("schedule_azimuth_help")}</si-info
                  >`,"°",null!==(h=i.azimuth)&&void 0!==h?h:180,e=>g({azimuth:(l(e,180)%360+360)%360}))}`:""}
          ${"time"===i.type?this._timeRow(a("schedule_time"),i.time,e=>g({time:e})):"sun"===i.type?this._numRow(a("schedule_offset"),di("common.units.minutes",s),i.offset_minutes,e=>g({offset_minutes:Math.round(l(e))})):""}
          ${"after"===i.type?V`<div class="setting-row">
                <div class="setting-label">
                  ${a("schedule_anchor")}<si-info
                    >${a("schedule_anchor_after_help")}</si-info
                  >
                </div>
                <div class="select-wrap">
                  <select class="field" disabled>
                    <option selected>${a("anchor_start")}</option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Ua}></path>
                  </svg>
                </div>
              </div>`:this._selectRow(V`${a("schedule_anchor")}<si-info
                    >${a("schedule_anchor_help")}</si-info
                  >`,V`
                  <option value="start" ?selected=${"end"!==i.anchor}>
                    ${a("anchor_start")}
                  </option>
                  <option value="end" ?selected=${"end"===i.anchor}>
                    ${a("anchor_end")}
                  </option>
                `,e=>g({anchor:e.target.value}))}
          <div class="setting-row">
            <div class="setting-label">
              ${a("schedule_weekdays")}<si-info
                >${a("schedule_weekdays_help")}</si-info
              >
            </div>
            <div>
              ${[0,1,2,3,4,5,6].map(e=>V`
                  <label style="margin-right: 10px; white-space: nowrap;">
                    <input
                      type="checkbox"
                      .checked=${(i.weekdays||[]).includes(e)}
                      @change=${t=>g({weekdays:f(i.weekdays,e,t.target.checked)})}
                    />
                    ${b(e)}
                  </label>
                `)}
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${a("schedule_weather")}<si-info
                >${a("schedule_weather_help")}
                ${j?a("conditions_pick"):""}</si-info
              >
            </div>
            <ha-switch
              .checked=${!1!==i.weather}
              @change=${e=>g({weather:e.target.checked})}
            ></ha-switch>
          </div>
          ${j&&!1!==i.weather?V`<div class="conditions">
                  ${In.map(e=>{var t;const s="postponed"===e,n=null!==(t=i.skip_conditions)&&void 0!==t?t:In,o=s?a("cond_postponed"):this._conditionSetting(e);return V`
                      <div class=${o?"":"cond-off"}>
                        <label style="white-space: nowrap;">
                          <input
                            type="checkbox"
                            .checked=${s||n.includes(e)}
                            ?disabled=${s||!o}
                            @change=${t=>{const i=t.target.checked,s=In.filter(t=>t===e?i:n.includes(t));g({skip_conditions:s.length===In.length?void 0:s})}}
                          />
                          ${a(`condition_${e}`)}
                        </label>
                        <span class="cond-setting">
                          · ${o||a("cond_off")}
                        </span>
                      </div>
                    `})}
                </div>`:""}
          ${M(`more:schedule:${i.id}`,!0===i.hard_deadline||(null!==(c=i.every_n_days)&&void 0!==c?c:1)>1||j&&((null!==(u=i.every_offset)&&void 0!==u?u:0)>0||"even"===i.parity||"odd"===i.parity||(i.days_of_month||[]).length>0||(i.months||[]).length>0)||!!i.from_date||!!i.until_date,V`
              ${this._numRow(V`${a("schedule_every")}<si-info
                    >${a("schedule_every_help")}</si-info
                  >`,a("schedule_days"),null!==(p=i.every_n_days)&&void 0!==p?p:1,e=>g({every_n_days:Math.max(1,Math.round(l(e,1)))}))}
              ${j?R(i,g,f):""}
              ${this._monthDayRow(a("schedule_from"),i.from_date,$,e=>g({from_date:e}))}
              ${this._monthDayRow(V`${a("schedule_until")}<si-info
                    >${a("schedule_period_help")}</si-info
                  >`,i.until_date,$,e=>g({until_date:e}))}
              ${"end"===i.anchor?V`
                    <div class="setting-row">
                      <div class="setting-label">
                        ${a("schedule_hard_deadline")}<si-info
                          >${a("schedule_hard_deadline_help")}</si-info
                        >
                      </div>
                      <ha-switch
                        .checked=${!0===i.hard_deadline}
                        @change=${e=>g({hard_deadline:e.target.checked})}
                      ></ha-switch>
                    </div>
                  `:""}
            `)}
          <div class="si-actions">
            ${this._actionBtn(Ra,a("delete_schedule"),async()=>{await this._ask(a("confirm_delete_schedule"),!0)&&r(t,{schedules:(e.schedules||[]).filter((e,t)=>t!==o)})},!0)}
          </div>
        `)},U=(e,t)=>V`
      ${(e.schedules||[]).map((i,s)=>P(e,t,i,s))}
      <div class="si-actions">
        ${this._actionBtn(Ya,a("add_schedule"),()=>r(t,{schedules:[...e.schedules||[],{id:this._openNew("schedule","schedule_"+y()),enabled:!0,type:"time",time:"06:00",event:"sunrise",offset_minutes:0,anchor:"start",weekdays:[],every_n_days:1,every_offset:0,parity:"any",months:[],from_date:null,until_date:null,weather:!0}]}))}
      </div>
    `,B=(e,t)=>{var i;const s=null!==(i=e.notify)&&void 0!==i?i:{targets:[],when:"finish",start:!1},n=(e=>{var t;const i=Object.keys(e.states||{}).filter(e=>e.startsWith("notify.")).map(t=>{var i,s;return{id:t,name:(null===(s=null===(i=e.states[t])||void 0===i?void 0:i.attributes)||void 0===s?void 0:s.friendly_name)||t}}),s=new Map(i.map(e=>[e.id,e.name])),a=Object.keys((null===(t=e.services)||void 0===t?void 0:t.notify)||{}).filter(e=>!Nn.has(e)).map(e=>`notify.${e}`),n=new Set(a),o=e=>`notify.mobile_app_${e.slice(7)}`,r=a.filter(e=>!s.has(e)).map(e=>{const t=i.find(t=>o(t.id)===e);return{id:e,name:t?t.name:e}});return[{id:"persistent_notification",name:"persistent_notification"},...[...i.filter(e=>!n.has(o(e.id))),...r].sort((e,t)=>e.name.localeCompare(t.name))]})(this.hass),o=new Set(n.map(e=>e.id));for(const e of s.targets)o.has(e)||n.push({id:e,name:e});const l=e=>{const i=Object.assign(Object.assign({},s),e);r(t,{notify:i.targets.length?i:void 0})};return V`
        <div class="fold-section">
          ${a("notify_title")}<si-info>${a("notify_help")}</si-info>
        </div>
        ${n.map(e=>V`
            <div>
              <label>
                <input
                  type="checkbox"
                  .checked=${s.targets.includes(e.id)}
                  @change=${t=>{const i=t.target.checked;l({targets:i?[...s.targets,e.id]:s.targets.filter(t=>t!==e.id)})}}
                />
                ${"persistent_notification"===e.id?a("notify_persistent"):e.name}
              </label>
            </div>
          `)}
        ${n.length<=1?V`<div class="setting-note">${a("notify_none")}</div>`:""}
        ${s.targets.length?V`
              <div class="setting-row">
                <div class="setting-label">${a("notify_when")}</div>
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${e=>{const t=e.target.value;l("start_and_finish"===t?{when:"finish",start:!0}:{when:t,start:!1})}}
                  >
                    ${[["start_and_finish","notify_when_start_and_finish"],["finish","notify_when_finish"],["problems","notify_when_problems"]].map(([e,t])=>V`
                        <option
                          value=${e}
                          ?selected=${e===("problems"===s.when?"problems":s.start?"start_and_finish":"finish")}
                        >
                          ${a(t)}
                        </option>
                      `)}
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Ua}></path>
                  </svg>
                </div>
              </div>
            `:""}
      `};return V`
      <ha-card>
        <h1 class="card-header">
          <span>${a("title")}<si-info>${a("description")}</si-info></span>
        </h1>
        ${n.length?"":V`<div class="card-content">
              <div class="setting-note">${a("none_yet")}</div>
            </div>`}
        ${n.map((e,t)=>{var i,h,c,u;return V`
            <div class="card-content">
              ${S(`program:${e.id}`,V`<span class="fold-head"
                  ><span class="fold-head-text"
                    ><span class="fold-title">${d(e)}</span>
                    ${(e=>{const t=p(e.id);if(!t||!["running","paused","waiting"].includes(t.state))return"";const i="running"===t.state?a("state_running"):"paused"===t.state?di("planning.paused",s):a("state_waiting"),n=[],o=t.live||{};return"waiting"!==t.state&&o.steps>1&&o.step&&n.push(di("cards.running.step",s).replace("{step}",String(o.step)).replace("{steps}",String(o.steps))),"running"===t.state&&null!=o.remaining_seconds&&n.push(di("cards.running.program-left",s).replace("{time}",ta(o.remaining_seconds))),V`<span class="state-chip ${t.state}">${i}</span
        >${n.length?V` <span class="state-detail">${n.join(", ")}</span>`:""}`})(e)} ·
                    ${Ta((e.steps||[]).length,{none:a("steps_none"),one:a("steps_one"),many:a("steps_many")})}
                    ·
                    ${Ta((e.schedules||[]).length,{none:a("schedules_none"),one:a("schedules_one"),many:a("schedules_many")})}${(e.schedules||[]).length&&!(e.schedules||[]).some(e=>!1!==e.enabled)?V` · <em>${a("no_schedule_on")}</em>`:""}${(null===(i=p(e.id))||void 0===i?void 0:i.suspended_until)?V` · <em>${a("suspended")}</em>`:""}${v(e)?V` · <em>${_(e)}</em>`:""}</span
                  >${N(e)}</span
                >`,C(null!==(h=e.id)&&void 0!==h?h:"")?V`${f(e)}
                    ${D(null!==(c=e.id)&&void 0!==c?c:"",t)}`:V`
                      ${I(e)} ${f(e)}
                      ${this._textRow(a("name"),"",e.name,e=>r(t,{name:e}))}
                      ${A(e,`program:${e.id}`)}
                      <div class="fold-section">${a("steps_title")}</div>
                      ${(e.steps||[]).map((i,s)=>L(e,t,i,s))}
                      <div class="si-actions">
                        ${this._actionBtn(Ya,a("add_step"),()=>r(t,{steps:[...e.steps||[],{id:this._openNew("step","step_"+y()),zones:[],mode:"calculated",percent:100,seconds:0,passes:1,max_litres:0,min_seconds:0,max_seconds:0,adjust_seconds:0,delay:null,enabled:!0}]}))}
                      </div>
                      <div class="fold-section">${a("schedules_title")}</div>
                      ${U(e,t)}
                      ${j?this._numRow(V`${a("tours")}<si-info
                                  >${a("tours_help")}</si-info
                                >`,"",null!==(u=e.tours)&&void 0!==u?u:1,e=>r(t,{tours:Math.max(1,Math.round(l(e,1)))}),1,!1,1):""}
                      ${B(e,t)} ${w(e)}
                      ${n.length>1&&En(n,e.id).length?V`<div class="si-actions">
                              ${this._actionBtn(Ra,a("delete"),()=>{},!0,!0)}<si-info
                                >${a("delete_blocked_after").replace("{programs}",En(n,e.id).map(e=>d(e)).join(", "))}</si-info
                              >
                            </div>`:n.length>1?V`<div class="si-actions">
                                ${this._actionBtn(Ra,a("delete"),async()=>{await this._ask(a("confirm_delete_program").replace("{name}",e.name),!0)&&o(n.filter((e,i)=>i!==t))},!0)}
                              </div>`:""}
                    `)}
            </div>
          `})}
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn(Ya,a("add"),()=>o([...n,{id:this._openNew("program","program_"+y()),name:`${a("new_program")} ${n.length+1}`,steps:[],delay:0,tours:1,schedules:[]}]))}
          </div>
        </div>
        ${"advanced"===this.config.ui_mode||"parallel"===this.config.zone_sequencing||Number(null!==(t=this.config.watering_passes)&&void 0!==t?t:1)>1||Number(null!==(i=this.config.pause_between_zones)&&void 0!==i?i:0)>0?V`<div class="card-content">
                <details
                  class="more"
                  ?open=${this._isOpen("all_zones_now")}
                  @toggle=${e=>this._setOpen("all_zones_now",e.target.open)}
                >
                  <summary>
                    ${a("all_zones_button_title")}<si-info
                      >${a("all_zones_now_help")}</si-info
                    >
                  </summary>
                  <div class="more-body">
                    ${this.renderExecutionSettings(s,!0)}
                  </div>
                </details>
              </div>`:""}
      </ha-card>
    `}renderSuppliesCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const e=this.hass.language,t=t=>di(`supplies.${t}`,e),i=this.config.supplies||[],s=e=>{this.config=Object.assign(Object.assign({},this.config),{supplies:e}),this.handleConfigChange({supplies:e}),this._scheduleUpdate()},a=(e,t)=>s(i.map((i,s)=>s===e?Object.assign(Object.assign({},i),t):i)),n=e=>{const t=parseFloat(e);return isNaN(t)?0:t};return V`
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        ${i.map((o,r)=>{var l,d,h;return V`
            <div class="card-content">
              ${this._switchTitle(o.name||t("title"),!1!==o.enabled,e=>a(r,{enabled:e}))}
              ${this._textRow(t("name"),"",o.name,e=>a(r,{name:e}))}
              ${[...o.entities||[],""].map((e,i,s)=>V`
                    <div class="setting-row">
                      <div class="setting-label">
                        ${0===i?t("entities"):""}
                      </div>
                      <ha-entity-picker
                        class="entity-field"
                        .hass=${this.hass}
                        .value=${e}
                        .includeDomains=${["switch","valve","input_boolean","light"]}
                        allow-custom-entity
                        @value-changed=${e=>{var t;const n=((null===(t=e.detail)||void 0===t?void 0:t.value)||"").trim(),o=s.slice(0,-1);i<o.length?n?o[i]=n:o.splice(i,1):n&&o.push(n),a(r,{entities:o.filter((e,t)=>e&&o.indexOf(e)===t)})}}
                      ></ha-entity-picker>
                    </div>
                  `)}
              ${this._numRow(V`${t("delay_before")}<si-info
                    >${t("delay_before_help")}</si-info
                  >`,di("common.units.seconds",e),o.delay_before,e=>a(r,{delay_before:n(e)}))}
              ${this._numRow(V`${t("delay_after")}<si-info
                    >${t("delay_after_help")}</si-info
                  >`,di("common.units.seconds",e),o.delay_after,e=>a(r,{delay_after:n(e)}))}
              ${"advanced"===(null===(l=this.config)||void 0===l?void 0:l.ui_mode)||(null!==(d=o.kick_seconds)&&void 0!==d?d:0)>0?this._numRow(V`${t("kick_seconds")}<si-info
                          >${t("kick_seconds_help")}</si-info
                        >`,di("common.units.seconds",e),null!==(h=o.kick_seconds)&&void 0!==h?h:0,e=>a(r,{kick_seconds:Math.max(0,Math.min(60,Number(e)||0))}),1,!1,0):""}
              <div class="si-actions">
                ${this._actionBtn(Ra,t("delete"),async()=>{await this._ask(t("confirm_delete").replace("{name}",o.name||o.id||""),!0)&&(s(i.filter((e,t)=>t!==r)),this._clearSupplyFromZones(o.id))},!0)}
              </div>
            </div>
          `})}
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn(Ya,t("add"),()=>s([...i,{id:"supply_"+Math.random().toString(36).slice(2,8),name:"",entities:[],delay_before:0,delay_after:0,kick_seconds:0,enabled:!0}]))}
          </div>
        </div>
      </ha-card>
    `}async _clearSupplyFromZones(e){if(e&&this.hass){for(const t of this.zones.filter(t=>t.supply_id===e))try{await tn(this.hass,Object.assign(Object.assign({},t),{supply_id:null}))}catch(e){console.error("Error clearing the supply of a zone:",e)}this.zones=this.zones.map(t=>t.supply_id===e?Object.assign(Object.assign({},t),{supply_id:null}):t)}}async _seasonalCall(e){if(this.hass){try{await this.hass.callService(gi,"set_seasonal_adjustment",e)}catch(e){console.error("Seasonal adjustment failed:",e)}await this._fetchData()}}renderSeasonalAdjustmentsCard(){if(!this.config||!this.hass||"advanced"!==this.config.ui_mode)return V``;const e=this.hass.language,t=t=>di(`seasonal_adjustments.${t}`,e),i=this.config.seasonal_adjustments||[],s=(e,t)=>this._seasonalCall(Object.assign({adjustment_id:e},t));return V`
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        ${i.map(e=>{var i,a,n;return V`
            <div class="card-content si-subgroup">
              ${this._switchTitle(e.name,!1!==e.enabled,t=>s(e.id,{enabled:t}))}
              ${this._textRow(t("name"),"",e.name,t=>s(e.id,{name:t||e.name}))}
              ${this._numRow(t("month_start"),"1-12",e.month_start,t=>s(e.id,{month_start:Math.min(12,Math.max(1,parseInt(t,10)||1))}),1)}
              ${this._numRow(t("month_end"),"1-12",e.month_end,t=>s(e.id,{month_end:Math.min(12,Math.max(1,parseInt(t,10)||12))}),1)}
              ${this._numRow(t("multiplier"),"x",null!==(i=e.multiplier_adjustment)&&void 0!==i?i:1,t=>s(e.id,{multiplier_adjustment:Math.max(0,parseFloat(t)||0)}),.05)}
              ${this._numRow(t("threshold"),da(this.config,mi),null!==(a=e.threshold_adjustment)&&void 0!==a?a:0,t=>s(e.id,{threshold_adjustment:parseFloat(t)||0}),.5)}
              ${this._textRow(V`${t("zones")}<si-info>${t("zones_hint")}</si-info>`,"",Array.isArray(e.zones)?e.zones.join(", "):null!==(n=e.zones)&&void 0!==n?n:"all",t=>s(e.id,{zones:t.trim()||"all"}))}
              <ha-button
                @click=${()=>this._seasonalCall({adjustment_id:e.id,remove:!0})}
              >
                ${t("delete")}
              </ha-button>
            </div>
          `})}
        <div class="card-actions">
          <ha-button
            @click=${()=>this._seasonalCall({name:t("new_name"),month_start:6,month_end:8,multiplier_adjustment:1,threshold_adjustment:0,zones:"all",enabled:!0})}
          >
            ${t("add")}
          </ha-button>
        </div>
      </ha-card>
    `}renderSetupAssistantCard(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card>
        <h1 class="card-header header-action">
          <span
            >${di("panels.setup.title",e)}<si-info
              >${di("panels.general.cards.setup-assistant.description",e)}</si-info
            ></span
          >
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/setup`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${di("panels.general.cards.setup-assistant.open",e)}
          </ha-button>
        </h1>
      </ha-card>
    `}renderIuImportCard(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card>
        <h1 class="card-header header-action">
          <span
            >${di("panels.iu_import.title",e)}<si-info
              >${di("panels.general.cards.iu-import.description",e)}</si-info
            ></span
          >
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/iu_import`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${di("panels.general.cards.iu-import.open",e)}
          </ha-button>
        </h1>
      </ha-card>
    `}renderTriggersCard(){var e;if(!this.config||!this.data||!this.hass)return V``;const t=this.config.irrigation_start_triggers||[];return V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("irrigation_start_triggers.title",this.hass.language)}<si-info
              >${di("irrigation_start_triggers.description",this.hass.language)}</si-info
            ></span
          >
        </h1>

        ${!0===(null===(e=this.config)||void 0===e?void 0:e.full_controller)?"":V`<div class="card-content trigger-usage">
              ${di("irrigation_start_triggers.usage_before",this.hass.language)}
              <code>smart_irrigation_start_irrigation_all_zones</code
              >${di("irrigation_start_triggers.usage_after",this.hass.language)}
            </div>`}

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("irrigation_start_triggers.active_label",this.hass.language)}
            </div>
            <div class="select-wrap">
              <select
                class="field"
                @change=${e=>this.handleConfigChange({active_start_trigger:e.target.value})}
              >
                <option
                  value="default"
                  ?selected=${"default"===(this.config.active_start_trigger||"default")}
                >
                  ${di("irrigation_start_triggers.active_default",this.hass.language)}
                </option>
                ${t.map(e=>V`
                    <option
                      value="${e.name}"
                      ?selected=${this.config.active_start_trigger===e.name}
                    >
                      ${e.name}
                    </option>
                  `)}
                <option
                  value="none"
                  ?selected=${"none"===this.config.active_start_trigger}
                >
                  ${di("irrigation_start_triggers.active_none",this.hass.language)}
                </option>
              </select>
              <svg class="chev" viewBox="0 0 24 24">
                <path d=${Ua}></path>
              </svg>
            </div>
          </div>
          <div class="trigger-active-hint">
            ${di("irrigation_start_triggers.active_hint",this.hass.language)}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${"none"===this.config.active_start_trigger?V`
                  <div class="no-triggers">
                    ${di("irrigation_start_triggers.none_selected",this.hass.language)}
                  </div>
                `:""}
            ${t.map((e,t)=>this.renderTriggerItem(e,t))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(Ya,di("irrigation_start_triggers.add_trigger",this.hass.language),()=>this._addTrigger())}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,t){if(!this.hass)return V``;const i=di(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let s="";if(e.type!==wi||e.offset_minutes)if(e.type===vi&&0===e.offset_minutes)s=di("irrigation_start_triggers.offset_auto",this.hass.language);else{const t=Math.abs(e.offset_minutes),i=Math.floor(t/60),a=t%60,n=e.offset_minutes<0?di("common.labels.before",this.hass.language):di("common.labels.after",this.hass.language);s=i>0?`${i}h ${a}m ${n}`:`${a}m ${n}`}else s=e.at||yi;let a="";return e.type===_i&&void 0!==e.azimuth_angle&&(a=` (${e.azimuth_angle}°)`),V`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${i}${a} - ${s}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?di("common.labels.enabled",this.hass.language):di("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(t)}"
            title="${di("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${Ra}"
            @click="${()=>this._deleteTrigger(t)}"
            title="${di("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var t,i;const s=null===(i=null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===i?void 0:i[e];s&&this._showTriggerDialog({trigger:s,triggerIndex:e})}async _deleteTrigger(e){var t,i;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||!this.hass)return;const s=(null===(i=this.config.irrigation_start_triggers[e])||void 0===i?void 0:i.name)||"Unknown";if(await this._ask(di("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",s),!0)){const t=[...this.config.irrigation_start_triggers];t.splice(e,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[fi]:t}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}}async _showTriggerDialog(e){if(!this.hass)return;const t=document.createElement("smart-irrigation-trigger-dialog");t.hass=this.hass,t.addEventListener("trigger-save",e=>{this._handleTriggerSave(e.detail)}),t.addEventListener("trigger-delete",e=>{this._handleTriggerDelete(e.detail)}),document.body.appendChild(t),await t.showDialog(e),t.addEventListener("closed",e=>{const i=e.target;i&&"ha-dialog"===i.tagName.toLowerCase()&&document.body.removeChild(t)})}_handleTriggerSave(e){if(!this.config)return;const t=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?t.push(e.trigger):void 0!==e.index&&(t[e.index]=e.trigger),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[fi]:t}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}_handleTriggerDelete(e){var t;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===e.index)return;const i=[...this.config.irrigation_start_triggers];i.splice(e.index,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:i}),this.saveData({[fi]:i}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("weather_skip.title",this.hass.language)}<si-info
              >${di("weather_skip.description",this.hass.language)}</si-info
            ></span
          >
        </h1>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("weather_skip.forecast_label",this.hass.language)}
              <si-info>
                ${di("weather_skip.forecast_description",this.hass.language)}
              </si-info>
            </div>
            <ha-switch
              .checked=${!(!this.config.skip_irrigation_on_precipitation&&!this.config.forecast_rain_credit)}
              .disabled=${!this.config.use_weather_service&&!(this.config.skip_irrigation_on_precipitation||this.config.forecast_rain_credit)}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked,forecast_rain_credit:e.target.checked})}
            ></ha-switch>
          </div>
          ${this._forecastWithoutService()}
          ${this.config.skip_irrigation_on_precipitation||this.config.forecast_rain_credit?this._numRow(di("weather_skip.threshold_label",this.hass.language),da(this.config,mi),this.config.precipitation_threshold_mm,e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)}),.1):""}
        </div>
      </ha-card>
      ${this.renderMeasuredSkipCard()}
    `:V``}renderMeasuredSkipCard(){if(!this.config||!this.hass)return V``;const e=this.hass.language,t="imperial"!==this.config.units,i=t=>di(`measured_skip.${t}`,e),s=(e,t,i,s,a)=>V`
      <div class="setting-row">
        <div class="setting-label">${s}<si-info>${a}</si-info></div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${t||""}
          .includeDomains=${i}
          allow-custom-entity
          @value-changed=${t=>{var i;return this.handleConfigChange({[e]:(null===(i=t.detail)||void 0===i?void 0:i.value)||null})}}
        ></ha-entity-picker>
      </div>
    `,a=(e,t,i,s)=>V`
      <div class="si-subgroup">
        ${s?this._switchTitle(V`${e}<si-info>${t}</si-info>`,!!this.config[s],e=>this.handleConfigChange({[s]:e})):V`<div class="si-subgroup-title">
              ${e}<si-info>${t}</si-info>
            </div>`}
        ${i}
      </div>
    `,n=(e,t,i,s)=>a(t,i,s,e),o=(e,t,s,a,n)=>this._numRow(i("threshold"),a,null!=t?t:s,t=>this.handleConfigChange({[e]:""===t?null:parseFloat(t)}),n);return V`
      <ha-card>
        <h1 class="card-header">
          <span>${i("title")}<si-info>${i("description")}</si-info></span>
        </h1>
        <div class="card-content">
          ${n("skip_on_rain_sensor",i("rain.title"),i("rain.description"),V`
              ${this.config.skip_on_rain_sensor?V`${s("rain_sensor",this.config.rain_sensor,["binary_sensor"],i("sensor"),i("rain.sensor-hint"))}
                  ${"advanced"===this.config.ui_mode?V`<div class="setting-row">
                          <div class="setting-label">
                            ${i("rain.history-label")}
                          </div>
                          ${((e,t)=>V`
      <ha-switch
        .checked=${!!t}
        @change=${t=>this.handleConfigChange({[e]:t.target.checked})}
      ></ha-switch>
    `)("rain_history_enabled",this.config.rain_history_enabled)}
                        </div>
                        <div class="card-content">
                          ${i("rain.history-description")}
                        </div>`:""}`:""}
            `)}
          ${n("skip_on_freeze",i("freeze.title"),i("freeze.description"),V`
              ${this.config.skip_on_freeze?V`${o("freeze_threshold",this.config.freeze_threshold,t?2:36,t?"°C":"°F",.5)}
                  ${s("freeze_sensor",this.config.freeze_sensor,["sensor"],i("sensor-optional"),i("freeze.sensor-hint"))}
                  ${this._readingSource(Ni,this.config.freeze_sensor,"freeze_sensor")}`:""}
            `)}
          ${n("skip_on_wind",i("wind.title"),i("wind.description"),V`
              ${this.config.skip_on_wind?V`${o("wind_threshold",this.config.wind_threshold,t?20:12,t?"km/h":"mph",1)}
                  ${s("wind_sensor",this.config.wind_sensor,["sensor"],i("sensor-optional"),i("wind.sensor-hint"))}
                  ${this._readingSource(Ii,this.config.wind_sensor,"wind_sensor")}`:""}
            `)}
        </div>
      </ha-card>
    `}renderSkipPage(e){if(!this.hass)return V``;const t=this.hass.language,i=(this.zones||[]).filter(e=>!!e.soil_moisture_sensor).map(e=>{var t,i;return{zone_id:null!==(t=e.id)&&void 0!==t?t:0,zone:`${e.name} ${null!==(i=e.soil_moisture_threshold)&&void 0!==i?i:50} %`}});return V`
      ${e}
      <ha-card>
        <div class="card-content skip-soil">
          ${i.length?V`${di("panels.skip.soil-zones",t)}
              ${this._zoneLinks(i)}`:V`${di("panels.skip.soil-moisture",t)}
                <a
                  href="/${gi}/zones"
                  @click=${e=>{e.preventDefault(),_a(0,`/${gi}/zones`)}}
                  >${di("panels.skip.open-zones",t)}</a
                >`}
        </div>
      </ha-card>
    `}_readingSource(e,t,i){var s;const a=this.hass.language,n=(e,...t)=>di(`measured_skip.source.${e}`,a,...t),o=e=>{var t,i,s,a;return e&&(null===(a=null===(s=null===(i=null===(t=this.hass)||void 0===t?void 0:t.states)||void 0===i?void 0:i[e])||void 0===s?void 0:s.attributes)||void 0===a?void 0:a.friendly_name)||e||""},r=e=>n("group","{group}",e),l=((e,t,i)=>{var s;const a=[];for(const n of null!=e?e:[]){const e=null===(s=n.mappings)||void 0===s?void 0:s[t],o=null==e?void 0:e.source;if(!o||"none"===o)continue;const r=(null==e?void 0:e.sensorentity)||void 0,l=i?"sensor"===o&&r===i:"weather_service"===o;a.push({group:n.name,same:l,source:o,entity:r})}return a})(this.mappings,e,t),d=l.filter(e=>e.same).map(e=>r(e.group)),h=l.filter(e=>!e.same),c=h.find(e=>"sensor"===e.source&&e.entity&&e.entity!==t),u=t?n("sensor","{sensor}",o(t)):(null===(s=this.config)||void 0===s?void 0:s.use_weather_service)?n("service"):n("nothing"),p=h.map(e=>`${r(e.group)}: ${"sensor"===e.source?o(e.entity):"weather_service"===e.source?n("service-short"):n("static-short")}`).join("; ");return V`<div class="setting-hint reading-source">
      ${u} ${d.length?n("same","{groups}",d.join(", ")):""}
      ${!d.length&&h.length?n("other","{groups}",p):""}
      ${!d.length&&c?V`<div>
            <ha-button
              appearance="plain"
              size="small"
              @click=${()=>this.handleConfigChange({[i]:c.entity})}
            >
              ${n("adopt","{sensor}",o(c.entity))}
            </ha-button>
          </div>`:""}
    </div>`}renderObservedWateringCard(){var e,t;if(!this.config||!this.data||!this.hass)return V``;const i=this.hass.language;return"advanced"!==this.config.ui_mode?V``:V`
      <ha-card>
        ${this._switchHeader(V`${di("observed_watering.title",i)}<si-info
              >${di("observed_watering.description",i)}</si-info
            >`,!!this.config.observed_watering_enabled,e=>this.handleConfigChange({observed_watering_enabled:e}))}
        <div class="card-content">
          ${this.config.observed_watering_enabled&&"advanced"===this.config.ui_mode?V`${this._numRow(V`${di("observed_watering.leak_label",i)}<si-info
                    >${di("observed_watering.leak_description",i)}</si-info
                  >`,"L",null!==(e=this.config.leak_alert_litres)&&void 0!==e?e:0,e=>this.handleConfigChange({leak_alert_litres:Math.min(1e3,Math.max(0,parseFloat(e)||0))}))}`:""}
          ${!0===this.config.full_controller?V`${this._numRow(V`${di("observed_watering.set_aside_label",i)}<si-info
                    >${di("observed_watering.set_aside_description",i)}</si-info
                  >`,"",null!==(t=this.config.set_aside_after)&&void 0!==t?t:0,e=>this.handleConfigChange({set_aside_after:Math.min(10,Math.max(0,parseInt(e)||0))}))}`:""}
          ${!0===this.config.full_controller?"":this.renderExecutionSettings(i,!1)}
        </div>
      </ha-card>
    `}renderMasterSwitchCard(){if(!this.config||!this.hass)return V``;const e=this.hass.language,t=t=>di(`panels.general.cards.master-switch.${t}`,e),i=!1===this.config.irrigation_enabled?"off":!0===this.config.full_controller?"water":"calculate";return V`
      <ha-card class="master-switch" header="${t("title")}">
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${t("mode")}<si-info
                >${t("off"===i?"off-note":"calculate"===i?"calculate-note":"water-note")}</si-info
              >
            </div>
            <div class="select-wrap">
              <select
                class="field"
                @change=${async s=>{const a=s.target,n=a.value,o="off"===n?t("confirm-off"):"calculate"===n&&"water"===i?t("confirm-calculate"):"water"===n&&"water"!==i?di("observed_watering.confirm_full_controller",e):null;!o||await this._ask(o)?this.handleConfigChange("off"===n?{irrigation_enabled:!1}:"water"===n?Object.assign({irrigation_enabled:!0,watering_enabled:!0,full_controller:!0},"water"===i?{}:{observed_watering_enabled:!0}):{irrigation_enabled:!0,watering_enabled:!0,full_controller:!1,direct_valve_control_enabled:!1}).then(()=>this._fetchData()).catch(()=>{}):a.value=i}}
              >
                ${["water","calculate","off"].map(e=>V`<option value=${e} ?selected=${e===i}>
                      ${t(`mode-${e}`)}
                    </option>`)}
              </select>
              <svg class="chev" viewBox="0 0 24 24">
                <path d=${Ua}></path>
              </svg>
            </div>
          </div>
        </div>
      </ha-card>
    `}renderExecutionSettings(e,t){return this.config?V`
      <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
      <div class="setting-row">
        <div class="setting-label">
          ${di("observed_watering.sequencing_label",e)}${t?"":V`<si-info
                >${di("observed_watering.sequencing_description",e)}</si-info
              >`}
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change=${e=>this.handleConfigChange({zone_sequencing:e.target.value})}
          >
            <option
              value="sequential"
              ?selected=${"sequential"===this.config.zone_sequencing}
            >
              ${di("observed_watering.sequencing.sequential",e)}
            </option>
            <option
              value="parallel"
              ?selected=${"parallel"===this.config.zone_sequencing}
            >
              ${di("observed_watering.sequencing.parallel",e)}
            </option>
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Ua}></path>
          </svg>
        </div>
      </div>
      ${this.config.direct_valve_control_enabled&&(t||"advanced"===this.config.ui_mode)?this.renderCycleAndSoak(e):""}
    `:V``}renderCycleAndSoak(e){var t,i,s;if(!this.config)return V``;const a=this.config,n=Number(null!==(t=a.watering_passes)&&void 0!==t?t:1)||1,o=(a.programs||[]).some(e=>(e.steps||[]).some(e=>Number(e.passes)>1)),r="parallel"!==a.zone_sequencing;return V`
      ${this._numRow(V`${di("observed_watering.passes_label",e)}<si-info
            >${di("observed_watering.passes_description",e)}</si-info
          >`,"",n,e=>this.handleConfigChange({watering_passes:Math.min(6,Math.max(1,parseInt(e)||1))}))}
      ${n>1||o?V`${this._numRow(di("observed_watering.soak_label",e),di("observed_watering.minutes",e),null!==(i=a.soak_minutes)&&void 0!==i?i:15,e=>this.handleConfigChange({soak_minutes:Math.max(0,parseFloat(e)||0)}))}`:""}
      ${r?V`${this._numRow(V`${di("observed_watering.pause_between_zones_label",e)}<si-info
                >${di("observed_watering.pause_between_zones_description",e)}</si-info
              >`,di("observed_watering.seconds",e),null!==(s=a.pause_between_zones)&&void 0!==s?s:0,e=>this.handleConfigChange({pause_between_zones:Math.max(0,parseFloat(e)||0)}))}`:""}
    `}renderPanelModeCard(){if(!this.hass||!this.config)return V``;const e=this.hass.language,t="advanced"===this.config.ui_mode,i=t||!1===this.config.install_blueprints;return V`<ha-card>
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${di("panels.general.cards.panel-mode.labels.advanced",e)}<si-info
              >${di("panels.general.cards.panel-mode.labels.advanced-hint",e)}</si-info
            >
          </div>
          <ha-switch
            .checked=${t}
            @change=${e=>this.handleConfigChange({ui_mode:e.target.checked?"advanced":"standard"})}
          ></ha-switch>
        </div>
        ${i?V`<div class="setting-row">
              <div class="setting-label">
                ${di("blueprints.title",e)}<si-info
                  >${di("blueprints.install_label",e)}.
                  ${di("blueprints.install_help",e)}</si-info
                >
              </div>
              <ha-switch
                .checked=${!1!==this.config.install_blueprints}
                @change=${e=>this.handleConfigChange({install_blueprints:e.target.checked})}
              ></ha-switch>
            </div>`:""}
      </div>
    </ha-card>`}_switchHeader(e,t,i){return V`<h1 class="card-header si-head">
      <span>${e}</span>
      <ha-switch
        .checked=${t}
        @change=${e=>i(e.target.checked)}
      ></ha-switch>
    </h1>`}_switchTitle(e,t,i){return V`<div class="si-subgroup-title si-head">
      <span>${e}</span>
      <ha-switch
        .checked=${t}
        @change=${e=>i(e.target.checked)}
      ></ha-switch>
    </div>`}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.hass.config,t=(null==e?void 0:e.latitude)||0,i=(null==e?void 0:e.longitude)||0,s=(null==e?void 0:e.elevation)||0;return V`
      <ha-card>
        <h1 class="card-header"><span>${di("coordinate_config.title",this.hass.language)}<si-info>${di("coordinate_config.description",this.hass.language)}</si-info></span></h1>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${e=>this.saveData({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.data.manual_coordinates_enabled?V`
                    ${this._numRow(di("coordinate_config.latitude",this.hass.language),"",this.data.manual_latitude||t,e=>this.handleConfigChange({manual_latitude:parseFloat(e)}),.1)}
                    ${this._numRow(di("coordinate_config.longitude",this.hass.language),"",this.data.manual_longitude||i,e=>this.handleConfigChange({manual_longitude:parseFloat(e)}),.1)}
                    ${this._numRow(di("coordinate_config.elevation",this.hass.language),"",this.data.manual_elevation||s,e=>this.handleConfigChange({manual_elevation:parseFloat(e)}),1)}
                  `:V`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${di("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${di("coordinate_config.latitude",this.hass.language)}:
                      ${t}<br />
                      ${di("coordinate_config.longitude",this.hass.language)}:
                      ${i}<br />
                      ${di("coordinate_config.elevation",this.hass.language)}:
                      ${s}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){if(!this.config||!this.data||!this.hass)return V``;const e=(this.zones||[]).filter(e=>"number"==typeof e.days_between_irrigation).map(e=>{var t;return{zone_id:null!==(t=e.id)&&void 0!==t?t:0,zone:`${e.name} ${e.days_between_irrigation}`}});return V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("days_between_irrigation.title",this.hass.language)}<si-info
              >${di("days_between_irrigation.description",this.hass.language)}</si-info
            ></span
          >
        </h1>

        <div class="card-content">
          ${this._numRow(di("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,e=>this.handleConfigChange({days_between_irrigation:parseInt(e)}),1)}
          ${e.length?V`<div class="setting-hint row-hint skip-soil">
                ${di("days_between_irrigation.own",this.hass.language)}
                ${this._zoneLinks(e)}
              </div>`:""}
        </div>
      </ha-card>
    `}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this.config=Object.assign(Object.assign({},this.config),e),this._scheduleUpdate(),await Xa(this.hass,this.data)}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),va(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}handleConfigChange(e){return this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback(),void 0!==this._liveTimer&&(window.clearInterval(this._liveTimer),this._liveTimer=void 0)}_textRow(e,t,i,s){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_timeRow(e,t,i,s=""){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${s?V`<si-info>${s}</si-info>`:""}
        </div>
        <input
          class="field"
          type="time"
          .value=${t?String(t):""}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_conditionSetting(e){var t,i,s,a,n,o,r,l,d;const h=this.config;if(!h||!this.hass)return"";const c=this.hass.language,u=(e,...t)=>di(`programs.${e}`,c,...t),p="°F"!==(null===(i=null===(t=this.hass.config)||void 0===t?void 0:t.unit_system)||void 0===i?void 0:i.temperature),g=e=>Math.round(10*e)/10;switch(e){case"rain_sensor":{if(!h.skip_on_rain_sensor||!h.rain_sensor)return"";const e=null===(s=this.hass.states)||void 0===s?void 0:s[h.rain_sensor];return null!==(n=null===(a=null==e?void 0:e.attributes)||void 0===a?void 0:a.friendly_name)&&void 0!==n?n:h.rain_sensor}case"freeze":{if(!h.skip_on_freeze)return"";const e=null!==(o=h.freeze_threshold)&&void 0!==o?o:2;return u("cond_freeze","{value}",p?`${g(e)} °C`:`${g(9*e/5+32)} °F`)}case"wind":{if(!h.skip_on_wind)return"";const e=null!==(r=h.wind_threshold)&&void 0!==r?r:20;return u("cond_wind","{value}",p?`${g(e)} km/h`:`${g(e/1.609344)} mph`)}case"precipitation":{if(!h.skip_irrigation_on_precipitation)return"";const e=null!==(l=h.precipitation_threshold_mm)&&void 0!==l?l:2;return u("cond_precipitation","{value}",p?`${g(e)} mm`:`${g(e/25.4)} in`)}case"days_between":{const e=null!==(d=h.days_between_irrigation)&&void 0!==d?d:0,t=(this.zones||[]).map(e=>e.days_between_irrigation).filter(e=>"number"==typeof e&&e>0),i=e>0?[e,...t]:t;if(!i.length)return"";const s=Math.min(...i),a=Math.max(...i);return u("cond_days_between","{n}",s===a?String(s):`${s}-${a}`)}case"soil_moisture":{const e=(this.zones||[]).filter(e=>!!e.soil_moisture_sensor).length;return e<=0?"":u(1===e?"cond_soil_one":"cond_soil","{n}",String(e))}default:return""}}_advancedPath(e){return[di("panels.groups.settings",e),di("panels.general.title",e),di("panels.general.cards.panel-mode.labels.advanced",e)].join(" › ")}_monthDayRow(e,t,i,s){const a=/^(\d{2})-(\d{2})$/.exec(null!=t?t:""),n=a?Number(a[1]):0,o=a?Number(a[2]):1,r=e=>new Date(2024,e,0).getDate(),l=e=>String(e).padStart(2,"0"),d=(e,t)=>s(e?`${l(e)}-${l(Math.min(Math.max(t,1),r(e)))}`:null);return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="combo-field">
          <div class="select-wrap">
            <select
              class="field"
              @change=${e=>d(Number(e.target.value),o)}
            >
              <option value="0" ?selected=${!n}></option>
              ${Array.from({length:12},(e,t)=>V`
                  <option value=${t+1} ?selected=${n===t+1}>
                    ${i(t)}
                  </option>
                `)}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${Ua}></path>
            </svg>
          </div>
          <div class="select-wrap day-select">
            <select
              class="field"
              ?disabled=${!n}
              @change=${e=>d(n,Number(e.target.value))}
            >
              ${Array.from({length:n?r(n):31},(e,t)=>V`
                  <option value=${t+1} ?selected=${o===t+1}>
                    ${t+1}
                  </option>
                `)}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${Ua}></path>
            </svg>
          </div>
        </div>
      </div>
    `}_forecastWithoutService(){if(!this.hass||!this.config||this.config.use_weather_service)return"";const e=!(!this.config.skip_irrigation_on_precipitation&&!this.config.forecast_rain_credit);return V`<div class="setting-hint row-hint ${e?"warning-hint":""}">
      ${di(e?"weather_skip.forecast_no_service_on":"weather_skip.forecast_no_service",this.hass.language)}
      <a
        href="/${gi}/weatherservice"
        @click=${e=>{e.preventDefault(),_a(0,`/${gi}/weatherservice`)}}
        >${di("weather_skip.forecast_set_up_service",this.hass.language)}</a
      >
    </div>`}_numRow(e,t,i,s,a=1,n=!1,o=null){const r=(String(a).split(".")[1]||"").length,l=e=>null!==o&&e<o?o:e,d=(e,t)=>{const i=parseFloat(e.value),n=l(+((isNaN(i)?0:i)+t*a).toFixed(r));e.value=String(n),s(String(n))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${a}
            ?readonly=${n}
            .value=${null==i?"":String(i)}
            @wheel=${e=>{e.target.matches(":focus")&&e.preventDefault()}}
            min=${null!=o?o:""}
            @change=${e=>{const t=e.target,i=parseFloat(t.value);isNaN(i)||l(i)===i||(t.value=String(l(i))),s(t.value)}}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Ba}
            ?disabled=${n}
            @click=${e=>d(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ya}
            ?disabled=${n}
            @click=${e=>d(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Ua}></path>
          </svg>
        </div>
      </div>
    `}_programLabel(e,t){return t||e||""}_ask(e,t=!1){return Zn(this.hass,{text:e,destructive:t})}_actionBtn(e,t,i,s=!1,a=!1){return V`
      <ha-button
        appearance=${s?"outlined":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}static get styles(){return l`
      ${Gn} ${Kn} /* View-specific styles only - most common styles are now in globalStyle */

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

      /* The three sections of the settings page (#972). */
      /* The master switch stands apart from the page's description. */
      ha-card.master-switch {
        margin-top: 16px;
      }

      .run-views {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        overflow: hidden;
        margin: 4px 0 8px;
      }
      .run-views button {
        border: 0;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: 0.85em;
        padding: 4px 12px;
        cursor: pointer;
      }
      .run-views button.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .settings-section {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        /* The cards' 5 px margin and 16 px padding: the icon starts where
           their content does (#1050), the line spans the cards' width. */
        margin: 32px 5px 8px;
        padding: 16px 16px 0;
        border-top: 1px solid var(--divider-color);
      }
      /* The icon on the title's middle (#1056): both on one 28 px line,
         the icon centred in it. It hung 2 px under the line's top, and the
         heading's line was taller than the icon, so it sat low. */
      .settings-section ha-icon {
        color: var(--primary-color);
        display: flex;
        align-items: center;
        height: 28px;
      }
      .settings-section h2 {
        margin: 0;
        font-size: 1.3em;
        line-height: 28px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      /* A card that is only a way somewhere (the setup assistant, the
         Irrigation Unlimited import): the button on the title's line, not on
         a row of its own under a divider (#1056). */
      .card-header.header-action {
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
      }
      .card-header.header-action > span {
        flex: 1 1 auto;
        min-width: 0;
        overflow-wrap: anywhere;
        line-height: 1.3;
      }
      /* A button's own size, not the title's 24 px. */
      .card-header.header-action > ha-button {
        flex: 0 0 auto;
        font-size: var(--ha-font-size-m, 14px);
        letter-spacing: normal;
        line-height: normal;
      }
      /* A seasonal adjustment: its own padding, since .si-subgroup sets the
         card content's to 0 on the sides. */
      .card-content.si-subgroup {
        padding: 12px 16px;
      }
      .settings-section-sub {
        margin-top: 2px;
        color: var(--secondary-text-color);
      }
      .reading-source ha-button {
        margin-top: 4px;
      }

      /* Where a skip check reads its value, under its sensor field. */
      .reading-source {
        margin: -4px 0 8px;
      }

      /* A program's header row: its name and state, then its actions as
         icons. On a phone the text wraps and the icons keep their room. */
      .head-actions {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        --ha-icon-button-size: 36px;
      }
      .head-actions ha-icon-button {
        color: var(--primary-color);
      }
      .head-actions ha-icon-button.danger {
        color: var(--error-color, #db4437);
      }
      .head-actions ha-icon-button.on {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 50%;
      }
      .state-chip {
        display: inline-block;
        margin-left: 6px;
        padding: 0 8px;
        border-radius: 10px;
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.6;
        color: var(--text-primary-color, #fff);
        background: var(--primary-color);
      }
      .state-chip.waiting,
      .state-chip.paused {
        color: var(--primary-text-color);
        background: var(--secondary-background-color, #e5e5e5);
      }
      .state-detail {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      .skip-soil a {
        color: var(--primary-color);
      }

      /* The explanation under a setting: a nested .card-content has no
         padding of its own, so the text sat on the divider above it. */
      .setting-note {
        padding: 10px 0 12px;
        line-height: 1.4;
      }

      /* What the switch just above means: set as the hint under a label is
         (the Panel card), not as a paragraph of its own under a divider. */
      .setting-row:has(+ .setting-note),
      .setting-row:has(+ .setting-help) {
        border-bottom: 0;
      }
      .setting-row + .setting-note,
      .setting-help {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        line-height: 1.4;
        padding: 0 0 12px;
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
      .combo-field .select-wrap.day-select {
        width: 90px;
      }
      .cond-off {
        opacity: 0.55;
      }
      .cond-setting {
        color: var(--secondary-text-color);
        font-size: 0.9em;
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
    `}};i([fe()],oo.prototype,"narrow",void 0),i([fe()],oo.prototype,"path",void 0),i([fe()],oo.prototype,"data",void 0),i([fe()],oo.prototype,"config",void 0),i([fe()],oo.prototype,"section",void 0),i([fe({attribute:!1})],oo.prototype,"mappings",void 0),i([fe({attribute:!1})],oo.prototype,"zones",void 0),i([fe({attribute:!1})],oo.prototype,"planning",void 0),i([fe({attribute:!1})],oo.prototype,"programsState",void 0),i([fe({type:Boolean})],oo.prototype,"isLoading",void 0),i([fe({type:Boolean})],oo.prototype,"isSaving",void 0),oo=i([pe("smart-irrigation-view-general")],oo);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:ro}=le,lo=e=>e,ho=()=>document.createComment(""),co=(e,t,i)=>{const s=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(ho(),a),n=s.insertBefore(ho(),a);i=new ro(t,n,e,e.options)}else{const t=i._$AB.nextSibling,n=i._$AM,o=n!==e;if(o){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==n._$AU&&i._$AP(t)}if(t!==a||o){let e=i._$AA;for(;e!==t;){const t=lo(e).nextSibling;lo(s).insertBefore(e,a),e=t}}}return i},uo=(e,t,i=e)=>(e._$AI(t,i),e),po={},go=(e,t=po)=>e._$AH=t,mo=e=>{e._$AR(),e._$AA.remove()},fo=(e,t,i)=>{const s=new Map;for(let a=t;a<=i;a++)s.set(e[a],a);return s},vo=qs(class extends Js{constructor(e){if(super(e),e.type!==Gs)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const a=[],n=[];let o=0;for(const t of e)a[o]=s?s(t,o):o,n[o]=i(t,o),o++;return{values:n,keys:a}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const a=(e=>e._$AH)(e),{values:n,keys:o}=this.dt(t,i,s);if(!Array.isArray(a))return this.ut=o,n;const r=this.ut??=[],l=[];let d,h,c=0,u=a.length-1,p=0,g=n.length-1;for(;c<=u&&p<=g;)if(null===a[c])c++;else if(null===a[u])u--;else if(r[c]===o[p])l[p]=uo(a[c],n[p]),c++,p++;else if(r[u]===o[g])l[g]=uo(a[u],n[g]),u--,g--;else if(r[c]===o[g])l[g]=uo(a[c],n[g]),co(e,l[g+1],a[c]),c++,g--;else if(r[u]===o[p])l[p]=uo(a[u],n[p]),co(e,a[c],a[u]),u--,p++;else if(void 0===d&&(d=fo(o,p,g),h=fo(r,c,u)),d.has(r[c]))if(d.has(r[u])){const t=h.get(o[p]),i=void 0!==t?a[t]:null;if(null===i){const t=co(e,a[c]);uo(t,n[p]),l[p]=t}else l[p]=uo(i,n[p]),co(e,a[c],i),a[t]=null;p++}else mo(a[u]),u--;else mo(a[c]),c++;for(;p<=g;){const t=co(e,l[g+1]);uo(t,n[p]),l[p++]=t}for(;c<=u;){const e=a[c++];null!==e&&mo(e)}return this.ut=o,go(e,l),G}}),_o=["name","state","size","input_method","throughput","precipitation_rate","distribution_efficiency","linked_entity","extra_entities","supply_id","mapping","calculation_method","method_config","soil_type","drainage_rate","plant_type","multiplier","crop_factor_by_month","maximum_duration","maximum_bucket","lead_time","irrigation_threshold","days_between_irrigation","available_water","allowed_depletion","flow_sensor","observed_ignore_seconds","soil_moisture_sensor","soil_moisture_threshold","safety_off_mode","safety_off_topic","safety_off_state_key","safety_off_entity","safety_off_required","confirm_timeout","open_resends"],wo=new Set(["precipitation_rate","distribution_efficiency","linked_entity","extra_entities","supply_id","mapping","crop_factor_by_month","days_between_irrigation","available_water","allowed_depletion","flow_sensor","observed_ignore_seconds","soil_moisture_sensor","soil_moisture_threshold","safety_off_mode","safety_off_topic","safety_off_state_key","safety_off_entity","safety_off_required","confirm_timeout","open_resends"]),yo=new Set(_o),bo=e=>null==e||""===e||Array.isArray(e)&&0===e.length||"object"==typeof e&&!Array.isArray(e)&&0===Object.keys(e).length;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var $o,xo;function ko(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function zo(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth",e.Time="time"}($o||($o={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(xo||(xo={}));var So,Mo={exports:{}};var To,Oo=(So||(So=1,(To=Mo).exports=function(){var e,t;function i(){return e.apply(null,arguments)}function s(t){e=t}function a(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function o(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function r(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(o(e,t))return!1;return!0}function l(e){return void 0===e}function d(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function h(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function c(e,t){var i,s=[],a=e.length;for(i=0;i<a;++i)s.push(t(e[i],i));return s}function u(e,t){for(var i in t)o(t,i)&&(e[i]=t[i]);return o(t,"toString")&&(e.toString=t.toString),o(t,"valueOf")&&(e.valueOf=t.valueOf),e}function p(e,t,i,s){return is(e,t,i,s,!0).utc()}function g(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidOffset:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function m(e){return null==e._pf&&(e._pf=g()),e._pf}function f(e){var i=null,s=!1,a=e._d&&!isNaN(e._d.getTime());return a&&(i=m(e),s=t.call(i.parsedDateParts,function(e){return null!=e}),a=i.overflow<0&&!i.empty&&!i.invalidEra&&!i.invalidMonth&&!i.invalidOffset&&!i.invalidWeekday&&!i.weekdayMismatch&&!i.nullInput&&!i.invalidFormat&&!i.userInvalidated&&(!i.meridiem||i.meridiem&&s),e._strict&&(a=a&&0===i.charsLeftOver&&0===i.unusedTokens.length&&void 0===i.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?a:(e._isValid=a,e._isValid)}function v(e){var t=p(NaN);return null!=e?u(m(t),e):m(t).userInvalidated=!0,t}t=Array.prototype.some?Array.prototype.some:function(e){var t,i=Object(this),s=i.length>>>0;for(t=0;t<s;t++)if(t in i&&e.call(this,i[t],t,i))return!0;return!1};var _=i.momentProperties=[],w=!1;function y(e,t){var i,s,a,n=_.length;if(l(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),l(t._i)||(e._i=t._i),l(t._f)||(e._f=t._f),l(t._l)||(e._l=t._l),l(t._strict)||(e._strict=t._strict),l(t._tzm)||(e._tzm=t._tzm),l(t._isUTC)||(e._isUTC=t._isUTC),l(t._offset)||(e._offset=t._offset),l(t._pf)||(e._pf=m(t)),l(t._locale)||(e._locale=t._locale),n>0)for(i=0;i<n;i++)l(a=t[s=_[i]])||(e[s]=a);return e}function b(e){y(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===w&&(w=!0,i.updateOffset(this),w=!1)}function $(e){return e instanceof b||null!=e&&null!=e._isAMomentObject}function x(e){!1===i.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function k(e,t){var s=!0;return u(function(){if(null!=i.deprecationHandler&&i.deprecationHandler(null,e),s){var a,n,r,l=[],d=arguments.length;for(n=0;n<d;n++){if(a="","object"==typeof arguments[n]){for(r in a+="\n["+n+"] ",arguments[0])o(arguments[0],r)&&(a+=r+": "+arguments[0][r]+", ");a=a.slice(0,-2)}else a=arguments[n];l.push(a)}x(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),s=!1}return t.apply(this,arguments)},t)}var z={};function S(e,t){null!=i.deprecationHandler&&i.deprecationHandler(e,t),z[e]||(x(t+"\n"+(new Error).stack),z[e]=!0)}function M(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}i.suppressDeprecationWarnings=!1,i.deprecationHandler=null;var T={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function O(e){return"string"==typeof e?T[e]||T[e.toLowerCase()]:void 0}function A(e){var t,i,s={};for(i in e)o(e,i)&&(t=O(i))&&(s[t]=e[i]);return s}var C={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function H(e){var t,i=[];for(t in e)o(e,t)&&i.push({unit:t,priority:C[t]});return i.sort(function(e,t){return e.priority-t.priority}),i}function E(e,t,i){var s=""+Math.abs(e),a=t-s.length;return(e>=0?i?"+":"":"-")+Math.pow(10,Math.max(0,a)).toString().substr(1)+s}var D=/(\[[^\[]*\])|(\\e)|(\\)?(eHHmm|[Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,I={},j={};function R(e,t,i,s){var a=s;"string"==typeof s&&(a=function(){return this[s]()}),e&&(j[e]=a),t&&(j[t[0]]=function(){return E(a.apply(this,arguments),t[1],t[2])}),i&&(j[i]=function(){return this.localeData().ordinal(a.apply(this,arguments),e)})}function L(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function P(e){var t,i,s=e.match(D);for(t=0,i=s.length;t<i;t++)j[s[t]]?s[t]=j[s[t]]:s[t]=L(s[t]);return function(t){var a,n="";for(a=0;a<i;a++)n+=M(s[a])?s[a].call(t,e):s[a];return n}}function U(e,t){if(!e.isValid())return e.localeData().invalidDate();var i="$"+(t=B(t,e.localeData()));return o(I,i)||(I[i]=P(t)),I[i](e)}function B(e,t){var i=5;function s(e){return t.longDateFormat(e)||e}for(N.lastIndex=0;i>=0&&N.test(e);)e=e.replace(N,s),N.lastIndex=0,i-=1;return e}var F,W=/\d/,Y=/\d\d/,V=/\d{3}/,Z=/\d{4}/,G=/[+-]?\d{6}/,q=/\d\d?/,J=/\d\d\d\d?/,K=/\d\d\d\d\d\d?/,X=/\d{1,3}/,Q=/\d{1,4}/,ee=/[+-]?\d{1,6}/,te=/\d+/,ie=/[+-]?\d+/,se=/Z|[+-]\d\d:?\d\d/gi,ae=/Z|[+-]\d\d(?::?\d\d)?/gi,ne=/[+-]?\d+(\.\d{1,3})?/,oe=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,re=/^[1-9]\d?/,le=/^([1-9]\d|\d)/;function de(e,t,i){F[e]=M(t)?t:function(e,s){return e&&i?i:t}}function he(e,t){return o(F,e)?F[e](t._strict,t._locale):new RegExp(ce(e))}function ce(e){return ue(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,i,s,a){return t||i||s||a}))}function ue(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function pe(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function ge(e){var t=+e,i=0;return 0!==t&&isFinite(t)&&(i=pe(t)),i}F={};var me={};function fe(e,t){var i,s,a=t;for("string"==typeof e&&(e=[e]),d(t)&&(a=function(e,i){i[t]=ge(e)}),s=e.length,i=0;i<s;i++)me[e[i]]=a}function ve(e,t){fe(e,function(e,i,s,a){s._w=s._w||{},t(e,s._w,s,a)})}function _e(e,t,i){null!=t&&o(me,e)&&me[e](t,i._a,i,e)}function we(e){return e%4==0&&e%100!=0||e%400==0}var ye=0,be=1,$e=2,xe=3,ke=4,ze=5,Se=6,Me=7,Te=8;function Oe(e){return we(e)?366:365}R("Y",0,0,function(){var e=this.year();return e<=9999?E(e,4):"+"+e}),R(0,["YY",2],0,function(){return this.year()%100}),R(0,["YYYY",4],0,"year"),R(0,["YYYYY",5],0,"year"),R(0,["YYYYYY",6,!0],0,"year"),de("Y",ie),de("YY",q,Y),de("YYYY",Q,Z),de("YYYYY",ee,G),de("YYYYYY",ee,G),fe(["YYYYY","YYYYYY"],ye),fe("YYYY",function(e,t){t[ye]=2===e.length?i.parseTwoDigitYear(e):ge(e)}),fe("YY",function(e,t){t[ye]=i.parseTwoDigitYear(e)}),fe("Y",function(e,t){t[ye]=parseInt(e,10)}),i.parseTwoDigitYear=function(e){return ge(e)+(ge(e)>68?1900:2e3)};var Ae,Ce=Ee("FullYear",!0);function He(){return we(this.year())}function Ee(e,t){return function(s){return null!=s?(Ne(this,e,s),i.updateOffset(this,t),this):De(this,e)}}function De(e,t){if(!e.isValid())return NaN;var i=e._d,s=e._isUTC;switch(t){case"Milliseconds":return s?i.getUTCMilliseconds():i.getMilliseconds();case"Seconds":return s?i.getUTCSeconds():i.getSeconds();case"Minutes":return s?i.getUTCMinutes():i.getMinutes();case"Hours":return s?i.getUTCHours():i.getHours();case"Date":return s?i.getUTCDate():i.getDate();case"Day":return s?i.getUTCDay():i.getDay();case"Month":return s?i.getUTCMonth():i.getMonth();case"FullYear":return s?i.getUTCFullYear():i.getFullYear();default:return NaN}}function Ne(e,t,i){var s,a,n,o,r;if(e.isValid()&&!isNaN(i)){switch(s=e._d,a=e._isUTC,t){case"Milliseconds":return void(a?s.setUTCMilliseconds(i):s.setMilliseconds(i));case"Seconds":return void(a?s.setUTCSeconds(i):s.setSeconds(i));case"Minutes":return void(a?s.setUTCMinutes(i):s.setMinutes(i));case"Hours":return void(a?s.setUTCHours(i):s.setHours(i));case"Date":return void(a?s.setUTCDate(i):s.setDate(i));case"FullYear":break;default:return}n=i,o=e.month(),r=29!==(r=e.date())||1!==o||we(n)?r:28,a?s.setUTCFullYear(n,o,r):s.setFullYear(n,o,r)}}function Ie(e){return M(this[e=O(e)])?this[e]():this}function je(e,t){if("object"==typeof e){var i,s=H(e=A(e)),a=s.length;for(i=0;i<a;i++)this[s[i].unit](e[s[i].unit])}else if(M(this[e=O(e)]))return this[e](t);return this}function Re(e,t){return(e%t+t)%t}function Le(e,t){if(isNaN(e)||isNaN(t))return NaN;var i=Re(t,12);return e+=(t-i)/12,1===i?we(e)?29:28:31-i%7%2}Ae=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},R("M",["MM",2],"Mo",function(){return this.month()+1}),R("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),R("MMMM",0,0,function(e){return this.localeData().months(this,e)}),de("M",q,re),de("MM",q,Y),de("MMM",function(e,t){return t.monthsShortRegex(e)}),de("MMMM",function(e,t){return t.monthsRegex(e)}),fe(["M","MM"],function(e,t){t[be]=ge(e)-1}),fe(["MMM","MMMM"],function(e,t,i,s){var a=i._locale.monthsParse(e,s,i._strict);null!=a?t[be]=a:m(i).invalidMonth=e});var Pe="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Ue="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Be=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Fe=oe,We=oe,Ye=["monthsParse","longMonthsParse","shortMonthsParse","monthsRegex","monthsShortRegex","monthsStrictRegex","monthsShortStrictRegex"];function Ve(e,t){var i,s;for(i=0;i<Ye.length;i++)o(t,s=Ye[i])||delete e["_"+s]}function Ze(e,t){return e?a(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||Be).test(t)?"format":"standalone"][e.month()]:a(this._months)?this._months:this._months.standalone}function Ge(e,t){return e?a(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[Be.test(t)?"format":"standalone"][e.month()]:a(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function qe(e,t,i){var s,a,n,o=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)n=p([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(n,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(n,"").toLocaleLowerCase();return i?"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,o))?a:null:-1!==(a=Ae.call(this._longMonthsParse,o))?a:null:"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,o))||-1!==(a=Ae.call(this._longMonthsParse,o))?a:null:-1!==(a=Ae.call(this._longMonthsParse,o))||-1!==(a=Ae.call(this._shortMonthsParse,o))?a:null}function Je(e,t,i){var s,a,n;if(this._monthsParseExact)return qe.call(this,e,t,i);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(a=p([2e3,s]),i&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(a,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(a,"").replace(".","")+"$","i")),i||this._monthsParse[s]||(n="^"+this.months(a,"")+"|^"+this.monthsShort(a,""),this._monthsParse[s]=new RegExp(n.replace(".",""),"i")),i&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(i&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!i&&this._monthsParse[s].test(e))return s}}function Ke(e,t){if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=ge(t);else if(!d(t=e.localeData().monthsParse(t)))return e;var i=t,s=e.date();return s=s<29?s:Math.min(s,Le(e.year(),i)),e._isUTC?e._d.setUTCMonth(i,s):e._d.setMonth(i,s),e}function Xe(e){return null!=e?(Ke(this,e),i.updateOffset(this,!0),this):De(this,"Month")}function Qe(){return Le(this.year(),this.month())}function et(e){return this._monthsParseExact?(o(this,"_monthsRegex")||it.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(o(this,"_monthsShortRegex")||(this._monthsShortRegex=Fe),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function tt(e){return this._monthsParseExact?(o(this,"_monthsRegex")||it.call(this),e?this._monthsStrictRegex:this._monthsRegex):(o(this,"_monthsRegex")||(this._monthsRegex=We),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function it(){function e(e,t){return t.length-e.length}var t,i,s,a,n=[],o=[],r=[];for(t=0;t<12;t++)i=p([2e3,t]),s=ue(this.monthsShort(i,"")),a=ue(this.months(i,"")),n.push(s),o.push(a),r.push(a),r.push(s);n.sort(e),o.sort(e),r.sort(e),this._monthsRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+n.join("|")+")","i")}function st(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function at(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function nt(e,t){return e.slice(t,7).concat(e.slice(0,t))}R("d",0,"do","day"),R("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),R("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),R("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),R("e",0,0,"weekday"),R("E",0,0,"isoWeekday"),R("eHHmm",0,0,function(){return""+this.weekday()+E(this.hours(),2)+E(this.minutes(),2)}),de("d",q),de("e",q),de("E",q),de("eHHmm",K),de("dd",function(e,t){return t.weekdaysMinRegex(e)}),de("ddd",function(e,t){return t.weekdaysShortRegex(e)}),de("dddd",function(e,t){return t.weekdaysRegex(e)}),ve(["dd","ddd","dddd"],function(e,t,i,s){var a=i._locale.weekdaysParse(e,s,i._strict);null!=a?t.d=a:m(i).invalidWeekday=e}),ve(["d","e","E"],function(e,t,i,s){t[s]=ge(e)}),ve("eHHmm",function(e,t,i){var s=e.length-4;t.e=ge(e.substr(0,s)),i._a[xe]=ge(e.substr(s,2)),i._a[ke]=ge(e.substr(s+2))});var ot,rt="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),lt="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),dt="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ht=oe,ct=oe,ut=oe,pt=["weekdaysParse","fullWeekdaysParse","shortWeekdaysParse","minWeekdaysParse","weekdaysRegex","weekdaysShortRegex","weekdaysMinRegex","weekdaysStrictRegex","weekdaysShortStrictRegex","weekdaysMinStrictRegex"];function gt(e,t){var i,s;for(i=0;i<pt.length;i++)o(t,s=pt[i])||delete e["_"+s]}function mt(e,t){var i=a(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"];return!0===e?nt(i,this._week.dow):e?i[e.day()]:i}function ft(e){return!0===e?nt(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function vt(e){return!0===e?nt(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function _t(e,t,i){var s,a,n,o=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)n=p([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(n,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(n,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(n,"").toLocaleLowerCase();return i?"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,o))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,o))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,o))?a:null:"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,o))||-1!==(a=Ae.call(this._shortWeekdaysParse,o))||-1!==(a=Ae.call(this._minWeekdaysParse,o))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,o))||-1!==(a=Ae.call(this._weekdaysParse,o))||-1!==(a=Ae.call(this._minWeekdaysParse,o))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,o))||-1!==(a=Ae.call(this._weekdaysParse,o))||-1!==(a=Ae.call(this._shortWeekdaysParse,o))?a:null}function wt(e,t,i){var s,a,n;if(this._weekdaysParseExact)return _t.call(this,e,t,i);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(a=p([2e3,1]).day(s),i&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(a,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(a,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(a,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[s]||(n="^"+this.weekdays(a,"")+"|^"+this.weekdaysShort(a,"")+"|^"+this.weekdaysMin(a,""),this._weekdaysParse[s]=new RegExp(n.replace(".",""),"i")),i&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(i&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(i&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!i&&this._weekdaysParse[s].test(e))return s}}function yt(e){if(!this.isValid())return null!=e?this:NaN;var t=De(this,"Day");return null!=e?(e=st(e,this.localeData()),this.add(e-t,"d")):t}function bt(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function $t(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=at(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7}function xt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||St.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(o(this,"_weekdaysRegex")||(this._weekdaysRegex=ht),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function kt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||St.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(o(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ct),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function zt(e){return this._weekdaysParseExact?(o(this,"_weekdaysRegex")||St.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(o(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=ut),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function St(){function e(e,t){return t.length-e.length}var t,i,s,a,n,o=[],r=[],l=[],d=[];for(t=0;t<7;t++)i=p([2e3,1]).day(t),s=ue(this.weekdaysMin(i,"")),a=ue(this.weekdaysShort(i,"")),n=ue(this.weekdays(i,"")),o.push(s),r.push(a),l.push(n),d.push(s),d.push(a),d.push(n);o.sort(e),r.sort(e),l.sort(e),d.sort(e),this._weekdaysRegex=new RegExp("^("+d.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+o.join("|")+")","i")}function Mt(e){var t,i;for(i in Ve(this,e),gt(this,e),e)o(e,i)&&(M(t=e[i])?this[i]=t:this["_"+i]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function Tt(e,t){var i,s=u({},e);for(i in t)o(t,i)&&(n(e[i])&&n(t[i])?(s[i]={},u(s[i],e[i]),u(s[i],t[i])):null!=t[i]?s[i]=t[i]:delete s[i]);for(i in e)o(e,i)&&!o(t,i)&&n(e[i])&&(s[i]=u({},s[i]));return s}function Ot(e){null!=e&&this.set(e)}ot=Object.keys?Object.keys:function(e){var t,i=[];for(t in e)o(e,t)&&i.push(t);return i};var At={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function Ct(e,t,i){var s=this._calendar[e]||this._calendar.sameElse;return M(s)?s.call(t,i):s}var Ht={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function Et(e){var t=this._longDateFormat[e],i=this._longDateFormat[e.toUpperCase()],s=this._longDateFormatCache;return t||!i?t:s&&s[e]&&s[e].formatUpper===i?s[e].format:(t=i.match(D).map(function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e}).join(""),s||(s=this._longDateFormatCache={}),s[e]={formatUpper:i,format:t},t)}var Dt="Invalid date";function Nt(){return this._invalidDate}var It="%d",jt=/\d{1,2}/;function Rt(e){return this._ordinal.replace("%d",e)}var Lt={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function Pt(e,t,i,s){var a=this._relativeTime[i];return M(a)?a(e,t,i,s):a.replace(/%d/i,e)}function Ut(e,t,i,s){return this.postformat(Pt.call(this,e,t,i,s))}function Bt(e,t){var i=this._relativeTime[e>0?"future":"past"];return M(i)?i(t):i.replace(/%s/i,t)}function Ft(e,t){return this.postformat(Bt.call(this,e,t))}function Wt(e,t,i,s,a,n,o){var r;return e<100&&e>=0?(r=new Date(e+400,t,i,s,a,n,o),isFinite(r.getFullYear())&&r.setFullYear(e)):r=new Date(e,t,i,s,a,n,o),r}function Yt(e){var t,i;return e<100&&e>=0?((i=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,i)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function Vt(e,t,i){var s=7+t-i;return-(7+Yt(e,0,s).getUTCDay()-t)%7+s-1}function Zt(e,t,i,s,a){var n,o,r=1+7*(t-1)+(7+i-s)%7+Vt(e,s,a);return r<=0?o=Oe(n=e-1)+r:r>Oe(e)?(n=e+1,o=r-Oe(e)):(n=e,o=r),{year:n,dayOfYear:o}}function Gt(e,t,i,s){var a,n,o=Vt(e,i,s),r=Math.floor((t-o-1)/7)+1;return r<1?a=r+Kt(n=e-1,i,s):r>Kt(e,i,s)?(a=r-Kt(e,i,s),n=e+1):(n=e,a=r),{week:a,year:n}}function qt(e,t,i){return Gt(e.year(),e.dayOfYear(),t,i)}function Jt(e,t,i,s,a){return Gt(e,Math.round((Yt(e,t,i)-Yt(e,0,1))/864e5)+1,s,a)}function Kt(e,t,i){var s=Vt(e,t,i),a=Vt(e+1,t,i);return(Oe(e)-s+a)/7}function Xt(e){return qt(e,this._week.dow,this._week.doy).week}R("w",["ww",2],"wo","week"),R("W",["WW",2],"Wo","isoWeek"),de("w",q,re),de("ww",q,Y),de("W",q,re),de("WW",q,Y),ve(["w","ww","W","WW"],function(e,t,i,s){t[s.substr(0,1)]=ge(e)});var Qt={dow:0,doy:6};function ei(){return this._week.dow}function ti(){return this._week.doy}function ii(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function si(e){var t=qt(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function ai(){return this.hours()%12||12}function ni(){return this.hours()||24}function oi(e,t){R(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function ri(e,t){return t._meridiemParse}function li(e){return"p"===(e+"").toLowerCase().charAt(0)}R("H",["HH",2],0,"hour"),R("h",["hh",2],0,ai),R("k",["kk",2],0,ni),R("hmm",0,0,function(){return""+ai.apply(this)+E(this.minutes(),2)}),R("hmmss",0,0,function(){return""+ai.apply(this)+E(this.minutes(),2)+E(this.seconds(),2)}),R("Hmm",0,0,function(){return""+this.hours()+E(this.minutes(),2)}),R("Hmmss",0,0,function(){return""+this.hours()+E(this.minutes(),2)+E(this.seconds(),2)}),oi("a",!0),oi("A",!1),de("a",ri),de("A",ri),de("H",q,le),de("h",q,re),de("k",q,re),de("HH",q,Y),de("hh",q,Y),de("kk",q,Y),de("hmm",J),de("hmmss",K),de("Hmm",J),de("Hmmss",K),fe(["H","HH"],xe),fe(["k","kk"],function(e,t,i){var s=ge(e);t[xe]=24===s?0:s}),fe(["a","A"],function(e,t,i){i._isPm=i._locale.isPM(e),i._meridiem=e}),fe(["h","hh"],function(e,t,i){t[xe]=ge(e),m(i).bigHour=!0}),fe("hmm",function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s)),m(i).bigHour=!0}),fe("hmmss",function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[ze]=ge(e.substr(a)),m(i).bigHour=!0}),fe("Hmm",function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s))}),fe("Hmmss",function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[ze]=ge(e.substr(a))});var di=/[ap]\.?m?\.?/i,hi=Ee("Hours",!0);function ci(e,t,i){return e>11?i?"pm":"PM":i?"am":"AM"}var ui,pi={calendar:At,longDateFormat:Ht,invalidDate:Dt,ordinal:It,dayOfMonthOrdinalParse:jt,relativeTime:Lt,months:Pe,monthsShort:Ue,week:Qt,weekdays:rt,weekdaysMin:dt,weekdaysShort:lt,meridiemParse:di},gi={},mi={};function fi(e,t){var i,s=Math.min(e.length,t.length);for(i=0;i<s;i+=1)if(e[i]!==t[i])return i;return s}function vi(e){return e?e.toLowerCase().replace("_","-"):e}function _i(e){for(var t,i,s,a,n=0;n<e.length;){for(t=(a=vi(e[n]).split("-")).length,i=(i=vi(e[n+1]))?i.split("-"):null;t>0;){if(s=yi(a.slice(0,t).join("-")))return s;if(i&&i.length>=t&&fi(a,i)>=t-1)break;t--}n++}return ui}function wi(e){return"string"==typeof e&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e)}function yi(e){var t,i=null;if(o(gi,e))return gi[e];if(t=vi(e),o(gi,t))return gi[t];if(To&&To.exports&&wi(t))try{i=ui._abbr,zo("./locale/"+t),bi(i)}catch(e){gi[t]=null}return o(gi,t)?gi[t]:void 0}function bi(e,t){var i;return e&&((i=l(t)?ki(e):$i(e,t))?ui=i:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),ui._abbr}function $i(e,t){if(null!==t){var i,s=pi;if(t.abbr=e,null!=gi[e])S("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),s=gi[e]._config;else if(null!=t.parentLocale)if(null!=gi[t.parentLocale])s=gi[t.parentLocale]._config;else{if(null==(i=yi(t.parentLocale)))return mi[t.parentLocale]||(mi[t.parentLocale]=[]),mi[t.parentLocale].push({name:e,config:t}),null;s=i._config}return gi[e]=new Ot(Tt(s,t)),mi[e]&&mi[e].forEach(function(e){$i(e.name,e.config)}),bi(e),gi[e]}return delete gi[e],null}function xi(e,t){var i,s=yi(e),a=pi;return null!=s&&(e=s._abbr),null!=t?(null!=gi[e]&&null!=gi[e].parentLocale?gi[e].set(Tt(gi[e]._config,t)):(null!=s&&(a=s._config),t=Tt(a,t),null==s&&(t.abbr=e),(i=new Ot(t)).parentLocale=gi[e],gi[e]=i),bi(e)):null!=gi[e]&&(null!=gi[e].parentLocale?(gi[e]=gi[e].parentLocale,e===bi()&&bi(e)):null!=gi[e]&&delete gi[e]),gi[e]}function ki(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return ui;if(!a(e)){if(t=yi(e))return t;e=[e]}return _i(e)}function zi(){return ot(gi)}function Si(e){var t,i=e._a;return i&&-2===m(e).overflow&&(t=i[be]<0||i[be]>11?be:i[$e]<1||i[$e]>Le(i[ye],i[be])?$e:i[xe]<0||i[xe]>24||24===i[xe]&&(0!==i[ke]||0!==i[ze]||0!==i[Se])?xe:i[ke]<0||i[ke]>59?ke:i[ze]<0||i[ze]>59?ze:i[Se]<0||i[Se]>999?Se:-1,m(e)._overflowDayOfYear&&(t<ye||t>$e)&&(t=$e),m(e)._overflowWeeks&&-1===t&&(t=Me),m(e)._overflowWeekday&&-1===t&&(t=Te),m(e).overflow=t),e}var Mi=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ti=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Oi=/Z|[+-]\d\d(?::?\d\d)?/,Ai=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],Ci=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Hi=/^\/?Date\((-?\d+)/i,Ei=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Di={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Ni(e){var t,i,s,a,n,o,r=e._i,l=Mi.exec(r)||Ti.exec(r),d=Ai.length,h=Ci.length;if(l){for(m(e).iso=!0,t=0,i=d;t<i;t++)if(Ai[t][1].exec(l[1])){a=Ai[t][0],s=!1!==Ai[t][2];break}if(null==a)return void(e._isValid=!1);if(l[3]){for(t=0,i=h;t<i;t++)if(Ci[t][1].exec(l[3])){n=(l[2]||" ")+Ci[t][0];break}if(null==n)return void(e._isValid=!1)}if(!s&&null!=n)return void(e._isValid=!1);if(l[4]){if(!Oi.exec(l[4]))return void(e._isValid=!1);o="Z"}e._f=a+(n||"")+(o||""),qi(e)}else e._isValid=!1}function Ii(e,t,i,s,a,n){var o=[ji(e),Ue.indexOf(t),parseInt(i,10),parseInt(s,10),parseInt(a,10)];return n&&o.push(parseInt(n,10)),o}function ji(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function Ri(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function Li(e,t,i){return!e||lt.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(m(i).weekdayMismatch=!0,i._isValid=!1,!1)}function Pi(e,t,i){if(e)return Di[e];if(t)return 0;var s=parseInt(i,10),a=s%100;return(s-a)/100*60+a}function Ui(e){var t,i=Ei.exec(Ri(e._i));if(i){if(t=Ii(i[4],i[3],i[2],i[5],i[6],i[7]),!Li(i[1],t,e))return;e._a=t,e._tzm=Pi(i[8],i[9],i[10]),e._d=Yt.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),m(e).rfc2822=!0}else e._isValid=!1}function Bi(e){var t=Hi.exec(e._i);null===t?(Ni(e),!1===e._isValid&&(delete e._isValid,Ui(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:i.createFromInputFallback(e)))):e._d=new Date(+t[1])}function Fi(e,t,i){return null!=e?e:null!=t?t:i}function Wi(e,t,s){var a=Object.prototype.hasOwnProperty.call(e,"_isDefaultDatePartsForWeek"),n=e._isDefaultDatePartsForWeek;e._isDefaultDatePartsForWeek=!!s;try{return i._getDefaultDateParts(e,t,s)}finally{a?e._isDefaultDatePartsForWeek=n:delete e._isDefaultDatePartsForWeek}}function Yi(e){var t=e._defaultDatePartsNow;return t?(t.hasValue||(t.value=i.now(),t.hasValue=!0),t.value):i.now()}function Vi(e,t,i){var s=i||e._isDefaultDatePartsForWeek,a=s?ss(t):new Date(t);return s?[a.year(),a.month(),a.date()]:e._useUTC?[a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()]:[a.getFullYear(),a.getMonth(),a.getDate()]}function Zi(e){var t,i,s,a,n,o,r,l=[];if(!e._d){for(null!=e._a[ye]&&null!=e._a[be]&&null!=e._a[$e]||(a=Wi(e,s=Yi(e))),e._w&&null==e._a[$e]&&null==e._a[be]&&Gi(e,Wi(e,s,!0)),null!=e._dayOfYear&&(o=null!=e._a[ye]?e._a[ye]:a[ye],(e._dayOfYear>Oe(o)||0===e._dayOfYear)&&(m(e)._overflowDayOfYear=!0),i=Yt(o,0,e._dayOfYear),e._a[be]=i.getUTCMonth(),e._a[$e]=i.getUTCDate()),r=null==e._a[ye]||null==e._a[be]||null==e._a[$e],t=0;t<3&&null==e._a[t];++t)e._a[t]=l[t]=a[t];for(;t<7;t++)e._a[t]=l[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[xe]&&0===e._a[ke]&&0===e._a[ze]&&0===e._a[Se]&&(e._nextDay=!0,e._a[xe]=0),e._d=(e._useUTC?Yt:Wt).apply(null,l),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[xe]=24),e._w&&void 0!==e._w.d&&!r&&e._w.d!==n&&(m(e).weekdayMismatch=!0)}}function Gi(e,t){var i,s,a,n,o,r,l,d,h;null!=(i=e._w).GG||null!=i.W||null!=i.E?(o=1,r=4,s=Fi(i.GG,e._a[ye],Jt(t[ye],t[be],t[$e],1,4).year),a=Fi(i.W,1),((n=Fi(i.E,1))<1||n>7)&&(d=!0)):(o=e._locale._week.dow,r=e._locale._week.doy,h=Jt(t[ye],t[be],t[$e],o,r),s=Fi(i.gg,e._a[ye],h.year),a=Fi(i.w,h.week),null!=i.d?((n=i.d)<0||n>6)&&(d=!0):null!=i.e?(n=i.e+o,(i.e<0||i.e>6)&&(d=!0)):n=o),a<1||a>Kt(s,o,r)?m(e)._overflowWeeks=!0:null!=d?m(e)._overflowWeekday=!0:(l=Zt(s,a,n,o,r),e._a[ye]=l.year,e._dayOfYear=l.dayOfYear)}function qi(e){if(e._f!==i.ISO_8601)if(e._f!==i.RFC_2822){e._a=[],m(e).empty=!0;var t,s,a,n,o,r,l,d=""+e._i,h=d.length,c=0;for(l=(a=B(e._f,e._locale).match(D)||[]).length,t=0;t<l;t++)n=a[t],(s=(d.match(he(n,e))||[])[0])&&((o=d.substr(0,d.indexOf(s))).length>0&&m(e).unusedInput.push(o),d=d.slice(d.indexOf(s)+s.length),c+=s.length),j[n]?(s?m(e).empty=!1:m(e).unusedTokens.push(n),_e(n,s,e)):e._strict&&!s&&m(e).unusedTokens.push(n);m(e).charsLeftOver=h-c,d.length>0&&m(e).unusedInput.push(d),e._a[xe]<=12&&!0===m(e).bigHour&&e._a[xe]>0&&(m(e).bigHour=void 0),m(e).parsedDateParts=e._a.slice(0),m(e).meridiem=e._meridiem,e._a[xe]=Ji(e._locale,e._a[xe],e._meridiem),null!==(r=m(e).era)&&(e._a[ye]=e._locale.erasConvertYear(r,e._a[ye])),Zi(e),Si(e)}else Ui(e);else Ni(e)}function Ji(e,t,i){var s;return null==i?t:null!=e.meridiemHour?e.meridiemHour(t,i):null!=e.isPM?((s=e.isPM(i))&&t<12&&(t+=12),s||12!==t||(t=0),t):t}function Ki(e){var t,i,s,a,n,o,r=!1,l={},d=e._f.length;if(0===d)return m(e).invalidFormat=!0,void(e._d=new Date(NaN));for(a=0;a<d;a++)n=0,o=!1,t=y({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._defaultDatePartsNow=l,t._f=e._f[a],qi(t),f(t)&&(o=!0),n+=m(t).charsLeftOver,n+=10*m(t).unusedTokens.length,m(t).score=n,r?n<s&&(s=n,i=t):(null==s||n<s||o)&&(s=n,i=t,o&&(r=!0));u(e,i||t)}function Xi(e){if(!e._d){var t=A(e._i),i=void 0===t.day?t.date:t.day;e._a=c([t.year,t.month,i,t.hour,t.minute,t.second,t.millisecond],function(e){return e&&parseInt(e,10)}),Zi(e)}}function Qi(e){var t=new b(Si(es(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function es(e){var t=e._i,i=e._f;return e._locale=e._locale||ki(e._l),null===t||void 0===i&&""===t?v({nullInput:!0}):("string"==typeof t&&(e._i=t=e._locale.preparse(t)),$(t)?new b(Si(t)):(h(t)?e._d=t:a(i)?Ki(e):i?qi(e):ts(e),f(e)||(e._d=null),e))}function ts(e){var t=e._i;l(t)?e._d=new Date(i.now()):h(t)?e._d=new Date(t.valueOf()):"string"==typeof t?Bi(e):a(t)?(e._a=c(t.slice(0),function(e){return parseInt(e,10)}),Zi(e)):n(t)?Xi(e):d(t)?e._d=new Date(t):i.createFromInputFallback(e)}function is(e,t,i,s,o){var l={};return!0!==t&&!1!==t||(s=t,t=void 0),!0!==i&&!1!==i||(s=i,i=void 0),(n(e)&&r(e)||a(e)&&0===e.length)&&(e=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=o,l._l=i,l._i=e,l._f=t,l._strict=s,Qi(l)}function ss(e,t,i,s){return is(e,t,i,s,!1)}i.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),i._getDefaultDateParts=Vi,i.ISO_8601=function(){},i.RFC_2822=function(){};var as=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:v()}),ns=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:v()});function os(e,t){var i,s;if(1===t.length&&a(t[0])&&(t=t[0]),!t.length)return ss();for(s=0;s<t.length;++s)if($(t[s])){i=t[s];break}if(!i)return v();for(++s;s<t.length;++s)!$(t[s])||t[s].isValid()&&!t[s][e](i)||(i=t[s]);return i}function rs(){return os("isBefore",[].slice.call(arguments,0))}function ls(){return os("isAfter",[].slice.call(arguments,0))}var ds=function(){return Date.now?Date.now():+new Date},hs=["year","quarter","month","week","day","hour","minute","second","millisecond"];function cs(e){var t,i,s=!1,a=hs.length;for(t in e)if(o(e,t)&&(-1===Ae.call(hs,t)||null!=e[t]&&isNaN(e[t])))return!1;for(i=0;i<a;++i)if(e[hs[i]]){if(s)return!1;parseFloat(e[hs[i]])!==ge(e[hs[i]])&&(s=!0)}return!0}function us(){return this._isValid}function ps(){return Is(NaN)}function gs(e){var t=A(e),i=t.year||0,s=t.quarter||0,a=t.month||0,n=t.week||t.isoWeek||0,o=t.day||0,r=t.hour||0,l=t.minute||0,d=t.second||0,h=t.millisecond||0;this._isValid=cs(t),this._milliseconds=+h+1e3*d+6e4*l+1e3*r*60*60,this._days=+o+7*n,this._months=+a+3*s+12*i,this._data={},this._locale=ki(),this._bubble()}function ms(e){return e instanceof gs}function fs(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function vs(e,t,i){var s,a=Math.min(e.length,t.length),n=Math.abs(e.length-t.length),o=0;for(s=0;s<a;s++)ge(e[s])!==ge(t[s])&&o++;return o+n}function _s(e,t){R(e,0,0,function(){var e=this.utcOffset(),i="+";return e<0&&(e=-e,i="-"),i+E(~~(e/60),2)+t+E(~~e%60,2)})}_s("Z",":"),_s("ZZ",""),de("Z",ae),de("ZZ",ae),fe(["Z","ZZ"],function(e,t,i){var s=ys(ae,e);i._useUTC=!0,i._tzm=s,null===s&&(m(i).invalidOffset=e)});var ws=/([\+\-]|\d\d)/gi;function ys(e,t){var i,s,a=(t||"").match(e);return null===a?null:(s=60*(i=((a[a.length-1]||[])+"").match(ws)||["-",0,0])[1]+ge(i[2]),ge(i[2])>59||("+"===i[0]?s>840:s>720)?null:0===s?0:"+"===i[0]?s:-s)}function bs(e,t){var s,a;return t._isUTC?(s=t.clone(),a=($(e)||h(e)?e.valueOf():ss(e).valueOf())-s.valueOf(),s._d.setTime(s._d.valueOf()+a),i.updateOffset(s,!1),s):ss(e).local()}function $s(e){return-Math.round(e._d.getTimezoneOffset())}function xs(e,t,s){var a,n=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=ys(ae,e)))return this}else Math.abs(e)<16&&!s&&(e*=60);return!this._isUTC&&t&&(a=$s(this)),this._offset=e,this._isUTC=!0,null!=a&&this.add(a,"m"),n!==e&&(!t||this._changeInProgress?Us(this,Is(e-n,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,i.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?n:$s(this)}function ks(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function zs(e){return this.utcOffset(0,e)}function Ss(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract($s(this),"m")),this}function Ms(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=ys(se,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function Ts(e){return!!this.isValid()&&(e=e?ss(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function Os(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function As(){if(!l(this._isDSTShifted))return this._isDSTShifted;var e,t={};return y(t,this),(t=es(t))._a?(e=t._isUTC?p(t._a):ss(t._a),this._isDSTShifted=this.isValid()&&vs(t._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function Cs(){return!!this.isValid()&&!this._isUTC}function Hs(){return!!this.isValid()&&this._isUTC}function Es(){return!!this.isValid()&&this._isUTC&&0===this._offset}i.updateOffset=function(){};var Ds=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,Ns=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Is(e,t){var i,s,a,n=e,r=null;return ms(e)?n={ms:e._milliseconds,d:e._days,M:e._months}:d(e)||!isNaN(+e)?(n={},t?n[t]=+e:n.milliseconds=+e):(r=Ds.exec(e))?(i="-"===r[1]?-1:1,n={y:0,d:ge(r[$e])*i,h:ge(r[xe])*i,m:ge(r[ke])*i,s:ge(r[ze])*i,ms:ge(fs(1e3*r[Se]))*i}):(r=Ns.exec(e))?(i="-"===r[1]?-1:1,n={y:js(r[2],i),M:js(r[3],i),w:js(r[4],i),d:js(r[5],i),h:js(r[6],i),m:js(r[7],i),s:js(r[8],i)}):null==n?n={}:"object"==typeof n&&("from"in n||"to"in n)&&(a=Ls(ss(n.from),ss(n.to)),(n={}).ms=a.milliseconds,n.M=a.months),s=new gs(n),ms(e)&&o(e,"_locale")&&(s._locale=e._locale),ms(e)&&o(e,"_isValid")&&(s._isValid=e._isValid),s}function js(e,t){var i=e&&parseFloat(e.replace(",","."));return(isNaN(i)?0:i)*t}function Rs(e,t){var i={};return i.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(i.months,"M").isAfter(t)&&--i.months,i.milliseconds=+t-+e.clone().add(i.months,"M"),i}function Ls(e,t){var i;return e.isValid()&&t.isValid()?(t=bs(t,e),e.isBefore(t)?i=Rs(e,t):((i=Rs(t,e)).milliseconds=-i.milliseconds,i.months=-i.months),i):{milliseconds:0,months:0}}function Ps(e,t){return function(i,s){var a;return null===s||isNaN(+s)||(S(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),a=i,i=s,s=a),Us(this,Is(i,s),e),this}}function Us(e,t,s,a){var n=t._milliseconds,o=fs(t._days),r=fs(t._months);e.isValid()&&(a=null==a||a,r&&Ke(e,De(e,"Month")+r*s),o&&Ne(e,"Date",De(e,"Date")+o*s),n&&e._d.setTime(e._d.valueOf()+n*s),a&&i.updateOffset(e,o||r))}Is.fn=gs.prototype,Is.invalid=ps;var Bs=Ps(1,"add"),Fs=Ps(-1,"subtract");function Ws(e){return"string"==typeof e||e instanceof String}function Ys(e){return $(e)||h(e)||Ws(e)||d(e)||Zs(e)||Vs(e)||null==e}function Vs(e){var t,i,s=n(e)&&!r(e),a=!1,l=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],d=l.length;for(t=0;t<d;t+=1)i=l[t],a=a||o(e,i);return s&&a}function Zs(e){var t=a(e),i=!1;return t&&(i=0===e.filter(function(t){return!d(t)&&Ws(e)}).length),t&&i}function Gs(e){var t,i,s=n(e)&&!r(e),a=!1,l=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(t=0;t<l.length;t+=1)i=l[t],a=a||o(e,i);return s&&a}function qs(e,t){var i=e.diff(t,"days",!0);return i<-6?"sameElse":i<-1?"lastWeek":i<0?"lastDay":i<1?"sameDay":i<2?"nextDay":i<7?"nextWeek":"sameElse"}function Js(e,t){1===arguments.length&&(arguments[0]?Ys(arguments[0])?(e=arguments[0],t=void 0):Gs(arguments[0])&&(t=arguments[0],e=void 0):(e=void 0,t=void 0));var s=e||ss(),a=bs(s,this).startOf("day"),n=i.calendarFormat(this,a)||"sameElse",o=t&&(M(t[n])?t[n].call(this,s):t[n]);return this.format(o||this.localeData().calendar(n,this,ss(s)))}function Ks(){return new b(this)}function Xs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()>i.valueOf():i.valueOf()<this.clone().startOf(t).valueOf())}function Qs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()<i.valueOf():this.clone().endOf(t).valueOf()<i.valueOf())}function ea(e,t,i,s){var a=$(e)?e:ss(e),n=$(t)?t:ss(t);return!!(this.isValid()&&a.isValid()&&n.isValid())&&("("===(s=s||"()")[0]?this.isAfter(a,i):!this.isBefore(a,i))&&(")"===s[1]?this.isBefore(n,i):!this.isAfter(n,i))}function ta(e,t){var i,s=$(e)?e:ss(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()===s.valueOf():(i=s.valueOf(),this.clone().startOf(t).valueOf()<=i&&i<=this.clone().endOf(t).valueOf()))}function ia(e,t){return this.isSame(e,t)||this.isAfter(e,t)}function sa(e,t){return this.isSame(e,t)||this.isBefore(e,t)}function aa(e,t,i){var s,a,n;if(!this.isValid())return NaN;if(!(s=bs(e,this)).isValid())return NaN;switch(a=6e4*(s.utcOffset()-this.utcOffset()),t=O(t)){case"year":n=na(this,s)/12;break;case"month":n=na(this,s);break;case"quarter":n=na(this,s)/3;break;case"second":n=(this-s)/1e3;break;case"minute":n=(this-s)/6e4;break;case"hour":n=(this-s)/36e5;break;case"day":n=(this-s-a)/864e5;break;case"week":n=(this-s-a)/6048e5;break;default:n=this-s}return i?n:pe(n)}function na(e,t){if(e.date()<t.date())return-na(t,e);var i=12*(t.year()-e.year())+(t.month()-e.month()),s=e.clone().add(i,"months");return-(i+(t-s<0?(t-s)/(s-e.clone().add(i-1,"months")):(t-s)/(e.clone().add(i+1,"months")-s)))||0}function oa(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ra(e){if(!this.isValid())return null;var t=!0!==e,i=t?this.clone().utc():this;return i.year()<0||i.year()>9999?U(i,t?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):M(Date.prototype.toISOString)?t?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",U(i,"Z")):U(i,t?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function la(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,t,i,s,a="moment",n="";return this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",n="Z"),e="["+a+'("]',t=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",i="-MM-DD[T]HH:mm:ss.SSS",s=n+'[")]',this.format(e+t+i+s)}function da(e){e||(e=this.isUtc()?i.defaultFormatUtc:i.defaultFormat);var t=U(this,e);return this.localeData().postformat(t)}function ha(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Is({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function ca(e){return this.from(ss(),e)}function ua(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Is({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function pa(e){return this.to(ss(),e)}function ga(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ki(e))&&(this._locale=t),this)}i.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",i.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var ma=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});function fa(){return this._locale}var va=1e3,_a=60*va,wa=60*_a,ya=3506328*wa;function ba(e,t){return(e%t+t)%t}function $a(e,t,i){return e<100&&e>=0?new Date(e+400,t,i)-ya:new Date(e,t,i).valueOf()}function xa(e,t,i){return e<100&&e>=0?Date.UTC(e+400,t,i)-ya:Date.UTC(e,t,i)}function ka(e){var t,s;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?xa:$a,e){case"year":t=s(this.year(),0,1);break;case"quarter":t=s(this.year(),this.month()-this.month()%3,1);break;case"month":t=s(this.year(),this.month(),1);break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=s(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=ba(t+(this._isUTC?0:this.utcOffset()*_a),wa);break;case"minute":t=this._d.valueOf(),t-=ba(t,_a);break;case"second":t=this._d.valueOf(),t-=ba(t,va)}return this._d.setTime(t),i.updateOffset(this,!0),this}function za(e){var t,s;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?xa:$a,e){case"year":t=s(this.year()+1,0,1)-1;break;case"quarter":t=s(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=s(this.year(),this.month()+1,1)-1;break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=s(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=wa-ba(t+(this._isUTC?0:this.utcOffset()*_a),wa)-1;break;case"minute":t=this._d.valueOf(),t+=_a-ba(t,_a)-1;break;case"second":t=this._d.valueOf(),t+=va-ba(t,va)-1}return this._d.setTime(t),i.updateOffset(this,!0),this}function Sa(){return this._d.valueOf()-6e4*(this._offset||0)}function Ma(){return Math.floor(this.valueOf()/1e3)}function Ta(){return new Date(this.valueOf())}function Oa(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function Aa(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function Ca(){return this.isValid()?this.toISOString():null}function Ha(){return f(this)}function Ea(){return u({},m(this))}function Da(){return m(this).overflow}function Na(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function Ia(e,t){var s,a,n,o=this._eras||ki("en")._eras;for(s=0,a=o.length;s<a;++s)switch("string"==typeof o[s].since&&(n=i(o[s].since).startOf("day"),o[s].since=n.valueOf()),typeof o[s].until){case"undefined":o[s].until=1/0;break;case"string":n=i(o[s].until).startOf("day").valueOf(),o[s].until=n.valueOf()}return o}function ja(e,t,i){var s,a,n,o,r,l=this.eras();for(e=e.toUpperCase(),s=0,a=l.length;s<a;++s)if(n=l[s].name.toUpperCase(),o=l[s].abbr.toUpperCase(),r=l[s].narrow.toUpperCase(),i)switch(t){case"N":case"NN":case"NNN":if(o===e)return l[s];break;case"NNNN":if(n===e)return l[s];break;case"NNNNN":if(r===e)return l[s]}else if([n,o,r].indexOf(e)>=0)return l[s]}function Ra(e,t){var s=e.since<=e.until?1:-1;return void 0===t?i(e.since).year():i(e.since).year()+(t-e.offset)*s}function La(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].name;if(s[e].until<=i&&i<=s[e].since)return s[e].name}return""}function Pa(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].narrow;if(s[e].until<=i&&i<=s[e].since)return s[e].narrow}return""}function Ua(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].abbr;if(s[e].until<=i&&i<=s[e].since)return s[e].abbr}return""}function Ba(){var e,t,s,a,n=this.localeData().eras();for(e=0,t=n.length;e<t;++e)if(s=n[e].since<=n[e].until?1:-1,a=this.clone().startOf("day").valueOf(),n[e].since<=a&&a<=n[e].until||n[e].until<=a&&a<=n[e].since)return(this.year()-i(n[e].since).year())*s+n[e].offset;return this.year()}function Fa(e){return o(this,"_erasNameRegex")||Ja.call(this),e?this._erasNameRegex:this._erasRegex}function Wa(e){return o(this,"_erasAbbrRegex")||Ja.call(this),e?this._erasAbbrRegex:this._erasRegex}function Ya(e){return o(this,"_erasNarrowRegex")||Ja.call(this),e?this._erasNarrowRegex:this._erasRegex}function Va(e,t){return t.erasAbbrRegex(e)}function Za(e,t){return t.erasNameRegex(e)}function Ga(e,t){return t.erasNarrowRegex(e)}function qa(e,t){return t._eraYearOrdinalRegex||te}function Ja(){var e,t,i,s,a,n=[],o=[],r=[],l=[],d=this.eras();for(e=0,t=d.length;e<t;++e)i=ue(d[e].name),s=ue(d[e].abbr),a=ue(d[e].narrow),o.push(i),n.push(s),r.push(a),l.push(i),l.push(s),l.push(a);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+o.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+n.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+r.join("|")+")","i")}function Ka(e,t){R(0,[e,e.length],0,t)}function Xa(e){return nn.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function Qa(e){return nn.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function en(){return Kt(this.year(),1,4)}function tn(){return Kt(this.isoWeekYear(),1,4)}function sn(){var e=this.localeData()._week;return Kt(this.year(),e.dow,e.doy)}function an(){var e=this.localeData()._week;return Kt(this.weekYear(),e.dow,e.doy)}function nn(e,t,i,s,a){var n;return null==e?qt(this,s,a).year:(t>(n=Kt(e,s,a))&&(t=n),on.call(this,e,t,i,s,a))}function on(e,t,i,s,a){var n=Zt(e,t,i,s,a),o=Yt(n.year,0,n.dayOfYear);return this.year(o.getUTCFullYear()),this.month(o.getUTCMonth()),this.date(o.getUTCDate()),this}function rn(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}R("N",0,0,"eraAbbr"),R("NN",0,0,"eraAbbr"),R("NNN",0,0,"eraAbbr"),R("NNNN",0,0,"eraName"),R("NNNNN",0,0,"eraNarrow"),R("y",["y",1],"yo","eraYear"),R("y",["yy",2],0,"eraYear"),R("y",["yyy",3],0,"eraYear"),R("y",["yyyy",4],0,"eraYear"),de("N",Va),de("NN",Va),de("NNN",Va),de("NNNN",Za),de("NNNNN",Ga),fe(["N","NN","NNN","NNNN","NNNNN"],function(e,t,i,s){var a=i._locale.erasParse(e,s,i._strict);a?m(i).era=a:m(i).invalidEra=e}),de("y",te),de("yy",te),de("yyy",te),de("yyyy",te),de("yo",qa),fe(["y","yy","yyy","yyyy"],ye),fe(["yo"],function(e,t,i,s){var a;i._locale._eraYearOrdinalRegex&&(a=e.match(i._locale._eraYearOrdinalRegex)),i._locale.eraYearOrdinalParse?t[ye]=i._locale.eraYearOrdinalParse(e,a):t[ye]=parseInt(e,10)}),R(0,["gg",2],0,function(){return this.weekYear()%100}),R(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Ka("gggg","weekYear"),Ka("ggggg","weekYear"),Ka("GGGG","isoWeekYear"),Ka("GGGGG","isoWeekYear"),de("G",ie),de("g",ie),de("GG",q,Y),de("gg",q,Y),de("GGGG",Q,Z),de("gggg",Q,Z),de("GGGGG",ee,G),de("ggggg",ee,G),ve(["gggg","ggggg","GGGG","GGGGG"],function(e,t,i,s){t[s.substr(0,2)]=ge(e)}),ve(["gg","GG"],function(e,t,s,a){t[a]=i.parseTwoDigitYear(e)}),R("Q",0,"Qo","quarter"),de("Q",W),fe("Q",function(e,t){t[be]=3*(ge(e)-1)}),R("D",["DD",2],"Do","date"),de("D",q,re),de("DD",q,Y),de("Do",function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient}),fe(["D","DD"],$e),fe("Do",function(e,t){t[$e]=ge(e.match(q)[0])});var ln=Ee("Date",!0);function dn(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}R("DDD",["DDDD",3],"DDDo","dayOfYear"),de("DDD",X),de("DDDD",V),fe(["DDD","DDDD"],function(e,t,i){i._dayOfYear=ge(e)}),R("m",["mm",2],0,"minute"),de("m",q,le),de("mm",q,Y),fe(["m","mm"],ke);var hn=Ee("Minutes",!1);R("s",["ss",2],0,"second"),de("s",q,le),de("ss",q,Y),fe(["s","ss"],ze);var cn,un,pn=Ee("Seconds",!1);for(R("S",0,0,function(){return~~(this.millisecond()/100)}),R(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),R(0,["SSS",3],0,"millisecond"),R(0,["SSSS",4],0,function(){return 10*this.millisecond()}),R(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),R(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),R(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),R(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),R(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),de("S",X,W),de("SS",X,Y),de("SSS",X,V),cn="SSSS";cn.length<=9;cn+="S")de(cn,te);function gn(e,t){t[Se]=ge(1e3*("0."+e))}for(cn="S";cn.length<=9;cn+="S")fe(cn,gn);function mn(){return this._isUTC?"UTC":""}function fn(){return this._isUTC?"Coordinated Universal Time":""}un=Ee("Milliseconds",!1),R("z",0,0,"zoneAbbr"),R("zz",0,0,"zoneName");var vn=b.prototype;function _n(e){return ss(1e3*e)}function wn(){return ss.apply(null,arguments).parseZone()}function yn(e){return e}vn.add=Bs,vn.calendar=Js,vn.clone=Ks,vn.diff=aa,vn.endOf=za,vn.format=da,vn.from=ha,vn.fromNow=ca,vn.to=ua,vn.toNow=pa,vn.get=Ie,vn.invalidAt=Da,vn.isAfter=Xs,vn.isBefore=Qs,vn.isBetween=ea,vn.isSame=ta,vn.isSameOrAfter=ia,vn.isSameOrBefore=sa,vn.isValid=Ha,vn.lang=ma,vn.locale=ga,vn.localeData=fa,vn.max=ns,vn.min=as,vn.parsingFlags=Ea,vn.set=je,vn.startOf=ka,vn.subtract=Fs,vn.toArray=Oa,vn.toObject=Aa,vn.toDate=Ta,vn.toISOString=ra,vn.inspect=la,"undefined"!=typeof Symbol&&null!=Symbol.for&&(vn[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),vn.toJSON=Ca,vn.toString=oa,vn.unix=Ma,vn.valueOf=Sa,vn.creationData=Na,vn.eraName=La,vn.eraNarrow=Pa,vn.eraAbbr=Ua,vn.eraYear=Ba,vn.year=Ce,vn.isLeapYear=He,vn.weekYear=Xa,vn.isoWeekYear=Qa,vn.quarter=vn.quarters=rn,vn.month=Xe,vn.daysInMonth=Qe,vn.week=vn.weeks=ii,vn.isoWeek=vn.isoWeeks=si,vn.weeksInYear=sn,vn.weeksInWeekYear=an,vn.isoWeeksInYear=en,vn.isoWeeksInISOWeekYear=tn,vn.date=ln,vn.day=vn.days=yt,vn.weekday=bt,vn.isoWeekday=$t,vn.dayOfYear=dn,vn.hour=vn.hours=hi,vn.minute=vn.minutes=hn,vn.second=vn.seconds=pn,vn.millisecond=vn.milliseconds=un,vn.utcOffset=xs,vn.utc=zs,vn.local=Ss,vn.parseZone=Ms,vn.hasAlignedHourOffset=Ts,vn.isDST=Os,vn.isLocal=Cs,vn.isUtcOffset=Hs,vn.isUtc=Es,vn.isUTC=Es,vn.zoneAbbr=mn,vn.zoneName=fn,vn.dates=k("dates accessor is deprecated. Use date instead.",ln),vn.months=k("months accessor is deprecated. Use month instead",Xe),vn.years=k("years accessor is deprecated. Use year instead",Ce),vn.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",ks),vn.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",As);var bn=Ot.prototype;function $n(e,t,i,s){var a=ki(),n=p().set(s,t);return a[i](n,e)}function xn(e,t,i){if(d(e)&&(t=e,e=void 0),e=e||"",null!=t)return $n(e,t,i,"month");var s,a=[];for(s=0;s<12;s++)a[s]=$n(e,s,i,"month");return a}function kn(e,t,i,s){"boolean"==typeof e?(d(t)&&(i=t,t=void 0),t=t||""):(i=t=e,e=!1,d(t)&&(i=t,t=void 0),t=t||"");var a,n=ki(),o=e?n._week.dow:0,r=[];if(null!=i)return $n(t,(i+o)%7,s,"day");for(a=0;a<7;a++)r[a]=$n(t,(a+o)%7,s,"day");return r}function zn(e,t){return xn(e,t,"months")}function Sn(e,t){return xn(e,t,"monthsShort")}function Mn(e,t,i){return kn(e,t,i,"weekdays")}function Tn(e,t,i){return kn(e,t,i,"weekdaysShort")}function On(e,t,i){return kn(e,t,i,"weekdaysMin")}bn.calendar=Ct,bn.longDateFormat=Et,bn.invalidDate=Nt,bn.ordinal=Rt,bn.preparse=yn,bn.postformat=yn,bn.relativeTime=Ut,bn.pastFuture=Ft,bn.set=Mt,bn.eras=Ia,bn.erasParse=ja,bn.erasConvertYear=Ra,bn.erasAbbrRegex=Wa,bn.erasNameRegex=Fa,bn.erasNarrowRegex=Ya,bn.months=Ze,bn.monthsShort=Ge,bn.monthsParse=Je,bn.monthsRegex=tt,bn.monthsShortRegex=et,bn.week=Xt,bn.firstDayOfYear=ti,bn.firstDayOfWeek=ei,bn.weekdays=mt,bn.weekdaysMin=vt,bn.weekdaysShort=ft,bn.weekdaysParse=wt,bn.weekdaysRegex=xt,bn.weekdaysShortRegex=kt,bn.weekdaysMinRegex=zt,bn.isPM=li,bn.meridiem=ci,bi("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===ge(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),i.lang=k("moment.lang is deprecated. Use moment.locale instead.",bi),i.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ki);var An=Math.abs;function Cn(){var e=this._data;return this._milliseconds=An(this._milliseconds),this._days=An(this._days),this._months=An(this._months),e.milliseconds=An(e.milliseconds),e.seconds=An(e.seconds),e.minutes=An(e.minutes),e.hours=An(e.hours),e.months=An(e.months),e.years=An(e.years),this}function Hn(e,t,i,s){var a=Is(t,i);return e._milliseconds+=s*a._milliseconds,e._days+=s*a._days,e._months+=s*a._months,e._bubble()}function En(e,t){return Hn(this,e,t,1)}function Dn(e,t){return Hn(this,e,t,-1)}function Nn(e){return e<0?Math.floor(e):Math.ceil(e)}function In(){var e,t,i,s,a,n=this._milliseconds,o=this._days,r=this._months,l=this._data;return n>=0&&o>=0&&r>=0||n<=0&&o<=0&&r<=0||(n+=864e5*Nn(Rn(r)+o),o=0,r=0),l.milliseconds=n%1e3,e=pe(n/1e3),l.seconds=e%60,t=pe(e/60),l.minutes=t%60,i=pe(t/60),l.hours=i%24,o+=pe(i/24),r+=a=pe(jn(o)),o-=Nn(Rn(a)),s=pe(r/12),r%=12,l.days=o,l.months=r,l.years=s,this}function jn(e){return 4800*e/146097}function Rn(e){return 146097*e/4800}function Ln(e){if(!this.isValid())return NaN;var t,i,s=this._milliseconds;if("month"===(e=O(e))||"quarter"===e||"year"===e)switch(t=this._days+s/864e5,i=this._months+jn(t),e){case"month":return i;case"quarter":return i/3;case"year":return i/12}else switch(t=this._days+Math.round(Rn(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}}function Pn(e){return function(){return this.as(e)}}var Un=Pn("ms"),Bn=Pn("s"),Fn=Pn("m"),Wn=Pn("h"),Yn=Pn("d"),Vn=Pn("w"),Zn=Pn("M"),Gn=Pn("Q"),qn=Pn("y"),Jn=Un;function Kn(){return Is(this)}function Xn(e){return e=O(e),this.isValid()?this[e+"s"]():NaN}function Qn(e){return function(){return this.isValid()?this._data[e]:NaN}}var eo=Qn("milliseconds"),to=Qn("seconds"),io=Qn("minutes"),so=Qn("hours"),ao=Qn("days"),no=Qn("months"),oo=Qn("years");function ro(){return pe(this.days()/7)}var lo=Math.round,ho={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function co(e,t,i,s,a){return Pt.call(a,t||1,!!i,e,s)}function uo(e,t,i,s){var a=Is(e).abs(),n=lo(a.as("s")),o=lo(a.as("m")),r=lo(a.as("h")),l=lo(a.as("d")),d=lo(a.as("M")),h=lo(a.as("w")),c=lo(a.as("y")),u=n<=i.ss&&["s",n]||n<i.s&&["ss",n]||o<=1&&["m"]||o<i.m&&["mm",o]||r<=1&&["h"]||r<i.h&&["hh",r]||l<=1&&["d"]||l<i.d&&["dd",l];return null!=i.w&&(u=u||h<=1&&["w"]||h<i.w&&["ww",h]),(u=u||d<=1&&["M"]||d<i.M&&["MM",d]||c<=1&&["y"]||["yy",c])[2]=t,u[3]=+e>0,u[4]=s,co.apply(null,u)}function po(e){return void 0===e?lo:"function"==typeof e&&(lo=e,!0)}function go(e,t){return void 0!==ho[e]&&(void 0===t?ho[e]:(ho[e]=t,"s"===e&&(ho.ss=t-1),!0))}function mo(e,t){if(!this.isValid())return this.localeData().invalidDate();var i,s,a=!1,n=ho;return"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(a=e),"object"==typeof t&&(n=u(u({},ho),t||{}),null!=t.s&&null==t.ss&&(n.ss=t.s-1)),s=uo(this,!a,n,i=this.localeData()),a&&(s=Bt.call(i,+this,s)),i.postformat(s)}var fo=Math.abs;function vo(e){return(e>0)-(e<0)||+e}function _o(){if(!this.isValid())return this.localeData().invalidDate();var e,t,i,s,a,n,o,r,l=fo(this._milliseconds)/1e3,d=fo(this._days),h=fo(this._months),c=this.asSeconds();return c?(e=pe(l/60),t=pe(e/60),l%=60,e%=60,i=pe(h/12),h%=12,s=l?l.toFixed(3).replace(/\.?0+$/,""):"",a=c<0?"-":"",n=vo(this._months)!==vo(c)?"-":"",o=vo(this._days)!==vo(c)?"-":"",r=vo(this._milliseconds)!==vo(c)?"-":"",a+"P"+(i?n+i+"Y":"")+(h?n+h+"M":"")+(d?o+d+"D":"")+(t||e||l?"T":"")+(t?r+t+"H":"")+(e?r+e+"M":"")+(l?r+s+"S":"")):"P0D"}var wo=gs.prototype;return wo.isValid=us,wo.abs=Cn,wo.add=En,wo.subtract=Dn,wo.as=Ln,wo.asMilliseconds=Un,wo.asSeconds=Bn,wo.asMinutes=Fn,wo.asHours=Wn,wo.asDays=Yn,wo.asWeeks=Vn,wo.asMonths=Zn,wo.asQuarters=Gn,wo.asYears=qn,wo.valueOf=Jn,wo._bubble=In,wo.clone=Kn,wo.get=Xn,wo.milliseconds=eo,wo.seconds=to,wo.minutes=io,wo.hours=so,wo.days=ao,wo.weeks=ro,wo.months=no,wo.years=oo,wo.humanize=mo,wo.toISOString=_o,wo.toString=_o,wo.toJSON=_o,wo.locale=ga,wo.localeData=fa,wo.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",_o),wo.lang=ma,R("X",0,0,"unix"),R("x",0,0,"valueOf"),de("x",ie),de("X",ne),fe("X",function(e,t,i){i._d=new Date(1e3*parseFloat(e))}),fe("x",function(e,t,i){i._d=new Date(ge(e))}),
//! moment.js
i.version="2.31.0",s(ss),i.fn=vn,i.min=rs,i.max=ls,i.now=ds,i.utc=p,i.unix=_n,i.months=zn,i.isDate=h,i.locale=bi,i.invalid=v,i.duration=Is,i.isMoment=$,i.weekdays=Mn,i.parseZone=wn,i.localeData=ki,i.isDuration=ms,i.monthsShort=Sn,i.weekdaysMin=On,i.defineLocale=$i,i.updateLocale=xi,i.locales=zi,i.weekdaysShort=Tn,i.normalizeUnits=O,i.relativeTimeRounding=po,i.relativeTimeThreshold=go,i.calendarFormat=qs,i.prototype=vn,i.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},i}()),Mo.exports),Ao=ko(Oo);const Co=["default","sand","sandy_loam","loam","clay_loam","clay","custom"],Ho={sand:25,sandy_loam:15,loam:8,clay_loam:4,clay:2},Eo=["default","lawn","vegetables","flowers","shrubs","hedge","fruit_trees","vines","ground_cover","custom"];let Do=class extends(vn(ce)){constructor(){super(...arguments),this._calculating=new Set,this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.plannedDurations=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._live=null,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this._pendingZoneChanges=new Map,this.zoneCache=new Map,this._expanded=new Set,this._addOpen=!1,this._editing=new Set,this._yamlEdits=new Map,this._notOwnEntity=e=>{return t=this.hass,i=e.entity_id,"smart_irrigation"!==(null===(a=null===(s=null==t?void 0:t.entities)||void 0===s?void 0:s[i])||void 0===a?void 0:a.platform);var t,i,s,a}}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}updated(e){var t,i;super.updated(e);const s=null===(i=null===(t=this.path)||void 0===t?void 0:t.params)||void 0===i?void 0:i.zone;if(null==s||s===this._openedFromPath)return;const a=Number(s);this.zones.some(e=>e.id===a)&&(this._openedFromPath=s,this._focusZone(a))}_focusZone(e,t=!0){this._expanded.add(e),this.requestUpdate(),this.updateComplete.then(()=>{var i;const s=this.zones.find(t=>t.id===e),a=this.shadowRoot,n=t&&s&&this._noValve(s)?null==a?void 0:a.querySelector(`#zone-${e}-valve`):null;if(!n)return void(null===(i=null==a?void 0:a.querySelector(`#zone-${e}`))||void 0===i||i.scrollIntoView({block:"start",behavior:"smooth"}));const o=0===n.childElementCount&&n.nextElementSibling?n.nextElementSibling:n;o.scrollIntoView({block:"center",behavior:"smooth"});const r=o.querySelector("ha-entity-picker");r&&window.setTimeout(()=>{"function"==typeof r.open?r.open():r.focus()},450)})}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}async _fetchLive(){var e,t,i,s,a;if(this._liveTimer&&window.clearTimeout(this._liveTimer),this._liveTimer=void 0,!this.hass||!this.isConnected)return;const n=JSON.stringify(null!==(t=null===(e=this._live)||void 0===e?void 0:e.valves)&&void 0!==t?t:[]);try{const e=await this.hass.callWS({type:gi+"/programs_state"});this._live=null!==(i=null==e?void 0:e.live)&&void 0!==i?i:null}catch(e){this._live=null}JSON.stringify(null!==(a=null===(s=this._live)||void 0===s?void 0:s.valves)&&void 0!==a?a:[])!==n&&this._scheduleUpdate(),this.isConnected&&(this._liveTimer=window.setTimeout(()=>this._fetchLive(),oa(this._live)?5e3:3e4))}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),this._fetchLive(),[this.hass.connection.subscribeMessage(()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:gi+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([Ka(this.hass),en(this.hass),nn(this.hass),on(this.hass)]);this.config=e,this.zones=t,this.modules=i,this.mappings=s,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this._fetchPlannedDurations(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _waterZone(e){var t,i,s,a;const n=null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en",o=(e,...t)=>di(`panels.zones.water.${e}`,n,...t),r=null!==(a=null!==(s=this.plannedDurations.get(String(e.id)))&&void 0!==s?s:e.duration)&&void 0!==a?a:0,l=await async function(e,t){const i=document.createElement("smart-irrigation-confirmation-dialog");i.hass=e,document.body.appendChild(i);try{return await i.showDialog(t)?""===i.value.trim()?NaN:Number(i.value):null}finally{i.remove()}}(this.hass,{text:o("question","{name}",e.name),confirmText:di("panels.zones.actions.water",n),number:{label:r>0?o("minutes","{calculated}",this._friendlyDuration(r)):o("minutes-none"),unit:"min",min:1,max:1440}});if(null===l)return;const d=isNaN(l)?Math.round(r):Math.round(60*Math.min(l,1440));d<=0||await this.hass.callService(gi,"water_zone",{zone_id:e.id,seconds:d})}_ask(e,t){var i,s;const a=di(e,null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en").replace("{name}",null!=t?t:"");return Zn(this.hass,{text:a,destructive:!0})}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",gi+"/zones",{calculate_all:!0})).catch(e=>{console.error("Failed to calculate all zones:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",gi+"/zones",{update_all:!0})).catch(e=>{console.error("Failed to update all zones:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}async handleResetAllBuckets(){var e;this.hass&&(await this._ask("confirm.reset_all_buckets")&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",gi+"/zones",{reset_all_buckets:!0})).catch(e=>{console.error("Failed to reset all buckets:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})))}async handleClearAllWeatherdata(){var e;this.hass&&(await this._ask("confirm.clear_all_weather")&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",gi+"/zones",{clear_all_weatherdata:!0})).catch(e=>{console.error("Failed to clear all weather data:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:xo.Automatic,duration:0,bucket:0,module:void 0,delta:0,et_deficiency:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then(()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData())).then(()=>{this._addOpen=!1;const t=this.zones.filter(t=>t.name===e.name&&null!=t.id).reduce((e,t)=>!e||t.id>e.id?t:e,void 0);t&&this.updateComplete.then(()=>requestAnimationFrame(()=>this._focusZone(t.id,!1)))}).catch(e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}_engineOptions(e,t,i){var s,a,n,o;const r=null!==(s=t.calculation_method)&&void 0!==s?s:"from_weather",l=null!==(a=t.method_config)&&void 0!==a?a:{},d=i=>this.handleEditZone(e,Object.assign(Object.assign({},t),{calculation_method:r,method_config:Object.assign(Object.assign({},l),i)}));return"from_weather"===r?"advanced"!==(null===(n=this.config)||void 0===n?void 0:n.ui_mode)?"":V`
        ${this._numRow(di("panels.zones.labels.forecast-days",i),"",null!==(o=l.forecast_days)&&void 0!==o?o:0,e=>d({forecast_days:parseInt(e,10)||0}))}<si-info
          >${di("panels.zones.labels.forecast-days-help",i)}
          ${di("panels.zones.labels.engine-shared-help",i)}</si-info
        >
        <div class="setting-row">
          <div class="setting-label">
            ${di("panels.zones.labels.coastal",i)}<si-info
              >${di("panels.zones.labels.coastal-help",i)}</si-info
            >
          </div>
          <ha-switch
            .checked=${!0===l.coastal}
            @change=${e=>d({coastal:e.target.checked})}
          ></ha-switch>
        </div>
      `:"fixed"===r?V`
        ${this._numRow(di("panels.zones.labels.fixed-amount",i),da(this.config,_s),(h=l.delta,Math.abs(Number(h)||0)),e=>d({delta:ba(e)}))}<si-info
          >${di("panels.zones.labels.engine-shared-help",i)}</si-info
        >
      `:"";var h}_friendlyDuration(e){return ha(e)}_volumeText(e,t){return`${this._n(ca(e,t),1)} ${la(this.config,vs)}`}async _fetchPlannedDurations(){var e;try{const t=await ln(this.hass),i=new Map;for(const[s,a]of Object.entries(null!==(e=null==t?void 0:t.zone_estimates)&&void 0!==e?e:{})){const e=Number(null==a?void 0:a.duration);Number.isFinite(e)&&i.set(String(s),e)}this.plannedDurations=i}catch(e){console.debug("Planned durations unavailable:",e)}}_liveEstimate(e){var t,i,s;const a=null!==(i=null===(t=this.hass)||void 0===t?void 0:t.states)&&void 0!==i?i:{};for(const t of Object.keys(a)){if(!t.endsWith("_live_bucket"))continue;const i=a[t],n=null!==(s=null==i?void 0:i.attributes)&&void 0!==s?s:{};if(String(n.zone_id)!==String(e.id))continue;if(!0!==n.live)return;const o=parseFloat(i.state);if(!Number.isFinite(o))return;return{bucket:o,duration:Number(n.duration)||0}}}_noValve(e){var t;return!0===(null===(t=this.config)||void 0===t?void 0:t.full_controller)&&!e.linked_entity&&e.state!==xo.Disabled}_setAside(e){var t,i;const s=null===(i=null===(t=this.config)||void 0===t?void 0:t.zone_failures)||void 0===i?void 0:i[String(e.id)];return(null==s?void 0:s.set_aside)?s:null}_zoneStatus(e,t){var i;const{kind:s,text:a,noValve:n}=this._zoneStatusOf(e,t),o=e=>di(`panels.zones.status.${e}`,t),r=null!==(i=e.irrigation_threshold)&&void 0!==i?i:0,l=la(this.config,_s);return V`
      <div
        class="zone-status zone-status--${s}"
        role=${"problem"===s?"alert":"status"}
      >
        <ha-icon
          icon=${"running"===s?"mdi:water":"watering"===s?"mdi:water-outline":"off"===s?"mdi:pause-circle-outline":"problem"===s?"mdi:alert-circle-outline":"waiting"===s?"mdi:timer-sand":"mdi:check-circle-outline"}
        ></ha-icon>
        <span>${a}</span>
        ${n&&null!=e.id&&!this._expanded.has(e.id)?V`<button
              class="zone-status-link"
              @click=${()=>this._focusZone(e.id)}
            >
              ${o("no-valve-action")}
            </button>`:""}
        ${this._setAside(e)&&null!=e.id&&this.hass?V`<button
              class="zone-status-link"
              @click=${async()=>{var t,i;await(t=this.hass,i=e.id,t.callWS({type:gi+"/put_back_zone",zone_id:i})),this._fetchData()}}
            >
              ${o("put-back")}
            </button>`:""}
        ${"off"!==s&&"problem"!==s&&"waiting"!==s&&"running"!==s&&r>0?V`<span class="zone-status-numbers">
              ${o("threshold")}: ${this._n(r,1)} ${l}
            </span>`:""}
      </div>
    `}_zoneStatusOf(e,t){var i,s,a,n,o,r,l,d,h,c,u;const p=(e,...i)=>di(`panels.zones.status.${e}`,t,...i),g=this._liveEstimate(e),m=this.plannedDurations.get(String(e.id)),f=g?g.bucket:null!==(i=e.bucket)&&void 0!==i?i:0,v=Math.max(0,-f),_=null!==(s=e.irrigation_threshold)&&void 0!==s?s:0,w=la(this.config,_s),y=v>=.05?`${this._n(v,1)} ${w}`:null,b=((e,t)=>null==t?void 0:na(e).find(e=>Number(e.zone_id)===Number(t)))(this._live,e.id);if(b)return{kind:"running",text:p((null===(a=this._live)||void 0===a?void 0:a.paused)?"running-paused":"running","{time}",ia(b.remaining_seconds)),noValve:!1};let $="idle",x=y?p("idle","{short}",y):p("satisfied");if(e.state===xo.Disabled)$="off",x=p("disabled");else if(e.state===xo.Manual)$="off",x=p("manual");else if(this._setAside(e))$="problem",x=p("set-aside","{count}",String(null!==(o=null===(n=this._setAside(e))||void 0===n?void 0:n.count)&&void 0!==o?o:""));else if(null===(r=e.calculation_problem)||void 0===r?void 0:r.code){$="problem";const t=e.calculation_problem.code,i=p(`problem.${t}`,"{detail}",null!==(l=e.calculation_problem.detail)&&void 0!==l?l:"");x="string"==typeof i&&i&&!i.startsWith("Translation")?i:p("problem.error","{detail}",t)}else{if(this._noValve(e)&&((null!==(d=e.duration)&&void 0!==d?d:0)>0||g&&(null!=m?m:g.duration)>0))return $="problem",x=p("no-valve"),{kind:$,text:x,noValve:!0};if((null!==(h=e.duration)&&void 0!==h?h:0)>0)$="watering",x=p("will-water","{duration}",this._friendlyDuration(e.duration)).replace(/\.$/,"")+` (${this._volumeText(e.duration,e.throughput)}).`;else if(g&&(null!=m?m:g.duration)>0){const t=null!=m?m:g.duration;$="watering",x=y?p("estimate","{short}",y,"{duration}",this._friendlyDuration(t),"{volume}",this._volumeText(t,e.throughput)):p("estimate-ahead","{duration}",this._friendlyDuration(t),"{volume}",this._volumeText(t,e.throughput))}else y&&_>0?x=p("under-threshold","{short}",y):!y&&aa(e)&&($="waiting",x=p("not-calculated","{when}",di(`panels.info.cards.next-run.${Ma(this.config)}`,t,"{time}",null!==(u=null===(c=this.config)||void 0===c?void 0:c.calctime)&&void 0!==u?u:"")))}return{kind:$,text:x,noValve:!1}}_cropFactorByMonth(e,t,i){const s=e.crop_factor_by_month&&12===e.crop_factor_by_month.length?e.crop_factor_by_month:new Array(12).fill(null),a=(i,a)=>{const n=[...s],o=parseFloat(a);n[i]=isNaN(o)||o<=0?null:o,this.handleEditZone(t,Object.assign(Object.assign({},e),{[Os]:n.every(e=>null===e)?null:n}))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${di("panels.zones.labels.crop-factor-by-month",i)}<si-info
            >${di("panels.zones.labels.crop-factor-by-month-help",i)}</si-info
          >
        </div>
      </div>
      <div class="month-grid">
        ${s.map((e,t)=>V`
            <label class="month-cell">
              <span class="unit"
                >${di(`panels.zones.labels.months.${t+1}`,i)}</span
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
          `)}
      </div>
    `}_canSetValveTimer(e){var t,i;if("off"===(e.safety_off_mode||"auto"))return!1;if(e.safety_off_entity||e.safety_off_topic)return!0;const s=e.linked_entity,a=null===(t=this.hass)||void 0===t?void 0:t.entities;return Boolean(s&&"zha"===(null===(i=null==a?void 0:a[s])||void 0===i?void 0:i.platform))}_adv(e,t=!1){var i;return t||"advanced"===(null===(i=this.config)||void 0===i?void 0:i.ui_mode)?e:""}handleEditZone(e,t){if(!this.hass)return;const i=this.zones[e],s=t.id,a=Object.assign(Object.assign({},void 0!==s?this._pendingZoneChanges.get(s):{}),function(e,t){const i={};for(const s of new Set([...Object.keys(null!=e?e:{}),...Object.keys(t)]))JSON.stringify(null==e?void 0:e[s])!==JSON.stringify(t[s])&&(i[s]=void 0===t[s]?null:t[s]);return i}(i,t));void 0!==s&&this._pendingZoneChanges.set(s,a),this.zones[e]=t,null!=t.id&&this.zoneCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout(()=>{const e=[...this._pendingZoneChanges.entries()];this._pendingZoneChanges.clear();const t=e.filter(([,e])=>Object.keys(e).length>0).map(([e,t])=>Object.assign(Object.assign({},t),{id:e}));if(0===t.length)return void(this.globalDebounceTimer=null);this.isSaving=!0,this._suppressNextConfigUpdate=!0;const i=t.some(e=>"soil_type"in e||"plant_type"in e||"calculation_method"in e||"method_config"in e);Promise.all(t.map(e=>this.saveToHA(e))).then(()=>i?this._fetchData():void 0).catch(e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e),this._fetchData()}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}),this.globalDebounceTimer=null},500),this._scheduleUpdate()}async handleRemoveZone(e,t){if(!this.hass)return;const i=this.zones[t].id,s=this.zones[t];if(!s||null==i)return;if(!await this._ask("confirm.delete_zone",s.name))return;const a=[...this.zones];var n,o;this.zones=this.zones.filter((e,i)=>i!==t),this.zoneCache.delete(i.toString()),this.isSaving=!0,(n=this.hass,o=i.toString(),n.callApi("POST",gi+"/zones",{id:o,remove:!0})).catch(e=>{console.error("Failed to delete zone:",e),this.zones=a,this._fetchData().catch(e=>{console.error("Failed to refresh data after delete error:",e)})}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}async handleCalculateZone(e){var t,i,s,a,n;const o=this.zones[e];if(!o||null==o.id||!this.hass)return;const r=o.id;if(this._calculating.has(r))return;const l=this.hass.language,d=(e,...t)=>di(`panels.zones.calculation-feedback.${e}`,l,...t),h=o.last_calculated;let c;this._calculating.add(r),this._scheduleUpdate();try{await sn(this.hass,r.toString()),await this._fetchData();const e=null!==(t=this.zones.find(e=>e.id===r))&&void 0!==t?t:o;c=(null===(i=e.calculation_problem)||void 0===i?void 0:i.code)||e.last_calculated!==h?`${e.name}: ${this._zoneStatusOf(e,l).text}`:d("nothing-new","{zone}",e.name)}catch(e){console.error("Failed to calculate the zone:",e),c=d("failed","{zone}",o.name,"{error}",String(null!==(n=null!==(a=null===(s=null==e?void 0:e.body)||void 0===s?void 0:s.message)&&void 0!==a?a:null==e?void 0:e.message)&&void 0!==n?n:e))}finally{this._calculating.delete(r),this._scheduleUpdate()}ui(this,"hass-notification",{message:c})}handleUpdateZone(e){const t=this.zones[e];t&&null!=t.id&&this.hass&&an(this.hass,t.id.toString())}handleViewWeatherInfo(e){var t;const i=this.zones[e];if(!i||null==i.mapping)return;const s=`#weather-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}handleViewWateringCalendar(e){var t;const i=this.zones[e];if(!i||null==i.id)return;const s=`#calendar-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const t=await dn(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,t)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const e of this.zones)if(void 0!==e.id)try{const t=await cn(this.hass,e.id.toString());this.wateringCalendars.set(e.id,t)}catch(t){console.error(`Failed to fetch watering calendar for zone ${e.id}:`,t)}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return V``;const t=this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${di("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${di("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${di("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map(e=>V`
                    <div class="weather-row">
                      <span
                        >${Ao(e.timestamp).format("MM-DD HH:mm")}</span
                      >
                      <span
                        >${null!==e.temperature&&void 0!==e.temperature?this._n(e.temperature,1)+"°C":"-"}</span
                      >
                      <span
                        >${null!==e.humidity&&void 0!==e.humidity?this._n(e.humidity,1)+"%":"-"}</span
                      >
                      <span
                        >${null!==e.precipitation&&void 0!==e.precipitation?this._n(e.precipitation,1)+"mm":"-"}</span
                      >
                      <span
                        >${e.retrieval_time?Ao(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `)}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){var t;if(!this.hass||"number"!=typeof e.id)return V``;const i=this.wateringCalendars.get(e.id),s=i&&e.id in i?i[e.id]:null,a=(null==s?void 0:s.monthly_estimates)||[],n=this.hass.language,o=e=>di(`panels.zones.calendar.${e}`,n);return V` <div class="watering-calendar">
      <h4>${o("title")}</h4>
      <div class="calendar-note">${o("caveat")}</div>
      ${0===a.length?V`
            <div class="calendar-note">
              ${(null==s?void 0:s.error)?`${o("error")}: ${s.error}`:o("none")}
            </div>
          `:V` <div class="calendar-table">
              <div class="calendar-header">
                <span>${o("month")}</span>
                <span
                  >${o("et")} (${da(this.config,_s)})</span
                >
                <span
                  >${o("precipitation")}
                  (${da(this.config,_s)})</span
                >
                <span
                  >${o("watering")}
                  (${da(this.config,vs)})</span
                >
                <span
                  >${o("avg-temp")}
                  (${(null===(t=this.config)||void 0===t?void 0:t.units)===zi?"°C":"°F"})</span
                >
              </div>
              ${a.map(e=>V`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${null!==e.estimated_et_mm&&void 0!==e.estimated_et_mm?this._n(ma(e.estimated_et_mm,this.config),1):"-"}</span
                    >
                    <span
                      >${null!==e.average_precipitation_mm&&void 0!==e.average_precipitation_mm?this._n(ma(e.average_precipitation_mm,this.config),1):"-"}</span
                    >
                    <span
                      >${null!==e.estimated_watering_volume_liters&&void 0!==e.estimated_watering_volume_liters?this._n(pa(e.estimated_watering_volume_liters,this.config),0):"-"}</span
                    >
                    <span
                      >${null!==e.average_temperature_c&&void 0!==e.average_temperature_c?this._n(function(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===zi?i:1.8*i+32}(e.average_temperature_c,this.config),1):"-"}</span
                    >
                  </div>
                `)}
            </div>
            ${(null==s?void 0:s.calculation_method)?V`
                  <div class="calendar-info">
                    ${di("panels.zones.labels.calculation-method",n)}:
                    ${di(`panels.zones.labels.calculation-methods.${s.calculation_method}`,n)}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");await tn(this.hass,e)}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,t,i,s;(null===(t=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===t?void 0:t.trim())||(null===(i=this.sizeInput)||void 0===i?void 0:i.value)||(null===(s=this.throughputInput)||void 0===s?void 0:s.value)||(this.isCreatingZone=!1)}renderTheOptions(e,t,i){if(this.hass){let s=V`<option value="" ?selected=${void 0===t}">---${di("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map(([a,n])=>s=V`${s}
            <option
              value="${n.id}"
              ?selected="${t===n.id}"
            >
              ${i?i(n):$a(n,e)}
            </option>`),s}return V``}renderZone(e,t){var i,s,a,n,o,r,l,d,h,c,u,p,g,m,f,v,_,w;if(!this.hass)return V``;const y=this.hass.language,b=e.state===xo.Automatic,$=e.state===xo.Disabled||e.state===xo.Automatic,x=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const t=this.mappings.filter(t=>t.id===e.mapping)[0];null!=t&&null!=t.data&&(e.number_of_data_points=t.data.length)}const k=di("panels.zones.labels.states."+e.state,y),z=V`${ha(e.duration)}
    (${this._n(ca(e.duration,e.throughput),1)}
    ${da(this.config,vs)})`,S=null!=e.id&&this._expanded.has(e.id);return V`
      <ha-card class="zone-card" id="zone-${e.id}">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${S?"true":"false"}
          @click=${()=>this._toggleZone(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleZone(e.id))}}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${e.name||"—"}</span>
              <ha-label class="state-label state-label--${e.state}" dense
                >${k}</ha-label
              >
            </div>
            ${e.state===xo.Manual?V`<div class="zone-sub">${z}</div>`:""}
          </div>
          ${this._zoneYamlToggle(e,y)}
          <ha-svg-icon
            class="zone-chevron ${S?"open":""}"
            .path=${Da}
          ></ha-svg-icon>
        </div>
        ${this._zoneStatus(e,y)}
        ${S?V` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${di("panels.zones.labels.last_calculated",y)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?Ao(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${di("panels.zones.labels.data-last-updated",y)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?Ao(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${di("panels.zones.labels.data-number-of-data-points",y)}</span
                  >
                  <span class="meta-value"
                    >${null!==(i=e.number_of_data_points)&&void 0!==i?i:"—"}</span
                  >
                </div>
              </div>

              ${null!=e.id&&this._yamlEdits.has(e.id)?this._zoneYamlBlock(e,y):V`<div class="settings">
                    ${this._zoneHiddenNotice(e,y)}
                    <div class="zone-section">
                      ${di("panels.zones.sections.zone",y)}
                    </div>
                    ${this._textRow(di("panels.zones.labels.name",y),"",e.name,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[us]:i})))}
                    ${this._selectRow(this._labelWithHint("input-method",y),V`
                        <option
                          value="${Ys}"
                          ?selected=${(null!==(s=e.input_method)&&void 0!==s?s:Ys)===Ys}
                        >
                          ${di("panels.zones.labels.input-methods.throughput",y)}
                        </option>
                        <option
                          value="${Vs}"
                          ?selected=${e.input_method===Vs}
                        >
                          ${di("panels.zones.labels.input-methods.direct",y)}
                        </option>
                      `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ws]:i.target.value})))}
                    ${e.input_method===Vs?this._numRow(di("panels.zones.labels.precipitation-rate",y),da(this.config,Zs),e.precipitation_rate,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Zs]:parseFloat(i)})),.1):V`
                          ${this._numRow(di("panels.zones.labels.size",y),da(this.config,ps),e.size,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ps]:parseFloat(i)})),.1)}
                          ${this._numRow(di("panels.zones.labels.throughput",y),da(this.config,gs),e.throughput,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[gs]:parseFloat(i)})),.1)}
                          ${e.measured_throughput&&(e.measured_throughput_samples||0)>=3?V`
                                <div class="setting-help">
                                  ${di("panels.zones.labels.measured-flow-help",y)}
                                  <ha-button
                                    appearance="filled"
                                    @click=${()=>{var t;return null===(t=this.hass)||void 0===t?void 0:t.callService(gi,"use_measured_throughput",{zone_id:e.id})}}
                                  >
                                    ${di("panels.zones.labels.use-measured-flow",y)}
                                  </ha-button>
                                </div>
                              `:""}
                        `}
                    ${(null===(a=this.config)||void 0===a?void 0:a.observed_watering_enabled)||(null===(n=this.config)||void 0===n?void 0:n.direct_valve_control_enabled)?V`<div id="zone-${e.id}-valve"></div>
                          ${this._entityRow(di("panels.zones.labels.linked-entity",y),di("panels.zones.labels.optional",y),e.linked_entity,function(e){const t=["switch","valve","input_boolean"];return(null==e?void 0:e.full_controller)&&t.push("light","cover"),(null==e?void 0:e.direct_valve_control_enabled)||(null==e?void 0:e.full_controller)||t.push("binary_sensor"),t}(this.config),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ss]:i||void 0})),di("panels.zones.labels.linked-entity-hint",y))}`:V`<div
                          class="setting-row"
                          id="zone-${e.id}-valve"
                        >
                          <div class="setting-label">
                            ${di("panels.zones.labels.linked-entity",y)}<si-info
                              >${di("panels.zones.labels.valve-off",y)}</si-info
                            >
                          </div>
                          <a
                            class="valve-off-link"
                            href="/${gi}/general"
                            @click=${e=>{e.preventDefault(),_a(0,`/${gi}/general`)}}
                            >${di("panels.zones.labels.valve-off-link",y)}</a
                          >
                        </div>`}
                    ${(null===(o=this.config)||void 0===o?void 0:o.full_controller)&&e.linked_entity?this._entitiesRows(di("panels.zones.labels.extra-valves",y),di("panels.zones.labels.extra-valves-hint",y),e.extra_entities||[],["switch","valve","input_boolean","light","cover"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ns]:i}))):""}
                    ${(null===(r=this.config)||void 0===r?void 0:r.full_controller)&&((null===(l=this.config)||void 0===l?void 0:l.supplies)||[]).length?this._selectRow(di("panels.zones.labels.supply",y),V`
                            <option value="" ?selected=${!e.supply_id}>
                              ${di("panels.zones.labels.supply-none",y)}
                            </option>
                            ${((null===(d=this.config)||void 0===d?void 0:d.supplies)||[]).map(t=>V`
                                <option
                                  value=${t.id||""}
                                  ?selected=${e.supply_id===t.id}
                                >
                                  ${t.name}
                                </option>
                              `)}
                          `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ds]:i.target.value||null}))):""}
                    ${(null===(h=this.config)||void 0===h?void 0:h.direct_valve_control_enabled)&&e.linked_entity?this._adv(V`
                          ${this._numRow(V`${di("panels.zones.labels.confirm-timeout",y)}<si-info
                                >${di("panels.zones.labels.confirm-timeout-help",y)}</si-info
                              >`,"s",e.confirm_timeout,i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Rs]:isNaN(s)?null:Math.min(600,Math.max(1,s))}))},1)}
                          ${this._numRow(di("panels.zones.labels.open-resends",y),"",e.open_resends,i=>{const s=parseInt(i,10);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ls]:isNaN(s)?null:Math.min(10,Math.max(0,s))}))},1)}
                          ${this._entityRow(V`${di("panels.zones.labels.safety-off-entity",y)}<si-info
                                  >${di("panels.zones.labels.safety-off-entity-help",y)}</si-info
                                >`,di("panels.zones.labels.optional",y),null!==(c=e.safety_off_entity)&&void 0!==c?c:void 0,["number","input_number"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Es]:i||null})))}
                          ${this._textRow(di("panels.zones.labels.safety-off-topic",y),di("panels.zones.labels.optional",y),e.safety_off_topic,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Hs]:i||void 0})))}
                          ${this._selectRow(V`${V`${di("panels.zones.labels.safety-off-mode",y)}<si-info
                                  >${di("panels.zones.labels.safety-off-topic-help",y)}</si-info
                                >`}<si-info
                                >${di("panels.zones.labels.safety-off-mode-help",y)}</si-info
                              >`,V`
                              ${["auto","zha","off"].map(t=>V`
                                  <option
                                    value=${t}
                                    ?selected=${(e.safety_off_mode||"auto")===t}
                                  >
                                    ${di(`panels.zones.labels.safety-off-mode-${t}`,y)}
                                  </option>
                                `)}
                            `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Is]:i.target.value})))}
                          ${this._canSetValveTimer(e)?V`
                                ${this._selectRow(V`${di("panels.zones.labels.safety-off-required",y)}<si-info
                                      >${di("panels.zones.labels.safety-off-required-help",y)}</si-info
                                    >`,V`
                                    ${["open","skip"].map(t=>V`
                                        <option
                                          value=${t}
                                          ?selected=${(e.safety_off_required?"skip":"open")===t}
                                        >
                                          ${di(`panels.zones.labels.safety-off-required-${t}`,y)}
                                        </option>
                                      `)}
                                  `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[js]:"skip"===i.target.value})))}
                              `:""}
                        `):""}
                    ${this._adv((null===(u=this.config)||void 0===u?void 0:u.observed_watering_enabled)&&e.linked_entity?this._entityRow(di("panels.zones.labels.flow-sensor",y),di("panels.zones.labels.optional",y),e.flow_sensor,["sensor"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ps]:i||void 0})),di("panels.zones.labels.flow-sensor-hint",y)):"")}
                    ${this._adv((null===(p=this.config)||void 0===p?void 0:p.observed_watering_enabled)&&e.linked_entity?V`
                            ${this._numRow(V`${di("panels.zones.labels.observed-ignore-seconds",y)}<si-info
                                  >${di("panels.zones.labels.observed-ignore-seconds-help",y)}</si-info
                                >`,"s",e.observed_ignore_seconds,i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Us]:isNaN(s)||s<=0?null:Math.min(3600,s)}))},1)}
                          `:"")}
                    ${this._adv(this._numRow(di("panels.zones.labels.lead-time",y),"s",e.lead_time,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[bs]:parseInt(i,10)})),1))}
                    ${this._adv(this._numRow(di("panels.zones.labels.maximum-duration",y),"s",e.maximum_duration,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[$s]:parseInt(i,10)})),1))}
                    <div class="zone-section">
                      ${di("panels.zones.sections.need",y)}
                    </div>
                    ${this._selectRow(this._labelWithHint("state",y),V`
                        <option
                          value="${xo.Automatic}"
                          ?selected=${e.state===xo.Automatic}
                        >
                          ${di("panels.zones.labels.states.automatic",y)}
                        </option>
                        <option
                          value="${xo.Disabled}"
                          ?selected=${e.state===xo.Disabled}
                        >
                          ${di("panels.zones.labels.states.disabled",y)}
                        </option>
                        <option
                          value="${xo.Manual}"
                          ?selected=${e.state===xo.Manual}
                        >
                          ${di("panels.zones.labels.states.manual",y)}
                        </option>
                      `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ms]:i.target.value,[fs]:0})))}
                    ${this._adv(this._selectRow(di("panels.zones.labels.calculation-method",y),V`
                          ${["from_weather","provided","fixed"].map(t=>{var i;return V`
                              <option
                                value="${t}"
                                ?selected=${(null!==(i=e.calculation_method)&&void 0!==i?i:"from_weather")===t}
                              >
                                ${di(`panels.zones.labels.calculation-methods.${t}`,y)}
                              </option>
                            `})}
                        `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{calculation_method:i.target.value}))))}
                    ${this._adv(V`<div class="setting-help">
                        ${di(`panels.zones.labels.calculation-method-help.${null!==(g=e.calculation_method)&&void 0!==g?g:"from_weather"}`,y)}
                      </div>`)}
                    ${this._engineOptions(t,e,y)}
                    ${this._selectRow(this._labelWithHint("mapping",y),this.renderTheOptions(this.mappings,e.mapping),i=>{const s=i.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[ys]:""===s?void 0:parseInt(s)}))})}
                    ${this._selectRow(di("panels.zones.labels.soil-type",y),V`
                        ${Co.map(t=>{var i,s,a,n,o;return V`
                            <option
                              value="${t}"
                              ?selected=${(null!==(i=e.soil_type)&&void 0!==i?i:"custom")===t}
                            >
                              ${"default"===t?di("panels.zones.labels.soil-types.default",y,"{value}",`${this._n("default"===e.soil_type?Number(e.drainage_rate)||0:(null===(s=this.config)||void 0===s?void 0:s.units)===zi?8:8/25.4,(null===(a=this.config)||void 0===a?void 0:a.units)===zi?1:2)} ${la(this.config,zs)}`):t in Ho?`${di(`panels.zones.labels.soil-types.${t}`,y)} (${this._n((null===(n=this.config)||void 0===n?void 0:n.units)===zi?Ho[t]:Ho[t]/25.4,(null===(o=this.config)||void 0===o?void 0:o.units)===zi?0:2)} ${la(this.config,zs)})`:di(`panels.zones.labels.soil-types.${t}`,y)}
                            </option>
                          `})}
                      `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{soil_type:i.target.value})))}
                    ${"custom"===(null!==(m=e.soil_type)&&void 0!==m?m:"custom")?this._numRow(this._labelWithHint("drainage_rate",y),da(this.config,zs),e.drainage_rate,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[zs]:parseFloat(i)})),.1):""}
                    ${this._selectRow(di("panels.zones.labels.plant-type",y),V`
                        ${Eo.map(t=>{var i;return V`
                            <option
                              value="${t}"
                              ?selected=${(null!==(i=e.plant_type)&&void 0!==i?i:"custom")===t}
                            >
                              ${"default"===t?di("panels.zones.labels.plant-types.default",y,"{value}",this._n("default"===e.plant_type?Number(e.multiplier)||0:1,1)):di(`panels.zones.labels.plant-types.${t}`,y)}
                            </option>
                          `})}
                      `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{plant_type:i.target.value})))}
                    ${"custom"===(null!==(f=e.plant_type)&&void 0!==f?f:"custom")?this._numRow(di("panels.zones.labels.multiplier",y),"",e.multiplier,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ws]:parseFloat(i)})),.1):this._adv(this._numRow(di("panels.zones.labels.multiplier",y),"",e.multiplier,()=>{},.1,!0))}
                    ${this._adv(this._cropFactorByMonth(e,t,y))}
                    ${this._adv(V`${this._numRow(di("panels.zones.labels.available-water",y),da(this.config,_s),null!=e.available_water?Number(e.available_water).toFixed(1):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ts]:isNaN(s)||s<=0?null:s}))},1)}
                      ${this._numRow(V`${di("panels.zones.labels.allowed-depletion",y)}<si-info
                            >${di("panels.zones.labels.available-water-help",y)}</si-info
                          >`,"%",null!=e.allowed_depletion?Number(e.allowed_depletion).toFixed(0):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[As]:isNaN(s)?null:Math.min(95,Math.max(5,s))}))},5)}`)}
                    ${this._adv(V`${this._numRow(V`${di("panels.zones.labels.distribution-efficiency",y)}<si-info
                            >${di("panels.zones.labels.distribution-efficiency-help",y)}</si-info
                          >`,"%",null!=e.distribution_efficiency?Number(e.distribution_efficiency).toFixed(0):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Cs]:isNaN(s)?null:Math.min(100,Math.max(5,s))}))},5)}`)}
                    ${this._adv(this._numRow(this._labelWithHint("irrigation-threshold",y),da(this.config,_s),Number(null!==(v=e.irrigation_threshold)&&void 0!==v?v:0).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ks]:parseFloat(i)})),.1))}
                    ${this._adv(this._numRow(this._labelWithHint("maximum-bucket",y),da(this.config,_s),Number(e.maximum_bucket).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[xs]:parseFloat(i)})),.1))}
                    ${this._adv(V`${this._numRow(V`${di("panels.zones.labels.days-between-irrigation",y)}<si-info
                            >${di("panels.zones.labels.days-between-irrigation-help",y)}</si-info
                          >`,di("panels.zones.labels.days",y),e.days_between_irrigation,i=>{const s=parseInt(i,10);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ms]:isNaN(s)?null:Math.max(0,s)}))},1)}`,"number"==typeof e.days_between_irrigation)}
                    ${this._adv(this._entityRow(di("panels.zones.labels.soil-moisture-sensor",y),di("panels.zones.labels.optional",y),e.soil_moisture_sensor,["sensor"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Bs]:i||void 0})),di("panels.zones.labels.soil-moisture-sensor-hint",y)),Boolean(e.soil_moisture_sensor))}
                    ${e.soil_moisture_sensor?this._numRow(di("panels.zones.labels.soil-moisture-threshold",y),"%",null!==(_=e.soil_moisture_threshold)&&void 0!==_?_:50,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Fs]:parseFloat(i)})),1):""}
                    <div class="zone-section">
                      ${di("panels.zones.sections.status",y)}
                    </div>
                    ${this._bucketRow(e,t,y)}
                    ${this._adv(V`
                        ${this._valueRow(V`${V`${di("panels.zones.labels.et-deficiency",y)}`}<si-info
                              >${di("panels.zones.labels.et-deficiency-help",y)}</si-info
                            >`,null!=e.et_deficiency?`${this._n(0-Number(e.et_deficiency),2)} ${la(this.config,_s)}`:"—")}
                      `)}
                    ${this._durationRow(e,t,y,$)}
                    ${$?V`<div class="setting-help">
                          ${di(e.state===xo.Disabled?"panels.zones.labels.duration-readonly-disabled":"panels.zones.labels.duration-readonly-automatic",y)}
                        </div>`:""}
                  </div>`}

              <div class="zone-actions">
                ${b?V`
                      ${this._actionBtn(Ha,di(null!=e.id&&this._calculating.has(e.id)?"panels.zones.actions.calculating":"panels.zones.actions.calculate",y),()=>this.handleCalculateZone(t),!1,null!=e.id&&this._calculating.has(e.id))}
                      ${this._actionBtn(Za,di("panels.zones.actions.update",y),()=>this.handleUpdateZone(t))}
                    `:""}
                ${(null===(w=this.config)||void 0===w?void 0:w.direct_valve_control_enabled)&&e.linked_entity&&e.state!==xo.Disabled?this._actionBtn(qa,di("panels.zones.actions.water",y),()=>this._waterZone(e)):""}
                ${this._actionBtn(Fa,di("panels.zones.actions.reset-bucket",y),async()=>{await this._ask("confirm.reset_bucket",e.name)&&this.handleEditZone(t,Object.assign(Object.assign({},e),{[_s]:0}))})}
                ${null!=e.mapping?this._actionBtn(Ia,di("panels.zones.actions.view-weather-info",y),()=>this.handleViewWeatherInfo(t)):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",di("panels.zones.actions.view-watering-calendar",y),()=>this.handleViewWateringCalendar(t))}
                ${x?this._actionBtn(Pa,di("panels.zones.actions.information",y),()=>this.toggleExplanation(t)):""}
              </div>

              <div class="zone-danger">
                ${this._actionBtn(Ra,di("common.actions.delete",y),e=>this.handleRemoveZone(e,t),!0)}
              </div>

              ${x?V`<label class="hidden" id="calcresults${t}"
                    >${Xs("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
    `}_bucketRow(e,t,i){const s=`bucket-${e.id}`,a=this._labelWithHint("bucket",i);return this._editing.has(s)?V`${this._numRow(a,da(this.config,_s),Number(e.bucket).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[_s]:parseFloat(i)})),.1)}${this._doneRow(s,i)}`:this._valueRow(a,`${this._n(Number(e.bucket)||0,1)} ${la(this.config,_s)}`,s,i)}_durationRow(e,t,i,s){const a=di("panels.zones.labels.duration",i);if(s)return V`
        <div class="setting-row value-row">
          <div class="setting-label">${a}</div>
          <div class="value-field">
            <span class="value-text"
              >${this._friendlyDuration(Number(e.duration)||0)}</span
            >
          </div>
        </div>
      `;const n=Number(e.duration)||0;return V`${this._numRow(a,di("common.units.minutes",i),void 0===e.duration||null===e.duration?e.duration:+(n/60).toFixed(2),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[fs]:Math.max(0,Math.round(60*parseFloat(i))||0)})),1)}<si-info
        >= ${this._friendlyDuration(Number(e.duration)||0)}</si-info
      >`}_valueRow(e,t,i,s){return V`
      <div class="setting-row value-row">
        <div class="setting-label">${e}</div>
        <div class="value-field">
          <span class="value-text">${t}</span>
          ${i?V`<ha-button
                appearance="plain"
                size="small"
                @click=${()=>{this._editing.add(i),this.requestUpdate()}}
              >
                ${di("panels.zones.actions.change",s)}
              </ha-button>`:""}
        </div>
      </div>
    `}_doneRow(e,t){return V`
      <div class="edit-done">
        <ha-button
          appearance="plain"
          size="small"
          @click=${()=>{this._editing.delete(e),this.requestUpdate()}}
        >
          ${di("panels.zones.actions.done",t)}
        </ha-button>
      </div>
    `}_textRow(e,t,i,s){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const o=(String(a).split(".")[1]||"").length,r=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(o);e.value=String(n),s(String(n))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
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
            .path=${Ba}
            ?disabled=${n}
            @click=${e=>r(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ya}
            ?disabled=${n}
            @click=${e=>r(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_labelWithHint(e,t){return V`${di(`panels.zones.labels.${e}`,t)}<si-info
        >${di(`panels.zones.labels.${e}-hint`,t)}</si-info
      >`}_selectRow(e,t,i){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Ua}></path>
          </svg>
        </div>
      </div>
    `}_entityRow(e,t,i,s,a,n){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
          ${n?V`<si-info>${n}</si-info>`:""}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${i||""}
          .includeDomains=${s}
          .entityFilter=${this._notOwnEntity}
          allow-custom-entity
          @value-changed=${e=>{var t;return a((null===(t=e.detail)||void 0===t?void 0:t.value)||"")}}
        ></ha-entity-picker>
      </div>
    `}_entitiesRows(e,t,i,s,a){return V`${[...i,""].map((n,o)=>V`
        <div class="setting-row">
          <div class="setting-label">
            ${0===o?V`${e} ${t?V`<si-info>${t}</si-info>`:""}`:""}
          </div>
          <ha-entity-picker
            class="entity-field"
            .hass=${this.hass}
            .value=${n}
            .includeDomains=${s}
            .entityFilter=${this._notOwnEntity}
            allow-custom-entity
            @value-changed=${e=>{var t;const s=((null===(t=e.detail)||void 0===t?void 0:t.value)||"").trim(),n=[...i];o<n.length?s?n[o]=s:n.splice(o,1):s&&n.push(s),a(n.filter((e,t)=>e&&n.indexOf(e)===t))}}
          ></ha-entity-picker>
        </div>
      `)}`}async _openZoneYaml(e){if(null==e.id)return;await $e().catch(()=>{});const t=(e=>{const t=e,i={};for(const e of _o)bo(t[e])||(i[e]=t[e]);return i})(e);this._yamlEdits.set(e.id,{initial:t,value:t,valid:!0}),this._expanded.add(e.id),this.zoneCache.delete(e.id.toString()),this._scheduleUpdate()}_closeZoneYaml(e){this._yamlEdits.delete(e),this.zoneCache.delete(e.toString()),this._scheduleUpdate()}_zoneYamlToggle(e,t){if(null==e.id)return"";const i=e.id,s=this._yamlEdits.has(i),a=di(s?"programs.yaml_back":"programs.yaml_edit",t);return V`<ha-icon-button
      class="zone-head-action"
      .path=${s?La:ja}
      .label=${a}
      title=${a}
      @click=${t=>{t.stopPropagation(),t.preventDefault(),s?this._closeZoneYaml(i):this._openZoneYaml(e)}}
      @keydown=${e=>e.stopPropagation()}
    ></ha-icon-button>`}_zoneHiddenNotice(e,t){var i;const s=Yn(e,null===(i=this.config)||void 0===i?void 0:i.ui_mode,e=>di(`panels.zones.labels.${e}`,t));if(!s)return"";const a=Wn([s]),n=[di("panels.groups.settings",t),di("panels.general.title",t),di("panels.general.cards.panel-mode.labels.advanced",t)].join(" › ");return V`<ha-alert
      alert-type="info"
      .title=${di(a?"programs.hidden_title":"programs.yaml_only_title",t)}
    >
      ${a?di("programs.hidden_help",t).replace("{where}",n):di("panels.zones.yaml.only_help",t)}
      <div>${s.items.join(" · ")}</div>
      <ha-button
        slot="action"
        appearance="plain"
        @click=${()=>this._openZoneYaml(e)}
        >${di("programs.yaml_edit",t)}</ha-button
      >
    </ha-alert>`}_zoneYamlBlock(e,t){const i=e.id,s=this._yamlEdits.get(i),a=s.valid?((e,t)=>{const i=An(e);if(!i)return{error:"not_a_zone"};const s=Object.keys(i).filter(e=>!yo.has(e));if(s.length)return{error:"not_settings",keys:s};const a=t,n={};for(const e of _o){let t;if(e in i)t=void 0===i[e]?null:i[e];else{if(!wo.has(e))continue;t=null}const s=a[e];bo(t)&&bo(s)||JSON.stringify(t)!==JSON.stringify(s)&&(n[e]=t)}return{changes:n}})(s.value,e):null,n=s.valid?a&&"error"in a?"not_a_zone"===a.error?di("panels.zones.yaml.not_a_zone",t):di("panels.zones.yaml.not_settings",t).replace("{keys}",a.keys.join(", ")):s.error:di("programs.yaml_invalid",t);return V`<div class="settings">
      <div class="zone-section">
        YAML<si-info>${di("panels.zones.yaml.help",t)}</si-info>
      </div>
      <ha-yaml-editor
        .hass=${this.hass}
        .defaultValue=${s.initial}
        @value-changed=${e=>{e.stopPropagation();const{value:t,isValid:a}=e.detail||{};s.value=t,s.valid=!1!==a,s.error=void 0,this.zoneCache.delete(i.toString()),this._scheduleUpdate()}}
      ></ha-yaml-editor>
      ${n?V`<div class="setting-help yaml-problem">${n}</div>`:""}
      <div class="yaml-actions">
        ${this._actionBtn(Ea,di("programs.yaml_apply",t),async()=>{var e,n,o;if(this.hass&&a&&!("error"in a)&&!s.saving)if(Object.keys(a.changes).length){s.saving=!0,s.error=void 0,this._scheduleUpdate();try{const e=this._pendingZoneChanges.get(i);this._pendingZoneChanges.delete(i),await this.saveToHA(Object.assign(Object.assign(Object.assign({},e||{}),a.changes),{id:i})),this._closeZoneYaml(i),ui(this,"hass-notification",{message:di("panels.zones.yaml.applied",t)}),await this._fetchData()}catch(t){s.error=null!==(o=null!==(n=null===(e=null==t?void 0:t.body)||void 0===e?void 0:e.message)&&void 0!==n?n:null==t?void 0:t.message)&&void 0!==o?o:String(t)}finally{s.saving=!1,this.zoneCache.delete(i.toString()),this._scheduleUpdate()}}else this._closeZoneYaml(i)},!1,!a||"error"in a||!!s.saving)}
      </div>
    </div>`}_actionBtn(e,t,i,s=!1,a=!1){return V`
      <ha-button
        appearance=${s?"outlined":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}toggleExplanation(e){var t;const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);i&&("hidden"!=i.className?i.className="hidden":i.className="explanation")}_n(e,t){var i,s;return ea(e,t,null===(i=this.hass)||void 0===i?void 0:i.locale,null===(s=this.hass)||void 0===s?void 0:s.language)}_renderAddZone(){const e=this.hass.language,t=0===this.zones.length;return t||this._addOpen?V`
      <ha-card header="${di("panels.zones.cards.add-zone.header",e)}">
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("panels.zones.labels.name",e)}
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
              ${di("panels.zones.labels.size",e)}
              <span class="unit">(${da(this.config,ps)})</span>
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
              ${di("panels.zones.labels.throughput",e)}
              <span class="unit"
                >(${da(this.config,gs)})</span
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
            ${t?V`<ha-button
                  appearance="plain"
                  @click=${()=>_a(0,"/smart_irrigation/setup")}
                >
                  ${di("panels.zones.cards.add-zone.actions.assistant",e)}
                </ha-button>`:V`<ha-button
                  appearance="plain"
                  @click=${()=>{this._addOpen=!1}}
                >
                  ${di("panels.zones.cards.add-zone.actions.cancel",e)}
                </ha-button>`}
            <ha-button
              appearance="filled"
              @click="${this.handleAddZone}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${Ya}></ha-svg-icon>
              ${this.isSaving?di("common.saving-messages.adding",e):di("panels.zones.cards.add-zone.actions.add",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>
    `:V`
        <div class="add-zone-bar">
          <ha-button appearance="outlined" @click=${()=>this._openAddZone()}>
            <ha-svg-icon slot="start" .path=${Ya}></ha-svg-icon>
            ${di("panels.zones.cards.add-zone.header",e)}
          </ha-button>
        </div>
      `}_openAddZone(){this._addOpen=!0,this.updateComplete.then(()=>{var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("#nameInput");null==t||t.scrollIntoView({block:"center",behavior:"smooth"}),null==t||t.focus()})}render(){return this.hass?this.isLoading?V`
        <ha-card header="${di("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${di("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("panels.zones.title",this.hass.language)}<si-info
              >${di("panels.zones.description",this.hass.language)}</si-info
            ></span
          >
        </h1>
      </ha-card>
      ${vo(this.zones,e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name},(e,t)=>this.renderZone(e,t))}
      ${this._renderAddZone()}

      <ha-card
        header="${di("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(Ha,di("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),()=>this.handleCalculateAllZones(),!1,this.isSaving)}
            ${this._actionBtn(Za,di("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),()=>this.handleUpdateAllZones(),!1,this.isSaving)}
          </div>
          <!-- The two that throw data away, apart from the two that refresh
               it (#982): they already ask first, now they also look it. -->
          <div class="bulk-danger">
            <div class="setting-help">
              ${di("panels.zones.cards.zone-actions.reset-hint",this.hass.language)}
            </div>
            <div class="zone-actions-grid">
              ${this._actionBtn(Fa,di("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),()=>this.handleResetAllBuckets(),!0,this.isSaving)}
              ${this._actionBtn(Ia,di("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),()=>this.handleClearAllWeatherdata(),!0,this.isSaving)}
            </div>
          </div>
        </div>
      </ha-card>
    `:V``}disconnectedCallback(){super.disconnectedCallback(),this._liveTimer&&window.clearTimeout(this._liveTimer),this._liveTimer=void 0,this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return l`
      ${Gn}

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
      .zone-head-action {
        flex: 0 0 auto;
        color: var(--primary-color);
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        --ha-icon-button-size: 36px;
      }
      .yaml-problem {
        color: var(--error-color, #db4437);
        border-bottom: 0;
      }
      .yaml-actions {
        padding: 8px 0;
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

      .zone-status--running {
        background: rgba(3, 169, 244, 0.24);
        font-weight: 500;
      }

      .zone-status--running ha-icon {
        color: var(--primary-color);
      }

      .zone-status--watering ha-icon {
        color: var(--primary-color);
      }

      .zone-status--idle ha-icon {
        color: var(--success-color, #43a047);
      }

      .zone-status--problem {
        background: rgba(219, 68, 55, 0.12);
      }

      .zone-status--problem ha-icon {
        color: var(--error-color, #db4437);
      }

      .valve-off-link {
        color: var(--primary-color);
        white-space: nowrap;
      }

      .zone-status-link {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: var(--primary-color);
        text-decoration: underline;
        cursor: pointer;
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
      .setting-row:last-child,
      /* A hint closing its block: the actions below draw their own line, and
         the two lines 16 px apart framed an empty strip (#1048). */
      .setting-help:last-child {
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
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 8px;
      }
      /* The open zone in three parts: what it is, what it needs, where it
         stands (#982). */
      .zone-section {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        padding: 20px 0 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      .zone-section:first-child {
        padding-top: 4px;
      }
      .value-field {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        min-height: 40px;
      }
      .value-text {
        font-size: 16px;
        font-variant-numeric: tabular-nums;
      }
      .edit-done {
        display: flex;
        justify-content: flex-end;
      }
      /* The actions for all zones that discard data, under a divider. */
      .bulk-danger {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      /* Room between the hint and the buttons, which touched it (#1006,
         #1017): as much as between the card's title and its first row. */
      .bulk-danger .setting-help {
        padding: 0 0 16px;
        /* The shared .setting-help draws a line under itself, which ran along
           the top of the buttons: the "line above" of #1019. */
        border-bottom: none;
      }
      /* Deleting the zone, apart from what it does every day. */
      .zone-danger {
        display: flex;
        justify-content: flex-start;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .zone-danger ha-button {
        width: auto;
      }
      /* The way to add a zone, after the zones: a button, not a form. */
      .add-zone-bar {
        display: flex;
        justify-content: flex-end;
        margin: 8px;
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
        /* A switch stays on the right of its title (#1049), and a value
           sits right after its label, not on a line of its own (#1048). */
        .setting-row:has(> ha-switch) {
          flex-direction: row;
          align-items: center;
          gap: 12px;
        }
        .setting-row > ha-switch {
          flex: 0 0 auto;
        }
        .setting-row:has(> ha-switch) > .setting-label {
          flex: 1 1 auto;
          min-width: 0;
        }
        .setting-row.value-row {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          gap: 0 12px;
          min-height: 44px;
        }
        .zone-actions {
          margin-top: 8px;
          padding-top: 12px;
        }
        .value-row .value-field {
          justify-content: flex-start;
          min-height: 0;
        }
        .field,
        .select-wrap,
        .num-field {
          width: 100%;
          max-width: 100%;
        }
      }
    `}};i([fe()],Do.prototype,"config",void 0),i([fe({attribute:!1})],Do.prototype,"path",void 0),i([fe({type:Array})],Do.prototype,"zones",void 0),i([fe({type:Array})],Do.prototype,"modules",void 0),i([fe({type:Array})],Do.prototype,"mappings",void 0),i([fe({type:Map})],Do.prototype,"wateringCalendars",void 0),i([fe({type:Map})],Do.prototype,"weatherRecords",void 0),i([fe({type:Map})],Do.prototype,"plannedDurations",void 0),i([fe({type:Boolean})],Do.prototype,"isLoading",void 0),i([fe({type:Boolean})],Do.prototype,"isSaving",void 0),i([fe({type:Boolean})],Do.prototype,"isCreatingZone",void 0),i([ve()],Do.prototype,"_addOpen",void 0),i([_e("#nameInput")],Do.prototype,"nameInput",void 0),i([_e("#sizeInput")],Do.prototype,"sizeInput",void 0),i([_e("#throughputInput")],Do.prototype,"throughputInput",void 0),Do=i([pe("smart-irrigation-view-zones")],Do);let No=class extends(vn(ce)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.newMappingName="",this._addOpen=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this._pendingMappings=new Map,this.globalDebounceTimer=null,this.showAllMappings=!1,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set,this.modules=[]}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout(()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()},this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:gi+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([Ka(this.hass),en(this.hass),on(this.hass),nn(this.hass)]);this.config=e,this.zones=t,this.mappings=i,this.modules=s,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(t){console.error("Error fetching data:",t),va({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const t=await dn(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for mapping ${e.id}:`,t),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return V``;const t=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${di("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${di("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${di("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${di("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map(e=>{let t="-",i="-";try{if(e.timestamp&&null!==e.timestamp){const i=Ao(e.timestamp);i.isValid()&&(t=i.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting timestamp:",e.timestamp,t)}try{if(e.retrieval_time&&null!==e.retrieval_time){const t=Ao(e.retrieval_time);t.isValid()&&(i=t.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting retrieval_time:",e.retrieval_time,t)}return V`
                    <div class="weather-row">
                      <span>${t}</span>
                      <span
                        >${null!==e.temperature&&void 0!==e.temperature?this._n(e.temperature,1)+"°C":"-"}</span
                      >
                      <span
                        >${null!==e.humidity&&void 0!==e.humidity?this._n(e.humidity,1)+"%":"-"}</span
                      >
                      <span
                        >${null!==e.precipitation&&void 0!==e.precipitation?this._n(e.precipitation,1)+"mm":"-"}</span
                      >
                      <span>${i}</span>
                    </div>
                  `})}
              </div>
            `}
      </div>
    `}handleAddMapping(){var e;if(!this.mappingNameInput.value.trim())return;const t=!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service),i=e=>{var i;return function(e,t,i){const s=e===Mi||e===Di||e===Ci||e===Hi&&Pi.includes(null!=i?i:"");return t?s?qi:Ui:Bi}(e,t,null===(i=this.config)||void 0===i?void 0:i.weather_service)},s=Object.fromEntries([Si,Mi,Ti,Ci,Hi,Ei,Di,Ni,Ii].map(e=>[e,{[Ji]:i(e),[Ki]:"",[Qi]:""}])),a={name:this.mappingNameInput.value.trim(),mappings:s};this.mappings=[...this.mappings,a],this.isSaving=!0,this.saveToHA(a).then(()=>(this.mappingNameInput.value="",this.newMappingName="",this._addOpen=!1,this.showAllMappings=!0,this._fetchData())).catch(e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}async handleRemoveMapping(e,t){var i,s,a;const n=this.mappings[t].id;if(null==n)return;const o=di("confirm.delete_mapping",null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en").replace("{name}",null!==(a=this.mappings[t].name)&&void 0!==a?a:"");if(!await Zn(this.hass,{text:o,destructive:!0}))return;const r=[...this.mappings];var l,d;(this.mappings=this.mappings.filter((e,i)=>i!==t),this.mappingCache.delete(n.toString()),this.hass)&&(this.isSaving=!0,(l=this.hass,d=n.toString(),l.callApi("POST",gi+"/mappings",{id:d,remove:!0})).catch(e=>{console.error("Failed to delete mapping:",e),this.mappings=r,this._fetchData().catch(e=>{console.error("Failed to refresh data after delete error:",e)})}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleEditMapping(e,t){this.mappings[e]=t,t.id&&this.mappingCache.delete(t.id.toString()),void 0!==t.id&&this._pendingMappings.set(t.id,t),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout(()=>{const e=[...this._pendingMappings.values()];this._pendingMappings.clear(),this.isSaving=!0,this._suppressNextConfigUpdate=!0,Promise.all(e.map(e=>this.saveToHA(e))).catch(e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}),this.globalDebounceTimer=null},500),this._scheduleUpdate()}async saveToHA(e){var t;if(!this.hass)throw new Error("Home Assistant connection not available");const i=[],s=this.hass.states;for(const t in e.mappings){const a=e.mappings[t].sensorentity;if(a&&""!==a.trim()){const n=a.trim();e.mappings[t].sensorentity=n,n in s||i.push(n)}}if(i.length>0){const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");throw e&&va({body:{message:di("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+i.join(", ")},error:di("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}const{id:a,name:n,mappings:o,greenhouse:r}=e;await rn(this.hass,{id:a,name:n,mappings:o,greenhouse:r})}consumedSources(e){var t;if(void 0===e.module||null===e.module)return null;const i=this.modules.find(t=>t.id===e.module);return null!==(t=null==i?void 0:i.consumes)&&void 0!==t?t:null}requiredSources(e){var t;if(!e||void 0===e.module||null===e.module)return null;const i=this.modules.find(t=>t.id===e.module);return null!==(t=null==i?void 0:i.requires)&&void 0!==t?t:null}renderMappingSetting(e,t){var i,s;const a=this.mappings[e];if(!a||!this.hass)return V``;const n=a.mappings[t],o=t===Mi?this.etUseOfZones(a.id):{provided:0,calculated:0},r=o.calculated>0&&0===o.provided,l=o.provided>0&&0===o.calculated;return V`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${di(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`,this.hass.language)}
        </div>
        ${this.renderSourceHint(t)}
        ${this._selectRow(di("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,t,n),i=>this.handleSimpleSourceChange(e,t,i))}
        ${r?V`<div class="weather-note">
              ${di("panels.mappings.cards.mapping.et_unused",this.hass.language)}
            </div>`:""}
        ${l?V`<div class="weather-note">
              ${di("panels.mappings.cards.mapping.et_needed",this.hass.language)}
            </div>`:""}
        ${t===Hi&&(null===(i=this.config)||void 0===i?void 0:i.use_weather_service)&&(null===(s=this.config)||void 0===s?void 0:s.weather_service)===Ri&&n[Ji]===Ui?V`<div class="weather-note">
              ${di("panels.mappings.cards.mapping.rain_not_from_entity",this.hass.language)}
            </div>`:""}
        ${this.renderMappingInputs(e,t,n)}
      </div>
    `}etUseOfZones(e){var t;let i=0,s=0;for(const a of this.zones){if(a.mapping!==e)continue;const n=null===(t=this.modules.find(e=>e.id===a.module))||void 0===t?void 0:t.name;n&&("Passthrough"===n?i+=1:s+=1)}return{provided:i,calculated:s}}renderSourceHint(e){var t,i,s;if(!this.hass)return V``;const a=di(e===Hi&&!!(null===(t=this.config)||void 0===t?void 0:t.use_weather_service)&&Pi.includes(null!==(s=null===(i=this.config)||void 0===i?void 0:i.weather_service)&&void 0!==s?s:"")?"panels.mappings.cards.mapping.rain_hint_entity":`panels.mappings.cards.mapping.hints.${e.toLowerCase()}`,this.hass.language);return a?V`<div class="setting-hint">${a}</div>`:V``}renderSimpleRadioOptions(e,t,i){var s;if(!this.hass||!this.config)return V``;const a=t===Mi||t===Di,n=i[Ji],o=t===Ci,r=this.config.weather_service===Ri&&t===Hi,l=!(!this.config.use_weather_service||o||r&&n!==Ui),d=this.requiredSources(this.mappings[e]),h=null!==d&&!d.includes(t),c=a||o||r||function(e,t,i){return t===qi||null!==i&&!i.includes(e)}(t,n,d),u=t===Ci||t===Hi,p=t===Mi?this.etUseOfZones(null===(s=this.mappings[e])||void 0===s?void 0:s.id):{provided:0,calculated:0},g=p.provided>0&&0===p.calculated&&n!==qi,m=a&&this.config.weather_service!==ji;return V`
      ${l?V`<option
            value="${Ui}"
            ?selected=${n===Ui}
            ?disabled=${r}
          >
            ${di(t===Mi?"panels.mappings.cards.mapping.sources.weather_service_et":"panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${m?" (via Open-Meteo)":""}
          </option>`:""}
      ${c?V`<option
            value="${qi}"
            ?selected=${n===qi}
            ?disabled=${g}
          >
            ${di(t===Mi?"panels.mappings.cards.mapping.sources.none_et":h&&!u?"panels.mappings.cards.mapping.sources.none_estimated":"panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${Bi}"
        ?selected=${n===Bi}
      >
        ${di(t===Di?"panels.mappings.cards.mapping.sources.radiation_sensor":"panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      ${t===Di?V`<option
            value="${Wi}"
            ?selected=${n===Wi}
          >
            ${di("panels.mappings.cards.mapping.sources.illuminance",this.hass.language)}
          </option>`:""}
      <option
        value="${Fi}"
        ?selected=${n===Fi}
      >
        ${di("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
    `}handleSimpleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ji]:a,[Ki]:""})})}))}handleSimpleInputChange(e,t,i,s){const a=this.mappings[e],n=s.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},a),{mappings:Object.assign(Object.assign({},a.mappings),{[t]:Object.assign(Object.assign({},a.mappings[t]),{[i]:n})})}))}renderSourceOptions(e,t,i){var s;if(!this.hass)return V``;const a=`${t}_${e}`,n=t===Mi||t===Di,o=!!(null===(s=this.config)||void 0===s?void 0:s.use_weather_service);return V`
      <div class="mappingsettingline">
        <label for="${a}_source">
          ${di("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${o?this.renderWeatherServiceOption(e,t,i):""}
        ${n?this.renderNoneOption(e,t,i):""}
        ${this.renderSensorOption(e,t,i)}
        ${this.renderStaticValueOption(e,t,i)}
      </div>
    `}renderWeatherServiceOption(e,t,i){if(!this.hass||!this.config)return V``;const s=`${t}_${e}`,a=!this.config.use_weather_service,n=this.config.use_weather_service&&i[Ji]===Ui,o=(t===Mi||t===Di)&&this.config.weather_service!==ji;return V`
      <label class="${a?"strikethrough":""}">
        <input
          type="radio"
          id="${s}_weather"
          value="${Ui}"
          name="${s}_source"
          ?checked="${n}"
          ?disabled="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${di("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${o?" (via Open-Meteo)":""}
      </label>
    `}renderNoneOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Ji]===qi;return V`
      <label>
        <input
          type="radio"
          id="${s}_none"
          value="${qi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${di("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Ji]===Bi;return V`
      <label>
        <input
          type="radio"
          id="${s}_sensor"
          value="${Bi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${di("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Ji]===Fi;return V`
      <label>
        <input
          type="radio"
          id="${s}_static"
          value="${Fi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${di("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ji]:a,[Ki]:""})})}))}renderMappingInputs(e,t,i){var s;if(!this.hass)return V``;const a=i[Ji];return V`
      ${a===Bi||a===Wi?this.renderSensorInput(e,t,i):""}
      ${a===Fi?this.renderStaticValueInput(e,t,i):""}
      ${a===Bi||a===Fi?this.renderUnitSelect(e,t,i):""}
      ${t!==Ei||a!==Bi&&a!==Fi?"":this.renderPressureTypeSelect(e,t,i)}
      ${t!==Ii||a!==Bi||"advanced"!==(null===(s=this.config)||void 0===s?void 0:s.ui_mode)&&!Number.isFinite(i[Vi])?"":this.renderWindHeightInput(e,t,i)}
      ${a===Bi||a===Wi?this.renderAggregateSelect(e,t,i):""}
    `}renderWindHeightInput(e,t,i){var s;return this.hass?this._numRow(di("panels.mappings.cards.mapping.wind_height",this.hass.language),"m",null!==(s=i[Vi])&&void 0!==s?s:"",i=>{const s=this.mappings[e],a=parseFloat(i);this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Vi]:Number.isFinite(a)?a:null})})}))},.5):V``}renderSensorInput(e,t,i){return this.hass?V`
      <div class="setting-row">
        <div class="setting-label">
          ${di("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${i[Ki]||""}
          allow-custom-entity
          @value-changed=${i=>{var s;return this.handleSensorChange(e,t,{target:{value:(null===(s=i.detail)||void 0===s?void 0:s.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:V``}renderStaticValueInput(e,t,i){return this.hass?this._numRow(di("panels.mappings.cards.mapping.static_value",this.hass.language),"",i[Xi]||"",i=>this.handleStaticValueChange(e,t,{target:{value:i}}),.1):V``}renderUnitSelect(e,t,i){if(!this.hass||!this.config)return V``;const s=this.reportedUnit(t,i);return!s||i[Qi]&&i[Qi]!==s?this._selectRow(di("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(t,i),i=>this.handleUnitChange(e,t,i)):V``}reportedUnit(e,t){var i,s,a,n,o;if(t[Ji]!==Bi)return;const r=(t[Ki]||"").trim(),l=null===(n=null===(a=null===(s=null===(i=this.hass)||void 0===i?void 0:i.states)||void 0===s?void 0:s[r])||void 0===a?void 0:a.attributes)||void 0===n?void 0:n.unit_of_measurement;if(!l)return;const d=null!==(o={"W/m²":"W/m2","m/s":"meter/s",mph:"mile/h",kn:"knot",inHg:"inch Hg",mbar:"millibar"}[l])&&void 0!==o?o:l;return fa(e).some(e=>e.unit===d)?d:void 0}renderPressureTypeSelect(e,t,i){return this.hass?this._selectRow(di("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(t,i),i=>this.handlePressureTypeChange(e,t,i)):V``}renderAggregateSelect(e,t,i){var s;return this.hass?"advanced"!==(null===(s=this.config)||void 0===s?void 0:s.ui_mode)?V``:V`
      <div class="setting-row">
        <div class="setting-label">
          ${di("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${i=>this.handleAggregateChange(e,t,i)}"
          >
            ${this.renderAggregateOptionsForMapping(t,i)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Ua}></path>
          </svg>
        </div>
      </div>
    `:V``}handleSensorChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ki]:i.target.value})})}))}handleStaticValueChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Xi]:i.target.value})})}))}handleUnitChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Qi]:i.target.value})})}))}handlePressureTypeChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Yi]:i.target.value})})}))}handleAggregateChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[es]:i.target.value})})}))}renderAggregateOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;let i="average";return e===Ci&&(i="delta"),e===Hi&&(i="average"),t[es]&&(i=t[es]),V`
      ${ts.map(e=>this.renderAggregateOption(e,i))}
    `}renderAggregateOption(e,t){if(this.hass&&this.config){return V`<option value="${e}" ?selected="${e===t}">
        ${di("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return V``}renderPressureTypes(e,t){if(this.hass&&this.config){let e=V``;const i=t[Yi];return e=V`${e}
        <option
          value="${Zi}"
          ?selected="${i===Zi}"
        >
          ${di("panels.mappings.cards.mapping.pressure_types."+Zi,this.hass.language)}
        </option>
        <option
          value="${Gi}"
          ?selected="${i===Gi}"
        >
          ${di("panels.mappings.cards.mapping.pressure_types."+Gi,this.hass.language)}
        </option>`,e}return V``}renderUnitOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;const i=fa(e);let s=t[Qi];const a=this.config.units;if(!t[Qi])for(const e of i)if("string"==typeof e.system){if(a===e.system){s=e.unit;break}}else{for(const t of e.system)if(a===t.system){s=e.unit;break}if(s===e.unit)break}return V`
      ${i.map(e=>V`
          <option value="${e.unit}" ?selected="${s===e.unit}">
            ${e.unit}
          </option>
        `)}
    `}_textRow(e,t,i,s){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
        </div>
        <input
          class="field"
          type="text"
          .value=${null==i?"":String(i)}
          @change=${e=>s(e.target.value)}
        />
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1){const o=(String(a).split(".")[1]||"").length,r=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(o);e.value=String(n),s(String(n))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
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
            .path=${Ba}
            ?disabled=${n}
            @click=${e=>r(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ya}
            ?disabled=${n}
            @click=${e=>r(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_selectRow(e,t,i,s=!1){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" ?disabled=${s} @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Ua}></path>
          </svg>
        </div>
      </div>
    `}_actionBtn(e,t,i,s=!1,a=!1){return V`
      <ha-button
        appearance=${s?"outlined":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}_n(e,t){var i,s;return ea(e,t,null===(i=this.hass)||void 0===i?void 0:i.locale,null===(s=this.hass)||void 0===s?void 0:s.language)}render(){return this.hass?this.isLoading?V`
        <ha-card
          header="${di("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${di("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("panels.mappings.title",this.hass.language)}<si-info
              >${di("panels.mappings.description",this.hass.language)}</si-info
            ></span
          >
        </h1>
      </ha-card>

      ${this.renderMappingsList()} ${this._renderAddMapping()}
    `:V``}_renderAddMapping(){const e=this.hass.language,t=0===this.mappings.length;return t||this._addOpen?V`
      <ha-card
        header="${di("panels.mappings.cards.add-mapping.header",e)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("panels.mappings.labels.mapping-name",e)}
            </div>
            <input
              id="mappingNameInput"
              class="field"
              type="text"
              @input=${e=>{this.newMappingName=e.target.value}}
            />
          </div>
          <div class="si-form-actions">
            ${t?"":V`<ha-button
                  appearance="plain"
                  @click=${()=>{this._addOpen=!1}}
                >
                  ${di("panels.mappings.cards.add-mapping.actions.cancel",e)}
                </ha-button>`}
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving||!this.newMappingName.trim()}"
            >
              <ha-svg-icon slot="start" .path=${Ya}></ha-svg-icon>
              ${this.isSaving?di("common.saving-messages.adding",e):di("panels.mappings.cards.add-mapping.actions.add",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>
    `:V`
        <div class="add-group-bar">
          <ha-button
            appearance="outlined"
            @click=${()=>this._openAddMapping()}
          >
            <ha-svg-icon slot="start" .path=${Ya}></ha-svg-icon>
            ${di("panels.mappings.cards.add-mapping.header",e)}
          </ha-button>
        </div>
      `}_openAddMapping(){this._addOpen=!0,this.updateComplete.then(()=>{const e=this.mappingNameInput;null==e||e.scrollIntoView({block:"center",behavior:"smooth"}),null==e||e.focus({preventScroll:!0})})}renderMappingsList(){const{shown:e,hidden:t}=function(e,t,i=10){const s=t?e:e.slice(0,i);return{shown:s,hidden:e.length-s.length}}(this.mappings,this.showAllMappings);return V`
      ${vo(e,e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name},(e,t)=>this.renderMappingCard(e,t))}
      ${t>0?V`
            <div class="si-form-actions">
              ${this._actionBtn(Ya,di("panels.mappings.labels.show-more",this.hass.language,"{count}",t),()=>this.loadMoreMappings())}
            </div>
          `:""}
    `}renderMappingCard(e,t){if(!this.hass)return V``;const i=this.hass.language,s=this.zones.filter(t=>t.mapping===e.id).length,a=(e,t)=>di(`panels.mappings.summary.${t}-${1===e?"one":"other"}`,i).replace("{n}",String(e)),n=[a(this._shownSettings(e).settingsEntries.map(([,e])=>e).filter(e=>{const t="string"==typeof e?e:null==e?void 0:e.source;return!!t&&t!==qi}).length,"sources")];s&&n.push(a(s,"zones"));const o=n.join(" · "),r=null!=e.id&&this._expanded.has(e.id);return V`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${r?"true":"false"}
          @click=${()=>this._toggleItem(e.id)}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleItem(e.id))}}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${$a(e,this.mappings)}</span
              >
            </div>
            <div class="si-sub">${o}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${r?"open":""}"
            .path=${Da}
          ></ha-svg-icon>
        </div>
        ${r?V`<div class="si-body">
              <div class="settings">
                ${this._textRow(di("panels.mappings.labels.mapping-name",i),"",e.name,i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i})))}
                <div class="setting-row">
                  <div class="setting-label">
                    ${di("panels.mappings.cards.mapping.greenhouse",i)}
                  </div>
                  <ha-switch
                    .checked=${!!e.greenhouse}
                    @change=${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:i.target.checked}))}
                  ></ha-switch>
                </div>
                ${e.greenhouse?V`<div class="weather-note">
                      ${di("panels.mappings.cards.mapping.greenhouse_description",i)}
                    </div>`:""}
                ${this.renderMappingSettings(e,t)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${s?V`<div class="weather-note">
                      ${di("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",i)}
                    </div>`:this._actionBtn(Ra,di("common.actions.delete",i),e=>this.handleRemoveMapping(e,t),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}_shownSettings(e){var t;const i="advanced"===(null===(t=this.config)||void 0===t?void 0:t.ui_mode),s=Object.entries(e.mappings).filter(([t])=>(!e.greenhouse||t!==Ci&&t!==Hi)&&(i||t!==Ci||!(t=>{const i=e.mappings[t],s="string"==typeof i?i:null==i?void 0:i[Ji];return!s||s===qi})(t))),a=e.mappings[Mi],n="string"==typeof a?a:null==a?void 0:a[Ji],o=!!n&&n!==qi,r=(l=this.etUseOfZones(e.id),d=o,l.calculated+l.provided>0?0===l.calculated:d);var l,d;const h=s.filter(([e])=>!r||e===Mi||e===Ci||e===Hi).sort(([e],[t])=>Number(t===Mi)-Number(e===Mi));return{afterGreenhouse:s,settingsEntries:h,provided:o}}renderMappingSettings(e,t){const{afterGreenhouse:i,settingsEntries:s,provided:a}=this._shownSettings(e),n=i.length-s.length,o=this.hass.language,r=t=>this.zones.filter(t=>t.mapping===e.id).filter(e=>{var i;const s=null===(i=this.modules.find(t=>t.id===e.module))||void 0===i?void 0:i.name;return!!s&&t(s)}).map(e=>e.name).join(", "),l=this.etUseOfZones(e.id).provided>0,d=a&&l?r(e=>"Passthrough"!==e):"",h=a?"":r(e=>"Passthrough"===e),c=V`
      ${d?V`<div class="weather-note">
            ${di("panels.mappings.cards.mapping.et_ignored",o).replace("{zones}",d)}
          </div>`:""}
      ${h?V`<div class="weather-note">
            ${di("panels.mappings.cards.mapping.et_missing",o).replace("{zones}",h)}
          </div>`:""}
    `;return V`
      ${s.map(([e])=>V`${this.renderMappingSetting(t,e)}${e===Mi?c:""}`)}
      ${n>0?V`<div class="weather-note">
            ${di("panels.mappings.cards.mapping.hidden_sources",o).replace("{n}",String(n))}
          </div>`:""}
    `}loadMoreMappings(){this.showAllMappings=!0,this._scheduleUpdate()}static get styles(){return l`
      ${Gn} ${Kn}

      .add-group-bar {
        display: flex;
        justify-content: flex-end;
        margin: 8px;
      }
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
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach(e=>{clearTimeout(e)}),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};i([fe()],No.prototype,"config",void 0),i([fe({type:Array})],No.prototype,"zones",void 0),i([fe({type:Array})],No.prototype,"mappings",void 0),i([fe({type:Map})],No.prototype,"weatherRecords",void 0),i([fe({type:Boolean})],No.prototype,"isLoading",void 0),i([fe({type:Boolean})],No.prototype,"isSaving",void 0),i([fe({type:String})],No.prototype,"newMappingName",void 0),i([ve()],No.prototype,"_addOpen",void 0),i([fe({type:Array})],No.prototype,"modules",void 0),i([_e("#mappingNameInput")],No.prototype,"mappingNameInput",void 0),No=i([pe("smart-irrigation-view-mappings")],No);const Io=()=>{const e=e=>{let t={};for(let i=0;i<e.length;i+=2){const s=e[i],a=i<e.length?e[i+1]:void 0;t=Object.assign(Object.assign({},t),{[s]:a})}return t},t=window.location.pathname.split("/");let i={page:t[2]||"info",params:{}};if(t.length>3){let s=t.slice(3);if(t.includes("filter")){const t=s.findIndex(e=>"filter"==e),a=s.slice(t+1);s=s.slice(0,t),i=Object.assign(Object.assign({},i),{filter:e(a)})}s.length&&(s.length%2&&(i=Object.assign(Object.assign({},i),{subpage:s.shift()})),s.length&&(i=Object.assign(Object.assign({},i),{params:e(s)})))}return i},jo=(e,...t)=>{let i={page:e,params:{}};t.forEach(e=>{"string"==typeof e?i=Object.assign(Object.assign({},i),{subpage:e}):"params"in e?i=Object.assign(Object.assign({},i),{params:e.params}):"filter"in e&&(i=Object.assign(Object.assign({},i),{filter:e.filter}))});const s=e=>{let t=Object.keys(e);t=t.filter(t=>e[t]),t.sort();let i="";return t.forEach(t=>{const s=e[t];i=i.length?`${i}/${t}/${s}`:`${t}/${s}`}),i};let a=`/${gi}/${i.page}`;return i.subpage&&(a=`${a}/${i.subpage}`),s(i.params).length&&(a=`${a}/${s(i.params)}`),i.filter&&(a=`${a}/filter/${s(i.filter)}`),a},Ro={[Ni]:{unit:ns,decimals:1},[Ai]:{unit:ns,decimals:1},[Oi]:{unit:ns,decimals:1},[Si]:{unit:ns,decimals:1},[Ti]:{unit:"%",decimals:0},[Ei]:{unit:"hPa",decimals:0},[Ii]:{unit:ls,decimals:1},[Di]:{unit:ds,decimals:2},[Ci]:{unit:os,decimals:2},[Hi]:{unit:hs,decimals:2},[Mi]:{unit:os,decimals:2}};let Lo=class extends ce{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._entity="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1,this._rainGroups=[],this._historyLoading=!1,this._historyError=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)}),this._load()}async _load(){if(this.hass){try{const e=await Qa(this.hass);this._info=e,this._use=!!e.use_weather_service,this._service=e.weather_service||(e.services&&e.services.includes(ji)?ji:e.services&&e.services.length?e.services[0]:null),this._apiKey=e.weather_service_api_key||"",this._entity=e.weather_service_entity||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}this._loadHistory()}}async _loadHistory(){if(this.hass){this._historyLoading=!0;try{this._history=await((e,t=20)=>e.callWS({type:gi+"/weatherservice_history",limit:t}))(this.hass,20),this._historyError=""}catch(e){this._historyError=this._errText(e)}finally{this._historyLoading=!1}}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1,this._rainGroups=[];try{await(e=this.hass,t={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null,weather_service_entity:this._use&&this._service===Ri?this._entity:null},e.callWS(Object.assign({type:gi+"/set_weatherservice"},t))),this._saved=!0,this._rainGroups=await this._groupsLeftWithoutRain(),window.setTimeout(()=>this._load(),800)}catch(e){this._error="invalid_entity"===(null==e?void 0:e.code)?di("panels.weatherservice.messages.invalid-entity",this.hass.language):this._errText(e)}finally{this._saving=!1}var e,t}}get _entityMissing(){return this._use&&this._service===Ri&&!this._entity}async _groupsLeftWithoutRain(){var e;if(!this.hass||!this._use||!Pi.includes(null!==(e=this._service)&&void 0!==e?e:""))return[];try{return(await on(this.hass)).filter(e=>!e.greenhouse&&[Hi,Ci].some(t=>{var i,s;return(null===(s=null===(i=e.mappings)||void 0===i?void 0:i[t])||void 0===s?void 0:s.source)===Ui})).map(e=>e.name)}catch(e){return console.error("Weather service: could not read the sensor groups",e),[]}}_n(e,t){var i,s;return ea(e,t,null===(i=this.hass)||void 0===i?void 0:i.locale,null===(s=this.hass)||void 0===s?void 0:s.language)}render(){var e,t,i;if(!this.hass)return V``;const s=this.hass.language;return this._loading&&!this._info?V`
        <ha-card header="${di("panels.weatherservice.title",s)}">
          <div class="card-content">
            ${di("common.loading-messages.general",s)}...
          </div>
        </ha-card>
      `:V`
      <ha-card>
        <h1 class="card-header">
          <span
            >${di("panels.weatherservice.title",s)}<si-info
              >${di("panels.weatherservice.description",s)}</si-info
            ></span
          >
        </h1>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${di("panels.weatherservice.labels.use-weather-service",s)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?V`
                <div class="setting-row">
                  <div class="setting-label">
                    ${di("panels.weatherservice.labels.service",s)}
                  </div>
                  <div class="select-wrap">
                    <select
                      class="field"
                      @change=${e=>{this._service=e.target.value,this._saved=!1}}
                    >
                      ${((null===(e=this._info)||void 0===e?void 0:e.services)||[]).map(e=>V`<option
                            value="${e}"
                            ?selected=${this._service===e}
                          >
                            ${e===Ri?di("panels.weatherservice.labels.ha-weather-entity",s):e}
                          </option>`)}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Ua}></path>
                    </svg>
                  </div>
                </div>
                ${this._service&&Li.includes(this._service)?"":V`<div class="setting-row">
                      <div class="setting-label">
                        ${di("panels.weatherservice.labels.api-key",s)}
                      </div>
                      <input
                        class="field"
                        type="text"
                        autocomplete="off"
                        .value=${this._apiKey}
                        @change=${e=>{this._apiKey=e.target.value,this._saved=!1}}
                      />
                    </div>`}
                ${this._service===Ri?V`<div class="setting-row">
                        <div class="setting-label">
                          ${di("panels.weatherservice.labels.weather-entity",s)}
                        </div>
                        <ha-entity-picker
                          class="entity-field"
                          .hass=${this.hass}
                          .value=${this._entity}
                          .includeDomains=${["weather"]}
                          @value-changed=${e=>{var t;this._entity=(null===(t=e.detail)||void 0===t?void 0:t.value)||"",this._saved=!1}}
                        ></ha-entity-picker>
                      </div>
                      <div class="ws-note ws-note--hint">
                        ${di("panels.weatherservice.messages.ha-entity-hint",s)}
                      </div>`:""}
                ${"Open Weather Map"===this._service?V`<div class="ws-note ws-note--hint">
                      ${di("panels.weatherservice.messages.owm-onecall-hint",s)}
                    </div>`:""}
              `:V`<div class="ws-note">
                ${di("panels.weatherservice.messages.no-service",s)}
              </div>`}
          ${this._error?V`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?V`<div class="ws-msg ws-msg--success">
                ${di("panels.weatherservice.messages.saved",s)}
              </div>`:""}
          ${this._saved&&this._rainGroups.length?V`<div class="ws-msg ws-msg--warning">
                ${di("panels.weatherservice.messages.rain-groups-on-service",s,"{count}",this._rainGroups.length,"{groups}",this._rainGroups.join(", "))}
                <div class="ws-msg-actions">
                  <ha-button
                    appearance="plain"
                    @click=${()=>_a(0,jo("mappings"))}
                  >
                    ${di("panels.weatherservice.actions.open-sensor-groups",s)}
                  </ha-button>
                </div>
              </div>`:""}
          ${this._use||(null===(t=this._info)||void 0===t?void 0:t.use_weather_service)?this._renderSave(s):""}
        </div>
        ${(null===(i=this._info)||void 0===i?void 0:i.use_weather_service)?this._renderHistory(s):""}
      </ha-card>
    `}_renderSave(e){return V`
      <div class="ws-actions">
        <ha-button
          appearance="filled"
          ?disabled=${this._saving||this._entityMissing}
          @click=${this._save}
        >
          ${this._saving?di("panels.weatherservice.actions.saving",e):di("panels.weatherservice.actions.save",e)}
        </ha-button>
      </div>
      ${this._use?V`<div class="ws-note ws-reload-note">
            ${di(this._service===Ri?"panels.weatherservice.messages.reload-note-entity":"panels.weatherservice.messages.reload-note",e)}
          </div>`:""}
    `}_renderHistory(e){var t,i;const s=(null===(t=this._history)||void 0===t?void 0:t.records)||[],a=((null===(i=this._history)||void 0===i?void 0:i.fields)||[]).filter(e=>s.some(t=>t.values&&void 0!==t.values[e]&&null!==t.values[e])),n=new Set(s.map(e=>e.mapping_name)).size>1,o=["minmax(120px, auto)",...n?["minmax(100px, auto)"]:[],...a.map(()=>"minmax(76px, 1fr)")].join(" "),r=s.length?this._formatTime(s[0]):"";return V`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <h4>${di("panels.weatherservice.history.title",e)}</h4>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${Va}></ha-svg-icon>
            ${di("panels.weatherservice.history.refresh",e)}
          </ha-button>
        </div>
        ${r?V`<div class="ws-note ws-history-last">
              ${di("panels.weatherservice.history.last-update",e)}:
              ${r}
            </div>`:""}
        ${this._historyError?V`<div class="ws-msg ws-msg--error">${this._historyError}</div>`:0===s.length?V`<div class="ws-note">
                ${this._historyLoading?di("common.loading-messages.general",e)+"...":di("panels.weatherservice.history.no-data",e)}
              </div>`:V`
                <div class="ws-history-scroll">
                  <div
                    class="weather-table"
                    style="grid-template-columns: ${o};"
                  >
                    <div class="weather-header">
                      <span
                        >${di("panels.weatherservice.history.time",e)}</span
                      >
                      ${n?V`<span
                            >${di("panels.weatherservice.history.sensor-group",e)}</span
                          >`:""}
                      ${a.map(t=>{var i;return V`<span
                            >${di("panels.mappings.cards.mapping.items."+t.toLowerCase(),e)}
                            <span class="ws-history-unit"
                              >${(null===(i=Ro[t])||void 0===i?void 0:i.unit)||""}</span
                            ></span
                          >`})}
                    </div>
                    ${s.map(e=>V`
                        <div class="weather-row">
                          <span>${this._formatTime(e)}</span>
                          ${n?V`<span>${e.mapping_name||"-"}</span>`:""}
                          ${a.map(t=>{var i;return V`<span
                                >${this._formatValue(t,null===(i=e.values)||void 0===i?void 0:i[t])}</span
                              >`})}
                        </div>
                      `)}
                  </div>
                </div>
              `}
      </div>
    `}_formatTime(e){if(!e.retrieved)return"-";const t=Ao(e.retrieved);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}_formatValue(e,t){var i,s;return null==t||isNaN(t)?"-":this._n(t,null!==(s=null===(i=Ro[e])||void 0===i?void 0:i.decimals)&&void 0!==s?s:1)}static get styles(){return l`
      ${Gn} ${Kn}

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
      .ws-msg--warning {
        background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.16);
        color: var(--primary-text-color);
      }
      .ws-msg-actions {
        margin-top: 6px;
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
    `}};i([fe()],Lo.prototype,"narrow",void 0),i([fe()],Lo.prototype,"path",void 0),i([ve()],Lo.prototype,"_info",void 0),i([ve()],Lo.prototype,"_use",void 0),i([ve()],Lo.prototype,"_service",void 0),i([ve()],Lo.prototype,"_apiKey",void 0),i([ve()],Lo.prototype,"_entity",void 0),i([ve()],Lo.prototype,"_loading",void 0),i([ve()],Lo.prototype,"_saving",void 0),i([ve()],Lo.prototype,"_error",void 0),i([ve()],Lo.prototype,"_saved",void 0),i([ve()],Lo.prototype,"_rainGroups",void 0),i([ve()],Lo.prototype,"_history",void 0),i([ve()],Lo.prototype,"_historyLoading",void 0),i([ve()],Lo.prototype,"_historyError",void 0),Lo=i([pe("smart-irrigation-view-weatherservice")],Lo);const Po=10,Uo=8,Bo=26,Fo=46;let Wo=class extends(vn(ce)){constructor(){super(...arguments),this._records=[],this._loading=!0,this._error=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial history:",e)}),[this.hass.connection.subscribeMessage(()=>{this._fetchData().catch(e=>{console.error("Failed to refresh history:",e)})},{type:gi+"_config_updated"})]}_source(e){var t,i,s;const a=null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en",n=e.program_id;if(!n)return"";if("manual"===n)return di("panels.history.table.by_hand",a);const o=((null===(s=this._config)||void 0===s?void 0:s.programs)||[]).find(e=>e.id===n);return(null==o?void 0:o.name)||n}async _fetchData(){if(this.hass)try{const[e,t]=await Promise.all([Ka(this.hass),hn(this.hass,500)]);this._config=e,this._records=(null==t?void 0:t.records)||[],this._error=""}catch(e){this._error=(null==e?void 0:e.message)||(null==e?void 0:e.code)||String(e)}finally{this._loading=!1}}_chartDays(){const e=Ao().startOf("day").subtract(29,"days"),t=[];for(let i=0;i<30;i++)t.push(e.clone().add(i,"days").format("YYYY-MM-DD"));return t}_daily(e,t){const i=new Map(e.map(e=>[e,0]));for(const e of this._records){if(!e.start||t&&!t(e))continue;const s=Ao(e.start);if(!s.isValid())continue;const a=s.format("YYYY-MM-DD");i.has(a)&&i.set(a,i.get(a)+pa(e.water_used,this._config))}return e.map(e=>({key:e,value:i.get(e)}))}_chartedZones(e){const t=e[0],i=new Map;for(const e of this._records){if(!e.start)continue;const s=Ao(e.start);if(!s.isValid()||s.format("YYYY-MM-DD")<t)continue;const a=null!==e.zone_id?`#${e.zone_id}`:e.zone_name||"?";i.has(a)||i.set(a,{id:e.zone_id,name:e.zone_name||a})}return[...i.values()].sort((e,t)=>e.name.localeCompare(t.name))}_n(e,t){var i,s;return ea(e,t,null===(i=this.hass)||void 0===i?void 0:i.locale,null===(s=this.hass)||void 0===s?void 0:s.language)}render(){if(!this.hass)return V``;const e=this.hass.language;if(this._loading)return V`
        <ha-card header="${di("panels.history.title",e)}">
          <div class="card-content">
            ${di("common.loading-messages.general",e)}...
          </div>
        </ha-card>
      `;const t=this._chartDays(),i=this._chartedZones(t);return V`
      <ha-card header="${di("panels.history.title",e)}">
        <div class="card-content">
          <div class="history-intro">
            ${di("panels.history.description",e)}
          </div>
          ${this._error?V`<div class="history-msg history-msg--error">
                ${this._error}
              </div>`:""}
          <div class="history-actions">
            <ha-button appearance="plain" @click=${()=>this._fetchData()}>
              <ha-svg-icon slot="start" .path=${Va}></ha-svg-icon>
              ${di("panels.history.refresh",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <!-- The config carries the unit system, so without it the volumes would
           be unlabelled: show the error above on its own instead. -->
      ${this._config?V`${this._renderTable(e)} ${this._renderTotalChart(e,t)}
          ${this._renderZoneCharts(e,t,i)}`:""}
    `}_renderTable(e){const t=this._records.slice(0,100),i=da(this._config,vs);return V`
      <ha-card header="${di("panels.history.table.title",e)}">
        <div class="card-content">
          ${0===t.length?V`<div class="history-note">
                ${di("panels.history.no-data",e)}
              </div>`:V`
                <div class="history-scroll">
                  <div class="history-table">
                    <div class="history-header">
                      <span
                        >${di("panels.history.table.start",e)}</span
                      >
                      <span
                        >${di("panels.history.table.zone",e)}</span
                      >
                      <span
                        >${di("panels.history.table.duration",e)}</span
                      >
                      <span
                        >${di("panels.history.table.water",e)}
                        <span class="history-unit">(${i})</span></span
                      >
                    </div>
                    ${t.map(e=>V`
                        <div class="history-row">
                          <span>${this._formatStart(e.start)}</span>
                          <span
                            >${e.zone_name||"-"}${this._source(e)?V`<span class="history-source"
                                  >${this._source(e)}</span
                                >`:""}</span
                          >
                          <span>${ha(e.duration)}</span>
                          <span
                            >${this._n(pa(e.water_used,this._config),1)}</span
                          >
                        </div>
                      `)}
                  </div>
                </div>
                ${this._records.length>100?V`<div class="history-note">
                      ${di("panels.history.table.truncated",e,"{count}",100,"{total}",this._records.length)}
                    </div>`:""}
              `}
        </div>
      </ha-card>
    `}_renderTotalChart(e,t){const i=this._daily(t);return V`
      <ha-card header="${di("panels.history.charts.total-title",e)}">
        <div class="card-content">${this._renderChart(i,e)}</div>
      </ha-card>
    `}_renderZoneCharts(e,t,i){return 0===i.length?V``:V`
      <ha-card
        header="${di("panels.history.charts.per-zone-title",e)}"
      >
        <div class="card-content">
          ${i.map(i=>{const s=this._daily(t,e=>null!==i.id?e.zone_id===i.id:e.zone_name===i.name);return V`
              <div class="zone-chart">
                <h4>${i.name}</h4>
                ${this._renderChart(s,e)}
              </div>
            `})}
        </div>
      </ha-card>
    `}_renderChart(e,t){const i=da(this._config,vs),s=Math.max(...e.map(e=>e.value),0);if(s<=0)return V`<div class="history-note">
        ${di("panels.history.charts.no-data",t)}
      </div>`;const a=this._niceMax(s),n=200-Po-Bo,o=Po+n,r=(720-Fo-Uo)/e.length,l=Math.max(r-3,1),d=[0,.5,1].map(e=>{const t=o-e*n;return Z`
        <line
          class="grid"
          x1=${Fo}
          y1=${t}
          x2=${720-Uo}
          y2=${t}
        ></line>
        <text class="axis" x=${Fo-6} y=${t+3.5} text-anchor="end">
          ${this._formatAxis(a*e)}
        </text>
      `}),h=e.map((e,t)=>{const i=e.value/a*n;return Z`
        <rect
          class="bar"
          x=${Fo+t*r+(r-l)/2}
          y=${o-i}
          width=${l}
          height=${i}
          rx="1"
        >
          <title>
            ${ra(e.key,this.hass,{dateStyle:"long"})}: ${this._n(e.value,1)}
          </title>
        </rect>
      `}),c=e.map((t,i)=>i%5!=0&&i!==e.length-1?Z``:Z`
        <text
          class="axis"
          x=${Fo+i*r+r/2}
          y=${192}
          text-anchor="middle"
        >
          ${ra(t.key,this.hass,{day:"numeric",month:"short"})}
        </text>
      `);return V`
      <div class="chart-unit">${i}</div>
      <svg
        class="chart"
        viewBox="0 0 ${720} ${200}"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        ${d} ${h} ${c}
      </svg>
    `}_niceMax(e){const t=Math.pow(10,Math.floor(Math.log10(e))),i=e/t;return(i<=1?1:i<=2?2:i<=5?5:10)*t}_formatAxis(e){return e>=100?this._n(e,0):this._n(e,1)}_formatStart(e){return e?ra(e,this.hass,function(e,t=new Date){const i={day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"},s=new Date(e);return isNaN(s.getTime())||s.getFullYear()===t.getFullYear()||(i.year="2-digit"),i}(e)):"-"}static get styles(){return l`
      ${Gn} ${Kn}

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

      /* Four columns fit a phone: the zone takes what is left and wraps. The
         table scrolls sideways only if even that is too wide. */
      .history-scroll {
        overflow-x: auto;
      }
      .history-table {
        display: grid;
        grid-template-columns: auto minmax(64px, 1fr) auto auto;
        gap: 8px;
        font-size: 0.85em;
        width: 100%;
        min-width: min-content;
      }
      .history-row span:not(:nth-child(2)) {
        white-space: nowrap;
      }
      .history-row span:last-child,
      .history-header span:last-child {
        text-align: end;
      }
      .history-source {
        display: block;
        font-size: 0.85em;
        color: var(--secondary-text-color);
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
    `}};i([fe()],Wo.prototype,"narrow",void 0),i([fe()],Wo.prototype,"path",void 0),i([ve()],Wo.prototype,"_config",void 0),i([ve()],Wo.prototype,"_records",void 0),i([ve()],Wo.prototype,"_loading",void 0),i([ve()],Wo.prototype,"_error",void 0),Wo=i([pe("smart-irrigation-view-history")],Wo);let Yo=class extends ce{constructor(){super(...arguments),this._busy=!1,this._error="",this._message="",this._pendingName=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}_reset(){this._error="",this._message="",this._pending=void 0,this._pendingName=""}async _export(){if(this.hass){this._reset(),this._busy=!0;try{const t=await(e=this.hass,e.callApi("GET",gi+"/export")),i=JSON.stringify(t,null,2),s=new Blob([i],{type:"application/json"}),a=URL.createObjectURL(s),n=document.createElement("a");n.href=a;const o=(new Date).toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");n.download=`smart_irrigation_backup_${o}.json`,n.click(),URL.revokeObjectURL(a),this._message=di("panels.backuprestore.messages.exported",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e}}async _onFile(e){this._reset();const t=e.target,i=t.files&&t.files[0];if(i)try{const e=await i.text(),t=JSON.parse(e);if(!t||"object"!=typeof t||!t.config)throw new Error(di("panels.backuprestore.messages.invalid-file",this.hass.language));this._pending=t,this._pendingName=i.name}catch(e){this._error=this._errText(e)}finally{t.value=""}}async _restore(){if(this.hass&&this._pending){this._busy=!0,this._error="",this._message="";try{const i=await(e=this.hass,t=this._pending,e.callApi("POST",gi+"/restore",t));if(i&&!1===i.success)throw new Error(i.error||"restore failed");this._pending=void 0,this._pendingName="",this._message=di("panels.backuprestore.messages.restored",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e,t}}_count(e){const t=this._pending&&this._pending[e];return Array.isArray(t)?t.length:0}render(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${di("panels.backuprestore.title",e)}">
        <div class="card-content br-description">
          ${di("panels.backuprestore.description",e)}
        </div>
      </ha-card>

      <ha-card
        header="${di("panels.backuprestore.cards.backup.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${di("panels.backuprestore.cards.backup.description",e)}
          </div>
          ${this._message?V`<div class="br-msg br-msg--success">${this._message}</div>`:""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"}></ha-svg-icon>
              ${di("panels.backuprestore.actions.export",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${di("panels.backuprestore.cards.restore.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${di("panels.backuprestore.cards.restore.description",e)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${Ga}></ha-svg-icon>
            ${di("panels.backuprestore.actions.choose-file",e)}
          </label>

          ${this._pending?V`
                <div class="br-warning">
                  <ha-svg-icon .path=${"M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${di("panels.backuprestore.messages.confirm-title",e)}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${di("panels.backuprestore.messages.summary",e)}:
                      ${this._count("zones")}
                      ${di("panels.zones.title",e)} ·
                      ${this._count("modules")}
                      ${di("panels.modules.title",e)} ·
                      ${this._count("mappings")}
                      ${di("panels.mappings.title",e)}
                    </div>
                    <div class="br-warning-text">
                      ${di("panels.backuprestore.messages.confirm-warning",e)}
                    </div>
                  </div>
                </div>
              `:""}
          ${this._error?V`<div class="br-msg br-msg--error">${this._error}</div>`:""}
          ${this._pending?V`<div class="br-actions">
                <ha-button
                  appearance="filled"
                  variant="danger"
                  ?disabled=${this._busy}
                  @click=${this._restore}
                >
                  <ha-svg-icon slot="start" .path=${Ga}></ha-svg-icon>
                  ${this._busy?di("panels.backuprestore.actions.restoring",e):di("panels.backuprestore.actions.restore",e)}
                </ha-button>
              </div>`:""}
          <div class="br-note">
            ${di("panels.backuprestore.messages.reload-note",e)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Gn} ${Kn}

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
    `}};i([fe()],Yo.prototype,"narrow",void 0),i([fe()],Yo.prototype,"path",void 0),i([ve()],Yo.prototype,"_busy",void 0),i([ve()],Yo.prototype,"_error",void 0),i([ve()],Yo.prototype,"_message",void 0),i([ve()],Yo.prototype,"_pending",void 0),i([ve()],Yo.prototype,"_pendingName",void 0),Yo=i([pe("smart-irrigation-view-backuprestore")],Yo);const Vo=e=>{var t;return Date.parse(null!==(t=e.expected_start)&&void 0!==t?t:e.start)};let Zo=class extends(vn(ce)){constructor(){super(...arguments),this.zones=[],this.programsStart=null,this.nextRuns=[],this.isLoading=!0,this._fetchRetries=0,this._live=null,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}disconnectedCallback(){super.disconnectedCallback(),this._liveTimer&&window.clearTimeout(this._liveTimer),this._liveTimer=void 0}async _fetchLive(){if(this._liveTimer&&window.clearTimeout(this._liveTimer),this._liveTimer=void 0,this.hass&&this.isConnected){try{const e=await this.hass.callWS({type:gi+"/programs_state"});this._live=(e=>{var t;const i=null!==(t=null==e?void 0:e.live)&&void 0!==t?t:null;if(!i)return null;const s=new Set((i.programs||[]).map(e=>e.program_id)),a=((null==e?void 0:e.programs)||[]).filter(e=>("running"===(null==e?void 0:e.state)||"paused"===(null==e?void 0:e.state))&&!s.has(e.program_id)).map(e=>({program_id:e.program_id,name:e.name,state:"running"}));return a.length?Object.assign(Object.assign({},i),{programs:[...i.programs||[],...a]}):i})(e)}catch(e){this._live=null}this.isConnected&&(this._liveTimer=window.setTimeout(()=>this._fetchLive(),oa(this._live)?5e3:3e4))}}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),this._fetchLive(),[this.hass.connection.subscribeMessage(()=>{this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)}),this._fetchLive()},{type:gi+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[t,i,s]=await Promise.all([Ka(this.hass),ln(this.hass),en(this.hass)]);if(this.config=t,this.info=i,this.zones=s,this._fetchRetries=0,this.programsStart=null,this.nextRuns=[],!0===(null==t?void 0:t.full_controller))try{const t=await this.hass.callWS({type:gi+"/programs_state"}),i=((null==t?void 0:t.programs)||[]).map(e=>e.next_start).filter(e=>!!e).sort((e,t)=>Date.parse(e)-Date.parse(t));this.programsStart=null!==(e=i[0])&&void 0!==e?e:null;const s=await this.hass.callWS({type:gi+"/planning",days:2});this.nextRuns=((e,t,i=12,s=5)=>{const a=e.filter(e=>Vo(e)>t).sort((e,t)=>Vo(e)-Vo(t));if(!a.length)return[];const n=Vo(a[0]);return a.filter(e=>Vo(e)<n+3600*i*1e3).slice(0,s)})(s||[],Date.now())}catch(e){console.error("Error fetching the programs' next starts:",e)}}catch(e){console.error("Error fetching data:",e),this._fetchRetries<10&&(this._fetchRetries+=1,setTimeout(()=>{this._fetchData().catch(()=>{})},3e3))}finally{this.isLoading=!1,this._scheduleUpdate()}}_href(e){return`/${gi}/${e}`}_open(e){_a(0,this._href(e))}_setIn(e,t){return V`<a
      class="set-in"
      href=${this._href(e)}
      @click=${t=>{t.preventDefault(),this._open(e)}}
      >${t}</a
    >`}_calculationWhen(){var e,t;return this.t(`cards.next-run.${Ma(this.config)}`,"{time}",null!==(t=null===(e=this.config)||void 0===e?void 0:e.calctime)&&void 0!==t?t:"")}_automaticZones(){return this.zones.filter(e=>"automatic"===e.state)}get _lang(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e,...t){return di(`panels.info.${e}`,this._lang,...t)}formatDuration(e){return ha(e)}_reading(e){if(null==e||""===e)return"-";const t=Number(e);if(!Number.isFinite(t))return String(e);const i=Math.min(2,(String(e).split(".")[1]||"").length);return this._n(t,i)}_n(e,t){var i,s;return ea(e,t,null===(i=this.hass)||void 0===i?void 0:i.locale,null===(s=this.hass)||void 0===s?void 0:s.language)}render(){return this.hass?this.isLoading?V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${di("common.loading",this._lang)}...
          </div>
        </ha-card>
      `:this.config?V`
      ${this.renderRunning()} ${this.renderDeliveryGap()}
      ${this.renderStaleZones()} ${this.renderNextRun()}
      ${this.renderPostpone()} ${this.renderForecast()} ${this.renderDecision()}
      ${this.renderEstimates()}
    `:V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${this.t("configuration-not-available")}
          </div>
        </ha-card>
      `:V``}renderRunning(){const e=this._live;if(!oa(e))return V``;const t=!0===(null==e?void 0:e.paused),i=na(e),s=(null==e?void 0:e.soaking)||[],a=(null==e?void 0:e.starting)||[],n=((null==e?void 0:e.programs)||[]).filter(e=>"running"===e.state),o=((null==e?void 0:e.programs)||[]).filter(e=>"waiting"===e.state),r=t?"cards.running.headline-paused":i.length?"cards.running.headline":a.length?"cards.running.headline-starting":s.length?"cards.running.headline-soaking":"cards.running.headline",l=(e,t)=>V`<a
        href="/${gi}/zones/zone/${e}"
        @click=${t=>{t.preventDefault(),_a(0,`/${gi}/zones/zone/${e}`)}}
        >${t}</a
      >`,d=async e=>{await this.hass.callService(gi,e,{}),this._fetchLive()};return V`
      <ha-card>
        <div class="card-content hero running">
          <ha-icon
            icon=${t?"mdi:pause-circle-outline":"mdi:water"}
          ></ha-icon>
          <div class="hero-text">
            <div class="hero-headline">${this.t(r)}</div>
            ${t&&(null==e?void 0:e.paused_until)?V`<div class="hero-sub">
                  ${this.t("cards.running.paused-until","{when}",sa(e.paused_until,this._lang,{tomorrow:di("card.tomorrow",this._lang),yesterday:di("card.yesterday",this._lang)}))}
                </div>`:""}
            ${i.map(e=>{const t=e,i=[this.t("cards.running.left","{time}",ia(t.remaining_seconds),"{percent}",String(t.percent))];return t.passes&&i.push(this.t("cards.running.pass","{pass}",String(t.pass),"{passes}",String(t.passes))),t.max_litres&&i.push(this.t("cards.running.at-most","{volume}",`${this._n(pa(t.max_litres,this.config),1)} ${la(this.config,vs)}`)),V`<div class="hero-sub">
                ${l(t.zone_id,t.zone)}: ${i.join(", ")}
              </div>`})}
            ${s.map(e=>V`<div class="hero-sub">
                  ${l(e.zone_id,e.zone)}:
                  ${this.t("cards.running.soaking","{when}",sa(e.until,this._lang,{tomorrow:di("card.tomorrow",this._lang),yesterday:di("card.yesterday",this._lang)}),"{pass}",String(e.next_pass),"{passes}",String(e.passes))}
                </div>`)}
            ${a.map(e=>V`<div class="hero-sub">
                  ${l(e.zone_id,e.zone)}:
                  ${this.t("cards.running.starting","{supply}",e.supply||"")}
                </div>`)}
            ${n.map(e=>{var t;const i=e.name||this.t("cards.running.program"),s=[];return e.steps&&s.push(this.t("cards.running.step","{step}",String(null!==(t=e.step)&&void 0!==t?t:1),"{steps}",String(e.steps))),null!=e.remaining_seconds&&s.push(this.t("cards.running.program-left","{time}",ia(e.remaining_seconds))),V`<div class="hero-sub">
                ${s.length?`${i}: ${s.join(", ")}`:i}
              </div>`})}
            ${o.length?V`<div class="hero-sub">
                  ${this.t("cards.running.then","{names}",o.map(e=>e.name||this.t("cards.running.program")).join(", "))}
                </div>`:""}
          </div>
        </div>
        <div class="card-actions">
          ${t?V`<ha-button @click=${()=>d("resume_watering")}>
                ${di("programs.resume",this._lang)}
              </ha-button>`:V`<ha-button @click=${()=>d("pause_watering")}>
                ${di("programs.pause",this._lang)}
              </ha-button>`}
          ${t||!n.length&&!i.length?"":V`<ha-button
                appearance="plain"
                @click=${()=>d("next_step")}
              >
                ${di("programs.next_step",this._lang)}
              </ha-button>`}
          <ha-button variant="danger" @click=${async()=>{await Zn(this.hass,{text:di("programs.confirm_stop",this._lang),destructive:!0})&&d("stop_watering")}}>
            ${di("programs.stop",this._lang)}
          </ha-button>
        </div>
      </ha-card>
    `}renderPostpone(){var e,t,i;const s=null===(i=null===(t=null===(e=this.info)||void 0===e?void 0:e.skip_preview)||void 0===t?void 0:t.checks)||void 0===i?void 0:i.find(e=>{var t;return"postponed"===e.id&&!0===(null!==(t=e.active)&&void 0!==t?t:e.skip)});return V`
      <ha-card>
        <div class="card-content postpone">
          ${s?V`
                <ha-icon icon="mdi:pause-circle-outline"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.until")}
                  ${ra(s.until,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </span>
                <ha-button @click=${()=>this.resumeIrrigation()}>
                  ${this.t("cards.postpone.resume")}
                </ha-button>
              `:V`
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
    `}async postponeIrrigation(e){await this.hass.callService("smart_irrigation","postpone_irrigation",{hours:e}),await this._fetchData()}async resumeIrrigation(){await this.hass.callService("smart_irrigation","resume_irrigation",{}),await this._fetchData()}renderForecast(){var e,t,i,s,a;const n=null!==(t=null===(e=this.info)||void 0===e?void 0:e.forecast)&&void 0!==t?t:[];if(!n.length)return"";const o="mi"!==(null===(a=null===(s=null===(i=this.hass)||void 0===i?void 0:i.config)||void 0===s?void 0:s.unit_system)||void 0===a?void 0:a.length),r=e=>null==e?"—":o?`${Math.round(e)}°`:`${Math.round(1.8*e+32)}°`,l=e=>null==e||e<=0?"":o?`${this._n(e,1)} mm`:`${this._n(e/25.4,2)} in`;return V`
      <ha-card>
        <div class="card-content forecast">
          ${n.map((e,t)=>{var i;const s=(null!==(i=e.precipitation)&&void 0!==i?i:0)>0;return V`
              <div class="forecast-day">
                <div class="forecast-name">
                  ${0===t?this.t("cards.forecast.today"):ra(e.date,this.hass,{weekday:"short"})}
                </div>
                <ha-icon
                  icon=${s?"mdi:weather-rainy":"mdi:weather-sunny"}
                  class=${s?"wet":"dry"}
                ></ha-icon>
                <div class="forecast-temps">
                  <span class="forecast-max">${r(e.temp_max)}</span>
                  <span class="forecast-min">${r(e.temp_min)}</span>
                </div>
                <div class="forecast-rain">${l(e.precipitation)}</div>
              </div>
            `})}
        </div>
      </ha-card>
    `}renderDeliveryGap(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.delivery_gap;return t?V`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:water-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t(`gaps.${t}.title`)}</div>
            <div class="info-note">${this.t(`gaps.${t}.body`)}</div>
          </div>
        </div>
        ${"no_valve_path"===t?V`<div class="card-actions">
              <ha-button @click=${()=>this._open("general/at/control")}>
                ${this.t("gaps.no_valve_path.action")}
              </ha-button>
            </div>`:""}
      </ha-card>
    `:""}renderStaleZones(){var e,t;const i=null!==(t=null===(e=this.info)||void 0===e?void 0:e.stale_zones)&&void 0!==t?t:[];return i.length?V`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:clock-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t("cards.stale.title")}</div>
            <div class="info-note">${this.t("cards.stale.body")}</div>
            ${i.map(e=>V`
                <div class="info-note">
                  <b>${e.zone}</b>:
                  ${e.last_calculated?ra(e.last_calculated,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.stale.never")}
                </div>
              `)}
          </div>
        </div>
      </ha-card>
    `:""}renderNextRun(){var e,t,i,s,a,n,o,r,l,d,h;const c=this.info;if(!this.zones.length)return V`
        <ha-card>
          <div class="card-content hero">
            <ha-icon icon="mdi:sprout-outline"></ha-icon>
            <div class="hero-text">
              <div class="hero-headline">
                ${this.t("cards.next-run.headline-no-zones")}
              </div>
              <div class="hero-sub">
                ${this.t("cards.next-run.sub-no-zones")}
              </div>
            </div>
          </div>
          <div class="card-actions">
            <ha-button @click=${()=>this._open("setup")}>
              ${di("panels.general.cards.setup-assistant.open",this._lang)}
            </ha-button>
          </div>
        </ha-card>
      `;if(!1===(null==c?void 0:c.irrigation_enabled))return V`
        <ha-card>
          <div class="card-content hero">
            <ha-icon icon="mdi:power-plug-off-outline"></ha-icon>
            <div class="hero-text">
              <div class="hero-headline">
                ${this.t("cards.next-run.headline-off")}
              </div>
              <div class="hero-sub">${this.t("cards.next-run.sub-off")}</div>
            </div>
          </div>
          <div class="card-actions">
            <ha-button @click=${()=>this._open("general")}>
              ${this.t("cards.next-run.open-settings")}
            </ha-button>
          </div>
        </ha-card>
      `;const u=!0===(null===(e=this.config)||void 0===e?void 0:e.full_controller),p=u?this.nextRuns[0]:void 0,g=u?[...new Set(((null==p?void 0:p.steps)||[]).flatMap(e=>(e.zones||[]).map(e=>{var t;return null!==(t=e.zone)&&void 0!==t?t:`#${e.zone_id}`})))]:null!==(t=null==c?void 0:c.next_irrigation_zones)&&void 0!==t?t:[],m=null!==(i=null==c?void 0:c.zones_without_valve)&&void 0!==i?i:[],f=u?Number(null!==(s=null==p?void 0:p.expected_seconds)&&void 0!==s?s:0):null!==(a=null==c?void 0:c.next_irrigation_duration)&&void 0!==a?a:0,v=null===(o=null===(n=null==c?void 0:c.skip_preview)||void 0===n?void 0:n.checks)||void 0===o?void 0:o.find(e=>"postponed"===e.id&&e.skip),_=(null===(r=null==c?void 0:c.skip_preview)||void 0===r?void 0:r.should_skip)?null===(l=null==c?void 0:c.skip_preview)||void 0===l?void 0:l.reason:null,w=u||!!(null==c?void 0:c.start_source)&&"trigger"!==c.start_source,y=w?null!==(d=null==p?void 0:p.start)&&void 0!==d?d:this.programsStart:null==c?void 0:c.next_irrigation_start,b=y?ra(y,this.hass,{weekday:"long",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):null;let $="mdi:water-off-outline",x=this.t("cards.next-run.headline-nothing"),k=b?this.t("cards.next-run.sub-nothing","{start}",b):this.t("cards.next-run.no-start");const z=!w&&"none"===(null==c?void 0:c.active_start_trigger);z?($="mdi:calendar-remove-outline",x=this.t("cards.next-run.headline-no-trigger"),k=this.t("cards.next-run.sub-no-trigger")):v?($="mdi:pause-circle-outline",x=this.t("cards.next-run.headline-postponed"),k=this.t("cards.next-run.sub-postponed")):_&&"postponed"!==_?($="mdi:calendar-remove-outline",x=this.t("cards.next-run.headline-skipped"),k=this.t(`cards.decision.check-${_}`)):!g.length&&m.length?($="mdi:water-off-outline",x=this.t("cards.next-run.headline-no-valve"),k=this.t("cards.next-run.sub-no-valve")):g.length&&f>0||!this._automaticZones().length||!this._automaticZones().every(aa)?g.length&&f>0&&($="mdi:water-outline",x=b?this.t("cards.next-run.headline-watering","{start}",b):this.t("cards.next-run.headline-watering-soon"),k=this.t(1===g.length?"cards.next-run.sub-watering-one":"cards.next-run.sub-watering","{count}",String(g.length),"{duration}",this.formatDuration(f))):($="mdi:timer-sand",x=this.t("cards.next-run.headline-not-calculated"),k=this.t("cards.next-run.sub-not-calculated","{when}",this._calculationWhen()));const S=!1!==(null==c?void 0:c.start_trigger_armed);return w||z||S||v||_||!g.length||!(f>0)||($="mdi:calendar-alert",x=this.t("cards.next-run.headline-not-scheduled"),k=this.t("cards.next-run.sub-not-scheduled")),V`
      <ha-card>
        <div class="card-content hero">
          <ha-icon icon=${$}></ha-icon>
          <div class="hero-text">
            <div class="hero-headline">${x}</div>
            <div class="hero-sub">${k}</div>
          </div>
        </div>
        <div class="card-content hero-detail">
          ${this.renderNextRuns()}
          ${w?V`<span
                >${this._setIn("programs",this.t("cards.next-run.program-schedules"))}</span
              >`:V`<span>
                ${this.t("cards.next-run.labels.trigger")}:
                ${this._setIn("general",null!==(h=null==c?void 0:c.trigger_name)&&void 0!==h?h:this.t("cards.next-run.trigger-default"))}
                ${(null==c?void 0:c.trigger_accounts_for_duration)?`(${this.t("cards.next-run.accounts-for-duration")})`:""}
              </span>`}
          <span
            >${this.t("cards.next-run.labels.calculation")}:
            ${this._setIn("general",this._calculationWhen())}</span
          >
          ${g.length?V`<span
                >${this.t("cards.next-run.labels.zones")}:
                ${g.join(", ")}</span
              >`:""}
          ${m.length?V`<span class="no-valve"
                >${this.t("cards.next-run.labels.no-valve")}:
                ${m.map((e,t)=>V`${t?", ":""}<a
                        href=${this._href(`zones/zone/${e.id}`)}
                        @click=${t=>{t.preventDefault(),this._open(`zones/zone/${e.id}`)}}
                        >${e.name}</a
                      >`)}</span
              >`:""}
          ${(null==c?void 0:c.zone_sequencing)&&!u?V`<span
                >${this.t(`cards.next-run.sequencing-${c.zone_sequencing}`)}</span
              >`:""}
          ${(null==c?void 0:c.durations_estimated)?V`<span>${this.t("cards.next-run.estimated")}</span>`:""}
        </div>
      </ha-card>
    `}renderNextRuns(){if(!this.nextRuns.length)return V``;const e=e=>new Intl.DateTimeFormat(this._lang,{hour:"2-digit",minute:"2-digit"}).format(new Date(e)),t=e=>ra(e,this.hass,{weekday:"short",hour:"2-digit",minute:"2-digit"}),i=(e,t)=>t||e||"";return V`
      <span class="next-runs-head">${this.t("cards.next-run.next-runs")}</span>
      ${this.nextRuns.map(s=>{const a=[];s.waits_for&&a.push(this.t("cards.next-run.run-waits","{program}",i(s.waits_for.program_id,s.waits_for.program),"{start}",e(s.expected_start),"{end}",e(s.expected_end))),"suspended"===s.skipped_reason?a.push(this.t("cards.next-run.run-suspended","{when}",t(s.suspended_until))):s.skipped_reason&&a.push(this.t("cards.next-run.run-skipped"));const n=(s.watered_twice||[]).map(e=>e.zone);return V`<span class="next-run"
          >${t(s.start)}
          ${i(s.program_id,s.program)}${a.map(e=>V` · ${e}`)}${n.length?V` ·
                <span class="warning"
                  >${this.t("cards.next-run.run-twice","{zones}",n.join(", "))}</span
                >`:""}</span
        >`})}
    `}renderDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.skip_preview;return V`
      <ha-card
        header="${this.nextRuns.length>1?this.t("cards.decision.title-next"):this.t("cards.decision.title")}"
      >
        <div class="card-content">
          ${t?t.should_skip?V`
                  <div class="verdict skip">
                    ${this.t("cards.decision.will-skip")}
                  </div>
                  ${t.checks.map(e=>this.renderCheck(e))}
                  <div class="info-note">
                    ${this.t("cards.decision.preview-note")}
                  </div>
                `:V`
                  <details class="more">
                    <summary class="verdict run">
                      ${this.t("cards.decision.will-run")}
                    </summary>
                    <div class="more-body">
                      ${t.checks.map(e=>this.renderCheck(e))}
                      <div class="info-note">
                        ${this.t("cards.decision.preview-note")}
                      </div>
                    </div>
                  </details>
                `:V`<div class="info-note">
                ${this.t("cards.decision.unavailable")}
              </div>`}
          ${this.renderLastDecision()}
        </div>
      </ha-card>
    `}renderCheck(e){let t="passing";return e.enabled?e.available?e.skip&&(t="blocking"):t="unavailable":t="off",V`
      <div class="check">
        <div class="check-head">
          <span class="check-name"
            >${this.t(`cards.decision.check-${e.id}`)}</span
          >
          <span class="chip ${t}"
            >${this.t(`cards.decision.state-${t}`)}</span
          >
        </div>
        ${e.enabled&&e.available?V`<div class="check-detail">
              ${this.renderCheckNumbers(e)}
            </div>`:""}
      </div>
    `}renderCheckNumbers(e){var t,i,s,a,n,o,r;if("precipitation"===e.id){const s=null!=e.expected_mm&&null!=e.forecast_mm&&Math.abs(e.expected_mm-e.forecast_mm)>=.05;let a="";return"deficit"===e.overridden?a=this.t("cards.decision.detail-anyway-deficit","{deficit}",this._n(null!==(t=e.deficit_mm)&&void 0!==t?t:0,1)):"skips_in_a_row"===e.overridden&&(a=this.t("cards.decision.detail-anyway-skips","{days}",String(null!==(i=e.skips_in_a_row)&&void 0!==i?i:0))),V`
        <span
          >${this.t("cards.decision.detail-forecast")}:
          ${null!=e.forecast_mm?this._n(e.forecast_mm,1):"-"}
          mm</span
        >
        ${s?V`<span
              >${this.t("cards.decision.detail-expected")}:
              ${this._n(e.expected_mm,1)} mm</span
            >`:""}
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!=e.threshold_mm?this._n(e.threshold_mm,1):"-"}
          mm</span
        >
        ${a?V`<span class="check-why">${a}</span>`:""}
      `}if("freeze"===e.id||"wind"===e.id){const t="weather_service"===e.source?this.t("cards.decision.detail-weather-service"):e.source;return V`
        <span
          >${this.t("cards.decision.detail-now")}: ${this._reading(e.value)}
          ${null!==(s=e.unit)&&void 0!==s?s:""}</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${this._reading(e.threshold)} ${null!==(a=e.unit)&&void 0!==a?a:""}</span
        >
        ${null!=e.forecast_low?V`<span
              >${this.t("cards.decision.detail-tonight")}:
              ${this._reading(e.forecast_low)} ${null!==(n=e.unit)&&void 0!==n?n:""}</span
            >`:""}
        <span>${null!=t?t:""}</span>
      `}return"rain_sensor"===e.id?V`<span
        >${e.raining?this.t("cards.decision.detail-raining"):this.t("cards.decision.detail-dry")}</span
      >`:"soil_moisture"===e.id?V`${(e.zones||[]).map(e=>V`<span
            >${e.name}: ${this._reading(e.moisture)} % /
            ${this._reading(e.threshold)} %
            ${e.held?`(${this.t("cards.decision.detail-held")})`:""}</span
          >`)}`:"days_between"===e.id?V`
        <span
          >${this.t("cards.decision.detail-days-since")}:
          ${null!==(o=e.days_since)&&void 0!==o?o:"-"}</span
        >
        <span
          >${this.t("cards.decision.detail-days-required")}:
          ${null!==(r=e.days_required)&&void 0!==r?r:"-"}</span
        >
      `:V``}renderLastDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.last_skip_evaluation;return V`
      <div class="last-decision">
        <span class="check-name">${this.t("cards.decision.last-title")}</span>
        ${t?V`<span class="value"
              >${t.should_skip?this.t("cards.decision.last-skipped"):this.t("cards.decision.last-ran")}${t.evaluated_at?` (${ra(t.evaluated_at,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})`:""}</span
            >`:V`<span class="value"
              >${this.t("cards.decision.last-none")}</span
            >`}
      </div>
    `}renderEstimates(){var e,t,i,s;const a=null!==(t=null===(e=this.info)||void 0===e?void 0:e.zone_estimates)&&void 0!==t?t:{},n=this.config?da(this.config,_s):"mm",o=this.zones.filter(e=>a[String(e.id)]),r=new Set((null!==(s=null===(i=this.info)||void 0===i?void 0:i.zones_without_valve)&&void 0!==s?s:[]).map(e=>e.id));return V`
      <ha-card header="${this.t("cards.estimate.title")}">
        <div class="card-content">
          ${0===o.length?V`<div class="info-note">
                ${this.t("cards.estimate.none")}
              </div>`:V`
                ${o.map(e=>{const t=a[String(e.id)];return V`
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
                            >${this._n(Number(t.bucket),1)}
                            ${n}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.at-last-calculation")}${e.last_calculated?` (${ra(e.last_calculated,this.hass,{weekday:"short",hour:"2-digit",minute:"2-digit"})})`:""}:</span
                          >
                          <span class="value"
                            >${this._n(Number(e.bucket),1)} ${n}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.would-water")}:</span
                          >
                          <span class="value"
                            >${r.has(Number(e.id))?this.t("cards.estimate.no-valve"):t.duration?this.formatDuration(t.duration):this.t("cards.estimate.nothing")}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.last-irrigation")}:</span
                          >
                          <span class="value"
                            >${e.last_irrigation?ra(e.last_irrigation,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.estimate.never-watered")}</span
                          >
                        </div>
                      </div>
                    </div>
                  `})}
                <div class="info-note">${this.t("cards.estimate.note")}</div>
              `}
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Gn} ${Kn}

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

      .no-valve a {
        color: var(--primary-color);
      }

      /* Each "when" of the run leads to where it is set (finding 11). */
      .hero-detail a.set-in {
        color: var(--primary-color);
      }

      /* The trigger and the zones: true, and nobody's first question. One
         line each, under the headline's text rather than under its icon,
         each starting with a capital (#1018). */
      .hero-detail {
        flex-direction: column;
        gap: 2px;
        padding-top: 0;
        padding-left: calc(16px + 32px + 16px);
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .hero-detail > span {
        display: block;
      }
      .hero-detail > span::first-letter {
        text-transform: uppercase;
      }
      .hero-detail > span.next-runs-head {
        color: var(--primary-text-color);
        font-weight: 500;
        margin-top: 4px;
      }
      .hero-detail .warning {
        color: var(--warning-color, #ff9800);
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

      /* Six days of 62 px do not fit a phone: two rows of three, not a
         line to scroll sideways. */
      @media (max-width: 600px) {
        .forecast {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          row-gap: 12px;
          overflow-x: visible;
        }
        .forecast-day {
          min-width: 0;
        }
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
        gap: 12px 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      /* The same icon size and text column as the card above (#1018). */
      .postpone ha-icon {
        --mdc-icon-size: 32px;
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
      .check-why {
        flex-basis: 100%;
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
    `}};i([fe()],Zo.prototype,"config",void 0),i([fe({type:Object})],Zo.prototype,"info",void 0),i([fe({type:Array})],Zo.prototype,"zones",void 0),i([fe({type:Boolean})],Zo.prototype,"isLoading",void 0),i([fe({attribute:!1})],Zo.prototype,"_live",void 0),Zo=i([pe("smart-irrigation-view-info")],Zo);const Go="__new__",qo=(e,t,i)=>({id:e,zones:[t],mode:"calculated",percent:100,seconds:0,passes:Math.max(1,Math.min(6,Math.round(i)||1)),max_litres:0,min_seconds:0,max_seconds:0,adjust_seconds:0,delay:null,enabled:!0}),Jo=[Ni,Si,Ti,Ei,Ii,Di,Mi,Ci,Hi],Ko={sensors:"PyETO",et:"Passthrough",static:"Static"};let Xo=class extends ce{constructor(){super(...arguments),this.step=0,this.allModules=[],this.isSaving=!1,this.done=!1,this.mode="water",this.firstZone=!1,this.valve="",this.zoneName="",this.zoneSize="",this.zoneThroughput="",this.underGlass=!1,this.weather="service",this.sensors={},this.suggested=[],this.staticDelta="",this.serviceSuppliesEt=!1,this.serviceHasRain=!0,this.programChoice=""}firstUpdated(){be().catch(()=>{}),this._load().catch(e=>console.error("Setup wizard: load failed",e))}async _load(){if(!this.hass)return;const[e,t,i,s]=await Promise.all([Ka(this.hass),(a=this.hass,a.callWS({type:gi+"/allmodules"})),Qa(this.hass).catch(()=>{}),en(this.hass).catch(()=>[])]);var a;this.config=e,this.firstZone=0===s.length,this.mode=this.firstZone||!0===(null==e?void 0:e.full_controller)?"water":"calculate",this.allModules=t,this.serviceSuppliesEt=!!(null==i?void 0:i.supplies_evapotranspiration),this.serviceHasRain=!1!==(null==i?void 0:i.supplies_rain),this.usesWeatherService||(this.weather="sensors")}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}sourceName(e){return di(`panels.mappings.cards.mapping.items.${e.toLowerCase()}`,this.lng)}t(e){return di(`panels.setup.${e}`,this.lng)}get usesWeatherService(){var e;return!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service)}get engineName(){return"service"===this.weather?this.serviceSuppliesEt?"Passthrough":"PyETO":Ko[this.weather]}get engine(){return this.allModules.find(e=>e.name===this.engineName)}get sourcesToAsk(){var e,t;const i=null!==(t=null===(e=this.engine)||void 0===e?void 0:e.consumes)&&void 0!==t?t:Jo;return Jo.filter(e=>i.includes(e)&&!(this.underGlass&&(e===Ci||e===Hi)))}get rainFromSensors(){return e=this.weather,t=this.underGlass,i=this.serviceHasRain,"service"!==e||t||i?[]:[Hi,Ci];var e,t,i}get sensorsToAsk(){var e,t;return"static"===this.weather?[]:"et"===this.weather?(t=this.sourcesToAsk,!!(null===(e=this.engine)||void 0===e?void 0:e.consumes)?t:[Mi]):"sensors"===this.weather?this.sourcesToAsk:this.rainFromSensors}get optionalToAsk(){var e;const t=null===(e=this.engine)||void 0===e?void 0:e.requires;return t?this.sensorsToAsk.filter(e=>!t.includes(e)&&!this.rainFromSensors.includes(e)):[]}get steps(){const e=this.firstZone?["mode","zone","environment","weather"]:["zone","environment","weather"];return(this.sensorsToAsk.length||"static"===this.weather)&&e.push("sensors"),e.push("review"),e}get currentStep(){return this.steps[Math.min(this.step,this.steps.length-1)]}get canGoOn(){var e;switch(this.currentStep){case"zone":return""!==this.zoneName.trim()&&Number(this.zoneSize)>0&&Number(this.zoneThroughput)>0;case"sensors":return"static"===this.weather?Number(this.staticDelta)>0:0===function(e,t,i){const s=t?e.filter(e=>t.includes(e)):e;return s.filter(e=>!i[e])}(this.sensorsToAsk,null===(e=this.engine)||void 0===e?void 0:e.requires,this.sensors).length&&(!this.rainFromSensors.length||this.rainFromSensors.some(e=>!!this.sensors[e]));default:return!0}}render(){var e,t;if(!this.hass)return V``;if(this.done){const i="static"===this.weather?"done-next-static":"service"===this.weather?"done-next-service":"done-next-sensors";return V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            <div class="done">${this.t("done")}</div>
            <div class="note">${this.t("done-note-zone")}</div>
            <div class="note">${this.t(i)}</div>
            ${"water"===this.mode?V`<div class="note">
                  ${this.placed?this.t(this.placed.created?"done-next-new-program":"done-next-added").replace("{program}",this.placed.name):this.t("done-next-no-valve")}
                </div>`:""}
            ${(null===(e=this.calcResult)||void 0===e?void 0:e.text)?V`<div class=${this.calcResult.ok?"done-calc":"error"}>
                  ${this.calcResult.text}
                </div>`:""}
          </div>
          <div class="card-actions">
            ${"static"!==this.weather&&null!=this.createdZoneId?V`<ha-button
                  appearance="accent"
                  .disabled=${!!(null===(t=this.calcResult)||void 0===t?void 0:t.busy)}
                  @click=${()=>this._calculateNow()}
                >
                  ${this.t("calc-now")}
                </ha-button>`:""}
            ${null!=this.createdZoneId?V`<ha-button
                  appearance="filled"
                  @click=${()=>_a(0,`/${gi}/zones/zone/${this.createdZoneId}`)}
                >
                  ${this.t("open-zone")}
                </ha-button>`:""}
            <ha-button appearance="plain" @click=${()=>this._startOver()}>
              ${this.t("another")}
            </ha-button>
          </div>
        </ha-card>
      `}return V`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="note">${this.t("description")}</div>
          ${this.renderStep()}
          ${this.error?V`<div class="error">${this.error}</div>`:""}
          <div class="si-form-actions">
            <span class="step-count"
              >(${this.t("step")}
              ${Math.min(this.step,this.steps.length-1)+1} /
              ${this.steps.length})</span
            >
            ${this.step>0?V`<ha-button
                  appearance="plain"
                  @click=${()=>{this.step-=1,this.error=void 0}}
                >
                  <ha-svg-icon slot="start" .path=${Aa}></ha-svg-icon>
                  ${this.t("back")}
                </ha-button>`:""}
            ${"review"===this.currentStep?V`<ha-button
                  appearance="filled"
                  ?disabled=${this.isSaving}
                  @click=${()=>this.create()}
                >
                  <ha-svg-icon slot="start" .path=${Ea}></ha-svg-icon>
                  ${this.isSaving?this.t("creating"):this.t("create")}
                </ha-button>`:V`<ha-button
                  appearance="filled"
                  ?disabled=${!this.canGoOn}
                  @click=${()=>{this.step+=1,this.error=void 0,"sensors"===this.currentStep&&this._suggestSensors()}}
                >
                  ${this.t("next")}
                  <ha-svg-icon slot="end" .path=${Ca}></ha-svg-icon>
                </ha-button>`}
          </div>
        </div>
      </ha-card>
    `}renderStep(){switch(this.currentStep){case"mode":return this.renderModeStep();case"zone":return this.renderZoneStep();case"environment":return this.renderEnvironmentStep();case"weather":return this.renderWeatherStep();case"sensors":return this.renderSensorsStep();default:return this.renderReviewStep()}}renderModeStep(){const e=e=>di(`panels.general.cards.master-switch.${e}`,this.lng);return V`
      <h3>${this.t("steps.mode.question")}</h3>
      ${this.choice("water"===this.mode,e("mode-water"),this.t("steps.mode.water-help"),()=>{this.mode="water"})}
      ${this.choice("calculate"===this.mode,e("mode-calculate"),this.t("steps.mode.calculate-help"),()=>{this.mode="calculate"})}
    `}renderZoneStep(){return V`
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
          ${this.config?V`<span class="unit"
                >(${da(this.config,ps)})</span
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
          ${this.config?V`<span class="unit"
                >(${da(this.config,gs)})</span
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
      <div class="setting-row">
        <div class="setting-label">
          ${this.t("steps.zone.valve")}${"water"===this.mode?"":V` <span class="unit"
                >(${this.t("steps.sensors.optional")})</span
              >`}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${this.valve}
          .includeDomains=${["valve","switch","input_boolean"]}
          @value-changed=${e=>{var t,i;return this.valve=null!==(i=null===(t=e.detail)||void 0===t?void 0:t.value)&&void 0!==i?i:""}}
        ></ha-entity-picker>
      </div>
      <div class="note">
        ${this.t("water"===this.mode?"steps.zone.valve-help":"steps.zone.valve-help-calculate")}
      </div>
    `}renderEnvironmentStep(){return V`
      <h3>${this.t("steps.environment.question")}</h3>
      ${this.choice(!this.underGlass,this.t("steps.environment.outdoors"),this.t("steps.environment.outdoors-help"),()=>{this.underGlass=!1})}
      ${this.choice(this.underGlass,this.t("steps.environment.under-glass"),this.t("steps.environment.under-glass-help"),()=>{this.underGlass=!0,"service"===this.weather&&(this.weather="sensors")})}
    `}renderWeatherStep(){return V`
      <h3>${this.t("steps.weather.question")}</h3>
      ${this.usesWeatherService&&!this.underGlass?this.choice("service"===this.weather,this.t("steps.weather.service"),this.t(this.serviceHasRain?"steps.weather.service-help":"steps.weather.service-help-entity"),()=>this.weather="service"):""}
      ${this.underGlass?V`<div class="note">
            ${this.t("steps.weather.no-service-indoors")}
          </div>`:""}
      ${this.choice("sensors"===this.weather,this.t("steps.weather.sensors"),this.t("steps.weather.sensors-help"),()=>this.weather="sensors")}
      ${this.choice("et"===this.weather,this.t("steps.weather.et"),this.t("steps.weather.et-help"),()=>this.weather="et")}
      ${this.choice("static"===this.weather,this.t("steps.weather.static"),this.t("steps.weather.static-help"),()=>this.weather="static")}
    `}renderSensorsStep(){return"static"===this.weather?V`
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
      `:V`
      <h3>${this.t("steps.sensors.question")}</h3>
      <div class="note">${this.t("steps.sensors.help")}</div>
      ${this.optionalToAsk.length?V`<div class="note">${this.t("steps.sensors.help-optional")}</div>`:""}
      ${this.rainFromSensors.length?V`<div class="note">
            ${this.t("steps.sensors.rain-help-entity")}
          </div>`:""}
      ${this.suggested.length?V`<div class="note">
            ${this.t("steps.sensors.suggested-note")}
          </div>`:""}
      ${this.underGlass&&this.sensorsToAsk.includes(Di)?V`<div class="note">${this.t("steps.sensors.lux-hint")}</div>`:""}
      ${this.sensorsToAsk.map(e=>{var t;return V`
          <div class="setting-row">
            <div class="setting-label">
              ${this.sourceName(e)}${this.fieldTags(e)}
            </div>
            <ha-entity-picker
              class="entity-field"
              .hass=${this.hass}
              .value=${null!==(t=this.sensors[e])&&void 0!==t?t:""}
              allow-custom-entity
              @value-changed=${t=>{var i,s;this.sensors=Object.assign(Object.assign({},this.sensors),{[e]:null!==(s=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==s?s:""}),this.suggested=this.suggested.filter(t=>t!==e)}}
            ></ha-entity-picker>
          </div>
        `})}
    `}renderReviewStep(){return V`
      <h3>${this.t("steps.review.question")}</h3>
      <div class="settings">
        ${this.firstZone?V`<div class="setting-row">
              <div class="setting-label">${this.t("steps.review.mode")}</div>
              <div class="review-value">
                ${di(`panels.general.cards.master-switch.mode-${this.mode}`,this.lng)}
              </div>
            </div>`:""}
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.zone")}</div>
          <div class="review-value">${this.zoneName}</div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.zone.valve")}</div>
          <div class="review-value">
            ${this.valve||this.t("steps.review.no-valve")}
          </div>
        </div>
        ${this.renderProgramChoice()}
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.environment")}</div>
          <div class="review-value">
            ${this.underGlass?this.t("steps.environment.under-glass"):this.t("steps.environment.outdoors")}
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.engine")}</div>
          <div class="review-value">
            ${function(e,t){if(!e)return"";const i=wa[e];return i?di(`common.modes.${i}`,t):e}(this.engineName,this.lng)}
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.sources")}</div>
          <div class="review-value">
            ${"static"===this.weather?`${this.t("steps.sensors.static-label")}: ${this.staticDelta}`:"service"===this.weather?[this.t("steps.review.from-the-service"),...this.rainFromSensors.filter(e=>!!this.sensors[e]).map(e=>`${this.sourceName(e)}: ${this.sensors[e]}`)].join(", "):this.sensorsToAsk.length?this.reviewSensors():this.t("steps.review.from-the-service")}
          </div>
        </div>
      </div>
      <div class="note">${this.t("steps.review.help")}</div>
    `}get programs(){var e;return(null===(e=this.config)||void 0===e?void 0:e.programs)||[]}renderProgramChoice(){var e;if("water"!==this.mode||!this.valve||this.programs.length<2)return V``;const t=this.programChoice||(null===(e=this.programs[0])||void 0===e?void 0:e.id)||Go;return V`
      <div class="setting-row">
        <div class="setting-label">${this.t("steps.review.program")}</div>
        <select
          class="field"
          @change=${e=>{this.programChoice=e.target.value}}
        >
          ${this.programs.map(e=>{var i;return V`<option
                value=${null!==(i=e.id)&&void 0!==i?i:""}
                ?selected=${e.id===t}
              >
                ${e.name||e.id}
              </option>`})}
          <option value=${Go} ?selected=${t===Go}>
            ${this.t("steps.review.new-program")}
          </option>
        </select>
      </div>
    `}async _placeZone(e){var t;if(!this.hass)return;const i=await Ka(this.hass),s=((e,t,i)=>{var s,a;const n=null!==(s=i.passes)&&void 0!==s?s:1,o=i.target===Go?void 0:null!==(a=e.find(e=>e.id===i.target))&&void 0!==a?a:e[0];if(!o){const s={id:`program_${i.id()}`,name:i.newName,steps:[qo(`step_${i.id()}`,t,n)],delay:0,tours:1,schedules:[{id:`schedule_${i.id()}`,enabled:!0,type:"sun",time:"06:00",event:"sunrise",offset_minutes:0,anchor:"end",weekdays:[],every_n_days:1,every_offset:0,parity:"any",months:[],from_date:null,until_date:null,weather:!0}]};return{programs:[...e,s],program:s,created:!0}}const r=[...o.steps||[]];if(r.some(e=>(e.zones||[]).includes(t)))return{programs:e,program:o,created:!1};const l=r[r.length-1],d=r[r.length-2];l&&d&&(null===l.delay||void 0===l.delay)&&Number(d.delay)>0&&(r[r.length-1]=Object.assign(Object.assign({},l),{delay:d.delay})),r.push(qo(`step_${i.id()}`,t,n));const h=Object.assign(Object.assign({},o),{steps:r});return{programs:e.map(e=>e===o?h:e),program:h,created:!1}})((null==i?void 0:i.programs)||[],e,{target:this.programChoice||void 0,newName:this.t("new-program-name"),passes:Number(null!==(t=null==i?void 0:i.watering_passes)&&void 0!==t?t:1)||1,id:()=>Math.random().toString(36).slice(2,8)});await Xa(this.hass,{programs:s.programs}),this.placed={name:s.program.name||s.program.id||"",created:s.created}}reviewSensors(){const{chosen:e,empty:t}=function(e,t){return{chosen:e.filter(e=>!!t[e]),empty:e.filter(e=>!t[e])}}(this.sensorsToAsk,this.sensors),i=e=>e.map(e=>this.sourceName(e)).join(", ");return[i(e),t.length?`${this.t("steps.review.no-sensor")}: ${i(t)}`:""].filter(Boolean).join("; ")}fieldTags(e){const t=[...this.optionalToAsk.includes(e)?[this.t("steps.sensors.optional")]:[],...this.suggested.includes(e)?[this.t("steps.sensors.suggested")]:[]];return t.length?V` <span class="step-count">(${t.join(", ")})</span>`:""}choice(e,t,i,s){return V`
      <div class="choice ${e?"selected":""}" @click=${s}>
        <div class="choice-title">${t}</div>
        <div class="choice-help">${i}</div>
      </div>
    `}sourceFor(e){return this.sensors[e]?{[Ji]:Bi,[Ki]:this.sensors[e],[Qi]:""}:"service"===this.weather&&this.sourcesToAsk.includes(e)&&!this.rainFromSensors.includes(e)?{[Ji]:Ui,[Ki]:"",[Qi]:""}:!this.underGlass||e!==Ci&&e!==Hi?{[Ji]:qi,[Ki]:"",[Qi]:""}:{[Ji]:Fi,[Ki]:"",[Qi]:"",[Xi]:0}}async create(){var e;if(this.hass&&!this.isSaving){this.isSaving=!0,this.error=void 0;try{if(this.firstZone){const t="water"===this.mode;t!==(!0===(null===(e=this.config)||void 0===e?void 0:e.full_controller))&&await Xa(this.hass,t?{irrigation_enabled:!0,watering_enabled:!0,full_controller:!0,observed_watering_enabled:!0}:{irrigation_enabled:!0,watering_enabled:!0,full_controller:!1,direct_valve_control_enabled:!1})}const t={name:this.zoneName.trim(),mappings:Object.fromEntries(Jo.map(e=>[e,this.sourceFor(e)])),greenhouse:this.underGlass};await rn(this.hass,t);const i=(await on(this.hass)).find(e=>e.name===t.name);await tn(this.hass,Object.assign(Object.assign({name:this.zoneName.trim(),size:Number(this.zoneSize),throughput:Number(this.zoneThroughput),state:"automatic",[ys]:null==i?void 0:i.id},this.valve?{linked_entity:this.valve}:{}),function(e,t){var i;const s=null===(i=Object.entries(ya).find(([,t])=>t===e))||void 0===i?void 0:i[0];return s?"fixed"===s?{calculation_method:s,method_config:{delta:ba(t)}}:{calculation_method:s}:{}}(this.engineName,this.staticDelta)));const s=(await en(this.hass)).filter(e=>e.name===this.zoneName.trim()).map(e=>Number(e.id));this.createdZoneId=s.length?Math.max(...s):void 0,this.placed=void 0,"water"===this.mode&&this.valve&&void 0!==this.createdZoneId&&await this._placeZone(this.createdZoneId),this.done=!0}catch(e){console.error("Setup wizard: could not create the zone",e),this.error=this.t("failed")}finally{this.isSaving=!1}}}async _calculateNow(){var e,t,i;if(!this.hass||null==this.createdZoneId)return;const s=String(this.createdZoneId);this.calcResult={busy:!0};try{await an(this.hass,s),await sn(this.hass,s);const a=(await en(this.hass)).find(e=>String(e.id)===s),n=null===(e=null==a?void 0:a.calculation_problem)||void 0===e?void 0:e.code;if(n){const e=di(`panels.zones.status.problem.${n}`,this.lng,"{detail}",null!==(t=a.calculation_problem.detail)&&void 0!==t?t:"");this.calcResult={ok:!1,text:e&&!e.startsWith("Translation")?e:this.t("calc-failed")}}else(null!==(i=null==a?void 0:a.duration)&&void 0!==i?i:0)>0?this.calcResult={ok:!0,text:di("panels.setup.calc-duration",this.lng,"{duration}",ha(a.duration))}:this.calcResult={ok:!0,text:this.t("calc-nothing")}}catch(e){console.error("Setup wizard: could not calculate the zone",e),this.calcResult={ok:!1,text:this.t("calc-failed")}}}_startOver(){this.done=!1,this.createdZoneId=void 0,this.calcResult=void 0,this.step=0,this.error=void 0,this.zoneName="",this.zoneSize="",this.zoneThroughput="",this.valve="",this.firstZone=!1,this.underGlass=!1,this.weather=this.usesWeatherService?"service":"sensors",this.sensors={},this.suggested=[],this.staticDelta="",this.programChoice="",this.placed=void 0,this.hass&&Ka(this.hass).then(e=>this.config=e).catch(()=>{})}_suggestSensors(){if(!this.hass||"sensors"!==this.weather&&"et"!==this.weather)return;const e=this.sensorsToAsk.filter(e=>!this.sensors[e]);if(!e.length)return;const t=this.hass.entities,i=Sa(e,this.hass.states,null!=t?t:{}),s=Object.keys(i);s.length&&(this.sensors=Object.assign(Object.assign({},this.sensors),i),this.suggested=[...this.suggested.filter(e=>!s.includes(e)),...s])}static get styles(){return l`
      ${Gn} ${Kn}

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
      .done-calc {
        margin-top: 8px;
        color: var(--success-color, #43a047);
      }

      .done {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--success-color, var(--primary-text-color));
      }
    `}};i([fe()],Xo.prototype,"hass",void 0),i([fe()],Xo.prototype,"config",void 0),i([ve()],Xo.prototype,"step",void 0),i([ve()],Xo.prototype,"allModules",void 0),i([ve()],Xo.prototype,"isSaving",void 0),i([ve()],Xo.prototype,"error",void 0),i([ve()],Xo.prototype,"done",void 0),i([ve()],Xo.prototype,"createdZoneId",void 0),i([ve()],Xo.prototype,"calcResult",void 0),i([ve()],Xo.prototype,"mode",void 0),i([ve()],Xo.prototype,"firstZone",void 0),i([ve()],Xo.prototype,"valve",void 0),i([ve()],Xo.prototype,"zoneName",void 0),i([ve()],Xo.prototype,"zoneSize",void 0),i([ve()],Xo.prototype,"zoneThroughput",void 0),i([ve()],Xo.prototype,"underGlass",void 0),i([ve()],Xo.prototype,"weather",void 0),i([ve()],Xo.prototype,"sensors",void 0),i([ve()],Xo.prototype,"suggested",void 0),i([ve()],Xo.prototype,"staticDelta",void 0),i([ve()],Xo.prototype,"serviceSuppliesEt",void 0),i([ve()],Xo.prototype,"serviceHasRain",void 0),i([ve()],Xo.prototype,"programChoice",void 0),i([ve()],Xo.prototype,"placed",void 0),Xo=i([pe("smart-irrigation-view-setup")],Xo);let Qo=class extends ce{constructor(){super(...arguments),this.busy=!1,this.leftOff=[],this.unrecorded=[],this.t=(e,...t)=>di(`panels.iu_import.cutover.${e}`,this.lng,...t)}firstUpdated(){this.reload().catch(e=>console.error("IU cut-over: load failed",e))}updated(e){if(!e.has("hass")||!this.status||this.busy)return;const t=this.status.controllers.some(e=>{var t,i,s;const a=null===(s=null===(i=null===(t=this.hass)||void 0===t?void 0:t.states[e.entity_id])||void 0===i?void 0:i.attributes)||void 0===s?void 0:s.enabled;return"boolean"==typeof a&&a!==e.enabled});t&&this.reload()}async reload(){var e;if(this.hass)try{this.status=await(e=this.hass,e.callWS({type:gi+"/iu_import/status"}))}catch(e){this.error=this.errorText(e)}}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}errorText(e){var t;const i=null==e?void 0:e.code,s=i?this.t(`errors.${i}`):void 0;return s&&!s.startsWith("Translation")?s:null!==(t=null==e?void 0:e.message)&&void 0!==t?t:this.t("errors.generic")}when(e){return e?new Date(e).toLocaleString(this.lng):""}async switchTo(e){var t,i,s,a;if(!this.hass||this.busy)return;if(await Zn(this.hass,{text:this.t("smart_irrigation"===e?"confirm-over":"confirm-back"),confirmText:this.t("smart_irrigation"===e?"over":"back")})){this.busy=!0,this.error=void 0,this.leftOff=[],this.unrecorded=[];try{const n=await((e,t)=>e.callWS({type:gi+"/iu_import/cutover",to:t}))(this.hass,e),o=new Map((null!==(i=null===(t=this.status)||void 0===t?void 0:t.programs)&&void 0!==i?i:[]).map(e=>[e.id,e.name]));this.leftOff=(null!==(s=n.left_off)&&void 0!==s?s:[]).map(e=>{var t;return null!==(t=o.get(e))&&void 0!==t?t:e}),this.unrecorded=(null!==(a=n.unrecorded)&&void 0!==a?a:[]).map(e=>{var t;return null!==(t=o.get(e))&&void 0!==t?t:e})}catch(e){this.error=this.errorText(e)}finally{this.busy=!1,await this.reload()}}}who(e){switch(e.waters){case"smart_irrigation":return e.switched_at?this.t("si-waters","at",this.when(e.switched_at)):this.t("si-waters-now");case"both":return this.t("both-on");case"none":return this.t("nobody-waters");default:return this.t("iu-waters")}}render(){var e;const t=this.status;return this.hass?t?t.imported?V`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div
            class="who ${t.waters}"
            role=${t.both_on?"alert":"status"}
          >
            ${this.who(t)}
          </div>
          ${this.leftOff.length?V`<div class="notice">
                ${this.t("left-off","names",this.leftOff.join(", "))}
              </div>`:""}
          ${this.unrecorded.length?V`<div class="notice">
                ${this.t("unrecorded","names",this.unrecorded.join(", "))}
              </div>`:""}
          ${t.full_controller?"":V`<div class="notice">${this.t("full-controller-off")}</div>`}
          ${this.renderPrograms(t)}
          ${(null===(e=t.zones_off_in_iu)||void 0===e?void 0:e.length)?V`<div class="notice">
                ${this.t("zones-off","list",t.zones_off_in_iu.map(e=>`${e.zone} (${e.program})`).join(", "))}
              </div>`:""}
          ${this.renderControllers(t)}
          <div role="alert">
            ${this.error?V`<div class="error">${this.error}</div>`:""}
          </div>
          <div class="si-form-actions">
            ${t.switched_over?V`<ha-button
                    appearance="plain"
                    ?disabled=${this.busy||!t.iu_running}
                    @click=${()=>this.switchTo("irrigation_unlimited")}
                    >${this.t("back")}</ha-button
                  >
                  ${t.both_on?V`<ha-button
                        appearance="filled"
                        ?disabled=${this.busy}
                        @click=${()=>this.switchTo("smart_irrigation")}
                        >${this.t("iu-off-again")}</ha-button
                      >`:""}`:V`<ha-button
                  appearance="filled"
                  ?disabled=${this.busy||!t.full_controller}
                  @click=${()=>this.switchTo("smart_irrigation")}
                  >${this.t("over")}</ha-button
                >`}
          </div>
        </div>
      </ha-card>
      ${this.renderFollowUps(t)}
    `:V``:this.error?V`<ha-card header="${this.t("title")}"
            ><div class="card-content">
              <div class="error" role="alert">${this.error}</div>
            </div></ha-card
          >`:V``:V``}renderPrograms(e){return e.programs.length?V`
      <h3>${this.t("programs")}</h3>
      <ul class="lines">
        ${e.programs.map(e=>V`<li>
              ${e.name}:
              ${this.t("schedules-on","on",e.on,"count",e.schedules)}
            </li>`)}
      </ul>
      <div class="note">
        <a
          href="#"
          @click=${e=>{e.preventDefault(),_a(0,jo("programs"))}}
          >${this.t(e.switched_over?"open-programs-after":"open-programs")}</a
        >
      </div>
    `:V``}renderControllers(e){return V`
      <h3>${this.t("controllers")}</h3>
      ${e.iu_running?"":V`<div class="note">${this.t("iu-not-running")}</div>`}
      ${e.controllers.length?V`<ul class="lines">
            ${e.controllers.map(e=>V`<li>
                  ${e.name}:
                  ${null===e.enabled?this.t("unknown"):e.enabled?this.t("on"):this.t("off")}
                </li>`)}
          </ul>`:V`<div class="note">${this.t("no-controllers")}</div>`}
    `}renderFollowUps(e){const t=e.follow_ups;return V`
      <ha-card header="${this.t("follow-ups.title")}">
        <div class="card-content">
          <div class="note">
            ${t.length?this.t("follow-ups.help"):this.t("follow-ups.none")}
          </div>
          <div class="rows">
            ${t.map(e=>{var t;return V`
                <div class="row">
                  <div class="row-head">
                    <div class="row-title">
                      ${null!==(t=e.name)&&void 0!==t?t:e.entity_id}
                      <span class="badge"
                        >${this.t(`follow-ups.${e.kind}`)}</span
                      >
                    </div>
                    ${e.edit?V`<a
                          href=${e.edit}
                          @click=${t=>{t.preventDefault(),_a(0,e.edit)}}
                          >${this.t("follow-ups.edit")}</a
                        >`:""}
                  </div>
                  <div class="row-help">
                    ${e.adjust_time?this.t("follow-ups.adjust-time"):this.t("follow-ups.uses","uses",e.uses.join(", "))}
                  </div>
                </div>
              `})}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Gn} ${Kn}

      h3 {
        margin: 16px 0 4px;
        color: var(--primary-text-color);
      }
      .who {
        font-size: 1.05em;
        font-weight: 600;
        padding: 8px 12px;
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .who.both,
      .who.none {
        border-left-color: var(--error-color, #b71c1c);
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin: 4px 0 8px;
      }
      .notice {
        border-left: 3px solid var(--warning-color, #ffa600);
        padding: 4px 8px;
        margin: 8px 0;
        color: var(--primary-text-color);
      }
      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      ul.lines {
        margin: 4px 0;
        padding-left: 20px;
        color: var(--primary-text-color);
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
      }
      .row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .row-title {
        font-weight: 600;
        color: var(--primary-text-color);
        overflow-wrap: anywhere;
      }
      .row-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      .badge {
        font-size: 0.75em;
        font-weight: normal;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 1px 8px;
        margin-left: 6px;
        color: var(--secondary-text-color);
      }
      a {
        color: var(--primary-color);
      }
      .si-form-actions {
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      ha-card + ha-card {
        margin-top: 16px;
      }
    `}};function er(e,t,i){var s,a,n;const o=[],r=Number(e.offset_minutes)||0;if("sun"===e.type){const t=i("sunset"===e.event?"schedule.sunset":"schedule.sunrise");o.push(r?`${t} ${r>0?"+":"−"}${Math.abs(r)} min`:t)}else o.push(String(null!==(s=e.time)&&void 0!==s?s:""));"end"===e.anchor&&(o[0]=i("schedule.done-by","time",o[0]));const l=Array.isArray(e.weekdays)?e.weekdays:[];if(l.length&&l.length<7){const e=function(e){const t=new Intl.DateTimeFormat(e,{weekday:"short"});return[...Array(7).keys()].map(e=>t.format(new Date(Date.UTC(2024,0,1+e,12))))}(t);o.push(l.map(t=>{var i;return null!==(i=e[t])&&void 0!==i?i:String(t)}).join(", "))}const d=Number(e.every_n_days)||0;d>1&&o.push(i("schedule.every","count",d)),"odd"===e.parity&&o.push(i("schedule.odd")),"even"===e.parity&&o.push(i("schedule.even"));const h=Array.isArray(e.days_of_month)?e.days_of_month:[];h.length&&o.push(i("schedule.days-of-month","days",h.map(e=>"last"===e?i("schedule.last"):String(e)).join(", ")));const c=Array.isArray(e.months)?e.months:[];if(c.length&&c.length<12){const e=function(e){const t=new Intl.DateTimeFormat(e,{month:"short"});return[...Array(12).keys()].map(e=>t.format(new Date(Date.UTC(2024,e,15,12))))}(t);o.push(c.map(t=>{var i;return null!==(i=e[t-1])&&void 0!==i?i:String(t)}).join(", "))}return(e.from_date||e.until_date)&&o.push(`${null!==(a=e.from_date)&&void 0!==a?a:"01-01"} – ${null!==(n=e.until_date)&&void 0!==n?n:"12-31"}`),!1===e.enabled&&o.push(i("schedule.off-in-iu")),o.filter(e=>e).join(" · ")}function tr(e,t,i){var s;return`${e.join(" + ")}: ${"calculated"===t.mode?i("programs.calculated"):function(e){const t=Math.max(0,Math.round(Number(e)||0));if(t<60)return`${t} s`;const i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60,n=[];return i&&n.push(`${i} h`),s&&n.push(`${s} min`),a&&n.push(`${a} s`),n.join(" ")}(t.seconds)}${(null!==(s=t.passes)&&void 0!==s?s:1)>1?` · ${i("programs.passes","count",t.passes)}`:""}${!1===t.enabled?` · ${i("programs.step-off")}`:""}`}function ir(e){return null===e.zone_id?"new":e.zone_id}i([fe({attribute:!1})],Qo.prototype,"hass",void 0),i([ve()],Qo.prototype,"status",void 0),i([ve()],Qo.prototype,"busy",void 0),i([ve()],Qo.prototype,"error",void 0),i([ve()],Qo.prototype,"leftOff",void 0),i([ve()],Qo.prototype,"unrecorded",void 0),Qo=i([pe("smart-irrigation-iu-cutover")],Qo);const sr="pasted",ar=["yaml_invalid","yaml_unreadable"],nr=["source","zones","programs","report"],or=["linked_entity","supply_id","extra_entities","confirm_timeout","open_resends","flow_sensor"];let rr=class extends ce{constructor(){super(...arguments),this.narrow=!1,this.step=0,this.sources=[],this.source="",this.yaml="",this.choices={},this.zones=[],this.busy=!1,this.loaded=!1,this.fullController=!0,this.baseline={},this.asked=0,this.desired={},this.t=(e,...t)=>di(`panels.iu_import.${e}`,this.lng,...t)}firstUpdated(){this._load().catch(e=>console.error("IU import: load failed",e))}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}get currentStep(){return nr[Math.min(this.step,nr.length-1)]}get sourceKey(){return this.source===sr?`${sr}\n${this.yaml}`:this.source}requestFor(e){return{source:this.source===sr?sr:this.source||void 0,yaml:this.source===sr?this.yaml:void 0,matches:Object.keys(e).length?e:void 0}}async _load(){var e,t;if(this.hass)try{const[i,s,a]=await Promise.all([(t=this.hass,t.callWS({type:gi+"/iu_import/sources"})),en(this.hass),Ka(this.hass)]);this.sources=i.sources,this.zones=s,this.fullController=!0===(null==a?void 0:a.full_controller),this.importedAt=null===(e=null==a?void 0:a.iu_import)||void 0===e?void 0:e.at;const n=this.sources.find(e=>!e.error);this.source=n?n.id:sr}catch(e){this.error=this.errorText(e),this.source=sr}finally{this.loaded=!0}}errorText(e){var t;const i=null==e?void 0:e.code,s=i?this.t(`errors.${i}`):void 0;return s&&!s.startsWith("Translation")?ar.includes(i)&&(null==e?void 0:e.message)?`${s} (${e.message})`:s:null!==(t=null==e?void 0:e.message)&&void 0!==t?t:this.t("errors.generic")}async refresh(e=this.choices){if(!this.hass)return!1;const t=++this.asked;this.busy=!0,this.error=void 0;try{const[a,n]=await Promise.all([(i=this.hass,s=this.requestFor(e),i.callWS(Object.assign({type:gi+"/iu_import/preview"},s))),en(this.hass).catch(()=>this.zones)]);return t===this.asked&&(this.preview=a,this.choices=e,this.desired=e,this.zones=n,this.previewedFor=this.sourceKey,Object.keys(e).length||(this.baseline=function(e){return Object.fromEntries(e.zones.map(e=>[e.key,ir(e)]))}(a)),!0)}catch(e){return t===this.asked&&(this.error=this.errorText(e),this.desired=this.choices),!1}finally{t===this.asked&&(this.busy=!1)}var i,s}async next(){if(this.notice=void 0,"source"===this.currentStep){return void((this.preview&&this.previewedFor===this.sourceKey||await this.refresh({}))&&(this.step+=1,this.error=void 0))}this.step+=1,this.error=void 0}async apply(){var e,t,i,s,a;if(!this.hass||!this.preview||this.busy)return;const n=[...null!==(t=null===(e=this.preview.removed_names)||void 0===e?void 0:e.programs)&&void 0!==t?t:this.preview.removed.programs,...null!==(s=null===(i=this.preview.removed_names)||void 0===i?void 0:i.supplies)&&void 0!==s?s:this.preview.removed.supplies];if(!n.length||await Zn(this.hass,{text:this.t("confirm_remove","{names}",n.join(", ")),destructive:!0})){this.busy=!0,this.error=void 0,this.notice=void 0;try{this.result=await(o=this.hass,r=Object.assign(Object.assign({},this.requestFor(this.choices)),{fingerprint:this.preview.fingerprint}),o.callWS(Object.assign({type:gi+"/iu_import/apply"},r))),await this.updateComplete,await(null===(a=this.renderRoot.querySelector("smart-irrigation-iu-cutover"))||void 0===a?void 0:a.reload())}catch(e){if("changed"===(null==e?void 0:e.code))return this.busy=!1,void(await this.refresh()&&(this.notice=this.t("errors.changed")));this.error=this.errorText(e)}finally{this.busy=!1}var o,r}}render(){if(!this.hass)return V``;const e=V`<smart-irrigation-iu-cutover
      .hass=${this.hass}
    ></smart-irrigation-iu-cutover>`;return this.result?V`${e}${this.renderDone(this.result)}`:V`${e}
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="note">${this.t("description")}</div>
          ${this.loaded?this.renderStep():V`<div class="note">${this.t("loading")}</div>`}
          <div aria-live="polite">
            ${this.notice?V`<div class="notice">${this.notice}</div>`:""}
          </div>
          <div role="alert">
            ${this.error?V`<div class="error">${this.error}</div>`:""}
          </div>
          ${this.renderActions()}
        </div>
      </ha-card> `}get blocked(){var e,t;return!!(null===(t=null===(e=this.preview)||void 0===e?void 0:e.conflicts)||void 0===t?void 0:t.length)}renderActions(){const e="report"===this.currentStep,t=this.loaded&&!this.busy&&("source"!==this.currentStep||(this.source===sr?""!==this.yaml.trim():!!this.source));return V`
      <div class="si-form-actions">
        <span class="step-count"
          >(${this.t("step")} ${this.step+1} / ${nr.length})</span
        >
        ${this.step>0?V`<ha-button
              appearance="plain"
              ?disabled=${this.busy}
              @click=${()=>{this.step-=1,this.error=void 0,this.notice=void 0}}
            >
              <ha-svg-icon slot="start" .path=${Aa}></ha-svg-icon>
              ${this.t("back")}
            </ha-button>`:""}
        ${e?V`<ha-button
              appearance="filled"
              ?disabled=${this.busy||!this.preview||this.blocked}
              @click=${()=>this.apply()}
            >
              <ha-svg-icon slot="start" .path=${Ea}></ha-svg-icon>
              ${this.busy?this.t("importing"):this.t("import")}
            </ha-button>`:V`<ha-button
              appearance="filled"
              ?disabled=${!t}
              @click=${()=>this.next()}
            >
              ${this.t("next")}
              <ha-svg-icon slot="end" .path=${Ca}></ha-svg-icon>
            </ha-button>`}
      </div>
    `}renderStep(){switch(this.currentStep){case"source":return this.renderSource();case"zones":return this.renderZones();case"programs":return this.renderPrograms();default:return this.renderReport()}}choice(e,t,i,s,a=!1,n=e){const o=a||this.busy;return V`
      <div
        class="choice ${e?"selected":""} ${a?"disabled":""}"
        role="radio"
        aria-checked=${e?"true":"false"}
        aria-disabled=${o?"true":"false"}
        tabindex=${!a&&n?"0":"-1"}
        @click=${o?void 0:s}
        @keydown=${e=>{o||"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}
      >
        <div class="choice-title">${t}</div>
        <div class="choice-help">${i}</div>
      </div>
    `}moveChoice(e){const t=[...e.currentTarget.querySelectorAll(':scope > [role="radio"]')],i=t.indexOf(e.target);if(i<0)return;const s=function(e,t,i){const s=e.map((e,t)=>e?t:-1).filter(e=>e>=0);if(!s.length)return null;if("Home"===i)return s[0];if("End"===i)return s[s.length-1];const a="ArrowDown"===i||"ArrowRight"===i?1:"ArrowUp"===i||"ArrowLeft"===i?-1:0;if(!a)return null;const n=e.length;for(let i=1;i<=n;i++){const s=((t+a*i)%n+n)%n;if(e[s])return s}return null}(t.map(e=>"true"!==e.getAttribute("aria-disabled")),i,e.key);null!==s&&(e.preventDefault(),t[s].click(),t[s].focus())}renderSource(){var e,t;const i=this.source===sr||this.sources.some(e=>e.id===this.source&&!e.error),s=null!==(t=null===(e=this.sources.find(e=>!e.error))||void 0===e?void 0:e.id)&&void 0!==t?t:sr;return V`
      <h3 id="source-question">${this.t("source.question")}</h3>
      <div class="note">${this.t("source.help")}</div>
      ${this.importedAt?V`<div class="note">
            ${this.t("source.previous","at",new Date(this.importedAt).toLocaleString(this.lng))}
          </div>`:""}
      <div
        role="radiogroup"
        aria-labelledby="source-question"
        @keydown=${e=>this.moveChoice(e)}
      >
        ${this.sources.map(e=>this.choice(this.source===e.id,e.title,e.error?V`<span class="error"
                  >${this.t("source.unreadable")} ${e.error}</span
                >`:this.t("yaml"===e.id?"source.yaml-help":"source.entry-help"),()=>this.source=e.id,!!e.error,i?this.source===e.id:s===e.id))}
        ${this.loaded&&!this.sources.some(e=>!e.error)?V`<div class="note">${this.t("source.none-found")}</div>`:""}
        ${this.choice(this.source===sr,this.t("source.paste"),this.t("source.paste-help"),()=>this.source=sr,!1,i?this.source===sr:s===sr)}
      </div>
      ${this.source===sr?V`<textarea
            class="yaml"
            rows="12"
            spellcheck="false"
            aria-label=${this.t("source.paste")}
            placeholder="irrigation_unlimited:&#10;  controllers:&#10;    - name: …"
            ?disabled=${this.busy}
            .value=${this.yaml}
            @input=${e=>this.yaml=e.target.value}
          ></textarea>`:""}
    `}reasonText(e){return e?this.t(`zones.reason.${e}`):""}iuZoneName(e){var t,i,s;return null!==(s=null===(i=null===(t=this.preview)||void 0===t?void 0:t.zones.find(t=>t.key===e))||void 0===i?void 0:i.name)&&void 0!==s?s:e}zoneName(e){var t,i;return null!==(i=null===(t=this.zones.find(t=>t.id===e))||void 0===t?void 0:t.name)&&void 0!==i?i:String(e)}conflictText(e){switch(e.code){case"zone_twice":return this.t("conflicts.zone_twice","zone",this.iuZoneName(e.key),"other",this.iuZoneName(e.other),"target",this.zoneName(e.zone_id));case"calculated_needs_zone":return this.t("conflicts.calculated_needs_zone","zone",this.iuZoneName(e.key));default:return this.t(`conflicts.${e.code}`,"name",e.name||e.id,"id",e.id)}}async choose(e,t){var i,s;const a=t.value,n="new"===a?"new":Number(a),o=function(e,t,i,s){const a=Object.assign({},e);return i===s?delete a[t]:a[t]=i,a}(this.desired,e,n,this.baseline[e]);this.desired=o;const r=null===(i=this.preview)||void 0===i?void 0:i.zones.find(t=>t.key===e),l=r?String(ir(r)):a;if(!await this.refresh(o)){const i=null===(s=this.preview)||void 0===s?void 0:s.zones.find(t=>t.key===e);t.value=i?String(ir(i)):l}}renderZones(){const e=this.preview;if(!e)return V``;if(!e.zones.length)return V`<h3>${this.t("zones.question")}</h3>
        <div class="note">${this.t("zones.none")}</div>`;const t=function(e){var t,i,s;const a={};for(const n of null!==(t=null==e?void 0:e.conflicts)&&void 0!==t?t:[])"key"in n&&(a[n.key]=n),"zone_twice"===n.code&&(null!==(i=a[s=n.other])&&void 0!==i||(a[s]=n));return a}(e);return V`
      <h3>${this.t("zones.question")}</h3>
      <div class="note">${this.t("zones.help")}</div>
      ${e.links?V`<div class="note">
            ${this.t("zones.links","count",e.links)}
          </div>`:""}
      <div class="rows">
        ${e.zones.map(e=>{var i,s;const a=null===e.zone_id?"new":String(e.zone_id),n=or.filter(t=>{return!(null==(i=e.fields[t])||""===i||Array.isArray(i)&&0===i.length);var i}),o=t[e.key],r=null!==e.zone_id&&!this.zones.some(t=>t.id===e.zone_id);return V`
            <div class="row ${o?"conflict":""}">
              <div class="row-head">
                <div class="row-title">${e.name}</div>
                <select
                  class="field"
                  aria-label=${this.t("zones.becomes","zone",e.name)}
                  aria-invalid=${o?"true":"false"}
                  .value=${a}
                  @change=${t=>this.choose(e.key,t.target)}
                >
                  <option value="new" ?selected=${"new"===a}>
                    ${this.t("zones.new")}
                  </option>
                  ${this.zones.map(e=>V`<option
                        value=${String(e.id)}
                        ?selected=${a===String(e.id)}
                      >
                        ${e.name}
                      </option>`)}
                  ${r?V`<option value=${a} selected>
                        ${null!==(i=e.zone_name)&&void 0!==i?i:a}
                      </option>`:""}
                </select>
              </div>
              <div class="row-help">
                ${"create"===e.action?this.t("zones.creates"):this.t("zones.uses","zone",null!==(s=e.zone_name)&&void 0!==s?s:String(e.zone_id),"reason",this.reasonText(e.reason))}
                ${n.length?V`<br />${this.t("zones.fills")}
                      ${n.map(t=>`${this.t(`zones.fields.${t}`)}: ${this.fieldValue(t,e.fields[t])}`).join(" · ")}`:""}
              </div>
              ${o?V`<div class="error row-error">
                    ${this.conflictText(o)}
                  </div>`:""}
            </div>
          `})}
      </div>
      ${e.zones_left.length?V`<div class="note">
            ${this.t("zones.left","zones",e.zones_left.map(e=>this.zoneName(e)).join(", "))}
          </div>`:""}
    `}fieldValue(e,t){var i;if("supply_id"===e){const e=null===(i=this.preview)||void 0===i?void 0:i.supplies.find(e=>e.supply.id===t);if(e)return e.supply.name}return Array.isArray(t)?t.join(", "):String(t)}renderNameConflicts(){const e=(t=this.preview,(null!==(i=null==t?void 0:t.conflicts)&&void 0!==i?i:[]).filter(e=>!("key"in e)));var t,i;return e.length?V`<div class="error" role="alert">
      ${e.map(e=>V`<div>${this.conflictText(e)}</div>`)}
    </div>`:V``}renderPrograms(){var e,t,i,s;const a=this.preview;return a?V`
      <h3>${this.t("programs.question")}</h3>
      <div class="note">${this.t("programs.help")}</div>
      ${this.renderNameConflicts()}
      ${a.programs.length?"":V`<div class="note">${this.t("programs.none")}</div>`}
      <div class="rows">
        ${a.programs.map(e=>V`
            <div class="row">
              <div class="row-head">
                <div class="row-title">${e.program.name}</div>
                <span class="badge"
                  >${this.t(`programs.action.${e.action}`)}</span
                >
              </div>
              <ul class="lines">
                ${e.program.steps.map((t,i)=>{var s;return V`<li>
                      ${tr(null!==(s=e.zone_names[i])&&void 0!==s?s:[],t,this.t)}
                    </li>`})}
              </ul>
              <div class="row-help">
                ${e.program.schedules.length?e.program.schedules.map(e=>er(e,this.lng,this.t)).join("; "):this.t("programs.no-schedules")}
                <br />
                ${e.schedules_on?this.t("programs.schedules-stay-on"):this.t("programs.schedules-off")}
              </div>
            </div>
          `)}
      </div>
      ${a.removed.programs.length?V`<div class="note">
            ${this.t("programs.removed","programs",(null!==(t=null===(e=a.removed_names)||void 0===e?void 0:e.programs)&&void 0!==t?t:a.removed.programs).join(", "))}
          </div>`:""}
      ${a.supplies.length||a.removed.supplies.length?V`<h3>${this.t("supplies.title")}</h3>
            ${a.supplies.map(e=>V`<div class="note">
                  ${this.t(`supplies.${e.action}`,"name",e.supply.name,"entities",e.supply.entities.join(", "))}
                </div>`)}
            ${a.removed.supplies.length?V`<div class="note">
                  ${this.t("supplies.removed","supplies",(null!==(s=null===(i=a.removed_names)||void 0===i?void 0:i.supplies)&&void 0!==s?s:a.removed.supplies).join(", "))}
                </div>`:""}`:""}
    `:V``}renderReport(){var e;const t=this.preview;if(!t)return V``;const i=(s=t.report.items,["not_carried","unknown","approximated"].map(e=>({outcome:e,items:s.filter(t=>t.outcome===e)})).filter(e=>e.items.length>0));var s;const a=function(e){const t=(e,t)=>e.filter(t).length;return{zonesCreated:t(e.zones,e=>"create"===e.action),zonesFilled:t(e.zones,e=>"update"===e.action),zonesUsed:t(e.zones,e=>"use"===e.action),programsCreated:t(e.programs,e=>"create"===e.action),programsUpdated:t(e.programs,e=>"update"===e.action),programsRemoved:e.removed.programs.length,suppliesCreated:t(e.supplies,e=>"create"===e.action),suppliesUpdated:t(e.supplies,e=>"update"===e.action),suppliesRemoved:e.removed.supplies.length}}(t);return V`
      <h3>${this.t("report.question")}</h3>
      <div class="note">${this.t("report.help")}</div>
      ${i.length?i.map(e=>V`
              <h4>${this.t(`report.outcome.${e.outcome}`)}</h4>
              <ul class="lines">
                ${e.items.map(e=>V`<li>
                      ${e.subject?V`<b>${e.subject}</b>: `:""}${function(e,t){var i;if(!e.code)return e.note;try{const s=Object.entries(null!==(i=e.params)&&void 0!==i?i:{}).flat(),a=t(`notes.${e.code}`,...s);if("string"==typeof a&&a&&!a.startsWith("Translation"))return a}catch(e){}return e.note}(e,this.t)}
                      ${e.path?V`<span class="path">(${e.path})</span>`:""}
                    </li>`)}
              </ul>
            `):V`<div class="note">${this.t("report.all-carried")}</div>`}
      <h3>${this.t("report.summary-title")}</h3>
      <ul class="lines">
        <li>
          ${this.t("report.summary.zones","created",a.zonesCreated,"filled",a.zonesFilled,"used",a.zonesUsed)}
        </li>
        <li>
          ${this.t("report.summary.programs","created",a.programsCreated,"updated",a.programsUpdated,"removed",a.programsRemoved)}
        </li>
        <li>
          ${this.t("report.summary.supplies","created",a.suppliesCreated,"updated",a.suppliesUpdated,"removed",a.suppliesRemoved)}
        </li>
      </ul>
      ${this.fullController?"":V`<div class="notice">
            ${this.t("report.full-controller-off")}
          </div>`}
      ${this.blocked?V`<div class="error" role="alert">
            ${this.t("report.blocked")}
          </div>`:V`<div class="note">
            ${this.t(!1===(null===(e=this.preview)||void 0===e?void 0:e.iu_running)?"report.nothing-waters-iu-off":"report.nothing-waters")}
          </div>`}
    `}renderDone(e){var t;return V`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="done" role="status">${this.t("done.title")}</div>
          <ul class="lines">
            <li>
              ${this.t("done.zones","created",e.zones_created.length,"updated",e.zones_updated.length)}
            </li>
            <li>${this.t("done.programs","count",e.programs.length)}</li>
          </ul>
          <div class="note">
            ${this.t(`done.${this.fullController?"next":"next-off"}${!1===(null===(t=this.preview)||void 0===t?void 0:t.iu_running)?"-iu-off":""}`)}
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click=${()=>_a(0,jo(this.fullController?"programs":"general"))}
            >
              ${this.fullController?this.t("done.open-programs"):this.t("done.open-settings")}
            </ha-button>
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Gn} ${Kn}

      h3 {
        margin: 16px 0 4px;
        color: var(--primary-text-color);
      }
      h4 {
        margin: 12px 0 2px;
        color: var(--primary-text-color);
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin: 4px 0 8px;
      }
      .notice {
        border-left: 3px solid var(--warning-color, #ffa600);
        padding: 4px 8px;
        margin: 8px 0;
        color: var(--primary-text-color);
      }
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
      .choice.disabled {
        cursor: default;
        opacity: 0.7;
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
      textarea.yaml {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--code-font-family, monospace);
        font-size: 0.85em;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        resize: vertical;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 8px 0;
      }
      .row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
      }
      .row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .row-title {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .row-head select.field {
        flex: 0 1 260px;
        min-width: 0;
        max-width: 100%;
      }
      /* On a phone the choice takes its own line, whatever the name's length. */
      @media (max-width: 600px) {
        .row-head select.field {
          flex: 1 1 100%;
        }
      }
      .row.conflict {
        border-color: var(--error-color, #b71c1c);
      }
      .row-error {
        font-size: 0.9em;
        margin-top: 6px;
      }
      .row-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      .badge {
        font-size: 0.8em;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 1px 8px;
        color: var(--secondary-text-color);
      }
      ul.lines {
        margin: 4px 0;
        padding-left: 20px;
        color: var(--primary-text-color);
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .path {
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      .step-count {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .si-form-actions {
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      smart-irrigation-iu-cutover {
        display: block;
        margin-bottom: 16px;
      }
      .done {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--success-color, var(--primary-text-color));
      }
    `}};i([fe({attribute:!1})],rr.prototype,"hass",void 0),i([fe({type:Boolean})],rr.prototype,"narrow",void 0),i([ve()],rr.prototype,"step",void 0),i([ve()],rr.prototype,"sources",void 0),i([ve()],rr.prototype,"source",void 0),i([ve()],rr.prototype,"yaml",void 0),i([ve()],rr.prototype,"preview",void 0),i([ve()],rr.prototype,"choices",void 0),i([ve()],rr.prototype,"zones",void 0),i([ve()],rr.prototype,"busy",void 0),i([ve()],rr.prototype,"loaded",void 0),i([ve()],rr.prototype,"error",void 0),i([ve()],rr.prototype,"notice",void 0),i([ve()],rr.prototype,"result",void 0),i([ve()],rr.prototype,"fullController",void 0),i([ve()],rr.prototype,"importedAt",void 0),rr=i([pe("smart-irrigation-view-iuimport")],rr);const lr=Gn;var dr;!function(e){e.Setup="setup",e.IuImport="iu_import",e.Info="info",e.General="general",e.Zones="zones",e.Mappings="mappings",e.WeatherService="weatherservice",e.Skip="skip",e.History="history",e.BackupRestore="backuprestore",e.Help="help",e.Planning="planning",e.Programs="programs",e.Supplies="supplies"}(dr||(dr={}));const hr=[{id:"home",pages:[dr.Info,dr.History]},{id:"zones",pages:[dr.Zones]},{id:"data",pages:[dr.WeatherService,dr.Mappings,dr.Skip]},{id:"settings",pages:[dr.General,dr.BackupRestore,dr.Help]}],cr={[dr.Setup]:"settings",[dr.IuImport]:"settings"},ur={id:"watering",pages:[dr.Planning,dr.Programs,dr.Supplies]},pr={home:"M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22",zones:"M10 10H14V22H10V10M7 9H9V7H7V9M4 8H6V6H4V8M4 11H6V9H4V11M1 13H3V11H1V13M1 7H3V5H1V7M1 10H3V8H1V10M18 11H20V9H18V11M21 10H23V8H21V10M21 5V7H23V5H21M21 13H23V11H21V13M15 9H17V7H15V9M18 8H20V6H18V8M10 7H10.33L11 9H13L13.67 7H14V6H10V7Z",watering:qa,data:"M12.74,5.47C15.1,6.5 16.35,9.03 15.92,11.46C17.19,12.56 18,14.19 18,16V16.17C18.31,16.06 18.65,16 19,16A3,3 0 0,1 22,19A3,3 0 0,1 19,22H6A4,4 0 0,1 2,18A4,4 0 0,1 6,14H6.27C5,12.45 4.6,10.24 5.5,8.26C6.72,5.5 9.97,4.24 12.74,5.47M11.93,7.3C10.16,6.5 8.09,7.31 7.31,9.07C6.85,10.09 6.93,11.22 7.41,12.13C8.5,10.83 10.16,10 12,10C12.7,10 13.38,10.12 14,10.34C13.94,9.06 13.18,7.86 11.93,7.3M13.55,3.64C13,3.4 12.45,3.23 11.88,3.12L14.37,1.82L15.27,4.71C14.76,4.29 14.19,3.93 13.55,3.64M6.09,4.44C5.6,4.79 5.17,5.19 4.8,5.63L4.91,2.82L7.87,3.5C7.25,3.71 6.65,4.03 6.09,4.44M18,9.71C17.91,9.12 17.78,8.55 17.59,8L19.97,9.5L17.92,11.73C18.03,11.08 18.05,10.4 18,9.71M3.04,11.3C3.11,11.9 3.24,12.47 3.43,13L1.06,11.5L3.1,9.28C3,9.93 2.97,10.61 3.04,11.3M19,18H16V16A4,4 0 0,0 12,12A4,4 0 0,0 8,16H6A2,2 0 0,0 4,18A2,2 0 0,0 6,20H19A1,1 0 0,0 20,19A1,1 0 0,0 19,18Z",settings:"M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z"},gr=e=>e?[hr[0],hr[1],ur,...hr.slice(2)]:hr,mr=e=>{if(ur.pages.includes(e))return ur;const t=hr.find(t=>t.pages.includes(e));if(t)return t;const i=cr[e];if(i){const t=hr.find(e=>e.id===i);if(t)return Object.assign(Object.assign({},t),{pages:[...t.pages,e]})}return hr[0]};e.SmartIrrigationPanel=class extends ce{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100,this._languageReady=!1,this._fullController=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}willUpdate(){var e;const t=null===(e=this.hass)||void 0===e?void 0:e.language;if(!t||this._languageRequested===t)return;if(this._languageRequested=t,function(e){return li(e)in oi}(t))return void(this._languageReady=!0);const i=()=>{this._languageReady=!0,this._refreshViews()},s=setTimeout(i,600);(async function(e,t=""){const i=li(e);if(i in oi)return;if(!ni.includes(i))return;if(i in ri)return ri[i];const s=(async()=>{const e=new AbortController,s=setTimeout(()=>e.abort(),5e3);try{const s=t?`${ai}/${i}.json?v=${encodeURIComponent(t)}`:`${ai}/${i}.json`,a=await fetch(s,{signal:e.signal});if(!a.ok)throw new Error(`HTTP ${a.status}`);const n=await a.json();if(!n||"object"!=typeof n)throw new Error("not an object");oi[i]=n}catch(e){console.warn(`Smart Irrigation: could not load the ${i} translation, falling back to English`,e)}finally{clearTimeout(s),delete ri[i]}})();return ri[i]=s,s})(t,pi).then(()=>{clearTimeout(s),i()})}_refreshViews(){var e;this.requestUpdate(),null===(e=this.shadowRoot)||void 0===e||e.querySelectorAll("*").forEach(e=>{var t;return null===(t=e.requestUpdate)||void 0===t?void 0:t.call(e)})}async firstUpdated(){const e=Io();e.page&&Object.values(dr).includes(e.page)||_a(0,jo(dr.Info)),window.addEventListener("location-changed",()=>{if(!window.location.pathname.includes("smart_irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())}),this._readMode(),this.hass.connection.subscribeMessage(()=>this._readMode(),{type:gi+"_config_updated"}).catch(()=>{}),be().then(()=>{this._scheduleUpdate()}).catch(e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()})}render(){if(!this._languageReady)return V``;const e=Io(),t=!!customElements.get("ha-tab-group"),i=!!customElements.get("ha-tab-group-tab");return V`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${di("title",this.hass.language)}</div>
          <div class="version">${pi}</div>
        </div>

        ${t&&i?V`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${gr(this._fullController).map(t=>V`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${t.pages[0]}"
                      .active=${mr(e.page).id===t.id}
                    >
                      ${this._tabContent(t.id)}
                    </ha-tab-group-tab>
                  `)}
              </ha-tab-group>
            `:V`
              <div class="custom-tabs">
                ${gr(this._fullController).map(t=>V`
                    <button
                      class="custom-tab ${mr(e.page).id===t.id?"active":""}"
                      @click=${()=>this.navigateToPage(t.pages[0])}
                    >
                      ${this._tabContent(t.id)}
                    </button>
                  `)}
              </div>
            `}
        ${this.renderSubTabs(e.page)}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}_tabContent(e){return V`<span class="tab">
      <ha-svg-icon class="tab-icon" .path=${pr[e]}></ha-svg-icon>
      <span class="tab-label"
        >${di(`panels.groups.${e}`,this.hass.language)}</span
      >
    </span>`}renderSubTabs(e){const t=mr(e);return t.pages.length<2?"":V`
      <div class="sub-tabs">
        ${t.pages.map(t=>V`
            <button
              class="sub-tab ${e===t?"active":""}"
              @click=${()=>this.navigateToPage(t)}
            >
              ${di(`panels.${t}.title`,this.hass.language)}
            </button>
          `)}
      </div>
    `}getView(e){const t=e.page;switch(t){case"setup":return V`
          <smart-irrigation-view-setup
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></smart-irrigation-view-setup>
        `;case"iu_import":return V`
          <smart-irrigation-view-iuimport
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></smart-irrigation-view-iuimport>
        `;case"info":return V`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-info>
        `;case"planning":case"programs":case"supplies":return V`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
            .section=${t}
          ></smart-irrigation-view-general>
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
        `;case"mappings":return V`
          <div class="stack">
            <smart-irrigation-view-general
              .hass=${this.hass}
              .narrow=${this.narrow}
              .path=${e}
              .section=${"sensors"}
            ></smart-irrigation-view-general>
            <smart-irrigation-view-mappings
              .hass=${this.hass}
              .narrow=${this.narrow}
              .path=${e}
            ></smart-irrigation-view-mappings>
          </div>
        `;case"weatherservice":return V`
          <div class="stack">
            <smart-irrigation-view-weatherservice
              .hass=${this.hass}
              .narrow=${this.narrow}
              .path=${e}
            ></smart-irrigation-view-weatherservice>
            <smart-irrigation-view-general
              .hass=${this.hass}
              .narrow=${this.narrow}
              .path=${e}
              .section=${"weather"}
            ></smart-irrigation-view-general>
          </div>
        `;case"skip":return V`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
            .section=${"skip"}
          ></smart-irrigation-view-general>
        `;case"history":return V`
          <smart-irrigation-view-history
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-history>
        `;case"backuprestore":return V`
          <smart-irrigation-view-backuprestore
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-backuprestore>
        `;case"help":return V`<div class="help-cards">
          <ha-card
            header="${di("panels.help.cards.how-to-get-help.title",this.hass.language)}"
          >
            <div class="card-content">
              ${di("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
              <a href="https://altmenorg.github.io/HAsmartirrigation/"
                >${di("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
              >.
              ${di("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
              <a
                href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
                >${di("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
              >
              ${di("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
              <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
                >${di("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
              >
              (${di("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
            </div></ha-card
          ><ha-card
            header="${di("panels.help.cards.translate.title",this.hass.language)}"
          >
            <div class="card-content">
              ${di("panels.help.cards.translate.text",this.hass.language)}
              <a
                href="https://hosted.weblate.org/engage/smart-irrigation/"
                target="_blank"
                rel="noreferrer"
                >${di("panels.help.cards.translate.link",this.hass.language)}</a
              >.
            </div></ha-card
          >
        </div>`;default:return V`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}navigateToPage(e){if(e!==Io().page){const t=jo(e);_a(0,t),this.requestUpdate()}else scrollTo(0,0)}async _readMode(){try{const e=await Ka(this.hass);this._fullController=!0===(null==e?void 0:e.full_controller)}catch(e){console.error("Could not read the configuration:",e)}}handlePageSelected(e){const t=e.detail.name,i=Io().page;if(t===i||mr(t).id!==mr(i).id)if(t!==i){const e=jo(t);_a(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[lr,l`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
          /* The panel fills the screen and the page below the tabs is the one
             scroller. A fixed height guessed from the header sizes (it was
             100vh - 112px) overshot the screen, so Home Assistant's own
             container scrolled as well: two scrollbars, and on a phone a
             flick that stopped before the end of the page. */
          display: flex;
          flex-direction: column;
          /* Home Assistant gives a custom panel no height of its own, so the
             screen height is used (dvh follows the mobile address bar). Since
             mid-2026 it pads the panel's container with the status bar and
             navigation bar insets (home-assistant/frontend#53127): a full
             screen height plus that padding overshot the screen again, and
             the two scrollers were back on a phone (#1054). The insets are
             taken off; they are 0 where there are none. */
          height: calc(
            100vh - var(--safe-area-inset-top, 0px) - var(
                --safe-area-inset-bottom,
                0px
              )
          );
          height: calc(
            100dvh - var(--safe-area-inset-top, 0px) - var(
                --safe-area-inset-bottom,
                0px
              )
          );
        }
        .header {
          flex: none;
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

        .tab {
          display: inline-flex;
          align-items: center;
        }
        .tab-icon {
          display: none;
        }
        /* On a phone: every tab in view, as an icon over a short label. */
        @media (max-width: 600px) {
          ha-tab-group,
          .custom-tabs {
            margin-left: 0;
            margin-right: 0;
          }
          /* The tabs share the width, centred, instead of sitting on the
             left with the margins uneven (#1007). */
          ha-tab-group::part(nav),
          ha-tab-group::part(tabs) {
            width: 100%;
          }
          ha-tab-group::part(tabs) {
            justify-content: space-around;
          }
          ha-tab-group-tab {
            flex: 1 1 0;
          }
          /* The tab's inner box is inline and as wide as its content, so
             centring inside it did nothing: it takes the tab's width
             (#1016). */
          ha-tab-group-tab::part(base) {
            width: 100%;
            box-sizing: border-box;
            padding: 6px 2px;
            justify-content: center;
          }
          .custom-tab {
            flex: 1 1 0;
            min-width: 0;
            padding: 6px 2px;
            line-height: normal;
            letter-spacing: normal;
          }
          .tab {
            flex-direction: column;
            gap: 2px;
          }
          .tab-icon {
            display: block;
            --mdc-icon-size: 20px;
          }
          .tab-label {
            font-size: 11px;
            text-transform: none;
          }
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
          flex: none;
          display: flex;
          gap: 8px;
          padding: 8px max(env(safe-area-inset-left), 24px);
          background: var(
            --card-background-color,
            var(--primary-background-color)
          );
          border-bottom: 1px solid var(--divider-color);
          overflow-x: auto;
          /* On a phone the last chip was cut in half, with nothing saying the
             row scrolls: the chips go to a second line instead. */
          flex-wrap: wrap;
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
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          justify-content: center;
          overflow-y: auto;
        }

        .view > * {
          width: 100%;
          max-width: 1100px;
        }

        /* Two views on one page, one under the other. */
        .stack > * {
          display: block;
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
      `]}},i([fe({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),i([fe({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),i([ve()],e.SmartIrrigationPanel.prototype,"_languageReady",void 0),i([ve()],e.SmartIrrigationPanel.prototype,"_fullController",void 0),e.SmartIrrigationPanel=i([pe("smart-irrigation")],e.SmartIrrigationPanel);let fr=class extends ce{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?V`
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
              .path=${Na}
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
    `:V``}static get styles(){return l`
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.errortitle {
        font-size: 2em;
        font-weight: bold;
        vertical-align: bottom;
      }
    `}};i([fe({attribute:!1})],fr.prototype,"hass",void 0),i([ve()],fr.prototype,"_params",void 0),fr=i([pe("smart-irrigation-error-dialog")],fr);var vr=Object.freeze({__proto__:null,get ErrorDialog(){return fr}})}({});
//# sourceMappingURL=smart-irrigation.js.map
