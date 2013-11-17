<?php

/**
 * The base class which simply sets the registry object.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Bootstrap
 */
class Ai1ec_Base {

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;

	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		$this->_registry = $registry;
	}
}