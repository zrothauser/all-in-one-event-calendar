<?php

/**
 * The ics import engine to import feeds from API
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Import-export
 */
class Ai1ec_Api_Ics_Import_Export_Engine
	extends Ai1ec_Base
	implements Ai1ec_Import_Export_Engine {

	/**
	 * @var Ai1ec_Taxonomy
	 */
	protected $_taxonomy_model = null;

	/**
	 * Recurrence rule class. Contains filter method.
	 *
	 * @var Ai1ec_Recurrence_Rule
	 */
	protected $_rule_filter = null;

	protected function is_valid( $cal ) {
		if ( is_null( $cal ) ||
			! isset( $cal->events ) ||
			! is_array( $cal->events )
			) {
			return false;
		}
		return true;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Import_Export_Engine::import()
	 */
	public function import( array $arguments ) {		
		$cal = $arguments['source'];
		if ( $this->is_valid( $cal ) ) {
			try {
				$result = $this->add_vcalendar_events_to_db(
				 	$cal,
				 	$arguments
				);
			} catch ( Ai1ec_Parse_Exception $exception ) {
				throw new Ai1ec_Parse_Exception(
					'Processing "' . $arguments['source'] .
					'" triggered error: ' . $exception->getMessage()
				);
			}
			return $result;
		}
		throw new Ai1ec_Parse_Exception( 'The passed string is not a valid ics feed' );
	}
				
	public function events_order_comparator( $e1, $e2 ) {
		return strcmp( $e1->dtstart, $e2->dtstart );		
	}

	/**
	 * Process vcalendar instance - add events to database.
	 *
	 * @param vcalendar $v    Calendar to retrieve data from.
	 * @param array     $args Arbitrary arguments map.
	 *
	 * @throws Ai1ec_Parse_Exception
	 *
	 * @internal param stdClass $feed           Instance of feed (see Ai1ecIcs plugin).
	 * @internal param string   $comment_status WP comment status: 'open' or 'closed'.
	 * @internal param int      $do_show_map    Map display status (DB boolean: 0 or 1).
	 *
	 * @return int Count of events added to database.
	 */
	public function add_vcalendar_events_to_db(
		$cal,
		array $args
	) {

		$feed              = isset( $args['feed'] ) ? $args['feed'] : null;
		$comment_status    = isset( $args['comment_status'] ) ? $args['comment_status'] : 'open';
		$do_show_map       = isset( $args['do_show_map'] ) ? $args['do_show_map'] : 0;
		$count             = 0;
		$events_in_db      = isset( $args['events_in_db'] ) ? $args['events_in_db'] : 0;
		usort( $cal->events, array( "Ai1ec_Api_Ics_Import_Export_Engine", "events_order_comparator" ) );
		$timezone_wp       = $this->_registry->get( 'date.timezone' )->get_default_timezone();
		$feed_name         = $cal->name;
		$messages          = array();
		$current_timestamp = $this->_registry->get( 'date.time' )->format_to_gmt();
		$exclusions        = array();

		// go over each event
		foreach ( $cal->events as $e ) {

			// Event data array.
			$data         = array();

			// =====================
			// = Start & end times =
			// =====================
			$start        = $e->dtstart;
			$end          = $e->dtend;

			// =====================
			// = Terms =
			// =====================			
			$categories   = $e->categories;
			$imported_cat = array( Ai1ec_Event_Taxonomy::CATEGORIES => array() );
			// If the user chose to preserve taxonomies during import, add categories.
			if( ! empty( $categories ) && $feed->keep_tags_categories ) {
				$imported_cat = $this->add_categories_and_tags(
						$categories,
						$imported_cat,
						false,
						true
				);
			}
			$feed_categories = $feed->feed_category;
			if( ! empty( $feed_categories ) ) {
				$imported_cat = $this->add_categories_and_tags(
						explode( ',', $feed_categories ),
						$imported_cat,
						false,
						false
				);
			}

			$tags          = $e->tags;
			$imported_tags = array( Ai1ec_Event_Taxonomy::TAGS => array() );
			// If the user chose to preserve taxonomies during import, add tags.
			if( ! empty( $tags ) && $feed->keep_tags_categories ) {
				$imported_tags = $this->add_categories_and_tags(
						$tags,
						$imported_tags,
						true,
						true
				);
			}
			$feed_tags = $feed->feed_tags;
			if( ! empty( $feed_tags ) ) {
				$imported_tags = $this->add_categories_and_tags(
						explode( ',', $feed_tags ),
						$imported_tags,
						true,
						true
				);
			}

			// event is all-day if no time components are defined
			$allday         = $e->all_day;
			$timezone_event = $e->timezone;
			if ( empty( $timezone_event ) ) {
				if ( empty( $cal->timezone ) ) {
					$timezone_event = $timezone_wp;
				} else {
					$timezone_event = $cal->timezone;
				}
			}
			$start = $this->_string_to_datetime(
				$start,
				$timezone_event,
				$feed->import_timezone ? $forced_timezone : null
			);
			$end   = $this->_string_to_datetime(
				$end,
				$timezone_event,
				$feed->import_timezone ? $forced_timezone : null
			);
			if ( false === $start || false === $end ) {
				throw new Ai1ec_Parse_Exception(
					'Failed to parse one or more dates given timezone "' .
					var_export( $event_timezone, true ) . '"'
				);
				continue;
			}

			// If all-day, and start and end times are equal, then this event has
			// invalid end time (happens sometimes with poorly implemented iCalendar
			// exports, such as in The Event Calendar), so set end time to 1 day
			// after start time.
			if ( $allday && $start->format() === $end->format() ) {
				$end->adjust_day( +1 );
			}

			$data += compact( 'start', 'end', 'allday' );

			// =======================================
			// = Recurrence rules & recurrence dates =
			// =======================================
			$rrule    = $e->recurrence_rules;
			$exrule   = $e->exception_rules;
			$rdate    = $e->recurrence_dates;
			$exdate   = $e->exception_dates;

			// ========================
			// = Latitude & longitude =
			// ========================
			$latitude = $longitude = NULL;
			if ( ! empty( $e->latitude ) && ! empty( $e->longitude ) ) {
				$latitude  = (float) $e->latitude;
				$longitude = (float) $e->longitude;
				$data += compact( 'latitude', 'longitude' );
				// Check the input coordinates checkbox, otherwise lat/long data
				// is not present on the edit event page
				$data['show_coordinates'] = 1;
			}

			// ===================
			// = Venue & address =
			// ===================
			$address  = $venue = '';
			if ( ! empty( $e->venue_name ) ) {
				$venue = $e->venue_name;
			}
			if ( ! empty( $e->address ) ) {
				$address = $e->address;
			}
			// =====================================================
			// = Set show map status based on presence of location =
			// =====================================================
			$event_do_show_map = $do_show_map;
			if (
				1 === $do_show_map &&
				NULL === $latitude &&
				empty( $address )
			) {
				$event_do_show_map = 0;
			}
				
			// ==================
			// = Cost & tickets =
			// ==================
			$cost       = $e->cost;
			$ticket_url = $e->ticket_url;

			// ===============================
			// = Contact name, phone, e-mail =
			// ===============================			
			if ( ! empty( $e->contact_name ) ) {
				$data['contact_name'] = $e->contact_name;	
			}
			if ( ! empty( $e->contact_phone ) ) {
				$data['contact_phone'] = $e->contact_phone;	
			}
			if ( ! empty( $e->contact_email ) ) {
				$data['contact_email'] = $e->contact_email;	
			}
			if ( ! empty( $e->contact_url ) ) {
				$data['contact_url'] = $e->contact_url;	
			}
			if ( ! isset( $data['contact_name'] ) || ! $data['contact_name'] ) {
				// If no contact name, default to organizer property.
				$data['contact_name']    = $organizer;
			}

			$organizer = $e->ical_organizer;
			if (
				'MAILTO:' === substr( $organizer, 0, 7 ) &&
				false === strpos( $organizer, '@' )
			) {
				$organizer = substr( $organizer, 7 );
			}

			$description = stripslashes(
							str_replace(
								'\n',
								"\n",
								$e->description
							));			
			$description = $this->_remove_ticket_url( $description );				

			// Store yet-unsaved values to the $data array.
			$data += array(
				'recurrence_rules'  => $rrule,
				'exception_rules'   => $exrule,
				'recurrence_dates'  => $rdate,
				'exception_dates'   => $exdate,
				'venue'             => $venue,
				'address'           => $address,
				'cost'              => $cost,
				'ticket_url'        => $ticket_url,
				'show_map'          => $event_do_show_map,
				'ical_feed_url'     => $feed->feed_url,
				'ical_source_url'   => $e->ical_source_url,
				'ical_organizer'    => $organizer,
				'ical_contact'      => $e->ical_contact,
				'ical_uid'          => $e->ical_uid,
				'categories'        => array_keys( $imported_cat[Ai1ec_Event_Taxonomy::CATEGORIES] ),
				'tags'              => array_keys( $imported_tags[Ai1ec_Event_Taxonomy::TAGS] ),
				'feed'              => $feed,
				'post'              => array(
					'post_status'       => 'publish',
					'comment_status'    => $comment_status,
					'post_type'         => AI1EC_POST_TYPE,
					'post_author'       => 1,
					'post_title'        => $e->title,
					'post_content'      => $description
				)
			);

			// Create event object.
			$data  = apply_filters(
				'ai1ec_pre_init_event_from_feed',
				$data,
				$e,
				$feed
			);

			$event = $this->_registry->get( 'model.event', $data );		

			// Instant Event
			$is_instant = $e->instant_event;
			if ( $is_instant ) {
				$event->set_no_end_time();
			}

			$recurrence = $event->get( 'recurrence_rules' );
			$search = $this->_registry->get( 'model.search' );
			// first let's check by UID
			$matching_event_id = $search
				->get_matching_event_by_uid_and_url(
					$event->get( 'ical_uid' ),
					$event->get( 'ical_feed_url' )
				);
			// if no result, perform the legacy check.
			if ( null === $matching_event_id ) {
				$matching_event_id = $search
					->get_matching_event_id(
						$event->get( 'ical_uid' ),
						$event->get( 'ical_feed_url' ),
						$event->get( 'start' ),
						! empty( $recurrence )
					);
			}
			if ( null === $matching_event_id ) {
				
				// =================================================
				// = Event was not found, so store it and the post =
				// =================================================
				$event->save();
				$count++;
			} else {				
				// ======================================================
				// = Event was found, let's store the new event details =
				// ======================================================

				// Update the post
				$post               = get_post( $matching_event_id );

				if ( null !== $post ) {
					$post->post_title   = $event->get( 'post' )->post_title;
					$post->post_content = $event->get( 'post' )->post_content;
					wp_update_post( $post );

					// Update the event
					$event->set( 'post_id', $matching_event_id );
					$event->set( 'post',    $post );
					$event->save( true );
					$count++;
				}
			}
			do_action( 'ai1ec_ics_event_saved', $event, $feed );

			// import not standard taxonomies.
			unset( $imported_cat[Ai1ec_Event_Taxonomy::CATEGORIES] );
			foreach ( $imported_cat as $tax_name => $ids ) {
				wp_set_post_terms( $event->get( 'post_id' ), array_keys( $ids ), $tax_name );
			}

			unset( $imported_tags[Ai1ec_Event_Taxonomy::TAGS] );
			foreach ( $imported_tags as $tax_name => $ids ) {
				wp_set_post_terms( $event->get( 'post_id' ), array_keys( $ids ), $tax_name );
			}

			// import the metadata used by ticket events

			$cost_type    = $e->cost_type;
			if ( false === ai1ec_is_blank( $cost_type ) ) {
				update_post_meta( $event->get( 'post_id' ), '_ai1ec_cost_type', $cost_type );
			}

			$api_event_id = $e->api_event_id;
			if ( false === ai1ec_is_blank( $api_event_id ) ) {
				update_post_meta( $event->get( 'post_id' ), Ai1ec_Api_Ticketing::EVENT_ID_METADATA, $api_event_id );	
			}

			$api_url = $e->api_url;
			if ( false === ai1ec_is_blank( $api_url ) ) {
				update_post_meta( $event->get( 'post_id' ), Ai1ec_Api_Ticketing::ICS_API_URL_METADATA, $api_url );	
			}

			$checkout_url = $e->checkout_url;
			if ( false === ai1ec_is_blank( $checkout_url ) ) {
				update_post_meta( $event->get( 'post_id' ), Ai1ec_Api_Ticketing::ICS_CHECKOUT_URL_METADATA, $checkout_url );	
			}

			unset( $events_in_db[$event->get( 'post_id' )] );
		} //close while iteration

		return array(
			'count'            => $count,
			'events_to_delete' => $events_in_db,
			'messages'         => $messages,
			'name'             => $feed_name,
		);
	}

	/**
	 * Parse importable feed timezone to sensible value.
	 *
	 * @param string $def_timezone Timezone value from feed.
	 *
	 * @return string Valid timezone name to use.
	 */
	protected function _get_import_timezone( $def_timezone ) {
		$parser   = $this->_registry->get( 'date.timezone' );
		$timezone = $parser->get_name( $def_timezone );
		if ( false === $timezone ) {
			return 'sys.default';
		}
		return $timezone;
	}

	/**
	 * _string_to_datetime function
	 *
	 * Converts time string "Y-m-d H:i:s" to DateTime object.
	 * Passed array: Array( 'year', 'month', 'day', ['hour', 'min', 'sec', ['tz']] )
	 * Return int: UNIX timestamp in GMT
	 *
	 * @param array       $time            iCalcreator time property array
	 *                                     (*full* format expected)
	 * @param string      $def_timezone    Default time zone in case not defined
	 *                                     in $time
	 * @param null|string $forced_timezone Timezone to use instead of UTC.
	 *
	 * @return int UNIX timestamp
	 **/
	protected function _string_to_datetime(
		$time,
		$def_timezone,
		$forced_timezone = null
	) {
		$date_time = null;
		if ( 0 === strcasecmp( $def_timezone, 'utc' ) && 
			null !== $forced_timezone ) {
			$date_time = $this->_registry->get( 'date.time',  $time, $forced_timezone );
		} else {
			$date_time = $this->_registry->get( 'date.time',  $time, $def_timezone );
		}
		return $date_time;
	}

	/**
	 * Takes a comma-separated list of tags or categories.
	 * If they exist, reuses
	 * the existing ones. If not, creates them.
	 *
	 * The $imported_terms array uses keys to store values rather than values to
	 * speed up lookups (using isset() insted of in_array()).
	 *
	 * @param string  $terms
	 * @param array   $imported_terms
	 * @param boolean $is_tag
	 * @param boolean $use_name
	 *
	 * @return array
	 */
	public function add_categories_and_tags(
		array $categories,
		array $imported_terms,
		$is_tag,
		$use_name
	) {
		$taxonomy       = $is_tag ? 'events_tags' : 'events_categories';
		$event_taxonomy = $this->_registry->get( 'model.event.taxonomy' );

		foreach ( $categories as $cat_name ) {
			$cat_name = trim( $cat_name );
			if ( empty( $cat_name ) ) {
				continue;
			}
			$term = $event_taxonomy->initiate_term( $cat_name, $taxonomy, ! $use_name );
			if ( false !== $term ) {
				if ( ! isset( $imported_terms[$term['taxonomy']] ) ) {
					$imported_terms[$term['taxonomy']] = array();
				}
				$imported_terms[$term['taxonomy']][$term['term_id']] = true;
			}
		}
		return $imported_terms;
	}

	/**
	 * Remove the Ticket URL that maybe exists inside the field Description of the Event
	 */
	protected function _remove_ticket_url( $description ) {
		return preg_replace( '/<p>[^<>]+<a[^<>]+class=[\'"]?ai1ec-ticket-url-exported[\'"]?[^<>]+>.[^<>]+<\/a>[\.\s]*<\/p>/'
				, ''
				, $description );
	}

/* (non-PHPdoc)
	 * @see Ai1ec_Import_Export_Engine::export()
	 */
	public function export( array $arguments, array $params = array() ) {
		throw new Exception( 'Export not supported' );
	}

}