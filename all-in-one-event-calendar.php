<?php
/**
 * Plugin Name: All-in-One Event Calendar by Timely
 * Plugin URI: http://time.ly/
 * Description: A calendar system with posterboard, stream, month, week, day, agenda views, upcoming events widget, color-coded categories, recurrence, and import/export of .ics feeds.
 * Author: Timely Network Inc
 * Author URI: http://time.ly/
 * Version: 2.0
 */

@set_time_limit( 0 );
@ini_set( 'memory_limit',           '256M' );
@ini_set( 'max_input_time',         '-1' );
require_once 'app/exception/ai1ec.php';
set_error_handler( array( 'ai1ec_exception', 'handle_error' ) );
$prev_handler = set_exception_handler( array( 'ai1ec_exception', 'handle_exception' ) );
if( is_callable( $prev_handler ) ) {
	ai1ec_exception::set_prev_handler( $prev_handler );
}
// if the user clicked the link to reactivate the plugin
if( isset( $_GET[ai1ec_exception::DB_REACTIVATE_PLUGIN] ) ) {
	delete_option( ai1ec_exception::DB_DEACTIVATE_PLUGIN );
}
$soft_disable = get_option( ai1ec_exception::DB_DEACTIVATE_PLUGIN );
if ( true === $soft_disable ) {
	// put here code to show just the notice in the admin page
}
trigger_error( 'sms', E_CORE_ERROR );