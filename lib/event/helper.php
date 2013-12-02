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
			"/[\n\r\t ]+/",
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
}