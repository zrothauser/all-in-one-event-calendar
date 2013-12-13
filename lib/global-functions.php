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
function ai1ec_dump( $var ) {
	echo '<pre>';
	var_dump( $var );
	echo '</pre>';
	exit;
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