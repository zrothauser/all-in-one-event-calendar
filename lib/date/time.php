<?php

/**
 * Time entity.
 *
 * @instantiator new
 * @author       Time.ly Network, Inc.
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Date
 */
class Ai1ec_Date_Time {

	/**
	 * @var Ai1ec_Registry_Object Instance of objects registry.
	 */
	protected $_registry  = null;

	/**
	 * @var DateTime Instance of date time object used to perform manipulations.
	 */
	protected $_date_time = null;

	/**
	 * Initialize local date entity.
	 *
	 * @param Ai1ec_Registry_Object $registry Objects registry instance.
	 * @param string                $time     For details {@see self::format}.
	 * @param string                $timezone For details {@see self::format}.
	 *
	 * @return void
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry,
		$time     = 'now',
		$timezone = 'UTC'
	) {
		$this->_registry = $registry;
		$this->set_date_time( $time, $timezone );
	}

	/**
	 * Return formatted date in desired timezone.
	 *
	 * @param string $format   Desired format as accepted by {@see date}.
	 * @param string $timezone Valid timezone identifier. Defaults to current.
	 *
	 * @return string Formatted date time.
	 *
	 * @throws Ai1ec_Date_Timezone_Exception If timezone is not recognized.
	 */
	public function format( $format = 'U', $timezone = null ) {
		if ( null === $timezone ) {
			$timezone = $this->_registry->get( 'date.timezone' )
				->get_default_timezone();
		}
		$this->change_timezone( $timezone );
		return $this->_date_time->format( $format );
	}

	/**
	 * Format date time to i18n representation.
	 *
	 * @param string $format   Target I18n format.
	 * @param string $timezone Valid timezone identifier. Defaults to current.
	 *
	 * @return string Formatted time.
	 */
	public function format_i18n( $format, $timezone = null ) {
		static $i18n = null;
		if ( null === $i18n ) {
			$i18n = $this->_registry->get( 'date.time-i18n' );
		}
		$timestamp = $this->format( 'U', $timezone );
		return $i18n->format( $format, $timestamp, true );
	}

	/**
	 * Offset from GMT in minutes.
	 *
	 * @return int Signed integer - offset.
	 */
	public function get_gmt_offset() {
		return $this->_date_time->getOffset() / 60;
	}

	/**
	 * Commodity method to format to UTC.
	 *
	 * @param string $format Target format, defaults to UNIX timestamp.
	 *
	 * @return string Formatted datetime string.
	 */
	public function format_to_gmt( $format = 'U' ) {
		return $this->format( $format, 'UTC' );
	}

	/**
	 * Change timezone of stored entity.
	 *
	 * @param string $timezone Valid timezone identifier.
	 *
	 * @return Ai1ec_Date Instance of self for chaining.
	 *
	 * @throws Ai1ec_Date_Timezone_Exception If timezone is not recognized.
	 */
	public function change_timezone( $timezone = 'UTC' ) {
		$date_time_tz = $this->_registry->get( 'date.timezone' )
			->get( $timezone );
		$this->_date_time->setTimezone( $date_time_tz );
		return $this;
	}

	/**
	 * Get difference in seconds between to dates.
	 *
	 * In PHP versions post 5.3.0 the {@see DateTimeImmutable::diff()} is
	 * used. In earlier versions the difference between two timestamps is
	 * being checked.
	 *
	 * @param Ai1ec_Date_Time $comparable Other date time entity.
	 *
	 * @return int Number of seconds between two dates.
	 */
	public function diff_sec( Ai1ec_Date_Time $comparable ) {
		if ( version_compare( PHP_VERSION, '5.3.0' ) < 0 ) {
			$difference = $this->_date_time->format( 'U' ) -
				$comparable->_date_time->format( 'U' );
			if ( $difference < 0 ) {
				$difference *= -1;
			}
			return $difference;
		}
		$difference = $this->_date_time->diff( $comparable->_date_time, true );
		return (
			$difference->days * 86400 +
			$difference->h    * 3600  +
			$difference->i    * 60    +
			$difference->s
		);
	}

	/**
	 * Adjust only time fragment of entity.
	 *
	 * @param int $hour   Hour of the time.
	 * @param int $minute Minute of the time. 
	 * @param int $second Second of the time.
	 *
	 * @return Ai1ec_Date_Time Instance of self for chaining.
	 */
	public function set_time( $hour, $minute = 0, $second = 0 ) {
		$this->_date_time->setTime( $hour, $minute, $second );
		return $this;
	}

	/**
	 * Adjust day part of date time entity.
	 *
	 * @param int $quantifier Day adjustment quantifier.
	 *
	 * @return Ai1ec_Date_Time Instance of self for chaining.
	 */
	public function adjust_day( $quantifier ) {
		$quantifier = (int)$quantifier;
		if ( $quantifier > 0 && '+' !== $quantifier{0} ) {
			$quantifier = '+' . $quantifier;
		}
		$modifier = $quantifier . ' day';
		$this->_date_time->modify( $modifier );
		return $this;
	}

	/**
	 * Change/initiate stored date time entity.
	 *
	 * NOTICE: time specifiers falling in range 0..2048 will be treated
	 * as a UNIX timestamp, to full format specification, thus ignoring
	 * any value passed for timezone.
	 *
	 * @param string $time     Valid (PHP-parseable) date/time identifier.
	 * @param string $timezone Valid timezone identifier.
	 *
	 * @return Ai1ec_Date Instance of self for chaining.
	 */
	public function set_date_time( $time = 'now', $timezone = 'UTC' ) {
		if ( $time instanceof self ) {
			$this->_date_time = clone $time->_date_time;
			return $this;
		}
		$this->assert_utc_timezone();
		$date_time_tz = null;
		if ( $time > 0 && ( $time >> 10 ) > 2 ) {
			$time = '@' . $time; // treat as UNIX timestamp
		} else {
			$date_time_tz = $this->_registry->get( 'date.timezone' )
				->get( $timezone );
		}
		// PHP <= 5.3.5 compatible
		$this->_date_time = ( null === $date_time_tz )
			? new DateTime( $time )
			: new DateTime( $time, $date_time_tz );
		return $this;
	}

	/**
	 * Assert that current timezone is UTC.
	 *
	 * @return bool Success.
	 */
	public function assert_utc_timezone() {
		$default = (string)date_default_timezone_get();
		$success = true;
		if ( 'UTC' !== $default ) {
			// issue admin notice
			$success = date_default_timezone_set( 'UTC' );
		}
		return $success;
	}

	/**
	 * Magic method for compatibility.
	 *
	 * @return string ISO-8601 formatted date-time.
	 */
	public function __toString() {
		return $this->format( 'c' );
	}

}