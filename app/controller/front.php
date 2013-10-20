<?php
class Ai1ec_Front_Controller {

	/**
	 * @var string
	 */
	static private $_constant_folder;

	/**
	 * @var Ai1ec_Object_Registry 
	 */
	static private $_registry;
	private function __construct() {
		
	}

	/**
	 * Static method to initialize the controller.
	 * 
	 * @param string $constant_folder
	 */
	static public function run( $constant_folder ) {
		self::$_constant_folder = $constant_folder;
		$instance = new Ai1ec_Front_Controller();
		$instance->init();
	}

	/**
	 * Initialize the various parts of the app
	 * 
	 */
	public function init() {
		// load the constants
		$this->load_constants();
		// initialize the autoloader
		$this->set_autoloader();
		// Initialize the registry object
		$this->initialize_registry();
		// Initialize the Factories and add them to the registry
		$this->initialize_factories();
	}

	public function initialize_registry() {
		self::$_registry = new Ai1ec_Object_Registry();
		// this method should somehow get a list of the classes and add them using self::$_registry->register();
		// we must discuss this and what's the best approach. A configuration file?Extending the loader method?
		// we could add some custom docBlock like @factory and @global to each class dockblock to extract the info.
		$known_classes = $this->get_known_classes();
		foreach ( $known_classes as $class_name => $options ) {
			self::$_registry->register( $class_name, $options );
		}
	}
	
	public function initialize_factories() {
		// create the factories and add them to the registry.
	}
	private function load_constants() {
		/**
		 * Include configuration files and define constants
		 */
		foreach ( array( 'constants-local.php', 'constants.php' ) as $file ) {
			if ( file_exists( self::$_constant_folder . $file ) ) {
				require_once self::$_constant_folder . $file;
			}
		}
		if ( ! function_exists( 'ai1ec_initiate_constants' ) ) {
			trigger_error(
					'File \'constants.php\' defining \'ai1ec_initiate_constants\' function must be present.',
					E_USER_WARNING
			);
		}
		ai1ec_initiate_constants();
		
	}
	private function set_autoloader() {
		require_once AI1EC_LIB_PATH . DIRECTORY_SEPARATOR . 'class-ai1ec-loader.php' ;
		@ini_set( 'unserialize_callback_func', 'spl_autoload_call' );
		spl_autoload_register( 'Ai1ec_Loader::autoload' );
	}
}