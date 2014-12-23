<?php

/**
 * Define global functions
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib
 */

/**
 * Always return false for action/filter hooks
 *
 * @return boolean
 */
function ai1ec_return_false() {
	return false;
}

/**
 * Executed after initialization of Front Controller.
 *
 * @return void
 */
function ai1ec_start() {
	ob_start();
}

/**
 * Executed before script shutdown, when WP core objects are present.
 *
 * @return void
 */
function ai1ec_stop() {
	if ( ob_get_level() ) {
		echo ob_get_clean();
	}
}

/**
 * Create `<pre>` wrapped variable dump.
 *
 * @param mixed $var Arbitrary value to dump.
 *
 * @return void
 */
function ai1ec_dump( $var ) {
	if ( ! defined( 'AI1EC_DEBUG' ) || ! AI1EC_DEBUG ) {
		return null;
	}
	echo '<pre>';
	var_dump( $var );
	echo '</pre>';
	exit( 0 );
}

/**
 * Indicate deprecated function.
 *
 * @param string $function Name of called function.
 *
 * @return void
 */
function ai1ec_deprecated( $function ) {
	trigger_error(
		'Function \'' . $function . '\' is deprecated.',
		E_USER_WARNING
	);
}

/* (non-PHPdoc)
 * @see admin_url()
 */
function ai1ec_admin_url( $path = '', $scheme = 'admin' ) {
	return Ai1ec_Http_Response_Helper::remove_protocols(
		admin_url( $path, $scheme )
	);
}

/* (non-PHPdoc)
 * @see get_admin_url()
 */
function ai1ec_get_admin_url( $blog_id = null, $path = '', $scheme = 'admin' ) {
	return Ai1ec_Http_Response_Helper::remove_protocols(
		get_admin_url( $blog_id, $path, $scheme )
	);
}

/* (non-PHPdoc)
 * @see get_site_url()
 */
function ai1ec_get_site_url( $blog_id = null, $path = '', $scheme = null ) {
	return Ai1ec_Http_Response_Helper::remove_protocols(
		get_site_url( $blog_id, $path, $scheme )
	);
}

/* (non-PHPdoc)
 * @see site_url()
 */
function ai1ec_site_url( $path = '', $scheme = null ) {
	return Ai1ec_Http_Response_Helper::remove_protocols(
		site_url( $path, $scheme )
	);
}

/* (non-PHPdoc)
 * @see network_admin_url()
 */
function ai1ec_network_admin_url( $path = '', $scheme = 'admin' ) {
	return Ai1ec_Http_Response_Helper::remove_protocols(
		network_admin_url( $path, $scheme )
	);
}