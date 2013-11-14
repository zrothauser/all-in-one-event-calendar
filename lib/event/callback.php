<?php

class Ai1ec_Event_Callback {    
    protected $_registry      = null;
    protected $_registry_name = null;    
    protected $_method        = null;
    
    public function __construct( Ai1ec_Object_Registry $registry, $path, $method ) {
        $this->_registry      = $registry;
        $this->_registry_name = $path;
        $this->_method        = $method;
    }

    public function execute( array $argv ) {
        return $this->_registry->dispatch( $this->_registry_name, $this->_method, $argv );
    }
}
