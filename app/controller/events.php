<?php

/**
 * Events Controller
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Events_Controller extends Ai1ec_Base {

	/**
	 * Handle clean-up when post is deleted.
	 *
	 * @wp_hook delete_post Before performing actual delete.
	 *
	 * @param int $post_id ID of post being removed.
	 *
	 * @return bool Success.
	 */
	public function delete( $post_id ) {
		$dbi   = $this->_registry->get( 'dbi.dbi' );
		$where = array( 'post_id' => (int)$post_id );
		$dbi->delete( 'ai1ec_events',          $where, array( '%d' ) );
		$dbi->delete( 'ai1ec_event_instances', $where, array( '%d' ) );
		return true;
	}

	public function get_events() {
		$start  = $this->_registry->get( 'date.time', strtotime( '-1 month' ) );
		$end    = $this->_registry->get( 'date.time', strtotime( '+1 month' ) );
		$events = $this->_registry->get( 'model.search' )
			->get_events_between( $start, $end );

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-list.twig',
			compact( 'events', 'start', 'end' ),
			false
		);

		return $template->get_content();
	}

}