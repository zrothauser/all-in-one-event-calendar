define(
	[
  	'jquery_timely',
  	'libs/utils'
  ],
  function( $, AI1EC_UTILS ) {

	"use strict"; // jshint ;_;

	/**
	 * Feed creation complete.
	 *
	 * @param  {object} response AJAX response object
	 */
	var handle_add_new_ics = function( response ) {
		var $button = $( '#ai1ec_add_new_ics' ),
		    $url = $( '#ai1ec_feed_url' );

		// Reset add new feed button state.
		$button.button( 'reset' );

		if ( response.error ) {
			// Error adding feed; alert user.
	    $alert = AI1EC_UTILS.make_alert( response.message, 'error' );
			$( '#ics-alerts' ).append( $alert );
		} else {
			// Reset the form and add the feed to the bottom of the list.
			$url.val( '' );
			$( '#ai1ec-feeds-after' ).after( response.message );
		}
	};

	/**
	 * Feed delete complete.
	 *
	 * @param  {object} response AJAX response data
	 */
	var handle_delete_ics = function( response ) {
		var $container = $( 'input[value=' + response.ics_id + ']' )
		    	.closest( '.ai1ec-feed-container' ),
		    type = response.error ? 'error' : 'success',
		    $alert = AI1EC_UTILS.make_alert( response.message, type );

		if ( response.error ) {
			// Reset delete button state.
			$( '.ai1ec_update_ics', $container ).button( 'reset' );
		} else {
			// Remove the feed from the DOM.
			$container.remove();
		}

		// Append alert message to DOM.
		$( '#ics-alerts' ).append( $alert );
	};

	/**
	 * Feed refresh complete.
	 *
	 * @param  {object} response AJAX response data
	 */
	var handle_update_ics = function( response ) {
		var $container = $( 'input[value=' + response.ics_id + ']' )
		    	.closest( '.ai1ec-feed-container' ),
		    type = response.error ? 'error' : 'success',
		    $alert = AI1EC_UTILS.make_alert( response.message, type );

		// Reset refresh button state.
		$( '.ai1ec_update_ics', $container ).button( 'reset' );

		// Append alert message to DOM.
		$( '#ics-alerts' ).append( $alert );
	};

	return {
		"handle_add_new_ics" : handle_add_new_ics,
		"handle_delete_ics"  : handle_delete_ics,
		"handle_update_ics"  : handle_update_ics
	};
} );
