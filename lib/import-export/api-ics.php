<?php

/**
 * The ics import engine to import feeds from API
 *
 * @author     Time.ly Network Inc.
 * @since      2.4
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
		if ( is_null( $cal ) || ! is_array( $cal ) ) {
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
				$result = $this->add_vcalendar_events_to_db( $arguments );
			} catch ( Ai1ec_Parse_Exception $exception ) {
				throw new Ai1ec_Parse_Exception(
					'Processing "' . $arguments['source'] .
					'" triggered error: ' . $exception->getMessage()
				);
			}
			return $result;
		}
		throw new Ai1ec_Parse_Exception( 'The passed string is not a valid ics feed: ' );
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
	 * @internal param array   $args           Array with events and configuration
	 *
	 * @return int Count of events added to database.
	 */
	public function add_vcalendar_events_to_db( array $args ) {

		$cal             = $args['source'];

		$forced_timezone = null;
		$feed            = isset( $args['feed'] ) ? $args['feed'] : null;
		$comment_status  = isset( $args['comment_status'] ) ? $args['comment_status'] : 'open';
		$do_show_map     = isset( $args['do_show_map'] ) ? $args['do_show_map'] : 0;
		$count           = 0;
		$events_in_db    = isset( $args['events_in_db'] ) ? $args['events_in_db'] : 0;

		// Fetch default timezone in case individual properties don't define it
		$local_timezone = $this->_registry->get( 'date.timezone' )->get_default_timezone();
		$timezone       = $local_timezone;

		$messages        = array();

		$current_timestamp = $this->_registry->get( 'date.time' )->format_to_gmt();

		// initialize empty custom exclusions structure
		$exclusions        = array();
		// go over each event
		foreach ( $cal as $e ) {

			// Event data array.
			$data = array();
			// =====================
			// = Start & end times =
			// =====================
			$start = $e->dtstart;
			$end   = $e->dtend;
			// For cases where a "VEVENT" calendar component
			// specifies a "DTSTART" property with a DATE value type but none
			// of "DTEND" nor "DURATION" property, the event duration is taken to
			// be one day.  For cases where a "VEVENT" calendar component
			// specifies a "DTSTART" property with a DATE-TIME value type but no
			// "DTEND" property, the event ends on the same calendar date and
			// time of day specified by the "DTSTART" property.
			if ( empty( $end ) )  {
				// #1 if duration is present, assign it to end time
				$end = $e->duration;
				if ( empty( $end ) ) {
					// #2 if only DATE value is set for start, set duration to 1 day
					if ( ! isset( $start['value']['hour'] ) ) {
						$end = array(
							'value' => array(
								'year'  => $start['value']['year'],
								'month' => $start['value']['month'],
								'day'   => $start['value']['dayOfMonth'] + 1,
								'hour'  => 0,
								'min'   => 0,
								'sec'   => 0,
							),
						);
						// #3 set end date to start time
						$end = $start;
					}
				}
			}
			$categories = $e->categories;
			$imported_cat = array( Ai1ec_Event_Taxonomy::CATEGORIES => array() );
			// If the user chose to preserve taxonomies during import, add categories.
			if( $categories && $feed->keep_tags_categories ) {
				$imported_cat = $this->add_categories_and_tags(
						$categories['value'],
						$imported_cat,
						false,
						true
				);
			}
			$feed_categories = $feed->feed_category;
			if( ! empty( $feed_categories ) ) {
				$imported_cat = $this->add_categories_and_tags(
						$feed_categories,
						$imported_cat,
						false,
						false
				);
			}
			$tags = $e->x_tags;
			$imported_tags = array( Ai1ec_Event_Taxonomy::TAGS => array() );
			// If the user chose to preserve taxonomies during import, add tags.
			if( $tags && $feed->keep_tags_categories ) {
				$imported_tags = $this->add_categories_and_tags(
						$tags[1]['value'],
						$imported_tags,
						true,
						true
				);
			}
			$feed_tags = $feed->feed_tags;
			if( ! empty( $feed_tags ) ) {
				$imported_tags = $this->add_categories_and_tags(
						$feed_tags,
						$imported_tags,
						true,
						true
				);
			}
			// Event is all-day if no time components are defined
			$allday = $this->_is_timeless( $start['value'] ) &&
				$this->_is_timeless( $end['value'] );
			// Also check the proprietary MS all-day field.
			$ms_allday = $e->x_microsoft_cdo_alldayevent;
			if ( ! empty( $ms_allday ) && $ms_allday[1] == 'TRUE' ) {
				$allday = true;
			}
			$event_timezone = $timezone;
			if ( $allday ) {
				$event_timezone = $local_timezone;
			}
			$start = $this->_time_array_to_datetime(
				$start,
				$event_timezone,
				$feed->import_timezone ? $forced_timezone : null
			);
			$end   = $this->_time_array_to_datetime(
				$end,
				$event_timezone,
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
			if ( $rrule = $e->rrule ) {
				$rrule = explode( ':', $rrule );
				$rrule = trim( end( $rrule ) );
			}

			if ( $exrule = $e->exrule ) {
				$exrule = explode( ':', $exrule );
				$exrule = trim( end( $exrule ) );
			}

			if ( $rdate = $e->rdate ) {
				$arr     = explode( 'RDATE', $rdate );
				$matches = null;
				foreach ( $arr as $value ) {
					$arr2 = explode( ':', $value );
					if ( 2 === count( $arr2 ) ) {
						$matches[] = $arr2[1];
					}
				}
				if ( null !== $matches ) {
					$rdate = implode( ',', $matches );	
					unset( $matches ); 
					unset( $arr ); 
				} else {
					$rdate = null;
				}				
			}

			// ===================
			// = Exception dates =
			// ===================
			$exdate = '';
			if ( $exdates = $e->exdate ){
				// We may have two formats:
				// one exdate with many dates ot more EXDATE rules
				$exdates      = explode( 'EXDATE', $exdates );
				$def_timezone = $this->_get_import_timezone( $event_timezone );
				foreach ( $exdates as $exd ) {
					if ( empty( $exd ) ) {
						continue;
					}
					$exploded       = explode( ':', $exd );
					$excpt_timezone = $def_timezone;
					$excpt_date     = null;
					foreach ( $exploded as $particle ) {
						if ( ';TZID=' === substr( $particle, 0, 6 ) ) {
							$excpt_timezone = substr( $particle, 6 );
						} else {
							$excpt_date = trim( $particle );
						}
					}
					$exploded       = explode( ',', $excpt_date );
					foreach ( $exploded as $particle ) {
						// Google sends YYYYMMDD for all-day excluded events
						if (
							$allday &&
							8 === strlen( $particle )
						) {
							$particle    .= 'T000000Z';
							$excpt_timezone = 'UTC';
						}
						$ex_dt = $this->_registry->get(
							'date.time',
							$particle,
							$excpt_timezone
						);
						if ( $ex_dt ) {
							if ( isset( $exdate{0} ) ) {
								$exdate .= ',';
							}
							$exdate .= $ex_dt->format( 'Ymd\THis', $excpt_timezone );
						}
					}
				}
			}
			// Add custom exclusions if there any
			$recurrence_id = $e->recurrence_id;
			if (
				false === $recurrence_id &&
				! empty( $exclusions[$e->uid] )
			) {
				if ( isset( $exdate{0} ) ) {
					$exdate .= ',';
				}
				$exdate .= implode( ',', $exclusions[$e->uid] );
			}
			// ========================
			// = Latitude & longitude =
			// ========================
			$latitude = $longitude = NULL;
			$geo_tag  = explode( ',', $e->geo );
			if ( ! empty( $geo_tag ) && false !== strpos( $geo_tag, ',' ) ) {
				list( $latitude, $longitude ) = explode( ',', $geo_tag, 2 );
				$latitude  = (float)$latitude;
				$longitude = (float)$longitude;
			}
			unset( $geo_tag );
			if ( NULL !== $latitude ) {
				$data += compact( 'latitude', 'longitude' );
				// Check the input coordinates checkbox, otherwise lat/long data
				// is not present on the edit event page
				$data['show_coordinates'] = 1;
			}
			// ===================
			// = Venue & address =
			// ===================
			$address = $venue = '';
			$location = $e->location;
			$matches = array();
			// This regexp matches a venue / address in the format
			// "venue @ address" or "venue - address".
			preg_match( '/\s*(.*\S)\s+[\-@]\s+(.*)\s*/', $location, $matches );
			// if there is no match, it's not a combined venue + address
			if ( empty( $matches ) ) {
				// temporary fix for Mac ICS import. Se AIOEC-2187
				// and https://github.com/iCalcreator/iCalcreator/issues/13
				$location = str_replace( '\n', "\n", $location );
				// if there is a comma, probably it's an address
				if ( false === strpos( $location, ',' ) ) {
					$venue = $location;
				} else {
					$address = $location;
				}
			} else {
				$venue = isset( $matches[1] ) ? $matches[1] : '';
				$address = isset( $matches[2] ) ? $matches[2] : '';
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
			$cost       = $e->x_cost;
			$cost       = $cost ? $cost[1] : '';
			$ticket_url = $e->x_tickets_url;
			$ticket_url = $ticket_url ? $ticket_url[1] : '';

			// ===============================
			// = Contact name, phone, e-mail =
			// ===============================
			$organizer = $e->organizer;
			if (
				'MAILTO:' === substr( $organizer, 0, 7 ) &&
				false === strpos( $organizer, '@' )
			) {
				$organizer = substr( $organizer, 7 );
			}
			$contact = $e->contact;
			$elements = explode( ';', $contact, 4 );

			foreach ( $elements as $el ) {
				$el = trim( $el );
				// Detect e-mail address.
				if ( false !== strpos( $el, '@' ) ) {
					$data['contact_email'] = $el;
				}
				// Detect URL.
				elseif ( false !== strpos( $el, '://' ) ) {
					$data['contact_url']   = $el;
				}
				// Detect phone number.
				elseif ( preg_match( '/\d/', $el ) ) {
					$data['contact_phone'] = $el;
				}
				// Default to name.
				else {
					$data['contact_name']  = $el;
				}
			}
			if ( ! isset( $data['contact_name'] ) || ! $data['contact_name'] ) {
				// If no contact name, default to organizer property.
				$data['contact_name']    = $organizer;
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
				'ical_source_url'   => $e->url,
				'ical_organizer'    => $organizer,
				'ical_contact'      => $contact,
				'ical_uid'          => $this->_get_ical_uid( $e ),
				'categories'        => array_keys( $imported_cat[Ai1ec_Event_Taxonomy::CATEGORIES] ),
				'tags'              => array_keys( $imported_tags[Ai1ec_Event_Taxonomy::TAGS] ),
				'feed'              => $feed,
				'post'              => array(
					'post_status'       => 'publish',
					'comment_status'    => $comment_status,
					'post_type'         => AI1EC_POST_TYPE,
					'post_author'       => 1,
					'post_title'        => $e->summary,
					'post_content'      => $description
				)
			);
			// register any custom exclusions for given event
			$exclusions = $this->_add_recurring_events_exclusions(
				$e,
				$exclusions,
				$start
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
			$is_instant = $e->x_instant_event;
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
				$uid_cal = $e->uid;
				if ( ! ai1ec_is_blank( $uid_cal ) ) {					
					$uid_cal_original = sprintf( $event->get_uid_pattern(), $matching_event_id );
					if ( $uid_cal_original === $uid_cal ) {
						//avoiding cycle import
						//ignore the event, it belongs to site
						unset( $events_in_db[$matching_event_id] );
						continue;
					}
				}

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

			$cost_type    = $e->x_cost_type;
			if ( $cost_type && false === ai1ec_is_blank( $cost_type[1] ) ) {
				update_post_meta( $event->get( 'post_id' ), '_ai1ec_cost_type', $cost_type[1] );
			}

			$api_event_id = $e->x_api_event_id;
			if ( $api_event_id && false === ai1ec_is_blank( $api_event_id[1] ) ) {
				$api_event_id = $api_event_id[1];
			} else {
				$api_event_id = null;
			}

			$api_url = $e->x_api_url;
			if ( $api_url && false === ai1ec_is_blank( $api_url[1] ) ) {
				$api_url = $api_url[1];
			} else {
				$api_url = null;
			}

			$checkout_url = $e->x_checkout_url;
			if ( $checkout_url && false === ai1ec_is_blank( $checkout_url[1] ) ) {
				$checkout_url = $checkout_url[1];
			} else {
				$checkout_url = null;
			}
			
			$currency = $e->x_api_event_currency;
			if ( $currency && false === ai1ec_is_blank( $currency[1] ) ) {
				$currency = $currency[1];
			} else {
				$currency = null;
			}
			if ( $api_event_id || $api_url || $checkout_url || $currency ) {
				if ( ! isset( $api ) ) {
					$api = $this->_registry->get( 'model.api.api-ticketing' );
				}				
				$api->save_api_event_data( $event->get( 'post_id' ), $api_event_id, $api_url, $checkout_url, $currency );
			}			

			$wp_images_url  = $e->x_wp_image_url;
			if ( $wp_images_url && false === ai1ec_is_blank( $wp_images_url[1] ) ) {
				$images_arr = explode( ',', $wp_images_url[1] );
				foreach ( $images_arr as $key => $value ) {
					$images_arr[ $key ] = explode( ';', $value );
				}
				if ( count( $images_arr ) > 0 ) {
					update_post_meta( $event->get( 'post_id' ), '_featured_image', $images_arr );	
				}	
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
	 * Check if date-time specification has no (empty) time component.
	 *
	 * @param array $datetime Datetime array returned by iCalcreator.
	 *
	 * @return bool Timelessness.
	 */
	protected function _is_timeless( array $datetime ) {
		$timeless = true;
		foreach ( array( 'hour', 'min', 'sec' ) as $field ) {
			$timeless &= (
				isset( $datetime[$field] ) &&
				0 != $datetime[$field]
				)
				? false
				: true;
		}
		return $timeless;
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

	public function ai1ec_api_date_parser( $date_array ) {
		return date( 'Y-m-d H:i:s', mktime(
			$date_array['hourOfDay'],
			$date_array['minute'],
			$date_array['second'],
			$date_array['month'],
			$date_array['dayOfMonth'],
			$date_array['year'] ) );
	}

}