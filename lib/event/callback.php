<?php

/**
 * Event Callback creation.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 * 
 * @instantiator new
 * @package      AI1EC
 * @subpackage   AI1EC.Event
 */
class Ai1ec_Event_Callback {
    
	/**
	 * @var Ai1ec_Object_Registry The Object registry.
	 */    
    protected $_registry      = null;
    

	/**
	 * @var string The registry method name defined in the class map.
	 */    
    protected $_registry_name = null;    
    
	/**
	 * @var string The method invoked by the current callback.
	 */    
    protected $_method        = null;
    
	/**
	 * Initiate callback objects.
	 *
	 * @param Ai1ec_Object_Registry $registry Registry object.
     * @param string                $path     Registry method name defined in the class map.
     * @param string                $method   Method invoked by the currect callback.
	 *
	 * @return void Constructor does not return.
	 */    
    public function __construct( 
        Ai1ec_Object_Registry $registry, 
        $path, 
        $method 
    ) {
        $this->_registry      = $registry;
        $this->_registry_name = $path;
        $this->_method        = $method;
    }

	/**
	 * Invoke the method added to the current callback.
	 *
	 * @param array $argv Multiple arguments applied to the method.
	 *
	 * @return mixed Value returned by the current method.
	 */    
    public function execute( array $argv ) {
        return $this->_registry->dispatch( 
            $this->_registry_name, 
            $this->_method, 
            $argv 
        );
    }
}
