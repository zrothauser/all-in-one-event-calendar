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
	private $_is_routing_initializing = false;

	/**
	 * Returns whether routing is during initialization phase or not.
	 *
	 * @return bool
	 */
	public function is_routing_initializing() {
		return $this->_is_routing_initializing;
	}

	/**
	 * Sets state for routing initialization phase.
	 *
	 * @param bool $status State for initializing phase.
	 */
	public function set_routing_initialization( $status ) {
		$this->_is_routing_initializing = $status;
	}
}
