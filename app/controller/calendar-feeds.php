<?php
class Ai1ec_Controller_Calendar_Feeds extends Ai1ec_Base {

	/**
	 * Holds the instances of the plugins
	 *
	 * @var array
	 **/
	protected $_plugins = array();

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
	 * Render the tab header for each plugin
	 *
	 * @param $active_feed
	 *   The tab that should be visualized
	 */
	public function render_tab_headers() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->render_tab_header();
		}
	}
	/**
	 * Render the tab body for each plugin
	 *
	 * @param $active_feed
	 *   The tab that should be visualized
	 */
	public function render_tab_contents() {
		foreach ( $this->_plugins as $plugin ) {
			$plugin->render_tab_content();
		}
	}
}