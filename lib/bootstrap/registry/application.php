<?php
class Ai1ec_Application_Registry implements Ai1ec_Registry {

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;

	/**
	 * @var Ai1ec_Cache_Memory
	 */
	protected $_environment;

	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Object_Registry $registry
	 */
	function __construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry = $registry;
		$this->_environment = $registry->get( 'cache.memory', PHP_INT_MAX -1 );
	}
	
	public function get( $key ) {
		$this->_environment->get( $key );
	}

	public function set( $key, $value ) {
		$this->_environment->set( $key, $value );
	}
}