<?php
class Ai1ec_View_Event_Location extends Ai1ec_Base {
	/**
	 * Return location details in brief format, separated by | characters.
	 *
	 * @return $string Short location string
	 */
	public function get_short_location( Ai1ec_Event $event ) {
		$location_items = array();
		foreach ( array( 'venue', 'city', 'province', 'country' ) as $field ) {
			if ( $event->get( $field ) !== '' ) {
				$location_items[] = $event->get( $field );
			}
		}
		return implode( ' | ', $location_items );
	}
}