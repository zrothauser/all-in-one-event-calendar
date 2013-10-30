<?php

/**
 * Object Registry: retrieve an instance of a class from the internal cache or
 * instanciate a new instance if necessary
 *
 * */
class Ai1ec_Registry {

    /**
    * @var array The internal cache storage
    */
    private $_objects = array();

    /**
     * @var Ai1ec_Loader The Ai1ec_Loader instance used by the registry
     */
    private $_loader = null;

    public function get( $key ){
        $class_name = Ai1ec_Loader::resolve_class_name( $key );
        if( !isset( $this->_objects[$class_name] ) ){

            // Ask the loader to load the required files
            $this->_loader->load( $class_name );

            // Retrieve parameters for the class constructor
            $argv = array_slice( func_get_args(), 1 );

            $this->_objects[$class_name] = $this->initiate( $class_name, $argv);

        }

        return $this->_objects[$class_name];
    }

    /**
     * Instanciate the class given the class names and arguments
     *
     * @param $class_name string The name of the class to instanciate
     * @param array $argv optional an array of aguments that have to be passed
     * to the class constructor
     *
     * @return object A new instance of the requested class
     */
    public function initiate( $class_name, array $argv = array() ){

        switch ( count( $argv ) ) {
            case 0:
                return new $class_name();
                break;

            case 1:
                return new $class_name( $argv[0] );
                break;

            case 2:
                return new $class_name( $argv[0], $argv[1] );
                break;

            case 3:
                return new $class_name( $argv[0], $argv[1], $argv[2] );
                break;

            case 4:
                return new $class_name( $argv[0], $argv[1], $argv[2], $argv[3] );
                break;

            case 5:
                return new $class_name( $argv[0], $argv[1], $argv[2], $argv[3], $argv[4] );
                break;

            default:
                $reflected = new ReflectionClass( $class_name );
                return $reflected->newInstanceArgs( $argv );
        }

    }

    /**
     * Constructor
     *
     * Initialize the Registry
     *
     * @return void Constructor does not return
     */
    public function __construct(){

        $this->_loader = new Ai1ec_Loader();

    }

}

