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

	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );

		$basename = basename( $_SERVER['SCRIPT_NAME'] );
		if (
			( $basename === 'post.php' || $basename === 'post-new.php' ) &&
			isset( $_POST['ai1ec_instance_id'] ) &&
			isset( $_POST['action'] ) &&
			'editpost' === $_POST['action']
		) {
			add_action(
				'admin_action_editpost',
				array( $this, 'admin_init_post' )
			);
		}
	}

	/**
	 * Retrieve events display template.
	 */
	public function get_events() {
		$start  = $this->_registry->get( 'date.time', '-1 month' );
		$end    = $this->_registry->get( 'date.time', '+1 month' );
		$events = $this->_registry->get( 'model.search' )
			->get_events_between( $start, $end );

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-list.twig',
			compact( 'events', 'start', 'end' ),
			false
		);

		return $template->get_content();
	}

	/**
	 * Override default save when creating instance of an event.
	 *
	 * Bind to admin_action_editpost action to override default save
	 * method when user is editing single instance.
	 * New post is created with some fields unset.
	 *
	 * @wp_hook admin_action_editpost
	 *
	 * @return void Output is not processed/used.
	 */
	public function admin_init_post( ) {
		$creating_event      = $this->_registry->get( 'event.creating' );
		$post_id             = $creating_event->create_duplicate_post();
		if ( false === $post_id ) {
			return null;
		}
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$old_post_id         = (int)$_POST['post_ID'];
		$created_event       = $this->_registry->get( 'model.event', $post_id );
		$ai1ec_events_helper->add_exception_date(
			$old_post_id,
			$created_event->getStart()
		);
		$ai1ec_events_helper->delete_event_instance_cache(
			$old_post_id,
			(int)$_POST['ai1ec_instance_id']
		);
		return Ai1ec_Http_Response_Helper::redirect(
			$this->get_edit_target( $post_id )
		);
	}

	/**
	 * Get URL for post-create/edit event admin location.
	 *
	 * @param int $post_id Created/edited post ID.
	 * @param int $message Displayable message number.
	 *
	 * @return string Redirect location.
	 */
	public function get_edit_target( $post_id, $message = 1 ) {
		$location = get_edit_post_link( $post_id, 'url' );
		$location = add_query_arg( 'message', $message, $location );
		$location = apply_filters(
			'redirect_post_location',
			$location,
			$post_id
		);
		return $location;
	}

}