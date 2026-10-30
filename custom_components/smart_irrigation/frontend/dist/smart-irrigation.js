!function(e){"use strict";function t(e,t){var i={};for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.indexOf(s)<0&&(i[s]=e[s]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(s=Object.getOwnPropertySymbols(e);a<s.length;a++)t.indexOf(s[a])<0&&Object.prototype.propertyIsEnumerable.call(e,s[a])&&(i[s[a]]=e[s[a]])}return i}function i(e,t,i,s){var a,n=arguments.length,r=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,s);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(r=(n<3?a(r):n>3?a(t,i,r):a(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const s=globalThis,a=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const l=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new o(i,e,n)},d=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:h,defineProperty:c,getOwnPropertyDescriptor:u,getOwnPropertyNames:p,getOwnPropertySymbols:g,getPrototypeOf:m}=Object,v=globalThis,f=v.trustedTypes,_=f?f.emptyScript:"",y=v.reactiveElementPolyfillSupport,w=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},$=(e,t)=>!h(e,t),x={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:$};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let k=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:a}=u(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);a?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const e=m(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,t=[...p(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(d(e))}else void 0!==e&&t.push(d(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),a=s.litNonce;void 0!==a&&t.setAttribute("nonce",a),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=s;const n=a.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,a){if(void 0!==e){const n=this.constructor;if(!1===s&&(a=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??$)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:a},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};k.elementStyles=[],k.shadowRootOptions={mode:"open"},k[w("elementProperties")]=new Map,k[w("finalized")]=new Map,y?.({ReactiveElement:k}),(v.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const S=globalThis,z=e=>e,T=S.trustedTypes,M=T?T.createPolicy("lit-html",{createHTML:e=>e}):void 0,O="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+A,E=`<${C}>`,D=document,H=()=>D.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,P="[ \t\n\f\r]",j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,U=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,B=/"/g,Y=/^(?:script|style|textarea|title)$/i,W=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=W(1),Z=W(2),G=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),K=new WeakMap,J=D.createTreeWalker(D,129);function X(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(t):t}class Q{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let a=0,n=0;const r=e.length-1,o=this.parts,[l,d]=((e,t)=>{const i=e.length-1,s=[];let a,n=2===t?"<svg>":3===t?"<math>":"",r=j;for(let t=0;t<i;t++){const i=e[t];let o,l,d=-1,h=0;for(;h<i.length&&(r.lastIndex=h,l=r.exec(i),null!==l);)h=r.lastIndex,r===j?"!--"===l[1]?r=I:void 0!==l[1]?r=L:void 0!==l[2]?(Y.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=U):void 0!==l[3]&&(r=U):r===U?">"===l[0]?(r=a??j,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?U:'"'===l[3]?B:F):r===B||r===F?r=U:r===I||r===L?r=j:(r=U,a=void 0);const c=r===U&&e[t+1].startsWith("/>")?" ":"";n+=r===j?i+E:d>=0?(s.push(o),i.slice(0,d)+O+i.slice(d)+A+c):i+A+(-2===d?t:c)}return[X(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=Q.createElement(l,i),J.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=J.nextNode())&&o.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(O)){const t=d[n++],i=s.getAttribute(e).split(A),r=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:r[2],strings:i,ctor:"."===r[1]?ae:"?"===r[1]?ne:"@"===r[1]?re:se}),s.removeAttribute(e)}else e.startsWith(A)&&(o.push({type:6,index:a}),s.removeAttribute(e));if(Y.test(s.tagName)){const e=s.textContent.split(A),t=e.length-1;if(t>0){s.textContent=T?T.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],H()),J.nextNode(),o.push({type:2,index:++a});s.append(e[t],H())}}}else if(8===s.nodeType)if(s.data===C)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=s.data.indexOf(A,e+1));)o.push({type:7,index:a}),e+=A.length-1}a++}}static createElement(e,t){const i=D.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,s){if(t===G)return t;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const n=N(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(t=ee(e,a._$AS(e,t.values),a,s)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??D).importNode(t,!0);J.currentNode=s;let a=J.nextNode(),n=0,r=0,o=i[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new ie(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new oe(a,this,e)),this._$AV.push(t),o=i[++r]}n!==o?.index&&(a=J.nextNode(),n++)}return J.currentNode=D,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),N(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>R(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(D.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new te(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new Q(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const a of e)s===t.length?t.push(i=new ie(this.O(H()),this.O(H()),this,this.options)):i=t[s],i._$AI(a),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=z(e).nextSibling;z(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,s){const a=this.strings;let n=!1;if(void 0===a)e=ee(this,e,t,0),n=!N(e)||e!==this._$AH&&e!==G,n&&(this._$AH=e);else{const s=e;let r,o;for(e=a[0],r=0;r<a.length-1;r++)o=ee(this,s[i+r],t,r),o===G&&(o=this._$AH[r]),n||=!N(o)||o!==this._$AH[r],o===q?e=q:e!==q&&(e+=(o??"")+a[r+1]),this._$AH[r]=o}n&&!s&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ae extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class ne extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class re extends se{constructor(e,t,i,s,a){super(e,t,i,s,a),this.type=5}_$AI(e,t=this){if((e=ee(this,e,t,0)??q)===G)return;const i=this._$AH,s=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le={I:ie},de=S.litHtmlPolyfillSupport;de?.(Q,ie),(S.litHtmlVersions??=[]).push("3.3.3");const he=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */let ce=class extends k{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let a=s._$litPart$;if(void 0===a){const e=i?.renderBefore??null;s._$litPart$=a=new ie(t.insertBefore(H(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};ce._$litElement$=!0,ce.finalized=!0,he.litElementHydrateSupport?.({LitElement:ce});const ue=he.litElementPolyfillSupport;ue?.({LitElement:ce}),(he.litElementVersions??=[]).push("4.2.2");
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
     */function ve(e){return(t,i)=>"object"==typeof i?me(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function fe(e){return ve({...e,state:!0,attribute:!1})}
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
function _e(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}let ye=!1,we=null;const be=async()=>{if(ye&&we)return we;if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-panel-config"))return Promise.resolve();ye=!0,we=async function(){try{await new Promise(e=>{"requestIdleCallback"in window?requestIdleCallback(()=>e()):setTimeout(()=>e(),0)}),await customElements.whenDefined("partial-panel-resolver");const e=document.createDocumentFragment(),t=document.createElement("partial-panel-resolver");e.appendChild(t),t.hass={panels:[{url_path:"tmp",component_name:"config"}]},await new Promise(e=>queueMicrotask(()=>e())),t._updateRoutes(),await t.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await new Promise(e=>queueMicrotask(()=>e()));const i=document.createElement("ha-panel-config");e.appendChild(i),await i.routerOptions.routes.automation.load(),e.textContent=""}catch(e){console.error("Failed to load HA form elements:",e)}}();try{await we}finally{ye=!1,we=null}};var $e={loading:"Loading",saving:"Saving",actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes",enabled:"Enabled",disabled:"Disabled",before:"before",after:"after"},units:{seconds:"seconds",minutes:"min",hours:"h"},attributes:{size:"size",throughput:"throughput",state:"state",bucket:"bucket",last_updated:"last updated",last_calculated:"last calculated",number_of_data_points:"number of data points"},"loading-messages":{configuration:"Loading configuration...",modules:"Loading modules...",general:"Loading..."},"saving-messages":{adding:"Adding...",saving:"Saving..."},modes:{manual:"Manual",standard:"Standard",advanced:"Advanced"}},xe={"default-zone":"Default zone","default-mapping":"Default sensor group"},ke={calculation:{explanation:{"formatting-note":"Note: this explanation uses '.' as decimal separator, shows rounded and metric values.","module-returned-evapotranspiration-deficiency":"Module returned Crop evapotranspiration deficiency ( = et0 * hour_multiplier * Kc + precipitation) of","module-returned-hourly-evapotranspiration-deficiency":"Module summed the Crop evapotranspiration deficiency hour by hour ( = sum of hourly et0 * Kc + precipitation) over","crop-factor-is":"Crop factor is","bucket-was":"Bucket was","new-bucket-values-is":"New bucket value is",bucket:"bucket","old-bucket-variable":"old_bucket","max-bucket-variable":"max_bucket",delta:"delta","bucket-less-than-zero-irrigation-necessary":"Since bucket < 0, irrigation is necessary","steps-taken-to-calculate-duration":"To calculate the exact duration, the following steps were taken","precipitation-rate-defined-as":"The precipitation rate is defined as","precipitation-rate-is":"The precipitation rate is","duration-is-calculated-as":"The duration is calculated as",drainage:"drainage","drainage-rate":"drainage_rate",hours:"hours","precipitation-rate-variable":"precipitation_rate","multiplier-is-applied":"Now, the multiplier is applied. The multiplier is","duration-after-multiplier-is":"hence the duration is","maximum-duration-is-applied":"Then, the maximum duration is applied. The maximum duration is","duration-after-maximum-duration-is":"hence the duration is","lead-time-is-applied":"Finally, the lead time is applied. The lead time is","duration-after-lead-time-is":"hence the final duration is","bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":"Since bucket >= 0, no irrigation is necessary and duration is set to","maximum-bucket-is":"Maximum bucket size is","drainage-rate-is":"Drainage rate when saturated (bucket at max) is","current-drainage-is":"Current drainage is calculated as","drainage-replayed":"The window was replayed hour by hour, so each rain drained only from the hour it fell. Drainage over","no-drainage":"Current drainage is 0 because","below-irrigation-threshold":"The deficit has not reached this zone's irrigation threshold yet, so no irrigation is necessary and the duration is set to 0. Deficit / threshold:"}}},Se={pyeto:{description:"The full calculation, from your own weather sensors: temperature, humidity, pressure, wind and solar radiation. The most accurate option, and the one that asks for the most."},static:{description:"A fixed amount of evaporation per day, which you set yourself. No sensors and no weather service."},passthrough:{description:"Takes an evapotranspiration figure that already exists, from a sensor or from a weather service that publishes one. The recommended path when you have one."}},ze={setup:{title:"Setup",description:"A guided way to create your first zone. It asks one question at a time, and only the questions your previous answers leave open.",next:"Next",back:"Back",create:"Create it",creating:"Creating...",failed:"Something went wrong and nothing was created. The other tabs are still there if you would rather set it up by hand.",done:"Your zone is ready.","done-note":"It appears under Zones, with its sensor group under Sensor groups. Nothing here is special: edit either of them as you would any other. Run an update and a calculation once your sensors have reported, and the zone will start producing a duration.",steps:{zone:{question:"What are you watering?",help:"One zone is one valve, watering one area.",name:"Name",size:"Area",throughput:"Throughput","throughput-help":"How much water this zone delivers per minute. Measure it if you can, rather than taking it from a datasheet: it is what every duration is derived from, and it is the quietest way to water twice as long as you meant to."},environment:{question:"Where does it grow?",outdoors:"Outdoors","outdoors-help":"Open air. Rain reaches it, and the sky is worth asking about.","under-glass":"Under glass or plastic","under-glass-help":"A greenhouse, a polytunnel, a conservatory. No rain arrives, and a forecast describes weather these plants never see."},weather:{question:"Where should the evaporation figure come from?",service:"The weather service you configured","service-help":"Nothing else to install. Smart Irrigation takes the weather for your location and computes evapotranspiration from it.","no-service-indoors":"A weather service is not offered here: it describes the sky, which these plants are not under.",sensors:"My own weather sensors","sensors-help":"You have sensors for temperature, humidity and the rest. The most accurate option, because it measures where the plants actually are.",et:"A sensor that already reports evapotranspiration","et-help":"Something else already computes it, and Smart Irrigation should use that figure as it stands.",static:"A fixed amount per day","static-help":"No sensors and no service. You give one number and it is used every day. Rough, but it still tracks what you have already watered.","service-help-entity":"The current values and the forecast come from your weather entity, and Smart Irrigation computes evapotranspiration from them. The rain comes from a rain sensor of yours, asked for in the next step."},sensors:{question:"Which entities should it read?",help:"Only the ones the calculation actually uses are asked for.","help-optional":"Fields marked optional can stay empty: missing weather values are estimated, and without a rain sensor no rain is credited.",optional:"optional","lux-hint":"Under glass a light sensor can stand in for solar radiation: pick your illuminance entity here and set its source to Light sensor (lux) afterwards, in the sensor group.","static-question":"How much does it evaporate per day?","static-help":"A depth of water, in the unit your zones use. Somewhere around 4 to 5 mm a day is common for a temperate summer.","static-label":"Evaporation per day","rain-help-entity":"This weather entity only forecasts rain. Pick a sensor that measures rain for one of these fields: a rate or a gauge total. No rain sensor? Use Open-Meteo instead."},review:{question:"Ready to create",zone:"Zone",environment:"Environment",engine:"Calculation engine",sources:"Sources","from-the-service":"from the weather service",help:"This creates a calculation module, a sensor group and a zone, exactly as the other tabs would. Nothing is locked afterwards."}},step:"step"},weatherservice:{history:{title:"History",refresh:"Refresh","last-update":"Last update",time:"Retrieved","sensor-group":"Sensor group","no-data":"No data has been retrieved from the weather service yet."},title:"Weather service",description:"View and change the weather service used to fetch weather data — no need to reinstall the integration. The API key is validated and the change is applied immediately.",labels:{"use-weather-service":"Use a weather service",service:"Weather service","api-key":"API key","ha-weather-entity":"A weather entity in Home Assistant","weather-entity":"Weather entity"},actions:{save:"Save",saving:"Saving…","open-sensor-groups":"Open sensor groups"},messages:{"no-service":"No weather service is used — weather data comes from your own sensors only.",saved:"Weather service updated and applied.","reload-note":"Saving validates the API key against the service and applies the change immediately.","owm-onecall-hint":"OpenWeatherMap needs the One Call API 3.0 plan (One Call by Call). It is free up to 1000 calls/day but must be activated with a card, and a new key can take up to a couple of hours to work. A plain default key is rejected.","ha-entity-hint":"Current values and the forecast come from this entity, solar radiation and reference ET from Open-Meteo. It only forecasts rain: give each sensor group a rain sensor under Current precipitation.","rain-groups-on-service":"{count, plural, one {# sensor group still takes its} other {# sensor groups still take their}} rain from the weather service, which reports none: {groups}. Choose a rain sensor under Current precipitation, or the zones are watered after every shower.","reload-note-entity":"Saving checks that the entity exists and applies the change immediately.","invalid-entity":"Choose a weather entity: this one does not exist any more, or is not a weather entity."}},backuprestore:{title:"Backup / restore",description:"Export the full Smart Irrigation configuration to a JSON file, or restore it from a previous backup.",cards:{backup:{title:"Backup",description:"Download the complete configuration (general settings, zones, modules and sensor groups) as a JSON file."},restore:{title:"Restore",description:"Load a previously exported JSON file to replace the current configuration."}},actions:{export:"Export to JSON","choose-file":"Choose a backup file…",restore:"Restore this backup",restoring:"Restoring…"},messages:{exported:"Backup file downloaded.",restored:"Configuration restored — reloading the integration.","invalid-file":"This file is not a valid Smart Irrigation backup.","confirm-title":"Replace the entire configuration?",summary:"This backup contains","confirm-warning":"Restoring overwrites all current general settings, zones, modules and sensor groups. This cannot be undone.","reload-note":"Restoring replaces everything and reloads the integration to apply the change."}},general:{cards:{"automatic-duration-calculation":{header:"Calculating the watering duration",description:"The watering duration of each zone comes from its water balance: what the weather took out of the soil, minus the rain. Here you choose when it is calculated. What starts the watering is decided elsewhere, by the start trigger.",labels:{"calc-when":"Watering duration calculated","calc-when-time":"At a fixed time","calc-when-start":"Just before each start","calc-when-manual":"Only when I ask","calc-when-hint":"Just before each start: at the time of the start trigger, with the freshest weather. The right choice when Smart Irrigation starts the watering (direct valve control or the start event). At a fixed time: every day at the time below, for something other than Smart Irrigation that starts the watering and reads the durations when it likes (Irrigation Unlimited, a schedule of your own). Only when I ask: nothing is calculated by itself, use the calculate buttons or the services.","calc-time":"Calculate at","calc-time-hint":"The daily calculation: the water lost is added to the bucket of each zone and the watering durations are set.","hourly-calculation":"Calculate evapotranspiration hour by hour","hourly-calculation-hint":"Sums the FAO-56 hourly equation over each hour since the last calculation, instead of applying the daily equation to the averages, which hides whether the sun and the heat came together. A new installation starts on it; an installation set up before it arrived keeps the daily equation until you switch, because the two give different numbers and your watering should not change on an update. The sun of each hour comes from a radiation or illuminance sensor, from the weather service's own hourly history, or from the day's temperature range. It is worth having when readings arrive through the day: one update a day leaves a single reading held across twenty-four hours, and neither form is trustworthy then. A greenhouse with no sensor of its own keeps the daily equation."}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weather data update time on or after calculation time"},header:"Automatic weather data update",description:"Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-schedule":"Update schedule","auto-update-time":"Update at","auto-update-interval":"Update sensor data every","auto-update-delay":"Update delay"},options:{minutes:"minutes",hours:"hours",days:"days"}},continuousupdates:{header:"Continuous updates for sensors",description:"Records every change of a sensor of the group, instead of one reading per update, so the hourly calculation and the rain work from finer data: a rain gauge that reports every ten minutes is read every ten minutes. The zones are not calculated again at each change; the scheduled calculation does that, once, from the readings recorded. In a group that also uses a weather service, its sensors are recorded as they change and the service is still read once per update, so it costs no extra requests.",labels:{continuousupdates:"Enable continuous updates",sensor_debounce:"Sensor debounce"}},"panel-mode":{header:"Panel",labels:{advanced:"Advanced settings","advanced-hint":"Shows the settings that tune the model: drainage, thresholds, multiplier, how far ahead a zone looks. They have sound defaults; leave this off unless you know you need them. Your values are kept either way."}},"setup-assistant":{description:"Four questions at most, and it creates a sensor group and a zone for you, choosing what each needs. For a first zone, another one, or a fresh start.",open:"Open the assistant"},"iu-import":{description:"Moving over from Irrigation Unlimited? Bring its zones, sequences and schedules here, with a preview of everything first.",open:"Import"}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"},translate:{title:"Help translate",text:"Apart from English and French, the translations of this panel were machine-made and nobody who speaks the language has checked them yet. If a word or a sentence reads oddly in yours, you can correct it in your browser, with no technical knowledge needed.",link:"Translate on Weblate"}}},info:{title:"Info",description:"What will happen at the next start, and why.","configuration-not-available":"Configuration not available.",cards:{"next-run":{title:"Next run",labels:{start:"Starts",duration:"Total duration",zones:"Zones watering",trigger:"Trigger"},"no-start":"No start time could be worked out yet.","nothing-to-water":"Nothing to water: no zone has reached its irrigation threshold.","trigger-default":"Default, finishing at sunrise","main-schedules":"Started by the main program's schedules (the start trigger is not used for now)","accounts-for-duration":"counted back so the run finishes then","starts-at-trigger":"starts at that moment","sequencing-sequential":"one zone at a time, so the total is every zone added up",estimated:"Estimated: the zones are calculated again just before the start.","sequencing-parallel":"all zones at once, so the total is the longest zone","headline-nothing":"Nothing to water","sub-nothing":"No zone is short enough of water yet. The next start would be {start}.","next-program":"Next program: {program}, {start}","headline-watering":"Watering {start}","headline-watering-soon":"Watering at the next start","sub-watering":"{count} zone(s), {duration} in all.","headline-postponed":"Watering is held back","sub-postponed":"You postponed it. It resumes by itself, and nothing is lost: a zone that is short of water still is.","headline-skipped":"No watering today","headline-not-scheduled":"A run is owed, and nothing is scheduled to start it","sub-not-scheduled":"The time above is when it would start. No start trigger is armed right now, which happens when the active trigger is disabled or was not registered. Check the trigger under Settings, and if it looks right, a calculation re-arms it.","headline-no-trigger":"No trigger is active","sub-no-trigger":"Smart Irrigation starts no watering. Choose a start trigger in the settings to have it water."},decision:{title:"Will it be skipped?","will-run":"Nothing is holding the run back.","will-skip":"The run would be skipped.","preview-note":"Evaluated just now. A forecast can still change before the start.",unavailable:"The skip conditions could not be evaluated.","last-title":"Last real decision","last-none":"No run has been decided yet.","last-skipped":"Skipped","last-ran":"Went ahead","check-precipitation":"Rain forecast","check-days_between":"Days between irrigation","state-off":"Off","state-unavailable":"Could not be checked","state-passing":"Not blocking","state-blocking":"Blocking","detail-forecast":"Forecast","detail-threshold":"Threshold","detail-days-since":"Days since last run","detail-days-required":"Days required","check-rain_sensor":"Rain sensor","check-freeze":"Freeze","check-wind":"Wind","check-soil_moisture":"Soil moisture","detail-now":"Now","detail-weather-service":"weather service","detail-raining":"It is raining","detail-dry":"Not raining","detail-held":"sits out this run","check-postponed":"Postponed by you"},estimate:{title:"Where each zone stands now",note:"Estimated by running the calculation on the readings collected since it last ran. Nothing is committed: a zone keeps the value from its last calculation until the next one.",none:"No zone can be estimated yet.",labels:{now:"Now","at-last-calculation":"At last calculation","would-water":"Would water","last-irrigation":"Last watered"},nothing:"nothing","never-watered":"never"},postpone:{prompt:"Rain the forecast missed, or a reason of your own?","for-24":"Hold for 24 h","for-48":"Hold for 48 h",until:"Watering is held back until",resume:"Resume now"},forecast:{today:"Today"},stale:{title:"A zone is no longer being calculated",body:"Its water need is older than the others, so it is watering on old weather. Check that its sensor group still receives data, and look at the log for what the calculation said about it.",never:"never calculated"}},gaps:{auto_calc_off:{title:"No watering duration is being calculated",body:'The watering duration is set to "Only when I ask", so the zones\' durations never update by themselves. Choose "At a fixed time" or "Just before each start" under Settings, or calculate by hand when you want a run.'},no_automatic_zone:{title:"No zone waters on its own",body:"Every zone is manual or disabled, so a start reaches nothing. Set a zone to automatic for it to be watered by the schedule."},no_valve_path:{title:"Nothing here opens a valve",body:"Smart Irrigation calculates how long to water; something has to act on it. Either link a valve to a zone and turn on direct valve control, or write an automation on the start event (the blueprints do this for you). If an automation already does it, there is nothing to change."}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",riemannsum:"Riemann sum",sum:"Sum",delta:"Delta"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it.",invalid_source:"Invalid source",source_does_not_exist:"Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."},hidden_sources:"{n} reading(s) not asked: the evapotranspiration is given ready-made, they would only serve to recalculate it.",et_ignored:"Zone(s) {zones} are calculated from the weather and do not read this evapotranspiration. Set them to provided by a sensor or a service on the zone.",et_missing:"Zone(s) {zones} expect a ready-made evapotranspiration: choose a source for it above.",et_unused:"Not used: every zone of this group is calculated by Smart Irrigation, which works the evapotranspiration out from the other readings. Set a zone to provided by a sensor or a service to give a ready-made value here.",et_needed:"A ready-made value is needed here: the zones of this group are set to provided by a sensor or a service, so None is not offered.",hints:{temperature:"Air temperature, in the shade. The day's minimum and maximum are taken from it.",dewpoint:"The temperature at which the air would be saturated, which tells how much vapour it holds. The weather service is fine here.",humidity:"Relative humidity of the air. Dry air draws more water out of the plants.",pressure:"Atmospheric pressure. It changes the result very little: the weather service is enough.",windspeed:"Wind carries the humidity away from the leaves. Under glass, set a fixed value near 0.","solar radiation":"The energy of the sun, the main driver of evaporation. Without it the calculation estimates it from the day's temperature range. Under glass, use a radiation sensor or a light sensor.",precipitation:"Rain that fell, as a total, from a rain gauge of your own that adds up. With a weather service, leave it on None.","current precipitation":"Rain falling now, as a rate. The weather service provides it; a rain sensor of your own is more precise.",evapotranspiration:"A ready-made evapotranspiration (ET₀), from your own sensor or from the weather service. Only the zones set to provided by a sensor or a service read it. For a zone calculated by Smart Irrigation this line is not used: the weather service then only supplies the inputs (temperature, humidity, wind, radiation) of Smart Irrigation's own calculation."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation","current precipitation":"Current precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},pressure_types:{absolute:"absolute",relative:"relative"},"pressure-type":"Pressure is","sensor-aggregate-use-the":"How the readings are combined","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",none_et:"None (Smart Irrigation calculates it)",weather_service:"Weather service",weather_service_et:"Ready-made ET₀ from the weather service",sensor:"Sensor",static:"Static value",radiation_sensor:"Radiation sensor",illuminance:"Light sensor (lux)"},greenhouse:"Greenhouse",greenhouse_description:"An enclosed environment: a greenhouse, a polytunnel, anything under glass or plastic. No rain reaches these zones, so precipitation is left out of their water balance and its fields are hidden. Two things to set yourself, because they cannot be guessed: give Wind speed a static value near 0, since the calculation assumes open air, and use a light sensor for Solar Radiation, since the glazing filters the sky.",module:"Calculation engine",module_description:"This group only offers the sources this engine reads. The zones using it inherit the choice.",module_undecided:"No engine chosen yet, so every source is offered and each zone using this group keeps its own. Pick one to see only the sources it reads.",wind_height:"Anemometer height (empty: taken at 2 m)",rain_not_from_entity:"The weather entity reports no rain that fell, only a forecast: choose a rain sensor here, or the zones are watered after every shower.",rain_hint_entity:"Rain falling now, as a rate. The weather entity only forecasts it: choose a sensor that measures rain."}},description:"Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name","show-more":"{count, plural, one {Show # more sensor group} other {Show # more sensor groups}}"},no_items:"There are no sensor group defined yet.",title:"Sensor groups","weather-records":{title:"Weather records (last 10)",timestamp:"Time",temperature:"Temp",humidity:"Humidity",precipitation:"Precip","retrieval-time":"Retrieved","no-data":"No weather data available for this sensor group"},summary:{"sources-one":"{n} source","sources-other":"{n} sources","zones-one":"{n} zone","zones-other":"{n} zones"}},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature",EstimateFromSunHoursAndTemperature:"Estimate from average of sun hours and temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket","view-weather-info":"View weather data","view-weather-info-message":"Weather data available for","view-watering-calendar":"View watering calendar",water:"Water"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets","clear-all-weatherdata":"Clear all weather data"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket","et-deficiency":"Daily ET deficiency",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Crop factor (Kc)",name:"Name","input-method":"Input method","input-methods":{throughput:"Throughput & area",direct:"Precipitation rate"},"input-method-hint":"How the water delivered is known: from the area and the flow of the zone, or directly as a precipitation rate if you have measured it.","state-hint":"Automatic: Smart Irrigation calculates the duration from the water balance and waters at the start. Manual: it waters only when you ask, for the duration you type. Disabled: never watered, and its balance is not followed.","mapping-hint":"The group of sensors this zone reads its weather from: a weather service, your own sensors, or both.","bucket-hint":"The water balance of the zone. Negative: it is short of water. Zero: it has what it needs. Watering brings it back to zero.","maximum-bucket-hint":"The most water the soil is taken to hold. A positive balance never goes above it: the surplus is lost.","irrigation-threshold-hint":"The deficit from which the zone is watered. Under it, the zone is left alone and the deficit rolls over to the next calculation.","drainage_rate-hint":"How fast the soil lets surplus water go. Leave the default if you do not know your soil: 0 means the surplus never drains.","precipitation-rate":"Precipitation rate",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket",last_calculated:"Last calculated","data-last-updated":"Data last updated","data-number-of-data-points":"Number of data points",drainage_rate:"Drainage rate","linked-entity":"Linked valve/switch","linked-entity-hint":"The valve or switch that waters this zone. Smart Irrigation opens and closes it when direct valve control is on. With observed watering on, any run of it (a manual tap, an automation, or Smart Irrigation itself) credits the bucket from the run time and the zone's throughput.",supply:"Pump or main valve","supply-none":"None","measured-flow-help":"Over several runs the zone's flow meter measured a flow that differs from the one set above. It is advice, never applied on its own.","use-measured-flow":"Use the measured flow","extra-valves":"Other valves of the zone","extra-valves-hint":"opened and closed together with it","flow-sensor":"Cumulative volume meter","flow-sensor-hint":"For exact crediting instead of throughput x time: a cumulative water-meter total (state class total_increasing), not an instant flow rate. The unit is read automatically (L, mL, m³, gal, ft³).","confirm-timeout":"Wait for the valve to confirm","open-resends":"Send the open again","confirm-timeout-help":"How long the valve has to report that it opened or closed, and how many times the open is sent again in that time. Empty keeps the defaults: 8 seconds without a resend, or 30 seconds and two resends with the full controller, and 5 seconds for a close. A cloud valve such as Gardena confirms slowly and counts every command against a quota: give it a longer wait and 0 resends. A close is always tried a second time.","safety-off-topic":"Safety off MQTT topic","safety-off-state-key":"Safety off state key","safety-off-mode":"Safety off mode","safety-off-mode-auto":"Automatic (MQTT topic, or a Sonoff SWV on ZHA)","safety-off-mode-zha":"ZHA timed off","safety-off-mode-off":"Off (no dead-man)","safety-off-mode-help":"The valve closes by itself if Home Assistant stops in the middle of a run. Automatic uses the MQTT topic above when there is one, and a Sonoff SWV on ZHA is armed on its own. ZHA timed off also arms any other ZHA valve with the standard timed-off command, which is not verified on other models. Off never arms a hardware dead-man for this zone.","safety-off-topic-help":'Optional hardware dead-man. An MQTT set-topic (e.g. zigbee2mqtt/my_valve/set) the valve\'s device listens on. Smart Irrigation publishes an "on with timed off" there so the device shuts the valve off by itself if Home Assistant stops mid-run and never sends the close. The state key is the device\'s on/off property ("state", or "state_l1"…"state_l4" for a multi-channel device). Support depends on the device firmware (on_time) — test it before relying on it. Leave empty to disable.',optional:"optional","irrigation-threshold":"Irrigation threshold",days:"days","days-between-irrigation":"Days between irrigation","crop-factor-by-month":"Crop factor by month","crop-factor-by-month-help":"For a crop whose water use follows its growth: the crop factor (Kc) of each month, January first. A month left empty uses the crop factor above, and all twelve empty is that crop factor all year. Seasonal adjustments still apply on top.",months:{1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"},"available-water":"Available water","allowed-depletion":"Allowed depletion","available-water-help":"How much water the soil of this zone holds for the plants, in mm (the root depth in metres times what the soil holds per metre: about 50 to 110 mm for sand, 130 to 180 for loam, 120 to 200 for clay, from FAO-56). Leave empty to leave things as they are. When set, the deficit cannot go below it, and once the plants have used up the allowed share of it (50% unless you change it) they draw less water, so the deficit stops growing as fast.","distribution-efficiency":"Distribution efficiency","distribution-efficiency-help":"The share of the water leaving the emitters that reaches the plants, in %. Sprinklers in wind or on a slope lose some, drip loses almost none. Leave empty for 100%. A zone at 80% waters 25% longer for the same depth, and credits only 80% of what it delivers.","days-between-irrigation-help":"Leave empty to follow the general setting (Settings, Days between irrigation). A number replaces the general setting for this zone alone: 1 waters it every day if it needs water, 3 at most every third day, 0 removes the restriction. The days are counted from the last time this zone was watered.","soil-moisture-sensor":"Soil moisture sensor","soil-moisture-sensor-hint":"The zone sits out a run while the soil is at or above the threshold. The bucket is kept.","soil-moisture-threshold":"Skip at or above","calculation-method":"Evapotranspiration","calculation-method-help":{from_weather:"From your measurements: temperature, humidity, wind, sun.",provided:"You already have an evapotranspiration in mm; it is taken as it is.",fixed:"So many mm a day, whatever the weather."},"calculation-methods":{from_weather:"Calculated by Smart Irrigation",provided:"Provided by a sensor or a service",fixed:"A fixed amount"},"forecast-days":"Look ahead","forecast-days-help":"0: the zone waters what the weather actually took. 1: tomorrow is taken into account as well, 2: tomorrow and the day after, and so on. The hotter the days ahead, the more is watered today. This is not the rain skip, which is a setting of its own.","fixed-amount":"Evaporation per day","engine-shared-help":"This setting belongs to this zone alone: each zone has its own, and changing it here changes nothing anywhere else.","soil-type":"Soil","plant-type":"What grows here","soil-types":{sand:"Sandy",sandy_loam:"Sandy loam",loam:"Loam",clay_loam:"Clay loam",clay:"Clay",custom:"I set the drainage rate myself"},"plant-types":{lawn:"Lawn",vegetables:"Vegetables",flowers:"Flowers",shrubs:"Shrubs",hedge:"Hedge",fruit_trees:"Fruit trees",vines:"Vines",ground_cover:"Ground cover",custom:"I set the crop coefficient myself"},"duration-readonly-automatic":"Calculated for you: this zone's run comes from its water balance. Set it to manual to type a duration yourself.","duration-readonly-disabled":"A disabled zone is never watered, so it has no run time.","et-deficiency-help":"What this zone needs per day: ETc, the reference evapotranspiration times the crop factor, seasonal adjustment included. Before the interval scaling and before rain, which is what makes it comparable from one configuration to the next. The zone sensor also carries the reference figure on its own, as the `eto` attribute, for holding against what a weather service publishes."},no_items:"There are no zones defined yet.",title:"Zones","module-comes-from-the-group":"The calculation engine comes from this zone's sensor group. Change it there, and every zone using that group follows.",status:{estimate:"Short by {short}: about {duration} ({volume}) at the next calculation.","will-water":"Will water {duration} at the next start.",idle:"Nothing to water: {short} short.",satisfied:"Nothing to water: this zone has what it needs.","under-threshold":"Nothing to water yet: {short} short, under this zone's threshold.",manual:"Waters only when you ask.",disabled:"Disabled: never watered, and its balance is not kept.",threshold:"threshold"},calendar:{title:"Watering calendar (12 months, estimated)",caveat:"A planning estimate, not your weather: the months are modelled from your latitude and a typical seasonal pattern, so a continental summer reads hotter and drier than it is. It influences nothing, calculates nothing and waters nothing.",month:"Month",et:"ET",precipitation:"Precipitation",watering:"Watering","avg-temp":"Avg temp",none:"No watering calendar data available for this zone",error:"Could not generate the calendar"},water:{question:'Water "{name}" now? Its valve opens straight away, or takes its turn if something is watering. The water is counted in its balance.',minutes:"Minutes, empty for the {calculated} of the planning","minutes-none":"Minutes (the calculation has nothing to water)"}},history:{title:"History",description:"Every irrigation run Smart Irrigation has credited to a zone: when it started, how long it watered and how much water it used. Runs are recorded by direct valve control and by observed watering, and are kept for 90 days.",refresh:"Refresh","no-data":"No irrigation runs have been recorded yet.",table:{title:"Irrigation runs",start:"Start",zone:"Zone",duration:"Duration",water:"Water used",truncated:"Showing the {count} most recent runs out of {total}."},charts:{"total-title":"Total water used per day (last 30 days)","per-zone-title":"Water used per day, per zone (last 30 days)","no-data":"No water was used in this period."}},groups:{home:"Home",zones:"Zones",data:"Data",settings:"Settings",watering:"Watering"},planning:{title:"Planning"},programs:{title:"Programs"},supplies:{title:"Pumps and valves"},iu_import:{title:"Import from Irrigation Unlimited",description:"Brings your Irrigation Unlimited configuration over: its zones, sequences and schedules become zones, programs and their schedules here. You see everything before anything is changed, and nothing waters until you switch the schedules on.",loading:"Looking for an Irrigation Unlimited configuration…",step:"Step",back:"Back",next:"Next",import:"Import",importing:"Importing…",source:{question:"Which configuration?",help:"Smart Irrigation reads the configuration Home Assistant loads, or the one Irrigation Unlimited's own dialogs keep. You can also paste its YAML.","yaml-help":"The irrigation_unlimited section Home Assistant loads, with its packages, !include and !secret.","entry-help":"What Irrigation Unlimited's own dialogs keep.","none-found":"No Irrigation Unlimited configuration was found. If Irrigation Unlimited is no longer installed and its configuration was in a package, Home Assistant does not load it: paste it below.",paste:"Paste YAML","paste-help":"The irrigation_unlimited section, or what is under it. !include, !secret and !env_var are not followed here: write those values out, or import from configuration.yaml.",previous:"Imported before on {at}. Importing again updates what that import made.",unreadable:"Home Assistant could not read it:"},zones:{question:"What becomes of each zone?",help:"An Irrigation Unlimited zone becomes one of your zones, or a new one. An existing zone keeps its settings and calculation: only what it lacks is filled in.",none:"This configuration has no zones.",links:"{count, plural, one {# adjust-time automation feeds Irrigation Unlimited from Smart Irrigation: that step is calculated here.} other {# adjust-time automations feed Irrigation Unlimited from Smart Irrigation: those steps are calculated here.}}",becomes:"What {zone} becomes",new:"A new zone",creates:"A new zone is created, with its valve and pump.",uses:"Becomes {zone}: {reason}.",reason:{valve:"same valve",blueprint:"an adjust-time automation feeds it from this zone",name:"same name",imported:"made by the earlier import",chosen:"your choice"},fills:"Filled in:",fields:{linked_entity:"valve",supply_id:"pump",extra_entities:"more valves",confirm_timeout:"confirmation wait (s)",open_resends:"resends",flow_sensor:"flow sensor"},left:"No longer in Irrigation Unlimited, left as they are: {zones}."},programs:{question:"The programs",help:"Each sequence becomes a program, and so does a zone with schedules of its own. A sequence whose schedules have different durations becomes one program per duration.",none:"This configuration has no schedules to bring over.",action:{create:"new",update:"updated"},calculated:"calculated",passes:"{count} passes","step-off":"off","no-schedules":"No schedule.","schedules-off":"Its schedules are switched off until you switch them on.","schedules-stay-on":"You switched its schedules on: they stay as they are.",disabled:"Switched off in Irrigation Unlimited, and here too.",removed:"No longer in Irrigation Unlimited, removed: {programs}."},supplies:{title:"Pumps and main valves",create:"New: {name} ({entities}).",update:"Updated: {name} ({entities}).",removed:"No longer in Irrigation Unlimited, removed: {supplies}."},schedule:{sunrise:"Sunrise",sunset:"Sunset","done-by":"done by {time}",every:"every {count} days",odd:"odd days",even:"even days","days-of-month":"day {days} of the month",last:"last","off-in-iu":"off in Irrigation Unlimited"},report:{question:"What does not come over exactly",help:"Every option of Irrigation Unlimited has a rule. These are the ones that are approximated or left out; everything else comes over as it is.","all-carried":"Everything comes over as it is.",outcome:{not_carried:"Not carried over",unknown:"Not known to the import",approximated:"Approximated"},"summary-title":"What the import does",summary:{zones:"Zones: {created} new, {filled} filled in, {used} used as they are",programs:"Programs: {created} new, {updated} updated, {removed} removed",supplies:"Pumps and main valves: {created} new, {updated} updated, {removed} removed"},"nothing-waters":"Nothing is watered by the import. Irrigation Unlimited keeps watering until you switch it off and these schedules on.",blocked:"Resolve what is marked in red first; until then nothing can be imported.","full-controller-off":"The full controller is off: the programs are imported, but they only water once it is on."},errors:{generic:"The import did not go through.",changed:"The configuration or your zones changed since this preview. Here is what the import would do now: look again, then import.",no_source:"No Irrigation Unlimited configuration was found. Paste its YAML.",yaml_unreadable:"Home Assistant could not read its configuration.",yaml_invalid:"The pasted YAML could not be read.",yaml_missing:"Paste the YAML to import.",yaml_not_iu:"The pasted YAML is not an Irrigation Unlimited configuration.",unknown_zone:"That zone does not exist any more.",zone_not_created:"A zone could not be created.",not_ready:"Smart Irrigation is not ready yet.",conflicts:"Resolve what is marked in red first.",too_big:"This is far larger than an Irrigation Unlimited configuration, so it is not read.",not_finite:"The configuration holds an infinite value or one that is not a number (.inf or .nan), which Irrigation Unlimited does not have."},done:{title:"Imported.",zones:"Zones: {created} new, {updated} filled in",programs:"{count, plural, one {# program} other {# programs}}",next:"The schedules of new programs are off, so Irrigation Unlimited is still the one watering. Look at the programs, then switch over at the top of this page.","open-programs":"Open the programs","next-off":"The full controller is off, so these programs do not water yet, and Irrigation Unlimited goes on watering. Switch the full controller on in the settings, then switch over at the top of this page.","open-settings":"Open the settings"},conflicts:{zone_twice:"{zone} and {other} would both become {target}. Choose another zone for one of them.",calculated_needs_zone:"{zone} is calculated by Smart Irrigation today, from the zone an adjust-time automation feeds it from. Choose that zone or another existing one.",program_exists:'A program "{name}" ({id}) is in the way: no import made it. Rename or delete it first, in Watering, Programs (with the full controller on).',supply_exists:'A pump "{name}" ({id}) is in the way: no import made it. Rename or delete it first, in Watering, Pumps and valves (with the full controller on).'},confirm_remove:"This import deletes what an earlier import made and Irrigation Unlimited no longer has: {names}. Go ahead?",cutover:{title:"Who waters: Irrigation Unlimited or Smart Irrigation","iu-waters":"Irrigation Unlimited waters. The imported schedules are off until you switch over.","si-waters":"Smart Irrigation waters since {at}. Irrigation Unlimited's controllers are off.","si-waters-now":"Smart Irrigation waters: imported schedules are on, and Irrigation Unlimited's controllers are off.","nobody-waters":"Nothing waters: Irrigation Unlimited's controllers are off, and so are the imported schedules.","both-on":"Both would water: Irrigation Unlimited has a controller on, and imported schedules are on too. Switch Irrigation Unlimited off, or the schedules.","full-controller-off":"The full controller is off: switch it on in the settings first, or the imported programs do not water.",programs:"The imported programs","schedules-on":"{on} of {count} schedules on","open-programs":"Look at them on the Programs page before you switch over","open-programs-after":"Open the programs","zones-off":"Irrigation Unlimited has these zones switched off and leaves them out of its sequences; here they water with their program: {list}. Switch their step off in the program if they should stay dry.",controllers:"Irrigation Unlimited's controllers","iu-not-running":"Irrigation Unlimited is not running: there is nothing to switch off.","no-controllers":"None found.",on:"on",off:"off",unknown:"unknown",over:"Switch over to Smart Irrigation",back:"Go back to Irrigation Unlimited","iu-off-again":"Switch Irrigation Unlimited off again","confirm-over":"Irrigation Unlimited's controllers are switched off, and the schedules Irrigation Unlimited had on are switched on here. From the next schedule on, Smart Irrigation waters. You can go back at any time.","confirm-back":"The imported schedules are switched off, and Irrigation Unlimited's controllers on again. Irrigation Unlimited waters again.",errors:{generic:"That did not work.",full_controller_off:"Switch the full controller on first: without it, nothing waters.",not_imported:"Nothing has been imported yet.",iu_failed:"Irrigation Unlimited did not take the switch. What this step had changed is undone: see above who waters.",not_switched:"The watering has not been handed to Smart Irrigation, so there is nothing to go back from.",iu_not_running:"Irrigation Unlimited is not running: it could not water again. Start it first."},"follow-ups":{title:"What still uses Irrigation Unlimited",help:"These automations and scripts name Irrigation Unlimited's services or entities. Once you have switched over, change or remove them: nothing is changed for you.",none:"No automation or script uses Irrigation Unlimited.",automation:"automation",script:"script",edit:"Edit","adjust-time":"Hands Irrigation Unlimited a duration Smart Irrigation calculated. After the switch it has nothing to do: the imported steps are calculated here. Remove it.",uses:"Uses {uses}."},"left-off":"Left off, as Irrigation Unlimited had them switched off: {names}.",unrecorded:"Left off, as the import has no record of which of their schedules Irrigation Unlimited had on: {names}. Switch their schedules on yourself, or go back to Irrigation Unlimited, import again (it records them) and switch over again."}}},Te="Smart Irrigation",Me={title:"Start triggers",description:"When the watering starts. By default it finishes at sunrise; add a trigger for another moment: sunset, an azimuth or a time, with an offset.",active_label:"Active trigger",active_default:"Default (sunrise minus total watering duration)",active_hint:"Only the selected trigger starts the watering, once a day.",usage_before:"When a trigger fires, Smart Irrigation emits the event ",usage_after:" — listen to it in an automation to start watering. The event data includes trigger_name, trigger_type and offset_minutes, so you can react differently per trigger. The precipitation skip and days-between-irrigation settings still apply: on a skip day no event is fired.",add_trigger:"Add trigger",edit_trigger:"Edit trigger",delete_trigger:"Delete trigger",trigger_types:{sunrise:"Sunrise",sunset:"Sunset",solar_azimuth:"Solar Azimuth",time:"Fixed time"},fields:{name:{name:"Trigger name",description:"A descriptive name to identify this trigger"},type:{name:"Trigger type",description:"The type of solar event to trigger on"},enabled:{name:"Enabled",description:"Whether this trigger is currently active"},offset_minutes:{name:"Before (-) or after (+), in minutes",description:"Minutes before (-) or after (+) the solar event. For sunrise triggers, use 0 for automatic timing based on total zone duration."},azimuth_angle:{name:"Azimuth angle (degrees)",description:"Solar azimuth angle in degrees where 0=North, 90=East, 180=South, 270=West"},account_for_duration:{name:"Account for duration",description:"When enabled, irrigation will start early enough to finish at the specified time. When disabled, irrigation will start exactly at the specified time."},at:{name:"Time"}},dialog:{add_title:"Add Irrigation Start Trigger",edit_title:"Edit Irrigation Start Trigger",cancel:"Cancel",save:"Save",delete:"Delete",help:"When this trigger fires, Smart Irrigation emits the following event — use it in an automation to start watering. The event data includes this trigger's name (and type/offset), so you can react to it specifically:"},offset_auto:"Auto (calculated from total zone duration)",confirm_delete:"Are you sure you want to delete the trigger '{name}'?",validation:{name_required:"Trigger name is required",azimuth_invalid:"Azimuth angle must be a valid number",time_invalid:"Please enter a valid time as HH:MM."},help:{sunrise_offset:"For sunrise triggers: Use negative values to start before sunrise, positive to start after. Set to 0 to automatically start early enough to complete all zones before sunrise.",sunset_offset:"For sunset triggers: Use negative values to start before sunset, positive to start after sunset.",azimuth_explanation:"Solar azimuth is the compass direction of the sun. 0°=North, 90°=East, 180°=South, 270°=West. You can enter any angle value (e.g., 450° = 90°, -30° = 330°). Use this to trigger irrigation when the sun reaches a specific position.",multiple_triggers:"You can create several triggers, but only the one selected as active starts irrigation. The others are kept for later."},active_none:"None (Smart Irrigation starts no watering)",none_selected:"No trigger is active: Smart Irrigation starts no watering, whatever the weather. The durations are still calculated; start the watering yourself or from an automation of your own."},Oe={title:"Seasonal adjustments",description:"A crop factor and a threshold that follow the season. Each adjustment covers a range of months and some zones; several covering the same month multiply. The multiplier scales the zone's crop factor (1 changes nothing, 0.5 halves the water use) and the threshold adds to its irrigation threshold. A month-by-month crop factor can also be set in each zone.",add:"Add an adjustment",delete:"Delete",new_name:"New adjustment",name:"Name",month_start:"From month",month_end:"To month",multiplier:"Crop factor multiplier",threshold:"Threshold offset",zones:"Zones",zones_hint:"all, or the numbers of the zones, separated by commas.",enabled:"Enabled"},Ae={title:"Rain forecast",description:"When rain is forecast, Smart Irrigation waters less. This feature requires a weather service to be configured.",threshold_label:"Skip the run from",threshold_description:"Minimum amount of precipitation (in mm) forecasted for today and tomorrow to skip irrigation.",effective_rain_label:"Count only rain that reaches the roots",effective_rain_description:"Ignore a shower smaller than a fifth of the evapotranspiration of the period: it wets the leaves and evaporates. It is judged on the whole period between two calculations.",forecast_label:"Take the forecast rain into account",forecast_description:"Below the threshold, each zone is watered for its deficit less the rain forecast for the next 24 hours, weighted by the probability the weather service gives: 4 mm forecast against a 10 mm deficit waters 6 mm. At or above the threshold, the run is skipped for the zones in the open. Zones in a greenhouse are not affected."},Ce={title:"Location coordinates",description:"Configure location coordinates for weather data retrieval. You can use manual coordinates different from your Home Assistant location if needed.",manual_enabled:"Use manual coordinates",use_ha_location:"Use Home Assistant location",latitude:"Latitude (decimal degrees)",longitude:"Longitude (decimal degrees)",elevation:"Elevation (meters above sea level)",current_ha_coords:"Current Home Assistant coordinates"},Ee={title:"Days between irrigation",description:"Configure the minimum number of days that must pass between irrigation events. This helps control watering frequency for water conservation and plant health management.\n\nTypical real-world use cases:\n• Lawn care: 1-2 day intervals prevent overwatering\n• Drought restrictions: 6+ day intervals for weekly watering\n• Deep-rooted plants: 3-7 day intervals for less frequent watering\n• Water conservation: Customizable based on climate and soil conditions",label:"Minimum days between irrigation",help_text:"Set to 0 to disable this feature. Values from 1-365 days are supported. This setting works alongside existing precipitation forecasting logic. A zone can have its own number of days in the Zones tab, which replaces this setting for that zone."},De={title:"Planning",description:"What the programs will water over the next three days. The weather is not known that far ahead: a run goes ahead if nothing holds it back.",nothing_planned:"No program is planned. Add a schedule to a program.",nothing_to_water:"Nothing to water for now: no zone of this run is short enough of water.",expected:"Expected duration:",expected_skipped_precipitation:"Expected to be skipped: rain forecast ({mm} mm)",nothing_now:"Nothing is watering now.",paused:"Paused",waiting:"waiting for its turn",step:"step",tour:"round",tours:"rounds",remaining:"left"},He={title:"Programs",description:"A program waters its steps one after the other. A step is one zone, or several watered together, and by default takes the duration Smart Irrigation calculated for it. Several programs never run at the same time: the next one waits its turn.",main_description:"Waters every zone, one after the other or together as set below. It is started by the start trigger, or by its own schedules once one is enabled.",run_options:"Run options",adjust_empty:"Enter a percentage or seconds to adjust the durations.",more_options:"More options",more_options_set:"with more rules",sequencing_title:"Order of the zones and pauses",others_title:"Other programs",confirm_run:"Run {name} now? Its valves open straight away.",run_started:"{name} has started.",run_queued:"{name} is queued: it starts when what is watering now has finished.",run_nothing:"{name} found nothing to water.",run_failed:"{name} could not start: {error}",main_schedules_hint:"With no enabled schedule, the start trigger set further down this page starts the main program. As soon as one schedule is enabled, the schedules replace that trigger. Its settings are kept, and it comes back if the schedules are disabled or removed.",name:"Name",step:"Step",step_zones:"Zones",step_zones_help:"Zones ticked in the same step are watered at the same time.",step_duration:"Duration",mode_calculated:"Calculated by Smart Irrigation",mode_percent:"Calculated, times a percentage",mode_fixed:"Fixed",percent:"Percentage of the calculated water",seconds:"Seconds of water",passes:"Water in several passes",step_delay:"Wait after this step",step_delay_help:"Empty: the program's wait. Negative: the next step starts that long before this one ends.",delay:"Wait between steps",delay_help:"Seconds waited after each step, for line pressure or a slow valve. Negative: each step starts that long before the previous one ends (they overlap).",tours:"Rounds",tours_help:"The whole list of steps is watered this many times, each round with its share of the water. Unlike passes, which repeat one step before going on, a round lets each zone soak while the others water.",enabled:"Enabled",add_step:"Add a step",delete_step:"Delete the step",add:"Add a program",delete:"Delete the program",schedule:"Schedule",add_schedule:"Add a schedule",delete_schedule:"Delete the schedule",schedule_moment:"At",moment_time:"A time of day",moment_sunrise:"Sunrise",moment_sunset:"Sunset",schedule_time:"Time",schedule_offset:"Before (-) or after (+) the sun",schedule_anchor:"That moment is when the program",anchor_start:"starts",anchor_end:"must be done",schedule_anchor_help:'With "must be done", the program starts early enough, from the length of what it has to water, to finish at that moment.',schedule_weekdays:"Days of the week",schedule_weekdays_help:"None ticked: every day.",schedule_every:"Every",schedule_days:"days",schedule_every_offset:"Shifted by",schedule_every_help:"Every 3 days with a shift of 0, 1 or 2 lets three programs take turns, one day in three, never on the same day.",schedule_parity:"Days of the month",parity_any:"All",parity_even:"Even days",parity_odd:"Odd days",schedule_days_of_month:"Specific days of the month",schedule_days_of_month_help:'Day numbers separated by commas, and "last" for the last day of the month (for example 1, 15, last). A month too short for a day skips it. Empty: any day. It adds to the other filters.',schedule_fallback_time:"If there is no sunrise or sunset",schedule_fallback_time_help:"For a day without a sunrise or sunset (polar day or night).",schedule_months:"Months",schedule_months_help:"None ticked: every month.",schedule_from:"From",schedule_until:"Until",schedule_period_help:"A period of the year, which may run over New Year (from November to March). Empty: the whole year.",schedule_weather:"Take the weather into account",schedule_hard_deadline:"Cut the run at the end time",schedule_hard_deadline_help:"The run is cut at the end target: the zones that are open are closed and credited for what they watered, and what did not start is skipped.",schedule_conditions:"Which conditions",schedule_conditions_help:"What can keep this schedule from watering. The conditions are set in Settings, General, and this schedule obeys all of them; untick the ones it should ignore, the rain for a greenhouse for example. A postponement you asked for (24 h, 48 h) always applies.",condition_postponed:"Postponed days (always on)",condition_rain_sensor:"Rain sensor",condition_freeze:"Frost",condition_wind:"Wind",condition_precipitation:"Rain forecast",condition_days_between:"Days since the last watering",condition_soil_moisture:"Soil moisture",schedule_weather_help:"Rain, frost, wind, a wet soil and the days you postponed can hold the run back or shorten it. Turn it off for a greenhouse drip line that does not care.",pause:"Pause",resume:"Resume",next_step:"Next step",stop:"Stop",confirm_stop:"Stop all watering now? Every valve is closed and the runs under way end.",confirm_delete_program:'Delete the program "{name}", with its steps and schedules?',confirm_delete_step:"Delete this step?",confirm_delete_schedule:"Delete this schedule?",deleted_zone:"(deleted zone)",controls_help:"For a watering that is under way. Pause closes the valves and holds everything; the rest is watered after the resume. Next step ends the zones the program is on. Stop ends everything.",max_litres:"Volume limit",max_litres_help:"A zone of this step stops once its water meter has counted this volume, in litres or gallons as the panel shows volumes. 0: no limit. The meter reports every so often, so the volume is not exact. A zone without a meter ignores it.",new_program:"Program",main_name:"Main program",run_now:"Run now",run_seconds:"Total duration",run_seconds_help:"Optional. Empty: the planned durations. Otherwise the whole program lasts this long, shared between its steps in proportion to their planned durations.",run_replace:"Replace what is running",run_replace_help:"Off: the program waits for its turn behind what is watering. On: what is watering is stopped cleanly first.",stop_program:"Stop this program",confirm_stop_program:'Stop the program "{name}"? Its open zones are closed, or it leaves the queue if it is waiting.',min_seconds:"Minimum water",max_seconds:"Maximum water",adjust_seconds:"Time added (+) or removed (-)",step_bounds_help:"Order of application: the percentage first, then the time added or removed, then the minimum and the maximum. 0 for the minimum or maximum: none. A step that needs no water stays at zero: the minimum never starts it.",min_deficit_mm:"Only water when the deficit is at least",min_deficit_mm_help:"In mm, 0 to always water. Set, it replaces the zone's own threshold for this step. Fixed-duration steps are always watered.",adjust_title:"Adjust durations",adjust_none:"No adjustment in force.",adjust_active:"In force: {percent} % and {seconds} s per step, until {until}.",adjust_until_reset:"it is reset",adjust_percent:"Percent",adjust_hours:"Valid for",adjust_help:"Makes this program water longer or shorter for the runs that start after it is set. It replaces the previous adjustment. Hours empty: until it is reset.",adjust_apply:"Apply",adjust_reset:"Reset",confirm_reset_adjustment:"Remove the adjustment of this program?",main_settings:"Main program: start and sequencing",main_settings_description:"How the main program waters: the zones one after the other or together, the pause between two zones and cycle and soak. Its start trigger is below.",main_schedules_active:"For now the main program's schedules start the watering: the start trigger below is not used. It stays editable, and it comes back if those schedules are disabled or removed.",mode_off:"The full controller is off. Turn it on in Settings, General.",no_zone:"no zone",mode_calculated_short:"calculated",every_day:"every day",anchor_start_short:"starts at",anchor_end_short:"done by",steps_count:"step(s)",schedules_count:"schedule(s)",off:"off",steps_title:"Steps",schedules_title:"Schedules",passes_help:"Cycle and soak for this step: its water split into this many passes, each zone soaking between two of them for the time set in the main program's settings. 1: in a single go.",schedule_fallback_skip:"Skip that day",schedule_fallback_previous:"Use the time of the last one seen",schedule_fallback_at:"Start at a fixed time",main_steps_hint:"To choose the zones and the order of the steps, add a program below.",summary_start_sunrise:"starts at sunrise",summary_start_sunset:"starts at sunset",summary_end_sunrise:"done by sunrise",summary_end_sunset:"done by sunset",last_word:"last",conditions_none:"No condition is turned on: they are set in Settings, General.",cond_postponed:"the Postpone buttons of the Home page",cond_off:"off in Settings",cond_freeze:"at {value} or below",cond_wind:"from {value}",cond_precipitation:"from {value} forecast",cond_days_between:"at least {n} days",cond_soil:"{n} zone(s) with a sensor"},Ne={title:"Pumps and main valves",description:"A pump or a main valve in front of the zone valves runs while a zone it feeds is being watered. Pick it in each zone's settings. The delays are in seconds and signed.",name:"Name",entities:"Entities",entities_hint:"separate several with commas",delay_before:"Delay before",delay_before_help:"Positive: the pump or main valve comes on this long before the zone valve opens. Negative: the zone valve opens first, and the pump or main valve comes on this long after.",delay_after:"Delay after",delay_after_help:"Positive: the pump or main valve stays on this long after the zone valve closes. Negative: it goes off this long before the zone valve closes, so a pump never pushes against a closed valve.",enabled:"Enabled",add:"Add a pump or main valve",delete:"Delete",confirm_delete:'Delete "{name}"? The zones that use it will no longer have a pump or main valve.',kick_seconds:"Power cut before starting",kick_seconds_help:"For a pump whose pressure controller only starts again after its power has been cut: it is switched off this long, then on, before each start. 0: switched on directly (the default)."},Re={title:"Observed watering (closed loop)",description:"Credit each zone's bucket automatically from real irrigation, instead of resetting the bucket from an automation. Once enabled, pick a valve/switch entity per zone in the Zones tab: while it is open, the bucket is credited from the run time and the zone's throughput. For exact accounting you can also pick a cumulative volume meter (a water-meter style total) per zone, and the measured volume is used instead. Important: when this is on it is the only thing crediting the bucket, so remove any reset_bucket call from your irrigation automation to avoid double counting.",enabled_label:"Enable observed watering",direct_control_label:"Let Smart Irrigation control the valve",direct_control_description:"When on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it, with no automation needed. A run under way resumes after a restart. Safety: a valve that can close by itself is given the length of the run when it opens (a Sonoff SWV on ZHA, or a valve with an MQTT safety topic set in its zone), so it closes even if Home Assistant goes down. Any other valve keeps watering until Home Assistant is back: give it a hardware failsafe (a maximum runtime).",full_controller_label:"Full controller: Smart Irrigation runs all my watering",full_controller_title:"Full controller",confirm_full_controller:"Turn on the full controller? Smart Irrigation will drive the valves and start the watering itself. A valve found open at startup that no run of ours owns is closed.",full_controller_description:"Turns on valve control and adds a Watering tab: programs, planning and pumps. The start trigger, the sequencing, the pause between zones and cycle and soak move there, as the main program's settings, and keep working as before until you add another program. Switching it off brings back exactly the previous behaviour. A valve found open at startup that no run of ours owns is closed.",sequencing_label:"Zone sequencing",sequencing:{sequential:"Sequential (one zone at a time)",parallel:"Parallel (all zones at once)"},sequencing_description:"How your zones are watered. This sets what a start trigger works back from when it has to finish at sunrise: one after another takes the sum of every zone's run time, all at once takes the longest of them. It applies whether Smart Irrigation opens the valves itself or an automation of your own does.",passes_label:"Water in several passes",passes_description:"Cycle and soak: the same water, split into shorter passes with a pause between them, so heavy soil takes it in instead of letting it run off. One pass waters in a single go, which is the default. A run too short to split is left alone.",soak_label:"Soak between passes",pause_between_zones_label:"Pause between zones",pause_between_zones_description:"A wait between two zones of a sequential run: time for the line pressure to recover, or for a slow valve to finish closing before the next one opens.",minutes:"minutes",seconds:"seconds",direct_control_locked:"The full controller drives the valves: switch it off first to change this."},Pe={title:"Calculation log",description:"Write the complete input of every calculation to a file, so two days that look alike but water very differently can be compared afterwards. Each calculation appends one line: the sensor group records and how they were aggregated, the module intermediates (solar radiation, net radiation, ET0), and the resulting bucket, duration and volume. Off by default; the file is capped in size and rotated, so it can be left on for a season.",enabled_label:"Log calculation inputs to a file",file_hint:"Written to config/smart_irrigation/calc_log.jsonl, one JSON record per line. The most recent records are also included in the diagnostics download (coordinates rounded, entity ids removed), so you can attach them to an issue in one step."},je={title:"Blueprints",install_label:"Install the example blueprints",install_help:"Smart Irrigation copies its example blueprints into your blueprints folder, each one once: a blueprint you delete is not put back. Switch this off to copy none at all; the ones already there are left as they are."},Ie={title:"Skip on measured conditions",description:"Checked at the start of each run, from a sensor or the weather service. A sensor that cannot be read never stops a run.",enabled:"Enabled",threshold:"Threshold",sensor:"Sensor","sensor-optional":"Sensor (optional)",rain:{title:"Rain sensor",description:"Skip the run while a rain sensor says it is raining.","sensor-hint":"A binary sensor that is on while it rains.","history-label":"Shorten runs after recent rain","history-description":"For a zone that has no rain in millimetres at all: no gauge, and a weather service that gives none. The sensor's own history over the last five days is read, weighted so that yesterday counts for more than four days ago, and the run is shortened by it. A day of reported rain today takes the whole run; four days ago takes a tenth of it. It never touches the water balance, because it does not know how many millimetres fell: the deficit stays and is watered off once the weather turns. A zone whose sensor group does report rain in millimetres is left alone, since the balance already has it. This needs a sensor that stays on while it rains rather than one that pulses per tip."},freeze:{title:"Freeze",description:"Skip the run when the temperature is at or below the threshold.","sensor-hint":"Empty: the weather service's current temperature."},wind:{title:"Wind",description:"Skip the run when the wind is at or above the threshold: a sprinkler in strong wind waters the path, not the bed.","sensor-hint":"Empty: the weather service's current wind, at 10 m."}},Le={next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"rain forecast",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},programs:{title:"Programs",start:"Start",stop:"Stop",confirm_stop:"Tap again to stop",pause:"Pause",resume:"Resume",next_step:"Next step",step_of:"step {step}/{steps}",remaining:"{time} left",until:"until {when}",states:{idle:"idle",running:"running",waiting:"waiting",paused:"paused",suspended:"suspended",disabled:"disabled"}},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water",show_programs:"Show the programs (full controller)"}},Ue={delete_zone:'Delete the zone "{name}"? Its settings and water balance are lost.',delete_mapping:'Delete the sensor group "{name}"? The zones that use it will have no weather data.',delete_module:'Delete the module "{name}"? The zones that use it can no longer be calculated.',reset_bucket:'Set the water balance of "{name}" back to zero?',reset_all_buckets:"Set the water balance of every zone back to zero?",clear_all_weather:"Clear all the weather data collected? The next calculation only has the readings that come after."},Fe={common:$e,defaults:xe,module:ke,calcmodules:Se,panels:ze,title:Te,irrigation_start_triggers:Me,seasonal_adjustments:Oe,weather_skip:Ae,coordinate_config:Ce,days_between_irrigation:Ee,planning:De,programs:He,supplies:Ne,observed_watering:Re,calculation_log:Pe,blueprints:je,measured_skip:Ie,card:Le,confirm:Ue},Be=Object.freeze({__proto__:null,blueprints:je,calcmodules:Se,calculation_log:Pe,card:Le,common:$e,confirm:Ue,coordinate_config:Ce,days_between_irrigation:Ee,default:Fe,defaults:xe,irrigation_start_triggers:Me,measured_skip:Ie,module:ke,observed_watering:Re,panels:ze,planning:De,programs:He,seasonal_adjustments:Oe,supplies:Ne,title:Te,weather_skip:Ae});function Ye(e,t){const i=t&&t.cache?t.cache:Je,s=t&&t.serializer?t.serializer:qe;return(t&&t.strategy?t.strategy:Ge)(e,{cache:i,serializer:s})}function We(e,t,i,s){const a=null==(n=s)||"number"==typeof n||"boolean"==typeof n?s:i(s);var n;let r=t.get(a);return void 0===r&&(r=e.call(this,s),t.set(a,r)),r}function Ve(e,t,i){const s=Array.prototype.slice.call(arguments,3),a=i(s);let n=t.get(a);return void 0===n&&(n=e.apply(this,s),t.set(a,n)),n}function Ze(e,t,i,s,a){return i.bind(t,e,s,a)}function Ge(e,t){return Ze(e,this,1===e.length?We:Ve,t.cache.create(),t.serializer)}const qe=function(){return JSON.stringify(arguments)};var Ke=class{constructor(){this.cache=Object.create(null)}get(e){return this.cache[e]}set(e,t){this.cache[e]=t}};const Je={create:function(){return new Ke}},Xe={variadic:function(e,t){return Ze(e,this,Ve,t.cache.create(),t.serializer)}},Qe=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function et(e){const t={};return e.replace(Qe,e=>{const i=e.length;switch(e[0]){case"G":t.era=4===i?"long":5===i?"narrow":"short";break;case"y":t.year=2===i?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][i-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][i-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===i?"long":5===i?"narrow":"short";break;case"e":if(i<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"c":if(i<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-3];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][i-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][i-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][i-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][i-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][i-1];break;case"s":t.second=["numeric","2-digit"][i-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=i<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""}),t}const tt=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;function it(e){return e.replace(/^(.*?)-/,"")}const st=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,at=/^(@+)?(\+|#+)?[rs]?$/g,nt=/(\*)(0+)|(#+)(0+)|(0+)/g,rt=/^(0+)$/;function ot(e){const t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(at,function(e,i,s){return"string"!=typeof s?(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length):"+"===s?t.minimumSignificantDigits=i.length:"#"===i[0]?t.maximumSignificantDigits=i.length:(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length+("string"==typeof s?s.length:0)),""}),t}function lt(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function dt(e){let t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){const i=e.slice(0,2);if("+!"===i?(t.signDisplay="always",e=e.slice(2)):"+?"===i&&(t.signDisplay="exceptZero",e=e.slice(2)),!rt.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function ht(e){const t=lt(e);return t||{}}function ct(e){let t={};for(const i of e){switch(i.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=i.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=it(i.options[0]);continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t={...t,notation:"scientific",...i.options.reduce((e,t)=>({...e,...ht(t)}),{})};continue;case"engineering":t={...t,notation:"engineering",...i.options.reduce((e,t)=>({...e,...ht(t)}),{})};continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(i.options[0]);continue;case"rounding-mode-floor":t.roundingMode="floor";continue;case"rounding-mode-ceiling":t.roundingMode="ceil";continue;case"rounding-mode-down":t.roundingMode="trunc";continue;case"rounding-mode-up":t.roundingMode="expand";continue;case"rounding-mode-half-even":t.roundingMode="halfEven";continue;case"rounding-mode-half-down":t.roundingMode="halfTrunc";continue;case"rounding-mode-half-up":t.roundingMode="halfExpand";continue;case"integer-width":if(i.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");i.options[0].replace(nt,function(e,i,s,a,n,r){if(i)t.minimumIntegerDigits=s.length;else{if(a&&n)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""});continue}if(rt.test(i.stem)){t.minimumIntegerDigits=i.stem.length;continue}if(st.test(i.stem)){if(i.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");i.stem.replace(st,function(e,i,s,a,n,r){return"*"===s?t.minimumFractionDigits=i.length:a&&"#"===a[0]?t.maximumFractionDigits=a.length:n&&r?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+r.length):(t.minimumFractionDigits=i.length,t.maximumFractionDigits=i.length),""});const e=i.options[0];"w"===e?t={...t,trailingZeroDisplay:"stripIfInteger"}:e&&(t={...t,...ot(e)});continue}if(at.test(i.stem)){t={...t,...ot(i.stem)};continue}const e=lt(i.stem);e&&(t={...t,...e});const s=dt(i.stem);s&&(t={...t,...s})}return t}let ut=function(e){return e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG",e}({});function pt(e){return 0===e.type}function gt(e){return 1===e.type}function mt(e){return 2===e.type}function vt(e){return 3===e.type}function ft(e){return 4===e.type}function _t(e){return 5===e.type}function yt(e){return 6===e.type}function wt(e){return 7===e.type}function bt(e){return 8===e.type}function $t(e){return!(!e||"object"!=typeof e||0!==e.type)}function xt(e){return!(!e||"object"!=typeof e||1!==e.type)}const kt=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,St=/([^\t-\r -\/:-@\[-\^`\{-~\x85\xA0-\xA7\xA9\xAB\xAC\xAE\xB0\xB1\xB6\xBB\xBF\xD7\xF7\u1680\u2000-\u200A\u2010-\u2029\u202F-\u203E\u2041-\u2053\u2055-\u205F\u2190-\u245F\u2500-\u2775\u2794-\u2BFF\u2E00-\u2E7F\u3000-\u3003\u3008-\u3020\u3030\uFD3E\uFD3F\uFE45\uFE46]*)/g,zt={"001":["H","h"],419:["h","H","hB","hb"],AC:["H","h","hb","hB"],AD:["H","hB"],AE:["h","hB","hb","H"],AF:["H","hb","hB","h"],AG:["h","hb","H","hB"],AI:["H","h","hb","hB"],AL:["h","H","hB"],AM:["H","hB"],AO:["H","hB"],AR:["h","H","hB","hb"],AS:["h","H"],AT:["H","hB"],AU:["h","hb","H","hB"],AW:["H","hB"],AX:["H"],AZ:["H","hB","h"],BA:["H","hB","h"],BB:["h","hb","H","hB"],BD:["h","hB","H"],BE:["H","hB"],BF:["H","hB"],BG:["H","hB","h"],BH:["h","hB","hb","H"],BI:["H","h"],BJ:["H","hB"],BL:["H","hB"],BM:["h","hb","H","hB"],BN:["hb","hB","h","H"],BO:["h","H","hB","hb"],BQ:["H"],BR:["H","hB"],BS:["h","hb","H","hB"],BT:["h","H"],BW:["H","h","hb","hB"],BY:["H","h"],BZ:["H","h","hb","hB"],CA:["h","hb","H","hB"],CC:["H","h","hb","hB"],CD:["hB","H"],CF:["H","h","hB"],CG:["H","hB"],CH:["H","hB","h"],CI:["H","hB"],CK:["H","h","hb","hB"],CL:["h","H","hB","hb"],CM:["H","h","hB"],CN:["H","hB","hb","h"],CO:["h","H","hB","hb"],CP:["H"],CR:["h","H","hB","hb"],CU:["h","H","hB","hb"],CV:["H","hB"],CW:["H","hB"],CX:["H","h","hb","hB"],CY:["h","H","hb","hB"],CZ:["H"],DE:["H","hB"],DG:["H","h","hb","hB"],DJ:["h","H"],DK:["H"],DM:["h","hb","H","hB"],DO:["h","H","hB","hb"],DZ:["h","hB","hb","H"],EA:["H","h","hB","hb"],EC:["h","H","hB","hb"],EE:["H","hB"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],ER:["h","H"],ES:["H","hB","h","hb"],ET:["hB","hb","h","H"],FI:["H"],FJ:["h","hb","H","hB"],FK:["H","h","hb","hB"],FM:["h","hb","H","hB"],FO:["H","h"],FR:["H","hB"],GA:["H","hB"],GB:["H","h","hb","hB"],GD:["h","hb","H","hB"],GE:["H","hB","h"],GF:["H","hB"],GG:["H","h","hb","hB"],GH:["h","H"],GI:["H","h","hb","hB"],GL:["H","h"],GM:["h","hb","H","hB"],GN:["H","hB"],GP:["H","hB"],GQ:["H","hB","h","hb"],GR:["h","H","hb","hB"],GS:["H","h","hb","hB"],GT:["h","H","hB","hb"],GU:["h","hb","H","hB"],GW:["H","hB"],GY:["h","hb","H","hB"],HK:["h","hB","hb","H"],HN:["h","H","hB","hb"],HR:["H","hB"],HU:["H","h"],IC:["H","h","hB","hb"],ID:["H"],IE:["H","h","hb","hB"],IL:["H","hB"],IM:["H","h","hb","hB"],IN:["h","H"],IO:["H","h","hb","hB"],IQ:["h","hB","hb","H"],IR:["hB","H"],IS:["H"],IT:["H","hB"],JE:["H","h","hb","hB"],JM:["h","hb","H","hB"],JO:["h","hB","hb","H"],JP:["H","K","h"],KE:["hB","hb","H","h"],KG:["H","h","hB","hb"],KH:["hB","h","H","hb"],KI:["h","hb","H","hB"],KM:["H","h","hB","hb"],KN:["h","hb","H","hB"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],KW:["h","hB","hb","H"],KY:["h","hb","H","hB"],KZ:["H","hB"],LA:["H","hb","hB","h"],LB:["h","hB","hb","H"],LC:["h","hb","H","hB"],LI:["H","hB","h"],LK:["H","h","hB","hb"],LR:["h","hb","H","hB"],LS:["h","H"],LT:["H","h","hb","hB"],LU:["H","h","hB"],LV:["H","hB","hb","h"],LY:["h","hB","hb","H"],MA:["H","h","hB","hb"],MC:["H","hB"],MD:["H","hB"],ME:["H","hB","h"],MF:["H","hB"],MG:["H","h"],MH:["h","hb","H","hB"],MK:["H","h","hb","hB"],ML:["H"],MM:["hB","hb","H","h"],MN:["H","h","hb","hB"],MO:["h","hB","hb","H"],MP:["h","hb","H","hB"],MQ:["H","hB"],MR:["h","hB","hb","H"],MS:["H","h","hb","hB"],MT:["H","h"],MU:["H","h"],MV:["H","h"],MW:["h","hb","H","hB"],MX:["h","H","hB","hb"],MY:["hb","hB","h","H"],MZ:["H","hB"],NA:["h","H","hB","hb"],NC:["H","hB"],NE:["H"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NI:["h","H","hB","hb"],NL:["H","hB"],NO:["H","h"],NP:["H","h","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],NZ:["h","hb","H","hB"],OM:["h","hB","hb","H"],PA:["h","H","hB","hb"],PE:["h","H","hB","hb"],PF:["H","h","hB"],PG:["h","H"],PH:["h","hB","hb","H"],PK:["h","hB","H"],PL:["H","h"],PM:["H","hB"],PN:["H","h","hb","hB"],PR:["h","H","hB","hb"],PS:["h","hB","hb","H"],PT:["H","hB"],PW:["h","H"],PY:["h","H","hB","hb"],QA:["h","hB","hb","H"],RE:["H","hB"],RO:["H","hB"],RS:["H","hB","h"],RU:["H"],RW:["H","h"],SA:["h","hB","hb","H"],SB:["h","hb","H","hB"],SC:["H","h","hB"],SD:["h","hB","hb","H"],SE:["H"],SG:["h","hb","H","hB"],SH:["H","h","hb","hB"],SI:["H","hB"],SJ:["H"],SK:["H"],SL:["h","hb","H","hB"],SM:["H","h","hB"],SN:["H","h","hB"],SO:["h","H"],SR:["H","hB"],SS:["h","hb","H","hB"],ST:["H","hB"],SV:["h","H","hB","hb"],SX:["H","h","hb","hB"],SY:["h","hB","hb","H"],SZ:["h","hb","H","hB"],TA:["H","h","hb","hB"],TC:["h","hb","H","hB"],TD:["h","H","hB"],TF:["H","h","hB"],TG:["H","hB"],TH:["H","h"],TJ:["H","h"],TL:["H","hB","hb","h"],TM:["H","h"],TN:["h","hB","hb","H"],TO:["h","H"],TR:["H","hB"],TT:["h","hb","H","hB"],TW:["hB","hb","h","H"],TZ:["hB","hb","H","h"],UA:["H","hB","h"],UG:["hB","hb","H","h"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],UY:["h","H","hB","hb"],UZ:["H","hB","h"],VA:["H","h","hB"],VC:["h","hb","H","hB"],VE:["h","H","hB","hb"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],VN:["H","h"],VU:["h","H"],WF:["H","hB"],WS:["h","H"],XK:["H","hB","h"],YE:["h","hB","hb","H"],YT:["H","hB"],ZA:["H","h","hb","hB"],ZM:["h","hb","H","hB"],ZW:["H","h"],"af-ZA":["H","h","hB","hb"],"ar-001":["h","hB","hb","H"],"ca-ES":["H","h","hB"],"en-001":["h","hb","H","hB"],"en-HK":["h","hb","H","hB"],"en-IL":["H","h","hb","hB"],"en-MY":["h","hb","H","hB"],"es-BR":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"gu-IN":["hB","hb","h","H"],"hi-IN":["hB","h","H"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],"kn-IN":["hB","h","H"],"ku-SY":["H","hB"],"ml-IN":["hB","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],"ta-IN":["hB","h","hb","H"],"te-IN":["hB","h","H"],"zu-ZA":["H","hB","hb","h"]};function Tt(e){let t=e.hourCycle;if(void 0===t){const i=e;t=i.getHourCycles?.()[0]??i.hourCycles?.[0]}if(t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}const i=e.language;let s;return"root"!==i&&(s=e.maximize().region),(zt[`${i}-${s}`]||zt[s||""]||zt[i||""]||zt[`${i}-001`]||zt["001"])[0].charAt(0)}const Mt=new RegExp(`^${kt.source}*`),Ot=new RegExp(`${kt.source}*$`);function At(e,t){return{start:e,end:t}}const Ct=!!Object.fromEntries,Et=!!String.prototype.trimStart,Dt=!!String.prototype.trimEnd,Ht=Ct?Object.fromEntries:function(e){const t={};for(const[i,s]of e)t[i]=s;return t},Nt=Et?function(e){return e.trimStart()}:function(e){return e.replace(Mt,"")},Rt=Dt?function(e){return e.trimEnd()}:function(e){return e.replace(Ot,"")};let Pt=function(){try{const e=new RegExp("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");if("a"===e.exec("a ")?.[1])return e}catch{}return St}();var jt=class{constructor(e,t={}){this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}parse(){if(0!==this.offset())throw Error("parser can only be used once");if(this.message.length>0){const e=this.message.charCodeAt(0);if(35!==e&&39!==e&&60!==e&&123!==e&&125!==e){const e=function(e){if(0===e.length)return null;let t=1,i=1;for(let s=0;s<e.length;){const a=e.charCodeAt(s);switch(a){case 35:case 39:case 60:case 123:case 125:return null}if(10===a)t++,i=1,s++;else if(i++,a>=55296&&a<=56319&&s+1<e.length){const t=e.charCodeAt(s+1);s+=t>=56320&&t<=57343?2:1}else s++}return{offset:e.length,line:t,column:i}}(this.message);if(e){const t=this.clonePosition();return this.position=e,{val:[{type:0,value:this.message,location:At(t,this.clonePosition())}],err:null}}}}return this.parseMessage(0,"",!1)}parseMessage(e,t,i){let s=[];for(;!this.isEOF();){const a=this.char();if(123===a){const t=this.parseArgument(e,i);if(t.err)return t;s.push(t.val)}else{if(125===a&&e>0)break;if(35!==a||"plural"!==t&&"selectordinal"!==t){if(60===a&&!this.ignoreTag&&47===this.peek()){if(i)break;return this.error(26,At(this.clonePosition(),this.clonePosition()))}if(60===a&&!this.ignoreTag&&It(this.peek()||0)){const i=this.parseTag(e,t);if(i.err)return i;s.push(i.val)}else{const i=this.parseLiteral(e,t);if(i.err)return i;s.push(i.val)}}else{const e=this.clonePosition();this.bump(),s.push({type:7,location:At(e,this.clonePosition())})}}}return{val:s,err:null}}parseTag(e,t){const i=this.clonePosition();this.bump();const s=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:0,value:`<${s}/>`,location:At(i,this.clonePosition())},err:null};if(this.bumpIf(">")){const a=this.parseMessage(e+1,t,!0);if(a.err)return a;const n=a.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!It(this.char()))return this.error(23,At(r,this.clonePosition()));const e=this.clonePosition();return s!==this.parseTagName()?this.error(26,At(e,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:8,value:s,children:n,location:At(i,this.clonePosition())},err:null}:this.error(23,At(r,this.clonePosition())))}return this.error(27,At(i,this.clonePosition()))}return this.error(23,At(i,this.clonePosition()))}parseTagName(){const e=this.offset();for(this.bump();!this.isEOF()&&Lt(this.char());)this.bump();return this.message.slice(e,this.offset())}parseLiteral(e,t){const i=this.clonePosition();let s="";for(;;){const i=this.tryParseQuote(t);if(i){s+=i;continue}const a=this.tryParseUnquoted(e,t);if(a){s+=a;continue}const n=this.tryParseLeftAngleBracket();if(!n)break;s+=n}return{val:{type:0,value:s,location:At(i,this.clonePosition())},err:null}}tryParseLeftAngleBracket(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(It(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e}tryParseQuote(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();const t=[this.char()];for(this.bump();!this.isEOF();){const e=this.char();if(39===e){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(e);this.bump()}return String.fromCodePoint(...t)}tryParseUnquoted(e,t){if(this.isEOF())return null;const i=this.char();return 60===i||123===i||35===i&&("plural"===t||"selectordinal"===t)||125===i&&e>0?null:(this.bump(),String.fromCodePoint(i))}parseArgument(e,t){const i=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(1,At(i,this.clonePosition()));if(125===this.char())return this.bump(),this.error(2,At(i,this.clonePosition()));let s=this.parseIdentifierIfPossible().value;if(!s)return this.error(3,At(i,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(1,At(i,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:1,value:s,location:At(i,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(1,At(i,this.clonePosition())):this.parseArgumentOptions(e,t,s,i);default:return this.error(3,At(i,this.clonePosition()))}}parseIdentifierIfPossible(){const e=this.clonePosition(),t=this.offset(),i=function(e,t){return Pt.lastIndex=t,Pt.exec(e)[1]??""}(this.message,t),s=t+i.length;return this.bumpTo(s),{value:i,location:At(e,this.clonePosition())}}parseArgumentOptions(e,t,i,s){let a=this.clonePosition(),n=this.parseIdentifierIfPossible().value,r=this.clonePosition();switch(n){case"":return this.error(4,At(a,r));case"number":case"date":case"time":{this.bumpSpace();let e=null;if(this.bumpIf(",")){this.bumpSpace();const t=this.clonePosition(),i=this.parseSimpleArgStyleIfPossible();if(i.err)return i;const s=Rt(i.val);if(0===s.length)return this.error(6,At(this.clonePosition(),this.clonePosition()));e={style:s,styleLocation:At(t,this.clonePosition())}}const t=this.tryParseArgumentClose(s);if(t.err)return t;const a=At(s,this.clonePosition());if(e&&e.style.startsWith("::")){let t=Nt(e.style.slice(2));if("number"===n){const s=this.parseNumberSkeletonFromString(t,e.styleLocation);return s.err?s:{val:{type:2,value:i,location:a,style:s.val},err:null}}{if(0===t.length)return this.error(10,a);let s=t;this.locale&&(s=function(e,t){let i="";for(let s=0;s<e.length;s++){const a=e.charAt(s);if("j"===a){let n=0;for(;s+1<e.length&&e.charAt(s+1)===a;)n++,s++;let r=1+(1&n),o=n<2?1:3+(n>>1),l="a",d=Tt(t);for("H"!=d&&"k"!=d||(o=0);o-- >0;)i+=l;for(;r-- >0;)i=d+i}else i+="J"===a?"H":a}return i}(t,this.locale));return{val:{type:"date"===n?3:4,value:i,location:a,style:{type:1,pattern:s,location:e.styleLocation,parsedOptions:this.shouldParseSkeletons?et(s):{}}},err:null}}}return{val:{type:"number"===n?2:"date"===n?3:4,value:i,location:a,style:e?.style??null},err:null}}case"plural":case"selectordinal":case"select":{const a=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(12,At(a,{...a}));this.bumpSpace();let r=this.parseIdentifierIfPossible(),o=0;if("select"!==n&&"offset"===r.value){if(!this.bumpIf(":"))return this.error(13,At(this.clonePosition(),this.clonePosition()));this.bumpSpace();const e=this.tryParseDecimalInteger(13,14);if(e.err)return e;this.bumpSpace(),r=this.parseIdentifierIfPossible(),o=e.val}const l=this.tryParsePluralOrSelectOptions(e,n,t,r);if(l.err)return l;const d=this.tryParseArgumentClose(s);if(d.err)return d;const h=At(s,this.clonePosition());return"select"===n?{val:{type:5,value:i,options:Ht(l.val),location:h},err:null}:{val:{type:6,value:i,options:Ht(l.val),offset:o,pluralType:"plural"===n?"cardinal":"ordinal",location:h},err:null}}default:return this.error(5,At(a,r))}}tryParseArgumentClose(e){return this.isEOF()||125!==this.char()?this.error(1,At(e,this.clonePosition())):(this.bump(),{val:!0,err:null})}parseSimpleArgStyleIfPossible(){let e=0;const t=this.clonePosition();for(;!this.isEOF();)switch(this.char()){case 39:{this.bump();let e=this.clonePosition();if(!this.bumpUntil("'"))return this.error(11,At(e,this.clonePosition()));this.bump();break}case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}return{val:this.message.slice(t.offset,this.offset()),err:null}}parseNumberSkeletonFromString(e,t){let i=[];try{i=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");const t=e.split(tt).filter(e=>e.length>0),i=[];for(const e of t){let t=e.split("/");if(0===t.length)throw new Error("Invalid number skeleton");const[s,...a]=t;for(const e of a)if(0===e.length)throw new Error("Invalid number skeleton");i.push({stem:s,options:a})}return i}(e)}catch{return this.error(7,t)}return{val:{type:0,tokens:i,location:t,parsedOptions:this.shouldParseSkeletons?ct(i):{}},err:null}}tryParsePluralOrSelectOptions(e,t,i,s){let a=!1;const n=[],r=new Set;let{value:o,location:l}=s;for(;;){if(0===o.length){const e=this.clonePosition();if("select"===t||!this.bumpIf("="))break;{const t=this.tryParseDecimalInteger(16,19);if(t.err)return t;l=At(e,this.clonePosition()),o=this.message.slice(e.offset,this.offset())}}if(r.has(o))return this.error("select"===t?21:20,l);"other"===o&&(a=!0),this.bumpSpace();const s=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?17:18,At(this.clonePosition(),this.clonePosition()));const d=this.parseMessage(e+1,t,i);if(d.err)return d;const h=this.tryParseArgumentClose(s);if(h.err)return h;n.push([o,{value:d.val,location:At(s,this.clonePosition())}]),r.add(o),this.bumpSpace(),({value:o,location:l}=this.parseIdentifierIfPossible())}return 0===n.length?this.error("select"===t?15:16,At(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!a?this.error(22,At(this.clonePosition(),this.clonePosition())):{val:n,err:null}}tryParseDecimalInteger(e,t){let i=1;const s=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(i=-1);let a=!1,n=0;for(;!this.isEOF();){const e=this.char();if(!(e>=48&&e<=57))break;a=!0,n=10*n+(e-48),this.bump()}const r=At(s,this.clonePosition());return a?(n*=i,Number.isSafeInteger(n)?{val:n,err:null}:this.error(t,r)):this.error(e,r)}offset(){return this.position.offset}isEOF(){return this.offset()===this.message.length}clonePosition(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}}char(){const e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");const t=this.message.codePointAt(e);if(void 0===t)throw Error(`Offset ${e} is at invalid UTF-16 code unit boundary`);return t}error(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}}bump(){if(this.isEOF())return;const e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}bumpIf(e){const t=this.offset();if(this.message.slice(t,t+e.length)===e){for(let t=0;t<e.length;t++)this.bump();return!0}return!1}bumpUntil(e){const t=this.offset(),i=this.message.indexOf(e,t);return i>=0?(this.bumpTo(i),!0):(this.bumpTo(this.message.length),!1)}bumpTo(e){if(this.offset()>e)throw Error(`targetOffset ${e} must be greater than or equal to the current offset ${this.offset()}`);for(e=Math.min(e,this.message.length);;){const t=this.offset();if(t===e)break;if(t>e)throw Error(`targetOffset ${e} is at invalid UTF-16 code unit boundary`);if(this.bump(),this.isEOF())break}}bumpSpace(){for(;!this.isEOF()&&Ut(this.char());)this.bump()}peek(){if(this.isEOF())return null;const e=this.char(),t=this.offset();return this.message.charCodeAt(t+(e>=65536?2:1))??null}};function It(e){return e>=97&&e<=122||e>=65&&e<=90}function Lt(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function Ut(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function Ft(e){e.forEach(e=>{if(delete e.location,_t(e)||yt(e))for(const t in e.options)delete e.options[t].location,Ft(e.options[t].value);else mt(e)&&$t(e.style)||(vt(e)||ft(e))&&xt(e.style)?delete e.style.location:bt(e)&&Ft(e.children)})}function Bt(e,t={}){t={shouldParseSkeletons:!0,requiresOtherClause:!0,...t};const i=new jt(e,t).parse();if(i.err){const e=SyntaxError(ut[i.err.kind]);throw e.location=i.err.location,e.originalMessage=i.err.message,e}return t?.captureLocation||Ft(i.val),i.val}var Yt=class extends Error{constructor(e,t,i){super(e),this.code=t,this.originalMessage=i}toString(){return`[formatjs Error: ${this.code}] ${this.message}`}},Wt=class extends Yt{constructor(e,t,i,s){super(`Invalid values for "${e}": "${t}". Options are "${Object.keys(i).join('", "')}"`,"INVALID_VALUE",s)}},Vt=class extends Yt{constructor(e,t,i){super(`Value for "${e}" must be of type ${t}`,"INVALID_VALUE",i)}},Zt=class extends Yt{constructor(e,t){super(`The intl string context variable "${e}" was not provided to the string "${t}"`,"MISSING_VALUE",t)}};function Gt(e){return"function"==typeof e}function qt(e,t,i,s,a,n,r){if(1===e.length&&pt(e[0]))return[{type:0,value:e[0].value}];const o=[];for(const l of e){if(pt(l)){o.push({type:0,value:l.value});continue}if(wt(l)){"number"==typeof n&&o.push({type:0,value:i.getNumberFormat(t).format(n)});continue}const{value:e}=l;if(!a||!(e in a))throw new Zt(e,r);let d=a[e];if(gt(l))d&&"string"!=typeof d&&"number"!=typeof d&&"bigint"!=typeof d||(d="string"==typeof d||"number"==typeof d||"bigint"==typeof d?String(d):""),o.push({type:"string"==typeof d?0:1,value:d});else{if(vt(l)){const e="string"==typeof l.style?s.date[l.style]:xt(l.style)?l.style.parsedOptions:void 0;o.push({type:0,value:i.getDateTimeFormat(t,e).format(d)});continue}if(ft(l)){const e="string"==typeof l.style?s.time[l.style]:xt(l.style)?l.style.parsedOptions:s.time.medium;o.push({type:0,value:i.getDateTimeFormat(t,e).format(d)});continue}if(mt(l)){const e="string"==typeof l.style?s.number[l.style]:$t(l.style)?l.style.parsedOptions:void 0;if(e&&e.scale){const t=e.scale||1;if("bigint"==typeof d){if(!Number.isInteger(t))throw new TypeError(`Cannot apply fractional scale ${t} to bigint value. Scale must be an integer when formatting bigint.`);d*=BigInt(t)}else d*=t}o.push({type:0,value:i.getNumberFormat(t,e).format(d)});continue}if(bt(l)){const{children:e,value:d}=l,h=a[d];if(!Gt(h))throw new Vt(d,"function",r);let c=h(qt(e,t,i,s,a,n).map(e=>e.value));Array.isArray(c)||(c=[c]),o.push(...c.map(e=>({type:"string"==typeof e?0:1,value:e})))}if(_t(l)){const e=d,n=(Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0)||l.options.other;if(!n)throw new Wt(l.value,d,Object.keys(l.options),r);o.push(...qt(n.value,t,i,s,a));continue}if(yt(l)){const e=`=${d}`;let n=Object.prototype.hasOwnProperty.call(l.options,e)?l.options[e]:void 0;if(!n){if(!Intl.PluralRules)throw new Yt('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',"MISSING_INTL_API",r);const e="bigint"==typeof d?Number(d):d,s=i.getPluralRules(t,{type:l.pluralType}).select(e-(l.offset||0));n=(Object.prototype.hasOwnProperty.call(l.options,s)?l.options[s]:void 0)||l.options.other}if(!n)throw new Wt(l.value,d,Object.keys(l.options),r);const h="bigint"==typeof d?Number(d):d;o.push(...qt(n.value,t,i,s,a,h-(l.offset||0)));continue}}}return(l=o).length<2?l:l.reduce((e,t)=>{const i=e[e.length-1];return i&&0===i.type&&0===t.type?i.value+=t.value:e.push(t),e},[]);var l}function Kt(e,t){return t?Object.keys(e).reduce((i,s)=>{var a,n;return i[s]=(a=e[s],(n=t[s])?{...a,...n,...Object.keys(a).reduce((e,t)=>(e[t]={...a[t],...n[t]},e),{})}:a),i},{...e}):e}function Jt(e){return{create:()=>({get:t=>e[t],set(t,i){e[t]=i}})}}var Xt=class e{constructor(t,i=e.defaultLocale,s,a){if(this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=e=>{const t=this.formatToParts(e);if(1===t.length)return t[0].value;const i=t.reduce((e,t)=>(e.length&&0===t.type&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e),[]);return i.length<=1?i[0]||"":i},this.formatToParts=e=>qt(this.ast,this.locales,this.formatters,this.formats,e,void 0,this.message),this.resolvedOptions=()=>({locale:this.resolvedLocale?.toString()||Intl.NumberFormat.supportedLocalesOf(this.locales)[0]}),this.getAst=()=>this.ast,this.locales=i,this.resolvedLocale=e.resolveLocale(i),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");const{...i}=a||{};this.ast=e.__parse(t,{...i,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Kt(e.formats,s),this.formatters=a&&a.formatters||function(e={number:{},dateTime:{},pluralRules:{}}){return{getNumberFormat:Ye((...e)=>new Intl.NumberFormat(...e),{cache:Jt(e.number),strategy:Xe.variadic}),getDateTimeFormat:Ye((...e)=>new Intl.DateTimeFormat(...e),{cache:Jt(e.dateTime),strategy:Xe.variadic}),getPluralRules:Ye((...e)=>new Intl.PluralRules(...e),{cache:Jt(e.pluralRules),strategy:Xe.variadic})}}(this.formatterCache)}static{this.memoizedDefaultLocale=null}static get defaultLocale(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale}static{this.resolveLocale=e=>{if(void 0===Intl.Locale)return;const t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])}}static{this.__parse=Bt}static{this.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}}}};const Qt="/api/smart_irrigation/languages",ei=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sl","sv","uk","zh-Hans"],ti={en:Be},ii={};function si(e){return(e||"").replace(/['"]+/g,"")}function ai(e,t,...i){const s=si(t);let a;try{a=e.split(".").reduce((e,t)=>e[t],ti[s])}catch(t){a=e.split(".").reduce((e,t)=>e[t],ti.en)}if(void 0===a&&(a=e.split(".").reduce((e,t)=>e[t],ti.en)),!i.length)return a;const n={};for(let e=0;e<i.length;e+=2){let t=i[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=i[e+1]}try{return new Xt(a,t).format(n)}catch(e){return"Translation "+e}}var ni,ri;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(ni||(ni={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ri||(ri={}));const oi=(e,t,i,s)=>{s=s||{},i=null==i?{}:i;const a=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return a.detail=i,e.dispatchEvent(a),a},li="v2026.11.0-beta1",di="smart_irrigation",hi="precipitation_threshold_mm",ci="irrigation_start_triggers",ui="sunrise",pi="solar_azimuth",gi="time",mi="minutes",vi="hours",fi="days",_i="imperial",yi="metric",wi="Dewpoint",bi="Evapotranspiration",$i="Humidity",xi="Maximum Temperature",ki="Minimum Temperature",Si="Precipitation",zi="module",Ti="Current Precipitation",Mi="Pressure",Oi="Solar Radiation",Ai="Temperature",Ci="Windspeed",Ei="Open-Meteo",Di="Home Assistant weather entity",Hi=[Ei,Di],Ni=[Di],Ri="weather_service",Pi="sensor",ji="static",Ii="illuminance",Li="pressure_type",Ui="wind_height",Fi="absolute",Bi="relative",Yi="none",Wi="source",Vi="sensorentity",Zi="static_value",Gi="unit",qi="aggregate",Ki=["average","first","last","maximum","median","minimum","riemannsum","sum","delta"],Ji="sq ft",Xi="l/minute",Qi="gal/minute",es="°C",ts="mm",is="in",ss="meter/s",as="MJ/day/m2",ns="mm/h",rs="in/h",os="name",ls="size",ds="throughput",hs="state",cs="duration",us="water_volume",ps="bucket",gs="multiplier",ms="mapping",vs="lead_time",fs="maximum_duration",_s="maximum_bucket",ys="irrigation_threshold",ws="drainage_rate",bs="linked_entity",$s="days_between_irrigation",xs="available_water",ks="crop_factor_by_month",Ss="allowed_depletion",zs="distribution_efficiency",Ts="safety_off_topic",Ms="supply_id",Os="extra_entities",As="safety_off_state_key",Cs="safety_off_mode",Es="confirm_timeout",Ds="open_resends",Hs="flow_sensor",Ns="soil_moisture_sensor",Rs="soil_moisture_threshold",Ps="input_method",js="throughput",Is="direct",Ls="precipitation_rate",Us=2,Fs=e=>(...t)=>({_$litDirective$:e,values:t});let Bs=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class Ys extends Bs{constructor(e){if(super(e),this.it=q,e.type!==Us)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===q||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Ys.directiveName="unsafeHTML",Ys.resultType=1;const Ws=Fs(Ys);function Vs(e,t){return(e=e.toString()).split(",")[t]}function Zs(e,t,i){var s,a,n;const r=new Date(e);if(isNaN(r.getTime()))return"-";const o=null!==(n=null!==(a=null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)&&void 0!==a?a:null==t?void 0:t.language)&&void 0!==n?n:navigator.language;try{return new Intl.DateTimeFormat(o,i).format(r)}catch(e){return r.toLocaleString()}}function Gs(e,t){const i=(null==e?void 0:e.units)==yi;switch(t){case ws:case Ls:return i?ns:rs;case hi:case ps:return i?ts:is;case ls:return i?"m²":Ji;case ds:return i?Xi:Qi;case us:return i?"L":"gal";default:return""}}function qs(e,t){switch(t){case ws:case Ls:return e.units==yi?V`${Ws(ns)}`:V`${Ws(rs)}`;case hi:case ps:return e.units==yi?V`${Ws(ts)}`:V`${Ws(is)}`;case ls:return e.units==yi?V`${Ws("m<sup>2</sup>")}`:V`${Ws(Ji)}`;case ds:return e.units==yi?V`${Ws(Xi)}`:V`${Ws(Qi)}`;case us:return e.units==yi?V`${Ws("L")}`:V`${Ws("gal")}`;default:return V``}}function Ks(e){const t=Math.max(0,Math.round(Number(e)||0)),i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60,n=e=>String(e).padStart(2,"0");return`${n(i)}:${n(s)}:${n(a)}`}function Js(e,t){const i=Number(e)||0,s=Number(t)||0;return i<=0||s<=0?0:i/60*s}const Xs=3.785411784;function Qs(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===yi?i:i/Xs}function ea(e,t){const i=Number(e)||0,s=(null==t?void 0:t.units)===yi?i:i*Xs;return Math.round(100*s)/100}function ta(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===yi?i:i/25.4}function ia(e){switch(e){case wi:case Ai:return[{unit:es,system:yi},{unit:"°F",system:_i}];case Si:case bi:return[{unit:ts,system:yi},{unit:is,system:_i}];case Ti:return[{unit:ns,system:yi},{unit:rs,system:_i}];case $i:return[{unit:"%",system:[yi,_i]}];case Mi:return[{unit:"millibar",system:yi},{unit:"hPa",system:yi},{unit:"psi",system:_i},{unit:"inch Hg",system:_i}];case Ci:return[{unit:"km/h",system:yi},{unit:ss,system:yi},{unit:"mile/h",system:_i},{unit:"knot",system:[yi,_i]}];case Oi:return[{unit:"W/m2",system:yi},{unit:as,system:yi},{unit:"W/sq ft",system:_i},{unit:"MJ/day/sq ft",system:_i}];default:return[]}}function sa(e,t){!function(e,t){oi(e,"show-dialog",{dialogTag:"smart-irrigation-error-dialog",dialogImport:()=>Promise.resolve().then(function(){return tr}),dialogParams:{error:t}})}(t,V`
    ${e.error}:${e.body.message?V` ${e.body.message} `:""}
  `)}const aa=(e,t,i=!1)=>{i?history.replaceState(null,"",t):history.pushState(null,"",t),oi(window,"location-changed",{replace:i})},na={Static:"manual",Passthrough:"standard",PyETO:"advanced"};const ra={from_weather:"PyETO",provided:"Passthrough",fixed:"Static"};function oa(e){return-Math.abs(Number(e)||0)}function la(e,t){if(!e)return"";const i=na[e];return i?ai(`common.modes.${i}`,t):e}const da=e=>e.callWS({type:di+"/config"}),ha=e=>e.callWS({type:di+"/weatherservice"}),ca=e=>e.callWS({type:di+"/zones"}),ua=(e,t)=>e.callApi("POST",di+"/zones",t),pa=e=>e.callWS({type:di+"/modules"}),ga=e=>e.callWS({type:di+"/allmodules"}),ma=e=>e.callWS({type:di+"/mappings"}),va=(e,t)=>e.callApi("POST",di+"/mappings",t),fa=e=>e.callWS({type:di+"/info"}),_a=(e,t,i=10)=>e.callWS({type:di+"/weather_records",mapping_id:t,limit:i}),ya=(e,t=500)=>e.callWS({type:di+"/irrigation_history",limit:t}),wa=(e,t)=>e.callWS({type:di+"/watering_calendar",zone_id:t}),ba=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then(e=>e()):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return i([ve({attribute:!1})],t.prototype,"hass",void 0),t};var $a="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",xa="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z",ka="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z",Sa="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",za="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Ta="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",Ma="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z",Oa="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",Aa="M7,10L12,15L17,10H7Z",Ca="M19,13H5V11H19V13Z",Ea="M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",Da="M8,5.14V19.14L19,12.14L8,5.14Z",Ha="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Na="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",Ra="M18,18H6V6H18V18Z",Pa="M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",ja="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z";let Ia=class extends ce{constructor(){super(...arguments),this.value=""}showDialog(e){return this._options=e,this.value="",new Promise(e=>this._resolve=e)}_answer(e){const t=this._resolve;this._resolve=void 0,this._options=void 0,null==t||t(e)}render(){var e,t,i;if(!this._options)return V``;const s=(e,t)=>{var i,s;return(null===(s=null===(i=this.hass)||void 0===i?void 0:i.localize)||void 0===s?void 0:s.call(i,e))||t};return V`
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
    `}};async function La(e,t){const i=document.createElement("smart-irrigation-confirmation-dialog");i.hass=e,document.body.appendChild(i);try{return await i.showDialog(t)}finally{i.remove()}}i([ve({attribute:!1})],Ia.prototype,"hass",void 0),i([fe()],Ia.prototype,"_options",void 0),Ia=i([pe("smart-irrigation-confirmation-dialog")],Ia);const Ua=l`
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
`,Fa=l`
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
`,Ba="06:00";let Ya=class extends ce{async showDialog(e){if(this.params=e,this._error=void 0,e.createTrigger)this._trigger={type:ui,name:"",enabled:!0,offset_minutes:0,azimuth_angle:90,account_for_duration:!0};else if(e.trigger){const t=e.trigger;this._trigger=function(e){var t,i,s,a,n,r;const o={type:e.type,name:null!==(t=e.name)&&void 0!==t?t:"",enabled:null===(i=e.enabled)||void 0===i||i,offset_minutes:null!==(s=e.offset_minutes)&&void 0!==s?s:0,account_for_duration:null===(a=e.account_for_duration)||void 0===a||a};return e.type===pi?Object.assign(Object.assign({},o),{azimuth_angle:null!==(n=e.azimuth_angle)&&void 0!==n?n:90}):e.type===gi?Object.assign(Object.assign({},o),{at:null!==(r=e.at)&&void 0!==r?r:Ba}):o}(t)}else this._trigger=void 0;await this.updateComplete}_closeDialog(){this.params=void 0,this._error=void 0,this._trigger=void 0}_saveTrigger(){var e,i,s,a,n,r,o;if(!this._trigger||!this.params)return;const l=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-select");if(l){const e=null!==(s=null!==(i=l.value)&&void 0!==i?i:l.selected)&&void 0!==s?s:void 0;if(e&&e!==this._trigger.type){if(e===pi)this._trigger=Object.assign(Object.assign({},this._trigger),{type:e,azimuth_angle:null!==(a=this._trigger.azimuth_angle)&&void 0!==a?a:90});else if(e===gi){const i=this._trigger,{azimuth_angle:s}=i,a=t(i,["azimuth_angle"]);this._trigger=Object.assign(Object.assign({},a),{type:e,at:null!==(n=this._trigger.at)&&void 0!==n?n:Ba})}else{const i=this._trigger,{azimuth_angle:s,at:a}=i,n=t(i,["azimuth_angle","at"]);this._trigger=Object.assign(Object.assign({},n),{type:e})}this.requestUpdate()}}if(null===(r=this._trigger.name)||void 0===r?void 0:r.trim())if(this._trigger.type!==gi||/^\d{1,2}:\d{2}$/.test(null!==(o=this._trigger.at)&&void 0!==o?o:"")){if(this._trigger.type===pi){if(void 0===this._trigger.azimuth_angle||isNaN(this._trigger.azimuth_angle))return void(this._error=ai("irrigation_start_triggers.validation.azimuth_invalid",this.hass.language));this._trigger.azimuth_angle=this._trigger.azimuth_angle%360,this._trigger.azimuth_angle<0&&(this._trigger.azimuth_angle+=360)}this.dispatchEvent(new CustomEvent("trigger-save",{detail:{trigger:this._trigger,isNew:this.params.createTrigger,index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog()}else this._error=ai("irrigation_start_triggers.validation.time_invalid",this.hass.language);else this._error=ai("irrigation_start_triggers.validation.name_required",this.hass.language)}_ask(e,t=!1){return La(this.hass,{text:e,destructive:t})}async _deleteTrigger(){var e,t,i,s;this.params&&!this.params.createTrigger&&await this._ask(ai("irrigation_start_triggers.confirm_delete",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en").replace("{name}",null!==(s=null===(i=this._trigger)||void 0===i?void 0:i.name)&&void 0!==s?s:""),!0)&&(this.dispatchEvent(new CustomEvent("trigger-delete",{detail:{index:this.params.triggerIndex},bubbles:!0,composed:!0})),this._closeDialog())}_updateTrigger(e){this._trigger?(this._trigger=Object.assign(Object.assign({},this._trigger),e),this.requestUpdate()):console.warn("_updateTrigger called with undefined _trigger",e)}render(){var e,t;if(!this.params||!this._trigger)return V``;const i=this.params.createTrigger,s=ai(i?"irrigation_start_triggers.dialog.add_title":"irrigation_start_triggers.dialog.edit_title",this.hass.language);return V`
      <ha-dialog open .heading=${!0}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${Ta}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${s}</span>
        </div>

        <div class="wrapper">
          ${this._error?V`<ha-alert alert-type="error">${this._error}</ha-alert>`:""}
          <div class="dialog-help">
            ${ai("irrigation_start_triggers.dialog.help",this.hass.language)}
            <code>smart_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${ai("irrigation_start_triggers.fields.name.name",this.hass.language)}</label
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
              .label=${ai("irrigation_start_triggers.fields.type.name",this.hass.language)}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${ui}>
                ${ai("irrigation_start_triggers.trigger_types.sunrise",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${"sunset"}>
                ${ai("irrigation_start_triggers.trigger_types.sunset",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${pi}>
                ${ai("irrigation_start_triggers.trigger_types.solar_azimuth",this.hass.language)}
              </ha-dropdown-item>
              <ha-dropdown-item value=${gi}>
                ${ai("irrigation_start_triggers.trigger_types.time",this.hass.language)}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${ai("irrigation_start_triggers.fields.enabled.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${ai("irrigation_start_triggers.fields.offset_minutes.name",this.hass.language)}</label
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
              .label=${ai("irrigation_start_triggers.fields.account_for_duration.name",this.hass.language)}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type===gi?V`
                <div class="form-group">
                  <label class="form-label"
                    >${ai("irrigation_start_triggers.fields.at.name",this.hass.language)}</label
                  >
                  <input
                    class="form-input"
                    type="time"
                    .value=${this._trigger.at||Ba}
                    @input=${this._atChanged}
                  />
                </div>
              `:""}
          ${this._trigger.type===pi?V`
                <div class="form-group">
                  <label class="form-label"
                    >${ai("irrigation_start_triggers.fields.azimuth_angle.name",this.hass.language)}</label
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
            ${ai("irrigation_start_triggers.dialog.cancel",this.hass.language)}
          </ha-button>
          ${i?"":V`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${ai("irrigation_start_triggers.dialog.delete",this.hass.language)}
                </ha-button>
              `}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${ai("irrigation_start_triggers.dialog.save",this.hass.language)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `}_nameChanged(e){const t=e.target;this._updateTrigger({name:t.value})}_typeChanged(e){var t,i,s,a,n,r,o,l,d,h,c,u,p,g,m,v,f,_,y,w,b,$,x,k;const S=null!==(a=null!==(i=null===(t=null==e?void 0:e.detail)||void 0===t?void 0:t.value)&&void 0!==i?i:null===(s=e.target)||void 0===s?void 0:s.value)&&void 0!==a?a:null===(r=null===(n=this.shadowRoot)||void 0===n?void 0:n.querySelector("ha-select"))||void 0===r?void 0:r.value,z=String(S);let T;T=z===pi?{type:pi,name:null!==(l=null===(o=this._trigger)||void 0===o?void 0:o.name)&&void 0!==l?l:"",enabled:null===(h=null===(d=this._trigger)||void 0===d?void 0:d.enabled)||void 0===h||h,offset_minutes:null!==(u=null===(c=this._trigger)||void 0===c?void 0:c.offset_minutes)&&void 0!==u?u:0,azimuth_angle:null!==(g=null===(p=this._trigger)||void 0===p?void 0:p.azimuth_angle)&&void 0!==g?g:90,account_for_duration:null===(v=null===(m=this._trigger)||void 0===m?void 0:m.account_for_duration)||void 0===v||v}:{type:z,name:null!==(_=null===(f=this._trigger)||void 0===f?void 0:f.name)&&void 0!==_?_:"",enabled:null===(w=null===(y=this._trigger)||void 0===y?void 0:y.enabled)||void 0===w||w,offset_minutes:null!==($=null===(b=this._trigger)||void 0===b?void 0:b.offset_minutes)&&void 0!==$?$:0,account_for_duration:null===(k=null===(x=this._trigger)||void 0===x?void 0:x.account_for_duration)||void 0===k||k},this._trigger=T,this.requestUpdate()}_enabledChanged(e){const t=e.target;this._updateTrigger({enabled:t.checked})}_offsetChanged(e){const t=e.target;this._updateTrigger({offset_minutes:parseInt(t.value)||0})}_accountForDurationChanged(e){const t=e.target;this._updateTrigger({account_for_duration:t.checked})}_atChanged(e){const t=e.target.value;this._trigger=Object.assign(Object.assign({},this._trigger),{at:t})}_azimuthChanged(e){var t;if((null===(t=this._trigger)||void 0===t?void 0:t.type)!==pi)return;const i=e.target;let s=parseInt(i.value,10);isNaN(s)&&(s=90),this._updateTrigger({azimuth_angle:s})}static get styles(){return[Fa,l`
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
      `]}};i([ve({attribute:!1})],Ya.prototype,"hass",void 0),i([ve({attribute:!1})],Ya.prototype,"params",void 0),i([fe()],Ya.prototype,"_trigger",void 0),i([fe()],Ya.prototype,"_error",void 0),Ya=i([pe("smart-irrigation-trigger-dialog")],Ya);const Wa=l`
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
    .field,
    .select-wrap,
    .num-field {
      width: 100%;
      max-width: 100%;
    }
  }
`,Va=["postponed","rain_sensor","freeze","wind","precipitation","days_between","soil_moisture"],Za=new Set,Ga=new Set,qa={},Ka={};let Ja=class extends(ba(ce)){constructor(){super(...arguments),this.zones=[],this.planning=[],this._unfolded=Za,this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.debouncedSave=(()=>{let e=null,t={},i=[];return s=>{t=Object.assign(Object.assign({},t),s),e&&clearTimeout(e);const a=new Promise(e=>i.push(e));return e=window.setTimeout(()=>{const s=t,a=i;t={},i=[],e=null,this.saveData(s).catch(()=>{}).then(()=>a.forEach(e=>e()))},500),a}})()}_isOpen(e){return this._unfolded.has(e)}_openNew(e,t){return this._unfolded.add(`${e}:${t}`),t}_setOpen(e,t){t?this._unfolded.add(e):this._unfolded.delete(e)}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:di+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{this.config=await da(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval","continuousupdates","sensor_debounce","calc_log_enabled","manual_coordinates_enabled","manual_latitude","manual_longitude","manual_elevation","days_between_irrigation"],e?Object.entries(e).filter(([e])=>t.includes(e)).reduce((e,[t,i])=>Object.assign(e,{[t]:i}),{}):{});try{this.zones=await ca(this.hass)}catch(e){console.error("Error fetching zones:",e)}this._fetchLive(!0)}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}var e,t}}connectedCallback(){super.connectedCallback();let e=0;this._liveTimer=window.setInterval(()=>{e+=1,this._fetchLive(e%6==0)},5e3)}firstUpdated(){this._fetchLive(!0),be().catch(e=>{console.error("Failed to load HA form:",e)})}render(){var e,t,i;if(!this.hass||!this.config||!this.data)return V`<div class="loading-indicator">
        ${ai("common.loading-messages.configuration",null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en")}
      </div>`;if(this.isLoading)return V`<div class="loading-indicator">
        ${ai("common.loading-messages.general",this.hass.language)}
      </div>`;{const e="panels.general.cards.automatic-duration-calculation.labels",t=this.config.recalculate_before_start?"start":this.config.autocalcenabled?"time":"manual";let s=V` <div class="card-content">
          ${ai("panels.general.cards.automatic-duration-calculation.description",this.hass.language)}
        </div>
        <div class="card-content">
          ${this._selectRow(V`${ai(`${e}.calc-when`,this.hass.language)}
              <div class="setting-hint">
                ${ai(`${e}.calc-when-hint`,this.hass.language)}
              </div>`,V`
              <option value="time" ?selected=${"time"===t}>
                ${ai(`${e}.calc-when-time`,this.hass.language)}
              </option>
              <option value="start" ?selected=${"start"===t}>
                ${ai(`${e}.calc-when-start`,this.hass.language)}
              </option>
              <option value="manual" ?selected=${"manual"===t}>
                ${ai(`${e}.calc-when-manual`,this.hass.language)}
              </option>
            `,e=>{const t=e.target.value;this.handleConfigChange({autocalcenabled:"time"===t,recalculate_before_start:"start"===t})})}
        </div>`;"time"===t&&(s=V`${s}
          <div class="card-content">
            ${this._timeRow(ai(`${e}.calc-time`,this.hass.language),this.config.calctime,e=>this.handleConfigChange({calctime:e}),ai(`${e}.calc-time-hint`,this.hass.language))}
          </div>`),s=V`${s}
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai(`${e}.hourly-calculation`,this.hass.language)}
              <div class="setting-hint">
                ${ai(`${e}.hourly-calculation-hint`,this.hass.language)}
              </div>
            </div>
            <ha-switch
              .checked=${this.config.hourly_calculation}
              @change=${e=>this.handleConfigChange({hourly_calculation:e.target.checked})}
            ></ha-switch>
          </div>
          ${"advanced"!==this.config.ui_mode&&this.config.effective_rain?"":V`<div class="setting-row">
                  <div class="setting-label">
                    ${ai("weather_skip.effective_rain_label",this.hass.language)}
                    <div class="setting-hint">
                      ${ai("weather_skip.effective_rain_description",this.hass.language)}
                    </div>
                  </div>
                  <ha-switch
                    .checked=${!!this.config.effective_rain}
                    @change=${e=>this.handleConfigChange({effective_rain:e.target.checked})}
                  ></ha-switch>
                </div>`}
        </div>`,s=V`<ha-card
        header="${ai("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}"
      >
        ${s}</ha-card
      >`;let a=V` <div class="card-content">
          ${ai("panels.general.cards.automatic-update.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${e=>this.saveData({autoupdateenabled:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.autoupdateenabled&&(a=V`${a}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${ai("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}
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
                      value="${mi}"
                      ?selected=${this.data.autoupdateschedule===mi}
                    >
                      ${ai("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
                    </option>
                    <option
                      value="${vi}"
                      ?selected=${this.data.autoupdateschedule===vi}
                    >
                      ${ai("panels.general.cards.automatic-update.options.hours",this.hass.language)}
                    </option>
                    <option
                      value="${fi}"
                      ?selected=${this.data.autoupdateschedule===fi}
                    >
                      ${ai("panels.general.cards.automatic-update.options.days",this.hass.language)}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${Aa}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`),this.data.autoupdateenabled&&(a=V`${a}
          <div class="card-content">
            ${this._numRow(ai("panels.general.cards.automatic-update.labels.auto-update-delay",this.hass.language),"s",this.config.autoupdatedelay,e=>this.saveData({autoupdatedelay:parseInt(e)}),1)}
          </div>`),a=V`<ha-card header="${ai("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${a}</ha-card>`;const n="advanced"===this.config.ui_mode||!!this.config.continuousupdates;let r=V`<div class="card-content">
          ${ai("panels.general.cards.continuousupdates.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("panels.general.cards.continuousupdates.labels.continuousupdates",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${e=>this.handleConfigChange({continuousupdates:e.target.checked})}
            ></ha-switch>
          </div>
        </div>`;this.data.continuousupdates&&(r=V`${r}
          <div class="card-content">
            ${this._numRow(ai("panels.general.cards.continuousupdates.labels.sensor_debounce",this.hass.language),"ms",this.config.sensor_debounce,e=>this.handleConfigChange({sensor_debounce:parseInt(e)}),1)}
          </div>`),r=V`<ha-card
        header="${ai("panels.general.cards.continuousupdates.header",this.hass.language)}"
        >${r}</ha-card
      > `;const o=this.renderTriggersCard(),l=this.renderWeatherSkipCard(),d=this.renderCoordinateCard(),h=this.renderDaysBetweenIrrigationCard(),c=this.renderObservedWateringCard(),u=this.renderCalculationLogCard(),p=this.renderBlueprintsCard(),g=this.renderPanelModeCard(),m=this.renderSeasonalAdjustmentsCard();this.renderSuppliesCard();const v=this.renderFullControllerCard(),f=this.renderSetupAssistantCard(),_=this.renderIuImportCard();if(this.section)return this.renderWateringSection(o);const y=!0===this.config.full_controller;return V`<ha-card
          header="${ai("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${ai("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${f}${_}${g}${v}${a}${s}${n?r:""}${y?"":o}${l}${d}${h}${c}${u}${p}${m}`}}renderWateringSection(e){return this.config&&this.hass?!0!==this.config.full_controller?V`<ha-card>
        <div class="card-content">
          ${ai("programs.mode_off",this.hass.language)}
        </div>
      </ha-card>`:"planning"===this.section?V`${this.renderPlanningCard()}`:"supplies"===this.section?V`${this.renderSuppliesCard()}`:V`${this.renderProgramsCard("main")} ${e}
    ${this.renderProgramsCard("others")}`:V``}renderLiveState(){const e=this.programsState;if(!this.hass||!e)return V``;const t=this.hass.language,i=e=>ai(`planning.${e}`,t),s=e.live;if(!s)return V``;const a=e=>{const t=Math.floor(e/60),i=Math.round(e%60);return`${t}:${String(i).padStart(2,"0")}`},n=[...s.paused?[V`<div class="setting-note">
              <strong>${i("paused")}</strong>
            </div>`]:[],...(s.programs||[]).map(e=>V`
          <div class="setting-note">
            <strong>${this._programLabel(e.program_id,e.name)}</strong>
            ${"waiting"===e.state?V` - ${i("waiting")}`:V` - ${i("step")}
                ${e.step}/${e.steps}${e.tours>1?V`, ${i("tour")} ${e.tour}/${e.tours}`:""},
                ${e.percent} %, ${i("remaining")}
                ${a(e.remaining_seconds||0)}`}
          </div>
        `),...(s.valves||[]).map(e=>V`
          <div class="setting-note">
            ${e.zone}: ${i("remaining")} ${a(e.remaining_seconds)}
            (${e.percent} %)
          </div>
        `)];return n.length?V`${n}`:V`<div class="setting-note">${i("nothing_now")}</div>`}renderPlanningCard(){var e;if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const t=this.hass.language,i=e=>ai(`planning.${e}`,t),s=e=>new Intl.DateTimeFormat(t,{hour:"2-digit",minute:"2-digit"}).format(new Date(e)),a=e=>ai(`programs.${e}`,t),n=e=>this.hass.callService(di,e,{}).then(()=>this._fetchLive(!1)),r=(null===(e=this.programsState)||void 0===e?void 0:e.live)||{},o=!0===r.paused,l=(r.programs||[]).some(e=>"running"===e.state)||(r.valves||[]).length>0||!!r.cycle,d=o||l||(r.programs||[]).length>0,h=e=>e<60?`${Math.round(e)} s`:`${Math.round(e/60)} min`,c=this.planning||[];return V`
      <ha-card header="${i("title")}">
        <div class="card-content">
          ${i("description")} ${this.renderLiveState()}
        </div>
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn("M14,19H18V5H14M6,19H10V5H6V19Z",a("pause"),()=>n("pause_watering"),!1,!l||o)}
            ${this._actionBtn(Da,a("resume"),()=>n("resume_watering"),!1,!o)}
            ${this._actionBtn("M16,18H18V6H16M6,18L14.5,12L6,6V18Z",a("next_step"),()=>n("next_step"),!1,!l||o)}
            ${this._actionBtn(Ra,a("stop"),async()=>{await this._ask(a("confirm_stop"),!0)&&n("stop_watering")},!0,!d)}
          </div>
          <div class="setting-hint row-hint">${a("controls_help")}</div>
        </div>

        ${c.length?c.map(e=>{var a,n,r;return V`
                <div class="card-content">
                  <div class="setting-note">
                    <strong>${r=e.start,new Intl.DateTimeFormat(t,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(r))}</strong>
                    ${this._programLabel(e.program_id,e.program)}
                    (${s(e.start)} - ${s(e.end)})
                  </div>
                  ${e.steps.map((e,t)=>V`
                      <div class="setting-note">
                        ${t+1}.
                        ${e.zones.map(e=>{var t;return`${e.zone} ${h(null!==(t=e.expected_seconds)&&void 0!==t?t:e.seconds)}`}).join(" + ")}
                      </div>
                    `)}
                  ${e.nothing_to_water?V`<div
                        class="setting-note"
                        style="opacity: 0.6; font-style: italic;"
                      >
                        ${i("nothing_to_water")}
                      </div>`:e.expected_seconds?V`<div class="setting-note">
                          ${i("expected")} ${h(e.expected_seconds)}
                        </div>`:""}
                  ${e.skipped_reason?V`<div
                        class="setting-note"
                        style="opacity: 0.6; font-style: italic;"
                      >
                        ${i("expected_skipped_precipitation").replace("{mm}",String(Math.round(10*(null!==(n=null===(a=e.forecast)||void 0===a?void 0:a.forecast_mm)&&void 0!==n?n:0))/10))}
                      </div>`:""}
                  ${e.tours>1?V`<div class="setting-note">
                        ${e.tours} ${i("tours")}
                      </div>`:""}
                </div>
              `}):V`<div class="card-content">${i("nothing_planned")}</div>`}
      </ha-card>
    `}async _fetchLive(e){var t;if(this.hass&&!0===(null===(t=this.config)||void 0===t?void 0:t.full_controller))try{this.programsState=await this.hass.callWS({type:di+"/programs_state"}),e&&(this.planning=await this.hass.callWS({type:di+"/planning",days:3}),await this._fetchStartSource()),this._scheduleUpdate()}catch(e){console.error("Error fetching the programs' state:",e)}}async _fetchStartSource(){var e,t;if(this.hass&&!0===(null===(e=this.config)||void 0===e?void 0:e.full_controller))try{const e=await fa(this.hass);this.startSource=null!==(t=null==e?void 0:e.start_source)&&void 0!==t?t:"trigger",this._scheduleUpdate()}catch(e){console.error("Error fetching what starts the main program:",e)}}renderProgramsCard(e="others"){if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const t=this.hass.language,i=e=>ai(`programs.${e}`,t),s=this.config.programs||[],a=e=>{this.config=Object.assign(Object.assign({},this.config),{programs:e}),this.handleConfigChange({programs:e}),this._scheduleUpdate()},n=(e,t)=>a(s.map((i,s)=>s===e?Object.assign(Object.assign({},i),t):i)),r=(e,t=0)=>{const i=parseFloat(e);return isNaN(i)?t:i},o=e=>this._programLabel(e.main?"main":e.id,e.name),l=e=>oi(this,"hass-notification",{message:e}),d=async e=>{var t,s,a;const n=e.id,r=o(e);if(!await this._ask(i("confirm_run").replace("{name}",r)))return;const d=qa[null!=n?n:""]||{},h=Math.round(parseFloat(null!==(t=d.seconds)&&void 0!==t?t:"")),u={program_id:n};h>0&&"main"!==n&&(u.seconds=Math.min(h,86400)),d.replace&&(u.mode="replace");try{await this.hass.callService(di,"run_program",u)}catch(e){return void l(i("run_failed").replace("{name}",r).replace("{error}",null!==(s=null==e?void 0:e.message)&&void 0!==s?s:String(e)))}await this._fetchLive(!1);const p=null===(a=c(n))||void 0===a?void 0:a.state;l(i("running"===p?"run_started":"waiting"===p?"run_queued":"run_nothing").replace("{name}",r))},h=e=>{var s,a,n;return V`
      <details class="more">
        <summary>${i("run_options")}</summary>
        <div class="more-body">
          ${"main"===e?"":V`<div class="setting-row">
                  <div class="setting-label">
                    ${i("run_seconds")}
                    <span class="unit"
                      >(${ai("common.units.seconds",t)})</span
                    >
                  </div>
                  <input
                    class="field"
                    type="number"
                    min="1"
                    max="86400"
                    .value=${null!==(a=null===(s=qa[null!=e?e:""])||void 0===s?void 0:s.seconds)&&void 0!==a?a:""}
                    @input=${t=>{var i;(qa[i=null!=e?e:""]||(qa[i]={})).seconds=t.target.value}}
                  />
                </div>
                <div class="setting-hint row-hint">
                  ${i("run_seconds_help")}
                </div>`}
          <div class="setting-row">
            <div class="setting-label">${i("run_replace")}</div>
            <ha-switch
              .checked=${!0===(null===(n=qa[null!=e?e:""])||void 0===n?void 0:n.replace)}
              @change=${t=>{var i;(qa[i=null!=e?e:""]||(qa[i]={})).replace=t.target.checked}}
            ></ha-switch>
          </div>
          <div class="setting-hint row-hint">${i("run_replace_help")}</div>
        </div>
      </details>
    `},c=e=>{var t;return((null===(t=this.programsState)||void 0===t?void 0:t.programs)||[]).find(t=>t.program_id===e)},u=async e=>{await this._ask(i("confirm_stop_program").replace("{name}",e.name),!0)&&this.hass.callService(di,"stop_program",{program_id:e.id}).then(()=>this._fetchLive(!1))},p=e=>{var s,a,n,r;const o=null!==(s=e.id)&&void 0!==s?s:"",d=Ka[o]||(Ka[o]={}),h=null===(a=c(e.id))||void 0===a?void 0:a.adjustment,u=h?i("adjust_active").replace("{percent}",String(null!==(n=h.percent)&&void 0!==n?n:100)).replace("{seconds}",String(null!==(r=h.seconds)&&void 0!==r?r:0)).replace("{until}",h.until?new Date(h.until).toLocaleString(t):i("adjust_until_reset")):i("adjust_none"),p=(e,t,i,s)=>{var a;return V`
        <div class="setting-row">
          <div class="setting-label">
            ${e}${t?V` <span class="unit">(${t})</span>`:""}
          </div>
          <input
            class="field"
            type="number"
            placeholder=${s}
            .value=${null!==(a=d[i])&&void 0!==a?a:""}
            @input=${e=>{d[i]=e.target.value}}
          />
        </div>
      `},g=t=>this.hass.callService(di,"adjust_program",Object.assign({program_id:e.id},t)).then(()=>this._fetchLive(!1));return V`
        <div class="fold-section">${i("adjust_title")}</div>
        <div class="setting-note">${u}</div>
        ${p(i("adjust_percent"),"%","percent","100")}
        ${p(i("adjust_seconds"),ai("common.units.seconds",t),"seconds","0")}
        ${p(i("adjust_hours"),"h","hours","")}
        <div class="setting-hint row-hint">${i("adjust_help")}</div>
        <div class="si-actions">
          ${this._actionBtn(Da,i("adjust_apply"),()=>{var e,t,s;const a={},n=parseFloat(null!==(e=d.percent)&&void 0!==e?e:""),r=parseFloat(null!==(t=d.seconds)&&void 0!==t?t:""),o=parseFloat(null!==(s=d.hours)&&void 0!==s?s:"");isNaN(n)||(a.percent=n),isNaN(r)||(a.seconds=Math.round(r)),!isNaN(o)&&o>=1&&(a.hours=Math.round(o)),void 0!==a.percent||void 0!==a.seconds?g(a):l(i("adjust_empty"))})}
          ${this._actionBtn(Oa,i("adjust_reset"),async()=>{await this._ask(i("confirm_reset_adjustment"),!0)&&g({reset:!0})},!0,!h)}
        </div>
      `},g=()=>Math.random().toString(36).slice(2,8),m=e=>new Intl.DateTimeFormat(t,{weekday:"short"}).format(new Date(2024,0,1+e)),v=e=>new Intl.DateTimeFormat(t,{month:"short"}).format(new Date(2024,e,1)),f=e=>(e||[]).map(e=>{var t,s;return null!==(s=null===(t=this.zones.find(t=>t.id===e))||void 0===t?void 0:t.name)&&void 0!==s?s:i("deleted_zone")}).join(" + ")||i("no_zone"),_=(e,t,i)=>V`
      <details
        class="fold"
        ?open=${this._isOpen(e)}
        @toggle=${t=>this._setOpen(e,t.target.open)}
      >
        <summary>${t}</summary>
        <div class="fold-body">${i}</div>
      </details>
    `,y=(e,t,s)=>V`
      <details
        class="more"
        ?open=${this._isOpen(e)||t&&!Ga.has(e)}
        @toggle=${t=>{const i=t.target.open;this._setOpen(e,i),i?Ga.delete(e):Ga.add(e)}}
      >
        <summary>
          ${i("more_options")}${t?V` · <em>${i("more_options_set")}</em>`:""}
        </summary>
        <div class="more-body">${s}</div>
      </details>
    `,w=(e,s,a,o)=>{var l,d,h,c,u,p,g,m,v,w;const b=t=>n(s,{steps:(e.steps||[]).map((e,i)=>i===o?Object.assign(Object.assign({},e),t):e)}),$=(e,t)=>{const i=(a.zones||[]).filter(t=>t!==e);b({zones:t?[...i,e]:i})};return _(`step:${a.id}`,V`<strong>${i("step")} ${o+1}</strong> ·
          ${f(a.zones)} ·
          ${(e=>"fixed"===e.mode?`${e.seconds} s`:"percent"===e.mode?`${i("mode_calculated_short")} × ${e.percent} %`:i("mode_calculated_short"))(a)}${!1===a.enabled?V` · <em>${i("off")}</em>`:""}`,V`
          <div class="setting-row">
            <div class="setting-label">${i("step_zones")}</div>
            <div>
              ${(a.zones||[]).filter(e=>!this.zones.some(t=>t.id===e)).map(e=>V`
                    <label
                      style="margin-right: 12px; white-space: nowrap; color: var(--warning-color, #ff9800);"
                    >
                      <input
                        type="checkbox"
                        checked
                        @change=${t=>$(e,t.target.checked)}
                      />
                      &#9888; ${i("deleted_zone")}
                    </label>
                  `)}
              ${this.zones.map(e=>V`
                  <label style="margin-right: 12px; white-space: nowrap;">
                    <input
                      type="checkbox"
                      .checked=${(a.zones||[]).includes(e.id)}
                      @change=${t=>$(e.id,t.target.checked)}
                    />
                    ${e.name}
                  </label>
                `)}
            </div>
          </div>
          <div class="setting-hint row-hint">${i("step_zones_help")}</div>
          ${this._selectRow(i("step_duration"),V`
              <option
                value="calculated"
                ?selected=${"calculated"===a.mode}
              >
                ${i("mode_calculated")}
              </option>
              <option value="percent" ?selected=${"percent"===a.mode}>
                ${i("mode_percent")}
              </option>
              <option value="fixed" ?selected=${"fixed"===a.mode}>
                ${i("mode_fixed")}
              </option>
            `,e=>b({mode:e.target.value}))}
          ${"percent"===a.mode?this._numRow(i("percent"),"%",a.percent,e=>b({percent:Math.max(0,r(e,100))}),1,!1,0):""}
          ${"fixed"===a.mode?this._numRow(i("seconds"),"",a.seconds,e=>b({seconds:Math.max(0,r(e))}),1,!1,0):""}
          ${this._numRow(i("passes"),"",a.passes,e=>b({passes:Math.max(1,Math.round(r(e,1)))}),1,!1,1)}
          <div class="setting-hint row-hint">${i("passes_help")}</div>
          ${y(`more:step:${a.id}`,(null!==(l=a.max_litres)&&void 0!==l?l:0)>0||(null!==(d=a.min_seconds)&&void 0!==d?d:0)>0||(null!==(h=a.max_seconds)&&void 0!==h?h:0)>0||0!==(null!==(c=a.adjust_seconds)&&void 0!==c?c:0)||(null!==(u=a.min_deficit_mm)&&void 0!==u?u:0)>0||null!==a.delay&&void 0!==a.delay,V`
              ${this._numRow(i("max_litres"),Gs(this.config,us),+Qs(null!==(p=a.max_litres)&&void 0!==p?p:0,this.config).toFixed(2),e=>b({max_litres:Math.max(0,ea(r(e),this.config))}),1,!1,0)}
              <div class="setting-hint row-hint">${i("max_litres_help")}</div>
              ${this._numRow(i("min_seconds"),ai("common.units.seconds",t),null!==(g=a.min_seconds)&&void 0!==g?g:0,e=>b({min_seconds:Math.max(0,Math.round(r(e)))}),1,!1,0)}
              ${this._numRow(i("max_seconds"),ai("common.units.seconds",t),null!==(m=a.max_seconds)&&void 0!==m?m:0,e=>b({max_seconds:Math.max(0,Math.round(r(e)))}),1,!1,0)}
              ${this._numRow(i("adjust_seconds"),ai("common.units.seconds",t),null!==(v=a.adjust_seconds)&&void 0!==v?v:0,e=>b({adjust_seconds:Math.max(-21600,Math.min(21600,Math.round(r(e))))}))}
              <div class="setting-hint row-hint">${i("step_bounds_help")}</div>
              ${this._numRow(i("min_deficit_mm"),"mm",null!==(w=a.min_deficit_mm)&&void 0!==w?w:0,e=>b({min_deficit_mm:Math.max(0,r(e))}),1,!1,0)}
              <div class="setting-hint row-hint">
                ${i("min_deficit_mm_help")}
              </div>
              ${this._textRow(i("step_delay"),ai("common.units.seconds",t),null===a.delay||void 0===a.delay?"":a.delay,e=>b({delay:""===e.trim()?null:r(e)}))}
              <div class="setting-hint row-hint">${i("step_delay_help")}</div>
            `)}
          <div class="setting-row">
            <div class="setting-label">${i("enabled")}</div>
            <ha-switch
              .checked=${!1!==a.enabled}
              @change=${e=>b({enabled:e.target.checked})}
            ></ha-switch>
          </div>
          <div class="si-actions">
            ${this._actionBtn(Oa,i("delete_step"),async()=>{await this._ask(i("confirm_delete_step"),!0)&&n(s,{steps:(e.steps||[]).filter((e,t)=>t!==o)})},!0)}
          </div>
        `)},b=(e,s,a,o)=>{var l,d,h,c;const u=t=>n(s,{schedules:(e.schedules||[]).map((e,i)=>i===o?Object.assign(Object.assign({},e),t):e)}),p=(e,t,i)=>{const s=(e||[]).filter(e=>e!==t);return i?[...s,t].sort((e,t)=>e-t):s};return _(`schedule:${a.id}`,V`<strong>${i("schedule")} ${o+1}</strong> ·
          ${(e=>{var t,s;const a="end"===e.anchor?"end":"start",n=e.offset_minutes?` ${e.offset_minutes>0?"+":""}${e.offset_minutes} min`:"",r="sun"===e.type?`${i(`summary_${a}_${"sunset"===e.event?"sunset":"sunrise"}`)}${n}`:`${i("end"===a?"anchor_end_short":"anchor_start_short")} ${e.time}`,o=(e.weekdays||[]).length>0?e.weekdays.map(e=>m(e)).join(", "):(null!==(t=e.every_n_days)&&void 0!==t?t:1)>1?`${i("schedule_every")} ${e.every_n_days} ${i("schedule_days")}`:i("every_day");return`${o} · ${r}${(null!==(s=e.every_n_days)&&void 0!==s?s:1)>1&&(e.weekdays||[]).length>0||"even"===e.parity||"odd"===e.parity||(e.days_of_month||[]).length>0||(e.months||[]).length>0||e.from_date||e.until_date?` · ${i("more_options_set")}`:""}`})(a)}${!1===a.enabled?V` · <em>${i("off")}</em>`:""}`,V`
          ${this._selectRow(i("schedule_moment"),V`
              <option value="time" ?selected=${"time"===a.type}>
                ${i("moment_time")}
              </option>
              <option
                value="sunrise"
                ?selected=${"sun"===a.type&&"sunrise"===a.event}
              >
                ${i("moment_sunrise")}
              </option>
              <option
                value="sunset"
                ?selected=${"sun"===a.type&&"sunset"===a.event}
              >
                ${i("moment_sunset")}
              </option>
            `,e=>{const t=e.target.value;u("time"===t?{type:"time"}:{type:"sun",event:t})})}
          ${"time"===a.type?this._timeRow(i("schedule_time"),a.time,e=>u({time:e})):this._numRow(i("schedule_offset"),ai("common.units.minutes",t),a.offset_minutes,e=>u({offset_minutes:Math.round(r(e))}))}
          ${this._selectRow(i("schedule_anchor"),V`
              <option value="start" ?selected=${"end"!==a.anchor}>
                ${i("anchor_start")}
              </option>
              <option value="end" ?selected=${"end"===a.anchor}>
                ${i("anchor_end")}
              </option>
            `,e=>u({anchor:e.target.value}))}
          <div class="setting-hint row-hint">${i("schedule_anchor_help")}</div>
          <div class="setting-row">
            <div class="setting-label">${i("schedule_weekdays")}</div>
            <div>
              ${[0,1,2,3,4,5,6].map(e=>V`
                  <label style="margin-right: 10px; white-space: nowrap;">
                    <input
                      type="checkbox"
                      .checked=${(a.weekdays||[]).includes(e)}
                      @change=${t=>u({weekdays:p(a.weekdays,e,t.target.checked)})}
                    />
                    ${m(e)}
                  </label>
                `)}
            </div>
          </div>
          <div class="setting-hint row-hint">
            ${i("schedule_weekdays_help")}
          </div>
          <div class="setting-row">
            <div class="setting-label">${i("schedule_weather")}</div>
            <ha-switch
              .checked=${!1!==a.weather}
              @change=${e=>u({weather:e.target.checked})}
            ></ha-switch>
          </div>
          <div class="setting-hint row-hint">${i("schedule_weather_help")}</div>
          ${y(`more:schedule:${a.id}`,!!a.fallback_time||!0===a.hard_deadline||(null!==(l=a.every_n_days)&&void 0!==l?l:1)>1||"even"===a.parity||"odd"===a.parity||(a.days_of_month||[]).length>0||(a.months||[]).length>0||!!a.from_date||!!a.until_date||void 0!==a.skip_conditions,V`
              ${this._numRow(i("schedule_every"),i("schedule_days"),null!==(d=a.every_n_days)&&void 0!==d?d:1,e=>u({every_n_days:Math.max(1,Math.round(r(e,1)))}))}
              ${(null!==(h=a.every_n_days)&&void 0!==h?h:1)>1?this._numRow(i("schedule_every_offset"),i("schedule_days"),null!==(c=a.every_offset)&&void 0!==c?c:0,e=>u({every_offset:Math.max(0,Math.round(r(e)))})):""}
              <div class="setting-hint row-hint">
                ${i("schedule_every_help")}
              </div>
              ${this._selectRow(i("schedule_parity"),V`
                  <option
                    value="any"
                    ?selected=${"even"!==a.parity&&"odd"!==a.parity}
                  >
                    ${i("parity_any")}
                  </option>
                  <option value="even" ?selected=${"even"===a.parity}>
                    ${i("parity_even")}
                  </option>
                  <option value="odd" ?selected=${"odd"===a.parity}>
                    ${i("parity_odd")}
                  </option>
                `,e=>u({parity:e.target.value}))}
              ${this._textRow(i("schedule_days_of_month"),`1, 15, ${i("last_word")}`,(a.days_of_month||[]).map(e=>"last"===e?i("last_word"):e).join(", "),e=>u({days_of_month:e.split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).map(e=>e===i("last_word").toLowerCase()?"last":e).filter(e=>"last"===e||/^\d+$/.test(e)&&Number(e)>=1&&Number(e)<=31).map(e=>"last"===e?e:Number(e))}))}
              <div class="setting-hint row-hint">
                ${i("schedule_days_of_month_help")}
              </div>
              <div class="setting-row">
                <div class="setting-label">${i("schedule_months")}</div>
                <div>
                  ${[0,1,2,3,4,5,6,7,8,9,10,11].map(e=>V`
                      <label style="margin-right: 10px; white-space: nowrap;">
                        <input
                          type="checkbox"
                          .checked=${(a.months||[]).includes(e+1)}
                          @change=${t=>u({months:p(a.months,e+1,t.target.checked)})}
                        />
                        ${v(e)}
                      </label>
                    `)}
                </div>
              </div>
              <div class="setting-hint row-hint">
                ${i("schedule_months_help")}
              </div>
              ${this._monthDayRow(i("schedule_from"),a.from_date,v,e=>u({from_date:e}))}
              ${this._monthDayRow(i("schedule_until"),a.until_date,v,e=>u({until_date:e}))}
              <div class="setting-hint row-hint">
                ${i("schedule_period_help")}
              </div>
              ${"sun"===a.type?V`
                    ${this._selectRow(i("schedule_fallback_time"),V`
                        <option value="" ?selected=${!a.fallback_time}>
                          ${i("schedule_fallback_skip")}
                        </option>
                        <option
                          value="previous"
                          ?selected=${"previous"===a.fallback_time}
                        >
                          ${i("schedule_fallback_previous")}
                        </option>
                        <option
                          value="at"
                          ?selected=${!!a.fallback_time&&"previous"!==a.fallback_time}
                        >
                          ${i("schedule_fallback_at")}
                        </option>
                      `,e=>{const t=e.target.value,i=a.fallback_time&&"previous"!==a.fallback_time?a.fallback_time:"06:00";u({fallback_time:"at"===t?i:t||null})})}
                    ${a.fallback_time&&"previous"!==a.fallback_time?this._timeRow(i("schedule_time"),a.fallback_time,e=>u({fallback_time:e||null})):""}
                    <div class="setting-hint row-hint">
                      ${i("schedule_fallback_time_help")}
                    </div>
                  `:""}
              ${"end"!==a.anchor||e.main?"":V`
                    <div class="setting-row">
                      <div class="setting-label">
                        ${i("schedule_hard_deadline")}
                      </div>
                      <ha-switch
                        .checked=${!0===a.hard_deadline}
                        @change=${e=>u({hard_deadline:e.target.checked})}
                      ></ha-switch>
                    </div>
                    <div class="setting-hint row-hint">
                      ${i("schedule_hard_deadline_help")}
                    </div>
                  `}
              ${!1!==a.weather?V`
                    <div class="setting-label" style="margin-top: 8px;">
                      ${i("schedule_conditions")}
                    </div>
                    <div class="setting-hint row-hint">
                      ${i("schedule_conditions_help")}
                    </div>
                    ${Va.every(e=>"postponed"===e||!this._conditionSetting(e))?V`<div class="setting-hint row-hint">
                          ${i("conditions_none")}
                        </div>`:""}
                    ${Va.map(e=>{var t;const s="postponed"===e,n=null!==(t=a.skip_conditions)&&void 0!==t?t:Va,r=s?i("cond_postponed"):this._conditionSetting(e);return V`
                        <div class=${r?"":"cond-off"}>
                          <label style="white-space: nowrap;">
                            <input
                              type="checkbox"
                              .checked=${s||n.includes(e)}
                              ?disabled=${s||!r}
                              @change=${t=>{const i=t.target.checked,s=Va.filter(t=>t===e?i:n.includes(t));u({skip_conditions:s.length===Va.length?void 0:s})}}
                            />
                            ${i(`condition_${e}`)}
                          </label>
                          <span class="cond-setting">
                            · ${r||i("cond_off")}
                          </span>
                        </div>
                      `})}
                  `:""}
            `)}
          <div class="setting-row">
            <div class="setting-label">${i("enabled")}</div>
            <ha-switch
              .checked=${!1!==a.enabled}
              @change=${e=>u({enabled:e.target.checked})}
            ></ha-switch>
          </div>
          <div class="si-actions">
            ${this._actionBtn(Oa,i("delete_schedule"),async()=>{await this._ask(i("confirm_delete_schedule"),!0)&&n(s,{schedules:(e.schedules||[]).filter((e,t)=>t!==o)})},!0)}
          </div>
        `)},$=(e,t)=>V`
      ${(e.schedules||[]).map((i,s)=>b(e,t,i,s))}
      <div class="si-actions">
        ${this._actionBtn(Ha,i("add_schedule"),()=>n(t,{schedules:[...e.schedules||[],{id:this._openNew("schedule","schedule_"+g()),enabled:!0,type:"time",time:"06:00",event:"sunrise",offset_minutes:0,anchor:"start",weekdays:[],every_n_days:1,every_offset:0,parity:"any",months:[],from_date:null,until_date:null,weather:!0}]}))}
      </div>
    `;if("main"===e){const e=s.findIndex(e=>e.main),a=s[e];return a?V`
        <ha-card header="${o(a)}">
          <div class="card-content">
            <div class="setting-note">${i("main_description")}</div>
            <div class="setting-hint row-hint">${i("main_steps_hint")}</div>
            <div class="setting-row">
              <div class="setting-label">${i("enabled")}</div>
              <ha-switch
                .checked=${!1!==a.enabled}
                @change=${t=>n(e,{enabled:t.target.checked})}
              ></ha-switch>
            </div>
            <div class="fold-section">${i("schedules_title")}</div>
            <div class="setting-hint row-hint">${i("main_schedules_hint")}</div>
            ${"main_schedules"===this.startSource?V`<div class="setting-note">
                  <strong>${i("main_schedules_active")}</strong>
                </div>`:""}
            ${$(a,e)}
            <div class="fold-section">${i("sequencing_title")}</div>
            <div class="setting-hint row-hint">
              ${i("main_settings_description")}
            </div>
            ${this.renderExecutionSettings(t,!0)}
            ${h(a.id)}
            <div class="si-actions">
              ${this._actionBtn(Da,i("run_now"),()=>d(a))}
            </div>
          </div>
        </ha-card>
      `:V``}return V`
      <ha-card header="${i("others_title")}">
        <div class="card-content">${i("description")}</div>
        ${s.map((e,o)=>{var l,m,v;return e.main?"":V`
                <div class="card-content">
                  ${_(`program:${e.id}`,V`<span class="fold-title">${e.name}</span> ·
                      ${(e.steps||[]).length} ${i("steps_count")} ·
                      ${(e.schedules||[]).length}
                      ${i("schedules_count")}${!1===e.enabled?V` · <em>${i("off")}</em>`:""}`,V`
                      ${this._textRow(i("name"),"",e.name,e=>n(o,{name:e}))}
                      <div class="fold-section">${i("steps_title")}</div>
                      ${(e.steps||[]).map((t,i)=>w(e,o,t,i))}
                      <div class="si-actions">
                        ${this._actionBtn(Ha,i("add_step"),()=>n(o,{steps:[...e.steps||[],{id:this._openNew("step","step_"+g()),zones:[],mode:"calculated",percent:100,seconds:0,passes:1,max_litres:0,min_seconds:0,max_seconds:0,adjust_seconds:0,delay:null,enabled:!0}]}))}
                      </div>
                      <div class="fold-section">${i("schedules_title")}</div>
                      ${$(e,o)}
                      ${this._numRow(i("delay"),ai("common.units.seconds",t),null!==(l=e.delay)&&void 0!==l?l:0,e=>n(o,{delay:r(e)}))}
                      <div class="setting-hint row-hint">
                        ${i("delay_help")}
                      </div>
                      ${this._numRow(i("tours"),"",null!==(m=e.tours)&&void 0!==m?m:1,e=>n(o,{tours:Math.max(1,Math.round(r(e,1)))}),1,!1,1)}
                      <div class="setting-hint row-hint">
                        ${i("tours_help")}
                      </div>
                      <div class="setting-row">
                        <div class="setting-label">${i("enabled")}</div>
                        <ha-switch
                          .checked=${!1!==e.enabled}
                          @change=${e=>n(o,{enabled:e.target.checked})}
                        ></ha-switch>
                      </div>
                      ${p(e)} ${h(e.id)}
                      <div class="si-actions">
                        ${this._actionBtn(Da,i("run_now"),()=>d(e))}
                        ${["running","waiting"].includes(null===(v=c(e.id))||void 0===v?void 0:v.state)?this._actionBtn(Ra,i("stop_program"),()=>u(e),!0):""}
                        ${this._actionBtn(Oa,i("delete"),async()=>{await this._ask(i("confirm_delete_program").replace("{name}",e.name),!0)&&a(s.filter((e,t)=>t!==o))},!0)}
                      </div>
                    `)}
                </div>
              `})}
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn(Ha,i("add"),()=>a([...s,{id:this._openNew("program","program_"+g()),name:`${i("new_program")} ${s.length}`,enabled:!0,steps:[],delay:0,tours:1,schedules:[]}]))}
          </div>
        </div>
      </ha-card>
    `}renderSuppliesCard(){if(!this.config||!this.hass||!0!==this.config.full_controller)return V``;const e=this.hass.language,t=t=>ai(`supplies.${t}`,e),i=this.config.supplies||[],s=e=>{this.config=Object.assign(Object.assign({},this.config),{supplies:e}),this.handleConfigChange({supplies:e}),this._scheduleUpdate()},a=(e,t)=>s(i.map((i,s)=>s===e?Object.assign(Object.assign({},i),t):i)),n=e=>{const t=parseFloat(e);return isNaN(t)?0:t};return V`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${i.map((r,o)=>{var l;return V`
            <div class="card-content">
              ${this._textRow(t("name"),"",r.name,e=>a(o,{name:e}))}
              ${[...r.entities||[],""].map((e,i,s)=>V`
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
                        @value-changed=${e=>{var t;const n=((null===(t=e.detail)||void 0===t?void 0:t.value)||"").trim(),r=s.slice(0,-1);i<r.length?n?r[i]=n:r.splice(i,1):n&&r.push(n),a(o,{entities:r.filter((e,t)=>e&&r.indexOf(e)===t)})}}
                      ></ha-entity-picker>
                    </div>
                  `)}
              ${this._numRow(t("delay_before"),ai("common.units.seconds",e),r.delay_before,e=>a(o,{delay_before:n(e)}))}
              <div class="setting-hint row-hint">${t("delay_before_help")}</div>
              ${this._numRow(t("delay_after"),ai("common.units.seconds",e),r.delay_after,e=>a(o,{delay_after:n(e)}))}
              <div class="setting-hint row-hint">${t("delay_after_help")}</div>
              ${this._numRow(t("kick_seconds"),ai("common.units.seconds",e),null!==(l=r.kick_seconds)&&void 0!==l?l:0,e=>a(o,{kick_seconds:Math.max(0,Math.min(60,Number(e)||0))}),1,!1,0)}
              <div class="setting-hint row-hint">${t("kick_seconds_help")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${!1!==r.enabled}
                  @change=${e=>a(o,{enabled:e.target.checked})}
                ></ha-switch>
              </div>
              <div class="si-actions">
                ${this._actionBtn(Oa,t("delete"),async()=>{await this._ask(t("confirm_delete").replace("{name}",r.name||r.id||""),!0)&&(s(i.filter((e,t)=>t!==o)),this._clearSupplyFromZones(r.id))},!0)}
              </div>
            </div>
          `})}
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn(Ha,t("add"),()=>s([...i,{id:"supply_"+Math.random().toString(36).slice(2,8),name:"",entities:[],delay_before:0,delay_after:0,kick_seconds:0,enabled:!0}]))}
          </div>
        </div>
      </ha-card>
    `}async _clearSupplyFromZones(e){if(e&&this.hass){for(const t of this.zones.filter(t=>t.supply_id===e))try{await ua(this.hass,Object.assign(Object.assign({},t),{supply_id:null}))}catch(e){console.error("Error clearing the supply of a zone:",e)}this.zones=this.zones.map(t=>t.supply_id===e?Object.assign(Object.assign({},t),{supply_id:null}):t)}}async _seasonalCall(e,t){if(this.hass){try{await this.hass.callService(di,e,t)}catch(t){console.error("Seasonal adjustment "+e+" failed:",t)}await this._fetchData()}}renderSeasonalAdjustmentsCard(){if(!this.config||!this.hass||"advanced"!==this.config.ui_mode)return V``;const e=this.hass.language,t=t=>ai(`seasonal_adjustments.${t}`,e),i=this.config.seasonal_adjustments||[],s=(e,t)=>this._seasonalCall("update_seasonal_adjustment",Object.assign({adjustment_id:e},t));return V`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${i.map(e=>{var i,a,n;return V`
            <div class="card-content si-subgroup">
              ${this._textRow(t("name"),"",e.name,t=>s(e.id,{name:t||e.name}))}
              ${this._numRow(t("month_start"),"1-12",e.month_start,t=>s(e.id,{month_start:Math.min(12,Math.max(1,parseInt(t,10)||1))}),1)}
              ${this._numRow(t("month_end"),"1-12",e.month_end,t=>s(e.id,{month_end:Math.min(12,Math.max(1,parseInt(t,10)||12))}),1)}
              ${this._numRow(t("multiplier"),"x",null!==(i=e.multiplier_adjustment)&&void 0!==i?i:1,t=>s(e.id,{multiplier_adjustment:Math.max(0,parseFloat(t)||0)}),.05)}
              ${this._numRow(t("threshold"),qs(this.config,hi),null!==(a=e.threshold_adjustment)&&void 0!==a?a:0,t=>s(e.id,{threshold_adjustment:parseFloat(t)||0}),.5)}
              ${this._textRow(t("zones"),"",Array.isArray(e.zones)?e.zones.join(", "):null!==(n=e.zones)&&void 0!==n?n:"all",t=>s(e.id,{zones:t.trim()||"all"}))}
              <div class="setting-hint">${t("zones_hint")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${!1!==e.enabled}
                  @change=${t=>s(e.id,{enabled:t.target.checked})}
                ></ha-switch>
              </div>
              <ha-button
                @click=${()=>this._seasonalCall("delete_seasonal_adjustment",{adjustment_id:e.id})}
              >
                ${t("delete")}
              </ha-button>
            </div>
          `})}
        <div class="card-actions">
          <ha-button
            @click=${()=>this._seasonalCall("create_seasonal_adjustment",{name:t("new_name"),month_start:6,month_end:8,multiplier_adjustment:1,threshold_adjustment:0,zones:"all",enabled:!0})}
          >
            ${t("add")}
          </ha-button>
        </div>
      </ha-card>
    `}renderSetupAssistantCard(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("panels.setup.title",e)}">
        <div class="card-content">
          ${ai("panels.general.cards.setup-assistant.description",e)}
        </div>
        <div class="card-actions">
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/setup`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${ai("panels.general.cards.setup-assistant.open",e)}
          </ha-button>
        </div>
      </ha-card>
    `}renderIuImportCard(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("panels.iu_import.title",e)}">
        <div class="card-content">
          ${ai("panels.general.cards.iu-import.description",e)}
        </div>
        <div class="card-actions">
          <ha-button
            @click=${()=>{window.history.pushState(null,"",`${window.location.pathname.split("/").slice(0,-1).join("/")}/iu_import`),window.dispatchEvent(new Event("location-changed"))}}
          >
            ${ai("panels.general.cards.iu-import.open",e)}
          </ha-button>
        </div>
      </ha-card>
    `}renderTriggersCard(){var e;if(!this.config||!this.data||!this.hass)return V``;const t=this.config.irrigation_start_triggers||[];return V`
      <ha-card
        header="${ai("irrigation_start_triggers.title",this.hass.language)}"
      >
        <div class="card-content">
          ${ai("irrigation_start_triggers.description",this.hass.language)}
        </div>

        ${!0===(null===(e=this.config)||void 0===e?void 0:e.full_controller)?"":V`<div class="card-content trigger-usage">
              ${ai("irrigation_start_triggers.usage_before",this.hass.language)}
              <code>smart_irrigation_start_irrigation_all_zones</code
              >${ai("irrigation_start_triggers.usage_after",this.hass.language)}
            </div>`}

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("irrigation_start_triggers.active_label",this.hass.language)}
            </div>
            <select
              class="field"
              @change=${e=>this.handleConfigChange({active_start_trigger:e.target.value})}
            >
              <option
                value="default"
                ?selected=${"default"===(this.config.active_start_trigger||"default")}
              >
                ${ai("irrigation_start_triggers.active_default",this.hass.language)}
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
                ${ai("irrigation_start_triggers.active_none",this.hass.language)}
              </option>
            </select>
          </div>
          <div class="trigger-active-hint">
            ${ai("irrigation_start_triggers.active_hint",this.hass.language)}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${"none"===this.config.active_start_trigger?V`
                  <div class="no-triggers">
                    ${ai("irrigation_start_triggers.none_selected",this.hass.language)}
                  </div>
                `:""}
            ${t.map((e,t)=>this.renderTriggerItem(e,t))}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(Ha,ai("irrigation_start_triggers.add_trigger",this.hass.language),()=>this._addTrigger())}
          </div>
        </div>
      </ha-card>
    `}renderTriggerItem(e,t){if(!this.hass)return V``;const i=ai(`irrigation_start_triggers.trigger_types.${e.type}`,this.hass.language);let s="";if(e.type===ui&&0===e.offset_minutes)s=ai("irrigation_start_triggers.offset_auto",this.hass.language);else{const t=Math.abs(e.offset_minutes),i=Math.floor(t/60),a=t%60,n=e.offset_minutes<0?ai("common.labels.before",this.hass.language):ai("common.labels.after",this.hass.language);s=i>0?`${i}h ${a}m ${n}`:`${a}m ${n}`}let a="";return e.type===pi&&void 0!==e.azimuth_angle&&(a=` (${e.azimuth_angle}°)`),V`
      <div class="trigger-item ${e.enabled?"enabled":"disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${e.name}</div>
            <div class="trigger-details">
              ${i}${a} - ${s}
            </div>
          </div>
          <div class="trigger-status">
            ${e.enabled?ai("common.labels.enabled",this.hass.language):ai("common.labels.disabled",this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"}"
            @click="${()=>this._editTrigger(t)}"
            title="${ai("irrigation_start_triggers.edit_trigger",this.hass.language)}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${Oa}"
            @click="${()=>this._deleteTrigger(t)}"
            title="${ai("irrigation_start_triggers.delete_trigger",this.hass.language)}"
          ></ha-icon-button>
        </div>
      </div>
    `}_addTrigger(){this._showTriggerDialog({createTrigger:!0})}_editTrigger(e){var t,i;const s=null===(i=null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===i?void 0:i[e];s&&this._showTriggerDialog({trigger:s,triggerIndex:e})}async _deleteTrigger(e){var t,i;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||!this.hass)return;const s=(null===(i=this.config.irrigation_start_triggers[e])||void 0===i?void 0:i.name)||"Unknown";if(await this._ask(ai("irrigation_start_triggers.confirm_delete",this.hass.language).replace("{name}",s),!0)){const t=[...this.config.irrigation_start_triggers];t.splice(e,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[ci]:t}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}}async _showTriggerDialog(e){if(!this.hass)return;const t=document.createElement("smart-irrigation-trigger-dialog");t.hass=this.hass,t.addEventListener("trigger-save",e=>{this._handleTriggerSave(e.detail)}),t.addEventListener("trigger-delete",e=>{this._handleTriggerDelete(e.detail)}),document.body.appendChild(t),await t.showDialog(e),t.addEventListener("closed",e=>{const i=e.target;i&&"ha-dialog"===i.tagName.toLowerCase()&&document.body.removeChild(t)})}_handleTriggerSave(e){if(!this.config)return;const t=this.config.irrigation_start_triggers?[...this.config.irrigation_start_triggers]:[];e.isNew?t.push(e.trigger):void 0!==e.index&&(t[e.index]=e.trigger),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:t}),this.saveData({[ci]:t}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}_handleTriggerDelete(e){var t;if(!(null===(t=this.config)||void 0===t?void 0:t.irrigation_start_triggers)||void 0===e.index)return;const i=[...this.config.irrigation_start_triggers];i.splice(e.index,1),this.config=Object.assign(Object.assign({},this.config),{irrigation_start_triggers:i}),this.saveData({[ci]:i}).catch(e=>{console.error("Error saving triggers:",e),this._fetchData().catch(()=>{})})}renderWeatherSkipCard(){return this.config&&this.data&&this.hass?V`
      <ha-card header="${ai("weather_skip.title",this.hass.language)}">
        <div class="card-content">
          ${ai("weather_skip.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("weather_skip.forecast_label",this.hass.language)}
              <div class="setting-hint">
                ${ai("weather_skip.forecast_description",this.hass.language)}
              </div>
            </div>
            <ha-switch
              .checked=${!(!this.config.skip_irrigation_on_precipitation&&!this.config.forecast_rain_credit)}
              @change=${e=>this.handleConfigChange({skip_irrigation_on_precipitation:e.target.checked,forecast_rain_credit:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation||this.config.forecast_rain_credit?this._numRow(ai("weather_skip.threshold_label",this.hass.language),qs(this.config,hi),this.config.precipitation_threshold_mm,e=>this.handleConfigChange({precipitation_threshold_mm:parseFloat(e)}),.1):""}
        </div>
      </ha-card>
      ${this.renderMeasuredSkipCard()}
    `:V``}renderMeasuredSkipCard(){if(!this.config||!this.hass)return V``;const e=this.hass.language,t="imperial"!==this.config.units,i=t=>ai(`measured_skip.${t}`,e),s=(e,t)=>V`
      <ha-switch
        .checked=${!!t}
        @change=${t=>this.handleConfigChange({[e]:t.target.checked})}
      ></ha-switch>
    `,a=(e,t,i,s,a)=>V`
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
    `,n=(e,t,i)=>V`
      <div class="si-subgroup">
        <div class="si-subgroup-title">${e}</div>
        <div class="setting-hint">${t}</div>
        ${i}
      </div>
    `,r=(e,t,s,a,n)=>this._numRow(i("threshold"),a,null!=t?t:s,t=>this.handleConfigChange({[e]:""===t?null:parseFloat(t)}),n);return V`
      <ha-card header="${i("title")}">
        <div class="card-content">${i("description")}</div>
        <div class="card-content">
          ${n(i("rain.title"),i("rain.description"),V`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_rain_sensor",this.config.skip_on_rain_sensor)}
              </div>
              ${this.config.skip_on_rain_sensor?V`${a("rain_sensor",this.config.rain_sensor,["binary_sensor"],i("sensor"),i("rain.sensor-hint"))}
                  ${"advanced"===this.config.ui_mode?V`<div class="setting-row">
                          <div class="setting-label">
                            ${i("rain.history-label")}
                          </div>
                          ${s("rain_history_enabled",this.config.rain_history_enabled)}
                        </div>
                        <div class="card-content">
                          ${i("rain.history-description")}
                        </div>`:""}`:""}
            `)}
          ${n(i("freeze.title"),i("freeze.description"),V`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_freeze",this.config.skip_on_freeze)}
              </div>
              ${this.config.skip_on_freeze?V`${r("freeze_threshold",this.config.freeze_threshold,t?2:36,t?"°C":"°F",.5)}
                  ${a("freeze_sensor",this.config.freeze_sensor,["sensor"],i("sensor-optional"),i("freeze.sensor-hint"))}`:""}
            `)}
          ${n(i("wind.title"),i("wind.description"),V`
              <div class="setting-row">
                <div class="setting-label">${i("enabled")}</div>
                ${s("skip_on_wind",this.config.skip_on_wind)}
              </div>
              ${this.config.skip_on_wind?V`${r("wind_threshold",this.config.wind_threshold,t?20:12,t?"km/h":"mph",1)}
                  ${a("wind_sensor",this.config.wind_sensor,["sensor"],i("sensor-optional"),i("wind.sensor-hint"))}`:""}
            `)}
        </div>
      </ha-card>
    `}renderObservedWateringCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("observed_watering.title",e)}">
        <div class="card-content">
          ${ai("observed_watering.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("observed_watering.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.observed_watering_enabled}
              @change=${e=>this.handleConfigChange({observed_watering_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              ${ai("observed_watering.direct_control_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.direct_valve_control_enabled}
              .disabled=${!0===this.config.full_controller}
              @change=${e=>this.handleConfigChange({direct_valve_control_enabled:e.target.checked})}
            ></ha-switch>
          </div>

          ${this.config.direct_valve_control_enabled?V`
                <div class="setting-note">
                  ${ai("observed_watering.direct_control_description",e)}
                  ${!0===this.config.full_controller?ai("observed_watering.direct_control_locked",e):""}
                </div>
              `:""}
          ${!0===this.config.full_controller?"":this.renderExecutionSettings(e,!1)}
        </div>
      </ha-card>
    `}renderFullControllerCard(){if(!this.config||!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card
        header="${ai("observed_watering.full_controller_title",e)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("observed_watering.full_controller_label",e)}
            </div>
            <ha-switch
              .checked=${!0===this.config.full_controller}
              @change=${async t=>{const i=t.target,s=!0===i.checked;!s||await this._ask(ai("observed_watering.confirm_full_controller",e))?this.handleConfigChange(Object.assign({full_controller:s},s?{direct_valve_control_enabled:!0}:{})).then(()=>this._fetchData()).catch(()=>{}):i.checked=!1}}
            ></ha-switch>
          </div>
          <div class="setting-note">
            ${ai("observed_watering.full_controller_description",e)}
          </div>
        </div>
      </ha-card>
    `}renderExecutionSettings(e,t){return this.config?V`
      <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
      <div class="setting-row">
        <div class="setting-label">
          ${ai("observed_watering.sequencing_label",e)}
        </div>
        <select
          class="field"
          @change=${e=>this.handleConfigChange({zone_sequencing:e.target.value})}
        >
          <option
            value="sequential"
            ?selected=${"sequential"===this.config.zone_sequencing}
          >
            ${ai("observed_watering.sequencing.sequential",e)}
          </option>
          <option
            value="parallel"
            ?selected=${"parallel"===this.config.zone_sequencing}
          >
            ${ai("observed_watering.sequencing.parallel",e)}
          </option>
        </select>
      </div>
      <div class="setting-note">
        ${ai("observed_watering.sequencing_description",e)}
      </div>

      ${this.config.direct_valve_control_enabled&&(t||"advanced"===this.config.ui_mode)?this.renderCycleAndSoak(e):""}
    `:V``}renderCycleAndSoak(e){var t,i,s;if(!this.config)return V``;const a=this.config,n=Number(null!==(t=a.watering_passes)&&void 0!==t?t:1)||1,r="parallel"!==a.zone_sequencing;return V`
      ${this._numRow(ai("observed_watering.passes_label",e),"",n,e=>this.handleConfigChange({watering_passes:Math.min(6,Math.max(1,parseInt(e)||1))}))}
      ${n>1?V`${this._numRow(ai("observed_watering.soak_label",e),ai("observed_watering.minutes",e),null!==(i=a.soak_minutes)&&void 0!==i?i:15,e=>this.handleConfigChange({soak_minutes:Math.max(0,parseFloat(e)||0)}))}
            <div class="card-content">
              ${ai("observed_watering.passes_description",e)}
            </div>`:V`<div class="card-content">
            ${ai("observed_watering.passes_description",e)}
          </div>`}
      ${r?V`${this._numRow(ai("observed_watering.pause_between_zones_label",e),ai("observed_watering.seconds",e),null!==(s=a.pause_between_zones)&&void 0!==s?s:0,e=>this.handleConfigChange({pause_between_zones:Math.max(0,parseFloat(e)||0)}))}
            <div class="card-content">
              ${ai("observed_watering.pause_between_zones_description",e)}
            </div>`:""}
    `}renderPanelModeCard(){if(!this.hass||!this.config)return V``;const e="advanced"===this.config.ui_mode;return V`<ha-card
      header="${ai("panels.general.cards.panel-mode.header",this.hass.language)}"
    >
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${ai("panels.general.cards.panel-mode.labels.advanced",this.hass.language)}
            <div class="setting-hint">
              ${ai("panels.general.cards.panel-mode.labels.advanced-hint",this.hass.language)}
            </div>
          </div>
          <ha-switch
            .checked=${e}
            @change=${e=>this.handleConfigChange({ui_mode:e.target.checked?"advanced":"standard"})}
          ></ha-switch>
        </div>
      </div>
    </ha-card>`}renderBlueprintsCard(){if(!this.config||!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("blueprints.title",e)}">
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("blueprints.install_label",e)}
            </div>
            <ha-switch
              .checked=${!1!==this.config.install_blueprints}
              @change=${e=>this.handleConfigChange({install_blueprints:e.target.checked})}
            ></ha-switch>
          </div>
          <div class="setting-help">
            ${ai("blueprints.install_help",e)}
          </div>
        </div>
      </ha-card>
    `}renderCalculationLogCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("calculation_log.title",e)}">
        <div class="card-content">
          ${ai("calculation_log.description",e)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("calculation_log.enabled_label",e)}
            </div>
            <ha-switch
              .checked=${this.config.calc_log_enabled}
              @change=${e=>this.handleConfigChange({calc_log_enabled:e.target.checked})}
            ></ha-switch>
          </div>
          ${this.config.calc_log_enabled?V`<div
                class="zoneline"
                style="color: var(--secondary-text-color); font-style: italic;"
              >
                ${ai("calculation_log.file_hint",e)}
              </div>`:""}
        </div>
      </ha-card>
    `}renderCoordinateCard(){if(!this.config||!this.data||!this.hass)return V``;const e=this.hass.config,t=(null==e?void 0:e.latitude)||0,i=(null==e?void 0:e.longitude)||0,s=(null==e?void 0:e.elevation)||0;return V`
      <ha-card
        header="${ai("coordinate_config.title",this.hass.language)}"
      >
        <div class="card-content">
          ${ai("coordinate_config.description",this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("coordinate_config.manual_enabled",this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${e=>this.saveData({manual_coordinates_enabled:e.target.checked})}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${this.data.manual_coordinates_enabled?V`
                    ${this._numRow(ai("coordinate_config.latitude",this.hass.language),"",this.data.manual_latitude||t,e=>this.handleConfigChange({manual_latitude:parseFloat(e)}),.1)}
                    ${this._numRow(ai("coordinate_config.longitude",this.hass.language),"",this.data.manual_longitude||i,e=>this.handleConfigChange({manual_longitude:parseFloat(e)}),.1)}
                    ${this._numRow(ai("coordinate_config.elevation",this.hass.language),"",this.data.manual_elevation||s,e=>this.handleConfigChange({manual_elevation:parseFloat(e)}),1)}
                  `:V`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${ai("coordinate_config.current_ha_coords",this.hass.language)}:<br />
                      ${ai("coordinate_config.latitude",this.hass.language)}:
                      ${t}<br />
                      ${ai("coordinate_config.longitude",this.hass.language)}:
                      ${i}<br />
                      ${ai("coordinate_config.elevation",this.hass.language)}:
                      ${s}m
                    </div>
                  `}
                </div>
          </div>
        </div>
      </ha-card>
    `}renderDaysBetweenIrrigationCard(){return this.config&&this.data&&this.hass?V`
      <ha-card
        header="${ai("days_between_irrigation.title",this.hass.language)}"
      >
        <div class="card-content">
          ${ai("days_between_irrigation.description",this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(ai("days_between_irrigation.label",this.hass.language),"",this.config.days_between_irrigation||0,e=>this.handleConfigChange({days_between_irrigation:parseInt(e)}),1)}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${ai("days_between_irrigation.help_text",this.hass.language)}
            </div>
          </div>
        </div>
      </ha-card>
    `:V``}async saveData(e){if(this.hass&&this.data){this.isSaving=!0,this._scheduleUpdate(),this._suppressNextConfigUpdate=!0;try{this.data=Object.assign(Object.assign({},this.data),e),this.config=Object.assign(Object.assign({},this.config),e),this._scheduleUpdate(),await(t=this.hass,i=this.data,t.callApi("POST",di+"/config",i)),"programs"in e&&this._fetchStartSource()}catch(e){this._suppressNextConfigUpdate=!1,console.error("Error saving config:",e),sa(e,this.shadowRoot.querySelector("ha-card")),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var t,i}}handleConfigChange(e){return this.debouncedSave(e)}disconnectedCallback(){super.disconnectedCallback(),void 0!==this._liveTimer&&(window.clearInterval(this._liveTimer),this._liveTimer=void 0)}_textRow(e,t,i,s){return V`
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
          ${e}${s?V`<div class="setting-hint">${s}</div>`:""}
        </div>
        <input
          class="field"
          type="time"
          .value=${t?String(t):""}
          @change=${e=>i(e.target.value)}
        />
      </div>
    `}_conditionSetting(e){var t,i,s,a,n,r,o,l,d;const h=this.config;if(!h||!this.hass)return"";const c=this.hass.language,u=(e,...t)=>ai(`programs.${e}`,c,...t),p="°F"!==(null===(i=null===(t=this.hass.config)||void 0===t?void 0:t.unit_system)||void 0===i?void 0:i.temperature),g=e=>Math.round(10*e)/10;switch(e){case"rain_sensor":{if(!h.skip_on_rain_sensor||!h.rain_sensor)return"";const e=null===(s=this.hass.states)||void 0===s?void 0:s[h.rain_sensor];return null!==(n=null===(a=null==e?void 0:e.attributes)||void 0===a?void 0:a.friendly_name)&&void 0!==n?n:h.rain_sensor}case"freeze":{if(!h.skip_on_freeze)return"";const e=null!==(r=h.freeze_threshold)&&void 0!==r?r:2;return u("cond_freeze","{value}",p?`${g(e)} °C`:`${g(9*e/5+32)} °F`)}case"wind":{if(!h.skip_on_wind)return"";const e=null!==(o=h.wind_threshold)&&void 0!==o?o:20;return u("cond_wind","{value}",p?`${g(e)} km/h`:`${g(e/1.609344)} mph`)}case"precipitation":{if(!h.skip_irrigation_on_precipitation)return"";const e=null!==(l=h.precipitation_threshold_mm)&&void 0!==l?l:2;return u("cond_precipitation","{value}",p?`${g(e)} mm`:`${g(e/25.4)} in`)}case"days_between":{const e=null!==(d=h.days_between_irrigation)&&void 0!==d?d:0;return e>0?u("cond_days_between","{n}",String(e)):""}case"soil_moisture":{const e=(this.zones||[]).filter(e=>!!e.soil_moisture_sensor).length;return e>0?u("cond_soil","{n}",String(e)):""}default:return""}}_monthDayRow(e,t,i,s){const a=/^(\d{2})-(\d{2})$/.exec(null!=t?t:""),n=a?Number(a[1]):0,r=a?Number(a[2]):1,o=e=>new Date(2024,e,0).getDate(),l=e=>String(e).padStart(2,"0"),d=(e,t)=>s(e?`${l(e)}-${l(Math.min(Math.max(t,1),o(e)))}`:null);return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="combo-field">
          <div class="select-wrap">
            <select
              class="field"
              @change=${e=>d(Number(e.target.value),r)}
            >
              <option value="0" ?selected=${!n}></option>
              ${Array.from({length:12},(e,t)=>V`
                  <option value=${t+1} ?selected=${n===t+1}>
                    ${i(t)}
                  </option>
                `)}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${Aa}></path>
            </svg>
          </div>
          <div class="select-wrap day-select">
            <select
              class="field"
              ?disabled=${!n}
              @change=${e=>d(n,Number(e.target.value))}
            >
              ${Array.from({length:n?o(n):31},(e,t)=>V`
                  <option value=${t+1} ?selected=${r===t+1}>
                    ${t+1}
                  </option>
                `)}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${Aa}></path>
            </svg>
          </div>
        </div>
      </div>
    `}_numRow(e,t,i,s,a=1,n=!1,r=null){const o=(String(a).split(".")[1]||"").length,l=e=>null!==r&&e<r?r:e,d=(e,t)=>{const i=parseFloat(e.value),n=l(+((isNaN(i)?0:i)+t*a).toFixed(o));e.value=String(n),s(String(n))};return V`
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
            min=${null!=r?r:""}
            @change=${e=>{const t=e.target,i=parseFloat(t.value);isNaN(i)||l(i)===i||(t.value=String(l(i))),s(t.value)}}
          />
          <ha-icon-button
            class="step-btn"
            .path=${Ca}
            ?disabled=${n}
            @click=${e=>d(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ha}
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
            <path d=${Aa}></path>
          </svg>
        </div>
      </div>
    `}_programLabel(e,t){var i,s,a;return"main"!==e||t&&"Main program"!==t?null!==(a=null!=t?t:e)&&void 0!==a?a:"":ai("programs.main_name",null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en")}_ask(e,t=!1){return La(this.hass,{text:e,destructive:t})}_actionBtn(e,t,i,s=!1,a=!1){return V`
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
      ${Ua} ${Wa} /* View-specific styles only - most common styles are now in globalStyle */

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
    `}};i([ve()],Ja.prototype,"narrow",void 0),i([ve()],Ja.prototype,"path",void 0),i([ve()],Ja.prototype,"data",void 0),i([ve()],Ja.prototype,"config",void 0),i([ve()],Ja.prototype,"section",void 0),i([ve({attribute:!1})],Ja.prototype,"zones",void 0),i([ve({attribute:!1})],Ja.prototype,"planning",void 0),i([ve({attribute:!1})],Ja.prototype,"programsState",void 0),i([ve({attribute:!1})],Ja.prototype,"startSource",void 0),i([ve({type:Boolean})],Ja.prototype,"isLoading",void 0),i([ve({type:Boolean})],Ja.prototype,"isSaving",void 0),Ja=i([pe("smart-irrigation-view-general")],Ja);
/**
     * @license
     * Copyright 2020 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const{I:Xa}=le,Qa=e=>e,en=()=>document.createComment(""),tn=(e,t,i)=>{const s=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(en(),a),n=s.insertBefore(en(),a);i=new Xa(t,n,e,e.options)}else{const t=i._$AB.nextSibling,n=i._$AM,r=n!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==n._$AU&&i._$AP(t)}if(t!==a||r){let e=i._$AA;for(;e!==t;){const t=Qa(e).nextSibling;Qa(s).insertBefore(e,a),e=t}}}return i},sn=(e,t,i=e)=>(e._$AI(t,i),e),an={},nn=(e,t=an)=>e._$AH=t,rn=e=>{e._$AR(),e._$AA.remove()},on=(e,t,i)=>{const s=new Map;for(let a=t;a<=i;a++)s.set(e[a],a);return s},ln=Fs(class extends Bs{constructor(e){if(super(e),e.type!==Us)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const a=[],n=[];let r=0;for(const t of e)a[r]=s?s(t,r):r,n[r]=i(t,r),r++;return{values:n,keys:a}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const a=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,i,s);if(!Array.isArray(a))return this.ut=r,n;const o=this.ut??=[],l=[];let d,h,c=0,u=a.length-1,p=0,g=n.length-1;for(;c<=u&&p<=g;)if(null===a[c])c++;else if(null===a[u])u--;else if(o[c]===r[p])l[p]=sn(a[c],n[p]),c++,p++;else if(o[u]===r[g])l[g]=sn(a[u],n[g]),u--,g--;else if(o[c]===r[g])l[g]=sn(a[c],n[g]),tn(e,l[g+1],a[c]),c++,g--;else if(o[u]===r[p])l[p]=sn(a[u],n[p]),tn(e,a[c],a[u]),u--,p++;else if(void 0===d&&(d=on(r,p,g),h=on(o,c,u)),d.has(o[c]))if(d.has(o[u])){const t=h.get(r[p]),i=void 0!==t?a[t]:null;if(null===i){const t=tn(e,a[c]);sn(t,n[p]),l[p]=t}else l[p]=sn(i,n[p]),tn(e,a[c],i),a[t]=null;p++}else rn(a[u]),u--;else rn(a[c]),c++;for(;p<=g;){const t=tn(e,l[g+1]);sn(t,n[p]),l[p++]=t}for(;c<=u;){const e=a[c++];null!==e&&rn(e)}return this.ut=r,nn(e,l),G}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var dn,hn;function cn(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function un(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}!function(e){e.Sunrise="sunrise",e.Sunset="sunset",e.SolarAzimuth="solar_azimuth",e.Time="time"}(dn||(dn={})),function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(hn||(hn={}));var pn,gn={exports:{}};var mn,vn=(pn||(pn=1,(mn=gn).exports=function(){var e,t;function i(){return e.apply(null,arguments)}function s(t){e=t}function a(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function r(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function o(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(r(e,t))return!1;return!0}function l(e){return void 0===e}function d(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function h(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function c(e,t){var i,s=[],a=e.length;for(i=0;i<a;++i)s.push(t(e[i],i));return s}function u(e,t){for(var i in t)r(t,i)&&(e[i]=t[i]);return r(t,"toString")&&(e.toString=t.toString),r(t,"valueOf")&&(e.valueOf=t.valueOf),e}function p(e,t,i,s){return is(e,t,i,s,!0).utc()}function g(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidEra:null,invalidMonth:null,invalidOffset:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],era:null,meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function m(e){return null==e._pf&&(e._pf=g()),e._pf}function v(e){var i=null,s=!1,a=e._d&&!isNaN(e._d.getTime());return a&&(i=m(e),s=t.call(i.parsedDateParts,function(e){return null!=e}),a=i.overflow<0&&!i.empty&&!i.invalidEra&&!i.invalidMonth&&!i.invalidOffset&&!i.invalidWeekday&&!i.weekdayMismatch&&!i.nullInput&&!i.invalidFormat&&!i.userInvalidated&&(!i.meridiem||i.meridiem&&s),e._strict&&(a=a&&0===i.charsLeftOver&&0===i.unusedTokens.length&&void 0===i.bigHour)),null!=Object.isFrozen&&Object.isFrozen(e)?a:(e._isValid=a,e._isValid)}function f(e){var t=p(NaN);return null!=e?u(m(t),e):m(t).userInvalidated=!0,t}t=Array.prototype.some?Array.prototype.some:function(e){var t,i=Object(this),s=i.length>>>0;for(t=0;t<s;t++)if(t in i&&e.call(this,i[t],t,i))return!0;return!1};var _=i.momentProperties=[],y=!1;function w(e,t){var i,s,a,n=_.length;if(l(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),l(t._i)||(e._i=t._i),l(t._f)||(e._f=t._f),l(t._l)||(e._l=t._l),l(t._strict)||(e._strict=t._strict),l(t._tzm)||(e._tzm=t._tzm),l(t._isUTC)||(e._isUTC=t._isUTC),l(t._offset)||(e._offset=t._offset),l(t._pf)||(e._pf=m(t)),l(t._locale)||(e._locale=t._locale),n>0)for(i=0;i<n;i++)l(a=t[s=_[i]])||(e[s]=a);return e}function b(e){w(this,e),this._d=new Date(null!=e._d?e._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===y&&(y=!0,i.updateOffset(this),y=!1)}function $(e){return e instanceof b||null!=e&&null!=e._isAMomentObject}function x(e){!1===i.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+e)}function k(e,t){var s=!0;return u(function(){if(null!=i.deprecationHandler&&i.deprecationHandler(null,e),s){var a,n,o,l=[],d=arguments.length;for(n=0;n<d;n++){if(a="","object"==typeof arguments[n]){for(o in a+="\n["+n+"] ",arguments[0])r(arguments[0],o)&&(a+=o+": "+arguments[0][o]+", ");a=a.slice(0,-2)}else a=arguments[n];l.push(a)}x(e+"\nArguments: "+Array.prototype.slice.call(l).join("")+"\n"+(new Error).stack),s=!1}return t.apply(this,arguments)},t)}var S={};function z(e,t){null!=i.deprecationHandler&&i.deprecationHandler(e,t),S[e]||(x(t+"\n"+(new Error).stack),S[e]=!0)}function T(e){return"undefined"!=typeof Function&&e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}i.suppressDeprecationWarnings=!1,i.deprecationHandler=null;var M={D:"date",dates:"date",date:"date",d:"day",days:"day",day:"day",e:"weekday",weekdays:"weekday",weekday:"weekday",E:"isoWeekday",isoweekdays:"isoWeekday",isoweekday:"isoWeekday",DDD:"dayOfYear",dayofyears:"dayOfYear",dayofyear:"dayOfYear",h:"hour",hours:"hour",hour:"hour",ms:"millisecond",milliseconds:"millisecond",millisecond:"millisecond",m:"minute",minutes:"minute",minute:"minute",M:"month",months:"month",month:"month",Q:"quarter",quarters:"quarter",quarter:"quarter",s:"second",seconds:"second",second:"second",gg:"weekYear",weekyears:"weekYear",weekyear:"weekYear",GG:"isoWeekYear",isoweekyears:"isoWeekYear",isoweekyear:"isoWeekYear",w:"week",weeks:"week",week:"week",W:"isoWeek",isoweeks:"isoWeek",isoweek:"isoWeek",y:"year",years:"year",year:"year"};function O(e){return"string"==typeof e?M[e]||M[e.toLowerCase()]:void 0}function A(e){var t,i,s={};for(i in e)r(e,i)&&(t=O(i))&&(s[t]=e[i]);return s}var C={date:9,day:11,weekday:11,isoWeekday:11,dayOfYear:4,hour:13,millisecond:16,minute:14,month:8,quarter:7,second:15,weekYear:1,isoWeekYear:1,week:5,isoWeek:5,year:1};function E(e){var t,i=[];for(t in e)r(e,t)&&i.push({unit:t,priority:C[t]});return i.sort(function(e,t){return e.priority-t.priority}),i}function D(e,t,i){var s=""+Math.abs(e),a=t-s.length;return(e>=0?i?"+":"":"-")+Math.pow(10,Math.max(0,a)).toString().substr(1)+s}var H=/(\[[^\[]*\])|(\\e)|(\\)?(eHHmm|[Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,N=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,R={},P={};function j(e,t,i,s){var a=s;"string"==typeof s&&(a=function(){return this[s]()}),e&&(P[e]=a),t&&(P[t[0]]=function(){return D(a.apply(this,arguments),t[1],t[2])}),i&&(P[i]=function(){return this.localeData().ordinal(a.apply(this,arguments),e)})}function I(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function L(e){var t,i,s=e.match(H);for(t=0,i=s.length;t<i;t++)P[s[t]]?s[t]=P[s[t]]:s[t]=I(s[t]);return function(t){var a,n="";for(a=0;a<i;a++)n+=T(s[a])?s[a].call(t,e):s[a];return n}}function U(e,t){if(!e.isValid())return e.localeData().invalidDate();var i="$"+(t=F(t,e.localeData()));return r(R,i)||(R[i]=L(t)),R[i](e)}function F(e,t){var i=5;function s(e){return t.longDateFormat(e)||e}for(N.lastIndex=0;i>=0&&N.test(e);)e=e.replace(N,s),N.lastIndex=0,i-=1;return e}var B,Y=/\d/,W=/\d\d/,V=/\d{3}/,Z=/\d{4}/,G=/[+-]?\d{6}/,q=/\d\d?/,K=/\d\d\d\d?/,J=/\d\d\d\d\d\d?/,X=/\d{1,3}/,Q=/\d{1,4}/,ee=/[+-]?\d{1,6}/,te=/\d+/,ie=/[+-]?\d+/,se=/Z|[+-]\d\d:?\d\d/gi,ae=/Z|[+-]\d\d(?::?\d\d)?/gi,ne=/[+-]?\d+(\.\d{1,3})?/,re=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,oe=/^[1-9]\d?/,le=/^([1-9]\d|\d)/;function de(e,t,i){B[e]=T(t)?t:function(e,s){return e&&i?i:t}}function he(e,t){return r(B,e)?B[e](t._strict,t._locale):new RegExp(ce(e))}function ce(e){return ue(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,i,s,a){return t||i||s||a}))}function ue(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function pe(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function ge(e){var t=+e,i=0;return 0!==t&&isFinite(t)&&(i=pe(t)),i}B={};var me={};function ve(e,t){var i,s,a=t;for("string"==typeof e&&(e=[e]),d(t)&&(a=function(e,i){i[t]=ge(e)}),s=e.length,i=0;i<s;i++)me[e[i]]=a}function fe(e,t){ve(e,function(e,i,s,a){s._w=s._w||{},t(e,s._w,s,a)})}function _e(e,t,i){null!=t&&r(me,e)&&me[e](t,i._a,i,e)}function ye(e){return e%4==0&&e%100!=0||e%400==0}var we=0,be=1,$e=2,xe=3,ke=4,Se=5,ze=6,Te=7,Me=8;function Oe(e){return ye(e)?366:365}j("Y",0,0,function(){var e=this.year();return e<=9999?D(e,4):"+"+e}),j(0,["YY",2],0,function(){return this.year()%100}),j(0,["YYYY",4],0,"year"),j(0,["YYYYY",5],0,"year"),j(0,["YYYYYY",6,!0],0,"year"),de("Y",ie),de("YY",q,W),de("YYYY",Q,Z),de("YYYYY",ee,G),de("YYYYYY",ee,G),ve(["YYYYY","YYYYYY"],we),ve("YYYY",function(e,t){t[we]=2===e.length?i.parseTwoDigitYear(e):ge(e)}),ve("YY",function(e,t){t[we]=i.parseTwoDigitYear(e)}),ve("Y",function(e,t){t[we]=parseInt(e,10)}),i.parseTwoDigitYear=function(e){return ge(e)+(ge(e)>68?1900:2e3)};var Ae,Ce=De("FullYear",!0);function Ee(){return ye(this.year())}function De(e,t){return function(s){return null!=s?(Ne(this,e,s),i.updateOffset(this,t),this):He(this,e)}}function He(e,t){if(!e.isValid())return NaN;var i=e._d,s=e._isUTC;switch(t){case"Milliseconds":return s?i.getUTCMilliseconds():i.getMilliseconds();case"Seconds":return s?i.getUTCSeconds():i.getSeconds();case"Minutes":return s?i.getUTCMinutes():i.getMinutes();case"Hours":return s?i.getUTCHours():i.getHours();case"Date":return s?i.getUTCDate():i.getDate();case"Day":return s?i.getUTCDay():i.getDay();case"Month":return s?i.getUTCMonth():i.getMonth();case"FullYear":return s?i.getUTCFullYear():i.getFullYear();default:return NaN}}function Ne(e,t,i){var s,a,n,r,o;if(e.isValid()&&!isNaN(i)){switch(s=e._d,a=e._isUTC,t){case"Milliseconds":return void(a?s.setUTCMilliseconds(i):s.setMilliseconds(i));case"Seconds":return void(a?s.setUTCSeconds(i):s.setSeconds(i));case"Minutes":return void(a?s.setUTCMinutes(i):s.setMinutes(i));case"Hours":return void(a?s.setUTCHours(i):s.setHours(i));case"Date":return void(a?s.setUTCDate(i):s.setDate(i));case"FullYear":break;default:return}n=i,r=e.month(),o=29!==(o=e.date())||1!==r||ye(n)?o:28,a?s.setUTCFullYear(n,r,o):s.setFullYear(n,r,o)}}function Re(e){return T(this[e=O(e)])?this[e]():this}function Pe(e,t){if("object"==typeof e){var i,s=E(e=A(e)),a=s.length;for(i=0;i<a;i++)this[s[i].unit](e[s[i].unit])}else if(T(this[e=O(e)]))return this[e](t);return this}function je(e,t){return(e%t+t)%t}function Ie(e,t){if(isNaN(e)||isNaN(t))return NaN;var i=je(t,12);return e+=(t-i)/12,1===i?ye(e)?29:28:31-i%7%2}Ae=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},j("M",["MM",2],"Mo",function(){return this.month()+1}),j("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),j("MMMM",0,0,function(e){return this.localeData().months(this,e)}),de("M",q,oe),de("MM",q,W),de("MMM",function(e,t){return t.monthsShortRegex(e)}),de("MMMM",function(e,t){return t.monthsRegex(e)}),ve(["M","MM"],function(e,t){t[be]=ge(e)-1}),ve(["MMM","MMMM"],function(e,t,i,s){var a=i._locale.monthsParse(e,s,i._strict);null!=a?t[be]=a:m(i).invalidMonth=e});var Le="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Ue="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Fe=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Be=re,Ye=re,We=["monthsParse","longMonthsParse","shortMonthsParse","monthsRegex","monthsShortRegex","monthsStrictRegex","monthsShortStrictRegex"];function Ve(e,t){var i,s;for(i=0;i<We.length;i++)r(t,s=We[i])||delete e["_"+s]}function Ze(e,t){return e?a(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||Fe).test(t)?"format":"standalone"][e.month()]:a(this._months)?this._months:this._months.standalone}function Ge(e,t){return e?a(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[Fe.test(t)?"format":"standalone"][e.month()]:a(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function qe(e,t,i){var s,a,n,r=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)n=p([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(n,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(n,"").toLocaleLowerCase();return i?"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,r))?a:null:-1!==(a=Ae.call(this._longMonthsParse,r))?a:null:"MMM"===t?-1!==(a=Ae.call(this._shortMonthsParse,r))||-1!==(a=Ae.call(this._longMonthsParse,r))?a:null:-1!==(a=Ae.call(this._longMonthsParse,r))||-1!==(a=Ae.call(this._shortMonthsParse,r))?a:null}function Ke(e,t,i){var s,a,n;if(this._monthsParseExact)return qe.call(this,e,t,i);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(a=p([2e3,s]),i&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(a,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(a,"").replace(".","")+"$","i")),i||this._monthsParse[s]||(n="^"+this.months(a,"")+"|^"+this.monthsShort(a,""),this._monthsParse[s]=new RegExp(n.replace(".",""),"i")),i&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(i&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!i&&this._monthsParse[s].test(e))return s}}function Je(e,t){if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=ge(t);else if(!d(t=e.localeData().monthsParse(t)))return e;var i=t,s=e.date();return s=s<29?s:Math.min(s,Ie(e.year(),i)),e._isUTC?e._d.setUTCMonth(i,s):e._d.setMonth(i,s),e}function Xe(e){return null!=e?(Je(this,e),i.updateOffset(this,!0),this):He(this,"Month")}function Qe(){return Ie(this.year(),this.month())}function et(e){return this._monthsParseExact?(r(this,"_monthsRegex")||it.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(r(this,"_monthsShortRegex")||(this._monthsShortRegex=Be),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)}function tt(e){return this._monthsParseExact?(r(this,"_monthsRegex")||it.call(this),e?this._monthsStrictRegex:this._monthsRegex):(r(this,"_monthsRegex")||(this._monthsRegex=Ye),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)}function it(){function e(e,t){return t.length-e.length}var t,i,s,a,n=[],r=[],o=[];for(t=0;t<12;t++)i=p([2e3,t]),s=ue(this.monthsShort(i,"")),a=ue(this.months(i,"")),n.push(s),r.push(a),o.push(a),o.push(s);n.sort(e),r.sort(e),o.sort(e),this._monthsRegex=new RegExp("^("+o.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+n.join("|")+")","i")}function st(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function at(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function nt(e,t){return e.slice(t,7).concat(e.slice(0,t))}j("d",0,"do","day"),j("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),j("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),j("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),j("e",0,0,"weekday"),j("E",0,0,"isoWeekday"),j("eHHmm",0,0,function(){return""+this.weekday()+D(this.hours(),2)+D(this.minutes(),2)}),de("d",q),de("e",q),de("E",q),de("eHHmm",J),de("dd",function(e,t){return t.weekdaysMinRegex(e)}),de("ddd",function(e,t){return t.weekdaysShortRegex(e)}),de("dddd",function(e,t){return t.weekdaysRegex(e)}),fe(["dd","ddd","dddd"],function(e,t,i,s){var a=i._locale.weekdaysParse(e,s,i._strict);null!=a?t.d=a:m(i).invalidWeekday=e}),fe(["d","e","E"],function(e,t,i,s){t[s]=ge(e)}),fe("eHHmm",function(e,t,i){var s=e.length-4;t.e=ge(e.substr(0,s)),i._a[xe]=ge(e.substr(s,2)),i._a[ke]=ge(e.substr(s+2))});var rt,ot="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),lt="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),dt="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ht=re,ct=re,ut=re,pt=["weekdaysParse","fullWeekdaysParse","shortWeekdaysParse","minWeekdaysParse","weekdaysRegex","weekdaysShortRegex","weekdaysMinRegex","weekdaysStrictRegex","weekdaysShortStrictRegex","weekdaysMinStrictRegex"];function gt(e,t){var i,s;for(i=0;i<pt.length;i++)r(t,s=pt[i])||delete e["_"+s]}function mt(e,t){var i=a(this._weekdays)?this._weekdays:this._weekdays[e&&!0!==e&&this._weekdays.isFormat.test(t)?"format":"standalone"];return!0===e?nt(i,this._week.dow):e?i[e.day()]:i}function vt(e){return!0===e?nt(this._weekdaysShort,this._week.dow):e?this._weekdaysShort[e.day()]:this._weekdaysShort}function ft(e){return!0===e?nt(this._weekdaysMin,this._week.dow):e?this._weekdaysMin[e.day()]:this._weekdaysMin}function _t(e,t,i){var s,a,n,r=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)n=p([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(n,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(n,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(n,"").toLocaleLowerCase();return i?"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,r))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:"dddd"===t?-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._shortWeekdaysParse,r))||-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:"ddd"===t?-1!==(a=Ae.call(this._shortWeekdaysParse,r))||-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._minWeekdaysParse,r))?a:null:-1!==(a=Ae.call(this._minWeekdaysParse,r))||-1!==(a=Ae.call(this._weekdaysParse,r))||-1!==(a=Ae.call(this._shortWeekdaysParse,r))?a:null}function yt(e,t,i){var s,a,n;if(this._weekdaysParseExact)return _t.call(this,e,t,i);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(a=p([2e3,1]).day(s),i&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(a,"").replace(".","\\.?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(a,"").replace(".","\\.?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(a,"").replace(".","\\.?")+"$","i")),this._weekdaysParse[s]||(n="^"+this.weekdays(a,"")+"|^"+this.weekdaysShort(a,"")+"|^"+this.weekdaysMin(a,""),this._weekdaysParse[s]=new RegExp(n.replace(".",""),"i")),i&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(i&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(i&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!i&&this._weekdaysParse[s].test(e))return s}}function wt(e){if(!this.isValid())return null!=e?this:NaN;var t=He(this,"Day");return null!=e?(e=st(e,this.localeData()),this.add(e-t,"d")):t}function bt(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")}function $t(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=at(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7}function xt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||zt.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(r(this,"_weekdaysRegex")||(this._weekdaysRegex=ht),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)}function kt(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||zt.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(r(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ct),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function St(e){return this._weekdaysParseExact?(r(this,"_weekdaysRegex")||zt.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(r(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=ut),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function zt(){function e(e,t){return t.length-e.length}var t,i,s,a,n,r=[],o=[],l=[],d=[];for(t=0;t<7;t++)i=p([2e3,1]).day(t),s=ue(this.weekdaysMin(i,"")),a=ue(this.weekdaysShort(i,"")),n=ue(this.weekdays(i,"")),r.push(s),o.push(a),l.push(n),d.push(s),d.push(a),d.push(n);r.sort(e),o.sort(e),l.sort(e),d.sort(e),this._weekdaysRegex=new RegExp("^("+d.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+r.join("|")+")","i")}function Tt(e){var t,i;for(i in Ve(this,e),gt(this,e),e)r(e,i)&&(T(t=e[i])?this[i]=t:this["_"+i]=t);this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function Mt(e,t){var i,s=u({},e);for(i in t)r(t,i)&&(n(e[i])&&n(t[i])?(s[i]={},u(s[i],e[i]),u(s[i],t[i])):null!=t[i]?s[i]=t[i]:delete s[i]);for(i in e)r(e,i)&&!r(t,i)&&n(e[i])&&(s[i]=u({},s[i]));return s}function Ot(e){null!=e&&this.set(e)}rt=Object.keys?Object.keys:function(e){var t,i=[];for(t in e)r(e,t)&&i.push(t);return i};var At={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"};function Ct(e,t,i){var s=this._calendar[e]||this._calendar.sameElse;return T(s)?s.call(t,i):s}var Et={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};function Dt(e){var t=this._longDateFormat[e],i=this._longDateFormat[e.toUpperCase()],s=this._longDateFormatCache;return t||!i?t:s&&s[e]&&s[e].formatUpper===i?s[e].format:(t=i.match(H).map(function(e){return"MMMM"===e||"MM"===e||"DD"===e||"dddd"===e?e.slice(1):e}).join(""),s||(s=this._longDateFormatCache={}),s[e]={formatUpper:i,format:t},t)}var Ht="Invalid date";function Nt(){return this._invalidDate}var Rt="%d",Pt=/\d{1,2}/;function jt(e){return this._ordinal.replace("%d",e)}var It={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function Lt(e,t,i,s){var a=this._relativeTime[i];return T(a)?a(e,t,i,s):a.replace(/%d/i,e)}function Ut(e,t,i,s){return this.postformat(Lt.call(this,e,t,i,s))}function Ft(e,t){var i=this._relativeTime[e>0?"future":"past"];return T(i)?i(t):i.replace(/%s/i,t)}function Bt(e,t){return this.postformat(Ft.call(this,e,t))}function Yt(e,t,i,s,a,n,r){var o;return e<100&&e>=0?(o=new Date(e+400,t,i,s,a,n,r),isFinite(o.getFullYear())&&o.setFullYear(e)):o=new Date(e,t,i,s,a,n,r),o}function Wt(e){var t,i;return e<100&&e>=0?((i=Array.prototype.slice.call(arguments))[0]=e+400,t=new Date(Date.UTC.apply(null,i)),isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e)):t=new Date(Date.UTC.apply(null,arguments)),t}function Vt(e,t,i){var s=7+t-i;return-(7+Wt(e,0,s).getUTCDay()-t)%7+s-1}function Zt(e,t,i,s,a){var n,r,o=1+7*(t-1)+(7+i-s)%7+Vt(e,s,a);return o<=0?r=Oe(n=e-1)+o:o>Oe(e)?(n=e+1,r=o-Oe(e)):(n=e,r=o),{year:n,dayOfYear:r}}function Gt(e,t,i,s){var a,n,r=Vt(e,i,s),o=Math.floor((t-r-1)/7)+1;return o<1?a=o+Jt(n=e-1,i,s):o>Jt(e,i,s)?(a=o-Jt(e,i,s),n=e+1):(n=e,a=o),{week:a,year:n}}function qt(e,t,i){return Gt(e.year(),e.dayOfYear(),t,i)}function Kt(e,t,i,s,a){return Gt(e,Math.round((Wt(e,t,i)-Wt(e,0,1))/864e5)+1,s,a)}function Jt(e,t,i){var s=Vt(e,t,i),a=Vt(e+1,t,i);return(Oe(e)-s+a)/7}function Xt(e){return qt(e,this._week.dow,this._week.doy).week}j("w",["ww",2],"wo","week"),j("W",["WW",2],"Wo","isoWeek"),de("w",q,oe),de("ww",q,W),de("W",q,oe),de("WW",q,W),fe(["w","ww","W","WW"],function(e,t,i,s){t[s.substr(0,1)]=ge(e)});var Qt={dow:0,doy:6};function ei(){return this._week.dow}function ti(){return this._week.doy}function ii(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")}function si(e){var t=qt(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")}function ai(){return this.hours()%12||12}function ni(){return this.hours()||24}function ri(e,t){j(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function oi(e,t){return t._meridiemParse}function li(e){return"p"===(e+"").toLowerCase().charAt(0)}j("H",["HH",2],0,"hour"),j("h",["hh",2],0,ai),j("k",["kk",2],0,ni),j("hmm",0,0,function(){return""+ai.apply(this)+D(this.minutes(),2)}),j("hmmss",0,0,function(){return""+ai.apply(this)+D(this.minutes(),2)+D(this.seconds(),2)}),j("Hmm",0,0,function(){return""+this.hours()+D(this.minutes(),2)}),j("Hmmss",0,0,function(){return""+this.hours()+D(this.minutes(),2)+D(this.seconds(),2)}),ri("a",!0),ri("A",!1),de("a",oi),de("A",oi),de("H",q,le),de("h",q,oe),de("k",q,oe),de("HH",q,W),de("hh",q,W),de("kk",q,W),de("hmm",K),de("hmmss",J),de("Hmm",K),de("Hmmss",J),ve(["H","HH"],xe),ve(["k","kk"],function(e,t,i){var s=ge(e);t[xe]=24===s?0:s}),ve(["a","A"],function(e,t,i){i._isPm=i._locale.isPM(e),i._meridiem=e}),ve(["h","hh"],function(e,t,i){t[xe]=ge(e),m(i).bigHour=!0}),ve("hmm",function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s)),m(i).bigHour=!0}),ve("hmmss",function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[Se]=ge(e.substr(a)),m(i).bigHour=!0}),ve("Hmm",function(e,t,i){var s=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s))}),ve("Hmmss",function(e,t,i){var s=e.length-4,a=e.length-2;t[xe]=ge(e.substr(0,s)),t[ke]=ge(e.substr(s,2)),t[Se]=ge(e.substr(a))});var di=/[ap]\.?m?\.?/i,hi=De("Hours",!0);function ci(e,t,i){return e>11?i?"pm":"PM":i?"am":"AM"}var ui,pi={calendar:At,longDateFormat:Et,invalidDate:Ht,ordinal:Rt,dayOfMonthOrdinalParse:Pt,relativeTime:It,months:Le,monthsShort:Ue,week:Qt,weekdays:ot,weekdaysMin:dt,weekdaysShort:lt,meridiemParse:di},gi={},mi={};function vi(e,t){var i,s=Math.min(e.length,t.length);for(i=0;i<s;i+=1)if(e[i]!==t[i])return i;return s}function fi(e){return e?e.toLowerCase().replace("_","-"):e}function _i(e){for(var t,i,s,a,n=0;n<e.length;){for(t=(a=fi(e[n]).split("-")).length,i=(i=fi(e[n+1]))?i.split("-"):null;t>0;){if(s=wi(a.slice(0,t).join("-")))return s;if(i&&i.length>=t&&vi(a,i)>=t-1)break;t--}n++}return ui}function yi(e){return"string"==typeof e&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e)}function wi(e){var t,i=null;if(r(gi,e))return gi[e];if(t=fi(e),r(gi,t))return gi[t];if(mn&&mn.exports&&yi(t))try{i=ui._abbr,un("./locale/"+t),bi(i)}catch(e){gi[t]=null}return r(gi,t)?gi[t]:void 0}function bi(e,t){var i;return e&&((i=l(t)?ki(e):$i(e,t))?ui=i:"undefined"!=typeof console&&console.warn&&console.warn("Locale "+e+" not found. Did you forget to load it?")),ui._abbr}function $i(e,t){if(null!==t){var i,s=pi;if(t.abbr=e,null!=gi[e])z("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),s=gi[e]._config;else if(null!=t.parentLocale)if(null!=gi[t.parentLocale])s=gi[t.parentLocale]._config;else{if(null==(i=wi(t.parentLocale)))return mi[t.parentLocale]||(mi[t.parentLocale]=[]),mi[t.parentLocale].push({name:e,config:t}),null;s=i._config}return gi[e]=new Ot(Mt(s,t)),mi[e]&&mi[e].forEach(function(e){$i(e.name,e.config)}),bi(e),gi[e]}return delete gi[e],null}function xi(e,t){var i,s=wi(e),a=pi;return null!=s&&(e=s._abbr),null!=t?(null!=gi[e]&&null!=gi[e].parentLocale?gi[e].set(Mt(gi[e]._config,t)):(null!=s&&(a=s._config),t=Mt(a,t),null==s&&(t.abbr=e),(i=new Ot(t)).parentLocale=gi[e],gi[e]=i),bi(e)):null!=gi[e]&&(null!=gi[e].parentLocale?(gi[e]=gi[e].parentLocale,e===bi()&&bi(e)):null!=gi[e]&&delete gi[e]),gi[e]}function ki(e){var t;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return ui;if(!a(e)){if(t=wi(e))return t;e=[e]}return _i(e)}function Si(){return rt(gi)}function zi(e){var t,i=e._a;return i&&-2===m(e).overflow&&(t=i[be]<0||i[be]>11?be:i[$e]<1||i[$e]>Ie(i[we],i[be])?$e:i[xe]<0||i[xe]>24||24===i[xe]&&(0!==i[ke]||0!==i[Se]||0!==i[ze])?xe:i[ke]<0||i[ke]>59?ke:i[Se]<0||i[Se]>59?Se:i[ze]<0||i[ze]>999?ze:-1,m(e)._overflowDayOfYear&&(t<we||t>$e)&&(t=$e),m(e)._overflowWeeks&&-1===t&&(t=Te),m(e)._overflowWeekday&&-1===t&&(t=Me),m(e).overflow=t),e}var Ti=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Mi=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Oi=/Z|[+-]\d\d(?::?\d\d)?/,Ai=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/],["YYYYMM",/\d{6}/,!1],["YYYY",/\d{4}/,!1]],Ci=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Ei=/^\/?Date\((-?\d+)/i,Di=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,Hi={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Ni(e){var t,i,s,a,n,r,o=e._i,l=Ti.exec(o)||Mi.exec(o),d=Ai.length,h=Ci.length;if(l){for(m(e).iso=!0,t=0,i=d;t<i;t++)if(Ai[t][1].exec(l[1])){a=Ai[t][0],s=!1!==Ai[t][2];break}if(null==a)return void(e._isValid=!1);if(l[3]){for(t=0,i=h;t<i;t++)if(Ci[t][1].exec(l[3])){n=(l[2]||" ")+Ci[t][0];break}if(null==n)return void(e._isValid=!1)}if(!s&&null!=n)return void(e._isValid=!1);if(l[4]){if(!Oi.exec(l[4]))return void(e._isValid=!1);r="Z"}e._f=a+(n||"")+(r||""),qi(e)}else e._isValid=!1}function Ri(e,t,i,s,a,n){var r=[Pi(e),Ue.indexOf(t),parseInt(i,10),parseInt(s,10),parseInt(a,10)];return n&&r.push(parseInt(n,10)),r}function Pi(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function ji(e){return e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s\s*/,"").replace(/\s\s*$/,"")}function Ii(e,t,i){return!e||lt.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(m(i).weekdayMismatch=!0,i._isValid=!1,!1)}function Li(e,t,i){if(e)return Hi[e];if(t)return 0;var s=parseInt(i,10),a=s%100;return(s-a)/100*60+a}function Ui(e){var t,i=Di.exec(ji(e._i));if(i){if(t=Ri(i[4],i[3],i[2],i[5],i[6],i[7]),!Ii(i[1],t,e))return;e._a=t,e._tzm=Li(i[8],i[9],i[10]),e._d=Wt.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),m(e).rfc2822=!0}else e._isValid=!1}function Fi(e){var t=Ei.exec(e._i);null===t?(Ni(e),!1===e._isValid&&(delete e._isValid,Ui(e),!1===e._isValid&&(delete e._isValid,e._strict?e._isValid=!1:i.createFromInputFallback(e)))):e._d=new Date(+t[1])}function Bi(e,t,i){return null!=e?e:null!=t?t:i}function Yi(e,t,s){var a=Object.prototype.hasOwnProperty.call(e,"_isDefaultDatePartsForWeek"),n=e._isDefaultDatePartsForWeek;e._isDefaultDatePartsForWeek=!!s;try{return i._getDefaultDateParts(e,t,s)}finally{a?e._isDefaultDatePartsForWeek=n:delete e._isDefaultDatePartsForWeek}}function Wi(e){var t=e._defaultDatePartsNow;return t?(t.hasValue||(t.value=i.now(),t.hasValue=!0),t.value):i.now()}function Vi(e,t,i){var s=i||e._isDefaultDatePartsForWeek,a=s?ss(t):new Date(t);return s?[a.year(),a.month(),a.date()]:e._useUTC?[a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate()]:[a.getFullYear(),a.getMonth(),a.getDate()]}function Zi(e){var t,i,s,a,n,r,o,l=[];if(!e._d){for(null!=e._a[we]&&null!=e._a[be]&&null!=e._a[$e]||(a=Yi(e,s=Wi(e))),e._w&&null==e._a[$e]&&null==e._a[be]&&Gi(e,Yi(e,s,!0)),null!=e._dayOfYear&&(r=null!=e._a[we]?e._a[we]:a[we],(e._dayOfYear>Oe(r)||0===e._dayOfYear)&&(m(e)._overflowDayOfYear=!0),i=Wt(r,0,e._dayOfYear),e._a[be]=i.getUTCMonth(),e._a[$e]=i.getUTCDate()),o=null==e._a[we]||null==e._a[be]||null==e._a[$e],t=0;t<3&&null==e._a[t];++t)e._a[t]=l[t]=a[t];for(;t<7;t++)e._a[t]=l[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[xe]&&0===e._a[ke]&&0===e._a[Se]&&0===e._a[ze]&&(e._nextDay=!0,e._a[xe]=0),e._d=(e._useUTC?Wt:Yt).apply(null,l),n=e._useUTC?e._d.getUTCDay():e._d.getDay(),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[xe]=24),e._w&&void 0!==e._w.d&&!o&&e._w.d!==n&&(m(e).weekdayMismatch=!0)}}function Gi(e,t){var i,s,a,n,r,o,l,d,h;null!=(i=e._w).GG||null!=i.W||null!=i.E?(r=1,o=4,s=Bi(i.GG,e._a[we],Kt(t[we],t[be],t[$e],1,4).year),a=Bi(i.W,1),((n=Bi(i.E,1))<1||n>7)&&(d=!0)):(r=e._locale._week.dow,o=e._locale._week.doy,h=Kt(t[we],t[be],t[$e],r,o),s=Bi(i.gg,e._a[we],h.year),a=Bi(i.w,h.week),null!=i.d?((n=i.d)<0||n>6)&&(d=!0):null!=i.e?(n=i.e+r,(i.e<0||i.e>6)&&(d=!0)):n=r),a<1||a>Jt(s,r,o)?m(e)._overflowWeeks=!0:null!=d?m(e)._overflowWeekday=!0:(l=Zt(s,a,n,r,o),e._a[we]=l.year,e._dayOfYear=l.dayOfYear)}function qi(e){if(e._f!==i.ISO_8601)if(e._f!==i.RFC_2822){e._a=[],m(e).empty=!0;var t,s,a,n,r,o,l,d=""+e._i,h=d.length,c=0;for(l=(a=F(e._f,e._locale).match(H)||[]).length,t=0;t<l;t++)n=a[t],(s=(d.match(he(n,e))||[])[0])&&((r=d.substr(0,d.indexOf(s))).length>0&&m(e).unusedInput.push(r),d=d.slice(d.indexOf(s)+s.length),c+=s.length),P[n]?(s?m(e).empty=!1:m(e).unusedTokens.push(n),_e(n,s,e)):e._strict&&!s&&m(e).unusedTokens.push(n);m(e).charsLeftOver=h-c,d.length>0&&m(e).unusedInput.push(d),e._a[xe]<=12&&!0===m(e).bigHour&&e._a[xe]>0&&(m(e).bigHour=void 0),m(e).parsedDateParts=e._a.slice(0),m(e).meridiem=e._meridiem,e._a[xe]=Ki(e._locale,e._a[xe],e._meridiem),null!==(o=m(e).era)&&(e._a[we]=e._locale.erasConvertYear(o,e._a[we])),Zi(e),zi(e)}else Ui(e);else Ni(e)}function Ki(e,t,i){var s;return null==i?t:null!=e.meridiemHour?e.meridiemHour(t,i):null!=e.isPM?((s=e.isPM(i))&&t<12&&(t+=12),s||12!==t||(t=0),t):t}function Ji(e){var t,i,s,a,n,r,o=!1,l={},d=e._f.length;if(0===d)return m(e).invalidFormat=!0,void(e._d=new Date(NaN));for(a=0;a<d;a++)n=0,r=!1,t=w({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._defaultDatePartsNow=l,t._f=e._f[a],qi(t),v(t)&&(r=!0),n+=m(t).charsLeftOver,n+=10*m(t).unusedTokens.length,m(t).score=n,o?n<s&&(s=n,i=t):(null==s||n<s||r)&&(s=n,i=t,r&&(o=!0));u(e,i||t)}function Xi(e){if(!e._d){var t=A(e._i),i=void 0===t.day?t.date:t.day;e._a=c([t.year,t.month,i,t.hour,t.minute,t.second,t.millisecond],function(e){return e&&parseInt(e,10)}),Zi(e)}}function Qi(e){var t=new b(zi(es(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function es(e){var t=e._i,i=e._f;return e._locale=e._locale||ki(e._l),null===t||void 0===i&&""===t?f({nullInput:!0}):("string"==typeof t&&(e._i=t=e._locale.preparse(t)),$(t)?new b(zi(t)):(h(t)?e._d=t:a(i)?Ji(e):i?qi(e):ts(e),v(e)||(e._d=null),e))}function ts(e){var t=e._i;l(t)?e._d=new Date(i.now()):h(t)?e._d=new Date(t.valueOf()):"string"==typeof t?Fi(e):a(t)?(e._a=c(t.slice(0),function(e){return parseInt(e,10)}),Zi(e)):n(t)?Xi(e):d(t)?e._d=new Date(t):i.createFromInputFallback(e)}function is(e,t,i,s,r){var l={};return!0!==t&&!1!==t||(s=t,t=void 0),!0!==i&&!1!==i||(s=i,i=void 0),(n(e)&&o(e)||a(e)&&0===e.length)&&(e=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=r,l._l=i,l._i=e,l._f=t,l._strict=s,Qi(l)}function ss(e,t,i,s){return is(e,t,i,s,!1)}i.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),i._getDefaultDateParts=Vi,i.ISO_8601=function(){},i.RFC_2822=function(){};var as=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:f()}),ns=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=ss.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:f()});function rs(e,t){var i,s;if(1===t.length&&a(t[0])&&(t=t[0]),!t.length)return ss();for(s=0;s<t.length;++s)if($(t[s])){i=t[s];break}if(!i)return f();for(++s;s<t.length;++s)!$(t[s])||t[s].isValid()&&!t[s][e](i)||(i=t[s]);return i}function os(){return rs("isBefore",[].slice.call(arguments,0))}function ls(){return rs("isAfter",[].slice.call(arguments,0))}var ds=function(){return Date.now?Date.now():+new Date},hs=["year","quarter","month","week","day","hour","minute","second","millisecond"];function cs(e){var t,i,s=!1,a=hs.length;for(t in e)if(r(e,t)&&(-1===Ae.call(hs,t)||null!=e[t]&&isNaN(e[t])))return!1;for(i=0;i<a;++i)if(e[hs[i]]){if(s)return!1;parseFloat(e[hs[i]])!==ge(e[hs[i]])&&(s=!0)}return!0}function us(){return this._isValid}function ps(){return Rs(NaN)}function gs(e){var t=A(e),i=t.year||0,s=t.quarter||0,a=t.month||0,n=t.week||t.isoWeek||0,r=t.day||0,o=t.hour||0,l=t.minute||0,d=t.second||0,h=t.millisecond||0;this._isValid=cs(t),this._milliseconds=+h+1e3*d+6e4*l+1e3*o*60*60,this._days=+r+7*n,this._months=+a+3*s+12*i,this._data={},this._locale=ki(),this._bubble()}function ms(e){return e instanceof gs}function vs(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function fs(e,t,i){var s,a=Math.min(e.length,t.length),n=Math.abs(e.length-t.length),r=0;for(s=0;s<a;s++)ge(e[s])!==ge(t[s])&&r++;return r+n}function _s(e,t){j(e,0,0,function(){var e=this.utcOffset(),i="+";return e<0&&(e=-e,i="-"),i+D(~~(e/60),2)+t+D(~~e%60,2)})}_s("Z",":"),_s("ZZ",""),de("Z",ae),de("ZZ",ae),ve(["Z","ZZ"],function(e,t,i){var s=ws(ae,e);i._useUTC=!0,i._tzm=s,null===s&&(m(i).invalidOffset=e)});var ys=/([\+\-]|\d\d)/gi;function ws(e,t){var i,s,a=(t||"").match(e);return null===a?null:(s=60*(i=((a[a.length-1]||[])+"").match(ys)||["-",0,0])[1]+ge(i[2]),ge(i[2])>59||("+"===i[0]?s>840:s>720)?null:0===s?0:"+"===i[0]?s:-s)}function bs(e,t){var s,a;return t._isUTC?(s=t.clone(),a=($(e)||h(e)?e.valueOf():ss(e).valueOf())-s.valueOf(),s._d.setTime(s._d.valueOf()+a),i.updateOffset(s,!1),s):ss(e).local()}function $s(e){return-Math.round(e._d.getTimezoneOffset())}function xs(e,t,s){var a,n=this._offset||0;if(!this.isValid())return null!=e?this:NaN;if(null!=e){if("string"==typeof e){if(null===(e=ws(ae,e)))return this}else Math.abs(e)<16&&!s&&(e*=60);return!this._isUTC&&t&&(a=$s(this)),this._offset=e,this._isUTC=!0,null!=a&&this.add(a,"m"),n!==e&&(!t||this._changeInProgress?Us(this,Rs(e-n,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,i.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?n:$s(this)}function ks(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}function Ss(e){return this.utcOffset(0,e)}function zs(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract($s(this),"m")),this}function Ts(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=ws(se,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this}function Ms(e){return!!this.isValid()&&(e=e?ss(e).utcOffset():0,(this.utcOffset()-e)%60==0)}function Os(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function As(){if(!l(this._isDSTShifted))return this._isDSTShifted;var e,t={};return w(t,this),(t=es(t))._a?(e=t._isUTC?p(t._a):ss(t._a),this._isDSTShifted=this.isValid()&&fs(t._a,e.toArray())>0):this._isDSTShifted=!1,this._isDSTShifted}function Cs(){return!!this.isValid()&&!this._isUTC}function Es(){return!!this.isValid()&&this._isUTC}function Ds(){return!!this.isValid()&&this._isUTC&&0===this._offset}i.updateOffset=function(){};var Hs=/^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,Ns=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Rs(e,t){var i,s,a,n=e,o=null;return ms(e)?n={ms:e._milliseconds,d:e._days,M:e._months}:d(e)||!isNaN(+e)?(n={},t?n[t]=+e:n.milliseconds=+e):(o=Hs.exec(e))?(i="-"===o[1]?-1:1,n={y:0,d:ge(o[$e])*i,h:ge(o[xe])*i,m:ge(o[ke])*i,s:ge(o[Se])*i,ms:ge(vs(1e3*o[ze]))*i}):(o=Ns.exec(e))?(i="-"===o[1]?-1:1,n={y:Ps(o[2],i),M:Ps(o[3],i),w:Ps(o[4],i),d:Ps(o[5],i),h:Ps(o[6],i),m:Ps(o[7],i),s:Ps(o[8],i)}):null==n?n={}:"object"==typeof n&&("from"in n||"to"in n)&&(a=Is(ss(n.from),ss(n.to)),(n={}).ms=a.milliseconds,n.M=a.months),s=new gs(n),ms(e)&&r(e,"_locale")&&(s._locale=e._locale),ms(e)&&r(e,"_isValid")&&(s._isValid=e._isValid),s}function Ps(e,t){var i=e&&parseFloat(e.replace(",","."));return(isNaN(i)?0:i)*t}function js(e,t){var i={};return i.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(i.months,"M").isAfter(t)&&--i.months,i.milliseconds=+t-+e.clone().add(i.months,"M"),i}function Is(e,t){var i;return e.isValid()&&t.isValid()?(t=bs(t,e),e.isBefore(t)?i=js(e,t):((i=js(t,e)).milliseconds=-i.milliseconds,i.months=-i.months),i):{milliseconds:0,months:0}}function Ls(e,t){return function(i,s){var a;return null===s||isNaN(+s)||(z(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),a=i,i=s,s=a),Us(this,Rs(i,s),e),this}}function Us(e,t,s,a){var n=t._milliseconds,r=vs(t._days),o=vs(t._months);e.isValid()&&(a=null==a||a,o&&Je(e,He(e,"Month")+o*s),r&&Ne(e,"Date",He(e,"Date")+r*s),n&&e._d.setTime(e._d.valueOf()+n*s),a&&i.updateOffset(e,r||o))}Rs.fn=gs.prototype,Rs.invalid=ps;var Fs=Ls(1,"add"),Bs=Ls(-1,"subtract");function Ys(e){return"string"==typeof e||e instanceof String}function Ws(e){return $(e)||h(e)||Ys(e)||d(e)||Zs(e)||Vs(e)||null==e}function Vs(e){var t,i,s=n(e)&&!o(e),a=!1,l=["years","year","y","months","month","M","days","day","d","dates","date","D","hours","hour","h","minutes","minute","m","seconds","second","s","milliseconds","millisecond","ms"],d=l.length;for(t=0;t<d;t+=1)i=l[t],a=a||r(e,i);return s&&a}function Zs(e){var t=a(e),i=!1;return t&&(i=0===e.filter(function(t){return!d(t)&&Ys(e)}).length),t&&i}function Gs(e){var t,i,s=n(e)&&!o(e),a=!1,l=["sameDay","nextDay","lastDay","nextWeek","lastWeek","sameElse"];for(t=0;t<l.length;t+=1)i=l[t],a=a||r(e,i);return s&&a}function qs(e,t){var i=e.diff(t,"days",!0);return i<-6?"sameElse":i<-1?"lastWeek":i<0?"lastDay":i<1?"sameDay":i<2?"nextDay":i<7?"nextWeek":"sameElse"}function Ks(e,t){1===arguments.length&&(arguments[0]?Ws(arguments[0])?(e=arguments[0],t=void 0):Gs(arguments[0])&&(t=arguments[0],e=void 0):(e=void 0,t=void 0));var s=e||ss(),a=bs(s,this).startOf("day"),n=i.calendarFormat(this,a)||"sameElse",r=t&&(T(t[n])?t[n].call(this,s):t[n]);return this.format(r||this.localeData().calendar(n,this,ss(s)))}function Js(){return new b(this)}function Xs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()>i.valueOf():i.valueOf()<this.clone().startOf(t).valueOf())}function Qs(e,t){var i=$(e)?e:ss(e);return!(!this.isValid()||!i.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()<i.valueOf():this.clone().endOf(t).valueOf()<i.valueOf())}function ea(e,t,i,s){var a=$(e)?e:ss(e),n=$(t)?t:ss(t);return!!(this.isValid()&&a.isValid()&&n.isValid())&&("("===(s=s||"()")[0]?this.isAfter(a,i):!this.isBefore(a,i))&&(")"===s[1]?this.isBefore(n,i):!this.isAfter(n,i))}function ta(e,t){var i,s=$(e)?e:ss(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=O(t)||"millisecond")?this.valueOf()===s.valueOf():(i=s.valueOf(),this.clone().startOf(t).valueOf()<=i&&i<=this.clone().endOf(t).valueOf()))}function ia(e,t){return this.isSame(e,t)||this.isAfter(e,t)}function sa(e,t){return this.isSame(e,t)||this.isBefore(e,t)}function aa(e,t,i){var s,a,n;if(!this.isValid())return NaN;if(!(s=bs(e,this)).isValid())return NaN;switch(a=6e4*(s.utcOffset()-this.utcOffset()),t=O(t)){case"year":n=na(this,s)/12;break;case"month":n=na(this,s);break;case"quarter":n=na(this,s)/3;break;case"second":n=(this-s)/1e3;break;case"minute":n=(this-s)/6e4;break;case"hour":n=(this-s)/36e5;break;case"day":n=(this-s-a)/864e5;break;case"week":n=(this-s-a)/6048e5;break;default:n=this-s}return i?n:pe(n)}function na(e,t){if(e.date()<t.date())return-na(t,e);var i=12*(t.year()-e.year())+(t.month()-e.month()),s=e.clone().add(i,"months");return-(i+(t-s<0?(t-s)/(s-e.clone().add(i-1,"months")):(t-s)/(e.clone().add(i+1,"months")-s)))||0}function ra(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function oa(e){if(!this.isValid())return null;var t=!0!==e,i=t?this.clone().utc():this;return i.year()<0||i.year()>9999?U(i,t?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):T(Date.prototype.toISOString)?t?this.toDate().toISOString():new Date(this.valueOf()+60*this.utcOffset()*1e3).toISOString().replace("Z",U(i,"Z")):U(i,t?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")}function la(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e,t,i,s,a="moment",n="";return this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",n="Z"),e="["+a+'("]',t=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",i="-MM-DD[T]HH:mm:ss.SSS",s=n+'[")]',this.format(e+t+i+s)}function da(e){e||(e=this.isUtc()?i.defaultFormatUtc:i.defaultFormat);var t=U(this,e);return this.localeData().postformat(t)}function ha(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Rs({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function ca(e){return this.from(ss(),e)}function ua(e,t){return this.isValid()&&($(e)&&e.isValid()||ss(e).isValid())?Rs({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()}function pa(e){return this.to(ss(),e)}function ga(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ki(e))&&(this._locale=t),this)}i.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",i.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var ma=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});function va(){return this._locale}var fa=1e3,_a=60*fa,ya=60*_a,wa=3506328*ya;function ba(e,t){return(e%t+t)%t}function $a(e,t,i){return e<100&&e>=0?new Date(e+400,t,i)-wa:new Date(e,t,i).valueOf()}function xa(e,t,i){return e<100&&e>=0?Date.UTC(e+400,t,i)-wa:Date.UTC(e,t,i)}function ka(e){var t,s;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?xa:$a,e){case"year":t=s(this.year(),0,1);break;case"quarter":t=s(this.year(),this.month()-this.month()%3,1);break;case"month":t=s(this.year(),this.month(),1);break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday());break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1));break;case"day":case"date":t=s(this.year(),this.month(),this.date());break;case"hour":t=this._d.valueOf(),t-=ba(t+(this._isUTC?0:this.utcOffset()*_a),ya);break;case"minute":t=this._d.valueOf(),t-=ba(t,_a);break;case"second":t=this._d.valueOf(),t-=ba(t,fa)}return this._d.setTime(t),i.updateOffset(this,!0),this}function Sa(e){var t,s;if(void 0===(e=O(e))||"millisecond"===e||!this.isValid())return this;switch(s=this._isUTC?xa:$a,e){case"year":t=s(this.year()+1,0,1)-1;break;case"quarter":t=s(this.year(),this.month()-this.month()%3+3,1)-1;break;case"month":t=s(this.year(),this.month()+1,1)-1;break;case"week":t=s(this.year(),this.month(),this.date()-this.weekday()+7)-1;break;case"isoWeek":t=s(this.year(),this.month(),this.date()-(this.isoWeekday()-1)+7)-1;break;case"day":case"date":t=s(this.year(),this.month(),this.date()+1)-1;break;case"hour":t=this._d.valueOf(),t+=ya-ba(t+(this._isUTC?0:this.utcOffset()*_a),ya)-1;break;case"minute":t=this._d.valueOf(),t+=_a-ba(t,_a)-1;break;case"second":t=this._d.valueOf(),t+=fa-ba(t,fa)-1}return this._d.setTime(t),i.updateOffset(this,!0),this}function za(){return this._d.valueOf()-6e4*(this._offset||0)}function Ta(){return Math.floor(this.valueOf()/1e3)}function Ma(){return new Date(this.valueOf())}function Oa(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]}function Aa(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}}function Ca(){return this.isValid()?this.toISOString():null}function Ea(){return v(this)}function Da(){return u({},m(this))}function Ha(){return m(this).overflow}function Na(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function Ra(e,t){var s,a,n,r=this._eras||ki("en")._eras;for(s=0,a=r.length;s<a;++s)switch("string"==typeof r[s].since&&(n=i(r[s].since).startOf("day"),r[s].since=n.valueOf()),typeof r[s].until){case"undefined":r[s].until=1/0;break;case"string":n=i(r[s].until).startOf("day").valueOf(),r[s].until=n.valueOf()}return r}function Pa(e,t,i){var s,a,n,r,o,l=this.eras();for(e=e.toUpperCase(),s=0,a=l.length;s<a;++s)if(n=l[s].name.toUpperCase(),r=l[s].abbr.toUpperCase(),o=l[s].narrow.toUpperCase(),i)switch(t){case"N":case"NN":case"NNN":if(r===e)return l[s];break;case"NNNN":if(n===e)return l[s];break;case"NNNNN":if(o===e)return l[s]}else if([n,r,o].indexOf(e)>=0)return l[s]}function ja(e,t){var s=e.since<=e.until?1:-1;return void 0===t?i(e.since).year():i(e.since).year()+(t-e.offset)*s}function Ia(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].name;if(s[e].until<=i&&i<=s[e].since)return s[e].name}return""}function La(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].narrow;if(s[e].until<=i&&i<=s[e].since)return s[e].narrow}return""}function Ua(){var e,t,i,s=this.localeData().eras();for(e=0,t=s.length;e<t;++e){if(i=this.clone().startOf("day").valueOf(),s[e].since<=i&&i<=s[e].until)return s[e].abbr;if(s[e].until<=i&&i<=s[e].since)return s[e].abbr}return""}function Fa(){var e,t,s,a,n=this.localeData().eras();for(e=0,t=n.length;e<t;++e)if(s=n[e].since<=n[e].until?1:-1,a=this.clone().startOf("day").valueOf(),n[e].since<=a&&a<=n[e].until||n[e].until<=a&&a<=n[e].since)return(this.year()-i(n[e].since).year())*s+n[e].offset;return this.year()}function Ba(e){return r(this,"_erasNameRegex")||Ka.call(this),e?this._erasNameRegex:this._erasRegex}function Ya(e){return r(this,"_erasAbbrRegex")||Ka.call(this),e?this._erasAbbrRegex:this._erasRegex}function Wa(e){return r(this,"_erasNarrowRegex")||Ka.call(this),e?this._erasNarrowRegex:this._erasRegex}function Va(e,t){return t.erasAbbrRegex(e)}function Za(e,t){return t.erasNameRegex(e)}function Ga(e,t){return t.erasNarrowRegex(e)}function qa(e,t){return t._eraYearOrdinalRegex||te}function Ka(){var e,t,i,s,a,n=[],r=[],o=[],l=[],d=this.eras();for(e=0,t=d.length;e<t;++e)i=ue(d[e].name),s=ue(d[e].abbr),a=ue(d[e].narrow),r.push(i),n.push(s),o.push(a),l.push(i),l.push(s),l.push(a);this._erasRegex=new RegExp("^("+l.join("|")+")","i"),this._erasNameRegex=new RegExp("^("+r.join("|")+")","i"),this._erasAbbrRegex=new RegExp("^("+n.join("|")+")","i"),this._erasNarrowRegex=new RegExp("^("+o.join("|")+")","i")}function Ja(e,t){j(0,[e,e.length],0,t)}function Xa(e){return nn.call(this,e,this.week(),this.weekday()+this.localeData()._week.dow,this.localeData()._week.dow,this.localeData()._week.doy)}function Qa(e){return nn.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)}function en(){return Jt(this.year(),1,4)}function tn(){return Jt(this.isoWeekYear(),1,4)}function sn(){var e=this.localeData()._week;return Jt(this.year(),e.dow,e.doy)}function an(){var e=this.localeData()._week;return Jt(this.weekYear(),e.dow,e.doy)}function nn(e,t,i,s,a){var n;return null==e?qt(this,s,a).year:(t>(n=Jt(e,s,a))&&(t=n),rn.call(this,e,t,i,s,a))}function rn(e,t,i,s,a){var n=Zt(e,t,i,s,a),r=Wt(n.year,0,n.dayOfYear);return this.year(r.getUTCFullYear()),this.month(r.getUTCMonth()),this.date(r.getUTCDate()),this}function on(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)}j("N",0,0,"eraAbbr"),j("NN",0,0,"eraAbbr"),j("NNN",0,0,"eraAbbr"),j("NNNN",0,0,"eraName"),j("NNNNN",0,0,"eraNarrow"),j("y",["y",1],"yo","eraYear"),j("y",["yy",2],0,"eraYear"),j("y",["yyy",3],0,"eraYear"),j("y",["yyyy",4],0,"eraYear"),de("N",Va),de("NN",Va),de("NNN",Va),de("NNNN",Za),de("NNNNN",Ga),ve(["N","NN","NNN","NNNN","NNNNN"],function(e,t,i,s){var a=i._locale.erasParse(e,s,i._strict);a?m(i).era=a:m(i).invalidEra=e}),de("y",te),de("yy",te),de("yyy",te),de("yyyy",te),de("yo",qa),ve(["y","yy","yyy","yyyy"],we),ve(["yo"],function(e,t,i,s){var a;i._locale._eraYearOrdinalRegex&&(a=e.match(i._locale._eraYearOrdinalRegex)),i._locale.eraYearOrdinalParse?t[we]=i._locale.eraYearOrdinalParse(e,a):t[we]=parseInt(e,10)}),j(0,["gg",2],0,function(){return this.weekYear()%100}),j(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Ja("gggg","weekYear"),Ja("ggggg","weekYear"),Ja("GGGG","isoWeekYear"),Ja("GGGGG","isoWeekYear"),de("G",ie),de("g",ie),de("GG",q,W),de("gg",q,W),de("GGGG",Q,Z),de("gggg",Q,Z),de("GGGGG",ee,G),de("ggggg",ee,G),fe(["gggg","ggggg","GGGG","GGGGG"],function(e,t,i,s){t[s.substr(0,2)]=ge(e)}),fe(["gg","GG"],function(e,t,s,a){t[a]=i.parseTwoDigitYear(e)}),j("Q",0,"Qo","quarter"),de("Q",Y),ve("Q",function(e,t){t[be]=3*(ge(e)-1)}),j("D",["DD",2],"Do","date"),de("D",q,oe),de("DD",q,W),de("Do",function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient}),ve(["D","DD"],$e),ve("Do",function(e,t){t[$e]=ge(e.match(q)[0])});var ln=De("Date",!0);function dn(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")}j("DDD",["DDDD",3],"DDDo","dayOfYear"),de("DDD",X),de("DDDD",V),ve(["DDD","DDDD"],function(e,t,i){i._dayOfYear=ge(e)}),j("m",["mm",2],0,"minute"),de("m",q,le),de("mm",q,W),ve(["m","mm"],ke);var hn=De("Minutes",!1);j("s",["ss",2],0,"second"),de("s",q,le),de("ss",q,W),ve(["s","ss"],Se);var cn,pn,gn=De("Seconds",!1);for(j("S",0,0,function(){return~~(this.millisecond()/100)}),j(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),j(0,["SSS",3],0,"millisecond"),j(0,["SSSS",4],0,function(){return 10*this.millisecond()}),j(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),j(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),j(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),j(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),j(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),de("S",X,Y),de("SS",X,W),de("SSS",X,V),cn="SSSS";cn.length<=9;cn+="S")de(cn,te);function vn(e,t){t[ze]=ge(1e3*("0."+e))}for(cn="S";cn.length<=9;cn+="S")ve(cn,vn);function fn(){return this._isUTC?"UTC":""}function _n(){return this._isUTC?"Coordinated Universal Time":""}pn=De("Milliseconds",!1),j("z",0,0,"zoneAbbr"),j("zz",0,0,"zoneName");var yn=b.prototype;function wn(e){return ss(1e3*e)}function bn(){return ss.apply(null,arguments).parseZone()}function $n(e){return e}yn.add=Fs,yn.calendar=Ks,yn.clone=Js,yn.diff=aa,yn.endOf=Sa,yn.format=da,yn.from=ha,yn.fromNow=ca,yn.to=ua,yn.toNow=pa,yn.get=Re,yn.invalidAt=Ha,yn.isAfter=Xs,yn.isBefore=Qs,yn.isBetween=ea,yn.isSame=ta,yn.isSameOrAfter=ia,yn.isSameOrBefore=sa,yn.isValid=Ea,yn.lang=ma,yn.locale=ga,yn.localeData=va,yn.max=ns,yn.min=as,yn.parsingFlags=Da,yn.set=Pe,yn.startOf=ka,yn.subtract=Bs,yn.toArray=Oa,yn.toObject=Aa,yn.toDate=Ma,yn.toISOString=oa,yn.inspect=la,"undefined"!=typeof Symbol&&null!=Symbol.for&&(yn[Symbol.for("nodejs.util.inspect.custom")]=function(){return"Moment<"+this.format()+">"}),yn.toJSON=Ca,yn.toString=ra,yn.unix=Ta,yn.valueOf=za,yn.creationData=Na,yn.eraName=Ia,yn.eraNarrow=La,yn.eraAbbr=Ua,yn.eraYear=Fa,yn.year=Ce,yn.isLeapYear=Ee,yn.weekYear=Xa,yn.isoWeekYear=Qa,yn.quarter=yn.quarters=on,yn.month=Xe,yn.daysInMonth=Qe,yn.week=yn.weeks=ii,yn.isoWeek=yn.isoWeeks=si,yn.weeksInYear=sn,yn.weeksInWeekYear=an,yn.isoWeeksInYear=en,yn.isoWeeksInISOWeekYear=tn,yn.date=ln,yn.day=yn.days=wt,yn.weekday=bt,yn.isoWeekday=$t,yn.dayOfYear=dn,yn.hour=yn.hours=hi,yn.minute=yn.minutes=hn,yn.second=yn.seconds=gn,yn.millisecond=yn.milliseconds=pn,yn.utcOffset=xs,yn.utc=Ss,yn.local=zs,yn.parseZone=Ts,yn.hasAlignedHourOffset=Ms,yn.isDST=Os,yn.isLocal=Cs,yn.isUtcOffset=Es,yn.isUtc=Ds,yn.isUTC=Ds,yn.zoneAbbr=fn,yn.zoneName=_n,yn.dates=k("dates accessor is deprecated. Use date instead.",ln),yn.months=k("months accessor is deprecated. Use month instead",Xe),yn.years=k("years accessor is deprecated. Use year instead",Ce),yn.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",ks),yn.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",As);var xn=Ot.prototype;function kn(e,t,i,s){var a=ki(),n=p().set(s,t);return a[i](n,e)}function Sn(e,t,i){if(d(e)&&(t=e,e=void 0),e=e||"",null!=t)return kn(e,t,i,"month");var s,a=[];for(s=0;s<12;s++)a[s]=kn(e,s,i,"month");return a}function zn(e,t,i,s){"boolean"==typeof e?(d(t)&&(i=t,t=void 0),t=t||""):(i=t=e,e=!1,d(t)&&(i=t,t=void 0),t=t||"");var a,n=ki(),r=e?n._week.dow:0,o=[];if(null!=i)return kn(t,(i+r)%7,s,"day");for(a=0;a<7;a++)o[a]=kn(t,(a+r)%7,s,"day");return o}function Tn(e,t){return Sn(e,t,"months")}function Mn(e,t){return Sn(e,t,"monthsShort")}function On(e,t,i){return zn(e,t,i,"weekdays")}function An(e,t,i){return zn(e,t,i,"weekdaysShort")}function Cn(e,t,i){return zn(e,t,i,"weekdaysMin")}xn.calendar=Ct,xn.longDateFormat=Dt,xn.invalidDate=Nt,xn.ordinal=jt,xn.preparse=$n,xn.postformat=$n,xn.relativeTime=Ut,xn.pastFuture=Bt,xn.set=Tt,xn.eras=Ra,xn.erasParse=Pa,xn.erasConvertYear=ja,xn.erasAbbrRegex=Ya,xn.erasNameRegex=Ba,xn.erasNarrowRegex=Wa,xn.months=Ze,xn.monthsShort=Ge,xn.monthsParse=Ke,xn.monthsRegex=tt,xn.monthsShortRegex=et,xn.week=Xt,xn.firstDayOfYear=ti,xn.firstDayOfWeek=ei,xn.weekdays=mt,xn.weekdaysMin=ft,xn.weekdaysShort=vt,xn.weekdaysParse=yt,xn.weekdaysRegex=xt,xn.weekdaysShortRegex=kt,xn.weekdaysMinRegex=St,xn.isPM=li,xn.meridiem=ci,bi("en",{eras:[{since:"0001-01-01",until:1/0,offset:1,name:"Anno Domini",narrow:"AD",abbr:"AD"},{since:"0000-12-31",until:-1/0,offset:1,name:"Before Christ",narrow:"BC",abbr:"BC"}],dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===ge(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),i.lang=k("moment.lang is deprecated. Use moment.locale instead.",bi),i.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ki);var En=Math.abs;function Dn(){var e=this._data;return this._milliseconds=En(this._milliseconds),this._days=En(this._days),this._months=En(this._months),e.milliseconds=En(e.milliseconds),e.seconds=En(e.seconds),e.minutes=En(e.minutes),e.hours=En(e.hours),e.months=En(e.months),e.years=En(e.years),this}function Hn(e,t,i,s){var a=Rs(t,i);return e._milliseconds+=s*a._milliseconds,e._days+=s*a._days,e._months+=s*a._months,e._bubble()}function Nn(e,t){return Hn(this,e,t,1)}function Rn(e,t){return Hn(this,e,t,-1)}function Pn(e){return e<0?Math.floor(e):Math.ceil(e)}function jn(){var e,t,i,s,a,n=this._milliseconds,r=this._days,o=this._months,l=this._data;return n>=0&&r>=0&&o>=0||n<=0&&r<=0&&o<=0||(n+=864e5*Pn(Ln(o)+r),r=0,o=0),l.milliseconds=n%1e3,e=pe(n/1e3),l.seconds=e%60,t=pe(e/60),l.minutes=t%60,i=pe(t/60),l.hours=i%24,r+=pe(i/24),o+=a=pe(In(r)),r-=Pn(Ln(a)),s=pe(o/12),o%=12,l.days=r,l.months=o,l.years=s,this}function In(e){return 4800*e/146097}function Ln(e){return 146097*e/4800}function Un(e){if(!this.isValid())return NaN;var t,i,s=this._milliseconds;if("month"===(e=O(e))||"quarter"===e||"year"===e)switch(t=this._days+s/864e5,i=this._months+In(t),e){case"month":return i;case"quarter":return i/3;case"year":return i/12}else switch(t=this._days+Math.round(Ln(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}}function Fn(e){return function(){return this.as(e)}}var Bn=Fn("ms"),Yn=Fn("s"),Wn=Fn("m"),Vn=Fn("h"),Zn=Fn("d"),Gn=Fn("w"),qn=Fn("M"),Kn=Fn("Q"),Jn=Fn("y"),Xn=Bn;function Qn(){return Rs(this)}function er(e){return e=O(e),this.isValid()?this[e+"s"]():NaN}function tr(e){return function(){return this.isValid()?this._data[e]:NaN}}var ir=tr("milliseconds"),sr=tr("seconds"),ar=tr("minutes"),nr=tr("hours"),rr=tr("days"),or=tr("months"),lr=tr("years");function dr(){return pe(this.days()/7)}var hr=Math.round,cr={ss:44,s:45,m:45,h:22,d:26,w:null,M:11};function ur(e,t,i,s,a){return Lt.call(a,t||1,!!i,e,s)}function pr(e,t,i,s){var a=Rs(e).abs(),n=hr(a.as("s")),r=hr(a.as("m")),o=hr(a.as("h")),l=hr(a.as("d")),d=hr(a.as("M")),h=hr(a.as("w")),c=hr(a.as("y")),u=n<=i.ss&&["s",n]||n<i.s&&["ss",n]||r<=1&&["m"]||r<i.m&&["mm",r]||o<=1&&["h"]||o<i.h&&["hh",o]||l<=1&&["d"]||l<i.d&&["dd",l];return null!=i.w&&(u=u||h<=1&&["w"]||h<i.w&&["ww",h]),(u=u||d<=1&&["M"]||d<i.M&&["MM",d]||c<=1&&["y"]||["yy",c])[2]=t,u[3]=+e>0,u[4]=s,ur.apply(null,u)}function gr(e){return void 0===e?hr:"function"==typeof e&&(hr=e,!0)}function mr(e,t){return void 0!==cr[e]&&(void 0===t?cr[e]:(cr[e]=t,"s"===e&&(cr.ss=t-1),!0))}function vr(e,t){if(!this.isValid())return this.localeData().invalidDate();var i,s,a=!1,n=cr;return"object"==typeof e&&(t=e,e=!1),"boolean"==typeof e&&(a=e),"object"==typeof t&&(n=u(u({},cr),t||{}),null!=t.s&&null==t.ss&&(n.ss=t.s-1)),s=pr(this,!a,n,i=this.localeData()),a&&(s=Ft.call(i,+this,s)),i.postformat(s)}var fr=Math.abs;function _r(e){return(e>0)-(e<0)||+e}function yr(){if(!this.isValid())return this.localeData().invalidDate();var e,t,i,s,a,n,r,o,l=fr(this._milliseconds)/1e3,d=fr(this._days),h=fr(this._months),c=this.asSeconds();return c?(e=pe(l/60),t=pe(e/60),l%=60,e%=60,i=pe(h/12),h%=12,s=l?l.toFixed(3).replace(/\.?0+$/,""):"",a=c<0?"-":"",n=_r(this._months)!==_r(c)?"-":"",r=_r(this._days)!==_r(c)?"-":"",o=_r(this._milliseconds)!==_r(c)?"-":"",a+"P"+(i?n+i+"Y":"")+(h?n+h+"M":"")+(d?r+d+"D":"")+(t||e||l?"T":"")+(t?o+t+"H":"")+(e?o+e+"M":"")+(l?o+s+"S":"")):"P0D"}var wr=gs.prototype;return wr.isValid=us,wr.abs=Dn,wr.add=Nn,wr.subtract=Rn,wr.as=Un,wr.asMilliseconds=Bn,wr.asSeconds=Yn,wr.asMinutes=Wn,wr.asHours=Vn,wr.asDays=Zn,wr.asWeeks=Gn,wr.asMonths=qn,wr.asQuarters=Kn,wr.asYears=Jn,wr.valueOf=Xn,wr._bubble=jn,wr.clone=Qn,wr.get=er,wr.milliseconds=ir,wr.seconds=sr,wr.minutes=ar,wr.hours=nr,wr.days=rr,wr.weeks=dr,wr.months=or,wr.years=lr,wr.humanize=vr,wr.toISOString=yr,wr.toString=yr,wr.toJSON=yr,wr.locale=ga,wr.localeData=va,wr.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",yr),wr.lang=ma,j("X",0,0,"unix"),j("x",0,0,"valueOf"),de("x",ie),de("X",ne),ve("X",function(e,t,i){i._d=new Date(1e3*parseFloat(e))}),ve("x",function(e,t,i){i._d=new Date(ge(e))}),
//! moment.js
i.version="2.31.0",s(ss),i.fn=yn,i.min=os,i.max=ls,i.now=ds,i.utc=p,i.unix=wn,i.months=Tn,i.isDate=h,i.locale=bi,i.invalid=f,i.duration=Rs,i.isMoment=$,i.weekdays=On,i.parseZone=bn,i.localeData=ki,i.isDuration=ms,i.monthsShort=Mn,i.weekdaysMin=Cn,i.defineLocale=$i,i.updateLocale=xi,i.locales=Si,i.weekdaysShort=An,i.normalizeUnits=O,i.relativeTimeRounding=gr,i.relativeTimeThreshold=mr,i.calendarFormat=qs,i.prototype=yn,i.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"GGGG-[W]WW",MONTH:"YYYY-MM"},i}()),gn.exports),fn=cn(vn);const _n=["sand","sandy_loam","loam","clay_loam","clay","custom"],yn=["lawn","vegetables","flowers","shrubs","hedge","fruit_trees","vines","ground_cover","custom"];let wn=class extends(ba(ce)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[],this.wateringCalendars=new Map,this.weatherRecords=new Map,this.plannedDurations=new Map,this.isLoading=!0,this.isSaving=!1,this.isCreatingZone=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this._pendingZoneChanges=new Map,this.zoneCache=new Map,this._expanded=new Set}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}_toggleZone(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this.isCreatingZone?console.debug("Skipping data refresh during zone creation"):this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:di+"_config_updated"})]}async _fetchData(){if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([da(this.hass),ca(this.hass),pa(this.hass),ma(this.hass)]);this.config=e,this.zones=t,this.modules=i,this.mappings=s,this._fetchWateringCalendars(),this._fetchWeatherRecords(),this._fetchPlannedDurations(),this.zoneCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _waterZone(e){var t,i,s,a;const n=null!==(i=null===(t=this.hass)||void 0===t?void 0:t.language)&&void 0!==i?i:"en",r=(e,...t)=>ai(`panels.zones.water.${e}`,n,...t),o=null!==(a=null!==(s=this.plannedDurations.get(String(e.id)))&&void 0!==s?s:e.duration)&&void 0!==a?a:0,l=await async function(e,t){const i=document.createElement("smart-irrigation-confirmation-dialog");i.hass=e,document.body.appendChild(i);try{return await i.showDialog(t)?""===i.value.trim()?NaN:Number(i.value):null}finally{i.remove()}}(this.hass,{text:r("question","{name}",e.name),confirmText:ai("panels.zones.actions.water",n),number:{label:o>0?r("minutes","{calculated}",this._friendlyDuration(o)):r("minutes-none"),unit:"min",min:1,max:1440}});if(null===l)return;const d=isNaN(l)?Math.round(o):Math.round(60*Math.min(l,1440));d<=0||await this.hass.callService(di,"water_zone",{zone_id:e.id,seconds:d})}_ask(e,t){var i,s;const a=ai(e,null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en").replace("{name}",null!=t?t:"");return La(this.hass,{text:a,destructive:!0})}handleCalculateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",di+"/zones",{calculate_all:!0})).catch(e=>{console.error("Failed to calculate all zones:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleUpdateAllZones(){var e;this.hass&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",di+"/zones",{update_all:!0})).catch(e=>{console.error("Failed to update all zones:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}async handleResetAllBuckets(){var e;this.hass&&(await this._ask("confirm.reset_all_buckets")&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",di+"/zones",{reset_all_buckets:!0})).catch(e=>{console.error("Failed to reset all buckets:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})))}async handleClearAllWeatherdata(){var e;this.hass&&(await this._ask("confirm.clear_all_weather")&&(this.isSaving=!0,(e=this.hass,e.callApi("POST",di+"/zones",{clear_all_weatherdata:!0})).catch(e=>{console.error("Failed to clear all weather data:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})))}handleAddZone(){if(!this.nameInput.value.trim())return;this.isCreatingZone=!1;const e={name:this.nameInput.value.trim(),size:parseFloat(this.sizeInput.value)||0,throughput:parseFloat(this.throughputInput.value)||0,state:hn.Automatic,duration:0,bucket:0,module:void 0,delta:0,et_deficiency:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0,drainage_rate:void 0,current_drainage:0};this.zones=[...this.zones,e],this.isSaving=!0,this.saveToHA(e).then(()=>(this.nameInput.value="",this.sizeInput.value="",this.throughputInput.value="",this._fetchData())).catch(e=>{console.error("Failed to add zone:",e),this.zones=this.zones.slice(0,-1)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}_engineOptions(e,t,i){var s,a,n,r;const o=null!==(s=t.calculation_method)&&void 0!==s?s:"from_weather",l=null!==(a=t.method_config)&&void 0!==a?a:{},d=i=>this.handleEditZone(e,Object.assign(Object.assign({},t),{calculation_method:o,method_config:Object.assign(Object.assign({},l),i)}));return"from_weather"===o?"advanced"!==(null===(n=this.config)||void 0===n?void 0:n.ui_mode)?"":V`
        ${this._numRow(ai("panels.zones.labels.forecast-days",i),"",null!==(r=l.forecast_days)&&void 0!==r?r:0,e=>d({forecast_days:parseInt(e,10)||0}))}
        <div class="setting-help">
          ${ai("panels.zones.labels.forecast-days-help",i)}
          ${ai("panels.zones.labels.engine-shared-help",i)}
        </div>
      `:"fixed"===o?V`
        ${this._numRow(ai("panels.zones.labels.fixed-amount",i),qs(this.config,ps),(h=l.delta,Math.abs(Number(h)||0)),e=>d({delta:oa(e)}))}
        <div class="setting-help">
          ${ai("panels.zones.labels.engine-shared-help",i)}
        </div>
      `:"";var h}_friendlyDuration(e){const t=Math.max(0,Math.round(e||0)),i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60;return i>0?`${i} h ${String(s).padStart(2,"0")} min`:s>0?a?`${s} min ${a} s`:`${s} min`:`${a} s`}_volumeText(e,t){return`${Js(e,t).toFixed(1)} ${Gs(this.config,us)}`}async _fetchPlannedDurations(){var e;try{const t=await fa(this.hass),i=new Map;for(const[s,a]of Object.entries(null!==(e=null==t?void 0:t.zone_estimates)&&void 0!==e?e:{})){const e=Number(null==a?void 0:a.duration);Number.isFinite(e)&&i.set(String(s),e)}this.plannedDurations=i}catch(e){console.debug("Planned durations unavailable:",e)}}_liveEstimate(e){var t,i,s;const a=null!==(i=null===(t=this.hass)||void 0===t?void 0:t.states)&&void 0!==i?i:{};for(const t of Object.keys(a)){if(!t.endsWith("_live_bucket"))continue;const i=a[t],n=null!==(s=null==i?void 0:i.attributes)&&void 0!==s?s:{};if(String(n.zone_id)!==String(e.id))continue;if(!0!==n.live)return;const r=parseFloat(i.state);if(!Number.isFinite(r))return;return{bucket:r,duration:Number(n.duration)||0}}}_zoneStatus(e,t){var i,s,a;const n=(e,...i)=>ai(`panels.zones.status.${e}`,t,...i),r=this._liveEstimate(e),o=this.plannedDurations.get(String(e.id)),l=r?r.bucket:null!==(i=e.bucket)&&void 0!==i?i:0,d=Math.max(0,-l),h=null!==(s=e.irrigation_threshold)&&void 0!==s?s:0,c=Gs(this.config,ps),u=d>=.05?`${d.toFixed(1)} ${c}`:null;let p="idle",g=u?n("idle","{short}",u):n("satisfied");if(e.state===hn.Disabled)p="off",g=n("disabled");else if(e.state===hn.Manual)p="off",g=n("manual");else if((null!==(a=e.duration)&&void 0!==a?a:0)>0)p="watering",g=n("will-water","{duration}",this._friendlyDuration(e.duration)).replace(/\.$/,"")+` (${this._volumeText(e.duration,e.throughput)}).`;else if(r&&(null!=o?o:r.duration)>0){const t=null!=o?o:r.duration;p="watering",g=n("estimate","{short}",null!=u?u:"","{duration}",this._friendlyDuration(t),"{volume}",this._volumeText(t,e.throughput))}else u&&h>0&&(g=n("under-threshold","{short}",u));return V`
      <div class="zone-status zone-status--${p}">
        <ha-icon
          icon=${"watering"===p?"mdi:water-outline":"off"===p?"mdi:pause-circle-outline":"mdi:check-circle-outline"}
        ></ha-icon>
        <span>${g}</span>
        ${"off"!==p&&h>0?V`<span class="zone-status-numbers">
              ${n("threshold")}: ${h.toFixed(1)} ${c}
            </span>`:""}
      </div>
    `}_cropFactorByMonth(e,t,i){const s=e.crop_factor_by_month&&12===e.crop_factor_by_month.length?e.crop_factor_by_month:new Array(12).fill(null),a=(i,a)=>{const n=[...s],r=parseFloat(a);n[i]=isNaN(r)||r<=0?null:r,this.handleEditZone(t,Object.assign(Object.assign({},e),{[ks]:n.every(e=>null===e)?null:n}))};return V`
      <div class="setting-row">
        <div class="setting-label">
          ${ai("panels.zones.labels.crop-factor-by-month",i)}
        </div>
      </div>
      <div class="month-grid">
        ${s.map((e,t)=>V`
            <label class="month-cell">
              <span class="unit"
                >${ai(`panels.zones.labels.months.${t+1}`,i)}</span
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
      <div class="setting-help">
        ${ai("panels.zones.labels.crop-factor-by-month-help",i)}
      </div>
    `}_adv(e){var t;return"advanced"===(null===(t=this.config)||void 0===t?void 0:t.ui_mode)?e:""}handleEditZone(e,t){if(!this.hass)return;const i=this.zones[e],s=t.id,a=Object.assign(Object.assign({},void 0!==s?this._pendingZoneChanges.get(s):{}),function(e,t){const i={};for(const s of new Set([...Object.keys(null!=e?e:{}),...Object.keys(t)]))JSON.stringify(null==e?void 0:e[s])!==JSON.stringify(t[s])&&(i[s]=void 0===t[s]?null:t[s]);return i}(i,t));void 0!==s&&this._pendingZoneChanges.set(s,a),this.zones[e]=t,null!=t.id&&this.zoneCache.delete(t.id.toString()),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout(()=>{const e=[...this._pendingZoneChanges.entries()];this._pendingZoneChanges.clear();const t=e.filter(([,e])=>Object.keys(e).length>0).map(([e,t])=>Object.assign(Object.assign({},t),{id:e}));if(0===t.length)return void(this.globalDebounceTimer=null);this.isSaving=!0,this._suppressNextConfigUpdate=!0;const i=t.some(e=>"soil_type"in e||"plant_type"in e||"calculation_method"in e||"method_config"in e);Promise.all(t.map(e=>this.saveToHA(e))).then(()=>i?this._fetchData():void 0).catch(e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save zone:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}),this.globalDebounceTimer=null},500),this._scheduleUpdate()}async handleRemoveZone(e,t){if(!this.hass)return;const i=this.zones[t].id,s=this.zones[t];if(!s||null==i)return;if(!await this._ask("confirm.delete_zone",s.name))return;const a=[...this.zones];var n,r;this.zones=this.zones.filter((e,i)=>i!==t),this.zoneCache.delete(i.toString()),this.isSaving=!0,(n=this.hass,r=i.toString(),n.callApi("POST",di+"/zones",{id:r,remove:!0})).catch(e=>{console.error("Failed to delete zone:",e),this.zones=a,this._fetchData().catch(e=>{console.error("Failed to refresh data after delete error:",e)})}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}handleCalculateZone(e){const t=this.zones[e];var i,s;t&&null!=t.id&&(this.hass&&(i=this.hass,s=t.id.toString(),i.callApi("POST",di+"/zones",{id:s,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=this.zones[e];var i,s;t&&null!=t.id&&(this.hass&&(i=this.hass,s=t.id.toString(),i.callApi("POST",di+"/zones",{id:s,update:!0})))}handleViewWeatherInfo(e){var t;const i=this.zones[e];if(!i||null==i.mapping)return;const s=`#weather-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}handleViewWateringCalendar(e){var t;const i=this.zones[e];if(!i||null==i.id)return;const s=`#calendar-section-${i.id}`,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(s);a&&(a.hasAttribute("hidden")?a.removeAttribute("hidden"):a.setAttribute("hidden",""))}async _fetchWeatherRecords(){if(this.hass){for(const e of this.zones)if(void 0!==e.id&&void 0!==e.mapping)try{const t=await _a(this.hass,e.mapping.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`,t)}this._scheduleUpdate()}}async _fetchWateringCalendars(){if(this.hass){for(const e of this.zones)if(void 0!==e.id)try{const t=await wa(this.hass,e.id.toString());this.wateringCalendars.set(e.id,t)}catch(t){console.error(`Failed to fetch watering calendar for zone ${e.id}:`,t)}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass||"number"!=typeof e.id)return V``;const t=this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${ai("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${ai("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${ai("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map(e=>V`
                    <div class="weather-row">
                      <span
                        >${fn(e.timestamp).format("MM-DD HH:mm")}</span
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
                        >${e.retrieval_time?fn(e.retrieval_time).format("MM-DD HH:mm"):"-"}</span
                      >
                    </div>
                  `)}
              </div>
            `}
      </div>
    `}renderWateringCalendar(e){var t;if(!this.hass||"number"!=typeof e.id)return V``;const i=this.wateringCalendars.get(e.id),s=i&&e.id in i?i[e.id]:null,a=(null==s?void 0:s.monthly_estimates)||[],n=this.hass.language,r=e=>ai(`panels.zones.calendar.${e}`,n);return V` <div class="watering-calendar">
      <h4>${r("title")}</h4>
      <div class="calendar-note">${r("caveat")}</div>
      ${0===a.length?V`
            <div class="calendar-note">
              ${(null==s?void 0:s.error)?`${r("error")}: ${s.error}`:r("none")}
            </div>
          `:V` <div class="calendar-table">
              <div class="calendar-header">
                <span>${r("month")}</span>
                <span
                  >${r("et")} (${qs(this.config,ps)})</span
                >
                <span
                  >${r("precipitation")}
                  (${qs(this.config,ps)})</span
                >
                <span
                  >${r("watering")}
                  (${qs(this.config,us)})</span
                >
                <span
                  >${r("avg-temp")}
                  (${(null===(t=this.config)||void 0===t?void 0:t.units)===yi?"°C":"°F"})</span
                >
              </div>
              ${a.map(e=>V`
                  <div class="calendar-row">
                    <span
                      >${e.month_name||`Month ${e.month}`||"-"}</span
                    >
                    <span
                      >${null!==e.estimated_et_mm&&void 0!==e.estimated_et_mm?ta(e.estimated_et_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.average_precipitation_mm&&void 0!==e.average_precipitation_mm?ta(e.average_precipitation_mm,this.config).toFixed(1):"-"}</span
                    >
                    <span
                      >${null!==e.estimated_watering_volume_liters&&void 0!==e.estimated_watering_volume_liters?Qs(e.estimated_watering_volume_liters,this.config).toFixed(0):"-"}</span
                    >
                    <span
                      >${null!==e.average_temperature_c&&void 0!==e.average_temperature_c?function(e,t){const i=Number(e)||0;return(null==t?void 0:t.units)===yi?i:1.8*i+32}(e.average_temperature_c,this.config).toFixed(1):"-"}</span
                    >
                  </div>
                `)}
            </div>
            ${(null==s?void 0:s.calculation_method)?V`
                  <div class="calendar-info">
                    ${ai("panels.zones.labels.calculation-method",n)}:
                    ${ai(`panels.zones.labels.calculation-methods.${s.calculation_method}`,n)}
                  </div>
                `:""}`}
    </div>`}async saveToHA(e){if(!this.hass)throw new Error("Home Assistant connection not available");await ua(this.hass,e)}handleZoneFormFocus(){this.isCreatingZone=!0}handleZoneFormBlur(){var e,t,i,s;(null===(t=null===(e=this.nameInput)||void 0===e?void 0:e.value)||void 0===t?void 0:t.trim())||(null===(i=this.sizeInput)||void 0===i?void 0:i.value)||(null===(s=this.throughputInput)||void 0===s?void 0:s.value)||(this.isCreatingZone=!1)}renderTheOptions(e,t,i){if(this.hass){let s=V`<option value="" ?selected=${void 0===t}">---${ai("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map(([e,a])=>s=V`${s}
            <option
              value="${a.id}"
              ?selected="${t===a.id}"
            >
              ${i?i(a):`${a.id}: ${a.name}`}
            </option>`),s}return V``}renderZone(e,t){var i,s,a,n,r,o,l,d,h,c,u,p,g,m,v,f,_;if(!this.hass)return V``;const y=this.hass.language,w=e.state===hn.Automatic,b=e.state===hn.Disabled||e.state===hn.Automatic,$=null!=e.explanation&&e.explanation.length>0;if(null!=e.mapping){const t=this.mappings.filter(t=>t.id===e.mapping)[0];null!=t&&null!=t.data&&(e.number_of_data_points=t.data.length)}const x=ai("panels.zones.labels.states."+e.state,y),k=V`${Ks(e.duration)}
    (${Js(e.duration,e.throughput).toFixed(1)}
    ${qs(this.config,us)})`,S=null!=e.id&&this._expanded.has(e.id);return V`
      <ha-card class="zone-card">
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
                >${x}</ha-label
              >
            </div>
            ${e.state===hn.Manual?V`<div class="zone-sub">${k}</div>`:""}
          </div>
          <ha-svg-icon
            class="zone-chevron ${S?"open":""}"
            .path=${za}
          ></ha-svg-icon>
        </div>
        ${this._zoneStatus(e,y)}
        ${S?V` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${ai("panels.zones.labels.last_calculated",y)}</span
                  >
                  <span class="meta-value"
                    >${e.last_calculated?fn(e.last_calculated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${ai("panels.zones.labels.data-last-updated",y)}</span
                  >
                  <span class="meta-value"
                    >${e.last_updated?fn(e.last_updated).format("YYYY-MM-DD HH:mm"):"—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${ai("panels.zones.labels.data-number-of-data-points",y)}</span
                  >
                  <span class="meta-value"
                    >${null!==(i=e.number_of_data_points)&&void 0!==i?i:"—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(ai("panels.zones.labels.name",y),"",e.name,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[os]:i})))}
                ${this._adv(this._selectRow(ai("panels.zones.labels.calculation-method",y),V`
                      ${["from_weather","provided","fixed"].map(t=>{var i;return V`
                          <option
                            value="${t}"
                            ?selected=${(null!==(i=e.calculation_method)&&void 0!==i?i:"from_weather")===t}
                          >
                            ${ai(`panels.zones.labels.calculation-methods.${t}`,y)}
                          </option>
                        `})}
                    `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{calculation_method:i.target.value}))))}
                ${this._adv(V`<div class="setting-help">
                    ${ai(`panels.zones.labels.calculation-method-help.${null!==(s=e.calculation_method)&&void 0!==s?s:"from_weather"}`,y)}
                  </div>`)}
                ${this._engineOptions(t,e,y)}
                ${this._selectRow(this._labelWithHint("input-method",y),V`
                    <option
                      value="${js}"
                      ?selected=${(null!==(a=e.input_method)&&void 0!==a?a:js)===js}
                    >
                      ${ai("panels.zones.labels.input-methods.throughput",y)}
                    </option>
                    <option
                      value="${Is}"
                      ?selected=${e.input_method===Is}
                    >
                      ${ai("panels.zones.labels.input-methods.direct",y)}
                    </option>
                  `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ps]:i.target.value})))}
                ${e.input_method===Is?this._numRow(ai("panels.zones.labels.precipitation-rate",y),qs(this.config,Ls),e.precipitation_rate,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ls]:parseFloat(i)})),.1):V`
                      ${this._numRow(ai("panels.zones.labels.size",y),qs(this.config,ls),e.size,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ls]:parseFloat(i)})),.1)}
                      ${this._numRow(ai("panels.zones.labels.throughput",y),qs(this.config,ds),e.throughput,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ds]:parseFloat(i)})),.1)}
                      ${e.measured_throughput&&(e.measured_throughput_samples||0)>=3?V`
                            <div class="setting-help">
                              ${ai("panels.zones.labels.measured-flow-help",y)}
                              <ha-button
                                appearance="filled"
                                @click=${()=>{var t;return null===(t=this.hass)||void 0===t?void 0:t.callService(di,"use_measured_throughput",{zone_id:e.id})}}
                              >
                                ${ai("panels.zones.labels.use-measured-flow",y)}
                              </ha-button>
                            </div>
                          `:""}
                    `}
                ${this._selectRow(ai("panels.zones.labels.soil-type",y),V`
                    ${_n.map(t=>{var i;return V`
                        <option
                          value="${t}"
                          ?selected=${(null!==(i=e.soil_type)&&void 0!==i?i:"custom")===t}
                        >
                          ${ai(`panels.zones.labels.soil-types.${t}`,y)}
                        </option>
                      `})}
                  `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{soil_type:i.target.value})))}
                ${"custom"===(null!==(n=e.soil_type)&&void 0!==n?n:"custom")?this._numRow(this._labelWithHint("drainage_rate",y),qs(this.config,ws),e.drainage_rate,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ws]:parseFloat(i)})),.1):""}
                ${this._selectRow(ai("panels.zones.labels.plant-type",y),V`
                    ${yn.map(t=>{var i;return V`
                        <option
                          value="${t}"
                          ?selected=${(null!==(i=e.plant_type)&&void 0!==i?i:"custom")===t}
                        >
                          ${ai(`panels.zones.labels.plant-types.${t}`,y)}
                        </option>
                      `})}
                  `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{plant_type:i.target.value})))}
                ${"custom"===(null!==(r=e.plant_type)&&void 0!==r?r:"custom")?this._numRow(ai("panels.zones.labels.multiplier",y),"",e.multiplier,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[gs]:parseFloat(i)})),.1):this._adv(this._numRow(ai("panels.zones.labels.multiplier",y),"",e.multiplier,()=>{},.1,!0))}
                ${this._selectRow(this._labelWithHint("state",y),V`
                    <option
                      value="${hn.Automatic}"
                      ?selected=${e.state===hn.Automatic}
                    >
                      ${ai("panels.zones.labels.states.automatic",y)}
                    </option>
                    <option
                      value="${hn.Disabled}"
                      ?selected=${e.state===hn.Disabled}
                    >
                      ${ai("panels.zones.labels.states.disabled",y)}
                    </option>
                    <option
                      value="${hn.Manual}"
                      ?selected=${e.state===hn.Manual}
                    >
                      ${ai("panels.zones.labels.states.manual",y)}
                    </option>
                  `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[hs]:i.target.value,[cs]:0})))}
                ${this._selectRow(this._labelWithHint("mapping",y),this.renderTheOptions(this.mappings,e.mapping),i=>{const s=i.target.value;this.handleEditZone(t,Object.assign(Object.assign({},e),{[ms]:""===s?void 0:parseInt(s)}))})}
                ${this._numRow(this._labelWithHint("bucket",y),qs(this.config,ps),Number(e.bucket).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ps]:parseFloat(i)})),.1)}
                ${this._adv(this._numRow(this._labelWithHint("maximum-bucket",y),qs(this.config,ps),Number(e.maximum_bucket).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[_s]:parseFloat(i)})),.1))}
                ${this._adv(this._numRow(this._labelWithHint("irrigation-threshold",y),qs(this.config,ps),Number(null!==(o=e.irrigation_threshold)&&void 0!==o?o:0).toFixed(1),i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[ys]:parseFloat(i)})),.1))}
                ${this._adv(V`${this._numRow(ai("panels.zones.labels.days-between-irrigation",y),ai("panels.zones.labels.days",y),e.days_between_irrigation,i=>{const s=parseInt(i,10);this.handleEditZone(t,Object.assign(Object.assign({},e),{[$s]:isNaN(s)?null:Math.max(0,s)}))},1)}
                    <div class="setting-help">
                      ${ai("panels.zones.labels.days-between-irrigation-help",y)}
                    </div>`)}
                ${this._adv(this._cropFactorByMonth(e,t,y))}
                ${this._adv(V`${this._numRow(ai("panels.zones.labels.available-water",y),qs(this.config,ps),null!=e.available_water?Number(e.available_water).toFixed(1):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[xs]:isNaN(s)||s<=0?null:s}))},1)}
                    ${this._numRow(ai("panels.zones.labels.allowed-depletion",y),"%",null!=e.allowed_depletion?Number(e.allowed_depletion).toFixed(0):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ss]:isNaN(s)?null:Math.min(95,Math.max(5,s))}))},5)}
                    <div class="setting-help">
                      ${ai("panels.zones.labels.available-water-help",y)}
                    </div>`)}
                ${this._adv(V`${this._numRow(ai("panels.zones.labels.distribution-efficiency",y),"%",null!=e.distribution_efficiency?Number(e.distribution_efficiency).toFixed(0):"",i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[zs]:isNaN(s)?null:Math.min(100,Math.max(5,s))}))},5)}
                    <div class="setting-help">
                      ${ai("panels.zones.labels.distribution-efficiency-help",y)}
                    </div>`)}
                ${this._numRow(ai("panels.zones.labels.et-deficiency",y),qs(this.config,ps),null!=e.et_deficiency?Number(e.et_deficiency).toFixed(2):"",()=>{},.01,!0)}
                <div class="setting-help">
                  ${ai("panels.zones.labels.et-deficiency-help",y)}
                </div>
                ${(null===(l=this.config)||void 0===l?void 0:l.observed_watering_enabled)||(null===(d=this.config)||void 0===d?void 0:d.direct_valve_control_enabled)?this._entityRow(ai("panels.zones.labels.linked-entity",y),ai("panels.zones.labels.optional",y),e.linked_entity,(null===(h=this.config)||void 0===h?void 0:h.full_controller)?["switch","valve","input_boolean","binary_sensor","light","cover"]:["switch","valve","input_boolean","binary_sensor"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[bs]:i||void 0})),ai("panels.zones.labels.linked-entity-hint",y)):""}
                ${(null===(c=this.config)||void 0===c?void 0:c.full_controller)&&e.linked_entity?this._entitiesRows(ai("panels.zones.labels.extra-valves",y),ai("panels.zones.labels.extra-valves-hint",y),e.extra_entities||[],["switch","valve","input_boolean","light","cover"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Os]:i}))):""}
                ${(null===(u=this.config)||void 0===u?void 0:u.full_controller)&&((null===(p=this.config)||void 0===p?void 0:p.supplies)||[]).length?this._selectRow(ai("panels.zones.labels.supply",y),V`
                        <option value="" ?selected=${!e.supply_id}>
                          ${ai("panels.zones.labels.supply-none",y)}
                        </option>
                        ${((null===(g=this.config)||void 0===g?void 0:g.supplies)||[]).map(t=>V`
                            <option
                              value=${t.id||""}
                              ?selected=${e.supply_id===t.id}
                            >
                              ${t.name}
                            </option>
                          `)}
                      `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ms]:i.target.value||null}))):""}
                ${(null===(m=this.config)||void 0===m?void 0:m.direct_valve_control_enabled)&&e.linked_entity?this._adv(V`
                      ${this._numRow(ai("panels.zones.labels.confirm-timeout",y),"s",e.confirm_timeout,i=>{const s=parseFloat(i);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Es]:isNaN(s)?null:Math.min(600,Math.max(1,s))}))},1)}
                      ${this._numRow(ai("panels.zones.labels.open-resends",y),"",e.open_resends,i=>{const s=parseInt(i,10);this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ds]:isNaN(s)?null:Math.min(10,Math.max(0,s))}))},1)}
                      <div class="setting-help">
                        ${ai("panels.zones.labels.confirm-timeout-help",y)}
                      </div>
                      ${this._textRow(ai("panels.zones.labels.safety-off-topic",y),ai("panels.zones.labels.optional",y),e.safety_off_topic,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ts]:i||void 0})))}
                      ${e.safety_off_topic?this._textRow(ai("panels.zones.labels.safety-off-state-key",y),"",e.safety_off_state_key,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[As]:i||void 0}))):""}
                      ${this._selectRow(ai("panels.zones.labels.safety-off-mode",y),V`
                          ${["auto","zha","off"].map(t=>V`
                              <option
                                value=${t}
                                ?selected=${(e.safety_off_mode||"auto")===t}
                              >
                                ${ai(`panels.zones.labels.safety-off-mode-${t}`,y)}
                              </option>
                            `)}
                        `,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Cs]:i.target.value})))}
                      <div class="setting-help">
                        ${ai("panels.zones.labels.safety-off-topic-help",y)}
                      </div>
                      <div class="setting-help">
                        ${ai("panels.zones.labels.safety-off-mode-help",y)}
                      </div>
                    `):""}
                ${this._adv((null===(v=this.config)||void 0===v?void 0:v.observed_watering_enabled)&&e.linked_entity?this._entityRow(ai("panels.zones.labels.flow-sensor",y),ai("panels.zones.labels.optional",y),e.flow_sensor,["sensor"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Hs]:i||void 0})),ai("panels.zones.labels.flow-sensor-hint",y)):"")}
                ${this._adv(this._entityRow(ai("panels.zones.labels.soil-moisture-sensor",y),ai("panels.zones.labels.optional",y),e.soil_moisture_sensor,["sensor"],i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ns]:i||void 0})),ai("panels.zones.labels.soil-moisture-sensor-hint",y)))}
                ${e.soil_moisture_sensor?this._numRow(ai("panels.zones.labels.soil-moisture-threshold",y),"%",null!==(f=e.soil_moisture_threshold)&&void 0!==f?f:50,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Rs]:parseFloat(i)})),1):""}
                ${this._adv(this._numRow(ai("panels.zones.labels.lead-time",y),"s",e.lead_time,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[vs]:parseInt(i,10)})),1))}
                ${this._adv(this._numRow(ai("panels.zones.labels.maximum-duration",y),"s",e.maximum_duration,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[fs]:parseInt(i,10)})),1))}
                ${this._numRow(ai("panels.zones.labels.duration",y),"s",e.duration,i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[cs]:parseInt(i,10)})),1,b)}
                ${b?V`<div class="setting-help">
                      ${ai(e.state===hn.Disabled?"panels.zones.labels.duration-readonly-disabled":"panels.zones.labels.duration-readonly-automatic",y)}
                    </div>`:""}
              </div>

              <div class="zone-actions">
                ${w?V`
                      ${this._actionBtn(ka,ai("panels.zones.actions.calculate",y),()=>this.handleCalculateZone(t))}
                      ${this._actionBtn(Pa,ai("panels.zones.actions.update",y),()=>this.handleUpdateZone(t))}
                    `:""}
                ${(null===(_=this.config)||void 0===_?void 0:_.direct_valve_control_enabled)&&e.linked_entity&&e.state!==hn.Disabled?this._actionBtn("M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",ai("panels.zones.actions.water",y),()=>this._waterZone(e)):""}
                ${this._actionBtn(Ea,ai("panels.zones.actions.reset-bucket",y),async()=>{await this._ask("confirm.reset_bucket",e.name)&&this.handleEditZone(t,Object.assign(Object.assign({},e),{[ps]:0}))})}
                ${null!=e.mapping?this._actionBtn(Ma,ai("panels.zones.actions.view-weather-info",y),()=>this.handleViewWeatherInfo(t)):""}
                ${this._actionBtn("M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",ai("panels.zones.actions.view-watering-calendar",y),()=>this.handleViewWateringCalendar(t))}
                ${$?this._actionBtn("M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",ai("panels.zones.actions.information",y),()=>this.toggleExplanation(t)):""}
                ${this._actionBtn(Oa,ai("common.actions.delete",y),e=>this.handleRemoveZone(e,t),!0)}
              </div>

              ${$?V`<label class="hidden" id="calcresults${t}"
                    >${Ws("<br/>"+e.explanation)}</label
                  >`:""}
              <div id="calendar-section-${e.id}" hidden>
                ${this.renderWateringCalendar(e)}
              </div>
              <div id="weather-section-${e.id}" hidden>
                ${this.renderWeatherRecords(e)}
              </div>
            </div>`:""}
      </ha-card>
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
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return V`
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
            .path=${Ca}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ha}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
          ></ha-icon-button>
        </div>
      </div>
    `}_labelWithHint(e,t){return V`${ai(`panels.zones.labels.${e}`,t)}
      <div class="setting-hint">
        ${ai(`panels.zones.labels.${e}-hint`,t)}
      </div>`}_selectRow(e,t,i){return V`
      <div class="setting-row">
        <div class="setting-label">${e}</div>
        <div class="select-wrap">
          <select class="field" @change=${i}>
            ${t}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Aa}></path>
          </svg>
        </div>
      </div>
    `}_entityRow(e,t,i,s,a,n){return V`
      <div class="setting-row">
        <div class="setting-label">
          ${e}${t?V` <span class="unit">(${t})</span>`:""}
          ${n?V`<div class="setting-hint">${n}</div>`:""}
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
    `}_entitiesRows(e,t,i,s,a){return V`${[...i,""].map((n,r)=>V`
        <div class="setting-row">
          <div class="setting-label">
            ${0===r?V`${e}
                ${t?V`<div class="setting-hint">${t}</div>`:""}`:""}
          </div>
          <ha-entity-picker
            class="entity-field"
            .hass=${this.hass}
            .value=${n}
            .includeDomains=${s}
            allow-custom-entity
            @value-changed=${e=>{var t;const s=((null===(t=e.detail)||void 0===t?void 0:t.value)||"").trim(),n=[...i];r<n.length?s?n[r]=s:n.splice(r,1):s&&n.push(s),a(n.filter((e,t)=>e&&n.indexOf(e)===t))}}
          ></ha-entity-picker>
        </div>
      `)}`}_actionBtn(e,t,i,s=!1,a=!1){return V`
      <ha-button
        appearance=${s?"outlined":"filled"}
        variant=${s?"danger":"brand"}
        ?disabled=${a}
        @click=${i}
      >
        <ha-svg-icon slot="start" .path=${e}></ha-svg-icon>
        ${t}
      </ha-button>
    `}toggleExplanation(e){var t;const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);i&&("hidden"!=i.className?i.className="hidden":i.className="explanation")}render(){return this.hass?this.isLoading?V`
        <ha-card header="${ai("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${ai("common.loading-messages.general",this.hass.language)}...
          </div>
        </ha-card>
      `:V`
      <ha-card header="${ai("panels.zones.title",this.hass.language)}">
        <div class="card-content">
          ${ai("panels.zones.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${ai("panels.zones.cards.add-zone.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("panels.zones.labels.name",this.hass.language)}
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
              ${ai("panels.zones.labels.size",this.hass.language)}
              <span class="unit">(${qs(this.config,ls)})</span>
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
              ${ai("panels.zones.labels.throughput",this.hass.language)}
              <span class="unit"
                >(${qs(this.config,ds)})</span
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
              <ha-svg-icon slot="start" .path=${Ha}></ha-svg-icon>
              ${this.isSaving?ai("common.saving-messages.adding",this.hass.language):ai("panels.zones.cards.add-zone.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${ln(this.zones,e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name},(e,t)=>this.renderZone(e,t))}

      <ha-card
        header="${ai("panels.zones.cards.zone-actions.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(ka,ai("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language),()=>this.handleCalculateAllZones(),!1,this.isSaving)}
            ${this._actionBtn(Pa,ai("panels.zones.cards.zone-actions.actions.update-all",this.hass.language),()=>this.handleUpdateAllZones(),!1,this.isSaving)}
            ${this._actionBtn(Ea,ai("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language),()=>this.handleResetAllBuckets(),!1,this.isSaving)}
            ${this._actionBtn(Ma,ai("panels.zones.cards.zone-actions.actions.clear-all-weatherdata",this.hass.language),()=>this.handleClearAllWeatherdata(),!1,this.isSaving)}
          </div>
        </div>
      </ha-card>
    `:V``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.zoneCache.clear(),this.isCreatingZone=!1}static get styles(){return l`
      ${Ua}

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
    `}};i([ve()],wn.prototype,"config",void 0),i([ve({type:Array})],wn.prototype,"zones",void 0),i([ve({type:Array})],wn.prototype,"modules",void 0),i([ve({type:Array})],wn.prototype,"mappings",void 0),i([ve({type:Map})],wn.prototype,"wateringCalendars",void 0),i([ve({type:Map})],wn.prototype,"weatherRecords",void 0),i([ve({type:Map})],wn.prototype,"plannedDurations",void 0),i([ve({type:Boolean})],wn.prototype,"isLoading",void 0),i([ve({type:Boolean})],wn.prototype,"isSaving",void 0),i([ve({type:Boolean})],wn.prototype,"isCreatingZone",void 0),i([_e("#nameInput")],wn.prototype,"nameInput",void 0),i([_e("#sizeInput")],wn.prototype,"sizeInput",void 0),i([_e("#throughputInput")],wn.prototype,"throughputInput",void 0),wn=i([pe("smart-irrigation-view-zones")],wn);let bn=class extends(ba(ce)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[],this.isLoading=!0,this.isSaving=!1,this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this._updateScheduled=!1,this.globalDebounceTimer=null,this.moduleCache=new Map,this._expanded=new Set,this.debouncedSave=(()=>{let e=null;return t=>{e&&clearTimeout(e),e=window.setTimeout(()=>{this._suppressNextConfigUpdate=!0,this.saveToHA(t).catch(()=>{this._suppressNextConfigUpdate=!1}),e=null},500)}})()}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:di+"_config_updated"})]}async _fetchData(){if(this.hass){this._hasLoadedOnce||(this.isLoading=!0,this._scheduleUpdate());try{const[e,t,i,s]=await Promise.all([da(this.hass),ca(this.hass),pa(this.hass),ga(this.hass)]);this.config=e,this.zones=t,this.modules=i,this.allmodules=s,this.moduleCache.clear()}catch(e){console.error("Error fetching data:",e)}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}}async handleAddModule(){var e,t;if((null===(t=null===(e=this.moduleInput)||void 0===e?void 0:e.selectedOptions)||void 0===t?void 0:t[0])&&!this.isSaving){this.isSaving=!0,this._scheduleUpdate();try{const e=this.moduleInput.selectedOptions[0].text,t=this.allmodules.find(t=>t.name===e);if(!t)return;const i={name:e,description:t.description,config:t.config,schema:t.schema};this.modules=[...this.modules,i],this.moduleCache.clear(),this._scheduleUpdate(),await this.saveToHA(i),await this._fetchData()}catch(e){console.error("Error adding module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}}}async handleRemoveModule(e,t){var i,s,a,n;if(this.isSaving)return;const r=ai("confirm.delete_module",null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en").replace("{name}",null!==(n=null===(a=this.modules[t])||void 0===a?void 0:a.name)&&void 0!==n?n:"");if(await La(this.hass,{text:r,destructive:!0})){this.isSaving=!0,this._scheduleUpdate();try{const e=this.modules[t],i=null==e?void 0:e.id;this.modules;this.modules=this.modules.filter((e,i)=>i!==t),this.moduleCache.clear(),this._scheduleUpdate(),this.hass&&void 0!==i&&await(o=this.hass,l=i.toString(),o.callApi("POST",di+"/modules",{id:l,remove:!0}))}catch(e){console.error("Error removing module:",e),await this._fetchData()}finally{this.isSaving=!1,this._scheduleUpdate()}var o,l}}async saveToHA(e){var t,i;if(this.hass)try{await(t=this.hass,i=e,t.callApi("POST",di+"/modules",i))}catch(e){throw console.error("Error saving module:",e),e}}renderModule(e,t){var i,s;if(!this.hass)return V``;const a=this.zones.filter(t=>t.module===e.id).length,n=null!==(i=e.id)&&void 0!==i?i:t,r=this._expanded.has(n),o=e.description||(null===(s=this.allmodules.find(t=>t.name===e.name))||void 0===s?void 0:s.description)||"",l=`module-${e.id||t}-${r?"open":"closed"}-${JSON.stringify(e)}`;if(this.moduleCache.has(l))return this.moduleCache.get(l);const d=V`
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
            .path=${za}
          ></ha-svg-icon>
        </div>
        ${r?V` <div class="si-body">
              <div class="moduleconfig">
                <label class="subheader"
                  >${ai("panels.modules.cards.module.labels.configuration",this.hass.language)}
                  (*
                  ${ai("panels.modules.cards.module.labels.required",this.hass.language)})</label
                >
                <div class="settings">
                  ${e.schema?Object.entries(e.schema).filter(([,t])=>{var i;return!(null!==(i=e.idle_options)&&void 0!==i?i:[]).includes(null==t?void 0:t.name)}).map(([e])=>this.renderConfig(t,e)):null}
                </div>
              </div>
              ${a?V`<div class="weather-note">
                    ${ai("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}
                  </div>`:V`<div class="si-actions">
                    ${this._actionBtn(Oa,ai("common.actions.delete",this.hass.language),e=>this.handleRemoveModule(e,t),!0)}
                  </div>`}
            </div>`:""}
      </ha-card>
    `;return this.moduleCache.set(l,d),d}renderConfig(e,t){const i=Object.values(this.modules).at(e);if(!i||!this.hass)return;const s=i.schema[t],a=s.name,n=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(a);let r="";null==i.config&&(i.config=[]),a in i.config&&(r=i.config[a]);const o=s.required?`${n} *`:null!=n?n:"";if("boolean"==s.type)return V`
        <div class="setting-row">
          <div class="setting-label">${o}</div>
          <input
            type="checkbox"
            id="${a+e}"
            .checked=${r}
            @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t.target.checked})}))}"
          />
        </div>
      `;if("float"==s.type||"integer"==s.type)return this._numRow(o,"",i.config[a],t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t})})),1);if("string"==s.type)return this._textRow(o,"",r,t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t})})));if("select"==s.type){const t=this.hass.language,n=V`
        ${Object.entries(s.options).map(([e,i])=>V`<option
              value="${Vs(i,0)}"
              ?selected="${r===Vs(i,0)}"
            >
              ${ai("panels.modules.cards.module.translated-options."+Vs(i,1),t)}
            </option>`)}
      `;return this._selectRow(o,n,t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[a]:t.target.value})})))}return V``}_textRow(e,t,i,s){return V`
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
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return V`
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
            .path=${Ca}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ha}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
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
            <path d=${Aa}></path>
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
    `}handleEditConfig(e,t){this.modules=Object.values(this.modules).map((i,s)=>s===e?t:i),this.moduleCache.clear(),this._scheduleUpdate(),this.debouncedSave(t)}renderOption(e,t){return this.hass?V`<option value="${e}>${t}</option>`:V``}render(){return this.hass?V`
      <ha-card header="${ai("panels.modules.title",this.hass.language)}">
        <div class="card-content">
          ${ai("panels.modules.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${ai("panels.modules.cards.add-module.header",this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading?V`<div class="loading-indicator">
                ${ai("common.loading-messages.general",this.hass.language)}
              </div>`:V`
                <div class="setting-row">
                  <div class="setting-label">
                    ${ai("common.labels.module",this.hass.language)}
                  </div>
                  <div class="select-wrap">
                    <select
                      id="moduleInput"
                      class="field"
                      ?disabled="${this.isSaving}"
                    >
                      ${Object.entries(this.allmodules).map(([e,t])=>V`<option value="${t.id}">
                            ${t.name}
                          </option>`)}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Aa}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${Ha}></ha-svg-icon>
                    ${this.isSaving?ai("common.saving-messages.adding",this.hass.language):ai("panels.modules.cards.add-module.actions.add",this.hass.language)}
                  </ha-button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading?V`<div class="loading-indicator">
            ${ai("common.loading-messages.modules",this.hass.language)}
          </div>`:ln(this.modules,e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name},(e,t)=>this.renderModule(e,t))}
    `:V``}disconnectedCallback(){super.disconnectedCallback(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.moduleCache.clear()}static get styles(){return l`
      ${Ua} ${Wa} /* View-specific styles only - most common styles are now in globalStyle */
    `}};i([ve()],bn.prototype,"config",void 0),i([ve({type:Array})],bn.prototype,"zones",void 0),i([ve({type:Array})],bn.prototype,"modules",void 0),i([ve({type:Array})],bn.prototype,"allmodules",void 0),i([ve({type:Boolean})],bn.prototype,"isLoading",void 0),i([ve({type:Boolean})],bn.prototype,"isSaving",void 0),i([_e("#moduleInput")],bn.prototype,"moduleInput",void 0),bn=i([pe("smart-irrigation-view-modules")],bn);let $n=class extends(ba(ce)){constructor(){super(...arguments),this.zones=[],this.mappings=[],this.weatherRecords=new Map,this.isLoading=!0,this.isSaving=!1,this.newMappingName="",this._hasLoadedOnce=!1,this._suppressNextConfigUpdate=!1,this.debounceTimers=new Map,this._pendingMappings=new Map,this.globalDebounceTimer=null,this.showAllMappings=!1,this.mappingCache=new Map,this._updateScheduled=!1,this._lastUpdateTime=0,this._updateThrottleDelay=16,this._expanded=new Set,this.modules=[]}_scheduleUpdate(){if(this._updateScheduled)return;const e=performance.now()-this._lastUpdateTime;e<this._updateThrottleDelay?setTimeout(()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()},this._updateThrottleDelay-e):(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this._lastUpdateTime=performance.now(),this.requestUpdate()}))}_toggleItem(e){null!=e&&(this._expanded.has(e)?this._expanded.delete(e):this._expanded.add(e),this._scheduleUpdate())}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._suppressNextConfigUpdate?this._suppressNextConfigUpdate=!1:this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:di+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this._hasLoadedOnce||(this.isLoading=!0);const[e,t,i,s]=await Promise.all([da(this.hass),ca(this.hass),ma(this.hass),pa(this.hass)]);this.config=e,this.zones=t,this.mappings=i,this.modules=s,this._fetchWeatherRecords(),this.mappingCache.clear()}catch(t){console.error("Error fetching data:",t),sa({body:{message:"Failed to load mapping data"},error:"Data fetch error"},null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("ha-card"))}finally{this.isLoading=!1,this._hasLoadedOnce=!0,this._scheduleUpdate()}}async _fetchWeatherRecords(){if(this.hass){for(const e of this.mappings)if(void 0!==e.id)try{const t=await _a(this.hass,e.id.toString(),10);this.weatherRecords.set(e.id,t)}catch(t){console.error(`Failed to fetch weather records for mapping ${e.id}:`,t),this.weatherRecords.set(e.id,[])}this._scheduleUpdate()}}renderWeatherRecords(e){if(!this.hass)return V``;const t=void 0!==e.id&&this.weatherRecords.get(e.id)||[];return V`
      <div class="weather-records">
        <h4>
          ${ai("panels.mappings.weather-records.title",this.hass.language)}
        </h4>
        ${0===t.length?V`
              <div class="weather-note">
                ${ai("panels.mappings.weather-records.no-data",this.hass.language)}
              </div>
            `:V`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${ai("panels.mappings.weather-records.timestamp",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.temperature",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.humidity",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.precipitation",this.hass.language)}</span
                  >
                  <span
                    >${ai("panels.mappings.weather-records.retrieval-time",this.hass.language)}</span
                  >
                </div>
                ${t.slice(0,10).map(e=>{let t="-",i="-";try{if(e.timestamp&&null!==e.timestamp){const i=fn(e.timestamp);i.isValid()&&(t=i.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting timestamp:",e.timestamp,t)}try{if(e.retrieval_time&&null!==e.retrieval_time){const t=fn(e.retrieval_time);t.isValid()&&(i=t.format("MM-DD HH:mm"))}}catch(t){console.warn("Error formatting retrieval_time:",e.retrieval_time,t)}return V`
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
                  `})}
              </div>
            `}
      </div>
    `}handleAddMapping(){var e;if(!this.mappingNameInput.value.trim())return;const t=!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service),i=e=>{var i;return function(e,t,i){const s=e===bi||e===Oi||e===Si||e===Ti&&Ni.includes(null!=i?i:"");return t?s?Yi:Ri:Pi}(e,t,null===(i=this.config)||void 0===i?void 0:i.weather_service)},s=Object.fromEntries([wi,bi,$i,Si,Ti,Mi,Oi,Ai,Ci].map(e=>[e,{[Wi]:i(e),[Vi]:"",[Gi]:""}])),a={name:this.mappingNameInput.value.trim(),mappings:s};this.mappings=[...this.mappings,a],this.isSaving=!0,this.saveToHA(a).then(()=>(this.mappingNameInput.value="",this.newMappingName="",this.showAllMappings=!0,this._fetchData())).catch(e=>{console.error("Failed to add mapping:",e),this.mappings=this.mappings.slice(0,-1)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()})}async handleRemoveMapping(e,t){var i,s,a;const n=this.mappings[t].id;if(null==n)return;const r=ai("confirm.delete_mapping",null!==(s=null===(i=this.hass)||void 0===i?void 0:i.language)&&void 0!==s?s:"en").replace("{name}",null!==(a=this.mappings[t].name)&&void 0!==a?a:"");if(!await La(this.hass,{text:r,destructive:!0}))return;const o=[...this.mappings];var l,d;(this.mappings=this.mappings.filter((e,i)=>i!==t),this.mappingCache.delete(n.toString()),this.hass)&&(this.isSaving=!0,(l=this.hass,d=n.toString(),l.callApi("POST",di+"/mappings",{id:d,remove:!0})).catch(e=>{console.error("Failed to delete mapping:",e),this.mappings=o,this._fetchData().catch(e=>{console.error("Failed to refresh data after delete error:",e)})}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}))}handleEditMapping(e,t){this.mappings[e]=t,t.id&&this.mappingCache.delete(t.id.toString()),void 0!==t.id&&this._pendingMappings.set(t.id,t),this.globalDebounceTimer&&clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=window.setTimeout(()=>{const e=[...this._pendingMappings.values()];this._pendingMappings.clear(),this.isSaving=!0,this._suppressNextConfigUpdate=!0,Promise.all(e.map(e=>this.saveToHA(e))).catch(e=>{this._suppressNextConfigUpdate=!1,console.error("Failed to save mapping:",e)}).finally(()=>{this.isSaving=!1,this._scheduleUpdate()}),this.globalDebounceTimer=null},500),this._scheduleUpdate()}async saveToHA(e){var t;if(!this.hass)throw new Error("Home Assistant connection not available");const i=[],s=this.hass.states;for(const t in e.mappings){const a=e.mappings[t].sensorentity;if(a&&""!==a.trim()){const n=a.trim();e.mappings[t].sensorentity=n,n in s||i.push(n)}}if(i.length>0){const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ha-card");throw e&&sa({body:{message:ai("panels.mappings.cards.mapping.errors.source_does_not_exist",this.hass.language)+": "+i.join(", ")},error:ai("panels.mappings.cards.mapping.errors.invalid_source",this.hass.language)},e),new Error("Invalid sensor entities found")}const{id:a,name:n,mappings:r,greenhouse:o}=e;await va(this.hass,{id:a,name:n,mappings:r,greenhouse:o})}consumedSources(e){var t;if(void 0===e.module||null===e.module)return null;const i=this.modules.find(t=>t.id===e.module);return null!==(t=null==i?void 0:i.consumes)&&void 0!==t?t:null}renderMapping(e,t){if(!this.hass)return V``;const i=`${e.id}_${JSON.stringify(e).slice(0,100)}`;if(this.mappingCache.has(i))return this.mappingCache.get(i);const s=this.zones.filter(t=>t.mapping===e.id).length,a=V`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${ai("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @change="${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i.target.value}))}"
            />
            <div class="setting-row">
              <div class="setting-label">
                ${ai("panels.mappings.cards.mapping.greenhouse",this.hass.language)}
              </div>
              <ha-switch
                .checked=${!!e.greenhouse}
                @change=${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:i.target.checked}))}
              ></ha-switch>
            </div>
            <div class="setting-row">
              <div class="setting-label">
                ${ai("panels.mappings.cards.mapping.module",this.hass.language)}
              </div>
              <select
                @change=${i=>{const s=i.target.value;this.handleEditMapping(t,Object.assign(Object.assign({},e),{[zi]:""===s?void 0:parseInt(s)}))}}
              >
                <option
                  value=""
                  ?selected=${void 0===e.module||null===e.module}
                >
                  ---${ai("common.labels.select",this.hass.language)}---
                </option>
                ${this.modules.map(t=>V`<option
                      value="${t.id}"
                      ?selected=${t.id===e.module}
                    >
                      ${la(t.name,this.hass.language)}
                    </option>`)}
              </select>
            </div>
            <div class="weather-note">
              ${ai(void 0===e.module||null===e.module?"panels.mappings.cards.mapping.module_undecided":"panels.mappings.cards.mapping.module_description",this.hass.language)}
            </div>
            ${e.greenhouse?V`<div class="weather-note">
                  ${ai("panels.mappings.cards.mapping.greenhouse_description",this.hass.language)}
                </div>`:""}
            ${Object.entries(e.mappings).filter(([t])=>!e.greenhouse||t!==Si&&t!==Ti).filter(([t])=>{const i=this.consumedSources(e);return null===i||i.includes(t)}).map(([e])=>this.renderMappingSetting(t,e))}
            ${s?V`<div class="weather-note">
                  ${ai("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}
                </div>`:V` <div
                  class="action-button"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${Oa}" />
                  </svg>
                  <span class="action-button-label">
                    ${ai("common.actions.delete",this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;return this.mappingCache.set(i,a),a}renderMappingSetting(e,t){var i,s;const a=this.mappings[e];if(!a||!this.hass)return V``;const n=a.mappings[t],r=t===bi?this.etUseOfZones(a.id):{provided:0,calculated:0},o=r.calculated>0&&0===r.provided,l=r.provided>0&&0===r.calculated;return V`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${ai(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`,this.hass.language)}
        </div>
        ${this.renderSourceHint(t)}
        ${this._selectRow(ai("panels.mappings.cards.mapping.source",this.hass.language),this.renderSimpleRadioOptions(e,t,n),i=>this.handleSimpleSourceChange(e,t,i))}
        ${o?V`<div class="weather-note">
              ${ai("panels.mappings.cards.mapping.et_unused",this.hass.language)}
            </div>`:""}
        ${l?V`<div class="weather-note">
              ${ai("panels.mappings.cards.mapping.et_needed",this.hass.language)}
            </div>`:""}
        ${t===Ti&&(null===(i=this.config)||void 0===i?void 0:i.use_weather_service)&&(null===(s=this.config)||void 0===s?void 0:s.weather_service)===Di&&n[Wi]===Ri?V`<div class="weather-note">
              ${ai("panels.mappings.cards.mapping.rain_not_from_entity",this.hass.language)}
            </div>`:""}
        ${this.renderMappingInputs(e,t,n)}
      </div>
    `}etUseOfZones(e){var t;let i=0,s=0;for(const a of this.zones){if(a.mapping!==e)continue;const n=null===(t=this.modules.find(e=>e.id===a.module))||void 0===t?void 0:t.name;n&&("Passthrough"===n?i+=1:s+=1)}return{provided:i,calculated:s}}renderSourceHint(e){var t,i,s;if(!this.hass)return V``;const a=ai(e===Ti&&!!(null===(t=this.config)||void 0===t?void 0:t.use_weather_service)&&Ni.includes(null!==(s=null===(i=this.config)||void 0===i?void 0:i.weather_service)&&void 0!==s?s:"")?"panels.mappings.cards.mapping.rain_hint_entity":`panels.mappings.cards.mapping.hints.${e.toLowerCase()}`,this.hass.language);return a?V`<div class="setting-hint">${a}</div>`:V``}renderSimpleRadioOptions(e,t,i){var s;if(!this.hass||!this.config)return V``;const a=t===bi||t===Oi,n=i[Wi],r=t===Si,o=this.config.weather_service===Di&&t===Ti,l=!(!this.config.use_weather_service||r||o&&n!==Ri),d=a||r||o,h=t===bi?this.etUseOfZones(null===(s=this.mappings[e])||void 0===s?void 0:s.id):{provided:0,calculated:0},c=h.provided>0&&0===h.calculated&&n!==Yi,u=a&&this.config.weather_service!==Ei;return V`
      ${l?V`<option
            value="${Ri}"
            ?selected=${n===Ri}
            ?disabled=${o}
          >
            ${ai(t===bi?"panels.mappings.cards.mapping.sources.weather_service_et":"panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${u?" (via Open-Meteo)":""}
          </option>`:""}
      ${d?V`<option
            value="${Yi}"
            ?selected=${n===Yi}
            ?disabled=${c}
          >
            ${ai(t===bi?"panels.mappings.cards.mapping.sources.none_et":"panels.mappings.cards.mapping.sources.none",this.hass.language)}
          </option>`:""}
      <option
        value="${Pi}"
        ?selected=${n===Pi}
      >
        ${ai(t===Oi?"panels.mappings.cards.mapping.sources.radiation_sensor":"panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </option>
      ${t===Oi?V`<option
            value="${Ii}"
            ?selected=${n===Ii}
          >
            ${ai("panels.mappings.cards.mapping.sources.illuminance",this.hass.language)}
          </option>`:""}
      <option
        value="${ji}"
        ?selected=${n===ji}
      >
        ${ai("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </option>
    `}handleSimpleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Wi]:a,[Vi]:""})})}))}handleSimpleInputChange(e,t,i,s){const a=this.mappings[e],n=s.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},a),{mappings:Object.assign(Object.assign({},a.mappings),{[t]:Object.assign(Object.assign({},a.mappings[t]),{[i]:n})})}))}renderSourceOptions(e,t,i){var s;if(!this.hass)return V``;const a=`${t}_${e}`,n=t===bi||t===Oi,r=!!(null===(s=this.config)||void 0===s?void 0:s.use_weather_service);return V`
      <div class="mappingsettingline">
        <label for="${a}_source">
          ${ai("panels.mappings.cards.mapping.source",this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${r?this.renderWeatherServiceOption(e,t,i):""}
        ${n?this.renderNoneOption(e,t,i):""}
        ${this.renderSensorOption(e,t,i)}
        ${this.renderStaticValueOption(e,t,i)}
      </div>
    `}renderWeatherServiceOption(e,t,i){if(!this.hass||!this.config)return V``;const s=`${t}_${e}`,a=!this.config.use_weather_service,n=this.config.use_weather_service&&i[Wi]===Ri,r=(t===bi||t===Oi)&&this.config.weather_service!==Ei;return V`
      <label class="${a?"strikethrough":""}">
        <input
          type="radio"
          id="${s}_weather"
          value="${Ri}"
          name="${s}_source"
          ?checked="${n}"
          ?disabled="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${ai("panels.mappings.cards.mapping.sources.weather_service",this.hass.language)}${r?" (via Open-Meteo)":""}
      </label>
    `}renderNoneOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Wi]===Yi;return V`
      <label>
        <input
          type="radio"
          id="${s}_none"
          value="${Yi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${ai("panels.mappings.cards.mapping.sources.none",this.hass.language)}
      </label>
    `}renderSensorOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Wi]===Pi;return V`
      <label>
        <input
          type="radio"
          id="${s}_sensor"
          value="${Pi}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${ai("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}
      </label>
    `}renderStaticValueOption(e,t,i){if(!this.hass)return V``;const s=`${t}_${e}`,a=i[Wi]===ji;return V`
      <label>
        <input
          type="radio"
          id="${s}_static"
          value="${ji}"
          name="${s}_source"
          ?checked="${a}"
          @change="${i=>this.handleSourceChange(e,t,i)}"
        />
        ${ai("panels.mappings.cards.mapping.sources.static",this.hass.language)}
      </label>
    `}handleSourceChange(e,t,i){const s=this.mappings[e],a=i.target.value;this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Wi]:a,[Vi]:""})})}))}renderMappingInputs(e,t,i){if(!this.hass)return V``;const s=i[Wi];return V`
      ${s===Pi||s===Ii?this.renderSensorInput(e,t,i):""}
      ${s===ji?this.renderStaticValueInput(e,t,i):""}
      ${s===Pi||s===ji?this.renderUnitSelect(e,t,i):""}
      ${t!==Mi||s!==Pi&&s!==ji?"":this.renderPressureTypeSelect(e,t,i)}
      ${t===Ci&&s===Pi?this.renderWindHeightInput(e,t,i):""}
      ${s===Pi||s===Ii?this.renderAggregateSelect(e,t,i):""}
    `}renderWindHeightInput(e,t,i){var s;return this.hass?this._numRow(ai("panels.mappings.cards.mapping.wind_height",this.hass.language),"m",null!==(s=i[Ui])&&void 0!==s?s:"",i=>{const s=this.mappings[e],a=parseFloat(i);this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Ui]:Number.isFinite(a)?a:null})})}))},.5):V``}renderSensorInput(e,t,i){return this.hass?V`
      <div class="setting-row">
        <div class="setting-label">
          ${ai("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${i[Vi]||""}
          allow-custom-entity
          @value-changed=${i=>{var s;return this.handleSensorChange(e,t,{target:{value:(null===(s=i.detail)||void 0===s?void 0:s.value)||""}})}}
        ></ha-entity-picker>
      </div>
    `:V``}renderStaticValueInput(e,t,i){return this.hass?this._numRow(ai("panels.mappings.cards.mapping.static_value",this.hass.language),"",i[Zi]||"",i=>this.handleStaticValueChange(e,t,{target:{value:i}}),.1):V``}renderUnitSelect(e,t,i){if(!this.hass||!this.config)return V``;const s=this.reportedUnit(t,i);return!s||i[Gi]&&i[Gi]!==s?this._selectRow(ai("panels.mappings.cards.mapping.input-units",this.hass.language),this.renderUnitOptionsForMapping(t,i),i=>this.handleUnitChange(e,t,i)):V``}reportedUnit(e,t){var i,s,a,n,r;if(t[Wi]!==Pi)return;const o=(t[Vi]||"").trim(),l=null===(n=null===(a=null===(s=null===(i=this.hass)||void 0===i?void 0:i.states)||void 0===s?void 0:s[o])||void 0===a?void 0:a.attributes)||void 0===n?void 0:n.unit_of_measurement;if(!l)return;const d=null!==(r={"W/m²":"W/m2","m/s":"meter/s",mph:"mile/h",kn:"knot",inHg:"inch Hg",mbar:"millibar"}[l])&&void 0!==r?r:l;return ia(e).some(e=>e.unit===d)?d:void 0}renderPressureTypeSelect(e,t,i){return this.hass?this._selectRow(ai("panels.mappings.cards.mapping.pressure-type",this.hass.language),this.renderPressureTypes(t,i),i=>this.handlePressureTypeChange(e,t,i)):V``}renderAggregateSelect(e,t,i){var s;return this.hass?"advanced"!==(null===(s=this.config)||void 0===s?void 0:s.ui_mode)?V``:V`
      <div class="setting-row">
        <div class="setting-label">
          ${ai("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${i=>this.handleAggregateChange(e,t,i)}"
          >
            ${this.renderAggregateOptionsForMapping(t,i)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${Aa}></path>
          </svg>
        </div>
      </div>
    `:V``}handleSensorChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Vi]:i.target.value})})}))}handleStaticValueChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Zi]:i.target.value})})}))}handleUnitChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Gi]:i.target.value})})}))}handlePressureTypeChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[Li]:i.target.value})})}))}handleAggregateChange(e,t,i){const s=this.mappings[e];this.handleEditMapping(e,Object.assign(Object.assign({},s),{mappings:Object.assign(Object.assign({},s.mappings),{[t]:Object.assign(Object.assign({},s.mappings[t]),{[qi]:i.target.value})})}))}renderAggregateOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;let i="average";return e===Si&&(i="delta"),e===Ti&&(i="average"),t[qi]&&(i=t[qi]),V`
      ${Ki.map(e=>this.renderAggregateOption(e,i))}
    `}renderAggregateOption(e,t){if(this.hass&&this.config){return V`<option value="${e}" ?selected="${e===t}">
        ${ai("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return V``}renderPressureTypes(e,t){if(this.hass&&this.config){let e=V``;const i=t[Li];return e=V`${e}
        <option
          value="${Fi}"
          ?selected="${i===Fi}"
        >
          ${ai("panels.mappings.cards.mapping.pressure_types."+Fi,this.hass.language)}
        </option>
        <option
          value="${Bi}"
          ?selected="${i===Bi}"
        >
          ${ai("panels.mappings.cards.mapping.pressure_types."+Bi,this.hass.language)}
        </option>`,e}return V``}renderUnitOptionsForMapping(e,t){if(!this.hass||!this.config)return V``;const i=ia(e);let s=t[Gi];const a=this.config.units;if(!t[Gi])for(const e of i)if("string"==typeof e.system){if(a===e.system){s=e.unit;break}}else{for(const t of e.system)if(a===t.system){s=e.unit;break}if(s===e.unit)break}return V`
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
    `}_numRow(e,t,i,s,a=1,n=!1){const r=(String(a).split(".")[1]||"").length,o=(e,t)=>{const i=parseFloat(e.value),n=+((isNaN(i)?0:i)+t*a).toFixed(r);e.value=String(n),s(String(n))};return V`
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
            .path=${Ca}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),-1)}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${Ha}
            ?disabled=${n}
            @click=${e=>o(e.currentTarget.parentElement.querySelector("input"),1)}
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
            <path d=${Aa}></path>
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
    `}render(){return this.hass?this.isLoading?V`
        <ha-card
          header="${ai("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${ai("common.loading-messages.general",this.hass.language)}
          </div>
        </ha-card>
      `:V`
      <ha-card
        header="${ai("panels.mappings.title",this.hass.language)}"
      >
        <div class="card-content">
          ${ai("panels.mappings.description",this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${ai("panels.mappings.cards.add-mapping.header",this.hass.language)}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("panels.mappings.labels.mapping-name",this.hass.language)}
            </div>
            <input
              id="mappingNameInput"
              class="field"
              type="text"
              @input=${e=>{this.newMappingName=e.target.value}}
            />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving||!this.newMappingName.trim()}"
            >
              <ha-svg-icon slot="start" .path=${Ha}></ha-svg-icon>
              ${this.isSaving?ai("common.saving-messages.adding",this.hass.language):ai("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `:V``}renderMappingsList(){const{shown:e,hidden:t}=function(e,t,i=10){const s=t?e:e.slice(0,i);return{shown:s,hidden:e.length-s.length}}(this.mappings,this.showAllMappings);return V`
      ${ln(e,e=>{var t;return null!==(t=e.id)&&void 0!==t?t:e.name},(e,t)=>this.renderMappingCard(e,t))}
      ${t>0?V`
            <div class="si-form-actions">
              ${this._actionBtn(Ha,ai("panels.mappings.labels.show-more",this.hass.language,"{count}",t),()=>this.loadMoreMappings())}
            </div>
          `:""}
    `}renderMappingCard(e,t){if(!this.hass)return V``;const i=this.hass.language,s=this.zones.filter(t=>t.mapping===e.id).length,a=(e,t)=>ai(`panels.mappings.summary.${t}-${1===e?"one":"other"}`,i).replace("{n}",String(e)),n=[a(Object.values(e.mappings||{}).filter(e=>{const t="string"==typeof e?e:null==e?void 0:e.source;return!!t&&t!==Yi}).length,"sources")];s&&n.push(a(s,"zones"));const r=n.join(" · "),o=null!=e.id&&this._expanded.has(e.id);return V`
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
            .path=${za}
          ></ha-svg-icon>
        </div>
        ${o?V`<div class="si-body">
              <div class="settings">
                ${this._textRow(ai("panels.mappings.labels.mapping-name",i),"",e.name,i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i})))}
                <div class="setting-row">
                  <div class="setting-label">
                    ${ai("panels.mappings.cards.mapping.greenhouse",i)}
                  </div>
                  <ha-switch
                    .checked=${!!e.greenhouse}
                    @change=${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{greenhouse:i.target.checked}))}
                  ></ha-switch>
                </div>
                ${e.greenhouse?V`<div class="weather-note">
                      ${ai("panels.mappings.cards.mapping.greenhouse_description",i)}
                    </div>`:""}
                ${this.renderMappingSettings(e,t)}
              </div>
              ${this.renderWeatherRecords(e)}
              <div class="si-actions">
                ${s?V`<div class="weather-note">
                      ${ai("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",i)}
                    </div>`:this._actionBtn(Oa,ai("common.actions.delete",i),e=>this.handleRemoveMapping(e,t),!0)}
              </div>
            </div>`:""}
      </ha-card>
    `}renderMappingSettings(e,t){var i;const s="advanced"===(null===(i=this.config)||void 0===i?void 0:i.ui_mode),a=Object.entries(e.mappings).filter(([t])=>(!e.greenhouse||t!==Si&&t!==Ti)&&(s||t!==Si||!(t=>{const i=e.mappings[t],s="string"==typeof i?i:null==i?void 0:i[Wi];return!s||s===Yi})(t))),n=e.mappings[bi],r="string"==typeof n?n:null==n?void 0:n[Wi],o=!!r&&r!==Yi,l=(d=this.etUseOfZones(e.id),h=o,d.calculated+d.provided>0?0===d.calculated:h);var d,h;const c=a.filter(([e])=>!l||e===bi||e===Si||e===Ti).sort(([e],[t])=>Number(t===bi)-Number(e===bi)),u=a.length-c.length,p=this.hass.language,g=t=>this.zones.filter(t=>t.mapping===e.id).filter(e=>{var i;const s=null===(i=this.modules.find(t=>t.id===e.module))||void 0===i?void 0:i.name;return!!s&&t(s)}).map(e=>e.name).join(", "),m=o?g(e=>"Passthrough"!==e):"",v=o?"":g(e=>"Passthrough"===e);return V`
      ${c.map(([e])=>this.renderMappingSetting(t,e))}
      ${u>0?V`<div class="weather-note">
            ${ai("panels.mappings.cards.mapping.hidden_sources",p).replace("{n}",String(u))}
          </div>`:""}
      ${m?V`<div class="weather-note">
            ${ai("panels.mappings.cards.mapping.et_ignored",p).replace("{zones}",m)}
          </div>`:""}
      ${v?V`<div class="weather-note">
            ${ai("panels.mappings.cards.mapping.et_missing",p).replace("{zones}",v)}
          </div>`:""}
    `}loadMoreMappings(){this.showAllMappings=!0,this._scheduleUpdate()}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}disconnectedCallback(){super.disconnectedCallback(),this.debounceTimers.forEach(e=>{clearTimeout(e)}),this.debounceTimers.clear(),this.globalDebounceTimer&&(clearTimeout(this.globalDebounceTimer),this.globalDebounceTimer=null),this.mappingCache.clear()}};i([ve()],$n.prototype,"config",void 0),i([ve({type:Array})],$n.prototype,"zones",void 0),i([ve({type:Array})],$n.prototype,"mappings",void 0),i([ve({type:Map})],$n.prototype,"weatherRecords",void 0),i([ve({type:Boolean})],$n.prototype,"isLoading",void 0),i([ve({type:Boolean})],$n.prototype,"isSaving",void 0),i([ve({type:String})],$n.prototype,"newMappingName",void 0),i([ve({type:Array})],$n.prototype,"modules",void 0),i([_e("#mappingNameInput")],$n.prototype,"mappingNameInput",void 0),$n=i([pe("smart-irrigation-view-mappings")],$n);const xn=()=>{const e=e=>{let t={};for(let i=0;i<e.length;i+=2){const s=e[i],a=i<e.length?e[i+1]:void 0;t=Object.assign(Object.assign({},t),{[s]:a})}return t},t=window.location.pathname.split("/");let i={page:t[2]||"info",params:{}};if(t.length>3){let s=t.slice(3);if(t.includes("filter")){const t=s.findIndex(e=>"filter"==e),a=s.slice(t+1);s=s.slice(0,t),i=Object.assign(Object.assign({},i),{filter:e(a)})}s.length&&(s.length%2&&(i=Object.assign(Object.assign({},i),{subpage:s.shift()})),s.length&&(i=Object.assign(Object.assign({},i),{params:e(s)})))}return i},kn=(e,...t)=>{let i={page:e,params:{}};t.forEach(e=>{"string"==typeof e?i=Object.assign(Object.assign({},i),{subpage:e}):"params"in e?i=Object.assign(Object.assign({},i),{params:e.params}):"filter"in e&&(i=Object.assign(Object.assign({},i),{filter:e.filter}))});const s=e=>{let t=Object.keys(e);t=t.filter(t=>e[t]),t.sort();let i="";return t.forEach(t=>{const s=e[t];i=i.length?`${i}/${t}/${s}`:`${t}/${s}`}),i};let a=`/${di}/${i.page}`;return i.subpage&&(a=`${a}/${i.subpage}`),s(i.params).length&&(a=`${a}/${s(i.params)}`),i.filter&&(a=`${a}/filter/${s(i.filter)}`),a},Sn={[Ai]:{unit:es,decimals:1},[ki]:{unit:es,decimals:1},[xi]:{unit:es,decimals:1},[wi]:{unit:es,decimals:1},[$i]:{unit:"%",decimals:0},[Mi]:{unit:"hPa",decimals:0},[Ci]:{unit:ss,decimals:1},[Oi]:{unit:as,decimals:2},[Si]:{unit:ts,decimals:2},[Ti]:{unit:ns,decimals:2},[bi]:{unit:ts,decimals:2}};let zn=class extends ce{constructor(){super(...arguments),this._use=!1,this._service=null,this._apiKey="",this._entity="",this._loading=!0,this._saving=!1,this._error="",this._saved=!1,this._rainGroups=[],this._historyLoading=!1,this._historyError=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)}),this._load()}async _load(){if(this.hass){try{const e=await ha(this.hass);this._info=e,this._use=!!e.use_weather_service,this._service=e.weather_service||(e.services&&e.services.includes(Ei)?Ei:e.services&&e.services.length?e.services[0]:null),this._apiKey=e.weather_service_api_key||"",this._entity=e.weather_service_entity||"",this._error=""}catch(e){this._error=this._errText(e)}finally{this._loading=!1}this._loadHistory()}}async _loadHistory(){if(this.hass){this._historyLoading=!0;try{this._history=await((e,t=20)=>e.callWS({type:di+"/weatherservice_history",limit:t}))(this.hass,20),this._historyError=""}catch(e){this._historyError=this._errText(e)}finally{this._historyLoading=!1}}}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}async _save(){if(this.hass){this._saving=!0,this._error="",this._saved=!1,this._rainGroups=[];try{await(e=this.hass,t={use_weather_service:this._use,weather_service:this._use?this._service:null,weather_service_api_key:this._use?this._apiKey:null,weather_service_entity:this._use&&this._service===Di?this._entity:null},e.callWS(Object.assign({type:di+"/set_weatherservice"},t))),this._saved=!0,this._rainGroups=await this._groupsLeftWithoutRain(),window.setTimeout(()=>this._load(),800)}catch(e){this._error="invalid_entity"===(null==e?void 0:e.code)?ai("panels.weatherservice.messages.invalid-entity",this.hass.language):this._errText(e)}finally{this._saving=!1}var e,t}}get _entityMissing(){return this._use&&this._service===Di&&!this._entity}async _groupsLeftWithoutRain(){var e;if(!this.hass||!this._use||!Ni.includes(null!==(e=this._service)&&void 0!==e?e:""))return[];try{return(await ma(this.hass)).filter(e=>!e.greenhouse&&[Ti,Si].some(t=>{var i,s;return(null===(s=null===(i=e.mappings)||void 0===i?void 0:i[t])||void 0===s?void 0:s.source)===Ri})).map(e=>e.name)}catch(e){return console.error("Weather service: could not read the sensor groups",e),[]}}render(){var e;if(!this.hass)return V``;const t=this.hass.language;return this._loading&&!this._info?V`
        <ha-card header="${ai("panels.weatherservice.title",t)}">
          <div class="card-content">
            ${ai("common.loading-messages.general",t)}...
          </div>
        </ha-card>
      `:V`
      <ha-card header="${ai("panels.weatherservice.title",t)}">
        <div class="card-content ws-description">
          ${ai("panels.weatherservice.description",t)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${ai("panels.weatherservice.labels.use-weather-service",t)}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${e=>{this._use=e.target.checked,this._saved=!1}}
            ></ha-switch>
          </div>

          ${this._use?V`
                <div class="setting-row">
                  <div class="setting-label">
                    ${ai("panels.weatherservice.labels.service",t)}
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
                            ${e===Di?ai("panels.weatherservice.labels.ha-weather-entity",t):e}
                          </option>`)}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${Aa}></path>
                    </svg>
                  </div>
                </div>
                ${this._service&&Hi.includes(this._service)?"":V`<div class="setting-row">
                      <div class="setting-label">
                        ${ai("panels.weatherservice.labels.api-key",t)}
                      </div>
                      <input
                        class="field"
                        type="text"
                        autocomplete="off"
                        .value=${this._apiKey}
                        @change=${e=>{this._apiKey=e.target.value,this._saved=!1}}
                      />
                    </div>`}
                ${this._service===Di?V`<div class="setting-row">
                        <div class="setting-label">
                          ${ai("panels.weatherservice.labels.weather-entity",t)}
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
                        ${ai("panels.weatherservice.messages.ha-entity-hint",t)}
                      </div>`:""}
                ${"Open Weather Map"===this._service?V`<div class="ws-note ws-note--hint">
                      ${ai("panels.weatherservice.messages.owm-onecall-hint",t)}
                    </div>`:""}
              `:V`<div class="ws-note">
                ${ai("panels.weatherservice.messages.no-service",t)}
              </div>`}
          ${this._error?V`<div class="ws-msg ws-msg--error">${this._error}</div>`:""}
          ${this._saved?V`<div class="ws-msg ws-msg--success">
                ${ai("panels.weatherservice.messages.saved",t)}
              </div>`:""}
          ${this._saved&&this._rainGroups.length?V`<div class="ws-msg ws-msg--warning">
                ${ai("panels.weatherservice.messages.rain-groups-on-service",t,"{count}",this._rainGroups.length,"{groups}",this._rainGroups.join(", "))}
                <div class="ws-msg-actions">
                  <ha-button
                    appearance="plain"
                    @click=${()=>aa(0,kn("mappings"))}
                  >
                    ${ai("panels.weatherservice.actions.open-sensor-groups",t)}
                  </ha-button>
                </div>
              </div>`:""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving||this._entityMissing}
              @click=${this._save}
            >
              ${this._saving?ai("panels.weatherservice.actions.saving",t):ai("panels.weatherservice.actions.save",t)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${ai(this._use&&this._service===Di?"panels.weatherservice.messages.reload-note-entity":"panels.weatherservice.messages.reload-note",t)}
          </div>
        </div>
        ${this._renderHistory(t)}
      </ha-card>
    `}_renderHistory(e){var t,i;const s=(null===(t=this._history)||void 0===t?void 0:t.records)||[],a=((null===(i=this._history)||void 0===i?void 0:i.fields)||[]).filter(e=>s.some(t=>t.values&&void 0!==t.values[e]&&null!==t.values[e])),n=new Set(s.map(e=>e.mapping_name)).size>1,r=["minmax(120px, auto)",...n?["minmax(100px, auto)"]:[],...a.map(()=>"minmax(76px, 1fr)")].join(" "),o=s.length?this._formatTime(s[0]):"";return V`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <h4>${ai("panels.weatherservice.history.title",e)}</h4>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${Na}></ha-svg-icon>
            ${ai("panels.weatherservice.history.refresh",e)}
          </ha-button>
        </div>
        ${o?V`<div class="ws-note ws-history-last">
              ${ai("panels.weatherservice.history.last-update",e)}:
              ${o}
            </div>`:""}
        ${this._historyError?V`<div class="ws-msg ws-msg--error">${this._historyError}</div>`:0===s.length?V`<div class="ws-note">
                ${this._historyLoading?ai("common.loading-messages.general",e)+"...":ai("panels.weatherservice.history.no-data",e)}
              </div>`:V`
                <div class="ws-history-scroll">
                  <div
                    class="weather-table"
                    style="grid-template-columns: ${r};"
                  >
                    <div class="weather-header">
                      <span
                        >${ai("panels.weatherservice.history.time",e)}</span
                      >
                      ${n?V`<span
                            >${ai("panels.weatherservice.history.sensor-group",e)}</span
                          >`:""}
                      ${a.map(t=>{var i;return V`<span
                            >${ai("panels.mappings.cards.mapping.items."+t.toLowerCase(),e)}
                            <span class="ws-history-unit"
                              >${(null===(i=Sn[t])||void 0===i?void 0:i.unit)||""}</span
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
    `}_formatTime(e){if(!e.retrieved)return"-";const t=fn(e.retrieved);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}_formatValue(e,t){var i,s;return null==t||isNaN(t)?"-":t.toFixed(null!==(s=null===(i=Sn[e])||void 0===i?void 0:i.decimals)&&void 0!==s?s:1)}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}};i([ve()],zn.prototype,"narrow",void 0),i([ve()],zn.prototype,"path",void 0),i([fe()],zn.prototype,"_info",void 0),i([fe()],zn.prototype,"_use",void 0),i([fe()],zn.prototype,"_service",void 0),i([fe()],zn.prototype,"_apiKey",void 0),i([fe()],zn.prototype,"_entity",void 0),i([fe()],zn.prototype,"_loading",void 0),i([fe()],zn.prototype,"_saving",void 0),i([fe()],zn.prototype,"_error",void 0),i([fe()],zn.prototype,"_saved",void 0),i([fe()],zn.prototype,"_rainGroups",void 0),i([fe()],zn.prototype,"_history",void 0),i([fe()],zn.prototype,"_historyLoading",void 0),i([fe()],zn.prototype,"_historyError",void 0),zn=i([pe("smart-irrigation-view-weatherservice")],zn);const Tn=10,Mn=8,On=26,An=46;let Cn=class extends(ba(ce)){constructor(){super(...arguments),this._records=[],this._loading=!0,this._error=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial history:",e)}),[this.hass.connection.subscribeMessage(()=>{this._fetchData().catch(e=>{console.error("Failed to refresh history:",e)})},{type:di+"_config_updated"})]}async _fetchData(){if(this.hass)try{const[e,t]=await Promise.all([da(this.hass),ya(this.hass,500)]);this._config=e,this._records=(null==t?void 0:t.records)||[],this._error=""}catch(e){this._error=(null==e?void 0:e.message)||(null==e?void 0:e.code)||String(e)}finally{this._loading=!1}}_chartDays(){const e=fn().startOf("day").subtract(29,"days"),t=[];for(let i=0;i<30;i++)t.push(e.clone().add(i,"days").format("YYYY-MM-DD"));return t}_daily(e,t){const i=new Map(e.map(e=>[e,0]));for(const e of this._records){if(!e.start||t&&!t(e))continue;const s=fn(e.start);if(!s.isValid())continue;const a=s.format("YYYY-MM-DD");i.has(a)&&i.set(a,i.get(a)+Qs(e.water_used,this._config))}return e.map(e=>({key:e,value:i.get(e)}))}_chartedZones(e){const t=e[0],i=new Map;for(const e of this._records){if(!e.start)continue;const s=fn(e.start);if(!s.isValid()||s.format("YYYY-MM-DD")<t)continue;const a=null!==e.zone_id?`#${e.zone_id}`:e.zone_name||"?";i.has(a)||i.set(a,{id:e.zone_id,name:e.zone_name||a})}return[...i.values()].sort((e,t)=>e.name.localeCompare(t.name))}render(){if(!this.hass)return V``;const e=this.hass.language;if(this._loading)return V`
        <ha-card header="${ai("panels.history.title",e)}">
          <div class="card-content">
            ${ai("common.loading-messages.general",e)}...
          </div>
        </ha-card>
      `;const t=this._chartDays(),i=this._chartedZones(t);return V`
      <ha-card header="${ai("panels.history.title",e)}">
        <div class="card-content">
          <div class="history-intro">
            ${ai("panels.history.description",e)}
          </div>
          ${this._error?V`<div class="history-msg history-msg--error">
                ${this._error}
              </div>`:""}
          <div class="history-actions">
            <ha-button appearance="plain" @click=${()=>this._fetchData()}>
              <ha-svg-icon slot="start" .path=${Na}></ha-svg-icon>
              ${ai("panels.history.refresh",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <!-- The config carries the unit system, so without it the volumes would
           be unlabelled: show the error above on its own instead. -->
      ${this._config?V`${this._renderTable(e)} ${this._renderTotalChart(e,t)}
          ${this._renderZoneCharts(e,t,i)}`:""}
    `}_renderTable(e){const t=this._records.slice(0,100),i=qs(this._config,us);return V`
      <ha-card header="${ai("panels.history.table.title",e)}">
        <div class="card-content">
          ${0===t.length?V`<div class="history-note">
                ${ai("panels.history.no-data",e)}
              </div>`:V`
                <div class="history-scroll">
                  <div class="history-table">
                    <div class="history-header">
                      <span
                        >${ai("panels.history.table.start",e)}</span
                      >
                      <span
                        >${ai("panels.history.table.zone",e)}</span
                      >
                      <span
                        >${ai("panels.history.table.duration",e)}</span
                      >
                      <span
                        >${ai("panels.history.table.water",e)}
                        <span class="history-unit">(${i})</span></span
                      >
                    </div>
                    ${t.map(e=>V`
                        <div class="history-row">
                          <span>${this._formatStart(e.start)}</span>
                          <span>${e.zone_name||"-"}</span>
                          <span>${Ks(e.duration)}</span>
                          <span
                            >${Qs(e.water_used,this._config).toFixed(1)}</span
                          >
                        </div>
                      `)}
                  </div>
                </div>
                ${this._records.length>100?V`<div class="history-note">
                      ${ai("panels.history.table.truncated",e,"{count}",100,"{total}",this._records.length)}
                    </div>`:""}
              `}
        </div>
      </ha-card>
    `}_renderTotalChart(e,t){const i=this._daily(t);return V`
      <ha-card header="${ai("panels.history.charts.total-title",e)}">
        <div class="card-content">${this._renderChart(i,e)}</div>
      </ha-card>
    `}_renderZoneCharts(e,t,i){return 0===i.length?V``:V`
      <ha-card
        header="${ai("panels.history.charts.per-zone-title",e)}"
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
    `}_renderChart(e,t){const i=qs(this._config,us),s=Math.max(...e.map(e=>e.value),0);if(s<=0)return V`<div class="history-note">
        ${ai("panels.history.charts.no-data",t)}
      </div>`;const a=this._niceMax(s),n=200-Tn-On,r=Tn+n,o=(720-An-Mn)/e.length,l=Math.max(o-3,1),d=[0,.5,1].map(e=>{const t=r-e*n;return Z`
        <line
          class="grid"
          x1=${An}
          y1=${t}
          x2=${720-Mn}
          y2=${t}
        ></line>
        <text class="axis" x=${An-6} y=${t+3.5} text-anchor="end">
          ${this._formatAxis(a*e)}
        </text>
      `}),h=e.map((e,t)=>{const i=e.value/a*n;return Z`
        <rect
          class="bar"
          x=${An+t*o+(o-l)/2}
          y=${r-i}
          width=${l}
          height=${i}
          rx="1"
        >
          <title>
            ${Zs(e.key,this.hass,{dateStyle:"long"})}: ${e.value.toFixed(1)}
          </title>
        </rect>
      `}),c=e.map((t,i)=>i%5!=0&&i!==e.length-1?Z``:Z`
        <text
          class="axis"
          x=${An+i*o+o/2}
          y=${192}
          text-anchor="middle"
        >
          ${Zs(t.key,this.hass,{day:"numeric",month:"short"})}
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
    `}_niceMax(e){const t=Math.pow(10,Math.floor(Math.log10(e))),i=e/t;return(i<=1?1:i<=2?2:i<=5?5:10)*t}_formatAxis(e){return e>=100?e.toFixed(0):e.toFixed(1)}_formatStart(e){if(!e)return"-";const t=fn(e);return t.isValid()?t.format("YYYY-MM-DD HH:mm"):"-"}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}};i([ve()],Cn.prototype,"narrow",void 0),i([ve()],Cn.prototype,"path",void 0),i([fe()],Cn.prototype,"_config",void 0),i([fe()],Cn.prototype,"_records",void 0),i([fe()],Cn.prototype,"_loading",void 0),i([fe()],Cn.prototype,"_error",void 0),Cn=i([pe("smart-irrigation-view-history")],Cn);let En=class extends ce{constructor(){super(...arguments),this._busy=!1,this._error="",this._message="",this._pendingName=""}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}_errText(e){return e&&(e.message||e.code)?e.message||e.code:String(e)}_reset(){this._error="",this._message="",this._pending=void 0,this._pendingName=""}async _export(){if(this.hass){this._reset(),this._busy=!0;try{const t=await(e=this.hass,e.callApi("GET",di+"/export")),i=JSON.stringify(t,null,2),s=new Blob([i],{type:"application/json"}),a=URL.createObjectURL(s),n=document.createElement("a");n.href=a;const r=(new Date).toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");n.download=`smart_irrigation_backup_${r}.json`,n.click(),URL.revokeObjectURL(a),this._message=ai("panels.backuprestore.messages.exported",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e}}async _onFile(e){this._reset();const t=e.target,i=t.files&&t.files[0];if(i)try{const e=await i.text(),t=JSON.parse(e);if(!t||"object"!=typeof t||!t.config)throw new Error(ai("panels.backuprestore.messages.invalid-file",this.hass.language));this._pending=t,this._pendingName=i.name}catch(e){this._error=this._errText(e)}finally{t.value=""}}async _restore(){if(this.hass&&this._pending){this._busy=!0,this._error="",this._message="";try{const i=await(e=this.hass,t=this._pending,e.callApi("POST",di+"/restore",t));if(i&&!1===i.success)throw new Error(i.error||"restore failed");this._pending=void 0,this._pendingName="",this._message=ai("panels.backuprestore.messages.restored",this.hass.language)}catch(e){this._error=this._errText(e)}finally{this._busy=!1}var e,t}}_count(e){const t=this._pending&&this._pending[e];return Array.isArray(t)?t.length:0}render(){if(!this.hass)return V``;const e=this.hass.language;return V`
      <ha-card header="${ai("panels.backuprestore.title",e)}">
        <div class="card-content br-description">
          ${ai("panels.backuprestore.description",e)}
        </div>
      </ha-card>

      <ha-card
        header="${ai("panels.backuprestore.cards.backup.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${ai("panels.backuprestore.cards.backup.description",e)}
          </div>
          ${this._message?V`<div class="br-msg br-msg--success">${this._message}</div>`:""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"}></ha-svg-icon>
              ${ai("panels.backuprestore.actions.export",e)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${ai("panels.backuprestore.cards.restore.title",e)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${ai("panels.backuprestore.cards.restore.description",e)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${ja}></ha-svg-icon>
            ${ai("panels.backuprestore.actions.choose-file",e)}
          </label>

          ${this._pending?V`
                <div class="br-warning">
                  <ha-svg-icon .path=${"M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${ai("panels.backuprestore.messages.confirm-title",e)}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${ai("panels.backuprestore.messages.summary",e)}:
                      ${this._count("zones")}
                      ${ai("panels.zones.title",e)} ·
                      ${this._count("modules")}
                      ${ai("panels.modules.title",e)} ·
                      ${this._count("mappings")}
                      ${ai("panels.mappings.title",e)}
                    </div>
                    <div class="br-warning-text">
                      ${ai("panels.backuprestore.messages.confirm-warning",e)}
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
                  <ha-svg-icon slot="start" .path=${ja}></ha-svg-icon>
                  ${this._busy?ai("panels.backuprestore.actions.restoring",e):ai("panels.backuprestore.actions.restore",e)}
                </ha-button>
              </div>`:""}
          <div class="br-note">
            ${ai("panels.backuprestore.messages.reload-note",e)}
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}};function Dn(e){const t=Number(e).toFixed(1);return"-0.0"===t?"0.0":t}i([ve()],En.prototype,"narrow",void 0),i([ve()],En.prototype,"path",void 0),i([fe()],En.prototype,"_busy",void 0),i([fe()],En.prototype,"_error",void 0),i([fe()],En.prototype,"_message",void 0),i([fe()],En.prototype,"_pending",void 0),i([fe()],En.prototype,"_pendingName",void 0),En=i([pe("smart-irrigation-view-backuprestore")],En);let Hn=class extends(ba(ce)){constructor(){super(...arguments),this.zones=[],this.mainScheduleStart=null,this.nextProgram=null,this.isLoading=!0,this._fetchRetries=0,this._updateScheduled=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}firstUpdated(){be().catch(e=>{console.error("Failed to load HA form:",e)})}hassSubscribe(){return this._fetchData().catch(e=>{console.error("Failed to fetch initial data:",e)}),[this.hass.connection.subscribeMessage(()=>{this._fetchData().catch(e=>{console.error("Failed to fetch data on config update:",e)})},{type:di+"_config_updated"})]}async _fetchData(){var e;if(this.hass)try{this.isLoading=!0;const[t,i,s]=await Promise.all([da(this.hass),fa(this.hass),ca(this.hass)]);if(this.config=t,this.info=i,this.zones=s,this._fetchRetries=0,this.mainScheduleStart=null,this.nextProgram=null,!0===(null==t?void 0:t.full_controller))try{const t=await this.hass.callWS({type:di+"/programs_state"}),s=(null==t?void 0:t.programs)||[],a=s.find(e=>e.main);"main_schedules"===(null==i?void 0:i.start_source)&&(this.mainScheduleStart=null!==(e=null==a?void 0:a.next_start)&&void 0!==e?e:null);const n=s.filter(e=>e.next_start).sort((e,t)=>Date.parse(e.next_start)-Date.parse(t.next_start))[0];this.nextProgram=n?{name:n.main&&"Main program"===n.name?ai("programs.main_name",this._lang):n.name,start:n.next_start}:null}catch(e){console.error("Error fetching the programs' next starts:",e)}}catch(e){console.error("Error fetching data:",e),this._fetchRetries<10&&(this._fetchRetries+=1,setTimeout(()=>{this._fetchData().catch(()=>{})},3e3))}finally{this.isLoading=!1,this._scheduleUpdate()}}get _lang(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e,...t){return ai(`panels.info.${e}`,this._lang,...t)}formatDuration(e){const t=Math.max(0,Math.round(null!=e?e:0)),i=ai("common.units.hours",this._lang),s=ai("common.units.minutes",this._lang),a=ai("common.units.seconds",this._lang);if(t<60)return`${t} ${a}`;if(t<3600)return`${Math.round(t/60)} ${s}`;const n=Math.floor(t/3600),r=Math.round(t%3600/60);return r?`${n} ${i} ${r} ${s}`:`${n} ${i}`}render(){return this.hass?this.isLoading?V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${ai("common.loading",this._lang)}...
          </div>
        </ha-card>
      `:this.config?V`
      <ha-card header="${this.t("title")}">
        <div class="card-content">${this.t("description")}</div>
      </ha-card>

      ${this.renderPostpone()} ${this.renderDeliveryGap()}
      ${this.renderStaleZones()} ${this.renderNextRun()}
      ${this.renderForecast()} ${this.renderDecision()}
      ${this.renderEstimates()}
    `:V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${this.t("configuration-not-available")}
          </div>
        </ha-card>
      `:V``}renderPostpone(){var e,t,i;const s=null===(i=null===(t=null===(e=this.info)||void 0===e?void 0:e.skip_preview)||void 0===t?void 0:t.checks)||void 0===i?void 0:i.find(e=>"postponed"===e.id&&e.skip);return V`
      <ha-card>
        <div class="card-content postpone">
          ${s?V`
                <ha-icon icon="mdi:pause-circle-outline"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.until")}
                  ${Zs(s.until,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
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
    `}async postponeIrrigation(e){await this.hass.callService("smart_irrigation","postpone_irrigation",{hours:e}),await this._fetchData()}async resumeIrrigation(){await this.hass.callService("smart_irrigation","resume_irrigation",{}),await this._fetchData()}renderForecast(){var e,t,i,s,a;const n=null!==(t=null===(e=this.info)||void 0===e?void 0:e.forecast)&&void 0!==t?t:[];if(!n.length)return"";const r="mi"!==(null===(a=null===(s=null===(i=this.hass)||void 0===i?void 0:i.config)||void 0===s?void 0:s.unit_system)||void 0===a?void 0:a.length),o=e=>null==e?"—":r?`${Math.round(e)}°`:`${Math.round(1.8*e+32)}°`;return V`
      <ha-card>
        <div class="card-content forecast">
          ${n.map((e,t)=>{var i;const s=(null!==(i=e.precipitation)&&void 0!==i?i:0)>0;return V`
              <div class="forecast-day">
                <div class="forecast-name">
                  ${0===t?this.t("cards.forecast.today"):Zs(e.date,this.hass,{weekday:"short"})}
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
            `;var a})}
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
                  ${e.last_calculated?Zs(e.last_calculated,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.stale.never")}
                </div>
              `)}
          </div>
        </div>
      </ha-card>
    `:""}renderNextRun(){var e,t,i,s,a,n,r;const o=this.info,l=null!==(e=null==o?void 0:o.next_irrigation_zones)&&void 0!==e?e:[],d=null!==(t=null==o?void 0:o.next_irrigation_duration)&&void 0!==t?t:0,h=null===(s=null===(i=null==o?void 0:o.skip_preview)||void 0===i?void 0:i.checks)||void 0===s?void 0:s.find(e=>"postponed"===e.id&&e.skip),c=(null===(a=null==o?void 0:o.skip_preview)||void 0===a?void 0:a.should_skip)?null===(n=null==o?void 0:o.skip_preview)||void 0===n?void 0:n.reason:null,u="main_schedules"===(null==o?void 0:o.start_source),p=u?this.mainScheduleStart:null==o?void 0:o.next_irrigation_start,g=p?Zs(p,this.hass,{weekday:"long",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):null;let m="mdi:water-off-outline",v=this.t("cards.next-run.headline-nothing"),f=g?this.t("cards.next-run.sub-nothing","{start}",g):this.t("cards.next-run.no-start");const _=!u&&"none"===(null==o?void 0:o.active_start_trigger);_?(m="mdi:calendar-remove-outline",v=this.t("cards.next-run.headline-no-trigger"),f=this.t("cards.next-run.sub-no-trigger")):h?(m="mdi:pause-circle-outline",v=this.t("cards.next-run.headline-postponed"),f=this.t("cards.next-run.sub-postponed")):c&&"postponed"!==c?(m="mdi:calendar-remove-outline",v=this.t("cards.next-run.headline-skipped"),f=this.t(`cards.decision.check-${c}`)):l.length&&d>0&&(m="mdi:water-outline",v=g?this.t("cards.next-run.headline-watering","{start}",g):this.t("cards.next-run.headline-watering-soon"),f=this.t("cards.next-run.sub-watering","{count}",String(l.length),"{duration}",this.formatDuration(d)));const y=!1!==(null==o?void 0:o.start_trigger_armed);return u||_||y||h||c||!l.length||!(d>0)||(m="mdi:calendar-alert",v=this.t("cards.next-run.headline-not-scheduled"),f=this.t("cards.next-run.sub-not-scheduled")),V`
      <ha-card>
        <div class="card-content hero">
          <ha-icon icon=${m}></ha-icon>
          <div class="hero-text">
            <div class="hero-headline">${v}</div>
            <div class="hero-sub">${f}</div>
          </div>
        </div>
        <div class="card-content hero-detail">
          ${this.nextProgram?V`<span
                >${this.t("cards.next-run.next-program","{program}",this.nextProgram.name,"{start}",Zs(this.nextProgram.start,this.hass,{weekday:"long",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}))}</span
              >`:""}
          ${u?V`<span>${this.t("cards.next-run.main-schedules")}</span>`:V`<span>
                ${this.t("cards.next-run.labels.trigger")}:
                ${null!==(r=null==o?void 0:o.trigger_name)&&void 0!==r?r:this.t("cards.next-run.trigger-default")}
                ${(null==o?void 0:o.trigger_accounts_for_duration)?`(${this.t("cards.next-run.accounts-for-duration")})`:""}
              </span>`}
          ${l.length?V`<span
                >${this.t("cards.next-run.labels.zones")}:
                ${l.join(", ")}</span
              >`:""}
          ${(null==o?void 0:o.zone_sequencing)?V`<span
                >${this.t(`cards.next-run.sequencing-${o.zone_sequencing}`)}</span
              >`:""}
          ${(null==o?void 0:o.durations_estimated)?V`<span>${this.t("cards.next-run.estimated")}</span>`:""}
        </div>
      </ha-card>
    `}renderDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.skip_preview;return V`
      <ha-card header="${this.t("cards.decision.title")}">
        <div class="card-content">
          ${t?V`
                <div class="verdict ${t.should_skip?"skip":"run"}">
                  ${t.should_skip?this.t("cards.decision.will-skip"):this.t("cards.decision.will-run")}
                </div>
                ${t.checks.map(e=>this.renderCheck(e))}
                <div class="info-note">
                  ${this.t("cards.decision.preview-note")}
                </div>
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
    `}renderCheckNumbers(e){var t,i,s,a,n,r,o,l,d,h;if("precipitation"===e.id)return V`
        <span
          >${this.t("cards.decision.detail-forecast")}:
          ${null!==(i=null===(t=e.forecast_mm)||void 0===t?void 0:t.toFixed(1))&&void 0!==i?i:"-"} mm</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!==(a=null===(s=e.threshold_mm)||void 0===s?void 0:s.toFixed(1))&&void 0!==a?a:"-"} mm</span
        >
      `;if("freeze"===e.id||"wind"===e.id){const t="weather_service"===e.source?this.t("cards.decision.detail-weather-service"):e.source;return V`
        <span
          >${this.t("cards.decision.detail-now")}: ${null!==(n=e.value)&&void 0!==n?n:"-"}
          ${null!==(r=e.unit)&&void 0!==r?r:""}</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${null!==(o=e.threshold)&&void 0!==o?o:"-"} ${null!==(l=e.unit)&&void 0!==l?l:""}</span
        >
        <span>${null!=t?t:""}</span>
      `}return"rain_sensor"===e.id?V`<span
        >${e.raining?this.t("cards.decision.detail-raining"):this.t("cards.decision.detail-dry")}</span
      >`:"soil_moisture"===e.id?V`${(e.zones||[]).map(e=>{var t;return V`<span
            >${e.name}: ${null!==(t=e.moisture)&&void 0!==t?t:"-"} % / ${e.threshold} %
            ${e.held?`(${this.t("cards.decision.detail-held")})`:""}</span
          >`})}`:"days_between"===e.id?V`
        <span
          >${this.t("cards.decision.detail-days-since")}:
          ${null!==(d=e.days_since)&&void 0!==d?d:"-"}</span
        >
        <span
          >${this.t("cards.decision.detail-days-required")}:
          ${null!==(h=e.days_required)&&void 0!==h?h:"-"}</span
        >
      `:V``}renderLastDecision(){var e;const t=null===(e=this.info)||void 0===e?void 0:e.last_skip_evaluation;return V`
      <div class="last-decision">
        <span class="check-name">${this.t("cards.decision.last-title")}</span>
        ${t?V`<span class="value"
              >${t.should_skip?this.t("cards.decision.last-skipped"):this.t("cards.decision.last-ran")}${t.evaluated_at?` (${Zs(t.evaluated_at,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})`:""}</span
            >`:V`<span class="value"
              >${this.t("cards.decision.last-none")}</span
            >`}
      </div>
    `}renderEstimates(){var e,t;const i=null!==(t=null===(e=this.info)||void 0===e?void 0:e.zone_estimates)&&void 0!==t?t:{},s=this.config?qs(this.config,ps):"mm",a=this.zones.filter(e=>i[String(e.id)]);return V`
      <ha-card header="${this.t("cards.estimate.title")}">
        <div class="card-content">
          ${0===a.length?V`<div class="info-note">
                ${this.t("cards.estimate.none")}
              </div>`:V`
                ${a.map(e=>{const t=i[String(e.id)];return V`
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
                            >${Dn(t.bucket)} ${s}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.at-last-calculation")}${e.last_calculated?` (${Zs(e.last_calculated,this.hass,{weekday:"short",hour:"2-digit",minute:"2-digit"})})`:""}:</span
                          >
                          <span class="value"
                            >${Dn(e.bucket)} ${s}</span
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
                            >${e.last_irrigation?Zs(e.last_irrigation,this.hass,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):this.t("cards.estimate.never-watered")}</span
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
      ${Ua} ${Wa}

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
    `}};i([ve()],Hn.prototype,"config",void 0),i([ve({type:Object})],Hn.prototype,"info",void 0),i([ve({type:Array})],Hn.prototype,"zones",void 0),i([ve({type:Boolean})],Hn.prototype,"isLoading",void 0),Hn=i([pe("smart-irrigation-view-info")],Hn);const Nn=[Ai,wi,$i,Mi,Ci,Oi,bi,Si,Ti],Rn={sensors:"PyETO",et:"Passthrough",static:"Static"};let Pn=class extends ce{constructor(){super(...arguments),this.step=0,this.allModules=[],this.isSaving=!1,this.done=!1,this.zoneName="",this.zoneSize="",this.zoneThroughput="",this.underGlass=!1,this.weather="service",this.sensors={},this.staticDelta="",this.serviceSuppliesEt=!1,this.serviceHasRain=!0}firstUpdated(){be().catch(()=>{}),this._load().catch(e=>console.error("Setup wizard: load failed",e))}async _load(){if(!this.hass)return;const[e,t,i]=await Promise.all([da(this.hass),ga(this.hass),ha(this.hass).catch(()=>{})]);this.config=e,this.allModules=t,this.serviceSuppliesEt=!!(null==i?void 0:i.supplies_evapotranspiration),this.serviceHasRain=!1!==(null==i?void 0:i.supplies_rain),this.usesWeatherService||(this.weather="sensors")}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}t(e){return ai(`panels.setup.${e}`,this.lng)}get usesWeatherService(){var e;return!!(null===(e=this.config)||void 0===e?void 0:e.use_weather_service)}get engineName(){return"service"===this.weather?this.serviceSuppliesEt?"Passthrough":"PyETO":Rn[this.weather]}get engine(){return this.allModules.find(e=>e.name===this.engineName)}get sourcesToAsk(){var e,t;const i=null!==(t=null===(e=this.engine)||void 0===e?void 0:e.consumes)&&void 0!==t?t:Nn;return Nn.filter(e=>i.includes(e)&&!(this.underGlass&&(e===Si||e===Ti)))}get rainFromSensors(){return e=this.weather,t=this.underGlass,i=this.serviceHasRain,"service"!==e||t||i?[]:[Ti,Si];var e,t,i}get sensorsToAsk(){var e,t;return"static"===this.weather?[]:"et"===this.weather?(t=this.sourcesToAsk,!!(null===(e=this.engine)||void 0===e?void 0:e.consumes)?t:[bi]):"sensors"===this.weather?this.sourcesToAsk:this.rainFromSensors}get optionalToAsk(){var e;const t=null===(e=this.engine)||void 0===e?void 0:e.requires;return t?this.sensorsToAsk.filter(e=>!t.includes(e)&&!this.rainFromSensors.includes(e)):[]}get steps(){const e=["zone","environment","weather"];return(this.sensorsToAsk.length||"static"===this.weather)&&e.push("sensors"),e.push("review"),e}get currentStep(){return this.steps[Math.min(this.step,this.steps.length-1)]}get canGoOn(){var e;switch(this.currentStep){case"zone":return""!==this.zoneName.trim()&&Number(this.zoneSize)>0&&Number(this.zoneThroughput)>0;case"sensors":return"static"===this.weather?Number(this.staticDelta)>0:0===function(e,t,i){const s=t?e.filter(e=>t.includes(e)):e;return s.filter(e=>!i[e])}(this.sensorsToAsk,null===(e=this.engine)||void 0===e?void 0:e.requires,this.sensors).length&&(!this.rainFromSensors.length||this.rainFromSensors.some(e=>!!this.sensors[e]));default:return!0}}render(){return this.hass?this.done?V`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            <div class="done">${this.t("done")}</div>
            <div class="note">${this.t("done-note")}</div>
          </div>
        </ha-card>
      `:V`
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
                  <ha-svg-icon slot="start" .path=${$a}></ha-svg-icon>
                  ${this.t("back")}
                </ha-button>`:""}
            ${"review"===this.currentStep?V`<ha-button
                  appearance="filled"
                  ?disabled=${this.isSaving}
                  @click=${()=>this.create()}
                >
                  <ha-svg-icon slot="start" .path=${Sa}></ha-svg-icon>
                  ${this.isSaving?this.t("creating"):this.t("create")}
                </ha-button>`:V`<ha-button
                  appearance="filled"
                  ?disabled=${!this.canGoOn}
                  @click=${()=>{this.step+=1,this.error=void 0}}
                >
                  ${this.t("next")}
                  <ha-svg-icon slot="end" .path=${xa}></ha-svg-icon>
                </ha-button>`}
          </div>
        </div>
      </ha-card>
    `:V``}renderStep(){switch(this.currentStep){case"zone":return this.renderZoneStep();case"environment":return this.renderEnvironmentStep();case"weather":return this.renderWeatherStep();case"sensors":return this.renderSensorsStep();default:return this.renderReviewStep()}}renderZoneStep(){return V`
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
                >(${qs(this.config,ls)})</span
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
                >(${qs(this.config,ds)})</span
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
      ${this.underGlass&&this.sensorsToAsk.includes(Oi)?V`<div class="note">${this.t("steps.sensors.lux-hint")}</div>`:""}
      ${this.sensorsToAsk.map(e=>{var t;return V`
          <div class="setting-row">
            <div class="setting-label">
              ${e}${this.optionalToAsk.includes(e)?V` <span class="step-count"
                    >(${this.t("steps.sensors.optional")})</span
                  >`:""}
            </div>
            <ha-entity-picker
              class="entity-field"
              .hass=${this.hass}
              .value=${null!==(t=this.sensors[e])&&void 0!==t?t:""}
              allow-custom-entity
              @value-changed=${t=>{var i,s;this.sensors=Object.assign(Object.assign({},this.sensors),{[e]:null!==(s=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==s?s:""})}}
            ></ha-entity-picker>
          </div>
        `})}
    `}renderReviewStep(){return V`
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
            ${la(this.engineName,this.lng)}
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-label">${this.t("steps.review.sources")}</div>
          <div class="review-value">
            ${"static"===this.weather?`${this.t("steps.sensors.static-label")}: ${this.staticDelta}`:"service"===this.weather?[this.t("steps.review.from-the-service"),...this.rainFromSensors.filter(e=>!!this.sensors[e]).map(e=>`${e}: ${this.sensors[e]}`)].join(", "):this.sensorsToAsk.length?this.sensorsToAsk.join(", "):this.t("steps.review.from-the-service")}
          </div>
        </div>
      </div>
      <div class="note">${this.t("steps.review.help")}</div>
    `}choice(e,t,i,s){return V`
      <div class="choice ${e?"selected":""}" @click=${s}>
        <div class="choice-title">${t}</div>
        <div class="choice-help">${i}</div>
      </div>
    `}sourceFor(e){return this.sensors[e]?{[Wi]:Pi,[Vi]:this.sensors[e],[Gi]:""}:"service"===this.weather&&this.sourcesToAsk.includes(e)&&!this.rainFromSensors.includes(e)?{[Wi]:Ri,[Vi]:"",[Gi]:""}:!this.underGlass||e!==Si&&e!==Ti?{[Wi]:Yi,[Vi]:"",[Gi]:""}:{[Wi]:ji,[Vi]:"",[Gi]:"",[Zi]:0}}async create(){if(this.hass&&!this.isSaving){this.isSaving=!0,this.error=void 0;try{const e={name:this.zoneName.trim(),mappings:Object.fromEntries(Nn.map(e=>[e,this.sourceFor(e)])),greenhouse:this.underGlass};await va(this.hass,e);const t=(await ma(this.hass)).find(t=>t.name===e.name);await ua(this.hass,Object.assign({name:this.zoneName.trim(),size:Number(this.zoneSize),throughput:Number(this.zoneThroughput),state:"automatic",[ms]:null==t?void 0:t.id},function(e,t){var i;const s=null===(i=Object.entries(ra).find(([,t])=>t===e))||void 0===i?void 0:i[0];return s?"fixed"===s?{calculation_method:s,method_config:{delta:oa(t)}}:{calculation_method:s}:{}}(this.engineName,this.staticDelta))),await ca(this.hass),this.done=!0}catch(e){console.error("Setup wizard: could not create the zone",e),this.error=this.t("failed")}finally{this.isSaving=!1}}}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}};i([ve()],Pn.prototype,"hass",void 0),i([ve()],Pn.prototype,"config",void 0),i([fe()],Pn.prototype,"step",void 0),i([fe()],Pn.prototype,"allModules",void 0),i([fe()],Pn.prototype,"isSaving",void 0),i([fe()],Pn.prototype,"error",void 0),i([fe()],Pn.prototype,"done",void 0),i([fe()],Pn.prototype,"zoneName",void 0),i([fe()],Pn.prototype,"zoneSize",void 0),i([fe()],Pn.prototype,"zoneThroughput",void 0),i([fe()],Pn.prototype,"underGlass",void 0),i([fe()],Pn.prototype,"weather",void 0),i([fe()],Pn.prototype,"sensors",void 0),i([fe()],Pn.prototype,"staticDelta",void 0),i([fe()],Pn.prototype,"serviceSuppliesEt",void 0),i([fe()],Pn.prototype,"serviceHasRain",void 0),Pn=i([pe("smart-irrigation-view-setup")],Pn);let jn=class extends ce{constructor(){super(...arguments),this.busy=!1,this.leftOff=[],this.unrecorded=[],this.t=(e,...t)=>ai(`panels.iu_import.cutover.${e}`,this.lng,...t)}firstUpdated(){this.reload().catch(e=>console.error("IU cut-over: load failed",e))}updated(e){if(!e.has("hass")||!this.status||this.busy)return;const t=this.status.controllers.some(e=>{var t,i,s;const a=null===(s=null===(i=null===(t=this.hass)||void 0===t?void 0:t.states[e.entity_id])||void 0===i?void 0:i.attributes)||void 0===s?void 0:s.enabled;return"boolean"==typeof a&&a!==e.enabled});t&&this.reload()}async reload(){var e;if(this.hass)try{this.status=await(e=this.hass,e.callWS({type:di+"/iu_import/status"}))}catch(e){this.error=this.errorText(e)}}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}errorText(e){var t;const i=null==e?void 0:e.code,s=i?this.t(`errors.${i}`):void 0;return s&&!s.startsWith("Translation")?s:null!==(t=null==e?void 0:e.message)&&void 0!==t?t:this.t("errors.generic")}when(e){return e?new Date(e).toLocaleString(this.lng):""}async switchTo(e){var t,i,s,a;if(!this.hass||this.busy)return;if(await La(this.hass,{text:this.t("smart_irrigation"===e?"confirm-over":"confirm-back"),confirmText:this.t("smart_irrigation"===e?"over":"back")})){this.busy=!0,this.error=void 0,this.leftOff=[],this.unrecorded=[];try{const n=await((e,t)=>e.callWS({type:di+"/iu_import/cutover",to:t}))(this.hass,e),r=new Map((null!==(i=null===(t=this.status)||void 0===t?void 0:t.programs)&&void 0!==i?i:[]).map(e=>[e.id,e.name]));this.leftOff=(null!==(s=n.left_off)&&void 0!==s?s:[]).map(e=>{var t;return null!==(t=r.get(e))&&void 0!==t?t:e}),this.unrecorded=(null!==(a=n.unrecorded)&&void 0!==a?a:[]).map(e=>{var t;return null!==(t=r.get(e))&&void 0!==t?t:e})}catch(e){this.error=this.errorText(e)}finally{this.busy=!1,await this.reload()}}}who(e){switch(e.waters){case"smart_irrigation":return e.switched_at?this.t("si-waters","at",this.when(e.switched_at)):this.t("si-waters-now");case"both":return this.t("both-on");case"none":return this.t("nobody-waters");default:return this.t("iu-waters")}}render(){var e;const t=this.status;return this.hass?t?t.imported?V`
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
          @click=${e=>{e.preventDefault(),aa(0,kn("programs"))}}
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
                          @click=${t=>{t.preventDefault(),aa(0,e.edit)}}
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
      ${Ua} ${Wa}

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
    `}};function In(e,t,i){var s,a,n;const r=[],o=Number(e.offset_minutes)||0;if("sun"===e.type){const t=i("sunset"===e.event?"schedule.sunset":"schedule.sunrise");r.push(o?`${t} ${o>0?"+":"−"}${Math.abs(o)} min`:t)}else r.push(String(null!==(s=e.time)&&void 0!==s?s:""));"end"===e.anchor&&(r[0]=i("schedule.done-by","time",r[0]));const l=Array.isArray(e.weekdays)?e.weekdays:[];if(l.length&&l.length<7){const e=function(e){const t=new Intl.DateTimeFormat(e,{weekday:"short"});return[...Array(7).keys()].map(e=>t.format(new Date(Date.UTC(2024,0,1+e,12))))}(t);r.push(l.map(t=>{var i;return null!==(i=e[t])&&void 0!==i?i:String(t)}).join(", "))}const d=Number(e.every_n_days)||0;d>1&&r.push(i("schedule.every","count",d)),"odd"===e.parity&&r.push(i("schedule.odd")),"even"===e.parity&&r.push(i("schedule.even"));const h=Array.isArray(e.days_of_month)?e.days_of_month:[];h.length&&r.push(i("schedule.days-of-month","days",h.map(e=>"last"===e?i("schedule.last"):String(e)).join(", ")));const c=Array.isArray(e.months)?e.months:[];if(c.length&&c.length<12){const e=function(e){const t=new Intl.DateTimeFormat(e,{month:"short"});return[...Array(12).keys()].map(e=>t.format(new Date(Date.UTC(2024,e,15,12))))}(t);r.push(c.map(t=>{var i;return null!==(i=e[t-1])&&void 0!==i?i:String(t)}).join(", "))}return(e.from_date||e.until_date)&&r.push(`${null!==(a=e.from_date)&&void 0!==a?a:"01-01"} – ${null!==(n=e.until_date)&&void 0!==n?n:"12-31"}`),!1===e.enabled&&r.push(i("schedule.off-in-iu")),r.filter(e=>e).join(" · ")}function Ln(e,t,i){var s;return`${e.join(" + ")}: ${"calculated"===t.mode?i("programs.calculated"):function(e){const t=Math.max(0,Math.round(Number(e)||0));if(t<60)return`${t} s`;const i=Math.floor(t/3600),s=Math.floor(t%3600/60),a=t%60,n=[];return i&&n.push(`${i} h`),s&&n.push(`${s} min`),a&&n.push(`${a} s`),n.join(" ")}(t.seconds)}${(null!==(s=t.passes)&&void 0!==s?s:1)>1?` · ${i("programs.passes","count",t.passes)}`:""}${!1===t.enabled?` · ${i("programs.step-off")}`:""}`}function Un(e){return null===e.zone_id?"new":e.zone_id}i([ve({attribute:!1})],jn.prototype,"hass",void 0),i([fe()],jn.prototype,"status",void 0),i([fe()],jn.prototype,"busy",void 0),i([fe()],jn.prototype,"error",void 0),i([fe()],jn.prototype,"leftOff",void 0),i([fe()],jn.prototype,"unrecorded",void 0),jn=i([pe("smart-irrigation-iu-cutover")],jn);const Fn="pasted",Bn=["yaml_invalid","yaml_unreadable"],Yn=["source","zones","programs","report"],Wn=["linked_entity","supply_id","extra_entities","confirm_timeout","open_resends","flow_sensor"];let Vn=class extends ce{constructor(){super(...arguments),this.narrow=!1,this.step=0,this.sources=[],this.source="",this.yaml="",this.choices={},this.zones=[],this.busy=!1,this.loaded=!1,this.fullController=!0,this.baseline={},this.asked=0,this.desired={},this.t=(e,...t)=>ai(`panels.iu_import.${e}`,this.lng,...t)}firstUpdated(){this._load().catch(e=>console.error("IU import: load failed",e))}get lng(){var e,t;return null!==(t=null===(e=this.hass)||void 0===e?void 0:e.language)&&void 0!==t?t:"en"}get currentStep(){return Yn[Math.min(this.step,Yn.length-1)]}get sourceKey(){return this.source===Fn?`${Fn}\n${this.yaml}`:this.source}requestFor(e){return{source:this.source===Fn?Fn:this.source||void 0,yaml:this.source===Fn?this.yaml:void 0,matches:Object.keys(e).length?e:void 0}}async _load(){var e,t;if(this.hass)try{const[i,s,a]=await Promise.all([(t=this.hass,t.callWS({type:di+"/iu_import/sources"})),ca(this.hass),da(this.hass)]);this.sources=i.sources,this.zones=s,this.fullController=!0===(null==a?void 0:a.full_controller),this.importedAt=null===(e=null==a?void 0:a.iu_import)||void 0===e?void 0:e.at;const n=this.sources.find(e=>!e.error);this.source=n?n.id:Fn}catch(e){this.error=this.errorText(e),this.source=Fn}finally{this.loaded=!0}}errorText(e){var t;const i=null==e?void 0:e.code,s=i?this.t(`errors.${i}`):void 0;return s&&!s.startsWith("Translation")?Bn.includes(i)&&(null==e?void 0:e.message)?`${s} (${e.message})`:s:null!==(t=null==e?void 0:e.message)&&void 0!==t?t:this.t("errors.generic")}async refresh(e=this.choices){if(!this.hass)return!1;const t=++this.asked;this.busy=!0,this.error=void 0;try{const[a,n]=await Promise.all([(i=this.hass,s=this.requestFor(e),i.callWS(Object.assign({type:di+"/iu_import/preview"},s))),ca(this.hass).catch(()=>this.zones)]);return t===this.asked&&(this.preview=a,this.choices=e,this.desired=e,this.zones=n,this.previewedFor=this.sourceKey,Object.keys(e).length||(this.baseline=function(e){return Object.fromEntries(e.zones.map(e=>[e.key,Un(e)]))}(a)),!0)}catch(e){return t===this.asked&&(this.error=this.errorText(e),this.desired=this.choices),!1}finally{t===this.asked&&(this.busy=!1)}var i,s}async next(){if(this.notice=void 0,"source"===this.currentStep){return void((this.preview&&this.previewedFor===this.sourceKey||await this.refresh({}))&&(this.step+=1,this.error=void 0))}this.step+=1,this.error=void 0}async apply(){var e,t,i,s,a;if(!this.hass||!this.preview||this.busy)return;const n=[...null!==(t=null===(e=this.preview.removed_names)||void 0===e?void 0:e.programs)&&void 0!==t?t:this.preview.removed.programs,...null!==(s=null===(i=this.preview.removed_names)||void 0===i?void 0:i.supplies)&&void 0!==s?s:this.preview.removed.supplies];if(!n.length||await La(this.hass,{text:this.t("confirm_remove","{names}",n.join(", ")),destructive:!0})){this.busy=!0,this.error=void 0,this.notice=void 0;try{this.result=await(r=this.hass,o=Object.assign(Object.assign({},this.requestFor(this.choices)),{fingerprint:this.preview.fingerprint}),r.callWS(Object.assign({type:di+"/iu_import/apply"},o))),await this.updateComplete,await(null===(a=this.renderRoot.querySelector("smart-irrigation-iu-cutover"))||void 0===a?void 0:a.reload())}catch(e){if("changed"===(null==e?void 0:e.code))return this.busy=!1,void(await this.refresh()&&(this.notice=this.t("errors.changed")));this.error=this.errorText(e)}finally{this.busy=!1}var r,o}}render(){if(!this.hass)return V``;const e=V`<smart-irrigation-iu-cutover
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
      </ha-card> `}get blocked(){var e,t;return!!(null===(t=null===(e=this.preview)||void 0===e?void 0:e.conflicts)||void 0===t?void 0:t.length)}renderActions(){const e="report"===this.currentStep,t=this.loaded&&!this.busy&&("source"!==this.currentStep||(this.source===Fn?""!==this.yaml.trim():!!this.source));return V`
      <div class="si-form-actions">
        <span class="step-count"
          >(${this.t("step")} ${this.step+1} / ${Yn.length})</span
        >
        ${this.step>0?V`<ha-button
              appearance="plain"
              ?disabled=${this.busy}
              @click=${()=>{this.step-=1,this.error=void 0,this.notice=void 0}}
            >
              <ha-svg-icon slot="start" .path=${$a}></ha-svg-icon>
              ${this.t("back")}
            </ha-button>`:""}
        ${e?V`<ha-button
              appearance="filled"
              ?disabled=${this.busy||!this.preview||this.blocked}
              @click=${()=>this.apply()}
            >
              <ha-svg-icon slot="start" .path=${Sa}></ha-svg-icon>
              ${this.busy?this.t("importing"):this.t("import")}
            </ha-button>`:V`<ha-button
              appearance="filled"
              ?disabled=${!t}
              @click=${()=>this.next()}
            >
              ${this.t("next")}
              <ha-svg-icon slot="end" .path=${xa}></ha-svg-icon>
            </ha-button>`}
      </div>
    `}renderStep(){switch(this.currentStep){case"source":return this.renderSource();case"zones":return this.renderZones();case"programs":return this.renderPrograms();default:return this.renderReport()}}choice(e,t,i,s,a=!1){const n=a||this.busy;return V`
      <div
        class="choice ${e?"selected":""} ${a?"disabled":""}"
        role="radio"
        aria-checked=${e?"true":"false"}
        aria-disabled=${n?"true":"false"}
        tabindex=${a?"-1":"0"}
        @click=${n?void 0:s}
        @keydown=${e=>{n||"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}
      >
        <div class="choice-title">${t}</div>
        <div class="choice-help">${i}</div>
      </div>
    `}renderSource(){return V`
      <h3 id="source-question">${this.t("source.question")}</h3>
      <div class="note">${this.t("source.help")}</div>
      ${this.importedAt?V`<div class="note">
            ${this.t("source.previous","at",new Date(this.importedAt).toLocaleString(this.lng))}
          </div>`:""}
      <div role="radiogroup" aria-labelledby="source-question">
        ${this.sources.map(e=>this.choice(this.source===e.id,e.title,e.error?V`<span class="error"
                  >${this.t("source.unreadable")} ${e.error}</span
                >`:this.t("yaml"===e.id?"source.yaml-help":"source.entry-help"),()=>this.source=e.id,!!e.error))}
        ${this.loaded&&!this.sources.some(e=>!e.error)?V`<div class="note">${this.t("source.none-found")}</div>`:""}
        ${this.choice(this.source===Fn,this.t("source.paste"),this.t("source.paste-help"),()=>this.source=Fn)}
      </div>
      ${this.source===Fn?V`<textarea
            class="yaml"
            rows="12"
            spellcheck="false"
            aria-label=${this.t("source.paste")}
            placeholder="irrigation_unlimited:&#10;  controllers:&#10;    - name: …"
            ?disabled=${this.busy}
            .value=${this.yaml}
            @input=${e=>this.yaml=e.target.value}
          ></textarea>`:""}
    `}reasonText(e){return e?this.t(`zones.reason.${e}`):""}iuZoneName(e){var t,i,s;return null!==(s=null===(i=null===(t=this.preview)||void 0===t?void 0:t.zones.find(t=>t.key===e))||void 0===i?void 0:i.name)&&void 0!==s?s:e}zoneName(e){var t,i;return null!==(i=null===(t=this.zones.find(t=>t.id===e))||void 0===t?void 0:t.name)&&void 0!==i?i:String(e)}conflictText(e){switch(e.code){case"zone_twice":return this.t("conflicts.zone_twice","zone",this.iuZoneName(e.key),"other",this.iuZoneName(e.other),"target",this.zoneName(e.zone_id));case"calculated_needs_zone":return this.t("conflicts.calculated_needs_zone","zone",this.iuZoneName(e.key));default:return this.t(`conflicts.${e.code}`,"name",e.name||e.id,"id",e.id)}}async choose(e,t){var i,s;const a=t.value,n="new"===a?"new":Number(a),r=function(e,t,i,s){const a=Object.assign({},e);return i===s?delete a[t]:a[t]=i,a}(this.desired,e,n,this.baseline[e]);this.desired=r;const o=null===(i=this.preview)||void 0===i?void 0:i.zones.find(t=>t.key===e),l=o?String(Un(o)):a;if(!await this.refresh(r)){const i=null===(s=this.preview)||void 0===s?void 0:s.zones.find(t=>t.key===e);t.value=i?String(Un(i)):l}}renderZones(){const e=this.preview;if(!e)return V``;if(!e.zones.length)return V`<h3>${this.t("zones.question")}</h3>
        <div class="note">${this.t("zones.none")}</div>`;const t=function(e){var t,i,s;const a={};for(const n of null!==(t=null==e?void 0:e.conflicts)&&void 0!==t?t:[])"key"in n&&(a[n.key]=n),"zone_twice"===n.code&&(null!==(i=a[s=n.other])&&void 0!==i||(a[s]=n));return a}(e);return V`
      <h3>${this.t("zones.question")}</h3>
      <div class="note">${this.t("zones.help")}</div>
      ${e.links?V`<div class="note">
            ${this.t("zones.links","count",e.links)}
          </div>`:""}
      <div class="rows">
        ${e.zones.map(e=>{var i,s;const a=null===e.zone_id?"new":String(e.zone_id),n=Wn.filter(t=>{return!(null==(i=e.fields[t])||""===i||Array.isArray(i)&&0===i.length);var i}),r=t[e.key],o=null!==e.zone_id&&!this.zones.some(t=>t.id===e.zone_id);return V`
            <div class="row ${r?"conflict":""}">
              <div class="row-head">
                <div class="row-title">${e.name}</div>
                <select
                  class="field"
                  aria-label=${this.t("zones.becomes","zone",e.name)}
                  aria-invalid=${r?"true":"false"}
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
                  ${o?V`<option value=${a} selected>
                        ${null!==(i=e.zone_name)&&void 0!==i?i:a}
                      </option>`:""}
                </select>
              </div>
              <div class="row-help">
                ${"create"===e.action?this.t("zones.creates"):this.t("zones.uses","zone",null!==(s=e.zone_name)&&void 0!==s?s:String(e.zone_id),"reason",this.reasonText(e.reason))}
                ${n.length?V`<br />${this.t("zones.fills")}
                      ${n.map(t=>`${this.t(`zones.fields.${t}`)}: ${this.fieldValue(t,e.fields[t])}`).join(" · ")}`:""}
              </div>
              ${r?V`<div class="error row-error">
                    ${this.conflictText(r)}
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
                      ${Ln(null!==(s=e.zone_names[i])&&void 0!==s?s:[],t,this.t)}
                    </li>`})}
              </ul>
              <div class="row-help">
                ${e.program.schedules.length?e.program.schedules.map(e=>In(e,this.lng,this.t)).join("; "):this.t("programs.no-schedules")}
                <br />
                ${e.schedules_on?this.t("programs.schedules-stay-on"):this.t("programs.schedules-off")}
                ${!1===e.program.enabled?V`<br />${this.t("programs.disabled")}`:""}
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
    `:V``}renderReport(){const e=this.preview;if(!e)return V``;const t=(i=e.report.items,["not_carried","unknown","approximated"].map(e=>({outcome:e,items:i.filter(t=>t.outcome===e)})).filter(e=>e.items.length>0));var i;const s=function(e){const t=(e,t)=>e.filter(t).length;return{zonesCreated:t(e.zones,e=>"create"===e.action),zonesFilled:t(e.zones,e=>"update"===e.action),zonesUsed:t(e.zones,e=>"use"===e.action),programsCreated:t(e.programs,e=>"create"===e.action),programsUpdated:t(e.programs,e=>"update"===e.action),programsRemoved:e.removed.programs.length,suppliesCreated:t(e.supplies,e=>"create"===e.action),suppliesUpdated:t(e.supplies,e=>"update"===e.action),suppliesRemoved:e.removed.supplies.length}}(e);return V`
      <h3>${this.t("report.question")}</h3>
      <div class="note">${this.t("report.help")}</div>
      ${t.length?t.map(e=>V`
              <h4>${this.t(`report.outcome.${e.outcome}`)}</h4>
              <ul class="lines">
                ${e.items.map(e=>V`<li>
                      ${e.subject?V`<b>${e.subject}</b>: `:""}${e.note}
                      ${e.path?V`<span class="path">(${e.path})</span>`:""}
                    </li>`)}
              </ul>
            `):V`<div class="note">${this.t("report.all-carried")}</div>`}
      <h3>${this.t("report.summary-title")}</h3>
      <ul class="lines">
        <li>
          ${this.t("report.summary.zones","created",s.zonesCreated,"filled",s.zonesFilled,"used",s.zonesUsed)}
        </li>
        <li>
          ${this.t("report.summary.programs","created",s.programsCreated,"updated",s.programsUpdated,"removed",s.programsRemoved)}
        </li>
        <li>
          ${this.t("report.summary.supplies","created",s.suppliesCreated,"updated",s.suppliesUpdated,"removed",s.suppliesRemoved)}
        </li>
      </ul>
      ${this.fullController?"":V`<div class="notice">
            ${this.t("report.full-controller-off")}
          </div>`}
      ${this.blocked?V`<div class="error" role="alert">
            ${this.t("report.blocked")}
          </div>`:V`<div class="note">${this.t("report.nothing-waters")}</div>`}
    `}renderDone(e){return V`
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
            ${this.fullController?this.t("done.next"):this.t("done.next-off")}
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click=${()=>aa(0,kn(this.fullController?"programs":"general"))}
            >
              ${this.fullController?this.t("done.open-programs"):this.t("done.open-settings")}
            </ha-button>
          </div>
        </div>
      </ha-card>
    `}static get styles(){return l`
      ${Ua} ${Wa}

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
    `}};i([ve({attribute:!1})],Vn.prototype,"hass",void 0),i([ve({type:Boolean})],Vn.prototype,"narrow",void 0),i([fe()],Vn.prototype,"step",void 0),i([fe()],Vn.prototype,"sources",void 0),i([fe()],Vn.prototype,"source",void 0),i([fe()],Vn.prototype,"yaml",void 0),i([fe()],Vn.prototype,"preview",void 0),i([fe()],Vn.prototype,"choices",void 0),i([fe()],Vn.prototype,"zones",void 0),i([fe()],Vn.prototype,"busy",void 0),i([fe()],Vn.prototype,"loaded",void 0),i([fe()],Vn.prototype,"error",void 0),i([fe()],Vn.prototype,"notice",void 0),i([fe()],Vn.prototype,"result",void 0),i([fe()],Vn.prototype,"fullController",void 0),i([fe()],Vn.prototype,"importedAt",void 0),Vn=i([pe("smart-irrigation-view-iuimport")],Vn);const Zn=Ua;var Gn;!function(e){e.Setup="setup",e.IuImport="iu_import",e.Info="info",e.General="general",e.Zones="zones",e.Modules="modules",e.Mappings="mappings",e.WeatherService="weatherservice",e.History="history",e.BackupRestore="backuprestore",e.Help="help",e.Planning="planning",e.Programs="programs",e.Supplies="supplies"}(Gn||(Gn={}));const qn=[{id:"home",pages:[Gn.Info,Gn.History]},{id:"zones",pages:[Gn.Zones]},{id:"data",pages:[Gn.WeatherService,Gn.Mappings]},{id:"settings",pages:[Gn.General,Gn.BackupRestore,Gn.Help]}],Kn={[Gn.Modules]:"settings",[Gn.Setup]:"settings",[Gn.IuImport]:"settings"},Jn={id:"watering",pages:[Gn.Planning,Gn.Programs,Gn.Supplies]},Xn=e=>e?[qn[0],qn[1],Jn,...qn.slice(2)]:qn,Qn=e=>{if(Jn.pages.includes(e))return Jn;const t=qn.find(t=>t.pages.includes(e));if(t)return t;const i=Kn[e];if(i){const t=qn.find(e=>e.id===i);if(t)return Object.assign(Object.assign({},t),{pages:[...t.pages,e]})}return qn[0]};e.SmartIrrigationPanel=class extends ce{constructor(){super(...arguments),this._updateScheduled=!1,this._lastNavigationTime=0,this._navigationThrottleDelay=100,this._languageReady=!1,this._fullController=!1}_scheduleUpdate(){this._updateScheduled||(this._updateScheduled=!0,requestAnimationFrame(()=>{this._updateScheduled=!1,this.requestUpdate()}))}willUpdate(){var e;const t=null===(e=this.hass)||void 0===e?void 0:e.language;if(!t||this._languageRequested===t)return;if(this._languageRequested=t,function(e){return si(e)in ti}(t))return void(this._languageReady=!0);const i=()=>{this._languageReady=!0,this._refreshViews()},s=setTimeout(i,600);(async function(e,t=""){const i=si(e);if(i in ti)return;if(!ei.includes(i))return;if(i in ii)return ii[i];const s=(async()=>{const e=new AbortController,s=setTimeout(()=>e.abort(),5e3);try{const s=t?`${Qt}/${i}.json?v=${encodeURIComponent(t)}`:`${Qt}/${i}.json`,a=await fetch(s,{signal:e.signal});if(!a.ok)throw new Error(`HTTP ${a.status}`);const n=await a.json();if(!n||"object"!=typeof n)throw new Error("not an object");ti[i]=n}catch(e){console.warn(`Smart Irrigation: could not load the ${i} translation, falling back to English`,e)}finally{clearTimeout(s),delete ii[i]}})();return ii[i]=s,s})(t,li).then(()=>{clearTimeout(s),i()})}_refreshViews(){var e;this.requestUpdate(),null===(e=this.shadowRoot)||void 0===e||e.querySelectorAll("*").forEach(e=>{var t;return null===(t=e.requestUpdate)||void 0===t?void 0:t.call(e)})}async firstUpdated(){const e=xn();e.page&&Object.values(Gn).includes(e.page)||aa(0,kn(Gn.Info)),window.addEventListener("location-changed",()=>{if(!window.location.pathname.includes("smart_irrigation"))return;const e=performance.now();e-this._lastNavigationTime<this._navigationThrottleDelay||(this._lastNavigationTime=e,this._scheduleUpdate())}),this._readMode(),this.hass.connection.subscribeMessage(()=>this._readMode(),{type:di+"_config_updated"}).catch(()=>{}),be().then(()=>{this._scheduleUpdate()}).catch(e=>{console.error("Failed to load HA form elements:",e),this._scheduleUpdate()})}render(){if(!this._languageReady)return V``;const e=xn(),t=!!customElements.get("ha-tab-group"),i=!!customElements.get("ha-tab-group-tab");return V`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${ai("title",this.hass.language)}</div>
          <div class="version">${li}</div>
        </div>

        ${t&&i?V`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${Xn(this._fullController).map(t=>V`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${t.pages[0]}"
                      .active=${Qn(e.page).id===t.id}
                    >
                      ${ai(`panels.groups.${t.id}`,this.hass.language)}
                    </ha-tab-group-tab>
                  `)}
              </ha-tab-group>
            `:V`
              <div class="custom-tabs">
                ${Xn(this._fullController).map(t=>V`
                    <button
                      class="custom-tab ${Qn(e.page).id===t.id?"active":""}"
                      @click=${()=>this.navigateToPage(t.pages[0])}
                    >
                      ${ai(`panels.groups.${t.id}`,this.hass.language)}
                    </button>
                  `)}
              </div>
            `}
        ${this.renderSubTabs(e.page)}
      </div>
      <div class="view">${this.getView(e)}</div>
    `}renderSubTabs(e){const t=Qn(e);return t.pages.length<2?"":V`
      <div class="sub-tabs">
        ${t.pages.map(t=>V`
            <button
              class="sub-tab ${e===t?"active":""}"
              @click=${()=>this.navigateToPage(t)}
            >
              ${ai(`panels.${t}.title`,this.hass.language)}
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
            header="${ai("panels.help.cards.how-to-get-help.title",this.hass.language)}"
          >
            <div class="card-content">
              ${ai("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)}
              <a href="https://altmenorg.github.io/HAsmartirrigation/"
                >${ai("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
              >.
              ${ai("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
              <a
                href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
                >${ai("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
              >
              ${ai("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
              <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
                >${ai("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
              >
              (${ai("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
            </div></ha-card
          ><ha-card
            header="${ai("panels.help.cards.translate.title",this.hass.language)}"
          >
            <div class="card-content">
              ${ai("panels.help.cards.translate.text",this.hass.language)}
              <a
                href="https://hosted.weblate.org/engage/smart-irrigation/"
                target="_blank"
                rel="noreferrer"
                >${ai("panels.help.cards.translate.link",this.hass.language)}</a
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
        `}}navigateToPage(e){if(e!==xn().page){const t=kn(e);aa(0,t),this.requestUpdate()}else scrollTo(0,0)}async _readMode(){try{const e=await da(this.hass);this._fullController=!0===(null==e?void 0:e.full_controller)}catch(e){console.error("Could not read the configuration:",e)}}handlePageSelected(e){const t=e.detail.name,i=xn().page;if(t===i||Qn(t).id!==Qn(i).id)if(t!==i){const e=kn(t);aa(0,e),this.requestUpdate()}else scrollTo(0,0)}static get styles(){return[Zn,l`
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
             screen height is used (dvh follows the mobile address bar). */
          height: 100vh;
          height: 100dvh;
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
      `]}},i([ve({attribute:!1})],e.SmartIrrigationPanel.prototype,"hass",void 0),i([ve({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),i([fe()],e.SmartIrrigationPanel.prototype,"_languageReady",void 0),i([fe()],e.SmartIrrigationPanel.prototype,"_fullController",void 0),e.SmartIrrigationPanel=i([pe("smart-irrigation")],e.SmartIrrigationPanel);let er=class extends ce{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?V`
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
              .path=${Ta}
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
    `}};i([ve({attribute:!1})],er.prototype,"hass",void 0),i([fe()],er.prototype,"_params",void 0),er=i([pe("smart-irrigation-error-dialog")],er);var tr=Object.freeze({__proto__:null,get ErrorDialog(){return er}})}({});
//# sourceMappingURL=smart-irrigation.js.map
