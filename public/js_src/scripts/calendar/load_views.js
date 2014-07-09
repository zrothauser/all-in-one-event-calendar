/*global History: true */
define(
	[
		"jquery_timely",
		"scripts/calendar/print",
		"scripts/calendar/agenda_view",
		"scripts/calendar/month_view",
		"libs/frontend_utils",
		"libs/utils",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/select2_multiselect_helper",
		"external_libs/jquery_history",
		"external_libs/jquery.tablescroller",
		"external_libs/jquery.scrollTo",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap/alert",
		"external_libs/jquery_cookie"
	],
	function(
		$,
		print_functions,
		agenda_view,
		month_view,
		frontend_utils,
		utils,
		ai1ec_calendar,
		ai1ec_config,
		common_frontend,
		select2_multiselect_helper
	) {

	"use strict"; // jshint ;_;

	$.cookie.json = true;
	var save_filter_view_cookie = 'ai1ec_saved_filter';
	// the initial value is determined by the visibility of the save view button
	var are_filters_set = ! $( '#save_filtered_views' ).hasClass( 'ai1ec-hide' );

	/**
	 * function initialize_view
	 *
	 * General initialization function to execute whenever any view is loaded
	 * (this is also called at the end of load_view()).
	 */
	var initialize_view = function( $calendar ) {
		
		// Get the dropdown menu link of the active view.
		var $selected_view = $calendar
			.find( '#ai1ec-view-dropdown .ai1ec-dropdown-menu .ai1ec-active a' );

		var hours =
			ai1ec_config.week_view_ends_at - ai1ec_config.week_view_starts_at;
		var height = hours * 60;
		// Make week view table limitable.
		$calendar.find( 'table.ai1ec-week-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-week-view ai1ec-popover-boundary',
			scroll : false
		} );
		$calendar.find( 'table.ai1ec-oneday-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-oneday-view ai1ec-popover-boundary',
			scroll : false
		} );

		if( $calendar.find( '.ai1ec-week-view' ).length
			|| $calendar.find( '.ai1ec-oneday-view' ).length
		) {
			// If no active event, then in week view, scroll down to 6am.
			$calendar.find(
				'.ai1ec-oneday-view .tablescroll_wrapper, ' +
				'.ai1ec-week-view .tablescroll_wrapper'
			).scrollTo(
				$calendar.find( '.ai1ec-hour-marker:eq('
					+ ai1ec_config.week_view_starts_at + ')'
				)
			);
			$calendar.find( '.ai1ec-hour-marker:eq('
				+ ai1ec_config.week_view_starts_at + ')'
			).addClass( 'ai1ec-first-visible' );
		}

		// If in month view, extend multiday events.
		if ( $calendar.find( '.ai1ec-month-view .ai1ec-multiday' ).length ) {
			month_view.extend_multiday_events( $calendar );
		}

		// Execute any registered hooks from extensions.
		$calendar
			.find( '.ai1ec-calendar-view-container' )
				.trigger( 'initialize_view.ai1ec' );
		
		// Trigger Affix event.
		$calendar
			.find( '.ai1ec-calendar-toolbar' )
				.trigger( 'ai1ec-affix.reinit' );
	};

	/**
	 * Do any cleanup required before currently displayed view is replaced with
	 * a newly retrieved view.
	 */
	var destroy_view = function( $calendar ) {
		// Execute any registered hooks from extensions.
		$calendar
			.find( '.ai1ec-calendar-view-container' )
				.trigger( 'destroy_view.ai1ec' );

		// Destroy any datepicker before loading new view.
		var dp = $calendar.find( '.ai1ec-minical-trigger' ).data( 'datepicker' );
		if ( typeof dp !== 'undefined' ) {
			dp.picker.remove();
			// Detach event handler.
			$( document ).off( 'changeDate', '.ai1ec-minical-trigger' );
		}
		// Destroy any visible tooltips or popovers.
		$calendar
			.find( '.ai1ec-tooltip.ai1ec-in, .ai1ec-popup' )
				.remove();

		// Destroy toolbar if affixed.
		$calendar
			.find( '.ai1ec-calendar-toolbar .ai1ec-btn-toolbar' )
				.remove();
	};

	var get_cal_state = function() {
		// Otherwise we need to get the state from the dropdowns.
		var cat_ids = [], tag_ids = [], auth_ids = [], action;
		$( '.ai1ec-category-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				cat_ids.push( $( this ).data( 'term' ) );
			} );
		$( '.ai1ec-tag-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				tag_ids.push( $( this ).data( 'term' ) );
			} );
		$( '.ai1ec-author-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				auth_ids.push( $( this ).data( 'term' ) );
			} );
		var cal_state = {};
		cal_state.cat_ids  = cat_ids;
		cal_state.tag_ids  = tag_ids;
		cal_state.auth_ids = auth_ids;
		action = $( '.ai1ec-views-dropdown .ai1ec-dropdown-menu .ai1ec-active' )
			.data( 'action' );
		cal_state.action = action;
		return cal_state;
	};

	/**
	 * Save the current url in a cookie so that the user is redirected here
	 * When he visit the calendar home page
	 *
	 */
	var save_current_filter = function() {
		var state = History.getState();
		var cookie = $.cookie( save_filter_view_cookie );
		// If the cookie is not present, create it.
		if ( null === cookie || undefined === cookie ) {
			cookie = {};
		}
		var cal_state = get_cal_state();
		// If we are on the calendar page, we just save the URL.
		if ( ai1ec_config.is_calendar_page ) {
			cookie['calendar_page'] = cal_state;
		} else {

			cookie[state.url] = cal_state;
		}
		$.cookie( save_filter_view_cookie, cookie, { path: '/', expires: 365 } );
		$( '#save_filtered_views' )
			.addClass( 'ai1ec-active' )
			.attr( 'data-original-title', ai1ec_config.clear_saved_filter_text );
		var $alert =
			utils.make_alert( ai1ec_config.save_filter_text_ok, 'success' );
		$( '#ai1ec-calendar' ).prepend( $alert );
	};

	/**
	 * Remove the cookie with the saved url.
	 *
	 * @param {object} e jQuery event object
	 */
	var remove_current_filter = function( e ) {
		e.stopImmediatePropagation();
		var cookie = $.cookie( save_filter_view_cookie );
		if( ai1ec_config.is_calendar_page ) {
			delete cookie['calendar_page'];
		} else {
			var state = History.getState();
			delete cookie[state.url];
		}
		$.cookie( save_filter_view_cookie, cookie, { path : '/', expires : 365 } );
		$( '#save_filtered_views' )
			.removeClass( 'ai1ec-active' )
			.attr( 'data-original-title', ai1ec_config.reset_saved_filter_text );
		// We keep the variable that tells us if some filters are set updated on
		// every call. So if no filters are applied, just hide the button.
		if( ! are_filters_set ) {
			$( '#save_filtered_views' ).addClass( 'ai1ec-hide' );
		}
		var $alert =
			utils.make_alert( ai1ec_config.remove_filter_text_ok, 'success' );
		$( '#ai1ec-calendar' ).prepend( $alert );
	};

	/**
	 * Load a calendar view represented by the given hash value.
	 *
	 * @param {string} hash The hash string requesting a calendar view
	 */
	var load_view = function( $calendar, hash, type ) {
		// Reveal loader behind view
		$calendar
			.find( '.ai1ec-calendar-view-loading' )
				.fadeIn( 'fast' )
				.end()
			.find( '.ai1ec-calendar-view' ).fadeTo( 'fast', 0.3,
				// After loader is visible, fetch new content
				function() {
					var query = {
							request_type: type,
							ai1ec_doing_ajax : true
					};
					// Fetch AJAX result
					$.ajax( {
						url : hash,
						dataType: type,
						data: query,
						method : 'get',
						success: function( data ) {

							// Do required cleanup of existing view.
							destroy_view( $calendar );

							// Views Dropdown
							if( typeof data.views_dropdown === 'string' ) {
								$calendar
									.find( '.ai1ec-views-dropdown' )
										.replaceWith( data.views_dropdown );
							}
							// Update categories
							if( typeof data.categories === 'string' ) {
								$calendar
									.find( '.ai1ec-category-filter' )
										.replaceWith( data.categories );
								if( ai1ec_config.use_select2 ) {
									select2_multiselect_helper
										.init( $calendar.find( '.ai1ec-category-filter' ) );
								}
							}
							// Update authors
							if( typeof data.authors === 'string' ) {
								$calendar
									.find( '.ai1ec-author-filter' )
										.replaceWith( data.authors );
								if( ai1ec_config.use_select2 ) {
									select2_multiselect_helper
										.init( $calendar.find( '.ai1ec-author-filter' ) );
								}
							}
							// Tags
							if( typeof data.tags === 'string' ) {
								$calendar
									.find( '.ai1ec-tag-filter' )
										.replaceWith( data.tags );
								if( ai1ec_config.use_select2 ) {
									select2_multiselect_helper
										.init( $calendar.find( '.ai1ec-tag-filter' ) );
								}
							}
							// And the "Subscribe buttons"
							if( typeof data.subscribe_buttons === 'string' ) {
								$calendar
									.find( '.ai1ec-subscribe-container' )
										.replaceWith( data.subscribe_buttons );
							}
							// And the "Save filtered view"
							if( typeof data.save_view_btngroup === 'string' ) {
								$calendar
									.find( '#save_filtered_views' )
										.closest( '.ai1ec-btn-group' )
											.replaceWith( data.save_view_btngroup );
							}
							are_filters_set = data.are_filters_set;

							// Animate vertical height of container between HTML replacement
							var $container = $calendar.find( '.ai1ec-calendar-view-container' );
							$container.height( $container.height() );
							var new_height =
								$calendar.find( '.ai1ec-calendar-view' )
									.html( data.html )
									.height();
							$container.animate( { height: new_height }, { complete: function() {
								// Restore height to automatic upon animation completion for
								// proper page layout.
								$container.height( 'auto' );
							} } );

							// Hide loader
							$calendar.find( '.ai1ec-calendar-view-loading' ).fadeOut( 'fast' );
							$calendar.find( '.ai1ec-calendar-view' ).fadeTo( 'fast', 1.0 );
							// Do any general view initialization after loading
							initialize_view( $calendar );
						}
					} );
				}
			);
	};

	var previously_pushed_state = false;
	// When the state changes, load the corresponding view
	var handle_state_change = function( e ) {
		var
			state = History.getState(),
			$calendar = $( '.ai1ec-calendar:first' );

		if( state.data.ai1ec !== undefined && true === state.data.ai1ec ||
				true === previously_pushed_state ) {
			// set this to true to detect back/forward navigation.
			// this should not interfere with other plugins.
			previously_pushed_state = true;
			load_view( $calendar, state.url, 'json' );
		}
	};

	/**
	 * Load the correct view according to the datatypet
	 *
	 */
	var load_view_according_to_datatype = function( $calendar, type, url ) {
		if( type === 'json' ) {
			var data = {
				ai1ec : true
			};
			History.pushState( data, document.title, decodeURI( url ) );
		} else {
			load_view( $calendar, url, 'jsonp' );
		}
	};

	// Handle loading the correct view when clicking on a link
	var handle_click_on_link_to_load_view = function( e ) {
		var 
			$el = $( this )
			$calendar = $el.closest( '.ai1ec-calendar' );

		e.preventDefault();
		load_view_according_to_datatype(
			$calendar,
			$el.data( 'type' ), $el.attr( 'href' )
		);
	};

	/**
	 * Click of minical trigger button. If not initialized, initialize datepicker.
	 * Then show datepicker.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_minical_trigger = function( e ) {
		var
			$el = $( this );

		e.preventDefault();

		if ( typeof $el.data( 'datepicker' ) === 'undefined' ) {
			// Initialize this view's minical datepicker.
			$el.datepicker( {
				todayBtn: 'linked',
				todayHighlight: true
			} );

			// Extend Datepicker behaviour without modifying the plugin.
			var dp = $el.data( 'datepicker' );
			// Flag datepicker as right-aligned.
			dp.picker.addClass( 'ai1ec-right-aligned' );
			// Replace the place() method so that it is right-aligned to trigger.
			var place_orig = dp.place;
			dp.place = function() {
				place_orig.call( this );
				var $el = this.component ? this.component : this.element;
				var offset = $el.offset();
				this.picker.css( {
					left: 'auto',
					right: $( document ).width() - offset.left - $el.outerWidth()
				} );
			};

			// Attach event handlers.
			$( document ).on( 'changeDate', '.ai1ec-minical-trigger',
				handle_minical_change_date
			);
		}

		$el.datepicker( 'show' );
	};

	/**
	 * Handle loading the correct view when selecting date from the datepicker.
	 * Destroy datepicker first.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_minical_change_date = function( e ) {
		var url,
		    $el = $( this ),
		    $calendar = $el.closest( '.ai1ec-calendar' ),
		    date;

		$el.datepicker( 'hide' );

		// Get URL template.
		url = $el.data( 'href' );
		// Fetch date provided by datepicker event object's format() function.
		date = e.format();
		// Replace '/' in date with '-' to be URL-friendly.
		date = date.replace( /\//g, '-' );
		// Insert date into URL template.
		url = url.replace( '__DATE__', date );
		// Load the new URL using method specified by type data-attribute.
		load_view_according_to_datatype( $calendar, $el.data( 'type' ), url );
	};

	/**
	 * Load the correct view from a select2 filter.
	 *
	 */
	var load_view_from_select2_filter = function( e ) {
		var new_state;
		if( typeof e.added !== 'undefined' ) {
			new_state = $( e.added.element ).data( 'href' );
		} else {
			new_state = $(
				'option[value=' + e.removed.id + ']',
				e.target
			).data( 'href' );
		}
		data = {
			ai1ec : true
		};
		History.pushState( data, null, new_state );
	};

	// Handle clearing filter
	var clear_filters = function() {
		var $calendar = $( this ).closest( '.ai1ec-calendar' );
		load_view_according_to_datatype(
				$calendar,
				$( this ).data( 'type' ),
				$( this ).data( 'href' )
		);
	};

	return {
		initialize_view                    : initialize_view,
		handle_click_on_link_to_load_view  : handle_click_on_link_to_load_view,
		handle_minical_trigger             : handle_minical_trigger,
		handle_minical_change_date         : handle_minical_change_date,
		clear_filters                      : clear_filters,
		handle_state_change                : handle_state_change,
		load_view                          : load_view,
		save_current_filter                : save_current_filter,
		remove_current_filter              : remove_current_filter,
		load_view_from_select2_filter      : load_view_from_select2_filter,
		load_view_according_to_datatype    : load_view_according_to_datatype
	};
});
