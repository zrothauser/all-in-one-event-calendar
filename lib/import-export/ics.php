<?php

/**
 * The ics import/export engine.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Import-export
 */
class Ai1ec_Ics_Import_Export_Engine extends Ai1ec_Base implements Ai1ec_Import_Export_Engine {

	/* (non-PHPdoc)
	 * @see Ai1ec_Import_Export_Engine::import()
	 */
	public function import( array $arguments ) {
		$cal = $this->_registry->get('vcalendar');
		if( $cal->parse( $arguments['source'] ) ) {
			return $this->_add_vcalendar_events_to_db(
				$cal,
				$arguments
			);
		}
		throw new Ai1ec_Parse_Exception( 'The passed string is not a valid ics feed' );
	}

	public function export( array $arguments ) {
		$c = new vcalendar();
		$c->setProperty( 'calscale', 'GREGORIAN' );
		$c->setProperty( 'method', 'PUBLISH' );
		// if no post id are specified do not export those properties
		// as they would create a new calendar in outlook.
		// a user reported this in AIOEC-982 and said this would fix it
		if( true === $arguments['do_not_export_as_calendar'] ) {
			$c->setProperty( 'X-WR-CALNAME', get_bloginfo( 'name' ) );
			$c->setProperty( 'X-WR-CALDESC', get_bloginfo( 'description' ) );
		}
		$c->setProperty( 'X-FROM-URL', home_url() );
		// Timezone setup
		$tz = $this->_registry->get( 'meta' )->get( 'timezone_string' );
		if ( $tz ) {
			$c->setProperty( 'X-WR-TIMEZONE', $tz );
			$tz_xprops = array( 'X-LIC-LOCATION' => $tz );
			iCalUtilityFunctions::createTimezone( $c, $tz, $tz_xprops );
		}

		foreach ( $arguments['events'] as $event ) {
			$c =$this->_insert_event_in_calendar( $event, $c, $export = true );
		}
		$str = ltrim( $c->createCalendar() );

		header( 'Content-type: text/calendar; charset=utf-8' );
		echo $str;
		exit;
	}

	/**
	 * get_uid_format method
	 *
	 * Get format of UID, to be used for current site.
	 * The generated format is cached in static variable within this function
	 *
	 * @return string Format to use when printing UIDs
	 *
	 * @staticvar string $format Cached format, to be returned
	 */
	public function get_uid_format() {
		static $format = NULL;
		if ( NULL === $format ) {
			$site_url = parse_url( get_site_url() );
			$format   = 'ai1ec-%d@' . $site_url['host'];
			if ( isset( $site_url['path'] ) ) {
				$format .= $site_url['path'];
			}
		}
		return $format;
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
		$feed           = isset( $args['feed'] ) ? $args['feed'] : null;
		$comment_status = isset( $args['comment_status'] ) ? $args['comment_status'] : 'open';
		$do_show_map    = isset( $args['do_show_map'] ) ? $args['do_show_map'] : 0;
		$count = 0;

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
				$imported_cat = $this->_add_categories_and_tags(
						$categories['value'],
						$imported_cat,
						false,
						true
				);
			}
			$feed_categories = $feed->feed_category;
			if( ! empty( $feed_categories ) ) {
				$imported_cat = $this->_add_categories_and_tags(
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
				$imported_tags = $this->_add_categories_and_tags(
						$tags[1]['value'],
						$imported_tags,
						true,
						true
				);
			}
			$feed_tags = $feed->feed_tags;
			if( ! empty( $feed_tags ) ) {
				$imported_tags = $this->_add_categories_and_tags(
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

			$start = $this->_time_array_to_timestamp( $start, $timezone );
			$end   = $this->_time_array_to_timestamp( $end,   $timezone );

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
			if ( $rrule = $e->createRrule() ) {
				$rrule = trim( end( explode( ':', $rrule ) ) );
			}

			if ( $exrule = $e->createExrule() ) {
				$exrule = trim( end( explode( ':', $exrule ) ) );
			}

			if ( $rdate = $e->createRdate() ) {
				$rdate = trim( end( explode( ':', $rdate ) ) );
			}


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
					$gmt_exdates[] = $this->_exception_dates_to( $date, true );
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
			$event = $this->_registry->get( 'model.event', $data );

			// TODO: when singular events change their times in an ICS feed from one
			// import to another, the matching_event_id is null, which is wrong. We
			// want to match that event that previously had a different time.
			// However, we also want the function to NOT return a matching event in
			// the case of recurring events, and different events with different
			// RECURRENCE-IDs... ponder how to solve this.. may require saving the
			// RECURRENCE-ID as another field in the database.
			$search_helper = $this->_registry->get( 'model.search' );
			$matching_event_id = $search_helper->get_matching_event_id(
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
	
				if ( null !== $post ) {
					$post->post_title   = $event->post->post_title;
					$post->post_content = $event->post->post_content;
					wp_update_post( $post );
					
					// Update the event
					$event->post_id = $matching_event_id;
					$event->post    = $post;
					$event->save( true );
					
					// Delete event's cache
					$search_helper->delete_event_cache( $matching_event_id );
				}

			}


			// Regenerate event's cache
			$search_helper->cache_event( $event );

			$count++;
		}
		return $count;
	}

	/**
	 * time_array_to_timestamp function
	 *
	 * Converts time array to time string.
	 * Passed array: Array( 'year', 'month', 'day', ['hour', 'min', 'sec', ['tz']] )
	 * Return int: UNIX timestamp in GMT
	 *
	 * @param array  $time         iCalcreator time property array (*full* format expected)
	 * @param string $def_timezone Default time zone in case not defined in $time
	 *
	 * @return int UNIX timestamp
	 **/
	protected function _time_array_to_timestamp( array $time, $def_timezone ) {
		$parseable = sprintf(
				'%4d-%02d-%02d',
				$time['value']['year'],
				$time['value']['month'],
				$time['value']['day']
		);
		if ( isset( $time['value']['hour'] ) ) {
			$parseable .= sprintf(
					' %02d:%02d:%02d',
					$time['value']['hour'],
					$time['value']['min'],
					$time['value']['sec']
			);
		}

		$timezone = '';
		if ( isset( $time['params']['TZID'] ) ) {
			$timezone = $time['params']['TZID'];
		} elseif (
				isset( $time['value']['tz'] ) &&
				'Z' === $time['value']['tz']
		) {
			$timezone = 'UTC';
		}
		if ( empty( $timezone ) ) {
			$timezone = $def_timezone;
		}

		if ( ! empty( $timezone ) ) {
			$parser = $this->_registry->get( 'parser.timezone' );
			$timezone = $parser->get_name( $timezone );
			if ( false === $timezone ) {
				return false;
			}
			$parseable .= ' ' . $timezone;
		}

		return strtotime( $parseable );
	}

	/**
	 * Convert an event from a feed into a new Ai1ec_Event object and add it to
	 * the calendar.
	 *
	 * @param Ai1ec_Event $event    Event object
	 * @param vcalendar   $calendar Calendar object
	 * @param bool        $export   States whether events are created for export
	 *
	 * @return void
	 */
	protected function _insert_event_in_calendar(
			Ai1ec_Event $event,
			vcalendar $calendar,
			$export = false
	) {
		global $ai1ec_events_helper;

		$tz  = $this->_registry->get( 'model.option' )
			->get( 'timezone_string' );

		$e   = & $calendar->newComponent( 'vevent' );
		$uid = '';
		if ( $event->ical_uid ) {
			$uid = addcslashes( $event->ical_uid, "\\;,\n" );
		} else {
			$uid = sprintf( $this->get_uid_format(), $event->post->ID );
		}
		$e->setProperty( 'uid', $this->_sanitize_value( $uid ) );
		$e->setProperty(
			'url',
			get_permalink( $event->post_id )
		);

		// =========================
		// = Summary & description =
		// =========================
		$e->setProperty(
			'summary',
			$this->_sanitize_value(
				html_entity_decode(
					apply_filters( 'the_title', $event->post->post_title ),
					ENT_QUOTES,
					'UTF-8'
				)
			)
		);
		$content = apply_filters( 'the_content', $event->post->post_content );
		$content = str_replace(']]>', ']]&gt;', $content);
		$content = html_entity_decode( $content, ENT_QUOTES, 'UTF-8' );
		// Prepend featured image if available.
		$size = null;
		if ( $img_url = $event->get_post_thumbnail_url( $size ) ) {
			$content = '<div class="ai1ec-event-avatar alignleft timely"><img src="' .
					esc_attr( $img_url ) . '" width="' . $size[0] . '" height="' .
					$size[1] . '" /></div>' . $content;
		}
		$e->setProperty( 'description', $this->_sanitize_value( $content ) );

		// =====================
		// = Start & end times =
		// =====================
		$dtstartstring = '';
		$dtstart = $dtend = array();
		if ( $event->allday ) {
			$dtstart["VALUE"] = $dtend["VALUE"] = 'DATE';
			// For exporting all day events, don't set a timezone
			if ( $tz && !$export ) {
				$dtstart["TZID"] = $dtend["TZID"] = $tz;
			}

			// For exportin' all day events, only set the date not the time
			if ( $export ) {
				$e->setProperty(
					'dtstart',
					$this->_sanitize_value( gmdate(
						"Ymd",
						$event->start->format()
					) ),
					$dtstart
				);
				$e->setProperty(
					'dtend',
					$this->_sanitize_value( gmdate(
						"Ymd",
						$event->end->format()
					) ),
					$dtend
				);
			} else {
				$e->setProperty(
					'dtstart',
					$this->_sanitize_value(
						gmdate(
							"Ymd\T",
							$event->start->format()
						)
					),
					$dtstart
				);
				$e->setProperty(
					'dtend',
					$this->_sanitize_value( gmdate(
							"Ymd\T",
							$event->end->format()
					) ),
					$dtend
				);
			}
		} else {
			if ( $tz ) {
				$dtstart["TZID"] = $dtend["TZID"] = $tz;
			}
			// This is used later.
			$dtstartstring = gmdate(
				"Ymd\THis",
				$event->start->format()
			);
			$e->setProperty(
				'dtstart',
				$this->_sanitize_value( $dtstartstring ),
				$dtstart
			);

			$e->setProperty(
				'dtend',
				$this->_sanitize_value( gmdate(
						"Ymd\THis",
						$event->end->format()
				) ),
				$dtend
			);
		}

		// ========================
		// = Latitude & longitude =
		// ========================
		if ( floatval( $event->latitude ) || floatval( $event->longitude ) ) {
			$e->setProperty( 'geo', $event->latitude, $event->longitude );
		}

		// ===================
		// = Venue & address =
		// ===================
		if ( $event->venue || $event->address ) {
			$location = array( $event->venue, $event->address );
			$location = array_filter( $location );
			$location = implode( ' @ ', $location );
			$e->setProperty( 'location', $this->_sanitize_value( $location ) );
		}

		$categories = array();
		$language = get_bloginfo( 'language' );
		foreach( wp_get_post_terms( $event->post_id, 'events_categories' ) as $cat ) {
			$categories[] = $cat->name;
		}
		$e->setProperty(
			'categories',
			implode( ',', $categories ),
			array( "LANGUAGE" => $language )
		);
		$tags = array();
		foreach( wp_get_post_terms( $event->post_id, 'events_tags' ) as $tag ) {
			$tags[] = $tag->name;
		}
		if( ! empty( $tags) ) {
			$e->setProperty(
				'X-TAGS',
				implode( ',', $tags ),
				array( "LANGUAGE" => $language )
			);
		}
		// ==================
		// = Cost & tickets =
		// ==================
		if ( $event->cost ) {
			$e->setProperty( 'X-COST', $this->_sanitize_value( $event->cost ) );
		}
		if ( $event->ticket_url ) {
			$e->setProperty(
				'X-TICKETS-URL',
				$this->_sanitize_value( $event->ticket_url )
			);
		}

		// ====================================
		// = Contact name, phone, e-mail, URL =
		// ====================================
		$contact = array(
			$event->contact_name,
			$event->contact_phone,
			$event->contact_email,
			$event->contact_url,
		);
		$contact = array_filter( $contact );
		$contact = implode( '; ', $contact );
		$e->setProperty( 'contact', $this->_sanitize_value( $contact ) );

		// ====================
		// = Recurrence rules =
		// ====================
		$rrule = array();
		if ( ! empty( $event->recurrence_rules ) ) {
			$rules = array();
			foreach ( explode( ';', $event->recurrence_rules ) as $v) {
				if ( strpos( $v, '=' ) === false ) {
					continue;
				}

				list( $k, $v ) = explode( '=', $v );
				$k = strtoupper( $k );
				// If $v is a comma-separated list, turn it into array for iCalcreator
				switch ( $k ) {
					case 'BYSECOND':
					case 'BYMINUTE':
					case 'BYHOUR':
					case 'BYDAY':
					case 'BYMONTHDAY':
					case 'BYYEARDAY':
					case 'BYWEEKNO':
					case 'BYMONTH':
					case 'BYSETPOS':
						$exploded = explode( ',', $v );
						break;
					default:
						$exploded = $v;
						break;
				}
				// iCalcreator requires a more complex array structure for BYDAY...
				if ( $k == 'BYDAY' ) {
					$v = array();
					foreach ( $exploded as $day ) {
						$v[] = array( 'DAY' => $day );
					}
				} else {
					$v = $exploded;
				}
				$rrule[ $k ] = $v;
			}
		}

		// ===================
		// = Exception rules =
		// ===================
		$exrule = array();
		if ( ! empty( $event->exception_rules ) ) {
			$rules = array();
			foreach ( explode( ';', $event->exception_rules ) as $v) {
				if ( strpos( $v, '=' ) === false ) {
					continue;
				}

				list($k, $v) = explode( '=', $v );
				$k = strtoupper( $k );
				// If $v is a comma-separated list, turn it into array for iCalcreator
				switch ( $k ) {
					case 'BYSECOND':
					case 'BYMINUTE':
					case 'BYHOUR':
					case 'BYDAY':
					case 'BYMONTHDAY':
					case 'BYYEARDAY':
					case 'BYWEEKNO':
					case 'BYMONTH':
					case 'BYSETPOS':
						$exploded = explode( ',', $v );
						break;
					default:
						$exploded = $v;
						break;
				}
				// iCalcreator requires a more complex array structure for BYDAY...
				if ( $k == 'BYDAY' ) {
					$v = array();
					foreach ( $exploded as $day ) {
						$v[] = array( 'DAY' => $day );
					}
				} else {
					$v = $exploded;
				}
				$exrule[ $k ] = $v;
			}
		}

		// add rrule to exported calendar
		if ( ! empty( $rrule ) ) {
			$e->setProperty( 'rrule', $this->_sanitize_value( $rrule ) );
		}
		// add exrule to exported calendar
		if ( ! empty( $exrule ) ) {
			$e->setProperty( 'exrule', $this->_sanitize_value( $exrule ) );
		}

		// ===================
		// = Exception dates =
		// ===================
		// For all day events that use a date as DTSTART, date must be supplied
		// For other other events which use DATETIME, we must use that as well
		// We must also match the exact starting time
		if ( ! empty( $event->exception_dates ) ) {
			foreach( explode( ',', $event->exception_dates ) as $exdate ) {
				if( $event->allday ) {
					// the local date will be always something like 20121122T000000Z
					// we just need the date
					$exdate = substr(
						$ai1ec_events_helper->_exception_dates_to( $exdate ),
						0,
						8
					);
					$e->setProperty( 'exdate', array( $exdate ), array( 'VALUE' => 'DATE' ) );
				} else {
					$params = array();
					if( $tz ) {
						$params["TZID"] = $tz;
					}
					$exdate = $ai1ec_events_helper->_exception_dates_to( $exdate );
					// get only the date + T
					$exdate = substr(
						$exdate,
						0,
						9
					);
					// Take the time from
					$exdate .= substr( $dtstartstring, 9 );
					$e->setProperty(
							'exdate',
							array( $exdate ),
							$params
					);
				}
			}
		}
		return $calendar;
	}

	/**
	 * _sanitize_value method
	 *
	 * Convert value, so it be safe to use on ICS feed. Used before passing to
	 * iCalcreator methods, for rendering.
	 *
	 * @param string $value Text to be sanitized
	 *
	 * @return string Safe value, for use in HTML
	 */
	protected function _sanitize_value( $value ) {
		if ( ! is_scalar( $value ) ) {
			return $value;
		}
		$safe_eol = "\n";
		$value    = strtr(
				trim( $value ),
				array(
					"\r\n" => $safe_eol,
					"\r"   => $safe_eol,
					"\n"   => $safe_eol,
				)
		);
		$value = addcslashes( $value, '\\' );
		return $value;
	}

	/**
	 * exception_dates_to function
	 *
	 * @return string
	 **/
	protected function _exception_dates_to( $exception_dates, $to_gmt = false ) {
		trigger_error( "need to implement this", E_USER_ERROR );
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
	protected function _add_categories_and_tags( $terms, array $imported_terms,
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
					$imported_terms[$term ['term_id']] = true;
				}
			} else {
				$imported_terms[$cat->term_id] = true;
			}
		}
		return $imported_terms;
	}
}