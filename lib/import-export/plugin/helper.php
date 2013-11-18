<?php
/**
 * Ai1ec_Importer_Plugin_Helper class
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Import-export.Plugin
 */
class Ai1ec_Importer_Plugin_Helper {

	/**
	 * Holds the instances of the plugins
	 *
	 * @var array
	 **/
	private  $_plugins = array();

	/**
	 * Constructor
	 *
	 * Default constructor
	 **/
	private function __construct() {}

	/**
	 * add plugin to the internal Array. This assure us that the plugins extends our base abstract class.
	 *
	 * @param Ai1ec_Connector_Plugin $plugin
	 */
	public function add_plugin( Ai1ec_Connector_Plugin $plugin ) {
		$plugin->initialize_settings_if_not_set();
		$this->_plugins[] = $plugin;
	}

	/**
	 *  For each registered plugin, calle the function that save plugin settings.
	 *
	 * @param array $data
	 *   The data that comes from the POST
	 */
	public function save_plugins_settings( array $data ) {
		do_action( 'ai1ec_save_plugins_settings_before' );
		// Iterate over the plugins and call the methods
		foreach ( $this->_plugins as $plugin ) {
			$plugin->save_plugin_settings( $data );
		}
		do_action( 'ai1ec_save_plugins_settings_after' );
	}

	/**
	 * Get an instance of a plugin class
	 *
	 * @param string $class
	 * @throws Exception
	 * @return Ai1ec_Connector_Plugin
	 */
	public function get_plugin_instance( $class ) {
		foreach ( $this->_plugins as $plugin ) {
			if( get_class( $plugin ) === $class ) {
				return $plugin;
			}
		}
		throw new Exception( "Class not found" );

	}

	/**
	 * Check if we have a valid Facebook access token
	 *
	 * @return boolean
	 */
	public function check_if_we_have_a_valid_facebook_access_token() {
		foreach ( $this->_plugins as $plugin ) {
			if( $plugin instanceof Ai1ecFacebookConnectorPlugin ) {
				return $plugin->check_if_we_have_a_valid_access_token();
			}
		}
		return FALSE;
	}

	/**
	 * Get messages to display on the settings page after an update.
	 *
	 */
	public function are_there_any_errors_to_show_on_calendar_settings_page() {
		$required = array();
		$method = "are_there_any_errors_to_show_on_calendar_settings_page";
		foreach ( $this->_plugins as $plugin ) {
			if( method_exists( $plugin, $method ) && $plugin->$method() !== FALSE ) {
				$required[] = $plugin->$method();
			}
		}
		return $required;
	}

	/**
	 * Give the plugins the possibility to handle data posted in the calendar feeds page
	 *
	 * @return void
	 */
	public function handle_feeds_page_post() {
		// Iterate over the plugins and call the methods
		foreach ( $this->_plugins as $plugin ) {
			$plugin->handle_feeds_page_post();
		}
	}

	/**
	 * For each registered plugin, calle the function that renders the html for the settings form.
	 *
	 * @return void
	 */
	public function plugins_settings_meta_box( $object, $box ) {
		do_action( 'ai1ec_plugins_settings_before' );
		// Iterate over the plugins and call the methods
		foreach ( $this->_plugins as $plugin ) {
			$plugin->plugin_settings_meta_box( $object, $box );
		}
		do_action( 'ai1ec_plugins_settings_after' );
	}

	/**
	 * Ask the plugin if we need to draw the settings meta box
	 *
	 */
	public function is_settings_meta_box_required() {
		$required = FALSE;
		$method = "is_settings_meta_box_required";
		foreach ( $this->_plugins as $plugin ) {
			if( method_exists( $plugin, $method ) && $plugin->$method() === TRUE ) {
				return TRUE;
			}
		}
		return FALSE;
	}

	/**
	 * Let the plugin handle various post events like save or delete
	 *
	 * @param Ai1ec_Event $event
	 * @param string $post_event
	 */
	public function handle_post_event( Ai1ec_Event &$event, $post_event ) {
		$method = "handle_{$post_event}_event";
		// Iterate over the plugins and check if it has a method
		foreach ( $this->_plugins as $plugin ) {
			if( method_exists( $plugin, $method ) ) {
				// Call the method if exists
				$plugin->$method( $event );
			}
		}
	}

	/**
	 * Set the correct order of the plugins..
	 *
	 * @return void
	 */
	public function sort_plugins() {
		$sorted = array();
		foreach ( $this->_plugins as $plugin ) {
			if( $plugin instanceof Ai1ecIcsConnectorPlugin ) {
				// make the array behave like a queue just for this plugin
				array_unshift( $sorted, $plugin );
			} else {
				$sorted[] = $plugin;
			}
		}
		$this->_plugins = $sorted;
	}

	/**
	 * Render the tab header for each plugin
	 */
	public function render_tab_headers() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->render_tab_header();
		}
	}

	/**
	 * Render the tab body for each plugin
	 */
	public function render_tab_contents() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->render_tab_content();
		}
	}
	/**
	 * Let the plugins display notices in the admin screen.
	 */
	public function display_admin_notices() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->display_admin_notices();
		}
	}
	/**
	 * Let the plugins run their uninstall procedures
	 *
	 */
	function run_uninstall_procedures() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->run_uninstall_procedures();
		}
	}
}
