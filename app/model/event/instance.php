<?php

/**
 * Event instance management model.
 *
 *
 * @author       Time.ly Network, Inc.
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Model
 */
class Ai1ec_Event_Instance extends Ai1ec_Base {

	/**
	 * @var Ai1ec_Dbi Instance of database abstraction.
	 */
	protected $_dbi = null;

	/**
	 * Store locally instance of Ai1ec_Dbi.
	 *
	 * @param Ai1ec_Registry_Object $registry Injected object registry.
	 *
	 * @return void
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$this->_dbi = $this->_registry->get( 'dbi.dbi' );
	}

	/**
	 * Remove entries for given post. Optionally delete particular instance.
	 *
	 * @param int      $post_id     Event ID to remove instances for.
	 * @param int|null $instance_id Instance ID, or null for all.
	 *
	 * @return int|bool Number of entries removed, or false on failure.
	 */
	public function clean( $post_id, $instance_id = null ) {
		$where  = array( 'post_id' => $post_id );
		$format = array( '%d' );
		if ( null !== $instance_id ) {
			$where['instance_id'] = $instance_id;
			$format[]             = '%d';
		}
		return $this->_dbi->delete( 'ai1ec_event_instances', $where, $format );
	}

	/**
	 * Remove and then create instance entries for given event.
	 *
	 * @param Ai1ec_Event $event Instance of event to recreate entries for.
	 *
	 * @return bool Success.
	 */
	public function recreate( Ai1ec_Event $event ) {
		$this->clean( $event->get( 'post_id' ) );
		return ( false !== $this->create( $event ) );
	}

	/**
	 * Generate and store instance entries in database for given event.
	 *
	 * @param Ai1ec_Event $event Instance of event to create entries for.
	 *
	 * @return bool Success.
	 */
	public function create( Ai1ec_Event $event ) {
        $evs = array();
        $e	 = array(
            'post_id' => $event->get( 'post_id' ),
            'start'   => $event->get( 'start'   )->format_to_gmt(),
            'end'     => $event->get( 'end'     )->format_to_gmt(),
        );
        $duration = $event->get( 'end' )->diff_sec( $event->get( 'start' ) );

        // Timestamp of today date + 3 years (94608000 seconds)
        $tif = $this->_registry->get( 'date.system' )
			->current_time( true ) + 94608000;
        // Always cache initial instance
        $evs[] = $e;

        $_start = $event->get( 'start' )->format_to_gmt();
        $_end   = $event->get( 'end'   )->format_to_gmt();

		$recurrence_parser = $this->_registry->get( 'recurrence.rule' );

        if ( $event->get( 'recurrence_rules' ) ) {
            $start            = $e['start'];
            $wdate = $startdate = iCalUtilityFunctions::_timestamp2date( $_start, 6 );
            $enddate          = iCalUtilityFunctions::_timestamp2date( $tif, 6 );
            $exclude_dates    = array();
            $recurrence_dates = array();
            if ( $event->exception_rules ) {
                // creat an array for the rules
                $exception_rules = $recurrence_parser
					->build_recurrence_rules_array(
						$event->get( 'exception_rules' )
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
            $recurrence_rules = $recurrence_parser
				->build_recurrence_rules_array(
					$event->get( 'recurrence_rules' )
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
                if ( $exception_dates = $event->get( 'exception_dates' ) ) {
                    if (
						$this->date_match_exdates( $date, $exception_dates )
					) {
                        $excluded = true;
					}
                }

                // Add event only if it is not excluded
                if ( false === $excluded ) {
                    $evs[] = $e;
                }
            }
        }

        // Make entries unique (sometimes recurrence generator creates duplicates?)
        $evs_unique = array();
        foreach ( $evs as $ev ) {
            $evs_unique[md5( serialize( $ev ) )] = $ev;
        }

		$search_helper = $this->_registry->get( 'model.search' );
        foreach ( $evs_unique as $e ) {
            // Find out if this event instance is already accounted for by an
            // overriding 'RECURRENCE-ID' of the same iCalendar feed (by comparing the
            // UID, start date, recurrence). If so, then do not create duplicate
            // instance of event.
            $start             = $e['start'];
			$matching_event_id = null;
			if ( $event->get( 'ical_uid' ) ) {
				$matching_event_id = $search_helper->get_matching_event_id(
					$event->get( 'ical_uid' ),
					$event->get( 'ical_feed_url' ),
					$event->get( 'start' ),
					false,
					$event->get( 'post_id' )
				);
			}

            // If no other instance was found
            if ( null === $matching_event_id ) {
				$this->_dbi->insert(
					'ai1ec_event_instances',
					$e,
					array( '%d', '%d', '%d' )
				);
            }
        }

        return true;
	}

	/**
	 * Check if given date match dates in EXDATES rule.
	 *
	 * @param string $date     Date to check.
	 * @param string $ics_rule ICS EXDATES rule.
	 *
	 * @return bool True if given date is in rule.
	 */
    public function date_match_exdates( $date, $ics_rule ) {
        foreach ( explode( ',', $ics_rule ) as $_date ) {
            $_date_start = $this->_registry->get( 'date.time', $_date )
				->format_to_gmt();
            if ( false !== $_date_start ) {
                // add 23h 59m 59s so the whole day is excluded
                $_date_end = $_date_start + (24 * 60 * 60) - 1;
                if ( $date >= $_date_start && $date <= $_date_end ) {
                    return true;
                }
            }
        }
        return false;
    }

}