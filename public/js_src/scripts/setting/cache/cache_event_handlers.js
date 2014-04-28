define(
	[
		'jquery_timely',
		'scripts/setting/cache/cache_ajax_handlers',
		'libs/utils'
	],
	function( $, ajax_handlers, AI1EC_UTILS ) {

	"use strict"; // jshint ;_;

	var ajaxurl = AI1EC_UTILS.get_ajax_url();

	/**
	 * User rescans cache.
	 */
	var perform_rescan = function() {
		var $button = $( this );

		$button.button( 'loading' );
		// Create the data to send,
		var data = {
			action: 'ai1ec_rescan_cache',
		};

		// Make an AJAX call to cache rescan.
		$.post( ajaxurl, data, ajax_handlers.handle_rescan_cache, 'json' );
		return false;
	};
	return {
		"perform_rescan" : perform_rescan
	};

} );
