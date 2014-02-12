define(
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap/collapse"
	],
	function( $, domReady ) {
	"use strict";

	domReady( function() {
		// Toggle visibility of .fa-caret-down/.fa-caret-up in collapse triggers
		// when they are clicked.
		$( document ).on( 'click', '[data-toggle="ai1ec-collapse"]', function() {
			$( this ).toggleClass( 'ai1ec-active' );
			$( '.fa-caret-down, .fa-caret-up, .fa-chevron-down, .fa-chevron-up, .fa-arrow-down, .fa-arrow-up', this )
				.toggleClass( 'ai1ec-hide' );
		} );
	} );
} );
