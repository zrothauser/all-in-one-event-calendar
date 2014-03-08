define(
	[
		"jquery_timely",
		"external_libs/moment",
		"external_libs/bootstrap_timepicker"
	],
	function( $, moment, domReady ) {
	"use strict";

	/**
	 * Event handler for timepicker's first focus. Initialize widget.
	 */
	var init_timepicker = function() {
		var $this = $( this );
		if ( typeof $this.data( 'timepicker' ) === 'undefined' ) {

			// If the input field lacks a value, provide current time (in UTC).
			if ( $this.val() === '' ) {
				var def_time = moment().utc();
				var time_format = $this.data( 'showMeridian' ) ? 'hh:mm A' : 'HH:mm';
				$this.val( def_time.format( time_format ) );
			}

			// Activate timepicker.
			$this
				.timepicker( {
					showMeridian: $this.data( 'showMeridian' ),
					showInputs: false,
					defaultTime: $this.val()
				} )
				// Toggle class on root element to disable "overflow: none" on Bootstrap
				// Collapse elements while timepicker is visible.
				.on( 'show.timepicker', function() {
					$this.parents( '.ai1ec-collapse' )
						.addClass( 'ai1ec-timepicker-visible' );
				} )
				.on( 'hide.timepicker', function() {
					$this.parents( '.ai1ec-collapse' )
						.removeClass( 'ai1ec-timepicker-visible' );
				} );

			// Capture the timepicker container element on the page.
			var $widget = $this.data( 'timepicker' ).$widget;

			// Apply .timely class to timepicker container to ensure proper Bootstrap
			// styling is applied to unclassed HTML elements contained therein.
			$widget.addClass( 'timely' );
		}
	};

	/**
	 * Initialize any tag selectors on the page. Limit search to $container
	 * parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var init = function( $container ) {
		if ( typeof $container === 'undefined' ) {
			$container = $( document );
		}

		// Initialize timepickers only on first focus to provide default time value
		// if empty.
		$container.on( 'focus', '.ai1ec-timepicker', init_timepicker );
	};

	return {
		init: init
	};
} );
