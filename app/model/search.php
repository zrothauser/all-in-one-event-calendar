<?php
/**
 * Search Event.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.search
 */
class Ai1ec_Event_Search {

	/**
	 * @var Ai1ec_Dbi instance
	 */
	private $_dbi = null;

	/**
	 * @var Ai1ec_Object_Registry instance
	 */
	private $_registry = null;

	/**
	 * get_event function
	 *
	 * Fetches the event object with the given post ID. Uses the WP cache to
	 * make this more efficient if possible.
	 *
	 * @param int $post_id              The ID of the post associated
	 * @param bool|int $instance_id     Instance ID, to fetch post details for
	 *
	 * @return Ai1ec_Event              The associated event object
	 */
	public function get_event( $post_id, $instance_id = false ) {
		$post_id     = (int)$post_id;
		$instance_id = (int)$instance_id;
		if ( $instance_id < 1 ) {
			$instance_id = false;
		}

		return new Ai1ec_Event( $post_id, $instance_id );
	}

	/**
	 * get_events_between function
	 *
	 * Return all events starting after the given start time and before the
	 * given end time that the currently logged in user has permission to view.
	 * If $spanning is true, then also include events that span this
	 * period. All-day events are returned first.
	 *
	 * @param Ai1ec_Time $start     limit to events starting after this
	 * @param Ai1ec_Time $end       limit to events starting before this
	 * @param array $filter         Array of filters for the events returned:
	 *                              ['cat_ids']  => list of category IDs
	 *                              ['tag_ids']  => list of tag IDs
	 *                              ['post_ids'] => list of post IDs
	 *                              ['auth_ids'] => list of author IDs
	 * @param bool $spanning        also include events that span this period
	 *
	 * @return array                list of matching event objects
	 */
	public function get_events_between(
		Ai1ec_Time $start,
		Ai1ec_Time $end,
		array $filter = array(),
		$spanning     = false
	) {

		// Convert timestamps to MySQL format in GMT time
		$start_timestamp = $start->format();
		$end_timestamp   = $end->format();

		// Query arguments
		$args = array( $start_timestamp, $end_timestamp );

		// Get post status Where snippet and associated SQL arguments
		$where_parameters  = $this->_get_post_status_sql();
		$post_status_where = $where_parameters['post_status_where'];
		$args              = array_merge( $args, $where_parameters['args'] );

		// Get the Join (filter_join) and Where (filter_where) statements based
		// on $filter elements specified
		$filter = $this->_get_filter_sql( $filter );

		$ai1ec_localization_helper = $this->_registry->get( 'localization' );

		$wpml_join_particle = $ai1ec_localization_helper
			->get_wpml_table_join( 'p.ID' );

		$wpml_where_particle = $ai1ec_localization_helper
			->get_wpml_table_where();

		if ( $spanning ) {
			$spanning_string = 'i.end > %d AND i.start < %d ';
		} else {
			$spanning_string = 'i.start BETWEEN %d AND %d ';
		}

		$sql = "
			SELECT
				`p`.*,
				`e`.`post_id`,
				`i`.`id` AS `instance_id`,
				`i`.`start` AS `start`,
				`i`.`end` AS `end`,
				`e`.`allday` AS `event_allday`,
				`e`.`recurrence_rules`,
				`e`.`exception_rules`,
				`e`.`recurrence_dates`,
				`e`.`exception_dates`,
				`e`.`venue`,
				`e`.`country`,
				`e`.`address`,
				`e`.`city`,
				`e`.`province`,
				`e`.`postal_code`,
				`e`.`instant_event`,
				`e`.`show_map`,
				`e`.`contact_name`,
				`e`.`contact_phone`,
				`e`.`contact_email`,
				`e`.`cost`,
				`e`.`ticket_url`,
				`e`.`ical_feed_url`,
				`e`.`ical_source_url`,
				`e`.`ical_organizer`,
				`e`.`ical_contact`,
				`e`.`ical_uid`
			FROM
				{$this->_dbi->get_table_name( 'ai1ec_events' )} e
			INNER JOIN
				{$this->_dbi->get_table_name( 'posts' )} p
					ON `p`.`ID` = `e`.`post_id`
				$wpml_join_particle
			INNER JOIN
				{$this->_dbi->get_table_name( 'ai1ec_event_instances' )} i
					ON `e`.`post_id` = `i`.`post_id`
				{$filter['filter_join']}
			WHERE
				post_type = " . AI1EC_POST_TYPE . "
				$wpml_where_particle
			AND
				$spanning_string
				{$filter['filter_where']}
				$post_status_where
			GROUP BY
				`i`.`id`
			ORDER BY
				`allday` DESC,
				`i`.`start` ASC,
				`post_title` ASC";

		$query  = $this->_dbi->prepare( $sql, $args );
		$events = $this->_dbi->get_results( $query, ARRAY_A );

		$id_list = array();
		foreach ( $events as $event ) {
			$id_list[] = $event['post_id'];
		}

		if ( ! empty( $id_list ) ) {
			update_meta_cache( 'post', $id_list );
		}

		foreach ( $events as &$event ) {
			$event['allday'] = $this->_is_all_day( $event );
			$event           = new Ai1ec_Event( $event );
		}

		return $events;
	}

	/**
	 * _get_post_status_sql function
	 *
	 * Returns SQL snippet for properly matching event posts, as well as array
	 * of arguments to pass to $this_dbi->prepare, in function argument
	 * references.
	 * Nothing is returned by the function.
	 *
	 * @return array An array containing post_status_where: the sql string,
	 * args: the arguments for prepare()
	 */
	protected function _get_post_status_sql() {
		global $current_user;

		$args = array();

		// Query the correct post status
		if ( current_user_can( 'administrator' )
			|| current_user_can( 'editor' )
		) {
			// User has privilege of seeing all published and private

			$post_status_where = 'AND post_status IN ( %s, %s ) ';
			$args[]            = 'publish';
			$args[]            = 'private';
		} elseif ( is_user_logged_in() ) {
			// User has privilege of seeing all published and only their own
			// private posts.

			// get user info
			get_currentuserinfo();

			// include post_status = published
			//   OR
			// post_status = private AND post_author = userID
			$post_status_where =
				'AND ( ' .
				'post_status = %s ' .
				'OR ( post_status = %s AND post_author = %d ) ' .
				') ';

			$args[] = 'publish';
			$args[] = 'private';
			$args[] = $current_user->ID;
		} else {
			// User can only see published posts.
			$post_status_where = 'AND post_status = %s ';
			$args[]            = 'publish';
		}

		return array(
			'post_status_where' => $post_status_where,
			'args'              => $args
		);
	}

	/**
	 * _get_filter_sql function
	 *
	 * Takes an array of filtering options and turns it into JOIN and WHERE
	 * statements for running an SQL query limited to the specified options
	 *
	 * @param array $filter    Array of filters for the events returned:
	 *                         ['cat_ids']   => list of category IDs
	 *                         ['tag_ids']   => list of tag IDs
	 *                         ['post_ids']  => list of event post IDs
	 *                         ['auth_ids']  => list of event author IDs
	 *                         This array is modified to have:
	 *                         ['filter_join']  the Join statements for the SQL
	 *                         ['filter_where'] the Where statements for the SQL
	 *
	 * @return array the modified filter array
	 */
	protected function _get_filter_sql( $filter ) {

		// Set up the filter join and where strings
		$filter['filter_join']  = '';
		$filter['filter_where'] = '';

		$where_logic = null;

		foreach ( $filter as $filter_type => $filter_ids ) {
			$filter_object = null;

			try {
				$filter_object = $this->_registry->get(
					"Ai1ec_Filter_Event",
					array( $filter_type, $filter_ids)
				);
			} catch ( Ai1ec_Bootstrap_Exception $exception ) {
				continue;
			}

			$filter['filter_join'][]  .= $filter_object->get_join();

			$where = $filter_object->get_where( $where_logic );
			$where_logic = $where['logic'];
			$where_filter = $where['filter'];
			$filter['filter_where'][] .= $where_filter;

		}

		// Close the Where statement bracket if any Where statements were set
		if ( $filter['filter_where'] != '' ) {
			$filter['filter_where'] .= ' ) ';
		}

		return $filter;

	}

	/**
	 * Check if given event must be treated as all-day event
	 *
	 * Event instances that span 24 hours are treated as all-day
	 *
	 * @param array $event Event data returned from database
	 *
	 * @return bool True if event is all-day event
	 */
	protected function _is_all_day( array $event ) {
		if ( isset( $event['event_allday'] ) && $event['event_allday'] ) {
			return true;
		}

		if ( ! isset( $event['start'] ) || ! isset( $event['end'] ) ) {
			return false;
		}

		return ( 86400 === $event['end']->format() - $event['start']->format() );
	}

	/**
	 * Object constructors
	 */
	public function __construct( Ai1ec_Object_Registry $registry ){
		$this->_dbi       = $registry->get( 'dbi' );
		$this->_registry  = $registry;
	}

}
