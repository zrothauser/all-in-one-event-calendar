<?php

/**
 * Controller class for events.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Events_Controller extends Ai1ec_Base {

	/**
	 * Constructor
	 *
	 * @param Ai1ec_Registry_Object $registry
	 *
	 **/
	public function __construct( Ai1ec_Registry_Object $registry ) {

		parent::__construct( $registry );

		if ( basename( $_SERVER['SCRIPT_NAME'] ) == 'post.php' ||
			basename( $_SERVER['SCRIPT_NAME'] ) == 'post-new.php'
		) {
			add_action( 'admin_action_editpost', array( $this, 'admin_init_post' ) );
		}
	}

	/**
	 * admin_init_post method
	 *
	 * Bind to admin_action_editpost action to override default save
	 * method when user is editing single instance.
	 * New post is created with some fields unset.
	 */
	public function admin_init_post( ) {
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$creating_event      = $this->_registry->get( 'event.creating' );
		if (
			isset( $_POST['ai1ec_instance_id'] ) &&
			isset( $_POST['action'] ) &&
			'editpost' === $_POST['action']
		) {
			$old_post_id = $_POST['post_ID'];
			$instance_id = $_POST['ai1ec_instance_id'];
			$post_id = $creating_event->_create_duplicate_post( );
			if ( false !== $post_id ) {
				$created_event = $this->_registry->get( 'model.event', $post_id );
				$ai1ec_events_helper->add_exception_date(
					$old_post_id,
					$created_event->getStart()
				);
				$ai1ec_events_helper->delete_event_instance_cache(
					$old_post_id,
					$instance_id
				);
				$location = add_query_arg(
					'message',
					1,
					get_edit_post_link( $post_id, 'url' )
				);
				wp_redirect( apply_filters(
					'redirect_post_location',
					$location,
					$post_id
				) );
				Ai1ec_Http_Response_Helper::stop();
			}
		}
	}

}