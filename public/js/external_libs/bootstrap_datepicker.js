/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
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
 * ========================================================= */

timely.define(["jquery_timely","ai1ec_config","external_libs/locales/bootstrap-datepicker.bg","external_libs/locales/bootstrap-datepicker.br","external_libs/locales/bootstrap-datepicker.cs","external_libs/locales/bootstrap-datepicker.da","external_libs/locales/bootstrap-datepicker.de","external_libs/locales/bootstrap-datepicker.es","external_libs/locales/bootstrap-datepicker.fi","external_libs/locales/bootstrap-datepicker.fr","external_libs/locales/bootstrap-datepicker.id","external_libs/locales/bootstrap-datepicker.is","external_libs/locales/bootstrap-datepicker.it","external_libs/locales/bootstrap-datepicker.ja","external_libs/locales/bootstrap-datepicker.kr","external_libs/locales/bootstrap-datepicker.lt","external_libs/locales/bootstrap-datepicker.lv","external_libs/locales/bootstrap-datepicker.ms","external_libs/locales/bootstrap-datepicker.nb","external_libs/locales/bootstrap-datepicker.nl","external_libs/locales/bootstrap-datepicker.pl","external_libs/locales/bootstrap-datepicker.pt-BR","external_libs/locales/bootstrap-datepicker.pt","external_libs/locales/bootstrap-datepicker.ru","external_libs/locales/bootstrap-datepicker.sl","external_libs/locales/bootstrap-datepicker.sv","external_libs/locales/bootstrap-datepicker.th","external_libs/locales/bootstrap-datepicker.tr","external_libs/locales/bootstrap-datepicker.zh-CN","external_libs/locales/bootstrap-datepicker.zh-TW"],function(e,t){function r(){return new Date(Date.UTC.apply(Date,arguments))}function i(){var e=new Date;return r(e.getFullYear(),e.getMonth(),e.getDate())}function s(e){return function(){return this[e].apply(this,arguments)}}function f(t,n){var r=e(t).data(),i={},s,o=new RegExp("^"+n.toLowerCase()+"([A-Z])"),n=new RegExp("^"+n.toLowerCase());for(var u in r)n.test(u)&&(s=u.replace(o,function(e,t){return t.toLowerCase()}),i[s]=r[u]);return i}function l(t){var n={};if(!d[t]){t=t.split("-")[0];if(!d[t])return}var r=d[t];return e.each(p,function(e,t){t in r&&(n[t]=r[t])}),n}var n=e(window),o=function(){var t={get:function(e){return this.slice(e)[0]},contains:function(e){var t=e&&e.valueOf();for(var n=0,r=this.length;n<r;n++)if(this[n].valueOf()===t)return n;return-1},remove:function(e){this.splice(e,1)},replace:function(t){if(!t)return;e.isArray(t)||(t=[t]),this.clear(),this.push.apply(this,t)},clear:function(){this.splice(0)},copy:function(){var e=new o;return e.replace(this),e}};return function(){var n=[];return n.push.apply(n,arguments),e.extend(n,t),n}}(),u=function(t,n){this.dates=new o,this.viewDate=i(),this.focusDate=null,this._process_options(n),this.element=e(t),this.isInline=!1,this.isInput=this.element.is("input"),this.component=this.element.is(".ai1ec-date")?this.element.find(".ai1ec-input-group, .ai1ec-input-group-addon, .ai1ec-btn"):!1,this.hasInput=this.component&&this.element.find("input").length,this.component&&this.component.length===0&&(this.component=!1),this.picker=e(v.template),this._buildEvents(),this._attachEvents(),this.isInline?this.picker.addClass("ai1ec-datepicker-inline").appendTo(this.element):this.picker.addClass("ai1ec-datepicker-dropdown ai1ec-dropdown-menu"),this.o.rtl&&this.picker.addClass("ai1ec-datepicker-rtl"),this.viewMode=this.o.startView,this.o.calendarWeeks&&this.picker.find("tfoot th.ai1ec-today").attr("colspan",function(e,t){return parseInt(t)+1}),this._allow_update=!1,this.setStartDate(this._o.startDate),this.setEndDate(this._o.endDate),this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled),this.fillDow(),this.fillMonths(),this._allow_update=!0,this.update(),this.showMode(),this.isInline&&this.show()};u.prototype={constructor:u,_process_options:function(n){this._o=e.extend({},this._o,n);var r=this.o=e.extend({},this._o),i=r.language;d[i]||(i=i.split("-")[0],d[i]||(i=t.language,d[i]||(i=h.language))),r.language=i;switch(r.startView){case 2:case"decade":r.startView=2;break;case 1:case"year":r.startView=1;break;default:r.startView=0}switch(r.minViewMode){case 1:case"months":r.minViewMode=1;break;case 2:case"years":r.minViewMode=2;break;default:r.minViewMode=0}r.startView=Math.max(r.startView,r.minViewMode),r.multidate!==!0&&(r.multidate=Number(r.multidate)||!1,r.multidate!==!1?r.multidate=Math.max(0,r.multidate):r.multidate=1),r.multidateSeparator=String(r.multidateSeparator),r.weekStart%=7,r.weekEnd=(r.weekStart+6)%7;var s=v.parseFormat(r.format);r.startDate!==-Infinity&&(r.startDate?r.startDate instanceof Date?r.startDate=this._local_to_utc(this._zero_time(r.startDate)):r.startDate=v.parseDate(r.startDate,s,r.language):r.startDate=-Infinity),r.endDate!==Infinity&&(r.endDate?r.endDate instanceof Date?r.endDate=this._local_to_utc(this._zero_time(r.endDate)):r.endDate=v.parseDate(r.endDate,s,r.language):r.endDate=Infinity),r.daysOfWeekDisabled=r.daysOfWeekDisabled||[],e.isArray(r.daysOfWeekDisabled)||(r.daysOfWeekDisabled=r.daysOfWeekDisabled.split(/[,\s]*/)),r.daysOfWeekDisabled=e.map(r.daysOfWeekDisabled,function(e){return parseInt(e,10)});var o=String(r.orientation).toLowerCase().split(/\s+/g),u=r.orientation.toLowerCase();o=e.grep(o,function(e){return/^auto|left|right|top|bottom$/.test(e)}),r.orientation={x:"auto",y:"auto"};if(!!u&&u!=="auto")if(o.length===1)switch(o[0]){case"top":case"bottom":r.orientation.y=o[0];break;case"left":case"right":r.orientation.x=o[0]}else u=e.grep(o,function(e){return/^left|right$/.test(e)}),r.orientation.x=u[0]||"auto",u=e.grep(o,function(e){return/^top|bottom$/.test(e)}),r.orientation.y=u[0]||"auto"},_events:[],_secondaryEvents:[],_applyEvents:function(e){for(var t=0,n,r,i;t<e.length;t++)n=e[t][0],e[t].length==2?(r=undefined,i=e[t][1]):e[t].length==3&&(r=e[t][1],i=e[t][2]),n.on(i,r)},_unapplyEvents:function(e){for(var t=0,n,r,i;t<e.length;t++)n=e[t][0],e[t].length==2?(i=undefined,r=e[t][1]):e[t].length==3&&(i=e[t][1],r=e[t][2]),n.off(r,i)},_buildEvents:function(){this.isInput?this._events=[[this.element,{focus:e.proxy(this.show,this),keyup:e.proxy(function(t){e.inArray(t.keyCode,[27,37,39,38,40,32,13,9])===-1&&this.update()},this),keydown:e.proxy(this.keydown,this)}]]:this.component&&this.hasInput?this._events=[[this.element.find("input"),{focus:e.proxy(this.show,this),keyup:e.proxy(function(t){e.inArray(t.keyCode,[27,37,39,38,40,32,13,9])===-1&&this.update()},this),keydown:e.proxy(this.keydown,this)}],[this.component,{click:e.proxy(this.show,this)}]]:this.element.is("div")?this.isInline=!0:this._events=[[this.element,{click:e.proxy(this.show,this)}]],this._events.push([this.element,"*",{blur:e.proxy(function(e){this._focused_from=e.target},this)}],[this.element,{blur:e.proxy(function(e){this._focused_from=e.target},this)}]),this._secondaryEvents=[[this.picker,{click:e.proxy(this.click,this)}],[e(window),{resize:e.proxy(this.place,this)}],[e(document),{"mousedown touchstart":e.proxy(function(e){this.element.is(e.target)||this.element.find(e.target).length||this.picker.is(e.target)||this.picker.find(e.target).length||this.hide()},this)}]]},_attachEvents:function(){this._detachEvents(),this._applyEvents(this._events)},_detachEvents:function(){this._unapplyEvents(this._events)},_attachSecondaryEvents:function(){this._detachSecondaryEvents(),this._applyEvents(this._secondaryEvents)},_detachSecondaryEvents:function(){this._unapplyEvents(this._secondaryEvents)},_trigger:function(t,n){var r=n||this.dates.get(-1),i=this._utc_to_local(r);this.element.trigger({type:t,date:i,dates:e.map(this.dates,this._utc_to_local),format:e.proxy(function(e,t){arguments.length===0?(e=this.dates.length-1,t=this.o.format):typeof e=="string"&&(t=e,e=this.dates.length-1),t=t||this.o.format;var n=this.dates.get(e);return v.formatDate(n,t,this.o.language)},this)})},show:function(e){this.isInline||this.picker.appendTo("body"),this.picker.show(),this.height=this.component?this.component.outerHeight():this.element.outerHeight(),this.place(),this._attachSecondaryEvents(),this._trigger("show")},hide:function(){if(this.isInline)return;if(!this.picker.is(":visible"))return;this.focusDate=null,this.picker.hide().detach(),this._detachSecondaryEvents(),this.viewMode=this.o.startView,this.showMode(),this.o.forceParse&&(this.isInput&&this.element.val()||this.hasInput&&this.element.find("input").val())&&this.setValue(),this._trigger("hide")},remove:function(){this.hide(),this._detachEvents(),this._detachSecondaryEvents(),this.picker.remove(),delete this.element.data().datepicker,this.isInput||delete this.element.data().date},_utc_to_local:function(e){return e&&new Date(e.getTime()+e.getTimezoneOffset()*6e4)},_local_to_utc:function(e){return e&&new Date(e.getTime()-e.getTimezoneOffset()*6e4)},_zero_time:function(e){return e&&new Date(e.getFullYear(),e.getMonth(),e.getDate())},_zero_utc_time:function(e){return e&&new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()))},getDates:function(){return e.map(this.dates,this._utc_to_local)},getUTCDates:function(){return e.map(this.dates,function(e){return new Date(e)})},getDate:function(){return this._utc_to_local(this.getUTCDate())},getUTCDate:function(){return new Date(this.dates.get(-1))},setDates:function(){this.update.apply(this,arguments),this._trigger("changeDate"),this.setValue()},setUTCDates:function(){this.update.apply(this,e.map(arguments,this._utc_to_local)),this._trigger("changeDate"),this.setValue()},setDate:s("setDates"),setUTCDate:s("setUTCDates"),setValue:function(){var e=this.getFormattedDate();this.isInput?this.element.val(e).change():this.component&&this.element.find("input").val(e).change()},getFormattedDate:function(t){t===undefined&&(t=this.o.format);var n=this.o.language;return e.map(this.dates,function(e){return v.formatDate(e,t,n)}).join(this.o.multidateSeparator)},setStartDate:function(e){this._process_options({startDate:e}),this.update(),this.updateNavArrows()},setEndDate:function(e){this._process_options({endDate:e}),this.update(),this.updateNavArrows()},setDaysOfWeekDisabled:function(e){this._process_options({daysOfWeekDisabled:e}),this.update(),this.updateNavArrows()},place:function(){if(this.isInline)return;var t=this.picker.outerWidth(),r=this.picker.outerHeight(),i=10,s=n.width(),o=n.height(),u=n.scrollTop(),a=parseInt(this.element.parents().filter(function(){return e(this).css("z-index")!="auto"}).first().css("z-index"))+10,f=this.component?this.component.parent().offset():this.element.offset(),l=this.component?this.component.outerHeight(!0):this.element.outerHeight(!1),c=this.component?this.component.outerWidth(!0):this.element.outerWidth(!1),h=f.left,p=f.top;this.picker.removeClass("ai1ec-datepicker-orient-top ai1ec-datepicker-orient-bottom ai1ec-datepicker-orient-right ai1ec-datepicker-orient-left"),this.o.orientation.x!=="auto"?(this.picker.addClass("ai1ec-datepicker-orient-"+this.o.orientation.x),this.o.orientation.x==="right"&&(h-=t-c)):(this.picker.addClass("ai1ec-datepicker-orient-left"),f.left<0?h-=f.left-i:f.left+t>s&&(h=s-t-i));var d=this.o.orientation.y,v,m;d==="auto"&&(v=-u+f.top-r,m=u+o-(f.top+l+r),Math.max(v,m)===m?d="top":d="bottom"),this.picker.addClass("ai1ec-datepicker-orient-"+d),d==="top"?p+=l:p-=r+parseInt(this.picker.css("padding-top")),this.picker.css({top:p,left:h,zIndex:a})},_allow_update:!0,update:function(){if(!this._allow_update)return;var t=this.dates.copy(),n=[],r=!1;arguments.length?(e.each(arguments,e.proxy(function(e,t){t instanceof Date&&(t=this._local_to_utc(t)),n.push(t)},this)),r=!0):(n=this.isInput?this.element.val():this.element.data("date")||this.element.find("input").val(),n&&this.o.multidate?n=n.split(this.o.multidateSeparator):n=[n],delete this.element.data().date),n=e.map(n,e.proxy(function(e){return v.parseDate(e,this.o.format,this.o.language)},this)),n=e.grep(n,e.proxy(function(e){return e<this.o.startDate||e>this.o.endDate||!e},this),!0),this.dates.replace(n),this.dates.length?this.viewDate=new Date(this.dates.get(-1)):this.viewDate<this.o.startDate?this.viewDate=new Date(this.o.startDate):this.viewDate>this.o.endDate&&(this.viewDate=new Date(this.o.endDate)),r?this.setValue():n.length&&String(t)!==String(this.dates)&&this._trigger("changeDate"),!this.dates.length&&t.length&&this._trigger("clearDate"),this.fill()},fillDow:function(){var e=this.o.weekStart,t="<tr>";if(this.o.calendarWeeks){var n='<th class="ai1ec-cw">&nbsp;</th>';t+=n,this.picker.find(".ai1ec-datepicker-days thead tr:first-child").prepend(n)}while(e<this.o.weekStart+7)t+='<th class="ai1ec-dow">'+d[this.o.language].daysMin[e++%7]+"</th>";t+="</tr>",this.picker.find(".ai1ec-datepicker-days thead").append(t)},fillMonths:function(){var e="",t=0;while(t<12)e+='<span class="ai1ec-month">'+d[this.o.language].monthsShort[t++]+"</span>";this.picker.find(".ai1ec-datepicker-months td").html(e)},setRange:function(t){!t||!t.length?delete this.range:this.range=e.map(t,function(e){return e.valueOf()}),this.fill()},getClassNames:function(t){var n=[],r=this.viewDate.getUTCFullYear(),i=this.viewDate.getUTCMonth(),s=new Date;return t.getUTCFullYear()<r||t.getUTCFullYear()==r&&t.getUTCMonth()<i?n.push("ai1ec-old"):(t.getUTCFullYear()>r||t.getUTCFullYear()==r&&t.getUTCMonth()>i)&&n.push("ai1ec-new"),this.focusDate&&t.valueOf()===this.focusDate.valueOf()&&n.push("ai1ec-focused"),this.o.todayHighlight&&t.getUTCFullYear()==s.getFullYear()&&t.getUTCMonth()==s.getMonth()&&t.getUTCDate()==s.getDate()&&n.push("ai1ec-today"),this.dates.contains(t)!==-1&&n.push("ai1ec-active"),(t.valueOf()<this.o.startDate||t.valueOf()>this.o.endDate||e.inArray(t.getUTCDay(),this.o.daysOfWeekDisabled)!==-1)&&n.push("ai1ec-disabled"),this.range&&(t>this.range[0]&&t<this.range[this.range.length-1]&&n.push("ai1ec-range"),e.inArray(t.valueOf(),this.range)!=-1&&n.push("ai1ec-selected")),n},fill:function(){var t=new Date(this.viewDate),n=t.getUTCFullYear(),i=t.getUTCMonth(),s=this.o.startDate!==-Infinity?this.o.startDate.getUTCFullYear():-Infinity,o=this.o.startDate!==-Infinity?this.o.startDate.getUTCMonth():-Infinity,u=this.o.endDate!==Infinity?this.o.endDate.getUTCFullYear():Infinity,a=this.o.endDate!==Infinity?this.o.endDate.getUTCMonth():Infinity,f,l;this.picker.find(".ai1ec-datepicker-days thead th.ai1ec-datepicker-switch").text(d[this.o.language].months[i]+" "+n),this.picker.find("tfoot th.ai1ec-today").text(d[this.o.language].today).toggle(this.o.todayBtn!==!1),this.picker.find("tfoot th.ai1ec-clear").text(d[this.o.language].clear).toggle(this.o.clearBtn!==!1),this.updateNavArrows(),this.fillMonths();var c=r(n,i-1,28),h=v.getDaysInMonth(c.getUTCFullYear(),c.getUTCMonth());c.setUTCDate(h),c.setUTCDate(h-(c.getUTCDay()-this.o.weekStart+7)%7);var p=new Date(c);p.setUTCDate(p.getUTCDate()+42),p=p.valueOf();var m=[],g;while(c.valueOf()<p){if(c.getUTCDay()==this.o.weekStart){m.push("<tr>");if(this.o.calendarWeeks){var y=new Date(+c+(this.o.weekStart-c.getUTCDay()-7)%7*864e5),b=new Date(+y+(11-y.getUTCDay())%7*864e5),w=new Date(+(w=r(b.getUTCFullYear(),0,1))+(11-w.getUTCDay())%7*864e5),E=(b-w)/864e5/7+1;m.push('<td class="ai1ec-cw">'+E+"</td>")}}g=this.getClassNames(c),g.push("ai1ec-day");if(this.o.beforeShowDay!==e.noop){var S=this.o.beforeShowDay(this._utc_to_local(c));S===undefined?S={}:typeof S=="boolean"?S={enabled:S}:typeof S=="string"&&(S={classes:S}),S.enabled===!1&&g.push("ai1ec-disabled"),S.classes&&(g=g.concat(S.classes.split(/\s+/))),S.tooltip&&(f=S.tooltip)}g=e.unique(g),m.push('<td class="'+g.join(" ")+'"'+(f?' title="'+f+'"':"")+">"+c.getUTCDate()+"</td>"),c.getUTCDay()==this.o.weekEnd&&m.push("</tr>"),c.setUTCDate(c.getUTCDate()+1)}this.picker.find(".ai1ec-datepicker-days tbody").empty().append(m.join(""));var x=this.picker.find(".ai1ec-datepicker-months").find("th:eq(1)").text(n).end().find("span").removeClass("ai1ec-active");e.each(this.dates,function(e,t){t.getUTCFullYear()==n&&x.eq(t.getUTCMonth()).addClass("ai1ec-active")}),(n<s||n>u)&&x.addClass("ai1ec-disabled"),n==s&&x.slice(0,o).addClass("ai1ec-disabled"),n==u&&x.slice(a+1).addClass("ai1ec-disabled"),m="",n=parseInt(n/10,10)*10;var T=this.picker.find(".ai1ec-datepicker-years").find("th:eq(1)").text(n+"-"+(n+9)).end().find("td");n-=1;var N=e.map(this.dates,function(e){return e.getUTCFullYear()}),C;for(var k=-1;k<11;k++)C=["ai1ec-year"],k===-1?C.push("ai1ec-old"):k===10&&C.push("ai1ec-new"),e.inArray(n,N)!==-1&&C.push("ai1ec-active"),(n<s||n>u)&&C.push("ai1ec-disabled"),m+='<span class="'+C.join(" ")+'">'+n+"</span>",n+=1;T.html(m)},updateNavArrows:function(){if(!this._allow_update)return;var e=new Date(this.viewDate),t=e.getUTCFullYear(),n=e.getUTCMonth();switch(this.viewMode){case 0:this.o.startDate!==-Infinity&&t<=this.o.startDate.getUTCFullYear()&&n<=this.o.startDate.getUTCMonth()?this.picker.find(".ai1ec-prev").css({visibility:"hidden"}):this.picker.find(".ai1ec-prev").css({visibility:"visible"}),this.o.endDate!==Infinity&&t>=this.o.endDate.getUTCFullYear()&&n>=this.o.endDate.getUTCMonth()?this.picker.find(".ai1ec-next").css({visibility:"hidden"}):this.picker.find(".ai1ec-next").css({visibility:"visible"});break;case 1:case 2:this.o.startDate!==-Infinity&&t<=this.o.startDate.getUTCFullYear()?this.picker.find(".ai1ec-prev").css({visibility:"hidden"}):this.picker.find(".ai1ec-prev").css({visibility:"visible"}),this.o.endDate!==Infinity&&t>=this.o.endDate.getUTCFullYear()?this.picker.find(".ai1ec-next").css({visibility:"hidden"}):this.picker.find(".ai1ec-next").css({visibility:"visible"})}},click:function(t){t.preventDefault();var n=e(t.target).closest("span, td, th"),i,s,o;if(n.length==1)switch(n[0].nodeName.toLowerCase()){case"th":switch(n[0].className){case"ai1ec-datepicker-switch":this.showMode(1);break;case"ai1ec-prev":case"ai1ec-next":var u=v.modes[this.viewMode].navStep*(n[0].className=="ai1ec-prev"?-1:1);switch(this.viewMode){case 0:this.viewDate=this.moveMonth(this.viewDate,u),this._trigger("changeMonth",this.viewDate);break;case 1:case 2:this.viewDate=this.moveYear(this.viewDate,u),this.viewMode===1&&this._trigger("changeYear",this.viewDate)}this.fill();break;case"ai1ec-today":var a=new Date;a=r(a.getFullYear(),a.getMonth(),a.getDate(),0,0,0),this.showMode(-2);var f=this.o.todayBtn=="linked"?null:"view";this._setDate(a,f);break;case"ai1ec-clear":var l;this.isInput?l=this.element:this.component&&(l=this.element.find("input")),l&&l.val("").change(),this.update(),this._trigger("changeDate"),this.o.autoclose&&this.hide()}break;case"span":n.is(".ai1ec-disabled")||(this.viewDate.setUTCDate(1),n.is(".ai1ec-month")?(o=1,s=n.parent().find("span").index(n),i=this.viewDate.getUTCFullYear(),this.viewDate.setUTCMonth(s),this._trigger("changeMonth",this.viewDate),this.o.minViewMode===1&&this._setDate(r(i,s,o))):(o=1,s=0,i=parseInt(n.text(),10)||0,this.viewDate.setUTCFullYear(i),this._trigger("changeYear",this.viewDate),this.o.minViewMode===2&&this._setDate(r(i,s,o))),this.showMode(-1),this.fill());break;case"td":n.is(".ai1ec-day")&&!n.is(".ai1ec-disabled")&&(o=parseInt(n.text(),10)||1,i=this.viewDate.getUTCFullYear(),s=this.viewDate.getUTCMonth(),n.is(".ai1ec-old")?s===0?(s=11,i-=1):s-=1:n.is(".ai1ec-new")&&(s==11?(s=0,i+=1):s+=1),this._setDate(r(i,s,o)))}this.picker.is(":visible")&&this._focused_from&&e(this._focused_from).focus(),delete this._focused_from},_toggle_multidate:function(e){var t=this.dates.contains(e);e?t!==-1?this.dates.remove(t):this.dates.push(e):this.dates.clear();if(typeof this.o.multidate=="number")while(this.dates.length>this.o.multidate)this.dates.remove(0)},_setDate:function(e,t){(!t||t=="date")&&this._toggle_multidate(e&&new Date(e));if(!t||t=="view")this.viewDate=e&&new Date(e);this.fill(),this.setValue(),this._trigger("changeDate");var n;this.isInput?n=this.element:this.component&&(n=this.element.find("input")),n&&n.change(),this.o.autoclose&&(!t||t=="date")&&this.hide()},moveMonth:function(e,t){if(!e)return undefined;if(!t)return e;var n=new Date(e.valueOf()),r=n.getUTCDate(),i=n.getUTCMonth(),s=Math.abs(t),o,u;t=t>0?1:-1;if(s==1){u=t==-1?function(){return n.getUTCMonth()==i}:function(){return n.getUTCMonth()!=o},o=i+t,n.setUTCMonth(o);if(o<0||o>11)o=(o+12)%12}else{for(var a=0;a<s;a++)n=this.moveMonth(n,t);o=n.getUTCMonth(),n.setUTCDate(r),u=function(){return o!=n.getUTCMonth()}}while(u())n.setUTCDate(--r),n.setUTCMonth(o);return n},moveYear:function(e,t){return this.moveMonth(e,t*12)},dateWithinRange:function(e){return e>=this.o.startDate&&e<=this.o.endDate},keydown:function(e){if(this.picker.is(":not(:visible)")){e.keyCode==27&&this.show();return}var t=!1,n,r,s,o=this.focusDate||this.viewDate;switch(e.keyCode){case 27:this.focusDate?(this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.fill()):this.hide(),e.preventDefault();break;case 37:case 39:if(!this.o.keyboardNavigation)break;n=e.keyCode==37?-1:1,e.ctrlKey?(r=this.moveYear(this.dates.get(-1)||i(),n),s=this.moveYear(o,n),this._trigger("changeYear",this.viewDate)):e.shiftKey?(r=this.moveMonth(this.dates.get(-1)||i(),n),s=this.moveMonth(o,n),this._trigger("changeMonth",this.viewDate)):(r=new Date(this.dates.get(-1)||i()),r.setUTCDate(r.getUTCDate()+n),s=new Date(o),s.setUTCDate(o.getUTCDate()+n)),this.dateWithinRange(r)&&(this.focusDate=this.viewDate=s,this.setValue(),this.fill(),e.preventDefault());break;case 38:case 40:if(!this.o.keyboardNavigation)break;n=e.keyCode==38?-1:1,e.ctrlKey?(r=this.moveYear(this.dates.get(-1)||i(),n),s=this.moveYear(o,n),this._trigger("changeYear",this.viewDate)):e.shiftKey?(r=this.moveMonth(this.dates.get(-1)||i(),n),s=this.moveMonth(o,n),this._trigger("changeMonth",this.viewDate)):(r=new Date(this.dates.get(-1)||i()),r.setUTCDate(r.getUTCDate()+n*7),s=new Date(o),s.setUTCDate(o.getUTCDate()+n*7)),this.dateWithinRange(r)&&(this.focusDate=this.viewDate=s,this.setValue(),this.fill(),e.preventDefault());break;case 32:break;case 13:o=this.focusDate||this.dates.get(-1)||this.viewDate,this._toggle_multidate(o),t=!0,this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.setValue(),this.fill(),this.picker.is(":visible")&&(e.preventDefault(),this.o.autoclose&&this.hide());break;case 9:this.focusDate=null,this.viewDate=this.dates.get(-1)||this.viewDate,this.fill(),this.hide()}if(t){this.dates.length?this._trigger("changeDate"):this._trigger("clearDate");var u;this.isInput?u=this.element:this.component&&(u=this.element.find("input")),u&&u.change()}},showMode:function(e){e&&(this.viewMode=Math.max(this.o.minViewMode,Math.min(2,this.viewMode+e))),this.picker.find(">div").hide().filter(".ai1ec-datepicker-"+v.modes[this.viewMode].clsName).css("display","block"),this.updateNavArrows()}};var a=function(t,n){this.element=e(t),this.inputs=e.map(n.inputs,function(e){return e.jquery?e[0]:e}),delete n.inputs,e(this.inputs).datepicker(n).bind("changeDate",e.proxy(this.dateUpdated,this)),this.pickers=e.map(this.inputs,function(t){return e(t).data("datepicker")}),this.updateDates()};a.prototype={updateDates:function(){this.dates=e.map(this.pickers,function(e){return e.getUTCDate()}),this.updateRanges()},updateRanges:function(){var t=e.map(this.dates,function(e){return e.valueOf()});e.each(this.pickers,function(e,n){n.setRange(t)})},dateUpdated:function(t){if(this.updating)return;this.updating=!0;var n=e(t.target).data("datepicker"),r=n.getUTCDate(),i=e.inArray(t.target,this.inputs),s=this.inputs.length;if(i==-1)return;e.each(this.pickers,function(e,t){t.getUTCDate()||t.setUTCDate(r)});if(r<this.dates[i])while(i>=0&&r<this.dates[i])this.pickers[i--].setUTCDate(r);else if(r>this.dates[i])while(i<s&&r>this.dates[i])this.pickers[i++].setUTCDate(r);this.updateDates(),delete this.updating},remove:function(){e.map(this.pickers,function(e){e.remove()}),delete this.element.data().datepicker}};var c=e.fn.datepicker;e.fn.datepicker=function(t){var n=Array.apply(null,arguments);n.shift();var r;return this.each(function(){var i=e(this),s=i.data("datepicker"),o=typeof t=="object"&&t;if(!s){var c=f(this,"date"),p=e.extend({},h,c,o),d=l(p.language),v=e.extend({},h,d,c,o);if(i.is(".ai1ec-input-daterange")||v.inputs){var m={inputs:v.inputs||i.find("input").toArray()};i.data("datepicker",s=new a(this,e.extend(v,m)))}else i.data("datepicker",s=new u(this,v))}if(typeof t=="string"&&typeof s[t]=="function"){r=s[t].apply(s,n);if(r!==undefined)return!1}}),r!==undefined?r:this};var h=e.fn.datepicker.defaults={autoclose:!1,beforeShowDay:e.noop,calendarWeeks:!1,clearBtn:!1,daysOfWeekDisabled:[],endDate:Infinity,forceParse:!0,format:"mm/dd/yyyy",keyboardNavigation:!0,language:"en",minViewMode:0,multidate:!1,multidateSeparator:",",orientation:"auto",rtl:!1,startDate:-Infinity,startView:0,todayBtn:!1,todayHighlight:!1,weekStart:0},p=e.fn.datepicker.locale_opts=["format","rtl","weekStart"];e.fn.datepicker.Constructor=u;var d=e.fn.datepicker.dates={en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa","Su"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",clear:"Clear"}},v={modes:[{clsName:"ai1ec-days",navFnc:"Month",navStep:1},{clsName:"ai1ec-months",navFnc:"FullYear",navStep:1},{clsName:"ai1ec-years",navFnc:"FullYear",navStep:10}],isLeapYear:function(e){return e%4===0&&e%100!==0||e%400===0},getDaysInMonth:function(e,t){return[31,v.isLeapYear(e)?29:28,31,30,31,30,31,31,30,31,30,31][t]},validParts:/dd?|DD?|mm?|MM?|yy(?:yy)?/g,nonpunctuation:/[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,parseFormat:function(e){var t=e.replace(this.validParts,"\0").split("\0"),n=e.match(this.validParts);if(!t||!t.length||!n||n.length===0)throw new Error("Invalid date format.");return{separators:t,parts:n}},parseDate:function(t,n,i){if(!t)return undefined;if(t instanceof Date)return t;typeof n=="string"&&(n=v.parseFormat(n));if(/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(t)){var s=/([\-+]\d+)([dmwy])/,o=t.match(/([\-+]\d+)([dmwy])/g),a,f;t=new Date;for(var l=0;l<o.length;l++){a=s.exec(o[l]),f=parseInt(a[1]);switch(a[2]){case"d":t.setUTCDate(t.getUTCDate()+f);break;case"m":t=u.prototype.moveMonth.call(u.prototype,t,f);break;case"w":t.setUTCDate(t.getUTCDate()+f*7);break;case"y":t=u.prototype.moveYear.call(u.prototype,t,f)}}return r(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),0,0,0)}var o=t&&t.match(this.nonpunctuation)||[],t=new Date,c={},h=["yyyy","yy","M","MM","m","mm","d","dd"],p={yyyy:function(e,t){return e.setUTCFullYear(t)},yy:function(e,t){return e.setUTCFullYear(2e3+t)},m:function(e,t){if(isNaN(e))return e;t-=1;while(t<0)t+=12;t%=12,e.setUTCMonth(t);while(e.getUTCMonth()!=t)e.setUTCDate(e.getUTCDate()-1);return e},d:function(e,t){return e.setUTCDate(t)}},m,g,a;p.M=p.MM=p.mm=p.m,p.dd=p.d,t=r(t.getFullYear(),t.getMonth(),t.getDate(),0,0,0);var y=n.parts.slice();o.length!=y.length&&(y=e(y).filter(function(t,n){return e.inArray(n,h)!==-1}).toArray());if(o.length==y.length){for(var l=0,b=y.length;l<b;l++){m=parseInt(o[l],10),a=y[l];if(isNaN(m))switch(a){case"MM":g=e(d[i].months).filter(function(){var e=this.slice(0,o[l].length),t=o[l].slice(0,e.length);return e==t}),m=e.inArray(g[0],d[i].months)+1;break;case"M":g=e(d[i].monthsShort).filter(function(){var e=this.slice(0,o[l].length),t=o[l].slice(0,e.length);return e==t}),m=e.inArray(g[0],d[i].monthsShort)+1}c[a]=m}for(var l=0,w,E;l<h.length;l++)E=h[l],E in c&&!isNaN(c[E])&&(w=new Date(t),p[E](w,c[E]),isNaN(w)||(t=w))}return t},formatDate:function(t,n,r){if(!t)return"";typeof n=="string"&&(n=v.parseFormat(n));var i={d:t.getUTCDate(),D:d[r].daysShort[t.getUTCDay()],DD:d[r].days[t.getUTCDay()],m:t.getUTCMonth()+1,M:d[r].monthsShort[t.getUTCMonth()],MM:d[r].months[t.getUTCMonth()],yy:t.getUTCFullYear().toString().substring(2),yyyy:t.getUTCFullYear()};i.dd=(i.d<10?"0":"")+i.d,i.mm=(i.m<10?"0":"")+i.m;var t=[],s=e.extend([],n.separators);for(var o=0,u=n.parts.length;o<=u;o++)s.length&&t.push(s.shift()),t.push(i[n.parts[o]]);return t.join("")},headTemplate:'<thead><tr><th class="ai1ec-prev">&laquo;</th><th colspan="5" class="ai1ec-datepicker-switch"></th><th class="ai1ec-next">&raquo;</th></tr></thead>',contTemplate:'<tbody><tr><td colspan="7"></td></tr></tbody>',footTemplate:'<tfoot><tr><th colspan="7" class="ai1ec-today"></th></tr><tr><th colspan="7" class="ai1ec-clear"></th></tr></tfoot>'};v.template='<div class="ai1ec-datepicker"><div class="ai1ec-datepicker-days"><table class=" ai1ec-table-condensed">'+v.headTemplate+"<tbody></tbody>"+v.footTemplate+"</table>"+"</div>"+'<div class="ai1ec-datepicker-months">'+'<table class="ai1ec-table-condensed">'+v.headTemplate+v.contTemplate+v.footTemplate+"</table>"+"</div>"+'<div class="ai1ec-datepicker-years">'+'<table class="ai1ec-table-condensed">'+v.headTemplate+v.contTemplate+v.footTemplate+"</table>"+"</div>"+"</div>",e.fn.datepicker.DPGlobal=v,e.fn.datepicker.noConflict=function(){return e.fn.datepicker=c,this},e(document).on("focus.datepicker.data-api click.datepicker.data-api",'[data-provide="datepicker"]',function(t){var n=e(this);if(n.data("datepicker"))return;t.preventDefault(),n.datepicker("show")}),e(function(){e('[data-provide="datepicker-inline"]').datepicker()});for(var m=2,g=arguments.length;m<g;m++)arguments[m].localize()});