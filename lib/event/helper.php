<?php

/**
 * An helper class for events.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Events
 */
class Ai1ec_Event_Helper extends Ai1ec_Base {

	/**
	 * get_category_color function
	 *
	 * Returns the color of the Event Category having the given term ID.
	 *
	 * @param int $term_id The ID of the Event Category
	 *
	 * @return string Color to use
	 *
	 * @staticvar Ai1ec_Memory_Utility $colors Cached entries instance
	 */
	public function get_category_color( $term_id ) {
		static $colors = null;
		if ( null === $colors ) {
			$colors  = array();
			$results = $this->_registry->get( 'dbi.dbi' )->select(
				'ai1ec_event_category_colors',
				array( 'term_id', 'term_color' )
			);
			foreach ( $results as $row ) {
				$colors[(int)$row->term_id] = $row->term_color;
			}
		}
		$term_id = (int)$term_id;
		if ( ! isset( $colors[$term_id] ) ) {
			return null;
		}
		return $colors[$term_id];
	}

	/**
	 * trim_excerpt function
	 *
	 * Generates an excerpt from the given content string. Adapted from
	 * WordPress's `wp_trim_excerpt' function that is not useful for applying
	 * to custom content.
	 *
	 * @param string $text The content to trim.
	 *
	 * @return string      The excerpt.
	 **/
	public function trim_excerpt( $text ) {
		$raw_excerpt    = $text;

		$text           = preg_replace(
			'#<\s*script[^>]*>.+<\s*/\s*script\s*>#x',
			'',
			$text
		);
		$text           = strip_shortcodes( $text );
		$text           = str_replace( ']]>', ']]&gt;', $text );
		$text           = strip_tags( $text );

		$excerpt_length = apply_filters( 'excerpt_length', 55 );
		$excerpt_more   = apply_filters( 'excerpt_more', ' [...]' );
		$words          = preg_split(
			"/\s+/",
			$text,
			$excerpt_length + 1,
			PREG_SPLIT_NO_EMPTY
		);
		if ( count( $words ) > $excerpt_length ) {
			array_pop( $words );
			$text = implode( ' ', $words );
			$text = $text . $excerpt_more;
		} else {
			$text = implode( ' ', $words );
		}
		return apply_filters( 'wp_trim_excerpt', $text, $raw_excerpt );
	}

	/**
	 * event_parent method
	 *
	 * Get/set event parent
	 *
	 * @param int $event_id    ID of checked event
	 * @param int $parent_id   ID of new parent [optional=NULL, acts as getter]
	 * @param int $instance_id ID of old instance id
	 *
	 * @return int|bool Value depends on mode:
	 *     Getter: {@see self::get_parent_event()} for details
	 *     Setter: true on success.
	 */
	public function event_parent(
		$event_id,
		$parent_id   = NULL,
		$instance_id = NULL
	) {
		$meta_key = '_ai1ec_event_parent';
		if ( NULL === $parent_id ) {
			return $this->get_parent_event( $event_id );
		}
		$meta_value = json_encode( array(
			'created'  => Ai1ec_Time_Utility::current_time(),
			'instance' => $instance_id,
		) );
		return add_post_meta( $event_id, $meta_key, $meta_value, true );
	}

	/**
	 * Get parent ID for given event
	 *
	 * @param int $current_id Current event ID
	 *
	 * @return int|bool ID of parent event or bool(false)
	 */
	public function get_parent_event( $current_id ) {
		static $parents = NULL;
		if ( NULL === $parents ) {
			$parents = $this->_registry->get( 'cache.memory' );
		}
		$current_id = (int)$current_id;
		if ( NULL === ( $parent_id = $parents->get( $current_id ) ) ) {
			$dbi = $this->_registry->get( 'Ai1ec_Dbi' );
			$query      = '
				SELECT parent.ID, parent.post_status
				FROM
					' . $dbi->get_table_name( 'posts' ) . ' AS child
					INNER JOIN ' . $dbi->get_table_name( 'posts' ) . ' AS parent
						ON ( parent.ID = child.post_parent )
				WHERE child.ID = ' . $current_id;
			$parent     = $dbi->get_row( $query );
			if (
				empty( $parent ) ||
				'trash' === $parent->post_status
			) {
				$parent_id = false;
			} else {
				$parent_id = $parent->ID;
			}
			$parents->set( $current_id, $parent_id );
			unset( $query );
		}
		return $parent_id;
	}

    /**
     * Returns the UNIX timestamp adjusted from the local timezone to GMT.
     *
     * @param int $timestamp
     *
     * @return int
     */
    public function local_to_gmt( $timestamp ) {
        return $this->_registry->get( 'Ai1ec_Time_Utility' )->local_to_gmt( $timestamp );
    }

    /**
     * delete_event_cache function
     *
     * Delete cache of event
     *
     * @param int $pid Event post ID
     *
     **/
    public function delete_event_cache( $pid ) {
        return $this->_registry->get( 'Ai1ec_Events_List_Helper' )->delete_event_cache( $pid );
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
     **/
    public function cache_event( Ai1ec_Event& $event ) {

        // Convert event timestamps to local for correct calculations of
        // recurrence. Need to also remove PHP timezone offset for each date for
        // SG_iCal to calculate correct recurring instances.
        $event->start = $this->gmt_to_local( $event->start )
            - date( 'Z', $event->start );
        $event->end   = $this->gmt_to_local( $event->end )
            - date( 'Z', $event->end );

        $evs = array();
        $e	 = array(
            'post_id' => $event->post_id,
            'start'   => $event->start,
            'end'     => $event->end,
        );
        $duration = $event->getDuration();

        // Timestamp of today date + 3 years (94608000 seconds)
        $tif = $this->_registry->get( 'Ai1ec_Time_Utility' )->current_time( true ) + 94608000;
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
            if ( $event->exception_rules ) {
                // creat an array for the rules
                $exception_rules = $this->build_recurrence_rules_array( $event->exception_rules );
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
            $recurrence_rules = $this->build_recurrence_rules_array( $event->recurrence_rules );
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
            $start = $this->local_to_gmt( $e['start'] )
                - date( 'Z', $e['start'] );
            $matching_event_id = $event->ical_uid ?
                $this->get_matching_event_id(
                    $event->ical_uid,
                    $event->ical_feed_url,
                    $start,
                    false,	// Only search events that does not define
                    // recurrence (i.e. only search for RECURRENCE-ID events)
                    $event->post_id
                )
                : NULL;


            // If no other instance was found
            if ( NULL === $matching_event_id ) {
                $start = getdate( $e['start'] );
                $end   = getdate( $e['end'] );
                $this->insert_event_in_cache_table( $e );
            }
        }

        return $this->_registry->get( 'Ai1ec_Events_List_Helper' )->clean_post_cache(
            $event->post_id
        );
    }

    /**
     * Returns the UNIX timestamp adjusted to the local timezone.
     *
     * @param int $timestamp
     *
     * @return int
     */
    public function gmt_to_local( $timestamp ) {
        return $this->_registry->get( 'Ai1ec_Time_Utility' )->gmt_to_local( $timestamp );
    }

    /**
     * Parse a `recurrence rule' into an array that can be used to calculate
     * recurrence instances.
     *
     * @see http://kigkonsult.se/iCalcreator/docs/using.html#EXRULE
     *
     * @param string $rule
     * @return array
     */
    private function build_recurrence_rules_array( $rule ) {
        $rules     = array();
        $rule_list = explode( ';', $rule );
        foreach ( $rule_list as $single_rule ) {
            if ( false === strpos( $single_rule, '=' ) ) {
                continue;
            }
            list( $key, $val ) = explode( '=', $single_rule );
            $key               = strtoupper( $key );
            switch ( $key ) {
                case 'BYDAY':
                    $rules['BYDAY'] = array();
                    foreach ( explode( ',', $val ) as $day ) {
                        $rule_map = $this->create_byday_array( $day );
                        $rules['BYDAY'][] = $rule_map;
                        if (
                            preg_match( '/FREQ=(MONTH|YEAR)LY/i', $rule ) &&
                            1 === count( $rule_map )
                        ) {
                            // monthly/yearly "last" recurrences need day name
                            $rules['BYDAY']['DAY'] = substr(
                                $rule_map['DAY'],
                                -2
                            );
                        }
                    }
                    break;

                case 'BYMONTHDAY':
                case 'BYMONTH':
                    if ( false === strpos( $val, ',' ) ) {
                        $rules[$key] = $val;
                    } else {
                        $rules[$key] = explode( ',', $val );
                    }
                    break;

                default:
                    $rules[$key] = $val;
            }
        }
        return $rules;
    }

    /**
     * date_match_exdates function
     *
     * @return bool
     **/
    public function date_match_exdates( $date, $ics_rule ) {
        foreach ( explode( ',', $ics_rule ) as $_date ) {
            // convert to timestamp
            $_date_start = strtotime( $_date );
            // convert from UTC to local time
            $_date_start = $this->gmt_to_local( $_date_start ) - date( 'Z', $_date_start );
            if( $_date_start != false ) {
                // add 23h 59m 59s so the whole day is excluded
                $_date_end = $_date_start + (24 * 60 * 60) - 1;
                if( $date >= $_date_start && $date <= $_date_end ) {
                    // event is within the time-frame
                    return true;
                }
            }
        }
        return false;
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

        $dbi = $this->_registry->get( 'Ai1ec_Dbi' );

        $table_name = $dbi->get_table_name( 'ai1ec_events' );
        $query = 'SELECT post_id FROM ' . $table_name .
            ' WHERE ical_feed_url = %s ' .
            ' AND ical_uid        = %s ' .
            ' AND start           = %d ' .
            ( $has_recurrence ? 'AND NOT ' : 'AND ' ) .
            ' ( recurrence_rules IS NULL OR recurrence_rules = \'\' )';
        $args = array( $feed, $uid, $start );
        if ( NULL !== $exclude_post_id ) {
            $query .= 'AND post_id <> %d';
            $args[] = $exclude_post_id;
        }

        return $dbi->get_var(
            $dbi->prepare( $query, $args )
        );
    }

    /**
     * insert_event_in_cache_table function
     *
     * Inserts a new record in the cache table
     *
     * @param array $event Event array
     **/
    public function insert_event_in_cache_table( $event ) {
        $dbi = $this->_registry->get( 'Ai1ec_Dbi' );

        // Return the start/end times to GMT zone
        $event['start'] = $this->local_to_gmt( $event['start'] ) + date( 'Z', $event['start'] );
        $event['end']   = $this->local_to_gmt( $event['end'] )   + date( 'Z', $event['end'] );

        $dbi->query(
            $dbi->prepare(
                'INSERT INTO ' . $dbi->get_table_name( 'ai1ec_event_instances ') .
                '       ( post_id,  start,  end ) ' .
                'VALUES ( %d,       %d,     %d  )',
                $event
            )
        );

        return $this->_registry->get( 'Ai1ec_Events_List_Helper' )->clean_post_cache(
            $event['post_id']
        );
    }

    /**
     * when using BYday you need an array of arrays.
     * This function create valid arrays that keep into account the presence
     * of a week number beofre the day
     *
     * @param string $val
     * @return array
     */
    private function create_byday_array( $val ) {
        $week = substr( $val, 0, 1 );
        if ( is_numeric( $week ) ) {
            return array( $week, 'DAY' => substr( $val, 1 ) );
        }
        return array( 'DAY' => $val );
    }
}