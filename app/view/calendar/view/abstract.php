<?php

/**
 * The abstract class for a view.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
abstract class Ai1ec_Calendar_View_Abstract extends Ai1ec_Base {
	
	/**
	 * @var Ai1ec_Request_Parser The request object
	 */
	protected $_request;
	
	/**
	 * Public constructor
	 * 
	 * @param Ai1ec_Registry_Object $registry
	 * @param Ai1ec_Request_Parser $request
	 */
	public function __construct( Ai1ec_Registry_Object $registry, Ai1ec_Request_Parser $request ) {
		parent::__construct( $registry );
		$this->_request = $request;
	}

	/**
	 * Get the machine name for the view
	 * 
	 * @return string The machine name of the view.
	 */
	abstract public function get_name();
	
	/**
	 * Get extra arguments specific for the view
	 * 
	 * @param array $view_args
	 * @param int|bool $exact_date the exact date used to display the view.
	 * 
	 * @return array The view arguments with the extra parameters added.\
	 */
	abstract public function get_extra_arguments( array $view_args, $exact_date );

	
	/**
	 * Render the view and return the content
	 * 
	 * @param array $view_args
	 * 
	 * @return string the html of the view
	 */
	abstract public function get_content( array $view_args );
	
	/**
	 * Adds runtime properties to the event.
	 * 
	 * @param Ai1ec_Event $event
	 */
	protected function _add_runtime_properties( Ai1ec_Event $event ) {
		$instance_permalink = get_permalink(
			$event->get( 'post_id' )
		);
		$instance_permalink = add_query_arg(
			'instance_id',
			$event->get( 'instance_id' ),
			$instance_permalink
		);
		$event->set_runtime( 'instance_permalink', $instance_permalink );

	
		$event->set_runtime(
			'filtered_title',
			apply_filters( 'the_title', $event->get( 'post' )->post_title, $event->get( 'post_id' ) )
		);
	
		$taxonomy = $this->_registry->get( 'view.event.taxonomy' );
		$ticket   = $this->_registry->get( 'view.event.ticket' );
		$event->set_runtime(
			'color_style',
			$taxonomy->get_color_style( $event )
		);
		$event->set_runtime( 'category_colors', $taxonomy->get_category_colors( $event ) );
		$event->set_runtime( 'ticket_url_label', $ticket->get_tickets_url_label( $event, false ) );
		$event->set_runtime( 'edit_post_link', get_edit_post_link( $event->get( 'post_id' ) ) );
		$post = $this->_registry->get( 'view.event.post' );
		$event->set_runtime( 'post_excerpt', $post->trim_excerpt( $event ) );
		$color = $this->_registry->get( 'view.event.color' );
		$event->set_runtime( 'faded_color', $color->get_faded_color( $event ) );
		$event->set_runtime( 'rgba_color', $color->get_rgba_color( $event ) );
		$event->set_runtime(
			'short_start_time',
			$this->_registry->get( 'view.event.time' )
			->get_short_time( $event->get( 'start' ) )
		);
		$this->_add_view_specific_runtime_properties( $event );
	}
	
	/**
	 * If some views have specific runtime properties they must extend this method
	 * 
	 * @param Ai1ec_Event $event
	 */
	protected function _add_view_specific_runtime_properties( Ai1ec_Event $event ) {
		
	}
}