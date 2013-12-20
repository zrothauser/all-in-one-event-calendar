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
	 * Returns timespan expression for the event.
	 *
	 * Properly handles:
	 * 	- instantaneous events
	 * 	- all-day events
	 * 	- multi-day events
	 * Display of start date can be hidden (non-all-day events only) or full
	 * date. All-day status, if any, is enclosed in a span.ai1ec-allday-badge
	 * element.
	 *
	 * @param Ai1ec_Event $event              Rendered event.
	 * @param string      $start_date_display Can be one of 'hidden', 'short',
	 *                                        or 'long'.
	 *
	 * @return string Formatted timespan HTML element.
	 */
	public function get_timespan_html(
		Ai1ec_Event $event,
		$start_date_display = 'long'
	) {
		// Makes no sense to hide start date for all-day events, so fix argument
		if ( 'hidden' === $start_date_display && $event->is_allday() ) {
			$start_date_display = 'short';
		}
	
		// Localize time.
		$start      = $this->_registry->get(
			'date.time',
			$event->get( 'start' )
		);
		$end        = $this->_registry->get(
			'date.time',
			$event->get( 'end' )->format()
		);
	
		// All-day events need to have their end time shifted by 1 second less
		// to land on the correct day.
		$end_offset = 0;
		if ( $event->is_allday() ) {
			$end_offset = -1;
			$end->set_time(
				$end->format( 'H' ),
				$end->format( 'i' ),
				$end->format( 's' ) + $end_offset
			);
		}

		// Get timestamps of start & end dates without time component.
		$start->set_time( 0, 0, 0 );
		$end->set_time( 0, 0, 0 );

		$start_ts = $start->format();
		$end_ts   = $end->format();

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
				( $event->is_allday() && $start_ts === $end_ts )
			)
		) {
			$output .= apply_filters(
				'ai1ec_get_timespan_html_date_separator',
				Ai1ec_I18n::_x( ' – ', 'Event start/end separator' )
			);

			// If event ends on a different day, output end date.
			if ( $start_ts !== $end_ts ) {
				// for short date, use short display type
				if ( 'short' === $start_date_display ) {
					$output .= $this->get_short_date( $start );
				} else {
					$output .= $this->get_long_date( $end );
				}
			}

			// Output end time for non-all-day events.
			if ( ! $event->is_allday() ) {
				if ( $start_ts !== $end_ts ) {
					$output .= apply_filters(
						'ai1ec_get_timespan_html_time_separator',
						Ai1ec_I18n::_x( ' @ ', 'Event time separator' )
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
				Ai1ec_I18n::__( 'all-day' ) .
				'</span>'
			);
		}
		return apply_filters( 'ai1ec_get_timespan_html', $output, $this );
	}
	
	/**
	 * Get the short date
	 * 
	 * @param Ai1ec_Date_Time $time
	 * 
	 * @return string
	 */
	public function get_short_date( Ai1ec_Date_Time $time ) {
		return $time->format_i18n( 'M j' );
	}

	/**
	 * Format a long-length date for use in other views (e.g., single event);
	 * this is also converted to the local timezone if desired.
	 *
	 * @param Ai1ec_Date_Time $time
	 *
	 * @return string
	 */
	public function get_long_date( Ai1ec_Date_Time $time ) {
		$date_format = $this->_registry->get( 'model.option' )->get(
			'date_format',
			'l, M j, Y'
		);
		return $time->format_i18n( $date_format );
	}

	/**
	 * get_short_time function
	 *
	 * Format a short-form time for use in compressed (e.g. month) views;
	 * this is also converted to the local timezone.
	 *
	 * @param Ai1ec_Date_Time $time
	 *
	 * @return string
	 */
	public function get_short_time( Ai1ec_Date_Time $time ) {
		$time_format = $this->_registry->get( 'model.option' )->get(
			'time_format',
			'g:i a'
		);
		return $time->format_i18n( $time_format );
	}

}