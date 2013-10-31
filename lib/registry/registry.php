<?php

/**
 * Object Registry: get instance of requested and optionally registered object.
 *
 * Object (instance of a class) is generater, or returned from internal cache
 * if it was requested and instantiated before.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Registry
 */
class Ai1ec_Object_Registry {

	/**
	* @var array The internal objects cache
	*/
	private $_objects = array();

	/**
	 * @var Ai1ec_Loader The Ai1ec_Loader instance used by the registry
	 */
	private $_loader  = null;

	/**
	 * Get class instance.
	 *
	 * Return an instance for the requested key, this method has an internal
	 * cache.
	 *
	 * @param string $key Name of previously registered object or parseable
	 *                    class name
	 *
	 * @return object Instance of the requested class
	 */
	public function get( $key ) {
		$class_name = $this->_loader->resolve_class_name( $key );
		if ( ! isset( $this->_objects[$class_name] ) ) {
			// Ask the loader to load the required files to avoid autoloader
			$this->_loader->load( $class_name );
			$this->_objects[$class_name] = $this->initiate(
				$class_name,
				array_slice( func_get_args(), 1 )
			);
		}
		return $this->_objects[$class_name];
	}

	/**
	 * Instanciate the class given the class names and arguments.
	 *
	 * @param string $class_name The name of the class to instanciate.
	 * @param array  $argv       An array of aguments for construction.
	 *
	 * @return object A new instance of the requested class
	 */
	public function initiate( $class_name, array $argv = array() ) {
		switch ( count( $argv ) ) {
			case 0:
				return new $class_name();

			case 1:
				return new $class_name( $argv[0] );

			case 2:
				return new $class_name( $argv[0], $argv[1] );

			case 3:
				return new $class_name( $argv[0], $argv[1], $argv[2] );

			case 4:
				return new $class_name( $argv[0], $argv[1], $argv[2], $argv[3] );

			case 5:
				return new $class_name( $argv[0], $argv[1], $argv[2], $argv[3], $argv[4] );
		}

		$reflected = new ReflectionClass( $class_name );
		return $reflected->newInstanceArgs( $argv );
	}

	/**
	 * Constructor
	 *
	 * Initialize the Registry
	 *
	 * @return void Constructor does not return
	 */
	public function __construct() {
		$this->_loader = new Ai1ec_Loader();
	}

}