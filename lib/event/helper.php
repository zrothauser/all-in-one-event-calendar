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

	/**
	 * trim_excerpt function
	 *
	 * Generates an excerpt from the given content string. Adapted from
	 * WordPress's `wp_trim_excerpt' function that is not useful for applying
	 * to custom content.
	 *
	 * @param string $text The content to trim.
	 *
	 * @return string      The excerpt.
	 **/
	public function trim_excerpt( $text ) {
		$raw_excerpt    = $text;

		$text           = preg_replace(
			'#<\s*script[^>]*>.+<\s*/\s*script\s*>#x',
			'',
			$text
		);
		$text           = strip_shortcodes( $text );
		$text           = str_replace( ']]>', ']]&gt;', $text );
		$text           = strip_tags( $text );

		$excerpt_length = apply_filters( 'excerpt_length', 55 );
		$excerpt_more   = apply_filters( 'excerpt_more', ' [...]' );
		$words          = preg_split(
			"/\s+/",
			$text,
			$excerpt_length + 1,
			PREG_SPLIT_NO_EMPTY
		);
		if ( count( $words ) > $excerpt_length ) {
			array_pop( $words );
			$text = implode( ' ', $words );
			$text = $text . $excerpt_more;
		} else {
			$text = implode( ' ', $words );
		}
		return apply_filters( 'wp_trim_excerpt', $text, $raw_excerpt );
	}

	/**
	 * event_parent method
	 *
	 * Get/set event parent
	 *
	 * @param int $event_id    ID of checked event
	 * @param int $parent_id   ID of new parent [optional=NULL, acts as getter]
	 * @param int $instance_id ID of old instance id
	 *
	 * @return int|bool Value depends on mode:
	 *     Getter: {@see self::get_parent_event()} for details
	 *     Setter: true on success.
	 */
	public function event_parent(
		$event_id,
		$parent_id   = NULL,
		$instance_id = NULL
	) {
		$meta_key = '_ai1ec_event_parent';
		if ( NULL === $parent_id ) {
			return $this->get_parent_event( $event_id );
		}
		$meta_value = json_encode( array(
			'created'  => Ai1ec_Time_Utility::current_time(),
			'instance' => $instance_id,
		) );
		return add_post_meta( $event_id, $meta_key, $meta_value, true );
	}

	/**
	 * Get parent ID for given event
	 *
	 * @param int $current_id Current event ID
	 *
	 * @return int|bool ID of parent event or bool(false)
	 */
	public function get_parent_event( $current_id ) {
		static $parents = NULL;
		if ( NULL === $parents ) {
			$parents = $this->_registry->get( 'Ai1ec_Memory_Utility' );
		}
		$current_id = (int)$current_id;
		if ( NULL === ( $parent_id = $parents->get( $current_id ) ) ) {
			$dbi = $this->_registry->get( 'Ai1ec_Dbi' );
			$query      = '
				SELECT parent.ID, parent.post_status
				FROM
					' . $dbi->get_table_name( 'posts' ) . ' AS child
					INNER JOIN ' . $dbi->get_table_name( 'posts' ) . ' AS parent
						ON ( parent.ID = child.post_parent )
				WHERE child.ID = ' . $current_id;
			$parent     = $dbi->get_row( $query );
			if (
				empty( $parent ) ||
				'trash' === $parent->post_status
			) {
				$parent_id = false;
			} else {
				$parent_id = $parent->ID;
			}
			$parents->set( $current_id, $parent_id );
			unset( $query );
		}
		return $parent_id;
	}

}