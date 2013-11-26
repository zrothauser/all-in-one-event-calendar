<?php

/**
 * An helper class for events.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Events
 */
class Ai1ec_Event_Helper extends Ai1ec_Base {

	/**
	 * get_category_color function
	 *
	 * Returns the color of the Event Category having the given term ID.
	 *
	 * @param int $term_id The ID of the Event Category
	 *
	 * @return string Color to use
	 *
	 * @staticvar Ai1ec_Memory_Utility $colors Cached entries instance
	 */
	public function get_category_color( $term_id ) {
		static $colors = null;
		if ( null === $colors ) {
			$colors  = array();
			$results = $this->_registry->get( 'dbi.dbi' )->select(
				'ai1ec_event_category_colors',
				array( 'term_id', 'term_color' )
			);
			foreach ( $results as $row ) {
				$colors[(int)$row->term_id] = $row->term_color;
			}
		}
		$term_id = (int)$term_id;
		if ( ! isset( $colors[$term_id] ) ) {
			return null;
		}
		return $colors[$term_id];
	}

}