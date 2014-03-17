timely.define(["jquery_timely","scripts/calendar/print","scripts/calendar/agenda_view","scripts/calendar/month_view","libs/frontend_utils","libs/utils","ai1ec_calendar","ai1ec_config","scripts/common_scripts/frontend/common_frontend","libs/select2_multiselect_helper","external_libs/jquery_history","external_libs/jquery.tablescroller","external_libs/jquery.scrollTo","external_libs/bootstrap_datepicker","external_libs/bootstrap/alert","external_libs/jquery_cookie"],function(e,t,n,r,i,s,o,u,a,f){e.cookie.json=!0;var l="ai1ec_saved_filter",c=!e("#save_filtered_views").hasClass("ai1ec-hide"),h=function(){var t=e("#ai1ec-view-dropdown .ai1ec-dropdown-menu .ai1ec-active a"),n=u.week_view_ends_at-u.week_view_starts_at,i=n*60;e("table.ai1ec-week-view-original").tableScroll({height:i,containerClass:"ai1ec-week-view ai1ec-popover-boundary",scroll:!1}),e("table.ai1ec-oneday-view-original").tableScroll({height:i,containerClass:"ai1ec-oneday-view ai1ec-popover-boundary",scroll:!1});if(e(".ai1ec-week-view").length||e(".ai1ec-oneday-view").length)e(".ai1ec-oneday-view .tablescroll_wrapper, .ai1ec-week-view .tablescroll_wrapper").scrollTo(".ai1ec-hour-marker:eq("+u.week_view_starts_at+")"),e(".ai1ec-hour-marker:eq("+u.week_view_starts_at+")").addClass("ai1ec-first-visible");e(".ai1ec-month-view .ai1ec-multiday").length&&r.extend_multiday_events(),e("#ai1ec-calendar-view-container").trigger("initialize_view.ai1ec")},p=function(){var t=e(".ai1ec-minical-trigger").data("datepicker");typeof t!="undefined"&&(t.picker.remove(),e(document).off("changeDate",".ai1ec-minical-trigger")),e(".ai1ec-tooltip.ai1ec-in, .ai1ec-popup").remove()},d=function(){var t=[],n=[],r=[],i;e(".ai1ec-category-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){t.push(e(this).data("term"))}),e(".ai1ec-tag-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){n.push(e(this).data("term"))}),e(".ai1ec-author-filter .ai1ec-dropdown-menu .ai1ec-active").each(function(){r.push(e(this).data("term"))});var s={};return s.cat_ids=t,s.tag_ids=n,s.auth_ids=r,i=e(".ai1ec-views-dropdown .ai1ec-dropdown-menu .ai1ec-active").data("action"),s.action=i,s},v=function(){var t=History.getState(),n=e.cookie(l);if(null===n||undefined===n)n={};var r=d();u.is_calendar_page?n.calendar_page=r:n[t.url]=r,e.cookie(l,n,{path:"/",expires:365}),e("#save_filtered_views").addClass("ai1ec-active").attr("data-original-title",u.clear_saved_filter_text);var i=s.make_alert(u.save_filter_text_ok,"success");e("#ai1ec-calendar").prepend(i)},m=function(t){t.stopImmediatePropagation();var n=e.cookie(l);if(u.is_calendar_page)delete n.calendar_page;else{var r=History.getState();delete n[r.url]}e.cookie(l,n,{path:"/",expires:365}),e("#save_filtered_views").removeClass("ai1ec-active").attr("data-original-title",u.reset_saved_filter_text),c||e("#save_filtered_views").addClass("ai1ec-hide");var i=s.make_alert(u.remove_filter_text_ok,"success");e("#ai1ec-calendar").prepend(i)},g=function(t,n){e("#ai1ec-calendar-view-loading").fadeIn("fast"),e("#ai1ec-calendar-view").fadeTo("fast",.3,function(){var r={request_type:n,ai1ec_doing_ajax:!0};e.ajax({url:t,dataType:n,data:r,method:"get",success:function(t){p(),typeof t.views_dropdown=="string"&&e(".ai1ec-views-dropdown").replaceWith(t.views_dropdown),typeof t.categories=="string"&&(e(".ai1ec-category-filter").replaceWith(t.categories),u.use_select2&&f.init(e(".ai1ec-category-filter"))),typeof t.authors=="string"&&(e(".ai1ec-author-filter").replaceWith(t.authors),u.use_select2&&f.init(e(".ai1ec-author-filter"))),typeof t.tags=="string"&&(e(".ai1ec-tag-filter").replaceWith(t.tags),u.use_select2&&f.init(e(".ai1ec-tag-filter"))),typeof t.subscribe_buttons=="string"&&e(".ai1ec-subscribe-container").replaceWith(t.subscribe_buttons),typeof t.save_view_btngroup=="string"&&e("#save_filtered_views").closest(".ai1ec-btn-group").replaceWith(t.save_view_btngroup),c=t.are_filters_set;var n=e("#ai1ec-calendar-view-container");n.height(n.height());var r=e("#ai1ec-calendar-view").html(t.html).height();n.animate({height:r},{complete:function(){n.height("auto")}}),e("#ai1ec-calendar-view-loading").fadeOut("fast"),e("#ai1ec-calendar-view").fadeTo("fast",1),h()}})})},y=!1,b=function(e){var t=History.getState();if(t.data.ai1ec!==undefined&&!0===t.data.ai1ec||!0===y)y=!0,g(t.url,"json")},w=function(e,t){if(e==="json"){var n={ai1ec:!0};History.pushState(n,document.title,t)}else g(t,"jsonp")},E=function(t){var n=e(this);t.preventDefault(),w(n.data("type"),n.attr("href"))},S=function(t){var n=e(this);t.preventDefault();if(typeof n.data("datepicker")=="undefined"){n.datepicker({todayBtn:"linked",todayHighlight:!0});var r=n.data("datepicker");r.picker.addClass("ai1ec-right-aligned");var i=r.place;r.place=function(){i.call(this);var t=this.component?this.component:this.element,n=t.offset();this.picker.css({left:"auto",right:e(document).width()-n.left-t.outerWidth()})},e(document).on("changeDate",".ai1ec-minical-trigger",x)}n.datepicker("show")},x=function(t){var n,r=e(this),i;r.datepicker("hide"),n=r.data("href"),i=t.format(),i=i.replace(/\//g,"-"),n=n.replace("__DATE__",i),w(r.data("type"),n)},T=function(t){var n;typeof t.added!="undefined"?n=e(t.added.element).data("href"):n=e("option[value="+t.removed.id+"]",t.target).data("href"),data={ai1ec:!0},History.pushState(data,null,n)},N=function(){w(e(this).data("type"),e(this).data("href"))};return{initialize_view:h,handle_click_on_link_to_load_view:E,handle_minical_trigger:S,handle_minical_change_date:x,clear_filters:N,handle_state_change:b,load_view:g,save_current_filter:v,remove_current_filter:m,load_view_from_select2_filter:T}});