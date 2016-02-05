<?php

define( 'AI1EC_API', true );
define( 'AI1EC_API_TICKETING', true );
define( 'AI1EC_DEBUG', true );
define( 'AI1EC_CACHE', false );
// define( 'AI1EC_API_URL', 'http://dev.time.ly:882/api/');
define( 'AI1EC_API_URL', 'http://localhost/ticketing/public/api/');
define('AI1EC_TICKETS_CHECKOUT_URL', 'http://dev.time.ly:882/events/{event_id}/checkout');

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {	

	$ai1ec_base_dir = dirname( dirname( __FILE__ ) );
	$ai1ec_base_url = plugins_url( '', __FILE__ );

	$ai1ec_config_path = $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'app' .
			DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR;

	// Include configuration files and initiate global constants as they are used
	// By the error/exception handler too.
	foreach ( array( 'constants-local.php', 'constants.php' ) as $file ) {
		if ( is_file( $ai1ec_config_path . $file ) ) {
			require_once $ai1ec_config_path . $file;
		}
	}

	if ( ! function_exists( 'ai1ec_initiate_constants' ) ) {
		throw new Ai1ec_Exception(
				'No constant file was found.'
		);
	}
	ai1ec_initiate_constants( $ai1ec_base_dir, $ai1ec_base_url );

	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'exception' . DIRECTORY_SEPARATOR . 'ai1ec.php';
	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'exception' . DIRECTORY_SEPARATOR . 'error.php';
	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'exception' . DIRECTORY_SEPARATOR . 'handler.php';
	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'http' . DIRECTORY_SEPARATOR . 'response' .
		DIRECTORY_SEPARATOR . 'helper.php';
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

	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'bootstrap' . DIRECTORY_SEPARATOR . 'loader.php';

	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'lib' .
		DIRECTORY_SEPARATOR . 'global-functions.php';

	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'app' .
		DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR . 'extension.php';

	require $ai1ec_base_dir . DIRECTORY_SEPARATOR . 'app' .
		DIRECTORY_SEPARATOR . 'controller' . DIRECTORY_SEPARATOR . 'extension-license.php';

	$ai1ec_loader = new Ai1ec_Loader( $ai1ec_base_dir );
	@ini_set( 'unserialize_callback_func', 'spl_autoload_call' );
	spl_autoload_register( array( $ai1ec_loader, 'load' ) );

	$ai1ec_front_controller = new Ai1ec_Front_Controller();
	$ai1ec_front_controller->initialize( $ai1ec_loader );			

	$ai1ec_registry = $ai1ec_front_controller->return_registry(0);
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';

//Required for test
require dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'test-case.php';

