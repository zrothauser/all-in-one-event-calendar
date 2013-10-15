<?php
/**
 * Plugin Name: All-in-One Event Calendar by Timely
 * Plugin URI: http://time.ly/
 * Description: A calendar system with posterboard, stream, month, week, day, agenda views, upcoming events widget, color-coded categories, recurrence, and import/export of .ics feeds.
 * Author: Timely Network Inc
 * Author URI: http://time.ly/
 * Version: 2.0
 */
require_once 'app/exception/ai1ec.php';
set_error_handler( array( 'Ai1ec_Exception', 'handle_error' ) );
$prev_handler = set_exception_handler( array( 'Ai1ec_Exception', 'handle_exception' ) );
if( is_callable( $prev_handler ) ) {
	Ai1ec_Exception::set_prev_handler( $prev_handler );
}
// if the user clicked the link to reactivate the plugin
if( isset( $_GET[Ai1ec_Exception::DB_REACTIVATE_PLUGIN] ) ) {
	delete_option( Ai1ec_Exception::DB_DEACTIVATE_MESSAGE );
}
$soft_disable = get_option( Ai1ec_Exception::DB_DEACTIVATE_MESSAGE, false );
if ( false !== $soft_disable ) {
	// put here code to show just the notice in the admin page
}
trigger_error( 'sms', E_CORE_ERROR );