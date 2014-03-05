/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
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

timely.define(["jquery_timely","ai1ec_config","external_libs/locales/bootstrap-datepicker.bg","external_libs/locales/bootstrap-datepicker.br","external_libs/locales/bootstrap-datepicker.cs","external_libs/locales/bootstrap-datepicker.da","external_libs/locales/bootstrap-datepicker.de","external_libs/locales/bootstrap-datepicker.es","external_libs/locales/bootstrap-datepicker.fi","external_libs/locales/bootstrap-datepicker.fr","external_libs/locales/bootstrap-datepicker.id","external_libs/locales/bootstrap-datepicker.is","external_libs/locales/bootstrap-datepicker.it","external_libs/locales/bootstrap-datepicker.ja","external_libs/locales/bootstrap-datepicker.kr","external_libs/locales/bootstrap-datepicker.lt","external_libs/locales/bootstrap-datepicker.lv","external_libs/locales/bootstrap-datepicker.ms","external_libs/locales/bootstrap-datepicker.nb","external_libs/locales/bootstrap-datepicker.nl","external_libs/locales/bootstrap-datepicker.pl","external_libs/locales/bootstrap-datepicker.pt-BR","external_libs/locales/bootstrap-datepicker.pt","external_libs/locales/bootstrap-datepicker.ru","external_libs/locales/bootstrap-datepicker.sl","external_libs/locales/bootstrap-datepicker.sv","external_libs/locales/bootstrap-datepicker.th","external_libs/locales/bootstrap-datepicker.tr","external_libs/locales/bootstrap-datepicker.zh-CN","external_libs/locales/bootstrap-datepicker.zh-TW"],function(e,t){function n(){return new Date(Date.UTC.apply(Date,arguments))}function r(){var e=new Date;return n(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate())}var i=function(n,r){var i=this;this.element=e(n),this.language=r.language||this.element.data("date-language")||t.language||"en",this.language=this.language in s?this.language:"en",this.format=o.parseFormat(r.format||this.element.data("date-format")||"mm/dd/yyyy"),this.picker=e(o.template).appendTo("body").on({click:e.proxy(this.click,this)}),this.isInput=this.element.is("input"),this.component=this.element.is(".date")?this.element.find(".add-on"):!1,this.hasInput=this.component&&this.element.find("input").length,this.component&&this.component.length===0&&(this.component=!1),this.isInput?this.element.on({focus:e.proxy(this.show,this),keyup:e.proxy(this.update,this),keydown:e.proxy(this.keydown,this)}):this.component&&this.hasInput?(this.element.find("input").on({focus:e.proxy(this.show,this),keyup:e.proxy(this.update,this),keydown:e.proxy(this.keydown,this)}),this.component.on("click",e.proxy(this.show,this))):this.element.on("click",e.proxy(this.show,this)),e(document).on("mousedown",function(t){e(t.target).closest(".datepicker").length==0&&i.hide()}),this.autoclose=!1,"autoclose"in r?this.autoclose=r.autoclose:"dateAutoclose"in this.element.data()&&(this.autoclose=this.element.data("date-autoclose")),this.keyboardNavigation=!0,"keyboardNavigation"in r?this.keyboardNavigation=r.keyboardNavigation:"dateKeyboardNavigation"in this.element.data()&&(this.keyboardNavigation=this.element.data("date-keyboard-navigation"));switch(r.startView||this.element.data("date-start-view")){case 2:case"decade":this.viewMode=this.startViewMode=2;break;case 1:case"year":this.viewMode=this.startViewMode=1;break;case 0:case"month":default:this.viewMode=this.startViewMode=0}this.todayBtn=r.todayBtn||this.element.data("date-today-btn")||!1,this.todayHighlight=r.todayHighlight||this.element.data("date-today-highlight")||!1,this.weekStart=(r.weekStart||this.element.data("date-weekstart")||s[this.language].weekStart||0)%7,this.weekEnd=(this.weekStart+6)%7,this.startDate=-Infinity,this.endDate=Infinity,this.setStartDate(r.startDate||this.element.data("date-startdate")),this.setEndDate(r.endDate||this.element.data("date-enddate")),this.fillDow(),this.fillMonths(),this.update(),this.showMode()};i.prototype={constructor:i,show:function(t){this.picker.show(),this.height=this.component?this.component.outerHeight():this.element.outerHeight(),this.update(),this.place(),e(window).on("resize",e.proxy(this.place,this)),t&&(t.stopPropagation(),t.preventDefault()),this.element.trigger({type:"show",date:this.date})},hide:function(t){this.picker.hide(),e(window).off("resize",this.place),this.viewMode=this.startViewMode,this.showMode(),this.isInput||e(document).off("mousedown",this.hide),t&&t.currentTarget.value&&this.setValue(),this.element.trigger({type:"hide",date:this.date})},getDate:function(){var e=this.getUTCDate();return new Date(e.getTime()+e.getTimezoneOffset()*6e4)},getUTCDate:function(){return this.date},setDate:function(e){this.setUTCDate(new Date(e.getTime()-e.getTimezoneOffset()*6e4))},setUTCDate:function(e){this.date=e,this.setValue()},setValue:function(){var e=o.formatDate(this.date,this.format,this.language);this.isInput?this.element.prop("value",e):(this.component&&this.element.find("input").prop("value",e),this.element.data("date",e))},setStartDate:function(e){this.startDate=e||-Infinity,this.startDate!==-Infinity&&(this.startDate=o.parseDate(this.startDate,this.format,this.language)),this.update(),this.updateNavArrows()},setEndDate:function(e){this.endDate=e||Infinity,this.endDate!==Infinity&&(this.endDate=o.parseDate(this.endDate,this.format,this.language)),this.update(),this.updateNavArrows()},place:function(){var t=parseInt(this.element.parents().filter(function(){return e(this).css("z-index")!="auto"}).first().css("z-index"))+10,n=this.component?this.component.offset():this.element.offset();this.picker.css({top:n.top+this.height,left:n.left,zIndex:t})},update:function(){this.date=o.parseDate(this.isInput?this.element.prop("value"):this.element.data("date")||this.element.find("input").prop("value"),this.format,this.language),this.date<this.startDate?this.viewDate=new Date(this.startDate):this.date>this.endDate?this.viewDate=new Date(this.endDate):this.viewDate=new Date(this.date),this.fill()},fillDow:function(){var e=this.weekStart,t="<tr>";while(e<this.weekStart+7)t+='<th class="dow">'+s[this.language].daysMin[e++%7]+"</th>";t+="</tr>",this.picker.find(".datepicker-days thead").append(t)},fillMonths:function(){var e="",t=0;while(t<12)e+='<span class="month">'+s[this.language].monthsShort[t++]+"</span>";this.picker.find(".datepicker-months td").html(e)},fill:function(){var e=new Date(this.viewDate),t=e.getUTCFullYear(),r=e.getUTCMonth(),i=this.startDate!==-Infinity?this.startDate.getUTCFullYear():-Infinity,u=this.startDate!==-Infinity?this.startDate.getUTCMonth():-Infinity,a=this.endDate!==Infinity?this.endDate.getUTCFullYear():Infinity,f=this.endDate!==Infinity?this.endDate.getUTCMonth():Infinity,l=this.date.valueOf(),c=new Date;this.picker.find(".datepicker-days thead th:eq(1)").text(s[this.language].months[r]+" "+t),this.picker.find("tfoot th.today").text(s[this.language].today).toggle(this.todayBtn),this.updateNavArrows(),this.fillMonths();var h=n(t,r-1,28,0,0,0,0),p=o.getDaysInMonth(h.getUTCFullYear(),h.getUTCMonth());h.setUTCDate(p),h.setUTCDate(p-(h.getUTCDay()-this.weekStart+7)%7);var d=new Date(h);d.setUTCDate(d.getUTCDate()+42),d=d.valueOf();var v=[],m;while(h.valueOf()<d){h.getUTCDay()==this.weekStart&&v.push("<tr>"),m="";if(h.getUTCFullYear()<t||h.getUTCFullYear()==t&&h.getUTCMonth()<r)m+=" old";else if(h.getUTCFullYear()>t||h.getUTCFullYear()==t&&h.getUTCMonth()>r)m+=" new";this.todayHighlight&&h.getUTCFullYear()==c.getFullYear()&&h.getUTCMonth()==c.getMonth()&&h.getUTCDate()==c.getDate()&&(m+=" today"),h.valueOf()==l&&(m+=" active");if(h.valueOf()<this.startDate||h.valueOf()>this.endDate)m+=" disabled";v.push('<td class="day'+m+'">'+h.getUTCDate()+"</td>"),h.getUTCDay()==this.weekEnd&&v.push("</tr>"),h.setUTCDate(h.getUTCDate()+1)}this.picker.find(".datepicker-days tbody").empty().append(v.join(""));var g=this.date.getUTCFullYear(),y=this.picker.find(".datepicker-months").find("th:eq(1)").text(t).end().find("span").removeClass("active");g==t&&y.eq(this.date.getUTCMonth()).addClass("active"),(t<i||t>a)&&y.addClass("disabled"),t==i&&y.slice(0,u).addClass("disabled"),t==a&&y.slice(f+1).addClass("disabled"),v="",t=parseInt(t/10,10)*10;var b=this.picker.find(".datepicker-years").find("th:eq(1)").text(t+"-"+(t+9)).end().find("td");t-=1;for(var w=-1;w<11;w++)v+='<span class="year'+(w==-1||w==10?" old":"")+(g==t?" active":"")+(t<i||t>a?" disabled":"")+'">'+t+"</span>",t+=1;b.html(v)},updateNavArrows:function(){var e=new Date(this.viewDate),t=e.getUTCFullYear(),n=e.getUTCMonth();switch(this.viewMode){case 0:this.startDate!==-Infinity&&t<=this.startDate.getUTCFullYear()&&n<=this.startDate.getUTCMonth()?this.picker.find(".prev").css({visibility:"hidden"}):this.picker.find(".prev").css({visibility:"visible"}),this.endDate!==Infinity&&t>=this.endDate.getUTCFullYear()&&n>=this.endDate.getUTCMonth()?this.picker.find(".next").css({visibility:"hidden"}):this.picker.find(".next").css({visibility:"visible"});break;case 1:case 2:this.startDate!==-Infinity&&t<=this.startDate.getUTCFullYear()?this.picker.find(".prev").css({visibility:"hidden"}):this.picker.find(".prev").css({visibility:"visible"}),this.endDate!==Infinity&&t>=this.endDate.getUTCFullYear()?this.picker.find(".next").css({visibility:"hidden"}):this.picker.find(".next").css({visibility:"visible"})}},click:function(t){t.stopPropagation(),t.preventDefault();var r=e(t.target).closest("span, td, th");if(r.length==1)switch(r[0].nodeName.toLowerCase()){case"th":switch(r[0].className){case"switch":this.showMode(1);break;case"prev":case"next":var i=o.modes[this.viewMode].navStep*(r[0].className=="prev"?-1:1);switch(this.viewMode){case 0:this.viewDate=this.moveMonth(this.viewDate,i);break;case 1:case 2:this.viewDate=this.moveYear(this.viewDate,i)}this.fill();break;case"today":var s=new Date;s.setUTCHours(0),s.setUTCMinutes(0),s.setUTCSeconds(0),s.setUTCMilliseconds(0),this.showMode(-2);var u=this.todayBtn=="linked"?null:"view";this._setDate(s,u)}break;case"span":if(!r.is(".disabled")){this.viewDate.setUTCDate(1);if(r.is(".month")){var a=r.parent().find("span").index(r);this.viewDate.setUTCMonth(a),this.element.trigger({type:"changeMonth",date:this.viewDate})}else{var f=parseInt(r.text(),10)||0;this.viewDate.setUTCFullYear(f),this.element.trigger({type:"changeYear",date:this.viewDate})}this.showMode(-1),this.fill()}break;case"td":if(r.is(".day")&&!r.is(".disabled")){var l=parseInt(r.text(),10)||1,f=this.viewDate.getUTCFullYear(),a=this.viewDate.getUTCMonth();r.is(".old")?a==0?(a=11,f-=1):a-=1:r.is(".new")&&(a==11?(a=0,f+=1):a+=1),this._setDate(n(f,a,l,0,0,0,0))}}},_setDate:function(e,t){if(!t||t=="date")this.date=e;if(!t||t=="view")this.viewDate=e;this.fill(),this.setValue(),this.element.trigger({type:"changeDate",date:this.date});var n;this.isInput?n=this.element:this.component&&(n=this.element.find("input")),n&&(n.change(),this.autoclose&&this.hide())},moveMonth:function(e,t){if(!t)return e;var n=new Date(e.valueOf()),r=n.getUTCDate(),i=n.getUTCMonth(),s=Math.abs(t),o,u;t=t>0?1:-1;if(s==1){u=t==-1?function(){return n.getUTCMonth()==i}:function(){return n.getUTCMonth()!=o},o=i+t,n.setUTCMonth(o);if(o<0||o>11)o=(o+12)%12}else{for(var a=0;a<s;a++)n=this.moveMonth(n,t);o=n.getUTCMonth(),n.setUTCDate(r),u=function(){return o!=n.getUTCMonth()}}while(u())n.setUTCDate(--r),n.setUTCMonth(o);return n},moveYear:function(e,t){return this.moveMonth(e,t*12)},dateWithinRange:function(e){return e>=this.startDate&&e<=this.endDate},keydown:function(e){if(this.picker.is(":not(:visible)")){e.keyCode==27&&this.show();return}var t=!1,n,r,i,s,o;switch(e.keyCode){case 27:this.hide(),e.preventDefault();break;case 37:case 39:if(!this.keyboardNavigation)break;n=e.keyCode==37?-1:1,e.ctrlKey?(s=this.moveYear(this.date,n),o=this.moveYear(this.viewDate,n)):e.shiftKey?(s=this.moveMonth(this.date,n),o=this.moveMonth(this.viewDate,n)):(s=new Date(this.date),s.setUTCDate(this.date.getUTCDate()+n),o=new Date(this.viewDate),o.setUTCDate(this.viewDate.getUTCDate()+n)),this.dateWithinRange(s)&&(this.date=s,this.viewDate=o,this.setValue(),this.update(),e.preventDefault(),t=!0);break;case 38:case 40:if(!this.keyboardNavigation)break;n=e.keyCode==38?-1:1,e.ctrlKey?(s=this.moveYear(this.date,n),o=this.moveYear(this.viewDate,n)):e.shiftKey?(s=this.moveMonth(this.date,n),o=this.moveMonth(this.viewDate,n)):(s=new Date(this.date),s.setUTCDate(this.date.getUTCDate()+n*7),o=new Date(this.viewDate),o.setUTCDate(this.viewDate.getUTCDate()+n*7)),this.dateWithinRange(s)&&(this.date=s,this.viewDate=o,this.setValue(),this.update(),e.preventDefault(),t=!0);break;case 13:this.hide(),e.preventDefault();break;case 9:this.hide()}if(t){this.element.trigger({type:"changeDate",date:this.date});var u;this.isInput?u=this.element:this.component&&(u=this.element.find("input")),u&&u.change()}},showMode:function(e){e&&(this.viewMode=Math.max(0,Math.min(2,this.viewMode+e))),this.picker.find(">div").hide().filter(".datepicker-"+o.modes[this.viewMode].clsName).show(),this.updateNavArrows()}},e.fn.datepicker=function(t){var n=Array.apply(null,arguments);return n.shift(),this.each(function(){var r=e(this),s=r.data("datepicker"),o=typeof t=="object"&&t;s||r.data("datepicker",s=new i(this,e.extend({},e.fn.datepicker.defaults,o))),typeof t=="string"&&typeof s[t]=="function"&&s[t].apply(s,n)})},e.fn.datepicker.defaults={},e.fn.datepicker.Constructor=i;var s=e.fn.datepicker.dates={en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa","Su"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today"}},o={modes:[{clsName:"days",navFnc:"Month",navStep:1},{clsName:"months",navFnc:"FullYear",navStep:1},{clsName:"years",navFnc:"FullYear",navStep:10}],isLeapYear:function(e){return e%4===0&&e%100!==0||e%400===0},getDaysInMonth:function(e,t){return[31,o.isLeapYear(e)?29:28,31,30,31,30,31,31,30,31,30,31][t]},validParts:/dd?|mm?|MM?|yy(?:yy)?/g,nonpunctuation:/[^ -\/:-@\[-`{-~\t\n\r]+/g,parseFormat:function(e){var t=e.replace(this.validParts,"\0").split("\0"),n=e.match(this.validParts);if(!t||!t.length||!n||n.length==0)throw new Error("Invalid date format.");return{separators:t,parts:n}},parseDate:function(t,r,o){if(t instanceof Date)return t;if(/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(t)){var u=/([-+]\d+)([dmwy])/,a=t.match(/([-+]\d+)([dmwy])/g),f,l;t=new Date;for(var c=0;c<a.length;c++){f=u.exec(a[c]),l=parseInt(f[1]);switch(f[2]){case"d":t.setUTCDate(t.getUTCDate()+l);break;case"m":t=i.prototype.moveMonth.call(i.prototype,t,l);break;case"w":t.setUTCDate(t.getUTCDate()+l*7);break;case"y":t=i.prototype.moveYear.call(i.prototype,t,l)}}return n(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),0,0,0)}var a=t&&t.match(this.nonpunctuation)||[],t=new Date,h={},p=["yyyy","yy","M","MM","m","mm","d","dd"],d={yyyy:function(e,t){return e.setUTCFullYear(t)},yy:function(e,t){return e.setUTCFullYear(2e3+t)},m:function(e,t){t-=1;while(t<0)t+=12;t%=12,e.setUTCMonth(t);while(e.getUTCMonth()!=t)e.setUTCDate(e.getUTCDate()-1);return e},d:function(e,t){return e.setUTCDate(t)}},v,m,f;d.M=d.MM=d.mm=d.m,d.dd=d.d,t=n(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate(),0,0,0);if(a.length==r.parts.length){for(var c=0,g=r.parts.length;c<g;c++){v=parseInt(a[c],10),f=r.parts[c];if(isNaN(v))switch(f){case"MM":m=e(s[o].months).filter(function(){var e=this.slice(0,a[c].length),t=a[c].slice(0,e.length);return e==t}),v=e.inArray(m[0],s[o].months)+1;break;case"M":m=e(s[o].monthsShort).filter(function(){var e=this.slice(0,a[c].length),t=a[c].slice(0,e.length);return e==t}),v=e.inArray(m[0],s[o].monthsShort)+1}h[f]=v}for(var c=0,y;c<p.length;c++)y=p[c],y in h&&d[y](t,h[y])}return t},formatDate:function(t,n,r){var i={d:t.getUTCDate(),m:t.getUTCMonth()+1,M:s[r].monthsShort[t.getUTCMonth()],MM:s[r].months[t.getUTCMonth()],yy:t.getUTCFullYear().toString().substring(2),yyyy:t.getUTCFullYear()};i.dd=(i.d<10?"0":"")+i.d,i.mm=(i.m<10?"0":"")+i.m;var t=[],o=e.extend([],n.separators);for(var u=0,a=n.parts.length;u<a;u++)o.length&&t.push(o.shift()),t.push(i[n.parts[u]]);return t.join("")},headTemplate:'<thead><tr><th class="prev"><i class="icon-arrow-left"/></th><th colspan="5" class="switch"></th><th class="next"><i class="icon-arrow-right"/></th></tr></thead>',contTemplate:'<tbody><tr><td colspan="7"></td></tr></tbody>',footTemplate:'<tfoot><tr><th colspan="7" class="today"></th></tr></tfoot>'};o.template='<div class="datepicker dropdown-menu"><div class="datepicker-days"><table class=" table-condensed">'+o.headTemplate+"<tbody></tbody>"+o.footTemplate+"</table>"+"</div>"+'<div class="datepicker-months">'+'<table class="table-condensed">'+o.headTemplate+o.contTemplate+o.footTemplate+"</table>"+"</div>"+'<div class="datepicker-years">'+'<table class="table-condensed">'+o.headTemplate+o.contTemplate+o.footTemplate+"</table>"+"</div>"+"</div>";for(var u=2,a=arguments.length;u<a;u++)arguments[u].localize()});