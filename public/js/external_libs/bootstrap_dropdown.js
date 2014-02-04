/* ============================================================
			 * bootstrap-dropdown.js v2.0.3
			 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
			 * ============================================================
			 * Copyright 2012 Twitter, Inc.
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
			 * ============================================================ */

timely.define(["jquery_timely","domReady"],function(e,t){if(!e.fn.dropdown){var n='[data-toggle="dropdown"]',r=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};r.prototype={constructor:r,toggle:function(t){var n=e(this),r,s,o;if(n.is(".disabled, :disabled"))return;return s=n.attr("data-target"),s||(s=n.attr("href"),s=s&&s.replace(/.*(?=#[^\s]*$)/,"")),r=e(s),r.length||(r=n.parent()),o=r.hasClass("open"),i(),o||r.toggleClass("open"),!1}};function i(){e(n).parent().removeClass("open")}e.fn.dropdown=function(t){return this.each(function(){var n=e(this),i=n.data("dropdown");i||n.data("dropdown",i=new r(this)),typeof t=="string"&&i[t].call(n)})},e.fn.dropdown.Constructor=r,t(function(){e(document).on("click.dropdown.data-api",i),e(document).on("click.dropdown",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown.data-api",n,r.prototype.toggle)})}});