<?php

/**
 * Model representing a legacy event.
 *
 * @author       Time.ly Network, Inc.
 * @since        2.0
 * @instantiator new
 * @package      Ai1EC
 * @subpackage   Ai1EC.Model
 */
class Ai1ec_Event_Legacy extends Ai1ec_Event {

	/**
	 * @var array map of method => class for legacy code.
	 */
	protected static $_classes = array(
		'get_category_colors'              => 'taxonomy',
		'get_color_style'                  => 'taxonomy',
		'get_categories_html'              => 'taxonomy',
		'get_tags_html'                    => 'taxonomy',
		'get_faded_color'                  => 'color',
		'get_rgba_color'                   => 'color',
		'get_event_avatar'                 => 'avatar',
		'get_event_avatar_url'             => 'avatar',
		'get_post_thumbnail_url'           => 'avatar',
		'get_content_img_url'              => 'avatar',
		'get_short_location'               => 'location',
		'get_location'                     => 'location',
		'get_map_view'                     => 'location',
		'get_latlng'                       => 'location',
		'get_gmap_url'                     => 'location',
		'get_tickets_url_label'            => 'ticket',
		'get_contact_html'                 => 'ticket',
		'get_timespan_html'                => 'time',
		'get_exclude_html'                 => 'time',
		'get_back_to_calendar_button_html' => 'content',
		'get_post_excerpt'                 => 'content',
	);


	public function get_long_end_date( $adjust = 0 ) {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_long_date( $this->get( 'end' ), $adjust );
	}

	public function get_long_start_date() {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_long_date( $this->get( 'start' ) );
	}

	public function get_multiday() {
		return $this->is_multiday();
	}

	public function get_recurrence_html() {
		$rrule = $this->_registry->get( 'recurrence.rule' );
		return $rrule->rrule_to_text( $this->get( 'recurrence_rules' ) );
	}

	public function get_short_end_date() {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_short_date( $this->get( 'end' ), -1 );
	}

	public function get_short_end_time() {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_short_time( $this->get( 'end' ) );
	}

	public function get_short_start_date() {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_short_date( $this->get( 'start' ) );
	}

	public function get_short_start_time() {
		$time = $this->_registry->get( 'view.event.time' );
		return $time->get_short_time( $this->get( 'start' ) );
	}

	/**
	 * Overload access to former fields to diagnose problems early.
	 *
	 * @TODO: remove this before 2.0/Core-beta.
	 *
	 * @param string $property Name of property being set.
	 * @param mixed  $value    Value attempted to set.
	 *
	 * @return Ai1ec_Event Instance of self for chaining.
	 */
	public function __set( $property, $value ) {
		return $this->set( $property, $value );
	}
	
	/**
	 * Handle property accessors.
	 *
	 * @param string $name Property name
	 *
	 * @return mixed Property value
	 *
	 * @throws E_USER_WARNING Always, because this method is deprecated and will be removed
	 */
	public function __get( $name ) {
		$method = 'get_' . $name;
		if ( method_exists( $this, $name ) ) {
			return $this->{$method}();
		}
		return $this->get( $name );
	}

	/**
	 * Handle legacy methods calls
	 * 
	 * @param string $method
	 * @param array $arguments
	 * @return mixed
	 */
	public function __call( $method, $arguments ) {
		array_unshift( $arguments, $this );
		$class = 'view.event.' . self::$_classes[$method];
		return $this->_registry->dispatch(
			$class,
			$method,
			$arguments
		);
	}
}