define(
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap/collapse"
	],
	function( $, domReady ) {
	"use strict";

	domReady( function() {
		// Toggle visibility of .icon-caret-down/.icon-caret-up in collapse triggers
		// when they are clicked.
		$( document ).on( 'click', '[data-toggle="ai1ec-collapse"]', function() {
			$( this ).toggleClass( 'ai1ec-active' );
			$( '.icon-caret-down, .icon-caret-up, .icon-chevron-down, .icon-chevron-up, .icon-arrow-down, .icon-arrow-up', this )
				.toggleClass( 'ai1ec-hide' );
		} );
	} );
} );
