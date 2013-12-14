<?php

/**
 * This class renders the html for the event ticket.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Event_Ticket {

	/**
	 * Create readable content for buy tickets/register link
	 *
	 * @param bool $long Set to false to use short message version
	 *
	 * @return string Message to be rendered on buy tickets link
	 */
	public function get_tickets_url_label( Ai1ec_Event $event, $long = true ) {
		if ( $event->is_free() ) {
			return ( $long )
			? __( 'Register Now', AI1EC_PLUGIN_NAME )
			: __( 'Register', AI1EC_PLUGIN_NAME );
		}
		$output = '';
		if ( $long ) {
			$output = apply_filters(
				'ai1ec_buy_tickets_url_icon',
				'<i class="icon-shopping-cart"></i>'
			);
			if ( ! empty( $output ) ) {
				$output .= ' ';
			}
		}
		$output .= ( $long )
			? __( 'Buy Tickets', AI1EC_PLUGIN_NAME )
			: __( 'Tickets', AI1EC_PLUGIN_NAME );
		return $output;
	}
}