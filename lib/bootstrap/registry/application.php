<?php
class Ai1ec_Registry_Application_ implements Ai1ec_Registry {

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;

	/**
	 * @var array
	 */
	protected $_environment = array();

	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	function __construct( Ai1ec_Registry_Object $registry ) {
		$this->_registry = $registry;
	}
	
	public function get( $key ) {
		return $this->_environment[$key];
	}

	public function set( $key, $value ) {
		$this->_environment[$key] = $value;
	}
}