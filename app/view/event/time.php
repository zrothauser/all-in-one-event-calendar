<?php

/**
 * This class renders the html for the event time.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Event_Time extends Ai1ec_Base {
	
	/**
	 * @var Ai1ec_Time_Utility
	 */
	protected $_time_helper;
	
	/**
	 * Public constructor
	 * 
	 * @param Ai1ec_Registry_Object $registry
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$this->_time_helper = $this->_registry->get( 'date.time-helper' );
	}

	/**
	 * Returns timespan expression for the event. Properly handles:
	 * 	- instantaneous events
	 * 	- all-day events
	 * 	- multi-day events
	 * Display of start date can be hidden (non-all-day events only) or full date.
	 * All-day status, if any, is enclosed in a span.ai1ec-allday-badge element.
	 *
	 * @param  string $start_date_display Can be one of 'hidden', 'short', or 'long'.
	 *
	 * @return string
	 */
	public function get_timespan_html( Ai1ec_Event $event, $start_date_display = 'long' ) {
		// Makes no sense to hide start date for all-day events, so fix argument
		if ( 'hidden' === $start_date_display && $event->is_allday() ) {
			$start_date_display = 'short';
		}
	
		// Localize time.
		$start      = $event->get( 'start' )->format();
		$end        = $event->get( 'end' )->format();
	
		// All-day events need to have their end time shifted by 1 second less
		// to land on the correct day.
		$end_offset = 0;
		if ( $event->is_allday() ) {
			$end_offset = -1;
			$end += $end_offset;
		}
	
		// Get components of localized time to calculate start & end dates.
		$bits_start = $this->_time_helper->gmgetdate( $start );
		$bits_end   = $this->_time_helper->gmgetdate( $end );
	
		// Get timestamps of start & end dates without time component.
		$date_start = gmmktime( 0, 0, 0,
			$bits_start['mon'], $bits_start['mday'], $bits_start['year']
		);
		$date_end   = gmmktime( 0, 0, 0,
			$bits_end['mon'], $bits_end['mday'], $bits_end['year']
		);
	
		$output = '';
	
		// Display start date, depending on $start_date_display.
		switch ( $start_date_display ) {
			case 'hidden':
				break;
			case 'short':
			case 'long':
				$property = $start_date_display . '_date';
				$output .= $this->{'get_' . $property}( $start );
				break;
			default:
				$start_date_display = 'long';
		}
	
		// Output start time for non-all-day events.
		if ( ! $event->is_allday() ) {
			if ( 'hidden' !== $start_date_display ) {
				$output .= apply_filters(
					'ai1ec_get_timespan_html_time_separator',
					_x( ' @ ', 'Event time separator', AI1EC_PLUGIN_NAME )
				);
			}
			$output .= $this->get_short_time( $start );
		}
	
		$instant = $event->is_instant();
	
		// Find out if we need to output the end time/date. Do not output it for
		// instantaneous events and all-day events lasting only one day.
		if (
		! (
			$instant ||
			( $event->is_allday() && $date_start === $date_end )
		)
		) {
			$output .= apply_filters(
				'ai1ec_get_timespan_html_date_separator',
				_x( ' – ', 'Event start/end separator', AI1EC_PLUGIN_NAME )
			);
	
			// If event ends on a different day, output end date.
			if ( $date_start !== $date_end ) {
				// for short date, use short display type
				if ( 'short' === $start_date_display ) {
					$output .= $this->get_short_date( $start );
				} else {
					$output .= $this->get_long_date( $end_offset );
				}
			}
	
			// Output end time for non-all-day events.
			if ( ! $event->is_allday() ) {
				if ( $date_start !== $date_end ) {
					$output .= apply_filters(
						'ai1ec_get_timespan_html_time_separator',
						_x( ' @ ', 'Event time separator', AI1EC_PLUGIN_NAME )
					);
				}
				$output .= $this->get_short_date( $end );
			}
		}
	
		$output = esc_html( $output );
	
		// Add all-day label.
		if ( $event->is_allday() ) {
			$output .= apply_filters(
				'ai1ec_get_timespan_html_allday_badge',
				' <span class="ai1ec-allday-badge">' .
				__( 'all-day', AI1EC_PLUGIN_NAME ) .
				'</span>'
			);
		}
		return apply_filters( 'ai1ec_get_timespan_html', $output, $this );
	}
	
	/**
	 * Get the short date
	 * 
	 * @param int $timestamp
	 * 
	 * @return string
	 */
	public function get_short_date( $timestamp ) {
		return $this->_time_helper->date_i18n( 'M j', $timestamp , true );
	}

	/**
	 * Format a long-length date for use in other views (e.g., single event);
	 * this is also converted to the local timezone if desired.
	 *
	 * @param int $timestamp
	 * @param bool $convert_from_gmt Whether to convert from GMT time to local
	 *
	 * @return string
	 */
	public function get_long_date( $timestamp ) {
		$date_format = $this->_registry->get( 'model.option' )->get( 'date_format', 'l, M j, Y' );
		return $this->_time_helper->date_i18n( $date_format, $timestamp, true );
	}

	/**
	 * get_short_time function
	 *
	 * Format a short-form time for use in compressed (e.g. month) views;
	 * this is also converted to the local timezone.
	 *
	 * @param int  $timestamp
	 * @param bool $convert_from_gmt Whether to convert from GMT time to local
	 *
	 * @return string
	 **/
	public function get_short_time( $timestamp ) {
		$time_format = $this->_registry->get( 'model.option' )->get( 'time_format', 'g:i a' );
		return $this->_time_helper->date_i18n( $time_format, $timestamp, true );
	}
	
}