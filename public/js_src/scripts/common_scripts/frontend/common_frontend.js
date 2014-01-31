define(
	[
		"jquery_timely",
		"domReady",
		"scripts/common_scripts/frontend/common_event_handlers",
		"ai1ec_calendar",
		"external_libs/modernizr",
		"external_libs/bootstrap_tooltip",
		"external_libs/bootstrap_popover",
		"external_libs/bootstrap_dropdown"
	],
	function( $, domReady, event_handlers, ai1ec_calendar, Modernizr ) {
	"use strict"; // jshint ;_;

	var event_listeners_attached = false;

	var attach_event_handlers_frontend = function() {
		event_listeners_attached = true;
		$( document ).on( 'mouseenter', '.ai1ec-popup-trigger', event_handlers.handle_popover_over );
		$( document ).on( 'mouseleave', '.ai1ec-popup-trigger', event_handlers.handle_popover_out );
		$( document ).on( 'mouseleave', '.ai1ec-popup', event_handlers.handle_popover_self_out );
		$( document ).on( 'mouseenter', '.ai1ec-tooltip-trigger', event_handlers.handle_tooltip_over );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip-trigger', event_handlers.handle_tooltip_out );
		$( document ).on( 'mouseleave', '.tooltip', event_handlers.handle_tooltip_self_out );
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
