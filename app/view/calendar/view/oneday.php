<?php

/**
 * The concrete class for day view.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
class Ai1ec_Calendar_View_Oneday  extends Ai1ec_Calendar_View_Abstract {
	
	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_name()
	 */
	public function get_name() {
		return 'oneday';
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_extra_arguments()
	 */
	public function get_extra_arguments( array $view_args, $exact_date ) {
		$offset = $this->get_name() . '_offset';
		$view_args[$offset] = $this->_request->get( $offset );
		if( false !== $exact_date ) {
			$view_args['exact_date'] = $exact_date;
		}
		return $view_args;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_description()
	 */
	public function get_description() {
		return 'Day View';
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_content()
	 */
	public function get_content( array $view_args ) {
		$time_helper = $this->_registry->get( 'date.time-helper' );
		$settings = $this->_registry->get( 'model.settings' );
		$defaults = array(
			'oneday_offset' => 0,
			'cat_ids'       => array(),
			'tag_ids'       => array(),
			'auth_ids'      => array(),
			'post_ids'      => array(),
			'exact_date'    => $time_helper->current_time(),
		);
		$args = wp_parse_args( $view_args, $defaults );

		// Localize requested date and get components.
		$local_date = $time_helper->gmt_to_local( $args['exact_date'] );
		$bits = $time_helper->gmgetdate( $local_date );
		// Apply day offset.
		$day_shift = 0 + $args['oneday_offset'];
		// Now align date to start of day (midnight).
		$local_date = gmmktime(
			0, 0, 0,
			$bits['mon'], $bits['mday'] + $day_shift, $bits['year']
		);
		
		$cell_array = $this->get_oneday_cell_array(
			$local_date,
			array(
				'cat_ids'  => $args['cat_ids'],
				'tag_ids'  => $args['tag_ids'],
				'post_ids' => $args['post_ids'],
				'auth_ids' => $args['auth_ids'],
			)
		);
		// Create pagination links.
		$pagination_links = $this->get_oneday_pagination_links( $args );
		$loader = $this->_registry->get( 'theme.loader' );
		$pagination_links = $loader->get_file(
			'pagination.twig',
			array( 'pagination_links' => $pagination_links, 'data_type' => $args['data_type'] ),
			false
		)->get_content();

		$option = $this->_registry->get( 'model.option' );
		$date_format = $option->get( 'date_format', 'l, M j, Y' );
		$title = $time_helper->date_i18n(
			$date_format, $local_date, true
		);
		$time_format = $option->get( 'time_format', 'g a' );

		// Calculate today marker's position.
		$now = $time_helper->current_time();
		$now = $time_helper->gmt_to_local( $now );
		$now_text = $time_helper->get_short_time( $now, false );
		$now = $time_helper->gmgetdate( $now );
		$now = $now['hours'] * 60 + $now['minutes'];
		
		$is_ticket_button_enabled = false;
		$show_reveal_button = false;


		$view_args = array(
			'title'                    => $title,
			'type'                     => 'oneday',
			'cell_array'               => $cell_array,
			'show_location_in_title'   => $settings->get( 'show_location_in_title' ),
			'now_top'                  => $now,
			'now_text'                 => $now_text,
			'pagination_links'         => $pagination_links,
			'data_type'                => $args['data_type'],
			'data_type_events'         => '',
			'is_ticket_button_enabled' => $is_ticket_button_enabled,
			'show_reveal_button'       => $show_reveal_button,
		);

		// Add navigation if requested.
		$navigation = '';
		$view_args['pagination_links'] = $pagination_links;
		if ( true !== $args['no_navigation'] ) {
			$navigation = $loader->get_file( 
				'navigation.twig',
				$view_args,
				false
			)->get_content();
		} 
		$view_args['navigation'] = $navigation;
		$file = $loader->get_file( 'oneday.twig', $view_args, false );

		return apply_filters(
			'ai1ec_get_oneday_view',
			$file->get_content(),
			$view_args
		);
	}

	/**
	 * Returns a non-associative array of four links for the day view of the
	 * calendar:
	 *    previous day, and next day.
	 * Each element is an associative array containing the link's enabled status
	 * ['enabled'], CSS class ['class'], text ['text'] and value to assign to
	 * link's href ['href'].
	 *
	 * @param array $args	Current request arguments
	 *
	 * @return array      Array of links
	 */
	function get_oneday_pagination_links( $args ) {
		$time_helper = $this->_registry->get( 'date.time-helper' );
		$links = array();
	
		$orig_date = $args['exact_date'];
		$local_date = $time_helper->gmt_to_local( $args['exact_date'] );
		$bits = $time_helper->gmgetdate( $local_date );
	
		// ================
		// = Previous day =
		// ================
		$local_date = gmmktime(
			0, 0, 0,
			$bits['mon'], $bits['mday'] + $args['oneday_offset'] - 1, $bits['year']
		);
		$args['exact_date'] = $time_helper->local_to_gmt( $local_date );
		$href = $this->_registry->get( 'html.element.href', $args );
		$links[] = array(
			'enabled' => true,
			'class'=> 'ai1ec-prev-day',
			'text' => '<i class="icon-chevron-left"></i>',
			'href' => $href->generate_href(),
		);
	
		// ======================
		// = Minical datepicker =
		// ======================
		$args['exact_date'] = $orig_date;
		$factory = $this->_registry->get( 'factory.html' );
		$links[] = $factory->create_datepicker_link(
			$args,
			$args['exact_date']
		);
	
		// =============
		// = Next week =
		// =============
		$local_date = gmmktime(
			0, 0, 0,
			$bits['mon'], $bits['mday'] + $args['oneday_offset'] + 1, $bits['year']
		);
		$args['exact_date'] = $time_helper->local_to_gmt( $local_date );
		$href = $this->_registry->get( 'html.element.href', $args );
		$links[] = array(
			'enabled' => true,
			'class'=> 'ai1ec-next-day',
			'text' => '<i class="icon-chevron-right"></i>',
			'href' => $href->generate_href(),
		);
	
		return $links;
	}

	/**
	 * get_oneday_cell_array function
	 *
	 * Return an associative array of weekdays, indexed by the day's date,
	 * starting the day given by $timestamp, each element an associative array
	 * containing three elements:
	 *   ['today']     => whether the day is today
	 *   ['allday']    => non-associative ordered array of events that are all-day
	 *   ['notallday'] => non-associative ordered array of non-all-day events to
	 *                    display for that day, each element another associative
	 *                    array like so:
	 *     ['top']       => how many minutes offset from the start of the day
	 *     ['height']    => how many minutes this event spans
	 *     ['indent']    => how much to indent this event to accommodate multiple
	 *                      events occurring at the same time (0, 1, 2, etc., to
	 *                      be multiplied by whatever desired px/em amount)
	 *     ['event']     => event data object
	 *
	 * @param int $timestamp    the UNIX timestamp of the first day of the week
	 * @param array $filter     Array of filters for the events returned:
	 *                          ['cat_ids']   => non-associatative array of category IDs
	 *                          ['tag_ids']   => non-associatative array of tag IDs
	 *                          ['post_ids']  => non-associatative array of post IDs
	 *                          ['auth_ids']  => non-associatative array of author IDs
	 *
	 * @return array            array of arrays as per function description
	 */
	function get_oneday_cell_array( $timestamp, $filter = array(), $legacy = false ) {
		$time_helper = $this->_registry->get( 'date.time-helper' );
		$search = $this->_registry->get( 'model.search' );

	
		// Decompose given date and current time into components, used below
		$bits = $time_helper->gmgetdate( $timestamp );
		$now  = $time_helper->gmgetdate(
			$time_helper->gmt_to_local(
				$time_helper->current_time()
			)
		);
		$start = $this->_registry->get( 'date.time', $timestamp );
		$end = $this->_registry->get( 
			'date.time', 
			gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'] + 1, $bits['year'] )
		);
		$day_events = $search->get_events_between( 
			$start, 
			$end, 
			$filter
		);
		// Split up events on a per-day basis
		$all_events = array();
	
		foreach ( $day_events as $evt ) {
			$evt_start = $evt->get( 'start' )->format();
			$evt_end   = $evt->get( 'end' )->format();
			
	
			// generate new event object
			// based on this one day
			$timezone = $this->_registry->get( 'date.timezone' )
				->get_default_timezone();
			$day_start = $this->_registry->get( 
				'date.time',
				gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'], $bits['year'] ),
				$timezone
			);
			$day_end = $this->_registry->get( 
				'date.time',
				gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'] + 1, $bits['year'] ),
				$timezone
			);
			$day_start_ts = $day_start->format();
			$day_end_ts = $day_end->format();
			
	
			// If event falls on this day, make a copy.
			if ( $evt_end > $day_start_ts && $evt_start < $day_end_ts ) {
				$_evt = clone $evt;
				if ( $evt_start < $day_start ) {
					// If event starts before this day, adjust copy's start time
					$_evt->set( 'start', $day_start->format_to_gmt() );
					$_evt->set( 'start_truncated', true );
				}
				if ( $evt_end > $day_end ) {
					// If event ends after this day, adjust copy's end time
					$_evt->set( 'end', $day_end->format_to_gmt() );
					$_evt->set( 'end_truncated', true );
				}
	
				// Store reference to original, unmodified event, required by view.
				$_evt->set( '_orig', $evt );
				$evt = $this->_add_runtime_properties( $evt );
				// Place copy of event in appropriate category
				if ( $_evt->is_allday() ) {
					$all_events[$day_start_ts]['allday'][] = $_evt;
				} else {
					$all_events[$day_start_ts]['notallday'][] = $_evt;
				}
			}
			
		}
	
		// This will store the returned array
		$days = array();
		$day = $bits['mday'];
	
		$day_date = gmmktime( 0, 0, 0, $bits['mon'], $day, $bits['year'] );
		// Re-fetch date bits, since $bits['mday'] + 1 might be in the next month
		$day_bits = $time_helper->gmgetdate( $day_date );
	
		// Initialize empty arrays for this day if no events to minimize warnings
		if ( ! isset( $all_events[$day_date]['allday'] ) ) $all_events[$day_date]['allday'] = array();
		if ( ! isset( $all_events[$day_date]['notallday'] ) ) $all_events[$day_date]['notallday'] = array();
	
		$notallday = array();
		$evt_stack = array( 0 ); // Stack to keep track of indentation
		foreach ( $all_events[$day_date]['notallday'] as $evt ) {
			$start_bits = $time_helper->gmgetdate( $evt->get( 'start' )->format() );
	
			// Calculate top and bottom edges of current event
			$top = $start_bits['hours'] * 60 + $start_bits['minutes'];
			$bottom = min( $top + $evt->get_duration() / 60, 1440 );
	
			// While there's more than one event in the stack and this event's top
			// position is beyond the last event's bottom, pop the stack
			while ( count( $evt_stack ) > 1 && $top >= end( $evt_stack ) ) {
				array_pop( $evt_stack );
			}
			// Indentation is number of stacked events minus 1
			$indent = count( $evt_stack ) - 1;
			// Push this event onto the top of the stack
			array_push( $evt_stack, $bottom );
	
			$notallday[] = array(
				'top'    => $top,
				'height' => $bottom - $top,
				'indent' => $indent,
				'event'  => $evt,
			);
		}
	
		$days[$day_date] = array(
			'today'     =>
			$day_bits['year'] == $now['year'] &&
			$day_bits['mon']  == $now['mon'] &&
			$day_bits['mday'] == $now['mday'],
			'allday'    => $all_events[$day_date]['allday'],
			'notallday' => $notallday,
		);
	
		return apply_filters( 'ai1ec_get_oneday_cell_array', $days, $timestamp, $filter );
	}
	
	protected function _add_runtime_properties( Ai1ec_Event $event ) {
		$event->set_runtime( 
			'instance_permalink',
			get_permalink( $event->get( 'post_id' ) . $event->get( 'instance_id' ) ) 
		);
		$event->set_runtime( 'multiday', $event->get( '_orig' )->is_multiday() );
		$taxonomy = $this->_registry->get( 'view.event.taxonomy' );
		$ticket = $this->_registry->get( 'view.event.ticket' );
		$event->set_runtime( 'color_style', $taxonomy->get_color_style( $event ) );
		$event->set_runtime( 'filtered_title', apply_filters( 'the_title', $event->get( 'post' )->post_title, $event->get( 'post_id' ) ) );
		$event->set_runtime( 'category_colors', $taxonomy->get_category_colors( $event ) );
		$event->set_runtime( 'ticket_url_label', $ticket->get_tickets_url_label( $event, false ) );
		$event->set_runtime( 'edit_post_link', get_edit_post_link( $event->get( 'post_id' ) ) );
		$post = $this->_registry->get( 'view.event.post' );
		$event->set_runtime( 'post_excerpt', $post->trim_excerpt( $event ) );
		$color = $this->_registry->get( 'view.event.color' );
		$event->set_runtime( 'faded_color', $color->get_faded_color( $event ) );
		$event->set_runtime( 'rgba_color', $color->get_rgba_color( $event ) );
		$time = $this->_registry->get( 'view.event.time' );
		$event->set_runtime( 
			'short_start_time',
			$time->get_short_time( 
				$event->get( 'start' )->format()
			) 
		);
		return $event;
	} 
}