define(
	[
		"jquery_timely",
		"scripts/calendar/load_views",
		"scripts/calendar/print",
		"scripts/calendar/agenda_view",
		"scripts/calendar/month_view",
		"scripts/calendar/calendar-affix",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/utils",
		"libs/select2_multiselect_helper",
		"external_libs/bootstrap/transition",
		"external_libs/bootstrap/modal",
		"external_libs/jquery.scrollTo",
		'external_libs/jquery_cookie',
	],
	function( $, load_views, print, agenda_view,
		month_view, affix, ai1ec_calendar, ai1ec_config, common_frontend,
		AI1EC_UTILS, select2_multiselect_helper ) {
	"use strict"; // jshint ;_;

	/**
	 * Moves calendar into CSS selector defined by advanced settings.
	 */
	var css_selector_replacement = function() {
		if( ai1ec_calendar.selector !== undefined && ai1ec_calendar.selector !== '' &&
			$( ai1ec_calendar.selector ).length === 1 ) {
			// Try to find an <h#> element containing the title
			var $title = $( ":header:contains(" + ai1ec_calendar.title + "):first" );
			// If none found, create one
			if( ! $title.length ) {
				$title = $( '<h1 class="page-title"></h1>' );
				// Do it this way to automatically generate HTML entities
				$title.text( ai1ec_calendar.title );
			}
			var $calendar = $( '.ai1ec-main-container:first' )
				.detach()
				.before( $title );

			$( ai1ec_calendar.selector )
				.empty()
				.append( $calendar )
				.hide()
				.css( 'visibility', 'visible' )
				.fadeIn( 'fast' );
		}
	};

	/**
	 * Event handler for multiday events. When being hovered, add hover class
	 * to its clones.
	 */
	var handle_multiday_enter = function() {
		var
			id = $( this ).data( 'instanceId' ),
			$calendar = $( this ).closest( '.ai1ec-calendar' );

		$calendar.find( '.ai1ec-event-instance-id-' + id ).addClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for multiday events. When leaving hover, remove hover class
	 * from its clones.
	 */
	var handle_multiday_leave = function() {
		var
			id = $( this ).data( 'instanceId' ),
			$calendar = $( this ).closest( '.ai1ec-calendar' );

		$calendar
			.find( '.ai1ec-event-instance-id-' + id )
				.removeClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for events in week/day view. Issue a delayed raising effect
	 * on this event and all its multiday clones.
	 */
	var handle_raise_enter = function() {
		var
			$this = $( this ),
			$calendar = $this.closest( '.ai1ec-calendar' ),
			id = $this.data( 'instanceId' );

		$this.delay( 500 ).queue( function() {
			$calendar
				.find( '.ai1ec-event-instance-id-' + id )
					.addClass( 'ai1ec-raised' );
		} );
	};

	/**
	 * Event handler for events in week/day view. Cancel raising effect on this
	 * event and all its multiday clones.
	 */
	var handle_raise_leave = function( e ) {
		var
			$this = $( this ),
			$calendar = $this.closest( '.ai1ec-calendar' ),
			id = $this.data( 'instanceId' ),
			$target = $( e.toElement || e.relatedTarget ),
			$instance_el = $calendar.find( '.ai1ec-event-instance-id-' + id );

		// Don't cancel the effect if moving onto a clone of the same instance.
		if (
			$target.is( $instance_el ) ||
			$target.parent().is( $instance_el )
		) {
			return;
		}
		$calendar.find( '.ai1ec-event-instance-id-' + id )
			.clearQueue()
			.removeClass( 'ai1ec-raised' );
	};

	/**
	 * General calendar page initialization.
	 */
	var init = function() {
		// Do the replacement of the calendar and create title if not present
		css_selector_replacement();
	};


	/**
	 * Attach event handlers for calendar page.
	 */
	var attach_event_handlers = function() {
		// ======================================
		// = Month/week/day view multiday hover =
		// ======================================
		$( document ).on(
			{
				mouseenter: handle_multiday_enter,
				mouseleave: handle_multiday_leave
			},
			'.ai1ec-event-container.ai1ec-multiday'
		);

		// ====================================
		// = Week/day view hover-raise effect =
		// ====================================
		$( document ).on(
			{
				mouseenter: handle_raise_enter,
				mouseleave: handle_raise_leave
			},
			'.ai1ec-oneday-view .ai1ec-oneday .ai1ec-event-container, ' +
				'.ai1ec-week-view .ai1ec-week .ai1ec-event-container'
		 );

		// ===============
		// = Agenda view =
		// ===============
		// Register click handlers for Agenda View event title
		$( document ).on( 'click',
			'.ai1ec-agenda-view .ai1ec-event-header',
			 agenda_view.toggle_event
		);

		// Register click handlers for expand/collapse all buttons
		$( document ).on( 'click',
			'#ai1ec-agenda-expand-all',
			agenda_view.expand_all
		);
		$( document ).on( 'click',
			'#ai1ec-agenda-collapse-all',
			agenda_view.collapse_all
		);

		// =============
		// = All views =
		// =============

		// Register navigation click handlers
		$( document ).on( 'click',      'a.ai1ec-load-view',
			load_views.handle_click_on_link_to_load_view
		);

		// Register minical datepicker events.
		$( document ).on( 'click',      '.ai1ec-minical-trigger',
			load_views.handle_minical_trigger );

		// Handle clearing filters.
		$( document ).on( 'click',      '.ai1ec-clear-filter',
			load_views.clear_filters
		);

		// Handle click on print button.
		$( document ).on( 'click',      '#ai1ec-print-button',
			print.handle_click_on_print_button
		);

		// Handle click on reveal full day button.
		$( document ).on( 'click',      '.ai1ec-reveal-full-day button',
			function() {
				var $calendar = $( this ).closest( '.ai1ec-calendar' );
				// Hide the button (no longer serves a purpose).
				$( this ).fadeOut();
				var $actual_table = $calendar.find(
					'.ai1ec-oneday-view-original, .ai1ec-week-view-original'
				);
				// Scroll window down the same amount that the upper portion of the
				// table is being revealed.
				var vertical_offset =
					$calendar.find( '.tablescroll_wrapper' ).offset().top -
					$actual_table.offset().top;
				$( window ).scrollTo( '+=' + vertical_offset + 'px', 400 );
				// At the same time, expand height to reveal 1 full day (24 hours).
				var height = 24 * 60 + 2;
				$calendar.find( '.tablescroll_wrapper' )
					.scrollTo( '-=' + vertical_offset + 'px', 400 )
					.animate( { height: height + 'px' } );
			}
		);

		// Bind to statechange event.
		History.Adapter.bind( window,   'statechange',
			load_views.handle_state_change
		);

		$( document ).on( 'click',      '#ai1ec-calendar-view .ai1ec-load-event',
			function( e ) {
				e.preventDefault();
				$.cookie.raw = false;
				$.cookie( 'ai1ec_calendar_url', document.URL );
				window.location.href = this.href;
			}
		);
	};

	var initialize_select2 = function() {
		select2_multiselect_helper.init( $( '.ai1ec-select2-filters' ) );
		$( document ).on(
			'change',
			'.ai1ec-select2-multiselect-selector',
			load_views.load_view_from_select2_filter
		);
	};

	/** 
	 * Featured events block.
	 */
	var initialize_featured_events = function() {
		var 
			$carousel         = $( '.ai1ec-featured-list' ),
			$items            = $carousel.find( '.ai1ec-featured-event' ),
			$all_items        = $items,
			$main             = $( '.ai1ec-featured-first' ),
			$main_image       = $main.find( '.ai1ec-featured-image' ),
			// Get first item's full height.
			item_height       = $items.first().outerHeight()
				+ parseInt( $items.first().css( 'margin-bottom' ) ),
			timer             = null,
			// Delay between two slides.
			interval          = 3000,
			// It's the time of transition in the list.
			slide_time        = 800,
			// No need to scroll the list if we have less than six items.
			scrolling_enabled = $items.length > 5,
			// Don't start animation with less than two items.
			animation_enabled = $items.length > 1,
			// Start from the first (not cloned) item.
			current           = scrolling_enabled ? 5 : 0,
			// This called just once.
			init              = function() {
				$carousel
					// Stop animation when pointer enter the list area.
					.on( 'mouseenter', function() {
						clearInterval( timer )
						$( this )
							.stop()
							// Add scrollbar to the list.
							.addClass( scrolling_enabled && 'ai1ec-featured-hover' );
					// Continue animation.
					}).on( 'mouseleave', function() {
						$( this )
							// Remove scrollbar.
							.removeClass( 'ai1ec-featured-hover' )
							// Force browser to redraw the list to avoid flickering.
							.hide()
							.show( 0 );

						if ( animation_enabled ) {
							start_timer();
						}
					});
				if ( scrolling_enabled ) {
					// Clone last 5 events for a loop.
					$items
						.slice( -5 )
						.clone()
							.addClass( 'ai1ec-featured-list-cloned' )
							.prependTo( $carousel );
	
					// All items including cloned.
					$all_items = $carousel.find( '.ai1ec-featured-event' );
					$carousel.scrollTop( current * item_height );
				}
				$all_items
					.on( 'click', function() {
						// Stop animation.
						animation_enabled = false;
						// Proceed with the default behaviour if item is active.
						if ( $( this ).hasClass( 'ai1ec-featured-active' ) ) {
							return;
						}
						// Select the clicked item.
						select_item( $( this ).index() );
						return false;
					});

				// Start timer.
				animation_enabled && start_timer();
			},
			start_timer       = function() {
				timer = setInterval( scroll_to_next, interval );
			},
			// Select item in in the list and load its details to the main event.
			select_item       = function( item ) {
				$all_items
					.removeClass( 'ai1ec-featured-active' )
					.eq( item )
					.addClass( 'ai1ec-featured-active' );

				// Changing the main featured event.
				var $item = $all_items.eq( item );
				$main_image.css( 
					'background-image', 
					$item
						.find( '.ai1ec-featured-image' )
							.css( 'background-image' )
				);
				$main
					.find( '.ai1ec-featured-title' )
						.html( $item.find( '.ai1ec-featured-title' ).html() )
						.end()
					.find( '.ai1ec-featured-footer' )
						.html( $item.data( 'tags' ) + ' ' +  $item.data( 'categories' ) )
						.end()
					.find( 'a:first' )
						.attr( 'href', $item.attr( 'href' ) )
						.end()
					.find( '.ai1ec-month')
						.text( $item.data( 'month' ) )
						.end()
					.find( '.ai1ec-day')
						.text( $item.data( 'day' ) )
						.end()
					.find( '.ai1ec-weekday')
						.text( $item.data( 'weekday' ) );
			},
			check_for_end     = function() {
				// Return to the top if reached the end.
				if ( scrolling_enabled && first() === $items.length ) {
					current = 2;
					$carousel.scrollTop( 0 );
				} else if ( !scrolling_enabled && current === $items.length ) {
					current = 0;
				}
				select_item( current );
			},
			// Current first visible item.
			first = function() {
				return Math.round( $carousel.scrollTop() / item_height );
			},
			// Step of animation.
			scroll_to_next    = function() {
				current ++;
				if ( scrolling_enabled ) {
					if ( 2 < current - first() ) {
						// Sliding animation.
						$carousel.animate( {
							scrollTop: ( current - 2 )  * item_height
						},
						slide_time,
						'swing',
						function() {
							check_for_end();
						} );
					} else {
						check_for_end();
					}
				} else {
					check_for_end();
				}
			};

		init();
	}

	/**
	 * Start calendar page.
	 */
	var start = function() {
		$( document ).on( 'page_ready.ai1ec', function() {
			init();
			if( ai1ec_config.use_select2 ) {
				initialize_select2();
			}

			attach_event_handlers();
			// Initialize the calendar view for the first time.
			$( '.ai1ec-calendar' ).each( function() {
				load_views.initialize_view( $( this ) );
			} );

			// Affixed toolbar.
			if ( ai1ec_config.affix_filter_menu
				&& 1 === $( '.ai1ec-calendar' ).length
			) {
				affix.initialize_affixed_toolbar( $( '.ai1ec-calendar' ) );
			}
			
			// Featured events.
			initialize_featured_events();
		} );
	};

	return {
		start : start
	};
} );
