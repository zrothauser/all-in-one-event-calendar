<?php
/**
 * Handle Http response functions.
 *
 * @author     Timely Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http
 **/
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

	/**
	 * Returns the delimiter character to use if a new query string parameter is
	 * going to be appended to the URL.
	 *
	 * @param string $url URL to parse
	 *
	 * @return string
	 */
	public static function get_param_delimiter_char( $url ) {
		return strpos( $url, '?' ) === false ? '?' : '&';
	}
}