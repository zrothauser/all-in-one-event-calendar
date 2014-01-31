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
class Ai1ec_Calendar_View_Month  extends Ai1ec_Calendar_View_Abstract {

	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_name()
	*/
	public function get_name() {
		return 'month';
	}
	
	/* (non-PHPdoc)
	 * @see Ai1ec_Calendar_View_Abstract::get_content()
	*/
	public function get_content( array $view_args ) {
		$date_system = $this->_registry->get( 'date.system' );
		$settings    = $this->_registry->get( 'model.settings' );
		$defaults = array(
			'month_offset'  => 0,
			'cat_ids'       => array(),
			'auth_ids'      => array(),
			'tag_ids'       => array(),
			'post_ids'      => array(),
			'exact_date'    => Ai1ec_Time_Utility::current_time(),
		);
		$args = wp_parse_args( $args, $defaults );
		$local_date = $this->_registry
			->get( 'date.time', $args['exact_date'], 'sys.default' )
			->adjust_day( 0 + $args['month_offset'] )
			->set_time( 0, 0, 0 );
		
		$days_events = $ai1ec_calendar_helper->get_events_for_month(
			$local_date,
			array(
				'cat_ids'  => $args['cat_ids'],
				'tag_ids'  => $args['tag_ids'],
				'post_ids' => $args['post_ids'],
				'auth_ids' => $args['auth_ids'],
			)
		);
	}
	
	/**
	 * get_events_for_month function
	 *
	 * Return an array of all dates for the given month as an associative
	 * array, with each element's value being another array of event objects
	 * representing the events occuring on that date.
	 *
	 * @param int $time         the UNIX timestamp of a date within the desired month
	 * @param array $filter     Array of filters for the events returned:
	 *                          ['cat_ids']   => non-associatative array of category IDs
	 *                          ['tag_ids']   => non-associatative array of tag IDs
	 *                          ['post_ids']  => non-associatative array of post IDs
	 *                          ['auth_ids']  => non-associatative array of author IDs
	 *
	 * @return array            array of arrays as per function's description
	 */
	function get_events_for_month( Ai1ec_Date_Time $time, $filter = array() ) {
		global $ai1ec_events_helper;
	
		$bits     = $ai1ec_events_helper->gmgetdate( $time );
		$last_day = gmdate( 't', $time );
	
		$day_entry = array(
			'multi'  => array(),
			'allday' => array(),
			'other'  => array(),
		);
		$days_events = array_fill(
			1,
			$last_day,
			$day_entry
		);
		unset( $day_entry );
	
		$start_time = gmmktime(
			0,
			0,
			0,
			$bits['mon'],
			1,
			$bits['year']
		);
		$end_time   = gmmktime(
			0,
			0,
			0,
			$bits['mon'],
			$last_day + 1,
			$bits['year']
		);
	
		$month_events = $this->get_events_between(
			$start_time,
			$end_time,
			$filter,
			true
		);
	
		foreach ( $month_events as $event ) {
			$event_start = $ai1ec_events_helper->gmt_to_local( $event->start );
			$event_end   = $ai1ec_events_helper->gmt_to_local( $event->end );
	
			/**
			 * REASONING: we assume, that event spans multiple periods, one of
			 * which happens to be current (month). Thus we mark, that current
			 * event starts at the very first day of current month and further
			 * we will mark it as having truncated beginning (unless it is not
			 * overlapping period boundaries).
			 * Although, if event starts after the first second of this period
			 * it's start day will be decoded as time 'j' format (`int`-casted
			 * to increase map access time), of it's actual start time.
			*/
			$day = 1;
			if ( $event_start > $start_time ) {
				$day = (int)gmdate( 'j', $event_start );
			}
	
			// Set multiday properties. TODO: Should these be made event object
			// properties? They probably shouldn't be saved to the DB, so I'm
			// not sure. Just creating properties dynamically for now.
			if ( $event_start < $start_time ) {
				$event->start_truncated = true;
			}
			if ( $event_end >= $end_time ) {
				$event->end_truncated = true;
			}
	
			// Categorize event.
			$priority = 'other';
			if ( $event->allday ) {
				$priority = 'allday';
			} elseif ( $event->get_multiday() ) {
				$priority = 'multi';
			}
			$days_events[$day][$priority][] = $event;
		}
	
		for ( $day = 1; $day <= $last_day; $day++ ) {
			$days_events[$day] = array_merge(
				$days_events[$day]['multi'],
				$days_events[$day]['allday'],
				$days_events[$day]['other']
			);
		}
	
		return apply_filters(
			'ai1ec_get_events_for_month',
			$days_events,
			$time,
			$filter
		);
	}
}