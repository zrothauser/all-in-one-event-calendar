/**
 * @license RequireJS domReady 2.0.0 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.3
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: popover.js v3.0.3
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.3
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

timely.define("domReady",[],function(){function u(e){var t;for(t=0;t<e.length;t++)e[t](n)}function a(){var e=r;t&&e.length&&(r=[],u(e))}function f(){t||(t=!0,o&&clearInterval(o),a())}function c(e){return t?e(n):r.push(e),c}var e=typeof window!="undefined"&&window.document,t=!e,n=e?document:null,r=[],i,s,o;if(e){if(document.addEventListener)document.addEventListener("DOMContentLoaded",f,!1),window.addEventListener("load",f,!1);else if(window.attachEvent){window.attachEvent("onload",f),s=document.createElement("div");try{i=window.frameElement===null}catch(l){}s.doScroll&&i&&window.external&&(o=setInterval(function(){try{s.doScroll(),f()}catch(e){}},30))}(document.readyState==="complete"||document.readyState==="interactive")&&f()}return c.version="2.0.0",c.load=function(e,t,n,r){r.isBuild?n(null):c(n)},c}),timely.define("scripts/common_scripts/frontend/common_event_handlers",["jquery_timely"],function(e){var t=function(t){var n=e(this),r=n.next(".ai1ec-popup"),i,s,o;if(r.length===0)return;i=r.html(),s=r.attr("class");var u=n.closest("#ai1ec-calendar-view");u.length===0&&(u=e("body")),n.offset().left-u.offset().left>182?o="left":o="right",n.constrained_popover({content:i,title:"",placement:o,trigger:"manual",html:!0,template:'<div class="timely popover '+s+'"><div class="arrow"></div><div class="popover-inner">'+'<div class="popover-content"><div></div></div></div></div></div>',container:n.closest(".ai1ec-popover-boundary")}).constrained_popover("show")},n=function(t){var n=e(t.toElement||t.relatedTarget);n.closest(".ai1ec-popup").length===0&&e(this).constrained_popover("hide")},r=function(t){var n=e(t.toElement||t.relatedTarget);n.closest(".tooltip").length===0&&(e(this).remove(),e("body > .tooltip").remove())},i=function(t){var n=e(this),r={template:'<div class="timely tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"manual"};if(n.is(".ai1ec-category .ai1ec-color-swatch"))return;n.tooltip(r),n.tooltip("show")},s=function(t){var n=e(t.toElement||t.relatedTarget);n.closest(".tooltip").length===0&&e(this).tooltip("hide")},o=function(t){var n=e(t.toElement||t.relatedTarget);n.closest(".ai1ec-tooltip-trigger").length===0&&e(this).remove(),n.closest(".ai1ec-popup").length===0&&e("body > .ai1ec-popup").remove()};return{handle_popover_over:t,handle_popover_out:n,handle_popover_self_out:r,handle_tooltip_over:i,handle_tooltip_out:s,handle_tooltip_self_out:o}}),timely.define("external_libs/modernizr",[],function(){var e=function(e,t,n){function S(e){f.cssText=e}function x(e,t){return S(h.join(e+";")+(t||""))}function T(e,t){return typeof e===t}function N(e,t){return!!~(""+e).indexOf(t)}function C(e,t,r){for(var i in e){var s=t[e[i]];if(s!==n)return r===!1?e[i]:T(s,"function")?s.bind(r||t):s}return!1}var r="2.5.3",i={},s=!0,o=t.documentElement,u="modernizr",a=t.createElement(u),f=a.style,l,c={}.toString,h=" -webkit- -moz- -o- -ms- ".split(" "),p={},d={},v={},m=[],g=m.slice,y,b=function(e,n,r,i){var s,a,f,l=t.createElement("div"),c=t.body,h=c?c:t.createElement("body");if(parseInt(r,10))while(r--)f=t.createElement("div"),f.id=i?i[r]:u+(r+1),l.appendChild(f);return s=["&#173;","<style>",e,"</style>"].join(""),l.id=u,(c?l:h).innerHTML+=s,h.appendChild(l),c||(h.style.background="",o.appendChild(h)),a=n(l,e),c?l.parentNode.removeChild(l):h.parentNode.removeChild(h),!!a},w={}.hasOwnProperty,E;!T(w,"undefined")&&!T(w.call,"undefined")?E=function(e,t){return w.call(e,t)}:E=function(e,t){return t in e&&T(e.constructor.prototype[t],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(t){var n=this;if(typeof n!="function")throw new TypeError;var r=g.call(arguments,1),i=function(){if(this instanceof i){var e=function(){};e.prototype=n.prototype;var s=new e,o=n.apply(s,r.concat(g.call(arguments)));return Object(o)===o?o:s}return n.apply(t,r.concat(g.call(arguments)))};return i});var k=function(n,r){var s=n.join(""),o=r.length;b(s,function(n,r){var s=t.styleSheets[t.styleSheets.length-1],u=s?s.cssRules&&s.cssRules[0]?s.cssRules[0].cssText:s.cssText||"":"",a=n.childNodes,f={};while(o--)f[a[o].id]=a[o];i.touch="ontouchstart"in e||e.DocumentTouch&&t instanceof DocumentTouch||(f.touch&&f.touch.offsetTop)===9},o,r)}([,["@media (",h.join("touch-enabled),("),u,")","{#touch{top:9px;position:absolute}}"].join("")],[,"touch"]);p.touch=function(){return i.touch};for(var L in p)E(p,L)&&(y=L.toLowerCase(),i[y]=p[L](),m.push((i[y]?"":"no-")+y));return S(""),a=l=null,i._version=r,i._prefixes=h,i.testStyles=b,o.className=o.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(s?" js "+m.join(" "):""),i}(window,window.document);return e}),timely.define("external_libs/bootstrap/tooltip",["jquery_timely"],function(e){var t=function(e,t){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",e,t)};t.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="ai1ec-tooltip"><div class="ai1ec-tooltip-arrow"></div><div class="ai1ec-tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},t.prototype.init=function(t,n,r){this.enabled=!0,this.type=t,this.$element=e(n),this.options=this.getOptions(r);var i=this.options.trigger.split(" ");for(var s=i.length;s--;){var o=i[s];if(o=="click")this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this));else if(o!="manual"){var u=o=="hover"?"mouseenter":"focus",a=o=="hover"?"mouseleave":"blur";this.$element.on(u+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(a+"."+this.type,this.options.selector,e.proxy(this.leave,this))}}this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},t.prototype.getDefaults=function(){return t.DEFAULTS},t.prototype.getOptions=function(t){return t=e.extend({},this.getDefaults(),this.$element.data(),t),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},t.prototype.getDelegateOptions=function(){var t={},n=this.getDefaults();return this._options&&e.each(this._options,function(e,r){n[e]!=r&&(t[e]=r)}),t},t.prototype.enter=function(t){var n=t instanceof this.constructor?t:e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(n.timeout),n.hoverState="in";if(!n.options.delay||!n.options.delay.show)return n.show();n.timeout=setTimeout(function(){n.hoverState=="in"&&n.show()},n.options.delay.show)},t.prototype.leave=function(t){var n=t instanceof this.constructor?t:e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);clearTimeout(n.timeout),n.hoverState="out";if(!n.options.delay||!n.options.delay.hide)return n.hide();n.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},t.prototype.show=function(){var t=e.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(t);if(t.isDefaultPrevented())return;var n=this.tip();this.setContent(),this.options.animation&&n.addClass("ai1ec-fade");var r=typeof this.options.placement=="function"?this.options.placement.call(this,n[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,s=i.test(r);s&&(r=r.replace(i,"")||"top"),n.detach().css({top:0,left:0,display:"block"}).addClass("ai1ec-"+r),this.options.container?n.appendTo(this.options.container):n.insertAfter(this.$element);var o=this.getPosition(),u=n[0].offsetWidth,a=n[0].offsetHeight;if(s){var f=this.$element.parent(),l=r,c=document.documentElement.scrollTop||document.body.scrollTop,h=this.options.container=="body"?window.innerWidth:f.outerWidth(),p=this.options.container=="body"?window.innerHeight:f.outerHeight(),d=this.options.container=="body"?0:f.offset().left;r=r=="bottom"&&o.top+o.height+a-c>p?"top":r=="top"&&o.top-c-a<0?"bottom":r=="right"&&o.right+u>h?"left":r=="left"&&o.left-u<d?"right":r,n.removeClass("ai1ec-"+l).addClass("ai1ec-"+r)}var v=this.getCalculatedOffset(r,o,u,a);this.applyPlacement(v,r),this.$element.trigger("shown.bs."+this.type)}},t.prototype.applyPlacement=function(e,t){var n,r=this.tip(),i=r[0].offsetWidth,s=r[0].offsetHeight,o=parseInt(r.css("margin-top"),10),u=parseInt(r.css("margin-left"),10);isNaN(o)&&(o=0),isNaN(u)&&(u=0),e.top=e.top+o,e.left=e.left+u,r.offset(e).addClass("ai1ec-in");var a=r[0].offsetWidth,f=r[0].offsetHeight;t=="top"&&f!=s&&(n=!0,e.top=e.top+s-f);if(/bottom|top/.test(t)){var l=0;e.left<0&&(l=e.left*-2,e.left=0,r.offset(e),a=r[0].offsetWidth,f=r[0].offsetHeight),this.replaceArrow(l-i+a,a,"left")}else this.replaceArrow(f-s,f,"top");n&&r.offset(e)},t.prototype.replaceArrow=function(e,t,n){this.arrow().css(n,e?50*(1-e/t)+"%":"")},t.prototype.setContent=function(){var e=this.tip(),t=this.getTitle();e.find(".ai1ec-tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("ai1ec-fade ai1ec-in ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right")},t.prototype.hide=function(){function i(){t.hoverState!="in"&&n.detach()}var t=this,n=this.tip(),r=e.Event("hide.bs."+this.type);this.$element.trigger(r);if(r.isDefaultPrevented())return;return n.removeClass("ai1ec-in"),e.support.transition&&this.$tip.hasClass("ai1ec-fade")?n.one(e.support.transition.end,i).emulateTransitionEnd(150):i(),this.$element.trigger("hidden.bs."+this.type),this},t.prototype.fixTitle=function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").attr("title","")},t.prototype.hasContent=function(){return this.getTitle()},t.prototype.getPosition=function(){var t=this.$element[0];return e.extend({},typeof t.getBoundingClientRect=="function"?t.getBoundingClientRect():{width:t.offsetWidth,height:t.offsetHeight},this.$element.offset())},t.prototype.getCalculatedOffset=function(e,t,n,r){return e=="bottom"?{top:t.top+t.height,left:t.left+t.width/2-n/2}:e=="top"?{top:t.top-r,left:t.left+t.width/2-n/2}:e=="left"?{top:t.top+t.height/2-r/2,left:t.left-n}:{top:t.top+t.height/2-r/2,left:t.left+t.width}},t.prototype.getTitle=function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},t.prototype.tip=function(){return this.$tip=this.$tip||e(this.options.template)},t.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".ai1ec-tooltip-arrow")},t.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},t.prototype.enable=function(){this.enabled=!0},t.prototype.disable=function(){this.enabled=!1},t.prototype.toggleEnabled=function(){this.enabled=!this.enabled},t.prototype.toggle=function(t){var n=t?e(t.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;n.tip().hasClass("ai1ec-in")?n.leave(n):n.enter(n)},t.prototype.destroy=function(){this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var n=e.fn.tooltip;e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("bs.tooltip"),s=typeof n=="object"&&n;i||r.data("bs.tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.noConflict=function(){return e.fn.tooltip=n,this}}),timely.define("external_libs/bootstrap/popover",["jquery_timely","external_libs/bootstrap/tooltip"],function(e){var t=function(e,t){this.init("popover",e,t)};if(!e.fn.tooltip)throw new Error("Popover requires tooltip.js");t.DEFAULTS=e.extend({},e.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="ai1ec-popover"><div class="ai1ec-arrow"></div><h3 class="ai1ec-popover-title"></h3><div class="ai1ec-popover-content"></div></div>'}),t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype),t.prototype.constructor=t,t.prototype.getDefaults=function(){return t.DEFAULTS},t.prototype.setContent=function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".ai1ec-popover-title")[this.options.html?"html":"text"](t),e.find(".ai1ec-popover-content")[this.options.html?"html":"text"](n),e.removeClass("ai1ec-fade ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right ai1ec-in"),e.find(".ai1ec-popover-title").html()||e.find(".ai1ec-popover-title").hide()},t.prototype.hasContent=function(){return this.getTitle()||this.getContent()},t.prototype.getContent=function(){var e=this.$element,t=this.options;return e.attr("data-content")||(typeof t.content=="function"?t.content.call(e[0]):t.content)},t.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".ai1ec-arrow")},t.prototype.tip=function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip};var n=e.fn.popover;e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("bs.popover"),s=typeof n=="object"&&n;i||r.data("bs.popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.noConflict=function(){return e.fn.popover=n,this}}),timely.define("external_libs/bootstrap/dropdown",["jquery_timely"],function(e){function i(){e(t).remove(),e(n).each(function(t){var n=s(e(this));if(!n.hasClass("ai1ec-open"))return;n.trigger(t=e.Event("hide.bs.dropdown"));if(t.isDefaultPrevented())return;n.removeClass("ai1ec-open").trigger("hidden.bs.dropdown")})}function s(t){var n=t.attr("data-target");n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,""));var r=n&&e(n);return r&&r.length?r:t.parent()}var t=".ai1ec-dropdown-backdrop",n="[data-toggle=ai1ec-dropdown]",r=function(t){e(t).on("click.bs.dropdown",this.toggle)};r.prototype.toggle=function(t){var n=e(this);if(n.is(".ai1ec-disabled, :disabled"))return;var r=s(n),o=r.hasClass("ai1ec-open");i();if(!o){"ontouchstart"in document.documentElement&&!r.closest(".ai1ec-navbar-nav").length&&e('<div class="ai1ec-dropdown-backdrop"/>').insertAfter(e(this)).on("click",i),r.trigger(t=e.Event("show.bs.dropdown"));if(t.isDefaultPrevented())return;r.toggleClass("ai1ec-open").trigger("shown.bs.dropdown"),n.focus()}return!1},r.prototype.keydown=function(t){if(!/(38|40|27)/.test(t.keyCode))return;var r=e(this);t.preventDefault(),t.stopPropagation();if(r.is(".ai1ec-disabled, :disabled"))return;var i=s(r),o=i.hasClass("ai1ec-open");if(!o||o&&t.keyCode==27)return t.which==27&&i.find(n).focus(),r.click();var u=e("[role=menu] li:not(.ai1ec-divider):visible a",i);if(!u.length)return;var a=u.index(u.filter(":focus"));t.keyCode==38&&a>0&&a--,t.keyCode==40&&a<u.length-1&&a++,~a||(a=0),u.eq(a).focus()};var o=e.fn.dropdown;e.fn.dropdown=function(t){return this.each(function(){var n=e(this),i=n.data("bs.dropdown");i||n.data("bs.dropdown",i=new r(this)),typeof t=="string"&&i[t].call(n)})},e.fn.dropdown.Constructor=r,e.fn.dropdown.noConflict=function(){return e.fn.dropdown=o,this},e(document).on("click.bs.dropdown.data-api",i).on("click.bs.dropdown.data-api",".ai1ec-dropdown form",function(e){e.stopPropagation()}).on("click.bs.dropdown.data-api",n,r.prototype.toggle).on("keydown.bs.dropdown.data-api",n+", [role=menu]",r.prototype.keydown)}),timely.define("scripts/common_scripts/frontend/common_frontend",["jquery_timely","domReady","scripts/common_scripts/frontend/common_event_handlers","ai1ec_calendar","external_libs/modernizr","external_libs/bootstrap/tooltip","external_libs/bootstrap/popover","external_libs/bootstrap/dropdown"],function(e,t,n,r,i){var s=!1,o=function(){s=!0,e(document).on("mouseenter",".ai1ec-popup-trigger",n.handle_popover_over),e(document).on("mouseleave",".ai1ec-popup-trigger",n.handle_popover_out),e(document).on("mouseleave",".ai1ec-popup",n.handle_popover_self_out),e(document).on("mouseenter",".ai1ec-tooltip-trigger",n.handle_tooltip_over),e(document).on("mouseleave",".ai1ec-tooltip-trigger",n.handle_tooltip_out),e(document).on("mouseleave",".ai1ec-tooltip",n.handle_tooltip_self_out)},u=function(){t(function(){o()})},a=function(){return s};return{start:u,are_event_listeners_attached:a}}),timely.require(["scripts/common_scripts/frontend/common_frontend"],function(e){e.start()}),timely.define("pages/common_frontend",function(){});