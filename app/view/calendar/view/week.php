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
class Ai1ec_Calendar_View_Week  extends Ai1ec_Calendar_View_Abstract {

	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_name()
	*/
	public function get_name() {
		return 'week';
	}
	
	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_content()
	*/
	public function get_content( array $view_args ) {
		$date_system = $this->_registry->get( 'date.system' );
		$settings    = $this->_registry->get( 'model.settings' );
		$defaults    = array(
			'week_offset'   => 0,
			'cat_ids'       => array(),
			'tag_ids'       => array(),
			'auth_ids'      => array(),
			'post_ids'      => array(),
			'exact_date'    => $date_system->current_time(),
		);
		$args = wp_parse_args( $view_args, $defaults );
		
		// Localize requested date and get components.
		$local_date = $this->_registry
			->get( 'date.time', $args['exact_date'], 'sys.default' );
		$start_day_offset = $this->get_week_start_day_offset( $local_date->format( 'w' ) );
		// get the first day of week
		$local_date->adjust_day( 0 + $start_day_offset + ( $args['week_offset'] * 7 ) )
			->set_time( 0, 0, 0 );

		
		$cell_array = $this->get_week_cell_array(
			$local_date,
			array(
				'cat_ids'  => $args['cat_ids'],
				'tag_ids'  => $args['tag_ids'],
				'post_ids' => $args['post_ids'],
				'auth_ids' => $args['auth_ids'],
			)
		);
		
		// Create pagination links.
		$pagination_links =
		$ai1ec_calendar_helper->get_week_pagination_links( $args );
		$pagination_links = $ai1ec_view_helper->get_theme_view(
			'pagination.php',
			array( 'links' => $pagination_links, 'data_type' => $args['data_type'] )
		);
		
		// Translators: "%s" below represents the week's start date.
		$title = sprintf(
			__( 'Week of %s', AI1EC_PLUGIN_NAME ),
			Ai1ec_Time_Utility::date_i18n(
				__( 'F j', AI1EC_PLUGIN_NAME ), $local_date, true
			)
		);
		$time_format = Ai1ec_Meta::get_option(
			'time_format',
			__( 'g a', AI1EC_PLUGIN_NAME )
		);
		
		// Calculate today marker's position.
		$now = Ai1ec_Time_Utility::current_time();
		$now = Ai1ec_Time_Utility::gmt_to_local( $now );
		$now_text = $ai1ec_events_helper->get_short_time( $now, false );
		$now = Ai1ec_Time_Utility::gmgetdate( $now );
		$now = $now['hours'] * 60 + $now['minutes'];
		// Find out if the current week view contains "now" and thus should display
		// the "now" marker.
		$show_now = false;
		foreach ( $cell_array as $day ) {
			if ( $day['today'] ) {
				$show_now = true;
				break;
			}
		}
		
		$is_ticket_button_enabled =
		$ai1ec_calendar_helper->is_buy_ticket_enabled_for_view( 'week' );
		$show_reveal_button =
		$ai1ec_settings->week_view_starts_at > 0 ||
		$ai1ec_settings->week_view_ends_at < 24;
		$view_args = array(
			'title'                    => $title,
			'type'                     => 'week',
			'cell_array'               => $cell_array,
			'show_location_in_title'   => $ai1ec_settings->show_location_in_title,
			'now_top'                  => $now,
			'now_text'                 => $now_text,
			'show_now'                 => $show_now,
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
		$navigation = Ai1ec_Render_Entity_Utility::get_instance( 'Navigation' )
		->set( $view_args )->get_content( $args['no_navigation'] );
		$view_args['navigation'] = $navigation;
		
		return apply_filters(
			'ai1ec_get_week_view',
			$ai1ec_view_helper->get_theme_view( 'week.php', $view_args ),
			$view_args
		);
	}
	
	/**
	 * get_week_cell_array function
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
	 * @param int $start_of_week    the UNIX timestamp of the first day of the week
	 * @param array $filter     Array of filters for the events returned:
	 *                          ['cat_ids']   => non-associatative array of category IDs
	 *                          ['tag_ids']   => non-associatative array of tag IDs
	 *                          ['post_ids']  => non-associatative array of post IDs
	 *                          ['auth_ids']  => non-associatative array of author IDs
	 *
	 * @return array            array of arrays as per function description
	 */
	protected function get_week_cell_array( Ai1ec_Date_Time $start_of_week, $filter = array() ) {
		global $ai1ec_events_helper, $ai1ec_settings;
	
	
		// Do one SQL query to find all events for the week, including spanning
		$week_events = $this->get_events_between(
			$start_of_week,
			gmmktime( 0, 0, 0, $bits['mon'], $bits['mday'] + 7, $bits['year'] ),
			$filter,
			true );
	
		// Split up events on a per-day basis
		$all_events = array();
		foreach ( $week_events as $evt ) {
			$evt_start = $ai1ec_events_helper->gmt_to_local( $evt->start );
			$evt_end = $ai1ec_events_helper->gmt_to_local( $evt->end );
	
			// Iterate through each day of the week and generate new event object
			// based on this one for each day that it spans
			for ( $day = $bits['mday']; $day < $bits['mday'] + 7; $day++ ) {
				$day_start = gmmktime( 0, 0, 0, $bits['mon'], $day, $bits['year'] );
				$day_end = gmmktime( 0, 0, 0, $bits['mon'], $day + 1, $bits['year'] );
	
				// If event falls on this day, make a copy.
				if ( $evt_end > $day_start && $evt_start < $day_end ) {
					$_evt = clone $evt;
					if ( $evt_start < $day_start ) {
						// If event starts before this day, adjust copy's start time
						$_evt->start = $ai1ec_events_helper->local_to_gmt( $day_start );
						$_evt->start_truncated = true;
					}
					if ( $evt_end > $day_end ) {
						// If event ends after this day, adjust copy's end time
						$_evt->end = $ai1ec_events_helper->local_to_gmt( $day_end );
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
		}
	
		// This will store the returned array
		$days = array();
		// =========================================
		// = Iterate through each date of the week =
		// =========================================
		for ( $day = $bits['mday']; $day < $bits['mday'] + 7; $day++ ) {
			$day_date = gmmktime( 0, 0, 0, $bits['mon'], $day, $bits['year'] );
			// Re-fetch date bits, since $bits['mday'] + 7 might be in the next month
			$day_bits = $ai1ec_events_helper->gmgetdate( $day_date );
			$exact_date = Ai1ec_Time_Utility::format_date_for_url(
				$day_date,
				$ai1ec_settings->input_date_format
			);
			$href_for_date = $this->create_link_for_day_view( $exact_date );
	
			// Initialize empty arrays for this day if no events to minimize warnings
			if ( ! isset( $all_events[$day_date]['allday'] ) ) $all_events[$day_date]['allday'] = array();
			if ( ! isset( $all_events[$day_date]['notallday'] ) ) $all_events[$day_date]['notallday'] = array();
	
			$notallday = array();
			$evt_stack = array( 0 ); // Stack to keep track of indentation
			foreach ( $all_events[$day_date]['notallday'] as $evt ) {
				$start_bits = $ai1ec_events_helper->gmgetdate( $ai1ec_events_helper->gmt_to_local( $evt->start ) );
	
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
				'href'      => $href_for_date,
			);
		}
	
		return apply_filters( 'ai1ec_get_week_cell_array', $days, $start_of_week, $filter );
	}

	/**
	 * get_week_start_day_offset function
	 *
	 * Returns the day offset of the first day of the week given a weekday in
	 * question.
	 *
	 * @param int $wday      The weekday to get information about
	 * @return int           A value between -6 and 0 indicating the week start
	 *                       day relative to the given weekday.
	 */
	protected function get_week_start_day_offset( $wday ) {
		$settings = $this->_registry->get( 'model.settings' );
		return - ( 7 - ( $settings->get( 'week_start_day' ) - $wday ) ) % 7;
	}
}