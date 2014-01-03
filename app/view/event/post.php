<?php

/**
 * This class renders the html for the event colors.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Event_Post {
	
	/**
	 * Generates an excerpt from the given content string.
	 *
	 * Adapted from WordPress's `wp_trim_excerpt' function that is not useful
	 * for applying to custom content.
	 *
	 * @param string $text The content to trim.
	 *
	 * @return string The excerpt.
	 */
	public function trim_excerpt( Ai1ec_Event$event, $length = 35, $more = '[...]' ) {
		$raw_excerpt    = $event->get( 'post' )->post_content;
	
		$text           = preg_replace(
			'#<\s*script[^>]*>.+<\s*/\s*script\s*>#x',
			'',
			$event->get( 'post' )->post_content
		);
		$text           = strip_shortcodes( $text );
		$text           = str_replace( ']]>', ']]&gt;', $text );
		$text           = strip_tags( $text );
	
		$excerpt_length = apply_filters( 'excerpt_length', $length );
		$excerpt_more   = apply_filters( 'excerpt_more', $more );
		$words          = preg_split(
			'/\s+/',
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