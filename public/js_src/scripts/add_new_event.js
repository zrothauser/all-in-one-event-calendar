define(
	[
		"jquery_timely",
		'domReady',
		'ai1ec_config',
		'scripts/add_new_event/event_location/gmaps_helper',
		'scripts/add_new_event/event_location/input_coordinates_event_handlers',
		'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		'scripts/add_new_event/event_date_time/date_time_event_handlers',
		'scripts/add_new_event/event_cost_helper',
		'external_libs/jquery.calendrical_timespan',
		'external_libs/jquery.inputdate',
		'external_libs/jquery.tools',
		'external_libs/ai1ec_datepicker',
		'external_libs/bootstrap/transition',
		'external_libs/bootstrap/collapse',
		'external_libs/bootstrap/modal',
		'external_libs/bootstrap/alert',
		'external_libs/bootstrap/tab',
		'external_libs/select2'
	],
	function (
		$,
		domReady,
		ai1ec_config,
		gmaps_helper,
		input_coordinates_event_handlers,
		input_utility_functions,
		date_time_event_handlers,
		event_cost,
		calendrical_functions
	) {
	"use strict"; // jshint ;_;


	var init_date_time = function() {

		var now = new Date( ai1ec_config.now * 1000 );

		/**
		* Timespan plugin setup
		*/
		// Initialize timespan plugin on our date/time inputs.
		var data = {
			allday           : '#ai1ec_all_day_event',
			start_date_input : '#ai1ec_start-date-input',
			start_time_input : '#ai1ec_start-time-input',
			start_time       : '#ai1ec_start-time',
			end_date_input   : '#ai1ec_end-date-input',
			end_time_input   : '#ai1ec_end-time-input',
			end_time         : '#ai1ec_end-time',
			date_format      : ai1ec_config.date_format,
			month_names      : ai1ec_config.month_names,
			day_names        : ai1ec_config.day_names,
			week_start_day   : ai1ec_config.week_start_day,
			twentyfour_hour  : ai1ec_config.twentyfour_hour,
			now              : now
		};

		$.timespan( data );
		// Retrieve the dates saved in the hidden field
		var exdate  = $( "#ai1ec_exdate" ).val();

		// This variable holds the dates that must be selected in the datepicker.
		var dp_date = null;
		var _clear_dp = false;
		var _day;
		if( exdate.length >= 8 ) {
			dp_date = [];
			var _span_html = [];
			$.each( exdate.split( ',' ), function( i, v ) {
				var _date = v.slice( 0, 8 );
				var _year = _date.substr( 0, 4 );
				var _month = _date.substr( 4, 2 );
				_day = _date.substr( 6, 2 );

				_month = _month.charAt(0) === '0' ? ( '0' + ( parseInt( _month.charAt( 1 ), 10 ) - 1 ) ) : ( parseInt( _month, 10 ) - 1 );

				dp_date.push( new Date( _year, _month, _day ) );
				_span_html.push(
					calendrical_functions.formatDate(
						new Date( _year, _month, _day ),
						ai1ec_config.date_format,
						true
					)
				);
			});
			$( '#ai1ec_exclude-dates-input' )
				.text(  _span_html.join( ', ' ) );
		} else {
			// Set as default date shown today
			dp_date = new Date( ai1ec_config.now * 1000 );
			_clear_dp = true;
			$( '#ai1ec_exclude-dates-input' )
				.text(  $( '#ai1ec_exclude-dates-input' ).data( 'placeholder' ) );
		}

		$( '#widgetCalendar' ).DatePicker({
			flat: true,
			calendars: 3,
			mode: 'multiple',
			starts: ai1ec_config.week_start_day,
			date: dp_date,
			onChange: function( formated ) {
				formated = formated.toString();
				if( formated.length >= 8 ) {
					// save the date in your hidden field
					var exdate = '';
					var formatted_date = [];
					$.each( formated.split( ',' ), function( i, v ) {
						formatted_date.push( calendrical_functions.formatDate( new Date( v ), ai1ec_config.date_format ) );
						exdate += v.replace( /-/g, '' ) + 'T000000Z,';
					});
					$( '#ai1ec_exclude-dates-input' ).text( formatted_date.join( ', ' ) );
					exdate = exdate.slice( 0, exdate.length - 1 );
					$( "#ai1ec_exdate" ).val( exdate );
				} else {
					$( "#ai1ec_exdate" ).val( '' );
					$( '#ai1ec_exclude-dates-input' ).text( $( '#ai1ec_exclude-dates-input' ).data( 'placeholder' ) );
				}
			},
			prev: '«',
			next: '»',
			// Ignore clicking on month name.
			month_link_inactive: true,
			locale: {
				daysMin: ai1ec_config.day_names.split( ',' ),
				months: ai1ec_config.month_names.split( ',' )
			}
		});
		if( _clear_dp ) {
			$( '#widgetCalendar' ).DatePickerClear();
		}
		// Hide datepicker if clicked outside.
		$( document )
			.on( 'mousedown.exclude', function( e ) {
				var $container = $( '#widgetCalendar' ),
					$link = $( '#ai1ec_exclude-dates-input' );

				if ( ! $container.is( e.target )
					&& ! $link.is( e.target )
					&& 0 === $container.has( e.target ).length ) {
					$( '#widgetCalendar' ).hide();
				}
			});
	};

	/**
	 * Add a hook into Bootstrap collapse for panels for proper overflow
	 * behaviour when open.
	 */
	var init_collapsibles = function() {
		$( '.ai1ec-panel-collapse' ).on( 'hide', function() {
			$( this ).parent().removeClass( 'ai1ec-overflow-visible' );
		} );
		$( '.ai1ec-panel-collapse' ).on( 'shown', function() {
			var $el = $( this );
			window.setTimeout(
				function() { $el.parent().addClass( 'ai1ec-overflow-visible' ); },
				350
			);
		} );
	};

	/**
	 * Perform all initialization functions required on the page.
	 */
	var init = function() {
		init_date_time();

		// We load gMaps here so that we can start acting on the DOM as soon as possibe.
		// All initialization is done in the callback.
		require( ['libs/gmaps' ], function( gMapsLoader ) {
			gMapsLoader( gmaps_helper.init_gmaps );
		} );
	};

	/**
	 * Present user with error notice and prevent form submission
	 */
	var prevent_form_submission = function( submit_event, notices ) {
		var info_text = null;
		if ( '[object Array]' === Object.prototype.toString.call( notices ) ) {
			info_text = notices.join( '<br>' );
		} else {
			info_text = notices;
		}
		$( '#ai1ec_event_inline_alert' ).html( info_text );
		$( '#ai1ec_event_inline_alert' ).removeClass( 'ai1ec-hidden' );
		submit_event.preventDefault();
		// Just in case, hide the ajax spinner and remove the disabled status
		$( '#publish, #ai1ec_bottom_publish' ).removeClass(
			'button-primary-disabled'
		);
		$( '#publish, #ai1ec_bottom_publish' ).removeClass(
			'disabled'
		);
		$( '#publish, #ai1ec_bottom_publish' ).siblings(
			'#ajax-loading, .spinner'
		).css( 'visibility', 'hidden' );
	};

	/**
	 * Validate the form when clicking Publish/Update.
	 *
	 * @param  object e jQuery event object
	 */
	var validate_form = function( e ) {
		// Validate geolocation coordinates.
		if ( input_utility_functions.ai1ec_check_lat_long_fields_filled_when_publishing_event( e ) === true ) {
			// Convert commas to dots
			input_utility_functions.ai1ec_convert_commas_to_dots_for_coordinates();
			// Check that fields are ok and there are no errors
			input_utility_functions.ai1ec_check_lat_long_ok_for_search( e );
		}

		// Validate URL fields.
		var show_warning = false;
		var warnings     = [];
		$( '#ai1ec_ticket_url, #ai1ec_contact_url' ).each( function () {
			var url = this.value;
			$( this ).removeClass( 'ai1ec-input-warn' );
			$( this ).closest( '.ai1ec-panel-collapse' ).parent()
				.find( '.ai1ec-panel-heading .ai1ec-fa-warning' )
				.addClass( 'ai1ec-hidden' ).parent()
				.css( 'color', '' );
			if ( '' !== url ) {
				var urlPattern = /(http|https):\/\//;
				if ( ! urlPattern.test( url ) ) {
					$( this ).closest( '.ai1ec-panel-collapse' ).parent()
						.find( '.ai1ec-panel-heading .ai1ec-fa-warning' )
						.removeClass( 'ai1ec-hidden' ).parent()
						.css( 'color', 'rgb(255, 79, 79)' );
					if ( ! show_warning ) {
						$( this ).closest( '.ai1ec-panel-collapse' )
							.collapse( 'show' );
					}
					show_warning = true;
					var text = $( this ).attr( 'id' ) + '_not_valid';
					warnings.push( ai1ec_config[text] );
					$( this ).addClass( 'ai1ec-input-warn' );
				}
			}
		} );
		if ( show_warning ) {
			warnings.push( ai1ec_config.general_url_not_valid );
			prevent_form_submission( e, warnings );
		}
	};

	/**
	 * Attach event handlers to add/edit event page.
	 */
	var attach_event_handlers = function() {
		// Toggle the visibility of Google map on checkbox click.
		$( '#ai1ec_google_map' ).click( input_coordinates_event_handlers.toggle_visibility_of_google_map_on_click );
		// Hide / Show the coordinates table when clicking the checkbox.
		$( '#ai1ec_input_coordinates' ).change( input_coordinates_event_handlers.toggle_visibility_of_coordinate_fields_on_click );
		// Validate fields when clicking Publish.
		$( '#post' ).submit( validate_form );
		// On blur, update the map if both coordinates are set.
		$( 'input.coordinates' ).blur( input_coordinates_event_handlers.update_map_from_coordinates_on_blur );

		// If the extra publish button is present, handle its click.
		$( '#ai1ec_bottom_publish' ).on( 'click', date_time_event_handlers.trigger_publish );

		// Recurrence modal event handlers.
		$( document )
			// Show different fields for the "ends" clause in the repeat modal.
			.on( 'change', '#ai1ec_end', date_time_event_handlers.show_end_fields )
			// Handle click on the Apply button of the repeat modal.
			.on( 'click', '#ai1ec_repeat_apply', date_time_event_handlers.handle_click_on_apply_button )
			// Handle click on the cancel button of the repeat modal.
			.on( 'click', '#ai1ec_repeat_cancel', date_time_event_handlers.handle_click_on_cancel_modal )
			// Handle click on monthly repeat radios.
			.on( 'click', '#ai1ec_monthly_type_bymonthday, #ai1ec_monthly_type_byday', date_time_event_handlers.handle_checkbox_monthly_tab_modal )
			// Handle weekday/day/month toggle buttons.
			.on( 'click', '.ai1ec-btn-group-grid a', date_time_event_handlers.handle_click_on_toggle_buttons );
		$( '#ai1ec_repeat_box' ).on( 'hidden.bs.modal', date_time_event_handlers.handle_modal_hide );
		// Attach pseudo handler function. These functions are kind of wrappers
		// around other functions, and may need refactoring someday.
		date_time_event_handlers.execute_pseudo_handlers();

		// Initialize showing/hiding of the exclude dates widget.
		$( '#widgetField > a' ).on( 'click', date_time_event_handlers.handle_animation_of_calendar_widget );

		// Free checkbox.
		$( '#ai1ec_is_free' ).on( 'change', event_cost.handle_change_is_free );

		// Banner image.
		$( '#ai1ec_set_banner_image' ).on( 'click', set_banner_image );
	};

	// Hijack the Featured Image dialog to adapt it for Banner Image.
	var set_banner_image = function() {
		var fi = {}
		fi._frame = wp.media({
			state: 'featured-image',
			states: [
				new wp.media.controller.FeaturedImage(),
				new wp.media.controller.EditImage()
			]
		});
		fi._frame.open();
		$( '.media-frame-title h1' ).text( 'Set Banner Image' );
		$( '.media-frame-toolbar' ).append(
			'<div class="media-toolbar">\
				<div class="media-toolbar-primary search-form">\
					<a href="#" id=\"ai1ec-set-banner-image\"\
					   class="button media-button button-primary button-large">\
					   	Set banner image\
					</a>\
				</div>\
			</div>');
		$( '#ai1ec-set-banner-image' ).on( 'click', function() {
			console.log('save', $( '.attachment-details input[type=text]' ).val());
			$( '#ai1ec_event_banner .inside a' )
				.html( '<img width="100%" src="'
					+ $( '.attachments:visible li.selected img' ).attr( 'src' ) + '" />\
					<input type="hidden" name="ai1ec-banner-image" value=\"'
					+ $( '.attachment-details input[type=text]' ).val() + '\">'
				);
			$( '#ai1ec_event_banner .inside' )
				.append( '<br /><a href="#">Remove banner image</a>' );

			fi._frame.close();
			return false;
		} );
		return false;
	}

	/**
	 * Place Event Details meta box below title, rather than below description.
	 */
	var reposition_meta_box = function() {
		$( '#ai1ec_event' )
			.insertAfter( '#ai1ec_event_inline_alert' );
		$( '#post' ).addClass( 'ai1ec-visible' );
	};
	/**
	 * Initialize Select2 for timezones.
	 */
	var init_timezones_select = function() {
		$('#timezone-select').select2();
	};

	var start = function() {
		// Initialize the page. We do this before domReady so we start loading other
		// dependencies as soon as possible.
		init();
		domReady( function() {
			init_collapsibles();
			// Reposition event details meta box.
			reposition_meta_box();
			// Attach the event handlers.
			attach_event_handlers();
			// Initialize Select2 for timezones.
			init_timezones_select();
		} );
	};

	return {
		start: start
	};
} );
