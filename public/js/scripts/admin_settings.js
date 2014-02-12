/**
	 * Initialize the license status indicator with API call.
	 */

timely.define(["jquery_timely","domReady","ai1ec_config","libs/utils","libs/collapse_helper","external_libs/bootstrap/tab","external_libs/bootstrap/dropdown","external_libs/bootstrap_datepicker","external_libs/bootstrap/tooltip","external_libs/jquery_cookie"],function(e,t,n,r){var i=function(){var t=!0;e("#ai1ec-plugins-settings input:text").each(function(){this.value!==""&&(t=!1)}),t===!0&&e("#ai1ec-plugins-settings").remove()},s=function(e,t){var n=!1;e.val()!==""&&(n=e.data("datepicker").date);var r=e.data("datepicker");r!==undefined&&(r.hide(),r.picker.remove(),e.removeData("datepicker")),e.data(t).datepicker(),r=e.data("datepicker"),n!==!1&&(r.date=n,r.setValue())},o=function(t){var n=e(this).attr("href");e.cookie("ai1ec_general_settings_active_tab",n)},u=function(){var t=e("#week_view_starts_at"),r=e("#week_view_ends_at"),i=parseInt(t.val(),10),s=parseInt(r.val(),10);if(s<i)return window.alert(n.end_must_be_after_start),r.focus(),!1;var o=s-i;if(o<6)return window.alert(n.show_at_least_six_hours),r.focus(),!1},a=function(){},f=function(){e(".ai1ec-gzip-causes-js-failure").remove()},l=function(){e("#ai1ec_save_settings").on("click",function(t){var r=e("#require_disclaimer").is(":checked"),i=e("#disclaimer").val();!0===r&&""===i&&(alert(n.require_desclaimer),e('#ai1ec-general-settings ul.ai1ec-nav-tabs a[href="#ai1ec-advanced"]').tab("show"),e("#disclaimer").focus(),t.preventDefault())})},c=function(){t(function(){a(),l(),f(),r.activate_saved_tab_on_page_load(e.cookie("ai1ec_general_settings_active_tab")),e(document).on("click",'#ai1ec-general-settings .ai1ec-nav-tabs a[data-toggle="ai1ec-tab"]',o),e(document).on("click","#disable_standard_filter_menu_toggler",function(e){e.preventDefault()});var t=e("#exact_date");t.datepicker(),e(document).on("change","#input_date_format",function(){var n=e("option:selected",this).data("pattern");s(t,{dateFormat:n})}),e(document).on("change","#week_start_day",function(){var n=e(this).val();s(t,{dateWeekstart:n})}),i(),e(document).on("click",".ai1ec-admin-view-settings .ai1ec-toggle-view",function(){var t=e(this),n=t.closest("tr"),r=e(".ai1ec-admin-view-settings .ai1ec-toggle-view:checked").length===0,i=n.find(".ai1ec-toggle-default-view:checked").length===1;if(r===!0||i===!0)return!1}),e(document).on("click",".ai1ec-admin-view-settings .ai1ec-toggle-default-view",function(){e(this).closest("tr").find(".ai1ec-toggle-view:first").prop("checked",!0)}),e("#ai1ec_save_settings").on("click",u),e("#show_create_event_button").trigger("ready")})};return{start:c,reset_datepicker:s}});