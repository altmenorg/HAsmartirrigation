!function(t){"use strict";function e(t,e,i,s){var n,o=arguments.length,r=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(o<3?n(r):o>3?n(e,i,r):n(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const i=globalThis,s=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,n))(e)})(t):t
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,{is:l,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,_=globalThis,m=_.trustedTypes,g=m?m.emptyScript:"",f=_.reactiveElementPolyfillSupport,v=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);n?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(s)t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const s of e){const e=document.createElement("style"),n=i.litNonce;void 0!==n&&e.setAttribute("nonce",n),e.textContent=s.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const o=n.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const o=this.constructor;if(!1===s&&(n=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??y)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==n||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[v("elementProperties")]=new Map,b[v("finalized")]=new Map,f?.({ReactiveElement:b}),(_.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const A=globalThis,S=A.trustedTypes,E=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,x="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+C,z=`<${T}>`,P=document,O=()=>P.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,M="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,N=/>/g,I=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,D=/"/g,L=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),W=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),V=new WeakMap,Z=P.createTreeWalker(P,129);function F(t,e){if(!k(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":3===e?"<math>":"",r=H;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===H?"!--"===l[1]?r=R:void 0!==l[1]?r=N:void 0!==l[2]?(L.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=I):void 0!==l[3]&&(r=I):r===I?">"===l[0]?(r=n??H,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?I:'"'===l[3]?D:j):r===D||r===j?r=I:r===R||r===N?r=H:(r=I,n=void 0);const d=r===I&&t[e+1].startsWith("/>")?" ":"";o+=r===H?i+z:h>=0?(s.push(a),i.slice(0,h)+x+i.slice(h)+C+d):i+C+(-2===h?e:d)}return[F(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class K{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,a=this.parts,[l,h]=J(t,e);if(this.el=K.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(x)){const e=h[o++],i=s.getAttribute(t).split(C),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?tt:"?"===r[1]?et:"@"===r[1]?it:Y}),s.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(L.test(s.tagName)){const t=s.textContent.split(C),e=t.length-1;if(e>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),Z.nextNode(),a.push({type:2,index:++n});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===T)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(C,t+1));)a.push({type:7,index:n}),t+=C.length-1}n++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){if(e===W)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const o=U(e)?void 0:e._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=G(t,n._$AS(t,e.values),n,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);Z.currentNode=s;let n=Z.nextNode(),o=0,r=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new X(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=i[++r]}o!==a?.index&&(n=Z.nextNode(),o++)}return Z.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),U(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>k(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(F(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new K(t)),e}k(t){k(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new X(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Y{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=G(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==W,o&&(this._$AH=t);else{const s=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=G(this,s[i+r],e,r),a===W&&(a=this._$AH[r]),o||=!U(a)||a!==this._$AH[r],a===q?t=q:t!==q&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}o&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Y{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class et extends Y{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class it extends Y{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??q)===W)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const nt=A.litHtmlPolyfillSupport;nt?.(K,X),(A.litHtmlVersions??=[]).push("3.3.3");const ot=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class rt extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new X(e.insertBefore(O(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}rt._$litElement$=!0,rt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:rt});const at=ot.litElementPolyfillSupport;at?.({LitElement:rt}),(ot.litElementVersions??=[]).push("4.2.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const lt=t=>(e,i)=>{void 0!==i?i.addInitializer((()=>{customElements.define(t,e)})):customElements.define(t,e)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,ht={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:y},ct=(t=ht,e,i)=>{const{kind:s,metadata:n}=i;let o=globalThis.litPropertyMetadata.get(n);if(void 0===o&&globalThis.litPropertyMetadata.set(n,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,n,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];e.call(this,i),this.requestUpdate(s,n,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function dt(t){return(e,i)=>"object"==typeof i?ct(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function ut(t){return dt({...t,state:!0,attribute:!1})}const pt=t=>{const e=t<0?-t:0;return e>=.05?e:0};const _t=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sv","uk","zh-Hans"],mt={nb:"no",nn:"no"},gt={en:{next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"rain forecast",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water"}}},ft={};function vt(t){const e=t||"en";if(_t.includes(e))return e;const i=e.split("-")[0];return mt[i]?mt[i]:_t.includes(i)?i:"en"}async function $t(t){const e=vt(t);if(!(e in gt))return e in ft||(ft[e]=(async()=>{const t=new AbortController,i=setTimeout((()=>t.abort()),5e3);try{const i=`/api/smart_irrigation/languages/${e}.json?v=${encodeURIComponent("v2026.10.2")}`,s=await fetch(i,{signal:t.signal});if(!s.ok)throw new Error(`HTTP ${s.status}`);const n=await s.json();n&&"object"==typeof n.card&&(gt[e]=n.card)}catch(t){console.warn(`Smart Irrigation card: could not load the ${e} translation, falling back to English`,t)}finally{clearTimeout(i),delete ft[e]}})()),ft[e]}function yt(t){return vt(t)in gt}function wt(t,e){const i=e.split(".").reduce(((t,e)=>null==t?t:t[e]),t);return"string"==typeof i?i:void 0}function bt(t,e,i={}){var s,n;return(null!==(n=null!==(s=wt(gt[vt(t)],e))&&void 0!==s?s:wt(gt.en,e))&&void 0!==n?n:e).replace(/\{(\w+)\}/g,((t,e)=>{var s;return null!==(s=i[e])&&void 0!==s?s:""}))}const At="smart_irrigation",St=12e4;t.SmartIrrigationCard=class extends rt{constructor(){super(...arguments),this._zones=[],this._loaded=!1,this._info=null,this._busy=null,this._confirming=null,this._failures=0,this._onVisible=()=>{"visible"===document.visibilityState&&this._load()}}static async getConfigElement(){return await Promise.resolve().then((function(){return Ct})),document.createElement("smart-irrigation-card-editor")}static getStubConfig(){return{type:"custom:smart-irrigation-card",show_next_start:!0}}setConfig(t){this._config=Object.assign({show_next_start:!0},t)}getCardSize(){return 1+Math.max(this._zones.length,1)}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval((()=>{"visible"===document.visibilityState&&this._load()}),St),document.addEventListener("visibilitychange",this._onVisible)}disconnectedCallback(){var t;super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer),this._confirmTimer&&window.clearTimeout(this._confirmTimer),this._retryTimer&&window.clearTimeout(this._retryTimer),document.removeEventListener("visibilitychange",this._onVisible),null===(t=this._unsubscribe)||void 0===t||t.call(this),this._unsubscribe=void 0}updated(t){var e,i;t.has("hass")&&this.hass&&!this._unsubscribe&&(this._subscribe(),this._load()),t.has("hass")&&!yt(null===(e=this.hass)||void 0===e?void 0:e.language)&&$t(null===(i=this.hass)||void 0===i?void 0:i.language).then((()=>this.requestUpdate()))}async _subscribe(){try{this._unsubscribe=await this.hass.connection.subscribeMessage((()=>this._load()),{type:`${At}_config_updated`})}catch(t){}}async _load(){if(this.hass)try{const[t,e]=await Promise.all([this.hass.callWS({type:`${At}/zones`}),this.hass.callWS({type:`${At}/info`})]);this._zones=null!=t?t:[],this._info=e,this._loaded=!0,this._failures=0}catch(t){this._failures+=1,this._retryTimer&&window.clearTimeout(this._retryTimer),this._retryTimer=window.setTimeout((()=>this._load()),((t,e)=>{const i=[3e3,1e4,3e4];return t<=i.length?i[t-1]:e})(this._failures,St))}}_t(t,e={}){var i;return bt(null===(i=this.hass)||void 0===i?void 0:i.language,t,e)}_depth(t){var e,i,s;return((t,e)=>e?`${t.toFixed(2)} in`:`${t.toFixed(1)} mm`)(t,"mi"===(null===(s=null===(i=null===(e=this.hass)||void 0===e?void 0:e.config)||void 0===i?void 0:i.unit_system)||void 0===s?void 0:s.length))}_now(t){var e,i;return((t,e)=>{var i;return e&&"number"==typeof e.bucket?{bucket:e.bucket,duration:null!==(i=e.duration)&&void 0!==i?i:t.duration,live:!0}:{bucket:t.bucket,duration:t.duration,live:!1}})(t,null===(i=null===(e=this._info)||void 0===e?void 0:e.zone_estimates)||void 0===i?void 0:i[String(t.id)])}_duration(t){return(t=>{const e=Math.max(0,Math.round(t)),i=Math.floor(e/3600),s=Math.floor(e%3600/60),n=e%60;return(i?[i,s,n]:[s,n]).map(((t,e)=>e?String(t).padStart(2,"0"):String(t))).join(":")})(t)}_moment(t){var e,i,s;return((t,e,i,s=new Date)=>{const n=new Date(t);if(isNaN(n.getTime()))return t;const o=n.toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit"}),r=new Date(s);r.setHours(0,0,0,0);const a=Math.floor((n.getTime()-r.getTime())/864e5);return 0===a?o:1===a?`${i.tomorrow} ${o}`:-1===a?`${i.yesterday} ${o}`:`${n.toLocaleDateString(e,{day:"numeric",month:"short"})} ${o}`})(t,(null===(i=null===(e=this.hass)||void 0===e?void 0:e.locale)||void 0===i?void 0:i.language)||(null===(s=this.hass)||void 0===s?void 0:s.language)||"en",{tomorrow:this._t("tomorrow"),yesterday:this._t("yesterday")})}_momentOrEmpty(t){return t?this._moment(t):""}_zonesToShow(){var t,e;const i=null===(t=this._config)||void 0===t?void 0:t.zones,s=i&&i.length?this._zones.filter((t=>i.includes(t.id))):this._zones;return(null===(e=this._config)||void 0===e?void 0:e.compact)?s.filter((t=>this._needs(t))):s}_needs(t){var e;const i=this._now(t);return pt(i.bucket)>(null!==(e=t.irrigation_threshold)&&void 0!==e?e:0)&&i.duration>0}_waterButton(t){var e,i;if(t.linked_entity)return((t,e,i,s,n="smart_irrigation")=>{var o;if(!t||!e)return;const r=`_zone_${i}`;for(const i of Object.values(t)){if(i.platform!==n||i.translation_key!==s)continue;const t=i.device_id?e[i.device_id]:void 0,a=null!==(o=null==t?void 0:t.identifiers)&&void 0!==o?o:[];for(const[t,e]of a)if(t===n&&String(e).endsWith(r))return i.entity_id}})(null===(e=this.hass)||void 0===e?void 0:e.entities,null===(i=this.hass)||void 0===i?void 0:i.devices,t.id,"irrigate_now")}_waterPressed(t,e){if(this._confirming!==t.id)return this._confirming=t.id,this._confirmTimer&&window.clearTimeout(this._confirmTimer),void(this._confirmTimer=window.setTimeout((()=>{this._confirming=null}),5e3));this._confirmTimer&&window.clearTimeout(this._confirmTimer),this._confirming=null,this._water(t,e)}async _water(t,e){this._busy=t.id;try{await this.hass.callService("button","press",{entity_id:e})}finally{this._busy=null}}async _calculate(t){this._busy=t.id;try{await this.hass.callApi("POST",`${At}/zones`,{id:String(t.id),calculate:!0,override_cache:!0}),await this._load()}finally{this._busy=null}}_nextStart(){var t,e,i;if(!(null===(t=this._config)||void 0===t?void 0:t.show_next_start)||!this._info)return Et;const s=null===(e=this._info.skip_preview)||void 0===e?void 0:e.should_skip,n=this._info.next_irrigation_start,o=s?this._t("skipped"):n?this._moment(n):this._t("no_start"),r=s?null===(i=this._info.skip_preview)||void 0===i?void 0:i.reason:null;return B`
      <div class="next ${s?"held":""}">
        <ha-icon
          icon=${s?"mdi:calendar-remove":"mdi:calendar-clock"}
        ></ha-icon>
        <span class="next-label">${this._t("next_start")}</span>
        <span class="next-value"
          >${o}${r?` (${this._t(`reasons.${r}`)})`:""}</span
        >
      </div>
    `}_zoneRow(t){var e,i,s,n;const o=null!==(e=t.irrigation_threshold)&&void 0!==e?e:0,r=this._waterButton(t),a=this._now(t),l=pt(a.bucket),h=l>o&&a.duration>0;return B`
      <div class="zone">
        <div class="zone-name">
          ${t.name}
          ${"automatic"!==t.state?B`<span class="chip">${this._t(t.state)}</span>`:""}
        </div>
        <div class="zone-state ${h?"needed":""}">
          ${l>0?this._t("short_by",{value:this._depth(l)}):this._t("no_need")}
          ${h?B`&middot;
              ${this._t("runs_for",{duration:this._duration(a.duration)})}`:""}
          ${a.live?B`<ha-icon
                class="live"
                icon="mdi:access-point"
                title=${this._t("live_since",{when:this._momentOrEmpty(null===(n=null===(s=null===(i=this._info)||void 0===i?void 0:i.zone_estimates)||void 0===s?void 0:s[String(t.id)])||void 0===n?void 0:n.since)})}
              ></ha-icon>`:""}
        </div>
        <div class="zone-last">
          ${t.last_irrigation?this._t("last_watered",{when:this._moment(t.last_irrigation)}):this._t("never_watered")}
        </div>
        <div class="actions">
          ${r?B`<ha-icon-button
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
    `}render(){var t;if(!this._config||!this.hass)return B``;const e=this._zonesToShow();return B`
      <ha-card .header=${null!==(t=this._config.title)&&void 0!==t?t:"Smart Irrigation"}>
        <div class="content">
          ${this._nextStart()}
          ${e.length?e.map((t=>this._zoneRow(t))):B`<div class="empty">
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
  `,e([dt({attribute:!1})],t.SmartIrrigationCard.prototype,"hass",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_config",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_zones",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_loaded",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_info",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_busy",void 0),e([ut()],t.SmartIrrigationCard.prototype,"_confirming",void 0),t.SmartIrrigationCard=e([lt("smart-irrigation-card")],t.SmartIrrigationCard);const Et=B``;window.customCards=window.customCards||[],window.customCards.push({type:"smart-irrigation-card",name:"Smart Irrigation",description:"What each zone is short of, how long it would run, and when the water goes on.",preview:!0,documentationURL:"https://altmenorg.github.io/HAsmartirrigation/"});let xt=class extends rt{constructor(){super(...arguments),this._config={type:"custom:smart-irrigation-card"},this._zones=[]}setConfig(t){this._config=Object.assign({show_next_start:!0,compact:!1},t)}updated(t){var e,i;t.has("hass")&&this.hass&&!this._zones.length&&this._loadZones(),t.has("hass")&&!yt(null===(e=this.hass)||void 0===e?void 0:e.language)&&$t(null===(i=this.hass)||void 0===i?void 0:i.language).then((()=>this.requestUpdate()))}async _loadZones(){try{const t=await this.hass.callWS({type:"smart_irrigation/zones"});this._zones=(null!=t?t:[]).map((t=>({id:t.id,name:t.name})))}catch(t){}}_label(t){var e;return bt(null===(e=this.hass)||void 0===e?void 0:e.language,`editor.${t}`)}get _schema(){return[{name:"title",selector:{text:{}}},{name:"zones",selector:{select:{multiple:!0,mode:"list",options:this._zones.map((t=>({value:t.id,label:t.name})))}}},{name:"show_next_start",selector:{boolean:{}}},{name:"compact",selector:{boolean:{}}}]}_valueChanged(t){var e;t.stopPropagation();const i=Object.assign(Object.assign({},this._config),t.detail.value);(null===(e=i.zones)||void 0===e?void 0:e.length)||delete i.zones,i.title||delete i.title,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}render(){return this.hass?B`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${t=>this._label(t.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:B``}};e([dt({attribute:!1})],xt.prototype,"hass",void 0),e([ut()],xt.prototype,"_config",void 0),e([ut()],xt.prototype,"_zones",void 0),xt=e([lt("smart-irrigation-card-editor")],xt);var Ct=Object.freeze({__proto__:null,get SmartIrrigationCardEditor(){return xt}})}({});
//# sourceMappingURL=smart-irrigation-card.js.map
