timely.define(
	[
		'jquery_timely',
		'libs/utils'
	],
	function( $, AI1EC_UTILS ) {

	 // jshint ;_;

	/**
	 * Rescan complete.
	 *
	 * @param  {object} response AJAX response object
	 */
	var handle_rescan_cache = function( response ) {
		var $button  = $( '#ai1ec-button-refresh' ),
		    $success = $( '#ai1ec-cache-scan-success' ),
		    $danger  = $( '#ai1ec-cache-scan-danger' ),
		    $alert;

		$button.button( 'reset' );

		if ( response.error ) {
			// Error rescanning cache
			$alert = AI1EC_UTILS.make_alert( response.message, 'error' );
		} else {
			if ('0' === response.state) {
				$success.toggleClass( 'ai1ec-hide', true );
				$danger.toggleClass( 'ai1ec-hide', false );
			} else {
				$success.toggleClass( 'ai1ec-hide', false );
				$danger.toggleClass( 'ai1ec-hide', true );
			}
		}
	};
	return {
		"handle_rescan_cache" : handle_rescan_cache
	};

} );
