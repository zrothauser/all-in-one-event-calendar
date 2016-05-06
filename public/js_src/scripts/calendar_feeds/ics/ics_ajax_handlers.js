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
			var $alert = AI1EC_UTILS.make_alert( response.message, 'error' );
			$( '#ics-alerts' ).append( $alert ).prependTo( '#import' );
		} else {
			// Reset the form and add the feed to the bottom of the list.
			reset_form();
			$( '#ai1ec-feeds-after' )
				.addClass( 'ai1ec-well ai1ec-well-sm' )
				.insertAfter( '#ics .ai1ec-form-horizontal' );

			var
				feed_id    = response.update.data.ics_id,
				$feed      = $( response.message ),
				$container = $( '.ai1ec_feed_id[value="' + feed_id + '"] ')
					.closest( '.ai1ec-feed-container' );

			$feed.find( '.ai1ec-collapse' ).removeClass( 'ai1ec-collapse' );
			var $container = $( '.ai1ec_feed_id[value="' + feed_id + '"] ')
				.closest( '.ai1ec-feed-container' );
			if ( $container.length ) {
				$container.replaceWith( $feed );
			} else {
				$( '#ics' ).append( $feed );
			}
			$( 'a[data-toggle="ai1ec-tab"]' ).click();
			if (
				response.update &&
				response.update.data &&
				! response.update.data.error
			) {
				handle_update_ics( response.update.data );
			}
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
		$( '#ics-alerts' ).append( $alert ).prependTo( '#ics' );
	};

	var reset_form = function() {
		$( '#ai1ec_feed_url' )
			.val( ' ' )
			.prop( 'readonly', false );

		$( '#ai1ec-feeds-after input[type="checkbox"]' )
			.prop( 'checked', false );

		$( '#ai1ec_feed_id' ).remove();
		$( '#ai1ec_feed_category' ).select2( 'val', '' );
		$( '#ai1ec_feed_tags' ).select2( 'val', '' );
		$( '[id^="ai1ec_feed_cfg_"]' ).select2( 'val', '' );
		$( '#ai1ec_ics_add_new, #ai1ec_add_new_ics > i' )
			.removeClass( 'ai1ec-hidden' );
	
		$( '#ai1ec_ics_update' ).addClass( 'ai1ec-hidden' );
		$( '#ics .ai1ec-alert' ).remove();
	}

	return {
		"handle_add_new_ics" : handle_add_new_ics,
		"handle_delete_ics"  : handle_delete_ics,
		"handle_update_ics"  : handle_update_ics,
		"reset_form"         : reset_form
	};
} );
