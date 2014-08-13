define(
	[
		'jquery_timely',
		'scripts/calendar_feeds/ics/ics_ajax_handlers',
		'libs/utils',
		'ai1ec_config'
	],
	function( $, ajax_handlers, AI1EC_UTILS, ai1ec_config ) {

	"use strict"; // jshint ;_;

	var ajaxurl = AI1EC_UTILS.get_ajax_url();

	/**
	 * User subscribes to a new feed.
	 */
	var add_new_feed = function() {
		var $button = $( this ),
		    $url    = $( '#ai1ec_feed_url' ),
		    url     = $url.val().replace( 'webcal://', 'http://' ),
		    invalid = false,
		    error_message;

		// restore feed url border colors if it has been changed
		$( '.ai1ec-feed-url, #ai1ec_feed_url' ).css( 'border-color', '#DFDFDF' );
		$( '#ai1ec-feed-error' ).remove();

		// Check for duplicates
		$( '.ai1ec-feed-url' ).each( function() {
			if ( this.value === url ) {
				// This feed's already been added
				$( this ).css( 'border-color', '#FF0000' );
				invalid = true;
				error_message = ai1ec_config.duplicate_feed_message;
			}
		} );

		// Check for valid URL
		if ( ! AI1EC_UTILS.isUrl( url ) ) {
			invalid = true;
			error_message = ai1ec_config.invalid_url_message;
		}

		if ( invalid ) {
			// color the feed url input field in red and output error message
			$url
				.addClass( 'input-error' )
				.focus()
				.before( AI1EC_UTILS.make_alert( error_message, 'error' ) );
		} else {
			// Active button loading state.
			$button.button( 'loading' );

			// Create the data to send,
			var enable_comments = $( '#ai1ec_comments_enabled' )
			    	.is( ':checked' ) ? 1 : 0,
			    show_map = $( '#ai1ec_map_display_enabled' )
			    	.is( ':checked' ) ? 1 : 0,
			    keep_tags_categories = $( '#ai1ec_add_tag_categories' )
			    	.is( ':checked' ) ? 1 : 0,
				keep_old_events = $( '#ai1ec_keep_old_events' )
			    	.is( ':checked' ) ? 1 : 0,
			    data = {
			    	action:               'ai1ec_add_ics',
			    	nonce:                ai1ec_config.calendar_feeds_nonce,
			    	feed_url:             url,
			    	feed_category:        $( '#ai1ec_feed_category' ).val(),
			    	feed_tags:            $( '#ai1ec_feed_tags' ).val(),
			    	comments_enabled:     enable_comments,
			    	map_display_enabled:  show_map,
			    	keep_tags_categories: keep_tags_categories,
					keep_old_events:   keep_old_events,
			    };

			// Make an AJAX call to save the new feed.
			$.post( ajaxurl, data, ajax_handlers.handle_add_new_ics, 'json' );
		}
	};

	/**
	 * User clicks "Remove" or "Keep" in ICS feed delete modal.
	 *
	 * @param {object} e Event object
	 */
	var submit_delete_modal = function( e ) {
		e.preventDefault();

		var remove_events = $( this ).hasClass( 'remove' ) ? true : false,
		    // Get the button element associated with the feed.
		    $button = $( $( this ).data( 'el' ) ),
		    // Get the feed container.
		    $container = $button.closest( '.ai1ec-feed-container' ),
		    // Get the feed's ID.
		    ics_id = $( '.ai1ec_feed_id', $container ).val(),
		    // Create the data to send.
		    data = {
		    	"action"        : 'ai1ec_delete_ics',
		    	"ics_id"        : ics_id,
		    	"remove_events" : remove_events
		    };

		// Activate button loading state.
		$button.button( 'loading' );
		// Hide the modal.
		$( '#ai1ec-ics-modal' ).modal( 'hide' );

		// Remove the feed from the database via AJAX.
		$.post( ajaxurl, data, ajax_handlers.handle_delete_ics, 'json' );
	};

	/**
	 * Delete ICS feed button clicked; ask user whether to keep or remove events.
	 */
	var open_delete_modal = function() {
		// Save the user id, the current elements and if we are removing the logged on user.
		$( '#ai1ec-ics-modal .ai1ec-btn' ).data( 'el', this );
		// Open the modal with a static background.
		$( '#ai1ec-ics-modal' ).modal( { 'backdrop': 'static' } );
	};

	/**
	 * Refresh ICS feed button clicked.
	 */
	var update_feed = function() {
		var $button = $( this ),
		    // Get the feed container.
		    $container = $button.closest( '.ai1ec-feed-container' ),
		    // Get the ID & activate AJAX loader.
		    ics_id = $( '.ai1ec_feed_id', $container ).val()
		    // Create the data to send.
		    var data = {
		    	action: 'ai1ec_update_ics',
		    	ics_id: ics_id
		    };

		// Activate button loading state.
		$button.button( 'loading' );

		// Remove the feed from the database via AJAX.
		$.post( ajaxurl, data, ajax_handlers.handle_update_ics, 'json' );
	};

	return {
		"add_new_feed"        : add_new_feed,
		"submit_delete_modal" : submit_delete_modal,
		"open_delete_modal"   : open_delete_modal,
		"update_feed"         : update_feed
	};

} );
