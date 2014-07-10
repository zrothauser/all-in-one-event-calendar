define(
	[
		'jquery_timely',
		'ai1ec_config'
	],
	function( $, ai1ec_config ) {
	"use strict"; // jshint ;_;

	/**
	 * Affixed toolbar.
	 * Uses Bootstrap Affix plugin.
	 * @param  {object} $calendar jQuery object
	 */
	var initialize_affixed_toolbar = function( $calendar ) {
		var
			$toolbar = $calendar.find( '.ai1ec-calendar-toolbar' );

		// No use without a toolbar.
		if ( ! $toolbar.length ) {
			return false;
		}
		var 
			// Calendar navigation buttons
			$buttons = $calendar.find( '.ai1ec-views-dropdown' )
				.closest( 'div.ai1ec-clearfix' )
					.css( 'clear', 'both' ),
			$toggle = $toolbar.find( '.ai1ec-dropdown-toggle' ),
			$view = $calendar.find( '#ai1ec-calendar-view' ),
			$wpadminbar = $( '#wpadminbar' ),
			initial_toolbar_offset = $toolbar.offset().top,
			offset = 0,
			resize_timer = null,
			// Returns current Bootsrap window mode
			get_window_mode = function() {
				return $( '#ai1ec-bs-modes div:visible:first' ).text();
			},
			// Create elements to monitor Bootstrap's responsive breakouts.
			create_bs_modes = function() {
				var
					modes = [ 'xs', 'sm', 'md', 'lg' ],
					$modes = $( '<div id="ai1ec-bs-modes"></div>' );

				for ( var i in modes ) {
					$( '<div class="ai1ec-device-'
						+ modes[ i ] +' ai1ec-visible-' + modes[ i ] + '">'
						+ modes[ i ] +'</div>' )
						.appendTo( $modes );
				}
				$modes.appendTo( 'body' );
			},
			// Returns offset value from user setting depending on the window width.
			settings_offset = function() {
				return parseInt(
					ai1ec_config[ 'affix_vertical_offset_' +  get_window_mode() ] || 0
				);
			},
			// Hide dropdown captions to save some space.
			hide_toggle_text = function() {
				$toggle.each( function() {
					$( this )
						.contents()
							.eq( -3 )
								.wrap( '<div class="ai1ec-hidden" />' );
				});
			},
			// Remove hidden Div and show the caption.
			show_hidden_toggle_text = function() {
				$toggle
					.find( '.ai1ec-hidden' )
						.contents()
							.unwrap();
			},
			// That is only important when admin bar is not fixed.
			set_toolbar_offset = function() {
				var offset = 0;
				if ( 'fixed' === $wpadminbar.css( 'position' ) ) {
					offset = $wpadminbar.height();
				}
				$toolbar.css( 'top', offset + settings_offset() + 'px' );
			},
			// Returns offset for the BS affix plugin.
			get_offset = function() {
				return offset;
			},
			// Recalculate offset for the BS affix plugin.
			update_offset = function() {
				offset = initial_toolbar_offset
					- ( 'fixed' === $wpadminbar.css( 'position' ) ? $wpadminbar.height() : 0 )
					- settings_offset();
			},
			// If we get more height then it was before - try to minimize the dropdowns.
			// If it doesn't help - keep them as before.
			resize_dropdowns = function() {
				// If Toolbar can't fit all the elements, hide the dropdown's captions.
				if ( $toolbar.height()  > $toolbar.data( 'original_height' ) ) {
					hide_toggle_text();
					// If it doesn't help show them.
					if ( $toolbar.height() > $toolbar.data( 'original_height' ) ) {
						show_hidden_toggle_text();
					}
				} else {
					show_hidden_toggle_text();
				}
			},
			// This method is needed when content is updated.
			reinitialize = function() {
				// We probably have new buttons here, so find them again.
				$calendar
					.find( '.ai1ec-affix .ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.remove();
				$buttons = $calendar.find( '.ai1ec-views-dropdown' )
					.closest( 'div.ai1ec-clearfix' );
				$toggle = $toolbar.find( '.ai1ec-dropdown-toggle' );
				$toolbar
					.trigger( 'ai1ec-affix-top.bs.affix' )
					.find( '.ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.hide()
							.end()
						.end()
					.data( {
						// Toolbar's original height might have changed.
						'original_height': $toolbar.height()
					} )
					.find( '.ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.show()
							.end()
						.end()
					.filter( '.ai1ec-affix' )
						.trigger( 'ai1ec-affix.bs.affix' );
			},
			// Process toolbar on resize.
			on_resize = function() {
				if ( $toolbar.hasClass( 'ai1ec-affix' ) ) {
					$toolbar.addClass( 'ai1ec-was-affixed' );
				}
				update_offset();
				$toolbar
					.removeClass( 'ai1ec-affix' )
					.css( 'width', $calendar.width() )
					.find( '.ai1ec-btn-toolbar' )
						.hide()
						.end()
					.data( {
						// Let's remember the original height.
						'original_height': $toolbar.height()
					} );

				set_toolbar_offset();
				initial_toolbar_offset = $toolbar.offset().top;
				$toolbar
					.filter( '.ai1ec-was-affixed' )
						.addClass( 'ai1ec-affix' )
						.removeClass( 'ai1ec-was-affixed' )
						.find( '.ai1ec-btn-toolbar' )
							.show();

				resize_timer = null;
			};

		// Detect Bootstrap modes.
		create_bs_modes();
		update_offset();

		$toolbar
			.data( {
				// Let's remember the original height.
				'original_height': $toolbar.height()
			} )
			.css( 'width', $calendar.width() )
			.affix( {
				offset: {
					top: get_offset,
					bottom: 0
				}
			} )
			// Toolbar is affixed. Event is thrown by Bootstrap.
			.on( 'ai1ec-affix.bs.affix', function() {
				// Offset before moving the buttons.
				var offset = $view.offset().top;
				$buttons
					.hide()
					.appendTo( $toolbar )
					.show() // A trick to get real height while fade-in is still in process.
					.css( 'opacity', 0 )
					.animate( {
						opacity: 1
					}, 400 );
				resize_dropdowns();
				set_toolbar_offset();
				// Set the offset to compensate the space occupied by toolbar.
				$view
					.css( 'margin-top' , $toolbar.outerHeight( true )
						+ parseInt( $toolbar.css( 'margin-bottom' ) ) + 'px'
					);
			} )
			// Toolbar is not affixed. Event is thrown by Bootstrap.
			.on( 'ai1ec-affix-top.bs.affix', function() {
				$buttons.hide();
				$view.prepend( $buttons );
				$buttons
					.show()
					.css( 'opacity', 0 )
					.animate( {
						opacity: 1
					}, 400 );

				show_hidden_toggle_text();
				set_toolbar_offset();
				$view.css( 'margin-top' , 0 );
				$toolbar.data( 'original_height',  $toolbar.height() );
			} )
			// This event fires when a new content was loaded.
			.on( 'ai1ec-affix.reinit', reinitialize )
			.filter( '.ai1ec-affix' )
				.trigger( 'ai1ec-affix.bs.affix' );

		// Recalc. width and offset on resize.
		// Timer is used to reduce calculations.
		$( window ).on( 'resize.affix', function() {
			clearTimeout( resize_timer )
			resize_timer = setTimeout( on_resize , 100 );
		} );

		return $calendar;
	};

	return {
		initialize_affixed_toolbar: initialize_affixed_toolbar
	};
} );
