<?php
/**
 * Plugin Name: All-in-One Event Calendar by Time.ly
 * Plugin URI: http://time.ly/
 * Description: A calendar system with month, week, day, agenda views, upcoming events widget, color-coded categories, recurrence, and import/export of .ics feeds.
 * Author: Time.ly Network Inc.
 * Author URI: http://time.ly/
 * Version: 2.1.8.7
 * Text Domain: all-in-one-event-calendar
 * Domain Path: /language
 */
$ai1ec_base_dir = dirname( __FILE__ );
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

add_action( 'admin_footer', 'ai1ec_jira_issue_collector' );
function ai1ec_jira_issue_collector() {
	$core = 'all-in-one-event-calendar/all-in-one-event-calendar.php';
	$dt   = 'all-in-one-event-calendar-developer-tools/all-in-one-event-calendar-developer-tools.php';
	if ( ! is_plugin_active( $core ) || is_plugin_active( $dt ) ) {
		return;
	}
	echo '<script type="text/javascript">';
	$core_version = ai1ec_jira_issue_collector_gather_core_version();
	echo 'window.ATL_JQ_PAGE_PROPS = {',
		'    fieldValues: {';
	if ( ! empty( $core_version ) ) {
		echo '        versions : [ \'',
		$core_version,
		'\' ],';
	}
	echo '        environment: \'',
		ai1ec_jira_issue_collector_gather_environment_data(),
		'\'',
		'    }',
		'};';
	echo 'jQuery.ajax({',
		'    url: "https://jira.time.ly:8443/s/d41d8cd98f00b204e9800998ecf8427e/en_US-twqz1u-1988229788/6252/31/1.4.7/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?collectorId=7910ef3f",',
		'    type: "get",',
		'    cache: true,',
		'    dataType: "script"',
		'});';
	echo '</script>';
}

function ai1ec_jira_issue_collector_gather_core_version() {
	if ( ! defined( 'AI1EC_VERSION' ) ) {
		return null;
	}
	$cores = array(
		'2.0' => '11308',
		'2.1' => '11400',
	);
	$core = implode(
		'.',
		array_slice( explode( '.', AI1EC_VERSION ), 0, 2 )
	);

	return isset( $cores[$core] ) ? $cores[$core] : null;
}

function ai1ec_jira_issue_collector_gather_environment_data() {
	global $wp_version;
	$ai1ec_version = ( defined( 'AI1EC_VERSION' ) )
		? AI1EC_VERSION
		: 'not defined';
	$data          = 'WordPress version: ' . $wp_version . '\n';
	$data         .= 'AI1EC version        : ' . $ai1ec_version;
	$data         .= '\n============================\n';
	$data         .= 'Active plugins:\n';
	$plugins       = ai1ec_jira_issue_collector_get_plugins();
	foreach ( $plugins['active'] as $info ) {
		$data .= $info['Name'] . ' - version: ' . $info['Version'] . '\n';
	}
	$data .= '============================\n';
	$data .= 'Inactive plugins:\n';
	foreach ( $plugins['inactive'] as $info ) {
		$data .= $info['Name'] . ' - version: ' . $info['Version'] . '\n';
	}
	$data  .= '============================\n';
	$data  .= 'Active theme: ' . ai1ec_jira_issue_collector_get_active_theme();
	$data  .= '\n============================\n';
	$data  .= 'Themes:\n';
	$themes = ai1ec_jira_issue_collector_get_inactive_themes();
	foreach ( $themes as $info ) {
		$data .= sprintf(
			'%s - version: %s\n',
			$info->get( 'Name' ),
			$info->get( 'Version' )
		);
	}
	$data  .= '============================\n';
	$data  .= 'AI1EC active theme: ' . ai1ec_jira_issue_collector_get_active_ai1ec_theme();
	$data  .= '\n============================\n';
	$data  .= 'AI1EC Themes:\n';
	$themes = ai1ec_jira_issue_collector_get_inactive_ai1ec_themes();
	foreach ( $themes as $info ) {
		$data .= sprintf(
			'%s - version: %s\n',
			$info->get( 'Name' ),
			$info->get( 'Version' )
		);
	}
	$data .= '============================\n';
	$data .= '============================\n';
	$data .= 'Environment\n';
	$data .= '============================\n';
	$data .= 'PHP version: ' . PHP_VERSION . '\n';
	$data .= 'memory_limit: ' . ini_get( 'memory_limit' );
	$data .= 'memory_get_usage: ' . memory_get_usage();
	$data .= 'OS : ' . php_uname();
	return $data;
}

function ai1ec_jira_issue_collector_get_plugins() {
	$plugins_list = get_plugins();
	$plugins      = array(
		'active'   => array(),
		'inactive' => array(),
	);
	foreach ( $plugins_list as $file => $info ) {
		$ident = 'active';
		if ( ! is_plugin_active( $file ) ) {
			$ident = 'inactive';
		}
		$plugins[$ident][$file] = $info;
	}

	return $plugins;
}

function ai1ec_jira_issue_collector_get_active_theme() {
	$theme = wp_get_theme();
	return sprintf(
		'%s - version: %s',
		$theme->get( 'Name' ),
		$theme->get( 'Version' )
	);
}

function ai1ec_jira_issue_collector_get_inactive_themes() {
	$theme  = wp_get_theme();
	$themes = wp_get_themes();
	unset( $themes[$theme->template] );
	return $themes;
}

function ai1ec_jira_issue_collector_get_active_ai1ec_theme() {
	$theme = ai1ec_jira_issue_collector_get_current_theme_from_option();
	if ( empty( $theme ) ) {
		return 'not defined';
	}
	$themes     = ai1ec_jira_issue_collector_get_all_ai1ec_themes();
	$theme_info = $themes[$theme['stylesheet']];
    if ( ! is_object( $theme_info ) || ! is_callable( array( $theme_info, 'get' ) ) ) {
        return 'Theme decoding error';
    }
	return sprintf(
		'%s - version %s',
		$theme_info->get( 'Name' ),
		$theme_info->get( 'Version' )
	);
}

function ai1ec_jira_issue_collector_get_inactive_ai1ec_themes() {
	$themes = ai1ec_jira_issue_collector_get_all_ai1ec_themes();
	$theme  = ai1ec_jira_issue_collector_get_current_theme_from_option();
	unset( $themes[$theme['stylesheet']] );
	return $themes;
}

function ai1ec_jira_issue_collector_get_current_theme_from_option() {
	global $ai1ec_registry;
	if ( null == $ai1ec_registry ) {
		return array();
	}
	return $ai1ec_registry->get( 'model.option' )
		->get( 'ai1ec_current_theme', array() );
}

function ai1ec_jira_issue_collector_get_all_ai1ec_themes() {
	global $ai1ec_registry;
	if ( null == $ai1ec_registry ) {
		return array();
	}
	return $ai1ec_registry->get( 'theme.search' )->get_themes();
}
