<?php

/**
 * Base application model.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_App {

	/**
	 * @var Ai1ec_System Instance of system layer.
	 */
	protected $_sys = null;

	/**
	 * @var Ai1ec_Dbi Instance of database abstraction layer.
	 */
	protected $_db  = null;

	/**
	 * Initiate base objects.
	 *
	 * @param Ai1ec_System $system Injectable system object.
	 *
	 * @return void Constructor does not return.
	 */
	public function __construct( Ai1ec_System $system ) {
		$this->_sys = $system;
		$this->_db  = $this->_sys->get( 'dbi' );
		$this->_initialize();
	}

	/**
	 * Post construction routine.
	 *
	 * Override this method to perform post-construction tasks.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function _initialize() {}

}