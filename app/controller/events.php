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