<?php
class Ai1ec_Calendar_View_Oneday  extends Ai1ec_Calendar_View_Abstract {
	
	public function get_name() {
		return 'oneday';
	}
	
	public function get_extra_arguments( array $view_args, $exact_date ) {
		$offset = $this->get_name() . '_offset';
		$view_args[$offset] = $this->_request->get( $offset );
		if( false !== $exact_date ) {
			$view_args['exact_date'] = $exact_date;
		}
		return $view_args;
	}
	
	public function get_content( array $view_args ) {

		$time_helper = $this->_registry->get( 'date.time-helper' );
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
			'pagination.php',
			array( 'links' => $pagination_links, 'data_type' => $args['data_type'] ),
			false
		);
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
			'show_location_in_title'   => $ai1ec_settings->show_location_in_title,
			'now_top'                  => $now,
			'now_text'                 => $now_text,
			'pagination_links'         => $pagination_links,
			'post_ids'                 => join( ',', $args['post_ids'] ),
			'time_format'              => $time_format,
			'done_allday_label'        => false,
			'done_grid'                => false,
			'data_type'                => $args['data_type'],
			'data_type_events'         => '',
			'is_ticket_button_enabled' => $is_ticket_button_enabled,
			'show_reveal_button'       => $show_reveal_button,
		);
		if( $ai1ec_settings->ajaxify_events_in_web_widget ) {
			$view_args['data_type_events'] = $args['data_type'];
		}
		// Add navigation if requested.
		$navigation = '';
		if ( true !== $args['no_navigation'] ) {
			$navigation = $loader->get_file( 
				'navigation.php',
				$view_args,
				false
			)->get_content();
		} 
		$view_args['navigation'] = $navigation;
		
		return apply_filters(
			'ai1ec_get_oneday_view',
			$loader->get_file( 'oneday.php', $view_args, false )->get_content(),
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
		$href = Ai1ec_View_Factory::create_href_helper_instance( $args );
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
	function get_oneday_cell_array( $timestamp, $filter = array() ) {
		$time_helper = $this->_registry->get( 'date.time-helper' );
		$search = $this->_registry->get( 'model.search' );

	
		// Decompose given date and current time into components, used below
		$bits = $time_helper->gmgetdate( $timestamp );
		$now  = $time_helper->gmgetdate(
			$time_helper->gmt_to_local(
				$time_helper->current_time()
			)
		);
		$day_events = $search->get_events_between( 
			$timestamp, 
			gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'] + 1, $bits['year'] ), 
			$filter
		);
	
		// Split up events on a per-day basis
		$all_events = array();
	
		foreach ( $day_events as $evt ) {
			$evt_start = $time_helper->gmt_to_local( $evt->start );
			$evt_end   = $time_helper->gmt_to_local( $evt->end );
	
			// generate new event object
			// based on this one day
			$day_start = gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'], $bits['year'] );
			$day_end   = gmmktime( 0, 0, 0, $bits['mon'], $bits['mday']+1, $bits['year'] );
	
			// If event falls on this day, make a copy.
			if ( $evt_end > $day_start && $evt_start < $day_end ) {
				$_evt = clone $evt;
				if ( $evt_start < $day_start ) {
					// If event starts before this day, adjust copy's start time
					$_evt->start = $time_helper->local_to_gmt( $day_start );
					$_evt->start_truncated = true;
				}
				if ( $evt_end > $day_end ) {
					// If event ends after this day, adjust copy's end time
					$_evt->end = $time_helper->local_to_gmt( $day_end );
					$_evt->end_truncated = true;
				}
	
				// Store reference to original, unmodified event, required by view.
				$_evt->_orig = $evt;
	
				// Place copy of event in appropriate category
				if ( $_evt->allday ) {
					$all_events[$day_start]['allday'][] = $_evt;
				} else {
					$all_events[$day_start]['notallday'][] = $_evt;
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
			$start_bits = $time_helper->gmgetdate( $time_helper->gmt_to_local( $evt->start ) );
	
			// Calculate top and bottom edges of current event
			$top = $start_bits['hours'] * 60 + $start_bits['minutes'];
			$bottom = min( $top + $evt->getDuration() / 60, 1440 );
	
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
}