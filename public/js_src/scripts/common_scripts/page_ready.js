require(
	[ "jquery_timely", "domReady" ],
	function( $, domReady ) {

	"use strict"; // jshint ;_;

	/**
	 * Execute any code after page is ready and all scripts have been initialized.
	 */
	domReady( function() {
		$( document ).trigger( 'page_ready.ai1ec' );
	} );
} );
