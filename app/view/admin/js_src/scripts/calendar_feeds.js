define(
	[
		'jquery_timely',
		'domReady',
		'scripts/calendar_feeds/facebook/facebook_event_handlers',
		'scripts/calendar_feeds/facebook/facebook_utility_functions',
		'scripts/calendar_feeds/ics/ics_event_handlers',
		'scripts/calendar_feeds/file_upload/file_upload_event_handlers',
		"libs/select2_multiselect_helper",
		"libs/tags_select",
		'libs/utils',
		'external_libs/jquery_cookie',
		'external_libs/bootstrap_tab',
		'external_libs/bootstrap_alert',
		"libs/modal_helper"
	],
	function( $, domReady, event_handlers, utility_functions, ics_event_handlers,
		file_upload_event_handlers, select2_multiselect_helper, tags_select, utils ) {
	"use strict"; // jshint ;_;

	/**
	 * Refresh Select2 widgets.
	 */
	var refresh_select2 = function() {
		var $ics_container = $( this.hash );
		select2_multiselect_helper.refresh( $ics_container );
		tags_select.refresh( $ics_container );
	};

	var attach_event_handlers = function() {
		var $ics_container = $( '#ai1ec-feeds-after' ),
		    $facebook_container = $( '.ai1ec_submit_wrapper' ),
		    $file_upload_container = $( '.ai1ec_file_upload_tags_categories' );
		select2_multiselect_helper.init( $ics_container );
		tags_select.init( $ics_container );
		select2_multiselect_helper.init( $facebook_container );
		tags_select.init( $facebook_container );
		select2_multiselect_helper.init( $file_upload_container );
		tags_select.init( $file_upload_container );
		// Save the active tab in a cookie on click.
		$( 'ul.nav-tabs a' ).on( 'click', event_handlers.handle_set_tab_cookie );
		// Reinitialize Select2 widgets when displayed (required for placement of
		// placeholders).
		$( 'ul.nav-tabs a' ).on( 'shown', refresh_select2 );

		$( '#ai1ec_subscribe_users' ).on( 'click', event_handlers.do_controls_before_subscribing );
		$( 'input[type=submit]' ).not( '#ai1ec_subscribe_users, #ai1ec_file_submit' ).click( event_handlers.handle_click_on_submit_buttons );
		// Refresh the events for the clicked multiselect
		$( '.ai1ec-facebook-refresh-multiselect' ).click( event_handlers.refresh_multiselect );
		// Refreshes the events for the clicked facebook user with data from facebook.
		$( '.ai1ec-facebook-items' ).on( "click", '.ai1ec-facebook-refresh', event_handlers.refresh_events );
		// Open the modal that allows the user to choose whether to keep events or not. use delegate so that i have only 3 handlers instead of 5000
		$( '.ai1ec-facebook-items' ).on( "click", '.ai1ec-facebook-remove', event_handlers.remove_subscription );
		// Handle the modal clickss
		$( '#ai1ec-facebook-modal' ).on( 'click', 'a.remove, a.keep', event_handlers.modal_remove_subscription );
		$( '#ai1ec-facebook-connect a' ).click( event_handlers.click_on_facebook_connect_button_opens_modal_if_app_id_and_secret_are_not_set );
		$( document ).on( "click", "#ai1ec_facebook_connect_modal a.keep", event_handlers.click_on_save_button_in_modal_trigger_submit );
		// ============================ICS EVENT HANDLERs=======================
		$( document ).on( 'click', '#ai1ec_add_new_ics', ics_event_handlers.add_new_ics_event_handler );
		// The modal handles the events when you click on the buttons.
		$( '#ai1ec-ics-modal' ).on( 'click', 'a.remove, a.keep', ics_event_handlers.delete_ics_modal_handler );
		// Handles opening the modal window for deleting the feeds
		$( document ).on( 'click', '.ai1ec_delete_ics', ics_event_handlers.handle_open_modal );
		// Handle updating the feeds events
		$( 'div#ics' ).on( 'click', '.ai1ec_update_ics', ics_event_handlers.update_ics_handler );
		// Check that we are loading a file with an allowed extension
		$( 'div#file_upload' ).on( 'click', '#ai1ec_file_submit', file_upload_event_handlers.handle_click_on_submit_file );
		$( document ).on( 'click', '.ai1ec_update_ics', ics_event_handlers.update_ics_handler );
	};

	var start = function() {
		domReady( function(){
			// Set the active tab
			utils.activate_saved_tab_on_page_load( $.cookie( 'feeds_active_tab' ) );
			// Attach the event handlers
			attach_event_handlers();
		} );
	};

	return {
		start: start
	};
} );
