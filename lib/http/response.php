<?php
/**
 * @author Timely Network Inc
 *
 *
 */

class Ai1ec_Http_Response {

	/**
	 * @param string $location
	 * @param number $code
	 */
	public static function redirect( $location, $code = 302 ) {
		if ( Ai1ec_Settings::read( 'debug' ) > 2 ) {
			echo '<br/><br /><p>STOPPED EXECUTION WITH REDIRECT: <a href="', $location, '">', $location, '</a></p>';
		} else {
			header( 'Location: ' . $location, true, $code );
		}
		return self::stop();
	}

	/**
	 * @param number $code
	 */
	public static function stop( $code = 0 ) {
		exit( $code );
	}
}