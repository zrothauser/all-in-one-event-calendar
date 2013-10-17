<?php
/**
 * Handle Http response functions.
 *
 * @author     Time.ly Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http
 **/
class Ai1ec_Http_Response {

	/**
	 * Perform redirect to desired location and stop script execution after that
	 *
	 * When debug mode is activated redirect doesn't happen but instead link
	 * is outputted to screen, to allow developer to tamper with the flow, debug
	 * it and make changes as desired.
	 *
	 * @param string $location Location to redirect user to
	 * @param int    $code     HTTP response code to use in redirects
	 *
	 * @return int|NULL Method does call {@see self::stop()} to halt further
	 *                  script execution unless mocked
	 */
	public static function redirect( $location, $code = 302 ) {
		if ( Ai1ec_Settings::read( 'debug' ) > 2 ) {
			echo '<br/><br /><p>STOPPED EXECUTION WITH REDIRECT: <a href="' . 
					$location . '">' . $location . '</a></p>';
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