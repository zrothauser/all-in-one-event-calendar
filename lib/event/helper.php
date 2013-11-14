<?php
class Ai1ec_Event_Helper {

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;
	
	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Object_Registry $registry
	 */
	public function __construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry = $registry;
	}

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
		static $colors = NULL;
		if ( ! isset( $colors ) ) {
			$colors = $this->_registry->get( 'cache.memory' );
		}
		$term_id = (int)$term_id;
		if ( NULL === ( $color = $colors->get( $term_id ) ) ) {
			$wpdb = $this->_registry->get( 'dbi.dbi' );
	
			$color = (string)$wpdb->get_var(
				'SELECT term_color FROM ' . $wpdb->prefix .
				'ai1ec_event_category_colors' . ' WHERE term_id = ' .
				$term_id
			);
			$colors->set( $term_id, $color );
		}
		return $color;
	}
}