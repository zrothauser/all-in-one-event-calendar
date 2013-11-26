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
	 * @var Ai1ec_Registry_Object instance
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
		Ai1ec_Date_Time $start,
		Ai1ec_Date_Time $end,
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

		$ai1ec_localization_helper = $this->_registry->get( 'Ai1ec_Localization_Helper' );

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
				post_type = '" . AI1EC_POST_TYPE . "'
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

		fb($sql);
		$id_list = array();
		foreach ( $events as $event ) {
			$id_list[] = $event['post_id'];
		}

		if ( ! empty( $id_list ) ) {
			update_meta_cache( 'post', $id_list );
		}

		foreach ( $events as &$event ) {
			$event['allday'] = $this->_is_all_day( $event );
			$event           = $this->_registry->get( 'model.event', $event );
		}

		return $events;
	}

	/**
	 * get_matching_event function
	 *
	 * Return event ID by iCalendar UID, feed url, start time and whether the
	 * event has recurrence rules (to differentiate between an event with a UID
	 * defining the recurrence pattern, and other events with with the same UID,
	 * which are just RECURRENCE-IDs).
	 *
	 * @param int      $uid             iCalendar UID property
	 * @param string   $feed            Feed URL
	 * @param int      $start           Start timestamp (GMT)
	 * @param bool     $has_recurrence  Whether the event has recurrence rules
	 * @param int|null $exclude_post_id Do not match against this post ID
	 *
	 * @return object|null ID of matching event post, or NULL if no match
	 **/
	public function get_matching_event_id(
		$uid,
		$feed,
		$start,
		$has_recurrence  = false,
		$exclude_post_id = NULL
	) {
		$db = $this->_registry->get( 'dbi.dbi' );

		$table_name = $db->get_table_name( 'ai1ec_events' );
		$query = 'SELECT `post_id` FROM ' . $table_name . '
			WHERE
				    ical_feed_url   = %s
				AND ical_uid        = %s
				AND start           = %d ' .
			( $has_recurrence ? 'AND NOT ' : 'AND ' ) .
			' ( recurrence_rules IS NULL OR recurrence_rules = \'\' )';
		$args = array( $feed, $uid, $start );
		if ( null !== $exclude_post_id ) {
			$query .= ' AND post_id <> %d';
			$args[] = $exclude_post_id;
		}

		return $db->get_var(
			$db->prepare( $query, $args )
		);
	}

	/**
	 * Get operator for joining distinct filters in WHERE.
	 *
	 * @return string SQL operator.
	 */
	public function get_distinct_types_operator() {
		static $operators = array( 'AND' => 1, 'OR' => 2 );
		$default          = key( $operators );
		$where_operator   = strtoupper( trim( (string)apply_filters(
			'ai1ec_filter_distinct_types_logic',
			$default
		) ) );
		if ( ! isset( $operators[$where_operator] ) ) {
			$where_operator = $default;
		}
		return $where_operator;
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

		return ( 86400 === $event['end'] - $event['start'] );
	}

	/**
	 * cache_event function
	 *
	 * Creates a new entry in the cache table for each date that the event appears
	 * (and does not already have an explicit RECURRENCE-ID instance, given its
	 * iCalendar UID).
	 *
	 * @param Ai1ec_Event $event Event to generate cache table for
	 *
	 * @return void
	 **/
	public function cache_event( Ai1ec_Event &$event ) {
		$db = $this->_registry->get( 'dbi.dbi' );

		$evs = array();
		$e	 = array(
			'post_id' => $event->post_id,
			'start'   => $event->start,
			'end'     => $event->end,
		);
		$duration = $event->getDuration();

		// Timestamp of today date + 3 years (94608000 seconds)
		$tif = time() + 94608000;
		// Always cache initial instance
		$evs[] = $e;

		$_start = $event->start;
		$_end   = $event->end;

		if ( $event->recurrence_rules ) {
			$start  = $event->start;
			$wdate = $startdate = iCalUtilityFunctions::_timestamp2date( $_start, 6 );
			$enddate = iCalUtilityFunctions::_timestamp2date( $tif, 6 );
			$exclude_dates = array();
			$recurrence_dates = array();
			$recurrence_rule = $this->_registry->get( 'recurrence.rule' );
			if ( $event->exception_rules ) {

				// creat an array for the rules
				$exception_rules = $recurrence_rule->build_recurrence_rules_array(
					$event->exception_rules
				);
				$exception_rules = iCalUtilityFunctions::_setRexrule( $exception_rules );
				$result = array();
				// The first array is the result and it is passed by reference
				iCalUtilityFunctions::_recur2date(
					$exclude_dates,
					$exception_rules,
					$wdate,
					$startdate,
					$enddate
				);
			}
			$recurrence_rules = $recurrence_rule->build_recurrence_rules_array(
				$event->recurrence_rules
			);
			$recurrence_rules = iCalUtilityFunctions::_setRexrule( $recurrence_rules );
			iCalUtilityFunctions::_recur2date(
				$recurrence_dates,
				$recurrence_rules,
				$wdate,
				$startdate,
				$enddate
			);
			// Add the instances
			foreach ( $recurrence_dates as $date => $bool ) {
				// The arrays are in the form timestamp => true so an isset call is what we need
				if( isset( $exclude_dates[$date] ) ) {
					continue;
				}
				$e['start'] = $date;
				$e['end']   = $date + $duration;
				$excluded   = false;


				// Check if exception dates match this occurence
				if( $event->exception_dates ) {
					if( $this->date_match_exdates( $date, $event->exception_dates ) )
						$excluded = true;
				}

				// Add event only if it is not excluded
				if ( $excluded == false ) {
					$evs[] = $e;
				}
			}
		}

		// Make entries unique (sometimes recurrence generator creates duplicates?)
		$evs_unique = array();
		foreach ( $evs as $ev ) {
			$evs_unique[md5( serialize( $ev ) )] = $ev;
		}

		foreach ( $evs_unique as $e ) {

			// Find out if this event instance is already accounted for by an
			// overriding 'RECURRENCE-ID' of the same iCalendar feed (by comparing the
			// UID, start date, recurrence). If so, then do not create duplicate
			// instance of event.
			$matching_event_id = null;
			if ( $event->ical_uid ) {
				$matching_event_id = $this->get_matching_event_id(
					$event->ical_uid,
					$event->ical_feed_url,
					$e['start'],
					false,	// Only search events that does not define
					// recurrence (i.e. only search for RECURRENCE-ID events)
					$event->post_id
				);
			}

			// If no other instance was found
			if ( null === $matching_event_id ) {
				$this->insert_event_in_cache_table( $e );
			}
		}
		// perform actions like cleaning the cache
		do_action( 'ai1ec_save_event_instance', $event->post_id );
	}

	/**
	 * insert_event_in_cache_table function
	 *
	 * Inserts a new record in the cache table
	 *
	 * @param array $event Event array
	 *
	 * @return void
	 */
	public function insert_event_in_cache_table( array $event ) {
		// Return the start/end times to GMT zone
		$values = array(
			'post_id' => $event['post_id'],
			'start'   => $event['start']->format_to_gmt(),
			'end'     => $event['end']->format_to_gmt(),
		);
		$dbi            = $this->_registry->get( 'dbi.dbi' );

		$dbi->query(
			$dbi->prepare(
				'INSERT INTO ' . $dbi->get_table_name( 'ai1ec_event_instances' ) .
				'       ( post_id,  start,  end ) ' .
				'VALUES ( %d,       %d,     %d  )',
				$values
			)
		);
		// perform actions like cleaning the cache
		do_action( 'ai1ec_save_event_in_table', $event['post_id'] );
	}

	/**
	 * delete_event_cache function
	 *
	 * Delete cache of event
	 *
	 * @param int $pid Event post ID
	 *
	 * @return void
	 **/
	public function delete_event_cache( $pid ) {
		return $this->_clean_instance_table( $pid );
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
			$post_status_where = 'AND ( ' .
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
		$filter_join = $filter_where = array();

		foreach ( $filter as $filter_type => $filter_ids ) {
			$filter_object = null;
			try {
				$filter_object = $this->_registry->get(
					'model.filter.' . $filter_type,
					$filter_ids
				);
				if ( ! ( $filter_object instanceof Ai1ec_Filter_Interface ) ) {
					throw new Ai1ec_Bootstrap_Exception(
						'Filter \'' . get_class( $filter_object ) .
						'\' is not instance of Ai1ec_Filter_Interface'
					);
				}
			} catch ( Ai1ec_Bootstrap_Exception $exception ) {
				continue;
			}
			$filter_join[]  = $filter_object->get_join();
			$filter_where[] = $filter_object->get_where();
		}

		$filter_join  = array_filter( $filter_join );
		$filter_where = array_filter( $filter_where );
		$filter_join  = join( ' ', $filter_join );
		if ( count( $filter_where ) > 0 ) {
			$operator     = $this->get_distinct_types_operator();
			$filter_where = '( ' .
				implode( ' ) ' . $operator . ' ( ', $filter_where ) .
				' )';
		} else {
			$filter_where = '';
		}

		return $filter + compact( 'filter_where', 'filter_join' );
	}
	/**
	 * _clean_instance_table method
	 *
	 * Clean event instances table for given event
	 *
	 * @param int $post_id     ID of post to delete instances entries for
	 * @param int $instance_id ID of instance to delete, if any [optional=NULL]
	 *
	 * @return bool Success
	 */
	protected function _clean_instance_table( $post_id, $instance_id = NULL ) {
		$table_name = $this->_db->get_table_name( 'ai1ec_event_instances' );
		$query      = 'DELETE FROM `' . $table_name .
			'` WHERE `post_id` = %d';
		if ( NULL !== $instance_id ) {
			$query .= ' AND `id` = %d';
		}
		$statement  = $this->_db->prepare( $query, $post_id, $instance_id );
		return $this->_db->query( $statement );
	}

	/**
	 * Object constructor.
	 */
	public function __construct( Ai1ec_Registry_Object $registry ){
		$this->_dbi       = $registry->get( 'dbi.dbi' );
		$this->_registry  = $registry;
	}

}