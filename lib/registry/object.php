<?php

/**
 * @author nicola
 *
 */
class Ai1ec_Object_Registry implements Ai1ec_Registry_Interface {
	
	CONST PREFIX = 'Ai1ec_';
	
	static private $_objects = array();

	static private $_classes = array();

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Registry_Interface::get()
	 *
	 */
	public function get( $key ) {
		$classname = $this->get_classname();
		if( ! isset ( self::$_classes[$classname] ) ) {
			throw new Ai1ec_Registry_Exception( 
				'The class "' . $classname . '" was not registered'
			);
		}

		$options = self::$_classes[$classname];
		// if it's a global object and it's already set, return it
		if ( isset( $options['global'] ) && 
				isset( self::$_objects[$classname] ) ) {
			return self::$_objects[$classname];
		}
		$params = array();
		if( func_num_args() > 1 ) {
			$params = func_get_arg( 1 );
		}
		// check if the object needs a factory
		if ( isset( $options['factory'] ) ) {
			
			return $this->dispatch( 
				$options['factory'][0],
				$options['factory'][1],
				$params
			);
		} else {
			if ( empty( $params ) ) {
				return new $classname();
			} else {
				$class = new ReflectionClass( $classname );
				return $class->newInstanceArgs( $params );
			}

		}

	}

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Registry_Interface::set()
	 *
	 */
	public function set( $key, $val ) {
		if ( ! is_object( $val ) ) {
			throw new Ai1ec_Registry_Exception( 'Only Objects can be stored in the registry' );
		}
		$classname = $this->get_classname();
		if ( isset( self::$_objects[$classname] ) ) {
			throw new Ai1ec_Registry_Exception( 'Only one object for each key is allowed' );
		}
		self::$_objects[$classname] = $val;
	}

	/**
	 * Register a class into the registry
	 * 
	 * @param string $class_name The name of the class to registr
	 * @param array $options     An array of options about the class.
	 */
	public function register( $class_name, array $options ) {
		if( isset( self::$_classes[$class_name] ) ) {
			throw new Ai1ec_Registry_Exception( 'A class can\'t be registered twice' );
		}
		self::$_classes[$class_name] = $options;
	}

	/**
	 * A call_user_func_array alternative.
	 * 
	 * @param string $class
	 * @param string $method
	 * @param array $params
	 * 
	 * @return mixed
	 */
	public function dispatch( $class, $method, $params = array() ) {
		if ( empty( $class ) ) {
			switch ( count( $params)  ) {
				case 0:
					return $method();
				case 1:
					return $method( $params[0] );
				case 2:
					return $method( $params[0], $params[1] );
				case 3:
					return $method( $params[0], $params[1], $params[2] );
				default:
					return call_user_func_array( array( $class, $method ), $params );
			}
		} else {
			// get an instance of the class
			$class = $this->get( $class );
			switch ( count( $params)  ) {
				case 0:
					return $class->{$method}();
				case 1:
					return $class->{$method}( $params[0] );
				case 2:
					return $class->{$method}( $params[0], $params[1] );
				case 3:
					return $class->{$method}( $params[0], $params[1], $params[2] );
				default:
					return call_user_func_array( array( $class, $method ), $params );
			}
		}

	}

	/**
	 * Return the class name from the key.
	 * 
	 * @param string $key
	 * 
	 * @return string
	 */
	private function get_classname( $key ) {
		return self::PREFIX . $key;
	}
}