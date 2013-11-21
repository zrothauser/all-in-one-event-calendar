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
		$this->set_time( $time, $timezone );
	}

	/**
	 * Return formatted date in desired timezone.
	 *
	 * @param string $format   Desired format as accepted by {@see date}.
	 * @param string $timezone Valid timezone identifier.
	 *
	 * @return string Formatted date time.
	 *
	 * @throws Ai1ec_Date_Timezone_Exception If timezone is not recognized.
	 */
	public function format( $format = 'U', $timezone = null ) {
		if ( null === $timezone ) {
			// by defoult we format to local a UTC timezone.
			// might be a good idea to add format_to_local or format_to_gmt
			$timezone = $this->_registry->get( 'model.option' )
				->get( 'timezone_string' );
		}
		$this->change_timezone( $timezone );
		return $this->_date_time->format( $format );
	}

	/**
	 * Commodity method to format to UTC
	 * 
	 * @return string
	 */
	public function format_to_gmt() {
		return $this->format( 'U', 'UTC' );
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
	public function set_time( $time = 'now', $timezone = 'UTC' ) {
		$date_time_tz = null;
		if ( $time > 0 && ( $time >> 10 ) > 2 ) {
			$time = '@' . $time; // treat as UNIX timestamp
		} else {
			$date_time_tz = $this->_registry->get( 'date.timezone' )
				->get( $timezone );
		}
		$this->_date_time = new DateTime( $time, $date_time_tz );
		return $this;
	}

}