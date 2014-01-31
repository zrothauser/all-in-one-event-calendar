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
		$local_date = Ai1ec_Time_Utility::gmt_to_local( $args['exact_date'] );
		$local_date = $this->_registry
			->get( 'date.time', $args['exact_date'], 'sys.default' )
			->adjust_day( 0 + $args['oneday_offset'] )
			->set_time( 0, 0, 0 );
		// Day shift is initially the first day of the week according to settings.
		$day_shift = $this->get_week_start_day_offset( $bits['wday'] );
		// Then apply week offset.
		$day_shift += $args['week_offset'] * 7;
		// Now align date to start of week.
		$local_date = gmmktime(
			0, 0, 0,
			$bits['mon'], $bits['mday'] + $day_shift, $bits['year']
		);
		
		$cell_array = $ai1ec_calendar_helper->get_week_cell_array(
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