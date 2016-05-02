define(
	[
		'jquery_timely',
		'domReady',
		'ai1ec_config',
		'libs/utils',
		'scripts/setting/cache/cache_event_handlers',
		'external_libs/bootstrap/button',
		'libs/collapse_helper',
		'external_libs/bootstrap/tab',
		'external_libs/bootstrap_datepicker',
		'external_libs/bootstrap/tooltip',
		'external_libs/jquery_cookie'
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
	var captcha_provider_changed = function() {
		$( 'fieldset.ai1ec-captcha_provider' ).addClass( 'ai1ec-hidden' );
		$( '.ai1ec-' + $( this ).val() ).removeClass( 'ai1ec-hidden' );
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
			$( document ).on(
				'click',
				'#ai1ec-button-refresh',
				cache_event_handlers.perform_rescan
			);

			// Initialize datepicker and have it respond to changes in format settings.
			var $exact_date = $('#exact_date');
			$exact_date.datepicker( { autoclose: true } );

			remove_feeds_postbox_if_all_values_are_empty();

			// When a view is enabled, affect form state.
			$( document ).on(
				"click",
				'.ai1ec-admin-view-settings .ai1ec-toggle-view',
				function() {
					var $this    = $( this ),
					    column   = $this.parent().index() + 1;

					// If no other views are enabled, do not allow view to be disabled.
					if (
						0 ===
						$this.closest( 'tr' ).siblings()
							.find( 'td:nth-child(' + column + ') .ai1ec-toggle-view:checked' )
							.length
					) {
						return false;
					};

					// If this view is the default, do not allow view to be disabled.
					if (
						$this.parent().next( 'td' ).find( '.ai1ec-toggle-default-view' )
							.is( ':checked' )
					) {
						return false;
					};
				}
			);

			// Show or hide additional options.
			var toggle_affix_options = function() {
				var $next_groups = $( this )
					.closest( '.ai1ec-form-group' )
						.nextAll( '.ai1ec-form-group' )
						.slice( 0, 4 );

				if ( $( this ).prop( 'checked' ) ) {
					$next_groups.show();
				} else {
					$next_groups.hide();
				}
			}
			toggle_affix_options.apply(
				$( '#affix_filter_menu' ).on( 'click', toggle_affix_options )[ 0 ]
			);

			// When clicking a radio button to select a default view, check the
			// enabled checkbox for that view.
			$( document ).on(
				'click',
				'.ai1ec-admin-view-settings .ai1ec-toggle-default-view',
					function () {
					$( this ).parent().prev( 'td' ).children( '.ai1ec-toggle-view' )
						.prop( 'checked', true );
				}
			);

			$( document).on(
				'change',
				'#captcha_provider',
				captcha_provider_changed
			);

			// Enable autoselect feature.
			utils.init_autoselect();
			
			var hide_api_signup = $.cookie( 'ai1ec_api_signup_hidden' );
			if ( 1 != hide_api_signup ) {
				$( '.ai1ec-signup-show' ).click();
			}
			
			$( '#ai1ec_save_settings' ).on( 'click', validate_week_start_end );
			$( '#show_create_event_button' ).trigger( 'ready' );
			
		} );
	};

	$( '[name="ai1ec_tickets_signin"]' ).on( 'click', function() {
		$( '.ai1ec-ticket-field-error' ).hide();
		$( '.ai1ec-required:visible' ).each( function() {
			var $this = $( this );
			$this.removeClass( 'ai1ec-error' );
			if (
				! $.trim( $this.val() ) ||
				( 'checkbox' === $this.attr( 'type' ) && ! this.checked )
			) {
				$this.addClass( 'ai1ec-error' );
				$this.closest( 'td' ).find( '.ai1ec-ticket-field-error' ).show();
			}
		} );
		if ( ! $( '.ai1ec-ticket-field-error:visible' ).length ) {
			$( '.ai1ec-noauto' ).remove();
			var
				$form_div = $( '#ai1ec-api-signup-form' ),
				action    = $form_div.attr( 'data-action' ),
				$form     = $( '<form></form', {
					method : 'POST',
					action : action,
					class  : 'ai1ec-hidden'
				} );
			
			$form_div.appendTo( $form );
			$form.appendTo( 'body' ).submit();
			
		}
		return false;
	} );
	
	$( '[name="ai1ec_signing"]' ).on( 'click', function() {
		$( '.ai1ec-error' ).removeClass( 'ai1ec-error' );
		if ( '2' === this.value ) {
			$( '.ai1ec-ticketing-signup tr' ).not( ':first' ).not( '.signin' ).hide();
			$( '.signin' ).removeClass( 'ai1ec-hidden' );
		} else {
			$( '.ai1ec-ticketing-signup tr' ).show();
			$( '.signin:last' ).addClass( 'ai1ec-hidden' );
		}
	} );

	$( '#ai1ec-api-signout' ).on( 'click', function() {
		$( '#ai1ec-api-signout-confirm' ).show();
		$( this ).hide();
		return false;
	} );

	$( '#ai1ec-api-signout-cancel' ).on( 'click', function() {
		$( '#ai1ec-api-signout-confirm' ).hide();
		$( '#ai1ec-api-signout' ).show();
		return false;
	} );

	$( '#ai1ec-api-signout-confirm' ).on( 'click', function() {
		if ( ! $( '#ai1ec-api-signout-confirm:visible' ).length ) {
			return false;
		}
		var
			$container = $( '#ai1ec-api-signed-in' ),
			action     = $( '#ai1ec-api-signout' ).attr( 'data-action' ),
			$input     = $( '<input type="hidden" name="ai1ec_signout" value="1" />' ),
			$form      = $( '<form></form', {
				method : 'POST',
				action : action,
				class  : 'ai1ec-hidden'
			} );

		$form
			.append( $input, $container )
			.appendTo( 'body' )
			.submit();
		
		return false;
	} );

	$( '.ai1ec-api-signup-hide' ).on( 'click', function() {
		$( '#ai1ec-api-signup-form' ).addClass( 'ai1ec-hidden' );
		$( '.ai1ec-signup-show' ).removeClass( 'ai1ec-hidden' ).show();
		$( this ).hide();
		$.cookie( 'ai1ec_api_signup_hidden', 1 );
		return false;
	} );
	
	$( '.ai1ec-signup-show' ).on( 'click', function() {
		$( '#ai1ec-api-signup-form' ).removeClass( 'ai1ec-hidden' );
		$( '.ai1ec-api-signup-hide' ).removeClass( 'ai1ec-hidden' ).show();
		$( this ).hide();
		$.cookie( 'ai1ec_api_signup_hidden', 0 );
		return false;
	} );

	return {
		start: start
	};
} );
