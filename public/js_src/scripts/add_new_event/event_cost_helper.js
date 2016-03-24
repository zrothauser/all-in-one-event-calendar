define(
	[
		'jquery_timely',
		'ai1ec_config'
	],
	function( $, ai1ec_config ) {
		'use strict';
		var
			$cost         = $( '.ai1ec-tickets-cost' ),
			$tickets_url  = $( '.ai1ec-tickets-url-text' ),
			$register_url = $( '.ai1ec-register-url-text' );

		$( 'input[name="ai1ec_cost_type"]' ).on( 'click change', function() {
			var
				$no_tickets = $( '.ai1ec-no-tickets' ),
				$tickets    = $( '.ai1ec-tickets-form, .ai1ec-tickets-list-container' ),
				$external   = $( '.ai1ec-tickets-external' );

			if ( 'free' === this.value ) {
				$tickets.hide();
				$external.hide();
				$no_tickets.show();
			} else if ( 'tickets' === this.value  ) {
				$tickets.show();
				$external.hide();
				$no_tickets.hide();
			} else {
				$tickets.hide();
				$external.show();
				$no_tickets.show();
			}
		} );
		$( 'input[name="ai1ec_cost_type"]:checked' ).click();
		
		$( '#ai1ec_is_free' ).on( 'click', function() {
			if ( this.checked ) {
				$cost.addClass( 'ai1ec-hidden' );
				$tickets_url.addClass( 'ai1ec-hidden' );
				$register_url.removeClass( 'ai1ec-hidden' );
			} else {
				$cost.removeClass( 'ai1ec-hidden' );
				$tickets_url.removeClass( 'ai1ec-hidden' );
				$register_url.addClass( 'ai1ec-hidden' );
			}
		})
		
	}
);
