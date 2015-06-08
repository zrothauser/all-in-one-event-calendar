define(
	[
		'jquery_timely',
		'ai1ec_config',
		'scripts/add_new_event/event_date_time/date_time_utility_functions',
		'external_libs/jquery.calendrical_timespan',
		'libs/utils',
		'external_libs/bootstrap/button'
	],
	function(
		$,
		ai1ec_config,
		date_time_utility_functions,
		calendrical_functions,
		AI1EC_UTILS
	) {

	"use strict"; // jshint ;_;

	var ajaxurl = AI1EC_UTILS.get_ajax_url();

	/**
	 * Show/hide elements that show selectors for ending until/after events
	 */
	var show_end_fields = function() {
		var selected = $( '#ai1ec_end option:selected' ).val();

		switch ( selected ) {
			// Never selected, hide end fields
			case '0':
				$( '#ai1ec_until_holder, #ai1ec_count_holder' ).collapse( 'hide' );
				break;

			// After X times selected
			case '1':
				$( '#ai1ec_until_holder' ).collapse( 'hide' );
				$( '#ai1ec_count_holder' ).collapse( 'show' );
				break;

			// On date selected
			case '2':
				$( '#ai1ec_count_holder' ).collapse( 'hide' );
				$( '#ai1ec_until_holder' ).collapse( 'show' );
				break;
		}
	};

	/**
	 * Handle click on duplicate Publish button.
	 */
	var trigger_publish = function() {
		$( '#publish' ).trigger( 'click' );
	};

	/**
	 * Handle click on the Apply button
	 */
	var handle_click_on_apply_button = function() {
		var	$button       = $( this ),
			rule          = '',
			$active_tab   = $( '#ai1ec_repeat_box .ai1ec-tab-pane.ai1ec-active' ),
			frequency     = $active_tab.data( 'freq' ),
			append_ending = true;

		switch ( frequency ) {
			case 'daily':
				rule += 'FREQ=DAILY;';
				var interval_day = $( '#ai1ec_daily_count' ).val();
				if( interval_day > 1 ) {
					rule += 'INTERVAL=' + interval_day + ';';
				}
				break;

			case 'weekly':
				rule += 'FREQ=WEEKLY;';
				var interval_week = $( '#ai1ec_weekly_count' ).val();
				if( interval_week > 1 ) {
					rule += 'INTERVAL=' + interval_week + ';';
				}
				var week_days = $( 'input[name="ai1ec_weekly_date_select"]:first' ).val();
				var wkst = $( '#ai1ec_weekly_date_select > div:first > input[type="hidden"]:first' ).val();
				if( week_days.length > 0 ) {
					rule += 'WKST=' + wkst + ';BYday=' + week_days + ';';
				}
				break;

			case 'monthly':
				rule += 'FREQ=MONTHLY;';
				var interval_month  = $( '#ai1ec_monthly_count' ).val();
				var monthtype = $( 'input[name="ai1ec_monthly_type"]:checked' ).val();
				if( interval_month > 1 ) {
					rule += 'INTERVAL=' + interval_month + ';';
				}
				var month_days = $( 'input[name="ai1ec_montly_date_select"]:first' ).val();
				if( month_days.length > 0 && monthtype === 'bymonthday' ) {
					rule += 'BYMONTHDAY=' + month_days + ';';
				} else if ( monthtype === 'byday' ) {
					var byday_num     = $( '#ai1ec_monthly_byday_num' ).val();
					var byday_weekday = $( '#ai1ec_monthly_byday_weekday' ).val();
					rule += 'BYday=' + byday_num + byday_weekday + ';';
				}
				break;

			case 'yearly':
				rule += 'FREQ=YEARLY;';
				var interval_year = $( '#ai1ec_yearly_count' ).val();
				if( interval_year > 1 ) {
					rule += 'INTERVAL=' + interval_year + ';';
				}
				var months = $( 'input[name="ai1ec_yearly_date_select"]:first' ).val();
				if( months.length > 0 ) {
					rule += 'BYMONTH=' + months + ';';
				}
				break;

			case 'custom':
				if ( '1' === $( '#ai1ec_is_box_repeat' ).val() ) {
					rule += 'RDATE=';
				} else {
					rule += 'EXDATE=';
				}
				rule += $( '#ai1ec_rec_custom_dates' ).val();
				/**
				 * Don't append ending rules to custom dates. Issue #691
				 */
				append_ending = false;
				break;
		}

		var ending = $( '#ai1ec_end' ).val();
		// After x times
		if ( '1' === ending && append_ending ) {
			rule += 'COUNT=' + $( '#ai1ec_count' ).val() + ';';
		}
		// On date
		else if ( '2' === ending && append_ending ) {
			var until = $( '#ai1ec_until-date-input' ).val();
			until = calendrical_functions.parseDate( until, ai1ec_config.date_format );

			// Take the starting date to set hour and minute
			var start = $( '#ai1ec_start-time' ).val();
			start = calendrical_functions.parseDate( start, ai1ec_config.date_format );
			start = new Date( start );
			// Get UTC Day and UTC Month, and then add leading zeroes if required
			var d     = until.getUTCDate();
			var m     = until.getUTCMonth() + 1;
			var hh    = start.getUTCHours();
			var mm    = start.getUTCMinutes();

			// months
			m         = ( m < 10 )  ? '0' + m  : m;
			// days
			d         = ( d < 10 )  ? '0' + d  : d;
			// hours
			hh        = ( hh < 10 ) ? '0' + hh : hh;
			// minutes
			mm        = ( mm < 10 ) ? '0' + mm : mm;
			// Now, set the UTC friendly date string
			until     = until.getUTCFullYear() + '' + m + d + 'T235959Z';
			rule += 'UNTIL=' + until + ';';
		}

		var data = {
			action : 'ai1ec_rrule_to_text',
			rrule  : rule
		};

		$button
			.button( 'loading' )
			.next()
				.addClass( 'ai1ec-disabled' );

		$.post(
			ajaxurl,
			data,
			function( response ) {
				if ( response.error ) {
					$button
						.button( 'reset' )
						.next()
							.removeClass( 'ai1ec-disabled' );

					if ( '1' === $( '#ai1ec_is_box_repeat' ).val() ) {
						date_time_utility_functions.repeat_form_error(
							'#ai1ec_rrule', '#ai1ec_repeat_label', response, $button
						);
					} else {
						date_time_utility_functions.repeat_form_error(
							'#ai1ec_exrule', '#ai1ec_exclude_label', response, $button
						);
					}
				} else {
					if ( '1' === $( '#ai1ec_is_box_repeat' ).val() ) {
						date_time_utility_functions.repeat_form_success(
							'#ai1ec_rrule',
							'#ai1ec_repeat_label',
							'#ai1ec_repeat_text > a',
							rule,
							$button,
							response
						);
					} else {
						date_time_utility_functions.repeat_form_success(
							'#ai1ec_exrule',
							'#ai1ec_exclude_label',
							'#ai1ec_exclude_text > a',
							rule,
							$button,
							response
						);
					}
				}
			},
			'json'
		);
	};

	/**
	 * Handle clicking on cancel button
	 */
	var handle_click_on_cancel_modal = function() {
		// Reset the value for the RRULE/EXRULE option.
		if ( $( '#ai1ec_is_box_repeat' ).val() === '1' ) {
			// handles click on cancel for RRULE
			date_time_utility_functions.click_on_modal_cancel(
				'#ai1ec_repeat_text > a', '#ai1ec_repeat', '#ai1ec_repeat_label'
			);
		} else {
			// handles click on cancel for EXRULE
			date_time_utility_functions.click_on_modal_cancel(
				'#ai1ec_exclude_text > a', '#ai1ec_exclude', '#ai1ec_exclude_label'
			);
		}

		// Hide the recurrence modal.
		$( '#ai1ec_repeat_box' ).modal( 'hide' );

		return false;
	};

	/**
	 * Handle clicking on the two checkboxes in the monthly tab
	 */
	var handle_checkbox_monthly_tab_modal = function() {
		if ( $( this ).is( '#ai1ec_monthly_type_bymonthday' ) ) {
			$( '#ai1ec_repeat_monthly_byday' ).collapse( 'hide' );
			$( '#ai1ec_repeat_monthly_bymonthday' ).collapse( 'show' );
		}
		else {
			$( '#ai1ec_repeat_monthly_bymonthday' ).collapse( 'hide' );
			$( '#ai1ec_repeat_monthly_byday' ).collapse( 'show' );
		}
	};

	/**
	 * Handle clicking on weekday/day/month toggle buttons.
	 */
	var handle_click_on_toggle_buttons = function() {
		var $this = $( this ),
		    data = [],
		    $grid = $this.closest( '.ai1ec-btn-group-grid' ),
		    value;

		$this.toggleClass( 'ai1ec-active' );

		$( 'a', $grid ).each( function() {
			var $el = $( this );
			if ( $el.is( '.ai1ec-active' ) ) {
				value = $el.next().val();
				data.push( value );
			}
		} );

		$grid.next().val( data.join() );
	};

	// This are pseudo handlers, they might require a refactoring sooner or later
	var execute_pseudo_handlers = function() {
		// handles click on rrule text
		date_time_utility_functions.click_on_ics_rule_text(
			'#ai1ec_repeat_text > a',
			'#ai1ec_repeat',
			'#ai1ec_repeat_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 1,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.init_modal_widgets
		);
		// handles click on exrule text
		date_time_utility_functions.click_on_ics_rule_text(
			'#ai1ec_exclude_text > a',
			'#ai1ec_exclude',
			'#ai1ec_exclude_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 0,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.init_modal_widgets
		);

		// handles click on repeat checkbox
		date_time_utility_functions.click_on_checkbox(
			'#ai1ec_repeat',
			'#ai1ec_repeat_text > a',
			'#ai1ec_repeat_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 1,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.init_modal_widgets
		);

		// handles click on exclude checkbox
		date_time_utility_functions.click_on_checkbox(
			'#ai1ec_exclude',
			'#ai1ec_exclude_text > a',
			'#ai1ec_exclude_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 0,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.init_modal_widgets
		);
	};

	var handle_animation_of_calendar_widget = function( e ) {
		// Just toggle the visibility.
		$('#ai1ec_widget_calendar').toggle();
		return false;
	};

	/**
	 * Handles hiding of modal (resets to loading state).
	 */
	var handle_modal_hide = function() {
		$( '.ai1ec-modal-content', this )
			.not( '.ai1ec-loading ' )
				.remove()
				.end()
			.removeClass( 'ai1ec-hide' );
	};

	var handle_modal_loaded = function() {
		var
			active_tab = $ ('#ai1ec-tab-content' ).data( 'activeFreq' ),
			datepicker = $( '#ai1ec_recurrence_calendar' );
		show_end_fields();
		$( '.ai1ec-freq' ).removeClass( 'ai1ec-active' );
		$( '.ai1ec-freq-' + active_tab ).addClass( 'ai1ec-active' );

	};

	$( document ).on( 'ai1ec.recurrence-modal.inited', handle_modal_loaded );

	return {
		show_end_fields                     : show_end_fields,
		trigger_publish                     : trigger_publish,
		handle_click_on_apply_button        : handle_click_on_apply_button,
		handle_click_on_cancel_modal        : handle_click_on_cancel_modal,
		handle_checkbox_monthly_tab_modal   : handle_checkbox_monthly_tab_modal,
		execute_pseudo_handlers             : execute_pseudo_handlers,
		handle_animation_of_calendar_widget : handle_animation_of_calendar_widget,
		handle_click_on_toggle_buttons      : handle_click_on_toggle_buttons,
		handle_modal_hide                   : handle_modal_hide
	};
} );
