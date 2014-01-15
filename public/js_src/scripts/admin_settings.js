define(
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"libs/utils",
		"libs/collapse_helper",
		"external_libs/bootstrap/tab",
		"external_libs/bootstrap/dropdown",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap/tooltip",
		"external_libs/jquery_cookie"
	],
	function( $, domReady, ai1ec_config, utils ) {
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
	 * Destroys and reinitializes the datepicker on the given element with the
	 * given data map to assign to the element before initializing the new
	 * datepicker. The previous date value is preserved.
	 *
	 * @param  {object} $el  jQuery object of element datepicker is attached to
	 * @param  {array}  data Data map to assign to $el before calling .datepicker()
	 */
	var reset_datepicker = function( $el, data ) {
		// Save the old date from the datepicker.
		var cur_date = false;
		if ( $el.val() !== '' ) {
			cur_date = $el.data( 'datepicker' ).date;
		}
		// Destroy the datepicker.
		var dp = $el.data( 'datepicker' );
		if( dp !== undefined ) {
			dp.hide();
			dp.picker.remove();
			$el.removeData( 'datepicker' );
		}
		// Reinitialize datepicker to use the new pattern, and restore the date.
		$el.data( data ).datepicker();
		dp = $el.data( 'datepicker' );
		if ( cur_date !== false ) {
			dp.date = cur_date;
			dp.setValue();
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
	/**
	 * Initialize the license status indicator with API call.
	 */
	var init_license_status = function() {
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
				$( '#ai1ec-general-settings ul.ai1ec-nav-tabs a[href="#ai1ec-advanced"]' )
					.tab( 'show' );
				$( '#disclaimer' ).focus();
				e.preventDefault();
			}
		} );
	};
	var start = function() {
		// Perform DOM ready tasks.
		domReady( function() {
			init_license_status();
			setup_disclaimer();
			remove_gzip_button();

			// Handle saving/loading of active tab.
			utils.activate_saved_tab_on_page_load( $.cookie( 'ai1ec_general_settings_active_tab' ) );
			$( document ).on(
				'click',
				'#ai1ec-general-settings .ai1ec-nav-tabs a[data-toggle="tab"]',
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

			// Initialize datepicker and have it respond to changes in format settings.
			var $exact_date = $('#exact_date');
			$exact_date.datepicker();
			// Apply the new date pattern when "Calendar default start date" is changed.
			$( document ).on( 'change', '#input_date_format', function() {
				var pattern = $( 'option:selected', this ).data( 'pattern' );
				reset_datepicker( $exact_date, { dateFormat: pattern } );
			});
			// Change the week start day in the picker.
			$( document ).on( 'change', '#week_start_day', function() {
				var week_start_day = $( this ).val();
				reset_datepicker( $exact_date, { dateWeekstart: week_start_day } );
			});

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
		start : start,
		reset_datepicker : reset_datepicker
	};
} );
