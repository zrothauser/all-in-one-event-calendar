<?php
/**
 * Plugin Name: All-in-One Event Calendar by Time.ly
 * Plugin URI: http://time.ly/
 * Description: A calendar system with posterboard, stream, month, week, day, agenda views, upcoming events widget, color-coded categories, recurrence, and import/export of .ics feeds.
 * Author: Time.ly Network Inc.
 * Author URI: http://time.ly/
 * Version: 2.0
 */

require_once 'lib/exception/handler.php';
require_once 'lib/http/response.php';
$ai1ec_exception_handler = new Ai1ec_Exception_Handler(
	'Ai1ec_Exception',
	'Ai1ec_Error_Exception'
);

// if the user clicked the link to reactivate the plugin
if ( isset( $_GET[Ai1ec_Exception_Handler::DB_REACTIVATE_PLUGIN] ) ) {
	$ai1ec_exception_handler->reactivate_plugin();
}
$soft_disable_message = $ai1ec_exception_handler->get_disabled_message();
if ( false !== $soft_disable_message ) {
	return $ai1ec_exception_handler->show_notices( $soft_disable_message );
}
$prev_er_handler = set_error_handler( 
	array( $ai1ec_exception_handler, 'handle_error' )
);
$prev_ex_handler = set_exception_handler( 
	array( $ai1ec_exception_handler, 'handle_exception' )
);
$ai1ec_exception_handler->set_prev_er_handler( $prev_er_handler );
$ai1ec_exception_handler->set_prev_ex_handler( $prev_ex_handler );

// Regular startup sequence starts here

$ai1ec_dir = dirname( __FILE__ );

require_once $ai1ec_dir . DIRECTORY_SEPARATOR . 'lib' .DIRECTORY_SEPARATOR .
		'loader' . DIRECTORY_SEPARATOR . 'loader.php' ;

@ini_set( 'unserialize_callback_func', 'spl_autoload_call' );
spl_autoload_register( 'Ai1ec_Loader::autoload' );
require_once 'app/controller/front.php';
$ai1ec_config_path = $ai1ec_dir . DIRECTORY_SEPARATOR . 'app' .
	DIRECTORY_SEPARATOR . 'config';
$ai1ec_front_controller = new Ai1ec_Front_Controller( $ai1ec_config_path );
$ai1ec_front_controller->run();

