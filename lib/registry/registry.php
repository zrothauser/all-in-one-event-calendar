<?php

/**
 * Object Registry: retrieve an instance of a class from the internal cache or instanciate a new instance if necessary
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
    private $_loader = array();

    public function get( $key ){
        $class_name = $this->_get_class_name( $key );
        if( !isset( $_objects[$class_name] ) ){

            // Ask the loader to load the required files
            $this->_loader->load( $class_name );

            // Retrieve parameters for the class constructor
            $argv = array_slice( func_get_args(), 1 );

            // Instanciate the class
            if ( empty( $argv ) ) {
                $_objects[$class_name] = new $class_name();
            } else {
                $class = new ReflectionClass( $class_name );
                $_objects[$class_name] = $class->newInstanceArgs( $argv );
            }

        }

        return $_objects[$class_name];
    }

    /**
     * Translate the key to the actual class name
     *
     * @param $key string Key requested to the Registry
     *
     * @return string the name of the class
     */
    protected function _get_class_name( $key ){

        if ( stripos( '.', $key ) > 0 ){
            // Case: html.helper
            $parts = explode( '.', $key );
            $class_name = 'Ai1ec_';
            for ( $i = 0 ; $i < count( $parts ); $i++ ){
                if ( $i > 0 ){
                    $class_name .= '_';
                }
                $class_name .= ucfirst( $parts[0] );
            }

        }

        //TODO: handle other cases

        return $class_name;
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

