define(
	[
		'jquery_timely',
		'domReady',
		'scripts/calendar_feeds/ics/ics_event_handlers',
		"libs/select2_multiselect_helper",
		"libs/tags_select",
		'libs/utils',
		'external_libs/jquery_cookie',
		'external_libs/bootstrap/tab',
		'external_libs/bootstrap/alert',
		'external_libs/bootstrap/modal'
	],
	function(
		$,
		domReady,
		ics_event_handlers,
		select2_multiselect_helper,
		tags_select,
		utils
	) {

	"use strict"; // jshint ;_;

	/**
	 * Refresh Select2 widgets.
	 */
	var refresh_select2 = function() {
		var $ics_container = $( this.hash );
		select2_multiselect_helper.refresh( $ics_container );
		tags_select.refresh( $ics_container );
	};

	// Function that handles setting the cookie when the tab is clicked
	var handle_set_tab_cookie = function( e ) {
		var active = $( this ).attr( 'href' );
		$.cookie( 'feeds_active_tab', active );
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
		$( 'ul.ai1ec-nav-tabs a' ).on( 'click', handle_set_tab_cookie );
		// Reinitialize Select2 widgets when displayed (required for placement of
		// placeholders).
		$( 'ul.ai1ec-nav-tabs a' ).on( 'shown', refresh_select2 );

		// ============================ICS EVENT HANDLERs=======================
		$( document ).on( 'click', '#ai1ec_add_new_ics', ics_event_handlers.add_new_ics_event_handler );
		// The modal handles the events when you click on the buttons.
		$( '#ai1ec-ics-modal' ).on( 'click', 'a.remove, a.keep', ics_event_handlers.delete_ics_modal_handler );
		// Handles opening the modal window for deleting the feeds
		$( document ).on( 'click', '.ai1ec_delete_ics', ics_event_handlers.handle_open_modal );
		// Handle updating the feeds events
		$( 'div#ics' ).on( 'click', '.ai1ec_update_ics', ics_event_handlers.update_ics_handler );

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
