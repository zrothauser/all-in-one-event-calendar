<?php
/**
 * Calendar state container.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib.Calendar
 */
class Ai1ec_Calendar_State extends Ai1ec_Base {

	/**
	 * Whether calendar is initializing router or not.
	 *
	 * @var bool
	 */
	private $_routing_initialization = false;

	/**
	 * Returns whether routing is during initialization phase or not.
	 *
	 * @return bool
	 */
	public function is_routing_initialization() {
		return $this->_routing_initialization;
	}

	/**
	 * Sets state for routing initialization phase.
	 *
	 * @param bool $status State for initializing phase.
	 */
	public function set_routing_initialization( $status ) {
		$this->_routing_initialization = $status;
	}
}
