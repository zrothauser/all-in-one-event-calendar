<?php

class Ai1ec_Date_System extends Ai1ec_Base {

	protected $_current_time = array();

	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$gmt_time = ( version_compare( PHP_VERSION, '5.1.0' ) >= 0 )
			? time()
			: gmmktime();
		$this->_current_time     = array(
			(int)$_SERVER['REQUEST_TIME'],
			$gmt_time,
		);
	}

	/**
	 * Get current time UNIX timestamp.
	 *
	 * Uses in-memory value, instead of re-calling `time()` / `gmmktime()`.
	 *
	 * @param bool $is_gmt Set to true to get GMT timestamp.
	 *
	 * @return int Current time UNIX timestamp
	 */
	public function current_time( $is_gmt = false ) {
		return $this->_current_time[(int)( (bool)$is_gmt )];
	}

	/**
	 * Returns human-readable version of the GMT offset.
	 *
	 * @return string GMT offset expression
	 */
	public function get_gmt_offset_expr() {
		$current = $this->_registry->get(
			'date.time',
			'now',
			$this->_registry->get( 'date.timezone' )->get_default_timezone()
		);
		$timezone = $current->get_gmt_offset();
		$offset_h = (int)( $timezone / 60 );
		$offset_m = absint( $timezone - $offset_h * 60 );
		$timezone = sprintf(
			Ai1ec_I18n::__( 'GMT%+d:%02d' ),
			$offset_h,
			$offset_m
		);

		return $timezone;
	}

	/**
	 * gmgetdate method
	 *
	 * Get date/time information in GMT
	 *
	 * @param int $timestamp Timestamp at which information shall be evaluated
	 *
	 * @return array Associative array of information related to the timestamp
	 */
	public function gmgetdate( $timestamp = NULL ) {
		if ( NULL === $timestamp ) {
			$timestamp = (int)$_SERVER['REQUEST_TIME'];
		}
		if ( NULL === ( $date = $this->_gmtdates->get( $timestamp ) ) ) {
			$particles = explode(
				',',
				gmdate( 's,i,G,j,w,n,Y,z,l,F,U', $timestamp )
			);
			$date      = array_combine(
				array(
					'seconds',
					'minutes',
					'hours',
					'mday',
					'wday',
					'mon',
					'year',
					'yday',
					'weekday',
					'month',
					0
				),
				$particles
			);
			$this->_gmtdates->set( $timestamp, $date );
		}
		return $date;
	}
}