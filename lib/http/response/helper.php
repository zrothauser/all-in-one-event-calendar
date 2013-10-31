<?php

/**
 * Class to group HTTP response related functionality
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http.Response
 */
class Ai1ec_Http_Response_Helper {

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
		if ( defined( 'AI1EC_DEBUG' ) && AI1EC_DEBUG ) {
			echo '<br/><br /><p>STOPPED EXECUTION WITH REDIRECT: <a href="',
			     $location, '">', $location, '</a></p>';
		} else {
			header( 'Location: ' . $location, true, $code );
		}
		return self::stop();
	}

	/**
	 * Mockable method to halt script execution
	 *
	 * @param int $code Code to be used in `exit` statement
	 *
	 * @return void Method does not return
	 */
	public static function stop( $code = 0 ) {
		exit( $code );
	}

}