define(
		[
		 "jquery_timely",
		 "ai1ec_config",
		 "external_libs/bootstrap_tab"
		 ],
		function( $, ai1ec_config ) {
			"use strict"; // jshint ;_;
			// Simulates shift() function for jQuery collections
			$.fn.shift = function() {
				var bottom = this.get( 0 );
				this.splice( 0,1 );
				return bottom;
			};

			// Disables all submit buttons after a submit button is pressed.
			var block_all_submit_and_ajax = function( el ) {
				var $el = $( el );
				// Clone the clicked button, we need to know what button has been clicked so that we can react accordingly
				var $clone = $( '<input />', {
					"type"  : "hidden",
					"name"  : $el.attr( 'name' ),
					"value" : $el.attr( 'value' )
				} );
				// Put the hidden button in the DOM
				$el.after( $clone );
				// Disable all submit button. I use setTimeout otherwise this doesn't work in chrome.
				setTimeout(function() {
					 $( '#facebook button[type="submit"]' ).prop( 'disabled', true );
				 }, 10);
				// unbind all click handler from ajax
				$( '#facebook .btn' ).unbind( "click" );
				// Disable all AJAX buttons.
				$( '#facebook .btn' ).click( function( e ) {
					e.preventDefault();
				} );
			};
			// This function remove the passed elements from the DOM and reorders the other elements
			var cancel_element_and_reorder_other = function( $el ) {
				// Get the wrapper element
				var $wrapper = $el.closest( '.ai1ec-facebook-items' );
				// Remove the element
				$el.closest( '.ai1ec-facebook-subscriber' ).remove();
				// Get all items inside the wrapper
				var $facebook_items = $( '.ai1ec-facebook-subscriber', $wrapper );
				// Iterate over the lines
				$( '> .row-fluid', $wrapper ).each( function() {
					// Cache the current jQuery object
					var $this = $( this );
					// Clean the row
					$this.html( '' );
					// Each row has two elements
					for( var i = 0; i < 2; i++ ) {
						// If there are no more elements to add and we are at the first iteration we remove the row, which is the last row
						if ( i === 0 && $facebook_items.length === 0 ) {
							$this.remove();
							// If the are no more rows append the standard text.
							if( $( '> .row-fluid', $wrapper ).length === 0) {
								var div = $( "<div />", {
									'class': 'no_subscription',
									'text': ai1ec_config.no_more_subscription
								} );
								$wrapper.append( div );
							}
							return;
						}
						// Take the first item of the collection
						var $item = $facebook_items.shift();
						// Append it
						$this.append( $item );
					}
				} );

			};

			return {
				"block_all_submit_and_ajax"        : block_all_submit_and_ajax,
				"cancel_element_and_reorder_other" : cancel_element_and_reorder_other
			};
		}
);
