timely.define(["jquery_timely","scripts/calendar/print","scripts/calendar/agenda_view","scripts/calendar/month_view","libs/frontend_utils","libs/utils","ai1ec_calendar","ai1ec_config","scripts/common_scripts/frontend/common_frontend","libs/select2_multiselect_helper","external_libs/twig","agenda","oneday","month","external_libs/jquery_history","external_libs/jquery.tablescroller","external_libs/jquery.scrollTo","external_libs/bootstrap_datepicker","external_libs/bootstrap/alert","external_libs/jquery_cookie"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p){e.cookie.json=!0;var d="ai1ec_saved_filter",v=!e("#save_filtered_views").hasClass("ai1ec-hide");timely.renderer_map||(timely.renderer_map={}),e.extend(timely.renderer_map,{agenda:c,oneday:h,week:h,month:p});var m=function(e){var t=e.find("#ai1ec-view-dropdown .ai1ec-dropdown-menu .ai1ec-active a"),n=u.week_view_ends_at-u.week_view_starts_at,i=n*60;e.find("table.ai1ec-week-view-original").tableScroll({height:i,containerClass:"ai1ec-week-view ai1ec-popover-boundary",scroll:!1}),e.find("table.ai1ec-oneday-view-original").tableScroll({height:i,containerClass:"ai1ec-oneday-view ai1ec-popover-boundary",scroll:!1});if(e.find(".ai1ec-week-view").length||e.find(".ai1ec-oneday-view").length)e.find(".ai1ec-oneday-view .tablescroll_wrapper, .ai1ec-week-view .tablescroll_wrapper").scrollTo(e.find(".ai1ec-hour-marker:eq("+u.week_view_starts_at+")")),e.find(".ai1ec-hour-marker:eq("+u.week_view_starts_at+")").addClass("ai1ec-first-visible");e.find(".ai1ec-month-view .ai1ec-multiday").length&&r.extend_multiday_events(e),e.find(".ai1ec-calendar-view-container").data("ai1ec-inited",!0).trigger("initialize_view.ai1ec"),e.find(".ai1ec-calendar-toolbar").trigger("ai1ec-affix.reinit")},g=function(t){t.find(".ai1ec-calendar-view-container").trigger("destroy_view.ai1ec");var n=t.find(".ai1ec-minical-trigger").data("datepicker");typeof n!="undefined"&&(n.picker.remove(),e(document).off("changeDate",".ai1ec-minical-trigger")),t.find(".ai1ec-tooltip.ai1ec-in, .ai1ec-popup").remove(),t.find(".ai1ec-calendar-toolbar .ai1ec-btn-toolbar").remove()},y=function(){var t=[],n=[],r=[],i;e(".ai1ec-category-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){t.push(e(this).data("term"))}),e(".ai1ec-tag-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){n.push(e(this).data("term"))}),e(".ai1ec-author-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){r.push(e(this).data("term"))});var s={};return s.cat_ids=t,s.tag_ids=n,s.auth_ids=r,i=e(".ai1ec-views-dropdown .ai1ec-dropdown-menu .ai1ec-active").data("action"),s.action=i,s},b=function(){var t=History.getState(),n=e.cookie(d);if(null===n||undefined===n)n={};var r=y();u.is_calendar_page?n.calendar_page=r:n[t.url]=r,e.cookie(d,n,{path:"/",expires:365}),e("#save_filtered_views").addClass("ai1ec-active").attr("data-original-title",u.clear_saved_filter_text);var i=s.make_alert(u.save_filter_text_ok,"success");e("#ai1ec-calendar").prepend(i)},w=function(t){t.stopImmediatePropagation();var n=e.cookie(d);if(u.is_calendar_page)delete n.calendar_page;else{var r=History.getState();delete n[r.url]}e.cookie(d,n,{path:"/",expires:365}),e("#save_filtered_views").removeClass("ai1ec-active").attr("data-original-title",u.reset_saved_filter_text),v||e("#save_filtered_views").addClass("ai1ec-hide");var i=s.make_alert(u.remove_filter_text_ok,"success");e("#ai1ec-calendar").prepend(i)},E=!1,S={},x=function(t,n,r){D(t,n),t.find(".ai1ec-calendar-view-loading").fadeIn("fast").end().find(".ai1ec-calendar-view").fadeTo("fast",.3,function(){var i={request_type:r,ai1ec_doing_ajax:!0};e("#ai1ec-container > .ai1ec-alert").remove(),E&&1===E.readyState&&E.abort("ai1ec_abort");var o="-"+i.request_type;S[n+o]?E=S[n+o]:(E=e.ajax({url:n,dataType:r,data:i,method:"GET"}),S[n+o]=E.promise()),E.done(function(i){e(document).trigger("calendar_view_loaded.ai1ec",t),g(t),typeof i.views_dropdown=="string"&&t.find(".ai1ec-views-dropdown").replaceWith(i.views_dropdown),typeof i.categories=="string"&&t.find(".ai1ec-category-filter").replaceWith(i.categories),typeof i.authors=="string"&&t.find(".ai1ec-author-filter").replaceWith(i.authors),typeof i.tags=="string"&&t.find(".ai1ec-tag-filter").replaceWith(i.tags);if(typeof i.custom_filters=="string"){var s=t.find("li.ai1ec-custom-filter").parent();t.find("li.ai1ec-custom-filter").remove(),s.append(i.custom_filters)}typeof i.subscribe_buttons=="string"&&t.find(".ai1ec-subscribe-container").empty().append(i.subscribe_buttons),typeof i.save_view_btngroup=="string"&&t.find("#save_filtered_views").closest(".ai1ec-btn-group").replaceWith(i.save_view_btngroup),v=i.are_filters_set;var o;if(i.is_json){var u=i.html.type;if(!timely.renderer_map[u]){x(t,n.replace(/\~json/,"~html"),r);return}o=timely.renderer_map[u]}t.find(".ai1ec-calendar-view").html(o?o.render(i.html):e(i.html).find(".ai1ec-calendar-view").length?e(i.html).find(".ai1ec-calendar-view").html():i.html),m(t)}),E.fail(function(n,r,i){if("ai1ec_abort"===r)return;var o=u.load_views_error;o=o.replace("%STATUS%",n.status),o=o.replace("%ERROR%",i),o=o+"<br/>"+s.make_popup_content_link(u.load_views_error_link_popup,u.load_views_error_popup_title,n.responseText);var a=s.make_alert(o,"error",!0);e("#ai1ec-container").prepend(a),g(t),m(t)}),E.always(function(){t.find(".ai1ec-calendar-view-loading").fadeOut("fast"),t.find(".ai1ec-calendar-view").fadeTo("fast",1)})})},T=!1,N=function(t){var n=History.getState(),r=e(".ai1ec-calendar:first");if(n.data.ai1ec!==undefined&&!0===n.data.ai1ec||!0===T)T=!0,x(r,n.url,"json")},C=function(e,t,n){if(t==="json"){var r={ai1ec:!0};History.pushState(r,document.title,decodeURI(n))}else x(e,n,"jsonp")},k=function(t){var n=e(this),r=n.closest(".ai1ec-calendar");t.preventDefault(),C(r,n.data("type"),n.attr("href"))},L=function(t){var n=e(this);t.preventDefault();if(typeof n.data("datepicker")=="undefined"){n.datepicker({todayBtn:"linked",todayHighlight:!0,language:n.data("lang")});var r=n.data("datepicker");if(n.closest(".ai1ec-pull-right").length>0){r.picker.addClass("ai1ec-right-aligned");var i=r.place;r.place=function(){i.call(this);var t=this.component?this.component:this.element,n=t.offset();this.picker.css({left:"auto",right:e(document).width()-n.left-t.outerWidth()})}}e(document).one("changeDate",".ai1ec-minical-trigger",A)}n.datepicker("show")},A=function(t){var n,r=e(this),i=r.closest(".ai1ec-calendar"),s;r.datepicker("hide"),n=r.data("href"),s=t.format(),s=s.replace(/\//g,"-"),n=n.replace("__DATE__",s),C(i,r.data("type"),n)},O=function(t){var n;typeof t.added!="undefined"?n=e(t.added.element).data("href"):n=e("option[value="+t.removed.id+"]",t.target).data("href");var r={ai1ec:!0};History.pushState(r,null,n)},M=function(){var t=e(this).closest(".ai1ec-calendar");return C(t,e(this).attr("data-type"),e(this).attr("data-href")),!1},_=u.ai1ec_permalinks_enabled?"/":"|",D=function(t,n){var r={},i=function(i,s){var o=e(".ai1ec-filters .ai1ec-load-view."+s.filter_class,t),u=e(s.filter_button,t),a=new RegExp(i+"~((,?[0-9]+)+)"),f=n.match(a),l=n.match(/action~(\w+)/),l=l&&l[1]?l[1]:null,f=f&&f[1]?e.map(f[1].split(","),function(e){return parseInt(e,10)}):[];r[i]=f.join(","),o.each(function(){var t=this.href,n=e(this).closest("[data-term]"),r=n.data("term"),s=e.extend(!0,[],f);-1<e.inArray(r,f)?(s=e.grep(s,function(e){return r!=e}),n.addClass("ai1ec-active")):(s.push(r),n.removeClass("ai1ec-active"));var o=s.length?i+"~"+s.join(","):"";t.match(a)?this.href=t.replace(a,o):s.length&&(this.href+=_+o),l&&(this.href=this.href.replace(/action~(\w+)/,"action~"+l)),this.href=P(this.href)}),e(s.filter_items,t).length?u.addClass("ai1ec-active"):u.removeClass("ai1ec-active"),e(".ai1ec-clear-filter",u).each(function(){e(this).attr("data-href",P(e(this).attr("data-href").replace(a,"")))})},s={};e("ul.ai1ec-filters > li",t).each(function(){var t=e(this),n=t.data("slug");s[n+"_ids"]={filter_class:"ai1ec-"+n,filter_button:"li.ai1ec-"+n+"-filter",filter_items:".ai1ec-"+n+"-filter .ai1ec-active"}});for(var o in s)i(o,s[o]);for(var o in r){var u=r[o],a=new RegExp(o+"~((,?[0-9]+)+)");e(".ai1ec-filters .ai1ec-load-view").each(function(){if(e(this).hasClass(s[o].filter_class))return;u?this.href.match(a)?this.href=this.href.replace(a,o+"~"+u):this.href=this.href+_+o+"~"+u:this.href=P(this.href.replace(a,""))}),e(".ai1ec-clear-filter",t).each(function(){var t=e(this),n=t.closest("[data-slug]").data("slug");n===o.substr(0,o.length-4)||!u?t.attr("data-href",P(t.attr("data-href").replace(a,""))):t.attr("data-href").match(a)?t.attr("data-href",P(t.attr("data-href").replace(a,o+"~"+u))):t.attr("data-href",P(t.attr("data-href")+_+o+"~"+u))})}},P=function(e){return"/"===_?e.replace(/\/\//g,"/").replace(/\/\//g,"/").replace(/:\//g,"://"):e.replace(/\|\|/g,"|").replace(/\|\|/g,"|")};return{initialize_view:m,handle_click_on_link_to_load_view:k,handle_minical_trigger:L,handle_minical_change_date:A,clear_filters:M,handle_state_change:N,load_view:x,save_current_filter:b,remove_current_filter:w,load_view_from_select2_filter:O,load_view_according_to_datatype:C}});