<?php

/**
 * Model used for processing user page selection.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Settings_Calendar_Page {

	/**
	 * Parse user selection for calendar page.
	 *
	 * @param string|int $calendar_page Creatable page name or post ID to use.
	 *
	 * @return int Numeric post ID to use.
	 */
	public function parse_user_selection( $calendar_page ) {
		// '__auto_page:Calendar'
		if ( preg_match( '#^__auto_page:(.*?)$#', $calendar_page, $matches )  ) {
			return $this->create_calendar_page( $matches[1] );
		}
		return $this->check_page( $calendar_page );
	}

	/**
	 * Get valid post ID for given numeric input.
	 *
	 * @param int $page_id Suspect page ID.
	 *
	 * @return int Valid page ID or `0` if none found.
	 */
	public function check_page( $page_id ) {
		$page_id = (int)$page_id;
		$post    = get_post( $page_id );
		if ( null === $post || empty( $post->ID ) ) {
			return 0;
		}
		return (int)$post->ID;
	}

	/**
	 * Create new post ID for user input.
	 *
	 * @param string $title Page title to use.
	 *
	 * @return int Create page ID or `0` on failure.
	 */
	public function create_calendar_page( $title ) {
		$options = array(
			'post_title'     => $title,
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'comment_status' => 'closed'
		);
		$page_id = wp_insert_post( $options );
		return (int)$page_id;
	}

}