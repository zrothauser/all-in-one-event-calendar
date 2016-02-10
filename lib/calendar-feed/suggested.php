<?php

/**
 * The class which handles suggested feeds tab.
 *
 * @author     Time.ly Network Inc.
 * @since      2.4
 *
 * @package    AI1EC
 * @subpackage AI1EC.Calendar-feed
 */
class Ai1ecSuggestedConnectorPlugin extends Ai1ec_Connector_Plugin {

	/**
	 * @var array
	 *   title: The title of the tab and the title of the configuration section
	 *   id: The id used in the generation of the tab
	 */
	protected $variables = array(
		'id' => 'suggested'
	);

	public function get_tab_title() {
		return Ai1ec_I18n::__( 'Discover Events' );
	}

	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
	}

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::handle_feeds_page_post()
	 */
	public function handle_feeds_page_post() {
	}

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::render_tab_content()
	 */
	public function render_tab_content() {
		// Render the opening div
		$this->render_opening_div_of_tab();
	
		$api           = $this->_registry->get( 'model.api.api-feeds' );
		$events        = $api->get_suggested_events();
		$loader        = $this->_registry->get( 'theme.loader' );
		$event_actions = $loader->get_file(
			'plugins/suggested/event_actions.php',
			array(),
			true
		);
		$feeds_list    = $loader->get_file(
			'plugins/suggested/feeds_list.php',
			array(
				'suggested_feeds' => $events->data,
				'total_events'    => $events->total,
				'last_page'       => $events->last_page,
				'event_actions'   => $event_actions
			),
			true
		);
		$display_feeds = $loader->get_file(
			'plugins/suggested/display_feeds.php',
			array(
				'event_actions'   => $event_actions,
				'feeds_list'      => $feeds_list
			),
			true
		);
		$display_feeds->render();

		// Render the body of the tab
		$this->render_closing_div_of_tab();
	}

	/**
	 * Import suggested event
	 */
	public function import_event( $event_id ) {
		echo 1;
		exit( 0 );
	}

	/**
	 * Remove suggested event
	 */
	public function remove_event( $event_id ) {
		echo 1;
		exit( 0 );
	}

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::display_admin_notices()
	 */
	public function display_admin_notices() {
		return;
	}

	/**
	 * Remove suggested event
	 */
	public function map_updated() {
		$api           = $this->_registry->get( 'model.api.api-feeds' );
		$events        = $api->get_suggested_events();
		$loader        = $this->_registry->get( 'theme.loader' );
		$event_actions = $loader->get_file(
			'plugins/suggested/event_actions.php',
			array(),
			true
		);
		$feeds_list    = $loader->get_file(
			'plugins/suggested/feeds_list.php',
			array(
				'suggested_feeds' => $events->data,
				'total_events'    => $events->total,
				'last_page'       => $events->last_page,
				'event_actions'   => $event_actions
			),
			true
		);
		$feeds_list = array(
			'list' => $feeds_list->get_content()
		);
		echo json_encode( $feeds_list );
		exit( 0 );
	}
	

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::run_uninstall_procedures()
	 */
	public function run_uninstall_procedures() {
	}
}