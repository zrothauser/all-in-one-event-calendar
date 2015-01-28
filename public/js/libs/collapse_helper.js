timely.define(
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap/transition",
		"external_libs/bootstrap/collapse"
	],
	function( $, domReady ) {
	

	domReady( function() {
		// Toggle visibility of .ai1ec-fa-caret-down/.ai1ec-fa-caret-up in collapse
		// triggers when they are clicked.
		$( document ).on( 'click', '[data-toggle="ai1ec-collapse"]', function() {
			$( this ).toggleClass( 'ai1ec-active' );
			$(
				'.ai1ec-fa-caret-down, .ai1ec-fa-caret-up, .ai1ec-fa-chevron-down, ' +
				'.ai1ec-fa-chevron-up, .ai1ec-fa-arrow-down, .ai1ec-fa-arrow-up',
				this
			).toggleClass( 'ai1ec-hide' );
		} );
	} );
} );
