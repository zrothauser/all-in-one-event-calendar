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
					$this.parents( '.collapse' ).addClass( 'ai1ec-timepicker-visible' );
				} )
				.on( 'hide.timepicker', function() {
					$this.parents( '.collapse' ).removeClass( 'ai1ec-timepicker-visible' );
				} );

			// Wrap timepicker in div.timely to avoid polluting global namespace.
			var $widget = $this.data( 'timepicker' ).$widget;
			$widget.wrapAll( '<div class="timely">' );

			// Apply alignment class.
			var alignment = $this.data( 'alignment' );
			if ( typeof alignment === 'undefined' ) alignment = 'left';
			$widget.addClass( 'ai1ec-alignment-' + alignment );
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