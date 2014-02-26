<?php

/**
 * Basic extension controller.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
abstract class Ai1ec_Extension_Controller extends Ai1ec_Base {

	/**
	 * @var array
	 */
	protected $_settings;

	/**
	 * @var Ai1ec_Registry_Object
	 */
	protected static $_registry_static;

	/**
	 * @var array
	 */
	protected static $_settings_static;

	/**
	 * @var string the name of the option for the on_activation() hook
	 */
	protected $_activated_option;
	
	/**
	 * Get the long name of the extension
	 */
	abstract public function get_name();
	
	/**
	 * Get the machine name of the extension
	 */
	abstract public function get_machine_name();

	/**
	 * Get the version of the extension
	 */
	abstract public function get_version();

	/**
	 * if some extra init is needed
	 */
	abstract public function init();

	/**
	 * Get the name of the main plugin file
	 */
	abstract public function get_file();

	/**
	 * Add extension specific settings
	 */
	abstract protected function _get_settings();

	/**
	 * Register action/filters/shortcodes for the extension
	 * 
	 * @param Ai1ec_Event_Dispatcher $dispatcher
	 */
	abstract protected function _register_actions( Ai1ec_Event_Dispatcher $dispatcher );

	/**
	 * Taken from stack exchange
	 * http://wordpress.stackexchange.com/questions/25910/uninstall-activate-deactivate-a-plugin-typical-features-how-to/25979#25979
	 */
	public static function on_uninstall() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
	
		$settings = self::$_registry_static->get( 'model.settings' );
		foreach ( self::$_settings_static as $name => $params ) {
			$settings->remove_option( $name );
		}
	}

	/**
	 * Initializes the extension.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$this->_activated_option = 'ai1ec_' . $this->get_machine_name() . '_activated';
		// static properties are needed as uninstall hook must be static
		// http://wpseek.com/register_uninstall_hook/
		self::$_registry_static = $registry;
		register_deactivation_hook( $this->get_file(), array( $this, 'on_deactivation' ) );
	
		$settings = $this->_get_settings();
		$this->_settings = $settings;
		self::$_settings_static = $settings;
		// if we are reactivating, show the options
		if ( is_admin() && 
			$registry->get( 'model.option' )->get( $this->_activated_option ) 
		) {
			$this->show_settings();
			$registry->get( 'model.option' )->delete( $this->_activated_option );
		}
		$this->_register_actions( $registry->get( 'event.dispatcher' ) );
		$this->_add_settings( $registry->get( 'model.settings' ) );
	}

	/**
	 * Adds an option to the db to perform activation after the redirect
	 * 
	 */
	public function on_activation() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
		// there is a redirect after this call
		add_option( $this->_activated_option, true );
	}

	/**
	 * Hides settings on deactivation.
	 */
	public function on_deactivation() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
		$plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';
		check_admin_referer( "deactivate-plugin_{$plugin}" );
	
		$settings = $this->_registry->get( 'model.settings' );
		foreach ( $this->_settings as $name => $params ) {
			$settings->hide_option( $name );
		}
	}
	
	/**
	 * Show the settings
	 */
	public function show_settings() {
		$settings = $this->_registry->get( 'model.settings' );
		foreach ( $this->_settings as $name => $params ) {
			$settings->show_option( $name, $params['renderer'] );
		}
	}
	
	/**
	 * Since the call the to the uninstall hook it's static, if a different behaviour
	 * is needed also this call must be overridden.
	 */
	protected function _register_uninstall_hook() {
		register_uninstall_hook( $this->get_file(), array( __CLASS__, 'on_uninstall' ) );
	}

	/**
	 * Adds extension settings
	 *
	 * @param Ai1ec_Settings $settings
	 */
	protected function _add_settings( Ai1ec_Settings $settings ) {
		foreach( $this->_settings as $name => $params ) {
			$renderer = null;
			if ( isset( $params['renderer'] ) ) {
				$renderer = $params['renderer'];
			}
			$settings->register(
				$name,
				$params['value'],
				$params['type'],
				$renderer,
				$this->get_version()
			);
		}
	}
}