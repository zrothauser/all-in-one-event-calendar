define(
	[
		"jquery_timely",
		"ai1ec_config"
	],
	function( $, ai1ec_config ) {
		"use strict";

		var is_free = function() {
			return $( '#ai1ec_is_free' ).is( ':checked' );
		};

		var is_price_entered = function() {
			return ( $( '#ai1ec_cost' ).val() !== '' );
		};

		var is_free_click_handler = function( evt ) {
			var $wrap = $( this ).parents( 'table:eq(0)' );
			var $cost = $( '#ai1ec_cost', $wrap );
			var label = ai1ec_config.label_a_buy_tickets_url;
			if ( is_free() ) {
				$cost.attr( 'value', '' ).addClass( 'ai1ec-hidden' );
				label = ai1ec_config.label_a_rsvp_url;
			} else {
				$cost.removeClass( 'ai1ec-hidden' );
			}
			$( 'label[for=ai1ec_ticket_url]', $wrap ).text( label );
		};

		return {
			handle_change_is_free:  is_free_click_handler,
			check_is_free:          is_free,
			check_is_price_entered: is_price_entered
		};
	}
);
