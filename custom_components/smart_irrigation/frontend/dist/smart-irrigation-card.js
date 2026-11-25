!function(t){"use strict";function e(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const i=globalThis,s=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),r=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:h,getOwnPropertyDescriptor:d,getOwnPropertyNames:c,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,_=globalThis,m=_.trustedTypes,g=m?m.emptyScript:"",v=_.reactiveElementPolyfillSupport,f=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:y};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...c(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(s)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of e){const e=document.createElement("style"),o=i.litNonce;void 0!==o&&e.setAttribute("nonce",o),e.textContent=s.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??y)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[f("elementProperties")]=new Map,b[f("finalized")]=new Map,v?.({ReactiveElement:b}),(_.reactiveElementVersions??=[]).push("2.1.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const S=globalThis,A=t=>t,x=S.trustedTypes,E=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+z,P=`<${T}>`,k=document,O=()=>k.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,M="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,I=/>/g,j=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,D=/"/g,L=/^(?:script|style|textarea|title)$/i,W=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),q=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),F=new WeakMap,Z=k.createTreeWalker(k,129);function J(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=R;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===R?"!--"===l[1]?n=H:void 0!==l[1]?n=I:void 0!==l[2]?(L.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=j):void 0!==l[3]&&(n=j):n===j?">"===l[0]?(n=o??R,h=-1):void 0===l[1]?h=-2:(h=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?j:'"'===l[3]?D:B):n===D||n===B?n=j:n===H||n===I?n=R:(n=j,o=void 0);const c=n===j&&t[e+1].startsWith("/>")?" ":"";r+=n===R?i+P:h>=0?(s.push(a),i.slice(0,h)+C+i.slice(h)+z+c):i+z+(-2===h?e:c)}return[J(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class G{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,h]=K(t,e);if(this.el=G.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=h[r++],i=s.getAttribute(t).split(z),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(z)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(L.test(s.tagName)){const t=s.textContent.split(z),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),Z.nextNode(),a.push({type:2,index:++o});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===T)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(z,t+1));)a.push({type:7,index:o}),t+=z.length-1}o++}}static createElement(t,e){const i=k.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===q)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=U(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=Q(t,o._$AS(t,e.values),o,s)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??k).importNode(e,!0);Z.currentNode=s;let o=Z.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new Y(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new ot(o,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(o=Z.nextNode(),r++)}return Z.currentNode=k,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),U(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new X(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new G(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Y(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=Q(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==q,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=Q(this,s[i+n],e,n),a===q&&(a=this._$AH[n]),r||=!U(a)||a!==this._$AH[n],a===V?t=V:t!==V&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class st extends tt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??V)===q)return;const i=this._$AH,s=t===V&&i!==V||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==V&&(i===V||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const rt=S.litHtmlPolyfillSupport;rt?.(G,Y),(S.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class at extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new Y(e.insertBefore(O(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:y},ct=(t=dt,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function ut(t){return(e,i)=>"object"==typeof i?ct(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function pt(t){return ut({...t,state:!0,attribute:!1})}const _t={comma_decimal:["de","es","it"],decimal_point:["en-US","en-CA","en-GB"],space_comma:["fr","sv","cs"],system:void 0},mt=(t,e,i,s)=>{if(!Number.isFinite(t))return String(t);const o=null==i?void 0:i.number_format;if("none"===o)return t.toFixed(e);const r=o&&o in _t?_t[o]:(null==i?void 0:i.language)||s||void 0;try{const i=new Intl.NumberFormat(r,{minimumFractionDigits:e,maximumFractionDigits:e}).format(t);return/^-0([.,\s]0*)?$/.test(i)?i.slice(1):i}catch(i){return t.toFixed(e)}},gt=t=>{const e=t<0?-t:0;return e>=.05?e:0},vt=(t,e,i,s)=>e?`${mt(t,2,i,s)} in`:`${mt(t,1,i,s)} mm`,ft=t=>{const e=Math.max(0,Math.round(Number(t)||0)),i=Math.floor(e/3600),s=Math.floor(e%3600/60),o=e%60;return i>0?`${i} h ${String(s).padStart(2,"0")} min`:s>0?o?`${s} min ${o} s`:`${s} min`:`${o} s`},$t=["running","waiting","paused"],yt=t=>t.name||t.program_id;const wt=t=>[...(null==t?void 0:t.valves)||[],...(null==t?void 0:t.paused)&&(null==t?void 0:t.held)||[]];const bt=["cs","da","de","es","fi","fr","hu","it","nl","no","pl","pt","pt-BR","ru","sk","sl","sv","uk","zh-Hans","zh-Hant"],St={nb:"no",nn:"no"},At={en:{next_start:"Next start",no_start:"No start scheduled",skipped:"Held back",short_by:"short {value}",no_need:"no watering needed",manual_runs:"waters {duration} at every start",manual_no_duration:"no duration entered, not watered",not_calculated:"not calculated yet",runs_for:"would run {duration}",never_watered:"never watered",last_watered:"last watered {when}",calculate:"Calculate now",water_now:"Water now",confirm_water:"Tap again to water now",watering:"Watering",nothing_to_water:"Nothing to water right now",loading:"Reading the zones…",manual:"manual",disabled:"disabled",no_zones:"No zones yet. Open the Smart Irrigation panel to add one.",tomorrow:"tomorrow",yesterday:"yesterday",live_since:"Estimated now, from the readings since {when}",reasons:{precipitation:"expected rainfall",precipitation_amount:"expected rainfall: {amount}",days_between:"days between irrigation",rain_sensor:"rain sensor",freeze:"freeze",wind:"wind",soil_moisture:"soil moisture",postponed:"postponed"},programs:{title:"Programs",start:"Start",stop:"Stop",confirm_stop:"Tap again to stop",pause:"Pause",resume:"Resume",next_step:"Next step",step_of:"step {step}/{steps}",remaining:"{time} left",until:"until {when}",states:{idle:"idle",running:"running",waiting:"waiting",paused:"paused",suspended:"suspended"},after:"starts after {name}",next_in_line:"starts next"},editor:{title:"Title",zones:"Zones (all of them when empty)",show_next_start:"Show the next start",compact:"Only the zones that would water",show_programs:"Show the programs"},no_valve:"no valve linked, not watered",no_trigger:"No start trigger",not_scheduled:"Owed, but not scheduled",off:"Switched off",watering_left:"watering, {time} left",paused_left:"paused, {time} left",soaking:"soaking, next pass at {when} ({pass}/{passes})",pass_of:"pass {pass}/{passes}"}},xt={};function Et(t){const e=t||"en";if(bt.includes(e))return e;const i=e.split("-")[0];return St[i]?St[i]:bt.includes(i)?i:"en"}async function Ct(t){const e=Et(t);if(!(e in At))return e in xt||(xt[e]=(async()=>{const t=new AbortController,i=setTimeout(()=>t.abort(),5e3);try{const i=`/api/smart_irrigation/languages/${e}.json?v=${encodeURIComponent("v2026.11.2-beta6")}`,s=await fetch(i,{signal:t.signal});if(!s.ok)throw new Error(`HTTP ${s.status}`);const o=await s.json();o&&"object"==typeof o.card&&(At[e]=o.card)}catch(t){console.warn(`Smart Irrigation card: could not load the ${e} translation, falling back to English`,t)}finally{clearTimeout(i),delete xt[e]}})()),xt[e]}function zt(t){return Et(t)in At}function Tt(t,e){const i=e.split(".").reduce((t,e)=>null==t?t:t[e],t);return"string"==typeof i?i:void 0}function Pt(t,e,i={}){var s,o;return(null!==(o=null!==(s=Tt(At[Et(t)],e))&&void 0!==s?s:Tt(At.en,e))&&void 0!==o?o:e).replace(/\{(\w+)\}/g,(t,e)=>{var s;return null!==(s=i[e])&&void 0!==s?s:""})}const kt="smart_irrigation",Ot=12e4;t.SmartIrrigationCard=class extends at{constructor(){super(...arguments),this._zones=[],this._loaded=!1,this._info=null,this._busy=null,this._confirming=null,this._programs=[],this._confirmingStop=null,this._live=null,this._programsUnsupported=!1,this._programsStarted=!1,this._failures=0,this._onVisible=()=>{"visible"===document.visibilityState&&(this._load(),this._loadPrograms())}}static async getConfigElement(){return await Promise.resolve().then(function(){return Mt}),document.createElement("smart-irrigation-card-editor")}static getStubConfig(){return{type:"custom:smart-irrigation-card",show_next_start:!0}}setConfig(t){this._config=Object.assign({show_next_start:!0,show_programs:!0},t),this.hass&&this._programsStarted&&this._loadPrograms()}getCardSize(){return 1+Math.max(this._zones.length,1)}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{"visible"===document.visibilityState&&this._load()},Ot),document.addEventListener("visibilitychange",this._onVisible),this.hass&&!this._programsStarted&&(this._programsStarted=!0,this._loadPrograms())}disconnectedCallback(){var t;super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer),this._confirmTimer&&window.clearTimeout(this._confirmTimer),this._retryTimer&&window.clearTimeout(this._retryTimer),this._confirmStopTimer&&window.clearTimeout(this._confirmStopTimer),this._programsTimer&&window.clearTimeout(this._programsTimer),this._programsTimer=void 0,this._programsStarted=!1,document.removeEventListener("visibilitychange",this._onVisible),null===(t=this._unsubscribe)||void 0===t||t.call(this),this._unsubscribe=void 0}async _loadPrograms(){var t,e,i;if(this._programsTimer&&window.clearTimeout(this._programsTimer),this._programsTimer=void 0,this.hass&&this.isConnected&&!1!==(null===(t=this._config)||void 0===t?void 0:t.show_programs)&&!this._programsUnsupported){if("visible"===document.visibilityState)try{const t=await this.hass.callWS({type:`${kt}/programs_state`});this._programs=null!==(e=null==t?void 0:t.programs)&&void 0!==e?e:[],this._live=null!==(i=null==t?void 0:t.live)&&void 0!==i?i:null}catch(t){if("unknown_command"===(null==t?void 0:t.code))return this._programsUnsupported=!0,void(this._programs=[])}var s,o,r;if(this.isConnected)this._programsTimer=window.setTimeout(()=>this._loadPrograms(),(r=this._programs,s=!!(null==r?void 0:r.some(t=>{var e;return $t.includes(null!==(e=t.state)&&void 0!==e?e:"")}))||!!(o=this._live)&&(!0===o.paused||!!o.cycle||(o.valves||[]).length>0||(o.soaking||[]).length>0||(o.starting||[]).length>0||(o.programs||[]).some(t=>"running"===t.state)),s?5e3:6e4))}}async _programAction(t,e={}){try{await this.hass.callService(kt,t,e)}finally{this._loadPrograms()}}_stopPressed(t){if(this._confirmingStop!==t.program_id)return this._confirmingStop=t.program_id,this._confirmStopTimer&&window.clearTimeout(this._confirmStopTimer),void(this._confirmStopTimer=window.setTimeout(()=>{this._confirmingStop=null},5e3));this._confirmStopTimer&&window.clearTimeout(this._confirmStopTimer),this._confirmingStop=null,this._programAction("stop_watering")}updated(t){var e,i;t.has("hass")&&this.hass&&!this._unsubscribe&&(this._subscribe(),this._load()),t.has("hass")&&this.hass&&!this._programsStarted&&(this._programsStarted=!0,this._loadPrograms()),t.has("hass")&&!zt(null===(e=this.hass)||void 0===e?void 0:e.language)&&Ct(null===(i=this.hass)||void 0===i?void 0:i.language).then(()=>this.requestUpdate())}async _subscribe(){try{this._unsubscribe=await this.hass.connection.subscribeMessage(()=>this._load(),{type:`${kt}_config_updated`})}catch(t){}}async _load(){if(this.hass)try{const[t,e]=await Promise.all([this.hass.callWS({type:`${kt}/zones`}),this.hass.callWS({type:`${kt}/info`})]);this._zones=null!=t?t:[],this._info=e,this._loaded=!0,this._failures=0}catch(t){this._failures+=1,this._retryTimer&&window.clearTimeout(this._retryTimer),this._retryTimer=window.setTimeout(()=>this._load(),((t,e)=>{const i=[3e3,1e4,3e4];return t<=i.length?i[t-1]:e})(this._failures,Ot))}}_t(t,e={}){var i;return Pt(null===(i=this.hass)||void 0===i?void 0:i.language,t,e)}_depth(t){var e,i,s,o,r;return vt(t,"mi"===(null===(s=null===(i=null===(e=this.hass)||void 0===e?void 0:e.config)||void 0===i?void 0:i.unit_system)||void 0===s?void 0:s.length),null===(o=this.hass)||void 0===o?void 0:o.locale,null===(r=this.hass)||void 0===r?void 0:r.language)}_now(t){var e,i;return((t,e)=>{var i;return e&&"number"==typeof e.bucket?{bucket:e.bucket,duration:null!==(i=e.duration)&&void 0!==i?i:t.duration,live:!0}:{bucket:t.bucket,duration:t.duration,live:!1}})(t,null===(i=null===(e=this._info)||void 0===e?void 0:e.zone_estimates)||void 0===i?void 0:i[String(t.id)])}_duration(t){return(t=>{const e=Math.max(0,Math.round(Number(t)||0));return ft(e>=600?60*Math.ceil(e/60):e)})(t)}_moment(t){var e,i,s;return((t,e,i,s=new Date)=>{const o=new Date(t);if(isNaN(o.getTime()))return t;const r=o.toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit"}),n=new Date(s);n.setHours(0,0,0,0);const a=Math.floor((o.getTime()-n.getTime())/864e5);return 0===a?r:1===a?`${i.tomorrow} ${r}`:-1===a?`${i.yesterday} ${r}`:`${o.toLocaleDateString(e,{day:"numeric",month:"short"})} ${r}`})(t,(null===(i=null===(e=this.hass)||void 0===e?void 0:e.locale)||void 0===i?void 0:i.language)||(null===(s=this.hass)||void 0===s?void 0:s.language)||"en",{tomorrow:this._t("tomorrow"),yesterday:this._t("yesterday")})}_momentOrEmpty(t){return t?this._moment(t):""}_zonesToShow(){var t,e;const i=null===(t=this._config)||void 0===t?void 0:t.zones,s=i&&i.length?this._zones.filter(t=>i.includes(t.id)):this._zones;return(null===(e=this._config)||void 0===e?void 0:e.compact)?s.filter(t=>this._needs(t)):s}_needs(t){var e;const i=this._now(t);return gt(i.bucket)>(null!==(e=t.irrigation_threshold)&&void 0!==e?e:0)&&i.duration>0}_waterButton(t){var e,i;if(t.linked_entity)return((t,e,i,s,o="smart_irrigation")=>{var r;if(!t||!e)return;const n=`_zone_${i}`;for(const i of Object.values(t)){if(i.platform!==o||i.translation_key!==s)continue;const t=i.device_id?e[i.device_id]:void 0,a=null!==(r=null==t?void 0:t.identifiers)&&void 0!==r?r:[];for(const[t,e]of a)if(t===o&&String(e).endsWith(n))return i.entity_id}})(null===(e=this.hass)||void 0===e?void 0:e.entities,null===(i=this.hass)||void 0===i?void 0:i.devices,t.id,"irrigate_now")}_waterPressed(t,e){if(this._confirming!==t.id)return this._confirming=t.id,this._confirmTimer&&window.clearTimeout(this._confirmTimer),void(this._confirmTimer=window.setTimeout(()=>{this._confirming=null},5e3));this._confirmTimer&&window.clearTimeout(this._confirmTimer),this._confirming=null,this._water(t,e)}async _water(t,e){this._busy=t.id;try{await this.hass.callService("button","press",{entity_id:e})}finally{this._busy=null}}async _calculate(t){this._busy=t.id;try{await this.hass.callApi("POST",`${kt}/zones`,{id:String(t.id),calculate:!0,override_cache:!0}),await this._load()}finally{this._busy=null}}_openZone(t,e){t.preventDefault(),window.history.pushState(null,"",`/${kt}/zones/zone/${e}`),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))}_nextStart(){var t,e,i,s,o,r,n;if(!(null===(t=this._config)||void 0===t?void 0:t.show_next_start)||!this._info)return Ut;const a=(t=>{var e,i;if(!1===(null==t?void 0:t.irrigation_enabled))return"off";const s=!!(null==t?void 0:t.start_source)&&"trigger"!==t.start_source;return s||"none"!==(null==t?void 0:t.active_start_trigger)?(null===(e=null==t?void 0:t.skip_preview)||void 0===e?void 0:e.should_skip)?"skipped":s||!1!==(null==t?void 0:t.start_trigger_armed)?(null==t?void 0:t.next_irrigation_start)?"start":"no_start":(null!==(i=null==t?void 0:t.next_irrigation_zones)&&void 0!==i?i:[]).length?"not_scheduled":"nothing":"no_trigger"})(this._info),l="skipped"===a,h=this._info.next_irrigation_start,d="start"===a?this._moment(h):this._t({off:"off",no_trigger:"no_trigger",skipped:"skipped",not_scheduled:"not_scheduled",nothing:"nothing_to_water",no_start:"no_start"}[a]),c=l?null===(e=this._info.skip_preview)||void 0===e?void 0:e.reason:null,u="precipitation"===c?null===(o=null===(s=null===(i=this._info.skip_preview)||void 0===i?void 0:i.checks)||void 0===s?void 0:s.find(t=>t.id===c))||void 0===o?void 0:o.expected_mm:null,p=c?null!=u?this._t("reasons.precipitation_amount",{amount:vt(u,!1,null===(r=this.hass)||void 0===r?void 0:r.locale,null===(n=this.hass)||void 0===n?void 0:n.language)}):this._t(`reasons.${c}`):"",_="start"!==a&&"nothing"!==a;return W`
      <div class="next ${_?"held":""}">
        <ha-icon
          icon=${_?"mdi:calendar-remove":"mdi:calendar-clock"}
        ></ha-icon>
        <span class="next-label">${this._t("next_start")}</span>
        <span class="next-value"
          >${d}${p?` (${p})`:""}</span
        >
      </div>
    `}_zoneRow(t){var e,i,s,o,r;const n=null!==(e=t.irrigation_threshold)&&void 0!==e?e:0,a=this._waterButton(t),l=this._now(t),h=gt(l.bucket),d=((t,e)=>{var i;return(null!==(i=null==t?void 0:t.zones_without_valve)&&void 0!==i?i:[]).some(t=>Number(t.id)===Number(e))})(this._info,t.id),c=(t=>"manual"===t.state?Math.max(0,Number(t.duration)||0):null)(t),u=null===c&&h>n&&l.duration>0&&!d,p=(_=this._live,null==(m=t.id)?void 0:wt(_).find(t=>Number(t.zone_id)===Number(m)));var _,m;const g=((t,e)=>null==e?void 0:((null==t?void 0:t.soaking)||[]).find(t=>Number(t.zone_id)===Number(e)))(this._live,t.id);return g?W`
        <div class="zone">
          <div class="zone-name">
            ${t.name}
            ${"automatic"!==t.state?W`<span class="chip">${this._t(t.state)}</span>`:""}
          </div>
          <div class="zone-state needed running">
            ${this._t("soaking",{when:this._moment(g.until),pass:String(g.next_pass),passes:String(g.passes)})}
          </div>
          <progress
            class="program-bar"
            max="100"
            .value=${g.percent}
          ></progress>
        </div>
      `:p?W`
        <div class="zone">
          <div class="zone-name">
            ${t.name}
            ${"automatic"!==t.state?W`<span class="chip">${this._t(t.state)}</span>`:""}
          </div>
          <div class="zone-state needed running">
            ${this._t((null===(i=this._live)||void 0===i?void 0:i.paused)?"paused_left":"watering_left",{time:this._duration(p.remaining_seconds)})}${p.passes?` · ${this._t("pass_of",{pass:String(p.pass),passes:String(p.passes)})}`:""}
          </div>
          <progress
            class="program-bar"
            max="100"
            .value=${p.percent}
          ></progress>
        </div>
      `:W`
      <div class="zone">
        <div class="zone-name">
          ${t.name}
          ${"automatic"!==t.state?W`<span class="chip">${this._t(t.state)}</span>`:""}
        </div>
        <div class="zone-state ${u?"needed":""}">
          ${null===c||d?null!==c?"":h>0?this._t("short_by",{value:this._depth(h)}):function(t){var e;return"automatic"===t.state&&!t.last_calculated&&!(null===(e=t.calculation_problem)||void 0===e?void 0:e.code)}(t)&&!l.live?this._t("not_calculated"):this._t("no_need"):c>0?this._t("manual_runs",{duration:ft(c)}):this._t("manual_no_duration")}
          ${u?W`&middot;
              ${this._t("runs_for",{duration:ft(l.duration)})}`:""}
          ${d?W`${null!==c?"":W`&middot;`}
                <a
                  class="no-valve"
                  href="/${kt}/zones/zone/${t.id}"
                  @click=${e=>this._openZone(e,t.id)}
                  >${this._t("no_valve")}</a
                >`:""}
          ${l.live?W`<ha-icon
                class="live"
                icon="mdi:access-point"
                title=${this._t("live_since",{when:this._momentOrEmpty(null===(r=null===(o=null===(s=this._info)||void 0===s?void 0:s.zone_estimates)||void 0===o?void 0:o[String(t.id)])||void 0===r?void 0:r.since)})}
              ></ha-icon>`:""}
        </div>
        <div class="zone-last">
          ${t.last_irrigation?this._t("last_watered",{when:this._moment(t.last_irrigation)}):this._t("never_watered")}
        </div>
        <div class="actions">
          ${a?W`<ha-icon-button
                class=${this._confirming===t.id?"confirming":""}
                .disabled=${this._busy===t.id}
                .label=${this._t(this._confirming===t.id?"confirm_water":"water_now")}
                title=${this._t(this._confirming===t.id?"confirm_water":"water_now")}
                @click=${()=>this._waterPressed(t,a)}
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
    `}_programButton(t,e,i,s=!1){return W`<ha-icon-button
      class=${s?"confirming":""}
      .label=${e}
      title=${e}
      @click=${i}
    >
      <ha-icon icon=${t}></ha-icon>
    </ha-icon-button>`}_programRow(t){var e;const i=t.live,s="running"===t.state,o="paused"===t.state,r="waiting"===t.state,n=s||o||r,a=!n&&"idle"===t.state&&!1!==t.can_run,l=this._confirmingStop===t.program_id;let h="";if(s||o){const t=[];o&&(null===(e=this._live)||void 0===e?void 0:e.paused_until)&&t.push(this._t("programs.until",{when:this._moment(this._live.paused_until)})),i&&i.steps&&t.push(this._t("programs.step_of",{step:String(i.step),steps:String(i.steps)})),i&&t.push(`${i.percent} %`),i&&null!=i.remaining_seconds&&t.push(this._t("programs.remaining",{time:this._duration(i.remaining_seconds)}));const s=wt(this._live);!i&&s.length&&(t.push(s.map(t=>t.zone).filter(Boolean).join(", ")),t.push(this._t("programs.remaining",{time:this._duration(Math.max(...s.map(t=>t.remaining_seconds)))}))),h=t.join(" · ")}else if(r){const e=(this._programs||[]).find(e=>e.program_id!==t.program_id&&("running"===e.state||"paused"===e.state));h=e?this._t("programs.after",{name:yt(e)}):this._t("programs.next_in_line")}else h="suspended"===t.state&&t.suspended_until?this._t("programs.until",{when:this._moment(t.suspended_until)}):t.next_start?`${this._t("next_start")} ${this._moment(t.next_start)}`:this._t("no_start");return l&&(h=this._t("programs.confirm_stop")),W`
      <div class="zone program">
        <div class="zone-name">
          ${yt(t)}
          ${"idle"===t.state?"":W`<span class="chip ${s?"on":""}"
                >${this._t(`programs.states.${t.state}`)}</span
              >`}
        </div>
        <div
          class="zone-state ${s?"needed":""} ${l?"confirm":""}"
        >
          ${h}
        </div>
        ${s&&i?W`<progress
              class="program-bar"
              max="100"
              .value=${i.percent}
            ></progress>`:""}
        <div class="actions">
          ${a?this._programButton("mdi:play",this._t("programs.start"),()=>this._programAction("run_program",{program_id:t.program_id})):""}
          ${s?this._programButton("mdi:pause",this._t("programs.pause"),()=>this._programAction("pause_watering")):""}
          ${o?this._programButton("mdi:play-pause",this._t("programs.resume"),()=>this._programAction("resume_watering")):""}
          ${s||o?this._programButton("mdi:skip-next",this._t("programs.next_step"),()=>this._programAction("next_step")):""}
          ${n?this._programButton("mdi:stop",this._t(l?"programs.confirm_stop":"programs.stop"),()=>this._stopPressed(t),l):""}
        </div>
      </div>
    `}_programsBlock(){var t;return!1!==(null===(t=this._config)||void 0===t?void 0:t.show_programs)&&this._programs.length?W`
      <div class="programs">
        <div class="programs-title">${this._t("programs.title")}</div>
        ${this._programs.map(t=>this._programRow(t))}
      </div>
    `:W``}render(){var t;if(!this._config||!this.hass)return W``;const e=this._zonesToShow();return W`
      <ha-card .header=${null!==(t=this._config.title)&&void 0!==t?t:"Smart Irrigation"}>
        <div class="content">
          ${this._nextStart()} ${this._programsBlock()}
          ${e.length?e.map(t=>this._zoneRow(t)):W`<div class="empty">
                ${this._t(this._zones.length?"nothing_to_water":"no_zones")}
              </div>`}
        </div>
      </ha-card>
    `}},t.SmartIrrigationCard.styles=((t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,o)})`
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
    .zone-state .no-valve {
      color: var(--error-color, #db4437);
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
      color: var(--error-color, #db4437);
    }
    .zone-state.confirm {
      color: var(--error-color, #db4437);
    }
    .zone-state.running {
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
    .programs {
      border-bottom: 1px solid var(--divider-color);
    }
    .programs-title {
      padding: 10px 0 0 0;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--secondary-text-color);
    }
    .program {
      grid-template-areas: "name button" "state button" "bar button";
    }
    .program:last-child {
      border-bottom: none;
    }
    .chip.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .program-bar {
      grid-area: bar;
      width: 100%;
      height: 6px;
      margin-top: 4px;
    }
    .empty {
      padding: 12px 0;
      color: var(--secondary-text-color);
    }
  `,e([ut({attribute:!1})],t.SmartIrrigationCard.prototype,"hass",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_config",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_zones",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_loaded",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_info",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_busy",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_confirming",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_programs",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_confirmingStop",void 0),e([pt()],t.SmartIrrigationCard.prototype,"_live",void 0),t.SmartIrrigationCard=e([ht("smart-irrigation-card")],t.SmartIrrigationCard);const Ut=W``;window.customCards=window.customCards||[],window.customCards.push({type:"smart-irrigation-card",name:"Smart Irrigation",description:"What each zone is short of, how long it would run, and when the water goes on.",preview:!0,documentationURL:"https://altmenorg.github.io/HAsmartirrigation/"});let Nt=class extends at{constructor(){super(...arguments),this._config={type:"custom:smart-irrigation-card"},this._zones=[]}setConfig(t){this._config=Object.assign({show_next_start:!0,compact:!1,show_programs:!0},t)}updated(t){var e,i;t.has("hass")&&this.hass&&!this._zones.length&&this._loadZones(),t.has("hass")&&!zt(null===(e=this.hass)||void 0===e?void 0:e.language)&&Ct(null===(i=this.hass)||void 0===i?void 0:i.language).then(()=>this.requestUpdate())}async _loadZones(){try{const t=await this.hass.callWS({type:"smart_irrigation/zones"});this._zones=(null!=t?t:[]).map(t=>({id:t.id,name:t.name}))}catch(t){}}_label(t){var e;return Pt(null===(e=this.hass)||void 0===e?void 0:e.language,`editor.${t}`)}get _schema(){return[{name:"title",selector:{text:{}}},{name:"zones",selector:{select:{multiple:!0,mode:"list",options:this._zones.map(t=>({value:t.id,label:t.name}))}}},{name:"show_next_start",selector:{boolean:{}}},{name:"compact",selector:{boolean:{}}},{name:"show_programs",selector:{boolean:{}}}]}_valueChanged(t){var e;t.stopPropagation();const i=Object.assign(Object.assign({},this._config),t.detail.value);(null===(e=i.zones)||void 0===e?void 0:e.length)||delete i.zones,i.title||delete i.title,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}render(){return this.hass?W`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${t=>this._label(t.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `:W``}};e([ut({attribute:!1})],Nt.prototype,"hass",void 0),e([pt()],Nt.prototype,"_config",void 0),e([pt()],Nt.prototype,"_zones",void 0),Nt=e([ht("smart-irrigation-card-editor")],Nt);var Mt=Object.freeze({__proto__:null,get SmartIrrigationCardEditor(){return Nt}})}({});
//# sourceMappingURL=smart-irrigation-card.js.map
