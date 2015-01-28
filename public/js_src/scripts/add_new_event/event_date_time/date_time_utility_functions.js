define(
	[
		'jquery_timely',
		'ai1ec_config',
		'libs/utils',
		'external_libs/jquery.calendrical_timespan',
	],
	function( $, ai1ec_config, AI1EC_UTILS, calendrical_functions ) {

	"use strict"; // jshint ;_;

	var ajaxurl = AI1EC_UTILS.get_ajax_url();

	var repeat_form_success = function( s1, s2, s3, rule, button, response ) {
		$( s1 ).val( rule );

		// Hide the recurrence modal.
		$( '#ai1ec_repeat_box' ).modal( 'hide' );

		var txt = $.trim( $( s2 ).text() );
		if( txt.lastIndexOf( ':' ) === -1 ) {
			txt = txt.substring( 0, txt.length - 3 );
			$( s2 ).text( txt + ':' );
		}
		$(button).attr( 'disabled', false );
		$( s3 ).fadeOut( 'fast', function() {
			$( this ).text( response.message );
			$( this ).fadeIn( 'fast' );
		});
	};

	var repeat_form_error = function( s1, s2, response, button ) {
		$( '#ai1ec_repeat_box .ai1ec-alert-danger' )
			.text( response.message )
			.removeClass( 'ai1ec-hide' );

		$( button ).attr( 'disabled', false );
		$( s1 ).val( '' );
		var txt = $.trim( $( s2 ).text() );
		if( txt.lastIndexOf( '...' ) === -1 ) {
			txt = txt.substring( 0, txt.length - 1 );
			$( s2 ).text( txt + '...' );
		}
		// If there is no text, uncheck the checkbox, otherwise keep it, as the
		// previous rule is still valid.
		if( $( this ).closest( 'tr' ).find( '.ai1ec_rule_text' ).text() === '' ) {
			$( s1 ).siblings( 'input:checkbox' ).removeAttr( 'checked' );
		}
	};

	var click_on_ics_rule_text = function( s1, s2, s3, data, fn ) {
		$( document ).on( 'click', s1, function() {
			if( ! $( s2 ).is( ':checked' ) ) {
				$( s2 ).attr( 'checked', true );
				var txt = $.trim( $( s3 ).text() );
				txt = txt.substring( 0, txt.length - 3 );
				$( s3 ).text( txt + ':' );
			}
			show_repeat_tabs( data, fn );
			return false;
		});
	};

	var click_on_checkbox = function( s1, s2, s3, data, fn ) {
		$( s1 ).click( function() {
			if ( $(this).is( ':checked' ) ) {
				if ( this.id === 'ai1ec_repeat' ) {
					$( '#ai1ec_exclude' ).removeAttr( 'disabled' );
				};
				show_repeat_tabs( data, fn );
			} else {
				if ( this.id === 'ai1ec_repeat' ) {
					$( '#ai1ec_exclude' )
						.removeAttr( 'checked' )
						.attr( 'disabled', true );
					$( '#ai1ec_exclude_text > a' ).text( '' );
				};
				$( s2 ).text( '' );
				var txt = $.trim( $( s3 ).text() );
				txt = txt.substring( 0, txt.length - 1 );
				$( s3 ).text( txt + '...' );
			}
		} );
	};

	/**
	 * Handle clicking on cancel of recurrence modal.
	 * @param  {[type]} s1 The selector of the <a> of the RRULE/EXRULE.
	 * @param  {[type]} s2 The selector of the checkbox of the RRULE/EXRULE.
	 * @param  {[type]} s3 The selector of the label of the RRULE/EXRULE.
	 */
	var click_on_modal_cancel = function( s1, s2, s3 ) {
		// If the original value of RRULE/EXRULE was empty, then uncheck the box.
		if ( $.trim( $( s1 ).text() ) === '' ) {
			$( s2 ).removeAttr( 'checked' );
			// Handle disabling of EXRULE setting if RRULE is unchecked.
			if ( ! $( '#ai1ec_repeat' ).is( ':checked' ) ) {
				$( '#ai1ec_exclude' ).attr( 'disabled', true );
			}
			// Adjust the label depending on if there is an ellipsis?
			// (Who coded this??)
			var txt = $.trim( $( s3 ).text() );
			if( txt.lastIndexOf( '...' ) === -1 ) {
				txt = txt.substring( 0, txt.length - 1 );
				$( s3 ).text( txt + '...' );
			}
		}
	};

	/**
	 * Called after the recurrence modal's markup is loaded to initialize widgets.
	 */
	var init_modal_widgets = function() {
		// Initialize count range slider
		$( '#ai1ec_count, #ai1ec_daily_count, #ai1ec_weekly_count,\
			#ai1ec_monthly_count, #ai1ec_yearly_count'
		).rangeinput( {
			css: {
				input: 'ai1ec-range',
				slider: 'ai1ec-slider',
				progress: 'ai1ec-progress',
				handle: 'ai1ec-handle'
			}
		} );

		var $datepicker = $( '#ai1ec_recurrence_calendar' );

		$datepicker.datepicker( {
			multidate : true,
			weekStart : ai1ec_config.week_start_day
		} );

		$datepicker.on( 'changeDate', function( e ) {
			var
				dates = [],
				dates_displayed = [];

			for ( var i = 0; i < e.dates.length; i++ ) {
				var
					date      = new Date( e.dates[i] ),
					// Format for sending to server.
					formatted = ''
						+ date.getFullYear()
						+ ( '0' + ( date.getMonth() + 1 ) ).slice( -2 )
						+ ( '0' + date.getDate() ).slice( -2 )
						+ 'T000000Z',
					// Format for displaying.
					displayed = '<span class="ai1ec-label ai1ec-label-default">' +
						calendrical_functions.formatDate(
							date,
							ai1ec_config.date_format,
							true
						) +
						'</span>';

				dates.push( formatted );
				dates_displayed.push( displayed );
			}

			$( '#ai1ec_rec_dates_list' ).html( dates_displayed.join( ' ' ) );
			$( '#ai1ec_rec_custom_dates' ).val( dates.join( ',' ) );

		} );



		// Initialize inputdate plugin on our "until" date input.
		var data = {
			start_date_input : '#ai1ec_until-date-input',
			start_time       : '#ai1ec_until-time',
			date_format      : ai1ec_config.date_format,
			month_names      : ai1ec_config.month_names,
			day_names        : ai1ec_config.day_names,
			week_start_day   : ai1ec_config.week_start_day,
			twentyfour_hour  : ai1ec_config.twentyfour_hour,
			now              : new Date( ai1ec_config.now * 1000 )
		};
		$.inputdate( data );
	};

	/**
	 * Shows the recurrence modal.
	 *
	 * @param  {object}   data           Data to post to get contents via AJAX.
	 * @param  {function} post_ajax_func Optional callback to execute after AJAX.
	 */
	var show_repeat_tabs = function( data, callback ) {
		var $modal = $( '#ai1ec_repeat_box' ),
		    $loading = $( '.ai1ec-loading', $modal );

		// Show the modal.
		$modal.modal( { backdrop: 'static' } );

		$.post(
			ajaxurl,
			data,
			function( response ) {
				if ( response.error ) {
					// Tell the user there is an error
					// TODO: Use other method of notification
					window.alert( response.message );
					$modal.modal( 'hide' );
				} else {
					$loading.addClass( 'ai1ec-hide' ).after( response.message );
					// Execute any requested AJAX completion callback.
					if ( typeof callback === 'function' ) {
						callback();
					}
				}
			},
			'json'
		);
	};

	return {
		show_repeat_tabs       : show_repeat_tabs,
		init_modal_widgets     : init_modal_widgets,
		click_on_modal_cancel  : click_on_modal_cancel,
		click_on_checkbox      : click_on_checkbox,
		click_on_ics_rule_text : click_on_ics_rule_text,
		repeat_form_error      : repeat_form_error,
		repeat_form_success    : repeat_form_success
	};
} );
