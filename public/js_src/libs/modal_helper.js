define(
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap_modal"
	],
	function( $, domReady ) {
	"use strict";

	domReady( function() {
		// Reproduce old Bootstrap behaviour of adding "modal-open" class to body
		// element while modal is open.
		var $body = $( 'body' );
		$body
			.on( 'shown', '.ai1ec-modal', function () {
				$body.addClass( 'ai1ec-modal-open' )
			} )
			.on( 'hidden', '.ai1ec-modal', function () {
				$body.removeClass( 'ai1ec-modal-open' )
			} );
	} );
} );
