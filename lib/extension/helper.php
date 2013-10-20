<?php

/** 
 * @author nicola
 * 
 */
class Ai1ec_Extension_Helper {
	
	private $_registry;
	
	public function __construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry = $registry;
	}
	/**
	 * Hooks a function on to a specific action.

	 * @param string $tag The name of the action to which the $function_to_add is hooked.
	 * @param callback $function_to_add The name of the function you wish to be called.
	 * @param int $priority optional. Used to specify the order in which the functions associated with a particular action are executed (default: 10). Lower numbers correspond with earlier execution, and functions with the same priority are executed in the order in which they were added to the action.
	 * @param int $accepted_args optional. The number of arguments the function accept (default 1).
	 */
	public function add_action( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
		return add_action( $tag, $function_to_add, $priority, $accepted_args );
	}
	
	public function add_filter( $tag, $function_to_add, $priority = 10, $accepted_args = 1 ) {
		return add_filter( $tag, $function_to_add, $priority, $accepted_args );
	}
	
	public function apply_filters( $tag, $value ) {
		return $this->_registry->dispatch( '', 'apply_filters', func_get_arg( 2 ) );
	}
}

?>