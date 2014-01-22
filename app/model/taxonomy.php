<?php

/**
 * Model used for storing/retrieving taxonomy.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Taxonomy extends Ai1ec_Base {
	
	/**
	 * get_category_color function
	 *
	 * Returns the color of the Event Category having the given term ID.
	 *
	 * @param int dbm_id The ID of the Event Category
	 *
	 * @return string Color to use
	 *
	 * @staticvar Ai1ec_Memory_Utility $colors Cached entries instance
	 */
	public function get_category_color( $term_id ) {
		static $colors = NULL;
		if ( ! isset( $colors ) ) {
			$colors = $this->_registry->get( 'cache.memory' );
		}
		$term_id = (int)$term_id;
		if ( NULL === ( $color = $colors->get( $term_id ) ) ) {
			$db = $this->_registry->get( 'dbi.dbi' );
	
			$color = (string)$db->get_var(
				'SELECT term_color FROM ' . $db->get_table_name( 'ai1ec_event_category_colors' ) .
				' WHERE term_id = ' .
				$term_id
			);
			$colors->set( $term_id, $color );
		}
		return $color;
	}

}