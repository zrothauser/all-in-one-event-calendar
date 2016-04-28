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
class Ai1ec_Ics_Import_Export_Engine
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

	/* (non-PHPdoc)
	 * @see Ai1ec_Import_Export_Engine::import()
	 */
	public function import( array $arguments ) {	
		throw new Exception( 'Import not supported' );	
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Import_Export_Engine::export()
	 */
	public function export( array $arguments, array $params = array() ) {
		$vparams = array();
		if ( isset( $params['xml'] ) && true === $params['xml'] ) {
			$vparams['format'] = 'xcal';
		}
		$c = new vcalendar( $vparams );
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
		$tz = $this->_registry->get( 'date.timezone' )->get_default_timezone();
		if ( $tz ) {
			$c->setProperty( 'X-WR-TIMEZONE', $tz );
			$tz_xprops = array( 'X-LIC-LOCATION' => $tz );
			iCalUtilityFunctions::createTimezone( $c, $tz, $tz_xprops );
		}

		$this->_taxonomy_model = $this->_registry->get( 'model.taxonomy' );
		$post_ids = array();
		foreach ( $arguments['events'] as $event ) {
			$post_ids[] = $event->get( 'post_id' );
		}
		$this->_taxonomy_model->prepare_meta_for_ics( $post_ids );
		$this->_registry->get( 'controller.content-filter' )
			->clear_the_content_filters();
		foreach ( $arguments['events'] as $event ) {
			$c = $this->_insert_event_in_calendar(
				$event,
				$c,
				true,
				$params
			);
		}
		$this->_registry->get( 'controller.content-filter' )
			->restore_the_content_filters();
		$str = ltrim( $c->createCalendar() );
		return $str;
	}

	/**
	 * Convert an event from a feed into a new Ai1ec_Event object and add it to
	 * the calendar.
	 *
	 * @param Ai1ec_Event $event    Event object.
	 * @param vcalendar   $calendar Calendar object.
	 * @param bool        $export   States whether events are created for export.
	 * @param array       $params   Additional parameters for export.
	 *
	 * @return void
	 */
	protected function _insert_event_in_calendar(
			Ai1ec_Event $event,
			vcalendar $calendar,
			$export = false,
			array $params = array()
	) {

		$tz  = $this->_registry->get( 'date.timezone' )
			->get_default_timezone();

		$e   = & $calendar->newComponent( 'vevent' );
		$uid = '';
		if ( $event->get( 'ical_uid' ) ) {
			$uid = addcslashes( $event->get( 'ical_uid' ), "\\;,\n" );
		} else {
			$uid = $event->get_uid();
			$event->set( 'ical_uid', $uid );
			$event->save( true );
		}
		$e->setProperty( 'uid', $this->_sanitize_value( $uid ) );
		$e->setProperty(
			'url',
			get_permalink( $event->get( 'post_id' ) )
		);

		// =========================
		// = Summary & description =
		// =========================
		$e->setProperty(
			'summary',
			$this->_sanitize_value(
				html_entity_decode(
					apply_filters( 'the_title', $event->get( 'post' )->post_title ),
					ENT_QUOTES,
					'UTF-8'
				)
			)
		);

		$content = apply_filters(
			'ai1ec_the_content',
			apply_filters(
				'the_content',
				$event->get( 'post' )->post_content
			)
		);

		$post_meta_values = get_post_meta( $event->get( 'post_id' ), '', false );
		$cost_type        = null;
		if ( $post_meta_values ) {
			foreach ($post_meta_values as $key => $value) {				
				if ( '_ai1ec_cost_type' === $key ) {
					$cost_type    = $value[0];
				}
				if (
					isset( $params['xml'] ) &&
					$params['xml'] &&
					false !== preg_match( '/^x\-meta\-/i', $key )
				) {
					$e->setProperty(
						$key,
						$this->_sanitize_value( $value )
					);
				}
 			}
		}

		if ( false === ai1ec_is_blank( $cost_type ) ) {
			$e->setProperty(
				'X-COST-TYPE',
				$this->_sanitize_value( $cost_type )
			);
		}
		
		$url          = '';
		$api          = $this->_registry->get( 'model.api.api-ticketing' );
		$api_event_id = $api->get_api_event_id( $event->get( 'post_id' ) );
		if ( $api_event_id ) {
			//getting all necessary informations that will be necessary on imported ticket events		
			$e->setProperty( 'X-API-EVENT-ID'      , $api_event_id );
			$e->setProperty( 'X-API-URL'           , $api->get_api_event_url( $event->get( 'post_id' ) ) );
			$e->setProperty( 'X-CHECKOUT-URL'      , $api->get_api_event_checkout_url( $event->get( 'post_id' ) ) );
			$e->setProperty( 'X-API-EVENT-CURRENCY', $api->get_api_event_currency( $event->get( 'post_id' ) ) );
		} else if ( $event->get( 'ticket_url' ) ) {					
			$url = $event->get( 'ticket_url' );
		}

		//Adding Ticket URL to the Description field
		if ( false === ai1ec_is_blank( $url ) ) {
			$content = $this->_remove_ticket_url( $content );	
			$content = $content
		             . '<p>' . __( 'Tickets: ', AI1EC_PLUGIN_NAME )
		             . '<a class="ai1ec-ticket-url-exported" href="'
		             . $url . '">' . $url
		             . '</a>.</p>'; 
		}

		$content = str_replace(']]>', ']]&gt;', $content);
		$content = html_entity_decode( $content, ENT_QUOTES, 'UTF-8' );

		// Prepend featured image if available.
		$size = null;
		$avatar = $this->_registry->get( 'view.event.avatar' );
		$matches = $avatar->get_image_from_content( $content );
		// if no img is already present - add thumbnail
		if ( empty( $matches ) ) {
			if ( $img_url = $avatar->get_post_thumbnail_url( $event, $size ) ) {
				$content = '<div class="ai1ec-event-avatar alignleft timely"><img src="' .
					esc_attr( $img_url ) . '" width="' . $size[0] . '" height="' .
					$size[1] . '" /></div>' . $content;
			}
		}

		if ( isset( $params['no_html'] ) && $params['no_html'] ) {
			$e->setProperty(
				'description',
				$this->_sanitize_value(
					strip_tags( strip_shortcodes( $content ) )
				)
			);
			if ( ! empty( $content ) ) {
				$html_content = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">\n' .
					'<HTML>\n<HEAD>\n<TITLE></TITLE>\n</HEAD>\n<BODY>' . $content .
					'</BODY></HTML>';
				$e->setProperty(
					'X-ALT-DESC',
					$this->_sanitize_value( $html_content ),
					array(
						'FMTTYPE' => 'text/html',
					)
				);
				unset( $html_content );
			}
		} else {
			$e->setProperty( 'description', $this->_sanitize_value( $content ) );
		}
		$revision = (int)current(
			array_keys(
				wp_get_post_revisions( $event->get( 'post_id' ) )
			)
		);
		$e->setProperty( 'sequence', $revision );

		// =====================
		// = Start & end times =
		// =====================
		$dtstartstring = '';
		$dtstart = $dtend = array();
		if ( $event->is_allday() ) {
			$dtstart['VALUE'] = $dtend['VALUE'] = 'DATE';
			// For exporting all day events, don't set a timezone
			if ( $tz && ! $export ) {
				$dtstart['TZID'] = $dtend['TZID'] = $tz;
			}

			// For exportin' all day events, only set the date not the time
			if ( $export ) {
				$e->setProperty(
					'dtstart',
					$this->_sanitize_value(
						$event->get( 'start' )->format( 'Ymd' )
					),
					$dtstart
				);
				$e->setProperty(
					'dtend',
					$this->_sanitize_value(
						$event->get( 'end' )->format( 'Ymd' )
					),
					$dtend
				);
			} else {
				$e->setProperty(
					'dtstart',
					$this->_sanitize_value(
						$event->get( 'start' )->format( "Ymd\T" )
					),
					$dtstart
				);
				$e->setProperty(
					'dtend',
					$this->_sanitize_value(
						$event->get( 'end' )->format( "Ymd\T" )
					),
					$dtend
				);
			}
		} else {
			if ( $tz ) {
				$dtstart['TZID'] = $dtend['TZID'] = $tz;
			}
			// This is used later.
			$dtstartstring = $event->get( 'start' )->format( "Ymd\THis" );
			$e->setProperty(
				'dtstart',
				$this->_sanitize_value( $dtstartstring ),
				$dtstart
			);

			if ( false === (bool)$event->get( 'instant_event' ) ) {
				$e->setProperty(
					'dtend',
					$this->_sanitize_value(
						$event->get( 'end' )->format( "Ymd\THis" )
					),
					$dtend
				);
			}
		}

		// ========================
		// = Latitude & longitude =
		// ========================
		if (
			floatval( $event->get( 'latitude' ) ) ||
			floatval( $event->get( 'longitude' ) )
		) {
			$e->setProperty(
				'geo',
				$event->get( 'latitude' ),
				$event->get( 'longitude' )
			);
		}

		// ===================
		// = Venue & address =
		// ===================
		if ( $event->get( 'venue' ) || $event->get( 'address' ) ) {
			$location = array(
				$event->get( 'venue' ),
				$event->get( 'address' )
			);
			$location = array_filter( $location );
			$location = implode( ' @ ', $location );
			$e->setProperty( 'location', $this->_sanitize_value( $location ) );
		}

		$categories = array();
		$language   = get_bloginfo( 'language' );

		foreach (
			$this->_taxonomy_model->get_post_categories(
				$event->get( 'post_id' )
			)
			as $cat
		) {
			if ( 'events_categories' === $cat->taxonomy ) {
				$categories[] = $cat->name;
			}			
		}
		$e->setProperty(
			'categories',
			implode( ',', $categories ),
			array( "LANGUAGE" => $language )
		);
		$tags = array();
		foreach (
			$this->_taxonomy_model->get_post_tags( $event->get( 'post_id' ) )
			as $tag
		) {
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
		if ( $event->get( 'cost' ) ) {
			$e->setProperty(
				'X-COST',
				$this->_sanitize_value( $event->get( 'cost' ) )
			);
		}
		if ( $event->get( 'ticket_url' ) ) {
			$e->setProperty(
				'X-TICKETS-URL',
				$this->_sanitize_value(
					$event->get( 'ticket_url' )
				)
			);
		}
		// =================
		// = Instant Event =
		// =================
		if ( $event->is_instant() ) {
			$e->setProperty(
				'X-INSTANT-EVENT',
				$this->_sanitize_value( $event->is_instant() )
			);
		}

		// ====================================
		// = Contact name, phone, e-mail, URL =
		// ====================================
		$contact = array(
			$event->get( 'contact_name' ),
			$event->get( 'contact_phone' ),
			$event->get( 'contact_email' ),
			$event->get( 'contact_url' ),
		);
		$contact = array_filter( $contact );
		$contact = implode( '; ', $contact );
		$e->setProperty( 'contact', $this->_sanitize_value( $contact ) );

		// ====================
		// = Recurrence rules =
		// ====================
		$rrule = array();
		$recurrence = $event->get( 'recurrence_rules' );
		$recurrence = $this->_filter_rule( $recurrence );
		if ( ! empty( $recurrence ) ) {
			$rules = array();
			foreach ( explode( ';', $recurrence ) as $v) {
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
		$exceptions = $event->get( 'exception_rules' );
		$exceptions = $this->_filter_rule( $exceptions );
		$exrule = array();
		if ( ! empty( $exceptions ) ) {
			$rules = array();

			foreach ( explode( ';', $exceptions ) as $v) {
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
		if ( ! empty( $rrule ) && ! isset( $rrule['RDATE'] ) ) {
			$e->setProperty( 'rrule', $this->_sanitize_value( $rrule ) );
		}
		// add exrule to exported calendar
		if ( ! empty( $exrule ) && ! isset( $exrule['EXDATE'] ) ) {
			$e->setProperty( 'exrule', $this->_sanitize_value( $exrule ) );
		}

		// ===================
		// = Exception dates =
		// ===================
		// For all day events that use a date as DTSTART, date must be supplied
		// For other other events which use DATETIME, we must use that as well
		// We must also match the exact starting time
		$recurrence_dates = $event->get( 'recurrence_dates' );
		$recurrence_dates = $this->_filter_rule( $recurrence_dates );
		if ( ! empty( $recurrence_dates ) ) {
			$params    = array(
				'VALUE' => 'DATE-TIME',
				'TZID'  => $tz,
			);
			$dt_suffix = $event->get( 'start' )->format( '\THis' );
			foreach (
				explode( ',', $recurrence_dates )
				as $exdate
			) {
				// date-time string in EXDATES is formatted as 'Ymd\THis\Z', that
				// means - in UTC timezone, thus we use `format_to_gmt` here.
				$exdate = $this->_registry->get( 'date.time', $exdate )
					->format_to_gmt( 'Ymd' );
				$e->setProperty(
					'rdate',
					array( $exdate . $dt_suffix ),
					$params
				);
			}
		}
		$exception_dates = $event->get( 'exception_dates' );
		$exception_dates = $this->_filter_rule( $exception_dates );
		if ( ! empty( $exception_dates ) ) {
			$params    = array(
				'VALUE' => 'DATE-TIME',
				'TZID'  => $tz,
			);
			$dt_suffix = $event->get( 'start' )->format( '\THis' );
			foreach (
				explode( ',', $exception_dates )
				as $exdate
			) {
				// date-time string in EXDATES is formatted as 'Ymd\THis\Z', that
				// means - in UTC timezone, thus we use `format_to_gmt` here.
				$exdate = $this->_registry->get( 'date.time', $exdate )
					->format_to_gmt( 'Ymd' );
				$e->setProperty(
					'exdate',
					array( $exdate . $dt_suffix ),
					$params
				);
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
		$terms,
		array $imported_terms,
		$is_tag,
		$use_name
	) {
		$taxonomy       = $is_tag ? 'events_tags' : 'events_categories';
		$categories     = explode( ',', $terms );
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
	 * Returns modified ical uid for google recurring edited events.
	 *
	 * @param vevent $e Vevent object.
	 *
	 * @return string ICAL uid.
	 */
	protected function _get_ical_uid( $e ) {
		$ical_uid      = $e->getProperty( 'uid' );
		$recurrence_id = $e->getProperty( 'recurrence-id' );
		if ( false !== $recurrence_id ) {
			$ical_uid = implode( '', array_values( $recurrence_id ) ) . '-' .
				$ical_uid;
		}

		return $ical_uid;
	}

	/**
	 * Returns modified exclusions structure for given event.
	 *
	 * @param vcalendar       $e          Vcalendar event object.
	 * @param array           $exclusions Exclusions.
	 * @param Ai1ec_Date_Time $start Date time object.
	 *
	 * @return array Modified exclusions structure.
	 */
	protected function _add_recurring_events_exclusions( $e, $exclusions, $start ) {
		$recurrence_id = $e->getProperty( 'recurrence-id' );
		if (
			false === $recurrence_id ||
			! isset( $recurrence_id['year'] ) ||
			! isset( $recurrence_id['month'] ) ||
			! isset( $recurrence_id['day'] )
		) {
			return $exclusions;
		}
		$year = $month = $day = $hour = $min = $sec = null;
		extract( $recurrence_id, EXTR_IF_EXISTS );
		$timezone = '';
		$exdate   = sprintf( '%04d%02d%02d', $year, $month, $day );
		if (
			null === $hour ||
			null === $min ||
			null === $sec
		) {
			$hour = $min = $sec = '00';
			$timezone = 'Z';
		}
		$exdate .= sprintf(
			'T%02d%02d%02d%s',
			$hour,
			$min,
			$sec,
			$timezone
		);
		$exclusions[$e->getProperty( 'uid' )][] = $exdate;
		return $exclusions;
	}

	/**
	 * Filter recurrence / exclusion rule or dates. Avoid throwing exception for old, malformed values.
	 *
	 * @param string $rule Rule or dates value.
	 *
	 * @return string Fixed rule or dates value.
	 */
	protected function _filter_rule( $rule ) {
		if ( null === $this->_rule_filter ) {
			$this->_rule_filter = $this->_registry->get( 'recurrence.rule' );
		}
		return $this->_rule_filter->filter_rule( $rule );
	}

	/**
	 * Remove the Ticket URL that maybe exists inside the field Description of the Event
	 */
	protected function _remove_ticket_url( $description ) {
		return preg_replace( '/<p>[^<>]+<a[^<>]+class=[\'"]?ai1ec-ticket-url-exported[\'"]?[^<>]+>.[^<>]+<\/a>[\.\s]*<\/p>/'
				, ''
				, $description );
	}

}
