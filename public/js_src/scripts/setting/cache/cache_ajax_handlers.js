define(
	[
		'jquery_timely',
		'libs/utils'
	],
	function( $, AI1EC_UTILS ) {

	"use strict"; // jshint ;_;

	/**
	 * Rescan complete.
	 *
	 * @param  {object} response AJAX response object
	 */
	var handle_rescan_cache = function( response ) {
		var $refresh_icon = $( '.ai1ec-fa-refresh' ),
		    $rescan_info  = $( '#ai1ec-twig-rescan-info' ),
			$warning_icon = $( '.ai1ec-fa-warning' ),
			$success_icon = $( '.ai1ec-fa-check-circle' ),
			$alert;

		$refresh_icon.show();
		$rescan_info.hide();

		if ( response.error ) {
			// Error rescanning cache
			$alert = AI1EC_UTILS.make_alert( response.message, 'error' );
		} else {
			if ('0' === response.state) {
				$warning_icon.show();
			} else {
				$success_icon.show();
			}
		}
	};
	return {
		"handle_rescan_cache" : handle_rescan_cache
	};

} );
