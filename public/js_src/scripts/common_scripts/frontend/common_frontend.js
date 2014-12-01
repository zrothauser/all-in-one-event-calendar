define(
	[
		"jquery_timely",
		"domReady",
		"scripts/common_scripts/frontend/common_event_handlers",
		"ai1ec_calendar",
		"external_libs/modernizr",
		"external_libs/bootstrap/tooltip",
		"external_libs/constrained_popover",
		"external_libs/bootstrap/dropdown",
		"libs/recaptcha",
		"libs/collapse_helper",
		"external_libs/Placeholders",
		"scripts/add_new_event/event_location/gmaps_helper",
		"libs/select2_multiselect_helper",
		"libs/tags_select",
		"libs/timepicker_helper",
		"external_libs/moment",
		"libs/recaptcha",
		"external_libs/Placeholders",
		"external_libs/bootstrap/collapse",
		"external_libs/bootstrap/alert",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap_fileupload",
		"external_libs/jquery.scrollTo"
	],
	function( $, domReady, event_handlers, ai1ec_calendar, Modernizr ) {

	"use strict"; // jshint ;_;

	var event_listeners_attached = false;

	var attach_event_handlers_frontend = function() {
		event_listeners_attached = true;
		$( document ).on( 'mouseenter', '.ai1ec-popup-trigger',
			event_handlers.handle_popover_over );
		$( document ).on( 'mouseleave', '.ai1ec-popup-trigger',
			event_handlers.handle_popover_out );
		$( document ).on( 'mouseleave', '.ai1ec-popup',
			event_handlers.handle_popover_self_out );
		$( document ).on( 'mouseenter', '.ai1ec-tooltip-trigger',
			event_handlers.handle_tooltip_over );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip-trigger',
			event_handlers.handle_tooltip_out );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip',
			event_handlers.handle_tooltip_self_out );
	};

	/**
	 * Initialize page.
	 */
	var start = function() {
		domReady( function() {
			attach_event_handlers_frontend();
		} );
	};

	/**
	 * Returns whether event listeners have been attached.
	 *
	 * @return {boolean}
	 */
	var are_event_listeners_attached = function() {
		return event_listeners_attached;
	};

	return {
		start                        : start,
		are_event_listeners_attached : are_event_listeners_attached
	};
} );
