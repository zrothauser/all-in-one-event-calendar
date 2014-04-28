define(
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"libs/utils",
		'scripts/setting/cache/cache_event_handlers',
		 'external_libs/bootstrap/button',
		"libs/collapse_helper",
		"external_libs/bootstrap/tab",
		"external_libs/bootstrap/dropdown",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap/tooltip",
		"external_libs/jquery_cookie"
	],
	function( $, domReady, ai1ec_config, utils, cache_event_handlers ) {
	"use strict";

	var remove_feeds_postbox_if_all_values_are_empty = function() {
		var remove = true;
		$( '#ai1ec-plugins-settings input:text' ).each( function() {
			if ( this.value !== '' ) {
				remove = false;
			}
		} );
		if ( remove === true ) {
			$( '#ai1ec-plugins-settings' ).remove();
		}
	};

	/**
	 * Event handler when tab is clicked; saves chosen tab to cookie.
	 *
	 * @param  {string} active_tab Value of tab's href attribute
	 */
	var handle_set_tab_cookie = function( e ) {
		var active = $( this ).attr( 'href' );
		$.cookie( 'ai1ec_general_settings_active_tab', active );
	};

	var validate_week_start_end = function() {
		var $start = $( '#week_view_starts_at' )
		  , $end = $( '#week_view_ends_at' )
		  , start = parseInt( $start.val(), 10 )
		  , end = parseInt( $end.val(), 10 );
		if ( end < start ) {
			window.alert( ai1ec_config.end_must_be_after_start );
			$end.focus();
			return false;
		}
		var diff = end - start;
		if ( diff < 6 ) {
			window.alert( ai1ec_config.show_at_least_six_hours );
			$end.focus();
			return false;
		}
	};


	var remove_gzip_button = function() {
		$( '.ai1ec-gzip-causes-js-failure' ).remove();
	};

	var setup_disclaimer = function() {
		$( '#ai1ec_save_settings' ).on( 'click', function( e ) {
			var checked = $( '#require_disclaimer' ).is( ':checked' );
			var discl = $( '#disclaimer' ).val();


			if( true === checked && '' === discl ) {
				alert( ai1ec_config.require_desclaimer );
				// Activate the correct tab
				$( '#ai1ec-general-settings ul.ai1ec-nav a[href="#ai1ec-advanced"]' )
					.tab( 'show' );
				$( '#disclaimer' ).focus();
				e.preventDefault();
			}
		} );
	};

	var start = function() {
		// Perform DOM ready tasks.
		domReady( function() {
			setup_disclaimer();
			remove_gzip_button();

			// Handle saving/loading of active tab.
			utils.activate_saved_tab_on_page_load( $.cookie( 'ai1ec_general_settings_active_tab' ) );
			$( document ).on(
				'click',
				'#ai1ec-general-settings .ai1ec-nav a[data-toggle="ai1ec-tab"]',
				handle_set_tab_cookie
			);

			// Prevent `label` action
			$( document ).on(
				'click',
				'#disable_standard_filter_menu_toggler',
				function( evt ) {
					evt.preventDefault();
				}
			);
			$( document )
						.on( 'click', '#ai1ec-button-refresh', cache_event_handlers.perform_rescan );

			// Initialize datepicker and have it respond to changes in format settings.
			var $exact_date = $('#exact_date');
			$exact_date.datepicker( { autoclose: true } );

			remove_feeds_postbox_if_all_values_are_empty();

			// When a view is enabled, affect form state.
			$( document ).on(
				"click", '.ai1ec-admin-view-settings .ai1ec-toggle-view', function() {
				var $this = $( this )
				  , $tr = $this.closest( 'tr' );

				// Check to see if there are any siblings that are checked.
				var is_one_box_checked = $( '.ai1ec-admin-view-settings .ai1ec-toggle-view:checked' ).length === 0;
				// Check if this view is selected as the default via radio button
				var is_selected_default = $tr.find( '.ai1ec-toggle-default-view:checked' ).length === 1;
				// If either is true, prevent :checked state change (only for the
				// Enabled column).
				if ( ( is_one_box_checked === true || is_selected_default === true ) ) {
					return false;
				}
			} );

			// When clicking a radio button to select a default view
			$( document ).on( "click", '.ai1ec-admin-view-settings .ai1ec-toggle-default-view', function () {
				// Automatically set the associated checkbox property to :checked
				$( this ).closest( 'tr' ).find( '.ai1ec-toggle-view:first' )
					.prop( 'checked', true );
			} );


			$( '#ai1ec_save_settings' ).on( 'click', validate_week_start_end );
			$( '#show_create_event_button' ).trigger( 'ready' );
		} );
	};

	return {
		start: start
	};
} );
