<?php
class Ai1ec_Ics_Import_Export_Engine implements Ai1ec_Import_Export_Engine {
	protected $_registry;
	function __construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry = $registry;
	}
	
	public function import( array $arguments ) {
		$cal = $this->_registry->get('vcalendar');
		if( $cal->parse( $arguments['source'] ) ) {
			return $this->add_vcalendar_events_to_db(
				$cal,
				$arguments
			);
		}
		throw new Ai1ec_Parse_Exception( 'The passed string is not a valid ics feed' );
	}

	public function export( array $arguments ) {
		;
	}
	
	/**
	 * _is_timeless method
	 *
	 * Check if date-time specification has no (empty) time component.
	 *
	 * @param array $datetime Datetime array returned by iCalcreator
	 *
	 * @return bool Timelessness
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
	 * add_vcalendar_events_to_db method
	 *
	 * Process vcalendar instance - add events to database
	 *
	 * @param vcalendar $v              Calendar to retrieve data from
	 * @param stdClass  $feed           Instance of feed (see Ai1ecIcs plugin)
	 * @param string    $comment_status WP comment status: 'open' or 'closed'
	 * @param int       $do_show_map    Map display status (DB boolean: 0 or 1)
	 *
	 * @return int Count of events added to database
	 */
	protected function _add_vcalendar_events_to_db(
		vcalendar $v,
		array $args
	) {
	
		global $ai1ec_events_helper;
		$feed = isset( $args['feed'] ) ? $args['feed'] : null;
		$comment_status = isset( $args['comment_status'] ) ? $args['comment_status'] : 'open';
		$do_show_map    = isset( $args['do_show_map'] ) ? $args['do_show_map'] : 0;
		$count = 0;
		$do_show_map = Ai1ec_Number_Utility::db_bool( $do_show_map );
		$v->sort();
		// Reverse the sort order, so that RECURRENCE-IDs are listed before the
		// defining recurrence events, and therefore take precedence during
		// caching.
		$v->components = array_reverse( $v->components );
	
		// TODO: select only VEVENT components that occur after, say, 1 month ago.
		// Maybe use $v->selectComponents(), which takes into account recurrence
	
		// Fetch default timezone in case individual properties don't define it
		$timezone = $v->getProperty( 'X-WR-TIMEZONE' );
		$timezone = (string)$timezone[1];
		// go over each event
		while ( $e = $v->getComponent( 'vevent' ) ) {
			// Event data array.
			$data = array();
			// =====================
			// = Start & end times =
			// =====================
			$start = $e->getProperty( 'dtstart', 1, true );
			$end   = $e->getProperty( 'dtend', 1, true );
			// For cases where a "VEVENT" calendar component
			// specifies a "DTSTART" property with a DATE value type but none
			// of "DTEND" nor "DURATION" property, the event duration is taken to
			// be one day.  For cases where a "VEVENT" calendar component
			// specifies a "DTSTART" property with a DATE-TIME value type but no
			// "DTEND" property, the event ends on the same calendar date and
			// time of day specified by the "DTSTART" property.
			if ( empty( $end ) )  {
				// #1 if duration is present, assign it to end time
				$end = $e->getProperty( 'duration', 1, true, true );
				if ( empty( $end ) ) {
					// #2 if only DATE value is set for start, set duration to 1 day
					if ( ! isset( $start['value']['hour'] ) ) {
						$end = array(
							'value' => array(
								'year'  => $start['value']['year'],
								'month' => $start['value']['month'],
								'day'   => $start['value']['day'] + 1,
								'hour'  => 0,
								'min'   => 0,
								'sec'   => 0,
								'tz'    => $start['value']['tz'],
							),
						);
					} else {
						// #3 set end date to start time
						$end = $start;
					}
				}
			}
	
			$categories = $e->getProperty( "CATEGORIES", false, true );
			$imported_cat = array();
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
			$tags = $e->getProperty( "X-TAGS", false, true );
	
	
			$imported_tags = array();
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
			$ms_allday = $e->getProperty( 'X-MICROSOFT-CDO-ALLDAYEVENT' );
			if ( ! empty( $ms_allday ) && $ms_allday[1] == 'TRUE' ) {
				$allday = true;
			}
	
			$start = $this->time_array_to_timestamp( $start, $timezone );
			$end   = $this->time_array_to_timestamp( $end,   $timezone );
	
			if ( false === $start || false === $end ) {
				trigger_error(
				'Failed to parse one or more dates given timezone "' .
				var_export( $timezone, true ) . '".',
				E_USER_WARNING
				);
				continue;
			}
	
			// If all-day, and start and end times are equal, then this event has
			// invalid end time (happens sometimes with poorly implemented iCalendar
			// exports, such as in The Event Calendar), so set end time to 1 day
			// after start time.
			if ( $allday && $start === $end ) {
				$end += 24 * 60 * 60;
			}
	
			$data += compact( 'start', 'end', 'allday' );
	
			// =======================================
			// = Recurrence rules & recurrence dates =
			// =======================================
			if ( $rrule = $e->createRrule() )
				$rrule = trim( end( explode( ':', $rrule ) ) );
			if ( $exrule = $e->createExrule() )
				$exrule = trim( end( explode( ':', $exrule ) ) );
			if ( $rdate = $e->createRdate() )
				$rdate = trim( end( explode( ':', $rdate ) ) );
	
			// ===================
			// = Exception dates =
			// ===================
			$exdate_array = array();
			if ( $exdates = $e->createExdate() ){
				// We may have two formats:
				// one exdate with many dates ot more EXDATE rules
				$exdates = explode( "EXDATE", $exdates );
				foreach ( $exdates as $exd ) {
					if ( empty( $exd ) ) {
						continue;
					}
					$exdate_array[] = trim( end( explode( ':', $exd ) ) );
				}
			}
			// This is the local string.
			$exdate_loc = implode( ',', $exdate_array );
			$gmt_exdates = array();
			// Now we convert the string to gmt. I must do it here
			// because EXDATE:date1,date2,date3 must be parsed
			if( ! empty( $exdate_loc ) ) {
				foreach ( explode( ',', $exdate_loc ) as $date ) {
					// If the date is > 8 char that's a datetime, we just want the
					// date part for the exclusion rules
					if ( strlen( $date ) > 8 ) {
						$date = substr( $date, 0, 8 );
					}
					$gmt_exdates[] = $ai1ec_events_helper->exception_dates_to_gmt( $date );
				}
			}
			$exdate = implode( ',', $gmt_exdates );
	
			// ========================
			// = Latitude & longitude =
			// ========================
			$latitude = $longitude = NULL;
			$geo_tag  = $e->getProperty( 'geo' );
			if ( is_array( $geo_tag ) ) {
				if (
				isset( $geo_tag['latitude'] ) &&
				isset( $geo_tag['longitude'] )
				) {
					$latitude  = (float)$geo_tag['latitude'];
					$longitude = (float)$geo_tag['longitude'];
				}
			} else if ( ! empty( $geo_tag ) && false !== strpos( $geo_tag, ';' ) ) {
				list( $latitude, $longitude ) = explode( ';', $geo_tag, 2 );
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
			$location = $e->getProperty( 'location' );
			$matches = array();
			// This regexp matches a venue / address in the format
			// "venue @ address" or "venue - address".
			preg_match( '/\s*(.*\S)\s+[\-@]\s+(.*)\s*/', $location, $matches );
			// if there is no match, it's not a combined venue + address
			if ( empty( $matches ) ) {
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
			if (
			1 === $do_show_map &&
			NULL === $latitude &&
			empty( $address )
			) {
				$do_show_map = 0;
			}
	
			// ==================
			// = Cost & tickets =
			// ==================
			$cost       = $e->getProperty( 'X-COST' );
			$cost       = $cost ? $cost[1] : '';
			$ticket_url = $e->getProperty( 'X-TICKETS-URL' );
			$ticket_url = $ticket_url ? $ticket_url[1] : '';
	
			// ===============================
			// = Contact name, phone, e-mail =
			// ===============================
			$organizer = $e->getProperty( 'organizer' );
			if (
			'MAILTO:' === substr( $organizer, 0, 7 ) &&
			false === strpos( $organizer, '@' )
			) {
				$organizer = substr( $organizer, 7 );
			}
			$contact = $e->getProperty( 'contact' );
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
				'show_map'          => $do_show_map,
				'ical_feed_url'     => $feed->feed_url,
				'ical_source_url'   => $e->getProperty( 'url' ),
				'ical_organizer'    => $organizer,
				'ical_contact'      => $contact,
				'ical_uid'          => $e->getProperty( 'uid' ),
				'categories'        => array_keys( $imported_cat ),
				'tags'              => array_keys( $imported_tags ),
				'feed'              => $feed,
				'post'              => array(
					'post_status'       => 'publish',
					'comment_status'    => $comment_status,
					'post_type'         => AI1EC_POST_TYPE,
					'post_author'       => 1,
					'post_title'        => $e->getProperty( 'summary' ),
					'post_content'      => stripslashes(
					str_replace(
					'\n',
					"\n",
					$e->getProperty( 'description' )
					)
				),
				),
			);
	
			// Create event object.
			$event = new Ai1ec_Event( $data );
	
			// TODO: when singular events change their times in an ICS feed from one
			// import to another, the matching_event_id is null, which is wrong. We
			// want to match that event that previously had a different time.
			// However, we also want the function to NOT return a matching event in
			// the case of recurring events, and different events with different
			// RECURRENCE-IDs... ponder how to solve this.. may require saving the
			// RECURRENCE-ID as another field in the database.
			$matching_event_id = $ai1ec_events_helper->get_matching_event_id(
					$event->ical_uid,
					$event->ical_feed_url,
					$event->start,
					! empty( $event->recurrence_rules )
			);
	
			if ( NULL === $matching_event_id ) {
				// =================================================
				// = Event was not found, so store it and the post =
				// =================================================
				$event->save();
			} else {
				// ======================================================
				// = Event was found, let's store the new event details =
				// ======================================================
	
				// Update the post
				$post               = get_post( $matching_event_id );
				$post->post_title   = $event->post->post_title;
				$post->post_content = $event->post->post_content;
				wp_update_post( $post );
	
				// Update the event
				$event->post_id = $matching_event_id;
				$event->post    = $post;
				$event->save( true );
	
				// Delete event's cache
				$ai1ec_events_helper->delete_event_cache( $matching_event_id );
			}
	
			// Regenerate event's cache
			$ai1ec_events_helper->cache_event( $event );
	
			$count++;
	}
	return $count;
	}
	
	/**
	 * Takes a comma-separated list of tags or categories.
	 * If they exist, reuses
	 * the existing ones. If not, creates them.
	 *
	 * The $imported_terms array uses keys to store values rather than values to
	 * speed up lookups (using isset() insted of in_array()).
	 *
	 * @param string $terms        	
	 * @param array $imported_terms        	
	 * @param boolean $is_tag        	
	 * @param boolean $use_name        	
	 * @return array
	 */
	private function add_categories_and_tags( $terms, array $imported_terms, 
			$is_tag, $use_name ) {
		$taxonomy = $is_tag ? 'events_tags' : 'events_categories';
		$categories = explode( ',', $terms );
		$get_term_by = $use_name ? 'name' : 'id';
		foreach ( $categories as $cat_name ) {
			$cat_name = trim( $cat_name );
			if ( empty( $cat_name ) ) {
				continue;
			}
			// check if the category exist
			$cat = get_term_by( $get_term_by, $cat_name, $taxonomy );
			// If it doesn't exist
			if ( false === $cat ) {
				$term = wp_insert_term( $cat_name, $taxonomy );
				if ( ! is_wp_error( $term ) ) {
					$imported_terms [$term ['term_id']] = true;
				}
			} else {
				$imported_terms [$cat->term_id] = true;
			}
		}
		return $imported_terms;
	}
}

?>