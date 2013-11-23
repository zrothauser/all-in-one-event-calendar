<?php
/**
 * Helper class for the app.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.lib
 */
class Ai1ec_App_Helper {

	/**
	 * @var Ai1ec_Registry_Object The Object registry.
	 */
	private $_registry;

	/**
	 * Constructor
	 *
	 * Default constructor
	 **/
	public function __construct( Ai1ec_Registry_Object $registry ){
		$this->_registry = $registry;
	}

	/**
	 * add_meta_boxes function
	 *
	 * Display event meta box when creating or editing an event.
	 *
	 * @return void
	 **/
	function add_meta_boxes() {

		$ai1ec_events_controller = $this->_registry->get( 'Ai1ec_Events_Controller' );

		add_meta_box(
			AI1EC_POST_TYPE,
			__( 'Event Details', AI1EC_PLUGIN_NAME ),
			array( &$ai1ec_events_controller, 'meta_box_view' ),
			AI1EC_POST_TYPE,
			'normal',
			'high'
		);
	}

}
// END class
