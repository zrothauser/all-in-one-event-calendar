define(
	[
		'jquery_timely',
		'domReady',
		'scripts/calendar_feeds/ics/ics_event_handlers',
		'libs/select2_multiselect_helper',
		'libs/tags_select',
		'libs/utils',
		'external_libs/jquery_cookie',
		'external_libs/bootstrap/tab',
		'external_libs/bootstrap/alert',
		'external_libs/bootstrap/modal',
		'external_libs/bootstrap/button',
		'external_libs/bootstrap/collapse'
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
		$( 'ul.ai1ec-nav a' ).on( 'click', handle_set_tab_cookie );
		// Reinitialize Select2 widgets when displayed (required for placement of
		// placeholders).
		$( 'ul.ai1ec-nav a' ).on( 'shown', refresh_select2 );

		// ===========================
		// = ICS feed event handlers =
		// ===========================
		$( 'select[name="cron_freq"]' ).on( 'change', function() {
			$.ajax( {
				url      : ajaxurl,
				type     : 'POST',
				data: {
					action    : 'ai1ec_feeds_page_post',
					cron_freq : this.value
				}
			} );
		} );
		// Handles clicking the buttons in the ICS delete modal.
		$( '#ai1ec-ics-modal' ).on(
			'click', '.remove, .keep', ics_event_handlers.submit_delete_modal
		);
		$( document )
			// Handles submitting a new feed.
			.on( 'click', '#ai1ec_add_new_ics', ics_event_handlers.add_new_feed )
			// Handles opening the modal window for deleting the feeds.
			.on( 'click', '.ai1ec_delete_ics', ics_event_handlers.open_delete_modal )
			// Handles refreshing the feed's events.
			.on( 'click', '.ai1ec_update_ics', ics_event_handlers.update_feed )
			// Checks import timezone option
			.on( 'blur', '#ai1ec_feed_url', ics_event_handlers.feed_url_change )
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
