define(
	[
		'jquery_timely',
		'ai1ec_config'
	],
	function( $, ai1ec_config ) {
		'use strict';
		$( 'input[name="ai1ec_cost_type"]' ).on( 'click change', function() {
			var
				$tickets = $( '.ai1ec-tickets-form, .ai1ec-tickets-list-container' ),
				$external = $( '.ai1ec-tickets-external' );

			if ( 'free' === this.value ) {
				$tickets.hide();
				$external.hide();
			} else if ( 'tickets' === this.value  ) {
				$tickets.show();
				$external.hide();
			} else {
				$tickets.hide();
				$external.show();
			}
		} );
		$( 'input[name="ai1ec_cost_type"]:checked' ).click();
	}
);
