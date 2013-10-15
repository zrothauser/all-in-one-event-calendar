<?php

/**
 * @author Timely Network Inc
 *
 * This class is the base class for all ai1ec exceptions
 */

require_once 'error_exception.php';

abstract class ai1ec_exception extends Exception {
	const DB_DEACTIVATE_PLUGIN  = 'ai1ec_deactivate_plugin';
	const DB_DEACTIVATE_MESSAGE = 'ai1ec_deactivate_message';
	const DB_REACTIVATE_PLUGIN  = 'ai1ec_reactivate_plugin';

	protected static $prev_handler;
	
	/**
	 * returns a standard message to be printed to the view.
	 * Specific Exceptions should override this.
	 * 
	 */
	public function get_html_message() {
		// standard html help message here;
	}

	/**
	 * @param callable $prev_handler
	 */
	public static function set_prev_handler( $prev_handler ) {
		ai1ec_exception::$prev_handler = $prev_handler;
	}

	/**
	 * @param Exception $exception
	 */
	public static function handle_exception( Exception $exception ) {
		// if it's one of our exception, deactivate and redirect
		if( is_subclass_of( $exception, 'ai1ec_exception' ) ) {
			self::soft_deactivate_plugin( $exception->get_html_message() );
		}
		// if it's a PHP error in our plugin files, deactivate and redirect
		else if ( 'ai1ec_error_exception' === get_class( $exception ) ) {
			self::soft_deactivate_plugin( $exception->getMessage() );
		}
		// if another handler was set, let it handle the exception
		else if ( isset( self::$prev_handler ) ) {
			self::$prev_handler( $exception );
		}
	}

	/**
	 * Throws an ai1ec_error_exception if the error comes from our plugin
	 * 
	 * @param int $errno
	 * @param str $errstr
	 * @param str $errfile
	 * @param str $errline
	 * @param array $errcontext
	 * @throws ai1ec_error_exception
	 * @return boolean/void
	 */
	public static function handle_error( 
		$errno,
		$errstr,
		$errfile,
		$errline,
		array $errcontext
	) {
		// if the error is not in our plugin, let PHP handle things.
		if( false === strpos( $errfile, 'all-in-one-event-calendar' ) ) {
			return false;
		}
		throw new ai1ec_error_exception( $errstr, $errno, 0, $errfile, $errline );
	}

	/**
	 * Perform what's needed to deactivate the plugin softly
	 * 
	 * @param string $message
	 */
	protected static function soft_deactivate_plugin( $message ) {
		add_option( self::DB_DEACTIVATE_PLUGIN, true );
		add_option( self::DB_DEACTIVATE_MESSAGE, $message );
	}
	
	/**
	 * Redirect the user either to the front page or the dasbord page
	 */
	protected static function redirect() {
		if ( is_admin() ) {
			header( 'Location:' . get_admin_url(), 302 );
		} else {
			header( 'Location:' . get_site_url(), 302 );
		}
	}
}