<?php

/** 
 * Handles all add_action() add_filter() functions.
 * 
 */
class Ai1ec_Dispatcher_Controller {
	
	protected $_registry;

	/**
	 * @var Ai1ec_Extension_Helper
	 */
	protected $_extension_helper;

	private $_core_actions = array (
		'save_post' => array (
			array ( 
				'class'  => 'Events_Controller',
				'method' => 'save_post'
			),
			array (
				'class'  => 'Events_List_Helper',
				'method' => 'handle_post_save_purge'
			)
		)
	);
	
	private $_extended_actions_or_filters = array();
	/**
	 * This is an array which holds the actions and filters to register.
	 * The array keys are the name of the filters/actions to register,
	 * the values contains the info on the methods to run when the action/filter is called
	 * 
	 * @var array
	 */
	static private $_actions_and_filters = array();

	private function construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry         = $registry;
		$this->_extension_helper = $registry->get( 'Extension_Helper' );
	}
	
	static public function init( Ai1ec_Object_Registry $registry ) {
		$dispatcher = new Ai1ec_Dispatcher_Controller( $registry );
		// add all the actions and filters when plugin are loaded to allow extensions to inject their own actions.
		$this->_extension_helper->add_action( 
			'plugins_loaded',
			$this->register_extension_actions_and_filters()
		);
		$this->add_core_actions_and_filters();
	}

	public function register_extension_actions_and_filters() {
		$this->_core_actions = $this->_extension_helper->apply_filters( 'ai1ec_add_filters_actions' , $this->_core_actions );
		foreach ( $this->_core_actions as $action ) {
			if( isset( $action['from_plugin'] ) ) {
				$this->_extension_helper->add_action( $action, array( $this, 'handle_action_or_filter') );
			}
			
		}
	}
	
	private function add_core_actions_and_filters() {
		// we should get this data froma config file, for now i assume an array.
		foreach ( $this->_core_actions as $action ) {
			$this->_extension_helper->add_action( $action, array( $this, 'handle_action_or_filter') );
		}
	}
	
	public function handle_action_or_filter() {
		$action = current_filter();
		// execute all the actions registered for the filter
		foreach ( $this->_core_actions as $handler ) {
			$this->_registry->dispatch( $handler['class'], $handler['method'], func_get_args() );
		}
	}
}