<?php

/**
 * Memory related methods.
 *
 * @author     Time.ly Network Inc.
 * @since      2.1
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib
 */
class Ai1ec_Compatibility_Memory extends Ai1ec_Base {

	/**
	 * Checks if there is enough available free memory.
	 *
	 * @param string $required_limit String memory value i.e '24M'
	 *
	 * @return bool True or false.
	 */
	public function check_available_memory( $required_limit = 0 ) {
		if ( 0 === $required_limit ) {
			return true;
		}
		$required = $this->_string_to_bytes( $required_limit );
		$limit    = $this->_string_to_bytes( ini_get( 'memory_limit' ) );
		$used     = $this->get_usage();
		return ( $limit - $used ) >= $required;
	}

	/**
	 * Returns current memory usage if available - otherwise 0.
	 *
	 * @return int Memory usage.
	 */
	public function get_usage() {
		if ( is_callable( 'memory_get_usage' ) ) {
			return memory_get_usage( true );
		}
		return 0;
	}

	/**
	 * Converts string value to int.
	 *
	 * @param string $v String value.
	 *
	 * @return int Number;
	 */
	protected function _string_to_bytes( $v ) {
		$letter     = substr( $v, -1 );
		$value      = (int)substr( $v, 0, -1 );
		$multiplier = 1;
		switch ( strtoupper( $letter ) ) {
			case 'P': $multiplier = 1024 * 1024 * 1024 * 1024 * 1024; break;
			case 'T': $multiplier = 1024 * 1024 * 1024 * 1024; break;
			case 'G': $multiplier = 1024 * 1024 * 1024; break;
			case 'M': $multiplier = 1024 * 1024; break;
			case 'K': $multiplier = 1024; break;
			default: break;
		}
		return $value * $multiplier;
	}
}
