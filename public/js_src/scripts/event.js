define(
	[
		'jquery_timely',
		'domReady',
		'ai1ec_config',
		'scripts/event/gmaps_helper'
	],
	function( $, domReady, ai1ec_config, gmaps_helper ) {

	"use strict"; // jshint ;_;

	// Perform all initialization functions required on the page.
	var init = function() {
		if( $( '#ai1ec-gmap-canvas' ).length > 0 ) {
			timely.require( ['libs/gmaps' ], function( gMapsLoader ) {
				gMapsLoader( gmaps_helper.init_gmaps );
			} );
		}
	};

	var attach_event_handlers = function() {
		// handle showing the maps when clicking on the placeholder
		$( '.ai1ec-gmap-placeholder:first' ).click(
			gmaps_helper.handle_show_map_when_clicking_on_placeholder
		);
	};

	var start = function() {
		domReady( function() {
			// Initialize the page.
			// We wait for the DOM to be loaded so we load the map only when able.
			init();
			attach_event_handlers();
			// Trigger execution of any other actions to initialize event details.
			$( document ).trigger( 'event_page_ready.ai1ec' );
			// We need it for JS that will be loaded after this event.
			$( 'body' ).addClass( 'ai1ec-event-details-ready' );
		} );
	};

	return {
		start: start
	};
} );
