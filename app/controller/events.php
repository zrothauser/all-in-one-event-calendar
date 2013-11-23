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

		$events = $this->_registry->get( 'model.search' )->get_events_between(
				new Ai1ec_Date_Time( $this->_registry ), new Ai1ec_Date_Time( $this->_registry, time() + 10800 ) );

		print_r($events);

		$events = array();

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-list.twig',
			array( 'events' => $events ),
			false
		);

		return $template->get_content();
	}

}